import { CardEmojiData } from '../../components/types/emoji';

// Unified Card Model - Single Source of Truth
// This model consolidates all card properties and ensures consistency
// Updated to match game specification requirements

export enum CardRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
  COSMIC = 'COSMIC',
  DIVINE = 'DIVINE',
  INFINITY = 'INFINITY',
}

export enum CardType {
  CREATURE = 'CREATURE',
  SPELL = 'SPELL',
  ARTIFACT = 'ARTIFACT',
  ATTACK = 'ATTACK',
  DEFENSE = 'DEFENSE',
  HEALING = 'HEALING',
  SUPPORT = 'SUPPORT',
}

// Meme families for thematic groupings and synergies
export enum MemeFamily {
  CLASSIC_INTERNET = 'CLASSIC_INTERNET',           // Doge, Pepe, Wojak, Chad, Trollface
  MEME_FORMATS = 'MEME_FORMATS',                   // Drake, Expanding Brain, Distracted Boyfriend
  HISTORICAL_FIGURES = 'HISTORICAL_FIGURES',       // Ancient philosophers, scientists
  MYTHOLOGY = 'MYTHOLOGY',                         // Greek gods, Norse mythology, folklore
  ANIMALS = 'ANIMALS',                            // Grumpy Cat, Advice Animals, reactions
  ABSTRACT_CONCEPTS = 'ABSTRACT_CONCEPTS',         // Stonks, Yes/No, Virgin vs Chad
  EMOTIONS_REACTIONS = 'EMOTIONS_REACTIONS',       // Surprised Pikachu, Crying, Laughing
  INTERNET_CULTURE = 'INTERNET_CULTURE',          // Greentext, copypasta, viral phenomena
  GAMING_ARCHETYPES = 'GAMING_ARCHETYPES',        // Speedrunner, Noob, Pro Gamer
  LIFE_SITUATIONS = 'LIFE_SITUATIONS',            // Student life, Work life, Relationships
}

// Card effect trigger types
export enum TriggerType {
  RANDOM = 'RANDOM',                              // Random proc during battle
  ON_HIT = 'ON_HIT',                             // When this card's emoji hits opponent
  ON_DAMAGE = 'ON_DAMAGE',                       // When player takes damage
  PERIODIC = 'PERIODIC',                         // Every X seconds
  BATTLE_START = 'BATTLE_START',                 // At beginning of combat
  BATTLE_END = 'BATTLE_END',                     // At end of combat
  LOW_HP = 'LOW_HP',                             // When HP below threshold
  HIGH_COMBO = 'HIGH_COMBO',                     // After multiple hits
  FAMILY_SYNERGY = 'FAMILY_SYNERGY',             // When other family cards present
}

// Special effect types that can proc during combat
export enum EffectType {
  FREEZE = 'FREEZE',                             // Slow enemy fire rate
  BURN = 'BURN',                                 // Damage over time
  HEAL = 'HEAL',                                 // Restore HP
  BOOST = 'BOOST',                               // Increase fire rate
  SHIELD = 'SHIELD',                             // Block incoming hits
  POISON = 'POISON',                             // Reduce healing
  LUCKY = 'LUCKY',                               // Bonus rewards
  BURST = 'BURST',                               // Sudden damage spike
  REFLECT = 'REFLECT',                           // Bounce emojis back
  MULTIPLY = 'MULTIPLY',                         // Duplicate emojis
  STUN = 'STUN',                                 // Temporary disable
  DRAIN = 'DRAIN',                               // Steal HP
  BARRIER = 'BARRIER',                           // Temporary invincibility
  CHAOS = 'CHAOS',                               // Random effect
  PRECISION = 'PRECISION',                       // Guaranteed critical hit
  // Additional effects from card data
  KNOCKBACK = 'KNOCKBACK',                       // Push enemy back
  DEFENSE = 'DEFENSE',                           // Increase defense
  PUSH = 'PUSH',                                 // Push effect
  SPEED_BOOST = 'SPEED_BOOST',                   // Increase speed
  SPEED = 'SPEED',                               // Speed modifier
  SUPPORT = 'SUPPORT',                           // Support buff
  CHAIN = 'CHAIN',                               // Chain lightning effect
  PARALYZE = 'PARALYZE',                         // Paralyze enemy
  LIGHTNING = 'LIGHTNING',                       // Lightning damage
  AREA = 'AREA',                                 // Area of effect
  INTIMIDATE = 'INTIMIDATE',                     // Intimidation effect
  FIRE = 'FIRE',                                 // Fire damage
  FLYING = 'FLYING',                             // Flying ability
  HEAL_SELF = 'HEAL_SELF',                       // Self healing
  RESURRECT = 'RESURRECT',                       // Resurrection ability
}

