import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardUtils } from '../../../models';
import { TCGCard } from '../../organisms/TCGCard/TCGCard';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import './CollectionCard.css';

interface CollectionCardProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  viewMode?: 'grid' | 'list';
  showActions?: boolean;
  onSelect?: (card: Card) => void;
  onAddToDeck?: (card: Card) => void;
  onRemove?: (card: Card) => void;
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

  // Get rarity name from numeric value
  const rarityName = card.rarity ? CardUtils.getRarityName(card.rarity).toLowerCase() : 'common';
  
  const cardClass = [
    'collection-card',
    `collection-card--${size}`,
    `collection-card--${viewMode}`,
    `collection-card--${rarityName}`,
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
          '--rarity-color': rarityColors[rarityName]
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
          </div>
          
          <div className="collection-card__description">
            <Text variant="body" color="muted" truncate>
              {card.description}
            </Text>
          </div>
          
          <div className="collection-card__stats-row">
            <div className="collection-card__stat">
              <Icon emoji="❤️" size="sm" />
              <Text variant="caption">{card.hp || 100}</Text>
            </div>
            <div className="collection-card__stat">
              <Icon emoji="🍀" size="sm" />
              <Text variant="caption">{card.luck || 0}</Text>
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
    <div className="collection-card__wrapper">
      <TCGCard
        card={card}
        variant="collection"
        size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
        animated={true}
        showEmojis={true}
        showStats={true}
        onClick={onSelect ? (clickedCard) => onSelect(clickedCard) : undefined}
        className={className}
        testId={testId}
      />
      
      {/* Collection-specific actions overlay */}
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
    </div>
  );
};
