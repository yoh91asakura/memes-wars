// AI Matchmaking Service - Generate AI opponents based on stage data
// Creates balanced AI decks with appropriate difficulty for each stage

import { Stage } from '../data/stages';
import { Card } from '../models';
import { Deck } from '../models/Deck';

export interface AIOpponent {
  id: string;
  name: string;
  deck: Deck;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  behavior: AIBehavior;
  health: number;
  maxHealth: number;
}

export interface AIBehavior {
  aggressiveness: number; // 0-1 scale
  accuracyBonus: number; // -0.2 to +0.3
  reactionTime: number; // milliseconds
  emojiPreference: string[]; // Preferred emojis to use
  specialTactics?: string[]; // Special behaviors
}

export interface AIDeckTemplate {
  name: string;
  emojis: string[];
  rarityDistribution: {
    common: number;
    rare: number;
    epic: number;
    legendary?: number;
  };
  synergies?: string[];
  theme: string;
}

export class AIMatchmakingService {
  private difficultyTemplates: Record<string, AIDeckTemplate[]> = {
    easy: [
      {
        name: 'Newbie Fighter',
        emojis: ['😈', '🔥'],
        rarityDistribution: { common: 0.9, rare: 0.1, epic: 0 },
        theme: 'basic'
      },
      {
        name: 'Simple Smasher',
        emojis: ['💥', '👊'],
        rarityDistribution: { common: 0.8, rare: 0.2, epic: 0 },
        theme: 'physical'
      }
    ],
    medium: [
      {
        name: 'Elemental Mage',
        emojis: ['🔥', '❄️', '⚡'],
        rarityDistribution: { common: 0.6, rare: 0.3, epic: 0.1 },
        synergies: ['elemental'],
        theme: 'magic'
      },
      {
        name: 'Tactical Fighter',
        emojis: ['🎯', '🛡️', '⚔️'],
        rarityDistribution: { common: 0.5, rare: 0.4, epic: 0.1 },
        synergies: ['defensive'],
        theme: 'strategy'
      }
    ],
    hard: [
      {
        name: 'Storm Master',
        emojis: ['⚡', '🌪️', '⚡'],
        rarityDistribution: { common: 0.3, rare: 0.5, epic: 0.2 },
        synergies: ['storm', 'speed'],
        theme: 'elemental'
      },
      {
        name: 'Shadow Assassin',
        emojis: ['👻', '🔮', '💀'],
        rarityDistribution: { common: 0.2, rare: 0.6, epic: 0.2 },
        synergies: ['dark', 'stealth'],
        theme: 'dark'
      }
    ],
    boss: [
      {
        name: 'Ancient Guardian',
        emojis: ['🗿', '💎', '🛡️', '⚡'],
        rarityDistribution: { common: 0.1, rare: 0.4, epic: 0.4, legendary: 0.1 },
        synergies: ['defensive', 'ancient'],
        theme: 'guardian'
      },
      {
        name: 'Chaos Lord',
        emojis: ['🔮', '✨', '💥', '🌟'],
        rarityDistribution: { common: 0, rare: 0.3, epic: 0.5, legendary: 0.2 },
        synergies: ['chaos', 'magic'],
        theme: 'chaos'
      }
    ]
  };

  // Generate AI opponent for a specific stage
  generateOpponent(stage: Stage, playerLevel: number = 1): AIOpponent {
    const template = this.selectTemplate(stage);
    const deck = this.generateDeck(template, stage.deckSizeLimit, stage.id);
    const behavior = this.generateBehavior(stage.enemyDifficulty);
    
    // Calculate health based on stage and difficulty
    const baseHealth = this.calculateBaseHealth(stage, playerLevel);
    
    return {
      id: `ai_${stage.id}_${Date.now()}`,
      name: template.name,
      deck,
      difficulty: stage.enemyDifficulty,
      behavior,
      health: baseHealth,
      maxHealth: baseHealth
    };
  }

