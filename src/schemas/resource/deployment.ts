import { type UiSchema } from '@rjsf/utils';

export const deploymentUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter deployment name'
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
      'ui:placeholder': 'Number of replicas'
    },
    'strategy': {
      'type': {
        'ui:widget': 'SelectWidget'
      },
      'rollingUpdate': {
        'maxSurge': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Max surge (e.g., 25%)'
        },
        'maxUnavailable': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Max unavailable (e.g., 25%)'
        }
      }
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
        'restartPolicy': {
          'ui:widget': 'SelectWidget'
        },
        'containers': {
          'items': {
            'name': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Container name'
            },
            'image': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Container image'
            },
            'resources': {
              'requests': {
                'cpu': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'CPU request (e.g., 100m)'
                },
                'memory': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Memory request (e.g., 100Mi)'
                }
              },
              'limits': {
                'cpu': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'CPU limit (e.g., 100m)'
                },
                'memory': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Memory limit (e.g., 100Mi)'
                }
              }
            },
            'ports': {
              'items': {
                'containerPort': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Port number'
                },
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Port name'
                },
                'protocol': {
                  'ui:widget': 'SelectWidget'
                }
              }
            },
            'env': {
              'items': {
                'name': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Environment variable name'
                },
                'value': {
                  'ui:widget': 'TextWidget',
                  'ui:placeholder': 'Environment variable value'
                },
                'valueFrom': {
                  'configMapKeyRef': {
                    'name': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'ConfigMap name'
                    },
                    'key': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'ConfigMap key'
                    }
                  },
                  'secretKeyRef': {
                    'name': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'Secret name'
                    },
                    'key': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'Secret key'
                    }
                  }
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
                  'ui:placeholder': 'Mount path'
                }
              }
            },
            'ui:options': {
              'label': false
            }
          }
        },
        'volumes': {
          'items': {
            'name': {
              'ui:widget': 'TextWidget',
              'ui:placeholder': 'Volume name'
            },
            'hostPath': {
              'path': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'Host path'
              }
            },
            'configMap': {
              'name': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'ConfigMap name'
              }
            },
            'secret': {
              'secretName': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'Secret name'
              }
            }
          }
        }
      }
    }
  }
};