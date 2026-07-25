import { type UiSchema } from '@rjsf/utils';

export const cronjobUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'labels': { 'ui:widget': 'KeyValueWidget' },
  },
  'spec': {
    'ui:options': { collapsible: true, title: 'Spec' },
    'jobTemplate': {
      'ui:options': { collapsible: true, title: 'Job Template', defaultCollapsed: true },
      'spec': {
        'template': {
          'spec': {
            'containers': {
              'items': {
                'ui:options': { label: false, collapsible: true, title: 'Container' },
                'ui:field': 'CardField',
              },
            },
          },
        },
      },
    },
  },
};