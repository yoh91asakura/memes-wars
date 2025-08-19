import React from 'react';
import { CardUtils } from '../../../models/Card';
import styles from './RarityIndicator.module.css';

export interface RarityIndicatorProps {
  rarity: number | string; // Accept both numeric and string rarity
  displayFormat?: 'name' | 'probability'; // New prop to control display format
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'badge' | 'border' | 'glow' | 'text'; // Add text variant
  className?: string;
}

export const RarityIndicator: React.FC<RarityIndicatorProps> = ({
  rarity,
  displayFormat = 'probability', // Default to probability format
  showLabel = true,
  size = 'medium',
  variant = 'text', // Default to text variant (no badge)
  className = ''
}) => {
  // Convert string rarity to numeric if needed
  const numericRarity = typeof rarity === 'string' ? getNumericRarity(rarity) : rarity;
  
  const indicatorClass = [
    styles.rarityIndicator,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  // Convert string rarity names to numeric values
  function getNumericRarity(rarityString: string): number {
    const rarityMap: Record<string, number> = {
      'common': 2,
      'uncommon': 4,
      'rare': 10,
      'epic': 50,
      'legendary': 200,
      'mythic': 1000,
      'cosmic': 10000,
      'divine': 100000,
      'infinity': 1000000,
      'beyond': 10000000
    };
    return rarityMap[rarityString.toLowerCase()] || 2;
  }

  const getRarityText = (): string => {
    if (displayFormat === 'probability') {
      return `1/${numericRarity}`;
    } else {
      return typeof rarity === 'string' ? rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase() : CardUtils.getRarityName(numericRarity);
    }
  };

  // For text variant, just display the text without any styling
  if (variant === 'text') {
    return (
      <span className={`${styles.rarityText} ${className}`}>
        {getRarityText()}
      </span>
    );
  }

  // Legacy badge/border/glow variants (kept for compatibility)
  return (
    <div className={indicatorClass}>
      {showLabel && (
        <span className={styles.label}>{getRarityText()}</span>
      )}
    </div>
  );
};
