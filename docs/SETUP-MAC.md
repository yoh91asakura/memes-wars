# 🍎 macOS Setup Guide - Emoji Mayhem TCG

This guide will help you set up the Emoji Mayhem TCG project on macOS.

## 📋 Prerequisites

### Required Software

1. **Node.js 18+**
   - **Option 1**: Download from [nodejs.org](https://nodejs.org/)
   - **Option 2**: Install via Homebrew (recommended):
     ```bash
     brew install node
     ```
   - Verify installation: `node --version` and `npm --version`

2. **Homebrew** (package manager)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Git**
   - Usually pre-installed on macOS
   - If not: `brew install git`
   - Verify installation: `git --version`

4. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

### Optional but Recommended

5. **Docker Desktop** (for Archon services)
   - **Option 1**: Download from [docker.com](https://www.docker.com/products/docker-desktop)
   - **Option 2**: Install via Homebrew:
     ```bash
     brew install --cask docker
     ```

6. **Visual Studio Code**
   - **Option 1**: Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - **Option 2**: Install via Homebrew:
     ```bash
     brew install --cask visual-studio-code
     ```

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd memes-wars
```

### 2. Run Automated Setup

```bash
# Option 1: Use npm script (recommended)
npm run setup:mac

# Option 2: Run script directly
bash scripts/setup-mac.sh
```

### 3. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the game.

## 🔧 Manual Setup

If the automated setup doesn't work, follow these manual steps:

### 1. Install Homebrew (if not already installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# For Apple Silicon Macs, add to PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 2. Install Node.js

```bash
# Install latest LTS version
brew install node

# Or install specific version
brew install node@18
```

### 3. Configure Git

```bash
# Configure line endings for Unix
git config --global core.autocrlf input
git config --global core.safecrlf false
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

### 6. Verify Installation

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

```bash
# Via Homebrew
brew install --cask docker

# Or download from docker.com
```

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

### Shell Configuration

#### Zsh (default on macOS Catalina+)

Add to `~/.zshrc`:

```bash
# Node.js
export PATH="/usr/local/bin:$PATH"

# Homebrew (Apple Silicon)
export PATH="/opt/homebrew/bin:$PATH"

# npm global packages
export PATH="$HOME/.npm-global/bin:$PATH"

# Aliases for development
alias ll="ls -la"
alias gs="git status"
alias gp="git pull"
alias gc="git commit"
alias gps="git push"
alias npm-update="npm update && npm audit fix"
```

#### Bash

Add to `~/.bash_profile` or `~/.bashrc`:

```bash
# Node.js
export PATH="/usr/local/bin:$PATH"

# Homebrew
export PATH="/opt/homebrew/bin:$PATH"

# npm global packages
export PATH="$HOME/.npm-global/bin:$PATH"
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
  "terminal.integrated.defaultProfile.osx": "zsh"
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Node.js Version Issues

```bash
# Check current version
node --version

# Install specific version via Homebrew
brew uninstall node
brew install node@18
brew link node@18 --force --overwrite

# Or use nvm for version management
brew install nvm
nvm install 18
nvm use 18
```

#### 2. Permission Errors

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or configure npm to use different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### 3. Xcode Command Line Tools Issues

```bash
# Reinstall Xcode Command Line Tools
sudo xcode-select --reset
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept
```

#### 4. Git Line Ending Issues

```bash
# Reset line endings
git config --global core.autocrlf input
git rm --cached -r .
git reset --hard
```

#### 5. Homebrew Issues

```bash
# Update Homebrew
brew update

# Fix Homebrew permissions
sudo chown -R $(whoami):admin /usr/local/*
sudo chown -R $(whoami):admin /opt/homebrew/*

# Doctor check
brew doctor
```

#### 6. Docker Issues

```bash
# Check Docker is running
docker --version

# Reset Docker if needed
docker system prune -a

# Check Docker daemon
docker info
```

### macOS-Specific Notes

1. **Apple Silicon (M1/M2) Compatibility**
   - Most packages work natively
   - Some may require Rosetta 2
   - Use Homebrew's native ARM64 support

2. **File System Case Sensitivity**
   - macOS is case-insensitive by default
   - Be careful with file naming
   - Git may show issues with case changes

3. **Security & Privacy**
   - macOS may block unsigned binaries
   - Allow applications in System Preferences > Security & Privacy
   - Use `spctl --assess --verbose` to check signatures

4. **Memory Management**
   - macOS handles memory well
   - Large Node.js projects may need more heap:
     ```bash
     export NODE_OPTIONS="--max-old-space-size=4096"
     ```

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

- [Node.js macOS Installation](https://nodejs.org/en/download/)
- [Homebrew](https://brew.sh/)
- [Git on macOS](https://git-scm.com/download/mac)
- [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/)
- [VS Code on macOS](https://code.visualstudio.com/docs/setup/mac)
- [macOS Development Setup](https://sourabhbajaj.com/mac-setup/)

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Search existing issues on GitHub
3. Create a new issue with:
   - macOS version (`sw_vers`)
   - Node.js version (`node --version`)
   - Complete error message
   - Steps to reproduce

---

Happy coding! 🎮