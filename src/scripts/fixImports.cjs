#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to replace
const replacements = [
  {
    from: /import\s*{\s*UnifiedCard[^}]*}\s*from\s*['"].*?models\/unified\/Card['"]/g,
    to: "import { Card } from '../models/Card'"
  },
  {
    from: /import\s*{\s*CardRarity[^}]*}\s*from\s*['"].*?models\/unified\/Card['"]/g,
    to: "// CardRarity removed - using number rarity now"
  },
  {
    from: /UnifiedCard/g,
    to: "Card"
  },
  {
    from: /CardRarity\.\w+/g,
    to: function(match) {
      // Convert CardRarity.COMMON to 2, etc.
      const rarityMap = {
        'CardRarity.COMMON': '2',
        'CardRarity.UNCOMMON': '4',
        'CardRarity.RARE': '10',
        'CardRarity.EPIC': '50',
        'CardRarity.LEGENDARY': '200',
        'CardRarity.MYTHIC': '1000',
        'CardRarity.COSMIC': '10000',
        'CardRarity.DIVINE': '100000',
        'CardRarity.INFINITY': '1000000'
      };
      return rarityMap[match] || '2';
    }
  }
];

function fixFile(filePath) {
  // Skip card data files and the new Card.ts model
  if (filePath.includes('data/cards/') || filePath.endsWith('models/Card.ts')) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  replacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: [
    'src/data/cards/**',
    'src/models/Card.ts',
    'src/scripts/**'
  ]
});

console.log(`🔍 Found ${files.length} files to check...\n`);

files.forEach(file => {
  try {
    fixFile(file);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n✨ Import fixes complete!');
