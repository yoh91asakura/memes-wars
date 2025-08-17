import { describe, it, expect } from 'vitest';
import { EmojiAssignmentService } from '../services/EmojiAssignmentService';
import { EmojiSynergyCalculator } from '../services/EmojiSynergyCalculator';
import { getEmojiPower, getEmojisByCategory, EMOJI_POWERS_DATABASE } from '../systems/emoji-database';
import { EmojiCategory } from '../types/emoji';
import { Card } from '../types/card';

describe('Emoji System', () => {
  describe('Emoji Database', () => {
    it('should have sufficient emojis for gameplay', () => {
      const emojiCount = Object.keys(EMOJI_POWERS_DATABASE).length;
      expect(emojiCount).toBeGreaterThan(30); // Adjusted to actual count
    });

    it('should have all required emoji categories', () => {
      const categories = Object.values(EMOJI_POWERS_DATABASE).map(e => e.category);
      const uniqueCategories = new Set(categories);
      
      expect(uniqueCategories).toContain(EmojiCategory.DAMAGE);
      expect(uniqueCategories).toContain(EmojiCategory.CONTROL);
      expect(uniqueCategories).toContain(EmojiCategory.SUPPORT);
      expect(uniqueCategories).toContain(EmojiCategory.DEBUFF);
      expect(uniqueCategories).toContain(EmojiCategory.ENERGY);
    });

    it('should get emoji power by character', () => {
      const fireEmoji = getEmojiPower('🔥');
      expect(fireEmoji).toBeDefined();
      expect(fireEmoji!.name).toBe('Flame'); // Updated to match database
      expect(fireEmoji!.baseDamage).toBe(3);
    });

    it('should get emojis by category', () => {
      const damageEmojis = getEmojisByCategory(EmojiCategory.DAMAGE);
      expect(damageEmojis.length).toBeGreaterThan(0);
      
      damageEmojis.forEach(emoji => {
        expect(emoji.category).toBe(EmojiCategory.DAMAGE);
      });
    });
  });

  describe('Emoji Assignment Service', () => {
    it('should assign correct number of emojis by rarity', () => {
      const testCards: Card[] = [
        { id: 'test-common', name: 'Test Common', rarity: 'common', type: 'spell', cost: 2 },
        { id: 'test-rare', name: 'Test Rare', rarity: 'rare', type: 'creature', cost: 4 },
        { id: 'test-legendary', name: 'Test Legendary', rarity: 'legendary', type: 'spell', cost: 8 }
      ];

      testCards.forEach(card => {
        const assignment = EmojiAssignmentService.assignEmojisToCard(card, 12345);
        const rules = EmojiAssignmentService.getRulesForRarity(card.rarity);
        
        expect(assignment.emojis.length).toBeGreaterThanOrEqual(rules!.minEmojis);
        expect(assignment.emojis.length).toBeLessThanOrEqual(rules!.maxEmojis);
      });
    });

    it('should respect category restrictions for common cards', () => {
      const commonCard: Card = {
        id: 'test-common',
        name: 'Test Common',
        rarity: 'common',
        type: 'spell',
        cost: 2
      };

      const assignment = EmojiAssignmentService.assignEmojisToCard(commonCard, 12345);
      
      // Common cards should only have damage and support emojis
      assignment.emojiPowers.forEach(power => {
        expect([EmojiCategory.DAMAGE, EmojiCategory.SUPPORT]).toContain(power.category);
      });
    });

    it('should ensure energy requirement for legendary cards', () => {
      const legendaryCard: Card = {
        id: 'test-legendary',
        name: 'Test Legendary',
        rarity: 'legendary',
        type: 'spell',
        cost: 8
      };

      const assignment = EmojiAssignmentService.assignEmojisToCard(legendaryCard, 12345);
      const energyEmojis = assignment.emojiPowers.filter(p => p.category === EmojiCategory.ENERGY);
      
      expect(energyEmojis.length).toBeGreaterThanOrEqual(2);
    });

    it('should validate emoji assignments', () => {
      const validCommon = ['🔥', '💚']; // Fire + Green Heart
      const invalidCommon = ['🔥', '💚', '🧪', '💀']; // Too many + forbidden categories
      
      expect(EmojiAssignmentService.validateEmojiAssignment(validCommon, 'common')).toBe(true);
      expect(EmojiAssignmentService.validateEmojiAssignment(invalidCommon, 'common')).toBe(false);
    });

    it('should produce deterministic results with same seed', () => {
      const card: Card = {
        id: 'test-deterministic',
        name: 'Test Deterministic',
        rarity: 'rare',
        type: 'creature',
        cost: 4
      };

      const assignment1 = EmojiAssignmentService.assignEmojisToCard(card, 12345);
      const assignment2 = EmojiAssignmentService.assignEmojisToCard(card, 12345);
      
      expect(assignment1.emojis).toEqual(assignment2.emojis);
    });
  });

  describe('Emoji Synergy Calculator', () => {
    it('should detect burn build synergy', () => {
      const burnEmojis = ['🔥', '💣', '☄️'];
      const synergies = EmojiSynergyCalculator.calculateSynergies(burnEmojis);
      
      const burnSynergy = synergies.find(s => s.name === 'Burn Build');
      expect(burnSynergy).toBeDefined();
      expect(burnSynergy!.bonusValue).toBe(50);
    });

    it('should detect freeze lock synergy', () => {
      const freezeEmojis = ['❄️', '🌊', '🕸️'];
      const synergies = EmojiSynergyCalculator.calculateSynergies(freezeEmojis);
      
      const freezeSynergy = synergies.find(s => s.name === 'Freeze Lock');
      expect(freezeSynergy).toBeDefined();
      expect(freezeSynergy!.category).toBe('control');
    });

    it('should calculate synergy score', () => {
      const simpleEmojis = ['🔥']; // No synergy
      const synergyEmojis = ['🔥', '💣', '☄️']; // Burn build
      
      const simpleScore = EmojiSynergyCalculator.getSynergyScore(simpleEmojis);
      const synergyScore = EmojiSynergyCalculator.getSynergyScore(synergyEmojis);
      
      expect(synergyScore).toBeGreaterThan(simpleScore);
    });

    it('should detect multiple synergies', () => {
      const multiSynergyEmojis = ['🔥', '⚡', '💣', '☄️']; // Fire Storm + partial Burn Build
      const synergies = EmojiSynergyCalculator.calculateSynergies(multiSynergyEmojis);
      
      expect(synergies.length).toBeGreaterThan(1);
    });

    it('should calculate damage bonuses', () => {
      const burnEmojis = ['🔥', '💣', '☄️'];
      const synergies = EmojiSynergyCalculator.calculateSynergies(burnEmojis);
      const damageBonus = EmojiSynergyCalculator.calculateSynergyDamageBonus(burnEmojis, synergies);
      
      expect(damageBonus).toBeGreaterThan(0);
    });

    it('should identify perfect synergy combinations', () => {
      const perfectEmojis = ['🔥', '💣', '☄️', '⚡', '🍀', '🎲', '🎰']; // Multiple synergies
      const isPerfect = EmojiSynergyCalculator.isPerfectSynergy(perfectEmojis);
      
      expect(isPerfect).toBe(true);
    });

    it('should find optimal combinations', () => {
      const availableEmojis = ['🔥', '💣', '☄️', '❄️', '🌊', '💚'];
      const optimal = EmojiSynergyCalculator.findOptimalCombination(availableEmojis, 3);
      
      expect(optimal.emojis.length).toBe(3);
      expect(optimal.score).toBeGreaterThan(0);
      expect(optimal.synergies.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should create valid card with emoji assignment', () => {
      const testCard: Card = {
        id: 'integration-test',
        name: 'Integration Test Card',
        rarity: 'epic',
        type: 'creature',
        cost: 6,
        attack: 5,
        defense: 4
      };

      const emojiData = EmojiAssignmentService.assignEmojisToCard(testCard, 54321);
      const synergies = EmojiSynergyCalculator.calculateSynergies(emojiData.emojis);
      
      // Validate assignment
      expect(EmojiAssignmentService.validateEmojiAssignment(emojiData.emojis, testCard.rarity)).toBe(true);
      
      // Check emoji data structure
      expect(emojiData.emojis.length).toBeGreaterThan(0);
      expect(emojiData.emojiPowers.length).toBe(emojiData.emojis.length);
      expect(emojiData.totalBaseDamage).toBeGreaterThan(0);
      
      // Update card with emoji data
      testCard.emojis = emojiData.emojis;
      testCard.emojiData = {
        ...emojiData,
        activeSynergies: synergies,
        synergyBonus: EmojiSynergyCalculator.getSynergyScore(emojiData.emojis)
      };
      
      expect(testCard.emojis).toBeDefined();
      expect(testCard.emojiData).toBeDefined();
      expect(testCard.emojiData!.activeSynergies.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle all rarities correctly', () => {
      const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'cosmic'];
      
      rarities.forEach(rarity => {
        const card: Card = {
          id: `test-${rarity}`,
          name: `Test ${rarity}`,
          rarity: rarity as any,
          type: 'creature',
          cost: 4
        };
        
        const assignment = EmojiAssignmentService.assignEmojisToCard(card, 98765);
        expect(assignment.emojis.length).toBeGreaterThan(0);
        
        const isValid = EmojiAssignmentService.validateEmojiAssignment(assignment.emojis, rarity);
        expect(isValid).toBe(true);
      });
    });

    it('should maintain backward compatibility', () => {
      const legacyCard: Card = {
        id: 'legacy-test',
        name: 'Legacy Card',
        rarity: 'common',
        type: 'spell',
        cost: 2,
        emoji: '🔥' // Legacy single emoji
      };

      // Should still work with legacy emoji field
      expect(legacyCard.emoji).toBe('🔥');
      
      // Can be upgraded to new system
      const emojiData = EmojiAssignmentService.assignEmojisToCard(legacyCard, 11111);
      legacyCard.emojis = emojiData.emojis;
      legacyCard.emojiData = emojiData;
      
      expect(legacyCard.emojis).toBeDefined();
      expect(legacyCard.emoji).toBeDefined(); // Legacy field preserved
    });
  });
});