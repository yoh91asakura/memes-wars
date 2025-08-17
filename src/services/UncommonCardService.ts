import { Card } from '../types/Card';
import uncommonCardsData from '../data/cards/uncommon/uncommon-cards.json';

export class UncommonCardService {
  private uncommonCards: Card[];

  constructor() {
    this.uncommonCards = uncommonCardsData as Card[];
  }

  getAllUncommonCards(): Card[] {
    return this.uncommonCards;
  }

  getUncommonCardById(id: string): Card | undefined {
    return this.uncommonCards.find(card => card.id === id);
  }

  getUncommonCardsByType(type: Card['type']): Card[] {
    return this.uncommonCards.filter(card => card.type === type);
  }

  getUncommonCardsByCost(cost: number): Card[] {
    return this.uncommonCards.filter(card => card.cost === cost);
  }

  getUncommonCardsByTag(tag: string): Card[] {
    return this.uncommonCards.filter(card => card.tags.includes(tag));
  }

  searchUncommonCards(query: string): Card[] {
    const lowerQuery = query.toLowerCase();
    return this.uncommonCards.filter(card => 
      card.name.toLowerCase().includes(lowerQuery) ||
      card.description.toLowerCase().includes(lowerQuery) ||
      card.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  validateUncommonCard(card: any): card is Card {
    return (
      card &&
      typeof card.id === 'string' &&
      typeof card.name === 'string' &&
      card.rarity === 'uncommon' &&
      ['spell', 'attack', 'defense', 'healing', 'support', 'creature'].includes(card.type) &&
      typeof card.cost === 'number' &&
      typeof card.damage === 'number' &&
      typeof card.description === 'string' &&
      typeof card.emoji === 'string' &&
      typeof card.color === 'string' &&
      card.stats &&
      typeof card.stats.attack === 'number' &&
      typeof card.stats.defense === 'number' &&
      typeof card.stats.health === 'number' &&
      Array.isArray(card.effects) &&
      Array.isArray(card.tags) &&
      typeof card.lore === 'string'
    );
  }

  getRandomUncommonCard(): Card {
    const randomIndex = Math.floor(Math.random() * this.uncommonCards.length);
    return this.uncommonCards[randomIndex];
  }

  getRandomUncommonCards(count: number): Card[] {
    const shuffled = [...this.uncommonCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, this.uncommonCards.length));
  }

  getUncommonCardsByRarity(): Card[] {
    return this.uncommonCards.filter(card => card.rarity === 'uncommon');
  }

  getUncommonCardsByEffect(effect: string): Card[] {
    return this.uncommonCards.filter(card => card.effects.includes(effect));
  }

  getTotalUncommonCards(): number {
    return this.uncommonCards.length;
  }

  getUncommonCardsByCostRange(min: number, max: number): Card[] {
    return this.uncommonCards.filter(card => card.cost >= min && card.cost <= max);
  }
}