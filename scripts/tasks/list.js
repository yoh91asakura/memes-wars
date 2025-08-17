#!/usr/bin/env node

// List tasks with various filters
import { TaskManager, TaskStatus, TaskPriority } from './taskManager.js';

const args = process.argv.slice(2);
const manager = new TaskManager();

// Parse command line arguments
let filter = null;
let filterValue = null;
let showStats = false;
let exportFormat = null;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--status':
    case '-s':
      filter = 'status';
      filterValue = args[++i];
      break;
    case '--assignee':
    case '-a':
      filter = 'assignee';
      filterValue = args[++i];
      break;
    case '--priority':
    case '-p':
      filter = 'priority';
      filterValue = args[++i];
      break;
    case '--tag':
    case '-t':
      filter = 'tag';
      filterValue = args[++i];
      break;
    case '--stats':
      showStats = true;
      break;
    case '--export':
    case '-e':
      exportFormat = args[++i] || 'markdown';
      break;
    case '--help':
    case '-h':
      console.log('Usage: npm run tasks:list [options]');
      console.log('\nOptions:');
      console.log('  -s, --status <status>     Filter by status (todo, in-progress, review, done, blocked)');
      console.log('  -a, --assignee <name>     Filter by assignee');
      console.log('  -p, --priority <level>    Filter by priority (low, medium, high, critical)');
      console.log('  -t, --tag <tag>           Filter by tag');
      console.log('  --stats                   Show task statistics');
      console.log('  -e, --export <format>     Export tasks (json, markdown)');
      console.log('  -h, --help                Show this help message');
      process.exit(0);
  }
}

// Handle export
if (exportFormat) {
  try {
    const exported = manager.exportTasks(exportFormat);
    console.log(exported);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  process.exit(0);
}

// Handle statistics
if (showStats) {
  const stats = manager.getStatistics();
  console.log('\n📊 Task Statistics\n' + '='.repeat(40));
  console.log(`Total Tasks: ${stats.total}`);
  console.log('\nBy Status:');
  Object.entries(stats.byStatus).forEach(([status, count]) => {
    const emoji = {
      'todo': '📝',
      'in-progress': '🔄',
      'review': '👀',
      'done': '✅',
      'blocked': '🚫'
    }[status] || '•';
    console.log(`  ${emoji} ${status}: ${count}`);
  });
  console.log('\nBy Priority:');
  Object.entries(stats.byPriority).forEach(([priority, count]) => {
    const emoji = {
      'critical': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢'
    }[priority] || '•';
    console.log(`  ${emoji} ${priority}: ${count}`);
  });
  console.log(`\n📅 Completed Today: ${stats.completedToday}`);
  console.log(`📅 Completed This Week: ${stats.completedThisWeek}`);
  process.exit(0);
}

// Get filtered tasks
let tasks;
if (filter && filterValue) {
  switch (filter) {
    case 'status':
      tasks = manager.getTasksByStatus(filterValue);
      break;
    case 'assignee':
      tasks = manager.getTasksByAssignee(filterValue);
      break;
    case 'priority':
      tasks = manager.getTasksByPriority(filterValue);
      break;
    case 'tag':
      tasks = manager.getTasksByTag(filterValue);
      break;
    default:
      tasks = manager.getAllTasks();
  }
} else {
  tasks = manager.getAllTasks();
}

// Display tasks
if (tasks.length === 0) {
  console.log('\n📭 No tasks found\n');
  if (!filter) {
    console.log('Create your first task with: npm run tasks:new');
  }
  process.exit(0);
}

console.log('\n📋 Tasks\n' + '='.repeat(60));

// Group tasks by status
const tasksByStatus = {};
Object.values(TaskStatus).forEach(status => {
  tasksByStatus[status] = tasks.filter(t => t.status === status);
});

// Display tasks by status
Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
  if (statusTasks.length > 0) {
    const statusEmoji = {
      'todo': '📝',
      'in-progress': '🔄',
      'review': '👀',
      'done': '✅',
      'blocked': '🚫'
    }[status] || '•';
    
    console.log(`\n${statusEmoji} ${status.toUpperCase()} (${statusTasks.length})`);
    console.log('-'.repeat(40));
    
    statusTasks.forEach(task => {
      const priorityEmoji = {
        'critical': '🔴',
        'high': '🟠',
        'medium': '🟡',
        'low': '🟢'
      }[task.priority] || '';
      
      console.log(`\n  [#${task.id}] ${priorityEmoji} ${task.title}`);
      
      if (task.description) {
        console.log(`  📄 ${task.description}`);
      }
      
      if (task.assignee) {
        console.log(`  👤 Assigned to: ${task.assignee}`);
      }
      
      if (task.tags.length > 0) {
        console.log(`  🏷️  Tags: ${task.tags.join(', ')}`);
      }
      
      if (task.blockedReason && status === 'blocked') {
        console.log(`  ⚠️  Blocked: ${task.blockedReason}`);
      }
      
      if (task.subtasks.length > 0) {
        const completed = task.subtasks.filter(st => st.completed).length;
        console.log(`  📌 Subtasks: ${completed}/${task.subtasks.length} completed`);
        task.subtasks.forEach(st => {
          console.log(`     ${st.completed ? '✅' : '⬜'} ${st.title}`);
        });
      }
      
      const created = new Date(task.createdAt);
      const updated = new Date(task.updatedAt);
      console.log(`  📅 Created: ${created.toLocaleDateString()} | Updated: ${updated.toLocaleDateString()}`);
    });
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n💡 Tips:');
console.log('  • Use npm run tasks:update <id> to modify a task');
console.log('  • Use npm run tasks:done <id> to mark as complete');
console.log('  • Use npm run tasks:list --stats for statistics');
console.log('  • Use npm run tasks:list --export markdown > tasks.md to export');
