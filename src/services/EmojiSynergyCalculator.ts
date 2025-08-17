import { EmojiSynergy, EmojiPower } from '../types/emoji';
import { getEmojiPower } from '../systems/emoji-database';

/**
 * Predefined synergy combinations with bonuses
 * Based on specs in docs/specifications/emoji-powers.md
 */
const SYNERGY_DATABASE: EmojiSynergy[] = [
  // === POWER COMBOS ===
  {
    name: 'Burn Build',
    description: 'Stacking fire damage amplifies burn effects',
    requiredEmojis: ['🔥', '💣', '☄️'],
    bonusEffect: 'burn_amplify',
    bonusValue: 50, // +50% burn damage
    category: 'damage'
  },
  {
    name: 'Freeze Lock',
    description: 'Control effects extend duration and stack',
    requiredEmojis: ['❄️', '🌊', '🕸️'],
    bonusEffect: 'control_extend',
    bonusValue: 100, // +100% control duration
    category: 'control'
  },
  {
    name: 'Poison Master',
    description: 'DoT effects stack and spread',
    requiredEmojis: ['🧪', '🦠', '🐍'],
    bonusEffect: 'poison_stack',
    bonusValue: 75, // +75% poison damage
    category: 'damage'
  },
  {
    name: 'Lucky Gambler',
    description: 'RNG effects have increased luck',
    requiredEmojis: ['🍀', '🎲', '🎰'],
    bonusEffect: 'luck_boost',
    bonusValue: 25, // +25% better RNG outcomes
    category: 'energy'
  },
  {
    name: 'Speed Demon',
    description: 'Attack speed stacks multiplicatively',
    requiredEmojis: ['🏃', '⚡', '🎯'],
    bonusEffect: 'speed_stack',
    bonusValue: 150, // +150% attack speed
    category: 'damage'
  },
  {
    name: 'Tank Build',
    description: 'Survival effects provide damage reduction',
    requiredEmojis: ['🛡️', '❤️', '🌱'],
    bonusEffect: 'damage_reduction',
    bonusValue: 30, // 30% damage reduction
    category: 'survival'
  },
  {
    name: 'Energy Loop',
    description: 'Resource generation creates feedback loop',
    requiredEmojis: ['🔋', '⚡', '💎'],
    bonusEffect: 'energy_multiply',
    bonusValue: 200, // +200% energy generation
    category: 'energy'
  },
  {
    name: 'Death Dealer',
    description: 'Execution effects trigger on higher HP',
    requiredEmojis: ['💀', '👻', '🗿'],
    bonusEffect: 'execute_threshold',
    bonusValue: 35, // Execute at 35% HP instead of 20%
    category: 'damage'
  },

  // === ELEMENTAL COMBOS ===
  {
    name: 'Fire Storm',
    description: 'Fire and lightning create devastating storm',
    requiredEmojis: ['🔥', '⚡'],
    bonusEffect: 'elemental_storm',
    bonusValue: 25, // +25% area damage
    category: 'damage'
  },
  {
    name: 'Frozen Lightning',
    description: 'Ice and lightning slow and shock',
    requiredEmojis: ['❄️', '⚡'],
    bonusEffect: 'shock_freeze',
    bonusValue: 50, // +50% stun chance
    category: 'control'
  },
  {
    name: 'Toxic Explosion',
    description: 'Poison spreads through explosions',
    requiredEmojis: ['🧪', '💥'],
    bonusEffect: 'poison_spread',
    bonusValue: 100, // Poison spreads to nearby enemies
    category: 'damage'
  },

  // === SUPPORT COMBOS ===
  {
    name: 'Healing Harmony',
    description: 'Multiple heals stack exponentially',
    requiredEmojis: ['💚', '❤️', '🌱'],
    bonusEffect: 'heal_multiply',
    bonusValue: 50, // +50% healing effectiveness
    category: 'support'
  },
  {
    name: 'Divine Protection',
    description: 'Shield and heals create divine barrier',
    requiredEmojis: ['🛡️', '💚'],
    bonusEffect: 'divine_barrier',
    bonusValue: 2, // Shield blocks double hits
    category: 'support'
  },
  {
    name: 'Power Surge',
    description: 'Buffs stack for mega boost',
    requiredEmojis: ['✨', '💪', '🏃'],
    bonusEffect: 'buff_stack',
    bonusValue: 100, // +100% buff effectiveness
    category: 'support'
  },

  // === CHAOS COMBOS ===
  {
    name: 'Chaos Theory',
    description: 'Random effects become more unpredictable',
    requiredEmojis: ['🎲', '🎰', '🔮'],
    bonusEffect: 'chaos_amplify',
    bonusValue: 300, // +300% random variance
    category: 'energy'
  },
  {
    name: 'Royal Court',
    description: 'Crown effects extend to all emojis',
    requiredEmojis: ['👑', '🏆'],
    bonusEffect: 'royal_aura',
    bonusValue: 50, // +50% all stats
    category: 'energy'
  },

  // === MINI COMBOS (2 emojis) ===
  {
    name: 'Sharp Edge',
    description: 'Sword and arrow pierce deeper',
    requiredEmojis: ['🗡️', '🏹'],
    bonusEffect: 'pierce_boost',
    bonusValue: 15, // +15% armor pierce
    category: 'damage'
  },
  {
    name: 'Web Trap',
    description: 'Spider and web create stronger trap',
    requiredEmojis: ['🕷️', '🕸️'],
    bonusEffect: 'trap_enhance',
    bonusValue: 1, // +1 second root duration
    category: 'control'
  },
  {
    name: 'Nature\'s Wrath',
    description: 'Plant emojis grow stronger together',
    requiredEmojis: ['🌱', '🌵'],
    bonusEffect: 'nature_bond',
    bonusValue: 30, // +30% growth rate
    category: 'support'
  }
];

