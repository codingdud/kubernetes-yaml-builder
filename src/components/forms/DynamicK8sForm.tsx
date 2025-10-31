import React, { useCallback } from 'react';
import Form from '@rjsf/shadcn';
import validator from '@rjsf/validator-ajv8';
import { type K8sNodeData } from '../../types/reactFlow';
import KeyValueWidget from './widgets/KeyValueWidget';
import CustomTextWidget from './widgets/CustomTextWidget';
import CustomSelectWidget from './widgets/CustomSelectWidget';
import CustomTextareaWidget from './widgets/CustomTextareaWidget';
import MultiSelectWidget from './widgets/MultiSelectWidget';

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
};

const DynamicK8sForm: React.FC<DynamicK8sFormProps> = ({ nodeData, nodeId }) => {
  const fixNestedKeyValueFields = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
    
    const result = { ...obj };
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if this is a nested key-value structure (field contains object with same key)
        if ((value as any)[key] && typeof (value as any)[key] === 'object') {
          result[key] = (value as any)[key];
        } else {
          // Recursively process nested objects but preserve arrays
          result[key] = fixNestedKeyValueFields(value);
        }
      }
    }
    return result;
  };

  const handleChange = useCallback((data: any) => {
    if (data.formData && nodeId) {
      const cleanedData = fixNestedKeyValueFields(data.formData);
      
      if ((nodeData as any).updateResource) {
        (nodeData as any).updateResource(nodeId, cleanedData);
      } else {
        nodeData.resource = cleanedData;
      }
    }
  }, [nodeData, nodeId]);

  return (
    <div className="rjsf space-y-3">
      <Form
        schema={nodeData.schema}
        uiSchema={nodeData.uiSchema}
        formData={nodeData.resource}
        onChange={handleChange}
        validator={validator}
        widgets={widgets}
        formContext={{ nodeId }}
        showErrorList={false}
        liveValidate
      >
        <div />
      </Form>
    </div>
  );
};

export default DynamicK8sForm;