# 🚀 CLAUDE.MD - Guide de Développement TASKS + SPARC + GITHUB

## 📈 DERNIÈRES AMÉLIORATIONS (v2.1)

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

### 🔧 Avantages
- ✅ **Plus rapide** - Scripts npm vs commandes MCP longues
- ✅ **Plus simple** - Commandes faciles à retenir
- ✅ **Plus fiable** - Élimination des timeouts fréquents
- ✅ **Meilleure UX** - Interface utilisateur améliorée

---

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
# Utiliser l'ID de la tâche du fichier MD
git checkout -b task/TASK-001-center-unified-card
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

## 🐝 Agents avec MCP (GitHub, Playwright, Swarm)
**Si MCP disponible** → Lire `CLAUDE-SWARM.md` pour capacités étendues
**Si MCP non disponible** → Utiliser patterns de cette section

### Détection MCP :
```bash
# Vérifier disponibilité
mcp status || echo "MCP non disponible - utiliser patterns locaux"
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

### 🚀 Structure taskmaster
```
.taskmaster/
├── tasks.db               # 🗄️ Base de données SQLite des tâches
├── config.json            # ⚙️ Configuration taskmaster
└── docs/
    └── prd.txt           # 📋 Product Requirements Document

archive/old-tasks/         # 📦 Ancien système (migré)
├── active/
├── completed/
└── PROJECT_STATUS.md

docs/
├── ROADMAP.md             # 🎯 Vision et phases du projet
├── CLAUDE.md              # 📖 Ce fichier - Guide agents
└── CLAUDE-SWARM.md        # 🐝 Pour agents avec MCP
```

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

#### PENDANT LE TRAVAIL - Mise à jour temps réel:
```bash
# Mettre à jour le statut via taskmaster
task-master-ai update_task \
  --taskId [task-id] \
  --status "in-progress" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Ajouter des commentaires de progression
task-master-ai add_comment \
  --taskId [task-id] \
  --comment "[progress notes]" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Marquer des critères d'acceptation comme complétés
task-master-ai update_acceptance_criteria \
  --taskId [task-id] \
  --criteriaId [criteria-id] \
  --completed true \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

#### APRÈS CHAQUE MILESTONE - Synchroniser:
```bash
# Commiter les changements
git add .
git commit -m "chore: update task [task-id] progress"
git push origin task/[task-id]

# Si tâche terminée, marquer comme done
task-master-ai update_task \
  --taskId [task-id] \
  --status "done" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Voir les statistiques mises à jour
npm run taskmaster:stats
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

# === GESTION DÉTAILLÉE (si nécessaire) ===
# Pour opérations avancées, utiliser directement :
task-master-ai get_task_detail --taskId [id] --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
task-master-ai update_task --taskId [id] --status "in-progress" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
task-master-ai add_comment --taskId [id] --comment "[note]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
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

**Commandes clés :**
```bash
# Si MCP GitHub disponible
mcp github create-pr --title "Task #X" --branch task/X
mcp github list-issues --state open
mcp github review-pr --number 123
```

#### 🎭 Playwright MCP
**Utiliser pour :**
- Tester l'interface utilisateur en temps réel
- Déboguer les problèmes de CSS/layout
- Capturer des screenshots pour documentation
- Automatiser les tests E2E
- Vérifier la compatibilité cross-browser

**Commandes clés :**
```bash
# Si MCP Playwright disponible
mcp playwright navigate --url http://localhost:3000
mcp playwright screenshot --path ui-debug.png
mcp playwright test --spec tests/e2e/
```

#### 🐝 Swarm MCP
**Utiliser pour :**
- Orchestrer plusieurs agents sur tâches complexes
- Paralléliser le développement de features
- Coordonner les reviews de code multi-agents
- Optimiser les workflows de CI/CD
- Distribuer les tests sur plusieurs environnements

**Commandes clés :**
```bash
# Si MCP Swarm disponible
mcp swarm spawn --agents 3 --task "refactor-ui"
mcp swarm coordinate --mode parallel
mcp swarm status --show-progress
```

### Fallback Strategy (Si MCP non disponible) :
1. **GitHub** → Utiliser Git CLI et GitHub UI
2. **Playwright** → Créer scripts locaux avec npm/node
3. **Swarm** → Décomposer manuellement les tâches

### Détection et Utilisation :
```bash
# Vérifier disponibilité MCP
mcp status

