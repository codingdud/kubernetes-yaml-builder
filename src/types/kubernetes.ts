export interface KubernetesResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
  };
  [key: string]: any;
}

export interface Deployment extends KubernetesResource {
  kind: 'Deployment';
  spec: {
    replicas: number;
    selector: { matchLabels: Record<string, string> };
    template: {
      metadata: { labels: Record<string, string> };
      spec: { containers: Array<{ name: string; image: string; ports?: Array<{ containerPort: number }> }> };
    };
  };
}

export interface StatefulSet extends KubernetesResource {
  kind: 'StatefulSet';
  spec: {
    replicas: number;
    selector: { matchLabels: Record<string, string> };
    serviceName: string;
    template: {
      metadata: { labels: Record<string, string> };
      spec: { containers: Array<{ name: string; image: string; ports?: Array<{ containerPort: number }> }> };
    };
    volumeClaimTemplates?: Array<any>;
  };
}

export interface Service extends KubernetesResource {
  kind: 'Service';
  spec: {
    selector: Record<string, string>;
    ports: Array<{ port: number; targetPort?: number; protocol: string; nodePort?: number }>;
    type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  };
}

export interface DaemonSet extends KubernetesResource {
  kind: 'DaemonSet';
  spec: {
    selector: { matchLabels: Record<string, string> };
    template: {
      metadata: { labels: Record<string, string> };
      spec: { containers: Array<{ name: string; image: string; ports?: Array<{ containerPort: number }> }> };
    };
    updateStrategy?: { type: 'RollingUpdate' | 'OnDelete' };
  };
}

export interface ConfigMap extends KubernetesResource {
  kind: 'ConfigMap';
  data?: Record<string, string>;
}

export interface Job extends KubernetesResource {
  kind: 'Job';
  spec: {
    parallelism?: number;
    completions?: number;
    backoffLimit?: number;
    template: {
      spec: { containers: Array<{ name: string; image: string; command?: string[] }> };
    };
  };
}

export interface Secret extends KubernetesResource {
  kind: 'Secret';
  data?: Record<string, string>;
  type: 'Opaque' | 'kubernetes.io/tls' | 'kubernetes.io/dockerconfigjson';
}

export interface CronJob extends KubernetesResource {
  kind: 'CronJob';
  spec: {
    schedule: string;
    jobTemplate: {
      spec: {
        template: {
          spec: { containers: Array<{ name: string; image: string; command?: string[] }> };
        };
      };
    };
  };
}

export interface Ingress extends KubernetesResource {
  kind: 'Ingress';
  spec: {
    rules?: Array<{
      host?: string;
      http: {
        paths: Array<{
          path: string;
          pathType: 'Prefix' | 'Exact' | 'ImplementationSpecific';
          backend: { service: { name: string; port: { number: number } } };
        }>;
      };
    }>;
    tls?: Array<{ hosts: string[]; secretName: string }>;
  };
}