// Passive abilities that cards can have
export interface PassiveAbility {
  name: string;
  description: string;
  trigger: 'onPlay' | 'onDeath' | 'onAttack' | 'onDefend' | 'onTurnStart' | 'onTurnEnd';
  effect: string;
  value?: number;
}

// Enhanced emoji projectile configuration for bullet-hell combat
export interface EmojiProjectile {
  character: string;                              // The emoji character
  damage: number;                                 // Base damage per hit
  speed: number;                                  // Projectile velocity
  trajectory: 'straight' | 'arc' | 'homing' | 'wave' | 'spiral' | 'random';
  effects?: EffectType[];                         // Special effects on hit
  target: 'OPPONENT' | 'PLAYER';                 // Always targets opposing player
  fireRate?: number;                              // Shots per second
  piercing?: boolean;                             // Can hit through shields
  homing?: boolean;                               // Tracks target
  bounces?: number;                               // Number of ricochets
}

// Card effects that can proc randomly during combat
export interface CardEffect {
  id: string;
  name: string;
  description: string;
  trigger: TriggerType;
  chance: number;                                 // Base proc chance (0-1)
  effect: EffectType;
  value?: number;                                 // Effect magnitude
  duration?: number;                              // Effect duration in seconds
  cooldown?: number;                              // Time before can proc again
  conditions?: string[];                          // Additional requirements
}

// Stack bonus system for duplicate cards
export interface StackBonus {
  luckMultiplier: number;                         // +10% per stack level
  goldMultiplier: number;                         // +15% per stack level
  bonusEmojis: string[];                          // Additional emoji variants per stack
  effectBonus?: number;                           // Increased effect proc chance
  damageBonus?: number;                           // Bonus damage multiplier
}

// Rarity configuration with game spec probabilities
export interface RarityConfig {
  name: CardRarity;
  probability: number;                            // 1/X format (2, 4, 10, 50, etc.)
  goldReward: [number, number];                   // [min, max] gold range
  luckRange: [number, number];                    // [min, max] luck range
  emojiCount: [number, number];                   // [min, max] emoji count
  dustValue: number;                              // Crafting currency value
}

// Family synergy bonuses
export interface FamilySynergy {
  family: MemeFamily;
  requiredCards: number;                          // Minimum family cards in deck
  bonus: {
    type: 'DAMAGE' | 'LUCK' | 'GOLD' | 'EFFECT_CHANCE' | 'SPECIAL';
    value: number;
    description: string;
  };
}

// Visual properties for card display
export interface VisualProperties {
  glow?: string;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  shadowColor?: string;
  animation?: 'pulse' | 'glow' | 'sparkle' | 'flame' | 'electric' | 'none' | 'spin' | 'float' | 'shake' | 'rainbow' | 'divine';
  particles?: boolean;                            // Particle effects around card
}

// UNIFIED CARD INTERFACE - Full Game Specification Compliance
export interface UnifiedCard {
  // Core Identity
  id: string;
  name: string;
  description: string;
  emoji: string;                                  // Primary display emoji
  
  // Game Specification Requirements
  rarity: CardRarity;
  rarityProbability: number;                      // 1/X format (2, 4, 10, 50, 200, etc.)
  luck: number;                                   // 1-2000+ range based on rarity
  family: MemeFamily;                             // Thematic family for synergies
  reference: string;                              // Specific pop culture reference
  goldReward: number;                             // Gold earned when rolled
  
  // Game Mechanics
  type: CardType;
  cost: number;
  
  // Combat Stats
  attack: number;
  defense: number;
  health: number;
  attackSpeed?: number;
  
  // Enhanced Combat System
  emojis: EmojiProjectile[];                      // Multiple emoji projectiles per card
  cardEffects: CardEffect[];                      // Random proc effects during battle
  synergies: MemeFamily[];                        // Compatible families for bonuses
  passiveAbility?: PassiveAbility;                // Legacy passive (kept for compatibility)
  
