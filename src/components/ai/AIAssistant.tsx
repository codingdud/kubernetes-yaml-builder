import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import * as yaml from 'js-yaml';
import { geminiService, type GenerationState } from '../../services/geminiService';
import { Bot, RefreshCw, Plus, Save, Check, Workflow, Trash2, Undo2, X } from 'lucide-react';

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
}

interface SavedPreview {
  id: string;
  prompt: string;
  resources: PreviewResource[];
  timestamp: Date;
  selected?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onImportYaml, onRemoveNodes, onNotification, diagramNodes = [] }) => {
  const [prompt, setPrompt] = useState('');
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [previewResources, setPreviewResources] = useState<PreviewResource[]>([]);
  const [selectedResources, setSelectedResources] = useState<Set<number>>(new Set());
  const [savedPreviews, setSavedPreviews] = useState<SavedPreview[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [contextYaml, setContextYaml] = useState('');
  const [selectedDiagramNodes, setSelectedDiagramNodes] = useState<Set<string>>(new Set());



  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onNotification?.('Please enter a prompt', 'error');
      return;
    }

    if (!geminiService.isAvailable()) {
      onNotification?.('Gemini AI service not available', 'error');
      return;
    }

    try {
      let contextPrompt = prompt;
      
      if (selectedPreview) {
        const preview = savedPreviews.find(p => p.id === selectedPreview);
        if (preview) {
          const previewYaml = preview.resources.map(r => r.yaml).join('---\n');
          contextPrompt = `Context YAML:\n${previewYaml}\n\nUser Request: ${prompt}`;
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
        contextPrompt = `Context YAML (from diagram):\n${diagramYaml}\n\nUser Request: ${prompt}`;
      } else if (contextYaml) {
        contextPrompt = `Context YAML:\n${contextYaml}\n\nUser Request: ${prompt}`;
      }
      
      const generatedYaml = await geminiService.generateKubernetesYAML(contextPrompt, setGenerationState);
      const resources = yaml.loadAll(generatedYaml).filter(r => r) as any[];
      
      if (resources.length === 0) {
        onNotification?.('No valid resources generated', 'error');
        return;
      }
      
      const previewData = resources.map(resource => ({
        resource,
        yaml: yaml.dump(resource)
      }));
      
      setPreviewResources(previewData);
      setSelectedResources(new Set(previewData.map((_, i) => i)));
      onNotification?.(`Generated ${resources.length} resources`, 'success');
    } catch (error: any) {
      onNotification?.(error.message || 'AI generation failed', 'error');
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
    onNotification?.('Preview cleared', 'success');
  };

  const handleRevert = (generationId: string) => {
    const generation = generations.find(g => g.id === generationId);
    if (generation) {
      onRemoveNodes(generation.nodeIds);
      setGenerations(prev => prev.filter(g => g.id !== generationId));
      onNotification?.(`Reverted ${generation.nodeIds.length} resources`, 'success');
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Input Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">
            What do you want to deploy?
          </label>
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., nginx web server with SSL, redis cache, postgres database..."
            rows={2}
            className="text-sm resize-none"
          />
        </div>
        
        {selectedPreview && (
          <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-2 rounded flex items-center justify-between">
            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Building on: {savedPreviews.find(p => p.id === selectedPreview)?.prompt.slice(0, 40)}...</span>
            <button 
              onClick={() => setSelectedPreview(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {selectedDiagramNodes.size > 0 && (
          <div className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 p-2 rounded flex items-center justify-between">
            <span className="flex items-center gap-1"><Workflow className="h-3 w-3" /> Using {selectedDiagramNodes.size} resource{selectedDiagramNodes.size !== 1 ? 's' : ''} from diagram</span>
            <button 
              onClick={() => setSelectedDiagramNodes(new Set())}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        <Button 
          onClick={handleGenerate} 
          disabled={generationState.status === 'generating' || !prompt.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          {generationState.status === 'generating' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Generating...
            </>
          ) : (
            <><Bot className="h-4 w-4 mr-2" />Generate Resources</>
          )}
        </Button>
        
        {generationState.status === 'error' && generationState.error && (
          <div className="text-xs text-red-600 dark:text-red-400 text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <><X className="h-3 w-3 mr-1" />{generationState.error}</>
          </div>
        )}
      </div>

      {/* Generated Resources */}
      {previewResources.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium text-green-800 dark:text-green-200 text-sm">
              {previewResources.length} resource{previewResources.length !== 1 ? 's' : ''} ready
            </span>
          </div>
          
          <div className="space-y-2 mb-3 max-h-24 overflow-y-auto">
            {previewResources.map((item, i) => (
              <label key={i} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-green-100 dark:hover:bg-green-800/30 p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedResources.has(i)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedResources);
                    if (e.target.checked) {
                      newSelected.add(i);
                    } else {
                      newSelected.delete(i);
                    }
                    setSelectedResources(newSelected);
                  }}
                  className="w-3 h-3"
                />
                <span className="text-green-700 dark:text-green-300">
                  {item.resource.kind}: {item.resource.metadata?.name || 'unnamed'}
                </span>
              </label>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAddSelected}
              disabled={selectedResources.size === 0}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <><Plus className="h-3 w-3 mr-1" />Add to Diagram ({selectedResources.size})</>
            </Button>
            <Button 
              onClick={handlePreview}
              disabled={selectedResources.size === 0}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <><Save className="h-3 w-3 mr-1" />Save for Later</>
            </Button>
          </div>
        </div>
      )}

      {/* Diagram Resources */}
      {diagramNodes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1"><Workflow className="h-4 w-4" />Use from Diagram</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {diagramNodes.map(node => (
              <label key={node.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedDiagramNodes.has(node.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedDiagramNodes);
                    if (e.target.checked) {
                      newSelected.add(node.id);
                    } else {
                      newSelected.delete(node.id);
                    }
                    setSelectedDiagramNodes(newSelected);
                  }}
                  className="w-3 h-3"
                />
                <span className="text-purple-700 dark:text-purple-300">
                  {node.data.resourceType}: {node.data.label}
                </span>
              </label>
            ))}
          </div>
          {selectedDiagramNodes.size > 0 && (
            <button
              onClick={() => setSelectedDiagramNodes(new Set())}
              className="text-xs text-red-600 hover:text-red-700 underline"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Saved Previews */}
      {savedPreviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1"><Save className="h-4 w-4" />Saved Previews</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedPreviews.map(preview => (
              <div key={preview.id} className={`p-3 rounded-lg border transition-all ${
                selectedPreview === preview.id 
                  ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{preview.prompt}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {preview.resources.length} resource{preview.resources.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectPreview(preview.id)}
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      selectedPreview === preview.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPreview === preview.id ? <><Check className="h-3 w-3 mr-1" />Using</> : 'Use'}
                  </button>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleAddPreview(preview.id)}
                    size="sm"
                    className="h-6 px-2 text-xs flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <><Plus className="h-3 w-3 mr-1" />Add</>
                  </Button>
                  <Button
                    onClick={() => handleClearPreview(preview.id)}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1"/>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Added to Diagram */}
      {generations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1"><Check className="h-4 w-4" />Added to Diagram</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {generations.map(gen => (
              <div key={gen.id} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{gen.prompt}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {gen.nodeIds.length} resource{gen.nodeIds.length !== 1 ? 's' : ''} in diagram
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRevert(gen.id)}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <><Undo2 className="h-3 w-3 mr-1" />Undo</>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;