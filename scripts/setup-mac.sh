#!/bin/bash

# Emoji Mayhem TCG - macOS Setup Script
# Description: Installs and configures the project for macOS development

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

echo -e "${GREEN}🎮 Emoji Mayhem TCG - macOS Setup${NC}"
echo -e "${GREEN}===================================${NC}"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS"
    exit 1
fi

# Check Homebrew installation
print_info "Checking Homebrew installation..."
if command -v brew >/dev/null 2>&1; then
    print_status "Homebrew is installed"
    brew_version=$(brew --version | head -n 1)
    print_status "Version: $brew_version"
else
    print_warning "Homebrew is not installed"
    print_info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    print_status "Homebrew installed successfully"
fi

# Check Node.js installation
print_info "Checking Node.js installation..."
if command -v node >/dev/null 2>&1; then
    node_version=$(node --version)
    print_status "Node.js version: $node_version"
    
    # Extract major version number
    major_version=$(echo $node_version | sed 's/v\([0-9]*\).*/\1/')
    if [ "$major_version" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $node_version"
        print_info "Installing Node.js via Homebrew..."
        brew install node
    fi
else
    print_warning "Node.js is not installed"
    print_info "Installing Node.js via Homebrew..."
    brew install node
    print_status "Node.js installed successfully"
fi

# Check npm version
if command -v npm >/dev/null 2>&1; then
    npm_version=$(npm --version)
    print_status "npm version: $npm_version"
else
    print_error "npm is not available"
    exit 1
fi

# Check Git installation
print_info "Checking Git installation..."
if command -v git >/dev/null 2>&1; then
    git_version=$(git --version)
    print_status "Git version: $git_version"
else
    print_warning "Git is not installed"
    print_info "Installing Git via Homebrew..."
    brew install git
    print_status "Git installed successfully"
fi

# Configure Git for cross-platform development
print_info "Configuring Git for cross-platform development..."
git config --global core.autocrlf input
git config --global core.safecrlf false
print_status "Git configured for Unix line endings"

# Check Xcode Command Line Tools
print_info "Checking Xcode Command Line Tools..."
if xcode-select -p >/dev/null 2>&1; then
    print_status "Xcode Command Line Tools are installed"
else
    print_warning "Xcode Command Line Tools are not installed"
    print_info "Installing Xcode Command Line Tools..."
    xcode-select --install
    print_info "Please complete the installation in the dialog box"
    read -p "Press Enter after installation is complete..."
fi

# Install dependencies
print_info "Installing npm dependencies..."
npm install
print_status "Dependencies installed successfully"

# Verify installation
print_info "Verifying installation..."
if npm run typecheck >/dev/null 2>&1; then
    print_status "TypeScript compilation successful"
else
    print_warning "TypeScript compilation failed - check for type errors"
fi

# Check if all required tools are available
tools=("vite" "vitest" "playwright")
for tool in "${tools[@]}"; do
    if npx $tool --version >/dev/null 2>&1; then
        print_status "$tool is available"
    else
        print_warning "$tool may not be properly installed"
    fi
done

# Create local environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_info "Creating local environment file..."
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env.local"
        print_status "Created .env.local from .env.example"
    else
        cat > .env.local << EOF
# Local environment variables
NODE_ENV=development
EOF
        print_status "Created empty .env.local file"
    fi
fi

# Setup task management system
print_info "Setting up task management system..."
if [ ! -d "tasks" ]; then
    mkdir tasks
    print_status "Created tasks directory"
    
    # Create initial tasks.json file
    cat > tasks/tasks.json << EOF
{
  "tasks": [],
  "nextId": 1
}
EOF
    print_status "Initialized task tracking system"
fi

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "${YELLOW}1. npm run dev          # Start development server${NC}"
echo -e "${YELLOW}2. npm run test         # Run tests${NC}"
echo -e "${YELLOW}3. npm run build        # Build for production${NC}"
echo ""
echo -e "${CYAN}Development URLs:${NC}"
echo -e "${YELLOW}- Game: http://localhost:3000${NC}"
echo ""
echo -e "${CYAN}For help, see:${NC}"
echo -e "${YELLOW}- README.md${NC}"
echo -e "${YELLOW}- SETUP-MAC.md${NC}"