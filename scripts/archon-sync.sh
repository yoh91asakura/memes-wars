#!/bin/bash
# Archon Sync Script for macOS/Linux
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

echo -e "${CYAN}🔄 Archon Task Sync${NC}"
echo "==================="

# Configuration
PROJECT_ID="196233ba-fbac-4ada-b0f9-37658c0e73ea"
API_URL="http://localhost:8181"
TASKS_DIR="archon/tasks"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Start Docker Desktop first."
    exit 1
fi

# Check if Archon API is available
if ! curl -s "$API_URL/health" >/dev/null 2>&1; then
    print_error "Archon API is not responding"
    print_info "Start Archon services: cd archon && docker-compose up -d"
    exit 1
fi

print_status "Connected to Archon API"

# Create tasks directory if it doesn't exist
mkdir -p "$TASKS_DIR/modules"

# Function to get project tasks
get_project_tasks() {
    curl -s "$API_URL/api/projects/$PROJECT_ID/tasks" \
        -H "Content-Type: application/json" \
        || echo "[]"
}

# Function to create task
create_task() {
    local title="$1"
    local description="$2"
    local priority="$3"
    local module="$4"
    
    curl -s "$API_URL/api/tasks" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"project_id\": \"$PROJECT_ID\",
            \"title\": \"$title\",
            \"description\": \"$description\",
            \"priority\": \"$priority\",
            \"status\": \"todo\",
            \"tags\": [\"$module\"]
        }"
}

# Sync tasks from local files to Archon
sync_tasks() {
    print_info "Syncing tasks to Archon..."
    
    # Get current tasks from Archon
    tasks_json=$(get_project_tasks)
    task_count=$(echo "$tasks_json" | jq -r 'length // 0')
    
    print_status "Found $task_count existing tasks in Archon"
    
    # Example: Create sample tasks if none exist
    if [ "$task_count" -eq 0 ]; then
        print_info "Creating initial tasks..."
        
        # Cards module tasks
        create_task "Implement Common Cards" "Create 10 common cards with basic effects" "high" "cards" >/dev/null
        create_task "Implement Rare Cards" "Create 10 rare cards with special effects" "high" "cards" >/dev/null
        create_task "Implement Epic Cards" "Create 8 epic cards with powerful effects" "medium" "cards" >/dev/null
        
        # Services module tasks
        create_task "Enhance DeckService" "Add deck validation and management" "high" "services" >/dev/null
        create_task "Create CombatEngine" "Implement battle mechanics" "high" "services" >/dev/null
        
        # UI module tasks
        create_task "Build DeckBuilder UI" "Create deck building interface" "medium" "ui" >/dev/null
        create_task "Create CombatScreen" "Design battle interface" "medium" "ui" >/dev/null
        
        print_status "Created initial task set"
    fi
    
    # Update local task tracking
    if [ -f "$TASKS_DIR/archon-project-tasks.json" ]; then
        cp "$TASKS_DIR/archon-project-tasks.json" "$TASKS_DIR/archon-project-tasks.backup.json"
    fi
    
    # Fetch and save current tasks
    get_project_tasks > "$TASKS_DIR/archon-project-tasks.json"
    
    print_status "Task synchronization complete"
}

# Update PROJECT_STATUS.md
update_status() {
    print_info "Updating project status..."
    
    cat > "$TASKS_DIR/PROJECT_STATUS.md" << 'EOF'
# 🎮 Emoji Mayhem TCG - Project Status

## 📊 Current Status

| Module | Progress | Priority | Tasks |
|--------|----------|----------|-------|
| **CARDS** | In Progress | HIGH | Common(10), Rare(10), Epic(8) |
| **SERVICES** | Planning | HIGH | DeckService, CombatEngine |
| **UI** | Planning | MEDIUM | DeckBuilder, CombatScreen |

## 🎯 Next Priorities

1. **Complete Cards Module** - Finish implementing all card types
2. **Build Core Services** - DeckService and CombatEngine
3. **Create UI Components** - DeckBuilder and CombatScreen

## 🔗 Quick Links

- **Archon UI**: http://localhost:3737
- **API Docs**: http://localhost:8181/docs
- **Project**: http://localhost:3737/projects/196233ba-fbac-4ada-b0f9-37658c0e73ea

## 📋 Task Management

```bash
# Check status
npm run archon:status

# Sync tasks
npm run archon:sync

# Access Archon UI
open http://localhost:3737
```

---

*Last updated: $(date)*
EOF

    print_status "Project status updated"
}

# Run synchronization
sync_tasks
update_status

echo ""
print_status "Archon synchronization complete!"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "${YELLOW}1. View tasks: http://localhost:3737/projects/$PROJECT_ID${NC}"
echo -e "${YELLOW}2. Check status: npm run archon:status${NC}"
echo -e "${YELLOW}3. Start development: npm run dev${NC}"