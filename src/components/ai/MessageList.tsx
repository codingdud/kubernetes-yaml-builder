import { useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, PendingApproval } from '../../ai/protocol/types';
import { MessageBubble } from './MessageBubble';
import { Loader2, Zap } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  pendingApprovals: Map<string, PendingApproval>;
  onApproval: (toolCallId: string, approved: boolean) => void;
  isProcessing: boolean;
  onPromptSelect?: (text: string) => void;
}

const EXAMPLE_PROMPTS = [
  'Create an nginx Deployment + Service',
  'Add a HorizontalPodAutoscaler',
  'Validate my current diagram',
  'Explain Deployment vs StatefulSet',
];

export function MessageList({ messages, pendingApprovals, onApproval, isProcessing, onPromptSelect }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const prevMessageCountRef = useRef(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
    userScrolledUpRef.current = !atBottom;
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      userScrolledUpRef.current = false;
    }
    prevMessageCountRef.current = messages.length;

    if (!userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-[260px]">
          <Zap className="h-8 w-8 text-blue-400 dark:text-blue-500 mx-auto mb-3 opacity-60" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">K8s AI Agent</p>
          <div className="space-y-1.5">
            {EXAMPLE_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => onPromptSelect?.(prompt)}
                className="w-full text-left px-3 py-2 text-xs rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide"
    >
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          pendingApprovals={pendingApprovals}
          onApproval={onApproval}
        />
      ))}
      {isProcessing && !messages.some(m => m.isStreaming) && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Processing...</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
