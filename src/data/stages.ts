// Stage System - Game Progression with Deck Limits
// Implementation based on CLAUDE.md Phase 1 specifications

export interface Stage {
  id: number;
  name: string;
  description: string;
  
  // Enemy Configuration
  enemyHp: number;
  enemyEmojis: string[];
  enemyAttackSpeed: number;
  enemyDifficulty: 'easy' | 'medium' | 'hard' | 'boss' | 'special';
  
  // Rewards
  goldReward: number;
  ticketsReward: number;
  bonusRewards?: string[];
  
  // Progression Requirements
  unlockRequirement?: {
    previousStage?: number;
    playerLevel?: number;
    cardsCollected?: number;
  };
  
  // Deck Constraints
  deckSizeLimit: number;
  
  // Special Properties
  isBoss: boolean;
  isSpecial: boolean;
  specialRules?: string[];
  
  // Visual
  background: string;
  theme: string;
}

export interface StageProgression {
  stageNumber: number;
  deckSizeLimit: number;
  enemyHpMultiplier: number;
  goldMultiplier: number;
  difficultyTier: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
}

// Stage progression system as specified in CLAUDE.md
export const STAGE_PROGRESSION: StageProgression[] = [
  // Stages 1-10: Beginner tier
  ...Array.from({ length: 10 }, (_, i) => ({
    stageNumber: i + 1,
    deckSizeLimit: 3,
    enemyHpMultiplier: 1 + i * 0.1,
    goldMultiplier: 1,
    difficultyTier: 'beginner' as const
  })),
  
  // Stages 11-25: Intermediate tier  
  ...Array.from({ length: 15 }, (_, i) => ({
    stageNumber: i + 11,
    deckSizeLimit: 4,
    enemyHpMultiplier: 2 + i * 0.15,
    goldMultiplier: 1.25,
    difficultyTier: 'intermediate' as const
  })),
  
  // Stages 26-50: Advanced tier
  ...Array.from({ length: 25 }, (_, i) => ({
    stageNumber: i + 26,
    deckSizeLimit: 5,
    enemyHpMultiplier: 3.25 + i * 0.2,
    goldMultiplier: 1.5,
    difficultyTier: 'advanced' as const
  })),
  
  // Stages 51-100: Expert tier
  ...Array.from({ length: 50 }, (_, i) => ({
    stageNumber: i + 51,
    deckSizeLimit: 6,
    enemyHpMultiplier: 8.25 + i * 0.25,
    goldMultiplier: 2,
    difficultyTier: 'expert' as const
  })),
  
  // Stages 101+: Master tier
  ...Array.from({ length: 100 }, (_, i) => ({
    stageNumber: i + 101,
    deckSizeLimit: 7,
    enemyHpMultiplier: 20.75 + i * 0.5,
    goldMultiplier: 3,
    difficultyTier: 'master' as const
  }))
];

