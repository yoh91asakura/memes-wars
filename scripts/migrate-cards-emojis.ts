#!/usr/bin/env tsx

/**
 * Script to migrate all existing cards to the new multi-emoji system
 * Reads all card JSON files and applies emoji assignment based on rarity
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Card } from '../src/types/card';
import { EmojiAssignmentService } from '../src/services/EmojiAssignmentService';
import { EmojiSynergyCalculator } from '../src/services/EmojiSynergyCalculator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARDS_DIR = path.join(__dirname, '../src/data/cards');

// Rarity directories to process
const RARITIES = [
  'common',
  'uncommon', 
  'rare',
  'epic',
  'legendary',
  'mythic',
  'cosmic'
];

interface CardFile {
  path: string;
  rarity: string;
  cards: any[];
}

/**
 * Main migration function
 */
async function migrateAllCards() {
  console.log('🚀 Starting emoji migration for all cards...\n');
  
  const cardFiles = await findAllCardFiles();
  let totalCards = 0;
  let migratedCards = 0;
  
  for (const cardFile of cardFiles) {
    console.log(`📁 Processing ${cardFile.rarity} cards...`);
    
    const { migrated, total } = await migrateCardFile(cardFile);
    totalCards += total;
    migratedCards += migrated;
    
    console.log(`   ✅ Migrated ${migrated}/${total} cards\n`);
  }
  
  console.log(`🎉 Migration complete!`);
  console.log(`📊 Total: ${migratedCards}/${totalCards} cards migrated`);
  
  // Update TypeScript files
  await updateTypeScriptFiles();
  
  console.log(`🔧 TypeScript exports updated`);
}

/**
 * Find all card JSON files
 */
async function findAllCardFiles(): Promise<CardFile[]> {
  const cardFiles: CardFile[] = [];
  
  for (const rarity of RARITIES) {
    const rarityDir = path.join(CARDS_DIR, rarity);
    
    if (fs.existsSync(rarityDir)) {
      const jsonFile = path.join(rarityDir, `${rarity}-cards.json`);
      
      if (fs.existsSync(jsonFile)) {
        const content = fs.readFileSync(jsonFile, 'utf8');
        const cards = JSON.parse(content);
        
        cardFiles.push({
          path: jsonFile,
          rarity,
          cards
        });
      }
    }
  }
  
  return cardFiles;
}

/**
 * Migrate a single card file
 */
async function migrateCardFile(cardFile: CardFile): Promise<{ migrated: number, total: number }> {
  const originalCards = [...cardFile.cards];
  let migratedCount = 0;
  
  for (const card of cardFile.cards) {
    // Skip if already has multi-emoji data
    if (card.emojis && card.emojiData) {
      continue;
    }
    
    try {
      // Convert to Card type for processing
      const cardObj: Card = {
        ...card,
        emoji: card.emoji || '🎯' // Fallback emoji
      };
      
      // Generate emoji assignment
      const emojiData = EmojiAssignmentService.assignEmojisToCard(cardObj);
      
      // Calculate synergies
      const synergies = EmojiSynergyCalculator.calculateSynergies(emojiData.emojis);
      emojiData.activeSynergies = synergies;
      emojiData.synergyBonus = EmojiSynergyCalculator.getSynergyScore(emojiData.emojis);
      
      // Update card with new data
      card.emojis = emojiData.emojis;
      card.emojiData = {
        emojis: emojiData.emojis,
        emojiPowers: emojiData.emojiPowers,
        activeSynergies: emojiData.activeSynergies,
        totalBaseDamage: emojiData.totalBaseDamage,
        synergyBonus: emojiData.synergyBonus
      };
      
      // Keep legacy emoji field for compatibility
      card.emoji = emojiData.emojis[0] || card.emoji;
      
      migratedCount++;
      
      console.log(`   🎯 ${card.name}: ${emojiData.emojis.join('')} (${synergies.length} synergies)`);
      
    } catch (error) {
      console.error(`   ❌ Failed to migrate ${card.name}:`, error);
    }
  }
  
  // Write back to file if changes were made
  if (migratedCount > 0) {
    fs.writeFileSync(cardFile.path, JSON.stringify(cardFile.cards, null, 2));
  }
  
  return { migrated: migratedCount, total: originalCards.length };
}

/**
 * Update TypeScript export files to handle new emoji data
 */
