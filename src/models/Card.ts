// Card Model - Single Source of Truth
// Aligned with docs/specifications/game-specification.md
// Simple, focused on core gameplay mechanics

// Card rarity levels - for compatibility with existing code
export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
  COSMIC = 'cosmic',
  DIVINE = 'divine',
  INFINITY = 'infinity',
  BEYOND = 'beyond'
}

// Meme families for thematic groupings and synergies
export enum MemeFamily {
  CLASSIC_INTERNET = 'CLASSIC_INTERNET',         // Doge, Pepe, Wojak, Chad, Trollface
  MEME_FORMATS = 'MEME_FORMATS',                 // Drake, Expanding Brain, Distracted Boyfriend
  HISTORICAL_FIGURES = 'HISTORICAL_FIGURES',     // Ancient philosophers, scientists
  MYTHOLOGY = 'MYTHOLOGY',                       // Greek gods, Norse mythology, folklore
  ANIMALS = 'ANIMALS',                          // Grumpy Cat, Advice Animals, reactions
  ABSTRACT_CONCEPTS = 'ABSTRACT_CONCEPTS',       // Stonks, Yes/No, Virgin vs Chad
  EMOTIONS_REACTIONS = 'EMOTIONS_REACTIONS',     // Surprised Pikachu, Crying, Laughing
  INTERNET_CULTURE = 'INTERNET_CULTURE',        // Greentext, copypasta, viral phenomena
  GAMING_ARCHETYPES = 'GAMING_ARCHETYPES',      // Speedrunner, Noob, Pro Gamer
  LIFE_SITUATIONS = 'LIFE_SITUATIONS',          // Student life, Work life, Relationships
}

// Special effect types that can proc during combat
export enum EffectType {
  FREEZE = 'FREEZE',           // Slow enemy fire rate
  BURN = 'BURN',               // Damage over time
  HEAL = 'HEAL',               // Restore HP
  BOOST = 'BOOST',             // Increase fire rate
  SHIELD = 'SHIELD',           // Block incoming hits
  POISON = 'POISON',           // Reduce healing
  LUCKY = 'LUCKY',             // Bonus rewards
  BURST = 'BURST',             // Sudden damage spike
  REFLECT = 'REFLECT',         // Bounce emojis back
  MULTIPLY = 'MULTIPLY',       // Duplicate emojis
  STUN = 'STUN',              // Temporary disable
  DRAIN = 'DRAIN',            // Steal HP
  BARRIER = 'BARRIER',        // Temporary invincibility
  CHAOS = 'CHAOS',            // Random effect
  PRECISION = 'PRECISION',    // Guaranteed critical hit
  KNOCKBACK = 'KNOCKBACK',    // Push back enemy
  buff_defense = 'buff_defense', // Increase defense
}

// Card effect trigger types
export enum TriggerType {
  RANDOM = 'RANDOM',                    // Random proc during battle
  ON_HIT = 'ON_HIT',                   // When this card's emoji hits opponent
  ON_DAMAGE = 'ON_DAMAGE',             // When player takes damage
  PERIODIC = 'PERIODIC',               // Every X seconds
  BATTLE_START = 'BATTLE_START',       // At beginning of combat
  BATTLE_END = 'BATTLE_END',           // At end of combat
  LOW_HP = 'LOW_HP',                   // When HP below threshold
  HIGH_COMBO = 'HIGH_COMBO',           // After multiple hits
  FAMILY_SYNERGY = 'FAMILY_SYNERGY',   // When other family cards present
  onTurnStart = 'onTurnStart',         // At start of turn
}

// Emoji projectile - aligned with game spec
export interface Emoji {
  character: string;                    // The emoji character
  damage: number;                       // Base damage per hit
  speed: number;                        // Projectile velocity (1-5)
  effect?: EffectType;                  // Special effect on hit
  trajectory: 'straight' | 'arc' | 'wave' | 'spiral'; // Movement pattern
  target: 'OPPONENT' | 'SELF';          // Target opponent or self
}

// Card effects that can proc randomly during combat
export interface CardEffect {
  trigger: TriggerType;                 // When can this effect happen
  chance: number;                       // Base proc chance (0-1)
  effect: EffectType;                   // What happens
  duration?: number;                    // Effect duration in seconds
  value?: number;                       // Effect value (damage, heal amount, etc)
  cooldown?: number;                    // Cooldown in seconds
}

// Passive abilities for cards
export interface PassiveAbility {
  id: string;                           // Unique ability ID
  name: string;                         // Display name
  description: string;                  // What the ability does
  trigger: TriggerType;                 // When it activates
  effect: EffectType;                   // Type of effect
  chance: number;                       // Activation chance (0-1)
  cooldown?: number;                    // Cooldown in seconds
  value?: number;                       // Effect strength
}

