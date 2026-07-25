import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, ShieldCheck, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { Node } from '@xyflow/react';
import { validateNodes, type ValidationReport, type NodeValidationResult, type ValidationIssue } from '../../utils/kubeValidate';

interface VerifyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  selectedNodes: Node[];
}

const HELM_KINDS = new Set(['HelmChart', 'HelmValues']);

function StatusIcon({ status }: { status: 'pass' | 'warn' | 'error' }) {
  if (status === 'pass') return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
  if (status === 'warn') return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
  return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
}

function IssueIcon({ type }: { type: 'error' | 'warning' }) {
  if (type === 'error') return <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />;
  return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />;
}

function NodeCard({ result }: { result: NodeValidationResult }) {
  const [expanded, setExpanded] = useState(result.status !== 'pass');

  const kindColors: Record<string, string> = {
    Deployment: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    StatefulSet: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    DaemonSet: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    Service: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    ConfigMap: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    Secret: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    CronJob: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    Job: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    Ingress: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
    HelmChart: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    HelmValues: 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
  };
  const kindColor = kindColors[result.nodeKind] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-2">
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon status={result.status} />
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${kindColor}`}>
            {result.nodeKind}
          </span>
          <span className="text-sm text-gray-900 dark:text-white truncate font-medium">
            {result.nodeName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {result.issues.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{result.issues.length} issue{result.issues.length !== 1 ? 's' : ''}</span>
          )}
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 py-2 bg-white dark:bg-gray-900">
          {result.issues.length === 0 ? (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" /> All checks passed
            </p>
          ) : (
            <ul className="space-y-1.5">
              {result.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <IssueIcon type={issue.type} />
                  <span className={issue.type === 'error' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}>
                    <span className="font-medium">{issue.rule}</span>{issue.field ? ` (${issue.field})` : ''}: {issue.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function CrossNodeIssues({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg overflow-hidden mb-2 bg-yellow-50 dark:bg-yellow-950">
      <div className="px-3 py-2 border-b border-yellow-200 dark:border-yellow-800">
        <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 uppercase tracking-wide">Cross-Resource Issues</span>
      </div>
      <ul className="px-3 py-2 space-y-1.5">
        {issues.map((issue, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs">
            <IssueIcon type={issue.type} />
            <span className="text-yellow-700 dark:text-yellow-400">{issue.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultsList({ results, extraIssues }: { results: NodeValidationResult[]; extraIssues?: ValidationIssue[] }) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
        <ShieldCheck className="h-10 w-10 mb-2 opacity-30" />
        <p className="text-sm">No resources to verify</p>
      </div>
    );
  }
  return (
    <div>
      {extraIssues && extraIssues.length > 0 && <CrossNodeIssues issues={extraIssues} />}
      {results.map(r => <NodeCard key={r.nodeId} result={r} />)}
    </div>
  );
}

function exportReport(report: ValidationReport): void {
  const lines: string[] = [
    'KUBERNETES RESOURCE VERIFICATION REPORT',
    '='.repeat(42),
    `Generated: ${new Date(report.timestamp).toLocaleString()}`,
    `Summary: ${report.passed} passed, ${report.warnings} warnings, ${report.errors} errors`,
    '',
  ];

  if (report.crossNodeIssues.length > 0) {
    lines.push('CROSS-RESOURCE ISSUES', '-'.repeat(22));
    report.crossNodeIssues.forEach(issue => {
      lines.push(`  [${issue.type.toUpperCase()}] (${issue.rule}) ${issue.message}`);
    });
    lines.push('');
  }

  lines.push('RESOURCES', '-'.repeat(22));
  report.results.forEach(r => {
    lines.push(`\n${r.nodeKind}: ${r.nodeName}  [${r.status.toUpperCase()}]`);
    if (r.issues.length === 0) {
      lines.push('  All checks passed');
    } else {
      r.issues.forEach(issue => {
        lines.push(`  [${issue.type.toUpperCase()}] (${issue.rule})${issue.field ? ` ${issue.field}` : ''}: ${issue.message}`);
      });
    }
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `verification-report-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const VerifyPanel: React.FC<VerifyPanelProps> = ({ isOpen, onClose, nodes, selectedNodes }) => {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runVerification = useCallback(() => {
    if (nodes.length === 0) {
      setReport({
        timestamp: new Date().toISOString(),
        passed: 0, warnings: 0, errors: 0,
        results: [], crossNodeIssues: [],
      });
      return;
    }
    setIsRunning(true);
    // Defer to allow spinner to render
    setTimeout(() => {
      try {
        const r = validateNodes(nodes);
        setReport(r);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  }, [nodes]);

  useEffect(() => {
    if (isOpen) runVerification();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const helmResults = report?.results.filter(r => HELM_KINDS.has(r.nodeKind)) ?? [];
  const selectedIds = new Set(selectedNodes.map(n => n.id));
  const selectedResults = report?.results.filter(r => selectedIds.has(r.nodeId)) ?? [];

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl z-[100] transform transition-transform duration-300 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Verify Resources</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={runVerification}
            disabled={isRunning}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Re-verify"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 dark:text-gray-400 ${isRunning ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {report && (
        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="font-semibold text-green-700 dark:text-green-400">{report.passed}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-yellow-700 dark:text-yellow-400">{report.warnings}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="font-semibold text-red-700 dark:text-red-400">{report.errors}</span>
          </div>
          {report.crossNodeIssues.length > 0 && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-auto">{report.crossNodeIssues.length} cross-resource</span>
          )}
        </div>
      )}

      {/* Tabs + scrollable content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-0 rounded-none border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <TabsTrigger value="all" className="text-xs rounded-none">All Resources</TabsTrigger>
            <TabsTrigger value="helm" className="text-xs rounded-none">Helm</TabsTrigger>
            <TabsTrigger value="selected" className="text-xs rounded-none">Selected</TabsTrigger>
          </TabsList>

          {isRunning && (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          )}

          {!isRunning && report && (
            <>
              <TabsContent value="all" className="flex-1 overflow-y-auto p-3 mt-0">
                <ResultsList results={report.results} extraIssues={report.crossNodeIssues} />
              </TabsContent>

              <TabsContent value="helm" className="flex-1 overflow-y-auto p-3 mt-0">
                <ResultsList results={helmResults} />
              </TabsContent>

              <TabsContent value="selected" className="flex-1 overflow-y-auto p-3 mt-0">
                {selectedNodes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                    <p className="text-sm text-center">Select a node on canvas first,<br />then re-verify to see its results.</p>
                  </div>
                ) : (
                  <ResultsList results={selectedResults} />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Footer */}
      {report && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => exportReport(report)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyPanel;
