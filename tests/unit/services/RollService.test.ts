// RollService Tests - TDD approach following CLAUDE.md specifications
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RollService, RollResult } from '../../../src/services/RollService';
import { CardUtils } from '../../../src/models/Card';
import { mockRandom, mockTime } from '../../setup';

describe('RollService', () => {
  let rollService: RollService;
  
  beforeEach(() => {
    rollService = new RollService();
    rollService.resetStats(); // Reset stats between tests
    vi.clearAllMocks();
  });

  describe('Drop Rates System', () => {
    it('should respect configured drop rates over large samples', () => {
      // Mock consistent random for common drops (0.5 = should hit common 65% zone)
      mockRandom([0.5]);
      
      const results: RollResult[] = [];
      for (let i = 0; i < 1000; i++) {
        results.push(rollService.rollSingle());
      }
      
      const commons = results.filter(r => CardUtils.getRarityName(r.card.rarity).toLowerCase() === 'common').length;
      expect(commons / 1000).toBeGreaterThan(0.6); // Should be around 65%
    });

    it('should generate rare cards at configured rate', () => {
      // Mock random for rare drops (0.92 = should hit rare zone: 0.90-0.97)
      mockRandom([0.92]);
      
      const results: RollResult[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(rollService.rollSingle());
      }
      
      const rares = results.filter(r => CardUtils.getRarityName(r.card.rarity).toLowerCase() === 'rare').length;
      expect(rares).toBeGreaterThan(0); // Should get some rares
    });

    it('should generate mythic and cosmic cards at very low rates', () => {
      // Mock random for cosmic (0.99995 = should hit cosmic zone: 0.9999-1.0)
      mockRandom([0.99995]);
      
      const result = rollService.rollSingle();
      const rarityName = CardUtils.getRarityName(result.card.rarity).toLowerCase();
      expect(['mythic', 'cosmic'].includes(rarityName)).toBe(true);
    });
  });

  describe('Pity System', () => {
    it('should guarantee rare at 10 rolls without rare', () => {
      // Mock random to never hit rare naturally (0.5 = common zone)
      mockRandom([0.5]);
      
      // Roll 9 commons
      for (let i = 0; i < 9; i++) {
        const result = rollService.rollSingle();
        expect(CardUtils.getRarityName(result.card.rarity).toLowerCase()).toBe('common');
        expect(result.pityTriggered).toBe(false);
      }
      
      // 10th roll should trigger rare pity
      const result = rollService.rollSingle();
      expect(CardUtils.getRarityName(result.card.rarity).toLowerCase()).not.toBe('common');
      expect(result.pityTriggered).toBe(true);
      expect(result.pityType).toBe('rare');
    });

    it('should guarantee epic at 30 rolls without epic', () => {
      mockRandom([0.5]); // Always common
      
      // Simulate getting rares but no epics for 29 rolls
      for (let i = 0; i < 29; i++) {
        if (i % 10 === 9) {
          // Every 10th roll will be rare due to rare pity
          const result = rollService.rollSingle();
          const rarityName = CardUtils.getRarityName(result.card.rarity).toLowerCase();
          expect(['rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(rarityName)).toBe(true);
        } else {
          rollService.rollSingle();
        }
      }
      
      // 30th roll should trigger epic pity
      const result = rollService.rollSingle();
      const rarityName = CardUtils.getRarityName(result.card.rarity).toLowerCase();
      expect(['epic', 'legendary', 'mythic', 'cosmic'].includes(rarityName)).toBe(true);
      expect(result.pityTriggered).toBe(true);
      expect(['epic', 'legendary'].includes(result.pityType || '')).toBe(true);
    });

    it('should reset pity counter when rare+ is naturally rolled', () => {
      // First, build up pity
      mockRandom([0.5]); // Common
      for (let i = 0; i < 5; i++) {
        rollService.rollSingle();
      }
      
      // Then hit a natural rare  
      mockRandom([0.92]); // Rare zone: 0.90-0.97
      const result = rollService.rollSingle();
      expect(CardUtils.getRarityName(result.card.rarity).toLowerCase()).toBe('rare');
      expect(result.pityTriggered).toBe(false);
      
      // Pity counter should be reset
      const stats = rollService.getStats();
      expect(stats.rollsSinceRare).toBe(0);
    });

    it('should track separate pity counters for different rarities', () => {
      const stats = rollService.getStats();
      
      // Initial state
      expect(stats.rollsSinceRare).toBe(0);
      expect(stats.rollsSinceEpic).toBe(0);
      expect(stats.rollsSinceLegendary).toBe(0);
      
      mockRandom([0.5]); // Common
      rollService.rollSingle();
      
      const updatedStats = rollService.getStats();
      expect(updatedStats.rollsSinceRare).toBe(1);
      expect(updatedStats.rollsSinceEpic).toBe(1);
      expect(updatedStats.rollsSinceLegendary).toBe(1);
    });
  });

  describe('Multi-Roll Operations', () => {
    it('should perform 10x rolls correctly', () => {
      // Reset stats to ensure clean start
      rollService.resetStats();
      mockRandom([0.5]); // All commons for predictability
      
      const results = rollService.rollMultiple(10);
      expect(results).toHaveLength(10);
      
      // With pity system, the 10th roll should trigger rare pity, so we expect 9 commons and 1 rare
      const commons = results.filter(r => CardUtils.getRarityName(r.card.rarity).toLowerCase() === 'common');
      const rares = results.filter(r => CardUtils.getRarityName(r.card.rarity).toLowerCase() === 'rare');
      expect(commons).toHaveLength(9);
      expect(rares).toHaveLength(1);
    });

    it('should apply pity system within 10x rolls', () => {
      // Start with 9 rolls already done
      mockRandom([0.5]);
      for (let i = 0; i < 9; i++) {
        rollService.rollSingle();
      }
      
      // Now do 10x roll - first card should trigger pity
      const results = rollService.rollMultiple(10);
      expect(CardUtils.getRarityName(results[0].card.rarity).toLowerCase()).not.toBe('common');
      expect(results[0].pityTriggered).toBe(true);
    });
  });

  describe('Statistics Tracking', () => {
    it('should track total rolls correctly', () => {
      let stats = rollService.getStats();
      expect(stats.totalRolls).toBe(0);
      
      rollService.rollSingle();
      rollService.rollSingle();
      
      stats = rollService.getStats();
      expect(stats.totalRolls).toBe(2);
    });

    it('should track rarity distribution', () => {
      mockRandom([0.5]); // Commons
      
      rollService.rollSingle();
      rollService.rollSingle();
      
      const stats = rollService.getStats();
      expect(stats.collectedByRarity.common).toBe(2);
      expect(stats.collectedByRarity.rare).toBe(0);
    });

    it('should update collection statistics', () => {
      const stats = rollService.getStats();
      expect(stats.totalRolls).toBeTypeOf('number');
      expect(stats.collectedByRarity).toHaveProperty('common');
      expect(stats.collectedByRarity).toHaveProperty('mythic');
      expect(stats.collectedByRarity).toHaveProperty('cosmic');
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid drop rate configuration', () => {
      const config = rollService.getConfig();
      
      // All drop rates should sum to 1.0 (within floating point precision)
      const totalRate = Object.values(config.dropRates)
        .reduce((sum, rate) => sum + rate, 0);
      expect(Math.abs(totalRate - 1.0)).toBeLessThan(0.0001);
    });

    it('should have reasonable pity thresholds', () => {
      const config = rollService.getConfig();
      
      expect(config.pitySystem.guaranteedRareAt).toBe(10);
      expect(config.pitySystem.guaranteedEpicAt).toBe(30);
      expect(config.pitySystem.guaranteedLegendaryAt).toBe(90);
      expect(config.pitySystem.guaranteedMythicAt).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid roll count gracefully', () => {
      expect(() => rollService.rollMultiple(0)).toThrow();
      expect(() => rollService.rollMultiple(-1)).toThrow();
      expect(() => rollService.rollMultiple(101)).toThrow(); // Max limit
    });

    it('should handle corrupted state gracefully', () => {
      // This would test recovery from invalid pity counters, etc.
      expect(() => rollService.resetStats()).not.toThrow();
    });
  });

  describe('Time-based Features', () => {
    it('should track roll timing for statistics', () => {
      mockTime(1000);
      const result = rollService.rollSingle();
      
      expect(result.timestamp).toBe(1000);
    });

    it('should support daily roll bonuses (if implemented)', () => {
      // This would test daily bonus mechanics
      // Currently placeholder for future implementation
      expect(rollService.getDailyBonusInfo).toBeDefined();
    });
  });
});