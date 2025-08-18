# 🐝 CLAUDE-SWARM - Guide Orchestration Multi-Agents

## 📋 Table des Matières
1. [🚨 RÈGLES CRITIQUES SWARM](#1-règles-critiques-swarm)
2. [⚙️ CONFIGURATION MCP SWARM](#2-configuration-mcp-swarm)
3. [🔄 WORKFLOW SWARM PRINCIPAL](#3-workflow-swarm-principal)
4. [⚡ PATTERNS CONCURRENT SWARM](#4-patterns-concurrent-swarm)
5. [🛠️ OUTILS MCP DISPONIBLES](#5-outils-mcp-disponibles)
6. [📊 MONITORING & TÉLÉMÉTRIE](#6-monitoring--télémétrie)
7. [🎯 EXEMPLES PRATIQUES](#7-exemples-pratiques)
8. [📚 RÉFÉRENCES RAPIDES SWARM](#8-références-rapides-swarm)

---

# 1. 🚨 RÈGLES CRITIQUES SWARM

## 🚨 **CONCURRENT EXECUTION - RÈGLE ABSOLUE**

**OBLIGATOIRE après initialisation swarm :**
- **1 MESSAGE = TOUTES OPÉRATIONS LIÉES**
- **TodoWrite** → Batch 5-10+ todos en UN call
- **Task spawning** → Spawn TOUS agents en UN message  
- **File operations** → Batch TOUTES lectures/écritures
- **JAMAIS d'opérations séquentielles** après init swarm

### ⚡ **GOLDEN RULE SWARM**
```javascript
// ✅ CORRECT: Tout en UN message
[Single Message]:
  - mcp__claude-flow__swarm_init
  - mcp__claude-flow__agent_spawn (5+ agents)
  - TodoWrite { todos: [10+ todos] }
  - Task("Agent 1 avec coordination complète")
  - Task("Agent 2 avec coordination complète")
  - Read/Write/Bash (toutes opérations)
```

### ❌ **VIOLATIONS = ÉCHEC SWARM**
```javascript
// ❌ WRONG: Messages multiples (JAMAIS!)
Message 1: swarm_init
Message 2: agent_spawn
Message 3: TodoWrite (1 todo)
Message 4: Task(single agent)
// Perte 6x performance!
```

## 🎯 **CLAUDE CODE = SEUL EXÉCUTEUR**

### ✅ **Claude Code Gère TOUT :**
- **ALL file operations** (Read, Write, Edit, MultiEdit, Bash)
- **ALL code generation** et programming
- **ALL TodoWrite** et task management
- **ALL git operations** (commit, push, merge)
- **ALL implementation work**

### 🧠 **MCP Tools = COORDINATION SEULEMENT :**
- **Coordination planning** - Organiser les actions de Claude Code
- **Memory management** - Stocker contexte/décisions
- **Performance tracking** - Monitoring efficacité
- **Swarm orchestration** - Coordonner instances multiples
- **GitHub integration** - Coordination repository avancée

## 🔐 **PROTOCOLE COORDINATION OBLIGATOIRE**

### **Chaque Agent DOIT :**
1. **AVANT** → `npx claude-flow@alpha hooks pre-task --description "[task]"`
2. **PENDANT** → `npx claude-flow@alpha hooks post-edit --file "[file]"`
3. **MÉMOIRE** → `npx claude-flow@alpha hooks notify --message "[decision]"`
4. **APRÈS** → `npx claude-flow@alpha hooks post-task --task-id "[task]"`

---

# 2. ⚙️ CONFIGURATION MCP SWARM

## 🚀 **Setup Rapide (Stdio MCP)**
```bash
# Ajouter Claude Flow MCP server
claude mcp add claude-flow npx claude-flow@alpha mcp start

# Vérifier installation
npm run mcp:status
```

## 🎯 **Configuration Agent Count**
```javascript
// Auto-décision basée sur complexité
function determineAgentCount(task) {
  if (task.includes(['API', 'database', 'auth', 'tests'])) return 8
  if (task.includes(['frontend', 'backend'])) return 6
  if (task.includes(['simple', 'script'])) return 3
  return 5 // default
}
```

---

# 3. 🔄 WORKFLOW SWARM PRINCIPAL

## 🚨 **PATTERN SWARM OBLIGATOIRE**

### **ÉTAPE 1: SPAWN PARALLÈLE IMMÉDIAT (UN MESSAGE!)**
```javascript
[BatchTool Message 1]:
  // MCP Coordination Setup
  - mcp__claude-flow__swarm_init { 
      topology: "hierarchical", 
      maxAgents: AUTO_DECIDE_OR_CLI_ARGS,
      strategy: "parallel" 
    }
  
  // Spawn TOUS les agents ensemble
  - mcp__claude-flow__agent_spawn { type: "architect", name: "System Designer" }
  - mcp__claude-flow__agent_spawn { type: "coder", name: "API Developer" }
  - mcp__claude-flow__agent_spawn { type: "analyst", name: "DB Designer" }
  - mcp__claude-flow__agent_spawn { type: "tester", name: "QA Engineer" }
  - mcp__claude-flow__agent_spawn { type: "coordinator", name: "PM" }
  
  // Orchestration
  - mcp__claude-flow__task_orchestrate { task: "main task", strategy: "parallel" }
  - mcp__claude-flow__memory_usage { action: "store", key: "init", value: {...} }
```

### **ÉTAPE 2: EXÉCUTION PARALLÈLE CLAUDE CODE (UN MESSAGE!)**
```javascript
[BatchTool Message 2]:
  // Spawn agents avec coordination complète
  - Task("You are architect agent. MANDATORY hooks: pre-task, post-edit, post-task. Task: Design system architecture")
  - Task("You are coder agent. MANDATORY hooks: pre-task, post-edit, post-task. Task: Implement API endpoints")
  - Task("You are tester agent. MANDATORY hooks: pre-task, post-edit, post-task. Task: Write comprehensive tests")
  
  // TodoWrite avec TOUS les todos
  - TodoWrite { todos: [
      {id: "design", content: "Design architecture", status: "in_progress", priority: "high"},
      {id: "implement", content: "Build API", status: "pending", priority: "high"},
      {id: "test", content: "Write tests", status: "pending", priority: "medium"},
      {id: "docs", content: "Documentation", status: "pending", priority: "low"},
      {id: "deploy", content: "Setup CI/CD", status: "pending", priority: "medium"}
    ]}
  
  // File operations parallèles
  - Write "src/models/index.ts"
  - Write "src/services/api.ts" 
  - Write "tests/unit/api.test.ts"
  - Bash "mkdir -p src/{models,services,tests}"
```

---

# 4. ⚡ PATTERNS CONCURRENT SWARM

## 📊 **Visual Task Tracking Format**
```
📊 Swarm Progress Overview
   ├── Total Tasks: 8
   ├── ✅ Completed: 2 (25%)
   ├── 🔄 In Progress: 4 (50%)
   ├── ⭕ Todo: 2 (25%)
   └── 🐝 Agents Active: 5/5

🐝 Swarm Status: ACTIVE
├── 🏗️ Topology: hierarchical
├── 👥 Agents: 5/5 active
├── ⚡ Mode: parallel execution
├── 📊 Tasks: 8 total (2 done, 4 progress, 2 pending)
└── 🧠 Memory: 12 coordination points

Agent Activity:
├── 🟢 architect: Designing database schema...
├── 🟢 coder-1: Implementing auth endpoints...
├── 🟢 analyst: Optimizing performance...
├── 🟡 tester: Waiting for auth completion...
└── 🟢 coordinator: Monitoring progress...
```

## 🔄 **Memory Coordination Pattern**
```javascript
// Stockage décisions importantes
mcp__claude-flow__memory_usage {
  action: "store",
  key: "swarm-{id}/agent-{name}/{step}",
  value: {
    timestamp: Date.now(),
    decision: "what was decided",
    implementation: "what was built",
    nextSteps: ["step1", "step2"],
    dependencies: ["dep1", "dep2"]
  }
}

// Récupération données coordination
mcp__claude-flow__memory_usage {
  action: "retrieve", 
  key: "swarm-{id}/agent-{name}/{step}"
}
```

---

# 5. 🛠️ OUTILS MCP DISPONIBLES

## 🎯 **Coordination Tools**
- `mcp__claude-flow__swarm_init` - Setup topology coordination
- `mcp__claude-flow__agent_spawn` - Créer patterns cognitifs
- `mcp__claude-flow__task_orchestrate` - Coordonner workflows complexes

## 📊 **Monitoring Tools** 
- `mcp__claude-flow__swarm_status` - Monitoring efficacité
- `mcp__claude-flow__agent_metrics` - Performance tracking
- `mcp__claude-flow__swarm_monitor` - Tracking temps réel

## 🧠 **Memory & Neural Tools**
- `mcp__claude-flow__memory_usage` - Mémoire persistante
- `mcp__claude-flow__neural_train` - Améliorer patterns
- `mcp__claude-flow__neural_patterns` - Analyser approches

## 🐙 **GitHub Integration Tools (NEW!)**
- `mcp__claude-flow__github_swarm` - Swarms GitHub spécialisés
- `mcp__claude-flow__repo_analyze` - Analyse repository IA
- `mcp__claude-flow__pr_enhance` - Améliorations PR IA
- `mcp__claude-flow__code_review` - Code review automatisé

---

# 6. 📊 MONITORING & TÉLÉMÉTRIE

## ✅ **Token Tracking Réel (Alpha-89)**
```bash
# Setup télémétrie
./claude-flow analysis setup-telemetry

# Mode non-interactif avec tracking
./claude-flow swarm "task" --non-interactive

# Rapport utilisation
./claude-flow analysis token-usage --breakdown --cost-analysis

# Monitoring temps réel
./claude-flow analysis claude-monitor
```

## 📈 **Bénéfices Performance**
- **84.8%** SWE-Bench solve rate
- **32.3%** réduction tokens  
- **2.8-4.4x** amélioration vitesse
- **27+** modèles neuraux
- **GitHub automation** - Gestion repository streamlinée

---

# 7. 🎯 EXEMPLES PRATIQUES

## 🚀 **Exemple: Full-Stack App Development**

**Task:** "Build complete REST API with auth, database, and tests"

```javascript
// ✅ CORRECT: SINGLE MESSAGE avec TOUTES opérations
[BatchTool Message 1]:
  // Initialize et spawn TOUS agents ensemble
  mcp__claude-flow__swarm_init { topology: "hierarchical", maxAgents: 8, strategy: "parallel" }
  mcp__claude-flow__agent_spawn { type: "architect", name: "System Designer" }
  mcp__claude-flow__agent_spawn { type: "coder", name: "API Developer" }
  mcp__claude-flow__agent_spawn { type: "coder", name: "Auth Expert" }
  mcp__claude-flow__agent_spawn { type: "analyst", name: "DB Designer" }
  mcp__claude-flow__agent_spawn { type: "tester", name: "Test Engineer" }

  // Update TOUS todos à la fois - JAMAIS split!
  TodoWrite { todos: [
    { id: "design", content: "Design API architecture", status: "in_progress", priority: "high" },
    { id: "auth", content: "Implement authentication", status: "pending", priority: "high" },
    { id: "db", content: "Design database schema", status: "pending", priority: "high" },
    { id: "api", content: "Build REST endpoints", status: "pending", priority: "high" },
    { id: "tests", content: "Write comprehensive tests", status: "pending", priority: "medium" },
    { id: "docs", content: "Document API endpoints", status: "pending", priority: "low" },
    { id: "deploy", content: "Setup deployment pipeline", status: "pending", priority: "medium" }
  ]}

  // Start orchestration
  mcp__claude-flow__task_orchestrate { task: "Build REST API", strategy: "parallel" }
  mcp__claude-flow__memory_usage { action: "store", key: "project/init", value: { started: Date.now() } }

[BatchTool Message 2]:
  // Créer TOUS directories à la fois
  Bash("mkdir -p api-app/{src,tests,docs,config}")
  Bash("mkdir -p api-app/src/{models,routes,middleware,services}")
  
  // Write TOUS base files à la fois
  Write("api-app/package.json", packageJsonContent)
  Write("api-app/.env.example", envContent)
  Write("api-app/src/server.js", serverContent)
  Write("api-app/src/config/database.js", dbConfigContent)
  
  // Run multiple commands
  Bash("cd api-app && npm install")
  Bash("cd api-app && npm test")
```

---

# 8. 📚 RÉFÉRENCES RAPIDES SWARM

## 🚀 **Commandes Essentielles Swarm**
```bash
# MCP Swarm Operations
npm run mcp:swarm                    # Lance Claude Flow
npm run mcp:status                   # Vérifier MCP servers
npm run mcp:hooks:pre-task          # Hook pré-tâche
npm run mcp:hooks:post-task         # Hook post-tâche

# Claude Flow Direct
npx claude-flow@alpha swarm "task"   # Swarm mode
npx claude-flow@alpha --agents 6    # Specify agent count
```

## ⚡ **Performance Tips**
- **Batch Everything** - Jamais opérer sur fichier unique si multiples nécessaires
- **Parallel First** - Toujours penser "que peut s'exécuter simultanément?"
- **Memory is Key** - Utiliser memory pour TOUTE coordination cross-agent
- **Monitor Progress** - `swarm_monitor` pour tracking temps réel
- **Auto-Optimize** - Laisser hooks gérer topologie et sélection agents

## 📋 **Checklist Validation Swarm**
- [ ] **TOUS agents spawned** en UN message ?
- [ ] **TodoWrite contient 5+ todos** en UN call ?
- [ ] **TOUTES file operations** concurrent ?
- [ ] **Hooks coordination** dans chaque agent ?
- [ ] **Memory usage** pour cross-agent coordination ?

---

## 🔴 **RÈGLES ABSOLUES - RAPPEL FINAL**

1. **CONCURRENT EXECUTION** → 1 message = toutes opérations swarm
2. **SWARM COORDINATION** → MCP coordinate, Claude Code execute  
3. **AGENT HOOKS** → pre-task, post-edit, post-task OBLIGATOIRES
4. **MEMORY COORDINATION** → Stocker TOUTES décisions importantes
5. **BATCH EVERYTHING** → TodoWrite, Task spawning, File ops en parallel
6. **NEVER SEQUENTIAL** → Après swarm init, TOUT doit être concurrent

**REMEMBER:** Swarm MCP coordinate workflows, Claude Code executes with CONCURRENT pattern!

---

*Guide reformaté selon standards CLAUDE.md - Intégration MCP Swarm complète*