// Detailed stage definitions for first 50 stages
export const STAGES: Stage[] = [
  // Tutorial/Beginner Stages (1-10)
  {
    id: 1,
    name: "First Meme",
    description: "Your very first opponent - a lonely troll",
    enemyHp: 100,
    enemyEmojis: ['😈'],
    enemyAttackSpeed: 0.8,
    enemyDifficulty: 'easy',
    goldReward: 75,
    ticketsReward: 1,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: false,
    background: 'tutorial',
    theme: 'internet_classic'
  },
  
  {
    id: 2,
    name: "Flaming Rage",
    description: "Face the fury of fire and anger",
    enemyHp: 110,
    enemyEmojis: ['🔥', '😡'],
    enemyAttackSpeed: 0.9,
    enemyDifficulty: 'easy',
    goldReward: 80,
    ticketsReward: 1,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: false,
    background: 'fire',
    theme: 'elements'
  },
  
  {
    id: 3,
    name: "Grumpy Winds",
    description: "Grumpy cats ride the winds of change",
    enemyHp: 125,
    enemyEmojis: ['😾', '💨'],
    enemyAttackSpeed: 1.0,
    enemyDifficulty: 'easy',
    goldReward: 60,
    ticketsReward: 1,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: false,
    background: 'windy',
    theme: 'animals'
  },
  
  {
    id: 4,
    name: "Shocking Discovery",
    description: "Lightning strikes with electric surprises",
    enemyHp: 140,
    enemyEmojis: ['⚡', '⚡'],
    enemyAttackSpeed: 1.1,
    enemyDifficulty: 'easy',
    goldReward: 65,
    ticketsReward: 1,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: false,
    background: 'storm',
    theme: 'elements'
  },
  
  {
    id: 5,
    name: "Forever Defensive",
    description: "A fortress of loneliness and shields",
    enemyHp: 160,
    enemyEmojis: ['😔', '🛡️'],
    enemyAttackSpeed: 0.7,
    enemyDifficulty: 'medium',
    goldReward: 70,
    ticketsReward: 1,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: false,
    background: 'fortress',
    theme: 'emotions'
  },
  
  {
    id: 6,
    name: "Explosive Combo",
    description: "When destruction meets precision",
    enemyHp: 180,
    enemyEmojis: ['💥', '🎯'],
    enemyAttackSpeed: 1.2,
    enemyDifficulty: 'medium',
    goldReward: 75,
    ticketsReward: 2,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: false,
    background: 'battlefield',
    theme: 'combat'
  },
  
  {
    id: 7,
    name: "Frozen Flames",
    description: "Ice meets fire in an eternal dance",
    enemyHp: 200,
    enemyEmojis: ['❄️', '🔥', '❄️'],
    enemyAttackSpeed: 1.0,
    enemyDifficulty: 'medium',
    goldReward: 80,
    ticketsReward: 2,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: false,
    background: 'ice_fire',
    theme: 'elements'
  },
  
  {
    id: 8,
    name: "Perfect Aim",
    description: "When every shot counts",
    enemyHp: 220,
    enemyEmojis: ['🎯', '🎯', '💯'],
    enemyAttackSpeed: 1.3,
    enemyDifficulty: 'medium',
    goldReward: 85,
    ticketsReward: 2,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: false,
    background: 'target_range',
    theme: 'precision'
  },
  
  {
    id: 9,
    name: "Healing Waters",
    description: "Life flows through emerald streams",
    enemyHp: 180, // Lower HP but heals
    enemyEmojis: ['💚', '💚', '🌊'],
    enemyAttackSpeed: 0.9,
    enemyDifficulty: 'medium',
    goldReward: 90,
    ticketsReward: 2,
    deckSizeLimit: 3,
    isBoss: false,
    isSpecial: true,
    specialRules: ['enemy_heals_over_time'],
    background: 'healing_springs',
    theme: 'nature'
  },
  
  {
    id: 10,
    name: "Stone Guardian",
    description: "The first boss - an ancient stone sentinel",
    enemyHp: 400,
    enemyEmojis: ['🗿', '🗿', '🛡️', '💎'],
    enemyAttackSpeed: 0.8,
    enemyDifficulty: 'boss',
    goldReward: 200,
    ticketsReward: 5,
    bonusRewards: ['rare_card_guarantee'],
    deckSizeLimit: 3,
    isBoss: true,
    isSpecial: true,
    specialRules: ['double_health', 'defensive_bonus'],
    background: 'ancient_temple',
    theme: 'boss_earth'
  },
  
  // Intermediate Stages (11-25) - Deck Size 4
  {
    id: 11,
    name: "Trickster's Gambit",
    description: "Chaos reigns in this unpredictable battle",
    enemyHp: 300,
    enemyEmojis: ['😈', '🔮', '😏'],
    enemyAttackSpeed: 1.1,
    enemyDifficulty: 'medium',
    goldReward: 125,
    ticketsReward: 2,
    deckSizeLimit: 4,
    isBoss: false,
    isSpecial: false,
    background: 'chaos_realm',
    theme: 'trickster'
  },
  
  {
    id: 12,
    name: "Speed Demon",
    description: "Fast attacks that blur the screen",
    enemyHp: 280,
    enemyEmojis: ['🚀', '💨', '⚡'],
    enemyAttackSpeed: 1.8,
    enemyDifficulty: 'medium',
    goldReward: 130,
    ticketsReward: 2,
    deckSizeLimit: 4,
    isBoss: false,
    isSpecial: false,
    background: 'speed_track',
    theme: 'velocity'
  },
  
  {
    id: 15,
    name: "Elemental Fusion",
    description: "All elements combine in perfect harmony",
    enemyHp: 350,
    enemyEmojis: ['🔥', '❄️', '⚡', '🌊', '🌪️'],
    enemyAttackSpeed: 1.2,
    enemyDifficulty: 'hard',
    goldReward: 150,
    ticketsReward: 3,
    deckSizeLimit: 4,
    isBoss: false,
    isSpecial: true,
    specialRules: ['elemental_weakness_cycle'],
    background: 'elemental_nexus',
    theme: 'elements'
  },
  
  {
    id: 20,
    name: "Mirror Master",
    description: "Your own attacks reflected back",
    enemyHp: 400,
    enemyEmojis: ['🌈', '🔮'],
    enemyAttackSpeed: 1.0,
    enemyDifficulty: 'hard',
    goldReward: 200,
    ticketsReward: 3,
    deckSizeLimit: 4,
    isBoss: false,
    isSpecial: true,
    specialRules: ['reflects_projectiles'],
    background: 'hall_of_mirrors',
    theme: 'reflection'
  },
  
  {
    id: 25,
    name: "Chaos Dragon",
    description: "Second boss - A dragon of pure chaos",
    enemyHp: 800,
    enemyEmojis: ['🔮', '✨', '💥', '🌪️', '💎'],
    enemyAttackSpeed: 1.3,
    enemyDifficulty: 'boss',
    goldReward: 500,
    ticketsReward: 8,
    bonusRewards: ['epic_card_guarantee', 'lucky_charm'],
    deckSizeLimit: 4,
    isBoss: true,
    isSpecial: true,
    specialRules: ['random_effects', 'phases', 'spell_immunity'],
    background: 'chaos_dimension',
    theme: 'boss_chaos'
  },
  
  // Advanced Stages (26-50) - Deck Size 5
  {
    id: 30,
    name: "Death's Embrace",
    description: "Face the void itself",
    enemyHp: 600,
    enemyEmojis: ['💀', '👻', '🔮'],
    enemyAttackSpeed: 1.0,
    enemyDifficulty: 'hard',
    goldReward: 300,
    ticketsReward: 4,
    deckSizeLimit: 5,
    isBoss: false,
    isSpecial: true,
    specialRules: ['life_drain', 'resurrection'],
    background: 'underworld',
    theme: 'death'
  },
  
  {
    id: 40,
    name: "Stellar Bombardment",
    description: "Stars rain down from above",
    enemyHp: 800,
    enemyEmojis: ['🌟', '⭐', '✨', '💫'],
    enemyAttackSpeed: 1.4,
    enemyDifficulty: 'hard',
    goldReward: 400,
    ticketsReward: 5,
    deckSizeLimit: 5,
    isBoss: false,
    isSpecial: true,
    specialRules: ['starfall', 'cosmic_damage'],
    background: 'cosmic_void',
    theme: 'cosmic'
  },
  
  {
    id: 50,
    name: "The Infinity Beast",
    description: "Third major boss - Infinite power",
    enemyHp: 1500,
    enemyEmojis: ['💎', '🌟', '✨', '🔮', '💫', '🌈'],
    enemyAttackSpeed: 1.5,
    enemyDifficulty: 'boss',
    goldReward: 1000,
    ticketsReward: 15,
    bonusRewards: ['legendary_card_guarantee', 'power_crystal', 'deck_slot_upgrade'],
    deckSizeLimit: 5,
    isBoss: true,
    isSpecial: true,
    specialRules: ['infinite_regeneration', 'power_phases', 'ultimate_attacks'],
    background: 'infinity_realm',
    theme: 'boss_infinity'
  }
];

