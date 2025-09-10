// Reward Service - Post-combat reward distribution and management
// Handles gold, tickets, cards, and special rewards from stage completion

import { StageRewards } from '../data/stages';
import { Card } from '../models';
import { currencyActions } from '../stores/currencyStore';

export interface CombatResult {
  victory: boolean;
  stageId: number;
  playerDamage: number;
  enemyDamage: number;
  combatDuration: number;
  perfectVictory?: boolean; // No damage taken
  speedBonus?: boolean; // Completed quickly
}

export interface RewardCalculation {
  baseRewards: StageRewards;
  bonusMultipliers: {
    perfect: number;
    speed: number;
    difficulty: number;
    consecutive: number;
  };
  finalRewards: StageRewards;
  totalExperience: number;
}

export interface RewardDistribution {
  gold: number;
  tickets: number;
  experience: number;
  bonusCards?: Card[];
  achievements?: string[];
  unlocks?: string[];
}

export class RewardService {
  // Calculate rewards based on combat performance
  calculateRewards(
    combatResult: CombatResult,
    baseRewards: StageRewards,
    playerBonuses: {
      goldMultiplier?: number;
      ticketMultiplier?: number;
      experienceMultiplier?: number;
    } = {}
  ): RewardCalculation {
    const bonusMultipliers = {
      perfect: combatResult.perfectVictory ? 1.5 : 1.0,
      speed: combatResult.speedBonus ? 1.25 : 1.0,
      difficulty: this.getDifficultyMultiplier(combatResult.stageId),
      consecutive: this.getConsecutiveWinMultiplier()
    };

    // Apply all multipliers
    const totalGoldMultiplier = 
      bonusMultipliers.perfect * 
      bonusMultipliers.speed * 
      bonusMultipliers.difficulty * 
      bonusMultipliers.consecutive *
      (playerBonuses.goldMultiplier || 1.0);

    const totalTicketMultiplier = 
      bonusMultipliers.perfect * 
      bonusMultipliers.speed * 
      (playerBonuses.ticketMultiplier || 1.0);

    const finalRewards: StageRewards = {
      gold: Math.floor(baseRewards.gold * totalGoldMultiplier),
      tickets: Math.floor(baseRewards.tickets * totalTicketMultiplier),
      bonusRewards: [...baseRewards.bonusRewards]
    };

    // Calculate experience based on stage difficulty and performance
    const baseExperience = this.calculateBaseExperience(combatResult.stageId);
    const experienceMultiplier = 
      bonusMultipliers.perfect * 
      bonusMultipliers.speed * 
      (playerBonuses.experienceMultiplier || 1.0);
    
    const totalExperience = Math.floor(baseExperience * experienceMultiplier);

    return {
      baseRewards,
      bonusMultipliers,
      finalRewards,
      totalExperience
    };
  }

  // Distribute rewards to player
  async distributeRewards(
    calculation: RewardCalculation,
    playerLevel: number
  ): Promise<RewardDistribution> {
    const distribution: RewardDistribution = {
      gold: calculation.finalRewards.gold,
      tickets: calculation.finalRewards.tickets,
      experience: calculation.totalExperience,
      bonusCards: [],
      achievements: [],
      unlocks: []
    };

    // Distribute currency rewards
    currencyActions.distributeRewards({
      gold: calculation.finalRewards.gold,
      tickets: calculation.finalRewards.tickets
    }, 'Combat Victory');

    // Process bonus rewards
    for (const bonusReward of calculation.finalRewards.bonusRewards) {
      await this.processBonusReward(bonusReward, distribution, playerLevel);
    }

    // Check for achievements
    distribution.achievements = this.checkAchievements(calculation);

    // Check for unlocks
    distribution.unlocks = this.checkUnlocks(playerLevel + Math.floor(calculation.totalExperience / 100));

    return distribution;
  }

  // Process special bonus rewards
  private async processBonusReward(
    bonusReward: string,
    distribution: RewardDistribution,
    playerLevel: number
  ): Promise<void> {
    switch (bonusReward) {
      case 'rare_card_guarantee':
        distribution.bonusCards?.push(await this.generateGuaranteedCard('rare', playerLevel));
        break;
      
      case 'epic_card_guarantee':
        distribution.bonusCards?.push(await this.generateGuaranteedCard('epic', playerLevel));
        break;
      
      case 'legendary_card_guarantee':
        distribution.bonusCards?.push(await this.generateGuaranteedCard('legendary', playerLevel));
        break;
      
      case 'lucky_charm':
        // Increases next roll luck by 10%
        this.addTemporaryBonus('luck', 0.1, 3600000); // 1 hour
        break;
      
      case 'power_crystal':
        // Bonus experience
        distribution.experience += 500;
        break;
      
      case 'deck_slot_upgrade':
        // Unlock additional deck slot (handled by progression system)
        distribution.unlocks?.push('deck_slot');
        break;
      
      default:
        console.warn(`Unknown bonus reward: ${bonusReward}`);
    }
  }

