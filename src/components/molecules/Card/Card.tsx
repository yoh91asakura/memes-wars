import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../../types';
import { Text, Badge, Icon } from '../../atoms';
import './Card.css';

interface CardProps {
  card: CardType;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showStats?: boolean;
  onClick?: (card: CardType) => void;
  className?: string;
  testId?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  size = 'md',
  interactive = true,
  showStats = true,
  onClick,
  className = '',
  testId,
}) => {
  const handleClick = () => {
    if (interactive && onClick) {
      onClick(card);
    }
  };

  const cardClass = [
    'card',
    `card--${size}`,
    `card--${card.rarity}`,
    interactive && 'card--interactive',
    className
  ].filter(Boolean).join(' ');

  const rarityColors: Record<CardType['rarity'], string> = {
    common: '#95a5a6',
    uncommon: '#27ae60',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12',
    mythic: '#e67e22',
    cosmic: '#e74c3c'
  };

  return (
    <motion.div
      className={cardClass}
      onClick={handleClick}
      data-testid={testId}
      whileHover={interactive ? { scale: 1.05, y: -8 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
      style={{
        '--rarity-color': rarityColors[card.rarity]
      } as React.CSSProperties}
    >
      {/* Card Header */}
      <div className="card__header">
        <div className="card__name">
          <Text variant="h6" weight="semibold" truncate>
            {card.name}
          </Text>
        </div>
        <Badge variant={card.rarity as any} size="sm" rounded>
          {card.rarity}
        </Badge>
      </div>

      {/* Card Image/Emoji */}
      <div className="card__image">
        <div className="card__emoji">
          <Icon emoji={card.emoji} size="2xl" />
        </div>
        <div className="card__glow" />
      </div>

      {/* Card Description */}
      <div className="card__description">
        <Text variant="caption" color="muted">
          {card.description}
        </Text>
      </div>

      {/* Card Stats */}
      {showStats && (
        <div className="card__stats">
          <div className="card__stat">
            <Icon name="heart" size="sm" color="danger" />
            <Text variant="caption" weight="medium">
              {card.stats.health}
            </Text>
          </div>
          <div className="card__stat">
            <Icon emoji="⚔️" size="sm" />
            <Text variant="caption" weight="medium">
              {card.stats.attack}
            </Text>
          </div>
          <div className="card__stat">
            <Icon emoji="🛡️" size="sm" />
            <Text variant="caption" weight="medium">
              {card.stats.defense}
            </Text>
          </div>
          <div className="card__stat">
            <Icon emoji="💨" size="sm" />
            <Text variant="caption" weight="medium">
              {card.stats.speed}
            </Text>
          </div>
        </div>
      )}

      {/* Interactive overlay */}
      {interactive && (
        <div className="card__overlay">
          <Icon name="play" size="lg" color="primary" />
        </div>
      )}
    </motion.div>
  );
};
