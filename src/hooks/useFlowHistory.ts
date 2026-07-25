import { useState, useCallback, useEffect, useRef } from 'react';
import type { Node, Edge, ReactFlowInstance, Viewport } from '@xyflow/react';

export interface FlowSnapshot {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
}

export interface FlowCheckpoint {
  id: string;
  label: string;
  type: 'auto' | 'manual';
  savedAt: string;
  snapshot: FlowSnapshot;
}

const STORAGE_HISTORY_KEY = 'kubernetes-yaml-flow-history';
const STORAGE_FLOW_KEY = 'kubernetes-yaml-flow';
const MAX_UNDO = 50;
const DEBOUNCE_MS = 1000;

function loadCheckpoints(): FlowCheckpoint[] {
  try {
    const s = localStorage.getItem(STORAGE_HISTORY_KEY);
    return s ? (JSON.parse(s) as FlowCheckpoint[]) : [];
  } catch {
    return [];
  }
}

interface UseFlowHistoryOptions {
  maxAutoSaves?: number;
  maxManualSaves?: number;
  autoSaveMs?: number;
}

export function useFlowHistory(
  rfInstance: ReactFlowInstance | null,
  onRestore: (snapshot: FlowSnapshot) => void,
  options?: UseFlowHistoryOptions
) {
  const maxAutoSaves   = options?.maxAutoSaves   ?? 5;
  const maxManualSaves = options?.maxManualSaves ?? 5;
  const autoSaveMs     = options?.autoSaveMs     ?? 30_000;

  // ── In-memory undo/redo ──────────────────────────────────────────────────
  const [undoStack, setUndoStack] = useState<FlowSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<FlowSnapshot[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoring = useRef(false);

  // Leading-edge debounce: capture the first snapshot in each burst (= state BEFORE the change),
  // then ignore subsequent calls until the burst ends. This ensures undo goes back to the state
  // before the interaction started, not the state at the end of it.
  const pushSnapshot = useCallback((snapshot: FlowSnapshot) => {
    if (isRestoring.current) return;
    if (!debounceTimer.current) {
      setUndoStack(prev => [...prev.slice(-(MAX_UNDO - 1)), snapshot]);
      setRedoStack([]);
    } else {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
    }, DEBOUNCE_MS);
  }, []);

  const undo = useCallback(() => {
    if (!rfInstance || undoStack.length === 0) return;
    const current = rfInstance.toObject() as FlowSnapshot;
    const target = undoStack[undoStack.length - 1];
    isRestoring.current = true;
    setRedoStack(prev => [...prev, current]);
    setUndoStack(prev => prev.slice(0, -1));
    onRestore(target);
    setTimeout(() => { isRestoring.current = false; }, 100);
  }, [rfInstance, undoStack, onRestore]);

  const redo = useCallback(() => {
    if (!rfInstance || redoStack.length === 0) return;
    const current = rfInstance.toObject() as FlowSnapshot;
    const target = redoStack[redoStack.length - 1];
    isRestoring.current = true;
    setUndoStack(prev => [...prev, current]);
    setRedoStack(prev => prev.slice(0, -1));
    onRestore(target);
    setTimeout(() => { isRestoring.current = false; }, 100);
  }, [rfInstance, redoStack, onRestore]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // ── Checkpoint system (localStorage) ────────────────────────────────────
  const [checkpoints, setCheckpoints] = useState<FlowCheckpoint[]>(loadCheckpoints);

  const saveCheckpoint = useCallback((label = 'Auto-save') => {
    if (!rfInstance) return;
    const { nodes, edges, viewport } = rfInstance.toObject() as FlowSnapshot;
    const cpType: 'auto' | 'manual' = label === 'Manual save' ? 'manual' : 'auto';
    const cp: FlowCheckpoint = {
      id: `v_${Date.now()}`,
      label,
      type: cpType,
      savedAt: new Date().toISOString(),
      snapshot: { nodes, edges, viewport },
    };
    setCheckpoints(prev => {
      const autoSaves   = prev.filter(c => c.type === 'auto');
      const manualSaves = prev.filter(c => c.type === 'manual');
      const newAuto   = cpType === 'auto'   ? [...autoSaves.slice(-(maxAutoSaves - 1)),   cp] : autoSaves;
      const newManual = cpType === 'manual' ? [...manualSaves.slice(-(maxManualSaves - 1)), cp] : manualSaves;
      // Merge sorted oldest→newest so the last entry is always the newest
      const next = [...newAuto, ...newManual].sort((a, b) => a.savedAt.localeCompare(b.savedAt));
      try { localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(next)); } catch { /* storage full */ }
      try { localStorage.setItem(STORAGE_FLOW_KEY, JSON.stringify({ ...cp.snapshot, lastSaved: cp.savedAt })); } catch { /* storage full */ }
      return next;
    });
  }, [rfInstance, maxAutoSaves, maxManualSaves]);

  const restoreCheckpoint = useCallback((id: string) => {
    const cp = checkpoints.find(c => c.id === id);
    if (!cp) return;
    isRestoring.current = true;
    setUndoStack([]);
    setRedoStack([]);
    onRestore(cp.snapshot);
    setTimeout(() => { isRestoring.current = false; }, 100);
  }, [checkpoints, onRestore]);

  // Auto-save interval
  useEffect(() => {
    if (!rfInstance) return;
    const id = setInterval(() => saveCheckpoint('Auto-save'), autoSaveMs);
    return () => clearInterval(id);
  }, [rfInstance, saveCheckpoint, autoSaveMs]);

  const lastSavedAt = checkpoints.length > 0 ? checkpoints[checkpoints.length - 1].savedAt : null;

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    checkpoints,
    saveCheckpoint,
    restoreCheckpoint,
    lastSavedAt,
  };
}
