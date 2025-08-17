# 🚀 Getting Started with The Meme Wars TCG Development

## 📋 Current Project Status

The project is in **MVP Phase 1** with critical refactoring needed before new feature development. 

### ⚠️ Critical Issues to Address First

1. **Dual Card Model System** - Two parallel card systems exist (Card.ts and card.ts)
2. **Duplicate State Management** - gameStore and rollStore have overlapping responsibilities
3. **Missing Combat System** - Core gameplay mechanic not implemented

## 🎯 Immediate Priorities (In Order)

### 1️⃣ CRITICAL: Unify Card Data Models
**Task ID:** `e923a6ec313da21c`  
**Time Estimate:** 2-3 days  
**Files to Modify:**
- `src/models/Card.ts`
- `src/types/card.ts`
- `src/services/RollService.ts`
- `src/services/CardService.ts`

**Approach:**
1. Create new unified model at `src/models/unified/Card.ts`
2. Implement adapter pattern for backward compatibility
3. Migrate existing code incrementally
4. Remove old models once migration complete

### 2️⃣ CRITICAL: Consolidate Store Architecture
**Task ID:** `199e14eb6453d09e`  
**Time Estimate:** 1 day  
**Dependencies:** Unify Card Data Models must be complete  
**Files to Modify:**
- `src/stores/gameStore.ts`
- `src/stores/rollStore.ts`
- Create: `src/stores/index.ts`

**Approach:**
1. Use Zustand slices pattern
2. Implement immer for immutability
3. Add persistence middleware
4. Ensure DevTools integration

### 3️⃣ HIGH: Implement Combat System
After the critical refactoring is complete, implement the combat system in this order:

1. **Combat Arena Component** (Task: `9e4e9a89b054420c`)
2. **Emoji Projectile System** (Task: `9e8f0f92f8e2b700`)
3. **Collision Detection** (Task: `6c8c43ec02b33732`)
4. **HP/Damage System** (Task: `a9b013ace8904679`)

## 🛠️ Development Workflow

### For AI Agents

1. **Check available tasks:**
   ```bash
   node scripts/tasks/init-tasks.cjs
   ```

2. **View task details:**
   Look in `tasks/task-{id}.json` for complete context

3. **Working on a task:**
   - Read all acceptance criteria
   - Check the `context.suggestedApproach` field
   - Review `context.files` for files to modify
   - Run tests after implementation

4. **Key Context for Each Task:**
   - `userStory`: The why behind the task
   - `acceptanceCriteria`: What must be completed
   - `context.testScenarios`: How to verify completion
   - `context.risks`: What to watch out for

### For Human Developers

1. **Setup:**
   ```bash
   npm install
   npm run dev
   ```

2. **View current tasks:**
   Check `roadmap.md` for current priorities

3. **Task files:**
   Each task has detailed requirements in `tasks/` directory

## 📁 Project Structure

```
src/
├── models/          # Data models (needs unification)
│   ├── Card.ts      # Complex card model (to merge)
│   └── unified/     # New unified models go here
├── types/           
│   └── card.ts      # Simple card model (to merge)
├── services/        # Business logic
│   ├── RollService.ts
│   └── CardService.ts
├── stores/          # State management (needs consolidation)
│   ├── gameStore.ts
│   └── rollStore.ts
├── components/      # React components
│   ├── screens/     # Main screens
│   ├── combat/      # Combat components (to create)
│   └── roll/        # Roll system components
└── data/           # Card data by rarity
```

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run typecheck       # Check TypeScript

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests

# Task Management
node scripts/tasks/init-tasks.cjs  # View/create tasks

# Code Quality
npm run lint            # Check code style
npm run format          # Format code
```

## 🔧 Technical Guidelines

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` types

### React
- Use functional components with hooks
- Implement React.memo for performance
- Use useCallback and useMemo appropriately

### State Management
- Use Zustand for global state
- Keep component state local when possible
- Implement proper TypeScript types for all stores

### Performance
- Target 60 FPS for animations
- Implement virtual scrolling for large lists
- Use code splitting for routes

## 📊 Success Metrics

### For MVP Completion
- [ ] 15 playable cards minimum
- [ ] Working combat system
- [ ] 5-minute average game session
- [ ] No critical bugs
- [ ] All CRITICAL tasks complete
- [ ] Core HIGH priority tasks complete

## 🐛 Known Issues

1. **RollScreen.tsx** is 558 lines - needs to be split into smaller components
2. **Performance** - Animations not optimized with useMemo
3. **No Tests** - Critical services lack unit tests

## 📚 Resources

- **Roadmap:** `roadmap.md`
- **Task Details:** `tasks/` directory
- **Architecture Decisions:** Check task contexts for approach recommendations
- **Card Data:** `src/data/cards/` organized by rarity

## 🤝 Contributing

1. Start with CRITICAL priority tasks
2. Follow the acceptance criteria exactly
3. Write tests for new code
4. Update documentation as you go
5. Check dependencies before starting a task

## ⚠️ Important Notes

- **DO NOT** start new features until critical refactoring is complete
- **DO NOT** create new card models - unify existing ones first
- **ALWAYS** check task dependencies before starting work
- **ALWAYS** run TypeScript checks before committing

## 🎮 Game Vision

The Meme Wars TCG combines:
- Strategic deck building
- Real-time bullet-hell combat
- Emoji-based projectiles
- Unique visual style

The goal is to create an innovative TCG that stands out through its unique combat mechanics and meme-inspired aesthetic.

---

**Last Updated:** August 17, 2024  
**Next Review:** When critical tasks are complete
