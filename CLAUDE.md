# 🚀 CLAUDE.MD - Guide de Développement TASKS + SPARC + GITHUB

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

## 🚨 TASKS-FIRST RULE - OBLIGATOIRE

**AVANT TOUTE CHOSE, pour TOUT scénario de gestion de tâche :**

1. **INITIALISER** → Vérifier que le système de tâches est prêt
2. **UTILISER** → Task management local en SYSTÈME PRIMAIRE
3. **SYNCHRONISER** → GitHub pour collaboration et versioning
4. **TodoWrite** → Pour tracking personnel complémentaire

### ⚠️ WORKFLOW CHECK - SYNCHRONISATION CRITIQUE
```bash
# 1. LIRE L'ÉTAT ACTUEL (obligatoire avant toute action)
cat tasks/PROJECT_STATUS.md | head -30

# 2. VÉRIFIER LES TÂCHES ACTIVES
npm run tasks:list --status in-progress

# 3. IDENTIFIER SA TÂCHE
npm run tasks:list --assignee "[agent-name]"

# 4. SI NOUVELLE SESSION, RESTAURER CONTEXTE
cat tasks/tasks.json | grep -A 20 "in-progress"
```

## 🆕 PROTOCOLE DEMANDE UTILISATEUR

### Quand l'utilisateur demande quelque chose :

**1. VÉRIFIER D'ABORD** → Lister les tâches existantes
```bash
npm run tasks:list
npm run tasks:list --status todo
npm run tasks:list --priority high
```

**2. SI TÂCHE N'EXISTE PAS** → L'agent crée nouvelle tâche
```bash
# L'agent analyse la demande utilisateur et :
# 1. Détermine le prochain ID de tâche (TASK-XXX)
# 2. Crée un slug descriptif basé sur la demande
# 3. Crée le fichier tasks/active/TASK-XXX-slug.md
# 4. Remplit TOUTES les sections du template :
#    - Titre, priorité, taille
#    - User Story complète
#    - Description détaillée
#    - Critères d'acceptation
#    - Détails techniques
#    - Fichiers et composants
#    - Dépendances
#    - Notes d'implémentation
#    - Scénarios de test

# Résultat: fichier tasks/active/TASK-XXX-titre.md créé IMMÉDIATEMENT
```

**3. ORGANISER LE TRAVAIL** → L'agent assigne et priorise
```bash
# L'agent édite directement le fichier MD:
code tasks/active/TASK-001-center-unified-card.md
# L'agent modifie directement:
# - **Status**: IN_PROGRESS
# - **Assignee**: [Agent Name]
# - **Priority**: HIGH (selon l'urgence)
# L'agent ajoute dans Updates Log:
# - 2025-08-17 - IN_PROGRESS - [Agent] - Starting implementation

# L'agent commit les changements:
git add tasks/active/TASK-001-*.md
git commit -m "chore: assign TASK-001 to [Agent]"
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
git add . && git commit -m "feat: TASK-001 - [description]"
git push origin task/TASK-001-center-unified-card

# Créer PR quand prêt pour review
# Mettre à jour le statut de la tâche via CLI
npm run task
# Choisir "3. Update task status"
# TASK ID: TASK-001
# New Status: REVIEW

# Le fichier MD sera mis à jour automatiquement
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
npm run tasks:list
# Si status != "todo" → STOP, choisir autre tâche

# 3. Créer branche pour la tâche
git checkout -b task/[task-id]-[short-description]
# Exemple: git checkout -b task/1-roll-service

# 4. Verrouiller dans le système de tâches
node scripts/tasks/update.js [id] --status in-progress --assignee "[agent-name]"

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

## 📊 Task Management System V3 - FILE-BASED MODERNE

### 📁 Structure des fichiers critiques
```
tasks/
├── active/                 # ⚠️ TÂCHES ACTIVES - Un fichier Markdown par tâche
│   ├── TASK-001-center-unified-card.md
│   ├── TASK-002-recent-rolls-display.md
│   └── TASK-XXX-description.md
├── completed/              # 📋 TÂCHES TERMINÉES - Archive
├── templates/              # 📝 Templates pour nouvelles tâches
│   └── TASK_TEMPLATE.md
└── PROJECT_STATUS.md       # 📊 Dashboard temps réel du sprint

