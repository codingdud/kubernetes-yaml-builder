import React, { useState } from 'react';
import { type WidgetProps } from '@rjsf/utils';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';
import KeyValuePair from './KeyValuePair';

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
    <div className="space-y-2">
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
    </div>
  );
};

export default KeyValueWidget;