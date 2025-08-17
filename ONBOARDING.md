# 🚀 ONBOARDING GUIDE - The Meme Wars TCG

Welcome to The Meme Wars TCG project! This guide will help you get up to speed quickly.

## 📋 Quick Start Checklist

- [ ] Clone the repository
- [ ] Read PROJECT_STATUS.md
- [ ] Review ROADMAP.md
- [ ] Install dependencies (`npm install`)
- [ ] Run the project (`npm run dev`)
- [ ] Check current tasks (`npm run tasks:list`)
- [ ] Read CONTRIBUTING.md
- [ ] Join the discussion (if applicable)

## 🎯 Project Context

### What is The Meme Wars TCG?
A unique trading card game that combines:
- **Strategic deck building** with collectible cards
- **Real-time bullet hell combat** using emoji projectiles
- **Meme culture** inspiration for cards and abilities
- **Web-based** for easy accessibility

### Current State
- **Phase:** MVP Development
- **Progress:** ~15% complete
- **Priority:** Card system and combat engine
- **Stack:** TypeScript, React, Vite, Zustand

## 🛠️ Development Setup

### Prerequisites
```bash
# Required
- Node.js 18+ 
- npm or yarn
- Git
- VS Code (recommended)

# Optional but helpful
- GitHub account
- Playwright (for e2e tests)
```

### Initial Setup
```bash
# Clone the repo
git clone [repo-url]
cd "The Meme Wars"

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Check code quality
npm run typecheck
npm run lint
```

## 📊 Understanding the Codebase

### Project Structure
```
The Meme Wars/
├── src/                 # Source code
│   ├── components/      # React components
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── stores/         # State management (Zustand)
│   └── utils/          # Utilities
├── tests/              # Test files
├── tasks/              # Task management
│   ├── tasks.json      # Current tasks
│   └── modules/        # Task documentation
├── docs/               # Documentation
└── config/             # Configuration files
```

### Key Files to Review
1. **PROJECT_STATUS.md** - Current state and progress
2. **ROADMAP.md** - Future plans and milestones
3. **tasks/tasks.json** - Active tasks and assignments
4. **CLAUDE.md** - AI agent workflow guide
5. **package.json** - Scripts and dependencies

## 🎮 How to Contribute

### 1. Find a Task
```bash
# List all available tasks
npm run tasks:list

# Show only TODO tasks
npm run tasks:list --status todo

# Show high priority tasks
npm run tasks:list --priority high
```

### 2. Claim a Task
```bash
# Update task status and assign to yourself
node scripts/tasks/update.js [task-id] --status in-progress --assignee "YourName"
```

### 3. Create a Branch
```bash
# Always branch from main
git checkout main
git pull origin main
git checkout -b task/[task-id]-[short-description]

# Example
git checkout -b task/4-implement-card-model
```

### 4. Work on the Task
- Follow the coding standards in CONTRIBUTING.md
- Write tests for new features
- Keep commits focused and descriptive
- Push regularly to your branch

### 5. Submit for Review
```bash
# Final commit and push
git add .
git commit -m "feat: complete task #[task-id] - [description]"
git push origin task/[task-id]-[description]

# Update task status
node scripts/tasks/update.js [task-id] --status review

# Create Pull Request on GitHub
# Title: "Task #[id]: [Description]"
# Link the task in PR description
```

## 🏗️ Architecture Overview

### Frontend Architecture
- **React** for UI components
- **TypeScript** for type safety
- **Zustand** for state management
- **Vite** for build tooling
- **Framer Motion** for animations

### Game Systems
1. **Card System** - Managing card data and interactions
2. **Combat Engine** - Real-time bullet hell mechanics
3. **Deck Management** - Building and saving decks
4. **UI System** - Menus, HUD, and displays

### Data Flow
```
User Input → React Components → Zustand Store → Game Logic → UI Update
```

## 🧪 Testing Strategy

### Test Types
- **Unit Tests:** Individual functions and components
- **Integration Tests:** System interactions
- **E2E Tests:** Complete user flows

### Running Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Watch mode for development
npm run test:watch
```

## 📚 Key Concepts to Understand

### 1. Card System
- Cards have rarity levels (Common, Rare, Epic, Legendary)
- Each card has unique abilities and stats
- Cards spawn emoji projectiles in combat

### 2. Combat System
- Real-time bullet hell mechanics
- Players dodge emoji projectiles
- Strategic ability timing
- Combo system for bonus damage

### 3. Deck Building
- Minimum 20 cards per deck
- Maximum 3 copies of any card
- Mana/energy cost balancing

## 🔧 Development Workflow

### Daily Workflow
1. Check PROJECT_STATUS.md for updates
2. Review your assigned tasks
3. Pull latest changes from main
4. Work on your feature branch
5. Submit PR when ready
6. Update task status

### Communication
- Use PR comments for code discussions
- Update task status regularly
- Document any blockers
- Ask questions early

## 🚨 Common Issues & Solutions

### Issue: Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Type errors
```bash
# Check TypeScript errors
npm run typecheck
```

### Issue: Tests failing
```bash
# Run specific test file
npm run test -- [filename]
```

## 📖 Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Vite Documentation](https://vitejs.dev)

### Project Links
- GitHub Repository: [link]
- Issue Tracker: [link]
- Discord/Slack: [link]

## 🎯 Your First Tasks

### Beginner-Friendly Tasks
1. Add a new common card
2. Improve UI component styling
3. Write tests for existing features
4. Update documentation

### Learning Path
1. **Week 1:** Understand codebase and architecture
2. **Week 2:** Complete first small task
3. **Week 3:** Take on medium complexity task
4. **Week 4:** Contribute to core systems

## 💡 Tips for Success

1. **Ask Questions** - No question is too small
2. **Document Everything** - Help future contributors
3. **Test Your Code** - Prevent regressions
4. **Small PRs** - Easier to review and merge
5. **Communicate** - Update task status and blockers

## 🤝 Getting Help

### Where to Get Help
1. Check existing documentation
2. Search closed issues/PRs
3. Ask in project chat
4. Create an issue for bugs
5. Tag maintainers for urgent items

### Code Review Process
- All code requires review before merge
- Address feedback promptly
- Be open to suggestions
- Learn from review comments

## 🎊 Welcome Aboard!

You're now ready to contribute to The Meme Wars TCG! Start with small tasks to familiarize yourself with the codebase, and gradually take on more complex features.

Remember: Every contribution matters, from fixing typos to implementing major features!

---

*Questions? Check CONTRIBUTING.md or reach out to the team!*
