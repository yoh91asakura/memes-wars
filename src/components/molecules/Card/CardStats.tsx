import React from 'react';
import { UnifiedCard } from '../../../models/unified/Card';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';

interface CardStatsProps {
  card: UnifiedCard;
  showAdditionalStats?: boolean;
}

export const CardStats: React.FC<CardStatsProps> = ({ 
  card, 
  showAdditionalStats = false 
}) => {
  return (
    <div className="card__stats">
      {/* Primary stats: Health and Luck */}
      <div className="card__stats-primary">
        <div className="card__stat-item">
          <Icon name="heart" size="sm" color="danger" />
          <Text variant="caption" weight="bold" color="default">
            {card.health}
          </Text>
        </div>
        
        <div className="card__stat-item">
          <Icon emoji="🍀" size="sm" />
          <Text variant="caption" weight="bold" color="success">
            {card.luck}
          </Text>
        </div>
      </div>
      
      {/* Additional stats if requested */}
      {showAdditionalStats && (
        <div className="card__stats-secondary">
          <div className="card__stat-item card__stat-item--small">
            <Icon emoji="⚔️" size="xs" />
            <Text variant="caption" weight="medium">
              {card.attack}
            </Text>
          </div>
          
          <div className="card__stat-item card__stat-item--small">
            <Icon emoji="🛡️" size="xs" />
            <Text variant="caption" weight="medium">
              {card.defense}
            </Text>
          </div>
          
          {card.attackSpeed && (
            <div className="card__stat-item card__stat-item--small">
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
        <div className="card__stats-reward">
          <div className="card__stat-item card__stat-item--reward">
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