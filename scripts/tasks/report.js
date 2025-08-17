#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Read tasks file
function loadTasks() {
  const tasksPath = path.join(process.cwd(), 'tasks', 'detailed-tasks.json');
  const fallbackPath = path.join(process.cwd(), 'tasks', 'tasks.json');
  
  try {
    if (fs.existsSync(tasksPath)) {
      return JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
    } else if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
  } catch (error) {
    console.error(`${colors.red}Error loading tasks:${colors.reset}`, error.message);
    process.exit(1);
  }
  
  console.error(`${colors.red}No tasks file found!${colors.reset}`);
  process.exit(1);
}

// Generate markdown report
function generateMarkdownReport(data) {
  const now = new Date().toISOString().split('T')[0];
  const tasks = data.tasks || [];
  const features = data.features || [];
  
  // Calculate statistics
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    blocked: tasks.filter(t => t.blockedReason).length,
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };
  
  const completionRate = stats.total > 0 ? ((stats.done / stats.total) * 100).toFixed(1) : 0;
  
  let report = `# 📊 Task Report - ${now}\n\n`;
  report += `## 📈 Overview\n\n`;
  report += `- **Total Tasks:** ${stats.total}\n`;
  report += `- **Completion Rate:** ${completionRate}%\n`;
  report += `- **In Progress:** ${stats.inProgress}\n`;
  report += `- **Blocked:** ${stats.blocked}\n\n`;
  
  // Feature progress
  if (features.length > 0) {
    report += `## 🎯 Feature Progress\n\n`;
    report += `| Feature | Status | Progress | Priority |\n`;
    report += `|---------|--------|----------|----------|\n`;
    features.forEach(f => {
      const statusEmoji = f.status === 'in-progress' ? '🔄' : 
                          f.status === 'done' ? '✅' : '⏳';
      report += `| ${f.name} | ${statusEmoji} ${f.status} | ${f.progress}% | ${f.priority} |\n`;
    });
    report += `\n`;
  }
  
  // Priority breakdown
  report += `## 🔥 Priority Breakdown\n\n`;
  report += `- **Critical:** ${stats.critical} tasks\n`;
  report += `- **High:** ${stats.high} tasks\n`;
  report += `- **Medium:** ${stats.medium} tasks\n`;
  report += `- **Low:** ${stats.low} tasks\n\n`;
  
  // Current sprint (in-progress tasks)
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  if (inProgressTasks.length > 0) {
    report += `## 🚀 Current Sprint\n\n`;
    inProgressTasks.forEach(task => {
      report += `### [#${task.id}] ${task.title}\n`;
      report += `- **Assignee:** ${task.assignee || 'Unassigned'}\n`;
      report += `- **Feature:** ${task.feature || 'N/A'}\n`;
      report += `- **Progress:** ${task.actualHours || 0}/${task.estimatedHours || '?'} hours\n`;
      if (task.subtasks && task.subtasks.length > 0) {
        report += `- **Subtasks:**\n`;
        task.subtasks.forEach(st => {
          const check = st.status === 'done' ? '✅' : '⬜';
          report += `  - ${check} ${st.title}\n`;
        });
      }
      report += `\n`;
    });
  }
  
  // Blocked tasks
  const blockedTasks = tasks.filter(t => t.blockedReason);
  if (blockedTasks.length > 0) {
    report += `## 🚧 Blocked Tasks\n\n`;
    blockedTasks.forEach(task => {
      report += `- **[#${task.id}] ${task.title}**\n`;
      report += `  - Reason: ${task.blockedReason}\n`;
      if (task.dependencies && task.dependencies.length > 0) {
        report += `  - Dependencies: ${task.dependencies.join(', ')}\n`;
      }
    });
    report += `\n`;
  }
  
  // Ready to start (todo with no blockers)
  const readyTasks = tasks.filter(t => 
    t.status === 'todo' && 
    !t.blockedReason && 
    (!t.dependencies || t.dependencies.length === 0 || 
     t.dependencies.every(dep => {
       const depTask = tasks.find(dt => dt.id === dep);
       return depTask && depTask.status === 'done';
     }))
  );
  
  if (readyTasks.length > 0) {
    report += `## ✅ Ready to Start\n\n`;
    report += `| ID | Task | Priority | Est. Hours | Tags |\n`;
    report += `|----|------|----------|------------|------|\n`;
    readyTasks
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
      })
      .forEach(task => {
        const tags = task.tags ? task.tags.join(', ') : '';
        report += `| #${task.id} | ${task.title} | ${task.priority} | ${task.estimatedHours || '?'} | ${tags} |\n`;
      });
    report += `\n`;
  }
  
  // Recently completed
  const completedTasks = tasks
    .filter(t => t.status === 'done')
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);
    
  if (completedTasks.length > 0) {
    report += `## ✨ Recently Completed\n\n`;
    completedTasks.forEach(task => {
      const date = new Date(task.completedAt).toLocaleDateString();
      report += `- ✅ [#${task.id}] ${task.title} (${date})\n`;
    });
    report += `\n`;
  }
  
  // Time tracking
  if (data.metrics) {
    report += `## ⏱️ Time Tracking\n\n`;
    report += `- **Total Estimated:** ${data.metrics.totalEstimatedHours || 0} hours\n`;
    report += `- **Total Actual:** ${data.metrics.totalActualHours || 0} hours\n`;
    report += `- **Remaining Estimate:** ${(data.metrics.totalEstimatedHours || 0) - (data.metrics.totalActualHours || 0)} hours\n\n`;
  }
  
  return report;
}

