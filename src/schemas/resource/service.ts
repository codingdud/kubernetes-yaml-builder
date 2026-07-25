import { type UiSchema } from '@rjsf/utils';

export const serviceUiSchema: UiSchema = {
  'metadata': {
    'ui:options': {
      collapsible: true,
      title: 'Metadata'
    },
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter service name (e.g., MYAPP)'
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
    'ui:options': {
      collapsible: true,
      title: 'Service Spec'
    },
    'type': {
      'ui:widget': 'SelectWidget'
    },
    'selector': {
      'ui:widget': 'KeyValueWidget',
      'ui:options': {
        collapsible: true,
        title: 'Selector',
        defaultCollapsed: true
      }
    },
    'sessionAffinity': {
      'ui:widget': 'SelectWidget'
    },
    'sessionAffinityConfig': {
      'ui:field': 'ConditionalField',
      'ui:condition': {
        'sessionAffinity': 'ClientIP'
      },
      'clientIP': {
        'timeoutSeconds': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Timeout seconds (default: 10800)'
        }
      }
    },
    'externalName': {
      'ui:field': 'ConditionalField',
      'ui:condition': {
        'type': 'ExternalName'
      },
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'External DNS name'
    },
    'ports': {
      'ui:options': {
        collapsible: true,
        title: 'Ports'
      },
      'items': {
        'name': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Port name (e.g., MYAPP)'
        },
        'port': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Port number (required)'
        },
        'targetPort': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Target port (number or name)'
        },
        'protocol': {
          'ui:widget': 'SelectWidget'
        },
        'nodePort': {
          'ui:field': 'ConditionalField',
          'ui:condition': {
            '../type': 'NodePort'
          },
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'Node port (30000-32767)'
        },
        'ui:options': {
          'label': false
        }
      }
    }
  }
};
