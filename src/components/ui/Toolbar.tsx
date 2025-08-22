import React, { useState } from 'react';
import { Wrench, BookOpen, ChevronDown, Plus } from 'lucide-react';
import resourceRegistry from '../../config/resourceRegistry';
import { Button } from './button';

interface ToolbarProps {
  onAddNode: (kind: string) => void;
  onDragStart: (event: React.DragEvent, kind: string) => void;
  onOpenTools: () => void;
  onOpenDocs: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onDragStart,
  onOpenTools: onToggleTools,
  onOpenDocs: onToggleDocs,
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
          className="flex items-center gap-2"
          onClick={() => setIsResourcesOpen(!isResourcesOpen)}
        >
          <Plus className="h-4 w-4" />
          Add Resource
          <ChevronDown className="h-4 w-4" />
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
                    resourceRegistry[resource] && (
                      <Button
                        key={resource}
                        variant="ghost"
                        className="w-full justify-start text-sm"
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
        className="p-2"
        title="Tools"
      >
        <Wrench className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDocs}
        className="p-2"
        title="Documentation"
      >
        <BookOpen className="h-4 w-4" />
      </Button>
    </div>
  );
};
