import React, { useState } from 'react';
import { type WidgetProps } from '@rjsf/utils';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';
import KeyValuePair from './KeyValuePair';
import { Handle, Position } from '@xyflow/react';

const KeyValueWidget: React.FC<WidgetProps> = ({ value = {}, onChange, id, formContext }) => {
  const [pairs, setPairs] = useState<Array<{ key: string; value: string }>>(
    Object.entries(value).map(([key, val]) => ({ key, value: val as string }))
  );

  const addPair = () => {
    const newPairs = [...pairs, { key: '', value: '' }];
    setPairs(newPairs);
  };

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    setPairs(newPairs);
    updateValue(newPairs);
  };

  const updatePair = (index: number, field: 'key' | 'value', newValue: string) => {
    const newPairs = pairs.map((pair, i) => 
      i === index ? { ...pair, [field]: newValue } : pair
    );
    setPairs(newPairs);
    updateValue(newPairs);
  };

  const updateValue = (newPairs: Array<{ key: string; value: string }>) => {
    const newValue = newPairs.reduce((acc, pair) => {
      if (pair.key.trim()) {
        acc[pair.key] = pair.value;
      }
      return acc;
    }, {} as Record<string, string>);
    onChange(newValue);
  };

  return (
    <div className="space-y-2 relative">
      {pairs.map((pair, index) => (
        <KeyValuePair
          key={index}
          index={index}
          pair={pair}
          onUpdate={updatePair}
          onRemove={() => removePair(index)}
          formContext={formContext}
          widgetId={id}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addPair}
        className="w-full flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Pair
      </Button>
      {formContext?.nodeId && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id={`${formContext.nodeId}_${id}_widget_target`}
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !pointer-events-auto"
            style={{ left: '-6px', top: '20px', pointerEvents: 'auto' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id={`${formContext.nodeId}_${id}_widget_source`}
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !pointer-events-auto"
            style={{ right: '-6px', top: '20px', pointerEvents: 'auto' }}
          />
        </>
      )}
    </div>
  );
};

export default KeyValueWidget;