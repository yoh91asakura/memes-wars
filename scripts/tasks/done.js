#!/usr/bin/env node

// Mark a task as done
import { TaskManager, TaskStatus } from './taskManager.js';

const manager = new TaskManager();
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('Usage: npm run tasks:done <task-id> [task-id...]');
  console.log('\nMark one or more tasks as done.');
  console.log('\nExamples:');
  console.log('  npm run tasks:done 1');
  console.log('  npm run tasks:done 1 2 3');
  console.log('\nOther status commands:');
  console.log('  npm run tasks:update 1 --status in-progress');
  console.log('  npm run tasks:update 1 --status review');
  console.log('  npm run tasks:update 1 --blocked "Reason"');
  process.exit(0);
}

// Process all task IDs
const taskIds = args.filter(arg => !isNaN(arg)).map(id => parseInt(id));

if (taskIds.length === 0) {
  console.error('❌ No valid task IDs provided!');
  process.exit(1);
}

let successCount = 0;
let errors = [];

taskIds.forEach(taskId => {
  try {
    const task = manager.getTask(taskId);
    
    if (!task) {
      errors.push(`Task #${taskId} not found`);
      return;
    }
    
    if (task.status === TaskStatus.DONE) {
      console.log(`📌 Task #${taskId} is already done: "${task.title}"`);
      return;
    }
    
    // Check if all subtasks are completed
    const incompleteSubtasks = task.subtasks.filter(st => !st.completed);
    if (incompleteSubtasks.length > 0) {
      console.log(`⚠️  Task #${taskId} has incomplete subtasks:`);
      incompleteSubtasks.forEach(st => {
        console.log(`   ⬜ ${st.title}`);
      });
      console.log('   Complete subtasks first or mark as done anyway with --force');
      
      // Check for --force flag
      if (!args.includes('--force')) {
        errors.push(`Task #${taskId} has incomplete subtasks`);
        return;
      }
    }
    
    const updatedTask = manager.updateTask(taskId, { status: TaskStatus.DONE });
    console.log(`✅ Task #${taskId} marked as done: "${updatedTask.title}"`);
    successCount++;
    
  } catch (error) {
    errors.push(`Task #${taskId}: ${error.message}`);
  }
});

// Summary
console.log('\n' + '='.repeat(40));

if (successCount > 0) {
  console.log(`✅ ${successCount} task(s) marked as done`);
}

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} error(s) occurred:`);
  errors.forEach(err => console.log(`  • ${err}`));
}

// Show statistics
const stats = manager.getStatistics();
console.log('\n📊 Current Status:');
console.log(`  📝 Todo: ${stats.byStatus.todo}`);
console.log(`  🔄 In Progress: ${stats.byStatus['in-progress']}`);
console.log(`  👀 Review: ${stats.byStatus.review}`);
console.log(`  ✅ Done: ${stats.byStatus.done}`);
console.log(`  🚫 Blocked: ${stats.byStatus.blocked}`);

if (stats.completedToday > 0) {
  console.log(`\n🎉 ${stats.completedToday} task(s) completed today!`);
}

process.exit(errors.length > 0 ? 1 : 0);
