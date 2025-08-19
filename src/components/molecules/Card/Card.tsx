// DEPRECATED: This component is being replaced by TCGCard
// Use TCGCard from organisms/TCGCard instead
import React from 'react';
import { Card as LegacyCardType } from '../../types';
import { Card as CardModel, CardUtils } from '../../../models/Card';
import { TCGCard } from '../../organisms/TCGCard';

interface CardProps {
  card: CardModel | LegacyCardType;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  variant?: 'tcg' | 'compact';
  showStats?: boolean;
  showInventory?: boolean;
  showAbility?: boolean;
  onClick?: (card: CardModel | LegacyCardType) => void;
  className?: string;
  testId?: string;
}

// Type guard to check if card is CardModel
const isCardModel = (card: CardModel | LegacyCardType): card is CardModel => {
  return 'rarity' in card && typeof card.rarity === 'number';
};

// Convert legacy card to display format
const normalizeLegacyCard = (card: LegacyCardType): CardModel => {
  // Map string rarity to numeric probability
  const rarityMap: Record<string, number> = {
    'common': 2,
    'uncommon': 4,
    'rare': 10,
    'epic': 50,
    'legendary': 200,
    'mythic': 1000,
    'cosmic': 10000,
    'divine': 100000,
    'infinity': 1000000
  };
  
  const rarityString = typeof card.rarity === 'string' ? card.rarity.toLowerCase() : 'common';
  const rarityProbability = rarityMap[rarityString] || 2;
  
  return {
    id: card.id,
    name: card.name,
    description: card.description || '',
    emoji: card.emoji,
    rarity: rarityProbability,
    luck: 10, // Default luck value
    emojis: [{ // Required field - at least one emoji
      character: card.emoji || '❓',
      damage: 5,
      speed: 3,
      trajectory: 'straight' as const,
      target: 'OPPONENT' as const
    }],
    family: 'CLASSIC_INTERNET' as any, // Default family
    stackLevel: 1, // Required field
    reference: card.flavor || 'Legacy card',
    goldReward: 10, // Default gold reward
    hp: card.stats?.health || 100, // Optional field
    cardEffects: [], // Optional field
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as CardModel;
};

/**
 * @deprecated Use TCGCard from organisms/TCGCard instead
 * This component is maintained for backward compatibility only
 */
const CardComponent: React.FC<CardProps> = ({
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
  // Normalize card data for TCGCard compatibility
  const normalizedCard: CardModel = isCardModel(card) ? card : normalizeLegacyCard(card) as CardModel;
  
  // Convert legacy props to new TCGCard props
  const tcgSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium';
  const tcgVariant = variant === 'compact' ? 'collection' : 'collection';
  
  // Use new TCGCard component
  return (
    <TCGCard
      card={normalizedCard}
      size={tcgSize}
      variant={tcgVariant}
      onClick={onClick ? () => onClick(card) : undefined}
      selected={false}
      animated={interactive}
      showStats={showStats}
      showEmojis={showInventory}
      className={className}
      testId={testId}
    />
  );
};

// Export with both names for backward compatibility
export { CardComponent as Card };
export { CardComponent };
