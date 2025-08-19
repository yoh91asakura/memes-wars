#!/usr/bin/env node

/**
 * Clean script to remove obsolete properties from migrated cards
 */

const fs = require('fs');
const path = require('path');

// Properties to remove from cards
const obsoleteProperties = [
  'goldGeneration',
  'dustValue', 
  'tradeable',
  'level',
  'experience',
  'stackCount',
  'maxStacks',
  'stackBonus',
  'visual',
  'craftable',
  'craftCost',
  'isActive',
  'isLimited',
  'seasonalEvent',
  'effects',
  'tags',
  'flavor',
  'lore',
  'releaseDate',
  'synergies'
];

function cleanCardFile(filePath) {
  console.log(`Cleaning ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove obsolete property lines and their comments
  obsoleteProperties.forEach(prop => {
    // Remove property lines
    const propRegex = new RegExp(`^\\s*${prop}:.*$`, 'gm');
    content = content.replace(propRegex, '');
    
    // Remove empty comment sections that precede removed properties
    content = content.replace(/^\s*\/\/[^\/\n]*\n\s*$/gm, '');
  });
  
  // Clean up multiple consecutive blank lines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  // Clean up trailing commas before closing braces
  content = content.replace(/,(\s*\n\s*})/g, '$1');
  
  // Clean up empty sections between properties
  content = content.replace(/,\s*\n\s*\n\s*,/g, ',\n    ');
  
  // Fix any double commas
  content = content.replace(/,,/g, ',');
  
  // Ensure proper formatting of cardEffects when empty
  content = content.replace(/cardEffects:\s*\[\],?/g, '');
  
  // Remove trailing commas in object literals
  content = content.replace(/,(\s*})}/g, '$1}');
  content = content.replace(/,(\s*})/g, '$1');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Cleaned ${path.basename(filePath)}`);
}

// Main execution
function main() {
  const cardsDir = path.join(__dirname, '..', 'data', 'cards');
  const files = [
    'uncommon.ts',
    'rare.ts',
    'epic.ts',
    'legendary.ts',
    'mythic.ts',
    'cosmic.ts',
    'divine.ts',
    'infinity.ts'
  ];
  
  console.log('🧹 Starting cleanup...\n');
  
  files.forEach(file => {
    const filePath = path.join(cardsDir, file);
    if (fs.existsSync(filePath)) {
      try {
        cleanCardFile(filePath);
      } catch (error) {
        console.error(`❌ Error cleaning ${file}:`, error.message);
      }
    } else {
      console.log(`⚠️ File not found: ${file}`);
    }
  });
  
  console.log('\n✨ Cleanup complete!');
}

// Run the cleanup
main();
