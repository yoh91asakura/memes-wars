import React from 'react';
import { CardRarity } from '../../../models/unified/Card';
import { RARITY_THEMES } from '../../../constants/rarityThemes';
import styles from './CardFrame.module.css';

export interface CardFrameProps {
  rarity: CardRarity;
  children: React.ReactNode;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'battle' | 'collection';
  selected?: boolean;
  className?: string;
}

export const CardFrame: React.FC<CardFrameProps> = ({
  rarity,
  children,
  animated = true,
  size = 'medium',
  variant = 'default',
  selected = false,
  className = ''
}) => {
  // Handle undefined or invalid rarity
  if (!rarity) {
    console.warn('CardFrame: rarity is undefined, using COMMON as fallback');
  }
  
  // Fallback to COMMON if rarity not found
  const theme = RARITY_THEMES[rarity] || RARITY_THEMES[CardRarity.COMMON];
  
  const frameClass = [
    styles.cardFrame,
    styles[size],
    styles[variant],
    styles[rarity?.toLowerCase() || 'common'],
    animated && styles.animated,
    selected && styles.selected,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={frameClass}
      style={{
        '--rarity-border': theme.borderColor,
        '--rarity-glow': theme.glowColor,
        '--rarity-bg': theme.backgroundColor,
        '--rarity-shadow': theme.shadowColor,
        '--gradient-start': theme.gradientStart,
        '--gradient-end': theme.gradientEnd
      } as React.CSSProperties}
    >
      <div className={styles.frameContent}>
        {children}
      </div>
      {animated && theme.animation !== 'none' && (
        <div className={`${styles.effectOverlay} ${styles[theme.animation]}`} />
      )}
    </div>
  );
};
