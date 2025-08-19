const fs = require('fs');
const path = require('path');

// List of card data files to fix
const cardFiles = [
  'src/data/cards/common.ts',
  'src/data/cards/uncommon.ts',
  'src/data/cards/rare.ts',
  'src/data/cards/epic.ts',
  'src/data/cards/legendary.ts',
  'src/data/cards/mythic.ts',
  'src/data/cards/cosmic.ts',
  'src/data/cards/divine.ts',
  'src/data/cards/infinity.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix string.RARITY replacements - these should just be the numeric values
    content = content.replace(/string\.COMMON/g, '2');
    content = content.replace(/string\.UNCOMMON/g, '4');
    content = content.replace(/string\.RARE/g, '10');
    content = content.replace(/string\.EPIC/g, '50');
    content = content.replace(/string\.LEGENDARY/g, '200');
    content = content.replace(/string\.MYTHIC/g, '1000');
    content = content.replace(/string\.COSMIC/g, '10000');
    content = content.replace(/string\.DIVINE/g, '100000');
    content = content.replace(/string\.INFINITY/g, '1000000');
    
    // Remove CardType references - not needed in new model
    content = content.replace(/type:\s*CardType\.\w+,?\s*\n/g, '');
    
    // Clean up any double commas or trailing commas before closing braces
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/,\s*}/g, '}');
    content = content.replace(/,\s*]/g, ']');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔍 Fixing card data files...\n');

let fixedCount = 0;
for (const file of cardFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    if (fixFile(fullPath)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
}

console.log(`\n✨ Fixed ${fixedCount} files!`);
