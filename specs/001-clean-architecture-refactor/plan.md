# Implementation Plan: Clean Architecture Refactor

**Branch**: `001-clean-architecture-refactor` | **Date**: 2026-08-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-clean-architecture-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Refactor the TweakSync VS Code extension from its current monolithic structure into a modular, clean architecture with strict separation of concerns. The refactor will isolate domain logic from VS Code infrastructure, introduce explicit interface contracts for inter-module communication, split large files into focused modules, and define extension points for new styling language handlers (Sass, Less, Tailwind) without modifying core logic. All changes will preserve existing user-facing functionality while enabling independent module testing and incremental builds.

## Technical Context

**Language/Version**: TypeScript with strict mode (`strict: true`)

**Primary Dependencies**: VS Code Extension API, `ws` (WebSocket server), React 19, shadcn/ui, Tailwind CSS v4

**Storage**: VS Code `workspaceState` (persisted key-value store managed by the extension host)

**Testing**: VS Code integration tests via `vscode-test`; unit tests via Jest (to be introduced)

**Target Platform**: VS Code extension host (Node.js runtime)

**Project Type**: VS Code extension with embedded webview

**Performance Goals**: O(n) or better for hot paths (WebSocket handling, file watching, style diffing); incremental builds under 5 seconds; no single source file exceeding 300 lines

**Constraints**: Must maintain VS Code API compatibility; TypeScript strict mode enforced in CI; zero circular dependencies between modules

**Scale/Scope**: Medium complexity; ~30 source files across extension host, WebSocket server, webview UI, and Chrome client. Currently CSS-only styling support, with planned extensibility for additional languages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Clean Architecture | **PASS** | Refactor explicitly enforces layer separation and bounded contexts |
| SOLID Design Principles | **PASS** | Each module will have single responsibility; extension points use abstractions |
| Design Patterns | **PASS** | Command, Observer, Factory, and Strategy patterns will be applied systematically |
| Extensibility & Testability | **PASS** | Extension points for styling languages; dependency injection for testability |
| Performance & Big O Compliance | **PASS** | Hot paths documented; algorithmic complexity targets defined in success criteria |

**Gate Result**: PASS — No violations requiring justification. All constitutional principles align with the refactor objectives.

## Project Structure

### Documentation (this feature)

```text
specs/001-clean-architecture-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── websocket-messages.md
│   ├── webview-messages.md
│   └── style-language-handler.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── extension.ts                 # Entry point; thin composition root
├── types/
│   └── ElementTypes.ts          # Shared TypeScript interfaces
├── domain/                      # Pure business logic (no VS Code imports)
│   ├── style/
│   │   ├── handler.ts           # StyleLanguageHandler interface
│   │   ├── css/
│   │   │   ├── parser.ts
│   │   │   └── updater.ts
│   │   └── registry.ts          # Style language registry
│   ├── messaging/
│   │   └── contracts.ts         # Message type definitions
│   └── watcher/
│       └── file-watcher.ts      # File watching logic
├── infrastructure/              # VS Code and WebSocket implementations
│   ├── vscode/
│   │   ├── command-registry.ts  # Command registration
│   │   ├── workspace-state.ts   # WorkspaceState wrapper
│   │   └── disposables/
│   │       ├── temporary-id.ts
│   │       ├── file-watcher.ts
│   │       └── webview.ts
│   ├── websocket/
│   │   ├── server.ts
│   │   └── client.ts
│   └── webview/
│       └── message-bus.ts
├── application/                 # Orchestration and use cases
│   ├── services/
│   │   ├── sync-service.ts
│   │   └── style-service.ts
│   └── commands/
│       ├── start-server.ts
│       ├── watch-files.ts
│       ├── inject-ids.ts
│       └── remove-files.ts
└── webview/                     # React UI (existing, minor refactor)
    ├── App.tsx
    ├── HomePage.tsx
    ├── components/
    └── index.tsx
```

**Structure Decision**: Adopted a layered clean architecture with `domain/`, `application/`, `infrastructure/`, and thin entry point in `extension.ts`. This separates pure business logic from VS Code and WebSocket infrastructure, enabling independent testing and future portability.

## Phases

### Phase 0: Outline & Research

**Status**: Complete

**Research Summary**: See [research.md](research.md) for full details.

| Unknown / Decision | Resolution |
|--------------------|------------|
| Architecture pattern | Layered architecture with `domain/`, `application/`, `infrastructure/` |
| VS Code API abstraction | Thin wrapper interfaces around `workspaceState`, `workspace.fs`, `window`, `commands` |
| Style language extensibility | `StyleLanguageHandler` interface with registry |
| Message contracts | TypeScript interfaces with `type` discriminators for WebSocket and webview messages |
| DI mechanism | Constructor injection without third-party library |
| Migration strategy | Strangler Fig pattern: build new modules alongside old, route incrementally |

All `NEEDS CLARIFICATION` items resolved.

### Phase 1: Design & Contracts

**Status**: Complete

**Artifacts Generated**:
- [data-model.md](data-model.md) — Entity definitions, relationships, and state transitions
- [contracts/websocket-messages.md](contracts/websocket-messages.md) — Chrome ↔ Extension message schema
- [contracts/webview-messages.md](contracts/webview-messages.md) — Extension ↔ Webview message schema
- [contracts/style-language-handler.md](contracts/style-language-handler.md) — Plugin interface for styling languages
- [quickstart.md](quickstart.md) — Runnable validation scenarios

**Design Highlights**:
- `StyleLanguageHandler` interface enables adding Sass, Less, Tailwind without core changes
- `FileIdMap` entity tracks temporary IDs per file with clear lifecycle
- Message contracts use TypeScript discriminated unions for compile-time safety
- All inter-module communication flows through explicit interfaces

**Constitution Re-Check Post-Design**:

| Principle | Status | Notes |
|-----------|--------|-------|
| Clean Architecture | **PASS** | Layer boundaries defined; dependency direction enforced |
| SOLID Design Principles | **PASS** | SRP via module splitting; OCP via handler interface; DIP via constructor injection |
| Design Patterns | **PASS** | Command (VS Code commands), Observer (WebSocket/webview events), Registry (style languages), Strategy (handler selection) |
| Extensibility & Testability | **PASS** | Handler registry for new languages; abstractions enable mocking |
| Performance & Big O Compliance | **PASS** | Hot paths identified; data-model notes complexity targets |

**Gate Result**: PASS — Design artifacts satisfy all constitutional principles.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
