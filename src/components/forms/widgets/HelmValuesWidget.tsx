import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { RefreshCw, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import * as yaml from 'js-yaml';
import { useHelmSync } from '../../../contexts/HelmSyncContext';

function collectLeafPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== 'object' || Array.isArray(obj)) return prefix ? [prefix] : [];
  const paths: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length > 0) {
      paths.push(...collectLeafPaths(v, path));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

function groupByTopKey(paths: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const p of paths) {
    const top = p.split('.')[0];
    if (!groups[top]) groups[top] = [];
    groups[top].push(p);
  }
  return groups;
}

const SKIP_KEYS = new Set(['nameOverride', 'fullnameOverride']);
// Overhead: ResourceNode p-3 padding (24px) + toolbar row (28px) + spacing (16px)
const BASE_OVERHEAD = 68;

const HelmValuesWidget: React.FC<WidgetProps> = ({ value, onChange, id, formContext }) => {
  const { generatedValues, setNodeAutoSync } = useHelmSync();
  const nodeId = (formContext as any)?.nodeId as string | undefined;
  const [copied, setCopied] = useState<string | null>(null);
  const [refOpen, setRefOpen] = useState(true);
  const [textareaHeight, setTextareaHeight] = useState(240);
  const containerRef = useRef<HTMLDivElement>(null);
  const refPanelRef = useRef<HTMLDivElement>(null);

  // Dynamically size the textarea to fill the node's available height
  useEffect(() => {
    if (!containerRef.current) return;

    // Walk up the DOM to find the scrollable ancestor (ResourceNode's form body)
    let el: HTMLElement | null = containerRef.current.parentElement;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') break;
      el = el.parentElement;
    }
    if (!el) return;
    const scrollable = el;

    const recalc = () => {
      const available = scrollable.clientHeight;
      const refH = refPanelRef.current ? refPanelRef.current.offsetHeight + 8 : 0;
      setTextareaHeight(Math.max(120, available - BASE_OVERHEAD - refH));
    };

    const obs = new ResizeObserver(recalc);
    obs.observe(scrollable);
    recalc();
    return () => obs.disconnect();
  }, [refOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleRegenerate = () => {
    if (nodeId) setNodeAutoSync(nodeId, true);
  };

  const leafPaths = useMemo(() => {
    try {
      const parsed = yaml.load(value as string || '');
      if (parsed && typeof parsed === 'object') return collectLeafPaths(parsed);
    } catch { /* invalid yaml while typing */ }
    return [];
  }, [value]);

  const grouped = useMemo(() => groupByTopKey(leafPaths), [leafPaths]);
  const refGroups = Object.entries(grouped).filter(([k]) => !SKIP_KEYS.has(k));

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(`{{ .Values.${path} }}`);
    setCopied(path);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center justify-end flex-shrink-0">
        <button
          type="button"
          onClick={handleRegenerate}
          title="Regenerate values.yaml from current canvas nodes"
          className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Sync from canvas
        </button>
      </div>

      {/* Content textarea — grows to fill available node height */}
      <textarea
        id={id}
        value={value as string || ''}
        onChange={handleTextChange}
        style={{ height: textareaHeight }}
        spellCheck={false}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none scrollbar-hide flex-shrink-0"
        placeholder={"# values.yaml\n# Click 'Sync from canvas' to generate from nodes\n# or write your own overrides here"}
      />

      {/* Values reference panel */}
      {refGroups.length > 0 && (
        <div ref={refPanelRef} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex-shrink-0">
          <button
            type="button"
            onClick={() => setRefOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span>Variables reference — click to copy</span>
            {refOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {refOpen && (
            <div className="max-h-52 overflow-y-auto scrollbar-hide divide-y divide-gray-100 dark:divide-gray-700/50">
              {refGroups.map(([group, paths]) => (
                <div key={group} className="px-3 py-1.5">
                  <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {paths.map(path => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => copyPath(path)}
                        title={`Copy {{ .Values.${path} }}`}
                        className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-colors text-left"
                      >
                        <code className="text-[10px] font-mono text-blue-700 dark:text-blue-400 truncate">
                          {`{{ .Values.${path} }}`}
                        </code>
                        {copied === path
                          ? <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          : <Copy className="h-3 w-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                        }
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HelmValuesWidget;
