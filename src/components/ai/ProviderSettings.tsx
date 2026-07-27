import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react';
import { useAISettings } from '../../ai/hooks/useAISettings';
import { MODEL_OPTIONS, type AIProvider } from '../../ai/protocol/types';

interface ProviderSettingsProps {
  onClose: () => void;
}

const PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: 'Google Gemini',
  anthropic: 'Anthropic Claude',
  openai: 'OpenAI',
};

export function ProviderSettings({ onClose }: ProviderSettingsProps) {
  const { settings, updateSettings, updateProviderConfig } = useAISettings();
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const activeProvider = settings.activeProvider;
  const config = settings[activeProvider];

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      if (activeProvider === 'gemini') {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const model = genAI.getGenerativeModel({ model: config.model });
        await model.generateContent('Say "ok"');
      } else if (activeProvider === 'openai') {
        const OpenAI = (await import('openai')).default;
        const client = new OpenAI({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });
        await client.chat.completions.create({
          model: config.model,
          messages: [{ role: 'user', content: 'Say "ok"' }],
          max_tokens: 5,
        });
      } else if (activeProvider === 'anthropic') {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });
        await client.messages.create({
          model: config.model,
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say "ok"' }],
        });
      }
      setTestStatus('success');
    } catch {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <div className="flex flex-col h-full p-3">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-sm">AI Settings</h3>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Provider selector */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Provider</label>
          <div className="grid grid-cols-3 gap-1">
            {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map(provider => (
              <button
                key={provider}
                onClick={() => updateSettings({ activeProvider: provider })}
                className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${
                  activeProvider === provider
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {provider === 'gemini' ? 'Gemini' : provider === 'anthropic' ? 'Claude' : 'OpenAI'}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
            {PROVIDER_LABELS[activeProvider]} API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={e => updateProviderConfig(activeProvider, { apiKey: e.target.value })}
              placeholder={`Enter your ${PROVIDER_LABELS[activeProvider]} API key`}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Model selector */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Model</label>
          <select
            value={config.model}
            onChange={e => updateProviderConfig(activeProvider, { model: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MODEL_OPTIONS[activeProvider].map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Test connection */}
        <button
          onClick={testConnection}
          disabled={!config.apiKey || testStatus === 'testing'}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {testStatus === 'testing' && <span>Testing...</span>}
          {testStatus === 'success' && <><Check className="h-3 w-3 text-green-600" /> Connected</>}
          {testStatus === 'error' && <><X className="h-3 w-3 text-red-600" /> Failed</>}
          {testStatus === 'idle' && <span>Test Connection</span>}
        </button>

        {/* Warning */}
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            API keys are stored in your browser's localStorage. For personal use only.
          </p>
        </div>
      </div>
    </div>
  );
}