# Si disponible, prioriser MCP pour :
- UI Testing → Playwright MCP
- GitHub Ops → GitHub MCP
- Multi-agent → Swarm MCP

# Sinon, fallback sur outils standards
```

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

  // Commit fréquents sur branche de tâche
  Bash "git add -A && git commit -m 'feat: implement [feature-part]'"
  Bash "git push origin task/[task-id]-[description]"
```

### Phase 4: ✅ VALIDATION
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

### Phase 5: 🔄 SYNCHRONISATION
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
  - Action: `mcp task-master-ai get_tasks --filter "todo" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars`
  
- **`in-progress`** : Agent travaille activement
  - Action: Update toutes les 2h via commentaires
  - Command: `mcp task-master-ai add_comment --taskId [id] --comment "[progress]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars`
  
- **`review`** : Code complet, PR créée
  - Action: Créer PR + update status
  - Command: `mcp task-master-ai update_task --taskId [id] --status "review" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars`
  
- **`done`** : APRÈS merge ET validation user
  - Action: Update + cleanup branch
  - Command: `mcp task-master-ai update_task --taskId [id] --status "done" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars`
  
- **`blocked`** : Dépendance non résolue
  - Action: Documenter le blocage
  - Command: `mcp task-master-ai update_task --taskId [id] --status "blocked" --blockedReason "[why]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars`

### 📊 Tracking Obligatoire:
```bash
# Toutes les 2 heures si in-progress
mcp task-master-ai add_comment --taskId [id] --comment "[what was done]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Voir les statistiques mises à jour
mcp task-master-ai get_task_stats --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
git add . && git commit -m "chore: progress update [id]"
```

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

## 🌐 WEB DEVELOPMENT - PATTERN FULL-STACK PARALLÈLE
```javascript
// TOUJOURS développer Frontend + Backend simultanément
[BatchTool]:
  // Frontend Components (React/Vue/Angular)
  Write "src/components/Header.tsx" [headerContent]
  Write "src/components/Dashboard.tsx" [dashboardContent]
  Write "src/components/UserProfile.tsx" [profileContent]
  Write "src/hooks/useAuth.ts" [authHookContent]
  
  // Backend API (Node/Express)
  Write "server/routes/auth.js" [authRoutes]
  Write "server/routes/users.js" [userRoutes]
  Write "server/controllers/authController.js" [authController]
  Write "server/models/User.js" [userModel]
  
  // Database & Config
  Write "server/config/database.js" [dbConfig]
  Write "migrations/001_create_users.sql" [migration]
  
  // Tests (Frontend + Backend)
  Write "tests/frontend/components.test.tsx" [frontendTests]
  Write "tests/backend/api.test.js" [backendTests]
  Write "tests/e2e/userflow.test.js" [e2eTests]
  
  // Configuration Files
  Write "package.json" [packageConfig]
  Write "docker-compose.yml" [dockerConfig]
  Write ".env.example" [envExample]
  
  // Execute ALL commands
  Bash "npm install && npm run dev"
  Bash "docker-compose up -d"
  Bash "npm run test:all"
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

### Structure Web Full-Stack :
```
project/
├── src/                    # Frontend
│   ├── components/         # UI Components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── store/             # State management
│   └── utils/             # Utilities
├── server/                 # Backend
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   └── services/          # External services
├── tests/                  # Tests
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
└── migrations/            # Database migrations
```

## ✅ Checklist Validation Workflow
- [ ] TOUTES opérations dans UN message ?
- [ ] TodoWrite contient 5+ tasks ?
- [ ] TOUTES file operations concurrent ?
- [ ] TOUTES commandes dans même exécution ?
- [ ] Task tracking dans tasks/ ?

---

# 5. 📋 GESTION TASKS & FEATURES - SYSTÈME V2

## 🎯 HIÉRARCHIE DES TÂCHES ACTUELLES

### Consulter taskmaster pour les priorités
```bash
# Voir toutes les tâches critiques
npm run taskmaster:critical

