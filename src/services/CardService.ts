import { v4 as uuidv4 } from 'uuid';
import { commonCards } from '../data/cards/common';
import type { Card } from '../components/types';

// Unified card service that works with the unified card model
export class CardService {
  
  // Get all cards
  getAllCards(): Card[] {
    return commonCards;
  }

  // Get card by ID
  getCardById(id: string): Card | undefined {
    return commonCards.find(card => card.id === id);
  }

  // Get cards by rarity
  getCardsByRarity(rarity: string): Card[] {
    return commonCards.filter(card => card.rarity === rarity);
  }

  // Generate a random card
  async generateCard(): Promise<Card> {
    const randomIndex = Math.floor(Math.random() * commonCards.length);
    return commonCards[randomIndex];
  }

  // Roll a card with cost consideration
  async rollCard(): Promise<Card> {
    const card = await this.generateCard();
    return {
      ...card,
      id: uuidv4(), // Generate unique ID for new instance
    };
  }

  // Filter cards by criteria
  filterCards(criteria: Partial<Card>): Card[] {
    return commonCards.filter(card => {
      return (!criteria.emoji || card.emoji === criteria.emoji) &&
             (!criteria.rarity || card.rarity === criteria.rarity) &&
             (!criteria.attack || card.attack === criteria.attack) &&
             (!criteria.defense || card.defense === criteria.defense) &&
             (!criteria.cost || card.cost === criteria.cost);
    });
  }

  // Get random cards
  getRandomCards(count: number): Card[] {
    const shuffled = [...commonCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Search cards by name or description
  searchCards(query: string): Card[] {
    const lowercaseQuery = query.toLowerCase();
    return commonCards.filter(card => 
      card.name.toLowerCase().includes(lowercaseQuery) ||
      card.description?.toLowerCase().includes(lowercaseQuery) ||
      card.emoji?.includes(query)
    );
  }
}