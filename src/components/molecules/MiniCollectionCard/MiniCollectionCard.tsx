import React from 'react';
import { motion } from 'framer-motion';
import { CollectionCard } from '../../../types/CollectionCard';
import { CardUtils } from '../../../models/Card';
import { RarityIndicator } from '../../atoms/RarityIndicator';
import { Text } from '../../atoms/Text';
import './MiniCollectionCard.css';

export interface MiniCollectionCardProps {
  card: CollectionCard;
  size?: 'sm' | 'md';
  onClick?: (card: CollectionCard) => void;
  className?: string;
  testId?: string;
}

export const MiniCollectionCard: React.FC<MiniCollectionCardProps> = React.memo(({
  card,
  size = 'md',
  onClick,
  className = '',
  testId
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  // Get rarity name and color
  const rarityName = CardUtils.getRarityName(card.rarity).toLowerCase();
  
  const rarityColors: Record<string, string> = {
    common: '#95a5a6',
    uncommon: '#27ae60',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12',
    mythic: '#e67e22',
    cosmic: '#e74c3c',
    divine: '#9b59b6',
    infinity: '#2c3e50'
  };

  const cardClasses = [
    'mini-collection-card',
    `mini-collection-card--${size}`,
    `mini-collection-card--${rarityName}`,
    !card.isOwned && 'mini-collection-card--unowned',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={cardClasses}
      onClick={handleClick}
      data-testid={testId}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ duration: 0.15 }}
      style={{
        '--rarity-color': rarityColors[rarityName],
      } as React.CSSProperties}
    >
      {/* Card Content */}
      <div className="mini-collection-card__content">
        {/* Main Emoji */}
        <div className="mini-collection-card__emoji">
          <span role="img" aria-label={card.name}>
            {card.emoji}
          </span>
        </div>

        {/* Card Name */}
        <div className="mini-collection-card__name">
          <Text variant="caption" weight="medium" truncate>
            {card.name}
          </Text>
        </div>

        {/* Rarity Indicator */}
        <div className="mini-collection-card__rarity">
          <RarityIndicator 
            rarity={card.rarity} 
            displayFormat="probability" 
            variant="text"
          />
        </div>
      </div>

      {/* Ownership Count Badge */}
      {card.ownedCount > 0 && (
        <div className="mini-collection-card__count-badge">
          <Text variant="caption" weight="bold">
            {card.ownedCount}
          </Text>
        </div>
      )}

      {/* Owned/Unowned Indicator */}
      {!card.isOwned && (
        <div className="mini-collection-card__unowned-overlay">
          <div className="mini-collection-card__unowned-text">
            <Text variant="caption" color="muted">
              0
            </Text>
          </div>
        </div>
      )}
    </motion.div>
  );
});

MiniCollectionCard.displayName = 'MiniCollectionCard';