import { type WidgetProps } from '@rjsf/utils';
import { ChevronDown } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

const CustomSelectWidget = (props: WidgetProps) => {
  const {
    id,
    value,
    required,
    disabled,
    onChange,
    onBlur,
    onFocus,
    options,
    rawErrors,
    formContext
  } = props;
  const { enumOptions = [] } = options;
  const hasError = rawErrors && rawErrors.length > 0;

  return (
    <div className="w-full relative">
      <select
        id={id}
        value={value || ''}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur && onBlur(id, e.target.value)}
        onFocus={(e) => onFocus && onFocus(id, e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg appearance-none transition-all duration-200 ${
          hasError 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 pr-10`}
      >
        <option value="">Select an option...</option>
        {enumOptions.map(({ value: optionValue, label }) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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

export default CustomSelectWidget;