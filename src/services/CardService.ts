import { v4 as uuidv4 } from 'uuid';
import { commonCards } from '../data/cards/common';
import { rareCards } from '../data/cards/rare';
import { Card } from '../models/Card';
// Enhanced card service with full game specification support
export class CardService {
  private allCards: Card[];
  private cardsByRarity: Map<CardRarity, Card[]> = new Map();
  private cardsByFamily: Map<MemeFamily, Card[]> = new Map();
  private cardsByType: Map<CardType, Card[]> = new Map();
  
  constructor() {
    // Combine all card collections
    this.allCards = [
      ...commonCards,
      ...rareCards,
      // TODO: Add other rarities as they are migrated
      // ...uncommonCards,
      // ...epicCards,
      // ...legendaryCards,
      // ...mythicCards,
      // ...cosmicCards,
      // ...divineCards,
      // ...infinityCards,
    ];
    
    // Build lookup maps for performance
    this.buildLookupMaps();
  }
  
  // Build optimized lookup maps
  private buildLookupMaps(): void {
    this.cardsByRarity = new Map();
    this.cardsByFamily = new Map();
    this.cardsByType = new Map();
    
    this.allCards.forEach(card => {
      // Group by rarity
      if (!this.cardsByRarity.has(card.rarity)) {
        this.cardsByRarity.set(card.rarity, []);
      }
      this.cardsByRarity.get(card.rarity)!.push(card);
      
      // Group by family
      if (card.family) {
        if (!this.cardsByFamily.has(card.family)) {
          this.cardsByFamily.set(card.family, []);
        }
        this.cardsByFamily.get(card.family)!.push(card);
      }
      
      // Group by type
      if (!this.cardsByType.has(card.type)) {
        this.cardsByType.set(card.type, []);
      }
      this.cardsByType.get(card.type)!.push(card);
    });
  }
  
  // Get all cards
  getAllCards(): Card[] {
    return this.allCards;
  }

  // Get card by ID
  getCardById(id: string): Card | undefined {
    return this.allCards.find(card => card.id === id);
  }

  // Get cards by rarity (optimized with lookup map)
  getCardsByRarity(rarity: string): Card[] {
    return this.cardsByRarity.get(rarity) || [];
  }
  
  // Get cards by rarity (legacy string support)
  getCardsByRarityString(rarity: string): Card[] {
    const normalizedRarity = typeof rarity === 'string' ? rarity.toUpperCase() : CardUtils.getRarityName(rarity).toUpperCase() as keyof typeof CardRarity;
    const rarityEnum = CardRarity[normalizedRarity];
    return rarityEnum ? this.getCardsByRarity(rarityEnum) : [];
  }
  
  // Get cards by meme family
  getCardsByFamily(family: MemeFamily): Card[] {
    return this.cardsByFamily.get(family) || [];
  }
  
  // Get cards by type
  getCardsByType(type: CardType): Card[] {
    return this.cardsByType.get(type) || [];
  }
  
  // Get cards with specific effects
  getCardsByEffect(effect: EffectType): Card[] {
    return this.allCards.filter(card => 
      card.effects?.includes(effect) ||
      card.cardEffects?.some(cardEffect => cardEffect.effect === effect) ||
      card.emojis?.some(emoji => emoji.effects?.includes(effect))
    );
  }

