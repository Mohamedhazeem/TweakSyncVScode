# Research: Clean Architecture Refactor

**Date**: 2026-08-16  
**Feature**: Clean Architecture Refactor  
**Status**: Complete

## Decision: Layered Architecture with Domain/Application/Infrastructure Separation

**Rationale**: The current codebase mixes VS Code API calls, WebSocket logic, and business rules across a few large files. A layered architecture enforces dependency direction: domain depends on nothing, application depends on domain, infrastructure depends on both, and the entry point composes them. This aligns with the Clean Architecture principle in the constitution and enables independent testing and future portability.

**Alternatives considered**:
- Feature-based modules: Rejected because it still risks infrastructure leakage into feature folders and makes cross-cutting concerns harder to manage.
- Hexagonal/Ports-and-Adapters: Considered but adds more abstraction than needed for a VS Code extension; the chosen layered approach provides sufficient boundary control with less ceremony.

## Decision: Abstract VS Code APIs Behind Interfaces

**Rationale**: Direct VS Code API usage in domain logic makes testing impossible without the VS Code runtime. Introducing thin wrappers around `workspaceState`, `workspace.fs`, `window`, and `commands` allows the domain layer to depend on abstractions. Infrastructure provides the real implementations; tests provide fakes.

**Alternatives considered**:
- Mock VS Code API directly: Rejected because it couples tests to VS Code internals and makes porting harder.
- Keep VS Code calls in place and only extract pure functions: Rejected because it does not achieve full testability or portability.

## Decision: Style Language Handler Extension Point

**Rationale**: The constitution requires extensibility for new styling languages. A `StyleLanguageHandler` interface with `parse`, `validate`, and `transform` methods allows new languages to be registered as plugins. A registry in the domain layer manages handlers without the core knowing about specific languages.

**Alternatives considered**:
- Hardcode CSS logic and add conditionals for new languages: Rejected because it violates Open/Closed principle and increases core module complexity.
- Use a configuration-driven parser: Rejected because it cannot handle semantic differences between languages (e.g., Sass nesting vs CSS flat rules).

## Decision: Message Contract Interfaces for WebSocket and Webview

**Rationale**: The constitution mandates explicit, versioned interfaces for inter-module communication. Defining TypeScript interfaces for all messages between the extension host and Chrome client, and between the extension host and webview, eliminates implicit contracts and enables compile-time verification.

**Alternatives considered**:
- Continue using loosely typed objects: Rejected because it causes runtime errors and makes refactoring unsafe.
- Generate contracts from a schema: Considered but premature; TypeScript interfaces provide sufficient safety at this stage.

## Decision: Dependency Injection via Constructor Parameters

**Rationale**: Constructor injection is the simplest DI mechanism that works in Node.js without additional libraries. Each application service and infrastructure class receives its dependencies as constructor arguments, making testing straightforward and keeping the composition root in `extension.ts`.

**Alternatives considered**:
- Service locator pattern: Rejected because it hides dependencies and makes testing harder.
- Third-party DI container: Rejected because it adds runtime overhead and complexity for a project of this size.

## Decision: Incremental Refactor with Strangler Fig Pattern

**Rationale**: The refactor must preserve existing functionality at every step. The Strangler Fig pattern allows new modules to be built alongside old ones, with the entry point routing to the new implementation while the old code is gradually removed. This minimizes risk and keeps the extension runnable during development.

**Alternatives considered**:
- Big-bang rewrite: Rejected because it would break the extension for weeks and violate the constitution's incremental requirement.
- Parallel maintenance of two codebases: Rejected because it doubles effort and introduces divergence risk.
