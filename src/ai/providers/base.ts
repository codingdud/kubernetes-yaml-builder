import { Observable, Subscriber } from 'rxjs';
import { EventType } from '@ag-ui/core';
import type { BaseEvent, Message } from '@ag-ui/core';
import resourceRegistry from '../../config/resourceRegistry';
import type { ToolDefinition } from '../tools/definitions';

export interface ClientSideAgentConfig {
  apiKey: string;
  model: string;
}

export interface AgentInput {
  threadId: string;
  runId: string;
  messages: Message[];
  tools: ToolDefinition[];
  context: Array<{ description: string; value: string }>;
}

export abstract class ClientSideAgent {
  protected config: ClientSideAgentConfig;

  constructor(config: ClientSideAgentConfig) {
    this.config = config;
  }

  abstract run(input: AgentInput): Observable<BaseEvent>;

  protected buildSystemPrompt(context?: Array<{ description: string; value: string }>): string {
    const resourceKinds = Object.keys(resourceRegistry).join(', ');
    let prompt = `You are a Kubernetes expert and visual diagram assistant for a K8s YAML Builder application.

Available resource types you can create: ${resourceKinds}

You have tools to read and modify the diagram. Guidelines:
- Use get_diagram_state first to understand what's currently on the canvas
- When creating resources, always provide a meaningful name
- For destructive operations (remove, update), explain what you plan to do first
- When asked to create multi-resource architectures, add all resources then connect related ones
- Keep responses concise but informative
- If validation finds issues, explain them clearly with fix suggestions

The diagram state shows node IDs (use these for connect_resources, remove_resource, update_resource), kinds, names, and full resource specs.`;

    if (context?.length) {
      prompt += '\n\n' + context.map(c => `${c.description}:\n${c.value}`).join('\n\n');
    }

    return prompt;
  }

  protected newId(): string {
    return crypto.randomUUID();
  }
}

export { Observable, Subscriber, EventType };
export type { BaseEvent, Message };
