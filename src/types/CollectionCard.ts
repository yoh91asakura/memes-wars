// Collection Card Type - Shows all cards with ownership info
import { Card } from '../models/Card';

export interface CollectionCard extends Card {
  ownedCount: number;  // Number of this card owned (0 if not owned)
  isOwned: boolean;    // Quick check if card is owned
}

// Utility functions for collection cards
export class CollectionCardUtils {
  // Create collection cards from all available cards and owned cards
  static createCollectionCards(allAvailableCards: Card[], ownedCards: Card[]): CollectionCard[] {
    // Count owned cards by name
    const ownedCounts = new Map<string, number>();
    ownedCards.forEach(card => {
      const count = ownedCounts.get(card.name) || 0;
      ownedCounts.set(card.name, count + 1);
    });

    // Create collection cards for all available cards
    return allAvailableCards.map(card => ({
      ...card,
      ownedCount: ownedCounts.get(card.name) || 0,
      isOwned: ownedCounts.has(card.name)
    }));
  }

  // Sort collection cards by rarity descending
  static sortByRarityDesc(cards: CollectionCard[]): CollectionCard[] {
    return cards.sort((a, b) => {
      // Higher rarity number = rarer card = should come first
      return b.rarity - a.rarity;
    });
  }

  // Filter to show only owned cards
  static filterOwned(cards: CollectionCard[]): CollectionCard[] {
    return cards.filter(card => card.isOwned);
  }

  // Filter by search term
  static filterBySearch(cards: CollectionCard[], searchTerm: string): CollectionCard[] {
    if (!searchTerm.trim()) return cards;
    
    const lowerSearch = searchTerm.toLowerCase();
    return cards.filter(card => 
      card.name.toLowerCase().includes(lowerSearch) ||
      card.description?.toLowerCase().includes(lowerSearch) ||
      card.family.toLowerCase().includes(lowerSearch)
    );
  }
}