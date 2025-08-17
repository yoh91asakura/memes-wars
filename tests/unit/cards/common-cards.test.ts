import { describe, test, expect } from 'vitest';
import { commonCards, getCommonCards, getCommonCardById, getCommonCardsByCost, getRandomCommonCard } from '@/data/cards/common';

describe('Common Cards', () => {
  test('should have exactly 10 common cards', () => {
    expect(commonCards).toHaveLength(10);
  });

  test('should have unique IDs for all cards', () => {
    const ids = commonCards.map(card => card.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('should have valid rarity for all cards', () => {
    commonCards.forEach(card => {
      expect(card.rarity).toBe('common');
    });
  });

  test('should have balanced stats for common rarity', () => {
    commonCards.forEach(card => {
      expect(card.attack).toBeGreaterThanOrEqual(0);
      expect(card.attack).toBeLessThanOrEqual(3);
      expect(card.defense).toBeGreaterThanOrEqual(0);
      expect(card.defense).toBeLessThanOrEqual(3);
      expect(card.cost).toBeGreaterThanOrEqual(1);
      expect(card.cost).toBeLessThanOrEqual(2);
    });
  });

  test('should have valid emoji for all cards', () => {
    commonCards.forEach(card => {
      expect(card.emoji).toMatch(/[\u{1F300}-\u{1F9FF}]/u);
      expect(card.emoji.length).toBeGreaterThanOrEqual(2); // Emojis can be 2-4 chars
    });
  });

  test('should have positive total stats for creatures', () => {
    commonCards.forEach(card => {
      expect(card.attack + card.defense).toBeGreaterThan(0);
    });
  });

  test('getCommonCards should return all common cards', () => {
    const cards = getCommonCards();
    expect(cards).toHaveLength(10);
    expect(cards[0].rarity).toBe('common');
  });

  test('getCommonCardById should return correct card', () => {
    const card = getCommonCardById('common-001');
    expect(card?.name).toBe('Smiling Face');
    expect(card?.emoji).toBe('😊');
  });

  test('getCommonCardById should return undefined for invalid ID', () => {
    const card = getCommonCardById('invalid-id');
    expect(card).toBeUndefined();
  });

  test('getCommonCardsByCost should filter by cost', () => {
    const cost1Cards = getCommonCardsByCost(1);
    expect(cost1Cards).toHaveLength(8);
    cost1Cards.forEach(card => {
      expect(card.cost).toBe(1);
    });

    const cost2Cards = getCommonCardsByCost(2);
    expect(cost2Cards).toHaveLength(2);
    cost2Cards.forEach(card => {
      expect(card.cost).toBe(2);
    });
  });

  test('getRandomCommonCard should return a valid card', () => {
    const card = getRandomCommonCard();
    expect(card).toBeDefined();
    expect(commonCards).toContain(card);
  });

  test('all cards should have required properties', () => {
    commonCards.forEach(card => {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('rarity');
      expect(card).toHaveProperty('emoji');
      expect(card).toHaveProperty('attack');
      expect(card).toHaveProperty('defense');
      expect(card).toHaveProperty('cost');
      expect(card).toHaveProperty('ability');
      expect(card).toHaveProperty('flavor');
      expect(card).toHaveProperty('type');
      
      expect(typeof card.id).toBe('string');
      expect(typeof card.name).toBe('string');
      expect(typeof card.rarity).toBe('string');
      expect(typeof card.emoji).toBe('string');
      expect(typeof card.attack).toBe('number');
      expect(typeof card.defense).toBe('number');
      expect(typeof card.cost).toBe('number');
      expect(typeof card.ability).toBe('string');
      expect(typeof card.flavor).toBe('string');
      expect(typeof card.type).toBe('string');
    });
  });

  test('should have reasonable flavor text', () => {
    commonCards.forEach(card => {
      expect(card.flavor).toBeTruthy();
      expect(card.flavor.length).toBeGreaterThan(10);
      expect(card.flavor.length).toBeLessThan(100);
    });
  });
});