# Voir tâches en cours
npm run taskmaster:active

# Voir tâches haute priorité
npm run taskmaster:high

# Vue d'ensemble
npm run taskmaster:stats
```

### Roadmap Actuelle (voir docs/ROADMAP.md)
```
Phase 1: Foundation (Semaines 1-4) ← NOUS SOMMES ICI
  ├── Unification modèles ← EN COURS
  ├── Migration données
  ├── Consolidation stores
  └── Tests de base

Phase 2: Combat Core (Semaines 5-8)
  ├── Combat Arena
  ├── Projectile System  
  ├── Collision Detection
  └── HP/Damage System
```

## 📊 METRICS SPRINT ACTUEL
```bash
# Voir métriques temps réel via taskmaster
npm run taskmaster:stats

# Générer rapport complet
task-master-ai generate_report --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

## 🔴 RÈGLE ABSOLUE : Feature-Task Linking

**CRITIQUES :**
1. **CHAQUE** task DOIT être liée à une feature
2. **AUCUNE** task orpheline autorisée
3. **Features** définissent la portée projet
4. **Tasks sans features** = INVALIDE

## 🏗️ Organisation Epic-Based
```bash
# Get current epics via taskmaster
mcp task-master-ai get_tasks --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Epics définis pour le projet :
# - refactoring-core
# - ui-completion
# - combat-system
# - performance-optimization
# - testing-quality
# - user-system
# - bug-fixes

# Create task avec epic
mcp task-master-ai add_task --epic "[epic-name]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

## 🔄 Lifecycle Feature Development
1. **Feature Planning** → Définir scope, créer tasks liées
2. **Feature Research** → Query patterns spécifiques feature
3. **Feature Implementation** → Compléter toutes tasks du groupe
4. **Feature Validation** → Utilisateur teste feature complète
5. **Feature Completion** → Toutes tasks feature marquées "done"

## ⚙️ Scénarios Projet

### Nouveau Projet Local
```bash
# Initialiser taskmaster pour le projet
mcp task-master-ai init --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
# Créer nouvelles tâches selon besoins
mcp task-master-ai add_task --title "..." --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

### Continuer Projet Existant
```bash
mcp task-master-ai get_tasks --filter "in-progress" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
mcp task-master-ai get_tasks --filter "todo" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
# Reprendre où vous vous êtes arrêté
```

---

# 6. 🛠️ OUTILS & COMMANDES

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

## 📚 Documentation Research
```bash
# Architecture & patterns - Utiliser codebase search
npm run research:patterns "microservices vs monolith"

# Security considerations
npm run research:security "OAuth 2.0 PKCE flow"

# Specific API usage - Utiliser grep et search
grep -r "useEffect" src/ --include="*.ts" --include="*.tsx"

# Configuration & setup
npm run research:config "Docker multi-stage build"
```

## 💻 Code Example Integration
```bash
# Avant implémenter feature - Utiliser search local
grep -r "custom hook" src/ --include="*.ts" --include="*.tsx"
npm run search:examples "data fetching patterns"

# Défis techniques spécifiques
grep -r "connection pooling" src/ --include="*.ts" --include="*.js"
npm run search:patterns "database connection"
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
# Setup Git branch
git checkout main && git pull origin main
git checkout -b task/[task-id]-[description]

# Hooks Claude Flow
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

**2️⃣ PENDANT Travail :**
```bash
# Commits réguliers sur branche
git add -A && git commit -m "wip: [current progress]"
git push origin task/[task-id]-[description]

