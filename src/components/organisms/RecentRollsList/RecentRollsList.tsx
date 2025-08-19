import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../../types';
import { Text, Badge, Icon } from '../../atoms';
import './RecentRollsList.css';

interface RecentRollsListProps {
  cards: CardType[];
  maxCards?: number;
  onCardClick?: (card: CardType) => void;
  className?: string;
  testId?: string;
}

export const RecentRollsList: React.FC<RecentRollsListProps> = ({
  cards,
  maxCards = 10,
  onCardClick,
  className = '',
  testId,
}) => {
  const displayCards = cards.slice(0, maxCards);

  const rarityColors: Record<CardType['rarity'], string> = {
    common: '#95a5a6',
    uncommon: '#27ae60',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12',
    mythic: '#e67e22',
    cosmic: '#e74c3c'
  };

  const getTimeAgo = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (displayCards.length === 0) {
    return null;
  }

  return (
    <div className={`recent-rolls-list ${className}`.trim()} data-testid={testId}>
      <div className="recent-rolls-list__header">
        <Icon name="history" size="md" color="primary" />
        <Text variant="h5" weight="semibold" color="inherit">
          Recent Discoveries
        </Text>
        <Badge variant="info" size="sm">
          {cards.length} total
        </Badge>
      </div>

      <div className="recent-rolls-list__items">
        {displayCards.map((card, index) => (
          <motion.div
            key={`${card.id}-${index}`}
            className="recent-rolls-list__item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCardClick?.(card)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              '--rarity-color': rarityColors[card.rarity]
            } as React.CSSProperties}
          >
            <div className="recent-rolls-list__item-emoji">
              <Icon emoji={card.emoji} size="lg" />
            </div>

            <div className="recent-rolls-list__item-info">
              <div className="recent-rolls-list__item-header">
                <Text variant="subtitle" weight="medium" truncate>
                  {card.name}
                </Text>
                <Badge variant={card.rarity as any} size="sm">
                  {card.rarity}
                </Badge>
              </div>
              <Text variant="caption" color="muted" truncate>
                {card.description}
              </Text>
            </div>

            <div className="recent-rolls-list__item-stats">
              <div className="recent-rolls-list__stat">
                <Icon emoji="⚔️" size="xs" />
                <Text variant="caption">{card.stats.attack}</Text>
              </div>
              <div className="recent-rolls-list__stat">
                <Icon emoji="🛡️" size="xs" />
                <Text variant="caption">{card.stats.defense}</Text>
              </div>
            </div>

            <div className="recent-rolls-list__item-time">
              <Text variant="caption" color="muted">
                {getTimeAgo(card.createdAt)}
              </Text>
            </div>
          </motion.div>
        ))}
      </div>

      {cards.length > maxCards && (
        <div className="recent-rolls-list__more">
          <Text variant="caption" color="muted">
            +{cards.length - maxCards} more cards
          </Text>
        </div>
      )}
    </div>
  );
};
