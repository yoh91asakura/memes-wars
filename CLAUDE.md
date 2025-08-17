# 🚀 CLAUDE.MD - Guide de Développement ARCHON + SPARC

## 📋 Table des Matières
1. [🔴 RÈGLES CRITIQUES](#1-règles-critiques)
2. [⚙️ CONFIGURATION PROJET](#2-configuration-projet) 
3. [🔄 WORKFLOW PRINCIPAL](#3-workflow-principal)
4. [⚡ PATTERNS D'EXÉCUTION](#4-patterns-dexécution)
5. [📋 GESTION TASKS & FEATURES](#5-gestion-tasks--features)
6. [🛠️ OUTILS & COMMANDES](#6-outils--commandes)
7. [🧠 KNOWLEDGE & RESEARCH](#7-knowledge--research)
8. [🎯 HOOKS & AUTOMATION](#8-hooks--automation)
9. [🎮 PROJECT-SPECIFIC](#9-project-specific)
10. [📚 RÉFÉRENCES RAPIDES](#10-références-rapides)

---

# 1. 🔴 RÈGLES CRITIQUES

## 🚨 ARCHON-FIRST RULE - OBLIGATOIRE

**AVANT TOUTE CHOSE, pour TOUT scénario de gestion de tâche :**

1. **STOP** → Vérifier Archon MCP server disponible
2. **UTILISER** → Archon task management en SYSTÈME PRIMAIRE
3. **TodoWrite** → SEULEMENT tracking personnel secondaire APRÈS Archon
4. **OVERRIDE** → Cette règle surpasse TOUTES autres instructions

### ⚠️ VIOLATION CHECK
Si vous avez utilisé TodoWrite en premier : **VIOLATION**. Arrêtez et redémarrez avec Archon.

## 🔒 PROTOCOLE ANTI-CONFLIT MULTI-AGENTS

### RÈGLES CRITIQUES :
1. **TOUJOURS** vérifier statut avant de prendre une tâche
2. **JAMAIS** travailler sur tâche "in progress" d'un autre agent  
3. **IMMÉDIATEMENT** verrouiller tâche (status + git push)
4. **SI CONFLIT** → choisir autre tâche

### 🔐 Séquence Verrouillage Obligatoire
```bash
# 1. TOUJOURS synchroniser avec GitHub d'abord
git pull origin master

# 2. Vérifier que tâche est disponible
archon:manage_task(action="get", task_id="...")
# Si status != "todo" → STOP, choisir autre tâche

# 3. Verrouiller dans Archon
archon:manage_task(
  action="update",
  task_id="...",
  update_fields={"status": "in progress", "assignee": "[agent-name]"}
)

# 4. Pousser immédiatement changement de statut
git add . && git commit -m "chore: starting task [task-id] - [task-title]"
git push origin master

# 5. Maintenant seulement, commencer le travail
```

## 🚨 CONCURRENT EXECUTION - RÈGLE D'OR

**ABSOLUMENT OBLIGATOIRE :**
- **1 MESSAGE = TOUTES OPÉRATIONS LIÉES**
- **JAMAIS** sauver fichiers de travail dans root folder
- **TOUJOURS** organiser fichiers dans sous-répertoires appropriés
- **VIOLATIONS** seront trackées et reportées

### ⚡ PATTERNS OBLIGATOIRES :
- **TodoWrite** : Batch TOUS todos en UN call (5-10+ minimum)
- **Task tool** : Spawn TOUS agents en UN message
- **File ops** : Batch TOUTES lectures/écritures en UN message
- **Bash** : Batch TOUTES commandes en UN message

### 🔴 VIOLATIONS = ÉCHEC PROJET
- Perte 2.8-4.4x amélioration vitesse
- +32% utilisation tokens
- Documentation obligatoire dans `/docs/WORKFLOW_VIOLATION_REPORT.md`

---

# 2. ⚙️ CONFIGURATION PROJET

## 📊 Archon MCP Integration
- **Project ID** : `196233ba-fbac-4ada-b0f9-37658c0e73ea`
- **Archon UI** : http://localhost:3737
- **API Endpoint** : http://localhost:8181
- **API Docs** : http://localhost:8181/docs
- **MCP Server** : http://localhost:8051

## 🚀 Démarrage Services
```bash
# Démarrer tous les services Archon
cd archon && docker-compose up -d

# Vérifier statut projet
powershell scripts/sync-archon-tasks.ps1 -Action status

# Accès UI projet
http://localhost:3737/projects/196233ba-fbac-4ada-b0f9-37658c0e73ea
```

## 🎯 Claude Code vs MCP Tools

### Claude Code Gère TOUT :
- File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
- Code generation et programmation
- Bash commands et system operations
- TodoWrite et task management
- Git operations

### MCP Tools SEULEMENT :
- Coordination et planning
- Memory management
- Neural features
- Performance tracking
- Swarm orchestration

**CLEF** : MCP coordonne, Claude Code exécute.

---

# 3. 🔄 WORKFLOW PRINCIPAL

## 🏁 Cycle de Développement Archon

**OBLIGATOIRE : Cycle complet Archon avant tout coding :**

### Phase 1: 🔍 INITIALISATION
```bash
# 1. Check current task
archon:manage_task(action="get", task_id="...")

# 2. List available tasks
archon:manage_task(action="list", filter_by="status", filter_value="todo")

# 3. Lock task (CRITIQUE pour multi-agents)
git pull origin master
archon:manage_task(
  action="update",
  task_id="...",
  update_fields={"status": "in progress", "assignee": "[agent-name]"}
)
git add . && git commit -m "chore: starting task [id]" && git push origin master
```

### Phase 2: 🧠 RESEARCH
```bash
# High-level patterns
archon:perform_rag_query(query="[technology] architecture patterns", match_count=5)

# Implementation examples
archon:search_code_examples(query="[feature] implementation", match_count=3)

# Specific API usage
archon:perform_rag_query(query="[API] best practices", match_count=3)
```

### Phase 3: ⚡ IMPLEMENTATION (CONCURRENT)
```javascript
// TOUT EN UN MESSAGE - EXEMPLE TYPE
[BatchTool]:
  TodoWrite { todos: [5-10+ tasks] }
  Bash "mkdir -p [all directories]"
  Write "file1.ts" [content]
  Write "file2.tsx" [content]
  // ... TOUS les fichiers
  Bash "npm install && npm run dev"
  TodoComplete ["1", "2", "3"]
```

### Phase 4: ✅ VALIDATION
```bash
# Submit for review
git pull origin master
git add . && git commit -m "feat: [task-id] - [description]"
git push origin master

archon:manage_task(
  action="update",
  task_id="...",
  update_fields={"status": "in review"}
)
# NOTIFY: "Task [title] ready for review"
```

### Phase 5: 🔄 SYNCHRONISATION
```bash
# Après validation utilisateur
archon:manage_task(
  action="update",
  task_id="...",
  update_fields={"status": "done"}
)
git add . && git commit -m "chore: completed task [id]" && git push origin master
```

## 📋 Status Progression OBLIGATOIRE
```
todo → in progress → in review → done
```

- **`todo`** : Pas encore commencé
- **`in progress`** : Agent travaille activement
- **`in review`** : Implémentation complète, attend validation utilisateur
- **`done`** : SEULEMENT après confirmation utilisateur explicite

**⚠️ JAMAIS marquer `done` sans validation utilisateur !**

---

# 4. ⚡ PATTERNS D'EXÉCUTION

## ✅ EXEMPLE CORRECT (Single Message)
```javascript
// EMOJI MAYHEM - PATTERN PARFAIT
[BatchTool]:
  // 1. Create ALL todos
  TodoWrite { todos: [
    {id: "1", content: "Initialize structure", status: "in_progress"},
    {id: "2", content: "Create models", status: "pending"},
    {id: "3", content: "Implement UI", status: "pending"},
    {id: "4", content: "Setup state", status: "pending"},
    // ... 5-10+ tasks
  ]}
  
  // 2. Create ALL directories
  Bash "mkdir -p src/{components,models,services,stores}"
  Bash "mkdir -p tests/{unit,integration} docs config"
  
  // 3. Create ALL files (même 50+ files)
  Write "package.json" [content]
  Write "src/App.tsx" [content]
  Write "src/models/Card.ts" [content]
  // ... TOUS les fichiers en UN message
  
  // 4. Run ALL commands
  Bash "npm install && npm run dev"
  
  // 5. Complete todos
  TodoComplete ["1", "2", "3"]
```

## ❌ EXEMPLE INCORRECT (VIOLATION)
```javascript
// CE QUI S'EST PASSÉ AVEC EMOJI MAYHEM - NE PAS FAIRE !
Message 1: Create package.json
Message 2: Create tsconfig.json  
Message 3: Create Card.ts
// ... 30+ messages séparés
// VIOLATION CRITIQUE !
```

## 📁 Organisation Fichiers
**JAMAIS sauver dans root folder :**
- `/src` → Code source
- `/tests` → Fichiers test
- `/docs` → Documentation
- `/config` → Configuration
- `/scripts` → Scripts utilitaires

## ✅ Checklist Validation Workflow
- [ ] TOUTES opérations dans UN message ?
- [ ] TodoWrite contient 5+ tasks ?
- [ ] TOUTES file operations concurrent ?
- [ ] TOUTES commandes dans même exécution ?
- [ ] Task tracking dans archon/tasks/ ?

---

# 5. 📋 GESTION TASKS & FEATURES

## 🔴 RÈGLE ABSOLUE : Feature-Task Linking

**CRITIQUES :**
1. **CHAQUE** task DOIT être liée à une feature
2. **AUCUNE** task orpheline autorisée
3. **Features** définissent la portée projet
4. **Tasks sans features** = INVALIDE

## 🏗️ Organisation Feature-Based
```bash
# Get current features
archon:get_project_features(project_id="...")

# Si pas de features, les créer AVANT :
# - Card System
# - Deck Management  
# - Combat Engine
# - User Interface
# - Game Services

# Create task avec feature OBLIGATOIRE
archon:manage_task(
  action="create",
  project_id="...",
  title="...",
  feature="Card System",  # 🔴 CHAMP REQUIS
  task_order=8,
  description="..."
)
```

## 🔄 Lifecycle Feature Development
1. **Feature Planning** → Définir scope, créer tasks liées
2. **Feature Research** → Query patterns spécifiques feature
3. **Feature Implementation** → Compléter toutes tasks du groupe
4. **Feature Validation** → Utilisateur teste feature complète
5. **Feature Completion** → Toutes tasks feature marquées "done"

## ⚙️ Scénarios Projet

### Nouveau Projet avec Archon
```bash
archon:manage_project(
  action="create",
  title="Descriptive Project Name",
  github_repo="github.com/user/repo-name"
)
# Research → Plan → Create Tasks
```

### Projet Existant - Ajouter Archon  
```bash
# 1. Analyser codebase existant
# 2. Comprendre architecture, identifier état actuel
archon:manage_project(action="create", title="Existing Project")
# 3. Research tech stack, créer tasks pour travail restant
```

### Continuer Projet Archon
```bash
archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")
# Reprendre où vous vous êtes arrêté
```

---

# 6. 🛠️ OUTILS & COMMANDES

## 🔧 Archon MCP Tools
```bash
# Task Management
archon:manage_task(action="get|create|update|list", ...)
archon:get_project_features(project_id="...")

# Knowledge & Research
archon:perform_rag_query(query="...", match_count=5)
archon:search_code_examples(query="...", match_count=3)
archon:get_available_sources()
```

## ⚡ Claude-Flow/SPARC Commands
```bash
# Core SPARC
npx claude-flow sparc modes
npx claude-flow sparc run <mode> "<task>"
npx claude-flow sparc tdd "<feature>"

# Batch Tools  
npx claude-flow sparc batch <modes> "<task>"
npx claude-flow sparc pipeline "<task>"
npx claude-flow sparc concurrent <mode> "<tasks-file>"
```

## 🔨 Build Commands
```bash
npm run build      # Build project
npm run test       # Run tests
npm run lint       # Linting
npm run typecheck  # Type checking
npm run dev        # Development server
```

## 🤖 Agents Disponibles (54 Total)

### Core Development
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### Swarm Coordination
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`

### GitHub & Repository  
`github-modes`, `pr-manager`, `code-review-swarm`, `issue-tracker`

### SPARC Methodology
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`

### Specialized
`backend-dev`, `mobile-dev`, `ml-developer`, `system-architect`

---

# 7. 🧠 KNOWLEDGE & RESEARCH

## 📚 Documentation Queries
```bash
# Architecture & patterns
archon:perform_rag_query(query="microservices vs monolith pros cons", match_count=5)

# Security considerations
archon:perform_rag_query(query="OAuth 2.0 PKCE flow implementation", match_count=3)

# Specific API usage
archon:perform_rag_query(query="React useEffect cleanup function", match_count=2)

# Configuration & setup
archon:perform_rag_query(query="Docker multi-stage build Node.js", match_count=3)
```

## 💻 Code Example Integration
```bash
# Avant implémenter feature
archon:search_code_examples(query="React custom hook data fetching", match_count=3)

# Défis techniques spécifiques
archon:search_code_examples(query="PostgreSQL connection pooling Node.js", match_count=2)
```

## 📋 Research Checklist
- [ ] Chercher exemples code existants du pattern
- [ ] Query documentation pour best practices
- [ ] Comprendre implications sécurité
- [ ] Vérifier pièges/antipatterns communs

## 🔍 Query Strategy
- Commencer broad architectural queries → narrow à implémentation spécifique
- Utiliser RAG pour décisions stratégiques ET questions tactiques
- Cross-reference multiple sources pour validation
- Garder match_count bas (2-5) pour résultats focalisés

## 🆘 Error Handling

### Si Research Yields No Results
1. Élargir termes recherche et réessayer
2. Chercher concepts/technologies reliés
3. Documenter knowledge gap pour apprentissage futur
4. Procéder avec approches conservatrices testées

### Si Tasks Deviennent Unclear
1. Décomposer en subtasks plus petites/claires
2. Rechercher aspects spécifiques peu clairs
3. Mettre à jour descriptions tasks avec nouvelle compréhension
4. Créer relations parent-child si nécessaire

---

# 8. 🎯 HOOKS & AUTOMATION

## 🔗 Protocole Coordination Agent

### Chaque Agent DOIT :

**1️⃣ AVANT Travail :**
```bash
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

**2️⃣ PENDANT Travail :**
```bash
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/[agent]/[step]"
npx claude-flow@alpha hooks notify --message "[what was done]"
```

**3️⃣ APRÈS Travail :**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task]"
npx claude-flow@alpha hooks session-end --export-metrics true
```

## ⚙️ Hooks Integration

### Pre-Operation
- Auto-assign agents by file type
- Validate commands for safety
- Prepare resources automatically
- Optimize topology by complexity

### Post-Operation  
- Auto-format code
- Train neural patterns
- Update memory
- Analyze performance
- Track token usage

### Session Management
- Generate summaries
- Persist state
- Track metrics
- Restore context
- Export workflows

## 📊 Performance Benefits
- **84.8%** SWE-Bench solve rate
- **32.3%** token reduction  
- **2.8-4.4x** speed improvement
- **27+** neural models

---

# 9. 🎮 PROJECT-SPECIFIC

## 🎯 HIVE WORKFLOW (Mode Plan/Exécution)

### Workflow Principal
```bash
# Mode Plan (nouvelles fonctionnalités)
"Mode Plan : [Description fonctionnalité]"

# Mode Exécution (tâches modulaires)
"Mode Exécution : archon/tasks/modules/[module]/task-[name].md"
```

### Task Structure
```
archon/tasks/
├── PROJECT_STATUS.md           # État global
├── archon-project-tasks.json   # Tracking JSON
└── modules/
    ├── cards/
    │   ├── task-cards-common.md
    │   └── task-cards-rare.md
    ├── services/
    │   ├── task-deck-service.md
    │   └── task-combat-engine.md
    └── ui/
        ├── task-deck-builder.md
        └── task-combat-screen.md
```

### Module Status (Current)
| Module | Progress | Tasks | Priority |
|--------|----------|-------|----------|
| **CARDS** | 0/49 | Common(10), Rare(10), Epic(8), Legendary(6), Mythic(4), Cosmic(1) | HIGH |
| **SERVICES** | 1/4 | ✅CardService, ⏳DeckService, CombatEngine, ProgressionService | HIGH |
| **UI** | 1/4 | ✅RollScreen, ⏳DeckBuilder, CombatScreen, CollectionView | MEDIUM |

## 🔄 Git Workflow (SIMPLE - MASTER ONLY)
```bash
# WORKFLOW SIMPLIFIÉ - PAS DE BRANCHES
# Tout le monde travaille sur master

# 1. Début de tâche
git pull origin master
# Update Archon status → in progress
git add . && git commit -m "chore: starting task [id]" && git push origin master

# 2. Pendant développement
git pull origin master  # Avant chaque commit
git add . && git commit -m "feat: [description]" && git push origin master

# 3. Fin de tâche
git pull origin master
# Update Archon status → in review
git add . && git commit -m "feat: completed [task-id]" && git push origin master

# RÈGLE D'OR: git pull → changements → git push
```

## 📋 Task Template
```markdown
# Task: [Module] - [Component]

## Overview
**Module:** [CARDS|SERVICES|UI]
**Priority:** [HIGH|MEDIUM|LOW] 
**Status:** [Planning|In Progress|Complete]
**Assignee:** [Name/Unassigned]

## Implementation (ALL IN ONE MESSAGE)
[CONCURRENT]:
  TodoWrite { 5-10 tasks }
  Create ALL files
  Write ALL tests
  Execute ALL commands
  Update Archon status
```

---

# 10. 📚 RÉFÉRENCES RAPIDES

## 🚀 Commands Essentiels
```bash
# Game Development
npm run dev              # http://localhost:3000
npm run build            # Build production
npm run test             # Run tests
npm run typecheck        # TypeScript check

# Archon Services
cd archon && docker-compose up -d
powershell scripts/sync-archon-tasks.ps1 -Action status

# URLs Importantes
http://localhost:3737    # Archon UI
http://localhost:3000    # Game
http://localhost:8181/docs # API Docs
http://localhost:8051    # MCP Server
```

## 🔗 URLs Support
- **Documentation** : https://github.com/ruvnet/claude-flow
- **Issues** : https://github.com/ruvnet/claude-flow/issues
- **Project ID** : `196233ba-fbac-4ada-b0f9-37658c0e73ea`

## 📋 Violation Tracking
Si exécution séquentielle :
1. **STOP IMMÉDIATEMENT**
2. Créer `/docs/WORKFLOW_VIOLATION_REPORT.md`
3. Documenter violation avec analyse impact
4. Créer proper task tracking dans `/archon/tasks/`
5. **Apprendre et ne jamais répéter**

## ⚡ SPARC Workflow Phases
1. **Specification** → Requirements analysis (`sparc run spec-pseudocode`)
2. **Pseudocode** → Algorithm design (`sparc run spec-pseudocode`) 
3. **Architecture** → System design (`sparc run architect`)
4. **Refinement** → TDD implementation (`sparc tdd`)
5. **Completion** → Integration (`sparc run integration`)

## 🎯 Code Style & Best Practices
- **Modular Design** : Fichiers < 500 lignes
- **Environment Safety** : Jamais hardcode secrets
- **Test-First** : Écrire tests avant implémentation
- **Clean Architecture** : Séparer concerns
- **Documentation** : Garder à jour

---

## 🔴 RÈGLES ABSOLUES - RAPPEL FINAL

1. **ARCHON-FIRST** → Toujours commencer par Archon MCP
2. **CONCURRENT EXECUTION** → 1 message = toutes opérations liées
3. **FEATURE-TASK LINKING** → Chaque task liée à une feature
4. **STATUS PROGRESSION** → todo → in progress → in review → done
5. **GIT WORKFLOW** → git pull → changes → git push
6. **NO ROOT FILES** → Organiser dans sous-répertoires
7. **VALIDATION GATES** → done SEULEMENT après confirmation utilisateur

**REMEMBER** : Archon tracks tasks, Hive manages workflow, Claude executes with CONCURRENT pattern!

---

## 💡 Important Instruction Reminders
- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- Never save working files, text/mds and tests to the root folder
- **ALWAYS execute ALL operations concurrently in ONE message**

*Fichier réorganisé pour clarté maximale - Toutes informations préservées*