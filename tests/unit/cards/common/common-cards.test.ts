import { describe, it, expect, beforeEach } from 'vitest';
import { CommonCardService } from '../../../../src/services/CommonCardService';
import commonCardsData from '../../../../src/data/cards/common/common-cards-full.json';

describe('CommonCardService', () => {
  let service: CommonCardService;

  beforeEach(() => {
    service = CommonCardService.getInstance();
  });

  describe('Initialization', () => {
    it('should load all common cards on initialization', () => {
      const cards = service.getAllCommonCards();
      expect(cards).toHaveLength(10);
    });

    it('should be a singleton', () => {
      const instance1 = CommonCardService.getInstance();
      const instance2 = CommonCardService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Card Retrieval', () => {
    it('should retrieve card by ID', () => {
      const card = service.getCardById('COMMON_001');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Basic Smile');
      expect(card?.emoji).toBe('😊');
    });

    it('should return undefined for invalid ID', () => {
      const card = service.getCardById('INVALID_ID');
      expect(card).toBeUndefined();
    });

    it('should filter cards by tag', () => {
      const creatures = service.getCardsByTag('creature');
      expect(creatures).toHaveLength(7);
      
      const spells = service.getCardsByTag('spell');
      expect(spells).toHaveLength(3);
    });

    it('should filter cards by type', () => {
      const creatures = service.getCardsByType('creature');
      expect(creatures).toHaveLength(7);
      
      const spells = service.getCardsByType('spell');
      expect(spells).toHaveLength(3);
    });

    it('should filter cards by cost', () => {
      const cost1Cards = service.getCardsByCost(1);
      expect(cost1Cards).toHaveLength(7);
      
      const cost2Cards = service.getCardsByCost(2);
      expect(cost2Cards).toHaveLength(3);
    });
  });

  describe('Random Card Selection', () => {
    it('should return a random common card', () => {
      const card = service.getRandomCommonCard();
      expect(card).toBeDefined();
      expect(card.id).toMatch(/^COMMON_\d{3}$/);
    });

    it('should return specified number of random cards', () => {
      const cards = service.getRandomCommonCards(3);
      expect(cards).toHaveLength(3);
      
      // Ensure all cards are unique
      const uniqueIds = new Set(cards.map(c => c.id));
      expect(uniqueIds.size).toBe(3);
    });

    it('should not exceed available card count', () => {
      const cards = service.getRandomCommonCards(15);
      expect(cards).toHaveLength(10);
    });
  });

  describe('Card Validation', () => {
    it('should validate correct card structure', () => {
      const validCard = {
        id: 'COMMON_001',
        name: 'Test Card',
        emoji: '😊',
        rarity: 'common',
        type: 'creature',
        cost: 1,
        attack: 2,
        defense: 1,
        health: 2,
        description: 'Test description',
        ability: { name: 'Test', type: 'passive', description: 'Test ability' },
        flavorText: 'Test flavor',
        tags: ['test']
      };

      expect(service.validateCard(validCard)).toBe(true);
    });

    it('should reject invalid card structure', () => {
      const invalidCard = {
        id: 'INVALID_ID',
        name: 'Test',
        // Missing required fields
      };

      expect(service.validateCard(invalidCard)).toBe(false);
    });
  });

  describe('Card Statistics', () => {
    it('should calculate correct statistics', () => {
      const stats = service.getCardStats();
      
      expect(stats.total).toBe(10);
      expect(stats.creatures).toBe(7);
      expect(stats.spells).toBe(3);
      expect(stats.averageCost).toBe(1.3);
      expect(stats.averageAttack).toBeGreaterThan(0);
      expect(stats.averageDefense).toBeGreaterThan(0);
      expect(stats.averageHealth).toBeGreaterThan(0);
    });

    it('should have balanced cost distribution', () => {
      const stats = service.getCardStats();
      expect(stats.averageCost).toBeLessThanOrEqual(2);
      expect(stats.averageCost).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Card Balance', () => {
    it('should have no card with attack > 3 for commons', () => {
      const creatures = service.getCardsByType('creature');
      creatures.forEach(card => {
        expect(card.attack).toBeLessThanOrEqual(3);
      });
    });

    it('should have no card with cost > 2 for commons', () => {
      const cards = service.getAllCommonCards();
      cards.forEach(card => {
        expect(card.cost).toBeLessThanOrEqual(2);
      });
    });

    it('should have appropriate health values for cost', () => {
      const creatures = service.getCardsByType('creature');
      creatures.forEach(card => {
        expect(card.health).toBeLessThanOrEqual(4);
        expect(card.health).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should match JSON file data', () => {
      const serviceCards = service.getAllCommonCards();
      const jsonCards = commonCardsData;
      
      expect(serviceCards).toHaveLength(jsonCards.length);
      
      jsonCards.forEach(jsonCard => {
        const serviceCard = service.getCardById(jsonCard.id);
        expect(serviceCard).toEqual(jsonCard);
      });
    });

    it('should have unique IDs', () => {
      const cards = service.getAllCommonCards();
      const ids = cards.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid emoji characters', () => {
      const cards = service.getAllCommonCards();
      cards.forEach(card => {
        expect(card.emoji).toMatch(/\p{Emoji}/u);
      });
    });
  });
});