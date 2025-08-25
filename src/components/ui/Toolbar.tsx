import React, { useState, forwardRef, useMemo } from 'react';
import { LucideChevronDown, LucidePlus, RotateCcwIcon } from 'lucide-react';
import { Button } from './button';
import { type Command } from '../../types/command';
import resourceRegistry from '../../config/resourceRegistry';
import { useCommands } from '../../hooks/useCommands';

interface ToolbarProps {
  commands: Command[];
  executingCommand: string | null;
  executeCommand: (commandId: string, ...args: any[]) => void;
  onAddNode: (kind: string) => void;
  onDragStart: (event: React.DragEvent, kind: string) => void;
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>((
  { commands, executingCommand, executeCommand, onAddNode, onDragStart },
  ref
) => {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const addResourceCommand: Command = useMemo(() => ({
    id: 'addResource',
    label: 'Add Resource',
    icon: <LucidePlus className="h-4 w-4" />,
    shortcut: ['a'],
    execute: () => setIsResourcesOpen(o => !o),
  }), [setIsResourcesOpen]);

  useCommands([addResourceCommand]);

  const resourceGroups = {
    Workloads: ['Deployment', 'StatefulSet', 'DaemonSet', 'Job', 'CronJob'],
    Network: ['Service', 'Ingress'],
    Config: ['ConfigMap', 'Secret'],
  };

  const generalCommands = commands.filter(c => ['toggleTools', 'toggleDocs'].includes(c.id));
  const fileCommands = commands.filter(c => ['save', 'restore', 'export', 'import'].includes(c.id));

  return (
    <div 
      ref={ref} 
      tabIndex={-1} 
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center gap-2 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
    >
      <div className="relative">
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          onClick={() => setIsResourcesOpen(!isResourcesOpen)}
          title="Add Resource (A)"
        >
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

      {generalCommands.map((command) => (
        <Button
          key={command.id}
          variant="ghost"
          size="icon"
          onClick={() => executeCommand(command.id)}
          disabled={executingCommand === command.id}
          title={`${command.label}${command.shortcut ? ` (${command.shortcut.join('+')})` : ''}`}
        >
          {executingCommand === command.id ? <RotateCcwIcon className="h-4 w-4 animate-spin" /> : command.icon}
        </Button>
      ))}

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      {fileCommands.map((command) => (
        <Button
          key={command.id}
          variant="ghost"
          size="icon"
          onClick={() => executeCommand(command.id)}
          disabled={executingCommand === command.id}
          title={`${command.label}${command.shortcut ? ` (${command.shortcut.join('+')})` : ''}`}
        >
          {executingCommand === command.id ? <RotateCcwIcon className="h-4 w-4 animate-spin" /> : command.icon}
        </Button>
      ))}
    </div>
  );
});
