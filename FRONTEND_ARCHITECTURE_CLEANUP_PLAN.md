# Frontend Architecture Cleanup Plan

## Executive Summary
This document outlines a comprehensive plan to refactor and clean the Memes Wars frontend codebase to achieve a maintainable, scalable, and compliant architecture.

## Current State Analysis

### 🔴 Issues Identified

1. **Component Architecture Violations**
   - Monolithic components (e.g., RollScreen.tsx with 700+ lines)
   - Inline styles mixed with CSS files
   - Business logic mixed with presentation logic
   - Unused imports and dependencies
   - TypeScript errors and type inconsistencies

2. **State Management Issues**
   - Multiple state management patterns (Zustand stores + local state)
   - Unclear data flow between components
   - Duplicated state logic
   - Missing proper error boundaries

3. **Styling Chaos**
   - Mix of inline styles, CSS files, and CSS modules
   - No consistent naming convention
   - Duplicated styles across components
   - Missing responsive design system

4. **Code Organization Problems**
   - Inconsistent folder structure
   - Mixed concerns in single files
   - No clear separation between features
   - Missing proper index exports

## Target Architecture

### 📐 Architectural Principles

1. **Separation of Concerns**
   - Presentation components (UI)
   - Container components (Logic)
   - Business logic (Hooks/Services)
   - State management (Stores)

2. **Component Design Pattern**
   ```
   src/
   ├── features/           # Feature-based modules
   │   ├── roll/
   │   │   ├── components/
   │   │   ├── hooks/
   │   │   ├── services/
   │   │   ├── types/
   │   │   └── index.ts
   │   ├── combat/
   │   └── cards/
   ├── shared/            # Shared/reusable code
   │   ├── components/
   │   ├── hooks/
   │   ├── utils/
   │   └── types/
   └── core/              # Core application logic
       ├── stores/
       ├── services/
       └── config/
   ```

3. **Component Structure**
   ```typescript
   // Each component should follow this structure:
   ComponentName/
   ├── ComponentName.tsx      # Component logic
   ├── ComponentName.styles.ts # Styled components
   ├── ComponentName.types.ts  # TypeScript interfaces
   ├── ComponentName.test.tsx  # Unit tests
   └── index.ts               # Public exports
   ```

## Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal:** Establish architecture patterns and tooling

#### 1.1 Setup and Configuration
- [ ] Install and configure styled-components
- [ ] Setup ESLint rules for architecture compliance
- [ ] Configure path aliases for clean imports
- [ ] Create architecture documentation

#### 1.2 Core Infrastructure
- [ ] Create shared component library structure
- [ ] Implement base styling system (theme, tokens)
- [ ] Setup error boundary system
- [ ] Create performance monitoring utilities

### Phase 2: Component Refactoring (Week 2-3)
**Goal:** Refactor components following new architecture

#### 2.1 UI Components Library
```typescript
// Target structure for each UI component
src/shared/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.styles.ts
│   ├── Button.types.ts
│   ├── Button.stories.tsx
│   ├── Button.test.tsx
│   └── index.ts
├── Card/
├── Modal/
├── Toast/
└── LoadingStates/
```

**Refactoring Priority:**
1. Button component ✅ (Fix TypeScript errors first)
2. Card component
3. Toast component
4. Loading states
5. Modal/Dialog system

#### 2.2 Feature Components

**Roll Feature Refactoring:**
```typescript
src/features/roll/
├── components/
│   ├── RollButton/
│   ├── CardReveal/
│   ├── PityTracker/
│   ├── RollHistory/
│   └── AutoRollPanel/
├── hooks/
│   ├── useRollLogic.ts
│   ├── useRollAnimation.ts
│   └── usePitySystem.ts
├── services/
│   └── rollService.ts
├── types/
│   └── roll.types.ts
└── pages/
    └── RollScreen.tsx  // Composition only
```

