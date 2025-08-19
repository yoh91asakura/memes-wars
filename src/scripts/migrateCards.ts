#!/usr/bin/env node

/**
 * Migration script to convert UnifiedCard format to new simplified Card format
 * Aligned with game-specification.md
 */

const fs = require('fs');
const path = require('path');

// Helper function to convert rarity enum to number
function convertRarityToNumber(rarity: string): number {
  // Remove CardRarity. prefix if present
  const cleanRarity = rarity.replace('CardRarity.', '').toUpperCase();
  
  switch (cleanRarity) {
    case 'COMMON': return 2;       // 1/2
    case 'UNCOMMON': return 4;     // 1/4
    case 'RARE': return 10;        // 1/10
    case 'EPIC': return 50;        // 1/50
    case 'LEGENDARY': return 200;  // 1/200
    case 'MYTHIC': return 1000;    // 1/1000
    case 'COSMIC': return 10000;   // 1/10000
    case 'DIVINE': return 100000;  // 1/100000
    case 'INFINITY': return 1000000; // 1/1000000
    default: return 2; // Default to common
  }
}

// Helper to simplify emoji projectiles
function simplifyEmojis(emojisStr: string): string {
  // Extract emoji characters and create simplified version
  const emojiMatches = emojisStr.match(/character:\s*'([^']+)'/g);
  const damageMatches = emojisStr.match(/damage:\s*(\d+)/g);
  const speedMatches = emojisStr.match(/speed:\s*(\d+)/g);
  const trajectoryMatches = emojisStr.match(/trajectory:\s*'([^']+)'/g);
  const effectMatches = emojisStr.match(/effects?:\s*\[([^\]]*)\]/g);
  
  if (!emojiMatches) return '[]';
  
  const emojis: any[] = [];
  
  emojiMatches.forEach((match, index) => {
    const character = match.match(/character:\s*'([^']+)'/)?.[1] || '❓';
    const damage = damageMatches?.[index]?.match(/damage:\s*(\d+)/)?.[1] || '1';
    const speed = speedMatches?.[index]?.match(/speed:\s*(\d+)/)?.[1] || '3';
    const trajectory = trajectoryMatches?.[index]?.match(/trajectory:\s*'([^']+)'/)?.[1] || 'straight';
    
    // Extract single effect if present
    let effect = '';
    if (effectMatches && effectMatches[index]) {
      const effectContent = effectMatches[index].match(/\[([^\]]*)\]/)?.[1];
      if (effectContent) {
        const firstEffect = effectContent.split(',')[0].trim().replace(/EffectType\./g, '');
        if (firstEffect && firstEffect !== '') {
          effect = `\n        effect: EffectType.${firstEffect},`;
        }
      }
    }
    
    emojis.push(`{
        character: '${character}',
        damage: ${damage},
        speed: ${speed},
        trajectory: '${trajectory}',${effect}
        target: 'OPPONENT'
      }`);
  });
  
  return `[
      ${emojis.join(',\n      ')}
    ]`;
}

// Helper to simplify card effects
function simplifyCardEffects(effectsStr: string): string {
  const triggerMatches = effectsStr.match(/trigger:\s*TriggerType\.(\w+)/g);
  const chanceMatches = effectsStr.match(/chance:\s*([\d.]+)/g);
  const effectMatches = effectsStr.match(/effect:\s*EffectType\.(\w+)/g);
  const durationMatches = effectsStr.match(/duration:\s*(\d+)/g);
  
  if (!triggerMatches || !effectMatches) return '';
  
  const effects: any[] = [];
  
  triggerMatches.forEach((match, index) => {
    const trigger = match.match(/trigger:\s*TriggerType\.(\w+)/)?.[1];
    const chance = chanceMatches?.[index]?.match(/chance:\s*([\d.]+)/)?.[1] || '0.1';
    const effect = effectMatches?.[index]?.match(/effect:\s*EffectType\.(\w+)/)?.[1];
    const duration = durationMatches?.[index]?.match(/duration:\s*(\d+)/)?.[1];
    
    if (trigger && effect) {
      const durationStr = duration ? `,\n      duration: ${duration}` : '';
      effects.push(`{
      trigger: TriggerType.${trigger},
      chance: ${chance},
      effect: EffectType.${effect}${durationStr}
    }`);
    }
  });
  
  if (effects.length === 0) return '';
  
  return `cardEffects: [${effects.join(', ')}],`;
}

