# Feature Specification: YAML Generation & Import

**Feature Branch**: `003-yaml-generation-import`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: Generate valid Kubernetes YAML from canvas nodes; import YAML back to populate the canvas

## User Scenarios & Testing

### User Story 1 - Live YAML Preview (Priority: P1)

As the user configures resources on canvas, a code panel shows the YAML representation, updating in real time.

**Why this priority**: The YAML output is the end product of the tool. Without a live preview, users can't verify what they're building.

**Independent Test**: Add a Deployment node, set `metadata.name = nginx`, confirm the code panel shows `name: nginx` in YAML.

**Acceptance Scenarios**:

1. **Given** nodes exist on canvas, **When** user opens the preview, **Then** multi-document YAML is shown for all nodes
2. **Given** user edits a form field, **When** the change saves, **Then** YAML panel updates within 1 second
3. **Given** the YAML panel is open, **When** user clicks copy, **Then** YAML is copied to clipboard

---

### User Story 2 - Export / Download (Priority: P2)

User can download the YAML as a `.yaml` file or copy it to clipboard.

**Why this priority**: The exported file is the primary output artifact the user needs.

**Independent Test**: Click download; confirm a `.yaml` file is saved containing all canvas resource definitions.

**Acceptance Scenarios**:

1. **Given** resources on canvas, **When** user clicks download, **Then** a valid multi-document YAML file is saved
2. **Given** a single resource, **When** user copies YAML, **Then** clipboard contains valid single-document YAML

---

### User Story 3 - Import YAML (Priority: P2)

User can paste a YAML string (multi-document or single) to populate the canvas with nodes matching the parsed resources.

**Why this priority**: Allows migration of existing K8s configs into the visual builder.

**Independent Test**: Paste a valid Deployment YAML; confirm a Deployment node appears on canvas with form pre-filled from the YAML.

**Acceptance Scenarios**:

1. **Given** a valid multi-document YAML, **When** user pastes it into the import dialog, **Then** one node per document is created on canvas
2. **Given** a YAML with an unknown `kind`, **When** user imports, **Then** an error message lists unrecognized kinds
3. **Given** an invalid YAML string, **When** user imports, **Then** a parse error is shown; canvas is unchanged

---

### Edge Cases

- Multi-document YAML (separated by `---`) must create one node per document
- Resources with `kind` not in `resourceRegistry` produce an import error, not a crash

## Requirements

### Functional Requirements

- **FR-001**: System MUST serialize each node's resource object to YAML using `js-yaml`
- **FR-002**: Multi-document output MUST be separated by `---\n`
- **FR-003**: `CodePreview` component MUST show syntax-highlighted YAML with line numbers
- **FR-004**: User MUST be able to copy YAML to clipboard from `CodePreview`
- **FR-005**: User MUST be able to download YAML as a `.yaml` file
- **FR-006**: Import MUST parse YAML, match `kind` to `resourceRegistry`, and create nodes
- **FR-007**: Import of unknown kinds MUST show a user-facing error, not silently discard

## Success Criteria

- **SC-001**: YAML output for a Deployment with 3 replicas, 2 containers validates via `kubectl --dry-run=client`
- **SC-002**: Import round-trip: export YAML → clear canvas → import YAML → same nodes appear
- **SC-003**: Export handles 20+ node canvas without UI freeze

## Assumptions

- `js-yaml` v4 is the serialization library
- No server-side YAML validation — validation is client-side via `kubeValidate`
- Import creates nodes at default canvas positions (auto-layout not required)
