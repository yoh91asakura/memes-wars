# 🏗️ Emoji Mayhem TCG - System Architecture

## 1. Overview

The system follows a **modular, component-based architecture** with clear separation of concerns:
- **Frontend**: React + TypeScript for UI
- **State Management**: Zustand for global state
- **Animation**: Framer Motion for visual effects
- **Real-time**: Socket.IO for multiplayer (future)
- **Testing**: Vitest with TDD approach

## 2. Architecture Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│     (React Components + Framer)     │
├─────────────────────────────────────┤
│         State Management            │
│         (Zustand Stores)            │
├─────────────────────────────────────┤
│         Business Logic              │
│    (Services + Game Engines)        │
├─────────────────────────────────────┤
│           Data Models               │
│    (TypeScript Interfaces)          │
├─────────────────────────────────────┤
│         Configuration               │
│        (JSON + Constants)           │
└─────────────────────────────────────┘
```

## 3. Directory Structure

```
src/
├── components/          # React UI components
│   ├── cards/          # Card-related components
│   ├── combat/         # Combat arena components
│   ├── deck/           # Deck builder components
│   └── common/         # Shared UI components
├── services/           # Business logic
│   ├── CardService.ts  # Card operations
│   ├── CombatEngine.ts # Battle system
│   ├── DeckService.ts  # Deck management
│   └── GameState.ts    # Game state coordination
├── models/             # Data structures
│   ├── Card.ts         # Card interfaces
│   ├── Combat.ts       # Combat models
│   ├── Player.ts       # Player data
│   └── Deck.ts         # Deck structures
├── stores/             # Zustand stores
│   ├── gameStore.ts    # Main game state
│   ├── playerStore.ts  # Player data
│   └── combatStore.ts  # Combat state
├── utils/              # Utility functions
│   ├── animations.ts   # Animation helpers
│   ├── random.ts       # RNG utilities
│   └── format.ts       # Formatters
└── hooks/              # Custom React hooks
    ├── useGame.ts      # Game logic hooks
    ├── useCombat.ts    # Combat hooks
    └── useAnimation.ts # Animation hooks
```

## 4. Core Components

### 4.1 Card System
```typescript
interface ICardService {
  rollCard(luck: number): Card;
  calculateStats(card: Card): CardStats;
  applyStack(card: Card, level: number): Card;
  generatePassive(rarity: Rarity): PassiveAbility;
}
```

### 4.2 Combat Engine
```typescript
interface ICombatEngine {
  initialize(playerDeck: Deck, opponentDeck: Deck): void;
  startBattle(): void;
  processFrame(deltaTime: number): void;
  checkCollisions(): Collision[];
  applyEffects(effects: Effect[]): void;
  determineWinner(): Player | null;
}
```

### 4.3 Deck Service
```typescript
interface IDeckService {
  validateDeck(cards: Card[]): boolean;
  calculateTotalHP(deck: Deck): number;
  getActiveEmojis(deck: Deck): EmojiProjectile[];
  saveDeck(deck: Deck): void;
  loadDeck(id: string): Deck;
}
```

## 5. State Management

### 5.1 Game Store
```typescript
interface GameStore {
  // State
  player: Player;
  currentDeck: Deck;
  collection: Card[];
  coins: number;
  gems: number;
  
  // Actions
  rollCard: () => Promise<Card>;
  equipCard: (card: Card) => void;
  unequipCard: (cardId: string) => void;
  startBattle: () => void;
}
```

### 5.2 Combat Store
```typescript
interface CombatStore {
  // State
  isActive: boolean;
  playerHP: number;
  opponentHP: number;
  projectiles: Projectile[];
  effects: ActiveEffect[];
  
  // Actions
  fireProjectile: (emoji: EmojiProjectile) => void;
  applyDamage: (target: 'player' | 'opponent', amount: number) => void;
  triggerEffect: (effect: Effect) => void;
}
```

## 6. Data Flow

### 6.1 Card Rolling Flow
```
User clicks Roll → GameStore.rollCard()
  → CardService.rollCard()
  → RNG determines rarity
  → Generate card properties
  → Check for duplicate
  → Update collection
  → Display result with animation
```

### 6.2 Combat Flow
```
Start Battle → CombatStore.initialize()
  → Load both decks
  → Calculate total HP
  → Start countdown
  → Begin auto-fire loop
    → Spawn projectiles
    → Update positions
    → Check collisions
    → Apply damage/effects
  → Determine winner
  → Award rewards
```

## 7. Performance Optimizations

### 7.1 Rendering
- **Virtual scrolling** for large card collections
- **Memoization** of expensive calculations
- **RequestAnimationFrame** for smooth animations
- **Object pooling** for projectiles

### 7.2 State Updates
- **Batch updates** in combat loop
- **Selective re-renders** with React.memo
- **Zustand subscriptions** for specific slices
- **Debounced** UI updates during intense combat

## 8. Testing Strategy

### 8.1 Unit Tests
- Model validation
- Service logic
- Utility functions
- Store actions

### 8.2 Integration Tests
- Component interactions
- State management flow
- Combat simulation
- End-to-end game flow

### 8.3 Performance Tests
- FPS monitoring
- Memory usage
- Projectile limits
- Animation smoothness

## 9. Security Considerations

### 9.1 Client-Side
- Input validation
- Rate limiting on actions
- Sanitized user content
- Protected API calls

### 9.2 Future Server-Side
- Server-authoritative combat
- Anti-cheat measures
- Encrypted communications
- Session management

## 10. Scalability Plan

### 10.1 Phase 1 (Current)
- Single-player focus
- Local storage
- Client-side logic

### 10.2 Phase 2
- Backend API
- Database storage
- User accounts
- Cloud saves

### 10.3 Phase 3
- Real-time multiplayer
- Matchmaking
- Tournaments
- Trading system

## 11. Technology Stack

### Frontend
- **React** 18.2+ - UI framework
- **TypeScript** 5.3+ - Type safety
- **Vite** 5.1+ - Build tool
- **Framer Motion** 11+ - Animations
- **Zustand** 4.5+ - State management

### Testing
- **Vitest** 1.3+ - Test runner
- **Playwright** 1.54+ - E2E testing

### Future Backend
- **Node.js** - Runtime
- **Express/Fastify** - API framework
- **PostgreSQL** - Database
- **Redis** - Caching
- **Socket.IO** - WebSockets
