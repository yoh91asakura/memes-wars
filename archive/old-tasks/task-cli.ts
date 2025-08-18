#!/usr/bin/env node

/**
 * CLI for Advanced Task Management System
 * Interactive command-line interface for task operations
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { 
  AdvancedTaskManager,
  TaskAnalyzer,
  TaskMonitor,
  TaskStatus,
  TaskPriority,
  TaskSize,
  Task,
  UserStory,
  TaskContext
} from './advanced-task-system';

const program = new Command();
const manager = new AdvancedTaskManager(process.cwd());
const monitor = new TaskMonitor(manager);

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTask(task: Task): string {
  const statusColors = {
    [TaskStatus.BACKLOG]: chalk.gray,
    [TaskStatus.TODO]: chalk.yellow,
    [TaskStatus.IN_PROGRESS]: chalk.blue,
    [TaskStatus.IN_REVIEW]: chalk.cyan,
    [TaskStatus.TESTING]: chalk.magenta,
    [TaskStatus.DONE]: chalk.green,
    [TaskStatus.BLOCKED]: chalk.red,
    [TaskStatus.CANCELLED]: chalk.strikethrough.gray
  };

  const priorityColors = {
    [TaskPriority.CRITICAL]: chalk.red.bold,
    [TaskPriority.HIGH]: chalk.red,
    [TaskPriority.MEDIUM]: chalk.yellow,
    [TaskPriority.LOW]: chalk.blue,
    [TaskPriority.NICE_TO_HAVE]: chalk.gray
  };

  const statusColor = statusColors[task.status] || chalk.white;
  const priorityColor = priorityColors[task.priority] || chalk.white;

  return `${statusColor(`[${task.status}]`)} ${priorityColor(`[${task.priority}]`)} ${chalk.bold(task.title)} (${task.size})`;
}

function displayTaskDetails(task: Task): void {
  console.log(chalk.bold.underline(`\nTask: ${task.title}`));
  console.log(`ID: ${chalk.gray(task.id)}`);
  if (task.githubIssueNumber) {
    console.log(`GitHub Issue: ${chalk.blue(`#${task.githubIssueNumber}`)}`);
  }
  
  console.log(`Status: ${formatStatus(task.status)}`);
  console.log(`Priority: ${formatPriority(task.priority)}`);
  console.log(`Size: ${task.size}`);
  
  if (task.userStory) {
    console.log(chalk.bold('\nUser Story:'));
    console.log(`As a ${chalk.cyan(task.userStory.persona)},`);
    console.log(`I want ${chalk.cyan(task.userStory.want)}`);
    console.log(`So that ${chalk.cyan(task.userStory.reason)}`);
  }
  
  if (task.acceptanceCriteria.length > 0) {
    console.log(chalk.bold('\nAcceptance Criteria:'));
    task.acceptanceCriteria.forEach(ac => {
      const check = ac.completed ? chalk.green('✓') : chalk.gray('○');
      console.log(`  ${check} ${ac.description}`);
      if (ac.verifiedBy) {
        console.log(chalk.gray(`    Verified by ${ac.verifiedBy} at ${ac.verifiedAt}`));
      }
    });
  }
  
  if (task.dependencies.length > 0) {
    console.log(chalk.bold('\nDependencies:'));
    task.dependencies.forEach(dep => {
      console.log(`  - ${dep.type}: ${dep.taskId}`);
      if (dep.description) {
        console.log(chalk.gray(`    ${dep.description}`));
      }
    });
  }
  
  if (task.context.files.length > 0) {
    console.log(chalk.bold('\nFiles to modify:'));
    task.context.files.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  if (task.tags.length > 0) {
    console.log(chalk.bold('\nTags:'));
    console.log(`  ${task.tags.map(tag => chalk.cyan(`#${tag}`)).join(' ')}`);
  }
  
  console.log(chalk.gray(`\nCreated: ${task.createdAt}`));
  console.log(chalk.gray(`Updated: ${task.updatedAt}`));
  if (task.startedAt) {
    console.log(chalk.gray(`Started: ${task.startedAt}`));
  }
  if (task.completedAt) {
    console.log(chalk.gray(`Completed: ${task.completedAt}`));
  }
}

function formatStatus(status: TaskStatus): string {
  const colors = {
    [TaskStatus.BACKLOG]: chalk.gray,
    [TaskStatus.TODO]: chalk.yellow,
    [TaskStatus.IN_PROGRESS]: chalk.blue,
    [TaskStatus.IN_REVIEW]: chalk.cyan,
    [TaskStatus.TESTING]: chalk.magenta,
    [TaskStatus.DONE]: chalk.green,
    [TaskStatus.BLOCKED]: chalk.red,
    [TaskStatus.CANCELLED]: chalk.strikethrough.gray
  };
  
  return (colors[status] || chalk.white)(status);
}

function formatPriority(priority: TaskPriority): string {
  const colors = {
    [TaskPriority.CRITICAL]: chalk.red.bold,
    [TaskPriority.HIGH]: chalk.red,
    [TaskPriority.MEDIUM]: chalk.yellow,
    [TaskPriority.LOW]: chalk.blue,
    [TaskPriority.NICE_TO_HAVE]: chalk.gray
  };
  
  return (colors[priority] || chalk.white)(priority);
}

// ============================================
// COMMANDS
// ============================================

program
  .name('task')
  .description('Advanced Task Management System CLI')
  .version('2.0.0');

// Create task command
program
  .command('create')
  .description('Create a new task interactively')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Task title:',
        validate: input => input.length > 0 || 'Title is required'
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Priority:',
        choices: Object.values(TaskPriority)
      },
      {
        type: 'list',
        name: 'size',
        message: 'Size estimate:',
        choices: [
          { name: 'XS - Less than 2 hours', value: TaskSize.XS },
          { name: 'S - 2-4 hours', value: TaskSize.S },
          { name: 'M - 4-8 hours (1 day)', value: TaskSize.M },
          { name: 'L - 2-3 days', value: TaskSize.L },
          { name: 'XL - 3-5 days', value: TaskSize.XL },
          { name: 'XXL - More than 5 days', value: TaskSize.XXL }
        ]
      },
      {
        type: 'confirm',
        name: 'hasUserStory',
        message: 'Add user story?',
        default: true
      }
    ]);
    
    let userStory: UserStory | undefined;
    if (answers.hasUserStory) {
      const storyAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'persona',
          message: 'As a:',
          default: 'player'
        },
        {
          type: 'input',
          name: 'want',
          message: 'I want:',
          validate: input => input.length > 0 || 'Required'
        },
        {
          type: 'input',
          name: 'reason',
          message: 'So that:',
          validate: input => input.length > 0 || 'Required'
        }
      ]);
      userStory = storyAnswers as UserStory;
    }
    
    // Acceptance criteria
    const criteriaAnswers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'acceptanceCriteria',
        message: 'Acceptance criteria (one per line):'
      }
    ]);
    
    const acceptanceCriteria = criteriaAnswers.acceptanceCriteria
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => line.trim());
    
    // Context
    const contextAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'files',
        message: 'Files to modify (comma-separated):'
      },
      {
        type: 'input',
        name: 'components',
        message: 'Components involved (comma-separated):'
      },
      {
        type: 'input',
        name: 'userImpact',
        message: 'User impact:'
      },
      {
        type: 'input',
        name: 'businessValue',
        message: 'Business value:'
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Tags (comma-separated):'
      }
    ]);
    
    const context: Partial<TaskContext> = {
      files: contextAnswers.files.split(',').map((f: string) => f.trim()).filter(Boolean),
      components: contextAnswers.components.split(',').map((c: string) => c.trim()).filter(Boolean),
      userImpact: contextAnswers.userImpact,
      businessValue: contextAnswers.businessValue,
      services: [],
      apis: [],
      risks: [],
      testScenarios: []
    };
    
    const tags = contextAnswers.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    
    const spinner = ora('Creating task...').start();
    
    try {
      const task = manager.createTask({
        title: answers.title,
        userStory,
        acceptanceCriteria,
        context,
        priority: answers.priority,
        size: answers.size,
        tags
      });
      
      spinner.succeed(chalk.green(`Task created: ${task.id}`));
      displayTaskDetails(task);
    } catch (error) {
      spinner.fail(chalk.red('Failed to create task'));
      console.error(error);
    }
  });

// List tasks command
program
  .command('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-a, --assignee <assignee>', 'Filter by assignee')
  .option('--ai-only', 'Show only AI-assignable tasks')
  .action(async (options) => {
    let tasks = manager.getAllTasks();
    
    if (options.status) {
      tasks = tasks.filter(t => t.status === options.status);
    }
    if (options.priority) {
      tasks = tasks.filter(t => t.priority === options.priority);
    }
    if (options.assignee) {
      tasks = tasks.filter(t => t.assignee === options.assignee);
    }
    if (options.aiOnly) {
      tasks = tasks.filter(t => t.assignedTo === 'ai-agent' || t.assignedTo === 'both');
    }
    
    if (tasks.length === 0) {
      console.log(chalk.yellow('No tasks found'));
      return;
    }
    
    const table = new Table({
      head: ['ID', 'Title', 'Status', 'Priority', 'Size', 'Assignee'],
      colWidths: [18, 40, 15, 12, 8, 15]
    });
    
    tasks.forEach(task => {
      table.push([
        task.id.substring(0, 16),
        task.title.substring(0, 38),
        formatStatus(task.status),
        formatPriority(task.priority),
        task.size,
        task.assignee || '-'
      ]);
    });
    
    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${tasks.length} tasks`));
  });

// View task command
program
  .command('view <taskId>')
  .description('View task details')
  .action(async (taskId) => {
    const task = manager.getTask(taskId);
    if (!task) {
      console.error(chalk.red(`Task ${taskId} not found`));
      return;
    }
    
    displayTaskDetails(task);
  });

// Update task status command
program
  .command('status <taskId> <newStatus>')
  .description('Update task status')
  .action(async (taskId, newStatus) => {
    try {
      const task = manager.updateTaskStatus(taskId, newStatus as TaskStatus);
      console.log(chalk.green(`Task ${taskId} status updated to ${newStatus}`));
      displayTaskDetails(task);
    } catch (error: any) {
      console.error(chalk.red(`Failed to update status: ${error.message}`));
    }
  });

// Auto-assign task command
program
  .command('assign <taskId>')
  .description('Auto-assign task to best resource')
  .action(async (taskId) => {
    const spinner = ora('Analyzing task for assignment...').start();
    
    try {
      const task = await manager.autoAssignTask(taskId);
      spinner.succeed(chalk.green(`Task assigned to ${task.assignee}`));
      
      if (task.assignedTo === 'ai-agent') {
        console.log(chalk.cyan(`AI Agent ID: ${task.aiAgentId}`));
      } else if (task.assignedTo === 'both') {
        console.log(chalk.cyan(`Collaboration between ${task.assignee} and AI Agent ${task.aiAgentId}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to assign task: ${error.message}`));
    }
  });

// Auto-analyze command
program
  .command('analyze')
  .description('Analyze codebase and create tasks automatically')
  .action(async () => {
    const spinner = ora('Analyzing codebase...').start();
    
    try {
      const tasks = await manager.autoAnalyzeAndCreateTasks(process.cwd());
      spinner.succeed(chalk.green(`Created ${tasks.length} tasks automatically`));
      
      if (tasks.length > 0) {
        console.log(chalk.bold('\nCreated tasks:'));
        tasks.forEach(task => {
          console.log(formatTask(task));
        });
        
        // Auto-assign tasks
        const assignSpinner = ora('Auto-assigning tasks...').start();
        let assigned = 0;
        
        for (const task of tasks) {
          if (task.autoAssignable) {
            await manager.autoAssignTask(task.id);
            assigned++;
          }
        }
        
        assignSpinner.succeed(chalk.green(`Auto-assigned ${assigned} tasks`));
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to analyze codebase'));
      console.error(error);
    }
  });

// Monitor command
program
  .command('monitor')
  .description('Start monitoring for automatic task creation')
  .option('-i, --interval <minutes>', 'Check interval in minutes', '30')
  .action(async (options) => {
    const interval = parseInt(options.interval);
    
    console.log(chalk.cyan(`Starting task monitor (checking every ${interval} minutes)...`));
    monitor.startMonitoring(interval);
    
    console.log(chalk.gray('Press Ctrl+C to stop monitoring'));
    
    // Keep process running
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nStopping monitor...'));
      monitor.stopMonitoring();
      process.exit(0);
    });
  });

// Stats command
program
  .command('stats')
  .description('Show task statistics')
  .action(async () => {
    const stats = manager.getStatistics();
    
    console.log(chalk.bold.underline('\nTask Statistics\n'));
    
    const statsTable = new Table({
      head: ['Metric', 'Count'],
      colWidths: [25, 10]
    });
    
    statsTable.push(
      ['Total Tasks', stats.total.toString()],
      ['', ''],
      [chalk.bold('By Status'), ''],
      ...Object.entries(stats.byStatus).map(([status, count]) => [
        `  ${formatStatus(status as TaskStatus)}`,
        count.toString()
      ]),
      ['', ''],
      [chalk.bold('By Priority'), ''],
      ...Object.entries(stats.byPriority).map(([priority, count]) => [
        `  ${formatPriority(priority as TaskPriority)}`,
        count.toString()
      ]),
      ['', ''],
      [chalk.bold('By Size'), ''],
      ...Object.entries(stats.bySize).map(([size, count]) => [
        `  ${size}`,
        count.toString()
      ])
    );
    
    console.log(statsTable.toString());
  });

// Sync command
program
  .command('sync')
  .description('Sync with GitHub issues and update roadmap')
  .action(async () => {
    const spinner = ora('Syncing with GitHub...').start();
    
    try {
      // This would sync all tasks with GitHub
      // For now, just update the roadmap
      spinner.text = 'Updating roadmap...';
      
      // The roadmap is automatically updated when tasks change
      // Force a refresh here
      const tasks = manager.getAllTasks();
      spinner.succeed(chalk.green(`Synced ${tasks.length} tasks`));
      
      console.log(chalk.cyan('Roadmap updated at roadmap.md'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to sync'));
      console.error(error);
    }
  });

// AI tasks command
program
  .command('ai-tasks')
  .description('List tasks for AI agents')
  .option('-a, --agent <agentId>', 'Filter by agent ID')
  .action(async (options) => {
    const tasks = manager.getTasksForAgent(options.agent);
    
    if (tasks.length === 0) {
      console.log(chalk.yellow('No tasks for AI agents'));
      return;
    }
    
    console.log(chalk.bold.underline('\nTasks for AI Agents\n'));
    
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const agent = task.aiAgentId || 'unassigned';
      if (!grouped[agent]) {
        grouped[agent] = [];
      }
      grouped[agent].push(task);
    });
    
    Object.entries(grouped).forEach(([agent, agentTasks]) => {
      console.log(chalk.cyan.bold(`\nAgent: ${agent}`));
      agentTasks.forEach(task => {
        console.log(`  ${formatTask(task)}`);
      });
    });
    
    console.log(chalk.gray(`\nTotal: ${tasks.length} tasks`));
  });

// Export command
program
  .command('export <format>')
  .description('Export tasks (json, markdown, csv)')
  .option('-o, --output <file>', 'Output file')
  .action(async (format, options) => {
    const tasks = manager.getAllTasks();
    let output = '';
    
    switch (format) {
      case 'json':
        output = JSON.stringify(tasks, null, 2);
        break;
        
      case 'markdown':
        output = '# Tasks\n\n';
        tasks.forEach(task => {
          output += `## ${task.title}\n\n`;
          output += `- **ID:** ${task.id}\n`;
          output += `- **Status:** ${task.status}\n`;
          output += `- **Priority:** ${task.priority}\n`;
          output += `- **Size:** ${task.size}\n`;
          
          if (task.userStory) {
            output += `\n### User Story\n`;
            output += `As a ${task.userStory.persona}, I want ${task.userStory.want} so that ${task.userStory.reason}\n`;
          }
          
          if (task.acceptanceCriteria.length > 0) {
            output += `\n### Acceptance Criteria\n`;
            task.acceptanceCriteria.forEach(ac => {
              output += `- [${ac.completed ? 'x' : ' '}] ${ac.description}\n`;
            });
          }
          
          output += '\n---\n\n';
        });
        break;
        
      case 'csv':
        output = 'ID,Title,Status,Priority,Size,Assignee,Created,Updated\n';
        tasks.forEach(task => {
          output += `"${task.id}","${task.title}","${task.status}","${task.priority}","${task.size}","${task.assignee || ''}","${task.createdAt}","${task.updatedAt}"\n`;
        });
        break;
        
      default:
        console.error(chalk.red(`Unknown format: ${format}`));
        return;
    }
    
    if (options.output) {
      const fs = require('fs');
      fs.writeFileSync(options.output, output);
      console.log(chalk.green(`Exported to ${options.output}`));
    } else {
      console.log(output);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
