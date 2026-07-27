import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, MiniMap, Controls, Background, type Connection, type Edge, ReactFlowProvider, useReactFlow, type Node, type NodeProps, ConnectionMode, type ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type K8sNode } from '../../types/reactFlow';
import Sidebar from './Sidebar';
import resourceRegistry from '../../config/resourceRegistry';
import type { HelmTemplateNode } from '../../data/helmStarterTemplates';
import { useDnD } from './DnDContext';
import DataEdge from './edges/DataEdge';
import { Toolbar } from '../ui/Toolbar';
import DocsModal from '../docsmodal/DocsModal';
import ToolsModal from '../toolmodal/ToolsModal';
import VerifyPanel from '../verify/VerifyPanel';
import * as yaml from 'js-yaml';
import { useCommands } from '../../hooks/useCommands';
import { type Command } from '../../types/command';
import { Download, Upload, LucideWrench, LucideBookOpen, ShieldCheck, Undo2, Redo2 } from 'lucide-react';
import { useFlowHistory, type FlowSnapshot } from '../../hooks/useFlowHistory';
import { generateValuesYaml } from '../../utils/helmGenerator';
import { HelmSyncContext } from '../../contexts/HelmSyncContext';
import { DiagramActionsContext, type DiagramActions } from '../../ai/state/DiagramActionsContext';
import { validateNodes } from '../../utils/kubeValidate';
import type { DiagramSnapshot } from '../../ai/protocol/types';
import { AIChatSidebar } from '../ai/AIChatSidebar';

