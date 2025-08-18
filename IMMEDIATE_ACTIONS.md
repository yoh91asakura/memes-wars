# Immediate Actions Checklist - Frontend Cleanup

## 🔥 Critical Fixes (Do Today)

### 1. Fix TypeScript Errors
```bash
# Check current errors
npm run typecheck

# Files to fix:
- [ ] src/components/ui/Button.tsx (line 168 - Variants type issue)
- [ ] src/components/screens/RollScreen.tsx (unused imports)
- [ ] src/hooks/useAccessibility.ts (line 103 - unused parameter)
```

### 2. Quick Fixes for Button.tsx
```typescript
// Replace line 79-101 with:
import { Variants } from 'framer-motion';

const animationVariants: Variants | undefined = shouldAnimate ? {
  idle: { 
    scale: 1,
    y: 0,
    boxShadow: 'var(--shadow-md)'
  },
  hover: { 
    scale: 1.02,
    y: -2,
    boxShadow: 'var(--shadow-lg)',
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { 
    scale: 0.98,
    y: 0,
    transition: { duration: 0.1, ease: 'easeInOut' }
  },
  disabled: {
    scale: 1,
    opacity: 0.6,
    cursor: 'not-allowed'
  }
} : undefined;
```

### 3. Remove Unused Imports in RollScreen.tsx
```typescript
// Remove these lines:
- import { Button } from '../ui/Button';
- import { useUserPreferences } from '@/hooks/useResponsive';
- import { useScreenReaderAnnouncement, useFocusManagement } from '@/hooks/useAccessibility';
```

### 4. Fix useAccessibility.ts
```typescript
// Line 103 - either use the parameter or prefix with underscore
const announce = useCallback((message: string, _priority: 'polite' | 'assertive' = 'polite') => {
  // ... rest of the function
}, []);
```

## 📁 Create New Folder Structure

```bash
# Run these commands to create the new structure
mkdir -p src/features/roll/{components,hooks,services,types,pages}
mkdir -p src/features/combat/{components,hooks,services,types,pages}
mkdir -p src/features/cards/{components,hooks,services,types,pages}
mkdir -p src/shared/components/{ui,layout}
mkdir -p src/shared/{hooks,utils,types,styles}
mkdir -p src/core/{stores,services,config}
```

## 🔨 Start Component Extraction

### Extract from RollScreen.tsx

1. **Create PityTracker Component**
```bash
# Create component folder
mkdir -p src/features/roll/components/PityTracker
touch src/features/roll/components/PityTracker/PityTracker.tsx
touch src/features/roll/components/PityTracker/PityTracker.types.ts
touch src/features/roll/components/PityTracker/index.ts
```

2. **Create RollHistory Component**
```bash
mkdir -p src/features/roll/components/RollHistory
touch src/features/roll/components/RollHistory/RollHistory.tsx
touch src/features/roll/components/RollHistory/RollHistory.types.ts
touch src/features/roll/components/RollHistory/index.ts
```

3. **Create CardReveal Component**
```bash
mkdir -p src/features/roll/components/CardReveal
touch src/features/roll/components/CardReveal/CardReveal.tsx
touch src/features/roll/components/CardReveal/CardReveal.types.ts
touch src/features/roll/components/CardReveal/index.ts
```

## 🎯 Quick Wins Checklist

### Today (30 minutes)
- [ ] Fix Button.tsx TypeScript error
- [ ] Remove unused imports from RollScreen.tsx
- [ ] Fix useAccessibility.ts unused parameter
- [ ] Run `npm run typecheck` to verify fixes
- [ ] Commit fixes with message: "fix: resolve TypeScript errors and unused imports"

### Tomorrow (2 hours)
- [ ] Create new folder structure
- [ ] Extract PityTracker component from RollScreen
- [ ] Extract RollHistory component from RollScreen
- [ ] Move ParticleEffect to shared components

### This Week
- [ ] Complete RollScreen refactoring
- [ ] Setup styled-components
- [ ] Create first feature module
- [ ] Document component patterns

## 🚀 Setup Commands

```bash
# Install required dependencies
npm install styled-components
npm install -D @types/styled-components

# Install development tools
npm install -D eslint-plugin-unused-imports
npm install -D eslint-plugin-import

# Setup path aliases in tsconfig.json
# Add to compilerOptions:
"paths": {
  "@features/*": ["src/features/*"],
  "@shared/*": ["src/shared/*"],
  "@core/*": ["src/core/*"],
  "@/*": ["src/*"]
}
```

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/frontend-architecture-cleanup

# Stage and commit immediate fixes
git add -p  # Review changes
git commit -m "fix: resolve TypeScript errors and unused imports"

# Push branch
git push origin feature/frontend-architecture-cleanup
```

## ✅ Definition of Done

### For Each Component:
- [ ] TypeScript errors resolved
- [ ] No unused imports
- [ ] File < 300 lines
- [ ] Proper types exported
- [ ] Follows naming conventions
- [ ] Has index.ts barrel export

### For The Sprint:
- [ ] All components pass typecheck
- [ ] New folder structure implemented
- [ ] At least 3 components refactored
- [ ] Documentation updated
- [ ] No console errors in development

## 🔍 Validation Commands

```bash
# Check TypeScript
npm run typecheck

# Check for unused imports (after setting up eslint)
npx eslint src --ext .ts,.tsx --fix

# Build to verify
npm run build

# Run development server
npm run dev
```

## 📊 Progress Tracking

### Components to Refactor (Priority Order)
1. [ ] Button (Fix TS errors first) ⚠️
2. [ ] RollScreen (Break into smaller components) 🔴
3. [ ] Card (Standardize props and types)
4. [ ] Toast (Clean up API)
5. [ ] LoadingStates (Consolidate variants)
6. [ ] WaveCombatArena (Separate logic from UI)
7. [ ] CombatScreen (Extract sub-components)

### Files with Issues
- `Button.tsx` - TS error line 168 ⚠️
- `RollScreen.tsx` - 767 lines, needs splitting 🔴
- `useAccessibility.ts` - Unused parameter ⚠️
- `WaveCombatArena.tsx` - Mixed concerns
- Multiple files - Inline styles need extraction

---

**Start Time:** ___________
**End Time:** ___________
**Blockers:** ___________
**Notes:** ___________
