// Synergy System - Detect and apply deck synergies
// Implementation of Force build, Luck build, and other synergies from CLAUDE.md

import { Card, MemeFamily, EffectType } from '../models';

export interface SynergyType {
  id: string;
  name: string;
  description: string;
  detectionRules: SynergyRule[];
  bonuses: SynergyBonus[];
  minThreshold: number;
  maxThreshold: number;
  stackable: boolean;
}

export interface SynergyRule {
  type: 'family' | 'emoji' | 'effect' | 'rarity' | 'stat' | 'custom';
  condition: string | MemeFamily | EffectType;
  count?: number;
  operator?: '=' | '>=' | '<=' | '>' | '<';
  value?: number | string;
}

export interface SynergyBonus {
  type: 'damage' | 'health' | 'speed' | 'luck' | 'special' | 'effect';
  value: number;
  isPercentage: boolean;
  target?: 'self' | 'team' | 'enemy';
  description: string;
}

export interface ActiveSynergy {
  synergyId: string;
  level: number;
  bonuses: SynergyBonus[];
  triggeringCards: string[];
  strength: number; // 0-1, how strong the synergy is
}

export interface SynergyDetectionResult {
  activeSynergies: ActiveSynergy[];
  potentialSynergies: PotentialSynergy[];
  deckStats: DeckSynergyStats;
}

export interface PotentialSynergy {
  synergyId: string;
  currentCount: number;
  requiredCount: number;
  missingElements: string[];
  description: string;
}

export interface DeckSynergyStats {
  totalSynergies: number;
  synergyStrength: number;
  dominantFamily: MemeFamily;
  deckArchetype: string;
  recommendations: string[];
}

