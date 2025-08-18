import type { Card } from '../components/types';
import { UnifiedCard, CardRarity } from '../models/unified/Card';
import { commonCards } from '../data/cards/common';
import { uncommonCards } from '../data/cards/uncommon';
import { rareCards } from '../data/cards/rare';
import { epicCards } from '../data/cards/epic';
import { legendaryCards } from '../data/cards/legendary';
import { mythicCards } from '../data/cards/mythic';
import { cosmicCards } from '../data/cards/cosmic';
// Create a proper config object
const rollConfig = {
  dropRates: {
    common: 0.65,
    uncommon: 0.25,
    rare: 0.07,
    epic: 0.025,
    legendary: 0.004,
    mythic: 0.0009,
    cosmic: 0.0001
  },
  pitySystem: {
    guaranteedRareAt: 10,
    guaranteedEpicAt: 30,
    guaranteedLegendaryAt: 90,
    guaranteedMythicAt: 200,
    guaranteedCosmicAt: 500
  }
};
import { v4 as uuidv4 } from 'uuid';

export interface RollResult {
  card: Card;
  isGuaranteed: boolean;
  pityTriggered: boolean;
  rollNumber: number;
}

export interface RollStats {
  totalRolls: number;
  rollsSinceRare: number;
  rollsSinceEpic: number;
  rollsSinceLegendary: number;
  rollsSinceMythic: number;
  rollsSinceCosmic: number;
  collectedByRarity: Record<string, number>;
}

export interface MultiRollResult {
  cards: RollResult[];
  guaranteedTriggered: boolean;
  bonusCards: Card[];
  totalValue: number;
  rarityBreakdown?: Record<string, number>;
  highlights?: Card[];
}

export class RollService {
  private static instance: RollService;
  private allCards: Map<string, Card[]> = new Map();
  
  private constructor() {
    this.initializeCardDatabase();
  }

  public static getInstance(): RollService {
    if (!RollService.instance) {
      RollService.instance = new RollService();
    }
    return RollService.instance;
  }

  private initializeCardDatabase(): void {
    // Initialize with all available cards
    // Convert UnifiedCard to legacy Card format for compatibility
    this.allCards.set('common', this.convertUnifiedCardsToLegacy(commonCards));
    this.allCards.set('uncommon', this.convertLegacyCards(uncommonCards));
    this.allCards.set('rare', this.convertUnifiedCardsToLegacy(rareCards));
    this.allCards.set('epic', this.convertLegacyCards(epicCards));
    this.allCards.set('legendary', this.convertLegacyCards(legendaryCards));
    this.allCards.set('mythic', this.convertLegacyCards(mythicCards));
    this.allCards.set('cosmic', this.convertLegacyCards(cosmicCards));
  }

  /**
   * Convert UnifiedCard to legacy Card format for compatibility
   */
  private convertUnifiedCardsToLegacy(cards: UnifiedCard[]): Card[] {
    return cards.map(card => ({
      id: card.id,
      name: card.name,
      description: card.description,
      emoji: card.emoji,
      rarity: this.convertRarityToLegacy(card.rarity),
      type: card.type?.toLowerCase(),
      cost: card.cost,
      damage: card.damage || card.attack,
      attack: card.attack,
      defense: card.defense,
      stats: {
        attack: card.attack || 0,
        defense: card.defense || 0,
        health: card.health || 0,
        speed: card.attackSpeed
      },
      effects: card.effects?.map(e => e.toString()) || [],
      tags: card.tags || [],
      ability: card.ability || card.passiveAbility?.name,
      flavor: card.flavor,
      createdAt: card.createdAt ? new Date(card.createdAt) : undefined
    }));
  }

  /**
   * Convert CardRarity enum to legacy lowercase string
   */
  private convertRarityToLegacy(rarity: CardRarity): Card['rarity'] {
    const rarityMap: Record<CardRarity, Card['rarity']> = {
      [CardRarity.COMMON]: 'common',
      [CardRarity.UNCOMMON]: 'uncommon',
      [CardRarity.RARE]: 'rare',
      [CardRarity.EPIC]: 'epic',
      [CardRarity.LEGENDARY]: 'legendary',
      [CardRarity.MYTHIC]: 'mythic',
      [CardRarity.COSMIC]: 'cosmic',
      [CardRarity.DIVINE]: 'mythic', // Map divine to mythic for now
      [CardRarity.INFINITY]: 'cosmic' // Map infinity to cosmic for now
    };
    return rarityMap[rarity] || 'common';
  }
  
