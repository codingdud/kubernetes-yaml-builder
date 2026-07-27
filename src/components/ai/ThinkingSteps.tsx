import { useState, useEffect } from 'react';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';
import type { ThinkingStep } from '../../ai/protocol/types';

interface ThinkingStepsProps {
  steps: ThinkingStep[];
}

export function ThinkingSteps({ steps }: ThinkingStepsProps) {
  const isStreaming = steps.some(s => s.status === 'streaming');
  const [expanded, setExpanded] = useState(isStreaming);

  useEffect(() => {
    if (isStreaming) setExpanded(true);
  }, [isStreaming]);

  if (steps.length === 0) return null;

  const label = isStreaming
    ? 'Thinking...'
    : `View reasoning (${steps.length} step${steps.length !== 1 ? 's' : ''})`;

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
      >
        <Brain className={`h-3 w-3 ${isStreaming ? 'animate-pulse' : ''}`} />
        <span>{label}</span>
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {expanded && (
        <div className="mt-1 pl-4 border-l-2 border-purple-200 dark:border-purple-800 max-h-[200px] overflow-y-auto">
          {steps.map(step => (
            <div key={step.id} className="text-xs text-gray-500 dark:text-gray-400 italic whitespace-pre-wrap py-0.5">
              {step.content}
              {step.status === 'streaming' && (
                <span className="inline-block w-1.5 h-3 bg-purple-400 animate-pulse ml-0.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
