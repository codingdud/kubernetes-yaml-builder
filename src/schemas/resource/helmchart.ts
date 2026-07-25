import { type UiSchema } from '@rjsf/utils';

export const helmchartUiSchema: UiSchema = {
  'kind':        { 'ui:widget': 'hidden' },
  'apiVersion':  { 'ui:widget': 'hidden' },
  'name':        { 'ui:placeholder': 'my-chart' },
  'description': { 'ui:widget': 'textarea', 'ui:placeholder': 'A Helm chart for Kubernetes', 'ui:options': { rows: 2 } },
  'type':        { 'ui:widget': 'select' },
  'version':     { 'ui:placeholder': '0.1.0' },
  'appVersion':  { 'ui:placeholder': '1.0.0' },
};
