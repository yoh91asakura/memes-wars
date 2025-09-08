// Stage Selector Component - Choose stages with deck size limits display
import React from 'react';
import styled from 'styled-components';
import { Stage } from '../../../data/stages';
import { 
  useStageStore, 
  useAvailableStages, 
  useCurrentStage, 
  useSelectedStage,
  usePlayerProgress,
  stageActions 
} from '../../../stores/stageStore';

const StageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
`;

const StageCard = styled.div<{ 
  isUnlocked: boolean; 
  isSelected: boolean; 
  isCurrent: boolean;
  difficulty: string;
}>`
  background: ${props => {
    if (!props.isUnlocked) return 'rgba(100, 100, 100, 0.3)';
    if (props.isCurrent) return 'rgba(255, 215, 0, 0.2)';
    if (props.isSelected) return 'rgba(0, 123, 255, 0.2)';
    return 'rgba(25, 25, 35, 0.8)';
  }};
  border: ${props => {
    if (props.isCurrent) return '2px solid #FFD700';
    if (props.isSelected) return '2px solid #007BFF';
    if (!props.isUnlocked) return '2px solid #666';
    return '2px solid transparent';
  }};
  border-radius: 12px;
  padding: 16px;
  cursor: ${props => props.isUnlocked ? 'pointer' : 'not-allowed'};
  transition: all 0.3s ease;
  position: relative;
  opacity: ${props => props.isUnlocked ? 1 : 0.5};

  &:hover {
    transform: ${props => props.isUnlocked ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.isUnlocked ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'};
  }
`;

const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const StageNumber = styled.div<{ isBoss: boolean }>`
  background: ${props => props.isBoss ? 'linear-gradient(45deg, #ff6b6b, #ff8e3c)' : 'rgba(0, 123, 255, 0.8)'};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
`;

const DifficultyBadge = styled.div<{ difficulty: string }>`
  background: ${props => {
    switch (props.difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#fd7e14';
      case 'boss': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
`;

const StageName = styled.h3`
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 18px;
`;

const StageDescription = styled.p`
  color: #aaa;
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.4;
`;

const StageStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
`;

const StatValue = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: #fff;
`;

const DeckLimitDisplay = styled.div`
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid #FFD700;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  text-align: center;
`;

const DeckLimitText = styled.div`
  color: #FFD700;
  font-weight: bold;
  font-size: 14px;
`;

const EmojiPreview = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const EmojiIcon = styled.span`
  font-size: 20px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
`;

const RewardDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 215, 0, 0.3);
`;

const RewardItem = styled.span`
  color: #FFD700;
  font-size: 12px;
  font-weight: bold;
`;

const SpecialBadges = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  gap: 4px;
`;

const SpecialBadge = styled.div<{ type: 'boss' | 'special' }>`
  background: ${props => props.type === 'boss' ? '#dc3545' : '#17a2b8'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

const UnlockedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-weight: bold;
  font-size: 16px;
`;

const SelectorHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
`;

const SelectorTitle = styled.h2`
  color: #fff;
  margin: 0 0 12px 0;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #aaa;
  font-size: 14px;
`;

const StageSelector: React.FC = () => {
  const availableStages = useAvailableStages();
  const currentStage = useCurrentStage();
  const selectedStage = useSelectedStage();
  const playerProgress = usePlayerProgress();
  const isStageUnlocked = useStageStore(state => state.isStageUnlocked);
  const getDeckSizeLimit = useStageStore(state => state.getDeckSizeLimit);

  const handleStageSelect = (stage: Stage) => {
    if (isStageUnlocked(stage.id)) {
      stageActions.selectStage(stage.id);
    }
  };

  const handleStageStart = (stage: Stage) => {
    if (isStageUnlocked(stage.id)) {
      stageActions.goToStage(stage.id);
      stageActions.closeStageSelect();
    }
  };

  return (
    <>
      <SelectorHeader>
        <SelectorTitle>Select Stage</SelectorTitle>
        <ProgressInfo>
          <span>Level {playerProgress.level}</span>
          <span>{playerProgress.completedStages.length} stages completed</span>
          <span>Current: Stage {currentStage}</span>
        </ProgressInfo>
      </SelectorHeader>
      
      <StageGrid>
        {availableStages.map((stage) => {
          const unlocked = isStageUnlocked(stage.id);
          const deckLimit = getDeckSizeLimit(stage.id);
          const isCurrent = stage.id === currentStage;
          const isSelected = stage.id === selectedStage;

          return (
            <StageCard
              key={stage.id}
              isUnlocked={unlocked}
              isSelected={isSelected}
              isCurrent={isCurrent}
              difficulty={stage.enemyDifficulty}
              onClick={() => handleStageSelect(stage)}
              onDoubleClick={() => handleStageStart(stage)}
            >
              {/* Special Badges */}
              <SpecialBadges>
                {stage.isBoss && <SpecialBadge type="boss">Boss</SpecialBadge>}
                {stage.isSpecial && !stage.isBoss && <SpecialBadge type="special">Special</SpecialBadge>}
              </SpecialBadges>

              {/* Header */}
              <StageHeader>
                <StageNumber isBoss={stage.isBoss}>
                  Stage {stage.id}
                </StageNumber>
                <DifficultyBadge difficulty={stage.enemyDifficulty}>
                  {stage.enemyDifficulty}
                </DifficultyBadge>
              </StageHeader>

              {/* Stage Info */}
              <StageName>{stage.name}</StageName>
              <StageDescription>{stage.description}</StageDescription>

              {/* Deck Limit */}
              <DeckLimitDisplay>
                <DeckLimitText>
                  Deck Limit: {deckLimit} card{deckLimit !== 1 ? 's' : ''}
                </DeckLimitText>
              </DeckLimitDisplay>

              {/* Enemy Preview */}
              <EmojiPreview>
                {stage.enemyEmojis.map((emoji, index) => (
                  <EmojiIcon key={index}>{emoji}</EmojiIcon>
                ))}
              </EmojiPreview>

              {/* Stats */}
              <StageStats>
                <StatItem>
                  <StatLabel>Enemy HP</StatLabel>
                  <StatValue>{stage.enemyHp}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Attack Speed</StatLabel>
                  <StatValue>{stage.enemyAttackSpeed}x</StatValue>
                </StatItem>
              </StageStats>

              {/* Rewards */}
              <RewardDisplay>
                <RewardItem>🪙 {stage.goldReward}</RewardItem>
                <RewardItem>🎫 {stage.ticketsReward}</RewardItem>
              </RewardDisplay>

              {/* Unlock Overlay */}
              {!unlocked && (
                <UnlockedOverlay>
                  🔒 Locked
                </UnlockedOverlay>
              )}
            </StageCard>
          );
        })}
      </StageGrid>
    </>
  );
};

export default StageSelector;