# Tasks: Clean Architecture Refactor

**Input**: Design documents from `/specs/001-clean-architecture-refactor/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. This feature did not explicitly request tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow the structure defined in [plan.md](plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and initialize modules

- [X] T001 Create layered directory structure: `src/domain`, `src/application`, `src/infrastructure/vscode`, `src/infrastructure/websocket`, `src/infrastructure/webview`
- [X] T002 Create domain subdirectories: `src/domain/style`, `src/domain/style/css`, `src/domain/messaging`, `src/domain/watcher`
- [X] T003 Create infrastructure subdirectories: `src/infrastructure/vscode/disposables`
- [X] T004 Create application subdirectories: `src/application/services`, `src/application/commands`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core interfaces and contracts that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Define `StyleLanguageHandler` interface in `src/domain/style/handler.ts`
- [X] T006 [P] Define `StyleLanguageRegistry` interface in `src/domain/style/registry.ts`
- [X] T007 [P] Define message contract interfaces in `src/domain/messaging/contracts.ts`
- [X] T008 [P] Define `FileIdMap` type in `src/types/ElementTypes.ts`
- [X] T009 Define `StyleRule`, `AtRule`, and `ParsedStyleDocument` types in `src/domain/style/types.ts`
- [X] T010 Define VS Code abstraction interfaces in `src/infrastructure/vscode/interfaces.ts`
- [X] T011 Define WebSocket message interfaces in `src/infrastructure/websocket/types.ts`
- [X] T012 Create `StyleLanguageRegistry` implementation in `src/domain/style/registry.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add New Styling Language Without Core Changes (Priority: P1) 🎯 MVP

**Goal**: Implement the style language handler extension point so new languages can be added without modifying core logic

**Independent Test**: Add a mock styling language handler through the extension mechanism and confirm existing CSS behavior remains unchanged

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement CSS parser in `src/domain/style/css/parser.ts`
- [X] T014 [P] [US1] Implement CSS updater in `src/domain/style/css/updater.ts`
- [X] T015 [US1] Implement `CssStyleHandler` in `src/domain/style/css/handler.ts`
- [X] T016 [US1] Register CSS handler in `src/domain/style/registry.ts`
- [X] T017 [US1] Implement `StyleService` in `src/application/services/style-service.ts`
- [X] T018 [US1] Wire style service into WebSocket message handler

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. New styling language handlers can be registered without core changes.

---

## Phase 4: User Story 2 - Modify One Module Without Breaking Others (Priority: P1)

**Goal**: Separate logic from VS Code infrastructure so modules can be changed and tested in isolation

**Independent Test**: Modify a single module's internal implementation and run only that module's tests; verify no other module tests fail

### Implementation for User Story 2

- [X] T019 [P] [US2] Implement `WorkspaceState` wrapper in `src/infrastructure/vscode/workspace-state.ts`
- [X] T020 [P] [US2] Implement `VscodeWindow` wrapper in `src/infrastructure/vscode/window.ts`
- [X] T021 [P] [US2] Implement `VscodeCommands` wrapper in `src/infrastructure/vscode/commands.ts`
- [X] T022 [P] [US2] Implement `VscodeWorkspaceFs` wrapper in `src/infrastructure/vscode/workspace-fs.ts`
- [X] T023 [P] [US2] Implement WebSocket server in `src/infrastructure/websocket/server.ts`
- [X] T024 [P] [US2] Implement WebSocket client in `src/infrastructure/websocket/client.ts`
- [X] T025 [US2] Implement `CommandRegistry` in `src/infrastructure/vscode/command-registry.ts`
- [X] T026 [US2] Implement `SyncService` in `src/application/services/sync-service.ts`
- [X] T027 [US2] Extract temporary ID logic to `src/domain/watcher/file-watcher.ts`
- [X] T028 [US2] Implement temporary ID disposable in `src/infrastructure/vscode/disposables/temporary-id.ts`
- [X] T029 [US2] Implement file watcher disposable in `src/infrastructure/vscode/disposables/file-watcher.ts`
- [X] T030 [US2] Implement webview disposable in `src/infrastructure/vscode/disposables/webview.ts`
- [X] T031 [US2] Implement `WebviewMessageBus` in `src/infrastructure/webview/message-bus.ts`
- [X] T032 [US2] Implement `start-server` command in `src/application/commands/start-server.ts`
- [X] T033 [US2] Implement `watch-files` command in `src/application/commands/watch-files.ts`
- [X] T034 [US2] Implement `inject-ids` command in `src/application/commands/inject-ids.ts`
- [X] T035 [US2] Implement `remove-files` command in `src/application/commands/remove-files.ts`
- [X] T036 [US2] Refactor `extension.ts` to use new composition root pattern

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. All modules can be tested in isolation.

