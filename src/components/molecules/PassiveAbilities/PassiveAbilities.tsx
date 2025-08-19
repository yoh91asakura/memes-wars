import React from 'react';
import { CardEffect, EffectType, TriggerType } from '../../../models/Card';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import styles from './PassiveAbilities.module.css';

export interface PassiveAbilitiesProps {
  cardEffects: CardEffect[];
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  className?: string;
}

// Map effect types to their visual representation
const getEffectIcon = (effect: EffectType | undefined, name?: string): string => {
  if (!effect) {
    // Fallback icons for named effects
    if (name) {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('heal') || lowerName.includes('refresh')) return '💚';
      if (lowerName.includes('shield') || lowerName.includes('wall')) return '🛡️';
      if (lowerName.includes('boost') || lowerName.includes('tailwind')) return '⚡';
      if (lowerName.includes('burn') || lowerName.includes('fire')) return '🔥';
      if (lowerName.includes('lightning') || lowerName.includes('storm')) return '⚡';
      if (lowerName.includes('troll')) return '😈';
      if (lowerName.includes('grump')) return '😠';
      if (lowerName.includes('anger') || lowerName.includes('rage')) return '😡';
      if (lowerName.includes('alone') || lowerName.includes('barrier')) return '🔮';
    }
    return '⭐';
  }

  const effectIcons: Record<EffectType, string> = {
    [EffectType.FREEZE]: '❄️',
    [EffectType.BURN]: '🔥',
    [EffectType.HEAL]: '💚',
    [EffectType.BOOST]: '⚡',
    [EffectType.SHIELD]: '🛡️',
    [EffectType.POISON]: '☠️',
    [EffectType.LUCKY]: '🍀',
    [EffectType.BURST]: '💥',
    [EffectType.REFLECT]: '🪞',
    [EffectType.MULTIPLY]: '✖️',
    [EffectType.STUN]: '😵',
    [EffectType.DRAIN]: '🧛',
    [EffectType.BARRIER]: '🔮',
    [EffectType.CHAOS]: '🌀',
    [EffectType.PRECISION]: '🎯'
  };
  return effectIcons[effect] || '⭐';
};

// Get friendly names for effect types
const getEffectName = (effect: EffectType | undefined, name?: string): string => {
  // Use name field if available (fallback for legacy cards)
  if (name) return name;
  // Handle missing effect property
  if (!effect) return 'Unknown Effect';
  return effect.charAt(0).toUpperCase() + effect.slice(1).toLowerCase();
};

// Get friendly names for trigger types
const getTriggerName = (trigger: TriggerType): string => {
  const triggerNames: Record<TriggerType, string> = {
    [TriggerType.RANDOM]: 'Random',
    [TriggerType.ON_HIT]: 'On Hit',
    [TriggerType.ON_DAMAGE]: 'When Damaged',
    [TriggerType.PERIODIC]: 'Periodic',
    [TriggerType.BATTLE_START]: 'Battle Start',
    [TriggerType.BATTLE_END]: 'Battle End',
    [TriggerType.LOW_HP]: 'Low HP',
    [TriggerType.HIGH_COMBO]: 'High Combo',
    [TriggerType.FAMILY_SYNERGY]: 'Family Synergy'
  };
  return triggerNames[trigger] || trigger;
};

export const PassiveAbilities: React.FC<PassiveAbilitiesProps> = ({
  cardEffects,
  size = 'medium',
  showDetails = false,
  className = ''
}) => {
  if (!cardEffects || cardEffects.length === 0) {
    return null;
  }

  const containerClass = [
    styles.passiveAbilities,
    styles[size],
    showDetails && styles.detailed,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {showDetails && (
        <div className={styles.header}>
          <Text 
            variant={size === 'small' ? 'caption' : 'body2'} 
            weight="semibold" 
            color="muted"
            className={styles.headerText}
          >
            Passive Abilities
          </Text>
        </div>
      )}
      
      <div className={styles.effectsList}>
        {cardEffects
          .filter(cardEffect => cardEffect.effect || (cardEffect as any).name) // Filter out invalid effects
          .map((cardEffect, index) => (
          <div key={index} className={styles.effectItem}>
            <div className={styles.effectIcon}>
              <span className={styles.iconEmoji}>
                {getEffectIcon(cardEffect.effect, (cardEffect as any).name)}
              </span>
            </div>
            
            <div className={styles.effectContent}>
              <div className={styles.effectName}>
                <Text 
                  variant={size === 'small' ? 'caption' : 'body2'} 
                  weight="medium"
                  className={styles.effectNameText}
                >
                  {getEffectName(cardEffect.effect, (cardEffect as any).name)}
                </Text>
              </div>
              
              {showDetails && (
                <div className={styles.effectDetails}>
                  <Text 
                    variant="caption" 
                    color="muted"
                    className={styles.triggerText}
                  >
                    {getTriggerName(cardEffect.trigger)} • {Math.round(cardEffect.chance * 100)}%
                  </Text>
                  {cardEffect.duration && (
                    <Text 
                      variant="caption" 
                      color="muted"
                      className={styles.durationText}
                    >
                      ({cardEffect.duration}s)
                    </Text>
                  )}
                </div>
              )}
            </div>
            
            {!showDetails && (
              <div className={styles.chanceIndicator}>
                <Text 
                  variant="caption" 
                  color="muted"
                  className={styles.chanceText}
                >
                  {Math.round(cardEffect.chance * 100)}%
                </Text>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};