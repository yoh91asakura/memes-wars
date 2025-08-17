import rareCardsData from './rare/rare-cards.json';
import { Card } from '../../types/card';

export const rareCards: Card[] = rareCardsData.map(card => ({
  id: card.id,
  name: card.name,
  rarity: card.rarity as 'rare',
  type: card.type as 'creature' | 'spell' | 'support' | 'attack' | 'defense',
  cost: card.cost,
  damage: card.damage,
  description: card.description,
  emoji: card.emoji,
  color: card.color,
  attack: card.attack,
  defense: card.defense,
  stats: card.stats,
  effects: card.effects,
  tags: card.tags,
  ability: card.ability,
  flavor: card.flavor
}));
