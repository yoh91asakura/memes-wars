#!/usr/bin/env node

/**
 * Task Manager for File-Based Task System
 * Each task is a separate markdown file with full documentation
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TASKS_DIR = path.join(process.cwd(), 'tasks');
const ACTIVE_TASKS_DIR = path.join(TASKS_DIR, 'active');
const COMPLETED_TASKS_DIR = path.join(TASKS_DIR, 'completed');
const TEMPLATE_PATH = path.join(TASKS_DIR, 'templates', 'TASK_TEMPLATE.md');

// Ensure directories exist
[TASKS_DIR, ACTIVE_TASKS_DIR, COMPLETED_TASKS_DIR, path.join(TASKS_DIR, 'templates')].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

class TaskManager {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question) {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }

  generateTaskId() {
    const tasks = this.getAllTasks();
    const maxId = tasks.reduce((max, task) => {
      const match = task.match(/TASK-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return `TASK-${String(maxId + 1).padStart(3, '0')}`;
  }

  getAllTasks() {
    const activeTasks = fs.existsSync(ACTIVE_TASKS_DIR) 
      ? fs.readdirSync(ACTIVE_TASKS_DIR).filter(f => f.endsWith('.md'))
      : [];
    const completedTasks = fs.existsSync(COMPLETED_TASKS_DIR)
      ? fs.readdirSync(COMPLETED_TASKS_DIR).filter(f => f.endsWith('.md'))
      : [];
    return [...activeTasks, ...completedTasks];
  }

  async createTask() {
    console.log('\n✨ Create New Task\n');
    
    const taskId = this.generateTaskId();
    const title = await this.prompt('Task Title: ');
    const priority = await this.prompt('Priority (CRITICAL/HIGH/MEDIUM/LOW): ');
    const size = await this.prompt('Size (XS/S/M/L/XL): ');
    const epic = await this.prompt('Epic/Category: ');
    
    // User Story
    console.log('\n📖 User Story:');
    const persona = await this.prompt('As a (persona): ');
    const want = await this.prompt('I want: ');
    const reason = await this.prompt('So that: ');
    
    // Description
    const description = await this.prompt('\n📝 Description: ');
    
    // Acceptance Criteria
    console.log('\n✅ Acceptance Criteria (enter empty line to finish):');
    const acceptanceCriteria = [];
    let criterion;
    while ((criterion = await this.prompt(`Criterion ${acceptanceCriteria.length + 1}: `)) !== '') {
      acceptanceCriteria.push(criterion);
    }
    
    // Technical Details
    console.log('\n🔧 Technical Details:');
    const files = await this.prompt('Files to modify (comma-separated): ');
    const components = await this.prompt('Components affected (comma-separated): ');
    const dependencies = await this.prompt('Dependencies (comma-separated, or none): ');
    
    // Implementation Notes
    const implementationNotes = await this.prompt('\n💡 Implementation approach: ');
    
    // Generate the task file
    const template = fs.existsSync(TEMPLATE_PATH) 
      ? fs.readFileSync(TEMPLATE_PATH, 'utf8')
      : this.getDefaultTemplate();
    
    const taskContent = template
      .replace('[TASK_ID]', taskId)
      .replace('[TASK_TITLE]', title)
      .replace('[DATE]', new Date().toISOString().split('T')[0])
      .replace('TODO | IN_PROGRESS | REVIEW | DONE | BLOCKED', 'TODO')
      .replace('CRITICAL | HIGH | MEDIUM | LOW', priority.toUpperCase())
      .replace('XS | S | M | L | XL', size.toUpperCase())
      .replace('[DEVELOPER_NAME]', '[Unassigned]')
      .replace('[EPIC_NAME]', epic)
      .replace('[SPRINT_NUMBER]', 'Current')
      .replace('[persona]', persona)
      .replace('[what]', want)
      .replace('[why]', reason)
      .replace('[Detailed description of the task and its context]', description)
      .replace(/- \[ \] \[Criterion \d+\]/g, (match, offset, string) => {
        const index = string.substring(0, offset).split('[Criterion').length - 1;
        return acceptanceCriteria[index - 1] ? `- [ ] ${acceptanceCriteria[index - 1]}` : match;
      })
      .replace('`path/to/file1.ts`\n- `path/to/file2.tsx`', files.split(',').map(f => `- \`${f.trim()}\``).join('\n'))
      .replace('- Component1\n- Component2', components.split(',').map(c => `- ${c.trim()}`).join('\n'))
      .replace('[Task ID] - [Task Name]\n- External library: [Library Name]', dependencies.trim() || '- None')
      .replace('[Technical approach, architecture decisions, patterns to follow]', implementationNotes);
    
    // Clean up remaining placeholders in acceptance criteria
    const cleanedContent = taskContent.replace(/- \[ \] \[Criterion \d+\]\n/g, '');
    
    const fileName = `${taskId}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.md`;
    const filePath = path.join(ACTIVE_TASKS_DIR, fileName);
    
    fs.writeFileSync(filePath, cleanedContent);
    console.log(`\n✅ Task created: ${filePath}`);
    
    return taskId;
  }

  async listTasks() {
    console.log('\n📋 Active Tasks:\n');
    const activeTasks = fs.readdirSync(ACTIVE_TASKS_DIR).filter(f => f.endsWith('.md'));
    
    if (activeTasks.length === 0) {
      console.log('No active tasks found.');
    } else {
      activeTasks.forEach(taskFile => {
        const content = fs.readFileSync(path.join(ACTIVE_TASKS_DIR, taskFile), 'utf8');
        const idMatch = content.match(/\*\*ID\*\*: (TASK-\d+)/);
        const statusMatch = content.match(/\*\*Status\*\*: (\w+)/);
        const priorityMatch = content.match(/\*\*Priority\*\*: (\w+)/);
        const titleMatch = content.match(/# Task: (.+)/);
        
        if (idMatch && titleMatch) {
          console.log(`${idMatch[1]} - ${titleMatch[1]} [${priorityMatch?.[1] || 'N/A'}] (${statusMatch?.[1] || 'TODO'})`);
        }
      });
    }
    
    console.log('\n✅ Completed Tasks:\n');
    const completedTasks = fs.readdirSync(COMPLETED_TASKS_DIR).filter(f => f.endsWith('.md'));
    
    if (completedTasks.length === 0) {
      console.log('No completed tasks found.');
    } else {
      completedTasks.forEach(taskFile => {
        const content = fs.readFileSync(path.join(COMPLETED_TASKS_DIR, taskFile), 'utf8');
        const idMatch = content.match(/\*\*ID\*\*: (TASK-\d+)/);
        const titleMatch = content.match(/# Task: (.+)/);
        
        if (idMatch && titleMatch) {
          console.log(`${idMatch[1]} - ${titleMatch[1]}`);
        }
      });
    }
  }

  async updateTaskStatus() {
    const taskId = await this.prompt('Enter Task ID (e.g., TASK-001): ');
    const newStatus = await this.prompt('New Status (TODO/IN_PROGRESS/REVIEW/DONE/BLOCKED): ');
    const developer = await this.prompt('Developer name: ');
    const notes = await this.prompt('Update notes: ');
    
    // Find the task file
    let taskFile = null;
    let taskPath = null;
    
    const activeTasks = fs.readdirSync(ACTIVE_TASKS_DIR).filter(f => f.includes(taskId));
    if (activeTasks.length > 0) {
      taskFile = activeTasks[0];
      taskPath = path.join(ACTIVE_TASKS_DIR, taskFile);
    } else {
      const completedTasks = fs.readdirSync(COMPLETED_TASKS_DIR).filter(f => f.includes(taskId));
      if (completedTasks.length > 0) {
        taskFile = completedTasks[0];
        taskPath = path.join(COMPLETED_TASKS_DIR, taskFile);
      }
    }
    
    if (!taskPath) {
      console.log(`❌ Task ${taskId} not found.`);
      return;
    }
    
    let content = fs.readFileSync(taskPath, 'utf8');
    
    // Update status
    content = content.replace(/\*\*Status\*\*: \w+/, `**Status**: ${newStatus.toUpperCase()}`);
    
    // Update assignee if provided
    if (developer) {
      content = content.replace(/\*\*Assignee\*\*: .+/, `**Assignee**: ${developer}`);
    }
    
    // Add to update log
    const date = new Date().toISOString().split('T')[0];
    const updateEntry = `- ${date} - ${newStatus.toUpperCase()} - ${developer} - ${notes}`;
    content = content.replace('## 🔄 Updates Log', `## 🔄 Updates Log\n${updateEntry}`);
    
    // Move file if status is DONE
    if (newStatus.toUpperCase() === 'DONE') {
      const newPath = path.join(COMPLETED_TASKS_DIR, taskFile);
      fs.writeFileSync(newPath, content);
      fs.unlinkSync(taskPath);
      console.log(`✅ Task ${taskId} marked as DONE and moved to completed.`);
    } else {
      // Move back to active if it was completed but status changed
      if (taskPath.includes('completed') && newStatus.toUpperCase() !== 'DONE') {
        const newPath = path.join(ACTIVE_TASKS_DIR, taskFile);
        fs.writeFileSync(newPath, content);
        fs.unlinkSync(taskPath);
        console.log(`📋 Task ${taskId} moved back to active tasks.`);
      } else {
        fs.writeFileSync(taskPath, content);
        console.log(`✅ Task ${taskId} updated to ${newStatus.toUpperCase()}.`);
      }
    }
  }

  getDefaultTemplate() {
    return `# Task: [TASK_TITLE]

## 📋 Metadata
- **ID**: [TASK_ID]
- **Created**: [DATE]
- **Status**: TODO | IN_PROGRESS | REVIEW | DONE | BLOCKED
- **Priority**: CRITICAL | HIGH | MEDIUM | LOW
- **Size**: XS | S | M | L | XL
- **Assignee**: [DEVELOPER_NAME]
- **Epic**: [EPIC_NAME]
- **Sprint**: [SPRINT_NUMBER]

## 🎯 User Story
**As a** [persona]  
**I want** [what]  
**So that** [why]

## 📝 Description
[Detailed description of the task and its context]

## ✅ Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
- [ ] [Criterion 4]
- [ ] [Criterion 5]

## 🔧 Technical Details

### Files to Modify
- \`path/to/file1.ts\`
- \`path/to/file2.tsx\`

### Components Affected
- Component1
- Component2

### Dependencies
- [Task ID] - [Task Name]
- External library: [Library Name]

## 💡 Implementation Notes
[Technical approach, architecture decisions, patterns to follow]

## 🔄 Updates Log

---
*This task is part of The Meme Wars TCG project*`;
  }

  async run() {
    console.log('📋 Task Management System\n');
    console.log('1. Create new task');
    console.log('2. List all tasks');
    console.log('3. Update task status');
    console.log('4. Exit\n');
    
    const choice = await this.prompt('Choose an option: ');
    
    switch(choice) {
      case '1':
        await this.createTask();
        break;
      case '2':
        await this.listTasks();
        break;
      case '3':
        await this.updateTaskStatus();
        break;
      case '4':
        console.log('Goodbye!');
        this.rl.close();
        return;
      default:
        console.log('Invalid option.');
    }
    
    // Ask if user wants to continue
    const continueChoice = await this.prompt('\nDo you want to perform another action? (y/n): ');
    if (continueChoice.toLowerCase() === 'y') {
      await this.run();
    } else {
      this.rl.close();
    }
  }
}

// Run the task manager
const manager = new TaskManager();
manager.run().catch(console.error);
