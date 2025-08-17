import React from 'react';
import { Card } from '../cards/Card';
import { UnifiedCard, UnifiedRarity, CardType, createDefaultEmojis, createDefaultPassive } from '../../models/unified/Card';

// Cartes de test pour chaque rareté
const testCards: UnifiedCard[] = [
  {
    id: 'test-common',
    name: 'Carte Commune',
    description: 'Une carte commune avec des statistiques de base',
    rarity: UnifiedRarity.COMMON,
    type: CardType.CREATURE,
    cost: 2,
    attack: 2,
    defense: 1,
    hp: 10,
    attackSpeed: 1.0,
    emojis: createDefaultEmojis('🔥', UnifiedRarity.COMMON),
    passive: createDefaultPassive(),
    stackLevel: 0,
    experience: 0,
    luck: 5,
    emoji: '🔥',
    color: '#808080',
    tags: ['test', 'common'],
    stats: { attack: 2, defense: 1, health: 10 },
    ability: 'Attaque de base',
    flavor: 'Une flamme simple mais efficace'
  },
  {
    id: 'test-uncommon',
    name: 'Carte Peu Commune',
    description: 'Une carte peu commune avec des capacités améliorées',
    rarity: UnifiedRarity.UNCOMMON,
    type: CardType.SPELL,
    cost: 3,
    attack: 3,
    defense: 2,
    hp: 15,
    attackSpeed: 1.2,
    emojis: createDefaultEmojis('⚡', UnifiedRarity.UNCOMMON),
    passive: createDefaultPassive(),
    stackLevel: 0,
    experience: 0,
    luck: 10,
    emoji: '⚡',
    color: '#40C057',
    tags: ['test', 'uncommon'],
    stats: { attack: 3, defense: 2, health: 15 },
    ability: 'Éclair rapide',
    flavor: 'La foudre frappe sans prévenir'
  },
  {
    id: 'test-rare',
    name: 'Carte Rare',
    description: 'Une carte rare avec des synergies complexes',
    rarity: UnifiedRarity.RARE,
    type: CardType.CREATURE,
    cost: 4,
    attack: 4,
    defense: 3,
    hp: 20,
    attackSpeed: 1.5,
    emojis: [
      { character: '🔥', damage: 5, speed: 200, trajectory: 'STRAIGHT' as any },
      { character: '💣', damage: 8, speed: 150, trajectory: 'WAVE' as any }
    ],
    passive: createDefaultPassive(),
    stackLevel: 0,
    experience: 0,
    luck: 15,
    emoji: '🔥',
    color: '#339AF0',
    tags: ['test', 'rare', 'synergy'],
    stats: { attack: 4, defense: 3, health: 20 },
    ability: 'Combo explosif',
    flavor: 'Feu et explosion font bon ménage'
  },
  {
    id: 'test-epic',
    name: 'Carte Épique',
    description: 'Une carte épique aux pouvoirs extraordinaires',
    rarity: UnifiedRarity.EPIC,
    type: CardType.SPELL,
    cost: 6,
    attack: 6,
    defense: 4,
    hp: 30,
    attackSpeed: 2.0,
    emojis: [
      { character: '⚡', damage: 7, speed: 250, trajectory: 'HOMING' as any },
      { character: '🌊', damage: 6, speed: 180, trajectory: 'WAVE' as any },
      { character: '❄️', damage: 5, speed: 200, trajectory: 'SPIRAL' as any }
    ],
    passive: createDefaultPassive(),
    stackLevel: 0,
    experience: 0,
    luck: 25,
    emoji: '⚡',
    color: '#9775FA',
    tags: ['test', 'epic', 'multi-element'],
    stats: { attack: 6, defense: 4, health: 30 },
    ability: 'Maîtrise élémentaire',
    flavor: 'Les éléments obéissent à votre volonté'
  },
  {
    id: 'test-legendary',
    name: 'Carte Légendaire',
    description: 'Une carte légendaire de puissance immense',
    rarity: UnifiedRarity.LEGENDARY,
    type: CardType.CREATURE,
    cost: 8,
    attack: 8,
    defense: 6,
    hp: 50,
    attackSpeed: 2.5,
    emojis: [
      { character: '🔥', damage: 10, speed: 300, trajectory: 'STRAIGHT' as any },
      { character: '⚡', damage: 12, speed: 280, trajectory: 'HOMING' as any },
      { character: '💀', damage: 15, speed: 200, trajectory: 'SPIRAL' as any },
      { character: '🌟', damage: 8, speed: 350, trajectory: 'WAVE' as any }
    ],
    passive: createDefaultPassive(),
    stackLevel: 0,
    experience: 0,
    luck: 40,
    emoji: '🔥',
    color: '#FD7E14',
    tags: ['test', 'legendary', 'ultimate'],
    stats: { attack: 8, defense: 6, health: 50 },
    ability: 'Pouvoir légendaire',
    flavor: 'Une légende prend vie sous vos yeux'
  },
  {
    id: 'test-cosmic',
    name: 'Carte Cosmique',
    description: 'Une carte cosmique qui défie la réalité',
    rarity: UnifiedRarity.COSMIC,
    type: CardType.SPELL,
    cost: 15,
    attack: 15,
    defense: 10,
    hp: 100,
    attackSpeed: 5.0,
    emojis: [
      { character: '🌌', damage: 20, speed: 400, trajectory: 'HOMING' as any },
      { character: '⭐', damage: 18, speed: 380, trajectory: 'SPIRAL' as any },
      { character: '🌙', damage: 16, speed: 350, trajectory: 'WAVE' as any },
      { character: '☄️', damage: 25, speed: 450, trajectory: 'RANDOM' as any },
      { character: '🔮', damage: 22, speed: 320, trajectory: 'STRAIGHT' as any }
    ],
    passive: createDefaultPassive(),
    stackLevel: 0,
    experience: 0,
    luck: 100,
    emoji: '🌌',
    color: '#FF00FF',
    tags: ['test', 'cosmic', 'reality-bending'],
    stats: { attack: 15, defense: 10, health: 100 },
    ability: 'Distorsion cosmique',
    flavor: 'L\'univers lui-même plie sous votre volonté'
  }
];

interface CardShowcaseProps {
  mode?: 'display' | 'combat' | 'collection';
  size?: 'small' | 'medium' | 'large';
}

export const CardShowcase: React.FC<CardShowcaseProps> = ({ 
  mode = 'display', 
  size = 'medium' 
}) => {
  return (
    <div style={{ 
      padding: '20px', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
      gap: '20px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        gridColumn: '1 / -1', 
        textAlign: 'center', 
        color: '#fff', 
        fontSize: '2rem',
        margin: '0 0 20px 0'
      }}>
        🃏 Showcase des Cartes - Mode {mode.toUpperCase()} - Taille {size.toUpperCase()}
      </h1>
      
      {testCards.map((card, index) => (
        <div key={card.id} style={{ display: 'flex', justifyContent: 'center' }}>
          <Card 
            card={card}
            mode={mode}
            size={size}
            showAnimations={true}
            showStats={true}
            showSynergies={true}
            onClick={() => console.log('Carte cliquée:', card.name)}
          />
        </div>
      ))}
    </div>
  );
};

export default CardShowcase;