/**
 * Advanced Task Management System
 * Autonomous task creation and management with GitHub integration
 * Maintains roadmap.md and GitHub issues in sync
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

// ============================================
// TYPES & INTERFACES
// ============================================

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  TESTING = 'testing',
  DONE = 'done',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  NICE_TO_HAVE = 'nice_to_have'
}

export enum TaskSize {
  XS = 'XS',    // < 2 hours
  S = 'S',      // 2-4 hours
  M = 'M',      // 4-8 hours (1 day)
  L = 'L',      // 2-3 days
  XL = 'XL',    // 3-5 days
  XXL = 'XXL'   // > 5 days (needs breakdown)
}

export interface AcceptanceCriteria {
  id: string;
  description: string;
  completed: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface TaskDependency {
  taskId: string;
  type: 'blocks' | 'requires' | 'related';
  description?: string;
}

export interface TaskContext {
  // Technical context
  files: string[];              // Files to modify
  components: string[];          // Components involved
  services: string[];           // Services impacted
  apis: string[];              // APIs to use/modify
  
  // Business context
  userImpact: string;          // How it affects users
  businessValue: string;       // Why it matters
  risks: string[];             // Potential risks
  
  // Development hints
  suggestedApproach?: string;  // How to implement
  codeExamples?: string[];     // Reference code
  documentation?: string[];    // Relevant docs
  
  // Testing requirements
  testScenarios: string[];     // What to test
  performanceRequirements?: string;
}

export interface UserStory {
  persona: string;             // "As a [persona]"
  want: string;                // "I want [feature]"
  reason: string;              // "So that [benefit]"
  examples?: string[];         // Usage examples
}

export interface Task {
  // Identification
  id: string;
  githubIssueNumber?: number;
  
  // Core info
  title: string;
  description: string;
  userStory?: UserStory;
  
  // Status & Priority
  status: TaskStatus;
  priority: TaskPriority;
  size: TaskSize;
  
  // Dependencies
  dependencies: TaskDependency[];
  blockedBy?: string[];
  blocks?: string[];
  
  // Acceptance criteria
  acceptanceCriteria: AcceptanceCriteria[];
  definitionOfDone: string[];
  
  // Context for AI agents
  context: TaskContext;
  
  // Assignment
  assignee?: string;
  assignedTo?: 'human' | 'ai-agent' | 'both';
  aiAgentId?: string;
  
  // Tracking
  tags: string[];
  labels: string[];
  epic?: string;
  sprint?: string;
  milestone?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  
  // Metrics
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  
  // Automation
  autoCreated: boolean;
  autoAssignable: boolean;
  triggerConditions?: string[];
  
  // Comments & Activity
  comments: TaskComment[];
  activity: TaskActivity[];
}

export interface TaskComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  edited?: boolean;
}

export interface TaskActivity {
  id: string;
  type: 'status_change' | 'assignment' | 'comment' | 'edit' | 'dependency_change';
  actor: string;
  details: string;
  timestamp: string;
  metadata?: any;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goals: string[];
  tasks: string[];
  status: 'planning' | 'active' | 'review' | 'completed';
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  targetDate?: string;
  progress: number;
}

// ============================================
// TASK ANALYZER & AUTO-CREATOR
// ============================================

export class TaskAnalyzer {
  private codebaseAnalysis: Map<string, any> = new Map();
  
  /**
   * Analyze codebase and automatically create tasks
   */
  async analyzeAndCreateTasks(rootDir: string): Promise<Task[]> {
    const tasks: Task[] = [];
    
    // Analyze code quality
    tasks.push(...await this.analyzeCodeQuality(rootDir));
    
    // Analyze dependencies
    tasks.push(...await this.analyzeDependencies(rootDir));
    
    // Analyze test coverage
    tasks.push(...await this.analyzeTestCoverage(rootDir));
    
    // Analyze performance
    tasks.push(...await this.analyzePerformance(rootDir));
    
    // Analyze security
    tasks.push(...await this.analyzeSecurity(rootDir));
    
    // Analyze documentation
    tasks.push(...await this.analyzeDocumentation(rootDir));
    
    return tasks;
  }
  
  private async analyzeCodeQuality(rootDir: string): Promise<Task[]> {
    const tasks: Task[] = [];
    
    // Check for code duplication
    const duplicates = this.findDuplicateCode(rootDir);
    if (duplicates.length > 0) {
      tasks.push(this.createRefactoringTask(duplicates));
    }
    
    // Check for complex functions
    const complexFunctions = this.findComplexFunctions(rootDir);
    if (complexFunctions.length > 0) {
      tasks.push(this.createSimplificationTask(complexFunctions));
    }
    
    // Check for unused code
    const unusedCode = this.findUnusedCode(rootDir);
    if (unusedCode.length > 0) {
      tasks.push(this.createCleanupTask(unusedCode));
    }
    
    return tasks;
  }
  
  private async analyzeDependencies(rootDir: string): Promise<Task[]> {
    const tasks: Task[] = [];
    
    try {
      // Check for outdated dependencies
      const outdated = execSync('npm outdated --json', { cwd: rootDir }).toString();
      if (outdated) {
        const deps = JSON.parse(outdated);
        tasks.push(this.createDependencyUpdateTask(deps));
      }
    } catch (e) {
      // No outdated deps or error
    }
    
    // Check for security vulnerabilities
    try {
      const audit = execSync('npm audit --json', { cwd: rootDir }).toString();
      const auditData = JSON.parse(audit);
      if (auditData.metadata.vulnerabilities.total > 0) {
        tasks.push(this.createSecurityTask(auditData));
      }
    } catch (e) {
      // No vulnerabilities or error
    }
    
    return tasks;
  }
  
  private async analyzeTestCoverage(rootDir: string): Promise<Task[]> {
    const tasks: Task[] = [];
    
    // Find untested files
    const untestedFiles = this.findUntestedFiles(rootDir);
    if (untestedFiles.length > 0) {
      tasks.push(this.createTestTask(untestedFiles));
    }
    
    return tasks;
  }
  
  private async analyzePerformance(rootDir: string): Promise<Task[]> {
    const tasks: Task[] = [];
    
    // Check bundle size
    const largeFiles = this.findLargeFiles(rootDir);
    if (largeFiles.length > 0) {
      tasks.push(this.createOptimizationTask(largeFiles));
    }
    
    return tasks;
  }
  
  private async analyzeSecurity(rootDir: string): Promise<Task[]> {
    const tasks: Task[] = [];
    
    // Check for hardcoded secrets
    const secrets = this.findHardcodedSecrets(rootDir);
    if (secrets.length > 0) {
      tasks.push(this.createSecurityFixTask(secrets));
    }
    
    return tasks;
  }
  
  private async analyzeDocumentation(rootDir: string): Promise<Task[]> {
    const tasks: Task[] = [];
    
    // Check for undocumented functions
    const undocumented = this.findUndocumentedFunctions(rootDir);
    if (undocumented.length > 0) {
      tasks.push(this.createDocumentationTask(undocumented));
    }
    
    return tasks;
  }
  
  // Helper methods for analysis
  private findDuplicateCode(rootDir: string): any[] {
    // Implementation for finding duplicate code
    return [];
  }
  
  private findComplexFunctions(rootDir: string): any[] {
    // Implementation for finding complex functions
    return [];
  }
  
  private findUnusedCode(rootDir: string): any[] {
    // Implementation for finding unused code
    return [];
  }
  
  private findUntestedFiles(rootDir: string): string[] {
    // Implementation for finding untested files
    return [];
  }
  
  private findLargeFiles(rootDir: string): string[] {
    // Implementation for finding large files
    return [];
  }
  
  private findHardcodedSecrets(rootDir: string): any[] {
    // Implementation for finding hardcoded secrets
    return [];
  }
  
  private findUndocumentedFunctions(rootDir: string): any[] {
    // Implementation for finding undocumented functions
    return [];
  }
  
  // Task creation helpers
  private createRefactoringTask(duplicates: any[]): Task {
    return this.createTask({
      title: 'Refactor duplicate code blocks',
      priority: TaskPriority.MEDIUM,
      size: TaskSize.M,
      autoAssignable: true
    });
  }
  
  private createSimplificationTask(complexFunctions: any[]): Task {
    return this.createTask({
      title: 'Simplify complex functions',
      priority: TaskPriority.LOW,
      size: TaskSize.S,
      autoAssignable: true
    });
  }
  
  private createCleanupTask(unusedCode: any[]): Task {
    return this.createTask({
      title: 'Remove unused code',
      priority: TaskPriority.LOW,
      size: TaskSize.XS,
      autoAssignable: true
    });
  }
  
  private createDependencyUpdateTask(deps: any): Task {
    return this.createTask({
      title: 'Update outdated dependencies',
      priority: TaskPriority.MEDIUM,
      size: TaskSize.S,
      autoAssignable: true
    });
  }
  
  private createSecurityTask(auditData: any): Task {
    return this.createTask({
      title: 'Fix security vulnerabilities',
      priority: TaskPriority.CRITICAL,
      size: TaskSize.M,
      autoAssignable: false
    });
  }
  
  private createTestTask(untestedFiles: string[]): Task {
    return this.createTask({
      title: `Add tests for ${untestedFiles.length} untested files`,
      priority: TaskPriority.HIGH,
      size: TaskSize.L,
      autoAssignable: true
    });
  }
  
  private createOptimizationTask(largeFiles: string[]): Task {
    return this.createTask({
      title: 'Optimize large files and bundle size',
      priority: TaskPriority.MEDIUM,
      size: TaskSize.M,
      autoAssignable: true
    });
  }
  
  private createSecurityFixTask(secrets: any[]): Task {
    return this.createTask({
      title: 'Remove hardcoded secrets',
      priority: TaskPriority.CRITICAL,
      size: TaskSize.S,
      autoAssignable: false
    });
  }
  
  private createDocumentationTask(undocumented: any[]): Task {
    return this.createTask({
      title: 'Add missing documentation',
      priority: TaskPriority.LOW,
      size: TaskSize.M,
      autoAssignable: true
    });
  }
  
  private createTask(partial: Partial<Task>): Task {
    const id = crypto.randomBytes(8).toString('hex');
    
    return {
      id,
      title: partial.title || 'New Task',
      description: partial.description || '',
      status: TaskStatus.BACKLOG,
      priority: partial.priority || TaskPriority.MEDIUM,
      size: partial.size || TaskSize.M,
      dependencies: [],
      acceptanceCriteria: [],
      definitionOfDone: [],
      context: {
        files: [],
        components: [],
        services: [],
        apis: [],
        userImpact: '',
        businessValue: '',
        risks: [],
        testScenarios: []
      },
      tags: [],
      labels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoCreated: true,
      autoAssignable: partial.autoAssignable || false,
      comments: [],
      activity: [],
      ...partial
    } as Task;
  }
}

