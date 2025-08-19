# 📝 CHANGELOG

## [2.0.0] - 2025-08-19

### 🎉 Major Card Model Migration Completed

#### ✨ Added
- **Unified Card Model** (`src/models/Card.ts`) - Single source of truth for all card data
- **CardUtils Class** - Utility functions for card operations
  - `getRarityName()` - Convert numeric probability to rarity name
  - `getRarityColor()` - Get display color for rarity
  - `getGoldRewardRange()` - Calculate gold rewards by rarity
  - `getLuckRange()` - Calculate luck values by rarity
- **Migration Scripts** - Automated migration tools
  - `fixAllCards.cjs` - Fix card data structure
  - `fixAllCardRarity.cjs` - Remove CardRarity enum references
  - `fixRarityOperations.cjs` - Fix rarity string operations
  - `fixCardDataErrors.cjs` - Fix syntax errors in card files
  - `fixImports.cjs` - Update import paths

#### 🔄 Changed
- **Rarity System** - Migrated from enum to numeric probability (1/X)
  - Common: 2 (1/2 probability)
  - Uncommon: 4 (1/4 probability)
  - Rare: 10 (1/10 probability)
  - Epic: 50 (1/50 probability)
  - Legendary: 200 (1/200 probability)
  - Mythic: 1000 (1/1000 probability)
  - Cosmic: 10000 (1/10000 probability)
  - Divine: 100000 (1/100000 probability)
  - Infinity: 1000000 (1/1000000 probability)
- **Card Fields** - Standardized field names
  - `health` → `hp` (optional)
  - `attack`, `defense`, `attackSpeed` → removed (not in spec)
  - Added required fields: `emojis`, `stackLevel`, `family`
- **Import Paths** - All components now import from `src/models/Card`

#### 🐛 Fixed
- **11 files** - Removed CardRarity enum usage
- **10 files** - Fixed rarity string operations (`.toLowerCase()`, `.toUpperCase()`)
- **Import syntax errors** - Fixed incorrect comma placement in imports
- **NaN errors** - Added fallback values for undefined fields
- **Path errors** - Corrected relative import paths
- **Card data files** - Fixed all 9 rarity card files structure

#### 🗑️ Removed
- **CardRarity enum** - Completely removed from codebase
- **UnifiedCard references** - Replaced with Card model
- **Legacy card fields** - Removed non-spec fields

### 📦 Components Updated
- `CollectionCard` - Uses CardUtils for rarity conversion
- `CardImage` - Uses getRarityThemeByName function
- `CardStats` - Uses correct Card model fields
- `Card` (molecule) - Converts legacy cards to new format
- `CardFrame` - Accepts rarity as string
- `CardHeader` - Uses string rarity
- `RarityIndicator` - Works with numeric rarity
- `TCGCard` - Compatible with new Card model
- `CollectionStats` - Uses string rarity keys
- `CollectionFilters` - Filters by string rarity

### 🏪 Stores Updated
- `gameStore` - Uses Card type for deck
- `collectionStore` - Compatible with numeric rarity
- `cardsStore` - Updated for new Card model
- `playerStore` - Fixed CardUtils import path
- `playerStoreSimple` - Fixed CardUtils import path

### 🔧 Services Updated
- `CardService` - Works with numeric rarity
- `RollService` - Fixed imports and CardUtils usage
- `DeckService` - Compatible with new Card model

### 📋 Documentation Updated
- `claude.md` - Added v2.2 migration notes
- `roadmap.md` - Marked "Unify Card Data Models" as completed
- `CHANGELOG.md` - Created to track changes

---

## [1.0.0] - 2025-08-17

### 🎮 Initial Release
- Basic game structure
- Roll system implementation
- Initial card definitions
- Collection management
- Basic UI components
