import { type UiSchema } from '@rjsf/utils';

export const statefulsetUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter StatefulSet name (e.g., nginx)'
    },
    'namespace': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Namespace (default: default)'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'spec': {
    'replicas': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Number of replicas (default: 3)'
    },
    'serviceName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Service name (e.g., nginx)'
    },
    'selector': {
      'matchLabels': {
        'ui:widget': 'KeyValueWidget'
      }
    },
    'template': {
      'metadata': {
        'labels': {
          'ui:widget': 'KeyValueWidget'
        }
      },
      'spec': {
        'terminationGracePeriodSeconds': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Termination grace period (seconds)'
        },
        'containers': {
          'items': {
            'name': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Container name (e.g., nginx)'
            },
            'image': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Container image (e.g., nginx-slim:1.16.1)'
            },
            'ports': {
              'items': {
                'containerPort': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Port number'
                },
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Port name (e.g., web)'
                },
                'protocol': {
                  'ui:widget': 'SelectWidget'
                }
              }
            },
            'volumeMounts': {
              'items': {
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Volume name'
                },
                'mountPath': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Mount path (e.g., /usr/share/nginx/html)'
                }
              }
            },
            'resources': {
              'requests': {
                'cpu': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'CPU request (e.g., 100m)'
                },
                'memory': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Memory request (e.g., 128Mi)'
                }
              },
              'limits': {
                'cpu': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'CPU limit (e.g., 500m)'
                },
                'memory': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Memory limit (e.g., 512Mi)'
                }
              }
            },
            'ui:options': {
              'label': false
            }
          }
        }
      }
    },
    'volumeClaimTemplates': {
      'items': {
        'metadata': {
          'name': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Volume claim name (e.g., www)'
          }
        },
        'spec': {
          'accessModes': {
            'ui:widget': 'MultiSelectWidget'
          },
          'storageClassName': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Storage class (e.g., my-storage-class)'
          },
          'resources': {
            'requests': {
              'storage': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'Storage size (e.g., 1Gi)'
              }
            }
          }
        }
      }
    }
  }
};