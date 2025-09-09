// Stages Index - Export all stage system components
// Re-export from the main stages data file

export {
  STAGES,
  STAGE_PROGRESSION,
  StageManager,
  type Stage,
  type StageProgression, 
  type PlayerProgress,
  type RewardBonuses,
  type StageRewards
} from '../stages';

// Default export for backward compatibility
export { default } from '../stages';