// ============================================
// ADVANCED TASK MANAGER
// ============================================

export class AdvancedTaskManager {
  private tasksDir: string;
  private tasksFile: string;
  private roadmapFile: string;
  private tasks: Map<string, Task> = new Map();
  private sprints: Map<string, Sprint> = new Map();
  private epics: Map<string, Epic> = new Map();
  private analyzer: TaskAnalyzer;
  
  constructor(projectRoot: string) {
    this.tasksDir = path.join(projectRoot, 'tasks');
    this.tasksFile = path.join(this.tasksDir, 'tasks.json');
    this.roadmapFile = path.join(projectRoot, 'roadmap.md');
    this.analyzer = new TaskAnalyzer();
    
    this.ensureTasksDirectory();
    this.loadTasks();
  }
  
  private ensureTasksDirectory(): void {
    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
    }
  }
  
  private loadTasks(): void {
    if (fs.existsSync(this.tasksFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.tasksFile, 'utf8'));
        data.tasks?.forEach((task: Task) => {
          this.tasks.set(task.id, task);
        });
        data.sprints?.forEach((sprint: Sprint) => {
          this.sprints.set(sprint.id, sprint);
        });
        data.epics?.forEach((epic: Epic) => {
          this.epics.set(epic.id, epic);
        });
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }
  
  private saveTasks(): void {
    const data = {
      tasks: Array.from(this.tasks.values()),
      sprints: Array.from(this.sprints.values()),
      epics: Array.from(this.epics.values()),
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '2.0.0'
      }
    };
    
    fs.writeFileSync(this.tasksFile, JSON.stringify(data, null, 2));
    
    // Also save individual task files for better tracking
    this.tasks.forEach(task => {
      const taskFile = path.join(this.tasksDir, `task-${task.id}.json`);
      fs.writeFileSync(taskFile, JSON.stringify(task, null, 2));
    });
  }
  
  /**
   * Create a new task with full context
   */
  createTask(input: {
    title: string;
    userStory?: UserStory;
    acceptanceCriteria: string[];
    context: Partial<TaskContext>;
    priority?: TaskPriority;
    size?: TaskSize;
    dependencies?: string[];
    tags?: string[];
  }): Task {
    const id = crypto.randomBytes(8).toString('hex');
    
    const task: Task = {
      id,
      title: input.title,
      description: '',
      userStory: input.userStory,
      status: TaskStatus.BACKLOG,
      priority: input.priority || TaskPriority.MEDIUM,
      size: input.size || TaskSize.M,
      dependencies: input.dependencies?.map(d => ({
        taskId: d,
        type: 'requires'
      })) || [],
      acceptanceCriteria: input.acceptanceCriteria.map((ac, index) => ({
        id: `${id}-ac-${index}`,
        description: ac,
        completed: false
      })),
      definitionOfDone: [
        'Code implemented and tested',
        'Tests written and passing',
        'Documentation updated',
        'Code reviewed',
        'No console errors',
        'Performance acceptable'
      ],
      context: {
        files: [],
        components: [],
        services: [],
        apis: [],
        userImpact: '',
        businessValue: '',
        risks: [],
        testScenarios: [],
        ...input.context
      },
      tags: input.tags || [],
      labels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoCreated: false,
      autoAssignable: true,
      comments: [],
      activity: [{
        id: `${id}-activity-1`,
        type: 'status_change',
        actor: 'system',
        details: 'Task created',
        timestamp: new Date().toISOString()
      }]
    };
    
    this.tasks.set(id, task);
    this.saveTasks();
    this.updateRoadmap();
    
    // Create GitHub issue if configured
    this.createGitHubIssue(task);
    
    return task;
  }
  
  /**
   * Update task status with workflow rules
   */
  updateTaskStatus(taskId: string, newStatus: TaskStatus): Task {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    // Validate status transition
    if (!this.isValidStatusTransition(task.status, newStatus)) {
      throw new Error(`Invalid status transition from ${task.status} to ${newStatus}`);
    }
    
    // Check dependencies
    if (newStatus === TaskStatus.IN_PROGRESS) {
      const blockers = this.getBlockingTasks(taskId);
      if (blockers.length > 0) {
        throw new Error(`Task blocked by: ${blockers.map(t => t.title).join(', ')}`);
      }
    }
    
    const oldStatus = task.status;
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    
    // Update timestamps
    if (newStatus === TaskStatus.IN_PROGRESS && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
    if (newStatus === TaskStatus.DONE && !task.completedAt) {
      task.completedAt = new Date().toISOString();
    }
    
    // Add activity
    task.activity.push({
      id: `${taskId}-activity-${task.activity.length + 1}`,
      type: 'status_change',
      actor: 'system',
      details: `Status changed from ${oldStatus} to ${newStatus}`,
      timestamp: new Date().toISOString(),
      metadata: { oldStatus, newStatus }
    });
    
    this.saveTasks();
    this.updateRoadmap();
    this.updateGitHubIssue(task);
    
    return task;
  }
  
  /**
   * Check if status transition is valid
   */
  private isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
    const transitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.BACKLOG]: [TaskStatus.TODO, TaskStatus.CANCELLED],
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.CANCELLED],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.IN_REVIEW, TaskStatus.BLOCKED, TaskStatus.TODO],
      [TaskStatus.IN_REVIEW]: [TaskStatus.TESTING, TaskStatus.IN_PROGRESS],
      [TaskStatus.TESTING]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
      [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS], // Can reopen
      [TaskStatus.BLOCKED]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
      [TaskStatus.CANCELLED]: [TaskStatus.BACKLOG] // Can resurrect
    };
    
    return transitions[from]?.includes(to) || false;
  }
  
  /**
   * Get tasks blocking the given task
   */
  private getBlockingTasks(taskId: string): Task[] {
    const task = this.tasks.get(taskId);
    if (!task) return [];
    
    return task.dependencies
      .filter(dep => dep.type === 'blocks' || dep.type === 'requires')
      .map(dep => this.tasks.get(dep.taskId))
      .filter(t => t && t.status !== TaskStatus.DONE) as Task[];
  }
  
  /**
   * Auto-assign task to AI agent or human
   */
  async autoAssignTask(taskId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    // Determine best assignee based on task characteristics
    const assignment = this.determineAssignment(task);
    
    task.assignedTo = assignment.type;
    task.assignee = assignment.assignee;
    if (assignment.type === 'ai-agent' || assignment.type === 'both') {
      task.aiAgentId = assignment.agentId;
    }
    
    task.updatedAt = new Date().toISOString();
    
    // Add activity
    task.activity.push({
      id: `${taskId}-activity-${task.activity.length + 1}`,
      type: 'assignment',
      actor: 'system',
      details: `Task assigned to ${assignment.assignee}`,
      timestamp: new Date().toISOString(),
      metadata: assignment
    });
    
    this.saveTasks();
    
    return task;
  }
  
  /**
   * Determine best assignment for a task
   */
  private determineAssignment(task: Task): {
    type: 'human' | 'ai-agent' | 'both';
    assignee: string;
    agentId?: string;
  } {
    // Simple logic for now - can be made more sophisticated
    const isSimple = task.size === TaskSize.XS || task.size === TaskSize.S;
    const isRefactoring = task.tags.includes('refactoring');
    const isDocumentation = task.tags.includes('documentation');
    const isTesting = task.tags.includes('testing');
    const isCritical = task.priority === TaskPriority.CRITICAL;
    
    if (isCritical) {
      return { type: 'both', assignee: 'team-lead', agentId: 'senior-agent' };
    }
    
    if (isSimple && (isRefactoring || isDocumentation || isTesting)) {
      return { type: 'ai-agent', assignee: 'ai-agent', agentId: 'standard-agent' };
    }
    
    if (task.autoAssignable) {
      return { type: 'ai-agent', assignee: 'ai-agent', agentId: 'standard-agent' };
    }
    
    return { type: 'human', assignee: 'unassigned' };
  }
  
  /**
   * Update roadmap.md file
   */
  private updateRoadmap(): void {
    const roadmap = this.generateRoadmap();
    fs.writeFileSync(this.roadmapFile, roadmap);
  }
  
  /**
   * Generate roadmap markdown
   */
  private generateRoadmap(): string {
    let md = `# 🗺️ ROADMAP - The Meme Wars TCG\n\n`;
    md += `*Last Updated: ${new Date().toISOString()}*\n\n`;
    
    // Add statistics
    const stats = this.getStatistics();
    md += `## 📊 Current Status\n\n`;
    md += `- **Total Tasks:** ${stats.total}\n`;
    md += `- **In Progress:** ${stats.byStatus[TaskStatus.IN_PROGRESS] || 0}\n`;
    md += `- **Completed:** ${stats.byStatus[TaskStatus.DONE] || 0}\n`;
    md += `- **Blocked:** ${stats.byStatus[TaskStatus.BLOCKED] || 0}\n\n`;
    
    // Group tasks by epic
    md += `## 🎯 Epics\n\n`;
    this.epics.forEach(epic => {
      md += `### ${epic.title}\n`;
      md += `${epic.description}\n\n`;
      md += `**Progress:** ${epic.progress}%\n\n`;
      
      const epicTasks = Array.from(this.tasks.values())
        .filter(t => t.epic === epic.id);
      
      if (epicTasks.length > 0) {
        md += `#### Tasks\n\n`;
        epicTasks.forEach(task => {
          const status = task.status === TaskStatus.DONE ? 'x' : ' ';
          md += `- [${status}] **${task.title}** (${task.priority})\n`;
          if (task.userStory) {
            md += `  - As a ${task.userStory.persona}, I want ${task.userStory.want} so that ${task.userStory.reason}\n`;
          }
        });
        md += '\n';
      }
    });
    
    // Add current sprint
    const activeSprint = Array.from(this.sprints.values())
      .find(s => s.status === 'active');
    
    if (activeSprint) {
      md += `## 🏃 Current Sprint: ${activeSprint.name}\n\n`;
      md += `**Duration:** ${activeSprint.startDate} - ${activeSprint.endDate}\n\n`;
      md += `### Goals\n`;
      activeSprint.goals.forEach(goal => {
        md += `- ${goal}\n`;
      });
      md += '\n';
      
      md += `### Sprint Tasks\n\n`;
      activeSprint.tasks.forEach(taskId => {
        const task = this.tasks.get(taskId);
        if (task) {
          const status = task.status === TaskStatus.DONE ? 'x' : ' ';
          md += `- [${status}] ${task.title} (${task.size})\n`;
        }
      });
      md += '\n';
    }
    
    // Add backlog
    md += `## 📋 Backlog\n\n`;
    const backlogTasks = Array.from(this.tasks.values())
      .filter(t => t.status === TaskStatus.BACKLOG)
      .sort((a, b) => {
        const priorityOrder = {
          [TaskPriority.CRITICAL]: 0,
          [TaskPriority.HIGH]: 1,
          [TaskPriority.MEDIUM]: 2,
          [TaskPriority.LOW]: 3,
          [TaskPriority.NICE_TO_HAVE]: 4
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    
    backlogTasks.slice(0, 20).forEach(task => {
      md += `- **[${task.priority.toUpperCase()}]** ${task.title}\n`;
    });
    
    if (backlogTasks.length > 20) {
      md += `\n*...and ${backlogTasks.length - 20} more tasks*\n`;
    }
    
    return md;
  }
  
  /**
   * Create GitHub issue for task
   */
  private async createGitHubIssue(task: Task): Promise<void> {
    try {
      // Check if gh CLI is available
      execSync('gh --version', { stdio: 'ignore' });
      
      // Create issue body
      let body = task.description + '\n\n';
      
      if (task.userStory) {
        body += `## User Story\n`;
        body += `As a ${task.userStory.persona}, I want ${task.userStory.want} so that ${task.userStory.reason}\n\n`;
      }
      
      if (task.acceptanceCriteria.length > 0) {
        body += `## Acceptance Criteria\n`;
        task.acceptanceCriteria.forEach(ac => {
          body += `- [ ] ${ac.description}\n`;
        });
        body += '\n';
      }
      
      if (task.context.testScenarios.length > 0) {
        body += `## Test Scenarios\n`;
        task.context.testScenarios.forEach(scenario => {
          body += `- ${scenario}\n`;
        });
        body += '\n';
      }
      
      // Create labels
      const labels = [
        task.priority,
        task.size,
        ...task.tags
      ].join(',');
      
      // Create issue using gh CLI
      const result = execSync(
        `gh issue create --title "${task.title}" --body "${body.replace(/"/g, '\\"')}" --label "${labels}"`,
        { encoding: 'utf8' }
      );
      
      // Extract issue number from result
      const match = result.match(/#(\d+)/);
      if (match) {
        task.githubIssueNumber = parseInt(match[1]);
        this.saveTasks();
      }
    } catch (error) {
      console.log('GitHub CLI not available or error creating issue');
    }
  }
  
  /**
   * Update GitHub issue for task
   */
  private async updateGitHubIssue(task: Task): Promise<void> {
    if (!task.githubIssueNumber) return;
    
    try {
      // Update issue state based on task status
      if (task.status === TaskStatus.DONE) {
        execSync(`gh issue close ${task.githubIssueNumber}`, { stdio: 'ignore' });
      } else if (task.status === TaskStatus.CANCELLED) {
        execSync(`gh issue close ${task.githubIssueNumber} --reason "not planned"`, { stdio: 'ignore' });
      }
      
      // Add comment about status change
      const lastActivity = task.activity[task.activity.length - 1];
      if (lastActivity && lastActivity.type === 'status_change') {
        execSync(
          `gh issue comment ${task.githubIssueNumber} --body "Status updated: ${lastActivity.details}"`,
          { stdio: 'ignore' }
        );
      }
    } catch (error) {
      console.log('Error updating GitHub issue');
    }
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    bySize: Record<TaskSize, number>;
  } {
    const stats = {
      total: this.tasks.size,
      byStatus: {} as Record<TaskStatus, number>,
      byPriority: {} as Record<TaskPriority, number>,
      bySize: {} as Record<TaskSize, number>
    };
    
    // Initialize counters
    Object.values(TaskStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });
    Object.values(TaskPriority).forEach(priority => {
      stats.byPriority[priority] = 0;
    });
    Object.values(TaskSize).forEach(size => {
      stats.bySize[size] = 0;
    });
    
    // Count tasks
    this.tasks.forEach(task => {
      stats.byStatus[task.status]++;
      stats.byPriority[task.priority]++;
      stats.bySize[task.size]++;
    });
    
    return stats;
  }
  
  /**
   * Auto-analyze and create tasks
   */
  async autoAnalyzeAndCreateTasks(projectRoot: string): Promise<Task[]> {
    const autoTasks = await this.analyzer.analyzeAndCreateTasks(projectRoot);
    
    autoTasks.forEach(task => {
      this.tasks.set(task.id, task);
    });
    
    this.saveTasks();
    this.updateRoadmap();
    
    // Create GitHub issues for critical tasks
    const criticalTasks = autoTasks.filter(t => t.priority === TaskPriority.CRITICAL);
    for (const task of criticalTasks) {
      await this.createGitHubIssue(task);
    }
    
    return autoTasks;
  }
  
  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }
  
  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get tasks for AI agent
   */
  getTasksForAgent(agentId?: string): Task[] {
    return Array.from(this.tasks.values()).filter(task => {
      if (agentId && task.aiAgentId !== agentId) return false;
      return task.assignedTo === 'ai-agent' || task.assignedTo === 'both';
    });
  }
  
  /**
   * Mark acceptance criteria as complete
   */
  completeAcceptanceCriteria(taskId: string, criteriaId: string, verifiedBy: string): Task {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    const criteria = task.acceptanceCriteria.find(ac => ac.id === criteriaId);
    if (!criteria) {
      throw new Error(`Acceptance criteria ${criteriaId} not found`);
    }
    
    criteria.completed = true;
    criteria.verifiedBy = verifiedBy;
    criteria.verifiedAt = new Date().toISOString();
    
    task.updatedAt = new Date().toISOString();
    
    // Check if all criteria are complete
    const allComplete = task.acceptanceCriteria.every(ac => ac.completed);
    if (allComplete && task.status === TaskStatus.IN_REVIEW) {
      this.updateTaskStatus(taskId, TaskStatus.TESTING);
    }
    
    this.saveTasks();
    
    return task;
  }
}

// ============================================
// AUTONOMOUS TASK MONITOR
// ============================================

export class TaskMonitor {
  private manager: AdvancedTaskManager;
  private intervalId?: NodeJS.Timeout;
  
  constructor(manager: AdvancedTaskManager) {
    this.manager = manager;
  }
  
  /**
   * Start monitoring for auto task creation
   */
  startMonitoring(intervalMinutes: number = 60): void {
    this.intervalId = setInterval(() => {
      this.checkAndCreateTasks();
    }, intervalMinutes * 60 * 1000);
    
    // Run immediately
    this.checkAndCreateTasks();
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  /**
   * Check conditions and create tasks
   */
  private async checkAndCreateTasks(): Promise<void> {
    const projectRoot = process.cwd();
    
    // Auto-analyze codebase
    const newTasks = await this.manager.autoAnalyzeAndCreateTasks(projectRoot);
    
    if (newTasks.length > 0) {
      console.log(`Created ${newTasks.length} new tasks automatically`);
      
      // Auto-assign tasks
      for (const task of newTasks) {
        if (task.autoAssignable) {
          await this.manager.autoAssignTask(task.id);
        }
      }
    }
  }
}

// ============================================
// EXPORT & CLI
// ============================================

export default {
  AdvancedTaskManager,
  TaskAnalyzer,
  TaskMonitor,
  TaskStatus,
  TaskPriority,
  TaskSize
};

// CLI interface if run directly
if (require.main === module) {
  const manager = new AdvancedTaskManager(process.cwd());
  const monitor = new TaskMonitor(manager);
  
  // Start monitoring
  monitor.startMonitoring(30); // Check every 30 minutes
  
  console.log('Advanced Task System initialized');
  console.log('Monitoring for automatic task creation...');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    monitor.stopMonitoring();
    process.exit(0);
  });
}
