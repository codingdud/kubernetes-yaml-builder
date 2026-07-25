import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Button } from '../../ui/button';
import { X } from 'lucide-react';

interface KeyValuePairProps {
  index: number;
  pair: { key: string; value: string; error?: string };
  onUpdate: (index: number, field: 'key' | 'value', value: string) => void;
  onRemove: () => void;
  formContext?: any;
  widgetId?: string;
}

const KeyValuePair: React.FC<KeyValuePairProps> = ({ index, pair, onUpdate, onRemove, formContext, widgetId }) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Key"
            value={pair.key}
            onChange={(e) => onUpdate(index, 'key', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              pair.error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {pair.error && (
            <div className="absolute left-0 right-0 -bottom-5 text-xs text-red-500">
              {pair.error}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 relative">
        {formContext?.nodeId && widgetId !== undefined && (
          <>
            <Handle
              type="target"
              position={Position.Left}
              id={`${formContext.nodeId}_${widgetId}_${index}_value_target`}
              className="w-3! h-3! bg-blue-500! border-2! border-white! pointer-events-auto!"
              style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto', zIndex: 10 }}
            />
            <Handle
              type="source"
              position={Position.Right}
              id={`${formContext.nodeId}_${widgetId}_${index}_value_source`}
              className="w-3! h-3! bg-green-500! border-2! border-white! pointer-events-auto!"
              style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto', zIndex: 10 }}
            />
          </>
        )}
        <input
          type="text"
          placeholder="Value"
          value={pair.value}
          onChange={(e) => onUpdate(index, 'value', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            pair.error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default KeyValuePair;
