# Task: [OPTIMIZATION] - Renforcer la sécurité de typage (Éliminer les `any`)

## 📋 Metadata
- **ID**: TASK-103
- **Created**: 2025-08-18
- **Status**: TODO
- **Priority**: CRITICAL
- **Size**: L
- **Assignee**: Unassigned
- **Epic**: Code Quality
- **Sprint**: Optimization Sprint

## 🎯 User Story
**As a** developer,
**I want** to replace all instances of the `any` type with specific TypeScript types,
**So that** I improve type safety, code documentation, and the overall developer experience.

## 📝 Description
This task requires a project-wide audit to find and eliminate the `any` type. This will involve creating new, more specific types and interfaces where necessary and applying them throughout the codebase, resolving all related ESLint warnings.

## ✅ Acceptance Criteria
- [ ] The command `grep -r "any" src/` returns no results.
- [ ] All ESLint warnings for `@typescript-eslint/no-explicit-any` are resolved.
- [ ] New types and interfaces are added to `src/types` as needed.
- [ ] The project compiles and runs successfully without type errors.

## 🔧 Technical Details
### Files to Modify
- Potentially any `.ts` or `.tsx` file in the `src/` directory.

### Dependencies
- TASK-102 (Custom Hooks Refactor)

