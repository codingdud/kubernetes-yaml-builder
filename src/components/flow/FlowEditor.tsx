import React, { useCallback, useState, useMemo } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, MiniMap, Controls, Background, type Connection, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type K8sNode } from '@/types/reactFlow';
import Sidebar from './Sidebar';
import resourceRegistry from '@/config/resourceRegistry';
import * as yaml from 'js-yaml';

const FlowEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<K8sNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nextId, setNextId] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const nodeTypes = useMemo(() => 
    Object.fromEntries(
      Object.entries(resourceRegistry).map(([kind, { NodeComponent }]) => [
        kind.toLowerCase(), 
        (props: any) => <NodeComponent {...props} id={props.id} />
      ])
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
    <div className="flex h-full">
      <div className={`${isSidebarCollapsed ? 'w-full' : 'w-3/4'} h-full transition-all duration-300`}>
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
      <Sidebar 
        onAddNode={addNode} 
        yaml={generateYAML()} 
        onCollapseChange={setIsSidebarCollapsed}
      />
    </div>
  );
};

export default FlowEditor;