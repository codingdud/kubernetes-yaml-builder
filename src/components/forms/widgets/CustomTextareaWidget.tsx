import { type WidgetProps } from '@rjsf/utils';
import { Handle, Position } from '@xyflow/react';

const CustomTextareaWidget = (props: WidgetProps) => {
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
    options,
    rawErrors,
    formContext
  } = props;
  const hasError = rawErrors && rawErrors.length > 0;
  const rows = options?.rows || 3;

  return (
    <div className="w-full relative">
      <textarea
        id={id}
        value={value || ''}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur && onBlur(id, e.target.value)}
        onFocus={(e) => onFocus && onFocus(id, e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg resize-y transition-all duration-200 ${
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

export default CustomTextareaWidget;