import React from 'react';
import { motion } from 'framer-motion';
import { Card as LegacyCardType } from '../../types';
import { UnifiedCard, CardRarity } from '../../../models/unified/Card';
import { Text } from '../../atoms/Text';
import { Badge } from '../../atoms/Badge';
import { CardArtwork } from './CardArtwork';
import { CardInventory } from './CardInventory';
import { CardStats } from './CardStats';
import { CardAbility } from './CardAbility';
import './Card.css';

interface CardProps {
  card: UnifiedCard | LegacyCardType;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  variant?: 'tcg' | 'compact';
  showStats?: boolean;
  showInventory?: boolean;
  showAbility?: boolean;
  onClick?: (card: UnifiedCard | LegacyCardType) => void;
  className?: string;
  testId?: string;
}

// Type guard to check if card is UnifiedCard
const isUnifiedCard = (card: UnifiedCard | LegacyCardType): card is UnifiedCard => {
  return 'rarity' in card && typeof card.rarity === 'string' && Object.values(CardRarity).includes(card.rarity as CardRarity);
};

// Convert legacy card to display format
const normalizeLegacyCard = (card: LegacyCardType): UnifiedCard => {
  return {
    id: card.id,
    name: card.name,
    description: card.description,
    emoji: card.emoji,
    rarity: card.rarity.toUpperCase() as CardRarity,
    rarityProbability: 10, // Default probability
    luck: 0, // Legacy cards don't have luck
    family: 'CLASSIC_INTERNET' as any, // Default family
    reference: card.flavor || 'Legacy card',
    goldReward: 10, // Default gold reward
    type: 'CREATURE' as any, // Default type
    cost: card.cost || 1,
    attack: card.stats?.attack || 0,
    defense: card.stats?.defense || 0,
    health: card.stats?.health || 0,
    attackSpeed: 1.0,
    passiveAbility: {
      name: 'No Ability',
      description: 'This card has no special ability',
      trigger: 'onPlay' as any,
      effect: 'none'
    },
    goldGeneration: 1,
    dustValue: 5,
    tradeable: true,
    level: 1,
    experience: 0,
    stackCount: 1,
    maxStacks: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: [],
      effectBonus: 0,
      damageBonus: 0
    },
    visual: {
      glow: '#ffffff',
      borderColor: '#e9ecef',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    },
    emojis: [], // Legacy cards don't have emoji inventory
    cardEffects: [],
    synergies: [],
    craftable: false,
    isActive: true,
    isLimited: false,
    effects: [],
    tags: card.tags || [],
    flavor: card.flavor,
    releaseDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as UnifiedCard;
};

export const Card: React.FC<CardProps> = ({
  card,
  size = 'md',
  interactive = true,
  variant = 'tcg',
  showStats = true,
  showInventory = true,
  showAbility = true,
  onClick,
  className = '',
  testId,
}) => {
  // Normalize card data
  const normalizedCard: UnifiedCard = isUnifiedCard(card) ? card : normalizeLegacyCard(card) as UnifiedCard;
  
  const handleClick = () => {
    if (interactive && onClick) {
      onClick(card);
    }
  };

  const cardClass = [
    'card',
    `card--${variant}`,
    `card--${size}`,
    `card--${normalizedCard.rarity.toLowerCase()}`,
    interactive && 'card--interactive',
    className
  ].filter(Boolean).join(' ');

  // Get rarity probability for display
  const getRarityProbability = (): string => {
    if (!normalizedCard.rarityProbability) return '';
    return `(1/${normalizedCard.rarityProbability})`;
  };

  if (variant === 'compact') {
    // Legacy compact layout for backward compatibility
    return (
      <motion.div
        className={cardClass}
        onClick={handleClick}
        data-testid={testId}
        whileHover={interactive ? { scale: 1.05, y: -8 } : undefined}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2 }}
      >
        <div className="card__header">
          <Text variant="h6" weight="semibold" truncate>
            {normalizedCard.name}
          </Text>
          <Badge variant={normalizedCard.rarity.toLowerCase() as any} size="sm" rounded>
            {normalizedCard.rarity}
          </Badge>
        </div>
        <div className="card__description">
          <Text variant="caption" color="muted">
            {normalizedCard.description}
          </Text>
        </div>
        {showStats && <CardStats card={normalizedCard} />}
      </motion.div>
    );
  }

  // TCG Layout
  return (
    <motion.div
      className={cardClass}
      onClick={handleClick}
      data-testid={testId}
      whileHover={interactive ? { scale: 1.02, y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.3 }}
      style={{
        '--card-glow': normalizedCard.visual?.glow || '#ffffff',
        '--card-border': normalizedCard.visual?.borderColor || '#e9ecef',
        '--card-bg': normalizedCard.visual?.backgroundColor || '#ffffff',
        '--card-text': normalizedCard.visual?.textColor || '#000000'
      } as React.CSSProperties}
    >
      {/* Card Artwork Section (60%) */}
      <div className="card__artwork-section">
        <CardArtwork card={normalizedCard} size={size} />
      </div>

      {/* Card Inventory Section (15%) */}
      {showInventory && normalizedCard.emojis && normalizedCard.emojis.length > 0 && (
        <div className="card__inventory-section">
          <CardInventory card={normalizedCard} />
        </div>
      )}

      {/* Card Stats Section (10%) */}
      {showStats && (
        <div className="card__stats-section">
          <CardStats card={normalizedCard} />
        </div>
      )}

      {/* Card Ability Section (10%) */}
      {showAbility && (
        <div className="card__ability-section">
          <CardAbility card={normalizedCard} />
        </div>
      )}

      {/* Card Rarity Section (5%) */}
      <div className="card__rarity-section">
        <div className="card__rarity">
          <Text variant="caption" weight="bold" color="primary" align="center">
            {normalizedCard.rarity} {getRarityProbability()}
          </Text>
        </div>
      </div>

      {/* Interactive overlay */}
      {interactive && (
        <div className="card__overlay">
          <div className="card__overlay-content">
            <Text variant="caption" color="primary" weight="medium">
              Click to view
            </Text>
          </div>
        </div>
      )}
    </motion.div>
  );
};
