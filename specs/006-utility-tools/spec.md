# Feature Specification: Utility Tools Modal

**Feature Branch**: `006-utility-tools`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: A modal panel containing developer utility tools useful when authoring K8s configs — Base64, JSON formatter, Timestamp, URL encoder, UUID/ULID generator

## User Scenarios & Testing

### User Story 1 - Access Tools via Modal (Priority: P1)

A user clicks the tools button in the header/toolbar, a modal opens with a tab per tool.

**Why this priority**: Tools are secondary to the main diagram workflow; a modal keeps them accessible without cluttering the canvas.

**Independent Test**: Click tools button; confirm modal opens with at least 5 tabs visible.

**Acceptance Scenarios**:

1. **Given** the canvas is showing, **When** user clicks the tools icon, **Then** the ToolsModal opens
2. **Given** the modal is open, **When** user clicks a tab, **Then** that tool's interface is shown
3. **Given** the modal is open, **When** user presses Escape, **Then** modal closes without losing canvas state

---

### User Story 2 - Base64 Encode/Decode (Priority: P2)

K8s Secrets use base64-encoded values. The tool lets users encode plain text to base64 and decode base64 back to plain text.

**Why this priority**: Secret data must be base64-encoded; this is a constant pain point when authoring Secrets manually.

**Independent Test**: Enter `hello` in the encode field; confirm output is `aGVsbG8=`. Enter `aGVsbG8=` in decode field; confirm output is `hello`.

**Acceptance Scenarios**:

1. **Given** input text, **When** user clicks encode, **Then** base64-encoded string is shown
2. **Given** base64 string, **When** user clicks decode, **Then** original text is shown
3. **Given** invalid base64 input, **When** user decodes, **Then** an error is shown

---

### User Story 3 - JSON Formatter (Priority: P2)

Formats and validates JSON. Useful for annotation values or ConfigMap data that contains JSON.

**Acceptance Scenarios**:

1. **Given** a compact JSON string, **When** user clicks format, **Then** pretty-printed JSON is shown with indentation
2. **Given** invalid JSON, **When** user clicks format, **Then** a syntax error position is shown

---

### User Story 4 - UUID / ULID Generator (Priority: P3)

Generates UUIDs (v4) and ULIDs for use in resource names or labels.

**Acceptance Scenarios**:

1. **Given** the UUID/ULID tab, **When** user clicks generate, **Then** a new UUID v4 and ULID are shown
2. **Given** a generated value, **When** user clicks copy, **Then** the value is copied to clipboard

---

### User Story 5 - Timestamp Converter (Priority: P3)

Converts between Unix timestamps and human-readable dates. Useful for `startingDeadlineSeconds` and similar time-related fields.

**Acceptance Scenarios**:

1. **Given** a Unix timestamp, **When** user converts, **Then** the ISO 8601 date string is shown
2. **Given** a date string, **When** user converts, **Then** the Unix timestamp is shown

---

### User Story 6 - URL Encoder/Decoder (Priority: P3)

Encodes/decodes URL components. Useful for Ingress path rules and annotation values.

**Acceptance Scenarios**:

1. **Given** a URL with special characters, **When** encoded, **Then** percent-encoded string is shown
2. **Given** a percent-encoded string, **When** decoded, **Then** original URL is shown

---

### Edge Cases

- Empty input should show an empty output, not an error
- Very large inputs (>1MB) should be handled gracefully (warn and truncate)

## Requirements

### Functional Requirements

- **FR-001**: `ToolsModal` MUST render tabs for: Base64, JSON, Timestamp, URL, UUID/ULID
- **FR-002**: `Base64Tool` MUST encode and decode using browser-native `btoa`/`atob`
- **FR-003**: `JsonTool` MUST format JSON using `JSON.stringify` with 2-space indent
- **FR-004**: `UuidUlidTool` MUST generate UUID v4 (via `uuid` package) and ULID (via `ulid` package)
- **FR-005**: `TimestampTool` MUST use `date-fns` for date formatting
- **FR-006**: `UrlTool` MUST use `encodeURIComponent`/`decodeURIComponent`
- **FR-007**: Each tool MUST have a copy-to-clipboard button for its output

## Success Criteria

- **SC-001**: All 5 tool tabs render without errors
- **SC-002**: Base64 encode → decode round-trip is lossless for ASCII input
- **SC-003**: UUID generator produces a different value on each click

## Assumptions

- Tools are stateless — inputs are cleared when modal closes
- No network access required for any tool
