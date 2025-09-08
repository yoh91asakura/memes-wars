# CombatEngine Contract

## Interface Definition

```typescript
interface ICombatEngine {
  // Initialize new combat session
  startCombat(deck: Deck, stage: Stage): Combat;
  
  // Process single frame of combat
  processFrame(combat: Combat, deltaTime: number): Combat;
  
  // Pause/resume combat
  pauseCombat(combatId: string): void;
  resumeCombat(combatId: string): void;
  
  // End combat prematurely
  endCombat(combatId: string, reason: string): Combat;
  
  // Get combat state
  getCombat(combatId: string): Combat | null;
  
  // Process projectile physics
  updateProjectiles(projectiles: Projectile[], deltaTime: number): Projectile[];
  
  // Handle collision detection
  checkCollisions(projectiles: Projectile[]): Collision[];
  
  // Apply combat effects
  applyEffects(combat: Combat, effects: CombatEffect[]): Combat;
}

interface Collision {
  projectile: Projectile;
  target: 'player' | 'enemy';
  damage: number;
  effects: EffectType[];
  position: Vector2D;
}

interface CombatEffect {
  type: EffectType;
  target: 'player' | 'enemy';
  duration: number;
  value: number;
  source: string;
}

enum EffectType {
  BURN = 'burn',           // Damage over time
  FREEZE = 'freeze',       // Slow attack speed
  STUN = 'stun',          // Skip attacks
  HEAL = 'heal',          // Restore health
  SHIELD = 'shield',      // Absorb damage
  BOOST = 'boost',        // Increase damage
  POISON = 'poison',      // DOT + reduce healing
  LUCKY = 'lucky',        // Increased crit chance
  BURST = 'burst',        // Next attack +damage
  REFLECT = 'reflect'     // Return damage
}
```

## Behavior Contracts

### Combat Initialization Contract
**GIVEN** valid deck and stage
**WHEN** `startCombat(deck, stage)` is called
**THEN**
- Create new Combat instance with unique ID
- Set player health = sum of deck card health
- Set enemy health = stage enemy health  
- Initialize empty projectiles and effects arrays
- Set status to PREPARING
- Return Combat object

### Frame Processing Contract  
**GIVEN** active combat session
**WHEN** `processFrame(combat, deltaTime)` is called
**THEN**
- Update all projectile positions based on velocity
- Process collision detection
- Apply damage from hits
- Update active effect timers
- Apply DOT/HOT effects
- Generate new projectiles based on attack speeds
- Remove expired projectiles and effects
- Check win/loss conditions
- Return updated Combat state

### Combat Duration Contract
**GIVEN** combat in progress
**WHEN** 120 seconds have elapsed
**THEN**
- Force combat to end
- Determine winner by remaining health percentage
- Set combat status to COMPLETED
- Generate appropriate CombatResult

### Projectile Physics Contract
**GIVEN** projectile with velocity and position
**WHEN** `updateProjectiles()` called with deltaTime
**THEN**
- Update position: newPos = oldPos + (velocity * deltaTime)
- Apply gravity/arc if projectile type requires
- Remove projectiles that exit screen bounds
- Maintain maximum 50 active projectiles

### Collision Detection Contract
**GIVEN** active projectiles and targets
**WHEN** `checkCollisions()` is called
**THEN**
- Use bounding box collision for performance
- Return collision data for all hits
- Include damage calculation based on card stats
- Include effect applications from emoji types
- Mark collided projectiles for removal

### Effect Application Contract
**GIVEN** combat effect to apply
**WHEN** `applyEffects()` is called
**THEN**
- Validate effect type and target
- Apply immediate effects (damage, healing)
- Add ongoing effects to active effects list
- Stack effects of same type (damage) or override (status)
- Respect effect duration limits

## Test Scenarios

### Happy Path Tests
```typescript
describe('CombatEngine Happy Path', () => {
  test('combat initializes correctly', () => {
    const deck = createTestDeck();
    const stage = createTestStage();
    const combat = engine.startCombat(deck, stage);
    
    expect(combat.id).toBeDefined();
    expect(combat.status).toBe(CombatStatus.PREPARING);
    expect(combat.playerHealth).toBe(deck.cards.reduce((sum, card) => sum + card.health, 0));
  });
  
  test('projectiles move correctly', () => {
    const projectiles = [createTestProjectile()];
    const updated = engine.updateProjectiles(projectiles, 16); // 1 frame at 60fps
    
    expect(updated[0].position.x).toBeGreaterThan(projectiles[0].position.x);
  });
});
```

### Combat Flow Tests
```typescript
describe('CombatEngine Combat Flow', () => {
  test('combat ends when health reaches zero', () => {
    const combat = createTestCombat();
    combat.playerHealth = 1;
    
    const damage = new CombatEffect({
      type: EffectType.DAMAGE,
      target: 'player',
      value: 5
    });
    
    const result = engine.applyEffects(combat, [damage]);
    expect(result.status).toBe(CombatStatus.COMPLETED);
    expect(result.result.winner).toBe('enemy');
  });
  
  test('timeout results in health-based winner', () => {
    const combat = createTestCombat();
    combat.startTime = new Date(Date.now() - 125000); // 125 seconds ago
    
    const result = engine.processFrame(combat, 16);
    expect(result.status).toBe(CombatStatus.COMPLETED);
  });
});
```

### Performance Tests
```typescript
describe('CombatEngine Performance', () => {
  test('handles maximum projectiles efficiently', () => {
    const projectiles = Array.from({length: 50}, () => createTestProjectile());
    
    const startTime = performance.now();
    engine.updateProjectiles(projectiles, 16);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(5); // < 5ms per frame
  });
});
```

## Dependencies
- Vector2D math utilities
- Animation frame timing
- Random number generator (for effect chances)
- Configuration service (for balance values)
- Event system (for combat notifications)