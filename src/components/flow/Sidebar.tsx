import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import CodePreview from '../ui/CodePreview';
import resourceRegistry from '../../config/resourceRegistry';
import { useDnD } from './DnDContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import AIAssistant from '../ai/AIAssistant';

interface SidebarProps {
  onAddNode: (kind: keyof typeof resourceRegistry) => void;
  yaml: string;
  onCollapseChange: (collapsed: boolean) => void;
  onImportYaml: (yaml: string) => string[];
  onRemoveNodes?: (nodeIds: string[]) => void;
  onNotification?: (message: string, type?: 'success' | 'error') => void;
  diagramNodes?: Array<{ id: string; data: { label: string; formData: any; resourceType: string } }>;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddNode, yaml, onCollapseChange, onImportYaml, onRemoveNodes, onNotification, diagramNodes }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [yamlInput, setYamlInput] = useState('');
  const { setType } = useDnD();

  const toggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange(collapsed);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setType(nodeType as keyof typeof resourceRegistry);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={() => toggleCollapse(false)}
          className="p-3 bg-blue-600 dark:bg-gray-700 text-white rounded-l-lg shadow-lg hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
          title="Expand sidebar"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-1/4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto relative">
      <div className="p-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Resources</h3>
          <button
            onClick={() => toggleCollapse(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Collapse sidebar"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Click to add or drag to canvas</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(resourceRegistry).map((kind) => (
              <Button 
                key={kind} 
                onClick={() => onAddNode(kind as keyof typeof resourceRegistry)}
                onDragStart={(event) => onDragStart(event, kind)}
                draggable
                className="text-xs px-2 py-1 cursor-grab active:cursor-grabbing"
                size="sm"
              >
                Add {kind}
              </Button>
            ))}
          </div>
        </div>
        <Tabs defaultValue="generated-yaml" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generated-yaml" className="text-xs">Generated</TabsTrigger>
            <TabsTrigger value="import-yaml" className="text-xs">Import</TabsTrigger>
            <TabsTrigger value="ai-generate" className="text-xs">AI <Sparkles className="h-5 w-5" /></TabsTrigger>
          </TabsList>
          <TabsContent value="generated-yaml" className="h-full">
            <CodePreview yaml={yaml} />
          </TabsContent>
          <TabsContent value="import-yaml" className="h-full">
            <div className="flex flex-col gap-2 h-full">
              <Textarea 
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                placeholder="Paste your YAML here..."
                className="h-full"
              />
              <Button onClick={() => {
                if (!yamlInput.trim()) {
                  onNotification?.('Please enter YAML content first');
                  return;
                }
                
                // Basic YAML validation
                const trimmedYaml = yamlInput.trim();
                if (!trimmedYaml.includes('apiVersion') || !trimmedYaml.includes('kind')) {
                  onNotification?.('Invalid YAML: Missing required Kubernetes fields (apiVersion, kind)');
                  return;
                }
                
                try {
                  onImportYaml(yamlInput);
                } catch (error) {
                  onNotification?.('YAML file format is not correct');
                }
              }} size="sm">
                Generate Diagram
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="ai-generate" className="h-full">
            <AIAssistant 
              onImportYaml={onImportYaml}
              onRemoveNodes={onRemoveNodes || (() => {})}
              onNotification={onNotification}
              diagramNodes={diagramNodes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Sidebar;