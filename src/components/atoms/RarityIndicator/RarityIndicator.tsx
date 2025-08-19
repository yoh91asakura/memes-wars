import React from 'react';
import { CardUtils } from '../../../models/Card';
// CardRarity removed - using number rarity now;
import { RARITY_THEMES } from '../../../constants/rarityThemes';
import styles from './RarityIndicator.module.css';

export interface RarityIndicatorProps {
  rarity: string;
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
    styles[typeof rarity === 'string' ? rarity.toLowerCase() : CardUtils.getRarityName(rarity).toLowerCase()],
    className
  ].filter(Boolean).join(' ');

  const getRarityIcon = (): string => {
    switch (rarity) {
      case 2: return '⚪';
      case 4: return '🟢';
      case 10: return '🔵';
      case 50: return '🟣';
      case 200: return '🟡';
      case 1000: return '🔴';
      case 10000: return '🌸';
      case 100000: return '⭐';
      case 1000000: return '♾️';
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
