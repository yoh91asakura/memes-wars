import epicCardsData from './epic-cards.json';
import { Card } from '../../../types/card';

export const epicCards: Card[] = epicCardsData.map(card => ({
  id: card.id,
  name: card.name,
  rarity: card.rarity as 'epic',
  type: card.type as 'creature' | 'spell' | 'support' | 'attack' | 'defense',
  cost: card.cost,
  damage: card.damage,
  description: card.description,
  emoji: card.emoji,
  color: card.color,
  attack: card.attack,
  defense: card.defense,
  ability: card.ability,
  flavor: card.flavor
}));

export default epicCards;