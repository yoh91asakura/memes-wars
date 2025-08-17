# 📋 Task Management System

A simple, effective local task management system for The Meme Wars project.

## 🚀 Quick Start

```bash
# Initialize the task system
npm run tasks:init

# Create a new task
npm run tasks:new "Add new emoji card"

# List all tasks
npm run tasks:list

# Mark task as done
npm run tasks:done 1
```

## 📝 Features

- **Simple CLI Interface**: Easy-to-use command line tools
- **Task Status Tracking**: Todo, In-Progress, Review, Done, Blocked
- **Priority Levels**: Low, Medium, High, Critical
- **Subtasks Support**: Break down complex tasks
- **Tags & Assignees**: Organize and delegate work
- **Export Options**: Export to JSON or Markdown
- **Statistics**: Track progress and productivity

## 🛠️ Commands

### Initialize System
```bash
npm run tasks:init
```
Sets up the task directory and creates the initial tasks.json file.

### Create Task

**Interactive Mode:**
```bash
npm run tasks:new
```
Prompts for all task details interactively.

**Quick Mode:**
```bash
npm run tasks:new "Task title here"
```
Creates a task with default settings.

### List Tasks

**All Tasks:**
```bash
npm run tasks:list
```

**Filter by Status:**
```bash
npm run tasks:list --status todo
npm run tasks:list --status in-progress
npm run tasks:list --status done
```

**Filter by Priority:**
```bash
npm run tasks:list --priority high
npm run tasks:list --priority critical
```

**Filter by Assignee:**
```bash
npm run tasks:list --assignee John
```

**Show Statistics:**
```bash
npm run tasks:list --stats
```

**Export Tasks:**
```bash
npm run tasks:list --export markdown > tasks.md
npm run tasks:list --export json > tasks.json
```

### Update Task

**Interactive Mode:**
```bash
npm run tasks:update 1
```

**Direct Updates:**
```bash
# Change status
npm run tasks:update 1 --status in-progress
npm run tasks:update 1 --status review

# Change priority
npm run tasks:update 1 --priority high

# Assign to someone
npm run tasks:update 1 --assignee Alice

# Block with reason
npm run tasks:update 1 --blocked "Waiting for API access"

# Add subtask
npm run tasks:update 1 --add-subtask "Write unit tests"

# Multiple updates at once
npm run tasks:update 1 --status in-progress --priority high --assignee Bob
```

### Mark as Done
```bash
# Single task
npm run tasks:done 1

# Multiple tasks
npm run tasks:done 1 2 3

# Force complete (ignore incomplete subtasks)
npm run tasks:done 1 --force
```

## 📊 Task Structure

Each task contains:
- **ID**: Unique identifier
- **Title**: Task name
- **Description**: Detailed description (optional)
- **Status**: Current state (todo/in-progress/review/done/blocked)
- **Priority**: Importance level (low/medium/high/critical)
- **Assignee**: Person responsible (optional)
- **Tags**: Labels for categorization (optional)
- **Subtasks**: Checklist items (optional)
- **Timestamps**: Created, updated, and completed dates

## 🎨 Status Workflow

```
todo → in-progress → review → done
         ↓
      blocked
```

- **📝 Todo**: Task is ready to start
- **🔄 In-Progress**: Currently being worked on
- **👀 Review**: Completed, awaiting review
- **✅ Done**: Task is complete
- **🚫 Blocked**: Cannot proceed due to dependency

## 🏷️ Priority Levels

- **🟢 Low**: Can be done whenever
- **🟡 Medium**: Normal priority (default)
- **🟠 High**: Should be done soon
- **🔴 Critical**: Must be done ASAP

## 💾 Data Storage

Tasks are stored locally in `tasks/tasks.json`:
- Simple JSON format
- Easy to backup and version control
- Human-readable and editable
- No external dependencies

## 🔧 Advanced Usage

### Subtasks
```bash
# Add subtask
npm run tasks:update 1 --add-subtask "Design UI"
npm run tasks:update 1 --add-subtask "Implement logic"
npm run tasks:update 1 --add-subtask "Write tests"

# Toggle subtask completion
npm run tasks:update 1 --toggle-subtask 1-1
```

### Tags
```bash
# Add tags when creating
npm run tasks:new
# Then enter tags: frontend, urgent, bug

# Update tags
npm run tasks:update 1 --tags "backend,api,database"

# Filter by tag
npm run tasks:list --tag frontend
```

### Export for Reports
```bash
# Weekly report
npm run tasks:list --export markdown > reports/week-$(date +%V).md

# Completed tasks
npm run tasks:list --status done --export markdown

# High priority tasks
npm run tasks:list --priority high --export markdown
```

## 📁 Directory Structure
```
the-meme-wars/
├── scripts/
│   └── tasks/
│       ├── taskManager.js   # Core task management logic
│       ├── init.js          # Initialize system
│       ├── list.js          # List and filter tasks
│       ├── new.js           # Create new tasks
│       ├── update.js        # Update existing tasks
│       └── done.js          # Mark tasks as complete
└── tasks/
    └── tasks.json           # Task data storage (git-ignored)
```

## 🚫 Git Integration

The `tasks/` directory is git-ignored, so:
- Each developer maintains their own task list
- No merge conflicts from task files
- Tasks are personal and local
- Use export feature to share task lists

## 💡 Tips & Best Practices

1. **Start your day** by reviewing tasks:
   ```bash
   npm run tasks:list --status todo
   ```

2. **Track progress** during work:
   ```bash
   npm run tasks:update <id> --status in-progress
   ```

3. **Use subtasks** for complex work:
   ```bash
   npm run tasks:update <id> --add-subtask "Step 1"
   npm run tasks:update <id> --add-subtask "Step 2"
   ```

4. **Export weekly reports**:
   ```bash
   npm run tasks:list --export markdown > weekly-report.md
   ```

5. **Check statistics** regularly:
   ```bash
   npm run tasks:list --stats
   ```

## 🤝 Team Collaboration

While tasks are local, you can share them:

1. **Export your tasks**:
   ```bash
   npm run tasks:list --export markdown > my-tasks.md
   ```

2. **Share in team chat or PR**

3. **Import manually if needed** (edit tasks.json)

## 🔄 Migration from Archon

This system replaces Archon with a simpler, more reliable solution:
- No Docker required
- No complex MCP setup
- No external dependencies
- Works immediately
- Full control over your data

## ❓ FAQ

**Q: Where are tasks stored?**
A: In `tasks/tasks.json` in your project root.

**Q: Can I edit tasks.json directly?**
A: Yes, but be careful with the JSON format.

**Q: How do I backup my tasks?**
A: Copy `tasks/tasks.json` to a safe location.

**Q: Can I share tasks with my team?**
A: Export to markdown and share the file.

**Q: What if I delete a task by mistake?**
A: Restore from your backup or recreate it.

## 🐛 Troubleshooting

**"No tasks found"**
- Run `npm run tasks:init` first
- Check if `tasks/tasks.json` exists

**"Task not found"**
- Use `npm run tasks:list` to see task IDs
- Task IDs are numbers, not strings

**Module errors**
- Make sure you're using Node.js 18+
- Run `npm install` to ensure dependencies

## 📜 License

Part of The Meme Wars project - MIT License
