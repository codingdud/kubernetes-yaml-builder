import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { ClientSideAgent, Observable, Subscriber, EventType, type ClientSideAgentConfig, type AgentInput, type BaseEvent, type Message } from './base';

export class OpenAIAgent extends ClientSideAgent {
  constructor(config: ClientSideAgentConfig) {
    super(config);
  }

  run(input: AgentInput): Observable<BaseEvent> {
    return new Observable((subscriber: Subscriber<BaseEvent>) => {
      this.executeRun(input, subscriber).catch(err => {
        subscriber.next({
          type: EventType.RUN_ERROR,
          message: err.message || String(err),
        } as BaseEvent);
        subscriber.complete();
      });
    });
  }

  private async executeRun(input: AgentInput, subscriber: Subscriber<BaseEvent>) {
    const client = new OpenAI({ apiKey: this.config.apiKey, dangerouslyAllowBrowser: true });

    const tools = input.tools || [];
    const openaiTools: ChatCompletionTool[] = tools.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const messages = this.convertMessages(input.messages || []);
    const runId = this.newId();
    subscriber.next({ type: EventType.RUN_STARTED, runId, threadId: input.threadId } as BaseEvent);

    const msgId = this.newId();
    let hasTextContent = false;

    const toolCallBuffers = new Map<number, { id: string; name: string; args: string }>();

    const stream = await client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: this.buildSystemPrompt(input.context) },
        ...messages,
      ],
      tools: openaiTools.length > 0 ? openaiTools : undefined,
      stream: true,
    });

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (!choice) continue;

      const delta = choice.delta;

      if (delta?.content) {
        if (!hasTextContent) {
          hasTextContent = true;
          subscriber.next({ type: EventType.TEXT_MESSAGE_START, messageId: msgId, role: 'assistant' } as BaseEvent);
        }
        subscriber.next({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: msgId, delta: delta.content } as BaseEvent);
      }

      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          if (!toolCallBuffers.has(idx)) {
            const toolCallId = tc.id || this.newId();
            toolCallBuffers.set(idx, { id: toolCallId, name: tc.function?.name || '', args: '' });
            subscriber.next({
              type: EventType.TOOL_CALL_START,
              toolCallId,
              toolCallName: tc.function?.name || '',
            } as BaseEvent);
          }

          const buffer = toolCallBuffers.get(idx)!;
          if (tc.function?.name && !buffer.name) {
            buffer.name = tc.function.name;
          }
          if (tc.function?.arguments) {
            buffer.args += tc.function.arguments;
            subscriber.next({
              type: EventType.TOOL_CALL_ARGS,
              toolCallId: buffer.id,
              delta: tc.function.arguments,
            } as BaseEvent);
          }
        }
      }

      if (choice.finish_reason === 'tool_calls' || choice.finish_reason === 'stop') {
        for (const [, buffer] of toolCallBuffers) {
          subscriber.next({
            type: EventType.TOOL_CALL_END,
            toolCallId: buffer.id,
          } as BaseEvent);
        }
      }
    }

    if (hasTextContent) {
      subscriber.next({ type: EventType.TEXT_MESSAGE_END, messageId: msgId } as BaseEvent);
    }

    subscriber.next({ type: EventType.RUN_FINISHED, runId, threadId: input.threadId } as BaseEvent);
    subscriber.complete();
  }

  private convertMessages(messages: Message[]): ChatCompletionMessageParam[] {
    const result: ChatCompletionMessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        result.push({ role: 'system', content: typeof msg.content === 'string' ? msg.content : '' });
      } else if (msg.role === 'user') {
        result.push({ role: 'user', content: typeof msg.content === 'string' ? msg.content : '' });
      } else if (msg.role === 'assistant') {
        if ((msg as any).toolCalls?.length > 0) {
          result.push({
            role: 'assistant',
            content: typeof msg.content === 'string' ? msg.content : null,
            tool_calls: (msg as any).toolCalls.map((tc: any) => ({
              id: tc.id,
              type: 'function' as const,
              function: {
                name: tc.function?.name || tc.name,
                arguments: typeof tc.function?.arguments === 'string'
                  ? tc.function.arguments
                  : JSON.stringify(tc.args || {}),
              },
            })),
          });
        } else {
          result.push({ role: 'assistant', content: typeof msg.content === 'string' ? msg.content : '' });
        }
      } else if (msg.role === 'tool') {
        const toolCallId = (msg as any).toolCallId || '';
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        result.push({ role: 'tool', tool_call_id: toolCallId, content });
      }
    }

    return result;
  }
}
