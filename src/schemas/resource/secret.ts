import { type UiSchema } from '@rjsf/utils';

export const secretUiSchema: UiSchema = {
  'metadata': {
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
    'ui:widget': 'KeyValueWidget',
    'ui:help': 'Base64 encoded data (e.g., username: YWRtaW4=, password: MWYyZDFlMmU2N2Rm)'
  },
  'stringData': {
    'ui:widget': 'KeyValueWidget',
    'ui:help': 'Plain text data that will be automatically base64 encoded'
  }
};