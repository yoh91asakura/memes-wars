# 🔧 Local Development Environment Setup

This guide helps you set up your local development environment for The Meme Wars project.

## ⚠️ Important Note

**ALL development tools and configurations are LOCAL and NOT versioned in Git.**

Each developer must set up their own environment. This ensures:
- No conflicts between different OS configurations (Windows/Mac/Linux)
- Clean repository with only application code
- Freedom to use your preferred tools

## 📋 What You Get From Git

When you clone this repository, you get:
- ✅ Application source code (`/src`)
- ✅ Tests (`/tests`)
- ✅ Game configuration (`/config`)
- ✅ Package dependencies (`package.json`)
- ✅ Build configuration

## 🛠️ What You Need to Set Up Locally

### 1. Basic Development (Required)

```bash
# Clone and install
git clone <repo-url>
cd the-meme-wars
npm install

# Start development
npm run dev
```

### 2. Archon Task Management (Optional)

If you want to use Archon for task management:

```bash
# Create local archon directory (ignored by git)
mkdir archon
cd archon

# Option A: Use Docker
docker run -p 8181:8181 archon:latest

# Option B: Set up manually
# Download from: https://github.com/archon-project
```

### 3. Claude Flow / AI Tools (Optional)

If you're using AI-assisted development:

```bash
# Create local directories (all ignored by git)
mkdir .claude
mkdir .claude-flow
mkdir memory

# Install Claude Flow
npm install -g claude-flow@alpha

# Initialize your local configuration
npx claude-flow@alpha init
```

### 4. VS Code Configuration (Optional)

Create your own `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "archon/": true,
    ".claude/": true,
    ".claude-flow/": true,
    "memory/": true
  }
}
```

### 5. Environment Variables (Optional)

Create `.env.local` for your environment:

```bash
# Your local settings (not versioned)
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

## 📁 Recommended Local Structure

After setup, your local directory should look like:

```
the-meme-wars/
├── src/              # ✅ From Git
├── tests/            # ✅ From Git
├── config/           # ✅ From Git
├── public/           # ✅ From Git
├── node_modules/     # ✅ From npm install
├── archon/           # ❌ Local only (your setup)
├── .claude/          # ❌ Local only (your config)
├── .claude-flow/     # ❌ Local only (your config)
├── .vscode/          # ❌ Local only (your preferences)
├── memory/           # ❌ Local only (AI memory)
└── tasks/            # ❌ Local only (task tracking)
```

## 🚫 What NOT to Commit

The `.gitignore` is configured to exclude:
- All local development tools
- Platform-specific configurations
- Personal IDE settings
- Local databases
- Task management files
- AI tool configurations

## ✅ What TO Commit

Only commit:
- Application code changes in `/src`
- Test files in `/tests`
- Game configuration updates
- Documentation updates (only if they're about the game itself)

## 🔄 Syncing With Others

When working with a team:

```bash
# Get latest code
git pull

# Your local tools remain untouched
# Only application code is updated

# Make your changes
git add src/ tests/
git commit -m "feat: your feature"
git push
```

## 💡 Tips

1. **Keep it Simple**: Start with just `npm install` and `npm run dev`
2. **Add Tools Gradually**: Only set up tools you actually need
3. **Document Locally**: Keep your own notes in untracked files
4. **Use .local Extension**: Any file ending in `.local.*` is ignored
5. **Platform Freedom**: Use Windows, Mac, or Linux - your choice!

## 🆘 Troubleshooting

### Port Conflicts
- Dev server: 5173 (change in `vite.config.ts` if needed)
- Archon: 8181 (if you use it)

### Missing Dependencies
```bash
npm install
```

### TypeScript Errors
```bash
npm run typecheck
```

### Test Issues
```bash
npm run test
```

## 📚 Resources

- Application code documentation: See source code comments
- Development workflow: `docs/CLAUDE.md` (the only workflow doc in Git)
- Your own notes: Create any `.local.md` files you want

---

**Remember**: This is YOUR local environment. Set it up however works best for you!
