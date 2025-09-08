# 🎮 Meme Wars - Card Game

Un jeu de cartes modernes basé sur les mèmes avec mécaniques de combat et collection.

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Ouvrir http://localhost:3000
```

## 📦 Contenu du Projet

Ce projet contient une application de jeu de cartes complète et nettoyée.

### 📁 Structure
- `/src` - Code source de l'application
- `/backend` - API et logique serveur
- `/config` - Configuration du jeu
- `package.json` - Dépendances nettoyées
- `tsconfig.json` - Configuration TypeScript
- `vite.config.ts` - Configuration de build

## 📋 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production  
npm run test         # Tests unitaires
npm run lint         # Vérification du code
npm run typecheck    # Vérification TypeScript
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