// Define all synergy types as specified in CLAUDE.md
export const SYNERGY_TYPES: Record<string, SynergyType> = {
  FORCE_BUILD: {
    id: 'FORCE_BUILD',
    name: 'Force Build',
    description: 'High damage build focusing on raw power and destruction',
    detectionRules: [
      {
        type: 'emoji',
        condition: '💪',
        count: 2,
        operator: '>='
      },
      {
        type: 'emoji',
        condition: '⚔️',
        count: 1,
        operator: '>='
      }
    ],
    bonuses: [
      {
        type: 'damage',
        value: 50,
        isPercentage: true,
        target: 'self',
        description: '+50% damage to all attacks'
      },
      {
        type: 'special',
        value: 0.15,
        isPercentage: false,
        target: 'self',
        description: '15% chance for critical hits'
      }
    ],
    minThreshold: 3,
    maxThreshold: 10,
    stackable: true
  },

  LUCK_BUILD: {
    id: 'LUCK_BUILD',
    name: 'Luck Build',
    description: 'RNG-focused build with high luck and random effects',
    detectionRules: [
      {
        type: 'stat',
        condition: 'luck',
        value: 100,
        operator: '>='
      },
      {
        type: 'effect',
        condition: EffectType.LUCKY,
        count: 2,
        operator: '>='
      }
    ],
    bonuses: [
      {
        type: 'luck',
        value: 75,
        isPercentage: true,
        target: 'self',
        description: '+75% luck multiplier'
      },
      {
        type: 'special',
        value: 0.2,
        isPercentage: false,
        target: 'self',
        description: '20% chance for double rewards'
      }
    ],
    minThreshold: 2,
    maxThreshold: 8,
    stackable: true
  },

  TANK_BUILD: {
    id: 'TANK_BUILD',
    name: 'Tank Build',
    description: 'High HP and defensive capabilities',
    detectionRules: [
      {
        type: 'emoji',
        condition: '🛡️',
        count: 2,
        operator: '>='
      },
      {
        type: 'stat',
        condition: 'hp',
        value: 500,
        operator: '>='
      }
    ],
    bonuses: [
      {
        type: 'health',
        value: 40,
        isPercentage: true,
        target: 'self',
        description: '+40% maximum health'
      },
      {
        type: 'special',
        value: 25,
        isPercentage: false,
        target: 'self',
        description: '+25 shield at battle start'
      }
    ],
    minThreshold: 2,
    maxThreshold: 6,
    stackable: false
  },

  SPEED_BUILD: {
    id: 'SPEED_BUILD',
    name: 'Speed Build',
    description: 'Fast attacks and quick projectiles',
    detectionRules: [
      {
        type: 'emoji',
        condition: '💨',
        count: 3,
        operator: '>='
      },
      {
        type: 'emoji',
        condition: '⚡',
        count: 2,
        operator: '>='
      }
    ],
    bonuses: [
      {
        type: 'speed',
        value: 60,
        isPercentage: true,
        target: 'self',
        description: '+60% attack speed'
      },
      {
        type: 'special',
        value: 2,
        isPercentage: false,
        target: 'self',
        description: 'Projectiles move 2x faster'
      }
    ],
    minThreshold: 4,
    maxThreshold: 8,
    stackable: true
  },

  ELEMENTAL_MASTERY: {
    id: 'ELEMENTAL_MASTERY',
    name: 'Elemental Mastery',
    description: 'Diverse elemental effects for tactical advantage',
    detectionRules: [
      {
        type: 'emoji',
        condition: '🔥',
        count: 1,
        operator: '>='
      },
      {
        type: 'emoji',
        condition: '❄️',
        count: 1,
        operator: '>='
      },
      {
        type: 'emoji',
        condition: '⚡',
        count: 1,
        operator: '>='
      }
    ],
    bonuses: [
      {
        type: 'special',
        value: 0.3,
        isPercentage: false,
        target: 'self',
        description: '30% chance for random elemental effect'
      },
      {
        type: 'effect',
        value: 50,
        isPercentage: true,
        target: 'self',
        description: '+50% effect duration'
      }
    ],
    minThreshold: 3,
    maxThreshold: 6,
    stackable: false
  },

  MEME_LORD: {
    id: 'MEME_LORD',
    name: 'Meme Lord',
    description: 'Classic internet memes with chaotic effects',
    detectionRules: [
      {
        type: 'family',
        condition: MemeFamily.CLASSIC_INTERNET,
        count: 4,
        operator: '>='
      }
    ],
    bonuses: [
      {
        type: 'special',
        value: 0.25,
        isPercentage: false,
        target: 'self',
        description: '25% chance for chaos effects'
      },
      {
        type: 'damage',
        value: 25,
        isPercentage: true,
        target: 'self',
        description: '+25% damage vs all enemies'
      }
    ],
    minThreshold: 4,
    maxThreshold: 8,
    stackable: false
  },

  ANCIENT_POWER: {
    id: 'ANCIENT_POWER',
    name: 'Ancient Power',
    description: 'Mythology and historical figures unite',
    detectionRules: [
      {
        type: 'family',
        condition: MemeFamily.MYTHOLOGY,
        count: 2,
        operator: '>='
      },
      {
        type: 'family',
        condition: MemeFamily.HISTORICAL_FIGURES,
        count: 2,
        operator: '>='
      }
    ],
    bonuses: [
      {
        type: 'special',
        value: 1,
        isPercentage: false,
        target: 'self',
        description: 'Immune to first death (revive once)'
      },
      {
        type: 'health',
        value: 30,
        isPercentage: true,
        target: 'self',
        description: '+30% maximum health'
      }
    ],
    minThreshold: 4,
    maxThreshold: 6,
    stackable: false
  },

  RAINBOW_CHAOS: {
    id: 'RAINBOW_CHAOS',
    name: 'Rainbow Chaos',
    description: 'Mix of all families for unpredictable effects',
    detectionRules: [
      {
        type: 'custom',
        condition: 'unique_families',
        count: 5,
        operator: '>='
      }
    ],
    bonuses: [
      {
        type: 'special',
        value: 0.4,
        isPercentage: false,
        target: 'self',
        description: '40% chance for random powerful effect'
      },
      {
        type: 'luck',
        value: 100,
        isPercentage: true,
        target: 'self',
        description: '+100% luck from diversity'
      }
    ],
    minThreshold: 5,
    maxThreshold: 10,
    stackable: true
  }
};

