// EmojiLoader - Extract and prepare emojis from deck cards for combat
// Implements real emoji loading from player deck cards as specified in plan-implementation.md

import { EMOJI_EFFECTS, EmojiEffect } from '../data/emojiEffects';

export interface LoadedEmoji {
  emoji: string;
  effect: EmojiEffect;
  source: string; // Card name that provided this emoji
  weight: number; // How likely this emoji is to be selected
}

export interface EmojiCombatSequence {
  sequence: LoadedEmoji[];
  totalWeight: number;
  averageDamage: number;
  specialEffectsCount: number;
}

export class EmojiLoader {
  /**
   * Load emojis from deck cards and prepare them for combat
   */
  static loadEmojisFromDeck(deckCards: any[]): Promise<LoadedEmoji[]> {
    return new Promise((resolve) => {
      const loadedEmojis: LoadedEmoji[] = [];
      
      // Extract emojis from each card in the deck
      deckCards.forEach(card => {
        if (card.emojis && Array.isArray(card.emojis)) {
          card.emojis.forEach((emoji: string) => {
            const effect = EMOJI_EFFECTS[emoji];
            if (effect) {
              loadedEmojis.push({
                emoji,
                effect,
                source: card.name || 'Unknown Card',
                weight: this.calculateEmojiWeight(effect, card)
              });
            } else {
              // Create fallback effect for unknown emojis
              loadedEmojis.push({
                emoji,
                effect: {
                  emoji,
                  damage: 10,
                  speed: 300,
                  trajectory: 'straight' as const,
                  type: 'direct' as const,
                  description: `Basic projectile: ${emoji}`,
                  rarity: 'common' as const
                },
                source: card.name || 'Unknown Card',
                weight: 1
              });
            }
          });
        }
      });
      
      // If no emojis found, provide default combat emojis
      if (loadedEmojis.length === 0) {
        loadedEmojis.push(this.getDefaultCombatEmoji());
      }
      
      resolve(loadedEmojis);
    });
  }

  /**
   * Validate that emojis are available for combat
   */
  static validateEmojiEffects(emojis: string[]): boolean {
    if (emojis.length === 0) return false;
    
    // Check if at least half of the emojis have defined effects
    const validEmojis = emojis.filter(emoji => EMOJI_EFFECTS[emoji]);
    return validEmojis.length >= Math.ceil(emojis.length / 2);
  }

  /**
   * Generate a combat sequence from loaded emojis
   */
  static generateProjectileSequence(loadedEmojis: LoadedEmoji[]): EmojiCombatSequence {
    const totalWeight = loadedEmojis.reduce((sum, emoji) => sum + emoji.weight, 0);
    const averageDamage = loadedEmojis.reduce((sum, emoji) => sum + emoji.effect.damage, 0) / loadedEmojis.length;
    const specialEffectsCount = loadedEmojis.filter(emoji => 
      emoji.effect.effects && emoji.effect.effects.length > 0
    ).length;

    return {
      sequence: [...loadedEmojis].sort((a, b) => b.weight - a.weight), // Sort by weight descending
      totalWeight,
      averageDamage,
      specialEffectsCount
    };
  }

  /**
   * Get a random emoji from the loaded sequence based on weights
   */
  static getRandomEmojiFromSequence(sequence: EmojiCombatSequence): LoadedEmoji {
    if (sequence.sequence.length === 0) {
      return this.getDefaultCombatEmoji();
    }

    const random = Math.random() * sequence.totalWeight;
    let currentWeight = 0;

    for (const emoji of sequence.sequence) {
      currentWeight += emoji.weight;
      if (random <= currentWeight) {
        return emoji;
      }
    }

    // Fallback to first emoji
    return sequence.sequence[0];
  }

  /**
   * Calculate the weight of an emoji based on its effect and source card
   */
  private static calculateEmojiWeight(effect: EmojiEffect, sourceCard: any): number {
    let weight = 1;
    
    // Base weight from rarity
    switch (effect.rarity) {
      case 'common': weight = 3; break;
      case 'uncommon': weight = 2; break;
      case 'rare': weight = 1.5; break;
      case 'epic': weight = 1; break;
    }
    
    // Boost weight based on card rarity
    if (sourceCard.rarity) {
      if (typeof sourceCard.rarity === 'string') {
        switch (sourceCard.rarity.toLowerCase()) {
          case 'legendary':
          case 'mythic':
          case 'cosmic': weight *= 2; break;
          case 'epic':
          case 'rare': weight *= 1.5; break;
        }
      }
    }
    
    // Special effects reduce frequency but increase impact
    if (effect.effects && effect.effects.length > 0) {
      weight *= 0.8; // Slightly less frequent but more impactful
    }
    
    return Math.max(0.1, weight); // Minimum weight
  }

  /**
   * Get a default emoji for when no emojis are available
   */
  private static getDefaultCombatEmoji(): LoadedEmoji {
    return {
      emoji: '💥',
      effect: EMOJI_EFFECTS['💥'] || {
        emoji: '💥',
        damage: 15,
        speed: 250,
        trajectory: 'straight' as const,
        type: 'direct' as const,
        description: 'Default combat projectile',
        rarity: 'common' as const
      },
      source: 'Default Combat',
      weight: 1
    };
  }

  /**
   * Get statistics about the loaded emojis
   */
  static getEmojiStats(loadedEmojis: LoadedEmoji[]) {
    if (loadedEmojis.length === 0) {
      return {
        totalEmojis: 0,
        averageDamage: 0,
        rarityDistribution: {},
        topEmojis: [],
        hasSpecialEffects: false
      };
    }

    const averageDamage = loadedEmojis.reduce((sum, emoji) => sum + emoji.effect.damage, 0) / loadedEmojis.length;
    
    const rarityDistribution = loadedEmojis.reduce((acc, emoji) => {
      acc[emoji.effect.rarity] = (acc[emoji.effect.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEmojis = [...loadedEmojis]
      .sort((a, b) => b.effect.damage - a.effect.damage)
      .slice(0, 5);

    const hasSpecialEffects = loadedEmojis.some(emoji => 
      emoji.effect.effects && emoji.effect.effects.length > 0
    );

    return {
      totalEmojis: loadedEmojis.length,
      averageDamage: Math.round(averageDamage),
      rarityDistribution,
      topEmojis,
      hasSpecialEffects
    };
  }
}

export default EmojiLoader;