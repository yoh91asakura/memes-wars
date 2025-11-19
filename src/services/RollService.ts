// RollService Implementation - Follows contract specification exactly
// Implements specs/001-extract-current-project/contracts/rollservice.md

import { Card, CardRarity, MemeFamily, CardUtils } from '../models';

// Contract interfaces - must match test expectations exactly
export interface IRollService {
  rollSingle(): RollResult;
  rollMultiple(count: number): RollResult[];
  getPityStatus(): PityStatus;
  getStatistics(): RollStatistics;
  resetPity(): void;
}

export interface RollResult {
  card: Card;
  pityTriggered: boolean;
  rarityBoosted: boolean;
  rollNumber: number;
  timestamp: Date;
}

export type MultiRollResult = RollResult[];

export interface PityStatus {
  rollsWithoutRare: number;
  rollsWithoutEpic: number;
  rollsWithoutLegendary: number;
  rollsWithoutMythic: number;
  nextGuaranteed?: CardRarity;
  rollsUntilGuaranteed?: number;
}

export interface RollStatistics {
  totalRolls: number;
  cardsByRarity: Record<CardRarity, number>;
  averageRollsPerRare: number;
  pityTriggeredCount: number;
  currentStreak: Record<CardRarity, number>;
}

export interface RollServiceState {
  rollCount: number;
  pityCounters: Record<CardRarity, number>;
  statistics: RollStatistics;
}

// Drop rate configuration matching contract specification
const DROP_RATES: Record<CardRarity, number> = {
  [CardRarity.COMMON]: 0.65,     // 65%
  [CardRarity.UNCOMMON]: 0.25,   // 25%
  [CardRarity.RARE]: 0.07,       // 7%
  [CardRarity.EPIC]: 0.025,      // 2.5%
  [CardRarity.LEGENDARY]: 0.004, // 0.4%
  [CardRarity.MYTHIC]: 0.0009,   // 0.09%
  [CardRarity.COSMIC]: 0.0001,   // 0.01%
  [CardRarity.DIVINE]: 0.00001,  // 0.001%
  [CardRarity.INFINITY]: 0.000001, // 0.0001%
  [CardRarity.BEYOND]: 0.0000001,  // 0.00001%
};

// Pity system thresholds matching contract
const PITY_THRESHOLDS = {
  [CardRarity.RARE]: 10,
  [CardRarity.EPIC]: 30,
  [CardRarity.LEGENDARY]: 90,
  [CardRarity.MYTHIC]: 200,
};

export class RollService implements IRollService {
  private rollCount = 0;
  private pityCounters: Record<CardRarity, number> = {
    [CardRarity.COMMON]: 0,
    [CardRarity.UNCOMMON]: 0,
    [CardRarity.RARE]: 0,
    [CardRarity.EPIC]: 0,
    [CardRarity.LEGENDARY]: 0,
    [CardRarity.MYTHIC]: 0,
    [CardRarity.COSMIC]: 0,
    [CardRarity.DIVINE]: 0,
    [CardRarity.INFINITY]: 0,
    [CardRarity.BEYOND]: 0,
  };
  private statistics: RollStatistics = {
    totalRolls: 0,
    cardsByRarity: {
      [CardRarity.COMMON]: 0,
      [CardRarity.UNCOMMON]: 0,
      [CardRarity.RARE]: 0,
      [CardRarity.EPIC]: 0,
      [CardRarity.LEGENDARY]: 0,
      [CardRarity.MYTHIC]: 0,
      [CardRarity.COSMIC]: 0,
      [CardRarity.DIVINE]: 0,
      [CardRarity.INFINITY]: 0,
      [CardRarity.BEYOND]: 0,
    },
    averageRollsPerRare: 0,
    pityTriggeredCount: 0,
    currentStreak: {
      [CardRarity.COMMON]: 0,
      [CardRarity.UNCOMMON]: 0,
      [CardRarity.RARE]: 0,
      [CardRarity.EPIC]: 0,
      [CardRarity.LEGENDARY]: 0,
      [CardRarity.MYTHIC]: 0,
      [CardRarity.COSMIC]: 0,
      [CardRarity.DIVINE]: 0,
      [CardRarity.INFINITY]: 0,
      [CardRarity.BEYOND]: 0,
    }
  };

