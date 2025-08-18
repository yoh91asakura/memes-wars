# Task: [OPTIMIZATION] - Extraire la logique dans des Hooks personnalisés

## 📋 Metadata
- **ID**: TASK-102
- **Created**: 2025-08-18
- **Status**: TODO
- **Priority**: CRITICAL
- **Status**: IN_PROGRESS
- **Assignee**: Gemini
- **Epic**: Refactoring
- **Sprint**: Optimization Sprint

## 🎯 User Story
**As a** developer,
**I want** to extract reusable component logic into custom React hooks,
**So that** I can separate business logic from presentation, improve readability, and promote code reuse.

## 📝 Description
This task involves creating a `src/hooks` directory and populating it with custom hooks that encapsulate business logic currently living inside components. Examples include managing coin state, handling combat sequences, and processing card rolls.

## ✅ Acceptance Criteria
- [ ] A `src/hooks` directory is created.
- [ ] Reusable logic from components like `RollScreen` and `CombatScreen` is extracted into custom hooks (e.g., `useRoll`, `useCombat`).
- [ ] Components are simplified and now use these hooks for their logic.
- [ ] The application remains fully functional after the refactoring.

## 🔧 Technical Details
### Files to Modify
- `src/components/organisms/RollScreen.tsx`
- `src/components/organisms/CombatScreen.tsx`
- Any other components with significant reusable logic.

### Dependencies
- TASK-101 (Zustand Store Refactor)

