import * as yaml from 'js-yaml';
import validator from '@rjsf/validator-ajv8';
import type { Node } from '@xyflow/react';
import type { K8sNode } from '../types/reactFlow';
import resourceRegistry from '../config/resourceRegistry';

export interface ValidationIssue {
  type: 'error' | 'warning';
  rule: string;
  message: string;
  field?: string;
}

export interface NodeValidationResult {
  nodeId: string;
  nodeName: string;
  nodeKind: string;
  status: 'pass' | 'warn' | 'error';
  issues: ValidationIssue[];
}

export interface ValidationReport {
  timestamp: string;
  passed: number;
  warnings: number;
  errors: number;
  results: NodeValidationResult[];
  crossNodeIssues: ValidationIssue[];
}

function rollupStatus(issues: ValidationIssue[]): 'pass' | 'warn' | 'error' {
  if (issues.some(i => i.type === 'error')) return 'error';
  if (issues.some(i => i.type === 'warning')) return 'warn';
  return 'pass';
}

function validateYamlSyntax(resource: unknown): ValidationIssue[] {
  try {
    const yamlStr = yaml.dump(resource);
    yaml.load(yamlStr);
    return [];
  } catch (e: any) {
    return [{ type: 'error', rule: 'yaml-syntax', message: `YAML serialization error: ${e.message}` }];
  }
}

function validateSchema(resource: unknown, schema: Record<string, unknown>): ValidationIssue[] {
  try {
    const result = validator.validateFormData(resource as any, schema as any);
    if (!result.errors || result.errors.length === 0) return [];
    return result.errors.map((err: any) => ({
      type: 'error' as const,
      rule: 'schema',
      message: err.message || String(err),
      field: err.property,
    }));
  } catch {
    return [];
  }
}

function validateSemantics(resource: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const kind: string = resource?.kind || '';

  // All resources
  if (!resource?.metadata?.name || resource.metadata.name.trim() === '') {
    issues.push({ type: 'error', rule: 'required-name', message: 'metadata.name must not be empty', field: 'metadata.name' });
  }
  if (kind !== 'HelmChart' && kind !== 'HelmValues') {
    if (!resource?.apiVersion) {
      issues.push({ type: 'error', rule: 'required-apiversion', message: 'apiVersion is required', field: 'apiVersion' });
    }
    if (!resource?.kind) {
      issues.push({ type: 'error', rule: 'required-kind', message: 'kind is required', field: 'kind' });
    }
  }

  // Workloads
  if (['Deployment', 'StatefulSet', 'DaemonSet'].includes(kind)) {
    const containers: any[] = resource?.spec?.template?.spec?.containers || [];
    if (containers.length === 0) {
      issues.push({ type: 'error', rule: 'containers-required', message: 'spec.template.spec.containers must have at least one entry', field: 'spec.template.spec.containers' });
    } else {
      containers.forEach((c: any, i: number) => {
        if (!c?.name) {
          issues.push({ type: 'error', rule: 'container-name', message: `containers[${i}].name is required`, field: `containers[${i}].name` });
        }
        if (!c?.image) {
          issues.push({ type: 'error', rule: 'container-image', message: `containers[${i}].image is required`, field: `containers[${i}].image` });
        }
        if (!c?.resources?.limits) {
          issues.push({ type: 'warning', rule: 'resources-limits', message: `containers[${i}] has no resources.limits — pod may be evicted under pressure` });
        }
        if (!c?.readinessProbe) {
          issues.push({ type: 'warning', rule: 'readiness-probe', message: `containers[${i}] has no readinessProbe — traffic may be sent before app is ready` });
        }
      });
    }
  }

  // Job/CronJob containers
  if (kind === 'Job') {
    const containers: any[] = resource?.spec?.template?.spec?.containers || [];
    if (containers.length === 0) {
      issues.push({ type: 'error', rule: 'containers-required', message: 'spec.template.spec.containers must have at least one entry', field: 'spec.template.spec.containers' });
    } else {
      containers.forEach((c: any, i: number) => {
        if (!c?.name) issues.push({ type: 'error', rule: 'container-name', message: `containers[${i}].name is required` });
        if (!c?.image) issues.push({ type: 'error', rule: 'container-image', message: `containers[${i}].image is required` });
      });
    }
  }

  // Service
  if (kind === 'Service') {
    const ports: any[] = resource?.spec?.ports || [];
    if (ports.length === 0) {
      issues.push({ type: 'error', rule: 'service-ports', message: 'spec.ports must have at least one port', field: 'spec.ports' });
    }
    const selector = resource?.spec?.selector;
    if (!selector || Object.keys(selector).length === 0) {
      issues.push({ type: 'warning', rule: 'service-selector', message: 'spec.selector is empty — Service will not route to any pods' });
    }
  }

  // CronJob schedule
  if (kind === 'CronJob') {
    const schedule: string = resource?.spec?.schedule || '';
    if (!schedule || !/^(\S+ ){4}\S+$/.test(schedule.trim())) {
      issues.push({ type: 'error', rule: 'cronjob-schedule', message: 'spec.schedule must be a valid cron expression (5 fields)', field: 'spec.schedule' });
    }
  }

  // HelmChart
  if (kind === 'HelmChart') {
    if (!resource?.name || resource.name.trim() === '') {
      issues.push({ type: 'error', rule: 'helm-name', message: 'name is required', field: 'name' });
    }
    const version: string = resource?.version || '';
    if (!version || !/^\d+\.\d+\.\d+/.test(version.trim())) {
      issues.push({ type: 'error', rule: 'helm-version', message: 'version must be a valid semantic version (e.g. 0.1.0)', field: 'version' });
    }
    if (resource?.apiVersion && resource.apiVersion !== 'v2') {
      issues.push({ type: 'warning', rule: 'helm-apiversion', message: 'apiVersion should be "v2" for Helm 3 charts', field: 'apiVersion' });
    }
  }

  // HelmValues
  if (kind === 'HelmValues') {
    const content: string = resource?.content || '';
    if (content.trim()) {
      try {
        yaml.load(content);
      } catch (e: any) {
        issues.push({ type: 'error', rule: 'helmvalues-yaml', message: `values.yaml parse error: ${e.message}`, field: 'content' });
      }
    }
  }

  return issues;
}