// Stack bonus system for duplicate cards
export interface StackBonus {
  luckMultiplier: number;               // +10% per stack level
  goldMultiplier: number;               // +15% per stack level
  bonusEmojis: (Emoji | string)[];      // Additional emoji variants per stack
  effectBonus?: number;                 // Effect power bonus
  damageBonus?: number;                 // Damage bonus
}

// Visual properties for card display
export interface VisualProperties {
  borderColor: string;                  // Border color based on rarity
  glowIntensity: number;                // 0-1 based on stack level
  glow?: string;                       // Glow color for effects
  backgroundColor?: string;             // Card background
  textColor?: string;                   // Text color
  animation?: 'pulse' | 'glow' | 'sparkle' | 'flame' | 'rainbow';
}

// CARD INTERFACE - Aligned with Game Specification
export interface Card {
  // === CORE IDENTITY (from game spec) ===
  id: string;                          // Unique identifier
  name: string;                        // Display name (meme reference)
  rarity: number;                      // Expressed as 1/X probability (2, 4, 10, 50, etc.)
  luck: number;                        // Luck stat affecting rewards and effects (1-5000+)
  emojis: Emoji[];                     // Attack projectiles
  family: MemeFamily;                  // Thematic family for synergies
  reference: string;                   // Specific pop culture reference
  
  // === STACKING SYSTEM ===
  stackLevel: number;                  // Current stack level (1-10)
  stackBonus?: StackBonus;             // Bonuses from stacking
  
  // === REWARDS ===
  goldReward: number;                  // Gold earned when rolled
  
  // === DISPLAY ===
  emoji: string;                       // Primary emoji for card display
  description?: string;                // Card description
  visual?: VisualProperties;           // Visual customization
  
  // === COMBAT STATS ===
  hp?: number;                         // Card's HP contribution to player total
  attack?: number;                     // Attack power
  defense?: number;                    // Defense value
  health?: number;                     // Alias for hp
  damage?: number;                     // Base damage
  cost?: number;                       // Mana/energy cost
  
  // === ABILITIES ===
  cardEffects?: CardEffect[];          // Effects that can proc during battle
  passiveAbility?: PassiveAbility;     // Passive ability
  effects?: CardEffect[];              // Alternative name for cardEffects (compatibility)
  
  // === CARD TYPE ===
  type?: string;                       // Card type (creature, spell, etc)
  
  // === SYNERGIES ===
  synergies?: MemeFamily[];            // Synergistic families
  
  // === ECONOMIC SYSTEM ===
  goldGeneration?: number;             // Gold generated per use
  dustValue?: number;                  // Dust value when disenchanted
  tradeable?: boolean;                 // Can be traded
  
  // === METADATA ===
  createdAt: string;                   // When card was created
  updatedAt: string;                   // Last update time
  addedAt?: string;                    // When added to collection
}

// Utility class for Card operations
export class CardUtils {
  // Get rarity name from probability
  static getRarityName(probability: number): string {
    if (probability <= 2) return 'Common';
    if (probability <= 4) return 'Uncommon';
    if (probability <= 10) return 'Rare';
    if (probability <= 50) return 'Epic';
    if (probability <= 200) return 'Legendary';
    if (probability <= 1000) return 'Mythic';
    if (probability <= 10000) return 'Cosmic';
    if (probability <= 100000) return 'Divine';
    if (probability <= 1000000) return 'Infinity';
    return 'Beyond';
  }
  
  // Get rarity color for display
  static getRarityColor(probability: number): string {
    if (probability <= 2) return '#9CA3AF';      // Gray - Common
    if (probability <= 4) return '#10B981';      // Green - Uncommon
    if (probability <= 10) return '#3B82F6';     // Blue - Rare
    if (probability <= 50) return '#8B5CF6';     // Purple - Epic
    if (probability <= 200) return '#F59E0B';    // Orange - Legendary
    if (probability <= 1000) return '#EF4444';   // Red - Mythic
    if (probability <= 10000) return '#EC4899';  // Pink - Cosmic
    if (probability <= 100000) return '#FFD700'; // Gold - Divine
    if (probability <= 1000000) return '#9400D3'; // Violet - Infinity
    return '#FF00FF';                            // Magenta - Beyond
  }
  
  // Calculate gold reward range based on rarity
  static getGoldRewardRange(probability: number): [number, number] {
    if (probability <= 2) return [10, 20];
    if (probability <= 4) return [25, 50];
    if (probability <= 10) return [75, 150];
    if (probability <= 50) return [200, 400];
    if (probability <= 200) return [500, 1000];
    if (probability <= 1000) return [1500, 3000];
    if (probability <= 10000) return [5000, 10000];
    if (probability <= 100000) return [15000, 25000];
    if (probability <= 1000000) return [50000, 100000];
    return [100000, 500000];
  }
  
