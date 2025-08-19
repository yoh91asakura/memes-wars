import { EffectType } from '../models/unified/Card';

// Convert effect string to EffectType enum
export function convertEffectToEnum(effect: string | EffectType): EffectType {
  // If already an enum value, return it
  if (Object.values(EffectType).includes(effect as EffectType)) {
    return effect as EffectType;
  }

  // Convert string to enum
  const effectUpper = effect.toUpperCase().replace(/-/g, '_');
  
  // Map common variations
  const effectMap: Record<string, EffectType> = {
    'KNOCKBACK': EffectType.KNOCKBACK,
    'STUN': EffectType.STUN,
    'DEFENSE': EffectType.DEFENSE,
    'PUSH': EffectType.PUSH,
    'SPEED_BOOST': EffectType.SPEED_BOOST,
    'SPEED': EffectType.SPEED,
    'SUPPORT': EffectType.SUPPORT,
    'CHAIN': EffectType.CHAIN,
    'PARALYZE': EffectType.PARALYZE,
    'LIGHTNING': EffectType.LIGHTNING,
    'BURN': EffectType.BURN,
    'AREA': EffectType.AREA,
    'INTIMIDATE': EffectType.INTIMIDATE,
    'FIRE': EffectType.FIRE,
    'FLYING': EffectType.FLYING,
    'HEAL_SELF': EffectType.HEAL_SELF,
    'RESURRECT': EffectType.RESURRECT,
    'HEAL': EffectType.HEAL,
    'FREEZE': EffectType.FREEZE,
    'POISON': EffectType.POISON,
    'SHIELD': EffectType.SHIELD,
    'BOOST': EffectType.BOOST,
    'LUCKY': EffectType.LUCKY,
    'BURST': EffectType.BURST,
    'REFLECT': EffectType.REFLECT,
    'MULTIPLY': EffectType.MULTIPLY,
    'DRAIN': EffectType.DRAIN,
    'BARRIER': EffectType.BARRIER,
    'CHAOS': EffectType.CHAOS,
    'PRECISION': EffectType.PRECISION,
  };

  return effectMap[effectUpper] || EffectType.BOOST; // Default to BOOST if not found
}

// Convert array of effect strings to EffectType enum array
export function convertEffectsArray(effects: (string | EffectType)[]): EffectType[] {
  return effects.map(effect => convertEffectToEnum(effect));
}
