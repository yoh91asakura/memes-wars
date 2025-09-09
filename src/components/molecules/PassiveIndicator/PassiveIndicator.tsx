// Passive Indicator Component - Display active passive effects during combat
import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { ActivePassive } from '../../../services/PassiveEffectsService';

const glowAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  }
`;

const procAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const PassiveContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  border: 1px solid #333;
  min-width: 200px;
  max-width: 300px;
`;

const PassiveHeader = styled.div`
  color: #FFD700;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const PassiveList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
`;

const PassiveItem = styled.div<{ 
  isActive: boolean; 
  onCooldown: boolean;
  recentlyProc: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: ${props => {
    if (!props.isActive) return 'rgba(100, 100, 100, 0.3)';
    if (props.onCooldown) return 'rgba(255, 165, 0, 0.2)';
    return 'rgba(0, 123, 255, 0.2)';
  }};
  border: 1px solid ${props => {
    if (!props.isActive) return '#666';
    if (props.onCooldown) return '#FFA500';
    return '#007BFF';
  }};
  border-radius: 6px;
  opacity: ${props => props.isActive ? 1 : 0.5};
  
  ${props => props.isActive && css`
    animation: ${glowAnimation} 2s ease-in-out infinite;
  `}
  
  ${props => props.recentlyProc && css`
    animation: ${procAnimation} 0.5s ease-out;
  `}
`;

const PassiveInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const PassiveName = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 12px;
`;

const PassiveTrigger = styled.div`
  color: #aaa;
  font-size: 10px;
  text-transform: capitalize;
`;

const PassiveStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const ProcCount = styled.div`
  color: #FFD700;
  font-size: 11px;
  font-weight: bold;
`;

const Cooldown = styled.div<{ onCooldown: boolean }>`
  color: ${props => props.onCooldown ? '#FFA500' : '#28a745'};
  font-size: 10px;
`;

const ChanceIndicator = styled.div`
  color: #fff;
  font-size: 10px;
`;

const EffectIcon = styled.div<{ effectType: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 8px;
  background: ${props => {
    switch (props.effectType) {
      case 'HEAL': return '#28a745';
      case 'BOOST': return '#007BFF';
      case 'SHIELD': return '#6c757d';
      case 'BURN': return '#dc3545';
      case 'FREEZE': return '#17a2b8';
      case 'POISON': return '#6f42c1';
      case 'LUCKY': return '#FFD700';
      case 'BURST': return '#fd7e14';
      case 'REFLECT': return '#e83e8c';
      case 'MULTIPLY': return '#20c997';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const NoPassives = styled.div`
  color: #666;
  text-align: center;
  font-style: italic;
  padding: 20px;
`;

interface PassiveIndicatorProps {
  passives: ActivePassive[];
  playerId: string;
  className?: string;
}

const PassiveIndicator: React.FC<PassiveIndicatorProps> = ({ 
  passives, 
  playerId: _playerId, 
  className 
}) => {
  if (!passives || passives.length === 0) {
    return (
      <PassiveContainer className={className}>
        <PassiveHeader>Passive Effects</PassiveHeader>
        <NoPassives>No passive effects active</NoPassives>
      </PassiveContainer>
    );
  }

  const getEffectIcon = (effectType: string): string => {
    const iconMap: Record<string, string> = {
      'HEAL': '❤️',
      'BOOST': '⚡',
      'SHIELD': '🛡️',
      'BURN': '🔥',
      'FREEZE': '❄️',
      'POISON': '💜',
      'LUCKY': '🍀',
      'BURST': '💥',
      'REFLECT': '🌈',
      'MULTIPLY': '✨',
      'STUN': '😵',
      'DRAIN': '🩸',
      'BARRIER': '💎',
      'CHAOS': '🔮',
      'PRECISION': '🎯'
    };
    return iconMap[effectType] || '❓';
  };

  const formatTrigger = (trigger: string): string => {
    return trigger.toLowerCase().replace(/_/g, ' ');
  };

  const formatCooldown = (cooldownMs: number): string => {
    if (cooldownMs <= 0) return 'Ready';
    const seconds = Math.ceil(cooldownMs / 1000);
    return `${seconds}s`;
  };

  return (
    <PassiveContainer className={className}>
      <PassiveHeader>
        Passive Effects ({passives.filter(p => p.isActive).length}/{passives.length})
      </PassiveHeader>
      
      <PassiveList>
        {passives.map((passive) => (
          <PassiveItem
            key={passive.id}
            isActive={passive.isActive}
            onCooldown={passive.cooldownRemaining > 0}
            recentlyProc={Date.now() - passive.lastProcTime < 1000}
          >
            <EffectIcon effectType={passive.effect.effect}>
              {getEffectIcon(passive.effect.effect)}
            </EffectIcon>
            
            <PassiveInfo>
              <PassiveName>
                {passive.effect.effect.toLowerCase().replace('_', ' ')}
              </PassiveName>
              <PassiveTrigger>
                {formatTrigger(passive.effect.trigger)}
              </PassiveTrigger>
            </PassiveInfo>
            
            <PassiveStats>
              <ProcCount>
                {passive.procCount}x
              </ProcCount>
              <ChanceIndicator>
                {Math.round(passive.effect.chance * 100)}%
              </ChanceIndicator>
              <Cooldown onCooldown={passive.cooldownRemaining > 0}>
                {formatCooldown(passive.cooldownRemaining)}
              </Cooldown>
            </PassiveStats>
          </PassiveItem>
        ))}
      </PassiveList>
    </PassiveContainer>
  );
};

export default PassiveIndicator;