  rollSingle(): RollResult {
    this.rollCount++;
    this.statistics.totalRolls++;

    // Check pity system first
    const pityResult = this.checkPitySystem();

    let rarity: CardRarity;
    let pityTriggered = false;

    if (pityResult.shouldTrigger) {
      rarity = pityResult.guaranteedRarity!;
      pityTriggered = true;
      this.statistics.pityTriggeredCount++;
    } else {
      // Normal roll based on drop rates
      rarity = this.rollRarity();
    }

    // Generate card of determined rarity
    const card = this.generateCard(rarity);

    // Update pity counters
    this.updatePityCounters(rarity);

    // Update statistics
    this.statistics.cardsByRarity[rarity]++;
    this.updateCurrentStreak(rarity);
    this.recalculateAverageRollsPerRare();

    return {
      card,
      pityTriggered,
      rarityBoosted: false, // Not implemented in this version
      rollNumber: this.rollCount,
      timestamp: new Date()
    };
  }

  rollMultiple(count: number): RollResult[] {
    if (count <= 0 || count > 100) {
      throw new Error('Invalid roll count. Must be between 1 and 100.');
    }

    const results: RollResult[] = [];

    for (let i = 0; i < count; i++) {
      results.push(this.rollSingle());
    }

    return results;
  }

  getPityStatus(): PityStatus {
    const nextGuaranteed = this.getNextGuaranteedRarity();

    return {
      rollsWithoutRare: this.pityCounters[CardRarity.RARE],
      rollsWithoutEpic: this.pityCounters[CardRarity.EPIC],
      rollsWithoutLegendary: this.pityCounters[CardRarity.LEGENDARY],
      rollsWithoutMythic: this.pityCounters[CardRarity.MYTHIC],
      nextGuaranteed,
      rollsUntilGuaranteed: nextGuaranteed ? this.getRollsUntilGuaranteed(nextGuaranteed) : undefined
    };
  }

  getStatistics(): RollStatistics {
    return { ...this.statistics }; // Return copy to prevent external mutation
  }

  resetPity(): void {
    this.pityCounters = {
      [CardRarity.COMMON]: 0,
      [CardRarity.UNCOMMON]: 0,
      [CardRarity.RARE]: 0,
      [CardRarity.EPIC]: 0,
      [CardRarity.LEGENDARY]: 0,
      [CardRarity.MYTHIC]: 0,
      [CardRarity.COSMIC]: 0,
      [CardRarity.DIVINE]: 0,
      [CardRarity.INFINITY]: 0,
      [CardRarity.BEYOND]: 0,
    };
  }

  getState(): RollServiceState {
    return {
      rollCount: this.rollCount,
      pityCounters: { ...this.pityCounters },
      statistics: JSON.parse(JSON.stringify(this.statistics)) // Deep copy
    };
  }

  setState(state: RollServiceState): void {
    if (!state) return;
    this.rollCount = state.rollCount || 0;
    this.pityCounters = { ...this.pityCounters, ...(state.pityCounters || {}) };
    this.statistics = { ...this.statistics, ...(state.statistics || {}) };
  }

  // Private helper methods
  private checkPitySystem(): { shouldTrigger: boolean; guaranteedRarity?: CardRarity } {
    // Check in order of precedence (highest rarity first)
    if (this.pityCounters[CardRarity.MYTHIC] >= PITY_THRESHOLDS[CardRarity.MYTHIC]) {
      return { shouldTrigger: true, guaranteedRarity: CardRarity.MYTHIC };
    }
    if (this.pityCounters[CardRarity.LEGENDARY] >= PITY_THRESHOLDS[CardRarity.LEGENDARY]) {
      return { shouldTrigger: true, guaranteedRarity: CardRarity.LEGENDARY };
    }
    if (this.pityCounters[CardRarity.EPIC] >= PITY_THRESHOLDS[CardRarity.EPIC]) {
      return { shouldTrigger: true, guaranteedRarity: CardRarity.EPIC };
    }
    if (this.pityCounters[CardRarity.RARE] >= PITY_THRESHOLDS[CardRarity.RARE]) {
      return { shouldTrigger: true, guaranteedRarity: CardRarity.RARE };
    }

    return { shouldTrigger: false };
  }

  private rollRarity(): CardRarity {
    const random = Math.random();
    let cumulative = 0;

    // Roll based on cumulative probabilities
    for (const [rarity, rate] of Object.entries(DROP_RATES)) {
      cumulative += rate;
      if (random <= cumulative) {
        return rarity as CardRarity;
      }
    }

    // Fallback to common (should not happen with proper rates)
    return CardRarity.COMMON;
  }

