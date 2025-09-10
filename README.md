# 🎮 Memes Wars - Auto-Battler RNG Card Game

**Un jeu de cartes addictif avec système d'émojis et combat automatique**

Auto-battler RNG card game complet avec système de roll gacha, combat automatique, progression par stages, et boucle de jeu addictive de 30s-2min.

## ✅ **Core Game Loop COMPLET**

```
ROLL → Obtenir nouvelles cartes (gold/tickets)
  ↓
EQUIP → Construire deck optimal (limites évolutives)  
  ↓
BATTLE → Combat automatique vs IA adaptée
  ↓
REWARD → Gold, tickets, XP, bonus performance
  ↓
REPEAT → Progression automatique vers stage suivant
```

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Ouvrir http://localhost:3000
# Aller sur "Combat" pour tester la boucle complète
```

### 🎯 Test Rapide du Core Game Loop
1. **Lancer le jeu** : `npm run dev` → http://localhost:3000
2. **Page Combat** : Combat automatique avec IA (30s-2min)
3. **Voir les récompenses** : Gold + tickets distribués automatiquement
4. **Progression** : Avancement automatique au stage suivant
5. **Répéter** : Boucle addictive complète fonctionnelle

## 🎮 Fonctionnalités Implémentées

### ✅ **Systèmes Centraux COMPLETS**
- **RollService** : Système gacha avec pity system multi-niveaux
- **CombatEngine** : Combat automatique avec projectiles émoji
- **RewardService** : Récompenses avec bonus performance (perfect victory, speed)
- **AIMatchmakingService** : Génération d'IA adaptée au stage
- **CurrencyStore** : Économie complète (gold, tickets, gems)
- **StageSystem** : 50+ stages avec progression automatique

### ✅ **Interface Utilisateur**
- Combat automatique avec arène visuelle
- Affichage temps réel des devises (gold/tickets)
- Modal de récompenses post-combat
- Progression par stages avec informations de difficulté
- Système de pity visuel pour les rolls

### ✅ **Économie Intégrée**
- **Gold** → Acheter des rolls de cartes
- **Tickets** → Obtenus en combat, utilisés pour rolls
- **Performance bonus** → Perfect victory (+50%), Speed bonus (+25%)
- **Progression** → Rewards augmentent avec difficulté du stage

## 🚀 **Spec-Kit Development Workflow**

Ce projet utilise un système de spec-kit optimisé pour le développement assisté par IA avec Claude Code.

### 🎯 **Feature Development Cycle**
```bash
# 1. Créer une nouvelle feature specification
bash scripts/create-new-feature.sh "description de la feature"

# 2. Setup du plan d'implémentation  
bash scripts/setup-plan.sh

# 3. Suivre le cycle TDD avec les tasks générées
npm run test:watch  # Red-Green-Refactor

# 4. Documentation automatiquement synchronisée
```

### 📋 **Spec Structure**
```
specs/XXX-feature-name/
├── spec.md              # Requirements fonctionnels
├── plan.md              # Plan d'implémentation  
├── research.md          # Décisions techniques
├── data-model.md        # Modèles de données
├── quickstart.md        # Guide développeur
├── tasks.md             # Tasks d'implémentation
└── contracts/           # Interfaces des services
```

### 🤖 **AI-Optimized Development**
- **Claude Code Integration** : CLAUDE.md maintient le contexte projet  
- **Cross-Platform Scripts** : Compatible Windows/Mac/Linux
- **Atomic Design Pattern** : Structure claire pour navigation IA
- **Constitutional TDD** : Tests → Implementation strict workflow

## 📁 Architecture du Projet

```
src/
├── components/          # Interface React (Atomic Design)
│   ├── atoms/          # Button, Input, Badge
│   ├── molecules/      # Card, PlayerHealth  
│   ├── organisms/      # CombatArena, RollPanel
│   └── pages/         # CombatPage (core loop)
├── services/           # Logique métier
│   ├── RollService.ts     # Système gacha + pity
│   ├── CombatEngine.ts    # Combat automatique
│   ├── RewardService.ts   # ✅ NEW: Calcul récompenses
│   ├── AIMatchmakingService.ts # ✅ NEW: IA adaptée
│   └── StageService.ts    # ✅ NEW: Progression stages
├── stores/             # État global (Zustand)
│   ├── rollStore.ts       # Historique rolls + pity
│   ├── combatStore.ts     # État combat
│   ├── currencyStore.ts   # ✅ NEW: Économie complète
│   └── stageStore.ts      # Progression stages
├── data/
│   ├── cards/         # 200+ cartes avec émojis
│   └── stages.ts      # 50+ stages avec boss
└── models/            # Types TypeScript
```

## 📋 Documentation Complète

### 🎯 **Active Development**
- **🔄 Current Refactoring** : `/specs/004-refactor-all-the/`
  - `spec.md` - 30 functional requirements for AI optimization
  - `tasks.md` - Refactoring tasks (Documentation & Structure phases)
  - `quickstart.md` - Developer onboarding with spec-kit workflows

### ✅ **Completed Implementation**
- **📊 Game Loop Specs** : `/specs/001-extract-current-project/`
  - `spec.md` - Core game mechanics (31 requirements complete)
  - `contracts/` - Service interfaces (operational)
  - `data-model.md` - Game entities and relationships

### 🤖 **AI Development Context**
- **🔧 Primary AI Context** : `/CLAUDE.md` (optimized for Claude Code)
- **📋 Spec-Kit System** : Feature-driven development with AI collaboration

## 📋 Scripts Disponibles

```bash
# Development
npm run dev          # Serveur de développement
npm run build        # Build de production  

# Testing (Constitutional TDD Order)
npm run test:contract      # Contract tests (Interface definitions)
npm run test:integration   # Integration tests (Service interactions)
npm run test:e2e          # E2E tests (Full workflows)
npm run test              # All unit tests
npm run test:watch        # TDD development mode

# Code Quality
npm run lint         # Vérification du code
npm run typecheck    # Vérification TypeScript

# Spec-Kit Development  
npm run validate:spec-kit  # Validate spec-kit compliance
```

## 🏗️ Structure du Projet

```
src/
├── components/      # Composants React (atoms, molecules, organisms)
├── data/           # Données des cartes
├── hooks/          # Hooks personnalisés
├── models/         # Types et modèles
├── services/       # Logique métier
├── stores/         # État global (Zustand)
├── styles/         # Styles CSS
└── utils/          # Utilitaires
```

## 🎯 Technologies

- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **Zustand** - État global
- **Styled Components** - CSS-in-JS
- **React Query** - Gestion des données
- **Framer Motion** - Animations

## 🎮 Fonctionnalités

- ✅ Collection de cartes mème
- ✅ Système de combat tactique
- ✅ Builder de deck
- ✅ Interface responsive
- ✅ Animations fluides
- ✅ Persistance locale

## 🐛 Notes de Développement

Le projet est maintenant nettoyé et optimisé pour le développement. 
Les erreurs TypeScript restantes sont liées aux incohérences dans les modèles de cartes et peuvent être corrigées progressivement.

## 📄 License

MIT
