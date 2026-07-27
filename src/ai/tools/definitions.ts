import resourceRegistry from '../../config/resourceRegistry';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

const resourceKinds = Object.keys(resourceRegistry);

export const DIAGRAM_TOOLS: ToolDefinition[] = [
  {
    name: 'get_diagram_state',
    description: 'Get the current state of the Kubernetes diagram including all nodes and their connections. Use this to understand what resources are currently on the canvas before making changes.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'add_resource',
    description: 'Add a new Kubernetes resource node to the diagram canvas.',
    parameters: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: resourceKinds,
          description: 'The type of Kubernetes resource to create',
        },
        name: {
          type: 'string',
          description: 'The metadata.name for the resource',
        },
        namespace: {
          type: 'string',
          description: 'The metadata.namespace for the resource (optional)',
        },
        spec: {
          type: 'object',
          description: 'Additional spec fields to set on the resource (optional)',
        },
      },
      required: ['kind', 'name'],
    },
  },
  {
    name: 'remove_resource',
    description: 'Remove a resource node from the diagram. This is destructive and requires user confirmation.',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The ID of the node to remove',
        },
        reason: {
          type: 'string',
          description: 'Why this resource should be removed',
        },
      },
      required: ['nodeId'],
    },
  },
  {
    name: 'update_resource',
    description: 'Update an existing resource node with new configuration. This modifies the resource and requires user confirmation.',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The ID of the node to update',
        },
        patch: {
          type: 'object',
          description: 'A partial object that will be deep-merged into the existing resource. For example: { "metadata": { "labels": { "app": "nginx" } }, "spec": { "replicas": 3 } }',
        },
      },
      required: ['nodeId', 'patch'],
    },
  },
  {
    name: 'connect_resources',
    description: 'Create a connection (edge) between two resource nodes to show a dependency or relationship.',
    parameters: {
      type: 'object',
      properties: {
        sourceId: {
          type: 'string',
          description: 'The ID of the source node',
        },
        targetId: {
          type: 'string',
          description: 'The ID of the target node',
        },
      },
      required: ['sourceId', 'targetId'],
    },
  },
  {
    name: 'validate_resources',
    description: 'Run validation checks on all resources in the diagram and return a report of any errors or warnings.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'export_yaml',
    description: 'Export all Kubernetes resources on the canvas as a YAML string.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'import_yaml',
    description: 'Parse a YAML string containing Kubernetes resource definitions and create nodes for each resource on the canvas.',
    parameters: {
      type: 'object',
      properties: {
        yaml: {
          type: 'string',
          description: 'Multi-document YAML string containing Kubernetes resource definitions',
        },
      },
      required: ['yaml'],
    },
  },
];
