# 🎮 Emoji Mayhem TCG - Game Specification

## 1. Executive Summary

**Emoji Mayhem TCG** is a web/mobile trading card game that combines:
- **Card Collection** mechanics with exponential rarity (1/100 to 1/10M+)
- **Deck Building** with 6-8 card strategic limits
- **Auto-Battle Bullet Hell** where emojis fly across the screen
- **Visual Spectacle** that scales from simple to chaotic

## 2. Core Game Loop

### 2.1 Collection Phase
- Players can roll for new cards **without cost** (free rolls)
- **Each roll rewards gold** based on card rarity obtained
- Cards have **multiple rarity tiers** with exponential drop rates (1/X probability)
- **Duplicate cards** increase power through stacking system
- Rolls are free but generate gold income for players

### 2.2 Deck Building Phase
- Players select **6-8 cards** for their active deck
- Total HP = sum of all equipped cards' HP
- **Player's emoji inventory** = combined pool of all emojis from equipped cards
- Each card contributes its emojis to the player's projectile arsenal
- Strategic balance between card quality vs quantity

### 2.3 Combat Phase
- **100% Automated** - no player input during battle
- Emojis fire automatically based on card stats
- Each emoji has unique **visual effects** and **damage patterns**
- **Luck stat** affects critical hits and bonus effects
- Winner receives **gold** and **experience**

## 3. Card System

### 3.1 Card Properties
```typescript
interface Card {
  id: string;              // Unique identifier
  name: string;            // Display name (meme reference)
  rarity: number;          // Expressed as 1/X probability
  luck: number;            // Luck stat affecting rewards and effects
  emojis: Emoji[];         // Attack projectiles
  family: MemeFamily;      // Thematic family (anime, films, books, etc.)
  reference: string;       // Specific pop culture reference
  stackLevel: number;      // Duplication bonus level
}
```

### 3.2 Rarity System

#### Rarity Tiers (Expressed as 1/X)
| Tier | Rarity (1/X) | Gold Reward | Luck Range | Emoji Count |
|------|--------------|-------------|------------|-------------|
| Common | 1/2 | 10-20 | 1-10 | 1-2 |
| Uncommon | 1/4 | 25-50 | 10-25 | 2-3 |
| Rare | 1/10 | 75-150 | 25-50 | 3-4 |
| Epic | 1/50 | 200-400 | 50-100 | 4-5 |
| Legendary | 1/200 | 500-1000 | 100-200 | 5-6 |
| Mythic | 1/1000 | 1500-3000 | 200-500 | 6-8 |
| Cosmic | 1/10000 | 5000-10000 | 500-1000 | 8-10 |
| Divine | 1/100000 | 15000-25000 | 1000-2000 | 10-12 |
| Infinity | 1/1000000+ | 50000+ | 2000+ | 12+ |

**Note**: Many more rarity tiers exist between and beyond these examples

### 3.3 Meme Families & References (Copyright-Free)

#### Major Families
- **Classic Internet Memes**: Doge, Pepe, Wojak, Chad, Trollface, Rage Comics
- **Meme Formats**: Drake format, Expanding Brain, Distracted Boyfriend, Woman Yelling at Cat
- **Historical Figures**: Ancient philosophers, scientists, public domain figures
- **Mythology**: Greek gods, Norse mythology, folklore creatures
- **Animals**: Grumpy Cat style, Advice Animals, animal reactions
- **Abstract Concepts**: Stonks, Yes/No, Virgin vs Chad, Galaxy Brain
- **Emotions & Reactions**: Surprised Pikachu style, Crying, Laughing, Shocked
- **Internet Culture**: Greentext stories, copypasta references, viral phenomena
- **Gaming Archetypes**: Speedrunner, Noob, Pro Gamer, Rage Quitter
- **Life Situations**: Student life, Work life, Relationships, Everyday struggles

#### Family Bonuses
- Cards from the same family have **synergy bonuses**
- Collecting full sets unlocks **special rewards**
- Family-specific **tournaments and events**

### 3.4 Stacking System
- Duplicate cards don't waste rolls - they give **bonus gold**
- Each stack level adds:
  - +10% Luck stat
  - +15% Gold generation
  - +1 additional emoji variant
- Max stack level: 10

## 4. Combat System

### 4.1 Battle Flow
1. **Initialization** (0-3s)
   - Show both decks side by side
   - **Left side**: Player 1 / Human player
   - **Right side**: Player 2 / AI opponent
   - Display total HP bars for both players
   - Countdown timer

2. **Combat** (3-60s)
   - Players **shoot emojis directly at each other**
   - Player's emojis travel from left → right **targeting opponent**
   - Opponent's emojis travel from right → left **targeting player**
   - Direct hits deal damage to the targeted player
   - **Card effects can proc at any moment** during combat:
     - Passive abilities trigger randomly
     - Special effects activate on conditions
     - Combos chain between cards in deck
   - Damage numbers floating on impact
   - HP bars depleting based on direct hits received

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
  target: Player;       // Always aims at opposing player
}
```

### 4.3 Card Effect System
```typescript
interface CardEffect {
  trigger: TriggerType;   // Random, OnHit, OnDamage, Periodic, etc.
  chance: number;         // Proc chance (affected by Luck stat)
  effect: EffectType;     // What happens when triggered
  duration?: number;      // Effect duration if applicable
}
```

**Card effects can proc at ANY time during combat:**
- **Random Procs**: Cards randomly activate their special abilities
- **Conditional Triggers**: Effects activate based on battle conditions
- **Chain Reactions**: One card's effect can trigger another's
- **Luck Influence**: Higher luck = higher proc chance

### 4.4 Special Effects (Can Proc Anytime)
- **Freeze** ❄️: Slows enemy fire rate by 50% for 2s
- **Burn** 🔥: Deals damage over time for 3s
- **Heal** 💚: Restores 5% HP to player
- **Boost** ⚡: Increases fire rate by 100% for 2s
- **Shield** 🛡️: Blocks next 3 hits
- **Poison** 🧪: Reduces healing by 75% for 5s
- **Lucky** 🍀: Double gold if this emoji gets final hit
- **Burst** 💥: Sudden damage spike to opponent
- **Reflect** 🔄: Bounces incoming emojis back
- **Multiply** ✖️: Duplicates outgoing emojis

## 5. Visual Design

### 5.1 Combat Arena
- **Background**: Dynamic gradient based on card rarities
- **Player Zones**: 
  - Left side: Player 1 (human/challenger)
  - Right side: Player 2 (AI/opponent)
- **Projectile Layer**: 
  - Player emojis fly left → right **directly at opponent**
  - Opponent emojis fly right → left **directly at player**
  - No collision between projectiles - they pass through each other
  - Direct hits on players cause damage
- **Effect Layer**: 
  - Card proc effects (random flashes, auras, explosions)
  - Impact effects when emojis hit players
  - Special ability activations
- **UI Layer**: 
  - Dual HP bars
  - Card effect notifications when procs occur
  - Damage counters

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

### 6.3 Currency System (Updated)
- **Rolls**: Free, but generate gold rewards
- **Gold**: Primary currency
  - Earned from rolls (based on card rarity)
  - Earned from battles (winner bonus)
  - Earned from duplicates (stack bonus)
  - Used for: upgrades, cosmetics, special events
- **Luck Points**: Accumulated from high-luck cards
- **Gems**: Premium currency for guaranteed rares (optional)
- **Dust**: From duplicates, craft specific cards (future feature)

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
- Unlimited free rolls that generate gold
- Gold rewards scale with card rarity
- Daily login bonuses
- Luck multipliers for gold generation
- Ad watching for bonus rewards (optional)
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
