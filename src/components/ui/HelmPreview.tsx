import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Download,
  ArrowLeft,
  Copy,
  Check,
  Package,
  Search,
  LayoutTemplate,
} from 'lucide-react';
import type { Node } from '@xyflow/react';
import type { K8sNode } from '../../types/reactFlow';
import { generateHelmChart, type HelmFile } from '../../utils/helmGenerator';
import helmStarterTemplates, { type HelmTemplateNode } from '../../data/helmStarterTemplates';
import JSZip from 'jszip';
import { Button } from './button';
import { Input } from './input';

interface HelmPreviewProps {
  nodes: Node[];
  onSelectTemplate: (items: HelmTemplateNode[]) => void;
}

interface TreeItem {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  content?: string;
  children?: TreeItem[];
}

function buildTree(files: HelmFile[]): TreeItem {
  const root: TreeItem = { name: '', type: 'folder', children: [] };
  for (const file of files) {
    const parts = file.path.split('/');
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      if (isLast) {
        cur.children!.push({ name: part, type: 'file', path: file.path, content: file.content });
      } else {
        let child = cur.children!.find((c) => c.type === 'folder' && c.name === part);
        if (!child) {
          child = { name: part, type: 'folder', children: [] };
          cur.children!.push(child);
        }
        cur = child;
      }
    }
  }
  return root;
}

const TreeRow: React.FC<{
  item: TreeItem;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (file: HelmFile) => void;
}> = ({ item, depth, expanded, onToggle, onSelect }) => {
  const pad = depth * 14 + 8;

  if (item.type === 'folder') {
    const key = `${depth}:${item.name}`;
    const open = expanded.has(key);
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggle(key)}
          className="w-full flex items-center gap-1.5 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm text-left transition-colors"
          style={{ paddingLeft: `${pad}px`, paddingRight: '8px' }}
        >
          {open
            ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            : <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
          {open
            ? <FolderOpen className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            : <Folder className="h-4 w-4 text-yellow-400 flex-shrink-0" />}
          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}/</span>
        </button>
        {open &&
          item.children?.map((child, i) => (
            <TreeRow key={i} item={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} onSelect={onSelect} />
          ))}
      </div>
    );
  }

  const ext = item.name.split('.').pop() ?? '';
  const iconColor =
    ext === 'yaml' || ext === 'yml' ? 'text-blue-400' : ext === 'tpl' ? 'text-purple-400' : 'text-gray-400';

  return (
    <button
      type="button"
      onClick={() => onSelect({ path: item.path!, content: item.content! })}
      className="w-full flex items-center gap-1.5 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded text-sm text-left transition-colors"
      style={{ paddingLeft: `${pad}px`, paddingRight: '8px' }}
    >
      <FileText className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
      <span className="text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
    </button>
  );
};

