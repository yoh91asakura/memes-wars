// Synergy Panel Component - Display active synergies and recommendations
import React from 'react';
import styled from 'styled-components';
import { Card } from '../../../models/Card';
import SynergySystem, { 
  ActiveSynergy, 
  PotentialSynergy, 
  SynergyRecommendation,
  SYNERGY_TYPES 
} from '../../../services/SynergySystem';

const PanelContainer = styled.div`
  background: rgba(25, 25, 35, 0.9);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  color: white;
  max-width: 400px;
  backdrop-filter: blur(10px);
`;

const PanelHeader = styled.h3`
  color: #FFD700;
  margin: 0 0 16px 0;
  text-align: center;
  font-size: 18px;
`;

const Section = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  color: #fff;
  margin: 0 0 12px 0;
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: 1px solid #333;
  padding-bottom: 4px;
`;

const SynergyCard = styled.div<{ strength: number; isActive?: boolean }>`
  background: ${props => {
    if (props.isActive) {
      const alpha = Math.max(0.2, props.strength);
      return `rgba(0, 123, 255, ${alpha})`;
    }
    return 'rgba(100, 100, 100, 0.3)';
  }};
  border: 1px solid ${props => 
    props.isActive ? '#007BFF' : '#666'
  };
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const SynergyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SynergyName = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #fff;
`;

const SynergyLevel = styled.div<{ level: number }>`
  background: ${props => {
    if (props.level >= 3) return '#28a745';
    if (props.level >= 2) return '#ffc107';
    return '#007BFF';
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
`;

const SynergyDescription = styled.div`
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
  line-height: 1.4;
`;

const BonusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BonusItem = styled.div`
  font-size: 11px;
  color: #28a745;
  padding: 2px 6px;
  background: rgba(40, 167, 69, 0.2);
  border-radius: 4px;
  border-left: 2px solid #28a745;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.progress * 100}%;
    height: 100%;
    background: linear-gradient(90deg, #007BFF, #00D4AA);
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 10px;
  color: #aaa;
  text-align: center;
  margin-top: 4px;
`;

const RecommendationCard = styled.div<{ priority: string }>`
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid ${props => {
    switch (props.priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }};
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const PriorityBadge = styled.div<{ priority: string }>`
  background: ${props => {
    switch (props.priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }};
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: bold;
`;

const RecommendationText = styled.div`
  font-size: 12px;
  color: #fff;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #FFD700;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #aaa;
  text-transform: uppercase;
`;

const ArchetypeDisplay = styled.div`
  text-align: center;
  padding: 12px;
  background: linear-gradient(45deg, rgba(0, 123, 255, 0.2), rgba(0, 212, 170, 0.2));
  border-radius: 8px;
  border: 1px solid rgba(0, 123, 255, 0.3);
`;

const ArchetypeTitle = styled.div`
  font-weight: bold;
  color: #00D4AA;
  margin-bottom: 4px;
`;

const ArchetypeDescription = styled.div`
  font-size: 12px;
  color: #aaa;
`;

const NoSynergiesMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
`;

interface SynergyPanelProps {
  deck: Card[];
  className?: string;
}

const SynergyPanel: React.FC<SynergyPanelProps> = ({ deck, className }) => {
  if (!deck || deck.length === 0) {
    return (
      <PanelContainer className={className}>
        <PanelHeader>Synergies</PanelHeader>
        <NoSynergiesMessage>
          Add cards to your deck to see synergies
        </NoSynergiesMessage>
      </PanelContainer>
    );
  }

  const synergyResult = SynergySystem.detectSynergies(deck);
  const recommendations = SynergySystem.getSynergyRecommendations(deck);

  const renderActiveSynergies = () => {
    if (synergyResult.activeSynergies.length === 0) {
      return (
        <NoSynergiesMessage>
          No active synergies. Try focusing on specific card types!
        </NoSynergiesMessage>
      );
    }

    return synergyResult.activeSynergies.map((synergy) => {
      const synergyType = SYNERGY_TYPES[synergy.synergyId];
      
      return (
        <SynergyCard 
          key={synergy.synergyId} 
          strength={synergy.strength}
          isActive={true}
        >
          <SynergyHeader>
            <SynergyName>{synergyType.name}</SynergyName>
            <SynergyLevel level={synergy.level}>
              Level {synergy.level}
            </SynergyLevel>
          </SynergyHeader>
          
          <SynergyDescription>
            {synergyType.description}
          </SynergyDescription>
          
          <BonusList>
            {synergy.bonuses.map((bonus, index) => (
              <BonusItem key={index}>
                {bonus.description}
              </BonusItem>
            ))}
          </BonusList>
          
          <ProgressBar progress={synergy.strength} />
          <ProgressText>
            Strength: {Math.round(synergy.strength * 100)}%
          </ProgressText>
        </SynergyCard>
      );
    });
  };

  const renderPotentialSynergies = () => {
    if (synergyResult.potentialSynergies.length === 0) {
      return null;
    }

    return (
      <Section>
        <SectionTitle>Potential Synergies</SectionTitle>
        {synergyResult.potentialSynergies.slice(0, 3).map((potential) => {
          const synergyType = SYNERGY_TYPES[potential.synergyId];
          const progress = potential.currentCount / potential.requiredCount;
          
          return (
            <SynergyCard 
              key={potential.synergyId}
              strength={progress}
              isActive={false}
            >
              <SynergyHeader>
                <SynergyName>{synergyType.name}</SynergyName>
              </SynergyHeader>
              
              <SynergyDescription>
                {potential.description}
              </SynergyDescription>
              
              <ProgressBar progress={progress} />
              <ProgressText>
                {potential.currentCount}/{potential.requiredCount} cards
              </ProgressText>
            </SynergyCard>
          );
        })}
      </Section>
    );
  };

  const renderRecommendations = () => {
    if (recommendations.length === 0) {
      return null;
    }

    return (
      <Section>
        <SectionTitle>Recommendations</SectionTitle>
        {recommendations.slice(0, 3).map((rec, index) => (
          <RecommendationCard key={index} priority={rec.priority}>
            <RecommendationHeader>
              <PriorityBadge priority={rec.priority}>
                {rec.priority}
              </PriorityBadge>
            </RecommendationHeader>
            <RecommendationText>
              {rec.description}
            </RecommendationText>
          </RecommendationCard>
        ))}
      </Section>
    );
  };

  return (
    <PanelContainer className={className}>
      <PanelHeader>Synergy Analysis</PanelHeader>
      
      {/* Deck Stats */}
      <Section>
        <ArchetypeDisplay>
          <ArchetypeTitle>
            {synergyResult.deckStats.deckArchetype}
          </ArchetypeTitle>
          <ArchetypeDescription>
            Dominant: {synergyResult.deckStats.dominantFamily}
          </ArchetypeDescription>
        </ArchetypeDisplay>
      </Section>

      <Section>
        <StatsSection>
          <StatItem>
            <StatValue>{synergyResult.deckStats.totalSynergies}</StatValue>
            <StatLabel>Active</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              {Math.round(synergyResult.deckStats.synergyStrength * 100)}%
            </StatValue>
            <StatLabel>Strength</StatLabel>
          </StatItem>
        </StatsSection>
      </Section>

      {/* Active Synergies */}
      <Section>
        <SectionTitle>Active Synergies</SectionTitle>
        {renderActiveSynergies()}
      </Section>

      {/* Potential Synergies */}
      {renderPotentialSynergies()}

      {/* Recommendations */}
      {renderRecommendations()}
    </PanelContainer>
  );
};

export default SynergyPanel;