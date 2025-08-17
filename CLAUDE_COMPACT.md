# 🚀 CLAUDE.md - Complete Development Workflow

## 🔴 CRITICAL: CONCURRENT EXECUTION MANDATORY

### ⚡ THE ONLY RULE: "1 MESSAGE = ALL OPERATIONS"
**Violations = 2.8-4.4x slower + 32% more tokens + Project failure**

```javascript
// ✅ CORRECT - Everything in ONE message:
[CONCURRENT]:
  TodoWrite { 10+ tasks }
  Create ALL directories
  Write/Edit ALL files (even 50+)
  Execute ALL commands
  Update ALL status
  Git commit and push

// ❌ WRONG - Sequential messages = VIOLATION
```

## 🎮 Emoji Mayhem TCG Project

### Archon MCP Integration
- **Project ID**: `196233ba-fbac-4ada-b0f9-37658c0e73ea`
- **Archon UI**: http://localhost:3737
- **API**: http://localhost:8181/api/projects/{id}
- **Docs**: http://localhost:8181/docs

### Quick Commands
```bash
# Development
npm run dev          # Start game (port 3000)
npm test            # Run tests
npm run build       # Build production

# Archon (ports: 3737, 8181, 8051, 8052)
cd archon && docker-compose up -d
powershell scripts/sync-archon-tasks.ps1 -Action status

# SPARC
npx claude-flow sparc tdd "feature"
npx claude-flow@alpha swarm_init --topology mesh
npx claude-flow@alpha agent_spawn --type coder
```

## 📋 Task Modules Status

| Module | Progress | Tasks |
|--------|----------|-------|
| **CARDS** | 0/49 | Common(10), Uncommon(10), Rare(10), Epic(8), Legendary(6), Mythic(4), Cosmic(1) |
| **SERVICES** | 1/4 | ✅CardService, ⏳DeckService, CombatEngine, ProgressionService |
| **UI** | 1/4 | ✅RollScreen, ⏳DeckBuilder, CombatScreen, CollectionView |

## 💻 Complete Working Example

```javascript
// ENTIRE FEATURE IN ONE MESSAGE:
[CONCURRENT]:
  // 1. Todos (5-10+ required)
  TodoWrite { todos: [
    {id: "1", content: "Design feature", priority: "high"},
    {id: "2", content: "Create models", priority: "high"},
    {id: "3", content: "Build UI", priority: "high"},
    {id: "4", content: "Write tests", priority: "medium"},
    {id: "5", content: "Documentation", priority: "low"}
  ]}
  
  // 2. ALL directories at once
  mkdir -p src/{components,models,services} tests config
  
  // 3. ALL files together (even 50+)
  Write "src/models/Feature.ts" [complete content]
  Write "src/components/Feature.tsx" [complete content]
  Write "tests/Feature.test.ts" [complete content]
  Edit "src/App.tsx" [add imports]
  
  // 4. ALL commands chained
  npm install && npm test && npm run build
  
  // 5. Git operations
  git add . && git commit -m "feat: complete feature" && git push
```

## ⚠️ Common Violations & Solutions

| Violation | Impact | Solution |
|-----------|--------|----------|
| Sequential files | 2.8-4.4x slower | Batch ALL in one message |
| Multiple npm commands | Wasted tokens | Chain with && |
| Separate git ops | Lost context | Single command chain |
| Individual todos | No tracking | TodoWrite with 5-10+ |

## 📁 Project Structure

```
/src          # Source code
├── components/   # React components
├── models/       # TypeScript models
├── services/     # Business logic
└── stores/       # Zustand state
/tests        # Test files  
/docs         # Documentation
/config       # Configuration
/archon       # Task management
└── tasks/        # Task tracking
/scripts      # Utilities
```

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript 5, Zustand
- **Animation**: Framer Motion
- **Build**: Vite
- **Testing**: Vitest
- **Archon**: Docker containers

## 📊 Key Files

### Documentation
- `/QUICKSTART.md` - Getting started
- `/archon/ARCHON_INTEGRATION.md` - MCP setup
- `/docs/WORKFLOW_VIOLATION_REPORT.md` - Violations
- `/archon/tasks/PROJECT_STATUS.md` - Progress

### Task Structure
```
archon/tasks/
├── archon-project-tasks.json
└── modules/
    ├── cards/task-*.md
    ├── services/task-*.md
    └── ui/task-*.md
```

## 🎯 Workflow Checklist

Before ANY task:
- [ ] ONE message for ALL operations
- [ ] TodoWrite with 5+ tasks
- [ ] ALL files created/edited together
- [ ] Commands chained with &&
- [ ] Task status updated in Archon
- [ ] Git commit after changes

## 📝 Git Commit Format

```bash
feat(scope): description    # New feature
fix(scope): description     # Bug fix
docs(scope): description    # Documentation
test(scope): description    # Tests

# Example:
git add . && git commit -m "feat(cards): Add 10 Common cards" && git push
```

## 🔴 Violation Protocol

If sequential execution detected:
1. **STOP IMMEDIATELY**
2. Create `/docs/WORKFLOW_VIOLATION_REPORT.md`
3. Document violation with impact
4. Update `/archon/tasks/` tracking
5. **Never repeat the violation**

## ⚡ Performance Metrics
- Concurrent execution: **2.8-4.4x faster**
- Token reduction: **32% less**
- File size limit: **<15KB per file**
- Test coverage target: **>90%**

## 🔗 Resources
- Claude-Flow: https://github.com/ruvnet/claude-flow
- Game: http://localhost:3000
- Archon: http://localhost:3737
- API Docs: http://localhost:8181/docs

---

### 🏆 THE GOLDEN RULES
1. **1 MESSAGE = ALL OPERATIONS** (No exceptions)
2. **NEVER save to root folder** (Use subdirectories)
3. **File size <15KB** (Split if larger)
4. **TodoWrite 5-10+ tasks** (Always batch)
5. **Chain ALL commands with &&** (Single execution)

**Remember**: Sequential = Slow = Failure
**Always**: Concurrent = Fast = Success
