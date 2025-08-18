#!/usr/bin/env tsx

import { 
  UnifiedCard, 
  CardUtils, 
  CardRarity, 
  MemeFamily, 
  EffectType 
} from '../src/models/unified/Card';
import { commonCards } from '../src/data/cards/common';

console.log('🎮 Validating Enhanced Card Model...\n');

// Test card validation
console.log('📋 Testing Card Validation:');
commonCards.forEach((card, index) => {
  const isValid = CardUtils.isValid(card);
  const power = CardUtils.calculatePower(card);
  
  console.log(`  ${index + 1}. ${card.name}`);
  console.log(`     ✅ Valid: ${isValid}`);
  console.log(`     ⚡ Power: ${power}`);
  console.log(`     🎲 Luck: ${card.luck || 'N/A'}`);
  console.log(`     👥 Family: ${card.family || 'N/A'}`);
  console.log(`     💰 Gold Reward: ${card.goldReward || 'N/A'}`);
  console.log(`     🎯 Emojis: ${card.emojis?.length || 0} projectiles`);
  console.log(`     ✨ Effects: ${card.cardEffects?.length || 0} card effects`);
  console.log('');
});

// Test rarity distribution
console.log('📊 Rarity Distribution Analysis:');
const rarityStats = commonCards.reduce((acc, card) => {
  const rarity = card.rarity;
  acc[rarity] = (acc[rarity] || 0) + 1;
  return acc;
}, {} as Record<CardRarity, number>);

Object.entries(rarityStats).forEach(([rarity, count]) => {
  console.log(`  ${rarity}: ${count} cards`);
});

// Test family distribution
console.log('\n👥 Family Distribution:');
const familyStats = commonCards.reduce((acc, card) => {
  const family = card.family || 'UNKNOWN';
  acc[family] = (acc[family] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

Object.entries(familyStats).forEach(([family, count]) => {
  console.log(`  ${family}: ${count} cards`);
});

// Test migration functionality
console.log('\n🔄 Testing Legacy Card Migration:');
const legacyCard = {
  id: 'legacy-test',
  name: 'Legacy Test Card',
  emoji: '🧪',
  rarity: 'common',
  stats: { attack: 2, defense: 1, health: 3 },
  tags: ['test', 'legacy']
};

const migratedCard = CardUtils.migrateToUnified(legacyCard);
console.log(`  ✅ Migrated: ${migratedCard.name}`);
console.log(`  🎲 Generated Luck: ${migratedCard.luck}`);
console.log(`  👥 Inferred Family: ${migratedCard.family}`);
console.log(`  💰 Gold Reward: ${migratedCard.goldReward}`);
console.log(`  🎯 Emoji Projectiles: ${migratedCard.emojis.length}`);

// Test game spec compliance
console.log('\n🎮 Game Specification Compliance:');
const compliantCards = commonCards.filter(card => 
  card.rarityProbability &&
  card.luck &&
  card.family &&
  card.goldReward &&
  card.emojis?.length > 0 &&
  card.stackBonus &&
  card.goldGeneration !== undefined &&
  card.dustValue !== undefined
);

console.log(`  ✅ Fully Compliant: ${compliantCards.length}/${commonCards.length} cards`);
console.log(`  📈 Compliance Rate: ${Math.round(compliantCards.length / commonCards.length * 100)}%`);

if (compliantCards.length < commonCards.length) {
  console.log('\n⚠️  Non-compliant cards found:');
  commonCards.forEach(card => {
    const missing = [];
    if (!card.rarityProbability) missing.push('rarityProbability');
    if (!card.luck) missing.push('luck');
    if (!card.family) missing.push('family');
    if (!card.goldReward) missing.push('goldReward');
    if (!card.emojis?.length) missing.push('emojis');
    if (!card.stackBonus) missing.push('stackBonus');
    if (card.goldGeneration === undefined) missing.push('goldGeneration');
    if (card.dustValue === undefined) missing.push('dustValue');
    
    if (missing.length > 0) {
      console.log(`    ${card.name}: Missing ${missing.join(', ')}`);
    }
  });
}

console.log('\n🎉 Validation Complete!');