---

## Phase 5: User Story 3 - Understand the Codebase Through Clear Boundaries (Priority: P2)

**Goal**: Split large files into smaller modules with clear responsibilities and locations

**Independent Test**: A developer unfamiliar with the codebase can locate the module responsible for any behavior by reading module names and interfaces alone

### Implementation for User Story 3

- [X] T037 [P] [US3] Split `updateCSSContent.ts` into `src/domain/style/css/parser.ts` and `src/domain/style/css/updater.ts`
- [X] T038 [P] [US3] Split `temporaryIdDisposable.ts` into focused disposable modules under `src/infrastructure/vscode/disposables/`
- [X] T039 [P] [US3] Split `watchCollectedFiles.ts` into `src/domain/watcher/temporary-id.ts` and `src/infrastructure/vscode/disposables/file-watcher.ts`
- [X] T040 [P] [US3] Move `updateRule.ts` to `src/domain/style/css/updater.ts`
- [X] T041 [P] [US3] Move `elementStyles.ts` and `elementDetails.ts` to `src/infrastructure/messaging/handlers/` (infrastructure layer, not `domain`, to avoid a domain↔application cycle and keep `domain/` pure)
- [X] T042 [US3] Add module-level README or index files documenting module responsibilities
- [X] T043 [US3] Ensure all module names match their responsibilities (no misleading names)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Codebase boundaries are clear and navigable.

---

## Phase 6: User Story 4 - Build and Test Incrementally (Priority: P2)

**Goal**: Configure build system and tooling to enable incremental compilation and testing

**Independent Test**: Change a single module and verify that the build system can compile and test only that module or its direct dependents

### Implementation for User Story 4

- [X] T044 [P] [US4] Configure webpack/tasks for incremental builds targeting `src/domain`, `src/application`, `src/infrastructure` independently
- [X] T045 [P] [US4] Add Jest configuration for unit tests per module in `jest.config.js`
- [X] T046 [P] [US4] Add tsconfig paths for clean module resolution
- [X] T047 [US4] Implement complexity limit enforcement in CI/lint pipeline
- [X] T048 [US4] Add dependency graph validation script to detect circular dependencies

**Checkpoint**: All user stories should now be independently functional. Incremental builds and tests work.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, cleanup, and validation

- [ ] T049 [P] Verify all edge cases from spec.md are handled (failed handler load, circular deps, complexity limits)
- [ ] T050 [P] Run quickstart.md validation scenarios end-to-end
- [ ] T051 [P] Verify no single source file exceeds 300 lines
- [ ] T052 [P] Verify zero circular dependencies between modules
- [ ] T053 [P] Ensure all WebSocket and webview message contracts are typed
- [ ] T054 Remove or archive old monolithic files (`src/scripts/updateCSSContent.ts`, `src/scripts/temporaryId.ts`, `src/disposable/temporaryIdDisposable.ts`, etc.) only after new modules are verified
- [ ] T055 Update README.md with new architecture overview and contribution guidelines
- [ ] T056 Final integration test: verify extension activates, server starts, CSS updates flow, and new handler registration works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on foundational interfaces but independent of US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on files being split from US1/US2 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on module structure from US1/US2/US3

### Within Each User Story

- Interfaces and types before implementations
- Domain logic before infrastructure
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- US1: T013 and T014 can run in parallel (different files)
- US2: T019-T022 and T023-T024 can run in parallel (different modules)
- US3: T037-T041 can all run in parallel (different files)
- US4: T044-T046 can all run in parallel (different config files)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for User Story 1:
Task: "Implement CSS parser in src/domain/style/css/parser.ts"
Task: "Implement CSS updater in src/domain/style/css/updater.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (extensibility)
   - Developer B: User Story 2 (isolation)
   - Developer C: User Story 3 (clarity)
   - Developer D: User Story 4 (build tooling)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are OPTIONAL - not included unless explicitly requested
- Total task count: 56
