# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 🎮 Project Overview

**The Meme Wars** is an emoji trading card game with bullet-hell combat mechanics. Players collect cards with emoji-based projectiles and engage in real-time battles. The project is a modern React/TypeScript application with ambitious plans for multiplayer functionality.

**Current Status**: Phase 1 (Foundation) - Focus on code unification and architecture solidification

## 🚀 Development Commands

### Essential Commands
```bash
# Start development server
npm run dev                    # http://localhost:3000

# Build and validation
npm run build                  # Production build
npm run typecheck              # TypeScript validation  
npm run lint                   # ESLint checking
npm run lint:fix              # Auto-fix linting issues
npm run format                 # Prettier formatting
npm run validate              # Run typecheck + lint + tests

# Testing
npm run test                   # Run unit tests (Vitest)
npm run test:watch            # Watch mode for tests
npm run test:coverage         # Test coverage report
npm run test:e2e              # End-to-end tests (Playwright)
npm run test:e2e:ui           # Playwright UI mode
```

### Task Management System
```bash
# Task management (V3 file-based system)
npm run task                   # Interactive CLI
ls tasks/active/              # View active tasks
grep -r "Priority.*HIGH" tasks/active/  # Find high priority tasks

# Git workflow (one branch per task)
git checkout -b task/TASK-XXX-description
git push -u origin task/TASK-XXX-description
```

## 🏗️ High-Level Architecture

### Current Architecture Pattern
The codebase follows a **feature-based architecture** with clear separation of concerns:

```
src/
├── components/          # UI Components (moving toward Atomic Design)
│   ├── cards/          # Card-related components
│   ├── combat/         # Battle system components  
│   ├── roll/           # Card rolling system
│   └── screens/        # Page-level components
├── models/             # TypeScript data models
│   ├── Card.ts         # Core card system (legacy)
│   └── unified/        # New unified models (transition in progress)
├── services/           # Business logic layer
│   ├── RollService.ts  # Card rolling mechanics
│   ├── CombatEngine.ts # Battle system
│   └── CardService.ts  # Card management
├── data/               # Static game data
│   └── cards/          # Card definitions by rarity
├── stores/             # State management (Zustand)
└── providers/          # React context providers
```

### Critical Architectural Principles

**1. Unified Card Model Transition** 
- Legacy `models/Card.ts` exists alongside new `models/unified/Card.ts`
- **CRITICAL**: All new development must use unified models
- Migration from old system is highest priority task

**2. Service Layer Pattern**
- Business logic isolated in services
- Components are thin presentation layers  
- Services are singleton instances with clear interfaces

**3. Configuration-Driven Game Logic**
- Drop rates, pity system, and game balance in `config/game/roll.config.json`
- Easily adjustable without code changes
- Animation timings and effects configurable

**4. Type Safety First**
- Strict TypeScript configuration
- Path aliases configured (`@components/*`, `@services/*`, etc.)
- Custom types for all game entities

### State Management Strategy
- **Primary**: Zustand for client state
- **Pattern**: Feature-based stores with clear boundaries
- **Persistence**: Local storage for game progress
- **Future**: WebSocket integration for multiplayer

## 🔧 Development Guidelines

### File Organization Rules
- **NO files in root directory** - always use appropriate subdirectories
- Follow existing naming conventions: `PascalCase` for components, `camelCase` for utilities
- Place tests adjacent to source files or in dedicated `tests/` directories

### Path Aliases (Vite + TypeScript)
```typescript
// Use these imports consistently:
import { Card } from '@models/unified/Card';
import { RollService } from '@services/RollService';
import { Button } from '@components/atoms/Button';
```

### Testing Strategy
- **Unit Tests**: Vitest for services and utilities
- **Component Tests**: React Testing Library patterns
- **E2E Tests**: Playwright for critical user flows
- **Target Coverage**: >80% for services, >60% for components

### Performance Considerations
- Card collection can grow large - implement virtualization early
- Combat system will render many projectiles - object pooling required
- Bundle size target: <5MB gzipped
- 60 FPS target for combat animations

## 🎯 Current Development Priorities

