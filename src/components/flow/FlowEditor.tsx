import React, { useCallback, useState, useMemo } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, MiniMap, Controls, Background, type Connection, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type K8sNode } from '@/types/reactFlow';
import { Button } from '@/components/ui/button';
import CodePreview from '@/components/ui/CodePreview';
import resourceRegistry from '@/config/resourceRegistry';
import * as yaml from 'js-yaml';

const FlowEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<K8sNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nextId, setNextId] = useState(1);

  const nodeTypes = useMemo(() => 
    Object.fromEntries(
      Object.entries(resourceRegistry).map(([kind, { NodeComponent }]) => [kind.toLowerCase(), NodeComponent])
    ), []
  );

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addNode = (kind: keyof typeof resourceRegistry) => {
    const { schema, uiSchema, defaultResource } = resourceRegistry[kind];
    const newNode: K8sNode = {
      id: `${nextId}`,
      type: kind.toLowerCase(),
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { resource: { ...defaultResource }, schema: schema as any, uiSchema },
    };
    setNodes((nds) => [...nds, newNode]);
    setNextId(nextId + 1);
  };

  const generateYAML = () => {
    if (nodes.length === 0) return '';
    const yamlDocs = nodes.map((node) => yaml.dump((node as K8sNode).data.resource, { indent: 2 }));
    return yamlDocs.join('---\n');
  };

  return (
    <div className="flex h-screen">
      <div className="w-3/4 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <div className="w-1/4 p-4 bg-gray-100 overflow-auto">
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.keys(resourceRegistry).map((kind) => (
            <Button 
              key={kind} 
              onClick={() => addNode(kind as keyof typeof resourceRegistry)} 
              className="text-xs px-2 py-1"
              size="sm"
            >
              Add {kind}
            </Button>
          ))}
        </div>
        <CodePreview yaml={generateYAML()} />
      </div>
    </div>
  );
};

export default FlowEditor;