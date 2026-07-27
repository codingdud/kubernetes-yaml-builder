# Feature Specification: YAML Validation & Verify Panel

**Feature Branch**: `005-yaml-validation`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: Client-side validation of Kubernetes resources with a dedicated verify panel showing errors and warnings

## User Scenarios & Testing

### User Story 1 - Validate All Resources (Priority: P1)

A user clicks "Verify" and sees a panel listing validation errors and warnings for all resources on the canvas.

**Why this priority**: Without validation, users can't know if their config is valid before applying to a cluster.

**Independent Test**: Add a Deployment node with `metadata.name` empty; click Verify; confirm a validation error appears for the missing required field.

**Acceptance Scenarios**:

1. **Given** a resource with a missing required field, **When** user runs verify, **Then** an error is listed with the resource name and field path
2. **Given** all resources are valid, **When** user runs verify, **Then** the panel shows a success state with zero errors
3. **Given** a warning condition (e.g., no resource limits set), **When** verify runs, **Then** a warning (not error) is shown

---

### User Story 2 - Per-Node Validation Indicators (Priority: P2)

Resource nodes on canvas display a visual indicator (e.g., red border or icon) when they have validation errors.

**Why this priority**: Locates the problem visually without requiring the user to read the full verify panel.

**Independent Test**: Create an invalid Deployment; confirm its canvas node shows an error indicator.

**Acceptance Scenarios**:

1. **Given** a node with validation errors, **When** verify runs, **Then** the node shows a red/error state indicator
2. **Given** errors are fixed and verify re-runs, **When** all errors cleared, **Then** node indicator returns to normal

---

### Edge Cases

- Empty canvas should show "nothing to validate" state, not an error
- Validation must handle missing `spec` gracefully (partial objects from default resources)

## Requirements

### Functional Requirements

- **FR-001**: `kubeValidate.ts` MUST validate resource objects against their JSON schema
- **FR-002**: Validation MUST check for required fields per schema definition
- **FR-003**: `VerifyPanel` MUST list errors grouped by resource name
- **FR-004**: `VerifyPanel` MUST distinguish errors (blocking) from warnings (advisory)
- **FR-005**: Validation result MUST be surfaceable to the canvas node for indicator rendering
- **FR-006**: AI tool `validate_resources` MUST invoke the same validation logic

## Success Criteria

- **SC-001**: Missing `metadata.name` on any resource always produces a validation error
- **SC-002**: A fully configured Deployment with valid spec produces zero errors
- **SC-003**: Verify panel renders within 200ms for 20 resources

## Assumptions

- Validation is schema-based (JSON Schema via AJV), not kubectl-based
- No network call to a K8s API server — fully offline validation
