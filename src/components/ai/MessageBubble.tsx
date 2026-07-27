import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage, PendingApproval } from '../../ai/protocol/types';
import { ThinkingSteps } from './ThinkingSteps';
import { ToolCallCard } from './ToolCallCard';
import { User, Bot, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  pendingApprovals: Map<string, PendingApproval>;
  onApproval?: (toolCallId: string, approved: boolean) => void;
}

export const MessageBubble = React.memo(function MessageBubble({ message, pendingApprovals, onApproval }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <div className={`group flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
        isUser
          ? 'bg-blue-100 dark:bg-blue-900/40'
          : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        {isUser ? (
          <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
        )}
      </div>

      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div className={`relative inline-block max-w-full text-left rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}>
          {/* Copy button for assistant messages */}
          {!isUser && message.content && !message.isStreaming && (
            <button
              onClick={handleCopy}
              className="absolute top-1.5 right-1.5 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 text-gray-400" />
              )}
            </button>
          )}

          {!isUser && message.thinkingSteps.length > 0 && (
            <ThinkingSteps steps={message.thinkingSteps} />
          )}

          {message.content && (
            <div className="break-words">
              {isUser ? (
                <span className="whitespace-pre-wrap">{message.content}</span>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-pre:bg-gray-900 prose-pre:dark:bg-gray-950 prose-code:text-xs prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-blue-400 dark:bg-blue-500 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}

          {!isUser && message.toolCalls.length > 0 && (
            <div className="mt-1">
              {message.toolCalls.map(tc => (
                <ToolCallCard
                  key={tc.id}
                  tool={tc}
                  pendingApproval={pendingApprovals.get(tc.id)}
                  onApproval={onApproval}
                />
              ))}
            </div>
          )}

          {!message.content && !message.toolCalls.length && message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-blue-400 dark:bg-blue-500 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
});
