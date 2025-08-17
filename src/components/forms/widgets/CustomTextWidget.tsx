import { type WidgetProps } from '@rjsf/utils';
import { Handle, Position, useReactFlow, useStore } from '@xyflow/react';
import { useEffect, useRef, useCallback } from 'react';

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
    formContext
  } = props;
  const hasError = rawErrors && rawErrors.length > 0;
  const { getHandleConnections, updateNodeData } = useReactFlow();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get connected source value
  const sourceValue = useStore((state) => {
    if (!formContext?.nodeId) return null;
    const connections = getHandleConnections({
      nodeId: formContext.nodeId,
      id: `${formContext.nodeId}_${id}_target`,
      type: 'target'
    });
    if (connections.length > 0) {
      const connection = connections[0];
      const sourceNode = state.nodeLookup.get(connection.source);
      const sourceHandleId = connection.sourceHandle;
      
      // Get value from the specific source handle
      if (sourceHandleId && sourceNode?.data) {
        const fieldKey = sourceHandleId.replace(`${connection.source}_`, '').replace('_source', '');
        return (sourceNode.data as any)[fieldKey] || (sourceNode.data as any).resource?.metadata?.name;
      }
    }
    return null;
  });
  
  // Update field when source changes
  useEffect(() => {
    if (sourceValue && sourceValue !== value) {
      onChange(sourceValue);
    }
  }, [sourceValue]);
  
  // Debounced updateNodeData to prevent input interference
  const debouncedUpdateNodeData = useCallback((newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (formContext?.nodeId && newValue) {
        updateNodeData(formContext.nodeId, { [id]: newValue });
      }
    }, 300);
  }, [formContext?.nodeId, id, updateNodeData]);
  
  // Emit value for other fields with debouncing
  useEffect(() => {
    if (value) {
      debouncedUpdateNodeData(value);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, debouncedUpdateNodeData]);
  




  return (
    <div className="w-full relative">
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
      {formContext?.nodeId && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id={`${formContext.nodeId}_${id}_target`}
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !pointer-events-auto"
            style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id={`${formContext.nodeId}_${id}_source`}
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !pointer-events-auto"
            style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto' }}
          />
        </>
      )}
      {hasError && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
          {rawErrors.join(', ')}
        </div>
      )}
    </div>
  );
};

export default CustomTextWidget;