// Generate console report
function generateConsoleReport(data) {
  const tasks = data.tasks || [];
  const features = data.features || [];
  
  console.log(`\n${colors.bright}${colors.cyan}📊 PROJECT TASK REPORT${colors.reset}`);
  console.log('='.repeat(60));
  
  // Quick stats
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    blocked: tasks.filter(t => t.blockedReason).length
  };
  
  const completionRate = stats.total > 0 ? ((stats.done / stats.total) * 100).toFixed(1) : 0;
  
  console.log(`\n${colors.bright}Summary:${colors.reset}`);
  console.log(`  Total Tasks: ${stats.total}`);
  console.log(`  Completed: ${colors.green}${stats.done}${colors.reset} (${completionRate}%)`);
  console.log(`  In Progress: ${colors.yellow}${stats.inProgress}${colors.reset}`);
  console.log(`  TODO: ${colors.blue}${stats.todo}${colors.reset}`);
  console.log(`  Blocked: ${colors.red}${stats.blocked}${colors.reset}`);
  
  // Current work
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  if (inProgressTasks.length > 0) {
    console.log(`\n${colors.bright}${colors.yellow}🔄 Currently In Progress:${colors.reset}`);
    inProgressTasks.forEach(task => {
      console.log(`  [#${task.id}] ${task.title}`);
      if (task.assignee) {
        console.log(`    ${colors.gray}Assignee: ${task.assignee}${colors.reset}`);
      }
    });
  }
  
  // Ready to start
  const readyTasks = tasks.filter(t => 
    t.status === 'todo' && 
    !t.blockedReason && 
    t.priority !== 'low'
  ).slice(0, 3);
  
  if (readyTasks.length > 0) {
    console.log(`\n${colors.bright}${colors.green}✅ Ready to Start:${colors.reset}`);
    readyTasks.forEach(task => {
      const priorityColor = task.priority === 'critical' ? colors.red :
                           task.priority === 'high' ? colors.yellow :
                           colors.reset;
      console.log(`  [#${task.id}] ${task.title} ${priorityColor}(${task.priority})${colors.reset}`);
    });
  }
  
  // Blocked
  const blockedTasks = tasks.filter(t => t.blockedReason);
  if (blockedTasks.length > 0) {
    console.log(`\n${colors.bright}${colors.red}🚧 Blocked Tasks:${colors.reset}`);
    blockedTasks.forEach(task => {
      console.log(`  [#${task.id}] ${task.title}`);
      console.log(`    ${colors.gray}Reason: ${task.blockedReason}${colors.reset}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.gray}Run with --export markdown to generate detailed report${colors.reset}\n`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const data = loadTasks();
  
  if (args.includes('--export') && args.includes('markdown')) {
    const report = generateMarkdownReport(data);
    const outputPath = path.join(process.cwd(), 'TASK_REPORT.md');
    fs.writeFileSync(outputPath, report);
    console.log(`${colors.green}✓${colors.reset} Report generated: ${outputPath}`);
  } else if (args.includes('--json')) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    generateConsoleReport(data);
  }
}

// String repeat polyfill
if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    return new Array(count + 1).join(this);
  };
}

main();