  // Generate a guaranteed card of specific rarity
  private async generateGuaranteedCard(rarity: string, playerLevel: number): Promise<Card> {
    // In a real implementation, this would use the RollService
    // For now, return a placeholder card
    return {
      id: `bonus_${rarity}_${Date.now()}`,
      name: `Bonus ${rarity} Card`,
      rarity: rarity as any,
      memeFamily: 'CLASSIC_INTERNET' as any,
      emojis: ['🎁'],
      health: 100,
      attackDamage: 50,
      attackSpeed: 1.0,
      manaCost: 3,
      flavor: `A special ${rarity} card earned from combat!`,
      imageUrl: '',
      unlockStage: 1,
      luck: 1,
      family: 'reward' as any,
      reference: `Bonus reward ${rarity}`,
      stackLevel: 1,
      inventory: []
    };
  }

  // Get difficulty multiplier based on stage
  private getDifficultyMultiplier(stageId: number): number {
    if (stageId <= 10) return 1.0; // Beginner
    if (stageId <= 25) return 1.2; // Intermediate
    if (stageId <= 50) return 1.5; // Advanced
    if (stageId <= 100) return 2.0; // Expert
    return 2.5; // Master
  }

  // Get consecutive win multiplier
  private getConsecutiveWinMultiplier(): number {
    // This would track consecutive wins in the player state
    // For now, return base multiplier
    return 1.0;
  }

  // Calculate base experience for stage
  private calculateBaseExperience(stageId: number): number {
    const baseExp = 50;
    const stageMultiplier = 1 + (stageId - 1) * 0.1;
    return Math.floor(baseExp * stageMultiplier);
  }

  // Check for achievements based on combat performance
  private checkAchievements(calculation: RewardCalculation): string[] {
    const achievements: string[] = [];

    if (calculation.bonusMultipliers.perfect > 1) {
      achievements.push('Perfect Victory');
    }

    if (calculation.bonusMultipliers.speed > 1) {
      achievements.push('Speed Demon');
    }

    if (calculation.finalRewards.gold >= 1000) {
      achievements.push('Big Earner');
    }

    return achievements;
  }

  // Check for unlocks based on player level
  private checkUnlocks(newLevel: number): string[] {
    const unlocks: string[] = [];

    // Level-based unlocks
    if (newLevel >= 5 && newLevel < 6) {
      unlocks.push('Advanced Rolls');
    }

    if (newLevel >= 10 && newLevel < 11) {
      unlocks.push('Deck Slots +1');
    }

    if (newLevel >= 15 && newLevel < 16) {
      unlocks.push('Crafting System');
    }

    return unlocks;
  }

  // Add temporary bonus effects
  private addTemporaryBonus(type: string, value: number, duration: number): void {
    // This would integrate with the player state management
    console.log(`Added temporary bonus: ${type} +${value * 100}% for ${duration}ms`);
  }

  // Validate reward calculation
  validateRewards(calculation: RewardCalculation): boolean {
    if (calculation.finalRewards.gold < 0 || calculation.finalRewards.tickets < 0) {
      return false;
    }

    if (calculation.totalExperience < 0) {
      return false;
    }

    return true;
  }

  // Get reward preview before combat
  getRewardPreview(stageId: number, baseRewards: StageRewards): {
    minRewards: StageRewards;
    maxRewards: StageRewards;
    potentialBonuses: string[];
  } {
    const minMultiplier = this.getDifficultyMultiplier(stageId);
    const maxMultiplier = minMultiplier * 1.5 * 1.25; // Perfect + Speed bonus

    return {
      minRewards: {
        gold: Math.floor(baseRewards.gold * minMultiplier),
        tickets: Math.floor(baseRewards.tickets),
        bonusRewards: baseRewards.bonusRewards
      },
      maxRewards: {
        gold: Math.floor(baseRewards.gold * maxMultiplier),
        tickets: Math.floor(baseRewards.tickets * 1.5),
        bonusRewards: baseRewards.bonusRewards
      },
      potentialBonuses: [
        'Perfect Victory: +50% rewards',
        'Speed Bonus: +25% rewards',
        'Experience bonus',
        'Achievement unlocks'
      ]
    };
  }
}

// Singleton instance
let rewardServiceInstance: RewardService | null = null;

export function getRewardService(): RewardService {
  if (!rewardServiceInstance) {
    rewardServiceInstance = new RewardService();
  }
  return rewardServiceInstance;
}