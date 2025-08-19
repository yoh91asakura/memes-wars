# 🎯 Taskmaster Setup and Usage Guide

## Overview

Taskmaster is the task management system for the Meme Wars project. It provides a comprehensive MCP-based solution for creating, tracking, and managing development tasks.

## 🚀 Quick Start

### Initialize Taskmaster
```bash
npm run taskmaster:init
```

### Check Taskmaster Health
```bash
npm run taskmaster:check
```

### Basic Commands
```bash
# List all tasks
npm run taskmaster:list

# Get project statistics  
npm run taskmaster:stats

# Add a new task
npm run taskmaster:add -- --title "My Task" --description "Task description"
```

## 📁 Project Structure

```
.taskmaster/
├── config.json          # Taskmaster configuration
├── state.json           # Current state and settings
├── tasks/               # Task storage directory
├── reports/             # Generated reports
├── docs/                # Documentation
└── templates/           # Task templates
```

## 🛠️ Available Scripts

- `taskmaster:init` - Initialize taskmaster for the project
- `taskmaster:check` - Run health check on taskmaster
- `taskmaster:list` - List all tasks
- `taskmaster:stats` - Show project statistics  
- `taskmaster:add` - Add a new task (requires additional parameters)

## 🔧 Manual Commands

### Task Management
```bash
# List tasks
task-master-ai get_tasks --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Add task
task-master-ai add_task --title "Task Title" --description "Description" --priority "high" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Get task details
task-master-ai get_task_detail --taskId [id] --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Update task
task-master-ai update_task --taskId [id] --status "in-progress" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Get statistics
task-master-ai get_task_stats --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

### Filtering and Search
```bash
# Filter by status
task-master-ai get_tasks --filter "todo" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
task-master-ai get_tasks --filter "in-progress" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Filter by priority
task-master-ai get_tasks --filter "critical" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
task-master-ai get_tasks --filter "high" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Filter by assignee
task-master-ai get_tasks --assignee "Agent Name" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

## 🔄 Typical Workflow

1. **Check Current Status**
   ```bash
   npm run taskmaster:stats
   ```

2. **List Available Tasks**
   ```bash
   npm run taskmaster:list
   ```

3. **Create New Task** (if needed)
   ```bash
   task-master-ai add_task --title "New Feature" --description "Implementation details" --priority "medium" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
   ```

---

# 🚀 TASKMASTER REFERENCE DÉTAILLÉE

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

4. **Update Task Status**
   ```bash
   task-master-ai update_task --taskId [id] --status "in-progress" --assignee "Your Name" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
   ```

5. **Complete Task**
   ```bash
   task-master-ai update_task --taskId [id] --status "done" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
   ```

## ⚠️ Troubleshooting

### Common Issues

#### Connection Warnings
If you see warnings like "could not infer client capabilities", this is normal and doesn't affect functionality.

#### Multiple Processes
If taskmaster hangs, kill existing processes:
```bash
pkill -f task-master-ai
```

#### Initialization Issues
If initialization fails, run:
```bash
npm run taskmaster:init
```

#### Health Check
To verify everything is working:
```bash
npm run taskmaster:check
```

## 📊 Configuration

The taskmaster configuration is stored in `.taskmaster/config.json`:

- Model providers (Anthropic, Perplexity)
- Default settings
- Project-specific configuration

## 🎯 Best Practices

1. **Always check status first**
   ```bash
   npm run taskmaster:stats
   ```

2. **Use meaningful task titles and descriptions**

3. **Set appropriate priorities**: critical, high, medium, low

4. **Update task status regularly**: todo → in-progress → review → done

5. **Use assignee field** for tracking who's working on what

6. **Add comments** for progress tracking

## 🔗 Integration

Taskmaster integrates with:
- Git workflow (branch per task)
- GitHub issues and pull requests
- Development workflow automation
- Progress tracking and reporting

For more details, see the main `CLAUDE.md` documentation.