export class EmojiSynergyCalculator {
  /**
   * Calculate active synergies for given emoji array
   */
  static calculateSynergies(emojiCharacters: string[]): EmojiSynergy[] {
    const activeSynergies: EmojiSynergy[] = [];
    
    for (const synergy of SYNERGY_DATABASE) {
      if (this.hasRequiredEmojis(emojiCharacters, synergy.requiredEmojis)) {
        activeSynergies.push(synergy);
      }
    }
    
    // Sort by power (more emojis = higher priority)
    activeSynergies.sort((a, b) => b.requiredEmojis.length - a.requiredEmojis.length);
    
    return activeSynergies;
  }

  /**
   * Check if emoji array contains all required emojis for synergy
   */
  private static hasRequiredEmojis(available: string[], required: string[]): boolean {
    return required.every(emoji => available.includes(emoji));
  }

  /**
   * Calculate total synergy bonus damage
   */
  static calculateSynergyDamageBonus(
    emojiCharacters: string[], 
    activeSynergies: EmojiSynergy[]
  ): number {
    let totalBonus = 0;
    
    for (const synergy of activeSynergies) {
      if (synergy.category === 'damage') {
        switch (synergy.bonusEffect) {
          case 'burn_amplify':
          case 'poison_stack':
          case 'speed_stack':
          case 'elemental_storm':
          case 'execute_threshold':
            totalBonus += synergy.bonusValue;
            break;
        }
      }
    }
    
    return totalBonus;
  }

  /**
   * Calculate total healing bonus from synergies
   */
  static calculateSynergyHealingBonus(activeSynergies: EmojiSynergy[]): number {
    let healingBonus = 0;
    
    for (const synergy of activeSynergies) {
      if (synergy.bonusEffect === 'heal_multiply') {
        healingBonus += synergy.bonusValue;
      }
    }
    
    return healingBonus;
  }

  /**
   * Calculate control duration bonus
   */
  static calculateControlDurationBonus(activeSynergies: EmojiSynergy[]): number {
    let controlBonus = 0;
    
    for (const synergy of activeSynergies) {
      if (synergy.bonusEffect === 'control_extend') {
        controlBonus += synergy.bonusValue;
      }
    }
    
    return controlBonus;
  }

  /**
   * Calculate energy generation bonus
   */
  static calculateEnergyBonus(activeSynergies: EmojiSynergy[]): number {
    let energyBonus = 0;
    
    for (const synergy of activeSynergies) {
      if (synergy.bonusEffect === 'energy_multiply') {
        energyBonus += synergy.bonusValue;
      }
    }
    
    return energyBonus;
  }

  /**
   * Get synergy score for emoji combination (for card rating)
   */
  static getSynergyScore(emojiCharacters: string[]): number {
    const synergies = this.calculateSynergies(emojiCharacters);
    
    let score = 0;
    for (const synergy of synergies) {
      // Weight by number of emojis required and bonus value
      const weight = synergy.requiredEmojis.length * 10;
      const bonus = synergy.bonusValue / 100;
      score += weight * bonus;
    }
    
    return Math.round(score);
  }

  /**
   * Get all possible synergies (for documentation/UI)
   */
  static getAllSynergies(): EmojiSynergy[] {
    return [...SYNERGY_DATABASE];
  }

  /**
   * Get synergies by category
   */
  static getSynergiesByCategory(category: string): EmojiSynergy[] {
    return SYNERGY_DATABASE.filter(synergy => synergy.category === category);
  }

  /**
   * Find optimal emoji combinations for maximum synergy
   */
  static findOptimalCombination(
    availableEmojis: string[], 
    targetCount: number
  ): { emojis: string[], synergies: EmojiSynergy[], score: number } {
    let bestCombination = {
      emojis: [] as string[],
      synergies: [] as EmojiSynergy[],
      score: 0
    };

    // Try all combinations of target size
    const combinations = this.generateCombinations(availableEmojis, targetCount);
    
    for (const combo of combinations) {
      const synergies = this.calculateSynergies(combo);
      const score = this.getSynergyScore(combo);
      
      if (score > bestCombination.score) {
        bestCombination = {
          emojis: combo,
          synergies,
          score
        };
      }
    }
    
    return bestCombination;
  }

  /**
   * Generate all combinations of size k from array
   */
  private static generateCombinations(arr: string[], k: number): string[][] {
    if (k === 0) return [[]];
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];
    if (k > arr.length) return [];
    
    const head = arr[0];
    const tail = arr.slice(1);
    
    const withHead = this.generateCombinations(tail, k - 1).map(combo => [head, ...combo]);
    const withoutHead = this.generateCombinations(tail, k);
    
    return [...withHead, ...withoutHead];
  }

  /**
   * Get description for synergy effect
   */
  static getSynergyDescription(bonusEffect: string): string {
    const synergy = SYNERGY_DATABASE.find(s => s.bonusEffect === bonusEffect);
    return synergy?.description || 'Unknown synergy effect';
  }

  /**
   * Check if combination creates "perfect synergy" (multiple overlapping synergies)
   */
  static isPerfectSynergy(emojiCharacters: string[]): boolean {
    const synergies = this.calculateSynergies(emojiCharacters);
    return synergies.length >= 3; // 3+ active synergies = perfect
  }
}