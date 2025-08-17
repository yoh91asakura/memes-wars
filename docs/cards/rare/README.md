# Rare Cards Documentation

## Overview

Rare cards are the third tier of cards in Meme War TCG, offering powerful effects and unique abilities. They represent significant strategic options that can turn the tide of battle.

## Card Statistics

- **Total Cards**: 10
- **Drop Rate**: Based on roll configuration
- **Cost Range**: 3-6 mana
- **Power Level**: High with special abilities

## Card Types Distribution

- **Creatures**: 6 cards (60%)
- **Spells**: 2 cards (20%)  
- **Support**: 1 card (10%)
- **Attack**: 1 card (10%)
- **Defense**: 1 card (10%)

## Complete Rare Card List

### Creatures

#### 1. Cosmic Meteor ☄️💫 (rare-001)
- **Cost**: 4 | **Attack**: 6 | **Defense**: 2 | **Health**: 4
- **Ability**: Meteor Impact
- **Effects**: meteor_impact, area_damage, burn
- **Description**: A blazing meteor that crashes down with devastating force

#### 2. Ancient Dragon 🐲⚔️ (rare-002)
- **Cost**: 5 | **Attack**: 7 | **Defense**: 4 | **Health**: 5
- **Ability**: Dragon's Fury  
- **Effects**: dragon_breath, intimidate, veteran
- **Description**: An ancient wyrm with centuries of battle experience

#### 3. Crystal Phoenix 💎🐦 (rare-003)
- **Cost**: 4 | **Attack**: 5 | **Defense**: 3 | **Health**: 4
- **Ability**: Prismatic Wings
- **Effects**: light_refraction, crystal_rebirth, dazzle
- **Description**: A majestic phoenix made of pure crystal that refracts light into deadly beams

#### 4. Shadow Wraith 👻🌑 (rare-004)
- **Cost**: 3 | **Attack**: 4 | **Defense**: 1 | **Health**: 3
- **Ability**: Ethereal Form
- **Effects**: phase_strike, life_drain, terror
- **Description**: A vengeful spirit that phases through reality to strike

#### 5. Quantum Cat 🐱⚛️ (rare-006)
- **Cost**: 3 | **Attack**: 3 | **Defense**: 6 | **Health**: 4
- **Ability**: Schrödinger's Strike
- **Effects**: quantum_superposition, probability_manipulation, nine_lives
- **Description**: A mysterious feline that exists in multiple realities simultaneously

#### 6. Void Leviathan 🐋🕳️ (rare-007)
- **Cost**: 6 | **Attack**: 9 | **Defense**: 5 | **Health**: 6
- **Ability**: Event Horizon
- **Effects**: void_swallow, gravity_well, cosmic_hunger
- **Description**: A massive creature from the depths of space that devours light itself

### Spells

#### 7. Elemental Storm ⛈️🌀 (rare-005)
- **Cost**: 5 | **Damage**: 8
- **Ability**: Primordial Fury
- **Effects**: elemental_chaos, chain_lightning, flood
- **Description**: A devastating storm that combines all elemental forces

### Support

#### 8. Time Keeper ⏰🔮 (rare-008)
- **Cost**: 4 | **Attack**: 2 | **Defense**: 8 | **Health**: 5
- **Ability**: Temporal Mastery
- **Effects**: time_manipulation, temporal_shield, chronos_blessing
- **Description**: A guardian of time who can manipulate the flow of battle

### Attack

#### 9. Plasma Cannon 🔫⚡ (rare-009)
- **Cost**: 5 | **Attack**: 10 | **Defense**: 2 | **Health**: 3
- **Ability**: Superheated Blast
- **Effects**: plasma_burst, armor_piercing, overcharge
- **Description**: A high-tech weapon that fires superheated plasma bolts

### Defense

#### 10. Celestial Guardian 👼⭐ (rare-010)
- **Cost**: 4 | **Attack**: 1 | **Defense**: 10 | **Health**: 6
- **Ability**: Heaven's Shield
- **Effects**: divine_protection, healing_aura, sanctuary
- **Description**: A divine protector who shields allies with celestial power

## Design Philosophy

Rare cards are designed with the following principles:

### Power Level
- **Cost-to-Power Ratio**: 3.0-4.4 (higher than common/uncommon)
- **Special Abilities**: Every rare card has unique mechanics
- **Strategic Impact**: Can significantly influence game outcome

### Balance Considerations
- **High Cost**: Require significant mana investment (3-6 cost)
- **Specialized Effects**: Powerful but often situational
- **Risk/Reward**: High impact but vulnerable to removal

### Thematic Cohesion
- **Cosmic Theme**: Many cards reference space, time, or otherworldly forces
- **Emoji Integration**: Each card uses thematic emojis in name and description
- **Flavor Text**: Rich lore that builds the game world

## Gameplay Integration

### Roll System
- **Drop Rate**: Configured in roll.config.json
- **Pity System**: Guaranteed rare card every X rolls (without higher rarity)
- **10-Roll Guarantee**: At least one rare or better in every 10-roll

### Strategic Usage
- **Win Conditions**: Many rares can serve as win conditions
- **Combo Enablers**: Support powerful synergies
- **Answer Cards**: Provide solutions to specific threats

## Technical Implementation

### File Structure
```
src/data/cards/rare/
├── rare-cards.json     # Card data
└── index.ts           # TypeScript exports

src/data/cards/rare.ts  # Main export file
```

### Type Safety
- All cards implement the `Card` interface
- Strict typing for rarity, type, and effects
- Comprehensive validation in tests

### Testing Coverage
- 18 comprehensive tests covering all aspects
- Balance validation
- Type safety verification
- Individual card property testing

## Future Considerations

### Expansion Potential
- Room for additional rare cards while maintaining balance
- Modular design allows easy addition of new mechanics
- Backward compatibility preserved

### Balance Updates
- Power levels can be adjusted via JSON data
- Effects can be modified without code changes
- Cost adjustments based on gameplay data

---

*This documentation reflects the current state of rare cards as of the latest update. For gameplay questions or balance feedback, please refer to the main game documentation.*