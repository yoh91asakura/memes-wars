// Player Health Bar - Display player health and status

import React from 'react';
import { CombatPlayer } from '../../../models/Combat';
import { format } from '../../../utils/format';
import './PlayerHealth.css';

export interface PlayerHealthProps {
  player: CombatPlayer;
  compact?: boolean;
  showEffects?: boolean;
  className?: string;
}

export const PlayerHealth: React.FC<PlayerHealthProps> = ({
  player,
  compact = false,
  showEffects = true,
  className = ''
}) => {
  const healthPercent = (player.health / player.maxHealth) * 100;
  const shieldPercent = player.shield > 0 ? (player.shield / player.maxShield) * 100 : 0;
  
  const getHealthColor = (percent: number) => {
    if (percent > 75) return 'high';
    if (percent > 40) return 'medium';
    if (percent > 20) return 'low';
    return 'critical';
  };

  const healthColor = getHealthColor(healthPercent);

  return (
    <div className={`player-health ${compact ? 'compact' : ''} ${className}`}>
      {/* Player Info */}
      <div className="player-info">
        <div className="player-name">{player.username}</div>
        {!compact && (
          <div className="player-stats">
            <span className="stat kills">K: {player.kills}</span>
            <span className="stat damage">D: {format.number.compact(player.damage)}</span>
            <span className="stat accuracy">A: {format.number.percent(player.accuracy)}</span>
          </div>
        )}
      </div>

      {/* Health Bar */}
      <div className="health-container">
        <div className="health-bar">
          <div 
            className={`health-fill ${healthColor}`}
            style={{ width: `${Math.max(0, healthPercent)}%` }}
          />
          {shieldPercent > 0 && (
            <div 
              className="shield-fill"
              style={{ width: `${shieldPercent}%` }}
            />
          )}
        </div>
        <div className="health-text">
          {Math.ceil(player.health)} / {Math.ceil(player.maxHealth)}
          {player.shield > 0 && ` (+${Math.ceil(player.shield)})`}
        </div>
      </div>

      {/* Status Effects */}
      {showEffects && player.activeEffects.length > 0 && (
        <div className="status-effects">
          {player.activeEffects.map(effect => (
            <div 
              key={effect.id}
              className={`status-effect ${effect.type}`}
              title={`${effect.type}: ${format.number.duration(effect.remainingDuration / 1000)}`}
            >
              {getEffectIcon(effect.type)}
            </div>
          ))}
        </div>
      )}

      {/* Player Status Indicators */}
      <div className="status-indicators">
        {!player.isAlive && <div className="status-indicator dead">💀</div>}
        {player.health < player.maxHealth * 0.2 && player.isAlive && (
          <div className="status-indicator critical">⚠️</div>
        )}
      </div>
    </div>
  );
};

// Helper function to get effect icons
const getEffectIcon = (effectType: string): string => {
  const icons: Record<string, string> = {
    burn: '🔥',
    freeze: '❄️',
    poison: '☠️',
    heal: '💚',
    shield: '🛡️',
    speed: '💨',
    stun: '😵'
  };
  
  return icons[effectType] || '✨';
};