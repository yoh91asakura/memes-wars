import React from 'react';
import { UnifiedCard } from '../../../models/unified/Card';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import styles from './Card.module.css';

interface CardStatsProps {
  card: UnifiedCard;
  showAdditionalStats?: boolean;
}

export const CardStats: React.FC<CardStatsProps> = ({ 
  card, 
  showAdditionalStats = false 
}) => {
  return (
    <div className={styles.cardStats}>
      {/* Primary stats: Health and Luck */}
      <div className={styles.cardStatsPrimary}>
        <div className={styles.cardStatItem}>
          <Icon name="heart" size="sm" color="danger" />
          <Text variant="caption" weight="bold">
            {card.health}
          </Text>
        </div>
        
        <div className={styles.cardStatItem}>
          <Icon emoji="🍀" size="sm" />
          <Text variant="caption" weight="bold" color="success">
            {card.luck}
          </Text>
        </div>
      </div>
      
      {/* Additional stats if requested */}
      {showAdditionalStats && (
        <div className={styles.cardStatsSecondary}>
          <div className={`${styles.cardStatItem} ${styles.cardStatItemSmall}`}>
            <Icon emoji="⚔️" size="xs" />
            <Text variant="caption" weight="medium">
              {card.attack}
            </Text>
          </div>
          
          <div className={`${styles.cardStatItem} ${styles.cardStatItemSmall}`}>
            <Icon emoji="🛡️" size="xs" />
            <Text variant="caption" weight="medium">
              {card.defense}
            </Text>
          </div>
          
          {card.attackSpeed && (
            <div className={`${styles.cardStatItem} ${styles.cardStatItemSmall}`}>
              <Icon emoji="💨" size="xs" />
              <Text variant="caption" weight="medium">
                {card.attackSpeed.toFixed(1)}
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