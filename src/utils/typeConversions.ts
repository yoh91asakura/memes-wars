// Type conversion utilities for UnifiedCard <-> Legacy Card compatibility
// This file provides seamless conversion between the new UnifiedCard model
// and the legacy Card interface used by existing components

import { UnifiedCard, CardRarity } from '../models/unified/Card';
import { Card, Rarity } from '../components/types';

/**
 * Maps CardRarity enum values to legacy lowercase string literals
 */
export const rarityEnumToString = (rarity: CardRarity): Rarity => {
  switch (rarity) {
    case CardRarity.COMMON:
      return 'common';
    case CardRarity.UNCOMMON:
      return 'uncommon';
    case CardRarity.RARE:
      return 'rare';
    case CardRarity.EPIC:
      return 'epic';
    case CardRarity.LEGENDARY:
      return 'legendary';
    case CardRarity.MYTHIC:
      return 'mythic';
    case CardRarity.COSMIC:
      return 'cosmic';
    default:
      return 'common';
  }
};

/**
 * Maps legacy lowercase rarity strings to CardRarity enum
 */
export const stringToRarityEnum = (rarity: Rarity): CardRarity => {
  switch (rarity) {
    case 'common':
      return CardRarity.COMMON;
    case 'uncommon':
      return CardRarity.UNCOMMON;
    case 'rare':
      return CardRarity.RARE;
    case 'epic':
      return CardRarity.EPIC;
    case 'legendary':
      return CardRarity.LEGENDARY;
    case 'mythic':
      return CardRarity.MYTHIC;
    case 'cosmic':
      return CardRarity.COSMIC;
    default:
      return CardRarity.COMMON;
  }
};

/**
 * Converts a UnifiedCard to legacy Card format for backward compatibility
 */
export const convertUnifiedCardToLegacy = (unifiedCard: UnifiedCard): Card => {
  return {
    id: unifiedCard.id,
    name: unifiedCard.name,
    description: unifiedCard.description,
    imageUrl: '', // UnifiedCard doesn't have imageUrl, legacy components rarely use it
    rarity: rarityEnumToString(unifiedCard.rarity),
    emoji: unifiedCard.emoji,
    type: unifiedCard.type,
    cost: unifiedCard.cost,
    damage: unifiedCard.attack, // Map attack to damage for legacy compatibility
    attack: unifiedCard.attack,
    defense: unifiedCard.defense,
    stats: {
      attack: unifiedCard.attack,
      defense: unifiedCard.defense,
      health: unifiedCard.health,
      speed: unifiedCard.attackSpeed || 60 // Default speed if not specified
    },
    effects: unifiedCard.cardEffects?.map(effect => effect.name) || [],
    tags: [unifiedCard.family], // Use family as a tag
    ability: unifiedCard.passiveAbility?.name,
    flavor: unifiedCard.reference,
    createdAt: new Date() // Legacy field, use current date
  };
};

/**
 * Converts a legacy Card to UnifiedCard format
 * Note: This conversion loses some UnifiedCard-specific data
 */
export const convertLegacyCardToUnified = (legacyCard: Card): Partial<UnifiedCard> => {
  return {
    id: legacyCard.id,
    name: legacyCard.name,
    description: legacyCard.description,
    emoji: legacyCard.emoji,
    rarity: stringToRarityEnum(legacyCard.rarity),
    attack: legacyCard.attack || legacyCard.stats.attack,
    defense: legacyCard.defense || legacyCard.stats.defense,
    health: legacyCard.stats.health,
    attackSpeed: legacyCard.stats.speed,
    cost: legacyCard.cost || 1,
    // Default values for UnifiedCard-specific fields
    rarityProbability: getRarityProbability(legacyCard.rarity),
    luck: getRarityLuck(legacyCard.rarity),
    goldReward: getRarityGoldReward(legacyCard.rarity),
    reference: legacyCard.flavor || legacyCard.name,
    emojis: [], // Would need to be populated separately
    cardEffects: [], // Would need to be populated separately
    synergies: [] // Would need to be populated separately
  };
};

/**
 * Helper function to get default probability based on rarity
 */
const getRarityProbability = (rarity: Rarity): number => {
  switch (rarity) {
    case 'common': return 2;
    case 'uncommon': return 4;
    case 'rare': return 10;
    case 'epic': return 50;
    case 'legendary': return 200;
    case 'mythic': return 1000;
    case 'cosmic': return 5000;
    default: return 2;
  }
};

/**
 * Helper function to get default luck based on rarity
 */
const getRarityLuck = (rarity: Rarity): number => {
  switch (rarity) {
    case 'common': return Math.floor(Math.random() * 50) + 1; // 1-50
    case 'uncommon': return Math.floor(Math.random() * 100) + 51; // 51-150
    case 'rare': return Math.floor(Math.random() * 200) + 151; // 151-350
    case 'epic': return Math.floor(Math.random() * 300) + 351; // 351-650
    case 'legendary': return Math.floor(Math.random() * 500) + 651; // 651-1150
    case 'mythic': return Math.floor(Math.random() * 850) + 1151; // 1151-2000
    case 'cosmic': return Math.floor(Math.random() * 3000) + 2001; // 2001-5000
    default: return 25;
  }
};

/**
 * Helper function to get default gold reward based on rarity
 */
const getRarityGoldReward = (rarity: Rarity): number => {
  switch (rarity) {
    case 'common': return Math.floor(Math.random() * 50) + 10; // 10-60
    case 'uncommon': return Math.floor(Math.random() * 100) + 60; // 60-160
    case 'rare': return Math.floor(Math.random() * 200) + 160; // 160-360
    case 'epic': return Math.floor(Math.random() * 400) + 360; // 360-760
    case 'legendary': return Math.floor(Math.random() * 800) + 760; // 760-1560
    case 'mythic': return Math.floor(Math.random() * 1500) + 1560; // 1560-3060
    case 'cosmic': return Math.floor(Math.random() * 3000) + 3060; // 3060-6060
    default: return 25;
  }
};

/**
 * Batch conversion utility for arrays of UnifiedCards to legacy Cards
 */
export const convertUnifiedCardsToLegacy = (unifiedCards: UnifiedCard[]): Card[] => {
  return unifiedCards.map(convertUnifiedCardToLegacy);
};

/**
 * Batch conversion utility for arrays of legacy Cards to UnifiedCards
 */
export const convertLegacyCardsToUnified = (legacyCards: Card[]): Partial<UnifiedCard>[] => {
  return legacyCards.map(convertLegacyCardToUnified);
};

/**
 * Type guard to check if a card is a UnifiedCard
 */
export const isUnifiedCard = (card: any): card is UnifiedCard => {
  return card && 
    typeof card === 'object' && 
    'rarity' in card && 
    typeof card.rarity === 'string' && 
    Object.values(CardRarity).includes(card.rarity) &&
    'rarityProbability' in card &&
    'luck' in card &&
    'family' in card;
};

/**
 * Type guard to check if a card is a legacy Card
 */
export const isLegacyCard = (card: any): card is Card => {
  return card && 
    typeof card === 'object' && 
    'rarity' in card && 
    typeof card.rarity === 'string' &&
    ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'cosmic'].includes(card.rarity) &&
    'stats' in card &&
    !('rarityProbability' in card);
};