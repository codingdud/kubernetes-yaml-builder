import React, { useCallback } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { K8sNodeData } from '@/types/reactFlow';
import KeyValueWidget from './widgets/KeyValueWidget';

interface DynamicK8sFormProps {
  nodeData: K8sNodeData;
}

const widgets = {
  KeyValueWidget,
};

const DynamicK8sForm: React.FC<DynamicK8sFormProps> = ({ nodeData }) => {
  const handleChange = useCallback(({ formData }: { formData: any }) => {
    nodeData.resource = formData;
  }, [nodeData]);

  return (
    <Form
      schema={nodeData.schema}
      uiSchema={nodeData.uiSchema}
      formData={nodeData.resource}
      onChange={handleChange}
      validator={validator}
      widgets={widgets}
      showErrorList={false}
    >
      <div />
    </Form>
  );
};

export default DynamicK8sForm;