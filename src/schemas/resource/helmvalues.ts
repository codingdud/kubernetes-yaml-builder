import { type UiSchema } from '@rjsf/utils';

export const helmvaluesUiSchema: UiSchema = {
  'kind':      { 'ui:widget': 'hidden' },
  'autoSync':  { 'ui:widget': 'hidden' },
  'content':   { 'ui:widget': 'HelmValuesWidget' },
};
