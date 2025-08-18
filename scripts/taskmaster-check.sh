#!/bin/bash

# Taskmaster Health Check Script
# Verifies taskmaster is working correctly

set -e

PROJECT_ROOT="/Users/felixgirardin/Documents/meme-war-reloaded/memes-wars"
TASKMASTER_DIR="$PROJECT_ROOT/.taskmaster"

echo "🏥 Taskmaster Health Check..."

# Check if task-master-ai is installed
if ! command -v task-master-ai &> /dev/null; then
    echo "❌ task-master-ai is not installed or not in PATH"
    exit 1
fi

echo "✅ task-master-ai is installed"

# Check if taskmaster directory exists
if [ ! -d "$TASKMASTER_DIR" ]; then
    echo "❌ Taskmaster directory not found: $TASKMASTER_DIR"
    echo "Run: ./scripts/taskmaster-init.sh"
    exit 1
fi

echo "✅ Taskmaster directory exists"

# Check configuration
if [ -f "$TASKMASTER_DIR/config.json" ]; then
    echo "✅ Configuration file found"
else
    echo "⚠️ Configuration file missing"
fi

# Check running processes
RUNNING_PROCESSES=$(ps aux | grep -v grep | grep "task-master-ai" | wc -l)
if [ "$RUNNING_PROCESSES" -eq 0 ]; then
    echo "✅ No conflicting processes running"
elif [ "$RUNNING_PROCESSES" -eq 1 ]; then
    echo "✅ Single taskmaster process running"
else
    echo "⚠️ Multiple taskmaster processes detected: $RUNNING_PROCESSES"
    echo "Consider running: pkill -f task-master-ai"
fi

# Test basic connectivity
echo "🔍 Testing taskmaster connectivity..."
cd "$PROJECT_ROOT"

if task-master-ai get_task_stats --projectRoot "$PROJECT_ROOT" >/dev/null 2>&1; then
    echo "✅ Taskmaster responds to commands"
else
    echo "❌ Taskmaster not responding to commands"
    echo "Try reinitializing: ./scripts/taskmaster-init.sh"
    exit 1
fi

# Get basic stats
echo ""
echo "📊 Current Status:"
task-master-ai get_task_stats --projectRoot "$PROJECT_ROOT" 2>/dev/null || {
    echo "Could not retrieve stats"
}

echo ""
echo "🎉 Taskmaster is healthy!"