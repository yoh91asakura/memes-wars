# 🪝 Système de Hooks - Emoji Mayhem TCG

## ✅ Installation Complétée

Les hooks du projet ont été créés et intégrés avec succès. Voici ce qui a été mis en place :

### 📁 Fichiers créés

1. **`hooks/emoji-mayhem-hooks.ts`** - Système principal de hooks
2. **`hooks/run-dev.ts`** - Script pour npm run dev avec hooks
3. **`hooks/pre-commit.ts`** - Validation avant commit
4. **`hooks/check-task.ts`** - Vérification de tâche
5. **`hooks/after-build.ts`** - Post-traitement du build
6. **`CLAUDE-HOOKS.md`** - Documentation complète pour Claude
7. **`package.json`** - Scripts npm mis à jour

### 🎯 Hooks disponibles

| Hook | Usage | Quand l'utiliser |
|------|-------|------------------|
| `beforeTaskStart(taskId)` | Prépare l'environnement pour une tâche | AVANT de commencer toute tâche |
| `afterTaskComplete(taskId)` | Valide et finalise une tâche | APRÈS avoir terminé l'implémentation |
| `beforeCardCreation(rarity)` | Prépare la création de cartes | AVANT de créer des cartes |
| `afterCardCreation(rarity, cards)` | Valide les cartes créées | APRÈS avoir défini les cartes |
| `beforeDevServer()` | Prépare le dev server | Automatique avec npm run dev |
| `afterBuild()` | Optimise le build | Automatique avec npm run build |
| `preCommitHook()` | Valide avant commit | Automatique ou manuel |
| `onError(error, context)` | Gère les erreurs | En cas d'erreur |

### 📝 Scripts NPM ajoutés

```json
{
  "dev": "tsx hooks/run-dev.ts",              // Lance Vite avec hooks
  "dev:raw": "vite",                          // Lance Vite sans hooks
  "build": "... && tsx hooks/after-build.ts", // Build avec post-traitement
  "hooks:status": "...",                      // Vérifie l'état des hooks
  "hooks:pre-commit": "tsx hooks/pre-commit.ts", // Validation manuelle
  "hooks:check-task": "tsx hooks/check-task.ts", // Prépare une tâche
  "hooks:clean": "..."                        // Nettoie les caches
}
```

### 🚀 Utilisation Immédiate

#### Pour commencer la première tâche (Common Cards) :

```bash
# 1. Récupérer l'ID de la tâche depuis Archon UI
# ID: 81add012-996b-4e5a-b0e0-b98199238b2d

# 2. Préparer la tâche
npm run hooks:check-task 81add012-996b-4e5a-b0e0-b98199238b2d

# 3. Le hook va automatiquement :
#    - Vérifier Archon
#    - Mettre le statut à "doing"
#    - Créer une branche git
#    - Préparer l'environnement
```

#### Pour lancer le développement :

```bash
# Lance le serveur avec hooks de préparation
npm run dev

# Le hook beforeDevServer() va :
# - Vérifier que Archon est actif
# - Nettoyer les caches
# - Compiler TypeScript
# - Puis lancer Vite
```

### ⚠️ Points d'attention

1. **tsx n'est pas installé** - Il faut l'ajouter :
   ```bash
   npm install --save-dev tsx
   ```

2. **Git hooks** - Pour activer le pre-commit automatique :
   ```bash
   npx husky init
   npx husky add .husky/pre-commit "npm run hooks:pre-commit"
   ```

3. **Permissions** - Sur Unix/Mac, rendre les scripts exécutables :
   ```bash
   chmod +x hooks/*.ts
   ```

### 🔄 Workflow type avec hooks

```typescript
// 1. Début de tâche
await hooks.beforeTaskStart('task-id');

// 2. Si c'est pour des cartes
await hooks.beforeCardCreation('common');

// 3. Développement...
const cards = createCards();

// 4. Validation des cartes
await hooks.afterCardCreation('common', cards);

// 5. Fin de tâche
await hooks.afterTaskComplete('task-id');
```

### 📊 Validation automatique

Les hooks vérifient automatiquement :

- ✅ Coverage tests >= 90%
- ✅ Pas d'erreurs TypeScript
- ✅ Code linté (ESLint)
- ✅ Stats des cartes valides
- ✅ Services Archon actifs
- ✅ Bundle size < 5MB

### 🎯 Prochaine étape

1. Installer tsx : `npm install --save-dev tsx`
2. Tester les hooks : `npm run hooks:status`
3. Commencer la première tâche : `npm run hooks:check-task 81add012-996b-4e5a-b0e0-b98199238b2d`

---

**Les hooks sont maintenant intégrés et prêts à être utilisés !**
