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
const getEffectIcon = (effect: EffectType): string => {
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
const getEffectName = (effect: EffectType): string => {
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
        {cardEffects.map((cardEffect, index) => (
          <div key={index} className={styles.effectItem}>
            <div className={styles.effectIcon}>
              <span className={styles.iconEmoji}>
                {getEffectIcon(cardEffect.effect)}
              </span>
            </div>
            
            <div className={styles.effectContent}>
              <div className={styles.effectName}>
                <Text 
                  variant={size === 'small' ? 'caption' : 'body2'} 
                  weight="medium"
                  className={styles.effectNameText}
                >
                  {getEffectName(cardEffect.effect)}
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