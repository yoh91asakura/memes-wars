// Test cards for debugging card display
import { Card } from '../models/Card';

export const createTestCards = (): Card[] => {
  return [
    {
      // Core Identity
      id: 'test-fire-ember',
      name: 'Fire Ember 🔥',
      rarity: 2, // common
      luck: 5,
      emojis: [
        {
          character: '🔥',
          damage: 3,
          speed: 3,
          trajectory: 'straight',
          effect: undefined,
          target: 'OPPONENT'
        },
        {
          character: '🔥',
          damage: 3,
          speed: 3,
          trajectory: 'straight',
          effect: undefined,
          target: 'OPPONENT'
        }
      ],
      family: 'CLASSIC_INTERNET',
      stackLevel: 1,
      reference: 'Classic fire emoji with burning passion',
      goldReward: 15,
      
      // Display
      emoji: '🔥',
      description: 'A blazing ember that burns with steady determination',
      
      // Optional Combat
      hp: 105,
      cardEffects: [{
        trigger: 'ON_HIT',
        chance: 0.25,
        effect: 'BURN',
        duration: 3
      }],
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addedAt: new Date().toISOString()
    } as Card,
    {
      // Core Identity
      id: 'test-water-drop',
      name: 'Water Drop 💧',
      description: 'A refreshing drop of pure water with healing properties',
      emoji: '💧',
      
      // Game Specification Requirements
      rarity: 2,
      luck: 3,
      emojis: [
        {
          character: '💧',
          damage: 2,
          speed: 4,
          trajectory: 'straight',
          effect: undefined,
          target: 'OPPONENT'
        }
      ],
      family: 'CLASSIC_INTERNET',
      stackLevel: 1,
      reference: 'Pristine water drop with healing properties',
      goldReward: 12,
      
      // Optional Combat
      hp: 95,
      cardEffects: [{
        trigger: 'BATTLE_START',
        chance: 1.0,
        effect: 'HEAL',
        value: 10
      }],
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addedAt: new Date().toISOString()
    } as Card,
    {
      // Core Identity
      id: 'test-lightning-bolt',
      name: 'Lightning Bolt ⚡',
      description: 'A powerful electric strike that can stun enemies',
      emoji: '⚡',
      
      // Game Specification Requirements
      rarity: 4, // uncommon
      luck: 8,
      emojis: [
        {
          character: '⚡',
          damage: 5,
          speed: 6,
          trajectory: 'straight',
          effect: undefined,
          target: 'OPPONENT'
        },
        {
          character: '⚡',
          damage: 5,
          speed: 6,
          trajectory: 'straight',
          effect: undefined,
          target: 'OPPONENT'
        },
        {
          character: '⚡',
          damage: 5,
          speed: 6,
          trajectory: 'straight',
          effect: undefined,
          target: 'OPPONENT'
        }
      ],
      family: 'CLASSIC_INTERNET',
      stackLevel: 1,
      reference: 'High-voltage lightning with stunning power',
      goldReward: 25,
      
      // Optional Combat
      hp: 110,
      cardEffects: [{
        trigger: 'ON_HIT',
        chance: 0.15,
        effect: 'STUN',
        duration: 2
      }],
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addedAt: new Date().toISOString()
    } as Card
  ];
};