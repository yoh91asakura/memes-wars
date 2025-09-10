# Tasks: Complete Card Management System

**Input**: Design documents from `/specs/005-complete-card-management/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅
**Tech Stack**: React 18 + TypeScript 5.0+ + Vite + Zustand + Vitest + Playwright
**Project Type**: Single React application with backend API integration

## Execution Flow (completed)
```
✅ 1. Loaded plan.md - React TypeScript card management system
✅ 2. Loaded design documents:
   → data-model.md: 5 entities extracted (Card, CardCollection, CardFilter, CardImage, SyncStatus)
   → contracts/: 3 service interfaces found (API, CardManagementService, ImageUploadService)
   → research.md: 4 technical decisions (PNG validation, upload progress, offline sync, virtualization)
   → quickstart.md: Test scenarios and implementation examples
✅ 3. Generated tasks by category (45 total):
   → Setup: 3 tasks ✅ (T001-T003)
   → Contract Tests: 12 tasks [P] ✅ (T004-T015) 
   → Core Models: 5 tasks [P] ✅ (T016-T020)
   → Services: 3 tasks ✅ (T021-T023)
   → Components: 6 tasks [P] ✅ (T024-T029)
   → Stores: 2 tasks [P] ✅ (T030-T031)
   → Integration: 8 tasks ✅ (T032-T039)
   → Polish: 6 tasks mixed [P] ✅ (T040-T045)
✅ 4. Applied TDD rules: Tests before implementation
✅ 5. Numbered sequentially with dependencies
✅ 6. Generated parallel execution examples
✅ 7. Validated completeness: All contracts tested, entities modeled
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: React application at repository root
- `src/` for implementation, `tests/` for testing
- All card management features extend existing architecture

## Phase 3.1: Setup & Dependencies ✅ 
- [ ] **T001** Install card management dependencies: `npm install react-window fuse.js idb file-type`
- [ ] **T002** [P] Configure TypeScript paths for card management modules in `tsconfig.json`
- [ ] **T003** [P] Setup ESLint rules for card management patterns in `eslint.config.js`

## Phase 3.2: Contract Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests [P]
- [ ] **T004** [P] Contract test GET /cards/collection/{playerId} endpoint in `tests/contract/CardCollectionAPI.test.ts`
- [ ] **T005** [P] Contract test POST /cards/collection/{playerId}/sync endpoint in `tests/contract/CardSyncAPI.test.ts`
- [ ] **T006** [P] Contract test POST /cards/{cardId}/image upload endpoint in `tests/contract/ImageUploadAPI.test.ts`
- [ ] **T007** [P] Contract test GET/DELETE /cards/{cardId}/image endpoints in `tests/contract/ImageManagementAPI.test.ts`
- [ ] **T008** [P] Contract test GET/POST /cards/filters/{playerId} endpoints in `tests/contract/FilterAPI.test.ts`

### Service Contract Tests [P]
- [ ] **T009** [P] Contract test CardManagementService.loadCollection() in `tests/contract/CardManagementService.test.ts`
- [ ] **T010** [P] Contract test CardManagementService.applyFilters() in `tests/contract/CardFilterService.test.ts`
- [ ] **T011** [P] Contract test ImageUploadService.validateImageFile() in `tests/contract/ImageValidation.test.ts`
- [ ] **T012** [P] Contract test ImageUploadService.uploadCardImage() in `tests/contract/ImageUpload.test.ts`

### Integration Tests [P]
- [ ] **T013** [P] Integration test complete card filtering workflow in `tests/integration/card-filtering-workflow.test.ts`
- [ ] **T014** [P] Integration test image upload with progress tracking in `tests/integration/image-upload-workflow.test.ts`
- [ ] **T015** [P] Integration test offline/online synchronization in `tests/integration/sync-workflow.test.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Enhanced Data Models [P]
- [ ] **T016** [P] Enhanced Card model with custom image support in `src/models/Card.ts`
- [ ] **T017** [P] CardCollection model with search index in `src/models/CardCollection.ts`
- [ ] **T018** [P] CardFilter model with persistence in `src/models/CardFilter.ts`
- [ ] **T019** [P] CardImage model with validation metadata in `src/models/CardImage.ts`
- [ ] **T020** [P] SyncStatus model with conflict resolution in `src/models/SyncStatus.ts`

### Core Services
- [ ] **T021** CardManagementService implementation in `src/services/CardManagementService.ts`
- [ ] **T022** ImageUploadService with progress tracking in `src/services/ImageUploadService.ts`
- [ ] **T023** CardSyncService for backend synchronization in `src/services/CardSyncService.ts`

### React Components [P]
- [ ] **T024** [P] CardGrid component with react-window virtualization in `src/components/organisms/CardGrid/`
- [ ] **T025** [P] CardFilters component with real-time filtering in `src/components/organisms/CardFilters/`
- [ ] **T026** [P] ImageUploader component with validation in `src/components/organisms/ImageUploader/`
- [ ] **T027** [P] CardPreview component with custom image display in `src/components/molecules/CardPreview/`
- [ ] **T028** [P] FilterControls component for individual filters in `src/components/molecules/FilterControls/`
- [ ] **T029** [P] SyncIndicator component for backend status in `src/components/molecules/SyncIndicator/`

### State Management [P]
- [ ] **T030** [P] cardCollectionStore with Zustand in `src/stores/cardCollectionStore.ts`
- [ ] **T031** [P] cardFiltersStore with persistence in `src/stores/cardFiltersStore.ts`

## Phase 3.4: Integration & Backend Connection
- [ ] **T032** Setup IndexedDB for offline storage using idb library
- [ ] **T033** Connect CardManagementService to backend API endpoints
- [ ] **T034** Implement sync queue for offline changes with conflict resolution
- [ ] **T035** Add XMLHttpRequest upload progress tracking for images
- [ ] **T036** Global error handling for card management operations
- [ ] **T037** Structured logging for upload progress and sync status
- [ ] **T038** Image cache management with automatic cleanup
- [ ] **T039** Performance optimizations for collections over 500 cards

## Phase 3.5: Polish & Validation
- [ ] **T040** [P] Unit tests for filter utilities in `tests/unit/filterUtils.test.ts`
- [ ] **T041** [P] Performance tests for large collections in `tests/performance/large-collection.test.ts`
- [ ] **T042** [P] Update API documentation in `docs/card-management-api.md`
- [ ] **T043** Code refactoring and duplication removal
- [ ] **T044** Complete E2E test suite from quickstart.md scenarios
- [ ] **T045** Final validation against all acceptance criteria from spec.md

## Dependencies
```
Setup (T001-T003) blocks everything else
  ↓
