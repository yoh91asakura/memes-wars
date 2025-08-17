/**
 * Card.test.ts - Unit tests for card system
 * TDD approach following SPARC methodology
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  Card,
  Rarity,
  EffectType,
  TrajectoryPattern,
  RARITY_CONFIGS,
  STACK_BONUSES,
  calculateCardStats,
  randomInRange,
  rollRarity,
} from '../../src/models/Card';

describe('Card System', () => {
  describe('Rarity Configuration', () => {
    it('should have correct drop rates totaling close to 100%', () => {
      const totalDropRate = Object.values(RARITY_CONFIGS)
        .reduce((sum, config) => sum + config.dropRate, 0);
      expect(totalDropRate).toBeCloseTo(100, 1);
    });

    it('should have increasing HP ranges for higher rarities', () => {
      const rarities = Object.values(Rarity);
      for (let i = 1; i < rarities.length; i++) {
        const prevConfig = RARITY_CONFIGS[rarities[i - 1] as Rarity];
        const currConfig = RARITY_CONFIGS[rarities[i] as Rarity];
        expect(currConfig.hpRange[0]).toBeGreaterThanOrEqual(prevConfig.hpRange[1]);
      }
    });

    it('should have increasing attack speed for higher rarities', () => {
      const rarities = Object.values(Rarity);
      for (let i = 1; i < rarities.length; i++) {
        const prevConfig = RARITY_CONFIGS[rarities[i - 1] as Rarity];
        const currConfig = RARITY_CONFIGS[rarities[i] as Rarity];
        expect(currConfig.attackSpeedRange[0]).toBeGreaterThanOrEqual(prevConfig.attackSpeedRange[0]);
      }
    });
  });

  describe('Card Stats Calculation', () => {
    let baseCard: Card;

    beforeEach(() => {
      baseCard = {
        id: 'test-card',
        name: 'Test Card',
        rarity: Rarity.COMMON,
        hp: 100,
        attackSpeed: 1.0,
        stackLevel: 0,
        experience: 0,
        emojis: [
          {
            character: '🔥',
            damage: 10,
            speed: 100,
            trajectory: TrajectoryPattern.STRAIGHT,
          },
        ],
        passive: {
          id: 'test-passive',
          name: 'Test Passive',
          description: 'Test passive ability',
          triggerChance: 0.1,
          effect: () => {},
        },
      };
    });

    it('should calculate base stats correctly with no stacks', () => {
      const stats = calculateCardStats(baseCard);
      expect(stats.totalHp).toBe(100);
      expect(stats.totalAttackSpeed).toBe(1.0);
      expect(stats.totalDamage).toBe(10); // 10 damage * 1.0 attack speed
      expect(stats.emojiCount).toBe(1);
    });

    it('should apply stack bonuses correctly', () => {
      baseCard.stackLevel = 1;
      const stats = calculateCardStats(baseCard);
      
      expect(stats.totalHp).toBeCloseTo(120); // 100 * 1.2
      expect(stats.totalAttackSpeed).toBeCloseTo(1.15); // 1.0 * 1.15
      expect(stats.totalDamage).toBeCloseTo(11.5); // 10 * 1.15
      expect(stats.emojiCount).toBe(2); // 1 + 1 bonus
    });

    it('should compound stack bonuses for multiple levels', () => {
      baseCard.stackLevel = 3;
      const stats = calculateCardStats(baseCard);
      
      const expectedHp = 100 * Math.pow(1.2, 3);
      const expectedAttackSpeed = 1.0 * Math.pow(1.15, 3);
      
      expect(stats.totalHp).toBeCloseTo(expectedHp);
      expect(stats.totalAttackSpeed).toBeCloseTo(expectedAttackSpeed);
      expect(stats.emojiCount).toBe(4); // 1 + 3 bonus
    });

    it('should handle max stack level', () => {
      baseCard.stackLevel = STACK_BONUSES.MAX_STACK_LEVEL;
      const stats = calculateCardStats(baseCard);
      
      expect(stats.emojiCount).toBe(11); // 1 + 10 bonus
      expect(stats.totalHp).toBeGreaterThan(500); // Should be significantly higher
    });
  });

  describe('Utility Functions', () => {
    describe('randomInRange', () => {
      it('should generate values within specified range', () => {
        for (let i = 0; i < 100; i++) {
          const value = randomInRange(10, 20);
          expect(value).toBeGreaterThanOrEqual(10);
          expect(value).toBeLessThanOrEqual(20);
        }
      });

      it('should handle negative ranges', () => {
        const value = randomInRange(-10, -5);
        expect(value).toBeGreaterThanOrEqual(-10);
        expect(value).toBeLessThanOrEqual(-5);
      });
    });

    describe('rollRarity', () => {
      it('should return a valid rarity', () => {
        const rarity = rollRarity();
        expect(Object.values(Rarity)).toContain(rarity);
      });

      it('should respect base drop rates over many rolls', () => {
        const rolls = 10000;
        const results: Record<Rarity, number> = {
          [Rarity.COMMON]: 0,
          [Rarity.UNCOMMON]: 0,
          [Rarity.RARE]: 0,
          [Rarity.EPIC]: 0,
          [Rarity.LEGENDARY]: 0,
          [Rarity.MYTHIC]: 0,
          [Rarity.COSMIC]: 0,
        };

        for (let i = 0; i < rolls; i++) {
          const rarity = rollRarity();
          results[rarity]++;
        }

        // Check that common is most frequent
        expect(results[Rarity.COMMON]).toBeGreaterThan(results[Rarity.UNCOMMON]);
        expect(results[Rarity.UNCOMMON]).toBeGreaterThan(results[Rarity.RARE]);
        
        // Cosmic should be very rare
        expect(results[Rarity.COSMIC] / rolls).toBeLessThan(0.01);
      });

      it('should apply luck bonus correctly', () => {
        const rolls = 10000;
        const normalResults: Record<Rarity, number> = {} as any;
        const luckyResults: Record<Rarity, number> = {} as any;

        // Initialize
        Object.values(Rarity).forEach(r => {
          normalResults[r] = 0;
          luckyResults[r] = 0;
        });

        // Roll without luck
        for (let i = 0; i < rolls; i++) {
          normalResults[rollRarity(0)]++;
        }

        // Roll with high luck
        for (let i = 0; i < rolls; i++) {
          luckyResults[rollRarity(1000)]++; // 5% bonus to mythic
        }

        // Lucky rolls should have fewer commons and more mythics
        expect(luckyResults[Rarity.COMMON]).toBeLessThan(normalResults[Rarity.COMMON]);
        expect(luckyResults[Rarity.MYTHIC]).toBeGreaterThan(normalResults[Rarity.MYTHIC]);
      });
    });
  });

  describe('Card Creation', () => {
    it('should create a valid card with all required properties', () => {
      const card: Card = {
        id: 'pepe-frog',
        name: 'Pepe the Frog',
        description: 'A classic meme card',
        rarity: Rarity.RARE,
        hp: 60,
        attackSpeed: 1.75,
        stackLevel: 0,
        experience: 0,
        emojis: [
          {
            character: '🐸',
            damage: 15,
            speed: 150,
            trajectory: TrajectoryPattern.WAVE,
            effect: {
              type: EffectType.POISON,
              duration: 3,
              power: 5,
              chance: 0.2,
            },
          },
          {
            character: '💚',
            damage: 8,
            speed: 200,
            trajectory: TrajectoryPattern.STRAIGHT,
            effect: {
              type: EffectType.HEAL,
              power: 10,
              chance: 0.1,
            },
          },
        ],
        passive: {
          id: 'feels-good-man',
          name: 'Feels Good Man',
          description: 'Heals 5 HP when hitting an enemy',
          triggerChance: 0.15,
          cooldown: 2,
          effect: () => {
            // Heal logic would go here
          },
        },
        borderColor: RARITY_CONFIGS[Rarity.RARE].color,
        glowIntensity: 0.5,
      };

      expect(card.id).toBe('pepe-frog');
      expect(card.rarity).toBe(Rarity.RARE);
      expect(card.emojis).toHaveLength(2);
      expect(card.emojis[0].effect?.type).toBe(EffectType.POISON);
      expect(card.passive.name).toBe('Feels Good Man');
    });
  });
});
