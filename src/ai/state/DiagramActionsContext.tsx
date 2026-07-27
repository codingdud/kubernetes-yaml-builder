import { createContext, useContext } from 'react';
import type { DiagramSnapshot } from '../protocol/types';
import type { ValidationReport } from '../../utils/kubeValidate';
import type resourceRegistry from '../../config/resourceRegistry';

export type K8sKind = keyof typeof resourceRegistry;

export interface DiagramActions {
  addNode: (kind: K8sKind, overrides?: Record<string, unknown>, position?: { x: number; y: number }) => string;
  removeNodes: (nodeIds: string[]) => void;
  updateNode: (nodeId: string, patch: Record<string, unknown>) => void;
  connectNodes: (sourceId: string, targetId: string) => string;
  getSnapshot: () => DiagramSnapshot;
  generateYAML: () => string;
  importYAML: (yaml: string) => string[];
  validateDiagram: () => ValidationReport;
}

export const DiagramActionsContext = createContext<DiagramActions | null>(null);

export function useDiagramActions(): DiagramActions {
  const ctx = useContext(DiagramActionsContext);
  if (!ctx) throw new Error('useDiagramActions must be used inside FlowEditorInner');
  return ctx;
}
