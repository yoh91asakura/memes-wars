// Stage Info Component - Display current stage information and deck limits
import React from 'react';
import styled from 'styled-components';
import { useCurrentStageData, useDeckSizeLimit } from '../../../stores/stageStore';

const StageInfoContainer = styled.div`
  background: rgba(25, 25, 35, 0.9);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  color: white;
  margin: 12px;
  backdrop-filter: blur(10px);
`;

const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const StageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StageNumber = styled.div<{ isBoss: boolean }>`
  background: ${props => props.isBoss 
    ? 'linear-gradient(45deg, #ff6b6b, #ff8e3c)' 
    : 'linear-gradient(45deg, #007BFF, #0056b3)'
  };
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
`;

const StageName = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #fff;
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
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
`;

const StageDetails = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const StageDescription = styled.div`
  color: #aaa;
  font-size: 14px;
  line-height: 1.5;
`;

const EnemyInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const EnemyLabel = styled.div`
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  font-weight: bold;
`;

const EnemyEmojis = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const EnemyEmoji = styled.span`
  font-size: 20px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const EnemyStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

const StatLabel = styled.span`
  color: #888;
`;

const StatValue = styled.span`
  color: #fff;
  font-weight: bold;
`;

const DeckLimitSection = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const DeckLimitHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const DeckLimitTitle = styled.div`
  color: #FFD700;
  font-weight: bold;
  font-size: 14px;
`;

const DeckLimitValue = styled.div`
  color: #FFD700;
  font-size: 20px;
  font-weight: bold;
`;

const DeckLimitDescription = styled.div`
  color: #aaa;
  font-size: 12px;
`;

const RewardsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.2);
`;

const RewardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #FFD700;
  font-weight: bold;
  font-size: 14px;
`;

const SpecialRulesSection = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
`;

const SpecialRulesTitle = styled.div`
  color: #dc3545;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const SpecialRule = styled.div`
  color: #fff;
  font-size: 12px;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StageInfo: React.FC = () => {
  const { stage, deckLimit, isUnlocked } = useCurrentStageData();

  if (!stage) {
    return (
      <StageInfoContainer>
        <div style={{ textAlign: 'center', color: '#666' }}>
          No stage selected
        </div>
      </StageInfoContainer>
    );
  }

  if (!isUnlocked) {
    return (
      <StageInfoContainer>
        <div style={{ textAlign: 'center', color: '#666' }}>
          🔒 Stage {stage.id} is locked
        </div>
      </StageInfoContainer>
    );
  }

  return (
    <StageInfoContainer>
      {/* Header */}
      <StageHeader>
        <StageTitle>
          <StageNumber isBoss={stage.isBoss}>
            Stage {stage.id}
          </StageNumber>
          <StageName>{stage.name}</StageName>
        </StageTitle>
        <DifficultyBadge difficulty={stage.enemyDifficulty}>
          {stage.enemyDifficulty}
        </DifficultyBadge>
      </StageHeader>

      {/* Deck Limit */}
      <DeckLimitSection>
        <DeckLimitHeader>
          <DeckLimitTitle>Deck Size Limit</DeckLimitTitle>
          <DeckLimitValue>{deckLimit}</DeckLimitValue>
        </DeckLimitHeader>
        <DeckLimitDescription>
          Maximum cards you can bring to this stage
        </DeckLimitDescription>
      </DeckLimitSection>

      {/* Stage Details */}
      <StageDetails>
        <StageDescription>
          {stage.description}
        </StageDescription>

        <EnemyInfo>
          <EnemyLabel>Enemy Emojis</EnemyLabel>
          <EnemyEmojis>
            {stage.enemyEmojis.map((emoji, index) => (
              <EnemyEmoji key={index} title={`Emoji: ${emoji}`}>
                {emoji}
              </EnemyEmoji>
            ))}
          </EnemyEmojis>
        </EnemyInfo>

        <EnemyStats>
          <StatRow>
            <StatLabel>HP:</StatLabel>
            <StatValue>{stage.enemyHp}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Attack Speed:</StatLabel>
            <StatValue>{stage.enemyAttackSpeed}x</StatValue>
          </StatRow>
        </EnemyStats>
      </StageDetails>

      {/* Rewards */}
      <RewardsSection>
        <RewardItem>
          <span>🪙</span>
          <span>{stage.goldReward}</span>
        </RewardItem>
        <RewardItem>
          <span>🎫</span>
          <span>{stage.ticketsReward}</span>
        </RewardItem>
        {stage.bonusRewards && stage.bonusRewards.length > 0 && (
          <RewardItem>
            <span>🎁</span>
            <span>Bonus</span>
          </RewardItem>
        )}
      </RewardsSection>

      {/* Special Rules */}
      {stage.specialRules && stage.specialRules.length > 0 && (
        <SpecialRulesSection>
          <SpecialRulesTitle>Special Rules</SpecialRulesTitle>
          {stage.specialRules.map((rule, index) => (
            <SpecialRule key={index}>
              • {rule.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </SpecialRule>
          ))}
        </SpecialRulesSection>
      )}
    </StageInfoContainer>
  );
};

export default StageInfo;