  // Economic System
  goldGeneration: number;                         // Base gold generation rate
  dustValue: number;                              // Crafting currency value
  tradeable: boolean;                             // Can be traded with other players
  
  // Progression System
  level: number;
  experience: number;
  stackCount: number;
  maxStacks: number;
  stackBonus: StackBonus;                         // Bonuses from duplicates
  
  // Visual & UI
  visual: VisualProperties;
  
  // Collection & Social
  craftable: boolean;
  craftCost?: number;
  isActive: boolean;                              // Available in current rotation
  isLimited: boolean;                             // Limited time availability
  seasonalEvent?: string;                         // Associated seasonal event
  
  // Metadata
  effects?: EffectType[];                         // Available special effects
  tags?: string[];                                // Searchable tags
  flavor?: string;                                // Flavor text
  lore?: string;                                  // Extended lore/backstory
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Collection metadata
  addedAt?: string;                               // When added to collection
  
  // Legacy Compatibility (marked for deprecation)
  /** @deprecated Use emojis array instead */
  emojiProjectile?: EmojiProjectile;
  /** @deprecated Use attack instead */
  damage?: number;
  /** @deprecated Use passiveAbility instead */
  ability?: string;
  /** @deprecated Use emojis instead */
  emojiData?: CardEmojiData;
  /** @deprecated Use flat properties instead */
  stats?: {
    attack: number;
    defense: number;
    health: number;
  };
}

// Type alias for backward compatibility
export type Card = UnifiedCard;

// Utility functions for card management
export class CardUtils {
  // Convert legacy card format to unified format with game spec requirements
  static migrateToUnified(legacyCard: any): UnifiedCard {
    const now = new Date().toISOString();
    const rarity = this.normalizeRarity(legacyCard.rarity);
    const rarityConfig = this.getRarityConfig(rarity);
    
    return {
      // Core Identity
      id: legacyCard.id || 'unknown',
      name: legacyCard.name || 'Unknown Card',
      description: legacyCard.description || '',
      emoji: legacyCard.emoji || '❓',
      
      // Game Specification Requirements
      rarity,
      rarityProbability: legacyCard.rarityProbability || rarityConfig.probability,
      luck: legacyCard.luck || this.generateLuckStat(rarity),
      family: legacyCard.family || this.inferMemeFamily(legacyCard.name, legacyCard.tags),
      reference: legacyCard.reference || legacyCard.flavor || 'Classic meme reference',
      goldReward: legacyCard.goldReward || this.calculateGoldReward(rarity),
      
      // Game Mechanics
      type: legacyCard.type || CardType.CREATURE,
      cost: legacyCard.cost || 1,
      
      // Combat Stats - handle both flat and nested stats
      attack: legacyCard.attack || legacyCard.stats?.attack || legacyCard.damage || 1,
      defense: legacyCard.defense || legacyCard.stats?.defense || 1,
      health: legacyCard.health || legacyCard.stats?.health || 1,
      attackSpeed: legacyCard.attackSpeed || 1,
      
      // Enhanced Combat System
      emojis: this.migrateToEmojiProjectiles(legacyCard),
      cardEffects: legacyCard.cardEffects || this.generateDefaultEffects(rarity),
      synergies: legacyCard.synergies || [this.inferMemeFamily(legacyCard.name, legacyCard.tags)],
      passiveAbility: legacyCard.passiveAbility, // Keep for compatibility
      
      // Economic System
      goldGeneration: legacyCard.goldGeneration || Math.floor(rarityConfig.goldReward[0] * 0.1),
      dustValue: legacyCard.dustValue || rarityConfig.dustValue,
      tradeable: legacyCard.tradeable !== false,
      
      // Progression System
      level: legacyCard.level || 1,
      experience: legacyCard.experience || 0,
      stackCount: legacyCard.stackCount || 1,
      maxStacks: legacyCard.maxStacks || this.getMaxStacksByRarity(rarity),
      stackBonus: legacyCard.stackBonus || this.getDefaultStackBonus(),
      
      // Visual & UI
      visual: legacyCard.visual || this.getDefaultVisualByRarity(rarity),
      
      // Collection & Social
      craftable: legacyCard.craftable || false,
      craftCost: legacyCard.craftCost,
      isActive: legacyCard.isActive !== false,
      isLimited: legacyCard.isLimited || false,
      seasonalEvent: legacyCard.seasonalEvent,
      
      // Metadata
      effects: legacyCard.effects || [],
      tags: legacyCard.tags || [],
      flavor: legacyCard.flavor,
      lore: legacyCard.lore,
      releaseDate: legacyCard.releaseDate || now,
      createdAt: legacyCard.createdAt || now,
      updatedAt: legacyCard.updatedAt || now,
      
      // Legacy Compatibility
      emojiProjectile: legacyCard.emojiProjectile,
      damage: legacyCard.damage,
      ability: legacyCard.ability,
      emojiData: legacyCard.emojiData,
      stats: legacyCard.stats,
    };
  }
  