const categoryColors: Record<string, string> = {
  Web: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Backend: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Database: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Batch: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  System: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const HelmPreview: React.FC<HelmPreviewProps> = ({ nodes, onSelectTemplate }) => {
  const [chartName, setChartName] = useState('my-chart');
  const [inputValue, setInputValue] = useState('my-chart');
  const [selectedFile, setSelectedFile] = useState<HelmFile | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['0:', '1:templates']));
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showGallery, setShowGallery] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (nodes.length === 0) setShowGallery(true);
  }, [nodes.length]);

  const helmFiles = useMemo(
    () => generateHelmChart(nodes as K8sNode[], chartName),
    [nodes, chartName]
  );

  const tree = useMemo(() => buildTree(helmFiles), [helmFiles]);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return helmStarterTemplates;
    return helmStarterTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.resourceLabels.some((r) => r.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleChartNameBlur = () => {
    const name = inputValue.trim().replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'my-chart';
    setChartName(name);
    setInputValue(name);
    setSelectedFile(null);
  };

  const toggleFolder = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const downloadZip = async () => {
    if (helmFiles.length === 0) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const file of helmFiles) {
        zip.file(`${chartName}/${file.path}`, file.content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ─── Gallery view ─── */
  if (showGallery) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Starter Templates
          </span>
          {nodes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowGallery(false)}
              className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <Package className="h-3 w-3" />
              View Chart
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="h-7 text-xs pl-7"
          />
        </div>

        {/* Template cards */}
        <div className="flex flex-col gap-1.5">
          {filteredTemplates.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No templates match your search</p>
          ) : (
            filteredTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  // Build temp K8sNode-like objects from the template resources (excluding Helm meta nodes)
                  const resourceItems = tmpl.resources.filter(
                    (r) => r.kind !== 'HelmChart' && r.kind !== 'HelmValues'
                  );
                  const tempNodes = resourceItems.map((item, i) => ({
                    id: `__tmpl_${i}`,
                    type: item.kind.toLowerCase(),
                    position: item.position,
                    data: { resource: item.resource, schema: {}, uiSchema: {} },
                  })) as K8sNode[];

                  // Generate values.yaml from the template resources using the same logic
                  const tempFiles = generateHelmChart(tempNodes, tmpl.id);
                  const generatedValues = tempFiles.find((f) => f.path === 'values.yaml')?.content ?? '';

                  const helmChart: HelmTemplateNode = {
                    kind: 'HelmChart',
                    position: { x: 100, y: -200 },
                    resource: {
                      kind: 'HelmChart',
                      apiVersion: 'v2',
                      name: tmpl.id,
                      description: tmpl.description,
                      type: 'application',
                      version: '0.1.0',
                      appVersion: '1.0.0',
                    },
                  };
                  const helmValues: HelmTemplateNode = {
                    kind: 'HelmValues',
                    position: { x: 520, y: -200 },
                    resource: { kind: 'HelmValues', content: generatedValues },
                  };
                  onSelectTemplate([helmChart, helmValues, ...tmpl.resources]);
                  setShowGallery(false);
                }}
                className="w-full text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 hover:border-blue-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base leading-none flex-shrink-0">{tmpl.icon}</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {tmpl.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${categoryColors[tmpl.category] ?? categoryColors.System}`}>
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 leading-snug">{tmpl.description}</p>
                <div className="flex flex-wrap gap-1">
                  {tmpl.resourceLabels.map((label) => (
                    <span
                      key={label}
                      className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  /* ─── Empty canvas (shouldn't reach here, but fallback) ─── */
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 dark:text-gray-500">
        <Package className="h-8 w-8 opacity-40" />
        <p className="text-sm text-center">Add resources to the canvas to generate a Helm chart</p>
        <button
          type="button"
          onClick={() => setShowGallery(true)}
          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1"
        >
          <LayoutTemplate className="h-3.5 w-3.5" />
          Browse starter templates
        </button>
      </div>
    );
  }

  /* ─── File tree view ─── */
  return (
    <div className="flex flex-col gap-2">
      {/* Chart name + templates button + download row */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setShowGallery(true)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 flex-shrink-0 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-1 hover:border-blue-400 transition-colors"
          title="Browse starter templates"
        >
          <LayoutTemplate className="h-3 w-3" />
        </button>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleChartNameBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleChartNameBlur()}
          placeholder="Chart name"
          className="h-7 text-xs flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={downloadZip}
          disabled={downloading}
          className="h-7 text-xs flex items-center gap-1 flex-shrink-0"
          title={`Download ${chartName}.zip`}
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? '...' : '.zip'}
        </Button>
      </div>

      {selectedFile ? (
        /* --- File content view --- */
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 flex-shrink-0"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate flex-1">
              {chartName}/{selectedFile.path}
            </span>
            <button
              type="button"
              onClick={copyToClipboard}
              title="Copy to clipboard"
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <pre className="text-xs font-mono whitespace-pre bg-gray-50 dark:bg-gray-900 p-2.5 rounded-md border border-gray-200 dark:border-gray-700 overflow-auto max-h-[460px] leading-relaxed">
            {selectedFile.content}
          </pre>
        </div>
      ) : (
        /* --- File tree view --- */
        <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 py-1 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-1 border-b border-gray-100 dark:border-gray-800 mb-0.5">
            <Package className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{chartName}/</span>
            <span className="ml-auto text-xs text-gray-400">{helmFiles.length} files</span>
          </div>
          {tree.children?.map((item, i) => (
            <TreeRow key={i} item={item} depth={0} expanded={expanded} onToggle={toggleFolder} onSelect={setSelectedFile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HelmPreview;