export class SynergySystem {
  // Main detection function
  static detectSynergies(deck: Card[]): SynergyDetectionResult {
    const activeSynergies: ActiveSynergy[] = [];
    const potentialSynergies: PotentialSynergy[] = [];

    // Analyze each synergy type
    for (const [synergyId, synergyType] of Object.entries(SYNERGY_TYPES)) {
      const analysis = this.analyzeSynergy(deck, synergyType);
      
      if (analysis.isActive) {
        activeSynergies.push({
          synergyId,
          level: analysis.level,
          bonuses: this.calculateBonuses(synergyType, analysis.level),
          triggeringCards: analysis.triggeringCards,
          strength: analysis.strength
        });
      } else if (analysis.potential > 0) {
        potentialSynergies.push({
          synergyId,
          currentCount: analysis.currentCount,
          requiredCount: synergyType.minThreshold,
          missingElements: analysis.missingElements,
          description: `Need ${synergyType.minThreshold - analysis.currentCount} more for ${synergyType.name}`
        });
      }
    }

    const deckStats = this.calculateDeckStats(deck, activeSynergies);

    return {
      activeSynergies,
      potentialSynergies,
      deckStats
    };
  }

  // Analyze single synergy against deck
  private static analyzeSynergy(deck: Card[], synergyType: SynergyType): SynergyAnalysis {
    let currentCount = 0;
    const triggeringCards: string[] = [];
    const missingElements: string[] = [];

    // Check each rule
    for (const rule of synergyType.detectionRules) {
      const ruleResult = this.checkRule(deck, rule);
      
      if (ruleResult.satisfied) {
        currentCount += ruleResult.contribution;
        triggeringCards.push(...ruleResult.cardIds);
      } else {
        missingElements.push(...ruleResult.missing);
      }
    }

    // Determine if synergy is active
    const isActive = currentCount >= synergyType.minThreshold;
    const level = Math.min(
      Math.floor(currentCount / synergyType.minThreshold),
      Math.floor(synergyType.maxThreshold / synergyType.minThreshold)
    );
    const strength = Math.min(currentCount / synergyType.maxThreshold, 1);
    const potential = currentCount / synergyType.minThreshold;

    return {
      isActive,
      level: isActive ? level : 0,
      currentCount,
      strength,
      potential,
      triggeringCards: [...new Set(triggeringCards)],
      missingElements: [...new Set(missingElements)]
    };
  }

  // Check individual synergy rule
  private static checkRule(deck: Card[], rule: SynergyRule): RuleResult {
    let matchingCards: string[] = [];
    let count = 0;

    switch (rule.type) {
      case 'family':
        matchingCards = deck
          .filter(card => card.family === rule.condition)
          .map(card => card.id);
        count = matchingCards.length;
        break;

      case 'emoji':
        matchingCards = deck
          .filter(card => 
            card.emojis?.some(emoji => emoji.character === rule.condition) ||
            card.emoji === rule.condition
          )
          .map(card => card.id);
        count = matchingCards.length;
        break;

      case 'effect':
        matchingCards = deck
          .filter(card => 
            card.cardEffects?.some(effect => effect.effect === rule.condition)
          )
          .map(card => card.id);
        count = matchingCards.length;
        break;

      case 'rarity':
        matchingCards = deck
          .filter(card => card.rarity === rule.value)
          .map(card => card.id);
        count = matchingCards.length;
        break;

      case 'stat':
        if (rule.condition === 'luck') {
          const totalLuck = deck.reduce((sum, card) => sum + card.luck, 0);
          count = totalLuck;
        } else if (rule.condition === 'hp') {
          const totalHp = deck.reduce((sum, card) => sum + (card.hp || 100), 0);
          count = totalHp;
        }
        matchingCards = count >= (rule.value || 0) ? deck.map(card => card.id) : [];
        break;

      case 'custom':
        if (rule.condition === 'unique_families') {
          const uniqueFamilies = new Set(deck.map(card => card.family));
          count = uniqueFamilies.size;
          matchingCards = count >= (rule.count || 0) ? deck.map(card => card.id) : [];
        }
        break;
    }

    // Check if rule is satisfied
    const requiredCount = rule.count || 1;
    const operator = rule.operator || '>=';
    let satisfied = false;

    switch (operator) {
      case '>=': satisfied = count >= requiredCount; break;
      case '<=': satisfied = count <= requiredCount; break;
      case '>': satisfied = count > requiredCount; break;
      case '<': satisfied = count < requiredCount; break;
      case '=': satisfied = count === requiredCount; break;
      default: satisfied = count >= requiredCount;
    }

    const missing = satisfied ? [] : [`Need ${requiredCount - count} more ${rule.condition}`];

    return {
      satisfied,
      contribution: satisfied ? count : 0,
      cardIds: satisfied ? matchingCards : [],
      missing
    };
  }

