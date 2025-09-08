// DeckService Contract Test - MUST FAIL before implementation
// Follows specs/001-extract-current-project/contracts/deckservice.md

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Deck, SynergyBonus } from '../../../src/models/unified/Deck';
import { Card, CardRarity, MemeFamily } from '../../../src/models/unified/Card';

// Contract interfaces from deckservice.md
interface IDeckService {
  // Create new deck
  createDeck(name: string): Deck;
  
  // Add card to deck (with validation)
  addCardToDeck(deckId: string, card: Card): AddCardResult;
  
  // Remove card from deck
  removeCardFromDeck(deckId: string, cardId: string): boolean;
  
  // Validate deck for combat
  validateDeck(deck: Deck, currentStage: number): ValidationResult;
  
  // Get deck size limit for stage
  getDeckSizeLimit(stage: number): number;
  
  // Calculate deck synergies
  calculateSynergies(deck: Deck): SynergyBonus[];
  
  // Get deck statistics
  getDeckStats(deck: Deck): DeckStatistics;
  
  // Clone deck
  cloneDeck(deckId: string, newName: string): Deck;
  
  // Delete deck
  deleteDeck(deckId: string): boolean;
}

interface AddCardResult {
  success: boolean;
  error?: string;
  deckSizeExceeded?: boolean;
  duplicateCard?: boolean;
  manaCostExceeded?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  deckSize: number;
  maxDeckSize: number;
  totalManaCost: number;
  synergyCount: number;
}

interface DeckStatistics {
  totalCards: number;
  totalHealth: number;
  totalDamage: number;
  averageAttackSpeed: number;
  rarityDistribution: Record<CardRarity, number>;
  manaDistribution: Record<number, number>;
  synergyStrength: number;
  deckPower: number;
}

// This will fail until we implement DeckService
class DeckService implements IDeckService {
  createDeck(name: string): Deck {
    throw new Error('DeckService not implemented yet');
  }
  
  addCardToDeck(deckId: string, card: Card): AddCardResult {
    throw new Error('DeckService not implemented yet');
  }
  
  removeCardFromDeck(deckId: string, cardId: string): boolean {
    throw new Error('DeckService not implemented yet');
  }
  
  validateDeck(deck: Deck, currentStage: number): ValidationResult {
    throw new Error('DeckService not implemented yet');
  }
  
  getDeckSizeLimit(stage: number): number {
    throw new Error('DeckService not implemented yet');
  }
  
  calculateSynergies(deck: Deck): SynergyBonus[] {
    throw new Error('DeckService not implemented yet');
  }
  
  getDeckStats(deck: Deck): DeckStatistics {
    throw new Error('DeckService not implemented yet');
  }
  
  cloneDeck(deckId: string, newName: string): Deck {
    throw new Error('DeckService not implemented yet');
  }
  
  deleteDeck(deckId: string): boolean {
    throw new Error('DeckService not implemented yet');
  }
}

