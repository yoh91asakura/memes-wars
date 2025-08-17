# 🎮 Emoji Mayhem TCG

> A trading card game where meme-inspired cards battle in explosive emoji bullet hell combat!

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📋 Project Overview

**Emoji Mayhem TCG** combines the collection mechanics of trading card games with the visual chaos of bullet hell shooters. Players collect cards of varying rarities, build strategic decks, and watch as their emoji armies automatically battle in spectacular fashion.

### Core Features
- 🎲 **Card Rolling System** - 7 rarity tiers with exponential drop rates
- 🃏 **Deck Building** - Strategic 6-8 card deck composition
- 💥 **Auto-Battle Combat** - Watch emoji projectiles fill the screen
- 📈 **Progression System** - Stack duplicates for power increases
- ✨ **Visual Effects** - Rarity-based animations and particle effects

## 🏗️ Project Structure

```
emoji-mayhem-tcg/
├── src/                 # Source code
│   ├── components/      # React components
│   ├── models/          # TypeScript data models
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── tests/               # Test files
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── docs/                # Documentation
│   ├── specifications/  # Game design docs
│   └── architecture/    # Technical docs
└── config/              # Configuration files
```

## 🎯 Development Workflow (SPARC)

This project follows the **SPARC methodology**:

1. **Specification** - Define requirements
2. **Pseudocode** - Design algorithms
3. **Architecture** - System design
4. **Refinement** - TDD implementation
5. **Completion** - Integration & polish

### Running SPARC Commands

```bash
# Run specification phase
npm run sparc:spec

# Run architecture phase
npm run sparc:architect

# Run TDD workflow
npm run sparc:tdd
```

## 🧪 Testing

We follow a **Test-Driven Development** approach:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🎮 Game Mechanics

### Card Rarities
- **Common** (50%) - Gray, 1-2 emojis
- **Uncommon** (25%) - Green glow, 2-3 emojis
- **Rare** (15%) - Blue glow, 3-4 emojis
- **Epic** (7%) - Purple glow, 4-5 emojis
- **Legendary** (2.5%) - Orange glow, 5-6 emojis
- **Mythic** (0.45%) - Red sparkles, 6-8 emojis
- **Cosmic** (0.05%) - Rainbow effect, 8-10 emojis

### Combat System
- Automatic emoji firing based on attack speed
- Special effects: Freeze ❄️, Burn 🔥, Heal 💚, Boost ⚡
- Visual scaling from 5 to 500+ emojis per second
- Winner determined by HP depletion

## 📁 Key Files

- `src/models/Card.ts` - Core card system and interfaces
- `tests/unit/Card.test.ts` - Card system unit tests
- `config/game/game.config.json` - Game configuration
- `docs/specifications/game-specification.md` - Full game design
- `docs/architecture/system-architecture.md` - Technical architecture

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript 5
- **Build Tool**: Vite 5
- **State Management**: Zustand 4
- **Animations**: Framer Motion 11
- **Testing**: Vitest + Playwright
- **Package Manager**: npm

## 📈 Development Status

### ✅ Completed
- Project structure initialization
- SPARC methodology setup
- Card system models
- Basic test framework
- Game configuration

### 🚧 In Progress
- Card collection UI
- Deck builder interface
- Combat engine
- Visual effects system

### 📋 Planned
- Multiplayer support
- Trading system
- Tournament mode
- Mobile optimization

## 🤖 For AI Agents

**⚠️ IMPORTANT**: All AI agents must read [AGENT_WORKFLOW_GUIDE.md](./AGENT_WORKFLOW_GUIDE.md) before contributing.

**Current Workflow Score: 90/100 (Grade A)**

Quick commands for agents:
```bash
# Check workflow compliance
npm run workflow:score

# Create task branch (REQUIRED)
git checkout -b task/your-task-name

# Validate before commit
npm run validate

# If stuck on main with changes
npm run workflow:migrate
```

## 🤝 Contributing

This project uses the Claude-Flow orchestration system. Please follow the SPARC methodology when contributing:

1. Create specifications first
2. Write tests before implementation
3. Keep files under 500 lines
4. Use TypeScript strict mode
5. Follow the established architecture
6. **NEW**: Always work on task branches (never on main)

## 📝 Documentation

- [Game Specification](docs/specifications/game-specification.md)
- [System Architecture](docs/architecture/system-architecture.md)
- [SPARC Workflow](CLAUDE.md)

## 📄 License

MIT License - See LICENSE file for details

## 🎉 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser to `http://localhost:3000`
5. Start collecting cards and building your deck!

---

**Remember**: The goal is to create visual chaos that scales from simple to spectacular! 🚀✨
