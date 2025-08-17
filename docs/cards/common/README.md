# Common Cards Collection

## Overview
This collection contains 10 common cards designed for balanced early-game play. Each card features emoji themes with simple, straightforward abilities.

## Balance Guidelines
- **Attack Range**: 0-3
- **Defense Range**: 0-3  
- **Cost Range**: 1-2
- **Total Stats**: 1-4 (Attack + Defense)
- **Abilities**: Simple effects suitable for beginners

## Card List

| ID | Name | Emoji | Attack | Defense | Cost | Ability | Type |
|---|---|---|---|---|---|---|---|
| common-001 | Smiling Face | 😊 | 2 | 1 | 1 | Draw 1 | Creature |
| common-002 | Rocket | 🚀 | 3 | 0 | 2 | Haste | Creature |
| common-003 | Star | 🌟 | 1 | 2 | 1 | Inspire | Creature |
| common-004 | Strong | 💪 | 3 | 1 | 2 | Power | Creature |
| common-005 | Shield | 🛡️ | 0 | 3 | 1 | Protect | Creature |
| common-006 | Lightning | ⚡ | 2 | 1 | 1 | Quick | Creature |
| common-007 | Target | 🎯 | 1 | 1 | 1 | Focus | Creature |
| common-008 | Heart | ❤️ | 1 | 2 | 1 | Heal 1 | Creature |
| common-009 | Fire | 🔥 | 2 | 0 | 1 | Burn | Creature |
| common-010 | Ice | ❄️ | 1 | 1 | 1 | Freeze | Creature |

## Ability Definitions

- **Draw 1**: Draw an additional card when played
- **Haste**: Can attack immediately when played
- **Inspire**: Adjacent creatures get +1 attack
- **Power**: Gains +1 attack each turn
- **Protect**: Adjacent creatures get +1 defense
- **Quick**: First strike in combat
- **Focus**: Can target any enemy creature
- **Heal 1**: Restore 1 health to your hero
- **Burn**: Deals 1 damage to target when played
- **Freeze**: Target creature cannot attack next turn

## Usage Examples

### Basic Deck Building
```typescript
import { commonCards } from '@/data/cards/common';

// Get all common cards
const allCommons = commonCards;

// Filter by cost
const cheapCards = commonCards.filter(card => card.cost === 1);

// Get specific card
const smilingFace = commonCards.find(card => card.id === 'common-001');
```

### Balance Validation
- Cost 1 cards: 8/10 (80%)
- Cost 2 cards: 2/10 (20%)
- Average stats: 1.6 attack, 1.1 defense
- Total power level: Appropriate for common rarity

## Design Philosophy
These cards prioritize simplicity and teach core game mechanics:
- Resource management (mana cost)
- Combat basics (attack/defense)
- Simple abilities without complex interactions
- Positive emoji themes for accessibility

## Future Considerations
- May adjust stats based on playtesting
- Could add more common cards for variety
- Abilities might be refined for clarity