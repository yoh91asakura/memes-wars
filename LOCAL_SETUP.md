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

### 2. Testing with Playwright (Required for E2E Tests)

Playwright is used for end-to-end testing of the application:

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers (Chrome, Firefox, Safari)
npx playwright install

# Or install specific browsers only
npx playwright install chromium

# Run tests
npm run test:e2e

# Run tests in UI mode (interactive)
npx playwright test --ui

# Generate test reports
npx playwright show-report
```

### 3. Claude Flow / AI Tools (Required for AI Workflow)

Claude Flow manages AI-assisted development workflow:

```bash
# Create local directories (all ignored by git)
mkdir .claude
mkdir .claude-flow
mkdir memory

# Install Claude Flow globally
npm install -g claude-flow@alpha

# Initialize your local configuration
npx claude-flow@alpha init

# Configure Claude Flow (creates .claude-flow/config.json)
npx claude-flow@alpha config set apiKey YOUR_CLAUDE_API_KEY
npx claude-flow@alpha config set model claude-3-opus

# Start Claude Flow server (optional, for web UI)
npx claude-flow@alpha server --port 3001
```

#### Claude Flow Features:
- 📝 Task decomposition and planning
- 🤖 AI-powered code generation
- 📊 Progress tracking
- 💾 Memory persistence across sessions
- 🔄 Iterative development workflow

### 4. Archon Task Management (Optional)

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

### 5. Warp Terminal with MCP GitHub Integration (Optional)

**Warp** is an AI-powered terminal that integrates seamlessly with GitHub through MCP (Model Context Protocol).

#### Installation Steps:

1. **Install Warp Terminal** (if not already installed):
   - Download from: https://www.warp.dev/
   - Available for Windows, Mac, and Linux

2. **Install MCP GitHub Server**:
   ```powershell
   # Install globally via npm
   npm install -g @modelcontextprotocol/server-github
   ```

3. **Configure GitHub Token**:
   ```powershell
   # Create a GitHub Personal Access Token:
   # Go to GitHub → Settings → Developer settings → Personal access tokens
   # Create token with: repo, read:user permissions
   
   # Set environment variable (Windows PowerShell)
   [System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "your-token-here", "User")
   
   # Or for current session only
   $env:GITHUB_TOKEN = "your-token-here"
   ```

4. **Create MCP Configuration** (`%LOCALAPPDATA%\warp\mcp_config.json`):
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "mcp-server-github",
         "args": [],
         "env": {
           "GITHUB_TOKEN": "your-github-token"
         },
         "description": "GitHub MCP Server for repository operations"
       }
     }
   }
   ```

5. **Test the Setup**:
   ```powershell
   # Verify installation
   mcp-server-github --version
   
   # The server should respond and be ready to use
   ```

#### What You Can Do with Warp + MCP GitHub:
- 🔍 Search repositories and code
- 📝 Create and manage issues
- 🔀 Handle pull requests
- 📊 View repository statistics
- 🤖 AI-assisted Git operations
- 💬 Natural language GitHub interactions

### 6. VS Code Configuration (Recommended)

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

### 7. Environment Variables (Required for Full Setup)

Create `.env.local` for your environment:

```bash
# Core Application Settings
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
VITE_PORT=5173

# Claude Flow Integration
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_MODEL=claude-3-opus

# GitHub Integration (if using MCP)
GITHUB_TOKEN=your-github-token-here

# Archon Integration (if using)
ARCHON_API_URL=http://localhost:8181
ARCHON_API_KEY=your-archon-key

# Playwright Settings (optional)
PLAYWRIGHT_BROWSERS_PATH=0  # Use default location
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0  # Set to 1 to skip
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
├── .warp/            # ❌ Local only (Warp config, if using)
├── memory/           # ❌ Local only (AI memory)
├── tasks/            # ❌ Local only (task tracking)
└── .env.local        # ❌ Local only (your environment)
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

## 🚀 Complete Development Workflow

### Quick Start (Minimal Setup)
```bash
# 1. Clone and install
git clone <repo-url>
cd the-meme-wars
npm install

# 2. Start development
npm run dev
```

### Standard Setup (Recommended)
```bash
# 1. Clone repository
git clone <repo-url>
cd the-meme-wars

# 2. Install dependencies
npm install

# 3. Install Playwright for testing
npx playwright install

# 4. Install Claude Flow for AI workflow
npm install -g claude-flow@alpha
npx claude-flow@alpha init

# 5. Create environment file
cp .env.example .env.local
# Edit .env.local with your settings

# 6. Start development
npm run dev
```

### Full Power Setup (Advanced)
```bash
# 1. Complete Standard Setup first
# ... (steps 1-6 above)

# 2. Install Archon for task management
docker run -p 8181:8181 archon:latest

# 3. (Optional) Install MCP GitHub Server
npm install -g @modelcontextprotocol/server-github
$env:GITHUB_TOKEN = "your-token"

# 4. (Optional) Install Warp Terminal
# Download from https://www.warp.dev/

# 5. Start full development environment
npm run dev
npx claude-flow@alpha server --port 3001  # In another terminal
```

## 💡 Tips

1. **Keep it Simple**: Start with just `npm install` and `npm run dev`
2. **Essential Tools First**: Prioritize Playwright and Claude Flow for the complete workflow
3. **Add Tools Gradually**: Only set up optional tools (Warp, Archon) as needed
4. **Document Locally**: Keep your own notes in untracked files
5. **Use .local Extension**: Any file ending in `.local.*` is ignored
6. **Platform Freedom**: Use Windows, Mac, or Linux - your choice!
7. **Security First**: Never commit tokens or secrets - use environment variables
8. **Test Often**: Use Playwright for confidence in your changes
9. **AI Assistance**: Claude Flow speeds up development significantly

## 🆘 Troubleshooting

### Port Conflicts
- Dev server: 5173 (change in `vite.config.ts` if needed)
- Archon: 8181 (if you use it)
- Claude Flow UI: 3001 (if you use it)

### Playwright Issues
```bash
# Reinstall browsers
npx playwright install --force

# Check browser installations
npx playwright --version

# Debug test runs
npx playwright test --debug
```

### Claude Flow Issues
```bash
# Check installation
npm list -g claude-flow@alpha

# Reset configuration
rm -rf .claude-flow
npx claude-flow@alpha init

# Check API key
npx claude-flow@alpha config get apiKey
```

### MCP GitHub Server Issues (if using)
```powershell
# Check if server is installed
npm list -g @modelcontextprotocol/server-github

# Verify token is set
echo $env:GITHUB_TOKEN

# Test server manually
mcp-server-github --version
```

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

- **Application Documentation**: See source code comments
- **Development Workflow**: `docs/CLAUDE.md` (the only workflow doc in Git)
- **Playwright Docs**: https://playwright.dev/
- **Claude Flow**: https://claude-flow.dev/
- **Warp Terminal**: https://www.warp.dev/
- **MCP Protocol**: https://modelcontextprotocol.com/
- **GitHub Tokens**: https://github.com/settings/tokens
- **Archon Project**: https://github.com/archon-project
- **Your Notes**: Create any `.local.md` files you want

---

**Remember**: This is YOUR local environment. Set it up however works best for you!