// Stage Management System
export class StageManager {
  // Get stage by ID
  static getStage(stageId: number): Stage | undefined {
    return STAGES.find(stage => stage.id === stageId);
  }
  
  // Get deck size limit for stage
  static getDeckSizeLimit(stageNumber: number): number {
    const progression = STAGE_PROGRESSION.find(p => p.stageNumber === stageNumber);
    return progression?.deckSizeLimit || 3;
  }
  
  // Get difficulty progression
  static getDifficultyProgression(stageNumber: number): StageProgression | undefined {
    return STAGE_PROGRESSION.find(p => p.stageNumber === stageNumber);
  }
  
  // Check if stage is unlocked
  static isStageUnlocked(stageId: number, playerProgress: PlayerProgress): boolean {
    const stage = this.getStage(stageId);
    if (!stage) return false;
    
    // Stage 1 is always unlocked
    if (stageId === 1) return true;
    
    // Check previous stage completion
    if (stage.unlockRequirement?.previousStage) {
      const previousCompleted = playerProgress.completedStages.includes(stage.unlockRequirement.previousStage);
      if (!previousCompleted) return false;
    }
    
    // Check player level requirement
    if (stage.unlockRequirement?.playerLevel) {
      if (playerProgress.level < stage.unlockRequirement.playerLevel) return false;
    }
    
    // Check cards collected requirement
    if (stage.unlockRequirement?.cardsCollected) {
      if (playerProgress.cardsCollected < stage.unlockRequirement.cardsCollected) return false;
    }
    
    return true;
  }
  
  // Get available stages for player
  static getAvailableStages(playerProgress: PlayerProgress): Stage[] {
    return STAGES.filter(stage => this.isStageUnlocked(stage.id, playerProgress));
  }
  
