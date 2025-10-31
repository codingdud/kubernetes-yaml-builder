import deploymentSchema from '../schemas/kubernetes/deployment.json';
import serviceSchema from '../schemas/kubernetes/service.json';
import statefulsetSchema from '../schemas/kubernetes/statefulset.json';
import daemonsetSchema from '../schemas/kubernetes/daemonset.json';
import configmapSchema from '../schemas/kubernetes/configmap.json';
import jobSchema from '../schemas/kubernetes/job.json';
import secretSchema from '../schemas/kubernetes/secret.json';
import cronjobSchema from '../schemas/kubernetes/cronjob.json';
import ingressSchema from '../schemas/kubernetes/ingress.json';

import {
  deploymentUiSchema, serviceUiSchema, statefulsetUiSchema, daemonsetUiSchema,
  configmapUiSchema, jobUiSchema, secretUiSchema, cronjobUiSchema, ingressUiSchema
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
  }
};

export default resourceRegistry;