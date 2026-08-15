<!-- 
Sync Impact Report:
- Version change: unversioned → 1.0.0 (Initial constitution creation)
- Added sections: Core Principles (5), Technology Constraints, Development Workflow, Governance
- No removed sections
- No renamed principles
- Follow-up TODOs: None
-->

# TweakSync Constitution

## Core Principles

### Clean Architecture
TweakSync MUST follow clean architecture principles with strict separation of concerns across layers. The extension host, WebSocket server, webview UI, and Chrome client MUST each operate in their own bounded context with unidirectional dependencies. Domain logic MUST NOT depend on infrastructure details. All inter-layer communication MUST use well-defined interfaces or explicit message contracts.

### SOLID Design Principles
Every module, class, and function MUST adhere to the five SOLID principles:
- Single Responsibility: Each module MUST have exactly one reason to change
- Open/Closed: Extension points MUST be open for extension but closed for modification
- Liskov Substitution: Subtypes MUST be substitutable for their base types without altering correctness
- Interface Segregation: Clients MUST NOT be forced to depend on methods they do not use; prefer small, focused interfaces
- Dependency Inversion: High-level modules MUST NOT depend on low-level modules; both MUST depend on abstractions

### Design Patterns
Proven design patterns MUST be applied consistently to solve recurring problems:
- Use Command pattern for VS Code command registration and disposables
- Use Observer pattern for WebSocket message dispatch and webview communication
- Use Factory or Abstract Factory for creating extension-specific objects
- Use Strategy pattern for interchangeable behaviors (e.g., file watching modes)
- Document the pattern, rationale, and tradeoffs when introducing a new pattern

### Extensibility & Testability
The codebase MUST be structured to support future feature growth without rewrites:
- Public APIs and extension points MUST be explicitly documented and versioned
- Modules MUST be independently testable with minimal coupling to VS Code APIs
- Use dependency injection and abstraction layers to enable mocking in tests
- New features MUST be added via extension points, not by modifying existing core logic

### Performance & Big O Compliance
All algorithms and data structures MUST be evaluated for time and space complexity:
- Hot paths (WebSocket message handling, file watching, style diffing) MUST target O(n) or better
- Document the Big O complexity of any non-trivial algorithm in code comments or adjacent documentation
- Avoid nested loops and repeated linear scans on unbounded input; prefer maps, sets, and indexed structures
- Profile before optimizing; use VS Code performance APIs appropriately

## Technology Constraints

The extension MUST target VS Code API compatibility with the declared engine version in package.json. All WebSocket communication MUST use JSON message contracts with explicit TypeScript typing. Secrets, tokens, and credentials MUST NEVER be logged or exposed in webview panels. The project MUST maintain TypeScript strict mode (`strict: true`) and enforce it through CI.

## Development Workflow

All contributions MUST follow Test-Driven Development: write or update failing tests, confirm failure, then implement. Every PR MUST pass lint, typecheck, and existing test suites before merge. Code review MUST verify compliance with this constitution and flag any principle violations. Use `npm run watch` during active development for fast rebuild cycles.

## Governance

This constitution is the authoritative design contract for TweakSync. It supersedes all informal practices and ad-hoc decisions. Amendments require:
1. A written proposal describing the change, rationale, and migration plan
2. Approval from project maintainers
3. A semantic version bump reflecting the scope of change

Versioning policy:
- MAJOR: Backward-incompatible governance or principle changes
- MINOR: New principles, sections, or materially expanded guidance
- PATCH: Clarifications, wording fixes, and non-semantic refinements

Compliance review expectations:
- All PRs must verify constitution alignment
- Complexity that violates a principle MUST be explicitly justified in the PR description
- Deferred items MUST be tracked with TODO markers and resolved within one sprint

**Version**: 1.0.0 | **Ratified**: 2026-08-16 | **Last Amended**: 2026-08-16
