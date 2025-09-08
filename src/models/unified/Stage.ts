// Unified Stage Model - Aligned with Data Model Specification
// Follows specs/001-extract-current-project/data-model.md

// Stage interface aligned with data-model.md specification
export interface Stage {
  id: number;                 // Stage number (1, 2, 3...)
  name: string;              // Display name
  enemyHealth: number;       // Base HP of stage enemy
  enemyEmojis: string[];     // Enemy attack patterns
  enemyAttackSpeed: number;  // Enemy attacks per second
  rewardCoins: number;       // Currency reward
  rewardTickets: number;     // Roll ticket reward
  bossStage: boolean;        // Special boss encounter
  unlockRequirement?: string; // Description of unlock condition
  specialRule?: string;      // Stage-specific mechanics
  backgroundTheme: string;   // Visual theme
}

// Stage validation utilities
export class StageValidator {
  static isValid(stage: Stage): boolean {
    // Stage ID must be positive integer
    if (!Number.isInteger(stage.id) || stage.id <= 0) return false;
    
    // Enemy health must be positive
    if (stage.enemyHealth <= 0) return false;
    
    // Enemy attack speed must be positive
    if (stage.enemyAttackSpeed <= 0) return false;
    
    // Rewards must be non-negative
    if (stage.rewardCoins < 0 || stage.rewardTickets < 0) return false;
    
    // Enemy emojis must be valid array
    if (!Array.isArray(stage.enemyEmojis) || stage.enemyEmojis.length === 0) return false;
    
    // Name and theme must exist
    if (!stage.name.trim() || !stage.backgroundTheme.trim()) return false;
    
    return true;
  }
  
  // Check if stage should be unlocked based on progression
  static isUnlocked(stage: Stage, completedStages: number[]): boolean {
    // First stage is always unlocked
    if (stage.id === 1) return true;
    
    // Sequential unlock - previous stage must be completed
    return completedStages.includes(stage.id - 1);
  }
}

// Utility functions for working with Stages
export const StageUtils = {
  // Generate stage progression data
  generateStageProgression(maxStages: number = 50): Stage[] {
    const stages: Stage[] = [];
    
    for (let i = 1; i <= maxStages; i++) {
      const isBoss = i % 10 === 0; // Every 10th stage is a boss
      const difficulty = Math.floor((i - 1) / 10) + 1; // Difficulty tier based on stage groups
      
      stages.push({
        id: i,
        name: isBoss ? `Boss Stage ${i}` : `Stage ${i}`,
        enemyHealth: this.calculateEnemyHealth(i),
        enemyEmojis: this.generateEnemyEmojis(i, isBoss),
        enemyAttackSpeed: this.calculateEnemyAttackSpeed(i),
        rewardCoins: this.calculateCoinReward(i, isBoss),
        rewardTickets: this.calculateTicketReward(i, isBoss),
        bossStage: isBoss,
        unlockRequirement: i === 1 ? undefined : `Complete Stage ${i - 1}`,
        specialRule: this.getSpecialRule(i, isBoss),
        backgroundTheme: this.getBackgroundTheme(i, difficulty)
      });
    }
    
    return stages;
  },
  
  // Calculate enemy health scaling
  calculateEnemyHealth(stageId: number): number {
    const baseHealth = 100;
    const scalingFactor = 1.15; // 15% increase per stage
    return Math.floor(baseHealth * Math.pow(scalingFactor, stageId - 1));
  },
  
  // Calculate enemy attack speed
  calculateEnemyAttackSpeed(stageId: number): number {
    const baseSpeed = 1.0;
    const maxSpeed = 3.0;
    const scalingRate = 0.05; // Gradual increase
    
    return Math.min(maxSpeed, baseSpeed + (stageId - 1) * scalingRate);
  },
  
  // Generate enemy emojis for combat
  generateEnemyEmojis(stageId: number, isBoss: boolean): string[] {
    const basicEmojis = ['👹', '💀', '🔥', '⚡', '💥'];
    const bossEmojis = ['🐉', '👿', '🌋', '⚔️', '💎', '🌟'];
    const specialEmojis = ['🌪️', '❄️', '🌊', '🌈', '⭐'];
    
    const emojiCount = isBoss ? Math.min(6, 2 + Math.floor(stageId / 10)) : Math.min(4, 1 + Math.floor(stageId / 5));
    const availableEmojis = isBoss ? [...basicEmojis, ...bossEmojis, ...specialEmojis] : basicEmojis;
    
    // Shuffle and take required count
    const shuffled = [...availableEmojis].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, emojiCount);
  },
  
  // Calculate coin rewards
  calculateCoinReward(stageId: number, isBoss: boolean): number {
    const baseReward = 50;
    const bossMultiplier = isBoss ? 3 : 1;
    const stageMultiplier = 1 + (stageId - 1) * 0.1; // 10% increase per stage
    
    return Math.floor(baseReward * stageMultiplier * bossMultiplier);
  },
  
  // Calculate ticket rewards
  calculateTicketReward(stageId: number, isBoss: boolean): number {
    const baseTickets = 1;
    const bossBonus = isBoss ? 2 : 0;
    const milestoneBonus = stageId % 5 === 0 ? 1 : 0; // Every 5th stage
    
    return baseTickets + bossBonus + milestoneBonus;
  },
  
  // Get special rules for stages
  getSpecialRule(stageId: number, isBoss: boolean): string | undefined {
    if (isBoss) {
      const bossRules = [
        'Boss has double attack damage',
        'Boss spawns additional minions',
        'Boss has shield that must be broken first',
        'Boss uses area attacks',
        'Boss regenerates health over time'
      ];
      return bossRules[Math.floor(stageId / 10) % bossRules.length];
    }
    
    // Special rules for certain stage milestones
    if (stageId % 15 === 0) return 'Enemy attacks penetrate shields';
    if (stageId % 20 === 0) return 'Time limit: 90 seconds';
    if (stageId % 25 === 0) return 'Environmental hazards deal extra damage';
    
    return undefined;
  },
  
  // Get background theme
  getBackgroundTheme(stageId: number, difficulty: number): string {
    const themes = [
      'forest', 'desert', 'arctic', 'volcano', 'space',
      'underwater', 'city', 'mountains', 'caves', 'clouds'
    ];
    
    // Cycle through themes based on difficulty tier
    return themes[(difficulty - 1) % themes.length];
  },
  
  // Get stage by ID
  getStage(stages: Stage[], stageId: number): Stage | undefined {
    return stages.find(stage => stage.id === stageId);
  },
  
  // Get unlocked stages
  getUnlockedStages(stages: Stage[], completedStages: number[]): Stage[] {
    return stages.filter(stage => StageValidator.isUnlocked(stage, completedStages));
  },
  
  // Get next stage to unlock
  getNextStage(stages: Stage[], completedStages: number[]): Stage | undefined {
    const maxCompleted = Math.max(0, ...completedStages);
    return this.getStage(stages, maxCompleted + 1);
  },
  
  // Calculate total progress
  getProgressPercentage(completedStages: number[], totalStages: number): number {
    return (completedStages.length / totalStages) * 100;
  },
};