# Hooks Claude Flow
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/[agent]/[step]"
npx claude-flow@alpha hooks notify --message "[what was done]"
```

**3️⃣ APRÈS Travail :**
```bash
# Finaliser branche et créer PR
git add -A && git commit -m "feat: complete [task-id] - [description]"
git push origin task/[task-id]-[description]
# Créer Pull Request via UI ou CLI

# Hooks Claude Flow
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

## 🌐 WEB DEVELOPMENT ARCHITECTURE

### Frontend Architecture Patterns
```javascript
// Component-based architecture
components/
├── atoms/          // Basic UI elements (Button, Input)
├── molecules/      // Composite components (FormField, Card)
├── organisms/      // Complex components (Header, Dashboard)
├── templates/      // Page templates
└── pages/          // Page components

// State Management
store/
├── slices/         // Redux slices / Zustand stores
├── actions/        // Action creators
├── selectors/      // Memoized selectors
└── middleware/     // Custom middleware
```

### Backend Architecture (MVC Pattern)
```javascript
// Model-View-Controller structure
server/
├── models/         // Data models (User, Product)
├── views/          // Response formatting
├── controllers/    // Business logic
├── routes/         // API endpoints
├── middleware/     // Auth, validation, logging
└── services/       // External integrations
```

### API Design Standards
```javascript
// RESTful endpoints
GET    /api/users           // List users
GET    /api/users/:id       // Get user
POST   /api/users           // Create user
PUT    /api/users/:id       // Update user
DELETE /api/users/:id       // Delete user

// Response format
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 🔒 WEB SECURITY CHECKLIST

### Authentication & Authorization
```javascript
// JWT avec httpOnly cookies
const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  },
  cookies: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
};

// RBAC (Role-Based Access Control)
const roles = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};
```

### Protection Patterns
```javascript
// XSS Protection
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));

// CSRF Protection
app.use(csrf({ cookie: true }));

// SQL Injection Prevention (avec ORM)
const user = await User.findOne({
  where: { email: sanitize(email) }
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
```

## 🧪 WEB TESTING STRATEGY

### Testing Pyramid (Exécution Parallèle)
```bash
# TOUT exécuter en parallèle
[BatchTool - Testing]:
  # Unit Tests
  Bash "npm run test:unit:frontend"
  Bash "npm run test:unit:backend"
  
  # Integration Tests
  Bash "npm run test:integration:api"
  Bash "npm run test:integration:db"
  
  # E2E Tests
  Bash "npm run test:e2e:chrome"
  Bash "npm run test:e2e:firefox"
  
  # Performance Tests
  Bash "npm run test:lighthouse"
  Bash "npm run test:load"
```

### Test Organization
```javascript
// Frontend Component Test
describe('Dashboard Component', () => {
  it('should render user data', async () => {
    render(<Dashboard user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });
});

// Backend API Test
describe('POST /api/users', () => {
  it('should create user with valid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(validUserData)
      .expect(201);
    
    expect(res.body.success).toBe(true);
  });
});
```

## ⚡ WEB PERFORMANCE OPTIMIZATION

### Frontend Optimization
```javascript
// Code Splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Image Optimization
<img 
  src="image.webp" 
  loading="lazy"
  srcSet="image-320w.jpg 320w, image-640w.jpg 640w"
/>

// Bundle Optimization
webpack: {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10
        }
      }
    }
  }
}
```

### Backend Optimization
```javascript
// Database Connection Pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Redis Caching
const cachedData = await redis.get(key);
if (cachedData) return JSON.parse(cachedData);

// Response Compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
```

## 🎯 MODERN TASK WORKFLOW - SYSTÈME V2

### 📊 Sources de Vérité (CRITICAL - À JOUR)
```yaml
Systèmes à consulter AVANT TOUTE ACTION:
  1. taskmaster (MCP)           # État temps réel des tâches
     mcp task-master-ai get_tasks --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
  2. .taskmaster/tasks.db       # Base de données SQLite des tâches  
  3. docs/ROADMAP.md           # Vision et phases
  4. git branch --remote       # Qui travaille sur quoi
