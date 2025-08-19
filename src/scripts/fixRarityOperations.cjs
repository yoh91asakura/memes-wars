const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/atoms/CardImage/CardImage.tsx',
  'src/components/atoms/RarityIndicator/RarityIndicator.tsx',
  'src/services/CardService.ts',
  'src/services/RollService.ts',
  'src/components/molecules/Card/CardArtwork.tsx',
  'src/stores/collectionStore.ts',
  'src/utils/format.ts',
  'src/stores/playerStoreSimple.ts',
  'src/stores/playerStore.ts',
  'src/components/molecules/Card/Card.tsx'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Check if CardUtils is already imported
    const hasCardUtilsImport = content.includes('CardUtils');
    
    // Add CardUtils import if needed and file uses rarity operations
    if (!hasCardUtilsImport && (content.includes('rarity.toLowerCase') || content.includes('rarity.toUpperCase'))) {
      // Find the right place to add the import
      if (content.includes("from '../../../models/Card'")) {
        content = content.replace(
          /from ['"]\.\.\/\.\.\/\.\.\/models\/Card['"]/,
          ", CardUtils from '../../../models/Card'"
        );
      } else if (content.includes("from '../../models/Card'")) {
        content = content.replace(
          /from ['"]\.\.\/\.\.\/models\/Card['"]/,
          ", CardUtils from '../../models/Card'"
        );
      } else if (content.includes("from '../models/Card'")) {
        content = content.replace(
          /from ['"]\.\.\/models\/Card['"]/,
          ", CardUtils from '../models/Card'"
        );
      } else if (content.includes("from './models/Card'")) {
        content = content.replace(
          /from ['"]\.\/models\/Card['"]/,
          ", CardUtils from './models/Card'"
        );
      } else if (content.includes("from '@/models/Card'")) {
        content = content.replace(
          /from ['"]@\/models\/Card['"]/,
          ", CardUtils from '@/models/Card'"
        );
      } else {
        // Add new import at the top after other imports
        const importMatch = content.match(/import .* from .*;/);
        if (importMatch) {
          const lastImportIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
          content = content.slice(0, lastImportIndex) + 
                   "\nimport { CardUtils } from '../../../models/Card';" + 
                   content.slice(lastImportIndex);
        }
      }
    }
    
    // Fix rarity operations - replace with CardUtils calls
    // Handle various patterns of rarity.toLowerCase()
    content = content.replace(/(\w+)\.rarity\?\.toLowerCase\(\)/g, (match, varName) => {
      return `${varName}.rarity ? CardUtils.getRarityName(${varName}.rarity).toLowerCase() : 'common'`;
    });
    
    content = content.replace(/(\w+)\.rarity\.toLowerCase\(\)/g, (match, varName) => {
      return `CardUtils.getRarityName(${varName}.rarity).toLowerCase()`;
    });
    
    // Handle rarity.toUpperCase()
    content = content.replace(/(\w+)\.rarity\?\.toUpperCase\(\)/g, (match, varName) => {
      return `${varName}.rarity ? CardUtils.getRarityName(${varName}.rarity).toUpperCase() : 'COMMON'`;
    });
    
    content = content.replace(/(\w+)\.rarity\.toUpperCase\(\)/g, (match, varName) => {
      return `CardUtils.getRarityName(${varName}.rarity).toUpperCase()`;
    });
    
    // Fix direct rarity string operations
    content = content.replace(/rarity\.toLowerCase\(\)/g, 
      "typeof rarity === 'string' ? rarity.toLowerCase() : CardUtils.getRarityName(rarity).toLowerCase()");
    
    content = content.replace(/rarity\.toUpperCase\(\)/g,
      "typeof rarity === 'string' ? rarity.toUpperCase() : CardUtils.getRarityName(rarity).toUpperCase()");
    
    // Fix .rarity as string casts (should be number now)
    content = content.replace(/\.rarity\.toUpperCase\(\) as string/g, '.rarity');
    content = content.replace(/\.rarity as string/g, '.rarity');
    
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

console.log('🔍 Fixing rarity string operations...\n');

let fixedCount = 0;
for (const file of filesToFix) {
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
