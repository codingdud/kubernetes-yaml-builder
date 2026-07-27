import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import * as yaml from 'js-yaml';
import { geminiService, type GenerationState } from '../../services/geminiService';
import { useAISettings } from '../../ai/hooks/useAISettings';
import resourceRegistry from '../../config/resourceRegistry';
import { Bot, RefreshCw, Plus, Save, Check, Trash2, Undo2, X, ChevronDown, ChevronRight, AlertTriangle, RotateCcw, Copy } from 'lucide-react';

interface AIGeneration {
  id: string;
  prompt: string;
  nodeIds: string[];
  timestamp: Date;
}

interface AIAssistantProps {
  onImportYaml: (yamlString: string) => string[];
  onRemoveNodes: (nodeIds: string[]) => void;
  onNotification?: (message: string, type?: 'success' | 'error') => void;
  diagramNodes?: Array<{ id: string; data: { label: string; formData: any; resourceType: string } }>;
}

interface PreviewResource {
  resource: any;
  yaml: string;
  valid: boolean;
  warning?: string;
}

interface SavedPreview {
  id: string;
  prompt: string;
  resources: PreviewResource[];
  timestamp: Date;
  selected?: boolean;
}

const MAX_CONTEXT_CHARS = 12000;

const EXAMPLE_PROMPTS = [
  'nginx + Service',
  'Postgres with PVC',
  'Redis cache',
  'Node app + Ingress',
  'CronJob backup',
];

