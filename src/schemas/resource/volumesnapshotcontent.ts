import { type UiSchema } from '@rjsf/utils';

export const volumesnapshotcontentUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Enter VolumeSnapshotContent name' },
    'labels': { 'ui:widget': 'KeyValueWidget' },
  },
  'spec': {
    'ui:options': { collapsible: true, title: 'Spec' },
    'deletionPolicy': { 'ui:widget': 'SelectWidget' },
    'driver': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'CSI driver name (e.g. ebs.csi.aws.com)',
    },
    'volumeSnapshotClassName': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'VolumeSnapshotClass name',
    },
    'source': {
      'ui:options': { collapsible: true, title: 'Source', defaultCollapsed: true },
      'snapshotHandle': {
        'ui:widget': 'TextWidget',
        'ui:placeholder': 'CSI snapshot handle (pre-provisioned)',
      },
      'volumeHandle': {
        'ui:widget': 'TextWidget',
        'ui:placeholder': 'CSI volume handle (dynamic)',
      },
    },
    'volumeSnapshotRef': {
      'ui:options': { collapsible: true, title: 'Volume Snapshot Ref', defaultCollapsed: true },
      'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'VolumeSnapshot name' },
      'namespace': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Namespace' },
    },
  },
};