  // Normalize rarity from string to enum
  private static normalizeRarity(rarity: any): CardRarity {
    if (typeof rarity === 'string') {
      const upperRarity = rarity.toUpperCase();
      return CardRarity[upperRarity as keyof typeof CardRarity] || CardRarity.COMMON;
    }
    return rarity || CardRarity.COMMON;
  }
  
  // Get rarity configuration based on game specification
  private static getRarityConfig(rarity: CardRarity): RarityConfig {
    const configs: Record<CardRarity, RarityConfig> = {
      [CardRarity.COMMON]: {
        name: CardRarity.COMMON,
        probability: 2,
        goldReward: [10, 20],
        luckRange: [1, 10],
        emojiCount: [1, 2],
        dustValue: 1
      },
      [CardRarity.UNCOMMON]: {
        name: CardRarity.UNCOMMON,
        probability: 4,
        goldReward: [25, 50],
        luckRange: [10, 25],
        emojiCount: [2, 3],
        dustValue: 5
      },
      [CardRarity.RARE]: {
        name: CardRarity.RARE,
        probability: 10,
        goldReward: [75, 150],
        luckRange: [25, 50],
        emojiCount: [3, 4],
        dustValue: 20
      },
      [CardRarity.EPIC]: {
        name: CardRarity.EPIC,
        probability: 50,
        goldReward: [200, 400],
        luckRange: [50, 100],
        emojiCount: [4, 5],
        dustValue: 100
      },
      [CardRarity.LEGENDARY]: {
        name: CardRarity.LEGENDARY,
        probability: 200,
        goldReward: [500, 1000],
        luckRange: [100, 200],
        emojiCount: [5, 6],
        dustValue: 400
      },
      [CardRarity.MYTHIC]: {
        name: CardRarity.MYTHIC,
        probability: 1000,
        goldReward: [1500, 3000],
        luckRange: [200, 500],
        emojiCount: [6, 8],
        dustValue: 1600
      },
      [CardRarity.COSMIC]: {
        name: CardRarity.COSMIC,
        probability: 10000,
        goldReward: [5000, 10000],
        luckRange: [500, 1000],
        emojiCount: [8, 10],
        dustValue: 8000
      },
      [CardRarity.DIVINE]: {
        name: CardRarity.DIVINE,
        probability: 100000,
        goldReward: [15000, 25000],
        luckRange: [1000, 2000],
        emojiCount: [10, 12],
        dustValue: 40000
      },
      [CardRarity.INFINITY]: {
        name: CardRarity.INFINITY,
        probability: 1000000,
        goldReward: [50000, 100000],
        luckRange: [2000, 5000],
        emojiCount: [12, 15],
        dustValue: 200000
      }
    };
    return configs[rarity] || configs[CardRarity.COMMON];
  }

  // Get max stacks based on rarity
  private static getMaxStacksByRarity(rarity: CardRarity): number {
    const stackMap = {
      [CardRarity.COMMON]: 10,
      [CardRarity.UNCOMMON]: 8,
      [CardRarity.RARE]: 6,
      [CardRarity.EPIC]: 4,
      [CardRarity.LEGENDARY]: 3,
      [CardRarity.MYTHIC]: 2,
      [CardRarity.COSMIC]: 1,
      [CardRarity.DIVINE]: 1,
      [CardRarity.INFINITY]: 1,
    };
    return stackMap[rarity] || 5;
  }
  
