// Emoji System Types
export enum EmojiCategory {
  DAMAGE = 'damage',
  CONTROL = 'control', 
  SUPPORT = 'support',
  DEBUFF = 'debuff',
  ENERGY = 'energy'
}

export enum EmojiEffectType {
  // Damage effects
  DAMAGE = 'damage',
  BURN = 'burn',
  CHAIN = 'chain',
  AREA = 'area',
  PIERCE = 'pierce',
  RAPID_FIRE = 'rapid_fire',
  DELAYED_EXPLOSION = 'delayed_explosion',
  HOMING = 'homing',
  KNOCKBACK = 'knockback',
  MULTI_HIT = 'multi_hit',
  
  // Control effects
  FREEZE = 'freeze',
  SLOW = 'slow',
  SCATTER = 'scatter',
  ROOT = 'root',
  SLEEP = 'sleep',
  CONFUSE = 'confuse',
  PUSH = 'push',
  PULL = 'pull',
  TIME_WARP = 'time_warp',
  DISABLE = 'disable',
  
  // Support effects
  HEAL = 'heal',
  SHIELD = 'shield',
  MANA_RESTORE = 'mana_restore',
  REGEN = 'regen',
  BUFF_ATTACK = 'buff_attack',
  BUFF_SPEED = 'buff_speed',
  BUFF_STRENGTH = 'buff_strength',
  LUCKY = 'lucky',
  HARMONY = 'harmony',
  CHARM = 'charm',
  
  // Debuff effects
  POISON = 'poison',
  EXECUTE = 'execute',
  PHASE = 'phase',
  SPREAD = 'spread',
  FEAR = 'fear',
  VENOM = 'venom',
  PARALYZE = 'paralyze',
  THORNS = 'thorns',
  SPORE_CLOUD = 'spore_cloud',
  PETRIFY = 'petrify',
  WEB = 'web',
  
  // Energy effects
  CHARGE = 'charge',
  ENERGY_STEAL = 'energy_steal',
  VALUE_BONUS = 'value_bonus',
  GOLD_RUSH = 'gold_rush',
  RANDOM_DAMAGE = 'random_damage',
  JACKPOT = 'jackpot',
  FORESIGHT = 'foresight',
  COMBO = 'combo',
  VICTORY_BONUS = 'victory_bonus',
  MAJESTY = 'majesty'
}

export interface EmojiPower {
  character: string;
  name: string;
  category: EmojiCategory;
  baseDamage: number;
  effectType: EmojiEffectType;
  effectValue?: number;
  effectDuration?: number;
  projectileSpeed?: number;
  trajectory?: 'straight' | 'arc' | 'homing' | 'wave' | 'spiral' | 'random';
  description: string;
  cooldown?: number;
}

export type TrajectoryPattern = 'straight' | 'arc' | 'homing' | 'wave' | 'spiral' | 'random';

export interface EmojiSynergy {
  name: string;
  description: string;
  requiredEmojis: string[];
  bonusEffect: string;
  bonusValue: number;
  category: 'damage' | 'control' | 'support' | 'survival' | 'energy';
}

export interface EmojiAssignmentRules {
  rarity: string;
  minEmojis: number;
  maxEmojis: number;
  allowedCategories: EmojiCategory[];
  requiredCategories?: EmojiCategory[];
  forbiddenCategories?: EmojiCategory[];
  maxPerCategory?: Record<EmojiCategory, number>;
  energyRequirement?: number;
}

export interface CardEmojiData {
  emojis: string[];
  emojiPowers: EmojiPower[];
  activeSynergies: EmojiSynergy[];
  totalBaseDamage: number;
  synergyBonus: number;
}