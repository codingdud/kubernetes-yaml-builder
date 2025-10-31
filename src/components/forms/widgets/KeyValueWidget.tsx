import React, { useState, useEffect, useCallback } from 'react';
import { type WidgetProps } from '@rjsf/utils';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';
import KeyValuePair from './KeyValuePair';

const KeyValueWidget: React.FC<WidgetProps> = ({ value = {}, onChange, id, formContext }) => {
  // Convert the value object to array of pairs, ensuring flat structure
  const valueToPairs = useCallback((obj: Record<string, any>) => {
    if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
      return [];
    }
    
    return Object.entries(obj)
      .filter(([, val]) => typeof val !== 'object')
      .map(([key, val]) => ({
        key,
        value: String(val || '')
      }));
  }, []);

  const [pairs, setPairs] = useState<Array<{ key: string; value: string }>>(valueToPairs(value));

  // Update pairs when value prop changes
  useEffect(() => {
    setPairs(valueToPairs(value));
  }, [value, valueToPairs]);

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
    // Create a flat key-value object
    const newValue = newPairs.reduce((acc, pair) => {
      const key = pair.key.trim();
      // Only include pairs where key is not empty
      if (key) {
        acc[key] = pair.value;
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