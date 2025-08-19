#!/usr/bin/env node

/**
 * Fix script to repair the broken card files structure
 */

const fs = require('fs');
const path = require('path');

function fixCardFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`Fixing ${fileName}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it's already fixed (has proper emojis array structure)
  if (content.includes('emojis: [') && content.includes('    {') && content.includes('      character:')) {
    console.log(`✅ ${fileName} is already properly formatted`);
    return;
  }
  
  // Rewrite the file with proper structure based on the file name
  let fixedContent = '';
  
  if (fileName === 'cosmic.ts') {
    // Already fixed
    console.log(`✅ ${fileName} already fixed`);
    return;
  } else if (fileName === 'divine.ts') {
    fixedContent = `import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const divineCards: Card[] = [
  {
    // Core Identity
    id: 'divine-001',
    name: 'The One Meme ∞',
    rarity: 100000,                   // 1/100000 probability
    luck: 1500,
    emojis: [
      {
        character: '∞',
        damage: 35,
        speed: 1,
        trajectory: 'spiral',
        effect: EffectType.CHAOS,
        target: 'OPPONENT'
      },
      {
        character: '🌌',
        damage: 25,
        speed: 1,
        trajectory: 'spiral',
        target: 'OPPONENT'
      },
      {
        character: '✨',
        damage: 15,
        speed: 3,
        trajectory: 'wave',
        target: 'OPPONENT'
      },
      {
        character: '🔮',
        damage: 30,
        speed: 2,
        trajectory: 'wave',
        effect: EffectType.CHAOS,
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'Meta-meme representing the concept of memes themselves',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 20000,
    
    // Display
    emoji: '∞',
    description: 'The source code of all memes - pure memetic energy',
    visual: CardUtils.getDefaultVisual(100000, 1),
    
    // Optional Combat
    hp: 1600,
    cardEffects: [
      {
        trigger: TriggerType.BATTLE_START,
        chance: 1.0,
        effect: EffectType.CHAOS,
        duration: 60
      },
      {
        trigger: TriggerType.RANDOM,
        chance: 0.3,
        effect: EffectType.CHAOS,
        duration: 5
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    // Core Identity
    id: 'divine-002',
    name: 'Primordial Pepe 🐸👑',
    rarity: 100000,                   // 1/100000 probability
    luck: 1750,
    emojis: [
      {
        character: '🐸',
        damage: 30,
        speed: 2,
        trajectory: 'arc',
        effect: EffectType.MULTIPLY,
        target: 'OPPONENT'
      },
      {
        character: '👑',
        damage: 20,
        speed: 2,
        trajectory: 'straight',
        target: 'OPPONENT'
      },
      {
        character: '💚',
        damage: 10,
        speed: 4,
        trajectory: 'wave',
        effect: EffectType.HEAL_SELF,
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.CLASSIC_INTERNET,
    reference: 'Pepe the Frog - the primordial form that spawned countless variants',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 22500,
    
    // Display
    emoji: '🐸',
    description: 'The first and most powerful Pepe, origin of all variants',
    visual: CardUtils.getDefaultVisual(100000, 1),
    
    // Optional Combat
    hp: 1850,
    cardEffects: [
      {
        trigger: TriggerType.BATTLE_START,
        chance: 1.0,
        effect: EffectType.MULTIPLY,
        duration: 30
      },
      {
        trigger: TriggerType.PERIODIC,
        chance: 0.6,
        effect: EffectType.HEAL,
        duration: 3
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];`;
  } else if (fileName === 'infinity.ts') {
    fixedContent = `import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const infinityCards: Card[] = [
  {
    // Core Identity
    id: 'infinity-001',
    name: 'Omnimeme Nexus 🌍🔮∞',
    rarity: 1000000,                   // 1/1000000 probability
    luck: 5000,
    emojis: [
      {
        character: '🌍',
        damage: 50,
        speed: 1,
        trajectory: 'spiral',
        effect: EffectType.CHAOS,
        target: 'OPPONENT'
      },
      {
        character: '🔮',
        damage: 40,
        speed: 2,
        trajectory: 'wave',
        effect: EffectType.MULTIPLY,
        target: 'OPPONENT'
      },
      {
        character: '∞',
        damage: 60,
        speed: 1,
        trajectory: 'arc',
        effect: EffectType.BURST,
        target: 'OPPONENT'
      },
      {
        character: '⚡',
        damage: 35,
        speed: 5,
        trajectory: 'straight',
        effect: EffectType.STUN,
        target: 'OPPONENT'
      },
      {
        character: '🌟',
        damage: 30,
        speed: 3,
        trajectory: 'wave',
        target: 'OPPONENT'
      }
    ],
    family: MemeFamily.ABSTRACT_CONCEPTS,
    reference: 'The ultimate convergence of all meme culture - past, present, and future',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: 100000,
    
    // Display
    emoji: '🌍',
    description: 'All memes that have been, are, and will be - united as one',
    visual: CardUtils.getDefaultVisual(1000000, 1),
    
    // Optional Combat
    hp: 5100,
    cardEffects: [
      {
        trigger: TriggerType.BATTLE_START,
        chance: 1.0,
        effect: EffectType.BARRIER,
        duration: 999
      },
      {
        trigger: TriggerType.RANDOM,
        chance: 0.5,
        effect: EffectType.CHAOS,
        duration: 10
      },
      {
        trigger: TriggerType.LOW_HP,
        chance: 1.0,
        effect: EffectType.RESURRECT,
        duration: 1
      }
    ],
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];`;
  } else {
    console.log(`⚠️ Skipping ${fileName} - needs manual inspection`);
    return;
  }
  
  if (fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`✅ Fixed ${fileName}`);
  }
}

// Main execution
function main() {
  const cardsDir = path.join(__dirname, '..', 'data', 'cards');
  const files = [
    'divine.ts',
    'infinity.ts'
  ];
  
  console.log('🔧 Starting fixes...\n');
  
  files.forEach(file => {
    const filePath = path.join(cardsDir, file);
    if (fs.existsSync(filePath)) {
      try {
        fixCardFile(filePath);
      } catch (error) {
        console.error(`❌ Error fixing ${file}:`, error.message);
      }
    } else {
      console.log(`⚠️ File not found: ${file}`);
    }
  });
  
  console.log('\n✨ Fixes complete!');
}

// Run the fixes
main();
