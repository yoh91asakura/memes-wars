import React from 'react';
import { Emoji } from '../../../models/Card';
import { EmojiChip } from '../../atoms/EmojiChip';
import styles from './EmojiInventory.module.css';

export interface EmojiInventoryProps {
  emojis: Emoji[];
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
      case 'small': return 24;
      case 'large': return 40;
      default: return 32;
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
            effect={emoji.effect}
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
