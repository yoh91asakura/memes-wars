import React from 'react';
import { Card } from '../../../models/Card';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import styles from './Card.module.css';

interface CardStatsProps {
  card: Card;
  showAdditionalStats?: boolean;
}

export const CardStats: React.FC<CardStatsProps> = ({ 
  card, 
  showAdditionalStats = false 
}) => {
  return (
    <div className={styles.cardStats}>
      {/* Primary stats: HP and Luck */}
      <div className={styles.cardStatsPrimary}>
        <div className={styles.cardStatItem}>
          <Icon name="heart" size="sm" color="danger" />
          <Text variant="caption" weight="bold">
            {card.hp || 100}
          </Text>
        </div>
        
        <div className={styles.cardStatItem}>
          <Icon emoji="🍀" size="sm" />
          <Text variant="caption" weight="bold" color="success">
            {card.luck || 10}
          </Text>
        </div>
      </div>
      
      {/* Additional stats if requested - Stack Level */}
      {showAdditionalStats && (
        <div className={styles.cardStatsSecondary}>
          <div className={`${styles.cardStatItem} ${styles.cardStatItemSmall}`}>
            <Icon emoji="🔥" size="xs" />
            <Text variant="caption" weight="medium">
              Stack: {card.stackLevel || 1}
            </Text>
          </div>
          
          {card.emojis && card.emojis.length > 0 && (
            <div className={`${styles.cardStatItem} ${styles.cardStatItemSmall}`}>
              <Icon emoji="🎯" size="xs" />
              <Text variant="caption" weight="medium">
                {card.emojis.length} emojis
              </Text>
            </div>
          )}
        </div>
      )}
      
      {/* Gold reward if available */}
      {card.goldReward && card.goldReward > 0 && (
        <div className={styles.cardStatsReward}>
          <div className={`${styles.cardStatItem} ${styles.cardStatItemReward}`}>
            <Icon emoji="💰" size="sm" />
            <Text variant="caption" weight="medium" color="warning">
              {card.goldReward}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};