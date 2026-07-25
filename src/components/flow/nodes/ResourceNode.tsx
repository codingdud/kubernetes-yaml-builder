import React, { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow, useUpdateNodeInternals, NodeResizer } from '@xyflow/react';
import { X, ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';
import DynamicK8sForm from '../../forms/DynamicK8sForm';
import { type K8sNode } from '../../../types/reactFlow';

interface ResourceNodeProps {
  id: string;
  data: K8sNode['data'];
}

const ResourceNode: React.FC<ResourceNodeProps> = memo(({ id, data }) => {
  const { deleteElements, updateNode, getEdges, setEdges } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [hasStoredHeight, setHasStoredHeight] = useState(false);
  const savedHeightRef = useRef<number | undefined>(undefined);
  const savedEdgeHandlesRef = useRef<Map<string, { sourceHandle: string | null; targetHandle: string | null }>>(new Map());

  useEffect(() => {
    const t = setTimeout(() => updateNodeInternals(id), 80);
    return () => clearTimeout(t);
  }, [id, updateNodeInternals]);

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const handleToggleCollapse = useCallback(() => {
    const next = !isFormCollapsed;
    setIsFormCollapsed(next);

    const staticSourceId = `${id}_right_source`;
    const staticTargetId = `${id}_left_target`;
    const staticIds = new Set([staticSourceId, staticTargetId]);
    const nodeHandlePrefix = new RegExp(`^${id}_`);

    if (next) {
      updateNode(id, (n) => ({ ...n, style: { ...n.style, height: undefined } }));
      setHasStoredHeight(false);

      const saved = new Map<string, { sourceHandle: string | null; targetHandle: string | null }>();
      const updated = getEdges().map((edge) => {
        const srcForm = edge.source === id && edge.sourceHandle && nodeHandlePrefix.test(edge.sourceHandle) && !staticIds.has(edge.sourceHandle);
        const tgtForm = edge.target === id && edge.targetHandle && nodeHandlePrefix.test(edge.targetHandle) && !staticIds.has(edge.targetHandle);
        if (srcForm || tgtForm) {
          saved.set(edge.id, { sourceHandle: edge.sourceHandle ?? null, targetHandle: edge.targetHandle ?? null });
          return {
            ...edge,
            sourceHandle: srcForm ? staticSourceId : edge.sourceHandle,
            targetHandle: tgtForm ? staticTargetId : edge.targetHandle,
          };
        }
        return edge;
      });
      savedEdgeHandlesRef.current = saved;
      if (saved.size > 0) setEdges(updated);
    } else {
      if (savedHeightRef.current !== undefined) {
        const h = savedHeightRef.current;
        updateNode(id, (n) => ({ ...n, style: { ...n.style, height: h } }));
        setHasStoredHeight(true);
      }
      const saved = savedEdgeHandlesRef.current;
      if (saved.size > 0) {
        setEdges(getEdges().map((edge) => {
          const orig = saved.get(edge.id);
          return orig ? { ...edge, sourceHandle: orig.sourceHandle, targetHandle: orig.targetHandle } : edge;
        }));
        savedEdgeHandlesRef.current = new Map();
      }
    }
  }, [id, isFormCollapsed, updateNode, getEdges, setEdges]);

  const sourceHandles = useMemo(() => {
    const handles: { id: string; label: string; top: number }[] = [];
    const resource = data.resource as any;
    if (resource?.metadata?.name) {
      handles.push({ id: `${id}_metadata_name_source`, label: 'name', top: 80 });
    }
    if (resource?.data) {
      Object.keys(resource.data).forEach((key, index) => {
        handles.push({ id: `${id}_data_${key}_source`, label: `data.${key}`, top: 120 + index * 40 });
      });
    }
    return handles;
  }, [id, data.resource]);

  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg relative flex flex-col"
      style={{
        width: '100%',
        height: !isFormCollapsed && hasStoredHeight ? '100%' : 'auto',
        minWidth: '280px',
        minHeight: '80px',
      }}
    >
      <NodeResizer
        minWidth={280}
        minHeight={120}
        lineStyle={{ borderColor: '#93c5fd', borderWidth: 1 }}
        handleStyle={{ background: '#3b82f6', width: 8, height: 8, borderRadius: 2, border: '2px solid white' }}
        onResizeEnd={(_, params) => {
          savedHeightRef.current = params.height;
          setHasStoredHeight(true);
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
              {(data.resource as any)?.kind || 'Resource'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {(data.resource as any)?.metadata?.name || 'Unnamed'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={handleToggleCollapse}
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
      </div>

      {/* Static node-level handles */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}_right_source`}
        className="w-3! h-3! bg-green-500! border-2! border-white!"
        style={{ top: '32px', zIndex: 10 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}_left_target`}
        className="w-3! h-3! bg-blue-500! border-2! border-white!"
        style={{ top: '32px', zIndex: 10 }}
      />

      {/* Dynamic per-field source handles */}
      {sourceHandles.map((handle) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={handle.id}
          style={{ top: `${handle.top}px`, zIndex: 10 }}
          className="w-3! h-3! bg-green-500! border-2! border-white!"
        />
      ))}

      {/* Form body */}
      {!isFormCollapsed && (
        <div
          className={`p-3 overflow-y-auto scrollbar-hide nowheel ${hasStoredHeight ? 'flex-1 min-h-0' : 'max-h-[580px]'}`}
          onScroll={() => updateNodeInternals(id)}
        >
          <DynamicK8sForm nodeData={data} nodeId={id} />
        </div>
      )}
    </div>
  );
});

ResourceNode.displayName = 'ResourceNode';

export default ResourceNode;
