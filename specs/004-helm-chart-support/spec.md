# Feature Specification: Helm Chart Support

**Feature Branch**: `004-helm-chart-support`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: Visual support for Helm charts — Chart.yaml authoring, values file editing, and auto-sync between values and resource templates

## User Scenarios & Testing

### User Story 1 - Author Chart.yaml via HelmChart Node (Priority: P1)

A user drags a HelmChart node onto the canvas, fills in chart name, version, description, and type, and gets a valid `Chart.yaml` in the YAML preview.

**Why this priority**: Helm is the most common K8s packaging format. Supporting it requires a dedicated Chart.yaml node.

**Independent Test**: Add HelmChart node, set name to `my-app`, version to `1.0.0`; YAML preview shows valid `Chart.yaml` structure.

**Acceptance Scenarios**:

1. **Given** a HelmChart node, **When** user fills name + version, **Then** preview shows `apiVersion: v2` Chart.yaml
2. **Given** chart type is `library`, **When** YAML generates, **Then** output includes `type: library`

---

### User Story 2 - Edit values.yaml via HelmValues Node (Priority: P1)

A user adds a HelmValues node, types YAML into the values editor, and the values are validated as valid YAML on save.

**Why this priority**: `values.yaml` is the primary customization surface of a Helm chart.

**Independent Test**: Add HelmValues node, type `replicaCount: 3` into the editor; YAML preview shows this in the values output.

**Acceptance Scenarios**:

1. **Given** a HelmValues node, **When** user types valid YAML into the widget, **Then** values are saved to the node
2. **Given** invalid YAML in the values widget, **When** user blurs the field, **Then** a parse error is shown inline

---

### User Story 3 - Auto-Sync Values to Resource Nodes (Priority: P2)

When `autoSync` is enabled on the HelmValues node, values defined in `values.yaml` are surfaced in the form of connected resource nodes (e.g., `{{ .Values.replicaCount }}` placeholder).

**Why this priority**: Auto-sync bridges the values file and the template resources, reducing duplicate configuration.

**Independent Test**: Enable autoSync on HelmValues, connect it to a Deployment node; confirm the sync context is propagated via `HelmSyncContext`.

**Acceptance Scenarios**:

1. **Given** autoSync enabled + HelmValues connected to Deployment, **When** values change, **Then** `HelmSyncContext` emits the updated values
2. **Given** autoSync disabled, **When** values change, **Then** no sync events are emitted

---

### User Story 4 - Helm Starter Templates (Priority: P3)

A user picks a starter template (e.g., "Web App", "Worker") to bootstrap a common chart structure on the canvas in one click.

**Why this priority**: Reduces time-to-first-chart for common patterns.

**Independent Test**: Select "Web App" starter; confirm Deployment + Service + Ingress + HelmChart + HelmValues nodes appear on canvas.

**Acceptance Scenarios**:

1. **Given** the starter templates panel, **When** user selects a template, **Then** multiple resource nodes are placed on canvas
2. **Given** a loaded starter, **When** user inspects forms, **Then** each node has sensible default values pre-filled

---

### Edge Cases

- HelmValues with `autoSync: false` must not pollute the HelmSyncContext
- Chart name with special characters should be rejected by form validation

## Requirements

### Functional Requirements

- **FR-001**: `HelmChart` node MUST generate a valid `Chart.yaml` (apiVersion v2)
- **FR-002**: `HelmValues` node MUST expose a textarea-based `HelmValuesWidget` for editing raw YAML
- **FR-003**: `HelmValues` MUST expose `autoSync` boolean toggle
- **FR-004**: `HelmSyncContext` MUST distribute parsed values to consuming components when autoSync is on
- **FR-005**: `helmGenerator.ts` MUST produce the values YAML from the `HelmValues` node data
- **FR-006**: Starter templates in `helmStarterTemplates.ts` MUST produce at minimum 3 templates
- **FR-007**: `HelmChart` and `HelmValues` MUST be registered in `resourceRegistry`

## Success Criteria

- **SC-001**: HelmChart node output is valid `Chart.yaml` parseable by `helm lint`
- **SC-002**: HelmValues + HelmChart together produce a skeleton chart that `helm template` can render
- **SC-003**: Auto-sync propagation latency < 100ms after values change

## Assumptions

- No actual `helm` binary on the client — validation is structural, not `helm lint`
- `cron-parser` + `cronstrue` are used for CronJob display, not Helm
- Starter templates are static data, not fetched from an external registry
