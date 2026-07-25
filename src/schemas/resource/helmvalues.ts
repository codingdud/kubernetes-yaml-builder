import { type UiSchema } from '@rjsf/utils';

export const helmvaluesUiSchema: UiSchema = {
  'kind': { 'ui:widget': 'hidden' },
  'content': {
    'ui:widget': 'textarea',
    'ui:placeholder': '# Override auto-generated values\n# replicaCount: 2\n# image:\n#   tag: latest',
    'ui:options': { rows: 18 },
  },
};