  // Generate a random card based on rarity weights
  async generateCard(targetRarity?: string): Promise<Card> {
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
  
  // Generate card with game specification probabilities (1/X format)
  async generateCardWithProbabilities(): Promise<Card> {
    // Use actual game spec probabilities (1/X format)
    const rarityProbabilities = {
      [2]: 2,        // 1/2 = 50%
      [4]: 4,      // 1/4 = 25%
      [10]: 10,         // 1/10 = 10%
      [50]: 50,         // 1/50 = 2%
      [200]: 200,   // 1/200 = 0.5%
      [1000]: 1000,     // 1/1000 = 0.1%
      [10000]: 10000,    // 1/10000 = 0.01%
      [100000]: 100000,   // 1/100000 = 0.001%
      [1000000]: 1000000 // 1/1000000 = 0.0001%
    };
    
    // Roll for each rarity starting from highest
    const rarityOrder = [
      1000000,
      100000, 
      10000,
      1000,
      200,
      50,
      10,
      4,
      2
    ];
    
    for (const rarity of rarityOrder) {
      const probability = rarityProbabilities[rarity];
      const roll = Math.floor(Math.random() * probability) + 1;
      
      if (roll === 1) { // Hit the 1/X chance
        const cardsOfRarity = this.getCardsByRarity(rarity);
        if (cardsOfRarity.length > 0) {
          return this.generateCard(rarity);
        }
      }
    }
    
    // Fallback to common
    return this.generateCard(2);
  }
  
  // Roll with pity system (prevents long streaks of bad luck)
  async rollCardWithPity(pityCounter: number = 0): Promise<{ card: Card, newPityCounter: number, goldReward: number }> {
    let targetRarity = 2;
    let newPityCounter = pityCounter + 1;
    
    // Pity system - guaranteed higher rarity after bad streaks
    if (pityCounter >= 50) {
      targetRarity = 10;
      newPityCounter = 0;
    } else if (pityCounter >= 20) {
      targetRarity = 4;
    }
    
    const card = await (targetRarity === 2 ? 
      this.generateCardWithProbabilities() : 
      this.generateCard(targetRarity)
    );
    
    // Reset pity counter if we got something good
    if (card.rarity !== 2) {
      newPityCounter = 0;
    }
    
    // Calculate gold reward (cards generate gold when rolled)
    const goldReward = this.calculateRollGoldReward(card);
    
    return { card, newPityCounter, goldReward };
  }
  
  // Calculate gold reward from rolling a card
  private calculateRollGoldReward(card: Card): number {
    const baseReward = card.goldReward || 10;
    const luckBonus = Math.floor((card.luck || 0) * 0.1);
    const rarityBonus = this.getRarityBonus(card.rarity);
    
    return Math.floor(baseReward * rarityBonus) + luckBonus;
  }

  // Roll a card with unique instance
  async rollCard(): Promise<Card> {
    const card = await this.generateCardWithProbabilities();
    return {
      ...card,
      id: uuidv4(), // Generate unique ID for new instance
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Enhanced filtering with new game spec properties
  filterCards(criteria: CardFilter & {
    family?: MemeFamily;
    effect?: EffectType;
    minLuck?: number;
    maxLuck?: number;
    tradeable?: boolean;
    isLimited?: boolean;
    minGoldReward?: number;
    maxGoldReward?: number;
  }): Card[] {
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
      
      // New game spec filters
      if (criteria.family && card.family !== criteria.family) return false;
      if (criteria.effect && !this.cardHasEffect(card, criteria.effect)) return false;
      if (criteria.minLuck !== undefined && (card.luck || 0) < criteria.minLuck) return false;
      if (criteria.maxLuck !== undefined && (card.luck || 0) > criteria.maxLuck) return false;
      if (criteria.tradeable !== undefined && card.tradeable !== criteria.tradeable) return false;
      if (criteria.isLimited !== undefined && card.isLimited !== criteria.isLimited) return false;
      if (criteria.minGoldReward !== undefined && (card.goldReward || 0) < criteria.minGoldReward) return false;
      if (criteria.maxGoldReward !== undefined && (card.goldReward || 0) > criteria.maxGoldReward) return false;
      
      return true;
    });
  }
  
  // Check if card has specific effect
  private cardHasEffect(card: Card, effect: EffectType): boolean {
    return !!
      (card.effects?.includes(effect) ||
      card.cardEffects?.some(cardEffect => cardEffect.effect === effect) ||
      card.emojis?.some(emoji => emoji.effects?.includes(effect)));
  }

  // Get random cards
  getRandomCards(count: number): Card[] {
    const shuffled = [...this.allCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Enhanced search with new properties
  searchCards(query: string): Card[] {
    const lowercaseQuery = query.toLowerCase();
    return this.allCards.filter(card => 
      card.name.toLowerCase().includes(lowercaseQuery) ||
      card.description.toLowerCase().includes(lowercaseQuery) ||
      card.emoji.includes(query) ||
      card.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      card.effects?.some(effect => effect.toString().toLowerCase().includes(lowercaseQuery)) ||
      card.reference?.toLowerCase().includes(lowercaseQuery) ||
      card.lore?.toLowerCase().includes(lowercaseQuery) ||
      card.flavor?.toLowerCase().includes(lowercaseQuery) ||
      card.family?.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Enhanced card statistics with game spec properties
  getCardStats(card: Card): {
    totalPower: number;
    isValid: boolean;
    rarityBonus: number;
    effectCount: number;
    emojiCount: number;
    goldValue: number;
    dustValue: number;
    stackBonuses: {
      totalLuckBonus: number;
      totalGoldBonus: number;
      totalDamageBonus: number;
    };
  } {
    const stackLevel = card.stackCount - 1;
    
    return {
      totalPower: CardUtils.calculatePower(card),
      isValid: CardUtils.isValid(card),
      rarityBonus: this.getRarityBonus(card.rarity),
      effectCount: card.cardEffects?.length || 0,
      emojiCount: card.emojis?.length || 0,
      goldValue: card.goldReward || 0,
      dustValue: card.dustValue || 0,
      stackBonuses: {
        totalLuckBonus: stackLevel * (card.stackBonus?.luckMultiplier || 0) * 100,
        totalGoldBonus: stackLevel * (card.stackBonus?.goldMultiplier || 0) * 100,
        totalDamageBonus: stackLevel * (card.stackBonus?.damageBonus || 0) * 100
      }
    };
  }
  
  // Get rarity bonus multiplier
  private getRarityBonus(rarity: string): number {
    const bonusMap = {
      [2]: 1.0,
      [4]: 1.2,
      [10]: 1.5,
      [50]: 2.0,
      [200]: 3.0,
      [1000]: 4.0,
      [10000]: 5.0,
      [100000]: 10.0,
      [1000000]: 20.0
    };
    return bonusMap[rarity] || 1.0;
  }
  
  // Migrate legacy card to unified format
  migrateLegacyCard(legacyCard: any): Card {
    return CardUtils.migrateToUnified(legacyCard);
  }
  
  // Validate card data
  validateCard(card: Card): boolean {
    return CardUtils.isValid(card);
  }
  
  // Get family synergies for deck building
  getFamilySynergies(cards: Card[]): Map<MemeFamily, number> {
    const familyCounts = new Map<MemeFamily, number>();
    
    cards.forEach(card => {
      if (card.family) {
        familyCounts.set(card.family, (familyCounts.get(card.family) || 0) + 1);
      }
    });
    
    return familyCounts;
  }
  
  // Calculate deck power with synergies
  calculateDeckPower(cards: Card[]): {
    totalPower: number;
    familyBonuses: Map<MemeFamily, number>;
    recommendedSynergies: MemeFamily[];
  } {
    const familySynergies = this.getFamilySynergies(cards);
    const familyBonuses = new Map<MemeFamily, number>();
    let totalPower = 0;
    
    cards.forEach(card => {
      let cardPower = CardUtils.calculatePower(card);
      
      // Apply family synergy bonuses
      if (card.family) {
        const familyCount = familySynergies.get(card.family) || 0;
        if (familyCount >= 2) {
          const synergyBonus = Math.floor(cardPower * 0.1 * familyCount); // 10% per family card
          cardPower += synergyBonus;
          familyBonuses.set(card.family, (familyBonuses.get(card.family) || 0) + synergyBonus);
        }
      }
      
      totalPower += cardPower;
    });
    
    // Recommend families with potential for more synergy
    const recommendedSynergies = Array.from(familySynergies.entries())
      .filter(([_, count]) => count === 1)
      .map(([family, _]) => family);
    
    return { totalPower, familyBonuses, recommendedSynergies };
  }
  
  // Get cards that would synergize with current deck
  getRecommendedCards(currentDeck: Card[], limit: number = 10): Card[] {
    const deckFamilies = this.getFamilySynergies(currentDeck);
    const deckTypes = new Map<CardType, number>();
    
    // Count current types
    currentDeck.forEach(card => {
      deckTypes.set(card.type, (deckTypes.get(card.type) || 0) + 1);
    });
    
    // Find cards that would create or enhance synergies
    const recommendations = this.allCards
      .filter(card => !currentDeck.some(deckCard => deckCard.id === card.id))
      .map(card => {
        let synergyScore = 0;
        
        // Family synergy bonus
        if (card.family && deckFamilies.has(card.family)) {
          synergyScore += (deckFamilies.get(card.family) || 0) * 10;
        }
        
        // Type diversity bonus
        const typeCount = deckTypes.get(card.type) || 0;
        if (typeCount === 0) {
          synergyScore += 5; // New type bonus
        } else if (typeCount < 2) {
          synergyScore += 2; // Type balance bonus
        }
        
        // Power level consideration
        synergyScore += CardUtils.calculatePower(card) * 0.1;
        
        return { card, synergyScore };
      })
      .sort((a, b) => b.synergyScore - a.synergyScore)
      .slice(0, limit)
      .map(rec => rec.card);
    
    return recommendations;
  }
  
  // Get collection statistics
  getCollectionStats(): {
    totalCards: number;
    byRarity: Map<CardRarity, number>;
    byFamily: Map<MemeFamily, number>;
    byType: Map<CardType, number>;
    totalEffects: number;
    averageLuck: number;
    totalGoldValue: number;
    totalDustValue: number;
  } {
    const stats = {
      totalCards: this.allCards.length,
      byRarity: new Map<CardRarity, number>(),
      byFamily: new Map<MemeFamily, number>(),
      byType: new Map<CardType, number>(),
      totalEffects: 0,
      averageLuck: 0,
      totalGoldValue: 0,
      totalDustValue: 0
    };
    
    let totalLuck = 0;
    
    this.allCards.forEach(card => {
      // Count by rarity
      stats.byRarity.set(card.rarity, (stats.byRarity.get(card.rarity) || 0) + 1);
      
      // Count by family
      if (card.family) {
        stats.byFamily.set(card.family, (stats.byFamily.get(card.family) || 0) + 1);
      }
      
      // Count by type
      stats.byType.set(card.type, (stats.byType.get(card.type) || 0) + 1);
      
      // Aggregate other stats
      stats.totalEffects += card.cardEffects?.length || 0;
      totalLuck += card.luck || 0;
      stats.totalGoldValue += card.goldReward || 0;
      stats.totalDustValue += card.dustValue || 0;
    });
    
    stats.averageLuck = totalLuck / this.allCards.length;
    
    return stats;
  }
}
