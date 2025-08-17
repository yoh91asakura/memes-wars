import { v4 as uuidv4 } from 'uuid';
import { commonCards } from '../data/cards/common';
import { adaptToSimpleCard } from '../models/unified/Card';
// import gameConfig from '../../config/game/game.config.json';

// Legacy type for backward compatibility
type SimpleCard = any;

// Unified card service that works with the unified card model
export class CardService {
  
  // Get all cards (returns unified cards converted to simple format for compatibility)
  getAllCards(): SimpleCard[] {
    return commonCards.map(card => adaptToSimpleCard(card));
  }

  // Get card by ID
  getCardById(id: string): SimpleCard | undefined {
    const card = commonCards.find(card => card.id === id);
    return card ? adaptToSimpleCard(card) : undefined;
  }

  // Get cards by rarity
  getCardsByRarity(rarity: string): SimpleCard[] {
    return commonCards
      .filter(card => card.rarity === rarity)
      .map(card => adaptToSimpleCard(card));
  }

  // Generate a random card
  async generateCard(): Promise<SimpleCard> {
    const randomIndex = Math.floor(Math.random() * commonCards.length);
    return adaptToSimpleCard(commonCards[randomIndex]);
  }

  // Roll a card with cost consideration
  async rollCard(): Promise<SimpleCard> {
    const card = await this.generateCard();
    return {
      ...card,
      id: uuidv4(), // Generate unique ID for new instance
    };
  }

  // Filter cards by criteria
  filterCards(criteria: Partial<SimpleCard>): SimpleCard[] {
    return commonCards
      .filter(card => {
        return (!criteria.emoji || card.emoji === criteria.emoji) &&
               (!criteria.rarity || card.rarity === criteria.rarity) &&
               (!criteria.attack || card.attack === criteria.attack) &&
               (!criteria.defense || card.defense === criteria.defense) &&
               (!criteria.cost || card.cost === criteria.cost);
      })
      .map(card => adaptToSimpleCard(card));
  }

  // Get random cards
  getRandomCards(count: number): SimpleCard[] {
    const shuffled = [...commonCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(card => adaptToSimpleCard(card));
  }

  // Search cards by name or description
  searchCards(query: string): SimpleCard[] {
    const lowercaseQuery = query.toLowerCase();
    return commonCards
      .filter(card => 
        card.name.toLowerCase().includes(lowercaseQuery) ||
        card.description?.toLowerCase().includes(lowercaseQuery) ||
        card.emoji?.includes(query)
      )
      .map(card => adaptToSimpleCard(card));
  }
}