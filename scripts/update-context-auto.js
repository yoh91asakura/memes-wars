#!/usr/bin/env node
/**
 * Intelligent Context Updater for Memes Wars Spec-Kit
 * 
 * This script automatically detects the active specification and updates
 * context files (CLAUDE.md, STATUS.md) to keep AI agents in sync.
 * 
 * Features:
 * - Auto-detects active spec from Git branch
 * - Analyzes task completion status
 * - Updates context files with current state
 * - Maintains consistency across all documentation
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ContextUpdater {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.timestamp = new Date().toISOString().split('T')[0] + ' ' + 
                     new Date().toLocaleTimeString('fr-FR', { hour12: false });
  }

  /**
   * Execute shell command and return output
   */
  exec(command) {
    try {
      return execSync(command, { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      }).trim();
    } catch (error) {
      console.warn(`Command failed: ${command}`, error.message);
      return null;
    }
  }

  /**
   * Detect active specification from Git branch
   */
  async detectActiveSpec() {
    const currentBranch = this.exec('git branch --show-current');
    
    if (!currentBranch) {
      console.log('No Git branch detected, using main');
      return null;
    }

    console.log(`Current branch: ${currentBranch}`);

    // Extract spec number from branch name (e.g., "005-complete-card-management" → "005")
    const specMatch = currentBranch.match(/^(\d{3})-(.+)$/);
    if (!specMatch) {
      console.log('Branch does not match spec naming pattern');
      return null;
    }

    const [, specNumber, specName] = specMatch;
    const specDir = path.join(this.projectRoot, 'specs', currentBranch);

    try {
      await fs.access(specDir);
      return {
        number: specNumber,
        name: specName,
        fullName: currentBranch,
        directory: specDir,
        branch: currentBranch
      };
    } catch (error) {
      console.warn(`Spec directory not found: ${specDir}`);
      return null;
    }
  }

  /**
   * Analyze task completion status from tasks.md
   */
  async analyzeTaskStatus(spec) {
    if (!spec) return null;

    const tasksPath = path.join(spec.directory, 'tasks.md');
    
    try {
      const tasksContent = await fs.readFile(tasksPath, 'utf8');
      
      // Parse tasks with completion status
      const taskLines = tasksContent.split('\n').filter(line => 
        line.includes('**T') && (line.includes('[ ]') || line.includes('[x]') || line.includes('✅'))
      );

      const tasks = [];
      let currentTask = null;
      let completedCount = 0;

      for (const line of taskLines) {
        // More flexible regex to match different task formats
        const taskMatch = line.match(/\*\*T(\d+)\*\*.*?\[([ x✓])\](.+)$/) || 
                          line.match(/- \[([ x✓])\] \*\*T(\d+)\*\*(.+)$/);
        
        if (taskMatch) {
          let taskNum, status, description;
          
          if (taskMatch.length === 4 && taskMatch[2]) {
            // Format: **T###** [...] description
            [, taskNum, status, description] = taskMatch;
          } else if (taskMatch.length === 4 && taskMatch[1]) {
            // Format: - [...] **T###** description  
            [, status, taskNum, description] = taskMatch;
          }
          
          const isCompleted = status === 'x' || status === '✓' || line.includes('✅');
          
          const task = {
            number: `T${taskNum}`,
            description: description.trim(),
            completed: isCompleted,
            line: line.trim()
          };

          tasks.push(task);
          
          if (isCompleted) {
            completedCount++;
          } else if (!currentTask) {
            currentTask = task; // First non-completed task
          }
        }
      }

      return {
        tasks,
        totalTasks: tasks.length,
        completedTasks: completedCount,
        currentTask,
        completionPercentage: tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
      };

    } catch (error) {
      console.warn(`Could not read tasks file: ${tasksPath}`, error.message);
      return null;
    }
  }

  /**
   * Read current TodoWrite status from conversation context
   */
  async detectTodoWriteStatus() {
    // Since we can't directly access TodoWrite state, we'll infer from recent activity
    // This is a placeholder for future integration
    return {
      lastTask: "T043",
      inProgress: ["T046"],
      pending: ["T044", "T045"]
    };
  }

  /**
   * Generate context section for CLAUDE.md
   */
  generateClaudeContext(spec, taskStatus, todoStatus) {
    if (!spec || !taskStatus) {
      return `<!-- AUTO-GENERATED CONTEXT - ${this.timestamp} -->
## 🎯 Current Context (Auto-Detected)
**Status**: No active spec detected - working on main branch
**Last Update**: ${this.timestamp}
<!-- END AUTO-GENERATED CONTEXT -->`;
    }

    const currentTaskInfo = taskStatus.currentTask 
      ? `${taskStatus.currentTask.number} - ${taskStatus.currentTask.description.substring(0, 50)}...`
      : 'All tasks completed ✅';

    return `<!-- AUTO-GENERATED CONTEXT - ${this.timestamp} -->
## 🎯 Current Context (Auto-Detected)
**Active Spec**: ${spec.fullName}
**Current Task**: ${currentTaskInfo}
**Progress**: ${taskStatus.completedTasks}/${taskStatus.totalTasks} tasks (${taskStatus.completionPercentage}%)
**Branch**: ${spec.branch}
**Last Update**: ${this.timestamp}

### 📋 Quick Status
- **Completed**: ${taskStatus.completedTasks} tasks ✅
- **Remaining**: ${taskStatus.totalTasks - taskStatus.completedTasks} tasks
- **Directory**: \`specs/${spec.fullName}/\`
- **Tasks File**: \`specs/${spec.fullName}/tasks.md\`
<!-- END AUTO-GENERATED CONTEXT -->`;
  }

  /**
   * Update CLAUDE.md with current context
   */
  async updateClaudeContext(spec, taskStatus, todoStatus) {
    const claudePath = path.join(this.projectRoot, 'CLAUDE.md');
    
    try {
      let claudeContent = await fs.readFile(claudePath, 'utf8');
      
      // Remove existing auto-generated section
      const autoSectionRegex = /<!-- AUTO-GENERATED CONTEXT.*?<!-- END AUTO-GENERATED CONTEXT -->/s;
      claudeContent = claudeContent.replace(autoSectionRegex, '').trim();
      
      // Generate new context
      const newContext = this.generateClaudeContext(spec, taskStatus, todoStatus);
      
      // Insert at the beginning after the title
      const lines = claudeContent.split('\n');
      const titleIndex = lines.findIndex(line => line.startsWith('# 🎮 CLAUDE.md'));
      
      if (titleIndex !== -1) {
        lines.splice(titleIndex + 1, 0, '', newContext, '');
        claudeContent = lines.join('\n');
      } else {
        // Fallback: prepend to file
        claudeContent = newContext + '\n\n' + claudeContent;
      }

      // Update spec references in the navigation section
      if (spec) {
        // Update the active specs line
        claudeContent = claudeContent.replace(
          /- Active Specs: specs\/[^/]+\//g,
          `- Active Specs: specs/${spec.fullName}/`
        );
        
        // Update the current phase reference
        claudeContent = claudeContent.replace(
          /→ specs\/[^/]+\/ - .+/g,
          `→ specs/${spec.fullName}/ - ${spec.name} (EN COURS)`
        );
      }

      await fs.writeFile(claudePath, claudeContent, 'utf8');
      console.log('✅ Updated CLAUDE.md with current context');
      
    } catch (error) {
      console.error('Failed to update CLAUDE.md:', error.message);
    }
  }

  /**
   * Update STATUS.md with current phase information
   */
  async updateStatusFile(spec, taskStatus) {
    const statusPath = path.join(this.projectRoot, 'STATUS.md');
    
    try {
      let statusContent = await fs.readFile(statusPath, 'utf8');
      
      if (spec && taskStatus) {
        // Update current phase
        statusContent = statusContent.replace(
          /### 🎯 Current Phase.*\*\*/g,
          `### 🎯 Current Phase  
**Phase: ${spec.name}** - Progress: ${taskStatus.completedTasks}/${taskStatus.totalTasks} tasks (${taskStatus.completionPercentage}%)**`
        );
        
        // Update documentation section
        statusContent = statusContent.replace(
          /- \*\*Current specs\*\*: `.*` \(.+\)/,
          `- **Current specs**: \`/specs/${spec.fullName}/\` (${spec.name})`
        );
      }

      // Update last updated timestamp
      statusContent = statusContent.replace(
        /\*\*Last Updated\*\*: [^|]+/,
        `**Last Updated**: ${this.timestamp.split(' ')[0]}`
      );

      await fs.writeFile(statusPath, statusContent, 'utf8');
      console.log('✅ Updated STATUS.md with current phase');
      
    } catch (error) {
      console.error('Failed to update STATUS.md:', error.message);
    }
  }

  /**
   * Main execution function
   */
  async run(options = {}) {
    console.log('🔍 Detecting active specification...');
    
    try {
      const spec = await this.detectActiveSpec();
      const taskStatus = await this.analyzeTaskStatus(spec);
      const todoStatus = await this.detectTodoWriteStatus();

      console.log('\n📊 Context Analysis:');
      if (spec) {
        console.log(`  Active Spec: ${spec.fullName}`);
        console.log(`  Directory: specs/${spec.fullName}/`);
      } else {
        console.log('  No active spec detected (working on main)');
      }

      if (taskStatus) {
        console.log(`  Tasks: ${taskStatus.completedTasks}/${taskStatus.totalTasks} completed (${taskStatus.completionPercentage}%)`);
        if (taskStatus.currentTask) {
          console.log(`  Current: ${taskStatus.currentTask.number} - ${taskStatus.currentTask.description.substring(0, 60)}...`);
        }
      }

      console.log('\n🔄 Updating context files...');
      
      if (!options.dryRun) {
        await this.updateClaudeContext(spec, taskStatus, todoStatus);
        await this.updateStatusFile(spec, taskStatus);
        
        console.log('\n✅ Context update completed successfully!');
        console.log('🤖 AI agents will now have accurate context information.');
      } else {
        console.log('\n🔍 Dry run completed - no files were modified');
      }
      
      return { spec, taskStatus, todoStatus };
      
    } catch (error) {
      console.error('❌ Context update failed:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// CLI handling
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    watch: args.includes('--watch')
  };

  const updater = new ContextUpdater();

  if (options.watch) {
    console.log('👀 Watching for changes... (Press Ctrl+C to stop)');
    updater.run(options);
    
    // Watch for file changes every 30 seconds
    setInterval(() => {
      console.log('\n🔄 Checking for updates...');
      updater.run({ ...options, dryRun: false });
    }, 30000);
  } else {
    updater.run(options);
  }
}

export default ContextUpdater;