  // Get default visual properties by rarity
  private static getDefaultVisualByRarity(rarity: CardRarity): VisualProperties {
    const visualMap = {
      [CardRarity.COMMON]: {
        glow: '#9CA3AF',
        borderColor: '#D1D5DB',
        backgroundColor: '#F9FAFB',
        textColor: '#374151',
      },
      [CardRarity.UNCOMMON]: {
        glow: '#10B981',
        borderColor: '#059669',
        backgroundColor: '#ECFDF5',
        textColor: '#065F46',
      },
      [CardRarity.RARE]: {
        glow: '#3B82F6',
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
        textColor: '#1E3A8A',
      },
      [CardRarity.EPIC]: {
        glow: '#8B5CF6',
        borderColor: '#7C3AED',
        backgroundColor: '#F5F3FF',
        textColor: '#4C1D95',
      },
      [CardRarity.LEGENDARY]: {
        glow: '#F59E0B',
        borderColor: '#D97706',
        backgroundColor: '#FFFBEB',
        textColor: '#92400E',
      },
      [CardRarity.MYTHIC]: {
        glow: '#EF4444',
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
        textColor: '#991B1B',
      },
      [CardRarity.COSMIC]: {
        glow: '#EC4899',
        borderColor: '#DB2777',
        backgroundColor: '#FDF2F8',
        textColor: '#831843',
      },
      [CardRarity.DIVINE]: {
        glow: '#FFD700',
        borderColor: '#FFC700',
        backgroundColor: '#FFFEF0',
        textColor: '#FFB300',
        animation: 'sparkle' as const,
        particles: true,
      },
      [CardRarity.INFINITY]: {
        glow: '#9400D3',
        borderColor: '#8B008B',
        backgroundColor: '#FFF0F5',
        textColor: '#4B0082',
        animation: 'electric' as const,
        particles: true,
      },
    };
    return visualMap[rarity as keyof typeof visualMap] || visualMap[CardRarity.COMMON];
  }
  
