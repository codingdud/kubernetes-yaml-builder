import { type UiSchema } from '@rjsf/utils';

export const replicasetUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Enter ReplicaSet name' },
    'namespace': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Namespace (default: default)' },
    'labels': { 'ui:widget': 'KeyValueWidget' },
  },
  'spec': {
    'ui:options': { collapsible: true, title: 'Spec' },
    'replicas': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Number of replicas' },
    'selector': {
      'ui:options': { collapsible: true, title: 'Selector', defaultCollapsed: true },
      'matchLabels': { 'ui:widget': 'KeyValueWidget' },
    },
    'template': {
      'ui:options': { collapsible: true, title: 'Pod Template' },
      'metadata': {
        'ui:options': { collapsible: true, title: 'Pod Labels', defaultCollapsed: true },
        'labels': { 'ui:widget': 'KeyValueWidget' },
      },
      'spec': {
        'ui:options': { collapsible: true, title: 'Pod Spec' },
        'restartPolicy': { 'ui:widget': 'SelectWidget' },
        'containers': {
          'items': {
            'ui:options': { collapsible: true, title: 'Container' },
            'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Container name' },
            'image': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Container image (e.g. nginx:latest)' },
            'resources': {
              'ui:options': { collapsible: true, title: 'Resource Limits & Requests', defaultCollapsed: true },
              'requests': {
                'ui:options': { collapsible: true, title: 'Requests' },
                'cpu': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'CPU request (e.g., 100m)' },
                'memory': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Memory request (e.g., 128Mi)' },
              },
              'limits': {
                'ui:options': { collapsible: true, title: 'Limits' },
                'cpu': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'CPU limit (e.g., 500m)' },
                'memory': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Memory limit (e.g., 512Mi)' },
              },
            },
            'ports': {
              'ui:options': { collapsible: true, title: 'Ports', defaultCollapsed: true },
              'items': {
                'containerPort': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Port number' },
                'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Port name' },
                'protocol': { 'ui:widget': 'SelectWidget' },
              },
            },
            'env': {
              'ui:options': { collapsible: true, title: 'Environment Variables', defaultCollapsed: true },
              'items': {
                'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Variable name' },
                'value': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Variable value' },
                'valueFrom': {
                  'ui:options': { collapsible: true, title: 'Value From (ConfigMap / Secret)', defaultCollapsed: true },
                  'configMapKeyRef': {
                    'ui:options': { collapsible: true, title: 'ConfigMap Key Ref' },
                    'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'ConfigMap name' },
                    'key': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'ConfigMap key' },
                  },
                  'secretKeyRef': {
                    'ui:options': { collapsible: true, title: 'Secret Key Ref' },
                    'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Secret name' },
                    'key': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Secret key' },
                  },
                },
              },
            },
            'livenessProbe': {
              'ui:options': { collapsible: true, title: 'Liveness Probe', defaultCollapsed: true },
              'httpGet': {
                'ui:options': { collapsible: true, title: 'HTTP Get' },
                'path': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'HTTP path (e.g., /health)' },
                'port': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Port number' },
              },
              'tcpSocket': {
                'ui:options': { collapsible: true, title: 'TCP Socket' },
                'port': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Port number' },
              },
            },
            'readinessProbe': {
              'ui:options': { collapsible: true, title: 'Readiness Probe', defaultCollapsed: true },
              'httpGet': {
                'ui:options': { collapsible: true, title: 'HTTP Get' },
                'path': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'HTTP path (e.g., /ready)' },
                'port': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Port number' },
              },
              'tcpSocket': {
                'ui:options': { collapsible: true, title: 'TCP Socket' },
                'port': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Port number' },
              },
            },
            'volumeMounts': {
              'ui:options': { collapsible: true, title: 'Volume Mounts', defaultCollapsed: true },
              'items': {
                'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Volume name' },
                'mountPath': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Mount path' },
              },
            },
          },
        },
        'volumes': {
          'ui:options': { collapsible: true, title: 'Volumes', defaultCollapsed: true },
          'items': {
            'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Volume name' },
            'hostPath': {
              'ui:options': { collapsible: true, title: 'Host Path' },
              'path': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Host path' },
            },
            'configMap': {
              'ui:options': { collapsible: true, title: 'ConfigMap' },
              'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'ConfigMap name' },
            },
            'secret': {
              'ui:options': { collapsible: true, title: 'Secret' },
              'secretName': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Secret name' },
            },
          },
        },
      },
    },
  },
};
