# Feature Specification: AI Diagram Manipulation Tools

**Feature Branch**: `009-ai-diagram-tools`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: AI tools that allow the LLM assistant to read and modify the diagram canvas — with human-in-the-loop confirmation for destructive operations

## User Scenarios & Testing

### User Story 1 - AI Reads Diagram State (Priority: P1)

The AI can call `get_diagram_state` to understand what resources are currently on the canvas before making any changes.

**Why this priority**: All meaningful diagram manipulation requires reading state first — this is the foundation tool.

**Independent Test**: With 2 nodes on canvas, ask AI "what's on the canvas?"; confirm it describes both nodes accurately from `get_diagram_state` output.

**Acceptance Scenarios**:

1. **Given** nodes on canvas, **When** AI calls `get_diagram_state`, **Then** tool returns a JSON list of all nodes with their kinds, names, and IDs
2. **Given** empty canvas, **When** AI calls `get_diagram_state`, **Then** tool returns an empty array, not an error

---

### User Story 2 - AI Adds Resources to Diagram (Priority: P1)

The AI can call `add_resource` to place a new resource node on the canvas on behalf of the user.

**Why this priority**: The most common AI action — "create a deployment for nginx" — requires this tool.

**Independent Test**: Ask AI "add an nginx Deployment"; confirm `add_resource` is called, a node appears on canvas with `metadata.name: nginx`.

**Acceptance Scenarios**:

1. **Given** an `add_resource` call with `kind: Deployment, name: nginx`, **When** executed, **Then** a Deployment node appears on canvas
2. **Given** an unknown resource kind, **When** AI calls `add_resource`, **Then** tool returns an error without crashing
3. **Given** the add succeeds, **When** user opens the node form, **Then** the form shows the name and any spec fields the AI provided

---

### User Story 3 - AI Removes / Updates Resources with Confirmation (Priority: P1)

`remove_resource` and `update_resource` are destructive — they require the user to click Approve before executing.

**Why this priority**: Unsupervised deletion or modification of diagram work would erode user trust in the AI assistant.

**Independent Test**: Ask AI to "delete the nginx deployment"; confirm a ToolCallCard shows with Approve/Reject buttons; clicking Reject cancels the operation.

**Acceptance Scenarios**:

1. **Given** AI calls `remove_resource`, **When** tool card shows, **Then** Approve and Reject buttons are displayed
2. **Given** user clicks Reject, **When** the rejection is processed, **Then** the node is NOT removed and AI receives a rejection message
3. **Given** user clicks Approve, **When** confirmed, **Then** the node is removed from canvas
4. **Given** AI calls `update_resource` with a patch, **When** user approves, **Then** the resource is deep-merged with the patch

---

### User Story 4 - AI Connects Resources (Priority: P2)

AI can call `connect_resources` to draw an edge between two nodes.

**Acceptance Scenarios**:

1. **Given** two nodes with known IDs, **When** AI calls `connect_resources`, **Then** a DataEdge appears between them
2. **Given** non-existent node IDs, **When** `connect_resources` is called, **Then** tool returns an error

---

### User Story 5 - AI Exports / Imports YAML (Priority: P2)

AI can call `export_yaml` to read the current YAML, or `import_yaml` to bulk-create nodes from a YAML string.

**Acceptance Scenarios**:

1. **Given** resources on canvas, **When** AI calls `export_yaml`, **Then** the full multi-document YAML string is returned
2. **Given** a YAML string from the AI, **When** `import_yaml` is called, **Then** nodes are created for each document
3. **Given** `import_yaml` requires adding nodes, **When** executed, **Then** it still requires Approve confirmation (destructive batch add)

---

### User Story 6 - AI Validates Resources (Priority: P2)

AI can call `validate_resources` to check all nodes and return a structured error report.

**Acceptance Scenarios**:

1. **Given** an invalid resource on canvas, **When** AI calls `validate_resources`, **Then** the tool returns errors by resource name
2. **Given** all valid resources, **When** AI validates, **Then** the result indicates zero errors

---

### Edge Cases

- Tool calls that fail (e.g., node not found) must return a structured error to the AI, not throw
- Approval/rejection state must be isolated per tool call card — approving one doesn't affect others
- Concurrent tool calls in a single AI response must each show separate ToolCallCards

## Requirements

### Functional Requirements

- **FR-001**: `src/ai/tools/definitions.ts` MUST define DIAGRAM_TOOLS: get_diagram_state, add_resource, remove_resource, update_resource, connect_resources, validate_resources, export_yaml, import_yaml
- **FR-002**: `src/ai/tools/executor.ts` MUST implement handlers for all 8 tools
- **FR-003**: `remove_resource` and `update_resource` handlers MUST gate on human approval before mutating state
- **FR-004**: `DiagramActionsContext` MUST expose imperative methods for each diagram mutation
- **FR-005**: Tool definitions MUST derive the `kind` enum from `Object.keys(resourceRegistry)` so new resources are auto-included
- **FR-006**: `ToolCallCard` component MUST show: tool name, arguments preview, Approve/Reject for destructive tools, result status
- **FR-007**: Tool errors MUST return `{ error: string }` to the AI (not throw), so the AI can recover gracefully

### Key Entities

- **DIAGRAM_TOOLS**: Array of `ToolDefinition` objects (name, description, JSON Schema parameters)
- **DiagramActionsContext**: React context providing `addNode`, `removeNode`, `updateNode`, `connectNodes`, `getNodes`, `getEdges`
- **executor.ts**: Maps tool name → async handler function; called by `AgentRunner` on tool call events

## Success Criteria

- **SC-001**: "Add a redis StatefulSet" results in a StatefulSet node on canvas with `metadata.name: redis`
- **SC-002**: Reject on `remove_resource` confirmation leaves the node intact
- **SC-003**: All 8 tool handlers return structured JSON (not void/undefined) to the AI

## Assumptions

- Tool definitions derive resource kinds dynamically from `resourceRegistry` — adding a new resource auto-exposes it to AI
- Human-in-the-loop confirmation is implemented via a React state gate in `ToolCallCard`, not a backend approval workflow
- `fast-json-patch` is available but deep-merge for `update_resource` uses a custom recursive merge