Contract Tests (T004-T015) MUST complete before implementation
  ↓ 
Models (T016-T020) [ALL PARALLEL] block services
  ↓
Services (T021-T023) block components and stores
  ↓
Components (T024-T029) and Stores (T030-T031) [ALL PARALLEL]
  ↓
Integration (T032-T039) requires core implementation
  ↓
Polish (T040-T045) requires everything else
```

## Parallel Execution Examples

### Phase 3.2 - All Contract Tests (After Setup)
```bash
# Launch T004-T015 together:
Task: "Contract test GET /cards/collection API endpoint"
Task: "Contract test POST /cards/sync API endpoint"
Task: "Contract test image upload API endpoint"
Task: "Contract test CardManagementService interface"
Task: "Contract test ImageUploadService interface"
Task: "Integration test filtering workflow"
Task: "Integration test upload workflow"
Task: "Integration test sync workflow"
```

### Phase 3.3 - All Models (After Tests Pass)
```bash
# Launch T016-T020 together:
Task: "Create enhanced Card model with custom image support"
Task: "Create CardCollection model with search index"
Task: "Create CardFilter model with persistence"
Task: "Create CardImage model with validation"
Task: "Create SyncStatus model with conflict resolution"
```

### Phase 3.3 - All Components (After Services)
```bash
# Launch T024-T029 together:
Task: "Build CardGrid with react-window virtualization"
Task: "Build CardFilters with real-time updates"
Task: "Build ImageUploader with progress tracking"
Task: "Build CardPreview with custom images"
Task: "Build FilterControls component"
Task: "Build SyncIndicator component"
```

### Phase 3.5 - All Polish Tasks
```bash
# Launch T040-T042 together:
Task: "Write unit tests for filter utilities"
Task: "Write performance tests for large collections"
Task: "Update complete API documentation"
```

## Validation Checklist
*GATE: All must be checked before completion*

### Contract Coverage
- [x] API endpoint GET /cards/collection → T004
- [x] API endpoint POST /cards/sync → T005
- [x] API endpoint POST /cards/image → T006
- [x] API endpoints GET/DELETE image → T007
- [x] API endpoints filters → T008
- [x] CardManagementService → T009, T010
- [x] ImageUploadService → T011, T012

### Entity Coverage
- [x] Card model → T016
- [x] CardCollection model → T017
- [x] CardFilter model → T018
- [x] CardImage model → T019
- [x] SyncStatus model → T020

### Test Coverage
- [x] All contracts have tests before implementation
- [x] All integration workflows tested
- [x] Performance requirements validated
- [x] E2E scenarios from quickstart.md included

### Implementation Coverage
- [x] All services implemented (T021-T023)
- [x] All components implemented (T024-T029)
- [x] All stores implemented (T030-T031)
- [x] All integration points covered (T032-T039)

## Performance Targets
- **Card filtering**: <200ms for 500+ cards (T039, T041)
- **Image upload feedback**: <1s progress indication (T035)
- **Search results**: <100ms fuzzy matching (T021, T041)
- **Collection loading**: <1s initial, <50ms cached (T032, T033)
- **Memory usage**: <50MB for full collection with images (T038, T041)

## Success Criteria
All functional requirements from spec.md must be validated:
- ✅ FR-001: Paginated display → T024 (CardGrid)
- ✅ FR-002: Multi-criteria filtering → T025 (CardFilters)
- ✅ FR-003: Real-time search → T021 (CardManagementService)
- ✅ FR-004: Sorting capabilities → T021, T024
- ✅ FR-005: PNG image upload → T022 (ImageUploadService)
- ✅ FR-006: Image validation → T011, T019
- ✅ FR-007: Preserve card mechanics → T016, T027
- ✅ FR-008: Backend synchronization → T023, T033
- ✅ FR-009: Offline mode → T032, T034
- ✅ FR-010: Sync status feedback → T029, T037
- ✅ FR-011: Side-by-side preview → T027
- ✅ FR-012: Filter persistence → T031, T018

---
*45 tasks generated for Complete Card Management System - Ready for execution*