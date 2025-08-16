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
}

const widgets = {
  KeyValueWidget,
  TextWidget: CustomTextWidget,
  SelectWidget: CustomSelectWidget,
  TextareaWidget: CustomTextareaWidget,
  MultiSelectWidget,
};

const DynamicK8sForm: React.FC<DynamicK8sFormProps> = ({ nodeData }) => {
  const handleChange = useCallback((data: any) => {
    if (data.formData) {
      nodeData.resource = data.formData;
    }
  }, [nodeData]);

  return (
    <div className="rjsf space-y-3">
      <Form
        schema={nodeData.schema}
        uiSchema={nodeData.uiSchema}
        formData={nodeData.resource}
        onChange={handleChange}
        validator={validator}
        widgets={widgets}
        showErrorList={false}
        liveValidate
      >
        <div />
      </Form>
    </div>
  );
};

export default DynamicK8sForm;