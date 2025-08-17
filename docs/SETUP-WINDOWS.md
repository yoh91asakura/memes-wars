# 🪟 Windows Setup Guide - Emoji Mayhem TCG

This guide will help you set up the Emoji Mayhem TCG project on Windows.

## 📋 Prerequisites

### Required Software

1. **Node.js 18+**
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS version
   - Verify installation: `node --version` and `npm --version`

2. **Git for Windows**
   - Download from [git-scm.com](https://git-scm.com/download/win)
   - Include Git Bash during installation
   - Verify installation: `git --version`

3. **PowerShell 5.1+** (usually pre-installed)
   - Check version: `$PSVersionTable.PSVersion`
   - If needed, install PowerShell 7 from [GitHub](https://github.com/PowerShell/PowerShell)

### Optional but Recommended

4. **Docker Desktop** (for Archon services)
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - Required for task management and knowledge services

5. **Visual Studio Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - Recommended extensions:
     - TypeScript and JavaScript Language Features
     - Prettier - Code formatter
     - ESLint
     - GitLens

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd memes-wars
```

### 2. Run Automated Setup

```powershell
# Option 1: Use npm script (recommended)
npm run setup:windows

# Option 2: Run script directly
powershell -ExecutionPolicy Bypass -File scripts/setup-windows.ps1
```

### 3. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the game.

## 🔧 Manual Setup

If the automated setup doesn't work, follow these manual steps:

### 1. Configure PowerShell Execution Policy

```powershell
# Allow script execution for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Configure Git

```bash
# Configure line endings for Windows
git config --global core.autocrlf true
git config --global core.safecrlf false
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create Environment File

```bash
# Copy the example environment file
copy .env.example .env.local
```

### 5. Verify Installation

```bash
# Check TypeScript compilation
npm run typecheck

# Run tests
npm run test

# Start development server
npm run dev
```

## 🐳 Docker Setup (Optional)

For full Archon integration:

### 1. Install Docker Desktop

Download and install from [docker.com](https://www.docker.com/products/docker-desktop)

### 2. Start Archon Services

```bash
cd archon
docker-compose up -d
```

### 3. Access Services

- **Game**: http://localhost:3000
- **Archon UI**: http://localhost:3737
- **Archon API**: http://localhost:8181

## 🔧 Development Tools

### Essential Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Check code style
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run typecheck        # Check TypeScript types

# Testing
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Generate test coverage

# Archon Integration
npm run archon:status    # Check task status
npm run archon:sync      # Sync with Archon

# Maintenance
npm run clean            # Clean build artifacts
npm run clean:install    # Clean install dependencies
```

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.eol": "\\n",
  "git.autofetch": true,
  "terminal.integrated.defaultProfile.windows": "PowerShell"
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. PowerShell Execution Policy Error

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Node.js Version Issues

```bash
# Check version
node --version

# If version < 18, update Node.js
# Download latest from nodejs.org
```

#### 3. Git Line Ending Issues

```bash
# Reset line endings
git config --global core.autocrlf true
git rm --cached -r .
git reset --hard
```

#### 4. npm Permission Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

#### 5. TypeScript Compilation Errors

```bash
# Clear TypeScript cache
npx tsc --build --clean

# Reinstall dependencies
npm run clean:install
```

#### 6. Docker Issues

```bash
# Restart Docker Desktop
# Check Docker is running: docker --version

# Reset Docker if needed
docker system prune -a
```

### Windows-Specific Notes

1. **Path Length Limitations**
   - Windows has a 260-character path limit
   - Enable long paths in Group Policy or Registry
   - Use shorter directory names if needed

2. **Antivirus Software**
   - Some antivirus software may interfere with Node.js
   - Add project directory to exclusions if needed

3. **Windows Defender**
   - May slow down npm install
   - Consider adding exclusions for development folders

4. **PowerShell vs Command Prompt**
   - Use PowerShell for better Unicode support
   - Some npm scripts may not work in Command Prompt

## 📁 Project Structure

```
memes-wars/
├── src/                 # Source code
├── tests/              # Test files
├── docs/               # Documentation
├── scripts/            # Build and setup scripts
├── archon/             # Task management
├── .env.example        # Environment template
├── .env.local          # Local environment (create this)
├── package.json        # Project configuration
└── README.md           # Main documentation
```

## 🔗 Useful Links

- [Node.js Windows Installation](https://nodejs.org/en/download/)
- [Git for Windows](https://git-scm.com/download/win)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/)
- [VS Code on Windows](https://code.visualstudio.com/docs/setup/windows)

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Search existing issues on GitHub
3. Create a new issue with:
   - Windows version
   - Node.js version
   - Complete error message
   - Steps to reproduce

---

Happy coding! 🎮