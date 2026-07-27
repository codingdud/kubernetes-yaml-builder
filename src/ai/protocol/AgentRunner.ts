import { EventType } from '@ag-ui/core';
import type { BaseEvent } from '@ag-ui/core';
import type { ClientSideAgent, AgentInput } from '../providers/base';
import type { DiagramActions } from '../state/DiagramActionsContext';
import { DIAGRAM_TOOLS } from '../tools/definitions';
import { executeToolCall } from '../tools/executor';
import { DESTRUCTIVE_TOOLS, type PendingApproval } from './types';

interface HistoryMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  toolCalls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>;
  toolCallId?: string;
}

export interface AgentRunnerCallbacks {
  onEvent: (event: BaseEvent) => void;
  requestApproval: (pending: PendingApproval) => Promise<boolean>;
}

interface ToolCallAccumulator {
  id: string;
  name: string;
  argsBuffer: string;
}

export class AgentRunner {
  private history: HistoryMessage[] = [];
  private readonly threadId: string;
  private aborted = false;
  private agent: ClientSideAgent;
  private diagramActions: DiagramActions;
  private callbacks: AgentRunnerCallbacks;

  constructor(
    agent: ClientSideAgent,
    diagramActions: DiagramActions,
    callbacks: AgentRunnerCallbacks
  ) {
    this.agent = agent;
    this.diagramActions = diagramActions;
    this.callbacks = callbacks;
    this.threadId = crypto.randomUUID();
  }

  resetHistory(): void {
    this.history = [];
  }

  abort(): void {
    this.aborted = true;
  }

  private trimHistory(): void {
    const MAX_MESSAGES = 30;
    if (this.history.length <= MAX_MESSAGES) return;
    const trimCount = this.history.length - MAX_MESSAGES;
    const summary: HistoryMessage = {
      id: crypto.randomUUID(),
      role: 'system',
      content: '[Earlier conversation context has been summarized to save space. The assistant helped with Kubernetes resource creation and diagram manipulation.]',
    };
    this.history = [summary, ...this.history.slice(trimCount)];
  }

  async run(userText: string): Promise<void> {
    this.aborted = false;

    const userMessage: HistoryMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
    };
    this.history.push(userMessage);

    this.trimHistory();
    let continueLoop = true;

    while (continueLoop && !this.aborted) {
      continueLoop = false;

      const needsDiagramContext = /\b(add|remove|connect|create|update|show|validate|export|import|diagram|canvas|resource|node)\b/i.test(userText);
      const snapshot = this.diagramActions.getSnapshot();
      const contextValue = needsDiagramContext
        ? `Current diagram state (${snapshot.nodes.length} nodes, ${snapshot.edges.length} edges):\n${JSON.stringify(snapshot, null, 2)}`
        : `Diagram has ${snapshot.nodes.length} nodes and ${snapshot.edges.length} edges. Use get_diagram_state tool for full details.`;

      const input: AgentInput = {
        threadId: this.threadId,
        runId: crypto.randomUUID(),
        messages: [...this.history] as any[],
        tools: DIAGRAM_TOOLS,
        context: [{ description: 'Current K8s diagram state', value: contextValue }],
      };

      const toolCalls: ToolCallAccumulator[] = [];
      let textContent = '';
      let currentToolCall: ToolCallAccumulator | null = null;

      await new Promise<void>((resolve, reject) => {
        const observable = this.agent.run(input);
        const subscription = observable.subscribe({
          next: (event: BaseEvent) => {
            if (this.aborted) {
              subscription.unsubscribe();
              resolve();
              return;
            }

            this.callbacks.onEvent(event);

            switch (event.type) {
              case EventType.TEXT_MESSAGE_CONTENT: {
                const e = event as any;
                textContent += e.delta || '';
                break;
              }
              case EventType.TOOL_CALL_START: {
                const e = event as any;
                currentToolCall = { id: e.toolCallId, name: e.toolCallName, argsBuffer: '' };
                break;
              }
              case EventType.TOOL_CALL_ARGS: {
                const e = event as any;
                if (currentToolCall) {
                  currentToolCall.argsBuffer += e.delta || '';
                }
                break;
              }
              case EventType.TOOL_CALL_END: {
                if (currentToolCall) {
                  toolCalls.push(currentToolCall);
                  currentToolCall = null;
                }
                break;
              }
            }
          },
          error: (err: Error) => reject(err),
          complete: () => resolve(),
        });
      });

      if (this.aborted) return;

      if (toolCalls.length > 0) {
        const assistantMessage: HistoryMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: textContent || '',
          toolCalls: toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.name, arguments: tc.argsBuffer },
          })),
        };
        this.history.push(assistantMessage);

        for (const tc of toolCalls) {
          if (this.aborted) return;

          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.argsBuffer || '{}');
          } catch {
            args = {};
          }

          let approved = true;
          if (DESTRUCTIVE_TOOLS.has(tc.name)) {
            const description = buildApprovalDescription(tc.name, args);
            approved = await this.callbacks.requestApproval({
              toolCallId: tc.id,
              toolName: tc.name,
              args,
              description,
            });
          }

          let resultContent: string;
          if (approved) {
            const result = executeToolCall(tc.name, args, this.diagramActions);
            resultContent = JSON.stringify(result);

            this.callbacks.onEvent({
              type: EventType.TOOL_CALL_RESULT,
              toolCallId: tc.id,
              content: resultContent,
            } as BaseEvent);
          } else {
            resultContent = JSON.stringify({ success: false, error: 'User rejected this action' });
            this.callbacks.onEvent({
              type: EventType.TOOL_CALL_RESULT,
              toolCallId: tc.id,
              content: resultContent,
            } as BaseEvent);
          }

          const toolMessage: HistoryMessage = {
            id: crypto.randomUUID(),
            role: 'tool',
            content: resultContent,
            toolCallId: tc.id,
          };
          this.history.push(toolMessage);
        }

        continueLoop = true;
      } else if (textContent) {
        const assistantMessage: HistoryMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: textContent,
        };
        this.history.push(assistantMessage);
      }
    }
  }
}

function buildApprovalDescription(toolName: string, args: Record<string, unknown>): string {
  switch (toolName) {
    case 'remove_resource':
      return `Remove resource node "${args.nodeId}"${args.reason ? ` — ${args.reason}` : ''}`;
    case 'update_resource':
      return `Update resource node "${args.nodeId}" with new configuration`;
    default:
      return `Execute ${toolName}`;
  }
}
