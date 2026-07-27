import { GoogleGenerativeAI, type Content, type FunctionDeclaration, type Part } from '@google/generative-ai';
import { ClientSideAgent, Observable, Subscriber, EventType, type ClientSideAgentConfig, type AgentInput, type BaseEvent, type Message } from './base';

export class GeminiAgent extends ClientSideAgent {
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
    const genAI = new GoogleGenerativeAI(this.config.apiKey);
    const model = genAI.getGenerativeModel({
      model: this.config.model,
      systemInstruction: this.buildSystemPrompt(input.context),
    });

    const tools = input.tools || [];
    const functionDeclarations: FunctionDeclaration[] = tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters as any,
    }));

    const history = this.convertMessages(input.messages || []);
    const lastMessage = history.pop();

    const runId = this.newId();
    subscriber.next({ type: EventType.RUN_STARTED, runId, threadId: input.threadId } as BaseEvent);

    const chat = model.startChat({
      history,
      tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const msgId = this.newId();
    let hasTextContent = false;

    const result = await chat.sendMessageStream(lastMessage?.parts || [{ text: '' }]);

    for await (const chunk of result.stream) {
      const candidate = chunk.candidates?.[0];
      if (!candidate?.content?.parts) continue;

      for (const part of candidate.content.parts) {
        if ('text' in part && part.text) {
          if (!hasTextContent) {
            hasTextContent = true;
            subscriber.next({ type: EventType.TEXT_MESSAGE_START, messageId: msgId, role: 'assistant' } as BaseEvent);
          }
          subscriber.next({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: msgId, delta: part.text } as BaseEvent);
        } else if ('functionCall' in part && part.functionCall) {
          const toolCallId = this.newId();
          const argsStr = JSON.stringify(part.functionCall.args || {});
          subscriber.next({
            type: EventType.TOOL_CALL_START,
            toolCallId,
            toolCallName: part.functionCall.name,
          } as BaseEvent);
          subscriber.next({
            type: EventType.TOOL_CALL_ARGS,
            toolCallId,
            delta: argsStr,
          } as BaseEvent);
          subscriber.next({
            type: EventType.TOOL_CALL_END,
            toolCallId,
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

  private convertMessages(messages: Message[]): Content[] {
    const contents: Content[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      if (msg.role === 'user') {
        const content = typeof msg.content === 'string' ? msg.content : '';
        contents.push({ role: 'user', parts: [{ text: content }] });
      } else if (msg.role === 'assistant') {
        if ((msg as any).toolCalls?.length > 0) {
          const parts: Part[] = (msg as any).toolCalls.map((tc: any) => ({
            functionCall: {
              name: tc.function?.name || tc.name,
              args: typeof tc.function?.arguments === 'string'
                ? JSON.parse(tc.function.arguments)
                : tc.args || {},
            },
          }));
          if (typeof msg.content === 'string' && msg.content) {
            parts.unshift({ text: msg.content });
          }
          contents.push({ role: 'model', parts });
        } else {
          const content = typeof msg.content === 'string' ? msg.content : '';
          contents.push({ role: 'model', parts: [{ text: content }] });
        }
      } else if (msg.role === 'tool') {
        const toolCallId = (msg as any).toolCallId || '';
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: toolCallId,
              response: { result: content },
            },
          } as any],
        });
      }
    }

    return contents;
  }
}
