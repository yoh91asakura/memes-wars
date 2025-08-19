const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/organisms/CollectionStats/CollectionStats.tsx',
  'src/components/organisms/CollectionFilters/CollectionFilters.tsx',
  'src/components/atoms/RarityIndicator/RarityIndicator.tsx',
  'src/stores/collectionStore.ts',
  'src/stores/cardsStore.ts',
  'src/services/CardService.ts',
  'src/components/molecules/Card/Card.tsx',
  'src/components/types/Card.ts',
  'src/utils/random.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove CardRarity imports
    content = content.replace(/import\s*{\s*CardRarity\s*}\s*from\s*['"][^'"]+['"];?\s*\n?/g, '');
    content = content.replace(/import\s*type\s*{\s*CardRarity\s*}\s*from\s*['"][^'"]+['"];?\s*\n?/g, '');
    
    // Replace CardRarity type usages with string
    content = content.replace(/:\s*CardRarity\b/g, ': string');
    content = content.replace(/:\s*Record<CardRarity,/g, ': Record<string,');
    content = content.replace(/as\s+CardRarity\b/g, 'as string');
    content = content.replace(/CardRarity\s*\|/g, 'string |');
    content = content.replace(/\|\s*CardRarity\b/g, '| string');
    
    // Fix specific enum values used as strings
    content = content.replace(/'COMMON'\s+as\s+CardRarity/g, "'common'");
    content = content.replace(/'UNCOMMON'\s+as\s+CardRarity/g, "'uncommon'");
    content = content.replace(/'RARE'\s+as\s+CardRarity/g, "'rare'");
    content = content.replace(/'EPIC'\s+as\s+CardRarity/g, "'epic'");
    content = content.replace(/'LEGENDARY'\s+as\s+CardRarity/g, "'legendary'");
    content = content.replace(/'MYTHIC'\s+as\s+CardRarity/g, "'mythic'");
    content = content.replace(/'COSMIC'\s+as\s+CardRarity/g, "'cosmic'");
    content = content.replace(/'DIVINE'\s+as\s+CardRarity/g, "'divine'");
    content = content.replace(/'INFINITY'\s+as\s+CardRarity/g, "'infinity'");
    
    // Fix rarity display arrays - change to lowercase strings
    content = content.replace(/key:\s*'COMMON'/g, "key: 'common'");
    content = content.replace(/key:\s*'UNCOMMON'/g, "key: 'uncommon'");
    content = content.replace(/key:\s*'RARE'/g, "key: 'rare'");
    content = content.replace(/key:\s*'EPIC'/g, "key: 'epic'");
    content = content.replace(/key:\s*'LEGENDARY'/g, "key: 'legendary'");
    content = content.replace(/key:\s*'MYTHIC'/g, "key: 'mythic'");
    content = content.replace(/key:\s*'COSMIC'/g, "key: 'cosmic'");
    content = content.replace(/key:\s*'DIVINE'/g, "key: 'divine'");
    content = content.replace(/key:\s*'INFINITY'/g, "key: 'infinity'");
    
    // Fix value comparisons in options arrays
    content = content.replace(/value:\s*'COMMON'/g, "value: 'common'");
    content = content.replace(/value:\s*'UNCOMMON'/g, "value: 'uncommon'");
    content = content.replace(/value:\s*'RARE'/g, "value: 'rare'");
    content = content.replace(/value:\s*'EPIC'/g, "value: 'epic'");
    content = content.replace(/value:\s*'LEGENDARY'/g, "value: 'legendary'");
    content = content.replace(/value:\s*'MYTHIC'/g, "value: 'mythic'");
    content = content.replace(/value:\s*'COSMIC'/g, "value: 'cosmic'");
    content = content.replace(/value:\s*'DIVINE'/g, "value: 'divine'");
    content = content.replace(/value:\s*'INFINITY'/g, "value: 'infinity'");
    
    // Fix CardRarity enum references in switch statements and comparisons
    content = content.replace(/CardRarity\.COMMON/g, "'common'");
    content = content.replace(/CardRarity\.UNCOMMON/g, "'uncommon'");
    content = content.replace(/CardRarity\.RARE/g, "'rare'");
    content = content.replace(/CardRarity\.EPIC/g, "'epic'");
    content = content.replace(/CardRarity\.LEGENDARY/g, "'legendary'");
    content = content.replace(/CardRarity\.MYTHIC/g, "'mythic'");
    content = content.replace(/CardRarity\.COSMIC/g, "'cosmic'");
    content = content.replace(/CardRarity\.DIVINE/g, "'divine'");
    content = content.replace(/CardRarity\.INFINITY/g, "'infinity'");
    
    // Clean up any double semicolons or extra whitespace
    content = content.replace(/;;/g, ';');
    content = content.replace(/\n\n\n+/g, '\n\n');
    
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

// Also search for any other files that might have CardRarity
function findAndFixAllFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist' && item !== 'build') {
          scanDir(fullPath);
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('CardRarity')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDir(dir);
  return files;
}

console.log('🔍 Searching for files with CardRarity references...\n');

// Find all files with CardRarity references
const srcDir = path.join(process.cwd(), 'src');
const allFiles = findAndFixAllFiles(srcDir);

console.log(`\nFound ${allFiles.length} files with CardRarity references.\n`);

let fixedCount = 0;
for (const file of allFiles) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Fixed ${fixedCount} files!`);