**Combat Feature Refactoring:**
```typescript
src/features/combat/
├── components/
│   ├── Arena/
│   ├── WaveManager/
│   ├── CombatStats/
│   └── BattleEffects/
├── hooks/
│   ├── useCombatLogic.ts
│   └── useWaveSystem.ts
└── pages/
    └── CombatScreen.tsx
```

### Phase 3: State Management (Week 3)
**Goal:** Centralize and optimize state management

#### 3.1 Store Refactoring
```typescript
src/core/stores/
├── game/
│   ├── gameStore.ts
│   ├── gameActions.ts
│   └── gameSelectors.ts
├── user/
│   ├── userStore.ts
│   └── userActions.ts
├── roll/
│   └── rollStore.ts
└── index.ts
```

#### 3.2 API Layer Organization
```typescript
src/core/services/api/
├── client.ts          // Axios instance
├── endpoints/
│   ├── cards.ts
│   ├── rolls.ts
│   └── auth.ts
└── hooks/
    ├── useCards.ts
    └── useRolls.ts
```

### Phase 4: Styling System (Week 4)
**Goal:** Implement consistent styling architecture

#### 4.1 Design System Implementation
```typescript
src/shared/styles/
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   └── index.ts
├── global/
│   └── GlobalStyles.ts
└── utils/
    ├── responsive.ts
    └── animations.ts
```

#### 4.2 Component Styling Pattern
```typescript
// Example: Button.styles.ts
import styled, { css } from 'styled-components';
import { ButtonProps } from './Button.types';

export const StyledButton = styled.button<ButtonProps>`
  ${({ theme, variant, size }) => css`
    /* Base styles */
    padding: ${theme.spacing[size]};
    background: ${theme.colors[variant]};
    
    /* Responsive */
    @media ${theme.breakpoints.mobile} {
      padding: ${theme.spacing.compact[size]};
    }
  `}
`;
```

### Phase 5: Testing & Documentation (Week 5)
**Goal:** Ensure quality and maintainability

#### 5.1 Testing Strategy
- Unit tests for utilities and hooks
- Component testing with React Testing Library
- Integration tests for critical flows
- E2E tests for main user journeys

#### 5.2 Documentation
- Component documentation with Storybook
- API documentation
- Architecture decision records (ADRs)
- Developer onboarding guide

## Detailed Refactoring Tasks

### 🔧 Immediate Fixes (Priority 1)

1. **Fix TypeScript Errors**
   ```typescript
   // Button.tsx - Fix variants type issue
   const animationVariants: Variants = shouldAnimate ? {
     idle: { scale: 1, y: 0, boxShadow: 'var(--shadow-md)' },
     hover: { scale: 1.02, y: -2, boxShadow: 'var(--shadow-lg)' },
     tap: { scale: 0.98, y: 0 },
     disabled: { scale: 1, opacity: 0.6, cursor: 'not-allowed' }
   } : undefined;
   ```

2. **Remove Unused Imports**
   - Clean all components of unused imports
   - Setup ESLint rule for automatic detection

3. **Fix Hook Dependencies**
   - Ensure all useEffect hooks have correct dependencies
   - Fix useCallback dependencies

### 🏗️ Component Refactoring Guide

#### Example: Refactoring RollScreen

**Current Issues:**
- 700+ lines in single file
- Mixed concerns (UI, logic, state)
- Inline styles
- Poor TypeScript typing

**Target Structure:**

```typescript
// features/roll/pages/RollScreen.tsx
import React from 'react';
import { RollLayout } from '../layouts/RollLayout';
import { RollButton } from '../components/RollButton';
import { CardReveal } from '../components/CardReveal';
import { PityTracker } from '../components/PityTracker';
import { useRollLogic } from '../hooks/useRollLogic';

export const RollScreen: React.FC = () => {
  const {
    rollCard,
    revealedCard,
    isRolling,
    pityStats,
    rollHistory
  } = useRollLogic();

  return (
    <RollLayout>
      <PityTracker stats={pityStats} />
      <RollButton 
        onRoll={rollCard}
        isDisabled={isRolling}
      />
      {revealedCard && (
        <CardReveal card={revealedCard} />
      )}
    </RollLayout>
  );
};
```