### Sprint 1 Focus: Architecture Unification
1. **CRITICAL**: Complete card model unification (Task #e923a6ec313da21c)
2. **CRITICAL**: Migrate all card data files to unified format
3. **HIGH**: Update all services to use unified models
4. **HIGH**: Update components for unified models
5. **MEDIUM**: Consolidate store architecture

### Known Technical Debt
- Dual card model systems causing confusion
- Missing test coverage for critical paths
- Some components tightly coupled to old card format
- Performance issues with large card collections

### Development Patterns
- **Concurrent Execution**: Batch all related operations in single commits
- **Branch per Task**: One Git branch per task with format `task/TASK-XXX-description`
- **Documentation**: Update task files in `tasks/active/` as work progresses

## 🚨 Critical Development Rules (from CLAUDE.md)

### 🚨 TASKS-FIRST RULE - MANDATORY

**BEFORE ANYTHING ELSE, for ANY task scenario:**

1. **INITIALIZE** → Check that task system is ready
2. **USE** → Local task management as PRIMARY SYSTEM
3. **SYNCHRONIZE** → GitHub for collaboration and versioning
4. **CREATE IF NOT EXISTS** → New task only if absent from system

### ⚠️ MANDATORY WORKFLOW CHECK
```bash
# 1. READ CURRENT STATE (mandatory before any action)
cat tasks/PROJECT_STATUS.md | head -30

# 2. CHECK ACTIVE TASKS
npm run task
# Choose "2. List all tasks"

# 3. IDENTIFY YOUR TASK
grep -r "Status.*TODO" tasks/active/
grep -r "Priority.*HIGH" tasks/active/
```

### 🔒 ANTI-CONFLICT PROTOCOL (Multi-Agent)

**CRITICAL RULES:**
1. **ALWAYS** check status before taking a task
2. **NEVER** work on "in-progress" task of another agent
3. **IMMEDIATELY** lock task (status "in-progress" + create branch)
4. **IF CONFLICT** → choose another task
5. **ONE BRANCH PER TASK** → complete work isolation

### 🔐 Mandatory Locking Sequence
```bash
# 1. ALWAYS sync with main first
git checkout main && git pull origin main

# 2. Verify task is available
npm run task
# If status != "todo" → STOP, choose another task

# 3. Create branch for task
git checkout -b task/[task-id]-[short-description]

# 4. Lock in task system
# Edit tasks/active/TASK-XXX-description.md:
# - **Status**: IN_PROGRESS
# - **Assignee**: [Your Name]
# - Add to Updates Log: YYYY-MM-DD - IN_PROGRESS - [Name] - Starting

# 5. Push branch and status change
git add tasks/active/TASK-*.md
git commit -m "chore: start task [id] - [title]"
git push -u origin task/[task-id]-[short-description]
```

### 🚨 CONCURRENT EXECUTION - GOLDEN RULE

**ABSOLUTELY MANDATORY:**
- **1 MESSAGE = ALL RELATED OPERATIONS**
- **NEVER** save working files in root folder
- **ALWAYS** organize files in appropriate subdirectories
- **VIOLATIONS** will be tracked and reported

### ⚡ MANDATORY PATTERNS:
- **Batch ALL file operations** in ONE message
- **Batch ALL commands** in ONE message
- **VIOLATIONS = PROJECT FAILURE**
  - Loss of 2.8-4.4x speed improvement
  - +32% token usage

### Task Management Integration
- **ALWAYS** check `tasks/PROJECT_STATUS.md` before starting work
- Create task files in `tasks/active/TASK-XXX-description.md` for new features
- Update task status and progress regularly (every 2h if in-progress)
- Use the interactive CLI: `npm run task`

### Status Progression (MANDATORY with Tracking)
```
todo → in-progress → review → done
     ↓
   blocked (if dependency)
```

### Code Quality Gates
- All commits must pass `npm run validate`
- New features require unit tests
- Components must be TypeScript strict
- No `console.log` statements in production code
- Performance regression testing for combat-related changes

### Critical Files to Understand
- `src/models/unified/Card.ts` - New unified card interface (use this)
- `src/services/RollService.ts` - Core game mechanics
- `config/game/roll.config.json` - Game balance configuration
- `tasks/PROJECT_STATUS.md` - Real-time project status

## 🔮 Future Architecture Plans

The codebase is transitioning toward:
- **Microservice Architecture**: Separate game, auth, and economy services
- **Real-time Multiplayer**: WebSocket-based combat
- **Advanced Rendering**: WebGL for smooth projectile rendering  
- **Progressive Web App**: Offline functionality with service workers
- **Module Federation**: Feature-based micro-frontends

### Performance Targets
- **Load Time**: <3 seconds initial
- **Combat Performance**: 60 FPS with 100+ projectiles  
- **Bundle Size**: <5MB gzipped
- **Test Coverage**: >80%
- **Lighthouse Score**: >90

## 🛠️ Debugging and Development Tools

### Local Development
- Vite dev server with HMR on port 3000
- TypeScript strict mode enabled
- ESLint + Prettier configured
- Path aliases for clean imports

### Browser DevTools Integration
- React DevTools for component debugging
- Zustand DevTools for state inspection
- Performance profiler for 60 FPS validation

### Common Development Tasks
```bash
# Check current project status
cat tasks/PROJECT_STATUS.md | head -50

# Find and work on a task  
npm run task
# or manually:
grep -r "Status.*TODO" tasks/active/
code tasks/active/TASK-XXX-description.md

# Test specific features
npm run test -- Card.test.ts
npm run test:e2e -- tests/card-rolling.spec.ts

# Performance analysis
npm run build && npx serve dist
# Then use Lighthouse or WebPageTest
```

## 🐝 MCP Swarm Capabilities (from CLAUDE-SWARM.md)

### Available MCP Tools
If MCP (Model Context Protocol) is available, you have access to advanced swarm orchestration:

```bash
# Check MCP availability
npm run mcp:status

# MCP Swarm operations
npm run mcp:swarm                    # Launch Claude Flow
npm run mcp:hooks:pre-task          # Pre-task coordination hook
npm run mcp:hooks:post-task         # Post-task coordination hook
```

### 🎯 Swarm Coordination Tools
- `swarm_init` - Setup multi-agent topology coordination
- `agent_spawn` - Create specialized cognitive patterns
- `task_orchestrate` - Coordinate complex workflows
- `swarm_status` - Monitor swarm efficiency
- `memory_usage` - Persistent cross-agent memory

### 🚨 **SWARM GOLDEN RULE - CONCURRENT EXECUTION**

**ABSOLUTELY MANDATORY when using MCP Swarm:**
- **1 MESSAGE = ALL SWARM OPERATIONS**
- **Batch ALL agent spawning** in single message
- **Batch ALL task orchestration** together
- **NEVER sequential operations** after swarm init

### ⚡ Swarm Pattern Example
```javascript
// ✅ CORRECT: Everything in ONE message
[Single Message]:
  - swarm_init { topology: "hierarchical", maxAgents: 5, strategy: "parallel" }
  - agent_spawn { type: "architect", name: "System Designer" }
  - agent_spawn { type: "coder", name: "Frontend Dev" }
  - agent_spawn { type: "coder", name: "Backend Dev" }
  - agent_spawn { type: "tester", name: "QA Engineer" }
  - task_orchestrate { task: "Build feature", strategy: "parallel" }
  - memory_usage { action: "store", key: "project/init" }
```

### 🧠 **MCP vs Standard Development**

**With MCP Available:**
- Use swarm coordination for complex multi-feature development
- Leverage specialized agents (architect, coder, tester, analyst)
- Memory coordination between agents for consistency
- Real-time monitoring and performance tracking

**Without MCP (Standard Mode):**
- Use task-based workflow from CLAUDE.md patterns
- Manual task assignment and tracking
- Single-agent development with branch-per-task
- Standard Git workflow with PR reviews

### 📊 Performance Benefits with MCP Swarm
- **84.8%** SWE-Bench solve rate
- **32.3%** token reduction
- **2.8-4.4x** speed improvement
- **27+** neural models available

### 🔐 Mandatory Agent Hooks
Each spawned agent MUST use coordination hooks:
```bash
# Before starting work
npx claude-flow@alpha hooks pre-task --description "[task]"

# During work (for important decisions)
npx claude-flow@alpha hooks post-edit --file "[file]"

# After completing work  
npx claude-flow@alpha hooks post-task --task-id "[task]"
```

This project uses the SPARC methodology (Specification, Pseudocode, Architecture, Refinement, Completion) and emphasizes concurrent development patterns. Always batch related file operations and maintain the task management system for optimal collaboration.

**Detection Strategy**: Try MCP swarm first for complex tasks, fallback to standard task-based workflow if MCP unavailable.
