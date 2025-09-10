/**
 * TaskList Model
 * 
 * Represents executable tasks generated from implementation plan.
 * Manages task dependencies, parallel execution, and progress tracking.
 */

export interface TaskDependency {
  taskId: string;            // Dependent task
  dependsOn: string[];       // Required tasks
  type: 'blocks' | 'enhances' | 'relates-to';
  description?: string;      // Why dependency exists
}

export interface TaskCompletionStatus {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  pendingTasks: number;
  
  // Progress calculation
  completionPercentage: number;
  estimatedCompletion: Date;
  
  // Current focus
  activeTasks: string[];     // Currently in progress
  nextTasks: string[];       // Ready to start
  blockedTasks: BlockedTask[];
}

export interface BlockedTask {
  taskId: string;
  blockedBy: string[];       // Blocking task IDs
  reason: string;            // Why blocked
  estimatedUnblockDate?: Date;
}

export interface ParallelGroup {
  groupId: string;           // Group identifier
  tasks: string[];           // Task IDs in group
  description: string;       // Why these can be parallel
  estimatedDuration: number; // Max duration in group
}

/**
 * Core TaskList interface
 */
export interface TaskList {
  // Identity
  planId: string;            // References ImplementationPlan
  currentPhase: string;      // Active implementation phase
  
  // Task organization
  tasks: Task[];             // Ordered list of tasks
  dependencies: TaskDependency[];
  parallelGroups: ParallelGroup[];
  
  // Progress tracking
  completionStatus: TaskCompletionStatus;
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
  version: string;
}

/**
 * Individual Task interface (imported from separate model)
 */
export interface Task {
  // Identity
  id: string;                // e.g., "T001"
  title: string;             // Descriptive task name
  description: string;       // Detailed task description
  
  // Status and priority
  status: TaskStatus;
  priority: TaskPriority;
  
  // Time tracking
  estimatedHours: number;
  actualHours: number;
  startDate?: Date;
  completionDate?: Date;
  
  // Assignment and responsibility
  assignee: string;          // Responsible party
  
  // Implementation details
  filePaths: string[];       // Files involved in task
  testFiles: string[];       // Associated test files
  
  // Execution properties
  isParallel: boolean;       // Can run in parallel
  phase: string;             // Which phase this belongs to
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
  tags: string[];            // Categorization tags
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Task list operations and analysis
 */
export interface TaskAnalysisResult {
  criticalPath: Task[];      // Longest dependency chain
  parallelOpportunities: ParallelGroup[];
  bottlenecks: Task[];       // Tasks blocking others
  estimatedDuration: number; // Total project duration
  resourceAllocation: ResourceAllocation[];
}

export interface ResourceAllocation {
  assignee: string;
  tasks: string[];           // Task IDs assigned
  totalHours: number;        // Sum of estimates
  concurrentTasks: number;   // Max parallel tasks
  availability: number;      // 0-1 capacity utilization
}

/**
 * Task generation and templates
 */
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  estimatedHours: number;
  dependencies: string[];    // Template dependency patterns
  filePaths: string[];       // Template file patterns
  testFiles: string[];       // Template test patterns
  isParallel: boolean;
}

export type TaskCategory = 
  | 'setup' 
  | 'contract-test' 
  | 'data-model' 
  | 'service-implementation'
  | 'integration-test'
  | 'e2e-test'
  | 'polish'
  | 'documentation';

/**
 * Validation and utilities
 */
export const validateTaskDependencies = (taskList: TaskList): string[] => {
  const taskIds = taskList.tasks.map(t => t.id);
  const violations: string[] = [];
  
  taskList.dependencies.forEach(dep => {
    // Check if all referenced tasks exist
    if (!taskIds.includes(dep.taskId)) {
      violations.push(`Dependency references non-existent task: ${dep.taskId}`);
    }
    
    dep.dependsOn.forEach(depTaskId => {
      if (!taskIds.includes(depTaskId)) {
        violations.push(`Task ${dep.taskId} depends on non-existent task: ${depTaskId}`);
      }
    });
  });
  
  return violations;
};

