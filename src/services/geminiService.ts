import { GoogleGenerativeAI } from '@google/generative-ai';
import resourceRegistry from '../config/resourceRegistry';
import yamlExamples from '../data/yamlExamples.json';

export interface GenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error' | 'api-not-found';
  progress?: string;
  error?: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  constructor() {
    try {
      if (!this.apiKey) {
        console.error('VITE_GEMINI_API_KEY environment variable not set');
        return;
      }
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
    }
  }

  private buildSystemPrompt(): string {
    const schemas = Object.keys(resourceRegistry).join(', ');
    const examples = JSON.stringify(yamlExamples, null, 2);
    
    return `You are a Kubernetes YAML expert. Generate valid Kubernetes YAML based on user requirements.

AVAILABLE RESOURCES: ${schemas}

EXAMPLE YAMLS:
${examples}

RULES:
1. Always include apiVersion, kind, metadata.name
2. Use proper resource relationships and labels
3. Follow Kubernetes best practices
4. Generate realistic values, not placeholders
5. Include proper selectors for services/deployments
6. Add necessary labels for service discovery
7. Return ONLY valid YAML, no explanations
8. Separate multiple resources with ---

RESPONSE FORMAT: Return only valid YAML separated by ---`;
  }

  async generateKubernetesYAML(
    userPrompt: string,
    onStateChange: (state: GenerationState) => void
  ): Promise<string> {
    if (!this.genAI) {
      onStateChange({ status: 'api-not-found', error: 'Gemini AI not initialized' });
      throw new Error('Gemini AI service not available');
    }

    try {
      onStateChange({ status: 'generating', progress: 'Initializing AI model...' });

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });

      onStateChange({ status: 'generating', progress: 'Building context...' });

      const systemPrompt = this.buildSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}`;

      onStateChange({ status: 'generating', progress: 'Generating YAML...' });

      const result = await model.generateContent(fullPrompt);
      
      if (!result.response) {
        throw new Error('No response from AI model');
      }

      onStateChange({ status: 'generating', progress: 'Processing response...' });

      const generatedText = result.response.text();
      
      if (!generatedText || generatedText.trim().length === 0) {
        throw new Error('Empty response from AI model');
      }

      const cleanedYaml = this.cleanYamlResponse(generatedText);

      onStateChange({ status: 'completed' });
      
      return cleanedYaml;

    } catch (error: any) {
      console.error('Gemini AI Error:', error);
      
      let errorMessage = 'Unknown error occurred';
      let status: GenerationState['status'] = 'error';

      if (error.message?.includes('API_KEY')) {
        errorMessage = 'Invalid API key';
        status = 'api-not-found';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'API quota exceeded';
        status = 'api-not-found';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error - check internet connection';
        status = 'api-not-found';
      } else if (error.message?.includes('blocked')) {
        errorMessage = 'Request blocked by AI safety filters';
      } else if (error.message) {
        errorMessage = error.message;
      }

      onStateChange({ status, error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  private cleanYamlResponse(response: string): string {
    let cleaned = response.replace(/```yaml\n?/g, '').replace(/```\n?/g, '');
    
    const firstApiVersion = cleaned.indexOf('apiVersion:');
    if (firstApiVersion > 0) {
      cleaned = cleaned.substring(firstApiVersion);
    }

    const lines = cleaned.split('\n');
    let lastValidLine = lines.length - 1;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && (line.includes(':') || line.startsWith('-'))) {
        lastValidLine = i;
        break;
      }
    }

    return lines.slice(0, lastValidLine + 1).join('\n').trim();
  }

  isAvailable(): boolean {
    return this.genAI !== null;
  }
}

export const geminiService = new GeminiService();