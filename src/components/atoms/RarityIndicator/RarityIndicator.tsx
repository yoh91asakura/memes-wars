import React from 'react';
import { CardRarity } from '../../../models/unified/Card';
import { RARITY_THEMES } from '../../../constants/rarityThemes';
import styles from './RarityIndicator.module.css';

export interface RarityIndicatorProps {
  rarity: CardRarity;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'badge' | 'border' | 'glow';
  className?: string;
}

export const RarityIndicator: React.FC<RarityIndicatorProps> = ({
  rarity,
  showLabel = true,
  size = 'medium',
  variant = 'badge',
  className = ''
}) => {
  const theme = RARITY_THEMES[rarity];
  
  const indicatorClass = [
    styles.rarityIndicator,
    styles[variant],
    styles[size],
    styles[rarity.toLowerCase()],
    className
  ].filter(Boolean).join(' ');

  const getRarityIcon = (): string => {
    switch (rarity) {
      case CardRarity.COMMON: return '⚪';
      case CardRarity.UNCOMMON: return '🟢';
      case CardRarity.RARE: return '🔵';
      case CardRarity.EPIC: return '🟣';
      case CardRarity.LEGENDARY: return '🟡';
      case CardRarity.MYTHIC: return '🔴';
      case CardRarity.COSMIC: return '🌸';
      case CardRarity.DIVINE: return '⭐';
      case CardRarity.INFINITY: return '♾️';
      default: return '⚪';
    }
  };

  const getRarityLabel = (): string => {
    return rarity.charAt(0) + rarity.slice(1).toLowerCase();
  };

  return (
    <div 
      className={indicatorClass}
      style={{
        '--rarity-color': theme.borderColor,
        '--rarity-glow': theme.glowColor,
        '--rarity-bg': theme.backgroundColor,
        '--rarity-text': theme.textColor
      } as React.CSSProperties}
    >
      <span className={styles.icon}>{getRarityIcon()}</span>
      {showLabel && (
        <span className={styles.label}>{getRarityLabel()}</span>
      )}
    </div>
  );
};