  private generateCard(rarity: CardRarity): Card {
    // Convert CardRarity to probability number for CardUtils.generateCard
    const rarityToProbability = {
      [CardRarity.COMMON]: 2,
      [CardRarity.UNCOMMON]: 4,
      [CardRarity.RARE]: 10,
      [CardRarity.EPIC]: 50,
      [CardRarity.LEGENDARY]: 200,
      [CardRarity.MYTHIC]: 1000,
      [CardRarity.COSMIC]: 5000,
      [CardRarity.DIVINE]: 10000,
      [CardRarity.INFINITY]: 50000,
      [CardRarity.BEYOND]: 100000
    };

    // Generate sample cards based on rarity
    const cardTemplates = this.getCardTemplates(rarity);
    const template = cardTemplates[Math.floor(Math.random() * cardTemplates.length)] || cardTemplates[0];

    if (!template) {
      // Should never happen given getCardTemplates fallback
      throw new Error(`No templates found for rarity ${rarity}`);
    }

    // Generate unique ID
    const cardId = `${rarity}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Use CardUtils.generateCard with correct signature
    return CardUtils.generateCard(
      rarityToProbability[rarity],
      cardId,
      template.name
    );
  }

  private getCardTemplates(rarity: CardRarity) {
    // Sample card templates for each rarity
    const templates = {
      [CardRarity.COMMON]: [
        { name: 'Doge', memeFamily: MemeFamily.CLASSIC_INTERNET, emojis: ['🐶'], health: 80, attackDamage: 10, attackSpeed: 1.0, flavor: 'Much wow, very card' },
        { name: 'Trollface', memeFamily: MemeFamily.CLASSIC_INTERNET, emojis: ['😈'], health: 90, attackDamage: 8, attackSpeed: 1.2, flavor: 'Problem?' },
        { name: 'Grumpy Cat', memeFamily: MemeFamily.ANIMALS, emojis: ['😾'], health: 70, attackDamage: 12, attackSpeed: 0.9, flavor: 'NO.' }
      ],
      [CardRarity.UNCOMMON]: [
        { name: 'Drake Pointing', memeFamily: MemeFamily.MEME_FORMATS, emojis: ['👉'], health: 120, attackDamage: 15, attackSpeed: 1.1, flavor: 'This one' },
        { name: 'Pepe', memeFamily: MemeFamily.CLASSIC_INTERNET, emojis: ['🐸'], health: 100, attackDamage: 18, attackSpeed: 1.0, flavor: 'Feels good man' }
      ],
      [CardRarity.RARE]: [
        { name: 'Chad', memeFamily: MemeFamily.CLASSIC_INTERNET, emojis: ['💪'], health: 150, attackDamage: 25, attackSpeed: 1.3, flavor: 'Yes.' },
        { name: 'Zeus', memeFamily: MemeFamily.MYTHOLOGY, emojis: ['⚡'], health: 200, attackDamage: 30, attackSpeed: 0.8, flavor: 'God of thunder' }
      ],
      [CardRarity.EPIC]: [
        { name: 'Giga Chad', memeFamily: MemeFamily.CLASSIC_INTERNET, emojis: ['💪', '🔥'], health: 250, attackDamage: 40, attackSpeed: 1.5, manaCost: 3, flavor: 'Ultimate Chad' },
        { name: 'Odin', memeFamily: MemeFamily.MYTHOLOGY, emojis: ['⚡', '🗡️'], health: 300, attackDamage: 35, attackSpeed: 1.0, manaCost: 4, flavor: 'Allfather' }
      ],
      [CardRarity.LEGENDARY]: [
        {
          name: 'Eternal Doge',
          memeFamily: MemeFamily.CLASSIC_INTERNET,
          emojis: ['🐶', '⭐', '💎'],
          health: 400,
          attackDamage: 50,
          attackSpeed: 2.0,
          manaCost: 5,
          passiveAbility: {
            id: 'eternal-wow',
            name: 'Eternal Wow',
            description: 'Much immortal, very eternal',
            effect: '{"type": "immortal_once", "value": 1}',
            trigger: 'low_hp'
          },
          flavor: 'Such legend, much eternal'
        }
      ],
      [CardRarity.MYTHIC]: [
        {
          name: 'Cosmic Pepe',
          memeFamily: MemeFamily.CLASSIC_INTERNET,
          emojis: ['🐸', '🌟', '🌌'],
          health: 600,
          attackDamage: 75,
          attackSpeed: 2.5,
          manaCost: 7,
          passiveAbility: {
            id: 'reality-warp',
            name: 'Reality Warp',
            description: 'Warps the fabric of meme reality',
            effect: '{"type": "double_damage", "chance": 0.3}',
            trigger: 'combat_start'
          },
          flavor: 'Ascended beyond mortal comprehension'
        }
      ],
      [CardRarity.COSMIC]: [
        {
          name: 'The One Meme',
          memeFamily: MemeFamily.CLASSIC_INTERNET,
          emojis: ['🌌', '⭐', '💎', '🔥'],
          health: 1000,
          attackDamage: 100,
          attackSpeed: 3.0,
          manaCost: 10,
          passiveAbility: {
            id: 'meme-singularity',
            name: 'Meme Singularity',
            description: 'All memes are one, one is all memes',
            effect: '{"type": "win_condition", "chance": 0.1}',
            trigger: 'synergy'
          },
          flavor: 'The source code of all memes'
        }
      ],
      [CardRarity.DIVINE]: [
        {
          name: 'Divine Doge',
          memeFamily: MemeFamily.CLASSIC_INTERNET,
          emojis: ['🐶', '✨', '👑'],
          health: 1500,
          attackDamage: 150,
          attackSpeed: 4.0,
          manaCost: 15,
          flavor: 'Much divine, very blessed'
        }
      ],
      [CardRarity.INFINITY]: [
        {
          name: 'Infinite Chad',
          memeFamily: MemeFamily.CLASSIC_INTERNET,
          emojis: ['💪', '∞', '🌟'],
          health: 2500,
          attackDamage: 250,
          attackSpeed: 5.0,
          manaCost: 25,
          flavor: 'Limitless power, infinite chad'
        }
      ],
      [CardRarity.BEYOND]: [
        {
          name: 'Beyond Comprehension',
          memeFamily: MemeFamily.CLASSIC_INTERNET,
          emojis: ['🌀', '🔮', '💫'],
          health: 5000,
          attackDamage: 500,
          attackSpeed: 10.0,
          manaCost: 50,
          flavor: 'Transcends all understanding'
        }
      ]
    };

    return templates[rarity] || templates[CardRarity.COMMON];
  }

  private updatePityCounters(rolledRarity: CardRarity): void {
    // Reset counters for the rarity rolled and lower
    const rarityOrder = [
      CardRarity.COMMON,
      CardRarity.UNCOMMON,
      CardRarity.RARE,
      CardRarity.EPIC,
      CardRarity.LEGENDARY,
      CardRarity.MYTHIC,
      CardRarity.COSMIC,
      CardRarity.DIVINE,
      CardRarity.INFINITY,
      CardRarity.BEYOND
    ];

    const rolledIndex = rarityOrder.indexOf(rolledRarity);

    // Reset all counters up to and including the rolled rarity
    for (let i = 0; i <= rolledIndex; i++) {
      this.pityCounters[rarityOrder[i]] = 0;
    }

    // Increment counters for higher rarities
    for (let i = rolledIndex + 1; i < rarityOrder.length; i++) {
      this.pityCounters[rarityOrder[i]]++;
    }
  }

  private updateCurrentStreak(rarity: CardRarity): void {
    // Reset all streaks except the current one
    (Object.keys(this.statistics.currentStreak) as CardRarity[]).forEach(r => {
      if (r === rarity) {
        this.statistics.currentStreak[r]++;
      } else {
        this.statistics.currentStreak[r] = 0;
      }
    });
  }

  private recalculateAverageRollsPerRare(): void {
    const rareCount = this.statistics.cardsByRarity[CardRarity.RARE] +
      this.statistics.cardsByRarity[CardRarity.EPIC] +
      this.statistics.cardsByRarity[CardRarity.LEGENDARY] +
      this.statistics.cardsByRarity[CardRarity.MYTHIC] +
      this.statistics.cardsByRarity[CardRarity.COSMIC];

    if (rareCount > 0) {
      this.statistics.averageRollsPerRare = this.statistics.totalRolls / rareCount;
    }
  }

  private getNextGuaranteedRarity(): CardRarity | undefined {
    // Return the next rarity that will be guaranteed based on current pity
    if (this.pityCounters[CardRarity.RARE] >= (PITY_THRESHOLDS[CardRarity.RARE] || Infinity) - 1) {
      return CardRarity.RARE;
    }
    if (this.pityCounters[CardRarity.EPIC] >= (PITY_THRESHOLDS[CardRarity.EPIC] || Infinity) - 1) {
      return CardRarity.EPIC;
    }
    if (this.pityCounters[CardRarity.LEGENDARY] >= (PITY_THRESHOLDS[CardRarity.LEGENDARY] || Infinity) - 1) {
      return CardRarity.LEGENDARY;
    }
    if (this.pityCounters[CardRarity.MYTHIC] >= (PITY_THRESHOLDS[CardRarity.MYTHIC] || Infinity) - 1) {
      return CardRarity.MYTHIC;
    }
    return undefined;
  }

  private getRollsUntilGuaranteed(rarity: CardRarity): number {
    const threshold = PITY_THRESHOLDS[rarity] || 0;
    const current = this.pityCounters[rarity];
    return Math.max(0, threshold - current);
  }
}