export const findCircularDependencies = (taskList: TaskList): string[] => {
  const graph = new Map<string, string[]>();
  
  // Build dependency graph
  taskList.dependencies.forEach(dep => {
    graph.set(dep.taskId, dep.dependsOn);
  });
  
  // DFS cycle detection
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];
  
  const hasCycle = (taskId: string, path: string[]): boolean => {
    visited.add(taskId);
    recursionStack.add(taskId);
    
    const dependencies = graph.get(taskId) || [];
    
    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        if (hasCycle(depId, [...path, depId])) {
          return true;
        }
      } else if (recursionStack.has(depId)) {
        cycles.push(`Circular dependency: ${[...path, depId, taskId].join(' → ')}`);
        return true;
      }
    }
    
    recursionStack.delete(taskId);
    return false;
  };
  
  // Check all tasks for cycles
  taskList.tasks.forEach(task => {
    if (!visited.has(task.id)) {
      hasCycle(task.id, [task.id]);
    }
  });
  
  return cycles;
};

export const calculateCriticalPath = (taskList: TaskList): Task[] => {
  // Implementation of critical path method (CPM)
  const taskMap = new Map(taskList.tasks.map(t => [t.id, t]));
  const dependencyMap = new Map<string, string[]>();
  
  // Build reverse dependency map
  taskList.dependencies.forEach(dep => {
    dep.dependsOn.forEach(depId => {
      if (!dependencyMap.has(depId)) {
        dependencyMap.set(depId, []);
      }
      dependencyMap.get(depId)!.push(dep.taskId);
    });
  });
  
  // Calculate earliest start times
  const earliestStart = new Map<string, number>();
  const calculateEarliest = (taskId: string): number => {
    if (earliestStart.has(taskId)) {
      return earliestStart.get(taskId)!;
    }
    
    const task = taskMap.get(taskId);
    if (!task) return 0;
    
    const deps = taskList.dependencies.find(d => d.taskId === taskId);
    if (!deps || deps.dependsOn.length === 0) {
      earliestStart.set(taskId, 0);
      return 0;
    }
    
    const maxDependencyEnd = Math.max(
      ...deps.dependsOn.map(depId => {
        const depTask = taskMap.get(depId);
        return calculateEarliest(depId) + (depTask?.estimatedHours || 0);
      })
    );
    
    earliestStart.set(taskId, maxDependencyEnd);
    return maxDependencyEnd;
  };
  
  // Calculate for all tasks
  taskList.tasks.forEach(task => calculateEarliest(task.id));
  
  // Find critical path (tasks with zero slack)
  // This is simplified - full CPM would calculate latest start times too
  const criticalTasks = taskList.tasks.filter(task => {
    const successors = dependencyMap.get(task.id) || [];
    return successors.length === 0 || // End tasks
           task.priority === 'critical'; // High priority tasks
  });
  
  return criticalTasks;
};

export const updateTaskStatus = (
  taskList: TaskList,
  taskId: string,
  newStatus: TaskStatus
): TaskCompletionStatus => {
  const task = taskList.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }
  
  task.status = newStatus;
  task.lastModified = new Date();
  
  if (newStatus === 'in-progress' && !task.startDate) {
    task.startDate = new Date();
  }
  
  if (newStatus === 'completed' && !task.completionDate) {
    task.completionDate = new Date();
  }
  
  // Recalculate completion status
  const statusCounts = taskList.tasks.reduce((counts, t) => {
    counts[t.status]++;
    return counts;
  }, {
    'pending': 0,
    'in-progress': 0,
    'completed': 0,
    'blocked': 0,
    'cancelled': 0
  } as Record<TaskStatus, number>);
  
  const totalTasks = taskList.tasks.length;
  const completedTasks = statusCounts.completed;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);
  
  taskList.completionStatus = {
    totalTasks,
    completedTasks: statusCounts.completed,
    inProgressTasks: statusCounts['in-progress'],
    blockedTasks: statusCounts.blocked,
    pendingTasks: statusCounts.pending,
    completionPercentage,
    estimatedCompletion: new Date(), // Would calculate based on remaining work
    activeTasks: taskList.tasks.filter(t => t.status === 'in-progress').map(t => t.id),
    nextTasks: taskList.tasks.filter(t => t.status === 'pending').slice(0, 3).map(t => t.id),
    blockedTasks: taskList.tasks
      .filter(t => t.status === 'blocked')
      .map(t => ({
        taskId: t.id,
        blockedBy: [],
        reason: 'Dependencies not complete'
      }))
  };
  
  return taskList.completionStatus;
};