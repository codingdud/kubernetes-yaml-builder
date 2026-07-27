import type { AISettings } from '../protocol/types';
import type { ClientSideAgent } from './base';
import { GeminiAgent } from './gemini';
import { AnthropicAgent } from './anthropic';
import { OpenAIAgent } from './openai';

export function createAgent(settings: AISettings): ClientSideAgent {
  const { activeProvider } = settings;
  const config = settings[activeProvider];

  if (!config.apiKey) {
    throw new Error(`No API key configured for ${activeProvider}`);
  }

  switch (activeProvider) {
    case 'gemini':
      return new GeminiAgent(config);
    case 'anthropic':
      return new AnthropicAgent(config);
    case 'openai':
      return new OpenAIAgent(config);
  }
}
