import { type UiSchema } from '@rjsf/utils';

export const daemonsetUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'selector': {'matchLabels': {'ui:widget': 'KeyValueWidget'}},
    'template': {
      'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
      'spec': {'containers': {'items': {'ui:options': {'label': false}, 'ui:field': 'CardField'}}}
    }
  }
};