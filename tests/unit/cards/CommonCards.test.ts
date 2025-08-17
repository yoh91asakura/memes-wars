import { describe, it, expect } from 'vitest';
import { CommonCardService } from '../../src/services/CommonCardService';
import { commonCards } from '../../src/data/cards/common/common-cards';

describe('Common Cards', () => {
  const service = new CommonCardService();

  describe('Common Cards Data Structure', () => {
    it('should have exactly 10 common cards', () => {
      expect(commonCards).toHaveLength(10);
    });

    it('should have all required properties for each card', () => {
      commonCards.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('rarity', 'common');
        expect(card).toHaveProperty('emoji');
        expect(card).toHaveProperty('attack');
        expect(card).toHaveProperty('defense');
        expect(card).toHaveProperty('cost');
        expect(card).toHaveProperty('ability');
        expect(card).toHaveProperty('flavor');
        expect(card).toHaveProperty('type');
      });
    });

    it('should have unique IDs for all cards', () => {
      const ids = commonCards.map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid cost range (1-2) for common cards', () => {
      commonCards.forEach(card => {
        expect(card.cost).toBeGreaterThanOrEqual(1);
        expect(card.cost).toBeLessThanOrEqual(2);
      });
    });

    it('should have proper attack/defense stats', () => {
      commonCards.forEach(card => {
        expect(typeof card.attack).toBe('number');
        expect(typeof card.defense).toBe('number');
        expect(card.attack).toBeGreaterThanOrEqual(0);
        expect(card.defense).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('TypeScript Module', () => {
    it('should export exactly 10 common cards', () => {
      expect(commonCards).toHaveLength(10);
    });

    it('should have matching card IDs between JSON and TS', () => {
      const jsonIds = commonCardsData.map(c => c.id).sort();
      const tsIds = commonCards.map(c => c.id).sort();
      expect(jsonIds).toEqual(tsIds);
    });

    it('should provide utility functions', () => {
      expect(typeof service.getAllCommonCards).toBe('function');
      expect(typeof service.getCommonCardById).toBe('function');
      expect(typeof service.validateCommonCard).toBe('function');
    });
  });

  describe('CommonCardService', () => {
    it('should return all common cards', () => {
      const allCards = service.getAllCommonCards();
      expect(allCards).toHaveLength(10);
    });

    it('should find card by ID', () => {
      const card = service.getCommonCardById('common-001');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Fireball 🔥');
    });

    it('should return undefined for invalid ID', () => {
      const card = service.getCommonCardById('invalid-id');
      expect(card).toBeUndefined();
    });

    it('should get cards by cost', () => {
      const cost2Cards = service.getCommonCardsByCost(2);
      expect(cost2Cards.length).toBeGreaterThan(0);
      cost2Cards.forEach(card => {
        expect(card.cost).toBe(2);
      });
    });

    it('should get cards by type', () => {
      const spells = service.getCommonCardsByType('spell');
      expect(spells.length).toBeGreaterThan(0);
      spells.forEach(card => {
        expect(card.type).toBe('spell');
      });
    });

    it('should search cards by name', () => {
      const results = service.searchCommonCards('fire');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain('fire');
    });

    it('should validate card structure correctly', () => {
      const validCard = commonCards[0];
      expect(service.validateCommonCard(validCard)).toBe(true);

      const invalidCard = { name: 'Invalid' };
      expect(service.validateCommonCard(invalidCard)).toBe(false);
    });

    it('should return random cards', () => {
      const randomCard = service.getRandomCommonCard();
      expect(randomCard).toBeDefined();
      expect(commonCardsData).toContainEqual(randomCard);
    });

    it('should return specified number of random cards', () => {
      const randomCards = service.getRandomCommonCards(3);
      expect(randomCards).toHaveLength(3);
      randomCards.forEach(card => {
        expect(commonCardsData).toContainEqual(card);
      });
    });

    it('should not exceed available cards in random selection', () => {
      const randomCards = service.getRandomCommonCards(20);
      expect(randomCards).toHaveLength(10); // Max available
    });
  });
});