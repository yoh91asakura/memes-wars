import React from 'react';
import { EffectType } from '../../../models/unified/Card';
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
    effect && styles[`effect-${effect.toLowerCase()}`],
    className
  ].filter(Boolean).join(' ');

  const getEffectColor = (): string => {
    switch (effect) {
      case EffectType.FIRE:
      case EffectType.BURN:
        return '#ef4444';
      case EffectType.FREEZE:
      case EffectType.STUN:
        return '#3b82f6';
      case EffectType.HEAL:
      case EffectType.HEAL_SELF:
        return '#10b981';
      case EffectType.POISON:
        return '#8b5cf6';
      case EffectType.LIGHTNING:
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

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
        fontSize: `${size}px`,
        '--effect-color': getEffectColor()
      } as React.CSSProperties}
      title={showTooltip ? getTooltipText() : undefined}
    >
      <span className={styles.emoji}>{emoji}</span>
      {damage && (
        <span className={styles.damage}>{damage}</span>
      )}
      {effect && (
        <div className={styles.effectIndicator} />
      )}
    </div>
  );
};
