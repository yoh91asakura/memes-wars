import { Card } from '../types/card';
import { uncommonCards } from '../data/cards/uncommon/uncommon-cards';

export class UncommonCardService {
  private static readonly cards: Card[] = uncommonCards;

  static getAllCards(): Card[] {
    return [...this.cards];
  }

  static getCardById(id: string): Card | undefined {
    return this.cards.find(card => card.id === id);
  }

  static getCardsByRarity(rarity: string): Card[] {
    return this.cards.filter(card => card.rarity === rarity);
  }

  static getRandomCard(): Card {
    const randomIndex = Math.floor(Math.random() * this.cards.length);
    return this.cards[randomIndex];
  }

  static getCardsByType(type: string): Card[] {
    return this.cards.filter(card => card.type === type);
  }

  static searchCards(query: string): Card[] {
    const lowercaseQuery = query.toLowerCase();
    return this.cards.filter(card => 
      card.name.toLowerCase().includes(lowercaseQuery) ||
      card.description?.toLowerCase().includes(lowercaseQuery) ||
      card.emoji?.includes(query)
    );
  }

  static getCardsByCost(cost: number): Card[] {
    return this.cards.filter(card => card.cost === cost);
  }

  static getTotalCount(): number {
    return this.cards.length;
  }
}

export default UncommonCardService;