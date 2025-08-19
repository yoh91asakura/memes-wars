// DEPRECATED: This component is being replaced by TCGCard
// Use TCGCard from organisms/TCGCard instead
import React from 'react';
import { Card as LegacyCardType } from '../../types';
import { UnifiedCard, CardRarity } from '../../../models/unified/Card';
import { TCGCard } from '../../organisms/TCGCard';

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

/**
 * @deprecated Use TCGCard from organisms/TCGCard instead
 * This component is maintained for backward compatibility only
 */
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
  // Normalize card data for TCGCard compatibility
  const normalizedCard: UnifiedCard = isUnifiedCard(card) ? card : normalizeLegacyCard(card) as UnifiedCard;
  
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
