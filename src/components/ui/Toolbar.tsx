import React, { useState, forwardRef, useMemo, useRef, useEffect } from 'react';
import { LucideChevronDown, LucidePlus, RotateCcwIcon, Package, History, Save } from 'lucide-react';
import {
  K8sDeployment, K8sStatefulset, K8sDaemonset, K8sJob, K8sCronjob,
  K8sService, K8sIngress, K8sConfigmap, K8sSecret, K8sReplicaset,
  K8sStorageclass, K8sPersistentvolume, K8sPersistentvolumeclaim,
} from '@thesvg/react';
import { Button } from './button';
import { type Command } from '../../types/command';
import { type FlowCheckpoint } from '../../hooks/useFlowHistory';
import resourceRegistry from '../../config/resourceRegistry';
import { useCommands } from '../../hooks/useCommands';

interface ToolbarProps {
  commands: Command[];
  executingCommand: string | null;
  executeCommand: (commandId: string, ...args: any[]) => void;
  onAddNode: (kind: string) => void;
  onDragStart: (event: React.DragEvent, kind: string) => void;
  lastSavedAt?: string | null;
  checkpoints?: FlowCheckpoint[];
  onRestoreCheckpoint?: (id: string) => void;
  onSaveCheckpoint?: () => void;
}

const K8S_ICONS: Record<string, React.ReactNode> = {
  Deployment:  <K8sDeployment  className="h-5 w-5 flex-shrink-0" />,
  StatefulSet: <K8sStatefulset className="h-5 w-5 flex-shrink-0" />,
  DaemonSet:   <K8sDaemonset   className="h-5 w-5 flex-shrink-0" />,
  Job:         <K8sJob         className="h-5 w-5 flex-shrink-0" />,
  CronJob:     <K8sCronjob     className="h-5 w-5 flex-shrink-0" />,
  Service:     <K8sService     className="h-5 w-5 flex-shrink-0" />,
  Ingress:     <K8sIngress     className="h-5 w-5 flex-shrink-0" />,
  ConfigMap:   <K8sConfigmap   className="h-5 w-5 flex-shrink-0" />,
  Secret:      <K8sSecret      className="h-5 w-5 flex-shrink-0" />,
  ReplicaSet:            <K8sReplicaset       className="h-5 w-5 flex-shrink-0" />,
  StorageClass:          <K8sStorageclass     className="h-5 w-5 flex-shrink-0" />,
  VolumeSnapshot:        <K8sPersistentvolume className="h-5 w-5 flex-shrink-0" />,
  VolumeSnapshotContent: <K8sPersistentvolume className="h-5 w-5 flex-shrink-0" />,
  VolumeSnapshotClass:   <K8sPersistentvolume className="h-5 w-5 flex-shrink-0" />,
  PersistentVolumeClaim: <K8sPersistentvolumeclaim className="h-5 w-5 flex-shrink-0" />,
  HelmChart:   <Package className="h-5 w-5 flex-shrink-0 text-blue-500" />,
  HelmValues:  <Package className="h-5 w-5 flex-shrink-0 text-purple-500" />,
};

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>((
  { commands, executingCommand, executeCommand, onAddNode, onDragStart,
    lastSavedAt, checkpoints = [], onRestoreCheckpoint, onSaveCheckpoint },
  ref
) => {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const historyRef = useRef<HTMLDivElement>(null);

  // Re-render every 30s so the "X min ago" text stays fresh
  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Close history dropdown on outside click
  useEffect(() => {
    if (!isHistoryOpen) return;
    const handler = (e: MouseEvent) => {
      if (!historyRef.current?.contains(e.target as Node)) setIsHistoryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isHistoryOpen]);

  const addResourceCommand: Command = useMemo(() => ({
    id: 'addResource',
    label: 'Add Resource',
    icon: <LucidePlus className="h-4 w-4" />,
    shortcut: ['a'],
    execute: () => setIsResourcesOpen(o => !o),
  }), []);

  useCommands([addResourceCommand]);

  const resourceGroups: Record<string, string[]> = {
    Workloads: ['Deployment', 'StatefulSet', 'DaemonSet', 'ReplicaSet', 'Job', 'CronJob'],
    Network:   ['Service', 'Ingress'],
    Config:    ['ConfigMap', 'Secret'],
    Storage:   ['StorageClass', 'PersistentVolumeClaim', 'VolumeSnapshot', 'VolumeSnapshotContent', 'VolumeSnapshotClass'],
    Helm:      ['HelmChart', 'HelmValues'],
  };

  const historyCommands = commands.filter(c => ['back', 'forward'].includes(c.id));
  const fileCommands    = commands.filter(c => ['export', 'import'].includes(c.id));
  const generalCommands = commands.filter(c => ['toggleTools', 'toggleDocs'].includes(c.id));
  const verifyCommands  = commands.filter(c => ['verify'].includes(c.id));

  const renderCommandButton = (command: Command, extraClass = '') => {
    const isExecuting = executingCommand === command.id;
    const canRun = command.canExecute ? command.canExecute() : true;
    return (
      <Button
        key={command.id}
        variant="ghost"
        size="icon"
        onClick={() => { if (canRun) executeCommand(command.id); }}
        disabled={isExecuting || !canRun}
        title={`${command.label}${command.shortcut ? ` (${command.shortcut[0].toUpperCase()})` : ''}`}
        className={`${extraClass} ${!canRun ? 'opacity-35 cursor-not-allowed' : ''}`}
      >
        {isExecuting ? <RotateCcwIcon className="h-4 w-4 animate-spin" /> : command.icon}
      </Button>
    );
  };

  // Most-recent-first slice for the dropdown
  const recentCheckpoints = [...checkpoints].reverse().slice(0, 10);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center gap-2 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
    >
      {/* Add Resource dropdown */}
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
          <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 max-h-[70vh] overflow-y-auto scrollbar-hide">
            {Object.entries(resourceGroups).map(([group, resources]) => (
              <div key={group} className="mb-3">
                <h3 className="text-xs font-semibold mb-1 px-2 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {group}
                </h3>
                <div className="space-y-0.5">
                  {resources.map((resource) => (
                    resourceRegistry[resource as keyof typeof resourceRegistry] && (
                      <Button
                        key={resource}
                        variant="ghost"
                        className="w-full justify-start text-sm gap-2 h-8 px-2"
                        onDragStart={(e) => { onDragStart(e, resource); setIsResourcesOpen(false); }}
                        onClick={() => { onAddNode(resource); setIsResourcesOpen(false); }}
                        draggable
                      >
                        {K8S_ICONS[resource] ?? <span className="h-5 w-5" />}
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

      {/* General (Tools / Docs) */}
      {generalCommands.map(c => renderCommandButton(c))}

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      {/* Back / Forward */}
      {historyCommands.map(c => renderCommandButton(c))}

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      {/* File ops: Export / Import */}
      {fileCommands.map(c => renderCommandButton(c))}

      {/* Manual save + History dropdown */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onSaveCheckpoint}
        title="Save checkpoint (manual save)"
      >
        <Save className="h-4 w-4" />
      </Button>

      <div className="relative" ref={historyRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsHistoryOpen(o => !o)}
          title="Version history"
          className={isHistoryOpen ? 'bg-gray-100 dark:bg-gray-700' : ''}
        >
          <History className="h-4 w-4" />
        </Button>

        {isHistoryOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Version History
              </span>
              {lastSavedAt && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  Last saved {formatRelativeTime(lastSavedAt)}
                </span>
              )}
            </div>
            {recentCheckpoints.length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-400 dark:text-gray-500 text-center">
                No checkpoints yet — auto-saves every 30 s
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto scrollbar-hide">
                {recentCheckpoints.map((cp, i) => (
                  <div
                    key={cp.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        {i === 0 && (
                          <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[9px] px-1 rounded font-semibold uppercase">
                            latest
                          </span>
                        )}
                        <span className={`text-[9px] px-1 rounded font-semibold uppercase ${
                          cp.type === 'manual'
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          {cp.type}
                        </span>
                        {cp.label}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {formatTime(cp.savedAt)} · {cp.snapshot.nodes.length} node{cp.snapshot.nodes.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs ml-2 flex-shrink-0"
                      onClick={() => {
                        onRestoreCheckpoint?.(cp.id);
                        setIsHistoryOpen(false);
                      }}
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* "saved X ago" inline indicator */}
      {lastSavedAt && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap hidden sm:block">
          {formatRelativeTime(lastSavedAt)}
        </span>
      )}

      {verifyCommands.length > 0 && (
        <>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          {verifyCommands.map(c =>
            renderCommandButton(c, 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950')
          )}
        </>
      )}
    </div>
  );
});
