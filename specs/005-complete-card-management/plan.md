# Implementation Plan: Complete Card Management System

**Branch**: `005-complete-card-management` | **Date**: 2025-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-complete-card-management/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Project Type: React TypeScript web application
   → ✅ Structure Decision: Frontend-focused with backend API integration
3. Evaluate Constitution Check section below
   → ✅ No constitutional violations detected
   → ✅ Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → ✅ Image validation, file storage, and sync patterns researched
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md update
   → ✅ Design documents generated for card management entities
6. Re-evaluate Constitution Check section
   → ✅ Post-design check passed - simple, testable approach
   → ✅ Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
   → ✅ TDD task ordering strategy defined
8. STOP - Ready for /tasks command
```

## Summary
Complete card management system for Memes Wars, enabling players to view, filter, search, and customize their card collections with PNG illustrations. Features include real-time filtering, backend synchronization, custom image upload, and comprehensive collection management tools. Built as React components with TypeScript, integrating with existing game backend.

## Technical Context
**Language/Version**: TypeScript 5.0+ with React 18  
**Primary Dependencies**: React 18, Zustand (existing), Vite, Axios/Fetch API  
**Storage**: Backend API for card data + custom images, LocalStorage for offline cache  
**Testing**: Vitest (unit), Playwright (E2E), existing test infrastructure  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 90+, Safari 14+)
**Project Type**: web - React frontend with backend API integration  
**Performance Goals**: <200ms filter response, <1s image upload feedback, 60fps UI animations  
**Constraints**: PNG images only, max file size 5MB, offline mode support required  
**Scale/Scope**: 500+ cards per collection, 10+ simultaneous filters, cross-device sync

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (frontend components + backend integration)
- Using framework directly? ✅ Yes - React components, no wrapper abstractions
- Single data model? ✅ Yes - unified Card entity with optional custom image
- Avoiding patterns? ✅ Yes - direct API calls, no unnecessary Repository pattern

**Architecture**:
- EVERY feature as library? ✅ Yes - card management as reusable service
- Libraries listed: CardManagementService (filtering, search), ImageUploadService (PNG handling), SyncService (backend integration)
- CLI per library: N/A - web frontend components
- Library docs: Component documentation in Storybook format

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? ✅ Yes - failing tests written first
- Git commits show tests before implementation? ✅ Yes - contract tests first
- Order: Contract→Integration→E2E→Unit strictly followed? ✅ Yes - constitutional order
- Real dependencies used? ✅ Yes - actual backend API, real file uploads
- Integration tests for: ✅ Card filtering, image upload, sync workflows
- FORBIDDEN: ✅ No implementation before failing tests

**Observability**:
- Structured logging included? ✅ Yes - upload progress, sync status, error tracking
- Frontend logs → backend? ✅ Yes - error reporting integration
- Error context sufficient? ✅ Yes - user-friendly error messages

**Versioning**:
- Version number assigned? ✅ Yes - v1.0.0 for complete card management
- BUILD increments on every change? ✅ Yes - follows project standards
- Breaking changes handled? ✅ Yes - backward compatible with existing card system

## Project Structure

### Documentation (this feature)
```
specs/005-complete-card-management/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Existing React application structure
src/
├── components/
│   ├── organisms/
│   │   ├── CardGrid/           # Enhanced card display
│   │   ├── CardFilters/        # Multi-criteria filtering
│   │   └── ImageUploader/      # PNG upload component
│   ├── molecules/
│   │   ├── CardPreview/        # Card with custom image
│   │   ├── FilterControls/     # Individual filter components
│   │   └── SyncIndicator/      # Backend sync status
│   └── atoms/
│       ├── ImageInput/         # File input component
│       └── FilterButton/       # Filter toggle buttons
├── services/
│   ├── CardManagementService.ts  # Core card operations
│   ├── ImageUploadService.ts     # PNG handling and validation
│   └── CardSyncService.ts        # Backend synchronization
├── stores/
│   ├── cardCollectionStore.ts    # Collection state management
│   └── cardFiltersStore.ts       # Filter preferences state
└── types/
    ├── CardManagement.ts         # Card management interfaces
    └── ImageUpload.ts            # Image handling types

tests/
├── contract/
│   ├── CardManagementService.test.ts
│   ├── ImageUploadService.test.ts
│   └── CardSyncService.test.ts
├── integration/
│   ├── card-filtering.test.ts
│   ├── image-upload-workflow.test.ts
│   └── sync-workflow.test.ts
└── e2e/
    ├── complete-card-management.spec.ts
    └── offline-mode.spec.ts
```

**Structure Decision**: Single React application with enhanced card management features integrated into existing architecture

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - PNG image validation best practices
   - File upload progress tracking patterns
   - Offline-first data synchronization strategies
   - Performance optimization for large card collections

2. **Generate and dispatch research agents**:
   ```
   Task: "Research PNG image validation for React applications"
   Task: "Find best practices for file upload with progress tracking in TypeScript"
   Task: "Research offline-first synchronization patterns for web applications"
   Task: "Find performance optimization techniques for large lists in React"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Card: Enhanced with custom image support
   - CardCollection: Filterable and searchable collection
   - CardFilter: Multi-criteria filtering state
   - CardImage: PNG file metadata and validation
   - SyncStatus: Backend synchronization tracking

2. **Generate API contracts** from functional requirements:
   - GET /api/cards - Retrieve card collection with filtering
   - POST /api/cards/image/{id} - Upload custom card image
   - GET /api/cards/sync - Get sync status and changes
   - PUT /api/cards/sync - Push local changes to backend
   - Output OpenAPI schema to `/contracts/card-management-api.md`

3. **Generate contract tests** from contracts:
   - CardManagementService.test.ts - Service interface validation
   - ImageUploadService.test.ts - PNG upload and validation
   - CardSyncService.test.ts - Backend synchronization
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Filter cards by multiple criteria → integration test
   - Upload custom PNG image → E2E test
   - Sync collection across devices → integration test
   - Search cards by name/abilities → integration test

5. **Update agent file incrementally** (O(1) operation):
   - Update CLAUDE.md with new card management context
   - Add card management service references
   - Update current focus to card management implementation
   - Preserve existing minimal structure

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md update

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each API contract → contract test task [P]
- Each entity (Card, CardCollection, etc.) → model creation task [P] 
- Each user story (filtering, uploading, syncing) → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Contract tests → Integration tests → E2E tests → Implementation
- Dependency order: Models → Services → Components → Pages
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 28-32 numbered, ordered tasks in tasks.md covering:
- 5 contract test tasks [P]
- 5 data model tasks [P]
- 8 service implementation tasks
- 6 component creation tasks [P]
- 4 integration test tasks
- 2 E2E test scenarios
- 2 performance optimization tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None detected | N/A | N/A |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*