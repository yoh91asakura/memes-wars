// Stage Store - Player progression and stage management
// Zustand store for stage system with persistence

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { StageManager, Stage, PlayerProgress, StageRewards, STAGES } from '../data/stages';

export interface StageState {
  // Player Progress
  playerProgress: PlayerProgress;
  
  // Current Stage Context
  currentStage: number;
  selectedStage: number;
  
  // Stage Cache
  availableStages: Stage[];
  
  // Deck Size Limits
  currentDeckLimit: number;
  
  // Battle Results
  lastBattleResult: {
    stageId: number;
    victory: boolean;
    rewards?: StageRewards;
    timestamp: number;
  } | null;
  
  // UI State
  stageSelectOpen: boolean;
  showStageRewards: boolean;
  
  // Actions
  setCurrentStage: (stageNumber: number) => void;
  selectStage: (stageNumber: number) => void;
  completeStage: (stageId: number, rewards: StageRewards) => void;
  updatePlayerLevel: (level: number) => void;
  addCompletedStage: (stageId: number) => void;
  updateCardsCollected: (count: number) => void;
  
  // Getters
  getAvailableStages: () => Stage[];
  getDeckSizeLimit: (stageNumber?: number) => number;
  getStageById: (stageId: number) => Stage | undefined;
  isStageUnlocked: (stageId: number) => boolean;
  getNextStageToUnlock: () => Stage | undefined;
  getBossStages: () => Stage[];
  getCompletionRate: () => number;
  
  // UI Actions
  toggleStageSelect: () => void;
  showRewards: (show: boolean) => void;
  
  // Reset
  resetProgress: () => void;
}

const initialPlayerProgress: PlayerProgress = {
  level: 1,
  completedStages: [],
  cardsCollected: 0,
  currentStage: 1,
  highestStage: 1
};

export const useStageStore = create<StageState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        playerProgress: initialPlayerProgress,
        currentStage: 1,
        selectedStage: 1,
        availableStages: STAGES.filter(stage => stage.id === 1), // Start with stage 1 only
        currentDeckLimit: 3,
        lastBattleResult: null,
        stageSelectOpen: false,
        showStageRewards: false,
        
        // Actions
        setCurrentStage: (stageNumber: number) => {
          set(state => {
            const newProgress = {
              ...state.playerProgress,
              currentStage: stageNumber,
              highestStage: Math.max(state.playerProgress.highestStage, stageNumber)
            };
            
            return {
              currentStage: stageNumber,
              playerProgress: newProgress,
              currentDeckLimit: StageManager.getDeckSizeLimit(stageNumber),
              availableStages: get().getAvailableStages()
            };
          });
        },
        
        selectStage: (stageNumber: number) => {
          set({ selectedStage: stageNumber });
        },
        
        completeStage: (stageId: number, rewards: StageRewards) => {
          set(state => {
            const updatedCompletedStages = [...state.playerProgress.completedStages];
            if (!updatedCompletedStages.includes(stageId)) {
              updatedCompletedStages.push(stageId);
            }
            
            const newProgress = {
              ...state.playerProgress,
              completedStages: updatedCompletedStages,
              highestStage: Math.max(state.playerProgress.highestStage, stageId + 1)
            };
            
            return {
              playerProgress: newProgress,
              lastBattleResult: {
                stageId,
                victory: true,
                rewards,
                timestamp: Date.now()
              },
              availableStages: get().getAvailableStages(),
              showStageRewards: true
            };
          });
        },
        
        updatePlayerLevel: (level: number) => {
          set(state => ({
            playerProgress: {
              ...state.playerProgress,
              level: Math.max(state.playerProgress.level, level)
            }
          }));
        },
        
        addCompletedStage: (stageId: number) => {
          set(state => {
            const updatedCompleted = [...state.playerProgress.completedStages];
            if (!updatedCompleted.includes(stageId)) {
              updatedCompleted.push(stageId);
            }
            
            return {
              playerProgress: {
                ...state.playerProgress,
                completedStages: updatedCompleted
              }
            };
          });
        },
        
        updateCardsCollected: (count: number) => {
          set(state => ({
            playerProgress: {
              ...state.playerProgress,
              cardsCollected: Math.max(state.playerProgress.cardsCollected, count)
            }
          }));
        },
        
        // Getters
        getAvailableStages: () => {
          const { playerProgress } = get();
          return StageManager.getAvailableStages(playerProgress);
        },
        
        getDeckSizeLimit: (stageNumber?: number) => {
          const stage = stageNumber || get().currentStage;
          return StageManager.getDeckSizeLimit(stage);
        },
        
        getStageById: (stageId: number) => {
          return StageManager.getStage(stageId);
        },
        
        isStageUnlocked: (stageId: number) => {
          const { playerProgress } = get();
          return StageManager.isStageUnlocked(stageId, playerProgress);
        },
        
        getNextStageToUnlock: () => {
          const { playerProgress } = get();
          return StageManager.getNextStageToUnlock(playerProgress);
        },
        
        getBossStages: () => {
          return StageManager.getBossStages();
        },
        
        getCompletionRate: () => {
          const { playerProgress } = get();
          const totalStages = STAGES.length;
          const completedStages = playerProgress.completedStages.length;
          return totalStages > 0 ? (completedStages / totalStages) * 100 : 0;
        },
        
        // UI Actions
        toggleStageSelect: () => {
          set(state => ({ stageSelectOpen: !state.stageSelectOpen }));
        },
        
        showRewards: (show: boolean) => {
          set({ showStageRewards: show });
        },
        
        // Reset
        resetProgress: () => {
          set({
            playerProgress: initialPlayerProgress,
            currentStage: 1,
            selectedStage: 1,
            availableStages: STAGES.filter(stage => stage.id === 1),
            currentDeckLimit: 3,
            lastBattleResult: null
          });
        }
      }),
      {
        name: 'stage-store',
        partialize: (state) => ({
          playerProgress: state.playerProgress,
          currentStage: state.currentStage,
          lastBattleResult: state.lastBattleResult
        })
      }
    )
  )
);

