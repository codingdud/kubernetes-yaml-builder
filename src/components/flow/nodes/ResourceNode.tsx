import React, { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import DynamicK8sForm from '@/components/forms/DynamicK8sForm';
import { type K8sNode } from '@/types/reactFlow';

interface ResourceNodeProps {
  id: string;
  data: K8sNode['data'];
}

const ResourceNode: React.FC<ResourceNodeProps> = memo(({ id, data }) => {
  const { deleteElements } = useReactFlow();
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 w-96 ${isFormCollapsed ? 'min-h-[120px]' : 'min-h-[200px]'} relative transition-all duration-300`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-800"
      />
      
      <div className="absolute top-2 right-2 flex gap-8">
        <button
          onClick={() => setIsFormCollapsed(!isFormCollapsed)}
          className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={isFormCollapsed ? 'Expand form' : 'Collapse form'}
        >
          {isFormCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          title="Delete node"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="mb-4 pr-16">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {data.resource.kind}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.resource.metadata?.name || 'Unnamed'}
        </p>
      </div>
      
      {!isFormCollapsed && <DynamicK8sForm nodeData={data} />}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800"
      />
    </div>
  );
});

ResourceNode.displayName = 'ResourceNode';

export default ResourceNode;