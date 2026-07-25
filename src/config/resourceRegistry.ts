import deploymentSchema from '../schemas/kubernetes/deployment.json';
import serviceSchema from '../schemas/kubernetes/service.json';
import statefulsetSchema from '../schemas/kubernetes/statefulset.json';
import daemonsetSchema from '../schemas/kubernetes/daemonset.json';
import configmapSchema from '../schemas/kubernetes/configmap.json';
import jobSchema from '../schemas/kubernetes/job.json';
import secretSchema from '../schemas/kubernetes/secret.json';
import cronjobSchema from '../schemas/kubernetes/cronjob.json';
import ingressSchema from '../schemas/kubernetes/ingress.json';
import helmchartSchema from '../schemas/kubernetes/helmchart.json';
import helmvaluesSchema from '../schemas/kubernetes/helmvalues.json';
import replicasetSchema from '../schemas/kubernetes/replicaset.json';
import storageclassSchema from '../schemas/kubernetes/storageclass.json';
import volumesnapshotSchema from '../schemas/kubernetes/volumesnapshot.json';
import volumesnapshotcontentSchema from '../schemas/kubernetes/volumesnapshotcontent.json';
import volumesnapshotclassSchema from '../schemas/kubernetes/volumesnapshotclass.json';
import persistentvolumeclaimSchema from '../schemas/kubernetes/persistentvolumeclaim.json';

import {
  deploymentUiSchema, serviceUiSchema, statefulsetUiSchema, daemonsetUiSchema,
  configmapUiSchema, jobUiSchema, secretUiSchema, cronjobUiSchema, ingressUiSchema,
  helmchartUiSchema, helmvaluesUiSchema, replicasetUiSchema,
  storageclassUiSchema, volumesnapshotUiSchema, volumesnapshotcontentUiSchema, volumesnapshotclassUiSchema,
  persistentvolumeclaimUiSchema,
} from '../schemas/uiSchema';

import ResourceNode from '../components/flow/nodes/ResourceNode';

const resourceRegistry = {
  Deployment: {
    schema: deploymentSchema,
    uiSchema: deploymentUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'apps/v1', kind: 'Deployment', metadata: { name: '' } }
  },
  StatefulSet: {
    schema: statefulsetSchema,
    uiSchema: statefulsetUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'apps/v1', kind: 'StatefulSet', metadata: { name: '' } }
  },
  Service: {
    schema: serviceSchema,
    uiSchema: serviceUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'v1', kind: 'Service', metadata: { name: '' } }
  },
  DaemonSet: {
    schema: daemonsetSchema,
    uiSchema: daemonsetUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'apps/v1', kind: 'DaemonSet', metadata: { name: '' } }
  },
  ConfigMap: {
    schema: configmapSchema,
    uiSchema: configmapUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'v1', kind: 'ConfigMap', metadata: { name: '' }, data: {} }
  },
  Job: {
    schema: jobSchema,
    uiSchema: jobUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'batch/v1', kind: 'Job', metadata: { name: '' } }
  },
  Secret: {
    schema: secretSchema,
    uiSchema: secretUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { 
      apiVersion: 'v1', 
      kind: 'Secret', 
      metadata: { name: '' }, 
      type: 'Opaque',
      data: {} 
    }
  },
  CronJob: {
    schema: cronjobSchema,
    uiSchema: cronjobUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'batch/v1', kind: 'CronJob', metadata: { name: '' } }
  },
  Ingress: {
    schema: ingressSchema,
    uiSchema: ingressUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'networking.k8s.io/v1', kind: 'Ingress', metadata: { name: '' } }
  },
  ReplicaSet: {
    schema: replicasetSchema,
    uiSchema: replicasetUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'apps/v1', kind: 'ReplicaSet', metadata: { name: '' }, spec: { replicas: 1 } }
  },
  StorageClass: {
    schema: storageclassSchema,
    uiSchema: storageclassUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'storage.k8s.io/v1', kind: 'StorageClass', metadata: { name: '' } }
  },
  VolumeSnapshot: {
    schema: volumesnapshotSchema,
    uiSchema: volumesnapshotUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'snapshot.storage.k8s.io/v1', kind: 'VolumeSnapshot', metadata: { name: '' } }
  },
  VolumeSnapshotContent: {
    schema: volumesnapshotcontentSchema,
    uiSchema: volumesnapshotcontentUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'snapshot.storage.k8s.io/v1', kind: 'VolumeSnapshotContent', metadata: { name: '' } }
  },
  VolumeSnapshotClass: {
    schema: volumesnapshotclassSchema,
    uiSchema: volumesnapshotclassUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { apiVersion: 'snapshot.storage.k8s.io/v1', kind: 'VolumeSnapshotClass', metadata: { name: '' }, deletionPolicy: 'Delete' }
  },
  PersistentVolumeClaim: {
    schema: persistentvolumeclaimSchema,
    uiSchema: persistentvolumeclaimUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name: '' },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '1Gi' } }
      }
    }
  },
  HelmChart: {
    schema: helmchartSchema,
    uiSchema: helmchartUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { kind: 'HelmChart', apiVersion: 'v2', name: 'my-chart', description: '', type: 'application', version: '0.1.0', appVersion: '1.0.0' }
  },
  HelmValues: {
    schema: helmvaluesSchema,
    uiSchema: helmvaluesUiSchema,
    NodeComponent: ResourceNode,
    defaultResource: { kind: 'HelmValues', content: '' }
  },
};

export default resourceRegistry;