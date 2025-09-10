import React, { useState } from 'react';
import { EmojiEffectsManager, EmojiEffect } from '../../../data/emojiEffects';
import './EmojiDisplay.css';

export interface EmojiDisplayProps {
  emoji: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showEffects?: boolean;
  showTooltip?: boolean;
  showTrajectory?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: (emoji: string, effect?: EmojiEffect) => void;
}

export const EmojiDisplay: React.FC<EmojiDisplayProps> = ({
  emoji,
  size = 'medium',
  showEffects = true,
  showTooltip = true,
  showTrajectory = false,
  animated = true,
  className = '',
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const emojiEffect = EmojiEffectsManager.getEffect(emoji);

  const getDisplayClass = () => {
    const classes = [
      'emoji-display',
      `emoji-display--${size}`,
      animated && 'emoji-display--animated',
      emojiEffect && `emoji-display--${emojiEffect.rarity}`,
      emojiEffect && `emoji-display--${emojiEffect.type}`,
      onClick && 'emoji-display--clickable',
      isHovered && 'emoji-display--hovered',
      className
    ].filter(Boolean);
    
    return classes.join(' ');
  };

  const getTooltipText = () => {
    if (!emojiEffect) return emoji;
    
    return [
      `${emoji} ${emojiEffect.description}`,
      `Damage: ${emojiEffect.damage}`,
      `Speed: ${emojiEffect.speed}`,
      `Type: ${emojiEffect.type}`,
      `Trajectory: ${emojiEffect.trajectory}`,
      `Rarity: ${emojiEffect.rarity}`
    ].join('\n');
  };

  const getTrajectoryIcon = () => {
    if (!emojiEffect) return null;
    
    const trajectoryIcons = {
      straight: '→',
      arc: '↗',
      wave: '〰',
      spiral: '🌀',
      homing: '🎯'
    };
    
    return trajectoryIcons[emojiEffect.trajectory] || '→';
  };

  const getTypeIcon = () => {
    if (!emojiEffect) return null;
    
    const typeIcons = {
      direct: '💥',
      overtime: '⏰',
      utility: '🔧',
      support: '💚'
    };
    
    return typeIcons[emojiEffect.type] || '💥';
  };

  const handleClick = () => {
    if (onClick) {
      onClick(emoji, emojiEffect);
    }
  };

  return (
    <div
      className={getDisplayClass()}
      title={showTooltip ? getTooltipText() : undefined}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main emoji */}
      <div className="emoji-display__main">
        <span className="emoji-display__character">{emoji}</span>
        
        {/* Animated effect overlay */}
        {animated && emojiEffect && (
          <div className={`emoji-display__effect-overlay emoji-display__effect-overlay--${emojiEffect.type}`} />
        )}
      </div>

      {/* Effect stats */}
      {showEffects && emojiEffect && (
        <div className="emoji-display__stats">
          <div className="emoji-display__stat emoji-display__stat--damage">
            <span className="emoji-display__stat-icon">⚔️</span>
            <span className="emoji-display__stat-value">{emojiEffect.damage}</span>
          </div>
          
          <div className="emoji-display__stat emoji-display__stat--speed">
            <span className="emoji-display__stat-icon">⚡</span>
            <span className="emoji-display__stat-value">{emojiEffect.speed}</span>
          </div>
          
          {showTrajectory && (
            <div className="emoji-display__stat emoji-display__stat--trajectory">
              <span className="emoji-display__stat-icon">{getTrajectoryIcon()}</span>
            </div>
          )}
          
          <div className="emoji-display__stat emoji-display__stat--type">
            <span className="emoji-display__stat-icon">{getTypeIcon()}</span>
          </div>
        </div>
      )}

      {/* Rarity indicator */}
      {emojiEffect && (
        <div className={`emoji-display__rarity emoji-display__rarity--${emojiEffect.rarity}`}>
          <div className="emoji-display__rarity-dots">
            {Array.from({ length: getRarityDots(emojiEffect.rarity) }, (_, i) => (
              <div key={i} className="emoji-display__rarity-dot" />
            ))}
          </div>
        </div>
      )}

      {/* Special effects for higher rarities */}
      {emojiEffect && emojiEffect.rarity === 'epic' && (
        <div className="emoji-display__special-effect emoji-display__special-effect--epic" />
      )}
    </div>
  );
};

// Helper function to get number of rarity dots
function getRarityDots(rarity: string): number {
  const rarityLevels = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4
  };
  
  return rarityLevels[rarity as keyof typeof rarityLevels] || 1;
}

export default EmojiDisplay;