import { Card } from '../../Card';

export interface CommonCard extends Card {
  rarity: 'common';
  cost: 1 | 2;
}

export interface CommonCreature extends CommonCard {
  type: 'creature';
  attack: 1 | 2 | 3;
  defense: 1 | 2 | 3 | 4;
  health: 1 | 2 | 3 | 4;
}

export interface CommonSpell extends CommonCard {
  type: 'spell';
  attack: 0;
  defense: 0;
  health: 0;
}

export interface CardAbility {
  name: string;
  type: 'passive' | 'active' | 'targeted';
  description: string;
  effect: string;
  value?: number;
  condition?: string;
  cooldown?: number;
  range?: string;
  unblockable?: boolean;
  ignore_taunt?: boolean;
  cannot_miss?: boolean;
  attack_buff?: number;
  defense_buff?: number;
}

export interface CommonCardData {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common';
  type: 'creature' | 'spell';
  cost: number;
  attack: number;
  defense: number;
  health: number;
  description: string;
  ability: CardAbility;
  flavorText: string;
  tags: string[];
}

export type CommonCardId = 
  | 'COMMON_001' 
  | 'COMMON_002' 
  | 'COMMON_003' 
  | 'COMMON_004' 
  | 'COMMON_005' 
  | 'COMMON_006' 
  | 'COMMON_007' 
  | 'COMMON_008' 
  | 'COMMON_009' 
  | 'COMMON_010';

export interface CommonCardCollection {
  [key: string]: CommonCardData;
}