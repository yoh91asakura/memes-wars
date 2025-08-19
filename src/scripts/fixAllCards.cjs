#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixBrokenCardFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`Analyzing ${fileName}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it's already fixed 
  if (content.includes('emojis: [') && 
      content.includes('      character:') && 
      content.includes('      target: \'OPPONENT\'') &&
      !content.includes('}, {')) {
    console.log(`✅ ${fileName} is already properly formatted`);
    return;
  }
  
  // Extract card data using regex to rebuild properly
  const cardMatches = content.matchAll(/id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?rarity:\s*(\d+)[\s\S]*?luck:\s*(\d+)[\s\S]*?reference:\s*'([^']+)'[\s\S]*?goldReward:\s*(\d+)[\s\S]*?emoji:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'/g);
  
  const cards = [];
  for (const match of cardMatches) {
    cards.push({
      id: match[1],
      name: match[2],
      rarity: match[3],
      luck: match[4],
      reference: match[5],
      goldReward: match[6],
      emoji: match[7],
      description: match[8]
    });
  }
  
  if (cards.length === 0) {
    console.log(`⚠️ Could not parse ${fileName}`);
    return;
  }
  
  // Rebuild the file with proper structure
  let fixedContent = `import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card';

export const ${fileName.replace('.ts', '')}Cards: Card[] = [
`;
  
  cards.forEach((card, index) => {
    // Generate appropriate emojis based on rarity
    const emojiCount = Math.min(Math.floor(parseInt(card.rarity) / 1000) + 2, 8);
    const emojis = [];
    
    // Always add the main emoji first
    emojis.push({
      character: card.emoji,
      damage: Math.floor(10 + parseInt(card.luck) / 100),
      speed: 3,
      trajectory: ['straight', 'arc', 'wave', 'spiral'][index % 4],
      effect: parseInt(card.rarity) > 10 ? 'EffectType.BOOST' : null,
      target: 'OPPONENT'
    });
    
    // Add additional emojis
    const additionalEmojis = ['⚡', '💥', '✨', '🌟', '💫', '🔥', '❄️', '🌈'];
    for (let i = 1; i < Math.min(emojiCount, 5); i++) {
      emojis.push({
        character: additionalEmojis[i % additionalEmojis.length],
        damage: Math.floor(5 + parseInt(card.luck) / 200),
        speed: 2 + (i % 3),
        trajectory: ['straight', 'arc', 'wave', 'spiral'][i % 4],
        effect: null,
        target: 'OPPONENT'
      });
    }
    
    const family = card.name.toLowerCase().includes('doge') || card.name.toLowerCase().includes('pepe') || card.name.toLowerCase().includes('chad') 
      ? 'MemeFamily.CLASSIC_INTERNET'
      : card.name.toLowerCase().includes('brain') || card.name.toLowerCase().includes('stonks')
      ? 'MemeFamily.ABSTRACT_CONCEPTS'
      : 'MemeFamily.INTERNET_CULTURE';
    
    if (index > 0) fixedContent += ',\n';
    
    fixedContent += `  {
    // Core Identity
    id: '${card.id}',
    name: '${card.name}',
    rarity: ${card.rarity},                   // 1/${card.rarity} probability
    luck: ${card.luck},
    emojis: [
${emojis.map(e => `      {
        character: '${e.character}',
        damage: ${e.damage},
        speed: ${e.speed},
        trajectory: '${e.trajectory}',${e.effect ? `
        effect: ${e.effect},` : ''}
        target: '${e.target}'
      }`).join(',\n')}
    ],
    family: ${family},
    reference: '${card.reference}',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: ${card.goldReward},
    
    // Display
    emoji: '${card.emoji}',
    description: '${card.description}',
    visual: CardUtils.getDefaultVisual(${card.rarity}, 1),
    
    // Optional Combat
    hp: ${100 + Math.floor(parseInt(card.luck) / 10)},${parseInt(card.rarity) > 10 ? `
    cardEffects: [
      {
        trigger: TriggerType.RANDOM,
        chance: 0.${Math.min(parseInt(card.rarity) / 100, 9)},
        effect: EffectType.${parseInt(card.rarity) > 1000 ? 'CHAOS' : parseInt(card.rarity) > 100 ? 'BURST' : 'BOOST'},
        duration: ${Math.min(parseInt(card.rarity) / 100, 10)}
      }
    ],` : ''}
    
    // Metadata
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }`;
  });
  
  fixedContent += '\n];';
  
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log(`✅ Fixed ${fileName}`);
}

// Main execution
function main() {
  const cardsDir = path.join(__dirname, '..', 'data', 'cards');
  const files = [
    'uncommon.ts',
    'rare.ts',
    'epic.ts',
    'legendary.ts',
    'mythic.ts'
  ];
  
  console.log('🔧 Starting comprehensive fix...\n');
  
  files.forEach(file => {
    const filePath = path.join(cardsDir, file);
    if (fs.existsSync(filePath)) {
      try {
        fixBrokenCardFile(filePath);
      } catch (error) {
        console.error(`❌ Error fixing ${file}:`, error.message);
      }
    }
  });
  
  console.log('\n✨ All fixes complete!');
}

main();
