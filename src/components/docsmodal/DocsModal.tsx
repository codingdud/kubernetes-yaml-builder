import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Copy, Check, BookOpen, Code2, Tag, Zap } from "lucide-react";

import { Button } from "../ui/button";
import yamlExamples from "../../data/yamlExamples.json";
import resourceDocs from "../../data/resourceDocs.json";
import { type YamlExamples } from "../../types/yamlExamples";

interface KeyField {
  field: string;
  description: string;
}

interface ResourceDoc {
  description: string;
  apiVersion: string;
  useCases: string[];
  keyFields: KeyField[];
}

type ResourceDocs = Record<string, ResourceDoc>;

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const typedYamlExamples: YamlExamples = yamlExamples;
const typedResourceDocs: ResourceDocs = resourceDocs as ResourceDocs;
const allResourceTypes = Array.from(
  new Set([...Object.keys(typedResourceDocs), ...Object.keys(typedYamlExamples)])
).sort((a, b) => a.localeCompare(b));

const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [selectedResourceType, setSelectedResourceType] = useState<string>(allResourceTypes[0] || "");
  const [activeTab, setActiveTab] = useState<"overview" | "examples">("overview");
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(420);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStartX.current;
      setPanelWidth(Math.max(280, Math.min(800, dragStartWidth.current + dx)));
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const onDragHandleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = panelWidth;
    e.preventDefault();
  }, [panelWidth]);

  const copyToClipboard = (text: string, exampleName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(exampleName);
    setTimeout(() => setCopiedExample(null), 1500);
  };

  const doc = typedResourceDocs[selectedResourceType];
  const examples = typedYamlExamples[selectedResourceType];

  return (
    <div
      style={{ width: panelWidth }}
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl z-[100] flex flex-row transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">K8s Reference</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Resource selector */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0 border-b border-gray-100 dark:border-gray-800">
        <select
          value={selectedResourceType}
          aria-label="Select resource type"
          onChange={(e) => {
            setSelectedResourceType(e.target.value);
            setActiveTab("overview");
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {allResourceTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("examples")}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "examples"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          Examples
          {examples && (
            <span className="ml-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full px-1.5 py-0.5 leading-none">
              {Object.keys(examples).length}
            </span>
          )}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="p-5 space-y-5">
            {doc ? (
              <>
                {/* Description + API version */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700">
                      <Tag className="h-3 w-3" />
                      {doc.apiVersion}
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedResourceType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                {/* Use cases */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Common Use Cases
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.useCases.map((uc) => (
                      <span
                        key={uc}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700"
                      >
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key fields */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Key Fields
                  </h3>
                  <div className="space-y-2">
                    {doc.keyFields.map((kf) => (
                      <div
                        key={kf.field}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <code className="text-xs font-mono text-blue-700 dark:text-blue-400 break-all">
                            {kf.field}
                          </code>
                        </div>
                        <div className="px-3 py-2">
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            {kf.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shortcut to examples */}
                {examples && (
                  <button
                    onClick={() => setActiveTab("examples")}
                    className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    View {Object.keys(examples).length} YAML example{Object.keys(examples).length !== 1 ? "s" : ""} →
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No documentation available for {selectedResourceType}.</p>
              </div>
            )}
          </div>
        )}

        {/* ── EXAMPLES TAB ── */}
        {activeTab === "examples" && (
          <div className="p-5">
            {examples ? (
              <div className="space-y-4">
                {Object.entries(examples).map(([exampleName, yamlContent]) => (
                  <div
                    key={exampleName}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{exampleName}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(yamlContent as string, exampleName)}
                        className="h-7 px-2 text-xs"
                      >
                        {copiedExample === exampleName ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1">{copiedExample === exampleName ? "Copied!" : "Copy"}</span>
                      </Button>
                    </div>
                    <div className="p-3">
                      <pre className="bg-gray-100 dark:bg-gray-950 p-3 rounded-md overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-200 leading-relaxed">
                        <code>{yamlContent as string}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <Code2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No examples available for {selectedResourceType}.</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      {/* Drag handle */}
      <div
        onMouseDown={onDragHandleMouseDown}
        className="w-1 flex-shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize transition-colors"
      />
    </div>
  );
};

export default DocsModal;
