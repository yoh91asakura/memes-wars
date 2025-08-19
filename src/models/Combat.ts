// Combat Models - All combat-related data structures

import { UnifiedCard } from './unified/Card';

export interface Position {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EmojiProjectile {
  id: string;
  emoji: string;
  position: Position;
  velocity: Vector2D;
  damage: number;
  size: number;
  rotation: number;
  ownerId: string;
  bounces: number;
  maxBounces: number;
  lifespan: number;
  maxLifespan: number;
  effects: ProjectileEffect[];
  trail: Position[];
  isActive: boolean;
}

export interface ProjectileEffect {
  type: 'burn' | 'freeze' | 'poison' | 'stun' | 'heal' | 'shield' | 'speed';
  duration: number;
  intensity: number;
  stackable: boolean;
}

export interface ActiveEffect {
  id: string;
  type: ProjectileEffect['type'];
  remainingDuration: number;
  intensity: number;
  sourceId: string;
  targetId: string;
  tickInterval: number;
  lastTick: number;
}

export interface Collision {
  projectileId: string;
  targetId: string;
  targetType: 'player' | 'projectile' | 'boundary';
  contactPoint: Position;
  damage: number;
  effects: ProjectileEffect[];
  timestamp: number;
}

export interface CombatArena {
  id: string;
  width: number;
  height: number;
  boundaries: BoundingBox[];
  obstacles: Obstacle[];
  playerSpawns: Position[];
  powerupSpawns: Position[];
  settings: ArenaSettings;
}

export interface Obstacle {
  id: string;
  position: Position;
  size: { width: number; height: number };
  type: 'wall' | 'destructible' | 'bouncy';
  health?: number;
  maxHealth?: number;
}

export interface ArenaSettings {
  gravity: number;
  friction: number;
  bounceMultiplier: number;
  maxProjectiles: number;
  tickRate: number;
  roundDuration: number;
  suddenDeathTime: number;
}

export interface CombatPlayer {
  id: string;
  username: string;
  position: Position;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  deck: CombatDeck;
  activeEffects: ActiveEffect[];
  lastFireTime: number;
  fireRate: number;
  moveSpeed: number;
  isAlive: boolean;
  kills: number;
  damage: number;
  accuracy: number;
  shotsFired: number;
  shotsHit: number;
}

export interface CombatDeck {
  id: string;
  cards: UnifiedCard[];
  activeProjectiles: EmojiProjectile[];
  firePattern: FirePattern;
  totalDamage: number;
  totalHealth: number;
  specialAbilities: SpecialAbility[];
}

export interface FirePattern {
  type: 'single' | 'burst' | 'spread' | 'spiral' | 'beam';
  projectilesPerFire: number;
  spreadAngle: number;
  fireRate: number;
  cooldown: number;
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  lastUsed: number;
  manaCost: number;
  effects: ProjectileEffect[];
  trigger: AbilityTrigger;
}

export interface AbilityTrigger {
  type: 'manual' | 'onHit' | 'onKill' | 'onLowHealth' | 'periodic';
  threshold?: number;
  interval?: number;
}

export interface CombatPhase {
  name: string;
  duration: number;
  effects: {
    gravity: number;
    projectileSpeed: number;
    fireRate: number;
    damageMultiplier: number;
  };
  triggers: PhaseTrigger[];
}

export interface PhaseTrigger {
  type: 'time' | 'playersAlive' | 'healthThreshold';
  value: number;
}

export interface CombatStats {
  duration: number;
  totalProjectiles: number;
  totalDamage: number;
  totalHealing: number;
  collisions: number;
  killCount: number;
  survivorCount: number;
  averageFPS: number;
  peakProjectileCount: number;
}

export interface CombatResult {
  winner: CombatPlayer | null;
  survivors: CombatPlayer[];
  eliminated: CombatPlayer[];
  finalStats: CombatStats;
  rewards: CombatReward[];
  matchDuration: number;
  endReason: 'elimination' | 'timeout' | 'disconnect' | 'surrender';
}

export interface CombatReward {
  type: 'xp' | 'coins' | 'gems' | 'card' | 'achievement';
  amount: number;
  item?: UnifiedCard;
  reason: string;
}

export type CombatEventType = 
  | 'projectile_fired'
  | 'projectile_hit' 
  | 'player_damaged'
  | 'player_killed'
  | 'effect_applied'
  | 'ability_used'
  | 'phase_changed'
  | 'match_started'
  | 'match_ended';

export interface CombatEvent {
  id: string;
  type: CombatEventType;
  timestamp: number;
  playerId?: string;
  projectileId?: string;
  data: Record<string, unknown>;
  position?: Position;
}

export interface CombatState {
  phase: 'waiting' | 'countdown' | 'active' | 'paused' | 'ended';
  arena: CombatArena;
  players: CombatPlayer[];
  projectiles: EmojiProjectile[];
  effects: ActiveEffect[];
  currentPhase: CombatPhase;
  timeRemaining: number;
  events: CombatEvent[];
  stats: CombatStats;
  startTime: number;
  endTime?: number;
  winner?: string;
}