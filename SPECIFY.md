# 🔧 Specify - Gestion des Spécifications

## 📋 Configuration

Le projet utilise **Specify** pour la gestion des spécifications et des workflows de développement.

### Installation
```bash
npm install -g specify
```

### Configuration
Le fichier `.specify.json` configure :
- **Chemin des specs** : `specs/`
- **Templates** : `templates/spec-template.md`
- **Sortie docs** : `docs/specifications/`

## 🚀 Commandes Specify

### Créer une nouvelle spécification
```bash
# Créer une nouvelle spec avec workflow
specify create "Feature Name"

# Créer une spec dans un dossier spécifique
specify create "Feature Name" --path specs/new-feature
```

### Valider les spécifications
```bash
# Valider toutes les specs
specify validate

# Valider une spec spécifique
specify validate specs/001-extract-current-project/spec.md
```

### Générer la documentation
```bash
# Générer la doc complète
specify generate

# Générer pour une spec spécifique
specify generate --spec 001-extract-current-project
```

### Workflow de développement
```bash
# Démarrer un workflow de feature
specify start "Feature Name"

# Finaliser une feature
specify complete

# Lister les features en cours
specify list
```

## 📁 Structure des Spécifications

```
specs/
├── 001-extract-current-project/     # Core game implementation
│   ├── spec.md                      # Specification principale  
│   ├── plan.md                      # Plan d'implémentation
│   ├── tasks.md                     # Tâches détaillées
│   └── contracts/                   # Contrats de services
└── 004-refactor-all-the/            # Refactoring & AI optimization
    ├── spec.md                      # Spec de refactoring
    ├── research.md                  # Recherches & best practices
    └── contracts/                   # Contrats AI services
```

## 🔄 Migration des Scripts

### ⛔ Scripts Désactivés (remplacés par Specify)
- `create-new-feature.sh/.bat` → `specify create`
- `setup-plan.sh/.bat` → `specify start`  
- `check-task-prerequisites.sh/.bat` → `specify validate`

### ✅ Commandes Disponibles
```bash
# Au lieu de npm run spec:create
specify create "New Feature"

# Au lieu de npm run spec:plan  
specify start "Feature Name"

# Au lieu de npm run spec:check
specify validate
```

## 🎯 Workflow Recommandé

1. **Créer une feature**
   ```bash
   specify create "Advanced Combat System"
   ```

2. **Planifier l'implémentation**
   ```bash
   specify start "Advanced Combat System"
   ```

3. **Développer en suivant la spec**
   ```bash
   # Développement normal avec git
   git checkout feature/advanced-combat-system
   ```

4. **Valider avant merge**
   ```bash
   specify validate
   specify generate
   ```

5. **Finaliser la feature**
   ```bash
   specify complete
   ```

## 📚 Documentation Générée

La documentation est générée automatiquement dans `docs/specifications/` avec :
- Index des spécifications
- Liens croisés entre specs
- État des implémentations  
- Métriques de progression

---

**Note**: Les anciens scripts spec-kit ont été désactivés (`.disabled`) pour éviter les conflits avec Specify.