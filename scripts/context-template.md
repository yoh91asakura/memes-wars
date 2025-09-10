# 🎮 CLAUDE.md - Memes Wars AI Agent Guide

<!-- AUTO-GENERATED CONTEXT - PLACEHOLDER -->
<!-- END AUTO-GENERATED CONTEXT -->

## 🎯 Project Overview
**Memes Wars** - Auto-battler RNG Card Game (30s-2min loop)  
**Stack**: React 18 + TypeScript + Vite + Zustand  
**Status**: Core game loop COMPLETE ✅

## 📁 Quick Navigation
```
memes-wars/
├── STATUS.md            # 📊 Project status & metrics
├── README.md            # 🎮 Game description & quickstart
├── specs/               # 📋 All specifications & tasks
│   ├── 001-extract-current-project/  # ✅ Game implementation
│   ├── 004-refactor-all-the/        # 🔄 AI optimization
│   └── 005-complete-card-management/ # 🔧 Card management system
├── src/                 # 💻 Source code (Atomic Design)
└── tests/              # 🧪 Constitutional test order
```

## 🔍 Where to Find Information

### Game Mechanics & Implementation
→ `specs/001-extract-current-project/spec.md` - Requirements  
→ `specs/001-extract-current-project/contracts/` - Service APIs  
→ `src/services/` - Implementation files  
→ `src/components/pages/CombatPage/` - Core game loop

### AI Development Workflow  
→ `specs/005-complete-card-management/` - Card management system (CURRENT)
→ `scripts/` - Spec-kit automation tools  
→ `tests/` - TDD workflow (contract → integration → e2e)

### Current Tasks & Status
→ `STATUS.md` - Quick project overview  
→ `specs/005-complete-card-management/tasks.md` - Active implementation tasks

## 🛠️ Essential Commands
```bash
# Development
npm run dev              # Start game (localhost:3000)
npm run test:watch       # TDD mode
npm run test:e2e         # Full E2E suite

# Context Management (AUTO-SYNC)
npm run context:update   # Update context automatically
npm run context:watch    # Watch for changes and auto-update

# Spec-Kit Workflow
specify create "feature" # New feature spec
specify start           # Generate implementation plan
specify validate        # Check prerequisites
```

## 🤖 Auto-Context Detection

The system automatically detects:
- **Current spec** from Git branch name
- **Active tasks** from specs/*/tasks.md
- **Progress status** from completed markers
- **Recent changes** in codebase

**Manual Update**: Run `npm run context:update` to sync context immediately.
**Watch Mode**: Run `npm run context:watch` for continuous monitoring.

## 📋 Working With Specs
1. Read `specs/*/spec.md` for requirements
2. Check `specs/*/tasks.md` for current work
3. Follow TDD: Contract → Integration → E2E
4. Context updates automatically after changes
5. Update STATUS.md after major milestones

## 🔗 Key References
- Game Status: `STATUS.md`
- Game Info: `README.md`
- Active Specs: `specs/005-complete-card-management/` (AUTO-DETECTED)
- Service Contracts: `specs/*/contracts/`
- Historical Context: `docs/CLAUDE_ARCHIVE.md`

---
*Refactored for optimal AI agent performance with auto-context detection | Archive: docs/CLAUDE_ARCHIVE.md*