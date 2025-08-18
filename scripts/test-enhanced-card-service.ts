#!/usr/bin/env tsx

import { CardService } from '../src/services/CardService';
import { CardRarity, MemeFamily, EffectType, CardType } from '../src/models/unified/Card';

console.log('🎮 Testing Enhanced CardService...\n');

const cardService = new CardService();

// Test 1: Basic functionality
console.log('📋 Basic Service Tests:');
console.log(`  Total Cards: ${cardService.getAllCards().length}`);
console.log(`  Common Cards: ${cardService.getCardsByRarity(CardRarity.COMMON).length}`);
console.log(`  Rare Cards: ${cardService.getCardsByRarity(CardRarity.RARE).length}`);

// Test 2: New family-based queries
console.log('\n👥 Family-Based Queries:');
const abstractCards = cardService.getCardsByFamily(MemeFamily.ABSTRACT_CONCEPTS);
console.log(`  Abstract Concepts Family: ${abstractCards.length} cards`);
abstractCards.forEach(card => {
  console.log(`    - ${card.name} (${card.emoji})`);
});

// Test 3: Effect-based queries
console.log('\n✨ Effect-Based Queries:');
const burnCards = cardService.getCardsByEffect(EffectType.BURN);
console.log(`  Cards with Burn Effect: ${burnCards.length} cards`);
burnCards.forEach(card => {
  console.log(`    - ${card.name}: ${card.cardEffects?.length || 0} effects`);
});

// Test 4: Enhanced filtering
console.log('\n🔍 Enhanced Filtering:');
const filteredCards = cardService.filterCards({
  family: MemeFamily.ABSTRACT_CONCEPTS,
  minLuck: 5,
  tradeable: true
});
console.log(`  Tradeable Abstract cards with luck >= 5: ${filteredCards.length}`);

// Test 5: Game spec probability rolling
console.log('\n🎲 Game Spec Probability Rolling:');
for (let i = 0; i < 5; i++) {
  const card = await cardService.generateCardWithProbabilities();
  console.log(`  Roll ${i + 1}: ${card.name} (${card.rarity}) - Gold: ${card.goldReward}`);
}

// Test 6: Pity system
console.log('\n🍀 Pity System Testing:');
let pityCounter = 0;
for (let i = 0; i < 3; i++) {
  const result = await cardService.rollCardWithPity(pityCounter);
  pityCounter = result.newPityCounter;
  console.log(`  Roll ${i + 1}: ${result.card.name} (${result.card.rarity}) - Gold: ${result.goldReward}, Pity: ${pityCounter}`);
}

// Test 7: Enhanced card stats
console.log('\n📊 Enhanced Card Statistics:');
const testCard = cardService.getAllCards()[0];
if (testCard) {
  const stats = cardService.getCardStats(testCard);
  console.log(`  Card: ${testCard.name}`);
  console.log(`    Total Power: ${stats.totalPower}`);
  console.log(`    Effect Count: ${stats.effectCount}`);
  console.log(`    Emoji Count: ${stats.emojiCount}`);
  console.log(`    Gold Value: ${stats.goldValue}`);
  console.log(`    Dust Value: ${stats.dustValue}`);
  console.log(`    Stack Bonuses:`);
  console.log(`      Luck: +${stats.stackBonuses.totalLuckBonus}%`);
  console.log(`      Gold: +${stats.stackBonuses.totalGoldBonus}%`);
  console.log(`      Damage: +${stats.stackBonuses.totalDamageBonus}%`);
}

// Test 8: Deck synergy calculations
console.log('\n⚔️ Deck Synergy Testing:');
const testDeck = cardService.getAllCards().slice(0, 3);
const deckPower = cardService.calculateDeckPower(testDeck);
console.log(`  Deck Total Power: ${deckPower.totalPower}`);
console.log(`  Family Bonuses:`);
deckPower.familyBonuses.forEach((bonus, family) => {
  console.log(`    ${family}: +${bonus} power`);
});
console.log(`  Recommended Synergies: ${deckPower.recommendedSynergies.join(', ')}`);

// Test 9: Card recommendations
console.log('\n💡 Card Recommendations:');
const recommendations = cardService.getRecommendedCards(testDeck, 3);
console.log(`  Recommended cards for deck synergy:`);
recommendations.forEach(card => {
  console.log(`    - ${card.name} (${card.family})`);
});

// Test 10: Collection statistics
console.log('\n📈 Collection Statistics:');
const collectionStats = cardService.getCollectionStats();
console.log(`  Total Cards: ${collectionStats.totalCards}`);
console.log(`  Average Luck: ${collectionStats.averageLuck.toFixed(1)}`);
console.log(`  Total Gold Value: ${collectionStats.totalGoldValue}`);
console.log(`  Total Dust Value: ${collectionStats.totalDustValue}`);
console.log(`  By Rarity:`);
collectionStats.byRarity.forEach((count, rarity) => {
  console.log(`    ${rarity}: ${count} cards`);
});
console.log(`  By Family:`);
collectionStats.byFamily.forEach((count, family) => {
  console.log(`    ${family}: ${count} cards`);
});

console.log('\n🎉 Enhanced CardService Testing Complete!');
