import { type UiSchema } from '@rjsf/utils';

export const configmapUiSchema: UiSchema = {
  'metadata': {
    'ui:options': {
      collapsible: true,
      title: 'Metadata',
      defaultCollapsed: false
    },
    'name': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Enter ConfigMap name'
    },
    'labels': {
      'ui:widget': 'KeyValueWidget'
    }
  },
  'data': {
    'ui:field': 'CollapsibleKeyValueField',
    'ui:options': {
      title: 'Data'
    }
  }
};