// Task Manager - Core utilities for managing tasks
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TASKS_DIR = path.join(process.cwd(), 'tasks');
const TASKS_FILE = path.join(TASKS_DIR, 'tasks.json');

// Task status values
const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done',
  BLOCKED: 'blocked'
};

// Task priority values
const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class TaskManager {
  constructor() {
    this.ensureTasksDirectory();
    this.tasks = this.loadTasks();
  }

  ensureTasksDirectory() {
    if (!fs.existsSync(TASKS_DIR)) {
      fs.mkdirSync(TASKS_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(TASKS_FILE)) {
      this.saveTasks({ tasks: [], nextId: 1 });
    }
  }

  loadTasks() {
    try {
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading tasks:', error.message);
      return { tasks: [], nextId: 1 };
    }
  }

  saveTasks(data = this.tasks) {
    try {
      fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error.message);
      return false;
    }
  }

  createTask(title, description = '', assignee = null, priority = TaskPriority.MEDIUM, tags = []) {
    const newTask = {
      id: this.tasks.nextId,
      title,
      description,
      status: TaskStatus.TODO,
      priority,
      assignee,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      blockedReason: null,
      subtasks: []
    };

    this.tasks.tasks.push(newTask);
    this.tasks.nextId++;
    this.saveTasks();
    
    return newTask;
  }

  updateTask(taskId, updates) {
    const taskIndex = this.tasks.tasks.findIndex(t => t.id === parseInt(taskId));
    
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const task = this.tasks.tasks[taskIndex];
    
    // Update allowed fields
    const allowedFields = ['title', 'description', 'status', 'priority', 'assignee', 'tags', 'blockedReason'];
    allowedFields.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        task[field] = updates[field];
      }
    });

    task.updatedAt = new Date().toISOString();

    // Set completedAt if status is done
    if (updates.status === TaskStatus.DONE && !task.completedAt) {
      task.completedAt = new Date().toISOString();
    }

    this.tasks.tasks[taskIndex] = task;
    this.saveTasks();
    
    return task;
  }

  deleteTask(taskId) {
    const initialLength = this.tasks.tasks.length;
    this.tasks.tasks = this.tasks.tasks.filter(t => t.id !== parseInt(taskId));
    
    if (this.tasks.tasks.length === initialLength) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    this.saveTasks();
    return true;
  }

  getTask(taskId) {
    return this.tasks.tasks.find(t => t.id === parseInt(taskId));
  }

  getAllTasks() {
    return this.tasks.tasks;
  }

  getTasksByStatus(status) {
    return this.tasks.tasks.filter(t => t.status === status);
  }

  getTasksByAssignee(assignee) {
    return this.tasks.tasks.filter(t => t.assignee === assignee);
  }

  getTasksByPriority(priority) {
    return this.tasks.tasks.filter(t => t.priority === priority);
  }

  getTasksByTag(tag) {
    return this.tasks.tasks.filter(t => t.tags.includes(tag));
  }

  addSubtask(parentTaskId, subtaskTitle) {
    const task = this.getTask(parentTaskId);
    if (!task) {
      throw new Error(`Task with ID ${parentTaskId} not found`);
    }

    const subtask = {
      id: `${parentTaskId}-${task.subtasks.length + 1}`,
      title: subtaskTitle,
      completed: false
    };

    task.subtasks.push(subtask);
    this.updateTask(parentTaskId, { subtasks: task.subtasks });
    
    return subtask;
  }

  toggleSubtask(parentTaskId, subtaskId) {
    const task = this.getTask(parentTaskId);
    if (!task) {
      throw new Error(`Task with ID ${parentTaskId} not found`);
    }

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
      throw new Error(`Subtask with ID ${subtaskId} not found`);
    }

    subtask.completed = !subtask.completed;
    this.updateTask(parentTaskId, { subtasks: task.subtasks });
    
    return subtask;
  }

  getStatistics() {
    const stats = {
      total: this.tasks.tasks.length,
      byStatus: {},
      byPriority: {},
      completedToday: 0,
      completedThisWeek: 0,
      overdue: 0
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Initialize counters
    Object.values(TaskStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });
    Object.values(TaskPriority).forEach(priority => {
      stats.byPriority[priority] = 0;
    });

    // Count tasks
    this.tasks.tasks.forEach(task => {
      stats.byStatus[task.status]++;
      stats.byPriority[task.priority]++;

      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (completedDate >= today) {
          stats.completedToday++;
        }
        if (completedDate >= weekAgo) {
          stats.completedThisWeek++;
        }
      }
    });

    return stats;
  }

  exportTasks(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.tasks, null, 2);
    } else if (format === 'markdown') {
      let markdown = '# Tasks\n\n';
      
      Object.values(TaskStatus).forEach(status => {
        const tasks = this.getTasksByStatus(status);
        if (tasks.length > 0) {
          markdown += `## ${status.toUpperCase()}\n\n`;
          tasks.forEach(task => {
            markdown += `- **[${task.id}]** ${task.title}`;
            if (task.priority !== TaskPriority.MEDIUM) {
              markdown += ` _(${task.priority})_`;
            }
            if (task.assignee) {
              markdown += ` - @${task.assignee}`;
            }
            markdown += '\n';
            if (task.description) {
              markdown += `  ${task.description}\n`;
            }
            if (task.subtasks.length > 0) {
              task.subtasks.forEach(st => {
                markdown += `  - [${st.completed ? 'x' : ' '}] ${st.title}\n`;
              });
            }
            markdown += '\n';
          });
        }
      });
      
      return markdown;
    }
    
    throw new Error(`Unsupported export format: ${format}`);
  }
}

// Interactive prompt utility
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

export {
  TaskManager,
  TaskStatus,
  TaskPriority,
  prompt
};
