import type { Node } from '@xyflow/react';
import type { KubernetesResource } from './kubernetes';
import type { JSONSchema7 } from 'json-schema';
import type { UiSchema } from '@rjsf/utils';

export interface K8sNodeData extends Record<string, unknown> {
  resource: KubernetesResource;
  schema: JSONSchema7;
  uiSchema: UiSchema;
}

export interface K8sNode extends Node {
  data: K8sNodeData;
}