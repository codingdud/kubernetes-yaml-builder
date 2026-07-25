import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Package } from 'lucide-react';
import {
  K8sDeployment, K8sStatefulset, K8sDaemonset, K8sJob, K8sCronjob,
  K8sService, K8sIngress, K8sConfigmap, K8sSecret, K8sReplicaset,
  K8sStorageclass, K8sPersistentvolume, K8sPersistentvolumeclaim,
} from '@thesvg/react';
import type { Node } from '@xyflow/react';
import CodePreview from '../ui/CodePreview';
import HelmPreview from '../ui/HelmPreview';
import resourceRegistry from '../../config/resourceRegistry';
import { useDnD } from './DnDContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import AIAssistant from '../ai/AIAssistant';
import type { HelmTemplateNode } from '../../data/helmStarterTemplates';

interface SidebarProps {
  onAddNode: (kind: keyof typeof resourceRegistry) => void;
  yaml: string;
  nodes?: Node[];
  onCollapseChange: (collapsed: boolean) => void;
  onImportYaml: (yaml: string) => string[];
  onRemoveNodes?: (nodeIds: string[]) => void;
  onNotification?: (message: string, type?: 'success' | 'error') => void;
  diagramNodes?: Array<{ id: string; data: { label: string; formData: any; resourceType: string } }>;
  onAddTemplate?: (items: HelmTemplateNode[]) => void;
  sidebarWidth?: number;
}


const Sidebar: React.FC<SidebarProps> = ({
  onAddNode,
  yaml,
  nodes = [],
  onCollapseChange,
  onImportYaml,
  onRemoveNodes,
  onNotification,
  diagramNodes,
  onAddTemplate,
  sidebarWidth,
}) => {
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
    <div
      className="bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto scrollbar-hide relative flex-shrink-0"
      style={{ width: sidebarWidth ?? 320 }}
    >
      <div className="p-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Resources</h3>
          <button
            onClick={() => toggleCollapse(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Collapse sidebar"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Resource buttons */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Click to add or drag to canvas</p>
          <div className="grid grid-cols-7 gap-1">
            {([
              { kind: 'Deployment',  icon: <K8sDeployment  className="h-8 w-8" />, label: 'Deploy' },
              { kind: 'StatefulSet', icon: <K8sStatefulset className="h-8 w-8" />, label: 'Stateful' },
              { kind: 'DaemonSet',   icon: <K8sDaemonset   className="h-8 w-8" />, label: 'Daemon' },
              { kind: 'Job',         icon: <K8sJob         className="h-8 w-8" />, label: 'Job' },
              { kind: 'ReplicaSet',  icon: <K8sReplicaset  className="h-8 w-8" />, label: 'Replica' },
              { kind: 'CronJob',     icon: <K8sCronjob     className="h-8 w-8" />, label: 'CronJob' },
              { kind: 'Service',     icon: <K8sService     className="h-8 w-8" />, label: 'Service' },
              { kind: 'Ingress',     icon: <K8sIngress     className="h-8 w-8" />, label: 'Ingress' },
              { kind: 'ConfigMap',   icon: <K8sConfigmap   className="h-8 w-8" />, label: 'Config' },
              { kind: 'Secret',      icon: <K8sSecret      className="h-8 w-8" />, label: 'Secret' },
              { kind: 'StorageClass',        icon: <K8sStorageclass          className="h-8 w-8" />, label: 'Storage' },
              { kind: 'PersistentVolumeClaim', icon: <K8sPersistentvolumeclaim className="h-8 w-8" />, label: 'PVC' },
              { kind: 'VolumeSnapshot',      icon: <K8sPersistentvolume className="h-8 w-8" />, label: 'Snapshot' },
              { kind: 'VolumeSnapshotContent', icon: <K8sPersistentvolume className="h-8 w-8" />, label: 'SnapCont' },
              { kind: 'VolumeSnapshotClass', icon: <K8sPersistentvolume className="h-8 w-8" />, label: 'SnapClass' },
              { kind: 'HelmChart',   icon: <Package        className="h-8 w-8 text-blue-500" />, label: 'Helm' },
              { kind: 'HelmValues',  icon: <Package        className="h-8 w-8 text-purple-500" />, label: 'Values' },
            ] as { kind: string; icon: React.ReactNode; label: string }[]).map(({ kind, icon, label }) => (
              resourceRegistry[kind as keyof typeof resourceRegistry] && (
                <button
                  key={kind}
                  title={`Add ${kind}`}
                  onClick={() => onAddNode(kind as keyof typeof resourceRegistry)}
                  onDragStart={(event) => onDragStart(event, kind)}
                  draggable
                  className="flex flex-col items-center gap-1 p-0 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors"
                >
                  {icon}
                  <span className="text-[10px] text-gray-600 dark:text-gray-300 leading-tight">{label}</span>
                </button>
              )
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="generated-yaml" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generated-yaml" className="text-xs">YAML</TabsTrigger>
            <TabsTrigger value="import-yaml" className="text-xs">Import</TabsTrigger>
            <TabsTrigger value="ai-generate" className="text-xs">
              AI <Sparkles className="h-3.5 w-3.5 ml-0.5" />
            </TabsTrigger>
            <TabsTrigger value="helm" className="text-xs">
              Helm <Package className="h-3.5 w-3.5 ml-0.5" />
            </TabsTrigger>
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
              <Button
                onClick={() => {
                  if (!yamlInput.trim()) {
                    onNotification?.('Please enter YAML content first');
                    return;
                  }
                  const trimmedYaml = yamlInput.trim();
                  if (!trimmedYaml.includes('apiVersion') || !trimmedYaml.includes('kind')) {
                    onNotification?.('Invalid YAML: Missing required Kubernetes fields (apiVersion, kind)');
                    return;
                  }
                  try {
                    onImportYaml(yamlInput);
                  } catch {
                    onNotification?.('YAML file format is not correct');
                  }
                }}
                size="sm"
              >
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

          <TabsContent value="helm" className="h-full mt-2">
            <HelmPreview nodes={nodes} onSelectTemplate={onAddTemplate ?? (() => {})} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Sidebar;
