import { type UiSchema } from '@rjsf/utils';

export const configmapUiSchema: UiSchema = {
  'metadata': {
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter ConfigMap name'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'data': {
    'ui:widget': 'KeyValueWidget'
  }
};