async function updateTypeScriptFiles() {
  for (const rarity of RARITIES) {
    const tsFile = path.join(CARDS_DIR, rarity, 'index.ts');
    
    if (fs.existsSync(tsFile)) {
      let content = fs.readFileSync(tsFile, 'utf8');
      
      // Add emoji processing if not already present
      if (!content.includes('emojiData')) {
        content = content.replace(
          'import { Card } from',
          'import { Card } from'
        );
        
        // Update the mapping to include emoji data
        content = content.replace(
          /export const \w+Cards: Card\[\] = \w+CardsData\.map\(card => \(\{[\s\S]*?\}\)\);/,
          `export const ${rarity}Cards: Card[] = ${rarity}CardsData.map(card => ({
  id: card.id,
  name: card.name,
  rarity: card.rarity as '${rarity}',
  type: card.type as 'creature' | 'spell' | 'support' | 'attack' | 'defense',
  cost: card.cost,
  damage: card.damage,
  description: card.description,
  emoji: card.emoji,
  emojis: card.emojis,
  emojiData: card.emojiData,
  color: card.color,
  attack: card.attack,
  defense: card.defense,
  stats: card.stats,
  effects: card.effects,
  tags: card.tags,
  ability: card.ability,
  flavor: card.flavor
}));`
        );
        
        fs.writeFileSync(tsFile, content);
      }
    }
  }
}

/**
 * Rollback migration (restore from backup)
 */
async function rollbackMigration() {
  console.log('🔄 Rolling back emoji migration...');
  
  for (const rarity of RARITIES) {
    const jsonFile = path.join(CARDS_DIR, rarity, `${rarity}-cards.json`);
    const backupFile = `${jsonFile}.backup`;
    
    if (fs.existsSync(backupFile)) {
      fs.copyFileSync(backupFile, jsonFile);
      console.log(`   ✅ Restored ${rarity} cards`);
    }
  }
  
  console.log('🎉 Rollback complete!');
}

/**
 * Create backups of all card files
 */
async function createBackups() {
  console.log('💾 Creating backups...');
  
  for (const rarity of RARITIES) {
    const jsonFile = path.join(CARDS_DIR, rarity, `${rarity}-cards.json`);
    
    if (fs.existsSync(jsonFile)) {
      const backupFile = `${jsonFile}.backup`;
      fs.copyFileSync(jsonFile, backupFile);
      console.log(`   💾 Backed up ${rarity} cards`);
    }
  }
}

/**
 * Validate migration results
 */
async function validateMigration() {
  console.log('🔍 Validating migration...');
  
  const cardFiles = await findAllCardFiles();
  let errors = 0;
  
  for (const cardFile of cardFiles) {
    for (const card of cardFile.cards) {
      if (card.emojis && card.emojiData) {
        // Validate emoji assignment
        const isValid = EmojiAssignmentService.validateEmojiAssignment(
          card.emojis, 
          cardFile.rarity
        );
        
        if (!isValid) {
          console.error(`   ❌ Invalid emoji assignment for ${card.name}`);
          errors++;
        }
        
        // Validate synergies
        const calculatedSynergies = EmojiSynergyCalculator.calculateSynergies(card.emojis);
        if (calculatedSynergies.length !== card.emojiData.activeSynergies.length) {
          console.error(`   ❌ Synergy mismatch for ${card.name}`);
          errors++;
        }
      }
    }
  }
  
  if (errors === 0) {
    console.log('✅ All validations passed!');
  } else {
    console.log(`❌ Found ${errors} validation errors`);
  }
  
  return errors === 0;
}

// CLI handling
const command = process.argv[2];

switch (command) {
  case 'migrate':
    createBackups().then(() => migrateAllCards());
    break;
  case 'rollback':
    rollbackMigration();
    break;
  case 'validate':
    validateMigration();
    break;
  case 'backup':
    createBackups();
    break;
  default:
    console.log(`
🎯 Emoji Migration Tool

Usage:
  npm run migrate-emojis migrate    - Migrate all cards to new emoji system
  npm run migrate-emojis rollback   - Rollback migration from backup
  npm run migrate-emojis validate   - Validate current migration
  npm run migrate-emojis backup     - Create backups of current files

Examples:
  npm run migrate-emojis migrate
  npm run migrate-emojis validate
    `);
}

export { migrateAllCards, rollbackMigration, validateMigration };