// Selectors for optimized component subscriptions
export const useCurrentStage = () => useStageStore(state => state.currentStage);
export const useSelectedStage = () => useStageStore(state => state.selectedStage);
export const useDeckSizeLimit = () => useStageStore(state => state.currentDeckLimit);
export const useAvailableStages = () => useStageStore(state => state.availableStages);
export const usePlayerProgress = () => useStageStore(state => state.playerProgress);
export const useLastBattleResult = () => useStageStore(state => state.lastBattleResult);
export const useStageSelectOpen = () => useStageStore(state => state.stageSelectOpen);
export const useStageRewardsVisible = () => useStageStore(state => state.showStageRewards);

// Computed selectors
export const useCurrentStageData = () => {
  return useStageStore(state => {
    const currentStage = state.getStageById(state.currentStage);
    const deckLimit = state.getDeckSizeLimit(state.currentStage);
    const isUnlocked = state.isStageUnlocked(state.currentStage);
    
    return {
      stage: currentStage,
      deckLimit,
      isUnlocked
    };
  });
};

export const useProgressStats = () => {
  return useStageStore(state => {
    const completionRate = state.getCompletionRate();
    const nextStage = state.getNextStageToUnlock();
    const bossStages = state.getBossStages();
    const bossesDefeated = bossStages.filter(boss => 
      state.playerProgress.completedStages.includes(boss.id)
    ).length;
    
    return {
      completionRate,
      nextStage,
      bossesDefeated,
      totalBosses: bossStages.length,
      totalStagesCompleted: state.playerProgress.completedStages.length,
      totalStages: STAGES.length
    };
  });
};

// Actions for components
export const stageActions = {
  // Stage navigation
  goToStage: (stageNumber: number) => {
    useStageStore.getState().setCurrentStage(stageNumber);
  },
  
  selectStage: (stageNumber: number) => {
    useStageStore.getState().selectStage(stageNumber);
  },
  
  // Battle completion
  completeBattle: (stageId: number, victory: boolean, rewards?: StageRewards) => {
    if (victory && rewards) {
      useStageStore.getState().completeStage(stageId, rewards);
    } else {
      useStageStore.setState({
        lastBattleResult: {
          stageId,
          victory: false,
          timestamp: Date.now()
        }
      });
    }
  },
  
  // Progress tracking
  updateProgress: (updates: Partial<PlayerProgress>) => {
    const currentProgress = useStageStore.getState().playerProgress;
    useStageStore.setState({
      playerProgress: { ...currentProgress, ...updates }
    });
  },
  
  // UI controls
  openStageSelect: () => useStageStore.getState().toggleStageSelect(),
  closeStageSelect: () => useStageStore.setState({ stageSelectOpen: false }),
  dismissRewards: () => useStageStore.getState().showRewards(false)
};

// Subscribe to changes for derived state updates
useStageStore.subscribe(
  (state) => state.playerProgress,
  (playerProgress) => {
    // Update available stages when progress changes
    const availableStages = StageManager.getAvailableStages(playerProgress);
    useStageStore.setState({ availableStages });
  }
);

useStageStore.subscribe(
  (state) => state.currentStage,
  (currentStage) => {
    // Update deck limit when current stage changes
    const deckLimit = StageManager.getDeckSizeLimit(currentStage);
    useStageStore.setState({ currentDeckLimit: deckLimit });
  }
);

export default useStageStore;