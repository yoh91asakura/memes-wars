#!/usr/bin/env node

// Update an existing task
import { TaskManager, TaskStatus, TaskPriority, prompt } from './taskManager.js';

const manager = new TaskManager();
const args = process.argv.slice(2);

// Parse arguments
let taskId = null;
let updates = {};
let addSubtask = null;
let toggleSubtask = null;

for (let i = 0; i < args.length; i++) {
  if (!isNaN(args[i]) && !taskId) {
    taskId = parseInt(args[i]);
  } else {
    switch (args[i]) {
      case '--status':
      case '-s':
        updates.status = args[++i];
        break;
      case '--title':
      case '-t':
        updates.title = args[++i];
        break;
      case '--description':
      case '-d':
        updates.description = args[++i];
        break;
      case '--priority':
      case '-p':
        updates.priority = args[++i];
        break;
      case '--assignee':
      case '-a':
        updates.assignee = args[++i];
        break;
      case '--tags':
        updates.tags = args[++i].split(',').map(t => t.trim());
        break;
      case '--blocked':
      case '-b':
        updates.status = TaskStatus.BLOCKED;
        updates.blockedReason = args[++i];
        break;
      case '--unblock':
        updates.status = TaskStatus.TODO;
        updates.blockedReason = null;
        break;
      case '--add-subtask':
        addSubtask = args[++i];
        break;
      case '--toggle-subtask':
        toggleSubtask = args[++i];
        break;
      case '--help':
      case '-h':
        console.log('Usage: npm run tasks:update <task-id> [options]');
        console.log('\nOptions:');
        console.log('  -s, --status <status>          Update status (todo, in-progress, review, done, blocked)');
        console.log('  -t, --title <title>            Update title');
        console.log('  -d, --description <desc>       Update description');
        console.log('  -p, --priority <priority>      Update priority (low, medium, high, critical)');
        console.log('  -a, --assignee <name>          Update assignee');
        console.log('  --tags <tag1,tag2>             Update tags (comma-separated)');
        console.log('  -b, --blocked <reason>         Mark as blocked with reason');
        console.log('  --unblock                      Remove blocked status');
        console.log('  --add-subtask <title>          Add a subtask');
        console.log('  --toggle-subtask <id>          Toggle subtask completion');
        console.log('\nExamples:');
        console.log('  npm run tasks:update 1 --status in-progress');
        console.log('  npm run tasks:update 1 --priority high --assignee John');
        console.log('  npm run tasks:update 1 --blocked "Waiting for API access"');
        console.log('  npm run tasks:update 1 --add-subtask "Write unit tests"');
        process.exit(0);
    }
  }
}

async function updateTaskInteractive() {
  if (!taskId) {
    const idInput = await prompt('Task ID to update: ');
    taskId = parseInt(idInput);
  }

  const task = manager.getTask(taskId);
  if (!task) {
    console.error(`❌ Task #${taskId} not found!`);
    process.exit(1);
  }

  console.log('\n📝 Current Task:');
  console.log('-'.repeat(40));
  console.log(`ID: #${task.id}`);
  console.log(`Title: ${task.title}`);
  console.log(`Description: ${task.description || '(none)'}`);;
  console.log(`Status: ${task.status}`);
  console.log(`Priority: ${task.priority}`);
  console.log(`Assignee: ${task.assignee || '(unassigned)'}`);
  console.log(`Tags: ${task.tags.length > 0 ? task.tags.join(', ') : '(none)'}`);
  if (task.blockedReason) {
    console.log(`Blocked: ${task.blockedReason}`);
  }
  if (task.subtasks.length > 0) {
    console.log(`Subtasks: ${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length} completed`);
  }

  console.log('\n🔄 Update Task (press Enter to skip field)\n' + '='.repeat(40));

  // Interactive updates
  const newTitle = await prompt(`New title [${task.title}]: `);
  if (newTitle) updates.title = newTitle;

  const newDescription = await prompt(`New description [${task.description || 'none'}]: `);
  if (newDescription) updates.description = newDescription;

  console.log('\nStatus options: todo, in-progress, review, done, blocked');
  const newStatus = await prompt(`New status [${task.status}]: `);
  if (newStatus) {
    updates.status = newStatus;
    if (newStatus === TaskStatus.BLOCKED) {
      const reason = await prompt('Blocked reason: ');
      updates.blockedReason = reason;
    }
  }

  console.log('\nPriority options: low, medium, high, critical');
  const newPriority = await prompt(`New priority [${task.priority}]: `);
  if (newPriority) updates.priority = newPriority;

  const newAssignee = await prompt(`New assignee [${task.assignee || 'none'}]: `);
  if (newAssignee) updates.assignee = newAssignee;

  const newTags = await prompt(`New tags (comma-separated) [${task.tags.join(', ') || 'none'}]: `);
  if (newTags) updates.tags = newTags.split(',').map(t => t.trim());

  // Ask about subtasks
  const addSubtaskInput = await prompt('Add a subtask? (y/n): ');
  if (addSubtaskInput.toLowerCase() === 'y') {
    const subtaskTitle = await prompt('Subtask title: ');
    if (subtaskTitle) {
      manager.addSubtask(taskId, subtaskTitle);
      console.log('✅ Subtask added');
    }
  }
}

// Main execution
(async () => {
  try {
    // Handle subtask operations first
    if (taskId && addSubtask) {
      const subtask = manager.addSubtask(taskId, addSubtask);
      console.log(`✅ Added subtask: "${subtask.title}" to task #${taskId}`);
      process.exit(0);
    }

    if (taskId && toggleSubtask) {
      const subtask = manager.toggleSubtask(taskId, toggleSubtask);
      console.log(`✅ Subtask "${subtask.title}" marked as ${subtask.completed ? 'completed' : 'incomplete'}`);
      process.exit(0);
    }

    // Handle task updates
    if (taskId && Object.keys(updates).length > 0) {
      // Direct update mode
      const updatedTask = manager.updateTask(taskId, updates);
      console.log(`✅ Task #${taskId} updated successfully!`);
      
      // Show what was updated
      if (updates.status) console.log(`  • Status: ${updatedTask.status}`);
      if (updates.title) console.log(`  • Title: ${updatedTask.title}`);
      if (updates.description !== undefined) console.log(`  • Description: ${updatedTask.description || '(cleared)'}`);
      if (updates.priority) console.log(`  • Priority: ${updatedTask.priority}`);
      if (updates.assignee !== undefined) console.log(`  • Assignee: ${updatedTask.assignee || '(unassigned)'}`);
      if (updates.tags) console.log(`  • Tags: ${updatedTask.tags.join(', ') || '(none)'}`);
      if (updates.blockedReason !== undefined) {
        console.log(`  • Blocked: ${updatedTask.blockedReason || '(unblocked)'}`);
      }
    } else {
      // Interactive mode
      await updateTaskInteractive();
      
      if (Object.keys(updates).length > 0) {
        const updatedTask = manager.updateTask(taskId, updates);
        console.log(`\n✅ Task #${taskId} updated successfully!`);
      } else {
        console.log('\n📌 No changes made.');
      }
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
})();