  /**
   * Convert legacy Card[] to Card[] (identity function for now)
   */
  private convertLegacyCards(cards: Card[]): Card[] {
    // Legacy cards are already in the correct format
    return cards.map(card => ({
      ...card,
      // Ensure consistency
      rarity: card.rarity.toLowerCase() as Card['rarity']
    }));
  }

  /**
   * Perform a single roll with pity system
   */
  rollSingle(stats: RollStats): RollResult {
    const rarity = this.determineRarity(stats);
    const card = this.getRandomCardOfRarity(rarity);
    
    const result: RollResult = {
      card: { ...card, id: uuidv4() }, // Generate unique instance
      isGuaranteed: this.wasGuaranteed(rarity, stats),
      pityTriggered: this.checkPityTrigger(rarity, stats),
      rollNumber: stats.totalRolls + 1
    };

    return result;
  }

  /**
   * Perform 10-roll with guaranteed rare or better
   */
  rollTen(stats: RollStats): MultiRollResult {
    const cards: RollResult[] = [];
    let hasRareOrBetter = false;
    let currentStats = { ...stats };

    // Roll 9 cards normally
    for (let i = 0; i < 9; i++) {
      const result = this.rollSingle(currentStats);
      cards.push(result);
      
      if (['rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(result.card.rarity)) {
        hasRareOrBetter = true;
      }
      
      // Update stats for next roll
      currentStats = this.updateStatsAfterRoll(currentStats, result.card.rarity);
    }

    // 10th card: guarantee rare or better if none yet
    if (!hasRareOrBetter) {
      const guaranteedRarity = this.getGuaranteedRarity(['rare', 'epic', 'legendary', 'mythic', 'cosmic']);
      const guaranteedCard = this.getRandomCardOfRarity(guaranteedRarity);
      
      cards.push({
        card: { ...guaranteedCard, id: uuidv4() },
        isGuaranteed: true,
        pityTriggered: false,
        rollNumber: currentStats.totalRolls + 10
      });
    } else {
      // Normal 10th roll
      cards.push(this.rollSingle(currentStats));
    }

    // Calculate rarity breakdown
    const rarityBreakdown = this.calculateRarityBreakdown(cards.map(r => r.card));
    const highlights = this.getHighlightCards(cards.map(r => r.card));

    return {
      cards,
      guaranteedTriggered: !hasRareOrBetter,
      bonusCards: [],
      totalValue: cards.reduce((sum, result) => sum + this.getCardValue(result.card), 0),
      rarityBreakdown,
      highlights
    };
  }

  /**
   * Determine rarity based on drop rates and pity system
   */
  private determineRarity(stats: RollStats): string {
    // Check pity system first
    if (stats.rollsSinceCosmic >= rollConfig.pitySystem.guaranteedCosmicAt) {
      return 'cosmic';
    }
    if (stats.rollsSinceMythic >= rollConfig.pitySystem.guaranteedMythicAt) {
      return 'mythic';
    }
    if (stats.rollsSinceLegendary >= rollConfig.pitySystem.guaranteedLegendaryAt) {
      return 'legendary';
    }
    if (stats.rollsSinceEpic >= rollConfig.pitySystem.guaranteedEpicAt) {
      return 'epic';
    }
    if (stats.rollsSinceRare >= rollConfig.pitySystem.guaranteedRareAt) {
      return 'rare';
    }

    // Normal probability roll
    const random = Math.random();
    let cumulativeProbability = 0;

    // Check rarities from highest to lowest
    const rarities = ['cosmic', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
    
    for (const rarity of rarities) {
      cumulativeProbability += rollConfig.dropRates[rarity as keyof typeof rollConfig.dropRates];
      if (random <= cumulativeProbability) {
        // Check if we have cards of this rarity
        const cardsOfRarity = this.allCards.get(rarity) || [];
        if (cardsOfRarity.length > 0) {
          return rarity;
        }
      }
    }

    // Fallback to common
    return 'common';
  }

  /**
   * Get random card of specific rarity
   */
  public getRandomCardOfRarity(rarity: string): Card {
    const cardsOfRarity = this.allCards.get(rarity) || [];
    
    if (cardsOfRarity.length === 0) {
      // Fallback to common if rarity not available
      const commonCardsArray = this.allCards.get('common') || [];
      if (commonCardsArray.length === 0) {
        throw new Error('No cards available');
      }
      return commonCardsArray[Math.floor(Math.random() * commonCardsArray.length)];
    }
    
    return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
  }

  /**
   * Check if this roll was guaranteed by pity
   */
  private wasGuaranteed(rarity: string, stats: RollStats): boolean {
    switch (rarity) {
      case 'cosmic': return stats.rollsSinceCosmic >= rollConfig.pitySystem.guaranteedCosmicAt;
      case 'mythic': return stats.rollsSinceMythic >= rollConfig.pitySystem.guaranteedMythicAt;
      case 'legendary': return stats.rollsSinceLegendary >= rollConfig.pitySystem.guaranteedLegendaryAt;
      case 'epic': return stats.rollsSinceEpic >= rollConfig.pitySystem.guaranteedEpicAt;
      case 'rare': return stats.rollsSinceRare >= rollConfig.pitySystem.guaranteedRareAt;
      default: return false;
    }
  }

  /**
   * Check if pity was triggered for this roll
   */
  private checkPityTrigger(rarity: string, stats: RollStats): boolean {
    return this.wasGuaranteed(rarity, stats);
  }

  /**
   * Get guaranteed rarity from available options
   */
  private getGuaranteedRarity(options: string[]): string {
    for (const rarity of options) {
      const cardsOfRarity = this.allCards.get(rarity) || [];
      if (cardsOfRarity.length > 0) {
        return rarity;
      }
    }
    return 'common'; // Fallback
  }

  /**
   * Update stats after a roll
   */
  private updateStatsAfterRoll(stats: RollStats, rarity: string): RollStats {
    const newStats = { ...stats };
    newStats.totalRolls += 1;
    
    // Reset counters for obtained rarity and higher
    switch (rarity) {
      case 'cosmic':
        newStats.rollsSinceCosmic = 0;
        newStats.rollsSinceMythic = 0;
        newStats.rollsSinceLegendary = 0;
        newStats.rollsSinceEpic = 0;
        newStats.rollsSinceRare = 0;
        break;
      case 'mythic':
        newStats.rollsSinceMythic = 0;
        newStats.rollsSinceLegendary = 0;
        newStats.rollsSinceEpic = 0;
        newStats.rollsSinceRare = 0;
        break;
      case 'legendary':
        newStats.rollsSinceLegendary = 0;
        newStats.rollsSinceEpic = 0;
        newStats.rollsSinceRare = 0;
        break;
      case 'epic':
        newStats.rollsSinceEpic = 0;
        newStats.rollsSinceRare = 0;
        break;
      case 'rare':
        newStats.rollsSinceRare = 0;
        break;
      default:
        // Increment all counters for common/uncommon
        newStats.rollsSinceRare += 1;
        newStats.rollsSinceEpic += 1;
        newStats.rollsSinceLegendary += 1;
        newStats.rollsSinceMythic += 1;
        newStats.rollsSinceCosmic += 1;
    }

    // Update collection stats
    newStats.collectedByRarity[rarity] = (newStats.collectedByRarity[rarity] || 0) + 1;

    return newStats;
  }

  /**
   * Get card value for calculating roll worth
   */
  private getCardValue(card: Card): number {
    const rarityValues = {
      common: 1,
      uncommon: 5,
      rare: 25,
      epic: 100,
      legendary: 500,
      mythic: 2500,
      cosmic: 10000
    };
    
    return rarityValues[card.rarity as keyof typeof rarityValues] || 1;
  }

  /**
   * Get drop rate for a specific rarity
   */
  getDropRate(rarity: string): number {
    return rollConfig.dropRates[rarity as keyof typeof rollConfig.dropRates] || 0;
  }

  /**
   * Get pity information
   */
  getPityInfo(stats: RollStats): Record<string, { current: number; max: number; percentage: number }> {
    return {
      rare: {
        current: stats.rollsSinceRare,
        max: rollConfig.pitySystem.guaranteedRareAt,
        percentage: (stats.rollsSinceRare / rollConfig.pitySystem.guaranteedRareAt) * 100
      },
      epic: {
        current: stats.rollsSinceEpic,
        max: rollConfig.pitySystem.guaranteedEpicAt,
        percentage: (stats.rollsSinceEpic / rollConfig.pitySystem.guaranteedEpicAt) * 100
      },
      legendary: {
        current: stats.rollsSinceLegendary,
        max: rollConfig.pitySystem.guaranteedLegendaryAt,
        percentage: (stats.rollsSinceLegendary / rollConfig.pitySystem.guaranteedLegendaryAt) * 100
      },
      mythic: {
        current: stats.rollsSinceMythic,
        max: rollConfig.pitySystem.guaranteedMythicAt,
        percentage: (stats.rollsSinceMythic / rollConfig.pitySystem.guaranteedMythicAt) * 100
      },
      cosmic: {
        current: stats.rollsSinceCosmic,
        max: rollConfig.pitySystem.guaranteedCosmicAt,
        percentage: (stats.rollsSinceCosmic / rollConfig.pitySystem.guaranteedCosmicAt) * 100
      }
    };
  }

  /**
   * Add cards to the database (for when new rarities are created)
   */
  addCardsToDatabase(rarity: string, cards: Card[]): void {
    this.allCards.set(rarity, cards);
  }

  /**
   * Perform 100-roll with multiple guarantees and bonus rewards
   */
  rollHundred(stats: RollStats): MultiRollResult {
    const cards: RollResult[] = [];
    let currentStats = { ...stats };
    const bonusCards: Card[] = [];
    
    // Track rarities obtained
    const rarityCount = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
      cosmic: 0
    };

    // Perform 99 regular rolls
    for (let i = 0; i < 99; i++) {
      const result = this.rollSingle(currentStats);
      cards.push(result);
      
      const rarity = result.card.rarity;
      rarityCount[rarity as keyof typeof rarityCount]++;
      
      currentStats = this.updateStatsAfterRoll(currentStats, rarity);
    }

    // 100th roll: Guarantee epic or better if none obtained
    const hasEpicOrBetter = rarityCount.epic > 0 || rarityCount.legendary > 0 || 
                            rarityCount.mythic > 0 || rarityCount.cosmic > 0;
    
    if (!hasEpicOrBetter) {
      const guaranteedRarity = this.getGuaranteedRarity(['epic', 'legendary', 'mythic', 'cosmic']);
      const guaranteedCard = this.getRandomCardOfRarity(guaranteedRarity);
      
      cards.push({
        card: { ...guaranteedCard, id: uuidv4() },
        isGuaranteed: true,
        pityTriggered: false,
        rollNumber: currentStats.totalRolls + 100
      });
      
      rarityCount[guaranteedRarity as keyof typeof rarityCount]++;
    } else {
      const result = this.rollSingle(currentStats);
      cards.push(result);
      rarityCount[result.card.rarity as keyof typeof rarityCount]++;
    }

    // Bonus rewards based on total value
    const totalValue = cards.reduce((sum, result) => sum + this.getCardValue(result.card), 0);
    
    // Bonus epic card if total value > 5000
    if (totalValue > 5000) {
      const bonusEpic = this.getRandomCardOfRarity('epic');
      if (bonusEpic) {
        bonusCards.push({ ...bonusEpic, id: uuidv4() });
      }
    }
    
    // Bonus legendary card if total value > 10000
    if (totalValue > 10000) {
      const bonusLegendary = this.getRandomCardOfRarity('legendary');
      if (bonusLegendary) {
        bonusCards.push({ ...bonusLegendary, id: uuidv4() });
      }
    }

    // Bonus mythic card if got 5+ legendaries
    if (rarityCount.legendary >= 5) {
      const bonusMythic = this.getRandomCardOfRarity('mythic');
      if (bonusMythic) {
        bonusCards.push({ ...bonusMythic, id: uuidv4() });
      }
    }

    const rarityBreakdown = this.calculateRarityBreakdown(cards.map(r => r.card));
    const highlights = this.getHighlightCards(cards.map(r => r.card));

    return {
      cards,
      guaranteedTriggered: !hasEpicOrBetter,
      bonusCards,
      totalValue,
      rarityBreakdown,
      highlights
    };
  }

  /**
   * Calculate rarity breakdown for cards
   */
  private calculateRarityBreakdown(cards: Card[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    for (const card of cards) {
      breakdown[card.rarity] = (breakdown[card.rarity] || 0) + 1;
    }
    
    return breakdown;
  }

  /**
   * Get highlight cards (rare or better)
   */
  private getHighlightCards(cards: Card[]): Card[] {
    const highlightRarities = ['rare', 'epic', 'legendary', 'mythic', 'cosmic'];
    return cards.filter(card => highlightRarities.includes(card.rarity))
                .sort((a, b) => this.getCardValue(b) - this.getCardValue(a))
                .slice(0, 5); // Top 5 best cards
  }

  /**
   * Get all available rarities
   */
  getAvailableRarities(): string[] {
    const rarities: string[] = [];
    this.allCards.forEach((cards, rarity) => {
      if (cards.length > 0) {
        rarities.push(rarity);
      }
    });
    return rarities;
  }
}