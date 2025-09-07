import { type UiSchema } from '@rjsf/utils';

export const cronjobUiSchema: UiSchema = {
  'metadata': {'labels': {'ui:widget': 'KeyValueWidget'}},
  'spec': {
    'jobTemplate': {
      'spec': {
        'template': {'spec': {'containers': {'items': {'ui:options': {'label': false}, 'ui:field': 'CardField'}}}}
      }
    }
  }
};