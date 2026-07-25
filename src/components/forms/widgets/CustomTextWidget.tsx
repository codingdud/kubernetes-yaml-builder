import { type WidgetProps } from '@rjsf/utils';
import { Handle, Position, useReactFlow, useStore } from '@xyflow/react';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Traverse an object by an underscore-separated path string such as
 * "metadata_name" or "spec_replicas".
 *
 * At each level the full remaining path is tried as a single key first
 * (handles real keys that contain underscores, e.g. "some_key"), then
 * the path is split at the first underscore and the function recurses.
 */
function resolveResourcePath(obj: any, path: string): any {
  if (obj == null || path === '') return obj;
  // Try the full remaining path as one key before splitting
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];
  const idx = path.indexOf('_');
  if (idx === -1) return undefined;
  const key = path.slice(0, idx);
  const rest = path.slice(idx + 1);
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return resolveResourcePath(obj[key], rest);
  }
  return undefined;
}

const CustomTextWidget = (props: WidgetProps) => {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    placeholder,
    onChange,
    onBlur,
    onFocus,
    rawErrors,
    formContext,
  } = props;

  const hasError = rawErrors && rawErrors.length > 0;
  const { updateNodeData } = useReactFlow();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derive stable identifiers used in both the selector and the JSX.
  const nodeId: string | undefined = formContext?.nodeId;
  const targetHandleId = nodeId ? `${nodeId}_${id}_target` : '';

  // Pure selector: reads directly from state.edges and state.nodeLookup.
  // No call to getHandleConnections() which internally calls store.getState()
  // and therefore bypasses the snapshot argument, risking tearing in React 18
  // concurrent mode (bug1 fix).
  const sourceValue = useStore((state) => {
    if (!nodeId) return null;

    // Find the edge whose targetHandle matches this widget's target handle.
    const edge = state.edges.find(
      (e) => e.target === nodeId && e.targetHandle === targetHandleId
    );
    if (!edge || !edge.sourceHandle) return null;

    const sourceNode = state.nodeLookup.get(edge.source);
    if (!sourceNode?.data) return null;

    // Derive fieldKey: strip "${sourceNodeId}_" prefix then "_source" suffix.
    // e.g. "node1_root_metadata_name_source" → "root_metadata_name"
    // e.g. "node1_metadata_name_source"      → "metadata_name"  (ResourceNode handle)
    const fieldKey = edge.sourceHandle
      .replace(`${edge.source}_`, '')
      .replace(/_source$/, '');

    // Direct lookup: works when the source node has published via updateNodeData
    // using the RJSF widget id as key (e.g. node.data["root_metadata_name"]).
    const directValue = (sourceNode.data as any)[fieldKey];
    if (directValue !== undefined && directValue !== null) return directValue;

    // Fallback: traverse the resource object by path (bug3 fix — the old
    // fallback always returned metadata.name regardless of the target field).
    // Works for both prefixed handles ("root_metadata_name" → resource.metadata.name)
    // and un-prefixed ResourceNode handles ("metadata_name" → same path).
    const resource = (sourceNode.data as any).resource;
    if (!resource) return null;

    const pathStr = fieldKey.startsWith('root_') ? fieldKey.slice(5) : fieldKey;
    const resolved = resolveResourcePath(resource, pathStr);
    return resolved !== undefined ? resolved : null;
  });

  // Push incoming source value into this field.
  // value and onChange are included in deps to avoid a stale closure that can
  // suppress valid updates or produce feedback loops (bug6 fix).
  useEffect(() => {
    if (sourceValue != null && sourceValue !== value) {
      onChange(sourceValue);
    }
  }, [sourceValue, value, onChange]);

  // Debounce-publish this field's value so connected target widgets can read it.
  // The falsy guard is removed: empty string is a valid cleared value and must
  // propagate to targets (bug5 fix).
  const publishValue = useCallback((newValue: string | undefined) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (nodeId) {
        updateNodeData(nodeId, { [id]: newValue !== undefined ? newValue : '' });
      }
    }, 300);
  }, [nodeId, id, updateNodeData]);

  // On mount: publish immediately (no debounce) so any already-connected
  // target nodes receive the initial value without a 300 ms delay (req4).
  useEffect(() => {
    if (nodeId) {
      updateNodeData(nodeId, { [id]: value !== undefined ? value : '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount with the captured initial values

  // On every value change: debounced publish to avoid flooding state during
  // rapid keystrokes (req5). The effect also clears the timeout on unmount or
  // when publishValue is recreated.
  useEffect(() => {
    publishValue(value);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, publishValue]);

  return (
    <div className="w-full relative">
      {nodeId && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id={`${nodeId}_${id}_target`}
            className="w-3! h-3! bg-blue-500! border-2! border-white! pointer-events-auto!"
            style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto', zIndex: 10 }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id={`${nodeId}_${id}_source`}
            className="w-3! h-3! bg-green-500! border-2! border-white! pointer-events-auto!"
            style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto', zIndex: 10 }}
          />
        </>
      )}
      <input
        id={id}
        type="text"
        value={value || ''}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur && onBlur(id, e.target.value)}
        onFocus={(e) => onFocus && onFocus(id, e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 ${
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2`}
      />
      {hasError && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
          {rawErrors.join(', ')}
        </div>
      )}
    </div>
  );
};

export default CustomTextWidget;
