import React, { useCallback, useState, useMemo, useRef } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, MiniMap, Controls, Background, type Connection, type Edge, ReactFlowProvider, useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type K8sNode } from '../../types/reactFlow';
import Sidebar from './Sidebar';
import resourceRegistry from '../../config/resourceRegistry';
import { useDnD } from './DnDContext';
import DataEdge from './edges/DataEdge';
import * as yaml from 'js-yaml';



const FlowEditorInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nextId, setNextId] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const { type } = useDnD();

  const nodeTypes = useMemo(() => 
    Object.fromEntries(
      Object.entries(resourceRegistry).map(([kind, { NodeComponent }]) => [
        kind.toLowerCase(), 
        (props: NodeProps) => {
          const k8sProps = {
            ...props,
            data: props.data as K8sNode['data']
          };
          return <NodeComponent {...k8sProps} id={props.id} />;
        }
      ])
    ), []
  );

  const edgeTypes = useMemo(() => ({
    dataEdge: DataEdge
  }), []);

  const onConnect = useCallback((connection: Connection) => {
    // Extract field names from handle IDs
    const sourceField = connection.sourceHandle?.replace(`${connection.source}_`, '').replace('_source', '') || 'source';
    const targetField = connection.targetHandle?.replace(`${connection.target}_`, '').replace('_target', '') || 'target';
    
    const newEdge = {
      ...connection,
      id: `${connection.source}-${connection.target}-${Date.now()}`,
      type: 'dataEdge' as const,
      animated: true,
      data: {
        label: `${sourceField} → ${targetField}`
      }
    } as const;
    setEdges((eds) => addEdge(newEdge as Edge, eds));
  }, [setEdges]);



  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const addNode = useCallback(
    (kind: keyof typeof resourceRegistry, position?: { x: number; y: number }) => {
      const { schema, uiSchema, defaultResource } = resourceRegistry[kind];
      const newNode: K8sNode = {
        id: `${nextId}`,
        type: kind.toLowerCase(),
        position: position || { x: Math.random() * 500, y: Math.random() * 500 },
        data: { 
          resource: { ...defaultResource }, 
          schema: schema as Record<string, unknown>, 
          uiSchema
        }
      };
      setNodes((nds) => [...nds, newNode]);
      setNextId(nextId + 1);
    },
    [nextId, setNodes, setNextId]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type as keyof typeof resourceRegistry, position);
    },
    [screenToFlowPosition, type, addNode]
  );

  const generateYAML = () => {
    if (nodes.length === 0) return '';
    const yamlDocs = nodes.map((node) => {
      const k8sNode = node as K8sNode;
      return yaml.dump(k8sNode.data.resource, { indent: 2 });
    });
    return yamlDocs.join('---\n');
  };

  return (
    <div className="flex h-full">
      <div 
        className={`${isSidebarCollapsed ? 'w-full' : 'w-3/4'} h-full transition-all duration-300`}
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
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

const FlowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
};

export default FlowEditor;