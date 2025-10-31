import React, { useCallback, useState, useMemo, useRef } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, MiniMap, Controls, Background, type Connection, type Edge, ReactFlowProvider, useReactFlow, type Node, type NodeProps, ConnectionMode, type ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type K8sNode } from '../../types/reactFlow';
import Sidebar from './Sidebar';
import resourceRegistry from '../../config/resourceRegistry';
import { useDnD } from './DnDContext';
import DataEdge from './edges/DataEdge';
import { Toolbar } from '../ui/Toolbar';
import DocsModal from '../docsmodal/DocsModal';
import ToolsModal from '../toolmodal/ToolsModal';
import * as yaml from 'js-yaml';
import { useCommands } from '../../hooks/useCommands';
import { type Command } from '../../types/command';
import { Save, RotateCcw, Download, Upload, LucideWrench, LucideBookOpen } from 'lucide-react';

const FlowEditorInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nextId, setNextId] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const { screenToFlowPosition, setViewport } = useReactFlow();
  const { type, setType } = useDnD();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const handleImport = useCallback((jsonString: string) => {
    try {
      const flow = JSON.parse(jsonString);
      if (flow.nodes && flow.edges && flow.viewport) {
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setViewport(flow.viewport);
        
        const maxId = Math.max(...flow.nodes.map((n: Node) => parseInt(n.id.replace(/\D/g, '') || '0')));
        setNextId(maxId + 1);
      }
    } catch (error) {
      console.error('Error importing flow:', error);
      alert('Invalid flow file format');
    }
  }, [setNodes, setEdges, setViewport, setNextId]);

  const handleYamlImport = useCallback((yamlString: string) => {
    try {
      const docs = yaml.loadAll(yamlString).filter(d => d) as any[];
      const newNodes: K8sNode[] = [];
      let currentNextId = nextId;

      docs.forEach((doc, index) => {
        if (doc && doc.kind && doc.metadata) {
          const kind = doc.kind as keyof typeof resourceRegistry;
          if (resourceRegistry[kind]) {
            const { schema, uiSchema, defaultResource } = resourceRegistry[kind];
            const newNode: K8sNode = {
              id: `${currentNextId++}`,
              type: kind.toLowerCase(),
              position: { x: 250 * index, y: 100 + Math.random() * 100 },
              data: {
                resource: { ...defaultResource, ...doc },
                schema: schema as Record<string, unknown>,
                uiSchema,
              },
            };
            newNodes.push(newNode);
          }
        }
      });

      setNodes((existingNodes) => [...existingNodes, ...newNodes]);
      setNextId(currentNextId);
      
      if (newNodes.length === 0) {
        setNotification({message: 'No valid Kubernetes resources found in YAML', type: 'error'});
      } else {
        setNotification({message: `Successfully imported ${newNodes.length} resources from YAML`, type: 'success'});
      }
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error importing YAML:', error);
      setNotification({message: 'Error: Invalid YAML format', type: 'error'});
      setTimeout(() => setNotification(null), 3000);
    }
  }, [nextId, setNodes, setNextId]);

  const commands: Command[] = useMemo(() => [
    {
      id: 'save',
      label: 'Save Flow',
      icon: <Save className="h-4 w-4" />,
      shortcut: ['s'],
      execute: async () => {
        if (rfInstance) {
          const flow = rfInstance.toObject();
          localStorage.setItem('kubernetes-yaml-flow', JSON.stringify({ ...flow, lastSaved: new Date().toISOString() }));
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    },
    {
      id: 'restore',
      label: 'Restore Flow',
      icon: <RotateCcw className="h-4 w-4" />,
      shortcut: ['r'],
      execute: async () => {
        const stored = localStorage.getItem('kubernetes-yaml-flow');
        if (stored) handleImport(stored);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    },
    {
      id: 'export',
      label: 'Export Flow',
      icon: <Download className="h-4 w-4" />,
      shortcut: ['e'],
      execute: () => {
        if (rfInstance) {
          const flow = rfInstance.toObject();
          const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `kubernetes-flow-${new Date().toISOString().slice(0, 10)}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
    },
    {
      id: 'import',
      label: 'Import Flow',
      icon: <Upload className="h-4 w-4" />,
      shortcut: ['i'],
      execute: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const content = e.target?.result;
              if (typeof content === 'string') handleImport(content);
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    },
    {
      id: 'toggleTools',
      label: 'Toggle Tools',
      icon: <LucideWrench className="h-4 w-4" />,
      shortcut: ['t'],
      execute: () => setIsToolsOpen(o => !o),
    },
    {
      id: 'toggleDocs',
      label: 'Toggle Docs',
      icon: <LucideBookOpen className="h-4 w-4" />,
      shortcut: ['d'],
      execute: () => setIsDocsOpen(o => !o),
    },
  ], [rfInstance, handleImport, setIsToolsOpen, setIsDocsOpen]);

  const { executeCommand, executingCommand } = useCommands(commands);

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

  const onDragStartFromToolbar = (event: React.DragEvent, kind: string) => {
    event.dataTransfer.setData('application/reactflow', kind);
    setType(kind as keyof typeof resourceRegistry);
  };

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
          connectionMode={ConnectionMode.Loose}
          connectionRadius={50}
          minZoom={0.1}
          maxZoom={4}
          zoomOnScroll={true}
          zoomOnPinch={true}
          onInit={setRfInstance}
          fitView
        >
          <Toolbar
            commands={commands}
            executingCommand={executingCommand}
            executeCommand={executeCommand}
            onAddNode={(kind) => addNode(kind as keyof typeof resourceRegistry)}
            onDragStart={onDragStartFromToolbar}
          />
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar 
        onAddNode={addNode} 
        yaml={generateYAML()} 
        onCollapseChange={setIsSidebarCollapsed}
        onImportYaml={handleYamlImport}
        onNotification={(message, type = 'error') => {
          setNotification({message, type});
          setTimeout(() => setNotification(null), 3000);
        }}
      />
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <ToolsModal isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
      {notification && (
        <div className={`fixed top-20 right-4 z-50 text-white px-4 py-2 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}
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