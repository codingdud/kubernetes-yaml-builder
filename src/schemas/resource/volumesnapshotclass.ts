import { type UiSchema } from '@rjsf/utils';

export const volumesnapshotclassUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Enter VolumeSnapshotClass name' },
    'labels': { 'ui:widget': 'KeyValueWidget' },
    'annotations': { 'ui:widget': 'KeyValueWidget' },
  },
  'driver': {
    'ui:widget': 'TextWidget',
    'ui:placeholder': 'CSI driver name (e.g. ebs.csi.aws.com)',
  },
  'deletionPolicy': { 'ui:widget': 'SelectWidget' },
  'parameters': {
    'ui:field': 'CollapsibleKeyValueField',
    'ui:options': { title: 'Driver Parameters', defaultCollapsed: true },
  },
};
