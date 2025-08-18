# Task: [OPTIMIZATION] - Solidifier et réparer la suite de tests

## 📋 Metadata
- **ID**: TASK-104
- **Created**: 2025-08-18
- **Status**: TODO
- **Priority**: CRITICAL
- **Size**: L
- **Assignee**: Unassigned
- **Epic**: Testing
- **Sprint**: Optimization Sprint

## 🎯 User Story
**As a** developer,
**I want** to fix all failing unit tests and improve test coverage,
**So that** I can ensure code quality, prevent regressions, and adhere to TDD principles.

## 📝 Description
This task involves a thorough review and repair of the entire test suite. The immediate focus is on fixing the failing tests in `RollService.test.ts`. Subsequently, new tests will be written for the refactored code, including custom hooks and new stores, to achieve adequate test coverage.

## ✅ Acceptance Criteria
- [ ] All tests in `RollService.test.ts` are passing.
- [ ] All other existing tests are passing.
- [ ] New unit tests are created for all custom hooks.
- [ ] The overall test coverage of the application is significantly increased.
- [ ] The `npm run test` command completes successfully with no failures.

## 🔧 Technical Details
### Files to Modify
- `src/tests/RollService.test.ts`
- `src/tests/CombatEngine.test.ts`
- New test files within the `src/tests/` directory.

### Dependencies
- TASK-103 (Type Safety Refactor)

