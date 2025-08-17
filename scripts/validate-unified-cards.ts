#!/usr/bin/env npx tsx

/**
 * Validation script for unified card model
 * Tests compilation, data integrity, and conformity
 */

import { UnifiedCard, UnifiedRarity, CardType, isValidUnifiedCard, calculateCardStats } from '../src/models/unified/Card';
import { commonUnifiedCards } from '../src/data/cards/common-unified';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  cardCount: number;
  stats: {
    totalCards: number;
    byRarity: Record<string, number>;
    byType: Record<string, number>;
    avgHp: number;
    avgCost: number;
  };
}

function validateUnifiedCards(cards: UnifiedCard[]): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    cardCount: cards.length,
    stats: {
      totalCards: cards.length,
      byRarity: {},
      byType: {},
      avgHp: 0,
      avgCost: 0,
    }
  };

  let totalHp = 0;
  let totalCost = 0;

  cards.forEach((card, index) => {
    // Basic validation
    if (!isValidUnifiedCard(card)) {
      result.errors.push(`Card ${index} (${card.name || 'unknown'}) is not a valid unified card`);
      result.success = false;
      return;
    }

    // Required fields validation
    if (!card.id) {
      result.errors.push(`Card ${index} missing required field: id`);
      result.success = false;
    }

    if (!card.name) {
      result.errors.push(`Card ${index} missing required field: name`);
      result.success = false;
    }

    if (!card.emojis || card.emojis.length === 0) {
      result.errors.push(`Card ${card.name} has no emoji projectiles`);
      result.success = false;
    }

    if (!card.passive) {
      result.errors.push(`Card ${card.name} missing passive ability`);
      result.success = false;
    }

    // Emoji validation
    card.emojis.forEach((emoji, emojiIndex) => {
      if (!emoji.character) {
        result.errors.push(`Card ${card.name} emoji ${emojiIndex} missing character`);
        result.success = false;
      }
      if (emoji.damage < 0) {
        result.errors.push(`Card ${card.name} emoji ${emojiIndex} has negative damage`);
        result.success = false;
      }
      if (emoji.speed <= 0) {
        result.errors.push(`Card ${card.name} emoji ${emojiIndex} has invalid speed`);
        result.success = false;
      }
    });

    // Stats validation
    if (card.hp <= 0) {
      result.errors.push(`Card ${card.name} has invalid HP: ${card.hp}`);
      result.success = false;
    }

    if (card.cost < 0) {
      result.errors.push(`Card ${card.name} has negative cost: ${card.cost}`);
      result.success = false;
    }

    if (card.attackSpeed <= 0) {
      result.errors.push(`Card ${card.name} has invalid attack speed: ${card.attackSpeed}`);
      result.success = false;
    }

    // Warnings for potential issues
    if (card.cost > 10) {
      result.warnings.push(`Card ${card.name} has very high cost: ${card.cost}`);
    }

    if (card.hp > 100) {
      result.warnings.push(`Card ${card.name} has very high HP: ${card.hp}`);
    }

    if (card.emojis.length > 5) {
      result.warnings.push(`Card ${card.name} has many emoji projectiles: ${card.emojis.length}`);
    }

    // Calculate stats
    result.stats.byRarity[card.rarity] = (result.stats.byRarity[card.rarity] || 0) + 1;
    result.stats.byType[card.type] = (result.stats.byType[card.type] || 0) + 1;
    
    totalHp += card.hp;
    totalCost += card.cost;

    // Test calculated stats
    try {
      const calculatedStats = calculateCardStats(card);
      if (calculatedStats.totalHp <= 0) {
        result.warnings.push(`Card ${card.name} calculated HP is invalid`);
      }
    } catch (error) {
      result.errors.push(`Card ${card.name} failed stats calculation: ${error}`);
      result.success = false;
    }
  });

  result.stats.avgHp = totalHp / cards.length;
  result.stats.avgCost = totalCost / cards.length;

  return result;
}

function printValidationResult(result: ValidationResult, title: string) {
  console.log(`\n📊 ${title}`);
  console.log('═'.repeat(50));
  
  if (result.success) {
    console.log('✅ Validation PASSED');
  } else {
    console.log('❌ Validation FAILED');
  }

  console.log(`\n📈 Statistics:`);
  console.log(`  Total Cards: ${result.stats.totalCards}`);
  console.log(`  Average HP: ${result.stats.avgHp.toFixed(1)}`);
  console.log(`  Average Cost: ${result.stats.avgCost.toFixed(1)}`);
  
  console.log(`\n🏷️  By Rarity:`);
  Object.entries(result.stats.byRarity).forEach(([rarity, count]) => {
    console.log(`  ${rarity}: ${count} cards`);
  });

  console.log(`\n🎴 By Type:`);
  Object.entries(result.stats.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} cards`);
  });

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }
}

// Main validation
console.log('🧪 Unified Card Model Validation');
console.log('═'.repeat(50));

try {
  // Test common cards
  const commonResult = validateUnifiedCards(commonUnifiedCards);
  printValidationResult(commonResult, 'Common Cards Validation');

  // Overall result
  const allPassed = commonResult.success;
  
  console.log(`\n${'═'.repeat(50)}`);
  if (allPassed) {
    console.log('🎉 ALL VALIDATIONS PASSED!');
    console.log('✅ Unified card model is ready for migration');
  } else {
    console.log('💥 VALIDATION FAILED!');
    console.log('❌ Please fix errors before proceeding');
    process.exit(1);
  }

} catch (error) {
  console.error('🚨 Validation script failed:', error);
  process.exit(1);
}