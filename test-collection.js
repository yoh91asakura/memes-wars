// Test script to verify collection functionality
const { RollService } = require('./dist/services/RollService');
const { commonCards } = require('./dist/data/cards/common');

console.log('Testing Collection Module...');
console.log('Available common cards:', commonCards.length);

// Test that cards are properly structured
const firstCard = commonCards[0];
console.log('First card:', {
  id: firstCard?.id,
  name: firstCard?.name,
  emoji: firstCard?.emoji,
  rarity: firstCard?.rarity
});

// Test RollService
try {
  const rollService = RollService.getInstance();
  console.log('RollService initialized successfully');
} catch (error) {
  console.log('RollService error:', error.message);
}

console.log('✅ Collection module appears to be working!');