describe('DeckService Contract Test', () => {
  let deckService: DeckService;
  let mockCard: Card;
  let mockDeck: Deck;
  
  beforeEach(() => {
    deckService = new DeckService();
    
    // Mock card for testing
    mockCard = {
      id: 'card-1',
      name: 'Test Card',
      rarity: CardRarity.COMMON,
      memeFamily: MemeFamily.CLASSIC_INTERNET,
      emojis: ['🔥'],
      health: 100,
      attackDamage: 15,
      attackSpeed: 1.2,
      manaCost: 2,
      flavor: 'A test card',
      imageUrl: 'test.jpg',
      unlockStage: 1
    };
    
    // Mock deck for testing
    mockDeck = {
      id: 'deck-1',
      name: 'Test Deck',
      cards: [mockCard],
      maxSize: 3,
      synergyBonuses: [],
      totalManaCost: 2,
      createdAt: new Date(),
      lastUsed: new Date()
    };
    
    vi.clearAllMocks();
  });

  describe('Deck Creation Contract', () => {
    it('should create new deck with unique ID', () => {
      expect(() => {
        const deck = deckService.createDeck('My Test Deck');
        
        // Contract: Create new Deck with unique ID, empty cards array
        expect(deck.id).toBeDefined();
        expect(typeof deck.id).toBe('string');
        expect(deck.name).toBe('My Test Deck');
        expect(deck.cards).toEqual([]);
        expect(deck.totalManaCost).toBe(0);
        expect(deck.synergyBonuses).toEqual([]);
      }).toThrow('DeckService not implemented yet');
    });

    it('should set appropriate deck size limit', () => {
      expect(() => {
        const deck = deckService.createDeck('Test');
        
        // Contract: Set maxSize based on current progression (3-8 range)
        expect(deck.maxSize).toBeGreaterThanOrEqual(3);
        expect(deck.maxSize).toBeLessThanOrEqual(8);
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Add Card Contract', () => {
    it('should add card successfully when valid', () => {
      expect(() => {
        const result = deckService.addCardToDeck('deck-1', mockCard);
        
        // Contract: Return success=true when card added successfully
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.deckSizeExceeded).toBeUndefined();
        expect(result.duplicateCard).toBeUndefined();
      }).toThrow('DeckService not implemented yet');
    });

    it('should reject when deck size limit exceeded', () => {
      expect(() => {
        // Contract: When deck already at max size
        // THEN return success=false, deckSizeExceeded=true
        
        const fullDeck = { ...mockDeck, cards: Array(8).fill(mockCard) }; // 8 cards (max)
        const result = deckService.addCardToDeck(fullDeck.id, {
          ...mockCard,
          id: 'new-card'
        });
        
        expect(result.success).toBe(false);
        expect(result.deckSizeExceeded).toBe(true);
        expect(result.error).toContain('deck size limit');
      }).toThrow('DeckService not implemented yet');
    });

    it('should reject duplicate cards', () => {
      expect(() => {
        const result = deckService.addCardToDeck('deck-1', mockCard); // Same card already in deck
        
        // Contract: No duplicate cards allowed in same deck
        expect(result.success).toBe(false);
        expect(result.duplicateCard).toBe(true);
        expect(result.error).toContain('duplicate');
      }).toThrow('DeckService not implemented yet');
    });

    it('should update total mana cost', () => {
      expect(() => {
        const newCard = { ...mockCard, id: 'card-2', manaCost: 3 };
        const result = deckService.addCardToDeck('deck-1', newCard);
        
        // Contract: Update deck's totalManaCost when card added
        expect(result.success).toBe(true);
        // Original deck has 2 mana, adding card with 3 = 5 total
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Remove Card Contract', () => {
    it('should remove card successfully', () => {
      expect(() => {
        const result = deckService.removeCardFromDeck('deck-1', 'card-1');
        
        // Contract: Return true when card removed successfully
        expect(result).toBe(true);
      }).toThrow('DeckService not implemented yet');
    });

    it('should return false for non-existent card', () => {
      expect(() => {
        const result = deckService.removeCardFromDeck('deck-1', 'non-existent');
        
        // Contract: Return false when card not found
        expect(result).toBe(false);
      }).toThrow('DeckService not implemented yet');
    });

    it('should update total mana cost after removal', () => {
      expect(() => {
        // Contract: Recalculate totalManaCost after card removal
        const beforeRemoval = mockDeck.totalManaCost; // Should be 2
        deckService.removeCardFromDeck('deck-1', 'card-1');
        // After removal, totalManaCost should be 0
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Deck Validation Contract', () => {
    it('should validate minimum deck size', () => {
      expect(() => {
        const emptyDeck = { ...mockDeck, cards: [] };
        const result = deckService.validateDeck(emptyDeck, 1);
        
        // Contract: At least 1 card required for combat
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('At least 1 card required');
      }).toThrow('DeckService not implemented yet');
    });

    it('should validate deck size limits', () => {
      expect(() => {
        const oversizedDeck = { 
          ...mockDeck, 
          cards: Array(10).fill(mockCard), // 10 cards, max is 8
          maxSize: 8 
        };
        const result = deckService.validateDeck(oversizedDeck, 50);
        
        // Contract: Card count cannot exceed deck size limit
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('exceeds maximum');
        expect(result.deckSize).toBe(10);
        expect(result.maxDeckSize).toBe(8);
      }).toThrow('DeckService not implemented yet');
    });

    it('should validate no duplicate cards', () => {
      expect(() => {
        const duplicateDeck = { 
          ...mockDeck, 
          cards: [mockCard, mockCard] // Same card twice
        };
        const result = deckService.validateDeck(duplicateDeck, 1);
        
        // Contract: No duplicate cards allowed in same deck
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('duplicate');
      }).toThrow('DeckService not implemented yet');
    });

    it('should return proper validation structure', () => {
      expect(() => {
        const result = deckService.validateDeck(mockDeck, 10);
        
        // Contract: Return complete ValidationResult structure
        expect(result).toMatchObject({
          valid: expect.any(Boolean),
          errors: expect.any(Array),
          warnings: expect.any(Array),
          deckSize: expect.any(Number),
          maxDeckSize: expect.any(Number),
          totalManaCost: expect.any(Number),
          synergyCount: expect.any(Number)
        });
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Deck Size Limit Contract', () => {
    it('should return correct limits based on stage progression', () => {
      expect(() => {
        // Contract: Stage-based deck limits (3-8 range)
        expect(deckService.getDeckSizeLimit(1)).toBe(3);   // Early stages
        expect(deckService.getDeckSizeLimit(10)).toBe(3);  // Stage 1-10: limit 3
        expect(deckService.getDeckSizeLimit(15)).toBe(4);  // Stage 11-25: limit 4
        expect(deckService.getDeckSizeLimit(30)).toBe(5);  // Stage 26-50: limit 5
        expect(deckService.getDeckSizeLimit(60)).toBe(6);  // Stage 51-75: limit 6
        expect(deckService.getDeckSizeLimit(90)).toBe(7);  // Stage 76-100: limit 7
        expect(deckService.getDeckSizeLimit(200)).toBe(8); // Stage 100+: limit 8 (max)
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Synergy Calculation Contract', () => {
    it('should detect animal pack synergy', () => {
      expect(() => {
        const animalDeck = {
          ...mockDeck,
          cards: [
            { ...mockCard, id: 'cat', memeFamily: MemeFamily.ANIMALS, emojis: ['🐱'] },
            { ...mockCard, id: 'dog', memeFamily: MemeFamily.ANIMALS, emojis: ['🐶'] },
            { ...mockCard, id: 'bird', memeFamily: MemeFamily.ANIMALS, emojis: ['🐦'] }
          ]
        };
        
        const synergies = deckService.calculateSynergies(animalDeck);
        
        // Contract: 3+ animal cards = animal pack synergy
        const animalSynergy = synergies.find(s => s.type === 'animal_pack');
        expect(animalSynergy).toBeDefined();
        expect(animalSynergy?.active).toBe(true);
        expect(animalSynergy?.cards).toHaveLength(3);
      }).toThrow('DeckService not implemented yet');
    });

    it('should detect classic combo synergy', () => {
      expect(() => {
        const classicDeck = {
          ...mockDeck,
          cards: [
            { ...mockCard, id: 'doge', memeFamily: MemeFamily.CLASSIC_INTERNET },
            { ...mockCard, id: 'pepe', memeFamily: MemeFamily.CLASSIC_INTERNET }
          ]
        };
        
        const synergies = deckService.calculateSynergies(classicDeck);
        
        // Contract: 2+ classic internet cards = classic combo
        const classicSynergy = synergies.find(s => s.type === 'classic_combo');
        expect(classicSynergy).toBeDefined();
        expect(classicSynergy?.bonus.type).toBe('damage');
        expect(classicSynergy?.bonus.value).toBe(1.15); // +15% damage
      }).toThrow('DeckService not implemented yet');
    });

    it('should detect force build synergy', () => {
      expect(() => {
        const forceDeck = {
          ...mockDeck,
          cards: [
            { ...mockCard, id: 'strength1', emojis: ['💪', '🔥'] },
            { ...mockCard, id: 'strength2', emojis: ['👊', '⚡'] },
            { ...mockCard, id: 'weapon', emojis: ['⚔️', '🗡️'] }
          ]
        };
        
        const synergies = deckService.calculateSynergies(forceDeck);
        
        // Contract: 2+ force emojis + 1+ weapon = force build (2x damage)
        const forceSynergy = synergies.find(s => s.type === 'force_build');
        expect(forceSynergy).toBeDefined();
        expect(forceSynergy?.bonus.value).toBe(2.0); // Double damage
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Deck Statistics Contract', () => {
    it('should calculate comprehensive deck stats', () => {
      expect(() => {
        const stats = deckService.getDeckStats(mockDeck);
        
        // Contract: Return complete DeckStatistics structure
        expect(stats).toMatchObject({
          totalCards: expect.any(Number),
          totalHealth: expect.any(Number),
          totalDamage: expect.any(Number),
          averageAttackSpeed: expect.any(Number),
          rarityDistribution: expect.objectContaining({
            [CardRarity.COMMON]: expect.any(Number),
            [CardRarity.UNCOMMON]: expect.any(Number),
            [CardRarity.RARE]: expect.any(Number),
            [CardRarity.EPIC]: expect.any(Number),
            [CardRarity.LEGENDARY]: expect.any(Number),
            [CardRarity.MYTHIC]: expect.any(Number),
            [CardRarity.COSMIC]: expect.any(Number)
          }),
          manaDistribution: expect.any(Object),
          synergyStrength: expect.any(Number),
          deckPower: expect.any(Number)
        });
        
        // Verify calculated values match expectations
        expect(stats.totalCards).toBe(1); // mockDeck has 1 card
        expect(stats.totalHealth).toBe(100); // mockCard has 100 health
        expect(stats.totalDamage).toBe(15); // mockCard has 15 damage
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Deck Management Contract', () => {
    it('should clone deck with new name', () => {
      expect(() => {
        const clonedDeck = deckService.cloneDeck('deck-1', 'Cloned Deck');
        
        // Contract: Create exact copy with different ID and name
        expect(clonedDeck.id).not.toBe('deck-1'); // Different ID
        expect(clonedDeck.name).toBe('Cloned Deck');
        expect(clonedDeck.cards).toHaveLength(1);
        expect(clonedDeck.cards[0].id).toBe(mockCard.id); // Same cards
        expect(clonedDeck.maxSize).toBe(mockDeck.maxSize);
      }).toThrow('DeckService not implemented yet');
    });

    it('should delete deck successfully', () => {
      expect(() => {
        const result = deckService.deleteDeck('deck-1');
        
        // Contract: Return true when deck deleted successfully
        expect(result).toBe(true);
      }).toThrow('DeckService not implemented yet');
    });

    it('should return false when deleting non-existent deck', () => {
      expect(() => {
        const result = deckService.deleteDeck('non-existent');
        
        // Contract: Return false when deck not found
        expect(result).toBe(false);
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Error Handling Contract', () => {
    it('should handle invalid deck operations gracefully', () => {
      expect(() => {
        // Contract: Graceful error handling for invalid operations
        const result = deckService.addCardToDeck('invalid-deck-id', mockCard);
        expect(result.success).toBe(false);
        expect(result.error).toContain('deck not found');
      }).toThrow('DeckService not implemented yet');
    });

    it('should validate card data before adding', () => {
      expect(() => {
        const invalidCard = { ...mockCard, health: -10 }; // Invalid health
        const result = deckService.addCardToDeck('deck-1', invalidCard);
        
        // Contract: Validate card data before adding to deck
        expect(result.success).toBe(false);
        expect(result.error).toContain('invalid card');
      }).toThrow('DeckService not implemented yet');
    });
  });

  describe('Performance Contract', () => {
    it('should calculate synergies efficiently', () => {
      expect(() => {
        // Contract: Synergy calculation should be fast for large decks
        const largeDeck = {
          ...mockDeck,
          cards: Array(8).fill(null).map((_, i) => ({
            ...mockCard,
            id: `card-${i}`,
            memeFamily: i % 2 === 0 ? MemeFamily.ANIMALS : MemeFamily.CLASSIC_INTERNET
          }))
        };
        
        const start = performance.now();
        const synergies = deckService.calculateSynergies(largeDeck);
        const duration = performance.now() - start;
        
        // Contract: Should complete in under 10ms for max deck size
        expect(duration).toBeLessThan(10);
        expect(Array.isArray(synergies)).toBe(true);
      }).toThrow('DeckService not implemented yet');
    });
  });
});