```

### 🔄 Workflow Synchronisé Multi-Agents
```bash
# DÉBUT DE SESSION (obligatoire)
"Agent [name] - Session Start $(date)"

# 1. Synchronisation état global
mcp task-master-ai get_task_stats --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
git fetch --all
git branch -r | grep task/

# 2. Identification travail
mcp task-master-ai get_tasks --assignee "[agent-name]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
mcp task-master-ai get_tasks --filter "todo" --priority "critical" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 3. Verrouillage tâche
git checkout -b task/[id]-[desc]
mcp task-master-ai update_task --taskId [id] --status "in-progress" --assignee "[name]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 4. Travail avec updates régulières (toutes les 2h)
while working:
  # Code...
  mcp task-master-ai add_comment --taskId [id] --comment "[progress description]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
  git add . && git commit -m "wip: [id] - [progress description]"
  git push origin task/[id]-[desc]
  
# 5. Fin de session
mcp task-master-ai get_task_stats --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
git add .
git commit -m "chore: session end - [agent] - task [id] at [%]%"
git push
```

### Workflow Principal
```bash
# Mode Plan (nouvelles fonctionnalités)
"Mode Plan : [Description fonctionnalité]"
mcp task-master-ai add_task --epic "[epic-name]" --title "..." --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Mode Exécution (tâches modulaires)
"Mode Exécution : taskmaster task [id]"
mcp task-master-ai get_task_detail --taskId [id] --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

### TASKMASTER Structure
```
.taskmaster/
├── tasks.db                    # Base de données SQLite
├── config.json                 # Configuration
└── docs/
    └── prd.txt                # Product Requirements Document

# Les tâches sont gérées dans la DB avec :
# - ID unique
# - Titre, description, priorité
# - Statut, assigné, epic
# - Critères d'acceptation
# - User stories
# - Contexte complet
# - Commentaires et activité
```

### Module Status (Current)
| Module | Progress | Tasks | Priority |
|--------|----------|-------|----------|
| **CARDS** | 0/49 | Common(10), Rare(10), Epic(8), Legendary(6), Mythic(4), Cosmic(1) | HIGH |
| **SERVICES** | 1/4 | ✅CardService, ⏳DeckService, CombatEngine, ProgressionService | HIGH |
| **UI** | 1/4 | ✅RollScreen, ⏳DeckBuilder, CombatScreen, CollectionView | MEDIUM |

## 🔄 Git Workflow (BRANCHES PAR TÂCHE)
```bash
# WORKFLOW AVEC BRANCHES - UNE PAR TÂCHE
# Protection de main + travail isolé

# 1. Début de tâche - Créer branche
git checkout main && git pull origin main
git checkout -b task/[task-id]-[description]
# Update task status → in progress
mcp task-master-ai update_task --taskId [id] --status "in-progress" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
git add . && git commit -m "chore: starting task [id]"
git push -u origin task/[task-id]-[description]

# 2. Pendant développement - Commits sur branche
git add . && git commit -m "feat: [what was done]"
git push origin task/[task-id]-[description]
# Synchroniser régulièrement avec main
git fetch origin && git rebase origin/main

# 3. Fin de tâche - Pull Request
git add . && git commit -m "feat: completed [task-id]"
git push origin task/[task-id]-[description]
# Créer PR via GitHub/GitLab
mcp task-master-ai update_task --taskId [id] --status "review" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# 4. Après merge - Nettoyage
git checkout main && git pull origin main
git branch -d task/[task-id]-[description]
mcp task-master-ai update_task --taskId [id] --status "done" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

# RÈGLE D'OR: Une branche = Une tâche = Un agent

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
  Update task status
```

---

# 10. 🚀 TASKMASTER REFERENCE - STRUCTURE & TEMPLATES

## 🎯 TASKMASTER Quick Reference