const AIAssistant: React.FC<AIAssistantProps> = ({ onImportYaml, onRemoveNodes, onNotification, diagramNodes = [] }) => {
  const { settings } = useAISettings();
  const [prompt, setPrompt] = useState('');
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [previewResources, setPreviewResources] = useState<PreviewResource[]>([]);
  const [selectedResources, setSelectedResources] = useState<Set<number>>(new Set());
  const [expandedPreviews, setExpandedPreviews] = useState<Set<number>>(new Set());
  const [savedPreviews, setSavedPreviews] = useState<SavedPreview[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [contextYaml, setContextYaml] = useState('');
  const [selectedDiagramNodes, setSelectedDiagramNodes] = useState<Set<string>>(new Set());
  const [showContext, setShowContext] = useState(false);
  const lastPromptRef = useRef('');

  const geminiConfig = settings.gemini;
  const isAvailable = geminiService.isAvailable({ apiKey: geminiConfig.apiKey });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onNotification?.('Please enter a prompt', 'error');
      return;
    }

    if (!isAvailable) {
      onNotification?.('No Gemini API key configured. Set it in AI Settings (left panel).', 'error');
      return;
    }

    lastPromptRef.current = prompt;

    try {
      let contextPrompt = prompt;

      if (selectedPreview) {
        const preview = savedPreviews.find(p => p.id === selectedPreview);
        if (preview) {
          const previewYaml = preview.resources.map(r => r.yaml).join('---\n');
          contextPrompt = `Context YAML:\n${truncateContext(previewYaml)}\n\nUser Request: ${prompt}`;
        }
      } else if (selectedDiagramNodes.size > 0) {
        const selectedNodes = diagramNodes.filter(node => selectedDiagramNodes.has(node.id));
        const diagramYaml = selectedNodes.map(node => {
          const resource = {
            apiVersion: node.data.formData.apiVersion || 'v1',
            kind: node.data.resourceType,
            metadata: node.data.formData.metadata || { name: node.data.label },
            ...node.data.formData
          };
          return yaml.dump(resource);
        }).join('---\n');
        contextPrompt = `Context YAML (from diagram):\n${truncateContext(diagramYaml)}\n\nUser Request: ${prompt}`;
      } else if (contextYaml) {
        contextPrompt = `Context YAML:\n${truncateContext(contextYaml)}\n\nUser Request: ${prompt}`;
      }

      const generatedYaml = await geminiService.generateKubernetesYAML(
        contextPrompt,
        setGenerationState,
        { apiKey: geminiConfig.apiKey, model: geminiConfig.model }
      );
      const resources = yaml.loadAll(generatedYaml).filter(r => r) as any[];

      if (resources.length === 0) {
        onNotification?.('No valid resources generated', 'error');
        return;
      }

      const previewData: PreviewResource[] = resources.map(resource => {
        const valid = validateResource(resource);
        return {
          resource,
          yaml: yaml.dump(resource),
          valid: valid.ok,
          warning: valid.warning,
        };
      });

      setPreviewResources(previewData);
      setSelectedResources(new Set(previewData.map((_, i) => i).filter(i => previewData[i].valid)));
      setExpandedPreviews(new Set());
      onNotification?.(`Generated ${resources.length} resources`, 'success');
    } catch (error: any) {
      onNotification?.(error.message || 'AI generation failed', 'error');
    }
  };

  const handleRetry = () => {
    if (lastPromptRef.current) {
      setGenerationState({ status: 'idle' });
      handleGenerate();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleAddSelected = () => {
    const selectedYaml = previewResources
      .filter((_, i) => selectedResources.has(i))
      .map(r => r.yaml)
      .join('---\n');

    const nodeIds = onImportYaml(selectedYaml);

    const generation: AIGeneration = {
      id: `gen_${Date.now()}`,
      prompt,
      nodeIds,
      timestamp: new Date()
    };

    setGenerations(prev => [...prev, generation]);
    setPreviewResources([]);
    setSelectedResources(new Set());
    setPrompt('');
    setContextYaml('');
    onNotification?.(`Added ${nodeIds.length} resources`, 'success');
  };

  const handlePreview = () => {
    const selectedPreviewResources = previewResources.filter((_, i) => selectedResources.has(i));

    const savedPreview: SavedPreview = {
      id: `preview_${Date.now()}`,
      prompt,
      resources: selectedPreviewResources,
      timestamp: new Date()
    };

    setSavedPreviews(prev => [...prev, savedPreview]);
    setPreviewResources([]);
    setSelectedResources(new Set());
    setPrompt('');
    onNotification?.('Resources saved as preview', 'success');
  };

  const handleSelectPreview = (previewId: string) => {
    setSelectedPreview(selectedPreview === previewId ? null : previewId);
  };

  const handleAddPreview = (previewId: string) => {
    const preview = savedPreviews.find(p => p.id === previewId);
    if (preview) {
      const yamlToAdd = preview.resources.map(r => r.yaml).join('---\n');
      const nodeIds = onImportYaml(yamlToAdd);

      const generation: AIGeneration = {
        id: `gen_${Date.now()}`,
        prompt: preview.prompt,
        nodeIds,
        timestamp: new Date()
      };

      setGenerations(prev => [...prev, generation]);
      onNotification?.(`Added ${preview.resources.length} resources from preview`, 'success');
    }
  };

  const handleClearPreview = (previewId: string) => {
    setSavedPreviews(prev => prev.filter(p => p.id !== previewId));
    if (selectedPreview === previewId) {
      setSelectedPreview(null);
    }
  };

  const handleRevert = (generationId: string) => {
    const generation = generations.find(g => g.id === generationId);
    if (generation) {
      onRemoveNodes(generation.nodeIds);
      setGenerations(prev => prev.filter(g => g.id !== generationId));
      onNotification?.(`Reverted ${generation.nodeIds.length} resources`, 'success');
    }
  };

  const togglePreviewExpand = (index: number) => {
    setExpandedPreviews(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const hasNoContent = previewResources.length === 0 && savedPreviews.length === 0 && generations.length === 0;

  return (
    <div className="space-y-3 h-full flex flex-col overflow-y-auto scrollbar-hide p-1">
      {/* Input Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2.5">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">
            What do you want to deploy?
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., nginx web server with SSL, redis cache, postgres database..."
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        {/* Example prompts */}
        {!prompt && (
          <div className="flex flex-wrap gap-1">
            {EXAMPLE_PROMPTS.map(ex => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Context section (collapsible) */}
        {(diagramNodes.length > 0 || savedPreviews.length > 0) && (
          <div>
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showContext ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Add context (optional)
            </button>
            {showContext && (
              <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                {/* Saved preview context */}
                {selectedPreview && (
                  <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-1.5 rounded flex items-center justify-between">
                    <span className="flex items-center gap-1 truncate"><RefreshCw className="h-3 w-3 flex-shrink-0" /> Building on: {savedPreviews.find(p => p.id === selectedPreview)?.prompt.slice(0, 30)}...</span>
                    <button onClick={() => setSelectedPreview(null)} className="text-red-600 hover:text-red-800 flex-shrink-0">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {/* Diagram nodes */}
                {diagramNodes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-medium text-gray-500 uppercase">Diagram resources</span>
                    <div className="space-y-0.5 mt-1 max-h-20 overflow-y-auto">
                      {diagramNodes.map(node => (
                        <label key={node.id} className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-0.5 rounded">
                          <input
                            type="checkbox"
                            checked={selectedDiagramNodes.has(node.id)}
                            onChange={(e) => {
                              const next = new Set(selectedDiagramNodes);
                              e.target.checked ? next.add(node.id) : next.delete(node.id);
                              setSelectedDiagramNodes(next);
                            }}
                            className="w-3 h-3"
                          />
                          <span className="text-gray-600 dark:text-gray-400 truncate">{node.data.resourceType}: {node.data.label}</span>
                        </label>
                      ))}
                    </div>
                    {selectedDiagramNodes.size > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-purple-600 dark:text-purple-400">{selectedDiagramNodes.size} selected</span>
                        <button onClick={() => setSelectedDiagramNodes(new Set())} className="text-[10px] text-red-500 hover:text-red-700">clear</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={generationState.status === 'generating' || !prompt.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          {generationState.status === 'generating' ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-2"></div>
              {generationState.progress || 'Generating...'}
            </>
          ) : (
            <><Bot className="h-4 w-4 mr-1.5" />Generate <span className="text-[10px] opacity-70 ml-1">(Ctrl+Enter)</span></>
          )}
        </Button>

        {/* Error with retry */}
        {generationState.status === 'error' && generationState.error && (
          <div className="flex items-center gap-2 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-2 rounded">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1">{generationState.error}</span>
            <button onClick={handleRetry} className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Generated Resources Preview */}
      {previewResources.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium text-green-800 dark:text-green-200 text-xs">
              {previewResources.length} resource{previewResources.length !== 1 ? 's' : ''} ready
            </span>
          </div>

          <div className="space-y-1 mb-2.5 max-h-[200px] overflow-y-auto">
            {previewResources.map((item, i) => (
              <div key={i} className="rounded border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900/50 overflow-hidden">
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedResources.has(i)}
                    onChange={(e) => {
                      const next = new Set(selectedResources);
                      e.target.checked ? next.add(i) : next.delete(i);
                      setSelectedResources(next);
                    }}
                    className="w-3 h-3"
                  />
                  <button onClick={() => togglePreviewExpand(i)} className="flex items-center gap-1 flex-1 text-left">
                    {expandedPreviews.has(i) ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
                    <span className={`text-xs ${item.valid ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                      {item.resource.kind}: {item.resource.metadata?.name || 'unnamed'}
                    </span>
                  </button>
                  {!item.valid && <span title={item.warning}><AlertTriangle className="h-3 w-3 text-amber-500" /></span>}
                  <button
                    onClick={() => navigator.clipboard.writeText(item.yaml)}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded opacity-50 hover:opacity-100"
                    title="Copy YAML"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                {expandedPreviews.has(i) && (
                  <pre className="px-2 py-1.5 text-[10px] font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-t border-green-100 dark:border-green-900 max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                    {item.yaml}
                  </pre>
                )}
                {item.warning && expandedPreviews.has(i) && (
                  <div className="px-2 py-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900">
                    {item.warning}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddSelected}
              disabled={selectedResources.size === 0}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />Add ({selectedResources.size})
            </Button>
            <Button
              onClick={handlePreview}
              disabled={selectedResources.size === 0}
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />Save
            </Button>
          </div>
        </div>
      )}

      {/* Empty state: supported resources */}
      {hasNoContent && !prompt && (
        <div className="px-2 py-3">
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Supported Resources</p>
          <div className="flex flex-wrap gap-1">
            {Object.keys(resourceRegistry).map(kind => (
              <span key={kind} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {kind}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Saved Previews */}
      {savedPreviews.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 text-xs flex items-center gap-1"><Save className="h-3.5 w-3.5" />Saved Previews</h4>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {savedPreviews.map(preview => (
              <div key={preview.id} className={`p-2 rounded-lg border transition-all ${
                selectedPreview === preview.id
                  ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{preview.prompt}</div>
                    <div className="text-[10px] text-gray-500">{preview.resources.length} resource{preview.resources.length !== 1 ? 's' : ''}</div>
                  </div>
                  <button
                    onClick={() => handleSelectPreview(preview.id)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                      selectedPreview === preview.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPreview === preview.id ? <><Check className="h-3 w-3 inline mr-0.5" />Using</> : 'Use'}
                  </button>
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => handleAddPreview(preview.id)} size="sm" className="h-5 px-2 text-[10px] flex-1 bg-green-600 hover:bg-green-700">
                    <Plus className="h-2.5 w-2.5 mr-0.5" />Add
                  </Button>
                  <Button onClick={() => handleClearPreview(preview.id)} variant="outline" size="sm" className="h-5 px-2 text-[10px]">
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Added to Diagram */}
      {generations.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 text-xs flex items-center gap-1"><Check className="h-3.5 w-3.5" />Added to Diagram</h4>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {generations.map(gen => (
              <div key={gen.id} className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs truncate">{gen.prompt}</div>
                  <div className="text-[10px] text-green-600 dark:text-green-400">{gen.nodeIds.length} resource{gen.nodeIds.length !== 1 ? 's' : ''}</div>
                </div>
                <Button
                  onClick={() => handleRevert(gen.id)}
                  variant="outline"
                  size="sm"
                  className="h-5 px-2 text-[10px] text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Undo2 className="h-2.5 w-2.5 mr-0.5" />Undo
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function truncateContext(text: string): string {
  if (text.length <= MAX_CONTEXT_CHARS) return text;
  return text.slice(0, MAX_CONTEXT_CHARS) + '\n# ... (context truncated for token budget)';
}

function validateResource(resource: any): { ok: boolean; warning?: string } {
  if (!resource || typeof resource !== 'object') return { ok: false, warning: 'Not a valid object' };
  if (!resource.apiVersion) return { ok: false, warning: 'Missing apiVersion' };
  if (!resource.kind) return { ok: false, warning: 'Missing kind' };
  if (!resource.metadata?.name) return { ok: false, warning: 'Missing metadata.name' };
  if (!(resource.kind in resourceRegistry)) {
    return { ok: true, warning: `"${resource.kind}" is not a supported resource type in this builder` };
  }
  return { ok: true };
}

export default AIAssistant;
