#!/usr/bin/env node

// Create a new task
import { TaskManager, TaskPriority, prompt } from './taskManager.js';

const manager = new TaskManager();

async function createTask() {
  console.log('\n✨ Create New Task\n' + '='.repeat(40));
  
  try {
    // Get task title
    const title = await prompt('Task Title (required): ');
    if (!title.trim()) {
      console.error('❌ Task title is required!');
      process.exit(1);
    }
    
    // Get task description
    const description = await prompt('Description (optional): ');
    
    // Get assignee
    const assignee = await prompt('Assignee (optional): ');
    
    // Get priority
    console.log('\nPriority levels:');
    console.log('  1. low 🟢');
    console.log('  2. medium 🟡 (default)');
    console.log('  3. high 🟠');
    console.log('  4. critical 🔴');
    
    const priorityInput = await prompt('Priority (1-4 or name, default: medium): ');
    let priority = TaskPriority.MEDIUM;
    
    if (priorityInput) {
      const priorityMap = {
        '1': TaskPriority.LOW,
        '2': TaskPriority.MEDIUM,
        '3': TaskPriority.HIGH,
        '4': TaskPriority.CRITICAL,
        'low': TaskPriority.LOW,
        'medium': TaskPriority.MEDIUM,
        'high': TaskPriority.HIGH,
        'critical': TaskPriority.CRITICAL
      };
      
      priority = priorityMap[priorityInput.toLowerCase()] || TaskPriority.MEDIUM;
    }
    
    // Get tags
    const tagsInput = await prompt('Tags (comma-separated, optional): ');
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Create the task
    const newTask = manager.createTask(
      title.trim(),
      description.trim() || '',
      assignee.trim() || null,
      priority,
      tags
    );
    
    console.log('\n✅ Task created successfully!\n');
    console.log('Task Details:');
    console.log('-'.repeat(40));
    console.log(`ID: #${newTask.id}`);
    console.log(`Title: ${newTask.title}`);
    if (newTask.description) {
      console.log(`Description: ${newTask.description}`);
    }
    console.log(`Status: ${newTask.status}`);
    console.log(`Priority: ${newTask.priority}`);
    if (newTask.assignee) {
      console.log(`Assignee: ${newTask.assignee}`);
    }
    if (newTask.tags.length > 0) {
      console.log(`Tags: ${newTask.tags.join(', ')}`);
    }
    console.log(`Created: ${new Date(newTask.createdAt).toLocaleString()}`);
    
    console.log('\n💡 Next steps:');
    console.log(`  • View all tasks: npm run tasks:list`);
    console.log(`  • Update this task: npm run tasks:update ${newTask.id}`);
    console.log(`  • Mark as in-progress: npm run tasks:update ${newTask.id} --status in-progress`);
    
  } catch (error) {
    console.error(`\n❌ Error creating task: ${error.message}`);
    process.exit(1);
  }
}

// Check for quick add mode (command line arguments)
const args = process.argv.slice(2);
if (args.length > 0 && args[0] !== '--help' && args[0] !== '-h') {
  // Quick add mode
  const title = args.join(' ');
  const task = manager.createTask(title);
  console.log(`✅ Task #${task.id} created: "${task.title}"`);
  process.exit(0);
} else if (args[0] === '--help' || args[0] === '-h') {
  console.log('Usage: npm run tasks:new [title]');
  console.log('\nInteractive mode:');
  console.log('  npm run tasks:new');
  console.log('\nQuick add mode:');
  console.log('  npm run tasks:new Fix the login bug');
  console.log('\nThis will create a task with the given title using default settings.');
  process.exit(0);
} else {
  // Interactive mode
  createTask();
}
