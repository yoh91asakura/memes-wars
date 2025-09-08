# Feature Specification: Memes Wars - Complete Auto-Battler RNG Card Game

**Feature Branch**: `001-extract-current-project`  
**Created**: 2025-09-08  
**Status**: Draft  
**Input**: User description: "extract current project vision to do well specification"

## Execution Flow (main)
```
1. Parse user description from Input
   → ✓ COMPLETE: Extracted need to document current Memes Wars game vision
2. Extract key concepts from description
   → ✓ COMPLETE: Identified core game loop, systems, progression mechanics
3. For each unclear aspect:
   → ✓ COMPLETE: Marked areas needing future clarification
4. Fill User Scenarios & Testing section
   → ✓ COMPLETE: Documented complete addiction loop cycle
5. Generate Functional Requirements
   → ✓ COMPLETE: All core systems documented with testable requirements
6. Identify Key Entities (if data involved)
   → ✓ COMPLETE: Cards, Combat, Progression, Economy entities defined
7. Run Review Checklist
   → ✓ COMPLETE: No tech implementation details, business-focused
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Players engage in fast-paced 30 second to 2 minute gaming sessions where they collect meme-themed cards through randomized rolls with automated batch processing, craft powerful enhancement items through resource conversion, optimize deck configurations with detected synergy bonuses within evolving size limits, battle enemies in automated combat using emoji-based attacks with passive ability triggers, and progress through increasingly challenging stages with boss encounters. The game creates an addiction loop through sophisticated roll mechanics with multi-tiered pity systems, strategic deck building with synergy recommendations, crafting progression systems, and immediate combat gratification enhanced by passive effects.

### Acceptance Scenarios
1. **Given** a new player starts the game, **When** they perform their first card roll using auto-roll controls, **Then** they receive guaranteed beginner cards and can immediately equip them with synergy detection feedback
2. **Given** a player has been rolling cards without getting rare drops, **When** they reach any pity system threshold (10/30/90/200), **Then** they are guaranteed to receive higher rarity cards with visual confirmation and pity counter reset
3. **Given** a player has collected sufficient resources, **When** they access the crafting panel, **Then** they can create consumable boosts, permanent upgrades, or special cards according to available recipes with cooldown management
4. **Given** a player has assembled their deck, **When** combat initiates, **Then** passive abilities trigger on battle start, synergy bonuses activate automatically, and emoji projectiles execute with effect processing
5. **Given** a player progresses through stages, **When** they complete boss encounters, **Then** they unlock higher deck size limits, access advanced crafting recipes, and face more challenging enemy compositions
6. **Given** a player equips cards with complementary attributes, **When** the system detects valid combinations, **Then** synergy bonuses automatically activate with real-time strength calculations and archetype classification
7. **Given** a player has active crafted items, **When** they engage in combat or rolling activities, **Then** temporary boosts apply automatically with usage tracking and expiration management
8. **Given** a player's cards trigger combat events, **When** passive ability conditions are met, **Then** effects activate according to chance percentages with cooldown enforcement and stat modifications

### Edge Cases
- What happens when a player's deck is at maximum capacity and they try to equip additional cards?
- How does the system handle combat scenarios where both players/enemies have identical health remaining?
- What occurs if a player attempts to craft items without sufficient materials or during cooldown periods?
- How does the game respond when pity system guarantees conflict with available card pools?
- What happens when multiple passive abilities trigger simultaneously during combat?
- How are synergy conflicts resolved when cards qualify for multiple synergy types?
- What occurs when crafted temporary items expire during active combat encounters?

## Requirements *(mandatory)*

### Functional Requirements

#### Core Game Loop & Rolling System
- **FR-001**: System MUST provide card rolling mechanism with configurable drop rates for 7 rarity tiers (common, uncommon, rare, epic, legendary, mythic, cosmic) including batch processing capabilities
- **FR-002**: System MUST implement multi-tiered pity system guaranteeing rare drops at predetermined thresholds (rare at 10 rolls, epic at 30, legendary at 90, mythic at 200) with persistent counter tracking
- **FR-003**: System MUST support automated rolling with configurable parameters including stop-on-rarity conditions, batch sizes, and animation speed controls
- **FR-004**: Users MUST be able to equip cards into deck slots with evolving size limits based on stage progression with real-time synergy feedback
- **FR-005**: System MUST execute automated combat between player decks and AI opponents using emoji-based projectile mechanics with passive ability integration

#### Advanced Crafting System
- **FR-006**: System MUST provide comprehensive crafting interface with 10+ recipes across multiple categories (consumables, permanent upgrades, special cards, resource conversion)
- **FR-007**: System MUST enforce crafting constraints including unique items, maximum craft limits, cooldown periods, and resource validation
- **FR-008**: System MUST support temporary consumable items with duration tracking, automatic expiration, and usage management
- **FR-009**: System MUST enable permanent upgrades including deck size increases, luck bonuses, and other progressive enhancements
- **FR-010**: System MUST facilitate resource conversion between card rarities and currency types with balanced exchange rates

#### Synergy & Deck Building System
- **FR-011**: System MUST detect and apply 8+ synergy types including Force Build, Luck Build, Tank Build, Speed Build, Elemental Mastery, Meme Lord, Ancient Power, and Rainbow Chaos
- **FR-012**: System MUST calculate synergy strength with multi-rule detection, stackable bonuses, and threshold management
- **FR-013**: System MUST provide synergy recommendations and deck archetype classification based on current card combinations
- **FR-014**: System MUST categorize cards into thematic meme families with enhanced family-based synergy detection
- **FR-015**: System MUST enforce dynamic deck size limits that increase with stage progression allowing more strategic depth

#### Passive Effects & Combat Enhancement
- **FR-016**: System MUST implement passive card abilities with multiple trigger types (battle start, low HP, high combo, periodic)
- **FR-017**: System MUST support 10+ effect types including heal, boost, shield, burn, freeze, poison, lucky, burst, reflect, multiply
- **FR-018**: System MUST manage passive ability cooldowns, proc tracking, and chance-based activation with frame-accurate timing
- **FR-019**: System MUST integrate passive effects with combat engine for real-time stat modifications and status applications
- **FR-020**: System MUST process frame-based combat with emoji projectiles, effect processing, and synergy bonus calculations

#### Stage Progression & Boss System
- **FR-021**: System MUST provide comprehensive stage progression with boss encounters, unlock requirements, and reward scaling
- **FR-022**: System MUST support stage selection interface with difficulty indicators, reward previews, and completion tracking
- **FR-023**: System MUST manage stage-specific enemy compositions, health scaling, and special encounter conditions
- **FR-024**: System MUST unlock advanced features (crafting recipes, deck slots) based on stage completion milestones
- **FR-025**: System MUST persist stage progress with completion status, best performance metrics, and unlock achievements

#### Economy & Resource Management
- **FR-026**: System MUST manage multiple currency types (gold, gems) with crafting integration and reward distribution
- **FR-027**: System MUST track comprehensive player statistics including crafting metrics, synergy usage, and passive ability performance
- **FR-028**: System MUST provide resource balance validation preventing exploitative crafting loops or economy breaking

#### Session Design & Performance
- **FR-029**: System MUST support quick gaming sessions lasting 30 seconds to 2 minutes per complete cycle with enhanced automation features
- **FR-030**: System MUST provide immediate feedback through visual indicators, progress notifications, and real-time stat updates
- **FR-031**: System MUST persist all player progress including card collection, crafted items, stage progress, synergy data, and passive ability statistics

### Key Entities *(include if feature involves data)*

- **Card**: Collectible meme-themed game pieces with 7 rarity tiers, meme family classification, emoji attack patterns, health/damage stats, passive abilities with trigger conditions, and card effects with cooldowns and chance percentages
- **Deck**: Player's active card configuration with dynamic size limits (3-10+ cards), synergy detection engine, archetype classification, and strength calculations for optimized strategic combinations
- **Stage**: Progressive challenge levels with boss encounters, unlock requirements, enemy scaling, reward tiers, and completion tracking with persistent progress data
- **CraftRecipe**: Crafting blueprint defining resource costs, output results, constraint rules (unique/max crafts/cooldowns), categories (consumable/permanent/upgrade/card), and player requirements
- **CraftedItem**: Active crafted consumables with expiration tracking, usage counters, effect management, and automatic lifecycle handling for temporary boosts and permanent upgrades
- **SynergyType**: Synergy definition with detection rules, bonus calculations, threshold management, stackability settings, and multi-rule validation for 8+ synergy categories
- **ActiveSynergy**: Runtime synergy instance with strength calculations, triggering card references, bonus applications, and level scaling for real-time deck optimization
- **PassiveEffect**: Card ability system with trigger types (battle start, low HP, high combo, periodic), effect applications, cooldown management, and proc tracking integrated with combat engine
- **Combat**: Enhanced automated battle instance with passive ability processing, synergy bonus integration, projectile physics, effect applications, and frame-based calculations maintaining 30s-2min engagement
- **Player Progress**: Comprehensive progression tracking including card collection, crafted item history, stage completion, synergy usage statistics, passive ability performance, and currency management
- **Economy**: Multi-currency system (gold, gems) with crafting integration, resource conversion rates, balance validation, and reward distribution based on stage performance and combat results
- **AutoRoll**: Automated rolling system with batch processing, stop-on-rarity conditions, animation controls, and pity system integration for enhanced user experience

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
