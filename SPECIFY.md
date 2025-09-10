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

**⚠️ Note**: Specify a des conflits avec le dossier `tests/`. Utilisez les commandes manuellement ou depuis un autre dossier temporairement.

### Workflow manuel (recommandé)
```bash
# 1. Créer une nouvelle branche git
git checkout -b feature/new-feature-name

# 2. Créer le dossier spec manuellement  
mkdir -p specs/002-new-feature-name

# 3. Copier le template
cp templates/spec-template.md specs/002-new-feature-name/spec.md

# 4. Éditer le fichier spec avec les requirements
```

### Commandes Specify (si disponibles)
```bash
# Note: Ces commandes peuvent ne pas fonctionner à cause du dossier tests/

# Créer une nouvelle spec avec workflow
specify create "Feature Name" --path specs/

# Valider les spécifications  
specify validate specs/001-extract-current-project/spec.md

# Générer la documentation
specify generate --output docs/

# Lister les features en cours
specify list --path specs/
```

### Alternative : Commandes Git standard
```bash
# Créer et démarrer une feature
git checkout -b feature/new-feature
mkdir -p specs/$(date +%03d)-new-feature

# Finaliser une feature
git commit -m "feat: implement new feature"
git checkout main && git merge feature/new-feature
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

### ⛔ Scripts Désactivés (conflits avec dossier tests/)
- `create-new-feature.sh/.bat` → Workflow manuel Git
- `setup-plan.sh/.bat` → Workflow manuel Git  
- `check-task-prerequisites.sh/.bat` → Validation manuelle
- `npm run spec:*` → Commandes Git standard

### ✅ Workflow Manuel Recommandé
```bash
# Au lieu de npm run spec:create
git checkout -b feature/new-feature
mkdir -p specs/002-new-feature && cp templates/spec-template.md specs/002-new-feature/spec.md

# Au lieu de npm run spec:plan  
# Éditer specs/002-new-feature/spec.md avec les détails

# Au lieu de npm run spec:check
git status && npm run typecheck && npm run test:unit
```

## 🎯 Workflow Recommandé (Manuel)

1. **Créer une feature**
   ```bash
   git checkout -b feature/advanced-combat-system
   mkdir -p specs/002-advanced-combat-system
   ```

2. **Créer la spécification**
   ```bash
   cp templates/spec-template.md specs/002-advanced-combat-system/spec.md
   # Éditer le fichier avec les requirements
   ```

3. **Développer en suivant la spec**
   ```bash
   # TDD workflow standard
   npm run test:watch
   ```

4. **Valider avant merge**
   ```bash
   npm run typecheck
   npm run test:unit
   npm run build
   ```

5. **Finaliser la feature**
   ```bash
   git commit -m "feat: implement advanced combat system"
   git checkout main && git merge feature/advanced-combat-system
   ```

## 📚 Documentation Générée

La documentation est générée automatiquement dans `docs/specifications/` avec :
- Index des spécifications
- Liens croisés entre specs
- État des implémentations  
- Métriques de progression

---

**Note**: Les anciens scripts spec-kit ont été désactivés (`.disabled`) pour éviter les conflits avec Specify.