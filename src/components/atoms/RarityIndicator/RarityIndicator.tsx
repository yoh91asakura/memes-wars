import React from 'react';
import { CardUtils } from '../../../models/Card';
// CardRarity removed - using number rarity now;
import { getRarityThemeByName } from '../../../constants/rarityThemes';
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
  const theme = getRarityThemeByName(rarity);
  
  const indicatorClass = [
    styles.rarityIndicator,
    styles[variant],
    styles[size],
    styles[typeof rarity === 'string' ? rarity.toLowerCase() : CardUtils.getRarityName(rarity).toLowerCase()],
    className
  ].filter(Boolean).join(' ');

  const getRarityIcon = (): string => {
    switch (rarity.toLowerCase()) {
      case 'common': return '⚪';
      case 'uncommon': return '🟢';
      case 'rare': return '🔵';
      case 'epic': return '🟣';
      case 'legendary': return '🟡';
      case 'mythic': return '🔴';
      case 'cosmic': return '🌸';
      case 'divine': return '⭐';
      case 'infinity':
      case 'beyond': return '♾️';
      default: return '⚪';
    }
  };

  const getRarityLabel = (): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
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