  // Calculate bonuses based on synergy level
  private static calculateBonuses(synergyType: SynergyType, level: number): SynergyBonus[] {
    return synergyType.bonuses.map(bonus => ({
      ...bonus,
      value: bonus.value * (synergyType.stackable ? level : 1)
    }));
  }

  // Calculate overall deck statistics
  private static calculateDeckStats(deck: Card[], synergies: ActiveSynergy[]): DeckSynergyStats {
    const familyCounts = deck.reduce((acc, card) => {
      acc[card.family] = (acc[card.family] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantFamily = Object.entries(familyCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as MemeFamily;

    const totalSynergies = synergies.length;
    const synergyStrength = synergies.reduce((sum, s) => sum + s.strength, 0) / Math.max(totalSynergies, 1);

    // Determine deck archetype
    let deckArchetype = 'Balanced';
    if (synergies.find(s => s.synergyId === 'FORCE_BUILD')) {
      deckArchetype = 'Aggro';
    } else if (synergies.find(s => s.synergyId === 'TANK_BUILD')) {
      deckArchetype = 'Control';
    } else if (synergies.find(s => s.synergyId === 'LUCK_BUILD')) {
      deckArchetype = 'RNG';
    } else if (synergies.find(s => s.synergyId === 'RAINBOW_CHAOS')) {
      deckArchetype = 'Chaos';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (totalSynergies === 0) {
      recommendations.push('Consider focusing on a specific synergy for bonuses');
    }
    if (synergyStrength < 0.5) {
      recommendations.push('Add more cards that support your synergies');
    }
    if (Object.keys(familyCounts).length > 6) {
      recommendations.push('Too many families - consider focusing for stronger synergies');
    }

    return {
      totalSynergies,
      synergyStrength,
      dominantFamily,
      deckArchetype,
      recommendations
    };
  }

  // Get synergy recommendations for a deck
  static getSynergyRecommendations(deck: Card[]): SynergyRecommendation[] {
    const result = this.detectSynergies(deck);
    const recommendations: SynergyRecommendation[] = [];

    // Recommend improving potential synergies
    for (const potential of result.potentialSynergies) {
      if (potential.currentCount / potential.requiredCount >= 0.6) {
        recommendations.push({
          type: 'improve_existing',
          synergyId: potential.synergyId,
          priority: 'high',
          description: `You're close to ${SYNERGY_TYPES[potential.synergyId].name}! ${potential.missingElements[0]}`,
          suggestedCards: this.getSuggestedCards(potential.synergyId, deck)
        });
      }
    }

    // Recommend new synergies based on existing cards
    const unusedCards = this.findUnusedCards(deck, result.activeSynergies);
    if (unusedCards.length >= 3) {
      recommendations.push({
        type: 'new_synergy',
        synergyId: 'RAINBOW_CHAOS',
        priority: 'medium',
        description: 'Consider diversifying for Rainbow Chaos synergy',
        suggestedCards: []
      });
    }

    return recommendations;
  }

  // Helper methods
  private static getSuggestedCards(synergyId: string, currentDeck: Card[]): string[] {
    // This would integrate with card database to suggest specific cards
    return [`Suggested cards for ${synergyId}`];
  }

  private static findUnusedCards(deck: Card[], synergies: ActiveSynergy[]): Card[] {
    const usedCardIds = new Set(
      synergies.flatMap(s => s.triggeringCards)
    );
    return deck.filter(card => !usedCardIds.has(card.id));
  }
}

// Supporting interfaces
interface SynergyAnalysis {
  isActive: boolean;
  level: number;
  currentCount: number;
  strength: number;
  potential: number;
  triggeringCards: string[];
  missingElements: string[];
}

interface RuleResult {
  satisfied: boolean;
  contribution: number;
  cardIds: string[];
  missing: string[];
}

export interface SynergyRecommendation {
  type: 'improve_existing' | 'new_synergy' | 'optimize';
  synergyId: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  suggestedCards: string[];
}

export default SynergySystem;