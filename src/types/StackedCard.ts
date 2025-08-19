// Stacked Card Type for Collection Display
import { Card } from '../models/Card';

export interface StackedCard extends Card {
  stackCount: number;  // Number of duplicates in collection
}

// Utility functions for stacked cards
export class StackedCardUtils {
  // Group cards by their name to create stacks (since same name = duplicate card)
  static createCardStacks(cards: Card[]): StackedCard[] {
    const cardStacks = new Map<string, StackedCard>();
    
    cards.forEach(card => {
      const key = card.name; // Group by name instead of id for proper stacking
      if (cardStacks.has(key)) {
        const stack = cardStacks.get(key)!;
        stack.stackCount++;
      } else {
        cardStacks.set(key, { ...card, stackCount: 1 });
      }
    });
    
    return Array.from(cardStacks.values());
  }
  
  // Sort cards by rarity in descending order (best first)
  static sortByRarityDesc(cards: StackedCard[]): StackedCard[] {
    return cards.sort((a, b) => {
      // Higher rarity number = rarer card = should come first
      return b.rarity - a.rarity;
    });
  }
}