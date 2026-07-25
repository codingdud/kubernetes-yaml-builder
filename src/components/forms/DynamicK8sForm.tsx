import React, { useCallback } from 'react';
import Form from '@rjsf/shadcn';
import validator from '@rjsf/validator-ajv8';
import { useReactFlow } from '@xyflow/react';
import { type K8sNodeData } from '../../types/reactFlow';
import KeyValueWidget from './widgets/KeyValueWidget';
import CustomTextWidget from './widgets/CustomTextWidget';
import CustomSelectWidget from './widgets/CustomSelectWidget';
import CustomTextareaWidget from './widgets/CustomTextareaWidget';
import MultiSelectWidget from './widgets/MultiSelectWidget';
import HelmValuesWidget from './widgets/HelmValuesWidget';
import CollapsibleObjectFieldTemplate from './templates/CollapsibleObjectFieldTemplate';
import CollapsibleFieldTemplate from './templates/CollapsibleFieldTemplate';
import CollapsibleKeyValueField from './fields/CollapsibleKeyValueField';

interface DynamicK8sFormProps {
  nodeData: K8sNodeData;
  nodeId?: string;
}

const widgets = {
  KeyValueWidget,
  TextWidget: CustomTextWidget,
  SelectWidget: CustomSelectWidget,
  TextareaWidget: CustomTextareaWidget,
  MultiSelectWidget,
  HelmValuesWidget,
};

const templates = {
  ObjectFieldTemplate: CollapsibleObjectFieldTemplate,
  FieldTemplate: CollapsibleFieldTemplate,
};

const fields = {
  CollapsibleKeyValueField,
};

const fixNestedKeyValueFields = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(fixNestedKeyValueFields);
  if (typeof obj !== 'object') return obj;
  const result = { ...obj };
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'object' && value !== null) {
      if (!Array.isArray(value) && (value as any)[key] && typeof (value as any)[key] === 'object') {
        result[key] = fixNestedKeyValueFields((value as any)[key]);
      } else {
        result[key] = fixNestedKeyValueFields(value);
      }
    }
  }
  return result;
};

const DynamicK8sForm: React.FC<DynamicK8sFormProps> = ({ nodeData, nodeId }) => {
  const { setNodes } = useReactFlow();

  const handleChange = useCallback(
    (data: any) => {
      if (data.formData && nodeId) {
        const cleanedData = fixNestedKeyValueFields(data.formData);
        setNodes((nds) =>
          nds.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, resource: cleanedData } }
              : node
          )
        );
      }
    },
    [nodeId, setNodes]
  );

  return (
    <div className="rjsf space-y-2 nodrag nopan nowheel">
      <Form
        schema={nodeData.schema}
        uiSchema={nodeData.uiSchema}
        formData={nodeData.resource}
        onChange={handleChange}
        validator={validator}
        widgets={widgets}
        templates={templates}
        fields={fields}
        formContext={{ nodeId, autoSync: !!(nodeData.resource as any)?.autoSync }}
        showErrorList={false}
        liveValidate
      >
        <div />
      </Form>
    </div>
  );
};

export default DynamicK8sForm;
