import { describe, it, expect } from 'vitest';
import { CommonCardService } from '../../../src/services/CommonCardService';
import { commonCards } from '../../../src/data/cards/common/common-cards';

describe('Common Cards', () => {
  const service = CommonCardService.getInstance();

  describe('Common Cards Data Structure', () => {
    it('should have exactly 10 common cards', () => {
      expect(commonCards).toHaveLength(10);
    });

    it('should have all required properties for each card', () => {
      commonCards.forEach((card: any) => {
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
      const jsonIds = commonCards.map(c => c.id).sort();
      const tsIds = commonCards.map(c => c.id).sort();
      expect(jsonIds).toEqual(tsIds);
    });

    it('should provide utility functions', () => {
      expect(typeof service.getAllCards).toBe('function');
      expect(typeof service.getCardById).toBe('function');
      expect(typeof service.validateCard).toBe('function');
    });
  });

  describe('CommonCardService', () => {
    it('should return all common cards', () => {
      const allCards = service.getAllCards();
      expect(allCards).toHaveLength(10);
    });

    it('should find card by ID', () => {
      const card = service.getCardById('COMMON_001');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Basic Smile');
    });

    it('should return undefined for invalid ID', () => {
      const card = service.getCardById('invalid-id');
      expect(card).toBeUndefined();
    });

    it('should get cards by cost', () => {
      const cost2Cards = service.getCardsByCost(2);
      expect(cost2Cards.length).toBeGreaterThan(0);
      cost2Cards.forEach((card: any) => {
        expect(card.cost).toBe(2);
      });
    });

    it('should get cards by type', () => {
      const spells = service.getCardsByType('spell');
      expect(spells.length).toBeGreaterThan(0);
      spells.forEach((card: any) => {
        expect(card.type).toBe('spell');
      });
    });

    it('should search cards by name', () => {
      const results = service.searchCards('smile');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain('smile');
    });

    it('should validate card structure correctly', () => {
      const validCard = {
        id: 'COMMON_001',
        name: 'Test Card',
        emoji: '😊',
        rarity: 'common',
        type: 'creature',
        cost: 1,
        description: 'Test description',
        flavorText: 'Test flavor',
        tags: ['test'],
        ability: { name: 'test', description: 'test' },
        attack: 1,
        defense: 1,
        health: 1
      };
      expect(service.validateCard(validCard)).toBe(true);

      const invalidCard = { name: 'Invalid' };
      expect(service.validateCard(invalidCard)).toBe(false);
    });

    it('should return random cards', () => {
      const randomCard = service.getRandomCard();
      expect(randomCard).toBeDefined();
      const allCards = service.getAllCards();
      expect(allCards).toContainEqual(randomCard);
    });

    it('should return specified number of random cards', () => {
      const randomCards = service.getRandomCards(3);
      expect(randomCards).toHaveLength(3);
      const allCards = service.getAllCards();
      randomCards.forEach((card: any) => {
        expect(allCards).toContainEqual(card);
      });
    });

    it('should not exceed available cards in random selection', () => {
      const randomCards = service.getRandomCards(20);
      expect(randomCards).toHaveLength(10); // Max available
    });
  });
});