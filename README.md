# 🎮 The Meme Wars - Emoji Trading Card Game

> A trading card game where emoji cards battle in explosive bullet-hell combat!

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd the-meme-wars

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 What's in This Repository

This repository contains **ONLY the application code**. All development tools and local configurations must be set up individually by each developer.

### ✅ Versioned (in Git)
- `/src` - Application source code
- `/tests` - Application tests
- `/public` - Static assets
- `/config` - Game configuration files
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Build config
- `.gitignore` - Git ignore rules
- `.gitattributes` - Git attributes
- `.editorconfig` - Editor config
- `docs/CLAUDE.md` - Development workflow reference

### ❌ NOT Versioned (Local Setup)
- `archon/` - Task management system
- `.claude/` - Claude configuration
- `.claude-flow/` - Claude Flow files
- `memory/` - AI memory files
- `tasks/` - Task tracking
- `.vscode/` - VS Code settings
- `*.local.*` - Any local config files
- Development databases
- Python scripts

## 🛠️ Project Structure

```
the-meme-wars/
├── src/                    # Application code
│   ├── components/         # React components
│   ├── services/           # Business logic
│   │   └── RollService.ts  # Card rolling system
│   ├── stores/             # State management
│   ├── types/              # TypeScript types
│   └── data/               # Game data
│       └── cards/          # Card definitions by rarity
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   └── e2e/               # E2E tests
├── config/                 # Game configuration
│   └── game/
│       └── roll.config.json
└── public/                 # Static assets
```

## 🎯 Features

- **7 Rarity Tiers**: Common to Cosmic
- **Pity System**: Guaranteed rare cards
- **Multi-Roll**: 10x and 100x options
- **Type-Safe**: Full TypeScript
- **Tested**: Unit + E2E tests

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests (requires Playwright)
npx playwright test

# Type checking
npm run typecheck
```

## 💻 Local Development Setup

Each developer needs to set up their own local development environment. These tools are NOT included in the repository.

### Optional: Archon (Task Management)
```bash
# Create archon directory
mkdir archon
cd archon

# Set up your own Archon instance
# See: https://github.com/your-archon-setup
```

### Optional: Claude Flow (AI Workflow)
```bash
# Install globally
npm install -g claude-flow@alpha

# Or use npx
npx claude-flow@alpha --version
```

### Optional: VS Code Settings
Create your own `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 📝 Development Workflow

See `docs/CLAUDE.md` for the complete SPARC methodology and development workflow.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Commit Convention
```bash
feat: Add new feature
fix: Fix bug
test: Add tests
docs: Update documentation
refactor: Refactor code
style: Format code
```

## 📄 License

MIT

---

**Note**: This is a clean repository containing only application code. Each developer must set up their own local development tools and configurations.
