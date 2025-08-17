import { UnifiedCard as Card } from '../models/unified/Card';
import { uncommonCards as legacyUncommonCards } from '../data/cards/uncommon/uncommon-cards';
// Temporary adapter function until proper migration
function adaptLegacyToUnified(oldCard: any): any {
  return {
    ...oldCard,
    emojis: oldCard.emoji ? [{ character: oldCard.emoji }] : [],
    hp: oldCard.defense || 10,
    attackSpeed: 1.0,
    passive: { id: 'none', name: 'None', effect: 'No effect' },
    stackLevel: 0,
    experience: 0,
    luck: 0,
  };
}

export class UncommonCardService {
  private static readonly cards: Card[] = legacyUncommonCards.map(adaptLegacyToUnified);

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
      card.emojis?.some(emoji => emoji.character.includes(query)) || card.emoji?.includes(query)
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