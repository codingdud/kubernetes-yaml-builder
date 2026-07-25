import { type UiSchema } from '@rjsf/utils';

export const secretUiSchema: UiSchema = {
  'metadata': {
    'ui:options': {
      collapsible: true,
      title: 'Metadata'
    },
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter Secret name (e.g., testsecret-tls)'
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
  'type': {
    'ui:widget': 'SelectWidget',
    'ui:help': 'Select the type of secret to create'
  },
  'data': {
    'ui:field': 'CollapsibleKeyValueField',
    'ui:options': {
      title: 'Secret Data (Base64)'
    }
  },
  'stringData': {
    'ui:field': 'CollapsibleKeyValueField',
    'ui:options': {
      title: 'String Data'
    }
  }
};