  // Select appropriate template based on stage
  private selectTemplate(stage: Stage): AIDeckTemplate {
    const templates = this.difficultyTemplates[stage.enemyDifficulty];
    
    if (!templates || templates.length === 0) {
      // Fallback to easy templates
      return this.difficultyTemplates.easy[0];
    }

    // For bosses, prefer thematic templates
    if (stage.isBoss) {
      const bossTemplates = templates.filter(t => 
        t.synergies && t.synergies.length > 0
      );
      if (bossTemplates.length > 0) {
        return bossTemplates[Math.floor(Math.random() * bossTemplates.length)];
      }
    }

    // Random selection for non-boss stages
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Generate AI deck based on template
  private generateDeck(template: AIDeckTemplate, deckSizeLimit: number, stageId: number): Deck {
    const cards: Card[] = [];
    
    // Generate cards based on template
    for (let i = 0; i < deckSizeLimit; i++) {
      const card = this.generateCard(template, i, stageId);
      cards.push(card);
    }

    return {
      id: `ai_deck_${stageId}_${Date.now()}`,
      name: `${template.name} Deck`,
      cards,
      isValid: true,
      totalCost: cards.reduce((sum, card) => sum + card.manaCost, 0),
      averageCost: cards.reduce((sum, card) => sum + card.manaCost, 0) / cards.length,
      synergies: template.synergies || [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
  }

  // Generate individual card for AI
  private generateCard(template: AIDeckTemplate, index: number, stageId: number): Card {
    const emoji = template.emojis[index % template.emojis.length];
    const rarity = this.selectRarity(template.rarityDistribution);
    
    // Base stats adjusted by rarity and stage
    const baseStats = this.getBaseStats(rarity, stageId);
    
    return {
      id: `ai_card_${stageId}_${index}_${Date.now()}`,
      name: `${template.name} ${emoji}`,
      rarity: rarity as any,
      memeFamily: 'AI_GENERATED' as any,
      emojis: [emoji],
      health: baseStats.health,
      attackDamage: baseStats.damage,
      attackSpeed: baseStats.speed,
      manaCost: baseStats.cost,
      flavor: `Generated AI card for stage ${stageId}`,
      imageUrl: '',
      unlockStage: stageId,
      luck: 1,
      family: 'ai' as any,
      reference: `AI ${template.theme}`,
      stackLevel: 1,
      inventory: []
    };
  }

  // Select rarity based on distribution
  private selectRarity(distribution: AIDeckTemplate['rarityDistribution']): string {
    const rand = Math.random();
    let cumulative = 0;

    if (distribution.legendary) {
      cumulative += distribution.legendary;
      if (rand < cumulative) return 'legendary';
    }

    cumulative += distribution.epic;
    if (rand < cumulative) return 'epic';

    cumulative += distribution.rare;
    if (rand < cumulative) return 'rare';

    return 'common';
  }

  // Get base stats for card based on rarity and stage
  private getBaseStats(rarity: string, stageId: number): {
    health: number;
    damage: number;
    speed: number;
    cost: number;
  } {
    const stageMultiplier = 1 + (stageId - 1) * 0.1;
    
    const rarityMultipliers = {
      common: { health: 100, damage: 20, speed: 1.0, cost: 2 },
      rare: { health: 150, damage: 30, speed: 1.1, cost: 3 },
      epic: { health: 200, damage: 40, speed: 1.2, cost: 4 },
      legendary: { health: 300, damage: 60, speed: 1.3, cost: 5 }
    };

    const base = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || rarityMultipliers.common;

    return {
      health: Math.floor(base.health * stageMultiplier),
      damage: Math.floor(base.damage * stageMultiplier),
      speed: Math.round((base.speed * stageMultiplier) * 10) / 10,
      cost: Math.max(1, Math.floor(base.cost * Math.min(stageMultiplier, 2)))
    };
  }

  // Generate AI behavior based on difficulty
  private generateBehavior(difficulty: 'easy' | 'medium' | 'hard' | 'boss'): AIBehavior {
    const behaviorProfiles = {
      easy: {
        aggressiveness: 0.3,
        accuracyBonus: -0.2,
        reactionTime: 1500,
        emojiPreference: ['😈', '🔥', '💥']
      },
      medium: {
        aggressiveness: 0.6,
        accuracyBonus: 0,
        reactionTime: 1000,
        emojiPreference: ['⚡', '🎯', '🛡️']
      },
      hard: {
        aggressiveness: 0.8,
        accuracyBonus: 0.1,
        reactionTime: 750,
        emojiPreference: ['💀', '🌪️', '⚔️'],
        specialTactics: ['focus_fire', 'evasive_maneuvers']
      },
      boss: {
        aggressiveness: 0.9,
        accuracyBonus: 0.3,
        reactionTime: 500,
        emojiPreference: ['🗿', '💎', '🔮', '✨'],
        specialTactics: ['adaptive_strategy', 'power_phases', 'ultimate_attacks']
      }
    };

    return behaviorProfiles[difficulty];
  }

  // Calculate base health for AI based on stage
  private calculateBaseHealth(stage: Stage, playerLevel: number): number {
    // Base health from stage definition
    let baseHealth = stage.enemyHp;
    
    // Adjust for player level
    const levelMultiplier = 1 + (playerLevel - 1) * 0.05;
    baseHealth = Math.floor(baseHealth * levelMultiplier);
    
    // Boss multiplier
    if (stage.isBoss) {
      baseHealth = Math.floor(baseHealth * 1.5);
    }
    
    // Special stage multiplier
    if (stage.isSpecial) {
      baseHealth = Math.floor(baseHealth * 1.2);
    }
    
    return Math.max(100, baseHealth);
  }

  // Get opponent preview for stage selection
  getOpponentPreview(stage: Stage): {
    name: string;
    difficulty: string;
    expectedHealth: number;
    mainEmojis: string[];
    specialAbilities: string[];
  } {
    const template = this.selectTemplate(stage);
    
    return {
      name: template.name,
      difficulty: stage.enemyDifficulty,
      expectedHealth: this.calculateBaseHealth(stage, 1),
      mainEmojis: template.emojis,
      specialAbilities: template.synergies || []
    };
  }

  // Generate multiple opponents for tournament mode (future feature)
  generateTournamentBracket(stages: Stage[], playerLevel: number = 1): AIOpponent[] {
    return stages.map(stage => this.generateOpponent(stage, playerLevel));
  }

  // Validate AI opponent strength vs player
  validateOpponentBalance(opponent: AIOpponent, playerDeck: Deck): {
    balanced: boolean;
    powerRatio: number;
    recommendations: string[];
  } {
    // Calculate power levels
    const playerPower = this.calculateDeckPower(playerDeck);
    const aiPower = this.calculateAIPower(opponent);
    
    const powerRatio = aiPower / playerPower;
    const balanced = powerRatio >= 0.8 && powerRatio <= 1.2;
    
    const recommendations: string[] = [];
    if (powerRatio < 0.8) {
      recommendations.push('AI is too weak - consider increasing stage difficulty');
    } else if (powerRatio > 1.2) {
      recommendations.push('AI is too strong - consider reducing stage difficulty');
    }

    return {
      balanced,
      powerRatio,
      recommendations
    };
  }

  // Calculate deck power level
  private calculateDeckPower(deck: Deck): number {
    return deck.cards.reduce((power, card) => {
      const rarityMultiplier = this.getRarityMultiplier(card.rarity as string);
      return power + (card.health + card.attackDamage) * rarityMultiplier;
    }, 0);
  }

  // Calculate AI power level
  private calculateAIPower(opponent: AIOpponent): number {
    const deckPower = this.calculateDeckPower(opponent.deck);
    const behaviorMultiplier = 1 + opponent.behavior.aggressiveness * 0.5;
    const healthMultiplier = opponent.health / 1000;
    
    return deckPower * behaviorMultiplier * healthMultiplier;
  }

  // Get rarity multiplier for power calculation
  private getRarityMultiplier(rarity: string): number {
    const multipliers = {
      common: 1,
      rare: 1.5,
      epic: 2.5,
      legendary: 4,
      mythic: 6,
      cosmic: 10
    };
    
    return multipliers[rarity as keyof typeof multipliers] || 1;
  }
}

// Singleton instance
let aiMatchmakingInstance: AIMatchmakingService | null = null;

export function getAIMatchmakingService(): AIMatchmakingService {
  if (!aiMatchmakingInstance) {
    aiMatchmakingInstance = new AIMatchmakingService();
  }
  return aiMatchmakingInstance;
}