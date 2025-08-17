# 🤖 Guide du Workflow pour Agents IA - Emoji Mayhem TCG

## 📊 Score Actuel: 90/100 (Grade A)

Ce document explique le workflow de développement que tous les agents IA doivent suivre pour maintenir la qualité du code et atteindre 100/100.

---

## 🚨 RÈGLES CRITIQUES À SUIVRE

### ❌ NE JAMAIS:
- Travailler directement sur la branche `main`
- Commiter sans passer les tests
- Ignorer les erreurs TypeScript
- Pousser du code non formaté
- Créer des commits sans message descriptif

### ✅ TOUJOURS:
- Créer une branche de tâche avant de coder
- Vérifier le score du workflow avec `npm run workflow:score`
- Utiliser les hooks automatiques du projet
- Documenter les changements importants
- Suivre le workflow Git Flow

---

## 🎯 Workflow Standard pour Chaque Tâche

### 1️⃣ **Avant de Commencer une Tâche**

```bash
# Vérifier le statut actuel
git status

# Si des changements non commités existent, utiliser:
npm run workflow:migrate

# Sinon, créer une nouvelle branche
git checkout -b task/[nom-de-la-tache]
# Exemple: git checkout -b task/add-legendary-cards
```

### 2️⃣ **Pendant le Développement**

```bash
# Lancer le serveur de développement (avec hooks automatiques)
npm run dev

# Vérifier régulièrement:
npm run typecheck    # Pas d'erreurs TypeScript
npm run lint         # Code propre
npm test            # Tests passent
```

### 3️⃣ **Avant de Commiter**

```bash
# Formater le code
npm run format

# Valider tout
npm run validate

# Le hook pre-commit vérifiera automatiquement:
# - TypeScript ✓
# - ESLint ✓
# - Tests ✓
# - Secrets ✓
# - Branch name ✓
```

### 4️⃣ **Commit et Push**

```bash
# Commit avec message descriptif
git add .
git commit -m "type: description claire de la modification"

# Types de commit:
# - feat: nouvelle fonctionnalité
# - fix: correction de bug
# - docs: documentation
# - style: formatage
# - refactor: refactoring
# - test: ajout de tests
# - chore: maintenance

# Push vers la branche
git push -u origin HEAD
```

### 5️⃣ **Créer une Pull Request**

1. Aller sur GitHub/GitLab
2. Créer une PR vers `develop` (pas `main`)
3. Attendre la validation CI/CD
4. Demander une review
5. Merger après approbation

---

## 📁 Structure des Fichiers Importants

```
The Meme Wars/
├── .husky/               # Hooks Git automatiques
│   └── pre-commit       # Validations avant commit
├── .github/
│   └── workflows/       # Pipeline CI/CD
│       └── ci-cd.yml   # Tests, build, deploy
├── hooks/               # Hooks du projet
│   └── emoji-mayhem-hooks.ts
├── scripts/
│   ├── migrate-to-task-branches.ts  # Migration branches
│   └── workflow-score.ts            # Calcul du score
├── monitoring/
│   └── dashboard.html   # Dashboard métriques
├── vitest.config.ts    # Config tests (90% coverage requis)
├── eslint.config.js    # Config linting
└── .prettierrc         # Config formatage
```

---

## 🛠️ Scripts NPM Disponibles

### Développement
- `npm run dev` - Serveur de développement avec hooks
- `npm run build` - Build de production
- `npm test` - Lancer les tests
- `npm run test:coverage` - Tests avec coverage

### Qualité du Code
- `npm run lint` - Vérifier le linting
- `npm run lint:fix` - Corriger le linting
- `npm run format` - Formater le code
- `npm run typecheck` - Vérifier TypeScript
- `npm run validate` - Tout valider d'un coup

### Workflow
- `npm run workflow:migrate` - Migrer vers branches de tâches
- `npm run workflow:score` - Vérifier le score (actuellement 90/100)
- `npm run monitoring` - Ouvrir le dashboard

---

## 📈 Comment Atteindre 100/100

**Score actuel: 90/100**

Il manque seulement:
- **Workflow de branches respecté (+10 pts)**

Pour obtenir ces 10 points:
1. Ne JAMAIS travailler sur `main` directement
2. Toujours créer des branches `task/` ou `feature/`
3. Utiliser `npm run workflow:migrate` si nécessaire

---

## 🔄 Pipeline CI/CD Automatique

Chaque push déclenche automatiquement:

1. **Quality Checks**
   - TypeScript validation
   - ESLint
   - Tests avec coverage
   - Seuil minimum: 90%

2. **Build**
   - Compilation TypeScript
   - Build Vite
   - Upload artifacts

3. **Performance**
   - Lighthouse CI
   - Bundle size check (max 5MB)

4. **Deploy**
   - Preview sur PR
   - Production sur merge to main

---

## 🚀 Commandes Rapides

```bash
# Nouveau développement
git checkout -b task/ma-tache
npm run dev

# Avant de commiter
npm run validate
git add .
git commit -m "feat: description"
git push

# Vérifier le workflow
npm run workflow:score

# Si bloqué sur main avec des changements
npm run workflow:migrate
```

---

## 📊 Monitoring

Ouvrir le dashboard: `npm run monitoring`

Métriques surveillées:
- Coverage tests (objectif: >90%)
- Build time (<5s)
- Bundle size (<5MB)
- TypeScript errors (0)
- Statut des services

---

## ⚠️ Troubleshooting

### "Cannot commit to main branch"
```bash
git checkout -b task/fix-urgente
git push -u origin HEAD
```

### "Tests failing"
```bash
npm test -- --watch
# Corriger les tests
npm run test:coverage
```

### "TypeScript errors"
```bash
npm run typecheck
# Corriger les erreurs
```

### "Score workflow < 90"
```bash
npm run workflow:score
# Suivre les recommandations affichées
```

---

## 📝 Checklist Avant Chaque Tâche

- [ ] Branch de tâche créée (`task/` ou `feature/`)
- [ ] Tests écrits ou mis à jour
- [ ] TypeScript sans erreurs
- [ ] Code formaté avec Prettier
- [ ] ESLint sans warnings
- [ ] Coverage > 90%
- [ ] Commit message descriptif
- [ ] PR créée vers `develop`

---

## 🎯 Objectif Final

**Atteindre et maintenir un score de 100/100**

Cela garantit:
- 🔒 Code sécurisé et testé
- 🚀 Déploiements automatiques fiables
- 📊 Métriques de qualité excellentes
- 👥 Collaboration efficace
- 📈 Maintenabilité à long terme

---

## 💡 Tips pour les Agents

1. **Utiliser les hooks**: Ils automatisent beaucoup de validations
2. **Branches descriptives**: `task/add-rare-cards` plutôt que `task/123`
3. **Commits atomiques**: Un commit = un changement logique
4. **Tests first**: Écrire les tests avant le code (TDD)
5. **Documentation**: Commenter le code complexe

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifier ce guide
2. Lancer `npm run workflow:score` pour diagnostic
3. Consulter `GIT_WORKFLOW_COMPLIANCE.md`
4. Vérifier le dashboard monitoring

---

**Dernière mise à jour**: 17/08/2025
**Version du workflow**: 2.0
**Score actuel**: 90/100 (Grade A)
