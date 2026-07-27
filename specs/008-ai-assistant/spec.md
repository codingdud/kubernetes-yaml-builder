# Feature Specification: AI Assistant with Multi-Provider Support

**Feature Branch**: `008-ai-assistant`

**Created**: 2026-07-27

**Status**: Completed ✅

**Input**: An AI chat assistant embedded in the sidebar that supports multiple LLM providers (Anthropic, OpenAI, Gemini) via the AG-UI protocol, with streaming responses and thinking steps visibility

## User Scenarios & Testing

### User Story 1 - Chat with AI about K8s (Priority: P1)

A user opens the AI sidebar, types a question about Kubernetes, and receives a streaming text response.

**Why this priority**: Core value of the AI feature — Q&A and guidance about K8s resources.

**Independent Test**: Configure Anthropic API key, type "What is a Deployment?"; confirm a streamed response appears with correct explanation.

**Acceptance Scenarios**:

1. **Given** a configured API key, **When** user sends a message, **Then** a streaming response appears token by token
2. **Given** a streaming response, **When** it completes, **Then** the full message is shown in the chat history
3. **Given** a network error mid-stream, **When** stream fails, **Then** an error message is shown; existing chat history is preserved

---

### User Story 2 - Switch AI Providers (Priority: P1)

A user can choose between Anthropic (Claude), OpenAI (GPT), and Google (Gemini) and configure API keys per provider.

**Why this priority**: Different users have different provider access; locking to one provider would exclude a large user segment.

**Independent Test**: Switch from Anthropic to Gemini in ProviderSettings; send a message; confirm Gemini API is called (observable via network tab or API key validation).

**Acceptance Scenarios**:

1. **Given** the settings panel, **When** user switches to Gemini and sets an API key, **Then** subsequent messages use the Gemini provider
2. **Given** an invalid API key, **When** user sends a message, **Then** an authentication error is shown clearly
3. **Given** switching providers, **When** user does so, **Then** chat history is cleared and session resets

---

### User Story 3 - View Thinking Steps (Priority: P2)

For models that support extended thinking (Claude), the AI's reasoning steps are shown in a collapsible section before the final answer.

**Why this priority**: Transparency into multi-step reasoning builds trust for complex K8s advice.

**Independent Test**: Enable extended thinking on Claude; ask a complex question; confirm a "Thinking..." collapsible block appears with reasoning text.

**Acceptance Scenarios**:

1. **Given** extended thinking enabled, **When** Claude responds, **Then** `ThinkingSteps` component shows the reasoning chain
2. **Given** a model without thinking support, **When** it responds, **Then** no thinking block is shown

---

### User Story 4 - View Tool Call Cards (Priority: P2)

When the AI invokes a diagram tool, a `ToolCallCard` is shown in the chat to explain what tool was called and with what arguments.

**Why this priority**: Without visibility into tool calls, AI actions on the diagram feel like "magic" — opaque and untrustworthy.

**Independent Test**: Ask AI to "add a Deployment named test"; confirm a ToolCallCard appears showing `add_resource` with `kind: Deployment, name: test`.

**Acceptance Scenarios**:

1. **Given** the AI calls a diagram tool, **When** the tool call fires, **Then** a `ToolCallCard` shows the tool name and arguments
2. **Given** a tool call that requires confirmation, **When** the card shows, **Then** Approve/Reject buttons are visible
3. **Given** the tool call result, **When** it returns, **Then** the card updates to show success or error status

---

### Edge Cases

- Empty API key → show a settings prompt before allowing message send
- Very long streaming responses should not freeze the UI
- Multiple simultaneous tool calls in one response must each show their own card

## Requirements

### Functional Requirements

- **FR-001**: `AIChatSidebar` MUST render a collapsible sidebar panel with chat interface
- **FR-002**: `ChatPanel` MUST contain `MessageList` + `ChatInput`
- **FR-003**: `AISettingsContext` MUST store provider selection and API keys in localStorage
- **FR-004**: `ProviderSettings` MUST allow selecting Anthropic, OpenAI, or Gemini and entering API keys
- **FR-005**: `src/ai/providers/` MUST have implementations for Anthropic, OpenAI, and Gemini
- **FR-006**: All providers MUST implement streaming via AG-UI protocol events
- **FR-007**: `MessageBubble` MUST render markdown in assistant messages
- **FR-008**: `ThinkingSteps` MUST render collapsible thinking blocks when present
- **FR-009**: `ToolCallCard` MUST render tool name, arguments, and result for each tool invocation
- **FR-010**: `useAgent` hook MUST orchestrate the AG-UI `AgentRunner` for message sending

### Key Entities

- **AgentRunner**: Drives the AG-UI event loop for a single message exchange
- **AISettingsContext**: Persisted provider config (selection + keys)
- **DiagramActionsContext**: Bridges AI tool results to ReactFlow canvas mutations

## Success Criteria

- **SC-001**: First streaming token appears within 2 seconds of sending a message
- **SC-002**: Switching providers and sending a message works without page reload
- **SC-003**: Thinking steps are visible for Claude claude-opus-4-8+ models when configured

## Assumptions

- API keys are stored in localStorage (not a backend vault) — user accepts this security tradeoff
- AG-UI `@ag-ui/client` v0.0.57+ is used for provider abstraction
- `react-markdown` renders assistant message markdown content
