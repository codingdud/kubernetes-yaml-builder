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
    'ui:help': 'Base64 encoded data. For TLS secrets, use keys: tls.crt and tls.key',
    'tls.crt': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded TLS certificate',
      'ui:options': {
        'rows': 4
      }
    },
    'tls.key': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded TLS private key',
      'ui:options': {
        'rows': 4
      }
    },
    'ca.crt': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded CA certificate',
      'ui:options': {
        'rows': 4
      }
    },
    '.dockerconfigjson': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded Docker config JSON',
      'ui:options': {
        'rows': 3
      }
    },
    'username': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Base64 encoded username'
    },
    'password': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Base64 encoded password'
    },
    'ssh-privatekey': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded SSH private key',
      'ui:options': {
        'rows': 4
      }
    },
    'ssh-publickey': {
      'ui:widget': 'TextareaWidget',
      'ui:placeholder': 'Base64 encoded SSH public key',
      'ui:options': {
        'rows': 2
      }
    },
    'token': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Base64 encoded service account token'
    }
  },
  'stringData': {
    'ui:widget': 'KeyValueWidget',
    'ui:help': 'Plain text data that will be automatically base64 encoded'
  }
};