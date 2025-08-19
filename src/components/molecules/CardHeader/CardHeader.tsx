import React from 'react';
import { CardRarity } from '../../../models/unified/Card';
import { Text } from '../../atoms/Text';
import { RarityIndicator } from '../../atoms/RarityIndicator';
import styles from './CardHeader.module.css';

export interface CardHeaderProps {
  name: string;
  rarity: CardRarity;
  compact?: boolean;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  name,
  rarity,
  compact = false,
  alignment = 'center',
  className = ''
}) => {
  const headerClass = [
    styles.cardHeader,
    styles[alignment],
    compact && styles.compact,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClass}>
      <div className={styles.nameSection}>
        <Text 
          variant={compact ? 'body2' : 'h6'} 
          weight="semibold"
          align={alignment}
          className={styles.cardName}
        >
          {name}
        </Text>
      </div>
    </div>
  );
};
