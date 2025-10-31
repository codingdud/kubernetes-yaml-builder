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
  const handleChange = useCallback((data: any) => {
    if (data.formData && nodeId) {
      // Clean up nested structures in formData
      const cleanedData = { ...data.formData };
      
      // Fix nested labels
      if (cleanedData.metadata?.labels?.labels) {
        cleanedData.metadata.labels = cleanedData.metadata.labels.labels;
      }
      
      // Fix nested data
      if (cleanedData.data?.data) {
        cleanedData.data = cleanedData.data.data;
      }
      
      // Use updateResource if available, otherwise fallback to direct assignment
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