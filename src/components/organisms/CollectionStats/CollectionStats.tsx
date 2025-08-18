import React from 'react';
import { CardRarity } from '../../../models/unified/Card';
import { Text } from '../../atoms/Text';
import { Badge } from '../../atoms/Badge';
import { Icon } from '../../atoms/Icon';
import './CollectionStats.css';

interface CollectionStatsProps {
  totalCards: number;
  uniqueCards: number;
  cardsByRarity: Record<CardRarity, number>;
  completionPercentage: number;
  totalValue: number;
  className?: string;
  testId?: string;
}

const rarityDisplay = [
  { key: 'COMMON' as CardRarity, label: 'Common', color: '#95a5a6', icon: '⚪' },
  { key: 'UNCOMMON' as CardRarity, label: 'Uncommon', color: '#27ae60', icon: '🟢' },
  { key: 'RARE' as CardRarity, label: 'Rare', color: '#3498db', icon: '🔵' },
  { key: 'EPIC' as CardRarity, label: 'Epic', color: '#9b59b6', icon: '🟣' },
  { key: 'LEGENDARY' as CardRarity, label: 'Legendary', color: '#f39c12', icon: '🟠' },
  { key: 'MYTHIC' as CardRarity, label: 'Mythic', color: '#e67e22', icon: '🔴' },
  { key: 'COSMIC' as CardRarity, label: 'Cosmic', color: '#e74c3c', icon: '✨' }
];

export const CollectionStats: React.FC<CollectionStatsProps> = ({
  totalCards,
  uniqueCards,
  cardsByRarity,
  completionPercentage,
  totalValue,
  className = '',
  testId
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className={`collection-stats ${className}`} data-testid={testId}>
      {/* Overall Statistics */}
      <div className="collection-stats__overview">
        <div className="collection-stats__card collection-stats__card--primary">
          <div className="collection-stats__icon">
            <Icon emoji="📚" size="xl" />
          </div>
          <div className="collection-stats__content">
            <Text variant="h2" weight="bold">
              {formatNumber(totalCards)}
            </Text>
            <Text variant="caption" color="muted">
              Total Cards
            </Text>
          </div>
        </div>
        
        <div className="collection-stats__card collection-stats__card--secondary">
          <div className="collection-stats__icon">
            <Icon emoji="🆔" size="xl" />
          </div>
          <div className="collection-stats__content">
            <Text variant="h2" weight="bold">
              {formatNumber(uniqueCards)}
            </Text>
            <Text variant="caption" color="muted">
              Unique Cards
            </Text>
          </div>
        </div>
        
        <div className="collection-stats__card collection-stats__card--success">
          <div className="collection-stats__icon">
            <Icon emoji="📊" size="xl" />
          </div>
          <div className="collection-stats__content">
            <Text variant="h2" weight="bold">
              {completionPercentage}%
            </Text>
            <Text variant="caption" color="muted">
              Collection Complete
            </Text>
          </div>
        </div>
        
        <div className="collection-stats__card collection-stats__card--warning">
          <div className="collection-stats__icon">
            <Icon emoji="💰" size="xl" />
          </div>
          <div className="collection-stats__content">
            <Text variant="h2" weight="bold">
              {formatNumber(totalValue)}
            </Text>
            <Text variant="caption" color="muted">
              Total Gold Value
            </Text>
          </div>
        </div>
      </div>
      
      {/* Completion Progress */}
      <div className="collection-stats__progress">
        <div className="collection-stats__progress-header">
          <Text variant="h6" weight="semibold">
            Collection Progress
          </Text>
          <Badge variant="primary">
            {completionPercentage}% Complete
          </Badge>
        </div>
        <div className="collection-stats__progress-bar">
          <div 
            className="collection-stats__progress-fill"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Rarity Breakdown */}
      <div className="collection-stats__rarity">
        <Text variant="h6" weight="semibold" className="collection-stats__section-title">
          Cards by Rarity
        </Text>
        <div className="collection-stats__rarity-grid">
          {rarityDisplay.map((rarity) => {
            const count = cardsByRarity[rarity.key] || 0;
            return (
              <div 
                key={rarity.key}
                className="collection-stats__rarity-item"
                style={{
                  '--rarity-color': rarity.color
                } as React.CSSProperties}
              >
                <div className="collection-stats__rarity-header">
                  <div className="collection-stats__rarity-icon">
                    <Icon emoji={rarity.icon} size="md" />
                  </div>
                  <Text variant="caption" color="muted">
                    {rarity.label}
                  </Text>
                </div>
                <Text variant="h4" weight="bold">
                  {formatNumber(count)}
                </Text>
                {count > 0 && (
                  <div className="collection-stats__rarity-indicator" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
