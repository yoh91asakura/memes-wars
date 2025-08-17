#!/bin/bash
# Archon Status Script for macOS/Linux
# Equivalent to sync-archon-tasks.ps1 for Unix systems

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

echo -e "${CYAN}🎯 Archon Status Check${NC}"
echo "======================"

# Check if Docker is running
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker is not installed"
    echo "Install Docker Desktop: https://docker.com"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running"
    echo "Start Docker Desktop application"
    exit 1
fi

print_status "Docker is running"

# Check if archon directory exists
if [ ! -d "archon" ]; then
    print_error "Archon directory not found"
    exit 1
fi

cd archon

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found in archon directory"
    exit 1
fi

# Check Archon services status
print_info "Checking Archon services..."

services=("archon-ui" "archon-api" "archon-mcp")
all_running=true

for service in "${services[@]}"; do
    if docker-compose ps "$service" | grep -q "Up"; then
        print_status "$service is running"
    else
        print_warning "$service is not running"
        all_running=false
    fi
done

if $all_running; then
    print_status "All Archon services are running"
    echo ""
    echo -e "${CYAN}Access URLs:${NC}"
    echo -e "${YELLOW}- Archon UI: http://localhost:3737${NC}"
    echo -e "${YELLOW}- Archon API: http://localhost:8181${NC}"
    echo -e "${YELLOW}- API Docs: http://localhost:8181/docs${NC}"
else
    print_warning "Some services are not running"
    echo ""
    echo "To start services:"
    echo "cd archon && docker-compose up -d"
fi

# Check project configuration
PROJECT_ID="196233ba-fbac-4ada-b0f9-37658c0e73ea"
API_URL="http://localhost:8181"

if curl -s "$API_URL/health" >/dev/null 2>&1; then
    print_status "Archon API is responding"
    
    # Try to get project info
    if curl -s "$API_URL/api/projects/$PROJECT_ID" >/dev/null 2>&1; then
        print_status "Project configuration found"
    else
        print_warning "Project not found in Archon"
    fi
else
    print_warning "Archon API is not responding"
fi

echo ""
print_info "Use 'npm run archon:sync' to synchronize tasks"