Chaque tâche dans **taskmaster** contient :
- ✅ Documentation complète intégrée
- 📊 Métadonnées structurées (ID, statut, priorité, epic)
- 🎯 User stories et critères d'acceptation
- 📝 Commentaires et activité en temps réel
- 🔧 Contexte technique complet
- ⚠️ Gestion des blocages et dépendances
- 🧪 Métriques et reporting automatiques

### 📁 Structure TASKMASTER
```
.taskmaster/
├── tasks.db                         # 🗄️ BASE DE DONNÉES SQLite
│   └── Contient toutes les tâches avec:
│       - ID unique (numérique ou UUID)
│       - Statut (todo, in-progress, review, done, blocked)
│       - Priorité (critical, high, medium, low)
│       - Epic et tags
│       - User stories complètes
│       - Critères d'acceptation
│       - Commentaires et activité
├── config.json                      # ⚙️ CONFIGURATION
└── docs/
    └── prd.txt                     # 📋 PRODUCT REQUIREMENTS DOCUMENT
```

### 🎯 Structure de Tâche TASKMASTER
Chaque tâche contient OBLIGATOIREMENT :
```markdown
# Task: [TITRE DE LA TÂCHE]

## 📋 Metadata
- **ID**: TASK-XXX
- **Created**: YYYY-MM-DD
- **Status**: TODO | IN_PROGRESS | REVIEW | DONE | BLOCKED
- **Priority**: CRITICAL | HIGH | MEDIUM | LOW
- **Size**: XS | S | M | L | XL
- **Assignee**: [Developer Name]
- **Epic**: [Epic/Category]
- **Sprint**: [Sprint Number]

## 🎯 User Story
**As a** [persona]  
**I want** [what]  
**So that** [why]

## 📝 Description
[Detailed description]

## ✅ Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🔧 Technical Details
### Files to Modify
- `path/to/file1.ts`
- `path/to/file2.tsx`

### Components Affected
- Component1
- Component2

### Dependencies
- TASK-XXX - Other Task
- External library: Library Name

## 💡 Implementation Notes
[Technical approach and decisions]

## ⚠️ Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Risk 1 | HIGH | LOW | Mitigation strategy |

## 🧪 Test Scenarios
1. **Scenario 1**:
   - Given: [Context]
   - When: [Action]
   - Then: [Expected Result]

## 📊 Definition of Done
- [ ] Code implemented and working
- [ ] Unit tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] No console errors or warnings

## 💬 Discussion & Notes
[Additional notes and discussions]

## 🔄 Updates Log
- YYYY-MM-DD - STATUS - DEVELOPER - NOTES
```

### 🛠️ Création de Tâches via TASKMASTER

#### L'agent crée directement la tâche :
```bash
# L'agent utilise taskmaster MCP pour créer une tâche complète
mcp task-master-ai add_task \
  --title "Center Unified Card Model" \
  --description "Fix card centering issue..." \
  --priority "high" \
  --size "S" \
  --epic "ui-completion" \
  --tags "ui,layout,cards" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Résultat: Tâche créée avec ID unique dans taskmaster
```

#### Lister toutes les tâches :
```bash
# Via taskmaster MCP
mcp task-master-ai get_tasks --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Voir le détail d'une tâche spécifique
mcp task-master-ai get_task_detail --taskId [id] --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

#### Mettre à jour une tâche :
```bash
# Via taskmaster MCP
mcp task-master-ai update_task \
  --taskId [id] \
  --status "in-progress" \
  --assignee "Claude" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Ajouter un commentaire de progression
mcp task-master-ai add_comment \
  --taskId [id] \
  --comment "Implementation progress: 50%" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

### 🔍 Navigation et Recherche

#### Recherche et filtrage :
```bash
# Tâches par priorité
mcp task-master-ai get_tasks --filter "high" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
mcp task-master-ai get_tasks --filter "critical" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Tâches par statut
mcp task-master-ai get_tasks --filter "todo" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
mcp task-master-ai get_tasks --filter "in-progress" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Tâches par assigné
mcp task-master-ai get_tasks --assignee "Claude" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Recherche par mot-clé
mcp task-master-ai search_tasks --query "card" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

#### Mise à jour des critères :
```bash
# Marquer un critère d'acceptation comme complété
mcp task-master-ai update_acceptance_criteria \
  --taskId [id] \
  --criteriaId [criteria-id] \
  --completed true \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Ajouter un commentaire de progression
