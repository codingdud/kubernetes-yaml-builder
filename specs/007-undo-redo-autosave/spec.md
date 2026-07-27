# Feature Specification: Undo/Redo & Auto-Save

**Feature Branch**: `007-undo-redo-autosave`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: History-based undo/redo for diagram changes and automatic localStorage checkpointing to survive page refreshes

## User Scenarios & Testing

### User Story 1 - Undo / Redo Diagram Changes (Priority: P1)

After adding a node or making a form change, the user can press Ctrl+Z to undo and Ctrl+Y / Ctrl+Shift+Z to redo.

**Why this priority**: Without undo, a misclick or bad form change is permanent — a fundamental UX safety net.

**Independent Test**: Add a node, press Ctrl+Z; confirm the node is removed. Press Ctrl+Y; confirm it reappears.

**Acceptance Scenarios**:

1. **Given** a node was just added, **When** user presses Ctrl+Z, **Then** the node is removed from canvas
2. **Given** an undo was just performed, **When** user presses Ctrl+Y, **Then** the undo is reversed
3. **Given** the history is at the oldest state, **When** user presses Ctrl+Z, **Then** nothing changes (no crash)

---

### User Story 2 - Auto-Save to localStorage (Priority: P1)

Canvas state (nodes, edges, form data) is automatically saved to localStorage and restored on page reload.

**Why this priority**: Browser refreshes or crashes would destroy all work without auto-save.

**Independent Test**: Add 3 nodes, configure them, refresh the page; confirm all 3 nodes appear with their configurations intact.

**Acceptance Scenarios**:

1. **Given** nodes on canvas, **When** user refreshes the page, **Then** all nodes and their form data are restored
2. **Given** an auto-save checkpoint exists, **When** user opens the app fresh, **Then** the saved state is loaded automatically
3. **Given** the user explicitly clears the canvas, **When** page refreshes, **Then** the empty state is restored (not the old checkpoint)

---

### Edge Cases

- Undo history should be bounded (e.g., max 50 steps) to avoid unbounded memory use
- localStorage key collisions with other apps: use a namespaced key (`k8s-builder-*`)
- Corrupted localStorage data (bad JSON) should fail gracefully and start with empty canvas

## Requirements

### Functional Requirements

- **FR-001**: `useFlowHistory` hook MUST maintain an array of history snapshots (nodes + edges + form data)
- **FR-002**: Undo MUST move the history pointer back one step and restore that snapshot
- **FR-003**: Redo MUST move the history pointer forward one step
- **FR-004**: Keyboard shortcuts Ctrl+Z (undo) and Ctrl+Y / Ctrl+Shift+Z (redo) MUST be registered
- **FR-005**: Auto-save MUST write to localStorage after every meaningful state change (debounced)
- **FR-006**: On app init, MUST attempt to read and restore from localStorage checkpoint
- **FR-007**: History stack MUST be capped at a maximum depth to bound memory usage

## Success Criteria

- **SC-001**: Undo/redo cycle is lossless — state after undo+redo equals original state
- **SC-002**: Auto-save restores canvas within 500ms of page load
- **SC-003**: localStorage checkpoint survives a hard browser refresh

## Assumptions

- History snapshots are deep copies of the diagram state (not deltas/patches)
- `localStorage` is available and writable (no private-browsing fallback required)
- K8s resource schema docs modal is bundled in the same feature branch (same commit)
