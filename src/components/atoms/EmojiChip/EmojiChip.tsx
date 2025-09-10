import React from 'react';
import { EffectType } from '../../../models';
import { EmojiEffectsManager } from '../../../data/emojiEffects';
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
    const emojiEffect = EmojiEffectsManager.getEffect(emoji);
    if (emojiEffect) {
      return `${emoji} - ${emojiEffect.description} (DMG: ${emojiEffect.damage}, Speed: ${emojiEffect.speed}, Type: ${emojiEffect.type})`;
    }
    
    // Fallback to props if emoji not in central system
    let tooltip = emoji;
    if (damage) tooltip += ` (${damage} DMG)`;
    if (effect) tooltip += ` [${effect}]`;
    return tooltip;
  };

  const emojiEffect = EmojiEffectsManager.getEffect(emoji);
  const rarityClass = emojiEffect ? `rarity-${emojiEffect.rarity}` : '';

  return (
    <div 
      className={`${chipClass} ${rarityClass}`}
      style={{
        fontSize: `${size}px`
      } as React.CSSProperties}
      title={showTooltip ? getTooltipText() : undefined}
    >
      <span className={styles.emoji}>{emoji}</span>
      {emojiEffect && (
        <div className={styles.effectIndicator}>
          <span className={styles.damage}>{emojiEffect.damage}</span>
          <span className={styles.speed}>⚡{emojiEffect.speed}</span>
        </div>
      )}
    </div>
  );
};
