import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import DynamicK8sForm from '@/components/forms/DynamicK8sForm';
import { Card } from '@/components/ui/card';
import { type K8sNode } from '@/types/reactFlow';

const ResourceNode: React.FC<{ data: K8sNode['data'] }> = memo(({ data }) => {
  return (
    <Card className="p-4 w-96">
      <Handle type="target" position={Position.Top} />
      <h3 className="text-lg font-bold mb-2">{data.resource.kind}</h3>
      <DynamicK8sForm nodeData={data} />
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});

ResourceNode.displayName = 'ResourceNode';

export default ResourceNode;