scripts/tasks/
├── task-manager.js         # 🛠️ CLI pour gestion des tâches
└── initialize-critical-tasks.ts

docs/
├── ROADMAP.md             # 🎯 Vision et phases du projet
├── CLAUDE.md              # 📖 Ce fichier - Guide agents
└── CLAUDE-SWARM.md        # 🐝 Pour agents avec MCP
```

### 🔄 WORKFLOW OBLIGATOIRE - Synchronisation État

#### AVANT TOUTE ACTION - Lire l'état actuel:
```bash
# 1. TOUJOURS commencer par vérifier le PROJECT STATUS
cat PROJECT_STATUS.md | head -50

# 2. Lister les tâches actives (fichiers MD)
ls tasks/active/

# 3. Utiliser le nouveau CLI de gestion
npm run task
# Puis choisir option "2. List all tasks"

# 4. Chercher des tâches spécifiques
grep -r "Status.*TODO" tasks/active/
grep -r "Priority.*HIGH" tasks/active/
```

#### PENDANT LE TRAVAIL - Mise à jour temps réel:
```bash
# Mettre à jour le statut via le CLI
npm run task
# Puis choisir option "3. Update task status"
# Ou directement éditer le fichier MD:

# Modifier le fichier de tâche directement
code tasks/active/TASK-001-center-unified-card.md

# Ajouter des commentaires de progression dans le fichier
# Section "## 💬 Discussion & Notes"

# Cocher les critères d'acceptation complétés
# Dans la section "## ✅ Acceptance Criteria"
# Changer "- [ ]" en "- [x]" pour les critères terminés

# Mettre à jour le log
# Dans la section "## 🔄 Updates Log"
# Ajouter: - YYYY-MM-DD - IN_PROGRESS - [Developer] - [Notes]
```

#### APRÈS CHAQUE MILESTONE - Synchroniser:
```bash
# Commiter les changements de tâche
git add tasks/active/TASK-XXX-*.md
git commit -m "chore: update task TASK-XXX progress"
git push origin task/[task-id]

# Si tâche terminée, déplacer vers completed
npm run task
# Choisir option "3. Update task status" et mettre DONE
# Le système déplacera automatiquement vers tasks/completed/

# Mettre à jour PROJECT_STATUS.md si nécessaire
code PROJECT_STATUS.md
```

## 🚀 Système de Tâches V3 - FICHIERS MARKDOWN - Commandes Essentielles
```bash
# === NOUVEAU CLI PRINCIPAL ===
npm run task                        # Interface interactive complète
npm run task:create                 # Alternative pour créer une tâche

# === NAVIGATION RAPIDE ===
# Lister toutes les tâches actives
ls tasks/active/

# Chercher par contenu
grep -r "Priority.*HIGH" tasks/active/
grep -r "Status.*IN_PROGRESS" tasks/active/
grep -r "Epic.*UI" tasks/active/

# === ÉDITION DIRECTE ===
# Ouvrir une tâche pour modification
code tasks/active/TASK-001-center-unified-card.md

