import { type Node } from '@xyflow/react';
import { type RJSFSchema, type UiSchema } from '@rjsf/utils';

export interface K8sNodeData extends Record<string, unknown> {
  resource: Record<string, unknown>;
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

export interface K8sNode extends Node {
  data: K8sNodeData;
}