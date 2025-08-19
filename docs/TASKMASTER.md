# 🎯 Taskmaster Setup and Usage Guide

## Overview

Taskmaster is the task management system for the Meme Wars project. It provides a comprehensive MCP-based solution for creating, tracking, and managing development tasks.

## 🚀 Quick Start

### Initialize Taskmaster
```bash
npm run taskmaster:init
```

### Check Taskmaster Health
```bash
npm run taskmaster:check
```

### Basic Commands
```bash
# List all tasks
npm run taskmaster:list

# Get project statistics  
npm run taskmaster:stats

# Add a new task
npm run taskmaster:add -- --title "My Task" --description "Task description"
```

## 📁 Project Structure

```
.taskmaster/
├── config.json          # Taskmaster configuration
├── state.json           # Current state and settings
├── tasks/               # Task storage directory
├── reports/             # Generated reports
├── docs/                # Documentation
└── templates/           # Task templates
```

## 🛠️ Available Scripts

- `taskmaster:init` - Initialize taskmaster for the project
- `taskmaster:check` - Run health check on taskmaster
- `taskmaster:list` - List all tasks
- `taskmaster:stats` - Show project statistics  
- `taskmaster:add` - Add a new task (requires additional parameters)

## 🔧 Manual Commands

### Task Management
```bash
# List tasks
task-master-ai get_tasks --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Add task
task-master-ai add_task --title "Task Title" --description "Description" --priority "high" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Get task details
task-master-ai get_task_detail --taskId [id] --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Update task
task-master-ai update_task --taskId [id] --status "in-progress" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Get statistics
task-master-ai get_task_stats --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

### Filtering and Search
```bash
# Filter by status
task-master-ai get_tasks --filter "todo" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
task-master-ai get_tasks --filter "in-progress" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Filter by priority
task-master-ai get_tasks --filter "critical" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
task-master-ai get_tasks --filter "high" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars

# Filter by assignee
task-master-ai get_tasks --assignee "Agent Name" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
```

## 🔄 Typical Workflow

1. **Check Current Status**
   ```bash
   npm run taskmaster:stats
   ```

2. **List Available Tasks**
   ```bash
   npm run taskmaster:list
   ```

3. **Create New Task** (if needed)
   ```bash
   task-master-ai add_task --title "New Feature" --description "Implementation details" --priority "medium" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
   ```

4. **Update Task Status**
   ```bash
   task-master-ai update_task --taskId [id] --status "in-progress" --assignee "Your Name" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
   ```

5. **Complete Task**
   ```bash
   task-master-ai update_task --taskId [id] --status "done" --projectRoot /Users/felixgirardin/Documents/meme-war-reloaded/memes-wars
   ```

## ⚠️ Troubleshooting

### Common Issues

#### Connection Warnings
If you see warnings like "could not infer client capabilities", this is normal and doesn't affect functionality.

#### Multiple Processes
If taskmaster hangs, kill existing processes:
```bash
pkill -f task-master-ai
```

#### Initialization Issues
If initialization fails, run:
```bash
npm run taskmaster:init
```

#### Health Check
To verify everything is working:
```bash
npm run taskmaster:check
```

## 📊 Configuration

The taskmaster configuration is stored in `.taskmaster/config.json`:

- Model providers (Anthropic, Perplexity)
- Default settings
- Project-specific configuration

## 🎯 Best Practices

1. **Always check status first**
   ```bash
   npm run taskmaster:stats
   ```

2. **Use meaningful task titles and descriptions**

3. **Set appropriate priorities**: critical, high, medium, low

4. **Update task status regularly**: todo → in-progress → review → done

5. **Use assignee field** for tracking who's working on what

6. **Add comments** for progress tracking

## 🔗 Integration

Taskmaster integrates with:
- Git workflow (branch per task)
- GitHub issues and pull requests
- Development workflow automation
- Progress tracking and reporting

For more details, see the main `CLAUDE.md` documentation.