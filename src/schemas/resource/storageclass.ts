import { type UiSchema } from '@rjsf/utils';

export const storageclassUiSchema: UiSchema = {
  'metadata': {
    'ui:options': { collapsible: true, title: 'Metadata' },
    'name': { 'ui:widget': 'TextWidget', 'ui:placeholder': 'Enter StorageClass name' },
    'labels': { 'ui:widget': 'KeyValueWidget' },
    'annotations': { 'ui:widget': 'KeyValueWidget' },
  },
  'provisioner': {
    'ui:widget': 'TextWidget',
    'ui:placeholder': 'e.g. kubernetes.io/aws-ebs, ebs.csi.aws.com',
  },
  'reclaimPolicy': { 'ui:widget': 'SelectWidget' },
  'volumeBindingMode': { 'ui:widget': 'SelectWidget' },
  'allowVolumeExpansion': { 'ui:widget': 'SelectWidget' },
  'parameters': {
    'ui:field': 'CollapsibleKeyValueField',
    'ui:options': { title: 'Provisioner Parameters', defaultCollapsed: true },
  },
  'mountOptions': {
    'ui:options': { collapsible: true, title: 'Mount Options', defaultCollapsed: true },
    'items': {
      'ui:widget': 'TextWidget',
      'ui:placeholder': 'e.g. hard, nfsvers=4.1',
    },
  },
};
