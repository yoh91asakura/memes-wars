# Instructions pour Claude - Emoji Mayhem TCG

## Contexte du Projet

**Nom**: The Meme Wars (Emoji Mayhem TCG)  
**Type**: Trading Card Game avec système de roll RNG et combat bullet hell  
**Stack**: React + TypeScript + Vite + TailwindCSS  
**Architecture**: MCP avec Archon pour la gestion des tâches  
**Project ID Archon**: `196233ba-fbac-4ada-b0f9-37658c0e73ea`  
**Hooks**: Système de hooks automatiques obligatoires (`hooks/emoji-mayhem-hooks.ts`)

---

## 🪝 HOOKS OBLIGATOIRES - À UTILISER À CHAQUE ÉTAPE

### ⚡ Hooks Principaux (TOUJOURS utiliser)

#### 1. `beforeTaskStart(taskId)` - AVANT chaque tâche
```typescript
// OBLIGATOIRE au début de TOUTE tâche
import { hooks } from './hooks/emoji-mayhem-hooks';
await hooks.beforeTaskStart('81add012-996b-4e5a-b0e0-b98199238b2d');

// Ce hook fait automatiquement:
// ✅ Vérifie que Archon est actif
// ✅ Synchronise avec Git
// ✅ Installe les dépendances si nécessaire
// ✅ Met le statut de la tâche à "doing"
// ✅ Crée une branche git pour la tâche
```

#### 2. `afterTaskComplete(taskId)` - APRÈS chaque tâche
```typescript
// OBLIGATOIRE après avoir terminé l'implémentation
await hooks.afterTaskComplete('81add012-996b-4e5a-b0e0-b98199238b2d');

// Ce hook fait automatiquement:
// ✅ Lance tous les tests
// ✅ Vérifie le coverage (doit être >= 90%)
// ✅ Lint le code
// ✅ Commit les changements
// ✅ Met le statut à "review" si tout passe
// ❌ Bloque si des erreurs sont détectées
```

### 🃏 Hooks Spécifiques aux Cartes

#### 3. `beforeCardCreation(rarity)` - AVANT de créer des cartes
```typescript
// Pour les tâches de création de cartes
await hooks.beforeCardCreation('common'); // ou 'uncommon', 'rare', 'epic', etc.

// Ce hook:
// ✅ Crée la structure de dossiers
// ✅ Charge les templates
// ✅ Vérifie les cartes existantes
// ✅ Prépare l'environnement
```

#### 4. `afterCardCreation(rarity, cards)` - APRÈS avoir créé des cartes
```typescript
// Après avoir défini les cartes
const commonCards = [...]; // les 10 cartes créées
await hooks.afterCardCreation('common', commonCards);

// Ce hook:
// ✅ Valide les stats (HP, AS dans les bonnes plages)
// ✅ Génère automatiquement les tests
// ✅ Met à jour le RollService
// ✅ Met à jour la documentation
// ❌ Échoue si les stats sont invalides
```

### 🔧 Hooks de Développement

#### 5. `beforeDevServer()` - Avant npm run dev
```typescript
// Automatiquement appelé par npm run dev
await hooks.beforeDevServer();

// Vérifie:
// ✅ Archon est actif (le démarre sinon)
// ✅ Nettoie les fichiers temporaires
// ✅ Compile TypeScript
```

#### 6. `preCommitHook()` - Avant chaque commit
```typescript
// Automatiquement via git hooks
const canCommit = await hooks.preCommitHook();

// Vérifie TOUT:
// ✅ Tests passants
// ✅ Lint sans erreurs
// ✅ TypeScript sans erreurs
// ✅ Coverage >= 90%
// ❌ Bloque le commit si un check échoue
```

---

## 📋 Workflow avec Hooks Intégrés

### 1. Démarrage d'une nouvelle tâche

```bash
# 1. Récupérer l'ID de la tâche depuis Archon UI
# 2. Dans le code, TOUJOURS commencer par:
await hooks.beforeTaskStart('task-id-from-archon');

# 3. Le hook prépare automatiquement tout l'environnement
```

### 2. Développement de cartes (exemple Common)

```typescript
// ÉTAPE 1: Préparation
await hooks.beforeTaskStart('81add012-996b-4e5a-b0e0-b98199238b2d');
await hooks.beforeCardCreation('common');

// ÉTAPE 2: Créer les cartes
const commonCards: ICommonCard[] = [
  {
    id: 'common_001',
    name: 'Happy Face',
    rarity: 'common',
    hp: 15,
    attackSpeed: 0.7,
    emojis: ['😊'],
    passive: { type: 'heal', value: 1 }
  },
  // ... 9 autres cartes
];

// ÉTAPE 3: Validation et intégration
await hooks.afterCardCreation('common', commonCards);

// ÉTAPE 4: Finalisation
await hooks.afterTaskComplete('81add012-996b-4e5a-b0e0-b98199238b2d');
```

