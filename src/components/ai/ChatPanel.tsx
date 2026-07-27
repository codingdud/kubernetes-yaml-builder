import { useState, useCallback } from 'react';
import { Settings, Trash2, AlertCircle, RotateCcw } from 'lucide-react';
import { useChat } from '../../ai/hooks/useChat';
import { useAISettings } from '../../ai/hooks/useAISettings';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ProviderSettings } from './ProviderSettings';

const PROVIDER_BADGES: Record<string, string> = {
  gemini: 'Gemini',
  anthropic: 'Claude',
  openai: 'OpenAI',
};

export default function ChatPanel() {
  const { settings } = useAISettings();
  const hasApiKey = !!settings[settings.activeProvider].apiKey;
  const [showSettings, setShowSettings] = useState(!hasApiKey);
  const [clearPending, setClearPending] = useState(false);

  const {
    messages,
    sendMessage,
    stopGeneration,
    isProcessing,
    pendingApprovals,
    handleApproval,
    clearHistory,
    retryLastMessage,
    error,
  } = useChat();

  const handleClear = useCallback(() => {
    if (!clearPending) {
      setClearPending(true);
      setTimeout(() => setClearPending(false), 4000);
    } else {
      clearHistory();
      setClearPending(false);
    }
  }, [clearPending, clearHistory]);

  if (showSettings) {
    return <ProviderSettings onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            {PROVIDER_BADGES[settings.activeProvider]}
          </span>
          <span className="text-[10px] text-gray-400">{settings[settings.activeProvider].model}</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className={`p-1 rounded transition-colors ${
                clearPending
                  ? 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={clearPending ? 'Click again to confirm' : 'Clear chat'}
            >
              <Trash2 className={`h-3.5 w-3.5 ${clearPending ? 'text-red-500' : 'text-gray-500'}`} />
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="AI Settings"
          >
            <Settings className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-400 flex-1 line-clamp-3">{error}</p>
          <button
            onClick={retryLastMessage}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        pendingApprovals={pendingApprovals}
        onApproval={handleApproval}
        isProcessing={isProcessing}
        onPromptSelect={sendMessage}
      />

      {/* Input */}
      <ChatInput onSend={sendMessage} onStop={stopGeneration} disabled={isProcessing} />
    </div>
  );
}
