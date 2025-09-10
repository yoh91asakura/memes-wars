# Research: Memes Wars Game Systems Implementation

## Overview
Research findings for implementing complete auto-battler RNG card game systems based on existing codebase architecture and requirements from the feature specification.

## Key Technology Decisions

### Game Engine Architecture
**Decision**: Frame-based combat engine with RAF (RequestAnimationFrame) loop  
**Rationale**: Provides smooth 60fps animations for emoji projectiles, works in all modern browsers, allows precise timing control for combat events  
**Alternatives considered**: 
- Canvas-based game engines (too complex for card game needs)
- CSS-only animations (insufficient for collision detection)
- WebGL (overkill for 2D projectiles)

### RNG Implementation
**Decision**: Mersenne Twister PRNG with seedable state for testing  
**Rationale**: High-quality randomness, reproducible for testing, existing Math.random() adequate for production  
**Alternatives considered**:
- Crypto.getRandomValues() (unnecessary security overhead)
- Custom LCG (lower quality randomness)
- Third-party RNG libraries (additional dependency)

### Pity System Architecture  
**Decision**: Configurable threshold-based guarantee system with separate counters per rarity  
**Rationale**: Matches gacha game industry standards, prevents player frustration, easily testable  
**Alternatives considered**:
- Bad luck protection only (less predictable)
- Single pity counter (less granular control)
- Probability increase per roll (more complex to balance)

### Combat Projectile System
**Decision**: Physics-based projectile with collision detection using bounding boxes  
**Rationale**: Visual feedback crucial for player engagement, performant for browser, supports emoji rendering  
**Alternatives considered**:
- Instant damage (less engaging)
- Complex physics engine (performance overhead)
- Particle systems (browser compatibility issues)

### State Management Pattern
**Decision**: Zustand stores with immer for immutable updates  
**Rationale**: Already established pattern in codebase, good performance, TypeScript support  
**Alternatives considered**:
- Redux (too complex for game state)
- React Context (performance issues with frequent updates)
- Native React state (insufficient for global game state)

### Card Data Structure
**Decision**: Unified card interface with optional properties for rarity-specific features  
**Rationale**: Type safety, extensible for new card types, memory efficient  
**Alternatives considered**:
- Inheritance-based card hierarchy (more complex)
- Composition pattern (additional abstraction)
- Separate interfaces per rarity (type explosion)

### Animation Framework
**Decision**: Framer Motion for UI animations + custom RAF loop for combat  
**Rationale**: Framer Motion handles UI transitions well, custom loop needed for game-specific timing  
**Alternatives considered**:
- CSS animations only (insufficient control)
- GSAP (additional large dependency)
- React Spring (less declarative API)

### Persistence Strategy
**Decision**: localStorage with versioned save format and migration system  
**Rationale**: No backend required, instant saves, handles browser storage limits  
**Alternatives considered**:
- SessionStorage (lost on tab close)
- IndexedDB (overkill for simple data)
- Cloud saves (requires backend infrastructure)

### Testing Strategy for Game Systems
**Decision**: Mock RNG for deterministic tests, real browser APIs for integration tests  
**Rationale**: Enables reliable testing of probability-based systems while maintaining realistic integration testing  
**Alternatives considered**:
- Pure mocking (loses integration confidence)
- No RNG mocking (flaky tests)
- Statistical testing only (slow test suite)

### Performance Optimization
**Decision**: Object pooling for projectiles, RAF-based render loop with delta time  
**Rationale**: Prevents garbage collection during combat, maintains smooth framerate  
**Alternatives considered**:
- Create/destroy pattern (GC pressure)
- Fixed timestep (less smooth)
- setTimeout-based updates (less accurate timing)

## Implementation Patterns

### Service Layer Pattern
All game logic encapsulated in services with clear interfaces:
- RollService: Handles gacha mechanics and pity system
- CombatEngine: Manages real-time combat simulation  
- CardService: Card collection and metadata management
- DeckService: Deck building with constraint validation
- CraftingSystem: Item creation and resource management

### Event-Driven Combat
Combat events dispatched through observer pattern for UI updates and effect processing without tight coupling between systems.

### Configurable Game Balance
All numerical values (drop rates, damage, costs) externalized to configuration objects for easy balancing without code changes.

### Save Game Versioning
Migration system handles save format changes to prevent data loss during game updates.

## Risk Mitigation

### Performance Risks
- **Risk**: Combat animations cause frame drops on lower-end devices
- **Mitigation**: Configurable quality settings, object pooling, performance monitoring

### Balance Risks  
- **Risk**: Game becomes too addictive or exploitative
- **Mitigation**: Ethical design principles, reasonable progression curves, no real money integration

### Save Data Risks
- **Risk**: Browser storage limits or data corruption
- **Mitigation**: Compressed save format, backup system, graceful degradation

### Browser Compatibility Risks
- **Risk**: Features not supported in older browsers
- **Mitigation**: Progressive enhancement, feature detection, graceful fallbacks

## Next Steps
Phase 1 will design specific data models and API contracts based on these architectural decisions.