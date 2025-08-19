import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard } from '../../../models/unified/Card';
import { Text } from '../../atoms/Text';
import './CompactCollectionCard.css';

interface CompactCollectionCardProps {
  card: UnifiedCard;
  onMouseEnter?: (card: UnifiedCard, event: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  onClick?: (card: UnifiedCard) => void;
  className?: string;
  testId?: string;
}

export const CompactCollectionCard: React.FC<CompactCollectionCardProps> = ({
  card,
  onMouseEnter,
  onMouseLeave,
  onClick,
  className = '',
  testId
}) => {
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

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (onMouseEnter) {
      onMouseEnter(card, event);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  const cardClass = [
    'compact-collection-card',
    `compact-collection-card--${card.rarity?.toLowerCase()}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={cardClass}
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        '--rarity-color': rarityColors[card.rarity?.toLowerCase() || 'common']
      } as React.CSSProperties}
    >
      {/* Card Emoji */}
      <div className="compact-collection-card__emoji">
        <span className="compact-collection-card__emoji-text">
          {card.emoji}
        </span>
        {card.stackCount > 1 && (
          <div className="compact-collection-card__stack-badge">
            <Text variant="caption" weight="bold">
              {card.stackCount}
            </Text>
          </div>
        )}
      </div>

      {/* Rarity Indicator */}
      <div className="compact-collection-card__rarity-indicator">
        <div className="compact-collection-card__rarity-dot" />
      </div>

      {/* Card Name (truncated) */}
      <div className="compact-collection-card__name">
        <Text 
          variant="caption" 
          weight="medium" 
          truncate 
          className="compact-collection-card__name-text"
        >
          {card.name}
        </Text>
      </div>

      {/* Hover Glow Effect */}
      <div className="compact-collection-card__glow" />
    </motion.div>
  );
};

export default CompactCollectionCard;