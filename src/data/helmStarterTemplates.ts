export type K8sResourceKind =
  | 'Deployment'
  | 'StatefulSet'
  | 'Service'
  | 'DaemonSet'
  | 'ConfigMap'
  | 'Job'
  | 'Secret'
  | 'CronJob'
  | 'Ingress'
  | 'HelmChart'
  | 'HelmValues';

export interface HelmTemplateNode {
  kind: K8sResourceKind;
  resource: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface HelmStarterTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  resourceLabels: string[];
  resources: HelmTemplateNode[];
}

const helmStarterTemplates: HelmStarterTemplate[] = [
  {
    id: 'nginx-web',
    name: 'NGINX Web App',
    description: 'Static web server with a ClusterIP service',
    category: 'Web',
    icon: '🌐',
    resourceLabels: ['Deployment', 'Service'],
    resources: [
      {
        kind: 'Deployment',
        position: { x: 100, y: 100 },
        resource: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: { name: 'nginx-web', namespace: 'default' },
          spec: {
            replicas: 2,
            selector: { matchLabels: { app: 'nginx-web' } },
            template: {
              metadata: { labels: { app: 'nginx-web' } },
              spec: {
                containers: [
                  {
                    name: 'nginx',
                    image: 'nginx:1.27',
                    ports: [{ containerPort: 80, protocol: 'TCP' }],
                    resources: {
                      requests: { cpu: '100m', memory: '128Mi' },
                      limits: { cpu: '250m', memory: '256Mi' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        kind: 'Service',
        position: { x: 500, y: 100 },
        resource: {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'nginx-web-svc', namespace: 'default' },
          spec: {
            selector: { app: 'nginx-web' },
            type: 'ClusterIP',
            ports: [{ port: 80, targetPort: 80, protocol: 'TCP' }],
          },
        },
      },
    ],
  },
  {
    id: 'nodejs-api',
    name: 'Node.js API',
    description: 'REST API with config-driven environment variables',
    category: 'Backend',
    icon: '⚡',
    resourceLabels: ['Deployment', 'Service', 'ConfigMap'],
    resources: [
      {
        kind: 'Deployment',
        position: { x: 100, y: 100 },
        resource: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: { name: 'api-server', namespace: 'default' },
          spec: {
            replicas: 2,
            selector: { matchLabels: { app: 'api-server' } },
            template: {
              metadata: { labels: { app: 'api-server' } },
              spec: {
                containers: [
                  {
                    name: 'api',
                    image: 'node:20-alpine',
                    ports: [{ containerPort: 3000, protocol: 'TCP' }],
                    envFrom: [{ configMapRef: { name: 'api-config' } }],
                    resources: {
                      requests: { cpu: '100m', memory: '128Mi' },
                      limits: { cpu: '500m', memory: '512Mi' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        kind: 'Service',
        position: { x: 500, y: 100 },
        resource: {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'api-svc', namespace: 'default' },
          spec: {
            selector: { app: 'api-server' },
            type: 'ClusterIP',
            ports: [{ port: 80, targetPort: 3000, protocol: 'TCP' }],
          },
        },
      },
      {
        kind: 'ConfigMap',
        position: { x: 300, y: 320 },
        resource: {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: { name: 'api-config', namespace: 'default' },
          data: {
            NODE_ENV: 'production',
            LOG_LEVEL: 'info',
            PORT: '3000',
          },
        },
      },
    ],
  },
  {
    id: 'fullstack',
    name: 'Full Stack App',
    description: 'App server with config and credentials management',
    category: 'Backend',
    icon: '🔧',
    resourceLabels: ['Deployment', 'Service', 'ConfigMap', 'Secret'],
    resources: [
      {
        kind: 'Deployment',
        position: { x: 100, y: 100 },
        resource: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: { name: 'app-server', namespace: 'default' },
          spec: {
            replicas: 2,
            selector: { matchLabels: { app: 'app-server' } },
            template: {
              metadata: { labels: { app: 'app-server' } },
              spec: {
                containers: [
                  {
                    name: 'app',
                    image: 'node:20-alpine',
                    ports: [{ containerPort: 3000, protocol: 'TCP' }],
                    envFrom: [
                      { configMapRef: { name: 'app-config' } },
                      { secretRef: { name: 'app-secrets' } },
                    ],
                    resources: {
                      requests: { cpu: '200m', memory: '256Mi' },
                      limits: { cpu: '500m', memory: '512Mi' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        kind: 'Service',
        position: { x: 500, y: 100 },
        resource: {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'app-svc', namespace: 'default' },
          spec: {
            selector: { app: 'app-server' },
            type: 'ClusterIP',
            ports: [{ port: 80, targetPort: 3000, protocol: 'TCP' }],
          },
        },
      },
      {
        kind: 'ConfigMap',
        position: { x: 100, y: 350 },
        resource: {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: { name: 'app-config', namespace: 'default' },
          data: {
            NODE_ENV: 'production',
            PORT: '3000',
            DB_HOST: 'postgres-svc',
            DB_PORT: '5432',
          },
        },
      },
      {
        kind: 'Secret',
        position: { x: 500, y: 350 },
        resource: {
          apiVersion: 'v1',
          kind: 'Secret',
          metadata: { name: 'app-secrets', namespace: 'default' },
          type: 'Opaque',
          stringData: {
            DB_PASSWORD: '',
            JWT_SECRET: '',
          },
        },
      },
    ],
  },
  {
    id: 'postgres',
    name: 'PostgreSQL DB',
    description: 'Stateful PostgreSQL database with credentials secret',
    category: 'Database',
    icon: '🐘',
    resourceLabels: ['StatefulSet', 'Service', 'Secret'],
    resources: [
      {
        kind: 'StatefulSet',
        position: { x: 100, y: 100 },
        resource: {
          apiVersion: 'apps/v1',
          kind: 'StatefulSet',
          metadata: { name: 'postgres', namespace: 'default' },
          spec: {
            serviceName: 'postgres-svc',
            replicas: 1,
            selector: { matchLabels: { app: 'postgres' } },
            template: {
              metadata: { labels: { app: 'postgres' } },
              spec: {
                containers: [
                  {
                    name: 'postgres',
                    image: 'postgres:16',
                    ports: [{ containerPort: 5432, protocol: 'TCP' }],
                    envFrom: [{ secretRef: { name: 'postgres-secret' } }],
                    resources: {
                      requests: { cpu: '250m', memory: '256Mi' },
                      limits: { cpu: '500m', memory: '512Mi' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        kind: 'Service',
        position: { x: 500, y: 100 },
        resource: {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'postgres-svc', namespace: 'default' },
          spec: {
            selector: { app: 'postgres' },
            type: 'ClusterIP',
            ports: [{ port: 5432, targetPort: 5432, protocol: 'TCP' }],
          },
        },
      },
      {
        kind: 'Secret',
        position: { x: 300, y: 320 },
        resource: {
          apiVersion: 'v1',
          kind: 'Secret',
          metadata: { name: 'postgres-secret', namespace: 'default' },
          type: 'Opaque',
          stringData: {
            POSTGRES_DB: 'appdb',
            POSTGRES_USER: 'postgres',
            POSTGRES_PASSWORD: '',
          },
        },
      },
    ],
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    description: 'In-memory cache/message broker with ClusterIP service',
    category: 'Database',
    icon: '🔴',
    resourceLabels: ['Deployment', 'Service'],
    resources: [
      {
        kind: 'Deployment',
        position: { x: 100, y: 100 },
        resource: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: { name: 'redis', namespace: 'default' },
          spec: {
            replicas: 1,
            selector: { matchLabels: { app: 'redis' } },
            template: {
              metadata: { labels: { app: 'redis' } },
              spec: {
                containers: [
                  {
                    name: 'redis',
                    image: 'redis:7-alpine',
                    ports: [{ containerPort: 6379, protocol: 'TCP' }],
                    resources: {
                      requests: { cpu: '100m', memory: '128Mi' },
                      limits: { cpu: '250m', memory: '256Mi' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        kind: 'Service',
        position: { x: 500, y: 100 },
        resource: {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'redis-svc', namespace: 'default' },
          spec: {
            selector: { app: 'redis' },
            type: 'ClusterIP',
            ports: [{ port: 6379, targetPort: 6379, protocol: 'TCP' }],
          },
        },
      },
    ],
  },
  {
    id: 'cronjob',
    name: 'Scheduled Job',
    description: 'Cron-triggered batch task with configurable schedule',
    category: 'Batch',
    icon: '⏰',
    resourceLabels: ['CronJob', 'ConfigMap'],
    resources: [
      {
        kind: 'CronJob',
        position: { x: 100, y: 100 },
        resource: {
          apiVersion: 'batch/v1',
          kind: 'CronJob',
          metadata: { name: 'report-job', namespace: 'default' },
          spec: {
            schedule: '0 0 * * *',
            concurrencyPolicy: 'Forbid',
            jobTemplate: {
              spec: {
                template: {
                  spec: {
                    restartPolicy: 'OnFailure',
                    containers: [
                      {
                        name: 'job',
                        image: 'alpine:latest',
                        command: ['/bin/sh', '-c', 'echo "Running scheduled job"'],
                        envFrom: [{ configMapRef: { name: 'job-config' } }],
                        resources: {
                          requests: { cpu: '100m', memory: '64Mi' },
                          limits: { cpu: '200m', memory: '128Mi' },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        kind: 'ConfigMap',
        position: { x: 500, y: 100 },
        resource: {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: { name: 'job-config', namespace: 'default' },
          data: {
            REPORT_TYPE: 'daily',
            TIMEZONE: 'UTC',
            OUTPUT_DIR: '/tmp/reports',
          },
        },
      },
    ],
  },
  {
    id: 'node-monitor',
    name: 'Node Monitor',
    description: 'DaemonSet that runs on every node for metrics collection',
    category: 'System',
    icon: '📊',
    resourceLabels: ['DaemonSet', 'ConfigMap'],
    resources: [
      {
        kind: 'DaemonSet',
        position: { x: 100, y: 100 },
        resource: {
          apiVersion: 'apps/v1',
          kind: 'DaemonSet',
          metadata: { name: 'node-monitor', namespace: 'monitoring' },
          spec: {
            selector: { matchLabels: { app: 'node-monitor' } },
            template: {
              metadata: { labels: { app: 'node-monitor' } },
              spec: {
                hostNetwork: true,
                hostPID: true,
                containers: [
                  {
                    name: 'node-exporter',
                    image: 'prom/node-exporter:latest',
                    ports: [{ containerPort: 9100, hostPort: 9100, protocol: 'TCP' }],
                    envFrom: [{ configMapRef: { name: 'monitor-config' } }],
                    resources: {
                      requests: { cpu: '50m', memory: '64Mi' },
                      limits: { cpu: '100m', memory: '128Mi' },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        kind: 'ConfigMap',
        position: { x: 500, y: 100 },
        resource: {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: { name: 'monitor-config', namespace: 'monitoring' },
          data: {
            METRICS_PORT: '9100',
            SCRAPE_INTERVAL: '15s',
            LOG_LEVEL: 'info',
          },
        },
      },
    ],
  },
];

export default helmStarterTemplates;