  // Get next stage to unlock
  static getNextStageToUnlock(playerProgress: PlayerProgress): Stage | undefined {
    return STAGES.find(stage => !this.isStageUnlocked(stage.id, playerProgress));
  }
  
  // Calculate stage rewards with bonuses
  static calculateRewards(stage: Stage, playerBonuses: RewardBonuses = {}): StageRewards {
    const goldMultiplier = playerBonuses.goldMultiplier || 1;
    const ticketMultiplier = playerBonuses.ticketMultiplier || 1;
    
    return {
      gold: Math.floor(stage.goldReward * goldMultiplier),
      tickets: Math.floor(stage.ticketsReward * ticketMultiplier),
      bonusRewards: stage.bonusRewards || []
    };
  }
  
  // Get boss stages
  static getBossStages(): Stage[] {
    return STAGES.filter(stage => stage.isBoss);
  }
  
  // Get special stages
  static getSpecialStages(): Stage[] {
    return STAGES.filter(stage => stage.isSpecial && !stage.isBoss);
  }
  
  // Get stages by difficulty
  static getStagesByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'boss'): Stage[] {
    return STAGES.filter(stage => stage.enemyDifficulty === difficulty);
  }
  
  // Generate procedural stages beyond defined ones
  static generateProceduralStage(stageNumber: number): Stage {
    const progression = this.getDifficultyProgression(stageNumber);
    if (!progression) {
      throw new Error(`No progression data for stage ${stageNumber}`);
    }
    
    // Base procedural stage
    const baseHp = 100 * progression.enemyHpMultiplier;
    const isBoss = stageNumber % 25 === 0;
    const isSpecial = stageNumber % 10 === 0 && !isBoss;
    
    return {
      id: stageNumber,
      name: `Procedural Stage ${stageNumber}`,
      description: `Auto-generated challenge at tier ${progression.difficultyTier}`,
      enemyHp: Math.floor(baseHp * (isBoss ? 2 : 1)),
      enemyEmojis: this.generateRandomEmojis(progression.difficultyTier),
      enemyAttackSpeed: 1.0 + (stageNumber * 0.01),
      enemyDifficulty: isBoss ? 'boss' : 'hard',
      goldReward: Math.floor(100 * progression.goldMultiplier * (isBoss ? 3 : 1)),
      ticketsReward: Math.floor(2 * progression.goldMultiplier * (isBoss ? 2 : 1)),
      deckSizeLimit: progression.deckSizeLimit,
      isBoss,
      isSpecial,
      background: this.getRandomBackground(progression.difficultyTier),
      theme: this.getRandomTheme()
    };
  }
  
  // Helper methods for procedural generation
  private static generateRandomEmojis(tier: string): string[] {
    const emojiPools = {
      beginner: ['🔥', '💨', '💥', '😈'],
      intermediate: ['⚡', '❄️', '🎯', '💯', '🛡️'],
      advanced: ['🌟', '💎', '🌊', '🌪️', '👻'],
      expert: ['✨', '🔮', '💫', '🌈', '💀'],
      master: ['🌟', '💎', '✨', '🔮', '💫', '🌈']
    };
    
    const pool = emojiPools[tier as keyof typeof emojiPools] || emojiPools.beginner;
    const count = Math.min(2 + Math.floor(Math.random() * 4), pool.length);
    
    return pool.sort(() => Math.random() - 0.5).slice(0, count);
  }
  
  private static getRandomBackground(tier: string): string {
    const backgrounds = {
      beginner: ['grassland', 'forest', 'plains'],
      intermediate: ['mountains', 'desert', 'ocean'],
      advanced: ['volcano', 'tundra', 'jungle'],
      expert: ['abyss', 'celestial', 'void'],
      master: ['cosmic', 'infinity', 'beyond']
    };
    
    const pool = backgrounds[tier as keyof typeof backgrounds] || backgrounds.beginner;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  private static getRandomTheme(): string {
    const themes = ['classic', 'elemental', 'cosmic', 'nature', 'tech', 'magic'];
    return themes[Math.floor(Math.random() * themes.length)];
  }
}

// Supporting types
export interface PlayerProgress {
  level: number;
  completedStages: number[];
  cardsCollected: number;
  currentStage: number;
  highestStage: number;
}

export interface RewardBonuses {
  goldMultiplier?: number;
  ticketMultiplier?: number;
  experienceMultiplier?: number;
}

export interface StageRewards {
  gold: number;
  tickets: number;
  bonusRewards: string[];
}

// Export for use in game systems
export default STAGES;