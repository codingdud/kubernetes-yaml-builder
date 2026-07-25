import { type UiSchema } from '@rjsf/utils';

export const volumesnapshotUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Enter VolumeSnapshot name' },
    'namespace': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Namespace (default: default)' },
    'labels': { 'ui:widget': 'KeyValueWidget' },
  },
  'spec': {
    'ui:options': { collapsible: true, title: 'Spec' },
    'volumeSnapshotClassName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'VolumeSnapshotClass name',
    },
    'source': {
      'ui:options': { collapsible: true, title: 'Source' },
      'persistentVolumeClaimName': {
        'ui:widget': 'TextWidget',
        'ui:placeholder': 'PVC name (for dynamic snapshot)',
      },
      'volumeSnapshotContentName': {
        'ui:widget': 'TextWidget',
        'ui:placeholder': 'VolumeSnapshotContent name (pre-provisioned)',
      },
    },
  },
};