  // Generate luck stat based on rarity
  private static generateLuckStat(rarity: CardRarity): number {
    const config = this.getRarityConfig(rarity);
    const [min, max] = config.luckRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Calculate gold reward based on rarity
  private static calculateGoldReward(rarity: CardRarity): number {
    const config = this.getRarityConfig(rarity);
    const [min, max] = config.goldReward;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Infer meme family from card name and tags
  private static inferMemeFamily(name: string, tags?: string[]): MemeFamily {
    const nameUpper = name.toUpperCase();
    const tagStr = tags?.join(' ').toUpperCase() || '';
    const combined = nameUpper + ' ' + tagStr;

    if (combined.includes('DOGE') || combined.includes('PEPE') || combined.includes('CHAD') || combined.includes('WOJAK')) {
      return MemeFamily.CLASSIC_INTERNET;
    }
    if (combined.includes('ANIMAL') || combined.includes('CAT') || combined.includes('DOG')) {
      return MemeFamily.ANIMALS;
    }
    if (combined.includes('FIRE') || combined.includes('WATER') || combined.includes('ELEMENT')) {
      return MemeFamily.ABSTRACT_CONCEPTS;
    }
    if (combined.includes('GAME') || combined.includes('GAMING') || combined.includes('PLAYER')) {
      return MemeFamily.GAMING_ARCHETYPES;
    }
    if (combined.includes('EMOTION') || combined.includes('REACTION') || combined.includes('FEEL')) {
      return MemeFamily.EMOTIONS_REACTIONS;
    }
    // Default fallback
    return MemeFamily.INTERNET_CULTURE;
  }

  // Migrate legacy emoji data to new projectile system
  private static migrateToEmojiProjectiles(legacyCard: any): EmojiProjectile[] {
    const projectiles: EmojiProjectile[] = [];
    
    // Handle single emoji projectile
    if (legacyCard.emojiProjectile) {
      projectiles.push({
        character: legacyCard.emojiProjectile.emoji,
        damage: legacyCard.emojiProjectile.damage,
        speed: legacyCard.emojiProjectile.speed,
        trajectory: legacyCard.emojiProjectile.trajectory,
        effects: legacyCard.emojiProjectile.effects?.map((e: string) => e as EffectType) || [],
        target: 'OPPONENT',
        fireRate: 1,
        piercing: false,
        homing: legacyCard.emojiProjectile.trajectory === 'homing',
        bounces: 0
      });
    } else {
      // Create default projectile from main emoji
      projectiles.push({
        character: legacyCard.emoji || '❓',
        damage: legacyCard.attack || legacyCard.stats?.attack || 1,
        speed: 3,
        trajectory: 'straight',
        effects: [],
        target: 'OPPONENT',
        fireRate: 1,
        piercing: false,
        homing: false,
        bounces: 0
      });
    }
    
    // Add additional emojis if available
    if (legacyCard.emojis) {
      legacyCard.emojis.forEach((emoji: string) => {
        if (emoji !== legacyCard.emoji) { // Don't duplicate main emoji
          projectiles.push({
            character: emoji,
            damage: Math.max(1, Math.floor((legacyCard.attack || 1) * 0.8)),
            speed: 2,
            trajectory: 'straight',
            effects: [],
            target: 'OPPONENT',
            fireRate: 0.5,
            piercing: false,
            homing: false,
            bounces: 0
          });
        }
      });
    }
    
    return projectiles;
  }

  // Generate default effects based on rarity
  private static generateDefaultEffects(rarity: CardRarity): CardEffect[] {
    const effects: CardEffect[] = [];
    
    // Higher rarity cards get more effects
    const effectCount = rarity === CardRarity.COMMON ? 0 : 
                       rarity === CardRarity.UNCOMMON ? 1 :
                       rarity === CardRarity.RARE ? 1 :
                       rarity === CardRarity.EPIC ? 2 :
                       rarity === CardRarity.LEGENDARY ? 2 :
                       rarity === CardRarity.MYTHIC ? 3 :
                       rarity === CardRarity.COSMIC ? 3 :
                       rarity === CardRarity.DIVINE ? 4 : 5;
    
    const availableEffects = Object.values(EffectType);
    
    for (let i = 0; i < effectCount; i++) {
      const effectType = availableEffects[Math.floor(Math.random() * availableEffects.length)];
      effects.push({
        id: `effect_${i}`,
        name: effectType.toLowerCase().replace('_', ' '),
        description: `Chance to apply ${effectType.toLowerCase()} effect`,
        trigger: TriggerType.RANDOM,
        chance: Math.random() * 0.3 + 0.1, // 10-40% chance
        effect: effectType,
        value: Math.floor(Math.random() * 3) + 1,
        duration: 3,
        cooldown: 5
      });
    }
    
    return effects;
  }

  // Get default stack bonus
  private static getDefaultStackBonus(): StackBonus {
    return {
      luckMultiplier: 0.1,      // +10% per stack
      goldMultiplier: 0.15,     // +15% per stack
      bonusEmojis: [],          // Filled when stacked
      effectBonus: 0.05,        // +5% effect chance per stack
      damageBonus: 0.1          // +10% damage per stack
    };
  }

  // Calculate total card power based on stats (enhanced)
  static calculatePower(card: UnifiedCard): number {
    const basePower = card.attack + card.defense + card.health + (card.cost * 2);
    const luckBonus = (card.luck || 0) * 0.01; // Luck contributes to power
    const stackBonus = (card.stackCount - 1) * 10; // Each stack adds 10 power
    const emojiBonus = (card.emojis?.length || 0) * 5; // Each emoji adds 5 power
    return Math.floor(basePower + luckBonus + stackBonus + emojiBonus);
  }
  
  // Check if card is valid
  static isValid(card: UnifiedCard): boolean {
    return (
      !!card.id &&
      !!card.name &&
      !!card.emoji &&
      card.attack >= 0 &&
      card.defense >= 0 &&
      card.health >= 0 &&
      card.cost >= 0 &&
      Object.values(CardRarity).includes(card.rarity) &&
      Object.values(CardType).includes(card.type)
    );
  }
}

// Filter interface for card queries
export interface CardFilter {
  rarity?: CardRarity;
  type?: CardType;
  cost?: number;
  minAttack?: number;
  maxAttack?: number;
  minDefense?: number;
  maxDefense?: number;
  minHealth?: number;
  maxHealth?: number;
  tags?: string[];
  craftable?: boolean;
  isActive?: boolean;
}

// Export the unified types for backward compatibility
export { CardRarity as Rarity, CardType as Type };
