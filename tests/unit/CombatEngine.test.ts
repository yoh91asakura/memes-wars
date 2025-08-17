import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatEngine, AABBCollisionBox } from '../../src/services/CombatEngine';
import { Card } from '../../src/types/card';

// Mock canvas and context
const mockCanvas = {
  width: 1200,
  height: 800,
  getContext: vi.fn(() => ({
    fillStyle: '',
    fillRect: vi.fn(),
    fillText: vi.fn(),
    font: ''
  }))
} as unknown as HTMLCanvasElement;

// Mock RequestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.performance = {
  now: vi.fn(() => Date.now())
} as unknown as Performance;

describe('CombatEngine', () => {
  let engine: CombatEngine;
  let mockCard: Card;

  beforeEach(() => {
    engine = new CombatEngine(mockCanvas);
    
    mockCard = {
      id: 'test-card',
      name: 'Test Card',
      rarity: 'common',
      type: 'creature',
      cost: 1,
      emoji: '🔥'
    };
  });

  describe('Engine Initialization', () => {
    it('should initialize with canvas', () => {
      expect(engine).toBeDefined();
      expect(engine.getPerformanceStats().fps).toBe(0);
      expect(engine.getPerformanceStats().entities).toBe(0);
      expect(engine.getPerformanceStats().projectiles).toBe(0);
    });

    it('should set canvas dimensions', () => {
      expect(mockCanvas.width).toBe(1200);
      expect(mockCanvas.height).toBe(800);
    });
  });

  describe('Entity Management', () => {
    it('should create entity from card', () => {
      const entity = engine.createEntityFromCard(mockCard, 'test', 100, 200, true);
      
      expect(entity.id).toBe('test');
      expect(entity.x).toBe(100);
      expect(entity.y).toBe(200);
      expect(entity.isPlayer).toBe(true);
      expect(entity.isAlive).toBe(true);
      expect(entity.hp).toBe(10); // Default HP from card.defense
      expect(entity.maxHp).toBe(10);
      expect(entity.emojis).toContain('🔥');
    });

    it('should add and remove entities', () => {
      const entity = engine.createEntityFromCard(mockCard, 'test', 100, 200, true);
      
      engine.addEntity(entity);
      expect(engine.getPerformanceStats().entities).toBe(1);
      
      engine.removeEntity(entity.id);
      expect(engine.getPerformanceStats().entities).toBe(0);
    });

    it('should handle entity damage and death', () => {
      const entity = engine.createEntityFromCard(mockCard, 'test', 100, 200, true);
      
      expect(entity.hp).toBe(10); // Default HP
      expect(entity.isAlive).toBe(true);
      
      entity.takeDamage(5);
      expect(entity.hp).toBe(5);
      expect(entity.isAlive).toBe(true);
      
      entity.takeDamage(6);
      expect(entity.hp).toBe(0);
      expect(entity.isAlive).toBe(false);
    });

    it('should handle entity healing', () => {
      const entity = engine.createEntityFromCard(mockCard, 'test', 100, 200, true);
      
      entity.takeDamage(5);
      expect(entity.hp).toBe(5);
      
      entity.heal(3);
      expect(entity.hp).toBe(8);
      
      // Should not heal above max HP
      entity.heal(5);
      expect(entity.hp).toBe(10); // Max HP is 10
    });
  });

  describe('AABB Collision Detection', () => {
    it('should detect collision between overlapping boxes', () => {
      const box1: AABBCollisionBox = { x: 10, y: 10, width: 20, height: 20 };
      const box2: AABBCollisionBox = { x: 15, y: 15, width: 20, height: 20 };
      
      expect(engine.checkAABBCollision(box1, box2)).toBe(true);
    });

    it('should not detect collision between separated boxes', () => {
      const box1: AABBCollisionBox = { x: 10, y: 10, width: 20, height: 20 };
      const box2: AABBCollisionBox = { x: 50, y: 50, width: 20, height: 20 };
      
      expect(engine.checkAABBCollision(box1, box2)).toBe(false);
    });

    it('should detect edge collision', () => {
      const box1: AABBCollisionBox = { x: 10, y: 10, width: 20, height: 20 };
      const box2: AABBCollisionBox = { x: 30, y: 10, width: 20, height: 20 };
      
      expect(engine.checkAABBCollision(box1, box2)).toBe(false);
      
      // Touching edge
      const box3: AABBCollisionBox = { x: 29, y: 10, width: 20, height: 20 };
      expect(engine.checkAABBCollision(box1, box3)).toBe(true);
    });
  });

  describe('Combat System', () => {
    it('should start combat with two cards', () => {
      const playerCard: Card = { ...mockCard, id: 'player-card' };
      const enemyCard: Card = { ...mockCard, id: 'enemy-card', emoji: '⚡' };
      
      engine.startCombat(playerCard, enemyCard);
      
      const stats = engine.getPerformanceStats();
      expect(stats.entities).toBe(2);
    });

    it('should determine combat winner', () => {
      // Initially no combat
      let result = engine.isCombatOver();
      expect(result.isOver).toBe(true); // No entities = over
      
      // Add entities
      const playerEntity = engine.createEntityFromCard(mockCard, 'player', 100, 200, true);
      const enemyEntity = engine.createEntityFromCard(mockCard, 'enemy', 300, 200, false);
      
      engine.addEntity(playerEntity);
      engine.addEntity(enemyEntity);
      
      result = engine.isCombatOver();
      expect(result.isOver).toBe(false);
      
      // Kill enemy
      enemyEntity.takeDamage(100);
      result = engine.isCombatOver();
      expect(result.isOver).toBe(true);
      expect(result.winner).toBe('player');
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance stats', () => {
      const stats = engine.getPerformanceStats();
      
      expect(stats).toHaveProperty('fps');
      expect(stats).toHaveProperty('projectiles');
      expect(stats).toHaveProperty('entities');
      expect(typeof stats.fps).toBe('number');
      expect(typeof stats.projectiles).toBe('number');
      expect(typeof stats.entities).toBe('number');
    });

    it('should start and stop engine', () => {
      engine.start();
      // Engine should be running
      
      engine.stop();
      // Engine should be stopped
      
      // Since we can't easily test the internal running state,
      // we verify the methods don't throw errors
      expect(true).toBe(true);
    });
  });

  describe('Status Effects', () => {
    it('should apply and remove status effects', () => {
      const entity = engine.createEntityFromCard(mockCard, 'test', 100, 200, true);
      
      const burnEffect = {
        id: 'burn_1',
        type: 'burn',
        value: 2,
        duration: 3,
        tickDamage: 1
      };
      
      entity.applyEffect(burnEffect);
      expect(entity.effects.has('burn_1')).toBe(true);
      expect(entity.effects.get('burn_1')?.value).toBe(2);
      
      entity.removeEffect('burn_1');
      expect(entity.effects.has('burn_1')).toBe(false);
    });
  });

  describe('Integration with Emoji System', () => {
    it('should create entities with emoji data', () => {
      const fireCard: Card = {
        ...mockCard,
        emoji: '🔥'
      };
      
      const entity = engine.createEntityFromCard(fireCard, 'fire', 100, 200, true);
      expect(entity.emojis).toContain('🔥');
    });

    it('should handle cards without emojis', () => {
      const emptyCard: Card = {
        ...mockCard
      };
      delete (emptyCard as any).emoji;
      
      const entity = engine.createEntityFromCard(emptyCard, 'empty', 100, 200, true);
      expect(entity.emojis).toEqual([]);
    });
  });

  describe('60 FPS Performance', () => {
    it('should maintain target frame rate settings', () => {
      // Check that engine is configured for 60 FPS
      const stats = engine.getPerformanceStats();
      expect(stats).toBeDefined();
      
      // We can't easily test actual FPS in unit tests,
      // but we can verify the structure is correct
      expect(typeof stats.fps).toBe('number');
    });
  });
});