function deepMergeObjects(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
        target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMergeObjects(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const FlowEditorInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nextId, setNextId] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(360);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = dragStartX.current - e.clientX;
      setSidebarWidth(Math.max(200, Math.min(700, dragStartWidth.current + dx)));
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Compute generated values.yaml from non-Helm nodes
  const resourceNodes = useMemo(
    () => (nodes as K8sNode[]).filter(
      n => !['HelmChart', 'HelmValues'].includes(String((n.data.resource as any)?.kind))
    ),
    [nodes]
  );

  const generatedValues = useMemo(
    () => resourceNodes.length > 0 ? generateValuesYaml(resourceNodes) : '',
    [resourceNodes]
  );

  // Auto-sync: when resource nodes change and HelmValues has autoSync=true, update its content
  useEffect(() => {
    if (!generatedValues) return;
    setNodes(nds => {
      const hvIdx = nds.findIndex(n => (n as K8sNode).data.resource?.kind === 'HelmValues');
      if (hvIdx === -1) return nds;
      const hv = nds[hvIdx] as K8sNode;
      if (!(hv.data.resource as any)?.autoSync) return nds;
      if ((hv.data.resource as any)?.content === generatedValues) return nds;
      const updated = [...nds];
      updated[hvIdx] = {
        ...hv,
        data: { ...hv.data, resource: { ...(hv.data.resource as any), content: generatedValues } },
      };
      return updated;
    });
  }, [generatedValues, setNodes]);

  // One-shot sync: copy generatedValues into the HelmValues node, keep autoSync=false
  const setNodeAutoSync = useCallback((_nodeId: string, _autoSync: boolean) => {
    setNodes(nds => {
      const hvIdx = nds.findIndex(n => (n as K8sNode).data.resource?.kind === 'HelmValues');
      if (hvIdx === -1) return nds;
      const hv = nds[hvIdx] as K8sNode;
      if ((hv.data.resource as any)?.content === generatedValues) return nds;
      const updated = [...nds];
      updated[hvIdx] = {
        ...hv,
        data: { ...hv.data, resource: { ...(hv.data.resource as any), autoSync: false, content: generatedValues } },
      };
      return updated;
    });
  }, [setNodes, generatedValues]);

  const onDragHandleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    e.preventDefault();
  }, [sidebarWidth]);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { screenToFlowPosition, setViewport, getNodes } = useReactFlow();
  const { type, setType } = useDnD();

  const handleRemoveNodes = useCallback((nodeIds: string[]) => {
    setNodes(currentNodes => currentNodes.filter(node => !nodeIds.includes(node.id)));
    setNotification({message: `Removed ${nodeIds.length} resources`, type: 'success'});
    setTimeout(() => setNotification(null), 3000);
  }, [setNodes]);

  const handleRestoreSnapshot = useCallback((snapshot: FlowSnapshot) => {
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    setViewport(snapshot.viewport);
    if (snapshot.nodes.length > 0) {
      const maxId = Math.max(...snapshot.nodes.map(n => parseInt(n.id.replace(/\D/g, '') || '0')));
      setNextId(maxId + 1);
    }
  }, [setNodes, setEdges, setViewport]);

  const {
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    checkpoints,
    saveCheckpoint,
    restoreCheckpoint,
    lastSavedAt,
  } = useFlowHistory(rfInstance, handleRestoreSnapshot);

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

  const handleYamlImport = useCallback((yamlString: string): string[] => {
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
              style: { width: 384 },
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
      
      return newNodes.map(node => node.id);
    } catch (error) {
      console.error('Error importing YAML:', error);
      setNotification({message: 'Error: Invalid YAML format', type: 'error'});
      setTimeout(() => setNotification(null), 3000);
      return [];
    }
  }, [nextId, setNodes, setNextId]);

  const commands: Command[] = useMemo(() => [
    {
      id: 'back',
      label: 'Back',
      icon: <Undo2 className="h-4 w-4" />,
      shortcut: ['z'],
      canExecute: () => canUndo,
      execute: undo,
    },
    {
      id: 'forward',
      label: 'Forward',
      icon: <Redo2 className="h-4 w-4" />,
      shortcut: ['y'],
      canExecute: () => canRedo,
      execute: redo,
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
    {
      id: 'verify',
      label: 'Verify Resources',
      icon: <ShieldCheck className="h-4 w-4" />,
      shortcut: ['v'],
      execute: () => setIsVerifyOpen(o => !o),
    },
  ], [rfInstance, handleImport, canUndo, canRedo, undo, redo, setIsToolsOpen, setIsDocsOpen, setIsVerifyOpen]);

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

  const wrappedOnNodesChange = useCallback((changes: Parameters<typeof onNodesChange>[0]) => {
    if (rfInstance) pushSnapshot(rfInstance.toObject() as FlowSnapshot);
    onNodesChange(changes);
  }, [onNodesChange, rfInstance, pushSnapshot]);

  const wrappedOnEdgesChange = useCallback((changes: Parameters<typeof onEdgesChange>[0]) => {
    if (rfInstance) pushSnapshot(rfInstance.toObject() as FlowSnapshot);
    onEdgesChange(changes);
  }, [onEdgesChange, rfInstance, pushSnapshot]);

  const onConnect = useCallback((connection: Connection) => {
    const allNodes = getNodes();
    const sourceNode = allNodes.find(n => n.id === connection.source) as K8sNode | undefined;
    const targetNode = allNodes.find(n => n.id === connection.target) as K8sNode | undefined;
    const sourceLabel = sourceNode?.data?.resource?.kind || connection.source;
    const targetLabel = targetNode?.data?.resource?.kind || connection.target;

    const newEdge = {
      ...connection,
      id: `${connection.source}-${connection.target}-${Date.now()}`,
      type: 'dataEdge' as const,
      animated: true,
      data: {
        label: `${sourceLabel} → ${targetLabel}`
      }
    } as const;
    setEdges((eds) => addEdge(newEdge as Edge, eds));
  }, [setEdges, getNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const addNode = useCallback(
    (kind: keyof typeof resourceRegistry, position?: { x: number; y: number }, overrides?: Record<string, unknown>): string => {
      const { schema, uiSchema, defaultResource } = resourceRegistry[kind];
      const nodeId = `${nextId}`;
      const resource = overrides
        ? deepMergeObjects({ ...defaultResource }, overrides)
        : { ...defaultResource };
      const newNode: K8sNode = {
        id: nodeId,
        type: kind.toLowerCase(),
        position: position || { x: Math.random() * 500, y: Math.random() * 500 },
        data: {
          resource,
          schema: schema as Record<string, unknown>,
          uiSchema
        },
        style: { width: 384 },
      };
      setNodes((nds) => [...nds, newNode]);
      setNextId(nextId + 1);
      return nodeId;
    },
    [nextId, setNodes, setNextId]
  );

  const addNodesFromTemplate = useCallback(
    (items: HelmTemplateNode[]) => {
      const newNodes = items.map((item, i) => {
        const { schema, uiSchema } = resourceRegistry[item.kind as keyof typeof resourceRegistry];
        return {
          id: `${nextId + i}`,
          type: item.kind.toLowerCase(),
          position: item.position,
          data: {
            resource: item.resource,
            schema: schema as Record<string, unknown>,
            uiSchema,
          },
          style: { width: 384 },
        } as K8sNode;
      });
      setNodes((nds) => [...nds, ...newNodes]);
      setNextId((id) => id + items.length);
    },
    [nextId, setNodes, setNextId]
  );

  const updateNodeResource = useCallback(
    (nodeId: string, patch: Record<string, unknown>) => {
      setNodes(nds =>
        nds.map(n =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...(n as K8sNode).data,
                  resource: deepMergeObjects((n as K8sNode).data.resource as Record<string, unknown>, patch),
                },
              }
            : n
        )
      );
    },
    [setNodes]
  );

  const connectNodesAPI = useCallback(
    (sourceId: string, targetId: string): string => {
      const edgeId = `${sourceId}-${targetId}-${Date.now()}`;
      const allNodes = getNodes();
      const sourceNode = allNodes.find(n => n.id === sourceId) as K8sNode | undefined;
      const targetNode = allNodes.find(n => n.id === targetId) as K8sNode | undefined;
      const sourceLabel = sourceNode?.data?.resource?.kind || sourceId;
      const targetLabel = targetNode?.data?.resource?.kind || targetId;
      const newEdge = {
        id: edgeId,
        source: sourceId,
        target: targetId,
        type: 'dataEdge' as const,
        animated: true,
        data: { label: `${sourceLabel} → ${targetLabel}` },
      };
      setEdges(eds => addEdge(newEdge as Edge, eds));
      return edgeId;
    },
    [setEdges, getNodes]
  );

  const getSnapshot = useCallback((): DiagramSnapshot => ({
    nodes: (nodes as K8sNode[]).map(n => ({
      id: n.id,
      kind: String(n.data.resource?.kind ?? n.type ?? 'Unknown'),
      name: String((n.data.resource as any)?.metadata?.name ?? n.id),
      namespace: (n.data.resource as any)?.metadata?.namespace,
      resource: (n.data.resource ?? {}) as Record<string, unknown>,
    })),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: String((e.data as any)?.label ?? ''),
    })),
  }), [nodes, edges]);

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

  const generateYAML = useCallback(() => {
    const helmKinds = new Set(['HelmChart', 'HelmValues']);
    const k8sNodes = nodes.filter((n) => !helmKinds.has(String((n as K8sNode).data.resource?.kind)));
    if (k8sNodes.length === 0) return '';
    return k8sNodes.map((node) => yaml.dump((node as K8sNode).data.resource, { indent: 2 })).join('---\n');
  }, [nodes]);

  const diagramActions = useMemo<DiagramActions>(() => ({
    addNode: (kind, overrides, position) => addNode(kind, position, overrides),
    removeNodes: handleRemoveNodes,
    updateNode: updateNodeResource,
    connectNodes: connectNodesAPI,
    getSnapshot,
    generateYAML,
    importYAML: handleYamlImport,
    validateDiagram: () => validateNodes(nodes as Node[]),
  }), [addNode, handleRemoveNodes, updateNodeResource, connectNodesAPI, getSnapshot, generateYAML, handleYamlImport, nodes]);

  return (
    <DiagramActionsContext.Provider value={diagramActions}>
    <HelmSyncContext.Provider value={{ generatedValues, setNodeAutoSync }}>
    <div className="flex h-full">
      <AIChatSidebar
        onCollapseChange={setIsLeftPanelCollapsed}
        width={leftPanelWidth}
        onWidthChange={setLeftPanelWidth}
      />
      <div
        style={{
          width: (() => {
            const leftW = isLeftPanelCollapsed ? 0 : leftPanelWidth + 4;
            const rightW = isSidebarCollapsed ? 0 : sidebarWidth + 4;
            if (leftW === 0 && rightW === 0) return '100%';
            return `calc(100% - ${leftW + rightW}px)`;
          })()
        }}
        className="h-full flex-shrink-0"
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={wrappedOnNodesChange}
          onEdgesChange={wrappedOnEdgesChange}
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
          onSelectionChange={({ nodes: sel }) => setSelectedNodes(sel)}
          fitView
        >
          <Toolbar
            commands={commands}
            executingCommand={executingCommand}
            executeCommand={executeCommand}
            onAddNode={(kind) => addNode(kind as keyof typeof resourceRegistry)}
            onDragStart={onDragStartFromToolbar}
            lastSavedAt={lastSavedAt}
            checkpoints={checkpoints}
            onRestoreCheckpoint={restoreCheckpoint}
            onSaveCheckpoint={() => saveCheckpoint('Manual save')}
          />
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      {!isSidebarCollapsed && (
        <div
          onMouseDown={onDragHandleMouseDown}
          className="w-1 flex-shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize transition-colors"
        />
      )}
      <Sidebar
        sidebarWidth={sidebarWidth}
        onAddNode={addNode}
        yaml={generateYAML()}
        nodes={nodes}
        onCollapseChange={setIsSidebarCollapsed}
        onImportYaml={handleYamlImport}
        onRemoveNodes={handleRemoveNodes}
        onAddTemplate={addNodesFromTemplate}
        onNotification={(message, type = 'error') => {
          setNotification({message, type});
          setTimeout(() => setNotification(null), 3000);
        }}
        diagramNodes={nodes.map(node => {
          const k8sNode = node as K8sNode;
          const metadata = k8sNode.data.resource?.metadata as { name?: string } | undefined;
          return {
            id: node.id,
            data: {
              label: metadata?.name || `${node.type}-${node.id}`,
              formData: k8sNode.data.resource || {},
              resourceType: String(k8sNode.data.resource?.kind || node.type || 'Unknown')
            }
          };
        })}
      />
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <ToolsModal isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
      <VerifyPanel isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} nodes={nodes} selectedNodes={selectedNodes} />
      {notification && (
        <div className={`fixed top-20 right-4 z-50 text-white px-4 py-2 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
    </HelmSyncContext.Provider>
    </DiagramActionsContext.Provider>
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