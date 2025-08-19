import React from 'react';
import { EmojiProjectile } from '../../../models/unified/Card';
import { EmojiChip } from '../../atoms/EmojiChip';
import styles from './EmojiInventory.module.css';

export interface EmojiInventoryProps {
  emojis: EmojiProjectile[];
  maxDisplay?: number;
  layout?: 'grid' | 'list';
  size?: 'small' | 'medium' | 'large';
  showTooltips?: boolean;
  className?: string;
}

export const EmojiInventory: React.FC<EmojiInventoryProps> = ({
  emojis,
  maxDisplay = 6,
  layout = 'list',
  size = 'medium',
  showTooltips = true,
  className = ''
}) => {
  const inventoryClass = [
    styles.emojiInventory,
    styles[layout],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  const getChipSize = (): number => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 32;
      default: return 24;
    }
  };

  const displayEmojis = emojis.slice(0, maxDisplay);
  const remainingCount = Math.max(0, emojis.length - maxDisplay);

  if (displayEmojis.length === 0) {
    return (
      <div className={`${inventoryClass} ${styles.empty}`}>
        <span className={styles.emptyText}>No emojis</span>
      </div>
    );
  }

  return (
    <div className={inventoryClass}>
      <div className={styles.emojiList}>
        {displayEmojis.map((emoji, index) => (
          <EmojiChip
            key={index}
            emoji={emoji.character}
            size={getChipSize()}
            effect={emoji.effects?.[0]}
            damage={emoji.damage}
            showTooltip={showTooltips}
            className={styles.emojiItem}
          />
        ))}
      </div>
      {remainingCount > 0 && (
        <div className={styles.remainingCount}>
          <span>+{remainingCount}</span>
        </div>
      )}
    </div>
  );
};
