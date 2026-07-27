import { useState, useCallback, useRef, useEffect } from 'react';
import { EventType } from '@ag-ui/core';
import type { BaseEvent } from '@ag-ui/core';
import { AgentRunner } from '../protocol/AgentRunner';
import { useAISettings } from './useAISettings';
import { useAgent } from './useAgent';
import { useDiagramActions } from '../state/DiagramActionsContext';
import type { ChatMessage, PendingApproval, ToolCallRecord, ThinkingStep } from '../protocol/types';
import { DESTRUCTIVE_TOOLS } from '../protocol/types';

export interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  stopGeneration: () => void;
  isProcessing: boolean;
  pendingApprovals: Map<string, PendingApproval>;
  handleApproval: (toolCallId: string, approved: boolean) => void;
  clearHistory: () => void;
  retryLastMessage: () => void;
  error: string | null;
}

export function useChat(): UseChatReturn {
  const { settings } = useAISettings();
  const agent = useAgent(settings);
  const diagramActions = useDiagramActions();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<Map<string, PendingApproval>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const approvalResolversRef = useRef<Map<string, (approved: boolean) => void>>(new Map());
  const runnerRef = useRef<AgentRunner | null>(null);
  const currentAssistantMsgRef = useRef<string | null>(null);
  const lastUserTextRef = useRef<string>('');

  useEffect(() => {
    runnerRef.current = null;
  }, [agent]);

  const handleApproval = useCallback((toolCallId: string, approved: boolean) => {
    const resolve = approvalResolversRef.current.get(toolCallId);
    if (resolve) {
      resolve(approved);
      approvalResolversRef.current.delete(toolCallId);
    }
    setPendingApprovals(prev => {
      const next = new Map(prev);
      next.delete(toolCallId);
      return next;
    });

    setMessages(prev => prev.map(msg => ({
      ...msg,
      toolCalls: msg.toolCalls.map(tc =>
        tc.id === toolCallId
          ? { ...tc, status: approved ? 'approved' as const : 'rejected' as const }
          : tc
      ),
    })));
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!agent) {
      setError('No AI provider configured. Please set up an API key in settings.');
      return;
    }
    if (isProcessing) return;

    setError(null);
    setIsProcessing(true);
    lastUserTextRef.current = text;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      isStreaming: false,
      thinkingSteps: [],
      toolCalls: [],
    };
    setMessages(prev => [...prev, userMsg]);

    if (!runnerRef.current) {
      runnerRef.current = new AgentRunner(agent, diagramActions, {
        onEvent: (event: BaseEvent) => handleEvent(event),
        requestApproval: (pending: PendingApproval) => {
          return new Promise<boolean>(resolve => {
            approvalResolversRef.current.set(pending.toolCallId, resolve);
            setPendingApprovals(prev => new Map(prev).set(pending.toolCallId, pending));

            setMessages(prev => prev.map(msg => {
              if (msg.id !== currentAssistantMsgRef.current) return msg;
              const existingTc = msg.toolCalls.find(tc => tc.id === pending.toolCallId);
              if (existingTc) {
                return {
                  ...msg,
                  toolCalls: msg.toolCalls.map(tc =>
                    tc.id === pending.toolCallId
                      ? { ...tc, status: 'awaiting_approval' as const }
                      : tc
                  ),
                };
              }
              return msg;
            }));
          });
        },
      });
    }

    try {
      await runnerRef.current.run(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
      setMessages(prev => prev.map(msg =>
        msg.isStreaming ? { ...msg, isStreaming: false } : msg
      ));
    }
  }, [agent, diagramActions, isProcessing]);

  const handleEvent = useCallback((event: BaseEvent) => {
    const e = event as any;

    switch (event.type) {
      case EventType.TEXT_MESSAGE_START: {
        const assistantMsg: ChatMessage = {
          id: e.messageId || crypto.randomUUID(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
          thinkingSteps: [],
          toolCalls: [],
        };
        currentAssistantMsgRef.current = assistantMsg.id;
        setMessages(prev => {
          const existing = prev.find(m => m.id === assistantMsg.id);
          if (existing) return prev;
          return [...prev, assistantMsg];
        });
        break;
      }

      case EventType.TEXT_MESSAGE_CONTENT: {
        const msgId = currentAssistantMsgRef.current;
        if (!msgId) break;
        setMessages(prev => prev.map(msg =>
          msg.id === msgId
            ? { ...msg, content: msg.content + (e.delta || '') }
            : msg
        ));
        break;
      }

      case EventType.TEXT_MESSAGE_END: {
        const msgId = currentAssistantMsgRef.current;
        if (!msgId) break;
        setMessages(prev => prev.map(msg =>
          msg.id === msgId ? { ...msg, isStreaming: false } : msg
        ));
        break;
      }

      case EventType.TOOL_CALL_START: {
        const msgId = currentAssistantMsgRef.current;
        if (!msgId) {
          const newMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
            thinkingSteps: [],
            toolCalls: [],
          };
          currentAssistantMsgRef.current = newMsg.id;
          setMessages(prev => [...prev, newMsg]);
        }

        const toolCall: ToolCallRecord = {
          id: e.toolCallId,
          toolName: e.toolCallName,
          args: {},
          status: 'pending',
          requiresApproval: DESTRUCTIVE_TOOLS.has(e.toolCallName),
        };

        setMessages(prev => prev.map(msg =>
          msg.id === currentAssistantMsgRef.current
            ? { ...msg, toolCalls: [...msg.toolCalls, toolCall] }
            : msg
        ));
        break;
      }

      case EventType.TOOL_CALL_END: {
        setMessages(prev => prev.map(msg =>
          msg.id === currentAssistantMsgRef.current
            ? {
                ...msg,
                toolCalls: msg.toolCalls.map(tc =>
                  tc.id === e.toolCallId && tc.status === 'pending'
                    ? { ...tc, status: 'executing' as const }
                    : tc
                ),
              }
            : msg
        ));
        break;
      }

      case EventType.TOOL_CALL_RESULT: {
        let result: unknown;
        try {
          result = JSON.parse(e.content || '{}');
        } catch {
          result = e.content;
        }
        const success = (result as any)?.success !== false;

        setMessages(prev => prev.map(msg => ({
          ...msg,
          toolCalls: msg.toolCalls.map(tc =>
            tc.id === e.toolCallId
              ? {
                  ...tc,
                  result,
                  status: success ? 'complete' as const : 'error' as const,
                  error: success ? undefined : (result as any)?.error,
                }
              : tc
          ),
        })));
        break;
      }

      case EventType.REASONING_START:
      case EventType.REASONING_MESSAGE_START: {
        const msgId = currentAssistantMsgRef.current;
        if (!msgId) break;
        const step: ThinkingStep = {
          id: e.messageId || crypto.randomUUID(),
          content: '',
          status: 'streaming',
        };
        setMessages(prev => prev.map(msg =>
          msg.id === msgId
            ? { ...msg, thinkingSteps: [...msg.thinkingSteps, step] }
            : msg
        ));
        break;
      }

      case EventType.REASONING_MESSAGE_CONTENT: {
        const msgId = currentAssistantMsgRef.current;
        if (!msgId) break;
        setMessages(prev => prev.map(msg =>
          msg.id === msgId
            ? {
                ...msg,
                thinkingSteps: msg.thinkingSteps.map((step, i) =>
                  i === msg.thinkingSteps.length - 1
                    ? { ...step, content: step.content + (e.delta || '') }
                    : step
                ),
              }
            : msg
        ));
        break;
      }

      case EventType.REASONING_MESSAGE_END:
      case EventType.REASONING_END: {
        const msgId = currentAssistantMsgRef.current;
        if (!msgId) break;
        setMessages(prev => prev.map(msg =>
          msg.id === msgId
            ? {
                ...msg,
                thinkingSteps: msg.thinkingSteps.map((step, i) =>
                  i === msg.thinkingSteps.length - 1
                    ? { ...step, status: 'complete' as const }
                    : step
                ),
              }
            : msg
        ));
        break;
      }

      case EventType.RUN_ERROR: {
        setError(e.message || 'An error occurred');
        break;
      }

      case EventType.RUN_STARTED: {
        break;
      }

      case EventType.RUN_FINISHED: {
        currentAssistantMsgRef.current = null;
        break;
      }
    }
  }, []);

  const stopGeneration = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.abort();
    }
    setIsProcessing(false);
    setMessages(prev => prev.map(msg =>
      msg.isStreaming ? { ...msg, isStreaming: false } : msg
    ));
  }, []);

  const retryLastMessage = useCallback(() => {
    if (!lastUserTextRef.current || isProcessing) return;
    setMessages(prev => {
      let lastAssistantIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === 'assistant') { lastAssistantIdx = i; break; }
      }
      if (lastAssistantIdx >= 0) return prev.slice(0, lastAssistantIdx);
      return prev;
    });
    setError(null);
    runnerRef.current = null;
    sendMessage(lastUserTextRef.current);
  }, [isProcessing, sendMessage]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    runnerRef.current = null;
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    stopGeneration,
    isProcessing,
    pendingApprovals,
    handleApproval,
    clearHistory,
    retryLastMessage,
    error,
  };
}
