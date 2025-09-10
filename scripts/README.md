# 🤖 Scripts d'Automatisation Spec-Kit

Ce dossier contient des scripts d'automatisation pour le développement assisté par IA.

## 📋 Scripts Disponibles

### 🎯 `update-context-auto.js`

**Système intelligent de détection et mise à jour du contexte.**

Détecte automatiquement :
- La spec active basée sur la branche Git
- Les tâches en cours dans `specs/*/tasks.md` 
- Le statut de progression
- Met à jour `CLAUDE.md` et `STATUS.md` automatiquement

**Usage :**

```bash
# Mise à jour immédiate
npm run context:update

# Mode dry-run (test sans modifications)
npm run context:update:dry

# Mode verbose pour debugging
npm run context:update:verbose

# Mode surveillance (met à jour automatiquement toutes les 30s)
npm run context:watch
```

**Fonctionnalités :**
- ✅ Détection automatique de la spec via Git branch
- ✅ Analyse des tâches complétées/en cours
- ✅ Mise à jour du contexte dans CLAUDE.md
- ✅ Synchronisation du statut dans STATUS.md
- ✅ Horodatage automatique des mises à jour
- ✅ Gestion des erreurs robuste

### 📝 `context-template.md`

Template de base pour CLAUDE.md avec structure optimisée pour les agents IA.

## 🚀 Comment ça marche

1. **Détection de la spec** : Le script lit la branche Git actuelle (ex: `005-complete-card-management`)
2. **Analyse des tâches** : Parse le fichier `specs/*/tasks.md` pour détecter les tâches complétées
3. **Mise à jour intelligente** : Met à jour les sections auto-générées dans CLAUDE.md et STATUS.md
4. **Synchronisation** : Garde tous les fichiers de contexte cohérents

## 🔧 Configuration

Le script détecte automatiquement :
- Le répertoire racine du projet
- La branche Git active  
- Les fichiers de spec correspondants
- Les tâches avec marqueurs de completion (✅, [x])

## 📊 Intégration avec les Agents IA

Les agents IA (Claude, Copilot, etc.) peuvent maintenant :
- Comprendre immédiatement le contexte du projet
- Identifier la spec active sans ambiguïté
- Voir les tâches en cours et complétées
- Accéder aux bons fichiers rapidement

## 🛠️ Développement

Le script est écrit en JavaScript ES6 avec Node.js et utilise :
- `fs/promises` pour les opérations fichier
- `child_process.execSync` pour les commandes Git
- Regex pour le parsing des tâches
- Template strings pour la génération de contenu

## 🔍 Debugging

En cas de problème :

1. Utilisez `npm run context:update:verbose` pour plus d'infos
2. Vérifiez que vous êtes sur une branche de spec (format: `NNN-nom-spec`)
3. Assurez-vous que `specs/*/tasks.md` existe
4. Vérifiez les permissions d'écriture sur CLAUDE.md et STATUS.md

## 🎯 Résultat

Après exécution, `CLAUDE.md` contiendra une section auto-générée comme :

```markdown
<!-- AUTO-GENERATED CONTEXT - 2025-09-10 19:54:27 -->
## 🎯 Current Context (Auto-Detected)
**Active Spec**: 005-complete-card-management
**Current Task**: T044 - Complete E2E test suite...
**Progress**: 13/15 tasks (87%)
**Branch**: 005-complete-card-management
**Last Update**: 2025-09-10 19:54:27

### 📋 Quick Status
- **Completed**: 13 tasks ✅
- **Remaining**: 2 tasks
- **Directory**: `specs/005-complete-card-management/`
- **Tasks File**: `specs/005-complete-card-management/tasks.md`
<!-- END AUTO-GENERATED CONTEXT -->
```

Cela garantit que les agents IA ont toujours le contexte correct et à jour ! 🚀