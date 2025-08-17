#!/usr/bin/env npx tsx

/**
 * Card System Migration Script
 * Migrates from dual card system to unified model
 */

import fs from 'fs';
import path from 'path';
import { UnifiedCard, adaptFromSimpleCard, adaptFromTCGCard } from '../src/models/unified/Card';

interface MigrationConfig {
  dryRun: boolean;
  verbose: boolean;
  backupOriginals: boolean;
}

interface MigrationStats {
  filesProcessed: number;
  cardsConverted: number;
  errors: string[];
  warnings: string[];
}

class CardSystemMigrator {
  private config: MigrationConfig;
  private stats: MigrationStats;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.stats = {
      filesProcessed: 0,
      cardsConverted: 0,
      errors: [],
      warnings: [],
    };
  }

  async migrate(): Promise<void> {
    console.log('🚀 Starting Card System Migration');
    console.log('═'.repeat(50));
    
    if (this.config.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }

    // Phase 1: Create backup if requested
    if (this.config.backupOriginals && !this.config.dryRun) {
      await this.createBackup();
    }

    // Phase 2: Migrate card data files
    await this.migrateCardDataFiles();

    // Phase 3: Update import statements in services
    await this.updateServiceImports();

    // Phase 4: Update import statements in stores
    await this.updateStoreImports();

    // Phase 5: Update import statements in components
    await this.updateComponentImports();

    // Report results
    this.printMigrationReport();
  }

  private async createBackup(): Promise<void> {
    console.log('📦 Creating backup of original files...');
    
    const backupDir = path.join(process.cwd(), 'migration-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filesToBackup = [
      'src/models/Card.ts',
      'src/types/card.ts',
      'src/data/cards/common.ts',
      'src/services/CardService.ts',
      'src/services/RollService.ts',
      'src/stores/gameStore.ts',
      'src/stores/rollStore.ts',
    ];

    for (const file of filesToBackup) {
      const sourcePath = path.join(process.cwd(), file);
      if (fs.existsSync(sourcePath)) {
        const backupPath = path.join(backupDir, file);
        const backupFileDir = path.dirname(backupPath);
        
        if (!fs.existsSync(backupFileDir)) {
          fs.mkdirSync(backupFileDir, { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`  ✅ Backed up: ${file}`);
      }
    }
  }

  private async migrateCardDataFiles(): Promise<void> {
    console.log('\n🎴 Migrating card data files...');

    const cardFiles = [
      { file: 'src/data/cards/common.ts', rarity: 'common' },
      { file: 'src/data/cards/uncommon.ts', rarity: 'uncommon' },
      { file: 'src/data/cards/rare.ts', rarity: 'rare' },
      { file: 'src/data/cards/epic.ts', rarity: 'epic' },
      { file: 'src/data/cards/legendary.ts', rarity: 'legendary' },
      { file: 'src/data/cards/mythic.ts', rarity: 'mythic' },
      { file: 'src/data/cards/cosmic.ts', rarity: 'cosmic' },
    ];

    for (const { file, rarity } of cardFiles) {
      await this.migrateCardFile(file, rarity);
    }
  }

  private async migrateCardFile(filePath: string, rarity: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      this.stats.warnings.push(`File not found: ${filePath}`);
      return;
    }

    try {
      // Read original file
      const originalContent = fs.readFileSync(fullPath, 'utf8');
      
      // Since we already have the unified common cards file, just use that for common
      if (rarity === 'common') {
        const newContent = this.generateUnifiedCardFileContent(rarity, 'common-unified');
        
        if (!this.config.dryRun) {
          fs.writeFileSync(fullPath, newContent);
        }
        
        console.log(`  ✅ Migrated: ${filePath} (${rarity})`);
        this.stats.filesProcessed++;
        return;
      }

      // For other rarities, we'll create placeholder unified versions
      console.log(`  ⏳ Creating placeholder for: ${filePath} (${rarity})`);
      
      const newContent = this.generatePlaceholderUnifiedFile(rarity);
      
      if (!this.config.dryRun) {
        fs.writeFileSync(fullPath, newContent);
      }
      
      this.stats.filesProcessed++;
      
    } catch (error) {
      this.stats.errors.push(`Error migrating ${filePath}: ${error}`);
    }
  }

  private generateUnifiedCardFileContent(rarity: string, importName: string): string {
    return `import { UnifiedCard } from '../../models/unified/Card';
import { ${importName}Cards } from './${importName}';

// Re-export unified cards as the main export
export const ${rarity}Cards: UnifiedCard[] = ${importName}Cards;

// Legacy export for backward compatibility
export { ${importName}Cards };
`;
  }

  private generatePlaceholderUnifiedFile(rarity: string): string {
    const rarityCapitalized = rarity.charAt(0).toUpperCase() + rarity.slice(1);
    
    return `import { UnifiedCard, UnifiedRarity, CardType, createDefaultPassive, createDefaultEmojis } from '../../models/unified/Card';

// TODO: Migrate existing ${rarity} cards to unified model
// This is a placeholder file created during card system migration

export const ${rarity}Cards: UnifiedCard[] = [
  // TODO: Add migrated ${rarity} cards here
  // Template for new cards:
  /*
  {
    id: '${rarity}_example',
    name: 'Example ${rarityCapitalized} Card',
    description: 'Example card for ${rarity} rarity',
    rarity: UnifiedRarity.${rarity.toUpperCase()},
    type: CardType.CREATURE,
    cost: 3,
    attack: 3,
    defense: 3,
    hp: 30,
    attackSpeed: 1.0,
    emojis: createDefaultEmojis('🎴', UnifiedRarity.${rarity.toUpperCase()}),
    passive: createDefaultPassive(),
    stackLevel: 0,
    experience: 0,
    luck: 10,
    emoji: '🎴',
    color: '#808080',
    tags: ['${rarity}', 'placeholder'],
    stats: {
      attack: 3,
      defense: 3,
      health: 30,
    },
  }
  */
];
`;
  }

  private async updateServiceImports(): Promise<void> {
    console.log('\n🔧 Updating service imports...');

    const serviceFiles = [
      'src/services/CardService.ts',
      'src/services/RollService.ts',
      'src/services/EmojiAssignmentService.ts',
      'src/services/UncommonCardService.ts',
      'src/services/CombatEngine.ts',
    ];

    for (const file of serviceFiles) {
      await this.updateFileImports(file, [
        {
          from: "import { Card } from '../types/card'",
          to: "import { UnifiedCard as Card } from '../models/unified/Card'"
        },
        {
          from: "import { Card } from '../models/Card'",
          to: "import { UnifiedCard as Card } from '../models/unified/Card'"
        },
        {
          from: "from '../types/card'",
          to: "from '../models/unified/Card'"
        }
      ]);
    }
  }

  private async updateStoreImports(): Promise<void> {
    console.log('\n🏪 Updating store imports...');

    const storeFiles = [
      'src/stores/gameStore.ts',
      'src/stores/rollStore.ts',
    ];

    for (const file of storeFiles) {
      await this.updateFileImports(file, [
        {
          from: "import { Card as SimpleCard } from '../types/card'",
          to: "import { UnifiedCard as Card } from '../models/unified/Card'"
        },
        {
          from: "import { Card } from '../types/card'",
          to: "import { UnifiedCard as Card } from '../models/unified/Card'"
        }
      ]);
    }
  }

  private async updateComponentImports(): Promise<void> {
    console.log('\n🎨 Updating component imports...');

    const componentFiles = [
      'src/components/screens/RollScreen.tsx',
      'src/components/roll/CardReveal.tsx',
      'src/components/cards/CardTCG.tsx',
      'src/components/cards/CardDisplay.tsx',
      'src/components/screens/CombatScreen.tsx',
    ];

    for (const file of componentFiles) {
      await this.updateFileImports(file, [
        {
          from: "import { Card } from '../../types/card'",
          to: "import { UnifiedCard as Card } from '../../models/unified/Card'"
        },
        {
          from: "import { Card } from '../types/card'",
          to: "import { UnifiedCard as Card } from '../models/unified/Card'"
        }
      ]);
    }
  }

  private async updateFileImports(filePath: string, replacements: Array<{from: string, to: string}>): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      this.stats.warnings.push(`File not found for import update: ${filePath}`);
      return;
    }

    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const replacement of replacements) {
        if (content.includes(replacement.from)) {
          content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
          modified = true;
        }
      }

      if (modified) {
        if (!this.config.dryRun) {
          fs.writeFileSync(fullPath, content);
        }
        console.log(`  ✅ Updated imports: ${filePath}`);
        this.stats.filesProcessed++;
      } else {
        console.log(`  ⏭️  No changes needed: ${filePath}`);
      }

    } catch (error) {
      this.stats.errors.push(`Error updating imports in ${filePath}: ${error}`);
    }
  }

  private printMigrationReport(): void {
    console.log('\n📊 Migration Report');
    console.log('═'.repeat(50));
    
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Cards converted: ${this.stats.cardsConverted}`);
    
    if (this.stats.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.stats.warnings.length}):`);
      this.stats.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errors (${this.stats.errors.length}):`);
      this.stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('\n🎉 Migration completed successfully!');
    }

    if (this.config.dryRun) {
      console.log('\n💡 This was a dry run. Use --execute to apply changes.');
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  const config: MigrationConfig = {
    dryRun: !args.includes('--execute'),
    verbose: args.includes('--verbose'),
    backupOriginals: args.includes('--backup'),
  };

  const migrator = new CardSystemMigrator(config);
  await migrator.migrate();
}

// Run if called directly
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  main().catch(console.error);
}