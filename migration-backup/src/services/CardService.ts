import { v4 as uuidv4 } from 'uuid';
import { commonCards } from '@/data/cards/common';
import { Card as SimpleCard } from '@/types/card';
// import gameConfig from '../../config/game/game.config.json';

// Simple card service that works with the simple card model
export class CardService {
  
  // Get all simple cards
  getAllCards(): SimpleCard[] {
    return commonCards;
  }

  // Get card by ID
  getCardById(id: string): SimpleCard | undefined {
    return commonCards.find(card => card.id === id);
  }

  // Get cards by rarity
  getCardsByRarity(rarity: string): SimpleCard[] {
    return commonCards.filter(card => card.rarity === rarity);
  }

  // Generate a random card
  async generateCard(): Promise<SimpleCard> {
    const randomIndex = Math.floor(Math.random() * commonCards.length);
    return commonCards[randomIndex];
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
    return commonCards.filter(card => {
      return (!criteria.emoji || card.emoji === criteria.emoji) &&
             (!criteria.rarity || card.rarity === criteria.rarity) &&
             (!criteria.attack || card.attack === criteria.attack) &&
             (!criteria.defense || card.defense === criteria.defense) &&
             (!criteria.cost || card.cost === criteria.cost);
    });
  }

  // Get random cards
  getRandomCards(count: number): SimpleCard[] {
    const shuffled = [...commonCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Search cards by name or description
  searchCards(query: string): SimpleCard[] {
    const lowercaseQuery = query.toLowerCase();
    return commonCards.filter(card => 
      card.name.toLowerCase().includes(lowercaseQuery) ||
      card.description?.toLowerCase().includes(lowercaseQuery) ||
      card.emoji?.includes(query)
    );
  }
}