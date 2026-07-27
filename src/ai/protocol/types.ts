export type AIProvider = 'gemini' | 'anthropic' | 'openai';

export interface AIProviderConfig {
  apiKey: string;
  model: string;
}

export interface AISettings {
  activeProvider: AIProvider;
  gemini: AIProviderConfig;
  anthropic: AIProviderConfig;
  openai: AIProviderConfig;
}

export interface DiagramNodeSnapshot {
  id: string;
  kind: string;
  name: string;
  namespace?: string;
  resource: Record<string, unknown>;
}

export interface DiagramEdgeSnapshot {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DiagramSnapshot {
  nodes: DiagramNodeSnapshot[];
  edges: DiagramEdgeSnapshot[];
}

export type ThinkingStepStatus = 'streaming' | 'complete';

export interface ThinkingStep {
  id: string;
  content: string;
  status: ThinkingStepStatus;
}

export type ToolCallStatus =
  | 'pending'
  | 'executing'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'complete'
  | 'error';

export interface ToolCallRecord {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
  status: ToolCallStatus;
  requiresApproval: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming: boolean;
  thinkingSteps: ThinkingStep[];
  toolCalls: ToolCallRecord[];
}

export interface PendingApproval {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  description: string;
}

export const DESTRUCTIVE_TOOLS = new Set(['remove_resource', 'update_resource']);

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-2.5-flash',
  anthropic: 'claude-sonnet-4-5-20241022',
  openai: 'gpt-4o',
};

export const MODEL_OPTIONS: Record<AIProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  anthropic: ['claude-sonnet-4-5-20241022', 'claude-3-5-sonnet-20241022'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
};

export const DEFAULT_SETTINGS: AISettings = {
  activeProvider: 'gemini',
  gemini: { apiKey: '', model: DEFAULT_MODELS.gemini },
  anthropic: { apiKey: '', model: DEFAULT_MODELS.anthropic },
  openai: { apiKey: '', model: DEFAULT_MODELS.openai },
};
