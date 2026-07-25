import { type UiSchema } from '@rjsf/utils';

export const daemonsetUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'labels': { 'ui:widget': 'KeyValueWidget' }
  },
  'spec': {
    'ui:options': { collapsible: true, title: 'Spec' },
    'selector': {
      'ui:options': { collapsible: true, title: 'Selector', defaultCollapsed: true },
      'matchLabels': { 'ui:widget': 'KeyValueWidget' }
    },
    'updateStrategy': {
      'ui:options': { collapsible: true, title: 'Update Strategy', defaultCollapsed: true }
    },
    'template': {
      'ui:options': { collapsible: true, title: 'Pod Template' },
      'metadata': {
        'ui:options': { collapsible: true, title: 'Template Metadata', defaultCollapsed: true },
        'labels': { 'ui:widget': 'KeyValueWidget' }
      },
      'spec': {
        'containers': {
          'items': {
            'ui:options': { label: false },
            'ui:field': 'CardField',
            'resources': {
              'ui:options': { collapsible: true, title: 'Resources', defaultCollapsed: true }
            },
            'ports': {
              'ui:options': { collapsible: true, title: 'Ports', defaultCollapsed: true }
            },
            'env': {
              'ui:options': { collapsible: true, title: 'Environment', defaultCollapsed: true }
            }
          }
        }
      }
    }
  }
};
