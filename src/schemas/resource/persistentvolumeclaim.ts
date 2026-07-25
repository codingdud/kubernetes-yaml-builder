import { type UiSchema } from '@rjsf/utils';

export const persistentvolumeclaimUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Enter PVC name' },
    'namespace': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Namespace (default: default)' },
    'labels': { 'ui:widget': 'KeyValueWidget' },
    'annotations': { 'ui:widget': 'KeyValueWidget' },
  },
  'spec': {
    'ui:options': { collapsible: true, title: 'Spec' },
    'accessModes': { 'ui:widget': 'MultiSelectWidget' },
    'resources': {
      'ui:options': { collapsible: true, title: 'Resources' },
      'requests': {
        'storage': {
          'ui:widget': 'TextWidget',
          'ui:placeholder': 'e.g. 1Gi, 500Mi',
        },
      },
    },
    'storageClassName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'StorageClass name (leave empty for default)',
    },
    'volumeMode': { 'ui:widget': 'SelectWidget' },
    'volumeName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'Bind to a specific PersistentVolume (optional)',
    },
    'selector': {
      'ui:options': { collapsible: true, title: 'Selector', defaultCollapsed: true },
      'matchLabels': {
        'ui:field': 'CollapsibleKeyValueField',
        'ui:options': { title: 'Match Labels', defaultCollapsed: false },
      },
    },
  },
};
