import { describe, it, expect, beforeEach } from 'vitest';
import { RollService, RollStats } from '../services/RollService';

describe('RollService', () => {
  let rollService: RollService;
  let initialStats: RollStats;

  beforeEach(() => {
    rollService = RollService.getInstance();
    initialStats = {
      totalRolls: 0,
      rollsSinceRare: 0,
      rollsSinceEpic: 0,
      rollsSinceLegendary: 0,
      rollsSinceMythic: 0,
      rollsSinceCosmic: 0,
      collectedByRarity: {}
    };
  });

  describe('rollSingle', () => {
    it('should return a valid roll result', () => {
      const result = rollService.rollSingle(initialStats);
      
      expect(result).toBeDefined();
      expect(result.card).toBeDefined();
      expect(result.card.id).toBeDefined();
      expect(result.card.rarity).toBeDefined();
      expect(result.rollNumber).toBe(1);
    });

    it('should trigger pity system for rare after 10 rolls', () => {
      const stats: RollStats = {
        ...initialStats,
        rollsSinceRare: 10,
        totalRolls: 10
      };
      
      const result = rollService.rollSingle(stats);
      const isRareOrBetter = ['rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(result.card.rarity);
      
      expect(isRareOrBetter).toBe(true);
      expect(result.pityTriggered).toBe(true);
    });
  });

  describe('rollTen', () => {
    it('should return exactly 10 cards', () => {
      const result = rollService.rollTen(initialStats);
      
      expect(result.cards).toHaveLength(10);
      expect(result.totalValue).toBeGreaterThan(0);
    });

    it('should guarantee at least one rare or better', () => {
      const result = rollService.rollTen(initialStats);
      
      const hasRareOrBetter = result.cards.some(r => 
        ['rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(r.card.rarity)
      );
      
      expect(hasRareOrBetter).toBe(true);
    });

    it('should include rarity breakdown', () => {
      const result = rollService.rollTen(initialStats);
      
      expect(result.rarityBreakdown).toBeDefined();
      const totalCards = Object.values(result.rarityBreakdown!).reduce((sum, count) => sum + count, 0);
      expect(totalCards).toBe(10);
    });

    it('should include highlights for rare or better cards', () => {
      const result = rollService.rollTen(initialStats);
      
      expect(result.highlights).toBeDefined();
      result.highlights!.forEach(card => {
        const isHighRarity = ['rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(card.rarity);
        expect(isHighRarity).toBe(true);
      });
    });
  });

  describe('rollHundred', () => {
    it('should return exactly 100 cards', () => {
      const result = rollService.rollHundred(initialStats);
      
      expect(result.cards).toHaveLength(100);
    });

    it('should guarantee at least one epic or better', () => {
      const result = rollService.rollHundred(initialStats);
      
      const hasEpicOrBetter = result.cards.some(r => 
        ['epic', 'legendary', 'mythic', 'cosmic'].includes(r.card.rarity)
      );
      
      expect(hasEpicOrBetter).toBe(true);
    });

    it('should give bonus cards for high total value', () => {
      // Simulate a high-value roll scenario
      const result = rollService.rollHundred(initialStats);
      
      if (result.totalValue > 5000) {
        expect(result.bonusCards.length).toBeGreaterThan(0);
      }
    });

    it('should include complete rarity breakdown', () => {
      const result = rollService.rollHundred(initialStats);
      
      expect(result.rarityBreakdown).toBeDefined();
      const totalCards = Object.values(result.rarityBreakdown!).reduce((sum, count) => sum + count, 0);
      expect(totalCards).toBe(100);
    });
  });

  describe('Drop Rates', () => {
    it('should return correct drop rates for each rarity', () => {
      expect(rollService.getDropRate('common')).toBe(0.65);
      expect(rollService.getDropRate('uncommon')).toBe(0.25);
      expect(rollService.getDropRate('rare')).toBe(0.07);
      expect(rollService.getDropRate('epic')).toBe(0.025);
      expect(rollService.getDropRate('legendary')).toBe(0.004);
      expect(rollService.getDropRate('mythic')).toBe(0.0009);
      expect(rollService.getDropRate('cosmic')).toBe(0.0001);
    });
  });

  describe('Pity System', () => {
    it('should provide accurate pity information', () => {
      const stats: RollStats = {
        ...initialStats,
        rollsSinceRare: 5,
        rollsSinceEpic: 25,
        rollsSinceLegendary: 100,
        rollsSinceMythic: 500,
        rollsSinceCosmic: 2500
      };
      
      const pityInfo = rollService.getPityInfo(stats);
      
      expect(pityInfo.rare.current).toBe(5);
      expect(pityInfo.rare.max).toBe(10);
      expect(pityInfo.rare.percentage).toBe(50);
      
      expect(pityInfo.epic.current).toBe(25);
      expect(pityInfo.epic.max).toBe(30);
      expect(pityInfo.epic.percentage).toBeCloseTo(83.33, 1);
    });
  });

  describe('Available Rarities', () => {
    it('should return all available rarities', () => {
      const rarities = rollService.getAvailableRarities();
      
      // Debug: Log what rarities are actually available
      console.log('Available rarities:', rarities);
      console.log('Uncommon card test:', rollService.getRandomCardOfRarity('common'));
      
      expect(rarities).toContain('common');
      expect(rarities).toContain('uncommon');
      expect(rarities).toContain('rare');
      expect(rarities).toContain('epic');
      expect(rarities).toContain('legendary');
      expect(rarities).toContain('mythic');
      expect(rarities).toContain('cosmic');
    });
  });

  describe('Performance', () => {
    it('should handle 1000 single rolls efficiently', () => {
      const startTime = performance.now();
      let stats = initialStats;
      
      for (let i = 0; i < 1000; i++) {
        rollService.rollSingle(stats);
        // Simulate stats update (simplified)
        stats = {
          ...stats,
          totalRolls: stats.totalRolls + 1
        };
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 rolls in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle 10 hundred-rolls efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        rollService.rollHundred(initialStats);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 10 hundred-rolls (1000 cards) in less than 500ms
      expect(duration).toBeLessThan(500);
    });
  });
});
