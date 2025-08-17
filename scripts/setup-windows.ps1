# Emoji Mayhem TCG - Windows Setup Script
# Description: Installs and configures the project for Windows development

param(
    [switch]$Force,
    [switch]$SkipDependencies,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Status {
    param($Message, $Color = "White")
    Write-Host "✓ $Message" -ForegroundColor $Color
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor $Cyan
}

Write-Host "🎮 Emoji Mayhem TCG - Windows Setup" -ForegroundColor $Green
Write-Host "=================================" -ForegroundColor $Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Warning "Running without administrator privileges. Some features may not work properly."
}

# Check Node.js installation
Write-Info "Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Status "Node.js version: $nodeVersion"
    
    # Check if version is >= 18
    $versionNumber = [Version]($nodeVersion.TrimStart('v'))
    if ($versionNumber.Major -lt 18) {
        Write-Error "Node.js version 18 or higher is required. Current version: $nodeVersion"
        Write-Info "Please visit https://nodejs.org to download the latest version"
        exit 1
    }
} catch {
    Write-Error "Node.js is not installed or not in PATH"
    Write-Info "Please install Node.js from https://nodejs.org"
    exit 1
}

# Check npm version
try {
    $npmVersion = npm --version
    Write-Status "npm version: $npmVersion"
} catch {
    Write-Error "npm is not available"
    exit 1
}

# Check Git installation
Write-Info "Checking Git installation..."
try {
    $gitVersion = git --version
    Write-Status "Git version: $gitVersion"
} catch {
    Write-Error "Git is not installed or not in PATH"
    Write-Info "Please install Git from https://git-scm.com/download/win"
    exit 1
}

# Configure Git for cross-platform development
Write-Info "Configuring Git for cross-platform development..."
try {
    git config --global core.autocrlf true
    git config --global core.safecrlf false
    Write-Status "Git configured for Windows line endings"
} catch {
    Write-Warning "Could not configure Git settings"
}

# Check if PowerShell execution policy allows script execution
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Warning "PowerShell execution policy is Restricted"
    Write-Info "Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
}

# Install dependencies
if (-not $SkipDependencies) {
    Write-Info "Installing npm dependencies..."
    try {
        npm install
        Write-Status "Dependencies installed successfully"
    } catch {
        Write-Error "Failed to install dependencies"
        Write-Info "Try running: npm install --verbose"
        exit 1
    }
}

# Verify installation
Write-Info "Verifying installation..."
try {
    npm run typecheck
    Write-Status "TypeScript compilation successful"
} catch {
    Write-Warning "TypeScript compilation failed - check for type errors"
}

# Check if all required tools are available
$tools = @("vite", "vitest", "playwright")
foreach ($tool in $tools) {
    try {
        npx $tool --version | Out-Null
        Write-Status "$tool is available"
    } catch {
        Write-Warning "$tool may not be properly installed"
    }
}

# Create local environment file if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Info "Creating local environment file..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Status "Created .env.local from .env.example"
    } else {
        New-Item -Path ".env.local" -ItemType File -Value "# Local environment variables`nNODE_ENV=development`n"
        Write-Status "Created empty .env.local file"
    }
}

# Setup Archon services (if available)
if (Test-Path "archon/docker-compose.yml") {
    Write-Info "Checking Docker for Archon services..."
    try {
        docker --version | Out-Null
        Write-Status "Docker is available"
        Write-Info "To start Archon services, run: cd archon && docker-compose up -d"
    } catch {
        Write-Warning "Docker is not available - Archon services won't work"
        Write-Info "Install Docker Desktop from https://docker.com"
    }
}

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor $Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $Cyan
Write-Host "1. npm run dev          # Start development server" -ForegroundColor $Yellow
Write-Host "2. npm run test         # Run tests" -ForegroundColor $Yellow
Write-Host "3. npm run build        # Build for production" -ForegroundColor $Yellow
Write-Host ""
Write-Host "Development URLs:" -ForegroundColor $Cyan
Write-Host "- Game: http://localhost:3000" -ForegroundColor $Yellow
Write-Host "- Archon UI: http://localhost:3737 (if Docker is running)" -ForegroundColor $Yellow
Write-Host ""
Write-Host "For help, see:" -ForegroundColor $Cyan
Write-Host "- README.md" -ForegroundColor $Yellow
Write-Host "- SETUP-WINDOWS.md" -ForegroundColor $Yellow