  // Calculate luck range based on rarity
  static getLuckRange(probability: number): [number, number] {
    if (probability <= 2) return [1, 10];
    if (probability <= 4) return [10, 25];
    if (probability <= 10) return [25, 50];
    if (probability <= 50) return [50, 100];
    if (probability <= 200) return [100, 200];
    if (probability <= 1000) return [200, 500];
    if (probability <= 10000) return [500, 1000];
    if (probability <= 100000) return [1000, 2000];
    if (probability <= 1000000) return [2000, 5000];
    return [5000, 10000];
  }
  
  // Get emoji count range based on rarity
  static getEmojiCountRange(probability: number): [number, number] {
    if (probability <= 2) return [1, 2];
    if (probability <= 4) return [2, 3];
    if (probability <= 10) return [3, 4];
    if (probability <= 50) return [4, 5];
    if (probability <= 200) return [5, 6];
    if (probability <= 1000) return [6, 8];
    if (probability <= 10000) return [8, 10];
    if (probability <= 100000) return [10, 12];
    if (probability <= 1000000) return [12, 15];
    return [15, 20];
  }
  
  // Calculate total HP from deck
  static calculateDeckHP(cards: Card[]): number {
    return cards.reduce((total, card) => total + (card.hp || 100), 0);
  }
  
  // Calculate stack bonuses
  static applyStackBonus(card: Card): Card {
    if (card.stackLevel <= 1) return card;
    
    const bonusLuck = Math.floor(card.luck * (1 + (card.stackLevel - 1) * 0.1));
    const bonusGold = Math.floor(card.goldReward * (1 + (card.stackLevel - 1) * 0.15));
    
    return {
      ...card,
      luck: bonusLuck,
      goldReward: bonusGold,
      stackBonus: {
        luckMultiplier: 0.1 * (card.stackLevel - 1),
        goldMultiplier: 0.15 * (card.stackLevel - 1),
        bonusEmojis: card.stackBonus?.bonusEmojis || []
      }
    };
  }
  
  // Get default visual properties based on rarity
  static getDefaultVisual(probability: number, stackLevel: number = 1): VisualProperties {
    return {
      borderColor: CardUtils.getRarityColor(probability),
      glowIntensity: Math.min(1, stackLevel * 0.1),
      backgroundColor: '#1a1a2e',
      animation: probability <= 1000 ? 'glow' : 
                 probability <= 100000 ? 'sparkle' : 
                 'rainbow'
    };
  }
  
  // Generate random card based on rarity
  static generateCard(probability: number, id: string, name: string): Card {
    const [minLuck, maxLuck] = CardUtils.getLuckRange(probability);
    const [minGold, maxGold] = CardUtils.getGoldRewardRange(probability);
    const [minEmojis, maxEmojis] = CardUtils.getEmojiCountRange(probability);
    
    const luck = Math.floor(Math.random() * (maxLuck - minLuck + 1)) + minLuck;
    const goldReward = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
    const emojiCount = Math.floor(Math.random() * (maxEmojis - minEmojis + 1)) + minEmojis;
    
    // Generate random emojis
    const emojis: Emoji[] = [];
    const emojiChars = ['🔥', '⚡', '💎', '🌟', '💥', '🎯', '🚀', '⭐', '💫', '✨', '🌈', '❄️', '🔮', '💀', '👻'];
    
    for (let i = 0; i < emojiCount; i++) {
      emojis.push({
        character: emojiChars[Math.floor(Math.random() * emojiChars.length)],
        damage: Math.floor(Math.random() * 10) + 5,
        speed: Math.floor(Math.random() * 3) + 2,
        trajectory: ['straight', 'arc', 'wave', 'spiral'][Math.floor(Math.random() * 4)] as any,
        target: 'OPPONENT'
      });
    }
    
    const now = new Date().toISOString();
    
    return {
      id,
      name,
      rarity: probability,
      luck,
      emojis,
      family: MemeFamily.CLASSIC_INTERNET,
      reference: 'Classic meme reference',
      stackLevel: 1,
      goldReward,
      emoji: emojis[0]?.character || '❓',
      description: `A ${CardUtils.getRarityName(probability)} card with ${emojiCount} emoji projectiles`,
      visual: CardUtils.getDefaultVisual(probability),
      hp: 100 + Math.floor(luck / 10),
      createdAt: now,
      updatedAt: now
    };
  }
  
  // Check if card is valid
  static isValid(card: Card): boolean {
    return (
      !!card.id &&
      !!card.name &&
      typeof card.rarity === 'number' &&
      card.rarity > 0 &&
      typeof card.luck === 'number' &&
      card.luck > 0 &&
      Array.isArray(card.emojis) &&
      card.emojis.length > 0 &&
      !!card.family &&
      !!card.reference &&
      typeof card.stackLevel === 'number' &&
      card.stackLevel >= 1 &&
      card.stackLevel <= 10
    );
  }
}

// Re-export types for convenience
export type { Card as ICard };
