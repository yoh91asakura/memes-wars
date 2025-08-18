#!/usr/bin/env node

// Initialize the task management system
import { TaskManager } from './taskManager.js';

console.log('🚀 Initializing Task Management System...\n');

const manager = new TaskManager();

console.log('✅ Task system initialized successfully!');
console.log(`📁 Tasks directory: ./tasks`);
console.log(`📄 Tasks file: ./tasks/tasks.json\n`);

console.log('Available commands:');
console.log('  npm run tasks:list    - List all tasks');
console.log('  npm run tasks:new     - Create a new task');
console.log('  npm run tasks:update  - Update a task');
console.log('  npm run tasks:done    - Mark a task as done');
console.log('\nHappy task tracking! 🎯');
