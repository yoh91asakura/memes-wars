# GitHub Copilot Instructions

This file provides context and coding conventions for GitHub Copilot when working on the Memes Wars project.

## Project Overview

Memes Wars is an auto-battler RNG card game built with modern web technologies. The core game loop consists of: ROLL → EQUIP → BATTLE → REWARD → REPEAT, designed for 30s-2min addiction cycles.

The project also includes a comprehensive spec-kit system for AI-assisted development with multi-agent coordination (Claude Code, GitHub Copilot) and constitutional TDD workflows.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand stores for reactive state
- **Styling**: Styled Components + CSS Modules
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Build**: Vite + TypeScript

## Code Style & Conventions

### TypeScript
- Use strict TypeScript with full type safety
- Prefer interfaces over types for object shapes
- Use enums for constant collections
- Always include return types for functions

```typescript
// ✅ Good
interface Card {
  id: string;
  name: string;
  rarity: CardRarity;
  emojis: string[];
}

function calculateDamage(card: Card, multiplier: number): number {
  return card.attack * multiplier;
}

// ❌ Avoid
const card = {
  id: "1",
  name: "Fire Card"
} as any;
```

### React Components
- Use functional components with hooks
- Follow atomic design pattern (atoms → molecules → organisms → pages → templates)
- Prefer named exports over default exports
- Use TypeScript for all props interfaces

```typescript
// ✅ Component Structure
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  onClick, 
  children, 
  disabled = false 
}) => {
  return (
    <StyledButton 
      variant={variant} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </StyledButton>
  );
};
```

### State Management with Zustand
- Create focused stores for specific domains
- Use middleware for persistence and devtools
- Include both state and actions in stores

```typescript
// ✅ Store Pattern
interface CardsStore {
  cards: Card[];
  selectedCard: Card | null;
  // Actions
  addCard: (card: Card) => void;
  selectCard: (cardId: string) => void;
  clearSelection: () => void;
}

export const useCardsStore = create<CardsStore>((set, get) => ({
  cards: [],
  selectedCard: null,
  
  addCard: (card: Card) => 
    set(state => ({ cards: [...state.cards, card] })),
    
  selectCard: (cardId: string) => 
    set(state => ({ 
      selectedCard: state.cards.find(c => c.id === cardId) || null 
    })),
    
  clearSelection: () => 
    set({ selectedCard: null })
}));
```

## File Structure Conventions

### Component Organization
```
src/components/
├── atoms/           # Basic UI elements (Button, Input, Badge)
├── molecules/       # Simple component combinations (Card, CardHeader)
├── organisms/       # Complex UI sections (CombatArena, RollPanel)
├── pages/          # Route-level components (CombatPage, CollectionPage)
└── templates/      # Layout components (MainLayout)
```

### File Naming
- Use PascalCase for component folders and files
- Include index.ts for clean imports
- Separate styles, types, and logic when complex

```
Button/
├── Button.tsx           # Main component
├── Button.styles.ts     # Styled components
├── Button.types.ts      # TypeScript interfaces
└── index.ts            # Export file
```

### Services & Business Logic
- Place business logic in `/src/services/`
- Use class-based services for stateful operations
- Export both class and instance for flexibility

```typescript
// ✅ Service Pattern
export class RollService {
  private pityCounter = 0;
  
  rollSingle(): RollResult {
    // Implementation
  }
  
  rollMultiple(count: number): RollResult[] {
    // Implementation
  }
}

export const rollService = new RollService();
```

## Testing Conventions

### Unit Tests (Vitest)
- Test files should be in `tests/unit/` directory
- Use `.test.ts` suffix for test files
- Mock external dependencies and RNG for deterministic tests

```typescript
// ✅ Test Pattern
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollService } from '../../src/services/RollService';

describe('RollService', () => {
  let rollService: RollService;
  
  beforeEach(() => {
    // Mock RNG for predictable tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    rollService = new RollService();
  });

  it('should guarantee rare at pity threshold', () => {
    // Test implementation
  });
});
```

### E2E Tests (Playwright)
- Test files in `tests/e2e/` with `.spec.ts` suffix
- Use data-testid attributes for reliable element selection
- Test complete user workflows, not individual components

```typescript
// ✅ E2E Test Pattern
import { test, expect } from '@playwright/test';

test('Complete game loop: Roll → Equip → Battle → Reward', async ({ page }) => {
  await page.goto('/');
  
  // Roll phase
  await page.click('[data-testid="roll-button"]');
  await expect(page.locator('[data-testid="new-card"]')).toBeVisible();
  
  // Equip phase
  await page.click('[data-testid="equip-card"]');
  
  // Battle phase
  await page.click('[data-testid="start-combat"]');
  await page.waitForSelector('[data-testid="battle-result"]');
});
```

## Game-Specific Patterns

### Card System
- All cards follow the unified Card interface
- Use rarity enum for consistent typing
- Include emojis array for display and effects

```typescript
interface Card {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'cosmic';
  emojis: string[];
  attack: number;
  health: number;
  passiveAbilities?: PassiveAbility[];
}
```

### Game Services
- Separate concerns: RollService, CombatEngine, DeckService, etc.
- Use dependency injection pattern for testability
- Include proper error handling and validation

### State Updates
- Use Zustand actions for state mutations
- Batch related updates together
- Include loading states for async operations

```typescript
// ✅ Async Action Pattern
const rollCards = async (count: number) => {
  set({ isRolling: true });
  try {
    const results = await rollService.rollMultiple(count);
    set(state => ({
      cards: [...state.cards, ...results.map(r => r.card)],
      rollHistory: [...state.rollHistory, ...results],
      currency: state.currency - (count * ROLL_COST),
      isRolling: false
    }));
  } catch (error) {
    set({ isRolling: false, error: error.message });
  }
};
```

## Performance Guidelines

### Optimization Priorities
1. Combat animations must maintain 60fps
2. Card rendering should be virtualized for large collections
3. Use React.memo for expensive components
4. Lazy load non-critical components

### Memory Management
- Clean up subscriptions in useEffect cleanup
- Use weak references for game state caching
- Implement proper cleanup in Zustand stores

## Development Commands

```bash
# Development
npm run dev                 # Start dev server
npm run dev:fast           # Skip type checking

# Testing
npm run test:watch         # TDD mode
npm run test:e2e          # Full E2E suite
npm run test:coverage     # Coverage reports

# Quality
npm run typecheck         # TypeScript validation
npm run lint:fix          # Auto-fix issues
```

## Code Generation Preferences

When generating code:
1. Always include proper TypeScript types
2. Follow the atomic design pattern for components
3. Include data-testid attributes for testability
4. Use Zustand for state management
5. Follow the existing file structure conventions
6. Include error handling and loading states
7. Write accompanying unit tests for business logic
8. Use styled-components for component styling
9. Follow the game's emoji-based theming system
10. Include JSDoc comments for complex functions

## Context References

- Main documentation: `/CLAUDE.md`
- Project specs: `/specs/001-extract-current-project/`
- Service contracts: `/specs/001-extract-current-project/contracts/`
- Game configuration: `/config/game/`