import { type UiSchema } from '@rjsf/utils';

export const jobUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'labels': { 'ui:widget': 'KeyValueWidget' },
  },
  'spec': {
    'ui:options': { collapsible: true, title: 'Job Spec' },
    'parallelism': { 'ui:widget': 'updown', 'ui:placeholder': 'Parallel pods (default: 1)' },
    'completions': { 'ui:widget': 'updown', 'ui:placeholder': 'Required completions (default: 1)' },
    'backoffLimit': { 'ui:widget': 'updown', 'ui:placeholder': 'Retry limit on failure (default: 6)' },
    'template': {
      'ui:options': { collapsible: true, title: 'Pod Template' },
      'spec': {
        'ui:options': { collapsible: true, title: 'Pod Spec' },
        'containers': {
          'items': {
            'ui:options': { collapsible: true, title: 'Container', label: false },
            'ui:field': 'CardField',
            'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Container name' },
            'image': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Container image (e.g. busybox:latest)' },
            'command': {
              'ui:options': { collapsible: true, title: 'Command', defaultCollapsed: true },
              'items': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Command argument' },
            },
          },
        },
      },
    },
  },
};
