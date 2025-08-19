#!/bin/bash

# Taskmaster Initialization Script
# This script properly initializes taskmaster for the Meme Wars project

set -e

PROJECT_ROOT="/Users/felixgirardin/Documents/meme-war-reloaded/memes-wars"
TASKMASTER_DIR="$PROJECT_ROOT/.taskmaster"

echo "🚀 Initializing Taskmaster for Meme Wars..."

# Kill any existing taskmaster processes
echo "🔄 Cleaning up existing processes..."
pkill -f "task-master-ai" 2>/dev/null || true
sleep 2

# Create taskmaster directory structure if it doesn't exist
echo "📁 Setting up directory structure..."
mkdir -p "$TASKMASTER_DIR/tasks"
mkdir -p "$TASKMASTER_DIR/reports"
mkdir -p "$TASKMASTER_DIR/docs"
mkdir -p "$TASKMASTER_DIR/templates"

# Initialize taskmaster database if needed
echo "🗄️ Initializing taskmaster database..."
cd "$PROJECT_ROOT"

# Test basic taskmaster functionality
echo "🔍 Testing taskmaster connection..."
task-master-ai init --projectRoot "$PROJECT_ROOT" || {
    echo "❌ Failed to initialize taskmaster"
    exit 1
}

echo "✅ Taskmaster initialized successfully!"

# Test basic operations
echo "🧪 Testing basic operations..."
if task-master-ai get_tasks --projectRoot "$PROJECT_ROOT"; then
    echo "✅ Taskmaster is working correctly!"
else
    echo "⚠️ Taskmaster initialized but may have connectivity issues"
    echo "Try running: task-master-ai get_tasks --projectRoot $PROJECT_ROOT"
fi

echo ""
echo "🎉 Taskmaster setup complete!"
echo "📍 Project Root: $PROJECT_ROOT"
echo "📂 Config: $TASKMASTER_DIR/config.json"
echo ""
echo "Quick commands:"
echo "  List tasks: task-master-ai get_tasks --projectRoot $PROJECT_ROOT"
echo "  Add task:   task-master-ai add_task --title \"My Task\" --projectRoot $PROJECT_ROOT"
echo "  Get stats:  task-master-ai get_task_stats --projectRoot $PROJECT_ROOT"