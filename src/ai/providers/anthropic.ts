import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, Tool, ContentBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { ClientSideAgent, Observable, Subscriber, EventType, type ClientSideAgentConfig, type AgentInput, type BaseEvent, type Message } from './base';

export class AnthropicAgent extends ClientSideAgent {
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
    const client = new Anthropic({ apiKey: this.config.apiKey, dangerouslyAllowBrowser: true });

    const tools = input.tools || [];
    const anthropicTools: Tool[] = tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as any,
    }));

    const messages = this.convertMessages(input.messages || []);
    const runId = this.newId();
    subscriber.next({ type: EventType.RUN_STARTED, runId, threadId: input.threadId } as BaseEvent);

    const msgId = this.newId();
    let hasTextContent = false;
    let hasReasoning = false;
    const reasoningMsgId = this.newId();

    const stream = await client.messages.stream({
      model: this.config.model,
      max_tokens: 8192,
      system: this.buildSystemPrompt(input.context),
      messages,
      tools: anthropicTools.length > 0 ? anthropicTools : undefined,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        const block = event.content_block;
        if (block.type === 'text') {
          if (!hasTextContent) {
            hasTextContent = true;
            subscriber.next({ type: EventType.TEXT_MESSAGE_START, messageId: msgId, role: 'assistant' } as BaseEvent);
          }
        } else if (block.type === 'tool_use') {
          subscriber.next({
            type: EventType.TOOL_CALL_START,
            toolCallId: block.id,
            toolCallName: block.name,
          } as BaseEvent);
        } else if (block.type === 'thinking') {
          if (!hasReasoning) {
            hasReasoning = true;
            subscriber.next({ type: EventType.REASONING_START, messageId: reasoningMsgId } as BaseEvent);
            subscriber.next({ type: EventType.REASONING_MESSAGE_START, messageId: reasoningMsgId } as BaseEvent);
          }
        }
      } else if (event.type === 'content_block_delta') {
        const delta = event.delta as any;
        if (delta.type === 'text_delta') {
          subscriber.next({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: msgId, delta: delta.text } as BaseEvent);
        } else if (delta.type === 'input_json_delta') {
          subscriber.next({
            type: EventType.TOOL_CALL_ARGS,
            toolCallId: (stream as any)._currentToolCallId || this.newId(),
            delta: delta.partial_json,
          } as BaseEvent);
        } else if (delta.type === 'thinking_delta') {
          subscriber.next({
            type: EventType.REASONING_MESSAGE_CONTENT,
            messageId: reasoningMsgId,
            delta: delta.thinking,
          } as BaseEvent);
        }
      } else if (event.type === 'content_block_stop') {
        // Determine what just stopped based on current state
      } else if (event.type === 'message_start') {
        // Track the message
      } else if (event.type === 'message_delta') {
        const delta = event.delta as any;
        if (delta.stop_reason === 'tool_use') {
          // Tool calls ended - emit end events
        }
      } else if (event.type === 'message_stop') {
        // Message complete
      }
    }

    // Finalize reasoning if it was started
    if (hasReasoning) {
      subscriber.next({ type: EventType.REASONING_MESSAGE_END, messageId: reasoningMsgId } as BaseEvent);
      subscriber.next({ type: EventType.REASONING_END, messageId: reasoningMsgId } as BaseEvent);
    }

    if (hasTextContent) {
      subscriber.next({ type: EventType.TEXT_MESSAGE_END, messageId: msgId } as BaseEvent);
    }

    // Emit tool call end events for any started tool calls
    const finalMessage = await stream.finalMessage();
    for (const block of finalMessage.content) {
      if (block.type === 'tool_use') {
        subscriber.next({
          type: EventType.TOOL_CALL_ARGS,
          toolCallId: block.id,
          delta: JSON.stringify(block.input),
        } as BaseEvent);
        subscriber.next({
          type: EventType.TOOL_CALL_END,
          toolCallId: block.id,
        } as BaseEvent);
      }
    }

    subscriber.next({ type: EventType.RUN_FINISHED, runId, threadId: input.threadId } as BaseEvent);
    subscriber.complete();
  }

  private convertMessages(messages: Message[]): MessageParam[] {
    const result: MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      if (msg.role === 'user') {
        const content = typeof msg.content === 'string' ? msg.content : '';
        result.push({ role: 'user', content });
      } else if (msg.role === 'assistant') {
        if ((msg as any).toolCalls?.length > 0) {
          const content: ContentBlockParam[] = [];
          if (typeof msg.content === 'string' && msg.content) {
            content.push({ type: 'text', text: msg.content });
          }
          for (const tc of (msg as any).toolCalls) {
            content.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.function?.name || tc.name,
              input: typeof tc.function?.arguments === 'string'
                ? JSON.parse(tc.function.arguments)
                : tc.args || {},
            });
          }
          result.push({ role: 'assistant', content });
        } else {
          const content = typeof msg.content === 'string' ? msg.content : '';
          result.push({ role: 'assistant', content });
        }
      } else if (msg.role === 'tool') {
        const toolCallId = (msg as any).toolCallId || '';
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        result.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolCallId,
            content,
          }],
        });
      }
    }

    return result;
  }
}
