# Feature Specification: Resource Configuration Forms

**Feature Branch**: `002-resource-configuration-forms`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: Schema-driven configuration forms for each Kubernetes resource type

## User Scenarios & Testing

### User Story 1 - Edit Resource via Form (Priority: P1)

A user clicks a node on the canvas, a form panel slides open, they fill in fields (name, namespace, replicas), and the form data updates the node's resource object.

**Why this priority**: Without editable forms, all nodes have empty/default configs — the tool produces no useful YAML.

**Independent Test**: Click a Deployment node, change `spec.replicas` to 3, close the form; confirm the node label shows the updated name and YAML shows `replicas: 3`.

**Acceptance Scenarios**:

1. **Given** a node is selected, **When** the form panel opens, **Then** all required schema fields are rendered
2. **Given** a required field is empty, **When** user submits/blurs, **Then** validation error is shown inline
3. **Given** form data changes, **When** user edits any field, **Then** the node's resource object updates live

---

### User Story 2 - Collapsible Sections (Priority: P2)

Advanced fields are hidden by default in collapsed sections; the user can expand them without overwhelming the form.

**Why this priority**: K8s specs have 50+ optional fields; showing all by default makes the form unusable.

**Independent Test**: Open a Deployment form; confirm `spec.strategy`, `spec.selector` and similar advanced sections are collapsed. Expand one and confirm fields appear.

**Acceptance Scenarios**:

1. **Given** a resource form opens, **When** user first sees it, **Then** advanced sections are collapsed
2. **Given** a collapsed section, **When** user clicks its header, **Then** it expands to show child fields

---

### User Story 3 - Custom Widgets (Priority: P2)

Key-value pairs, multi-select tags, and text areas render with appropriate UI controls instead of raw JSON inputs.

**Why this priority**: Labels, annotations, and selector matchLabels are key-value maps — the default array widget is confusing.

**Independent Test**: Open a ConfigMap form; find the `data` field; confirm it renders a key-value pair widget with add/remove controls.

**Acceptance Scenarios**:

1. **Given** a `labels` or `annotations` field, **When** form renders, **Then** it shows a key-value widget with `+` add button
2. **Given** a multi-value field (e.g., `accessModes`), **When** form renders, **Then** a multi-select widget is shown

---

### Edge Cases

- What if a schema has `additionalProperties: true`? (KeyValueWidget handles dynamic maps)
- What if the user enters an invalid YAML value in a textarea widget? (shown as raw string, validated on export)

## Requirements

### Functional Requirements

- **FR-001**: System MUST generate forms from JSON schemas in `src/schemas/kubernetes/`
- **FR-002**: All 17 resource types MUST have a schema + uiSchema registered in `resourceRegistry`
- **FR-003**: Forms MUST use `CollapsibleFieldTemplate` and `CollapsibleObjectFieldTemplate` for nested objects
- **FR-004**: Forms MUST use `KeyValueWidget` for `labels`, `annotations`, and other map fields
- **FR-005**: Forms MUST use `MultiSelectWidget` for array-of-enum fields (e.g., `accessModes`)
- **FR-006**: Forms MUST use `CustomTextareaWidget` for multiline string fields (e.g., ConfigMap `data` values)
- **FR-007**: Form changes MUST update node resource data via `onFormChange` callback

### Key Entities

- **DynamicK8sForm**: Wrapper around `@rjsf/core` Form with custom templates and widgets
- **resourceRegistry**: Maps resource kind → schema + uiSchema + defaultResource
- **uiSchema**: Per-resource UI customizations (widget overrides, section collapse state)

## Success Criteria

- **SC-001**: All 17 resource types produce non-empty YAML after filling only required fields
- **SC-002**: Form renders in under 300ms after node selection
- **SC-003**: No required field is hidden inside a collapsed section by default

## Assumptions

- `@rjsf/core` v6 is the form library
- Schemas are hand-authored, not generated from the K8s OpenAPI spec
- Form validation uses `@rjsf/validator-ajv8`
