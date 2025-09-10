# DeckService Contract

## Interface Definition

```typescript
interface IDeckService {
  // Create new deck
  createDeck(name: string): Deck;
  
  // Add card to deck (with validation)
  addCardToDeck(deckId: string, card: Card): AddCardResult;
  
  // Remove card from deck
  removeCardFromDeck(deckId: string, cardId: string): boolean;
  
  // Validate deck for combat
  validateDeck(deck: Deck, currentStage: number): ValidationResult;
  
  // Get deck size limit for stage
  getDeckSizeLimit(stage: number): number;
  
  // Calculate deck synergies
  calculateSynergies(deck: Deck): SynergyBonus[];
  
  // Get deck statistics
  getDeckStats(deck: Deck): DeckStatistics;
  
  // Clone deck
  cloneDeck(deckId: string, newName: string): Deck;
  
  // Delete deck
  deleteDeck(deckId: string): boolean;
}

interface AddCardResult {
  success: boolean;
  error?: string;
  deckSizeExceeded?: boolean;
  duplicateCard?: boolean;
  manaCostExceeded?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  deckSize: number;
  maxDeckSize: number;
  totalManaCost: number;
  synergyCount: number;
}

interface DeckStatistics {
  totalCards: number;
  totalHealth: number;
  averageDamage: number;
  totalManaCost: number;
  rarityDistribution: Record<CardRarity, number>;
  familyDistribution: Record<MemeFamily, number>;
  synergies: SynergyBonus[];
  estimatedPower: number;
}
```

## Behavior Contracts

### Deck Creation Contract
**GIVEN** valid deck name
**WHEN** `createDeck(name)` is called
**THEN**
- Generate unique deck ID
- Initialize empty cards array
- Set maxSize based on current player stage
- Set creation timestamp
- Return new Deck object
- Save deck to player progress

### Add Card Contract
**GIVEN** existing deck and valid card
**WHEN** `addCardToDeck(deckId, card)` is called
**THEN**
- Validate deck exists
- Check deck size limit not exceeded
- Check card not already in deck (no duplicates)
- Check mana cost within limits
- Add card to deck if all validations pass
- Recalculate synergies
- Return AddCardResult with success/error details

### Deck Size Limit Contract
**GIVEN** player's current stage
**WHEN** `getDeckSizeLimit(stage)` is called
**THEN** return deck size limit according to:
- Stages 1-10: 3 cards maximum
- Stages 11-25: 4 cards maximum
- Stages 26-50: 5 cards maximum
- Stages 51-75: 6 cards maximum
- Stages 76-100: 7 cards maximum
- Stages 100+: 8 cards maximum

### Synergy Calculation Contract
**GIVEN** deck with multiple cards
**WHEN** `calculateSynergies(deck)` is called
**THEN** detect and return synergy bonuses:
- Force Build: 2+ 💪 cards + 1+ weapon card → 2x damage
- Luck Build: 3+ 🍀 cards → +20% rare drop chance
- Animal Pack: 3+ animal family cards → +1 attack speed
- Meme Combo: 3+ same meme format → +50% health
- Elemental: fire + ice + lightning → unique effects
- Classic Combo: 3+ classic internet memes → nostalgia bonus

### Deck Validation Contract
**GIVEN** deck and target stage
**WHEN** `validateDeck(deck, stage)` is called
**THEN**
- Check deck has at least 1 card
- Check deck size within stage limit
- Check no duplicate cards
- Check total mana cost within budget
- Check all cards are unlocked for stage
- Return ValidationResult with detailed feedback

### Deck Statistics Contract
**GIVEN** populated deck
**WHEN** `getDeckStats(deck)` is called
**THEN** calculate and return:
- Total health = sum of all card health
- Average damage = weighted average by attack speed
- Rarity distribution counts
- Family distribution counts
- Active synergy bonuses
- Estimated power rating (0-100 scale)

## Test Scenarios

### Happy Path Tests
```typescript
describe('DeckService Happy Path', () => {
  test('creates deck with correct initial state', () => {
    const deck = deckService.createDeck('Test Deck');
    
    expect(deck.id).toBeDefined();
    expect(deck.name).toBe('Test Deck');
    expect(deck.cards).toEqual([]);
    expect(deck.maxSize).toBeGreaterThan(0);
  });
  
  test('adds valid card to deck', () => {
    const deck = createTestDeck();
    const card = createTestCard();
    
    const result = deckService.addCardToDeck(deck.id, card);
    
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
```

### Validation Tests
```typescript
describe('DeckService Validation', () => {
  test('rejects deck exceeding size limit', () => {
    const deck = createTestDeck();
    // Fill deck to maximum capacity
    for(let i = 0; i < deck.maxSize; i++) {
      deckService.addCardToDeck(deck.id, createTestCard());
    }
    
    const result = deckService.addCardToDeck(deck.id, createTestCard());
    
    expect(result.success).toBe(false);
    expect(result.deckSizeExceeded).toBe(true);
  });
  
  test('rejects duplicate cards', () => {
    const deck = createTestDeck();
    const card = createTestCard();
    
    deckService.addCardToDeck(deck.id, card);
    const result = deckService.addCardToDeck(deck.id, card);
    
    expect(result.success).toBe(false);
    expect(result.duplicateCard).toBe(true);
  });
});
```

### Synergy Tests
```typescript
describe('DeckService Synergies', () => {
  test('detects force build synergy', () => {
    const deck = createTestDeck();
    deck.cards = [
      createCardWithEmoji('💪'),
      createCardWithEmoji('💪'), 
      createCardWithEmoji('⚔️')
    ];
    
    const synergies = deckService.calculateSynergies(deck);
    
    expect(synergies.some(s => s.type === SynergyType.FORCE_BUILD)).toBe(true);
  });
  
  test('calculates correct deck statistics', () => {
    const deck = createTestDeck();
    deck.cards = [
      { health: 10, attackDamage: 5, rarity: CardRarity.COMMON },
      { health: 15, attackDamage: 8, rarity: CardRarity.RARE }
    ];
    
    const stats = deckService.getDeckStats(deck);
    
    expect(stats.totalHealth).toBe(25);
    expect(stats.totalCards).toBe(2);
    expect(stats.rarityDistribution[CardRarity.COMMON]).toBe(1);
    expect(stats.rarityDistribution[CardRarity.RARE]).toBe(1);
  });
});
```

## Dependencies
- PlayerProgress (for stage-based limits)
- Card collection (for validation)
- Synergy configuration (for bonus calculations)
- Save system (for deck persistence)