import { useMemo } from 'react';
import type { AISettings } from '../protocol/types';
import type { ClientSideAgent } from '../providers/base';
import { createAgent } from '../providers/registry';

export function useAgent(settings: AISettings): ClientSideAgent | null {
  return useMemo(() => {
    const config = settings[settings.activeProvider];
    if (!config.apiKey) return null;
    try {
      return createAgent(settings);
    } catch {
      return null;
    }
  }, [
    settings.activeProvider,
    settings.gemini.apiKey,
    settings.gemini.model,
    settings.anthropic.apiKey,
    settings.anthropic.model,
    settings.openai.apiKey,
    settings.openai.model,
  ]);
}