mcp task-master-ai add_comment \
  --taskId [id] \
  --comment "Completed CSS implementation" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

### 📊 Reporting et Statistiques

#### Statistiques du projet :
```bash
# Obtenir les statistiques complètes
mcp task-master-ai get_task_stats --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Générer un rapport détaillé
mcp task-master-ai generate_report --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

#### Tâches critiques :
```bash
# Lister les tâches critiques
mcp task-master-ai get_tasks --filter "critical" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Voir le détail d'une tâche critique spécifique
mcp task-master-ai get_task_detail --taskId [critical-task-id] --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

### ⚡ Workflow avec le Nouveau Système

#### 1. Début de Session (OBLIGATOIRE)
```bash
# Synchronisation Git
git checkout main && git pull origin main

# État des tâches via taskmaster
mcp task-master-ai get_tasks --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
mcp task-master-ai get_task_stats --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Identifier sa tâche
mcp task-master-ai get_tasks --assignee "[MonNom]" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
mcp task-master-ai get_tasks --filter "todo" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

#### 2. Prendre une Tâche
```bash
# Mettre à jour le statut via taskmaster
mcp task-master-ai update_task \
  --taskId [id] \
  --status "in-progress" \
  --assignee "Claude" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Créer branche Git
git checkout -b task/[task-id]-[description]

# Push initial
git add .
git commit -m "chore: start task [id] - [description]"
git push -u origin task/[task-id]-[description]
```

#### 3. Pendant le Travail
```bash
# Marquer des critères complétés
mcp task-master-ai update_acceptance_criteria \
  --taskId [id] \
  --criteriaId [criteria-id] \
  --completed true \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Ajouter des commentaires de progression
mcp task-master-ai add_comment \
  --taskId [id] \
  --comment "Implemented CSS flexbox centering. Tested on Chrome/Firefox." \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Commits réguliers
git add .
git commit -m "feat: task [id] - implement [feature]"
git push origin task/[task-id]-[description]
```

#### 4. Fin de Tâche
```bash
# Marquer la tâche comme terminée via taskmaster
mcp task-master-ai update_task \
  --taskId [id] \
  --status "done" \
  --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Créer Pull Request
git add .
git commit -m "feat: complete task [id] - [description]"
git push origin task/[task-id]-[description]
# Créer PR via GitHub UI
```

### 🎯 Avantages de TASKMASTER

✅ **Base de données robuste** : SQLite pour persistance et requêtes  
✅ **API MCP complète** : Interface standardisée et puissante  
✅ **Métriques automatiques** : Statistiques et reporting intégrés  
✅ **Gestion des dépendances** : Relations entre tâches  
✅ **Historique complet** : Activité et commentaires trackés  
✅ **Multi-projet** : Support de plusieurs projets  
✅ **Recherche avancée** : Requêtes complexes possibles  
✅ **Intégration native** : Fonctionne avec MCP dans Claude

### 🔧 Migration Complétée

✅ **Migration réussie** : Toutes les tâches ont été migrées vers taskmaster
```bash
# Ancien système archivé dans :
archive/old-tasks/

# Nouveau système taskmaster :
.taskmaster/tasks.db

# Pour voir toutes les tâches migrées :
mcp task-master-ai get_tasks --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

---

# 11. 📚 RÉFÉRENCES RAPIDES

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

## 🌐 Web Development Commands
```bash
# Frontend Development
npm run dev           # Start dev server
npm run build        # Production build
npm run lint         # Lint code
npm run test         # Run tests

# Backend Development
npm run server       # Start API server
npm run migrate      # Run migrations
npm run seed         # Seed database

# Full-Stack
npm run dev:all      # Frontend + Backend
npm run test:all     # All tests parallel
npm run docker:up    # Docker environment
```

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
