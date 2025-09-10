// Stage Service - Gestion de la progression par stages
import { Card } from '../models';

export interface Stage {
  id: number;
  name: string;
  enemyHp: number;
  enemyEmojis: string[];
  reward: {
    gold: number;
    gems?: number;
    tickets?: number;
  };
  boss: boolean;
  deckSizeLimit: number;
  unlockRequirement?: {
    level?: number;
    previousStage?: number;
  };
}

export interface StageProgress {
  currentStage: number;
  completedStages: number[];
  bestResults: Record<number, {
    victory: boolean;
    timeToWin?: number;
    damageDealt: number;
  }>;
}

export class StageService {
  private stages: Stage[] = [];

  constructor() {
    this.initializeStages();
  }

  private initializeStages() {
    // Génération de 50 stages avec progression
    for (let i = 1; i <= 50; i++) {
      const isBoss = i % 10 === 0;
      const stage: Stage = {
        id: i,
        name: isBoss ? `Boss Stage ${i}` : `Stage ${i}`,
        enemyHp: this.calculateEnemyHp(i),
        enemyEmojis: this.generateEnemyEmojis(i, isBoss),
        reward: this.calculateRewards(i, isBoss),
        boss: isBoss,
        deckSizeLimit: this.getDeckSizeLimit(i),
        unlockRequirement: i > 1 ? { previousStage: i - 1 } : undefined
      };
      this.stages.push(stage);
    }
  }

  private calculateEnemyHp(stageNumber: number): number {
    // HP progressif : commence à 100, augmente de 20% par stage
    const baseHp = 100;
    const growth = Math.pow(1.2, stageNumber - 1);
    return Math.floor(baseHp * growth);
  }

  private generateEnemyEmojis(stageNumber: number, isBoss: boolean): string[] {
    const commonEmojis = ['💀', '👾', '🦾', '⚡', '🔥', '❄️', '💚', '🗿'];
    const bossEmojis = ['👑', '🐉', '⚔️', '🛡️', '💎', '🌟'];
    
    const emojiPool = isBoss ? [...commonEmojis, ...bossEmojis] : commonEmojis;
    const emojiCount = isBoss ? Math.min(6, 2 + Math.floor(stageNumber / 10)) : Math.min(4, 1 + Math.floor(stageNumber / 5));
    
    // Sélection aléatoire d'emojis
    const selectedEmojis: string[] = [];
    for (let i = 0; i < emojiCount; i++) {
      const randomIndex = Math.floor(Math.random() * emojiPool.length);
      selectedEmojis.push(emojiPool[randomIndex]);
    }
    
    return selectedEmojis;
  }

  private calculateRewards(stageNumber: number, isBoss: boolean): Stage['reward'] {
    const baseGold = 50;
    const stageMultiplier = 1 + (stageNumber - 1) * 0.1;
    const bossMultiplier = isBoss ? 2 : 1;
    
    const reward: Stage['reward'] = {
      gold: Math.floor(baseGold * stageMultiplier * bossMultiplier)
    };

    // Gems pour les boss
    if (isBoss) {
      reward.gems = Math.floor(stageNumber / 10);
    }

    // Tickets pour les étapes importantes
    if (stageNumber % 5 === 0) {
      reward.tickets = isBoss ? 3 : 1;
    }

    return reward;
  }

  private getDeckSizeLimit(stageNumber: number): number {
    if (stageNumber <= 10) return 3;
    if (stageNumber <= 25) return 4;
    if (stageNumber <= 40) return 5;
    return 6; // Maximum pour les derniers stages
  }

  // API publique
  getStage(stageNumber: number): Stage | undefined {
    return this.stages.find(stage => stage.id === stageNumber);
  }

  getAllStages(): Stage[] {
    return [...this.stages];
  }

  getAvailableStages(progress: StageProgress): Stage[] {
    return this.stages.filter(stage => {
      if (stage.id === 1) return true; // Premier stage toujours disponible
      if (!stage.unlockRequirement) return true;
      
      const { previousStage, level } = stage.unlockRequirement;
      
      if (previousStage && !progress.completedStages.includes(previousStage)) {
        return false;
      }
      
      // Ajouter vérification de niveau si nécessaire
      
      return true;
    });
  }

  isStageUnlocked(stageNumber: number, progress: StageProgress): boolean {
    const stage = this.getStage(stageNumber);
    if (!stage) return false;
    
    if (stage.id === 1) return true;
    if (!stage.unlockRequirement) return true;
    
    const { previousStage } = stage.unlockRequirement;
    return !previousStage || progress.completedStages.includes(previousStage);
  }

  completeStage(stageNumber: number, result: {
    victory: boolean;
    timeToWin?: number;
    damageDealt: number;
  }): Stage['reward'] | null {
    const stage = this.getStage(stageNumber);
    if (!stage || !result.victory) return null;
    
    return stage.reward;
  }

  getCurrentDeckLimit(currentStage: number): number {
    const stage = this.getStage(currentStage);
    return stage ? stage.deckSizeLimit : 3;
  }

  getNextStage(currentStage: number): Stage | null {
    return this.getStage(currentStage + 1) || null;
  }

  // Statistiques
  getTotalProgress(progress: StageProgress): {
    completionPercentage: number;
    totalStages: number;
    completedStages: number;
    currentStage: number;
  } {
    return {
      completionPercentage: (progress.completedStages.length / this.stages.length) * 100,
      totalStages: this.stages.length,
      completedStages: progress.completedStages.length,
      currentStage: progress.currentStage
    };
  }
}

// Instance singleton
let stageServiceInstance: StageService | null = null;

export function getStageService(): StageService {
  if (!stageServiceInstance) {
    stageServiceInstance = new StageService();
  }
  return stageServiceInstance;
}