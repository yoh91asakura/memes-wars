import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedCard } from '../../../models/unified/Card';
import { Text } from '../../atoms/Text';
import { Badge } from '../../atoms/Badge';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import './CollectionCard.css';

interface CollectionCardProps {
  card: UnifiedCard;
  size?: 'sm' | 'md' | 'lg';
  viewMode?: 'grid' | 'list';
  showActions?: boolean;
  onSelect?: (card: UnifiedCard) => void;
  onAddToDeck?: (card: UnifiedCard) => void;
  onRemove?: (card: UnifiedCard) => void;
  className?: string;
  testId?: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  card,
  size = 'md',
  viewMode = 'grid',
  showActions = true,
  onSelect,
  onAddToDeck,
  onRemove,
  className = '',
  testId
}) => {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(card);
    }
  };

  const handleAddToDeck = () => {
    if (onAddToDeck) {
      onAddToDeck(card);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(card);
    }
  };

  const cardClass = [
    'collection-card',
    `collection-card--${size}`,
    `collection-card--${viewMode}`,
    `collection-card--${card.rarity?.toLowerCase()}`,
    className
  ].filter(Boolean).join(' ');

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

  const cardPower = card.attack + card.defense + card.health;
  const addedDate = card.addedAt ? new Date(card.addedAt).toLocaleDateString() : 'Unknown';

  if (viewMode === 'list') {
    return (
      <motion.div
        className={cardClass}
        onClick={handleSelect}
        data-testid={testId}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        transition={{ duration: 0.2 }}
        style={{
          '--rarity-color': rarityColors[card.rarity?.toLowerCase() || 'common']
        } as React.CSSProperties}
      >
        <div className="collection-card__emoji">
          <Icon emoji={card.emoji} size="lg" />
        </div>
        
        <div className="collection-card__info">
          <div className="collection-card__header">
            <Text variant="h6" weight="semibold" truncate>
              {card.name}
            </Text>
            <Badge variant={card.rarity?.toLowerCase() as any} size="sm">
              {card.rarity}
            </Badge>
          </div>
          
          <div className="collection-card__description">
            <Text variant="body" color="muted" truncate>
              {card.description}
            </Text>
          </div>
          
          <div className="collection-card__stats-row">
            <div className="collection-card__stat">
              <Icon emoji="⚔️" size="sm" />
              <Text variant="caption">{card.attack}</Text>
            </div>
            <div className="collection-card__stat">
              <Icon emoji="🛡️" size="sm" />
              <Text variant="caption">{card.defense}</Text>
            </div>
            <div className="collection-card__stat">
              <Icon name="heart" size="sm" color="danger" />
              <Text variant="caption">{card.health}</Text>
            </div>
            <div className="collection-card__stat">
              <Icon emoji="⚡" size="sm" />
              <Text variant="caption" weight="medium">{cardPower}</Text>
            </div>
            <div className="collection-card__date">
              <Text variant="caption" color="muted">{addedDate}</Text>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="collection-card__actions">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToDeck}
              testId={`${testId}-add-deck`}
            >
              <Icon name="plus" size="sm" />
              Deck
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              testId={`${testId}-remove`}
            >
              <Icon name="trash" size="sm" />
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cardClass}
      onClick={handleSelect}
      data-testid={testId}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{
        '--rarity-color': rarityColors[card.rarity?.toLowerCase() || 'common']
      } as React.CSSProperties}
    >
      {/* Card Header */}
      <div className="collection-card__header">
        <Text variant="h6" weight="semibold" truncate>
          {card.name}
        </Text>
        <Badge variant={card.rarity?.toLowerCase() as any} size="sm" rounded>
          {card.rarity}
        </Badge>
      </div>

      {/* Card Image/Emoji */}
      <div className="collection-card__image">
        <div className="collection-card__emoji">
          <Icon emoji={card.emoji} size="2xl" />
        </div>
        <div className="collection-card__glow" />
      </div>

      {/* Card Description */}
      <div className="collection-card__description">
        <Text variant="caption" color="muted">
          {card.description}
        </Text>
      </div>

      {/* Card Stats */}
      <div className="collection-card__stats">
        <div className="collection-card__stat">
          <Icon name="heart" size="sm" color="danger" />
          <Text variant="caption" weight="medium">
            {card.health}
          </Text>
        </div>
        <div className="collection-card__stat">
          <Icon emoji="⚔️" size="sm" />
          <Text variant="caption" weight="medium">
            {card.attack}
          </Text>
        </div>
        <div className="collection-card__stat">
          <Icon emoji="🛡️" size="sm" />
          <Text variant="caption" weight="medium">
            {card.defense}
          </Text>
        </div>
        <div className="collection-card__stat">
          <Icon emoji="⚡" size="sm" />
          <Text variant="caption" weight="bold">
            {cardPower}
          </Text>
        </div>
      </div>

      {/* Card Meta */}
      <div className="collection-card__meta">
        <Text variant="caption" color="muted">
          Added: {addedDate}
        </Text>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="collection-card__actions">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToDeck}
            testId={`${testId}-add-deck`}
          >
            <Icon name="plus" size="sm" />
            Add to Deck
          </Button>
        </div>
      )}
    </motion.div>
  );
};