function crossNodeChecks(nodes: K8sNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const workloadNodes = nodes.filter(n =>
    ['Deployment', 'StatefulSet', 'DaemonSet'].includes(String(n.data.resource?.kind))
  );
  const configMapNodes = nodes.filter(n => n.data.resource?.kind === 'ConfigMap');
  const serviceNodes = nodes.filter(n => n.data.resource?.kind === 'Service');

  // Service selector cross-check
  serviceNodes.forEach((svc) => {
    const selector = (svc.data.resource as any)?.spec?.selector;
    if (!selector || Object.keys(selector).length === 0) return;
    const svcName = (svc.data.resource as any)?.metadata?.name || svc.id;
    const matched = workloadNodes.some((wl) => {
      const labels = (wl.data.resource as any)?.spec?.template?.metadata?.labels || {};
      return Object.entries(selector).every(([k, v]) => labels[k] === v);
    });
    if (!matched) {
      const selectorStr = JSON.stringify(selector);
      issues.push({
        type: 'warning',
        rule: 'service-selector-match',
        message: `Service "${svcName}" selector ${selectorStr} does not match labels on any Deployment/StatefulSet/DaemonSet on canvas`,
      });
    }
  });

  // Deployment volume configMap cross-check
  workloadNodes.forEach((wl) => {
    const volumes: any[] = (wl.data.resource as any)?.spec?.template?.spec?.volumes || [];
    const wlName = (wl.data.resource as any)?.metadata?.name || wl.id;
    volumes.forEach((vol: any) => {
      const cmName = vol?.configMap?.name;
      if (!cmName) return;
      const exists = configMapNodes.some(
        (cm) => (cm.data.resource as any)?.metadata?.name === cmName
      );
      if (!exists) {
        issues.push({
          type: 'warning',
          rule: 'configmap-ref',
          message: `"${wlName}" references ConfigMap "${cmName}" which is not present on canvas`,
        });
      }
    });
  });

  return issues;
}

export function validateNodes(nodes: Node[]): ValidationReport {
  const k8sNodes = nodes as K8sNode[];
  const results: NodeValidationResult[] = k8sNodes.map((node) => {
    const resource = node.data.resource as any;
    const kind: string = resource?.kind || node.type || 'Unknown';
    const name: string = resource?.metadata?.name || resource?.name || node.id;
    const schema = resourceRegistry[kind as keyof typeof resourceRegistry]?.schema as Record<string, unknown> | undefined;

    const issues: ValidationIssue[] = [
      ...validateYamlSyntax(resource),
      ...(schema ? validateSchema(resource, schema) : []),
      ...validateSemantics(resource),
    ];

    return {
      nodeId: node.id,
      nodeName: name,
      nodeKind: kind,
      status: rollupStatus(issues),
      issues,
    };
  });

  const crossNodeIssues = crossNodeChecks(k8sNodes);

  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warn').length;
  const errors = results.filter(r => r.status === 'error').length;

  return {
    timestamp: new Date().toISOString(),
    passed,
    warnings,
    errors,
    results,
    crossNodeIssues,
  };
}
