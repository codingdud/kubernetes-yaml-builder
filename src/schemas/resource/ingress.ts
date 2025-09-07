import { type UiSchema } from '@rjsf/utils';

export const ingressUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter Ingress name'
    },
    'namespace': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Namespace (default: default)'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    },
    'annotations': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'spec': {
    'ingressClassName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Ingress class name (e.g., nginx)'
    },
    'defaultBackend': {
      'service': {
        'name': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Default service name'
        },
        'port': {
          'number': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Port number'
          },
          'name': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Port name'
          }
        }
      }
    },
    'rules': {
      'items': {
        'host': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Host domain (e.g., foo.bar.com)'
        },
        'http': {
          'paths': {
            'items': {
              'path': {
                'ui:widget': 'TextWidget',
                'ui:placeholder': 'Path (e.g., /)'
              },
              'pathType': {
                'ui:widget': 'SelectWidget'
              },
              'backend': {
                'service': {
                  'name': {
                    'ui:widget': 'TextWidget',
                    'ui:placeholder': 'Service name'
                  },
                  'port': {
                    'number': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'Port number (e.g., 80)'
                    },
                    'name': {
                      'ui:widget': 'TextWidget',
                      'ui:placeholder': 'Port name'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    'tls': {
      'items': {
        'hosts': {
          'items': {
            'ui:widget': 'TextWidget',
            'ui:placeholder': 'Host domain'
          }
        },
        'secretName': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'TLS secret name'
        }
      }
    }
  }
};