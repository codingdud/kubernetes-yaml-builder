# Feature Specification: Visual Diagram Canvas

**Feature Branch**: `001-visual-diagram-canvas`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: Build a visual drag-and-drop canvas for composing Kubernetes resource topologies

## User Scenarios & Testing

### User Story 1 - Drag Resource onto Canvas (Priority: P1)

A user opens the sidebar, sees a list of K8s resource types, drags one onto the canvas, and a node appears where they dropped it.

**Why this priority**: Core interaction model — without drag-and-drop placement the tool has no primary UI.

**Independent Test**: Drag a Deployment from the sidebar; confirm a node labeled "Deployment" appears at the drop position.

**Acceptance Scenarios**:

1. **Given** the sidebar is visible, **When** user drags a resource type onto the canvas, **Then** a node appears at the drop position with the correct kind label
2. **Given** a node exists, **When** user clicks it, **Then** a configuration form slides open
3. **Given** multiple nodes exist, **When** user pans/zooms, **Then** all nodes remain interactive

---

### User Story 2 - Connect Resources (Priority: P2)

A user draws an edge between two nodes to express a dependency (e.g., Deployment → Service).

**Why this priority**: Topology visualization requires connections; a canvas of isolated nodes has no more value than a list.

**Independent Test**: Create two nodes, drag from one handle to the other; confirm a styled edge appears.

**Acceptance Scenarios**:

1. **Given** two nodes on canvas, **When** user drags from a source handle to a target node, **Then** a DataEdge appears connecting them
2. **Given** a connection exists, **When** user deletes it, **Then** the edge is removed without affecting nodes

---

### User Story 3 - Canvas Controls (Priority: P3)

Fit-view, zoom in/out, and mini-map allow navigation on large diagrams.

**Why this priority**: Usability for complex topologies, not MVP-blocking.

**Independent Test**: Add 10+ nodes; click "Fit View" and confirm all nodes are visible.

**Acceptance Scenarios**:

1. **Given** nodes spread across a large area, **When** user clicks fit-view, **Then** viewport adjusts to show all nodes
2. **Given** the diagram is zoomed in, **When** user scrolls, **Then** zoom changes smoothly

---

### Edge Cases

- What happens when user drops onto an existing node? (drop is ignored; existing node not affected)
- How does the canvas handle 50+ nodes? (ReactFlow virtualizes — verified by rendering test)

## Requirements

### Functional Requirements

- **FR-001**: System MUST render a full-viewport ReactFlow canvas
- **FR-002**: Sidebar MUST list all resource kinds from `resourceRegistry`
- **FR-003**: System MUST support drag-and-drop from sidebar to canvas via `DnDContext`
- **FR-004**: Dropped nodes MUST use `ResourceNode` component with kind-specific icon + label
- **FR-005**: System MUST support drawing edges between node handles
- **FR-006**: Custom `DataEdge` MUST render with project styling (animated, colored)
- **FR-007**: Canvas controls MUST include: zoom in/out, fit view, lock toggle

### Key Entities

- **ResourceNode**: Renders a K8s resource on canvas; shows kind, name, status indicators
- **DataEdge**: Styled animated edge between two resource nodes
- **DnDContext**: React context providing drag type + drop handler

## Success Criteria

### Measurable Outcomes

- **SC-001**: A resource node can be placed in under 2 seconds from drag-start to drop
- **SC-002**: Canvas supports 20+ nodes without visible lag on modern desktop browser
- **SC-003**: All 17 resource kinds from `resourceRegistry` are draggable from the sidebar

## Assumptions

- Desktop-only (mobile shows a blocking overlay)
- ReactFlow `@xyflow/react` v12 is the diagram library
- No persistence of layout positions beyond auto-save localStorage
