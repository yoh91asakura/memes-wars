import { v4 as uuidv4 } from 'uuid';
import { commonCards } from '../data/cards/common';
import { rareCards } from '../data/cards/rare';
import { UnifiedCard, CardRarity, CardFilter, CardUtils } from '../models/unified/Card';

// Unified card service that works with the unified card model
export class CardService {
  private allCards: UnifiedCard[];
  
  constructor() {
    // Combine all card collections
    this.allCards = [
      ...commonCards,
      ...rareCards,
      // TODO: Add other rarities as they are migrated
    ];
  }
  
  // Get all cards
  getAllCards(): UnifiedCard[] {
    return this.allCards;
  }

  // Get card by ID
  getCardById(id: string): UnifiedCard | undefined {
    return this.allCards.find(card => card.id === id);
  }

  // Get cards by rarity (updated to use enum)
  getCardsByRarity(rarity: CardRarity): UnifiedCard[] {
    return this.allCards.filter(card => card.rarity === rarity);
  }
  
  // Get cards by rarity (legacy string support)
  getCardsByRarityString(rarity: string): UnifiedCard[] {
    const normalizedRarity = rarity.toUpperCase() as keyof typeof CardRarity;
    const rarityEnum = CardRarity[normalizedRarity];
    return rarityEnum ? this.getCardsByRarity(rarityEnum) : [];
  }

  // Generate a random card based on rarity weights
  async generateCard(targetRarity?: CardRarity): Promise<UnifiedCard> {
    let cardPool = this.allCards;
    
    if (targetRarity) {
      cardPool = this.getCardsByRarity(targetRarity);
    }
    
    if (cardPool.length === 0) {
      cardPool = commonCards; // Fallback to common cards
    }
    
    const randomIndex = Math.floor(Math.random() * cardPool.length);
    return { ...cardPool[randomIndex] }; // Return a copy
  }
  
  // Generate card with rarity probabilities
  async generateCardWithProbabilities(): Promise<UnifiedCard> {
    const rarityWeights = {
      [CardRarity.COMMON]: 60,
      [CardRarity.UNCOMMON]: 25,
      [CardRarity.RARE]: 10,
      [CardRarity.EPIC]: 3,
      [CardRarity.LEGENDARY]: 1.5,
      [CardRarity.MYTHIC]: 0.4,
      [CardRarity.COSMIC]: 0.1
    };
    
    const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      currentWeight += weight;
      if (random <= currentWeight) {
        const targetRarity = CardRarity[rarity as keyof typeof CardRarity];
        return this.generateCard(targetRarity);
      }
    }
    
    return this.generateCard(CardRarity.COMMON);
  }

  // Roll a card with unique instance
  async rollCard(): Promise<UnifiedCard> {
    const card = await this.generateCardWithProbabilities();
    return {
      ...card,
      id: uuidv4(), // Generate unique ID for new instance
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Filter cards by comprehensive criteria
  filterCards(criteria: CardFilter): UnifiedCard[] {
    return this.allCards.filter(card => {
      if (criteria.rarity && card.rarity !== criteria.rarity) return false;
      if (criteria.type && card.type !== criteria.type) return false;
      if (criteria.cost !== undefined && card.cost !== criteria.cost) return false;
      if (criteria.minAttack !== undefined && card.attack < criteria.minAttack) return false;
      if (criteria.maxAttack !== undefined && card.attack > criteria.maxAttack) return false;
      if (criteria.minDefense !== undefined && card.defense < criteria.minDefense) return false;
      if (criteria.maxDefense !== undefined && card.defense > criteria.maxDefense) return false;
      if (criteria.minHealth !== undefined && card.health < criteria.minHealth) return false;
      if (criteria.maxHealth !== undefined && card.health > criteria.maxHealth) return false;
      if (criteria.craftable !== undefined && card.craftable !== criteria.craftable) return false;
      if (criteria.isActive !== undefined && card.isActive !== criteria.isActive) return false;
      if (criteria.tags && !criteria.tags.some(tag => card.tags?.includes(tag))) return false;
      
      return true;
    });
  }

  // Get random cards
  getRandomCards(count: number): UnifiedCard[] {
    const shuffled = [...this.allCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Search cards by name, description, or tags
  searchCards(query: string): UnifiedCard[] {
    const lowercaseQuery = query.toLowerCase();
    return this.allCards.filter(card => 
      card.name.toLowerCase().includes(lowercaseQuery) ||
      card.description.toLowerCase().includes(lowercaseQuery) ||
      card.emoji.includes(query) ||
      card.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      card.effects?.some(effect => effect.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  // Get card statistics
  getCardStats(card: UnifiedCard): {
    totalPower: number;
    isValid: boolean;
    rarityBonus: number;
  } {
    return {
      totalPower: CardUtils.calculatePower(card),
      isValid: CardUtils.isValid(card),
      rarityBonus: this.getRarityBonus(card.rarity)
    };
  }
  
  // Get rarity bonus multiplier
  private getRarityBonus(rarity: CardRarity): number {
    const bonusMap = {
      [CardRarity.COMMON]: 1.0,
      [CardRarity.UNCOMMON]: 1.2,
      [CardRarity.RARE]: 1.5,
      [CardRarity.EPIC]: 2.0,
      [CardRarity.LEGENDARY]: 3.0,
      [CardRarity.MYTHIC]: 4.0,
      [CardRarity.COSMIC]: 5.0,
    };
    return bonusMap[rarity] || 1.0;
  }
  
  // Migrate legacy card to unified format
  migrateLegacyCard(legacyCard: any): UnifiedCard {
    return CardUtils.migrateToUnified(legacyCard);
  }
  
  // Validate card data
  validateCard(card: UnifiedCard): boolean {
    return CardUtils.isValid(card);
  }
}
