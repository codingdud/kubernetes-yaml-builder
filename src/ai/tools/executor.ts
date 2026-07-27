import type { DiagramActions, K8sKind } from '../state/DiagramActionsContext';

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  actions: DiagramActions
): ToolExecutionResult {
  try {
    switch (toolName) {
      case 'get_diagram_state': {
        const snapshot = actions.getSnapshot();
        return { success: true, data: snapshot };
      }

      case 'add_resource': {
        const kind = args.kind as K8sKind;
        const name = args.name as string;
        const namespace = args.namespace as string | undefined;
        const spec = args.spec as Record<string, unknown> | undefined;

        const overrides: Record<string, unknown> = {
          metadata: { name, ...(namespace ? { namespace } : {}) },
        };
        if (spec) {
          overrides.spec = spec;
        }

        const nodeId = actions.addNode(kind, overrides);
        return { success: true, data: { nodeId, kind, name } };
      }

      case 'remove_resource': {
        const nodeId = args.nodeId as string;
        actions.removeNodes([nodeId]);
        return { success: true, data: { removed: nodeId } };
      }

      case 'update_resource': {
        const nodeId = args.nodeId as string;
        const patch = args.patch as Record<string, unknown>;
        actions.updateNode(nodeId, patch);
        return { success: true, data: { updated: nodeId } };
      }

      case 'connect_resources': {
        const sourceId = args.sourceId as string;
        const targetId = args.targetId as string;
        const edgeId = actions.connectNodes(sourceId, targetId);
        return { success: true, data: { edgeId, sourceId, targetId } };
      }

      case 'validate_resources': {
        const report = actions.validateDiagram();
        return { success: true, data: report };
      }

      case 'export_yaml': {
        const yamlStr = actions.generateYAML();
        return { success: true, data: { yaml: yamlStr } };
      }

      case 'import_yaml': {
        const yamlInput = args.yaml as string;
        const nodeIds = actions.importYAML(yamlInput);
        return { success: true, data: { importedNodeIds: nodeIds, count: nodeIds.length } };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
