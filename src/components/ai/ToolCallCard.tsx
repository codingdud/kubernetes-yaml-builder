import { useState } from 'react';
import { Check, X, Loader2, AlertTriangle, Plus, Trash2, Pencil, Link, FileCheck, FileOutput, FileInput, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import type { ToolCallRecord, PendingApproval } from '../../ai/protocol/types';

interface ToolCallCardProps {
  tool: ToolCallRecord;
  pendingApproval?: PendingApproval;
  onApproval?: (toolCallId: string, approved: boolean) => void;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  add_resource: <Plus className="h-3 w-3" />,
  remove_resource: <Trash2 className="h-3 w-3" />,
  update_resource: <Pencil className="h-3 w-3" />,
  connect_resources: <Link className="h-3 w-3" />,
  validate_resources: <FileCheck className="h-3 w-3" />,
  export_yaml: <FileOutput className="h-3 w-3" />,
  import_yaml: <FileInput className="h-3 w-3" />,
  get_diagram_state: <FileCheck className="h-3 w-3" />,
};

const TOOL_COLORS: Record<string, string> = {
  add_resource: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  remove_resource: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  update_resource: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  connect_resources: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  validate_resources: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  export_yaml: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  import_yaml: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  get_diagram_state: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export function ToolCallCard({ tool, pendingApproval, onApproval }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = TOOL_COLORS[tool.toolName] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  const icon = TOOL_ICONS[tool.toolName] || <FileCheck className="h-3 w-3" />;
  const hasDetails = tool.status === 'complete' || tool.status === 'error' || Object.keys(tool.args).length > 0;

  return (
    <div className="my-1.5 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
      {/* Header */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 ${colorClass} ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        {icon}
        <span className="font-medium">{formatToolName(tool.toolName)}</span>
        {hasDetails && (
          <span className="ml-1">
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </span>
        )}
        <span className="ml-auto">
          <StatusBadge status={tool.status} />
        </span>
      </div>

      {/* Approval UI */}
      {tool.status === 'awaiting_approval' && pendingApproval && onApproval && (
        <div className="px-2 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800">
          <p className="text-gray-700 dark:text-gray-300 mb-2">{pendingApproval.description}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onApproval(tool.id, true)}
              className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              <Check className="h-3 w-3" /> Approve
            </button>
            <button
              onClick={() => onApproval(tool.id, false)}
              className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
            >
              <X className="h-3 w-3" /> Reject
            </button>
          </div>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-1.5 bg-gray-50 dark:bg-gray-900/50 space-y-1">
          {Object.keys(tool.args).length > 0 && (
            <div>
              <span className="text-[10px] font-medium text-gray-500 uppercase">Args</span>
              <div className="mt-0.5 font-mono text-[10px] text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 rounded p-1.5 max-h-[80px] overflow-y-auto">
                {Object.entries(tool.args).map(([k, v]) => (
                  <div key={k}><span className="text-blue-600 dark:text-blue-400">{k}</span>: {formatValue(v)}</div>
                ))}
              </div>
            </div>
          )}
          {tool.status === 'complete' && tool.result != null ? (
            <ToolResult toolName={tool.toolName} result={tool.result} />
          ) : null}
          {tool.status === 'error' && tool.error && (
            <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded p-1.5">
              {tool.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToolResult({ toolName, result }: { toolName: string; result: unknown }) {
  const [copied, setCopied] = useState(false);
  const data = result as any;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (toolName === 'export_yaml' && data?.data?.yaml) {
    return (
      <div className="relative">
        <span className="text-[10px] font-medium text-gray-500 uppercase">YAML Output</span>
        <button
          onClick={() => handleCopy(data.data.yaml)}
          className="absolute top-0 right-0 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
        </button>
        <pre className="mt-0.5 font-mono text-[10px] text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 rounded p-1.5 max-h-[120px] overflow-y-auto whitespace-pre-wrap">
          {data.data.yaml}
        </pre>
      </div>
    );
  }

  if (toolName === 'validate_resources' && data?.data?.results) {
    const report = data.data;
    return (
      <div>
        <span className="text-[10px] font-medium text-gray-500 uppercase">Validation</span>
        <div className="mt-0.5 flex gap-2 text-[10px]">
          <span className="text-green-600">{report.passed} passed</span>
          {report.warnings > 0 && <span className="text-amber-600">{report.warnings} warnings</span>}
          {report.errors > 0 && <span className="text-red-600">{report.errors} errors</span>}
        </div>
      </div>
    );
  }

  if (data?.success) {
    const summary = data.data;
    if (!summary || typeof summary !== 'object') return null;
    return (
      <div>
        <span className="text-[10px] font-medium text-gray-500 uppercase">Result</span>
        <div className="mt-0.5 font-mono text-[10px] text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 rounded p-1.5 max-h-[60px] overflow-y-auto">
          {Object.entries(summary).map(([k, v]) => (
            <div key={k}><span className="text-green-600 dark:text-green-400">{k}</span>: {formatValue(v)}</div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
    case 'executing':
      return <Loader2 className="h-3 w-3 animate-spin" />;
    case 'awaiting_approval':
      return <AlertTriangle className="h-3 w-3 text-amber-500" />;
    case 'complete':
    case 'approved':
      return <Check className="h-3 w-3 text-green-600" />;
    case 'error':
    case 'rejected':
      return <X className="h-3 w-3 text-red-500" />;
    default:
      return null;
  }
}

function formatToolName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(v: unknown): string {
  if (typeof v === 'string') return v.length > 60 ? v.slice(0, 60) + '...' : v;
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 80);
  return String(v);
}
