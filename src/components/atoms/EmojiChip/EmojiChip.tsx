import React from 'react';
import { EffectType } from '../../../models';
import styles from './EmojiChip.module.css';

export interface EmojiChipProps {
  emoji: string;
  size?: number;
  effect?: EffectType;
  damage?: number;
  showTooltip?: boolean;
  className?: string;
}

export const EmojiChip: React.FC<EmojiChipProps> = ({
  emoji,
  size = 24,
  effect,
  damage,
  showTooltip = false,
  className = ''
}) => {
  const chipClass = [
    styles.emojiChip,
    className
  ].filter(Boolean).join(' ');

  const getTooltipText = (): string => {
    let tooltip = emoji;
    if (damage) tooltip += ` (${damage} DMG)`;
    if (effect) tooltip += ` [${effect}]`;
    return tooltip;
  };

  return (
    <div 
      className={chipClass}
      style={{
        fontSize: `${size}px`
      } as React.CSSProperties}
      title={showTooltip ? getTooltipText() : undefined}
    >
      <span className={styles.emoji}>{emoji}</span>
    </div>
  );
};
