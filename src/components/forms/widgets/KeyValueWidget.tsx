import React, { useState } from 'react';
import { type WidgetProps } from '@rjsf/utils';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const KeyValueWidget: React.FC<WidgetProps> = ({ value = {}, onChange }) => {
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
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Key"
            value={pair.key}
            onChange={(e) => updatePair(index, 'key', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Value"
            value={pair.value}
            onChange={(e) => updatePair(index, 'value', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => removePair(index)}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addPair}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Pair
      </Button>
    </div>
  );
};

export default KeyValueWidget;