import React from 'react';
import { Card } from '../../../models';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import styles from './Card.module.css';

interface CardAbilityProps {
  card: Card;
  showEffects?: boolean;
}

export const CardAbility: React.FC<CardAbilityProps> = ({ 
  card, 
  showEffects = true 
}) => {
  const hasPassiveAbility = card.passiveAbility && card.passiveAbility.name;
  const hasCardEffects = card.cardEffects && card.cardEffects.length > 0;

  if (!hasPassiveAbility && !hasCardEffects) {
    return (
      <div className={`${styles.cardAbility} ${styles.cardAbilityEmpty}`}>
        <Text variant="caption" color="muted" align="center">
          No special abilities
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.cardAbility}>
      {/* Passive Ability */}
      {hasPassiveAbility && (
        <div className="card__ability-passive">
          <div className="card__ability-header">
            <Icon emoji="⚡" size="xs" />
            <Text variant="caption" weight="semibold" color="primary">
              {card.passiveAbility!.name}
            </Text>
          </div>
          <Text variant="caption" color="muted" className="card__ability-description">
            {card.passiveAbility!.description}
          </Text>
        </div>
      )}
      
      {/* Card Effects */}
      {showEffects && hasCardEffects && (
        <div className="card__ability-effects">
          {card.cardEffects!.slice(0, 2).map((effect, index) => (
            <div key={index} className="card__effect-item">
              <div className="card__effect-header">
                <Text variant="caption" weight="medium" color="secondary">
                  {effect.effect}
                </Text>
                {effect.chance && effect.chance < 1 && (
                  <Text variant="caption" color="muted">
                    ({Math.round(effect.chance * 100)}%)
                  </Text>
                )}
              </div>
              <Text variant="caption" color="muted" className="card__effect-description">
                Trigger: {effect.trigger} | Value: {effect.value}
                {effect.duration && ` | Duration: ${effect.duration}s`}
              </Text>
            </div>
          ))}
          
          {/* Show overflow indicator if more effects */}
          {card.cardEffects!.length > 2 && (
            <div className="card__effects-overflow">
              <Text variant="caption" color="muted">
                +{card.cardEffects!.length - 2} more effects
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};