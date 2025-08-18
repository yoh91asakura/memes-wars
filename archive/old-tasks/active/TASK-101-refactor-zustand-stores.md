# Task: [OPTIMIZATION] - Granulariser la gestion de l'état (Zustand)

## 📋 Metadata
- **ID**: TASK-101
- **Created**: 2025-08-18
- **Status**: TODO
- **Priority**: CRITICAL
- **Size**: M
- **Assignee**: Unassigned
- **Epic**: Refactoring
- **Sprint**: Optimization Sprint

## 🎯 User Story
**As a** developer,
**I want** to split the monolithic Zustand stores into smaller, domain-focused stores,
**So that** I can improve state management, reduce complexity, and prevent unnecessary re-renders.

## 📝 Description
This task focuses on breaking down `gameStore` and `rollStore` into more granular stores like `playerStore`, `collectionStore`, and `combatStore`. This will align with best practices for state management and make the application more performant and easier to maintain.

## ✅ Acceptance Criteria
- [ ] New stores (`playerStore.ts`, `collectionStore.ts`, etc.) are created in `src/stores`.
- [ ] The logic from `gameStore` and `rollStore` is correctly distributed among the new stores.
- [ ] Components are refactored to use the new, more specific stores.
- [ ] The application's state-dependent features function correctly after the refactor.
- [ ] Old monolithic stores are deprecated and removed.

## 🔧 Technical Details
### Files to Modify
- `src/stores/gameStore.ts`
- `src/stores/rollStore.ts`
- All components that currently use `useGameStore` or `useRollStore`.

### Dependencies
- TASK-100 (Atomic Design Refactor)

