# 🎮 Emoji Mayhem TCG - Game Specification

## 1. Executive Summary

**Emoji Mayhem TCG** is a web/mobile trading card game that combines:
- **Card Collection** mechanics with exponential rarity (1/100 to 1/10M+)
- **Deck Building** with 6-8 card strategic limits
- **Auto-Battle Bullet Hell** where emojis fly across the screen
- **Visual Spectacle** that scales from simple to chaotic

## 2. Core Game Loop

### 2.1 Collection Phase
- Players spend **coins** to roll for new cards
- Each roll costs **100 coins**
- Cards have **7 rarity tiers** with exponential drop rates
- **Duplicate cards** increase power through stacking system

### 2.2 Deck Building Phase
- Players select **6-8 cards** for their active deck
- Total HP = sum of all equipped cards' HP
- All emojis from equipped cards become available projectiles
- Strategic balance between card quality vs quantity

### 2.3 Combat Phase
- **100% Automated** - no player input during battle
- Emojis fire automatically based on **attack speed**
- Each emoji has unique **visual effects** and **damage patterns**
- Winner receives **coins** and **experience**

## 3. Card System

### 3.1 Card Properties
```typescript
interface Card {
  id: string;              // Unique identifier
  name: string;            // Display name (meme reference)
  rarity: Rarity;          // Common to Cosmic
  emojis: Emoji[];         // Attack projectiles
  hp: number;              // Health contribution
  attackSpeed: number;     // Fire rate (shots/second)
  passive: PassiveAbility; // Special effect
  stackLevel: number;      // Duplication bonus level
}
```

### 3.2 Rarity Tiers
| Tier | Drop Rate | Emoji Count | HP Range | Attack Speed |
|------|-----------|-------------|----------|--------------|
| Common | 50% | 1-2 | 10-20 | 0.5-1.0 |
| Uncommon | 25% | 2-3 | 20-40 | 1.0-1.5 |
| Rare | 15% | 3-4 | 40-80 | 1.5-2.0 |
| Epic | 7% | 4-5 | 80-150 | 2.0-2.5 |
| Legendary | 2.5% | 5-6 | 150-300 | 2.5-3.0 |
| Mythic | 0.45% | 6-8 | 300-500 | 3.0-4.0 |
| Cosmic | 0.05% | 8-10 | 500-1000 | 4.0-5.0 |

### 3.3 Stacking System
- Duplicate cards don't waste rolls
- Each stack level adds:
  - +20% HP
  - +15% Attack Speed
  - +1 additional emoji variant
- Max stack level: 10

## 4. Combat System

### 4.1 Battle Flow
1. **Initialization** (0-3s)
   - Show both decks
   - Display total HP bars
   - Countdown timer

2. **Combat** (3-60s)
   - Automatic emoji firing
   - Damage numbers floating
   - Special effects triggering
   - HP bars depleting

3. **Resolution** (60s+)
   - Winner declaration
   - Rewards distribution
   - Stats summary

### 4.2 Emoji Mechanics
```typescript
interface Emoji {
  character: string;    // The emoji character
  damage: number;       // Base damage per hit
  speed: number;        // Projectile velocity
  effect?: Effect;      // Special effect on hit
  trajectory: Pattern;  // Movement pattern
}
```

### 4.3 Special Effects
- **Freeze** ❄️: Slows enemy fire rate by 50% for 2s
- **Burn** 🔥: Deals damage over time for 3s
- **Heal** 💚: Restores 5% HP to player
- **Boost** ⚡: Increases fire rate by 100% for 2s
- **Shield** 🛡️: Blocks next 3 hits
- **Poison** 🧪: Reduces healing by 75% for 5s
- **Lucky** 🍀: Double coins if this emoji gets final hit

## 5. Visual Design

### 5.1 Combat Arena
- **Background**: Dynamic gradient based on card rarities
- **Player Zones**: Left (player) vs Right (opponent)
- **Projectile Layer**: Emojis flying across screen
- **Effect Layer**: Explosions, trails, impacts
- **UI Layer**: HP bars, timers, score

### 5.2 Scaling Chaos
- **Early Game**: 5-10 emojis/second, clear visibility
- **Mid Game**: 20-50 emojis/second, moderate chaos
- **Late Game**: 100+ emojis/second, visual overload
- **Endgame**: 500+ emojis/second, pure spectacle

### 5.3 Card Visuals
- **Border Color**: Indicates rarity
- **Glow Effect**: Intensity based on stack level
- **Emoji Preview**: Shows all available emojis
- **Passive Icon**: Visual representation of ability

## 6. Progression System

### 6.1 Player Level
- Experience gained from battles
- Unlocks new features:
  - Level 5: Auto-roll
  - Level 10: Deck presets
  - Level 15: Tournament mode
  - Level 20: Trading system

### 6.2 Collection Goals
- **Starter**: Collect 10 unique cards
- **Collector**: Collect 50 unique cards
- **Enthusiast**: Collect 100 unique cards
- **Master**: Collect all cards
- **Stacker**: Max stack any card

### 6.3 Currency
- **Coins**: Main currency for rolling
- **Gems**: Premium currency for guaranteed rares
- **Dust**: From duplicates, craft specific cards

## 7. Technical Requirements

### 7.1 Performance Targets
- 60 FPS with 100 emojis on screen
- 30 FPS with 500 emojis on screen
- Sub-100ms response time for UI actions
- Support for mobile devices (2GB RAM minimum)

### 7.2 Platform Support
- **Web**: Chrome, Firefox, Safari, Edge
- **Mobile Web**: iOS Safari, Chrome Android
- **Progressive Web App**: Installable on mobile
- **Future**: Native iOS/Android apps

## 8. Monetization (Optional)

### 8.1 Free to Play
- Daily login coins
- Ad watching for bonus rolls
- Achievement rewards

### 8.2 Premium Options
- Gem packs for guaranteed rares
- Battle pass with exclusive cards
- Cosmetic emoji skins
- Auto-roll convenience feature

## 9. Social Features

### 9.1 Core Social
- Friend battles
- Deck sharing codes
- Global leaderboard
- Collection showcase

### 9.2 Future Social
- Guilds/Clans
- Trading marketplace
- Tournaments
- Spectator mode

## 10. Success Metrics

### 10.1 Engagement
- Average session time > 15 minutes
- Daily active users retention > 40%
- Average battles per day > 5

### 10.2 Collection
- Average cards collected > 30
- Duplicate satisfaction rate > 80%
- Deck variety index > 0.6

### 10.3 Visual Impact
- "Wow" moments per battle > 3
- Screenshot share rate > 10%
- Spectacle satisfaction > 90%