# Chercher tâches avec critères spécifiques
grep -l "CRITICAL" tasks/active/*.md
grep -l "TODO" tasks/active/*.md

# === GESTION DES ÉTATS ===
# Via CLI interactif
npm run task  # Puis choisir "Update task status"

# === REPORTING ===
# Compter les tâches par statut
grep -r "Status.*TODO" tasks/active/ | wc -l
grep -r "Status.*IN_PROGRESS" tasks/active/ | wc -l
find tasks/completed/ -name "*.md" | wc -l

# Voir les tâches prioritaires
grep -r "Priority.*CRITICAL" tasks/active/
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
cat tasks/PROJECT_STATUS.md | head -50
echo "=== ACTIVE TASKS ==="
npm run tasks:list --status in-progress

# 2. Synchroniser avec main
git checkout main
git pull origin main

# 3. Identifier la tâche à prendre
npm run tasks:list --status todo --priority critical
npm run tasks:list --status todo --priority high

# 4. VERROUILLER IMMÉDIATEMENT (anti-conflit)
git checkout -b task/[task-id]-[short-description]
node scripts/tasks/update.js [id] --status in-progress --assignee "[agent-name]"

# 5. Documenter le début dans PROJECT_STATUS
echo "### $(date '+%Y-%m-%d %H:%M') - Agent [name] started task [id]" >> tasks/PROJECT_STATUS.md

# 6. Push état verrouillé
git add tasks/tasks.json tasks/PROJECT_STATUS.md
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
node scripts/tasks/update.js [id] --status review

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
npm run tasks:done [id]
# ou
node scripts/tasks/update.js [id] --status done

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
- **`todo`** : Disponible pour assignation
  - Action: `npm run tasks:list --status todo`
  
- **`in-progress`** : Agent travaille activement
  - Action: Update PROJECT_STATUS.md toutes les 2h
  - Command: `node scripts/tasks/update.js [id] --progress [%]`
  
- **`review`** : Code complet, PR créée
  - Action: Créer PR + update status
  - Command: `node scripts/tasks/update.js [id] --status review --pr [number]`
  
- **`done`** : APRÈS merge ET validation user
  - Action: Update + cleanup branch
  - Command: `npm run tasks:done [id]`
  
- **`blocked`** : Dépendance non résolue
  - Action: Documenter le blocage
  - Command: `node scripts/tasks/update.js [id] --status blocked --reason "[why]"`

### 📊 Tracking Obligatoire:
```bash
# Toutes les 2 heures si in-progress
node scripts/tasks/update.js [id] --progress [%] --comment "[what was done]"

# Mettre à jour PROJECT_STATUS.md
node scripts/tasks/generate-status.js > tasks/PROJECT_STATUS.md
git add tasks/PROJECT_STATUS.md && git commit -m "chore: progress update [id]"
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

### Tâches CRITIQUES (Sprint 1)
```yaml
Priorité CRITIQUE - À faire EN PREMIER:
  1. Unify Card Data Models (#e923a6ec313da21c) - EN COURS
     → Bloque tout le reste
     → Claude assigné
     
  2. Consolidate Store Architecture (#199e14eb6453d09e) - BLOQUÉE
     → Attend #1
     → Prochaine priorité
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
# Voir métriques temps réel
cat tasks/PROJECT_STATUS.md | grep -A 10 "Sprint Metrics"

# Velocity tracking
npm run tasks:velocity

# Burndown
npm run tasks:burndown
```

## 🔴 RÈGLE ABSOLUE : Feature-Task Linking

**CRITIQUES :**
1. **CHAQUE** task DOIT être liée à une feature
2. **AUCUNE** task orpheline autorisée
3. **Features** définissent la portée projet
4. **Tasks sans features** = INVALIDE

## 🏗️ Organisation Feature-Based
```bash
# Get current features - Vérifier dans tasks.json
npm run tasks:list

# Features définies pour le projet :
# - Card System
# - Deck Management
# - Combat Engine
# - User Interface
# - Game Services

# Create task avec feature
npm run tasks:new
# Mode interactif pour renseigner tous les détails
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
# Initialiser le système de tâches
npm run tasks:init
# Créer nouvelles tâches selon besoins
npm run tasks:new
```

### Continuer Projet Existant
```bash
npm run tasks:list --status in-progress
npm run tasks:list --status todo
# Reprendre où vous vous êtes arrêté
```

---

# 6. 🛠️ OUTILS & COMMANDES

## 🔧 Task Management Tools V2 - MODERN SYSTEM
```bash
# 📊 ÉTAT DU PROJET (à vérifier toutes les heures)
npm run tasks:status                  # Vue d'ensemble complète
cat tasks/PROJECT_STATUS.md           # Dashboard du sprint
npm run tasks:list --critical         # Tâches CRITIQUES uniquement

# 🎯 GESTION DES TÂCHES
npm run tasks:list                    # Toutes les tâches
npm run tasks:list --assignee me      # Mes tâches
npm run tasks:list --blocked          # Tâches bloquées
npm run tasks:new                     # Créer tâche (interactif)

# 📝 MISE À JOUR (obligatoire toutes les 2h)
npm run tasks:update <id> --progress <percent>
npm run tasks:update <id> --comment "progress note"
npm run tasks:update <id> --complete-criteria <criteria-id>

# ✅ COMPLÉTION
npm run tasks:done <id>               # Marquer terminée
npm run tasks:validate <id>           # Vérifier critères acceptation

# 📈 REPORTING
npm run tasks:report                  # Rapport complet
npm run tasks:burndown                # Graphique burndown
npm run tasks:velocity                # Vélocité de l'équipe
npm run tasks:dependencies            # Arbre des dépendances

# 🔍 RECHERCHE & ANALYSE
grep -r "pattern" src/ docs/          # Recherche dans le code
npm run tasks:search "keyword"        # Recherche dans les tâches
npm run tasks:analyze <id>            # Analyse impact tâche
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
Fichiers à consulter AVANT TOUTE ACTION:
  1. tasks/PROJECT_STATUS.md     # État temps réel du sprint
  2. tasks/tasks.json            # Toutes les tâches détaillées  
  3. docs/ROADMAP.md            # Vision et phases
  4. git branch --remote         # Qui travaille sur quoi
```

### 🔄 Workflow Synchronisé Multi-Agents
```bash
# DÉBUT DE SESSION (obligatoire)
"Agent [name] - Session Start $(date)"

# 1. Synchronisation état global
cat tasks/PROJECT_STATUS.md | head -50
git fetch --all
git branch -r | grep task/

# 2. Identification travail
npm run tasks:list --assignee "[agent-name]"
npm run tasks:list --status todo --priority critical

# 3. Verrouillage tâche
git checkout -b task/[id]-[desc]
node scripts/tasks/update.js [id] --status in-progress --assignee "[name]"

# 4. Travail avec updates régulières (toutes les 2h)
while working:
  # Code...
  node scripts/tasks/update.js [id] --progress [%]
  git add . && git commit -m "wip: [id] - [progress description]"
  git push origin task/[id]-[desc]
  
# 5. Fin de session
node scripts/tasks/generate-status.js > tasks/PROJECT_STATUS.md
git add tasks/PROJECT_STATUS.md
git commit -m "chore: session end - [agent] - task [id] at [%]%"
git push
```

### Workflow Principal
```bash
# Mode Plan (nouvelles fonctionnalités)
"Mode Plan : [Description fonctionnalité]"
npm run tasks:plan --feature "[feature-name]"

# Mode Exécution (tâches modulaires)
"Mode Exécution : tasks/modules/[module]/task-[name].md"
npm run tasks:execute --task-id [id]
```

### Task Structure
```
tasks/
├── PROJECT_STATUS.md           # État global
├── tasks.json                  # Tracking JSON principal
├── features.json               # Définition des features
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

## 🔄 Git Workflow (BRANCHES PAR TÂCHE)
```bash
# WORKFLOW AVEC BRANCHES - UNE PAR TÂCHE
# Protection de main + travail isolé

# 1. Début de tâche - Créer branche
git checkout main && git pull origin main
git checkout -b task/[task-id]-[description]
# Update task status → in progress
npm run tasks:update [id] --status in-progress
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
npm run tasks:update [id] --status review

# 4. Après merge - Nettoyage
git checkout main && git pull origin main
git branch -d task/[task-id]-[description]
npm run tasks:done [id]
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

# 10. 🗂️ SYSTÈME DE TÂCHES V3 - FILE-BASED MODERNE

## 🚀 NOUVEAU SYSTÈME DE GESTION DES TÂCHES

Chaque tâche est maintenant un **fichier Markdown complet** avec :
- ✅ Documentation complète intégrée
- 📊 Métadonnées structurées
- 🎯 User stories et critères d'acceptation
- 📝 Logs de progression en temps réel
- 🔧 Détails techniques complets
- ⚠️ Gestion des risques
- 🧪 Scénarios de test

### 📁 Structure des Fichiers de Tâches
```
tasks/
├── active/                          # 🔥 TÂCHES ACTIVES
│   ├── TASK-001-center-unified-card.md
│   ├── TASK-002-recent-rolls-display.md
│   ├── TASK-003-remove-test-cards-button.md
│   ├── TASK-004-fix-redundant-navigation.md
│   └── TASK-XXX-description.md      # Format: TASK-[ID]-[slug].md
├── completed/                       # 🏁 ARCHIVE DES TÂCHES TERMINÉES
├── templates/                       # 📄 TEMPLATES RÉUTILISABLES
│   └── TASK_TEMPLATE.md            # Template complet pour nouvelles tâches
scripts/tasks/
└── task-manager.js                  # 🛠️ CLI de gestion
```

### 🎯 Template de Tâche Complet
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

### 🛠️ Création de Tâches par les Agents

#### L'agent crée directement la tâche :
```bash
# L'agent analyse la demande utilisateur et crée immédiatement
# un fichier Markdown complet dans tasks/active/

# 1. Générer l'ID de tâche (TASK-XXX basé sur les existantes)
# 2. Créer le slug descriptif
# 3. Créer le fichier tasks/active/TASK-XXX-slug.md
# 4. Remplir TOUTES les sections du template

# Exemple :
# Utilisateur : "Je veux centrer la carte dans l'interface"
# → Agent crée tasks/active/TASK-001-center-unified-card.md
```

#### Lister toutes les tâches :
```bash
# Navigation directe des fichiers
ls tasks/active/                     # Fichiers des tâches actives
ls tasks/completed/                  # Archive des tâches terminées

# Voir le contenu d'une tâche
cat tasks/active/TASK-001-center-unified-card.md
```

#### Mettre à jour une tâche :
```bash
# L'agent édite directement le fichier Markdown
code tasks/active/TASK-001-center-unified-card.md

# L'agent modifie :
# - **Status**: TODO → IN_PROGRESS
# - **Assignee**: [Agent Name]
# - Ajoute dans Updates Log :
#   - 2025-08-17 - IN_PROGRESS - [Agent] - [Notes]

# Si statut = DONE, l'agent déplace le fichier :
# mv tasks/active/TASK-001-*.md tasks/completed/
```

### 🔍 Navigation et Recherche

#### Recherche par contenu :
```bash
# Tâches par priorité
grep -r "Priority.*HIGH" tasks/active/
grep -r "Priority.*CRITICAL" tasks/active/

# Tâches par statut
grep -r "Status.*TODO" tasks/active/
grep -r "Status.*IN_PROGRESS" tasks/active/

# Tâches par assigné
grep -r "Assignee.*Claude" tasks/active/

# Tâches par epic
grep -r "Epic.*UI" tasks/active/
```

#### Édition directe :
```bash
# Ouvrir une tâche pour modification
code tasks/active/TASK-001-center-unified-card.md

# Modifications typiques :
# - Changer Status: TODO → IN_PROGRESS
# - Cocher critères d'acceptation: [ ] → [x]
# - Ajouter notes dans Discussion & Notes
# - Mettre à jour Updates Log
```

### 📊 Reporting et Statistiques

#### Compteurs par statut :
```bash
# Tâches actives par statut
echo "TODO: $(grep -r 'Status.*TODO' tasks/active/ | wc -l)"
echo "IN_PROGRESS: $(grep -r 'Status.*IN_PROGRESS' tasks/active/ | wc -l)"
echo "REVIEW: $(grep -r 'Status.*REVIEW' tasks/active/ | wc -l)"
echo "BLOCKED: $(grep -r 'Status.*BLOCKED' tasks/active/ | wc -l)"

# Tâches terminées
echo "COMPLETED: $(find tasks/completed/ -name '*.md' | wc -l)"
```

#### Tâches critiques :
```bash
# Lister les tâches critiques
grep -l "Priority.*CRITICAL" tasks/active/*.md

# Voir le contenu des tâches critiques
for file in $(grep -l "Priority.*CRITICAL" tasks/active/*.md); do
  echo "=== $file ==="
  head -20 "$file"
  echo
done
```

### ⚡ Workflow avec le Nouveau Système

#### 1. Début de Session (OBLIGATOIRE)
```bash
# Synchronisation Git
git checkout main && git pull origin main

# État des tâches
ls tasks/active/                     # Voir fichiers tâches
npm run task                         # CLI pour vue d'ensemble
# Choisir "2. List all tasks"

# Identifier sa tâche
grep -r "Assignee.*[MonNom]" tasks/active/
grep -r "Status.*TODO" tasks/active/
```

#### 2. Prendre une Tâche
```bash
# L'agent édite directement le fichier de tâche
# Modifier dans tasks/active/TASK-001-center-unified-card.md :
# - **Status**: IN_PROGRESS
# - **Assignee**: Claude
# - Ajouter dans Updates Log :
#   - 2025-08-17 - IN_PROGRESS - Claude - Starting implementation

# Créer branche Git
git checkout -b task/TASK-001-center-unified-card

# Push initial
git add tasks/active/TASK-001-*.md
git commit -m "chore: start TASK-001 - center unified card"
git push -u origin task/TASK-001-center-unified-card
```

#### 3. Pendant le Travail
```bash
# Édition du fichier de tâche
code tasks/active/TASK-001-center-unified-card.md

# Cocher critères d'acceptation complétés :
# - [ ] Card is horizontally centered → - [x] Card is horizontally centered

# Ajouter notes dans Discussion & Notes :
# "Implemented CSS flexbox centering. Tested on Chrome/Firefox."

# Ajouter entrée Updates Log :
# - 2025-08-17 - IN_PROGRESS - Claude - Completed CSS implementation

# Commits réguliers
git add .
git commit -m "feat: TASK-001 - implement card centering"
git push origin task/TASK-001-center-unified-card
```

#### 4. Fin de Tâche
```bash
# L'agent marque la tâche comme terminée en éditant le fichier
# Modifier dans tasks/active/TASK-001-center-unified-card.md :
# - **Status**: DONE
# - Cocher tous les critères d'acceptation [x]
# - Ajouter dans Updates Log :
#   - 2025-08-17 - DONE - Claude - All criteria completed

# L'agent déplace le fichier vers completed
mv tasks/active/TASK-001-center-unified-card.md tasks/completed/

# Créer Pull Request
git add .
git commit -m "feat: complete TASK-001 - center unified card model"
git push origin task/TASK-001-center-unified-card
# Créer PR via GitHub UI
```

### 🎯 Avantages du Système V3

✅ **Documentation intégrée** : Chaque tâche auto-documentée  
✅ **Git-friendly** : Un fichier = un diff clair  
✅ **Recherche puissante** : grep, find, code search  
✅ **Collaboration** : Édition simultanée possible  
✅ **Historique** : Git track tous les changements  
✅ **Flexible** : Édition manuelle ou CLI  
✅ **Portable** : Aucune dépendance externe  
✅ **Évolutif** : Ajout facile de nouveaux champs  

### 🔧 Migration depuis l'Ancien Système

Si vous avez des tâches dans l'ancien format JSON :
```bash
# Les tâches existantes sont conservées dans tasks.json
# Les nouvelles tâches utilisent le système fichier MD
# Coexistence possible pendant la transition

# Pour migrer une tâche JSON vers MD :
# L'agent lit tasks.json et crée les fichiers MD correspondants
# dans tasks/active/ avec toutes les informations
# L'agent marque les tâches JSON comme "migrated"
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

# Task Management
npm run tasks:init       # Initialize task system
npm run tasks:list       # List all tasks
npm run tasks:new        # Create new task
npm run tasks:done       # Mark task as done

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
- **Local Tasks** : `tasks/tasks.json`
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
4. Créer proper task tracking dans `tasks/` avec npm run tasks:*
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

## 🔴 RÈGLES ABSOLUES V2 - SYSTÈME MODERNE

### 🚨 RÈGLES CRITIQUES SYNCHRONISATION

1. **PROJECT STATUS FIRST** → TOUJOURS lire `tasks/PROJECT_STATUS.md` avant toute action
2. **TASK SYNCHRONIZATION** → Mettre à jour statut tâche IMMÉDIATEMENT après changement
3. **PROGRESS TRACKING** → Update obligatoire toutes les 2h si `in-progress`
4. **CONCURRENT EXECUTION** → 1 message = toutes opérations liées
5. **BRANCH PER TASK** → Une branche Git = Une tâche = Un agent
6. **STATUS PROGRESSION** → todo → in-progress → review → done (avec tracking)
7. **GIT WORKFLOW** → main → task/[id] → PR → merge → cleanup
8. **NO ROOT FILES** → Organiser dans sous-répertoires appropriés
9. **VALIDATION GATES** → done SEULEMENT après PR merge + user validation
10. **CREATE IF NOT EXISTS** → Nouvelle tâche seulement si absente de tasks.json
11. **WEB FULL-STACK** → Frontend + Backend développés en parallèle
12. **SECURITY FIRST** → Checklist sécurité dès le début
13. **SILENT = ABANDONED** → Agent sans update 4h = tâche libérée

**REMEMBER** : Local tasks track work, GitHub manages collaboration, Claude executes with CONCURRENT pattern!

---

## 💡 Important Instruction Reminders
- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- Never save working files, text/mds and tests to the root folder
- **ALWAYS execute ALL operations concurrently in ONE message**

*Fichier réorganisé pour clarté maximale - Toutes informations préservées*