```typescript
// features/roll/hooks/useRollLogic.ts
export const useRollLogic = () => {
  const { rollMutation } = useRollCards();
  const { addToCollection } = useGameStore();
  
  // Separated business logic
  const rollCard = useCallback(async () => {
    // Roll logic here
  }, []);
  
  return {
    rollCard,
    // ... other logic
  };
};
```

## Migration Strategy

### Step-by-Step Migration Process

1. **Create New Structure**
   - Don't delete old code immediately
   - Build new structure alongside existing code
   - Use feature flags for gradual rollout

2. **Component Migration Order**
   ```
   1. Leaf components (no dependencies)
   2. Shared UI components
   3. Feature components
   4. Page components
   5. App root
   ```

3. **Testing Each Migration**
   - Write tests for new components
   - Ensure feature parity
   - Performance benchmarking

## Success Metrics

### Code Quality Metrics
- [ ] 0 TypeScript errors
- [ ] 100% components follow architecture pattern
- [ ] <300 lines per component file
- [ ] 80%+ test coverage

### Performance Metrics
- [ ] Bundle size < 500KB (gzipped)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### Developer Experience
- [ ] Build time < 30s
- [ ] Hot reload < 2s
- [ ] Clear documentation for all components

## Risk Mitigation

### Potential Risks & Solutions

1. **Risk:** Breaking existing functionality
   **Solution:** Feature flags, comprehensive testing, staged rollout

2. **Risk:** Team adoption resistance
   **Solution:** Gradual migration, clear documentation, pair programming

3. **Risk:** Performance regression
   **Solution:** Performance monitoring, benchmarking, optimization passes

## Timeline

```
Week 1: Foundation & Setup
Week 2-3: Component Refactoring
Week 3: State Management
Week 4: Styling System
Week 5: Testing & Documentation
Week 6: Bug fixes & Optimization
```

## Checklist for Each Component Refactoring

- [ ] Separate presentation from logic
- [ ] Extract types to `.types.ts`
- [ ] Extract styles to `.styles.ts` or styled-components
- [ ] Add proper TypeScript types
- [ ] Remove unused imports
- [ ] Add JSDoc comments
- [ ] Write unit tests
- [ ] Update imports in dependent components
- [ ] Document in Storybook (if applicable)
- [ ] Performance test

## Tools & Libraries Recommendations

### Required
- **styled-components**: For component styling
- **@tanstack/react-query**: Already in use for API state
- **zustand**: Already in use for client state
- **framer-motion**: Already in use for animations

### Recommended Additions
- **@storybook/react**: Component documentation
- **@testing-library/react**: Component testing
- **eslint-plugin-architecture**: Architecture compliance
- **husky**: Pre-commit hooks for code quality

## Next Steps

1. **Immediate Actions (Today)**
   - Fix critical TypeScript errors
   - Remove unused imports
   - Create feature folders structure

2. **This Week**
   - Refactor Button component as pilot
   - Setup styled-components
   - Create first feature module (roll)

3. **Next Sprint**
   - Complete Phase 1-2
   - Begin state management refactoring

## Conclusion

This architectural cleanup will transform the codebase from a monolithic, hard-to-maintain structure to a modular, scalable, and developer-friendly architecture. The key is gradual migration with continuous testing and validation.

### Success Criteria
✅ All TypeScript errors resolved
✅ Component files < 300 lines
✅ Clear separation of concerns
✅ Consistent styling system
✅ Comprehensive test coverage
✅ Developer documentation complete

---

**Document Version:** 1.0
**Last Updated:** 2024-01-18
**Author:** Architecture Team
