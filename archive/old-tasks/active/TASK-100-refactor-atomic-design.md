# Task: [OPTIMIZATION] - Refactoriser la structure des composants (Atomic Design)

## 📋 Metadata
- **ID**: TASK-100
- **Created**: 2025-08-18
- **Status**: TODO
- **Priority**: CRITICAL
- **Size**: L
- **Assignee**: Unassigned
- **Epic**: Refactoring
- **Sprint**: Optimization Sprint

## 🎯 User Story
**As a** developer,
**I want** to refactor the component structure using Atomic Design principles,
**So that** I improve reusability, maintainability, and clarity of the UI codebase.

## 📝 Description
This task involves reorganizing all React components into the `atoms`, `molecules`, and `organisms` subdirectories as specified in `claude.md`. This foundational change will streamline future development and make the component hierarchy logical and scalable.

## ✅ Acceptance Criteria
- [ ] `src/components` contains `atoms`, `molecules`, and `organisms` directories.
- [ ] Basic UI elements (e.g., `Button`, `Input`) are moved to `src/components/atoms`.
- [ ] Composite components (e.g., `Card`, `FormField`) are moved to `src/components/molecules`.
- [ ] Complex section components (e.g., `RollScreen`, `CombatScreen`) are moved to `src/components/organisms`.
- [ ] The application compiles and runs without errors after restructuring.
- [ ] Imports are updated project-wide to reflect the new component locations.

## 🔧 Technical Details
### Files to Modify
- All files within `src/components/`
- All files that import components from `src/components/`

### Dependencies
- None

