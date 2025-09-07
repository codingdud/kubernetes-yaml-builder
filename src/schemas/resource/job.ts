import { type UiSchema } from '@rjsf/utils';

export const jobUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'template': {'spec': {'containers': {'items': {'ui:options': {'label': false}, 'ui:field': 'CardField'}}}}
  }
};