### 3. Développement de services (exemple DeckService)

```typescript
// ÉTAPE 1: Préparation
await hooks.beforeTaskStart('deck-service-task-id');

// ÉTAPE 2: Implémenter le service
// ... code du DeckService ...

// ÉTAPE 3: Finalisation (tests automatiques)
await hooks.afterTaskComplete('deck-service-task-id');
```

---

## ⚠️ RÈGLES CRITIQUES

### ❌ NE JAMAIS:
- Skip les hooks "pour aller plus vite"
- Commiter sans que `preCommitHook()` passe
- Créer des cartes sans les hooks de validation
- Ignorer les erreurs des hooks

### ✅ TOUJOURS:
- Appeler `beforeTaskStart()` en PREMIER
- Appeler `afterTaskComplete()` en DERNIER
- Utiliser les hooks de cartes pour TOUTES les tâches Cards
- Attendre que tous les checks soient verts

---

## 📊 Validation Automatique par les Hooks

Les hooks vérifient automatiquement:

| Check | Seuil | Hook |
|-------|-------|------|
| Coverage Tests | >= 90% | `afterTaskComplete()` |
| TypeScript | 0 erreurs | `preCommitHook()` |
| ESLint | 0 erreurs | `afterTaskComplete()` |
| Stats des cartes | Dans les plages | `afterCardCreation()` |
| Archon actif | Obligatoire | `beforeTaskStart()` |
| Bundle size | < 5MB | `afterBuild()` |

---

## 🎯 Tâches Actuelles dans Archon

| Priorité | Tâche | ID | Status |
|----------|-------|-----|--------|
| 19 | Créer les 10 cartes Common | 81add012-... | TODO |
| 17 | Créer les 10 cartes Uncommon | xxx | TODO |
| 15 | Créer les 10 cartes Rare | xxx | TODO |
| 13 | Créer les 8 cartes Epic | xxx | TODO |
| 11 | Créer les 6 cartes Legendary | xxx | TODO |
| 9 | Créer les 4 cartes Mythic | xxx | TODO |
| 7 | Créer la carte Cosmic | xxx | TODO |
| 5 | Créer DeckService | xxx | TODO |
| 3 | Créer CombatEngine | xxx | TODO |
| 1 | Créer DeckBuilder UI | xxx | TODO |

---

## 🔍 Commandes de Vérification

```bash
# Vérifier l'état des hooks
npm run hooks:status

# Lancer manuellement le hook pre-commit
npm run hooks:pre-commit

# Vérifier une tâche spécifique
npm run hooks:check-task <task-id>

# Nettoyer et réinitialiser
npm run hooks:clean
```

---

## 📝 Exemple Complet: Créer les cartes Common

```typescript
// 1. Import des hooks
import { hooks } from './hooks/emoji-mayhem-hooks';
import type { ICommonCard } from './src/types/cards';

// 2. Démarrage de la tâche
async function createCommonCards() {
  // Hook de début OBLIGATOIRE
  await hooks.beforeTaskStart('81add012-996b-4e5a-b0e0-b98199238b2d');
  
  // Hook spécifique aux cartes
  await hooks.beforeCardCreation('common');
  
  // 3. Définition des cartes
  const commonCards: ICommonCard[] = [
    {
      id: 'common_001',
      name: 'Smiley',
      rarity: 'common',
      hp: 15,              // Entre 10-20 ✅
      attackSpeed: 0.8,    // Entre 0.5-1.0 ✅
      emojis: ['😊'],
      glowColor: '#ffffff',
      passive: {
        type: 'heal',
        value: 1
      },
      description: 'Heals 1 HP per turn'
    },
    // ... 9 autres cartes avec stats valides
  ];
  
  // 4. Validation et intégration automatique
  await hooks.afterCardCreation('common', commonCards);
  
  // 5. Finalisation de la tâche
  await hooks.afterTaskComplete('81add012-996b-4e5a-b0e0-b98199238b2d');
  
  console.log('✅ Cartes Common créées avec succès!');
}

// Exécution
createCommonCards().catch(console.error);
```

---

## 🚨 En cas d'erreur

Si un hook échoue:

1. **Lire le message d'erreur** - Il indique précisément le problème
2. **Corriger le problème** - Tests, coverage, lint, etc.
3. **Relancer le hook** - Il re-vérifiera tout
4. **Si bloqué** - Les hooks ont une fonction `onError()` qui suggère des solutions

```typescript
// Le hook capture et analyse les erreurs
await hooks.onError(error, 'Context de l\'erreur');
// Affiche des suggestions de résolution
```

---

**RAPPEL FINAL**: Les hooks sont OBLIGATOIRES. Ils garantissent la qualité du code et l'intégration correcte avec Archon. Ne JAMAIS les ignorer ou les contourner.
