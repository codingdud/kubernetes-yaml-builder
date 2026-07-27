import { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react';
import { DEFAULT_SETTINGS, type AISettings, type AIProvider, type AIProviderConfig } from '../protocol/types';

const STORAGE_KEY = 'kubernetes-yaml-ai-settings';

export interface AISettingsContextValue {
  settings: AISettings;
  updateSettings: (patch: Partial<AISettings>) => void;
  updateProviderConfig: (provider: AIProvider, patch: Partial<AIProviderConfig>) => void;
}

const AISettingsContext = createContext<AISettingsContextValue | null>(null);

function loadSettings(): AISettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AISettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function AISettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<AISettings>(loadSettings);

  const updateSettings = useCallback((patch: Partial<AISettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateProviderConfig = useCallback((provider: AIProvider, patch: Partial<AIProviderConfig>) => {
    setSettings(prev => {
      const next = { ...prev, [provider]: { ...prev[provider], ...patch } };
      saveSettings(next);
      return next;
    });
  }, []);

  return (
    <AISettingsContext.Provider value={{ settings, updateSettings, updateProviderConfig }}>
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings(): AISettingsContextValue {
  const ctx = useContext(AISettingsContext);
  if (!ctx) throw new Error('useAISettings must be used within AISettingsProvider');
  return ctx;
}
