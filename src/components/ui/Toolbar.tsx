import React, { useState } from 'react';
import { LucideWrench, LucideBookOpen, LucideChevronDown, LucidePlus, Save, RotateCcw, Download, Upload } from 'lucide-react';
import resourceRegistry from '../../config/resourceRegistry';
import { Button } from './button';

interface ToolbarProps {
  onAddNode: (kind: string) => void;
  onDragStart: (event: React.DragEvent, kind: string) => void;
  onOpenTools: () => void;
  onOpenDocs: () => void;
  onSave?: () => void;
  onRestore?: () => void;
  onExportFlow?: () => void;
  onImportFlow?: (jsonString: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onDragStart,
  onOpenTools: onToggleTools,
  onOpenDocs: onToggleDocs,
  onSave,
  onRestore,
  onExportFlow,
  onImportFlow,
}) => {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const resourceGroups = {
    Workloads: ['Deployment', 'StatefulSet', 'DaemonSet', 'Job', 'CronJob'],
    Network: ['Service', 'Ingress'],
    Config: ['ConfigMap', 'Secret'],
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center gap-2">
      <div className="relative">
        <Button
          variant="secondary"
          className="flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          onClick={() => setIsResourcesOpen(!isResourcesOpen)}
        >
          <LucidePlus className="h-4 w-4" />
          Add Resource
          <LucideChevronDown className="h-4 w-4" />
        </Button>

        {isResourcesOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            {Object.entries(resourceGroups).map(([group, resources]) => (
              <div key={group} className="mb-4">
                <h3 className="text-sm font-semibold mb-2 px-2 text-gray-500 dark:text-gray-400">
                  {group}
                </h3>
                <div className="space-y-1">
                  {resources.map((resource) => (
                    resourceRegistry[resource as keyof typeof resourceRegistry] && (
                      <Button
                        key={resource}
                        variant="ghost"
                        className="w-full justify-start text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onDragStart={(e) => {
                          onDragStart(e, resource);
                          setIsResourcesOpen(false);
                        }}
                        onClick={() => {
                          onAddNode(resource);
                          setIsResourcesOpen(false);
                        }}
                        draggable
                      >
                        {resource}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleTools}
        className="p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        title="Tools"
      >
        <LucideWrench className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDocs}
        className="p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        title="Documentation"
      >
        <LucideBookOpen className="h-4 w-4" />
      </Button>

      {onSave && onRestore && (
        <>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className="p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            title="Save Flow"
          >
            <Save className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRestore}
            className="p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            title="Restore Flow"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </>
      )}

      {onExportFlow && onImportFlow && (
        <>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onExportFlow}
            className="p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            title="Export Flow"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const content = e.target?.result;
                    if (typeof content === 'string') {
                      onImportFlow(content);
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
            className="p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            title="Import Flow"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};
