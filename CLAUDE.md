# 🚀 CLAUDE.MD - Guide de Développement TASKS + SPARC + GITHUB

## 📚 RÉFÉRENCES CONDITIONNELLES

**Si besoin de :**
- 🎯 **Taskmaster détaillé** → `docs/TASKMASTER.md`
- 🏗️ **Architecture web/sécurité** → `docs/architecture/system-architecture.md`
- 📊 **Roadmap/phases** → `docs/ROADMAP.md`
- 🎮 **Specs jeu** → `docs/specifications/game-specification.md`

---

## 📋 Table des Matières
1. [🔴 RÈGLES CRITIQUES](#1-règles-critiques)
2. [⚙️ CONFIGURATION PROJET](#2-configuration-projet)
3. [🔄 WORKFLOW PRINCIPAL](#3-workflow-principal)
4. [⚡ PATTERNS D'EXÉCUTION](#4-patterns-dexécution)
5. [🛠️ OUTILS & COMMANDES](#5-outils--commandes)
6. [📚 RÉFÉRENCES RAPIDES](#6-références-rapides)

---

# 1. 🔴 RÈGLES CRITIQUES

## 🚨 TASKMASTER-FIRST RULE - OBLIGATOIRE

**AVANT TOUTE CHOSE, pour TOUT scénario de gestion de tâche :**

1. **INITIALISER** → Vérifier que taskmaster est prêt
2. **UTILISER** → Taskmaster MCP en SYSTÈME PRIMAIRE
3. **SYNCHRONISER** → GitHub pour collaboration et versioning
4. **TodoWrite** → Pour tracking personnel complémentaire

### ⚠️ WORKFLOW CHECK - SYNCHRONISATION CRITIQUE
```bash
# 1. LIRE L'ÉTAT ACTUEL (obligatoire avant toute action)
npm run taskmaster:list

# 2. VÉRIFIER LES TÂCHES ACTIVES
npm run taskmaster:active

# 3. VOIR TÂCHES PRIORITAIRES
npm run taskmaster:critical
npm run taskmaster:high

# 4. VOIR STATISTIQUES PROJET
npm run taskmaster:stats
```

### ⚡ Task Management Simplifié
- **NPM Scripts** : Remplacement des longues commandes MCP par des scripts npm simples
- **Workflows Optimisés** : Suppression des timeouts et des commandes complexes
- **Documentation Consolidée** : Sections dupliquées fusionnées pour plus de clarté

### 🎯 Nouveaux Scripts NPM Disponibles
```bash
npm run taskmaster:list         # Lister toutes les tâches
npm run taskmaster:stats        # Statistiques du projet
npm run taskmaster:todo         # Tâches à faire
npm run taskmaster:active       # Tâches en cours
npm run taskmaster:critical     # Tâches critiques
npm run taskmaster:high         # Tâches haute priorité
npm run taskmaster:check        # Vérification santé système
npm run taskmaster:init         # Initialisation taskmaster
```

## 🆕 PROTOCOLE DEMANDE UTILISATEUR

### Quand l'utilisateur demande quelque chose :

**1. VÉRIFIER D'ABORD** → Lister les tâches existantes
```bash
npm run taskmaster:list
npm run taskmaster:todo
npm run taskmaster:high
```

**2. SI TÂCHE N'EXISTE PAS** → L'agent crée nouvelle tâche
```bash
# L'agent utilise npm script pour créer une tâche :
npm run taskmaster:add -- \
  --title "[Task Title]" \
  --description "[Detailed description]" \
  --priority "[critical|high|medium|low]" \
  --size "[XS|S|M|L|XL]" \
  --epic "[epic-name]" \
  --tags "[tag1,tag2,tag3]"

# Résultat: tâche créée dans taskmaster avec ID unique
```

**3. ORGANISER LE TRAVAIL** → L'agent assigne et priorise
```bash
# L'agent met à jour via taskmaster:
task-master-ai update_task \
  --taskId [task-id] \
  --status "in-progress" \
  --assignee "[Agent Name]" \
  --priority "high" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# L'agent commit les changements:
git add .
git commit -m "chore: assign task [id] to [Agent]"
```

**4. CRÉER BRANCHE GIT** → Une branche par tâche
```bash
git checkout main && git pull
git checkout -b task/[task-id]-[short-description]
# Pattern: task/[TASK-ID]-[short-description]
```

**5. SYNCHRONISER AVEC GITHUB** → Pull Request workflow
```bash
# Commits réguliers sur la branche
git add . && git commit -m "feat: task [id] - [description]"
git push origin task/[task-id]-[description]

# Créer PR quand prêt pour review
# Mettre à jour le statut de la tâche via taskmaster
mcp task-master-ai update_task \
  --taskId [task-id] \
  --status "review" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

### 🔄 Tags Disponibles pour Organisation
- **frontend** - Interface utilisateur et composants
- **backend** - Logique serveur et APIs
- **database** - Schémas et requêtes
- **testing** - Tests unitaires et intégration
- **documentation** - Guides et références
- **bug** - Corrections de bugs
- **feature** - Nouvelles fonctionnalités
- **refactor** - Amélioration du code existant

## 🔒 PROTOCOLE ANTI-CONFLIT MULTI-AGENTS

### RÈGLES CRITIQUES :
1. **TOUJOURS** vérifier statut avant de prendre une tâche
2. **JAMAIS** travailler sur tâche "in-progress" d'un autre agent
3. **IMMÉDIATEMENT** verrouiller tâche (status "in-progress" + créer branche)
4. **SI CONFLIT** → choisir autre tâche
5. **UNE BRANCHE PAR TÂCHE** → isolation complète du travail

### 🔐 Séquence Verrouillage Obligatoire
```bash
# 1. TOUJOURS synchroniser avec main d'abord
git checkout main
git pull origin main

# 2. Vérifier que tâche est disponible
npm run taskmaster:list
# Si status != "todo" et != "backlog" → STOP, choisir autre tâche

# 3. Créer branche pour la tâche
git checkout -b task/[task-id]-[short-description]
# Exemple: git checkout -b task/1-roll-service

# 4. Verrouiller dans le système de tâches
task-master-ai update_task --taskId [id] --status "in-progress" --assignee "[agent-name]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 5. Pousser branche et changement de statut
git add . && git commit -m "chore: starting task [task-id] - [task-title]"
git push -u origin task/[task-id]-[short-description]

# 6. Maintenant seulement, commencer le travail sur la branche
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

## 📊 TASKMASTER System - MODERN MCP-BASED

**📋 Pour taskmaster détaillé → voir `docs/TASKMASTER.md`**

### 🔄 WORKFLOW OBLIGATOIRE - Synchronisation État

#### AVANT TOUTE ACTION - Lire l'état actuel:
```bash
# 1. TOUJOURS commencer par vérifier l'état global avec taskmaster
npm run taskmaster:list

# 2. Voir les statistiques du projet
npm run taskmaster:stats

# 3. Filtrer les tâches spécifiques
npm run taskmaster:todo
npm run taskmaster:high
npm run taskmaster:critical
```

## 🚀 TASKMASTER - Commandes Essentielles NPM
```bash
# === COMMANDES PRINCIPALES TASKMASTER ===
npm run taskmaster:list          # Toutes les tâches
npm run taskmaster:stats         # Statistiques du projet
npm run taskmaster:add           # Ajouter nouvelle tâche
npm run taskmaster:check         # Vérifier santé du système

# === FILTRAGE RAPIDE ===
npm run taskmaster:todo          # Tâches à faire
npm run taskmaster:active        # Tâches en cours
npm run taskmaster:critical      # Tâches critiques
npm run taskmaster:high          # Tâches haute priorité
```

## 🎯 Claude Code vs MCP Tools

### Claude Code Gère TOUT :
- File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
- Code generation et programmation
- Bash commands et system operations
- TodoWrite et task management
- Git operations

### MCP Tools - UTILISER QUAND DISPONIBLE :

#### 🐙 GitHub MCP
**Utiliser pour :**
- Créer/gérer issues et pull requests
- Analyser l'historique des commits
- Gérer les branches et merges complexes
- Automatiser les workflows GitHub Actions
- Synchroniser avec les équipes distantes

#### 🎭 Playwright MCP
**Utiliser pour :**
- Tester l'interface utilisateur en temps réel
- Déboguer les problèmes de CSS/layout
- Capturer des screenshots pour documentation
- Automatiser les tests E2E
- Vérifier la compatibilité cross-browser

#### 🐝 Swarm MCP
**Utiliser pour :**
- Orchestrer plusieurs agents sur tâches complexes
- Paralléliser le développement de features
- Coordonner les reviews de code multi-agents
- Optimiser les workflows de CI/CD
- Distribuer les tests sur plusieurs environnements

**RÈGLE D'OR** : Toujours essayer MCP d'abord pour les tâches spécialisées, fallback sur Claude Code si non disponible.

---

# 3. 🔄 WORKFLOW PRINCIPAL

## 🏁 Cycle de Développement avec Tasks + GitHub

**OBLIGATOIRE : Workflow complet avant tout coding :**

### Phase 1: 🔍 INITIALISATION AVEC ÉTAT SYNCHRONISÉ
```bash
# 1. CRITICAL - Lire l'état global du projet
echo "=== PROJECT STATUS ==="
npm run taskmaster:stats
echo "=== ACTIVE TASKS ==="
npm run taskmaster:active

# 2. Synchroniser avec main
git checkout main
git pull origin main

# 3. Identifier la tâche à prendre
npm run taskmaster:critical
npm run taskmaster:high
npm run taskmaster:todo

# 4. VERROUILLER IMMÉDIATEMENT (anti-conflit)
git checkout -b task/[task-id]-[short-description]
task-master-ai update_task --taskId [id] --status "in-progress" --assignee "[agent-name]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 5. Documenter le début de tâche
task-master-ai add_comment --taskId [id] --comment "Agent [name] starting implementation" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 6. Push état verrouillé
git add .
git commit -m "chore: [agent-name] starting task [id] - [title]"
git push -u origin task/[task-id]-[short-description]
```

### Phase 2: ⚡ IMPLEMENTATION (CONCURRENT)
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

  // Commit fréquents sur branche de tâche
  Bash "git add -A && git commit -m 'feat: implement [feature-part]'"
  Bash "git push origin task/[task-id]-[description]"
```

### Phase 3: ✅ VALIDATION
```bash
# Finaliser sur branche de tâche
git add . && git commit -m "feat: [task-id] - [description] complete"
git push origin task/[task-id]-[description]

# Vérifier tests
npm run test && npm run typecheck

# Créer Pull Request (via GitHub/GitLab UI ou CLI)
# Title: "Task [task-id]: [description]"
# Base: main ← Compare: task/[task-id]-[description]

# Mettre à jour statut de la tâche
task-master-ai update_task --taskId [id] --status "review" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# NOTIFY: "Task [title] ready for review - PR #[number] created"
```

### Phase 4: 🔄 SYNCHRONISATION
```bash
# Après validation utilisateur et merge de la PR

# 1. Retourner sur main
git checkout main
git pull origin main

# 2. Supprimer branche locale
git branch -d task/[task-id]-[description]

# 3. Marquer tâche comme terminée
task-master-ai update_task --taskId [id] --status "done" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 4. Optionnel: supprimer branche distante si pas fait automatiquement
git push origin --delete task/[task-id]-[description]
```

## 📋 Status Progression OBLIGATOIRE avec Tracking
```
todo → in-progress → review → done
     ↓
   blocked (si dépendance)
```

### États et Actions Requises:
- **`todo`** ou **`backlog`** : Disponible pour assignation
- **`in-progress`** : Agent travaille activement (update toutes les 2h)
- **`review`** : Code complet, PR créée
- **`done`** : APRÈS merge ET validation user
- **`blocked`** : Dépendance non résolue

**⚠️ RÈGLE D'OR: Un agent silencieux = tâche abandonnée après 4h**

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

### Structure Standard :
- `/src` → Code source frontend
- `/server` → Code backend/API
- `/tests` → Fichiers test
- `/docs` → Documentation
- `/config` → Configuration
- `/scripts` → Scripts utilitaires
- `/public` → Assets statiques

## ✅ Checklist Validation Workflow
- [ ] TOUTES opérations dans UN message ?
- [ ] TodoWrite contient 5+ tasks ?
- [ ] TOUTES file operations concurrent ?
- [ ] TOUTES commandes dans même exécution ?
- [ ] Task tracking dans taskmaster ?

---

# 5. 🛠️ OUTILS & COMMANDES

## 🔧 TASKMASTER Tools - NPM SCRIPTS
```bash
# 📊 ÉTAT DU PROJET (à vérifier toutes les heures)
npm run taskmaster:stats
npm run taskmaster:critical

# 🎯 GESTION DES TÂCHES
npm run taskmaster:list            # Toutes les tâches
npm run taskmaster:active          # Tâches en cours
npm run taskmaster:todo            # Tâches à faire
npm run taskmaster:high            # Tâches prioritaires
npm run taskmaster:add             # Créer nouvelle tâche

# 📝 MISE À JOUR (obligatoire toutes les 2h)
task-master-ai add_comment --taskId [id] --comment "progress note" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
task-master-ai update_acceptance_criteria --taskId [id] --criteriaId [cid] --completed true --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# ✅ COMPLÉTION
task-master-ai update_task --taskId [id] --status "done" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 📈 REPORTING
npm run taskmaster:stats
task-master-ai generate_report --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 🔍 RECHERCHE & ANALYSE
grep -r "pattern" src/ docs/          # Recherche dans le code
task-master-ai search_tasks --query "keyword" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
task-master-ai get_task_detail --taskId [id] --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
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

---

# 6. 📚 RÉFÉRENCES RAPIDES

## 🚀 Commands Essentiels
```bash
# Game Development
npm run dev              # http://localhost:3000
npm run build            # Build production
npm run test             # Run tests
npm run typecheck        # TypeScript check

# Task Management - TASKMASTER NPM SCRIPTS
npm run taskmaster:list         # List all tasks
npm run taskmaster:stats        # Project statistics
npm run taskmaster:add          # Add new task
npm run taskmaster:todo         # Todo tasks
npm run taskmaster:active       # Active tasks
npm run taskmaster:critical     # Critical tasks
npm run taskmaster:high         # High priority tasks
npm run taskmaster:check        # Health check

# Git Branch Management
git checkout main && git pull    # Update main
git checkout -b task/[id]-[desc] # New task branch
git push -u origin task/[id]     # Push branch
git branch -d task/[id]          # Delete after merge

# URLs Importantes
http://localhost:3000    # Game
```

## 🔗 URLs Support
- **Documentation** : https://github.com/ruvnet/claude-flow
- **Issues** : https://github.com/ruvnet/claude-flow/issues
- **Taskmaster DB** : `.taskmaster/tasks.db`
- **MCP Guide** : `CLAUDE-SWARM.md` (si MCP disponible)

## 📋 Violation Tracking
Si exécution séquentielle :
1. **STOP IMMÉDIATEMENT**
2. Créer `/docs/WORKFLOW_VIOLATION_REPORT.md`
3. Documenter violation avec analyse impact
4. Créer proper task tracking via taskmaster MCP
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

## 🔴 RÈGLES ABSOLUES - TASKMASTER SYSTEM

### 🚨 RÈGLES CRITIQUES SYNCHRONISATION

1. **TASKMASTER FIRST** → TOUJOURS utiliser taskmaster MCP avant toute action
2. **TASK SYNCHRONIZATION** → Mettre à jour statut tâche IMMÉDIATEMENT après changement
3. **PROGRESS TRACKING** → Commentaires obligatoires toutes les 2h si `in-progress`
4. **CONCURRENT EXECUTION** → 1 message = toutes opérations liées
5. **BRANCH PER TASK** → Une branche Git = Une tâche = Un agent
6. **STATUS PROGRESSION** → todo/backlog → in-progress → review → done (avec tracking)
7. **GIT WORKFLOW** → main → task/[id] → PR → merge → cleanup
8. **NO ROOT FILES** → Organiser dans sous-répertoires appropriés
9. **VALIDATION GATES** → done SEULEMENT après PR merge + user validation
10. **CREATE IF NOT EXISTS** → Nouvelle tâche seulement si absente de taskmaster
11. **WEB FULL-STACK** → Frontend + Backend développés en parallèle
12. **SECURITY FIRST** → Checklist sécurité dès le début
13. **SILENT = ABANDONED** → Agent sans update 4h = tâche libérée

**REMEMBER** : Taskmaster tracks work, GitHub manages collaboration, Claude executes with CONCURRENT pattern!

---

## 💡 Important Instruction Reminders
- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- Never save working files, text/mds and tests to the root folder
- **ALWAYS execute ALL operations concurrently in ONE message**

*Fichier réorganisé pour clarté maximale - Toutes informations préservées*