// Main migration function
function migrateCardFile(filePath: string): void {
  console.log(`Migrating ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update imports
  content = content.replace(
    /import\s*{\s*[^}]*}\s*from\s*['"].*models\/unified\/Card['"]/g,
    `import { 
  Card, 
  MemeFamily, 
  EffectType, 
  TriggerType,
  CardUtils 
} from '../../models/Card'`
  );
  
  // Update export statement
  content = content.replace(/export\s+const\s+(\w+)Cards:\s*UnifiedCard\[\]/g, 'export const $1Cards: Card[]');
  
  // Process each card object
  content = content.replace(/{\s*\/\/\s*Core Identity[\s\S]*?(?=,\s*{|]\s*;)/g, (cardMatch) => {
    // Extract key values
    const id = cardMatch.match(/id:\s*'([^']+)'/)?.[1] || 'unknown';
    const name = cardMatch.match(/name:\s*'([^']+)'/)?.[1] || 'Unknown';
    const emoji = cardMatch.match(/emoji:\s*'([^']+)'/)?.[1] || '❓';
    const description = cardMatch.match(/description:\s*'([^']+)'/)?.[1] || '';
    
    // Extract rarity and convert to number
    const rarityMatch = cardMatch.match(/rarity:\s*(CardRarity\.\w+)/)?.[1] || ''common'';
    const rarityNum = convertRarityToNumber(rarityMatch);
    
    // Extract other required fields
    const luck = cardMatch.match(/luck:\s*(\d+)/)?.[1] || '5';
    const family = cardMatch.match(/family:\s*(MemeFamily\.\w+)/)?.[1] || 'MemeFamily.CLASSIC_INTERNET';
    const reference = cardMatch.match(/reference:\s*'([^']+)'/)?.[1] || 'Classic meme reference';
    const goldReward = cardMatch.match(/goldReward:\s*(\d+)/)?.[1] || '10';
    
    // Extract HP (from health or calculate from luck)
    const health = cardMatch.match(/health:\s*(\d+)/)?.[1];
    const hp = health ? (100 + parseInt(health)) : (100 + Math.floor(parseInt(luck) / 10));
    
    // Extract and simplify emojis
    const emojisMatch = cardMatch.match(/emojis:\s*\[([\s\S]*?)\],\s*cardEffects/);
    const emojisStr = emojisMatch ? emojisMatch[1] : '';
    const simplifiedEmojis = simplifyEmojis(emojisStr);
    
    // Extract and simplify card effects
    const effectsMatch = cardMatch.match(/cardEffects:\s*\[([\s\S]*?)\],\s*synergies/);
    const effectsStr = effectsMatch ? effectsMatch[1] : '';
    const cardEffects = simplifyCardEffects(effectsStr);
    
    // Extract timestamps
    const createdAt = cardMatch.match(/createdAt:\s*'([^']+)'/)?.[1] || new Date().toISOString();
    const updatedAt = cardMatch.match(/updatedAt:\s*'([^']+)'/)?.[1] || new Date().toISOString();
    
    // Build new card format
    return `{
    // Core Identity
    id: '${id}',
    name: '${name}',
    rarity: ${rarityNum},                   // 1/${rarityNum} probability
    luck: ${luck},
    emojis: ${simplifiedEmojis},
    family: ${family},
    reference: '${reference}',
    
    // Stacking
    stackLevel: 1,
    stackBonus: {
      luckMultiplier: 0,
      goldMultiplier: 0,
      bonusEmojis: []
    },
    
    // Rewards
    goldReward: ${goldReward},
    
    // Display
    emoji: '${emoji}',
    description: '${description}',
    visual: CardUtils.getDefaultVisual(${rarityNum}, 1),
    
    // Optional Combat
    hp: ${hp},
    ${cardEffects}
    
    // Metadata
    createdAt: '${createdAt}',
    updatedAt: '${updatedAt}'
  }`;
  });
  
  // Write the migrated content back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Migrated ${filePath}`);
}

// Main execution
function main() {
  const cardsDir = path.join(__dirname, '..', 'data', 'cards');
  const files = [
    'common.ts',
    'uncommon.ts',
    'rare.ts',
    'epic.ts',
    'legendary.ts',
    'mythic.ts',
    'cosmic.ts',
    'divine.ts',
    'infinity.ts'
  ];
  
  files.forEach(file => {
    const filePath = path.join(cardsDir, file);
    if (fs.existsSync(filePath)) {
      try {
        migrateCardFile(filePath);
      } catch (error) {
        console.error(`❌ Error migrating ${file}:`, error);
      }
    } else {
      console.log(`⚠️ File not found: ${file}`);
    }
  });
  
  console.log('\n✨ Migration complete!');
}

// Run the migration
if (require.main === module) {
  main();
}

export { migrateCardFile };
