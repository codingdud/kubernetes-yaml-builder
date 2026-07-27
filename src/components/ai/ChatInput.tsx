import { useState, useCallback, useRef } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  disabled: boolean;
}

export function ChatInput({ onSend, onStop, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [text, disabled, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-2">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => { setText(e.target.value); adjustHeight(); }}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your K8s resources..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 max-h-[160px] overflow-y-auto"
        />
        {disabled && onStop ? (
          <button
            onClick={onStop}
            className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            title="Stop generation"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={disabled || !text.trim()}
            className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="text-[10px] text-gray-400 mt-1 px-1">Enter to send · Shift+Enter for newline</p>
    </div>
  );
}
