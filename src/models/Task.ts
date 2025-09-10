/**
 * Task Model
 * 
 * Individual implementation task within the development workflow.
 * Core unit of work in the spec-kit system.
 */

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Core Task interface
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
  assignee: string;          // Responsible party (e.g., "claude", "developer")
  
  // Implementation details
  filePaths: string[];       // Files involved in task
  testFiles: string[];       // Associated test files
  
  // Execution properties
  isParallel: boolean;       // Can run in parallel with others
  phase: string;             // Which implementation phase
  category: TaskCategory;    // Type of work
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
  tags: string[];            // Categorization tags
  
  // Context
  notes?: string;            // Additional implementation notes
  blockers?: string[];       // What's preventing progress
  successCriteria?: string[]; // How to know when complete
}

export type TaskCategory = 
  | 'setup'
  | 'contract-test'
  | 'data-model'
  | 'service-implementation'
  | 'integration-test'
  | 'e2e-test'
  | 'polish'
  | 'documentation'
  | 'configuration'
  | 'validation';

/**
 * Task creation and management
 */
export interface TaskCreateParams {
  title: string;
  description: string;
  priority?: TaskPriority;
  estimatedHours?: number;
  assignee?: string;
  filePaths?: string[];
  testFiles?: string[];
  isParallel?: boolean;
  phase: string;
  category: TaskCategory;
  tags?: string[];
  successCriteria?: string[];
}

export interface TaskUpdateParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  actualHours?: number;
  filePaths?: string[];
  testFiles?: string[];
  notes?: string;
  blockers?: string[];
}

/**
 * Task validation
 */
export interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationError[];
  warnings: TaskValidationError[];
}

export interface TaskValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Task utilities
 */
export const createTask = (params: TaskCreateParams): Task => {
  const now = new Date();
  
  return {
    id: generateTaskId(),
    status: 'pending',
    actualHours: 0,
    assignee: 'claude',
    filePaths: [],
    testFiles: [],
    isParallel: false,
    tags: [],
    createdDate: now,
    lastModified: now,
    estimatedHours: 2,
    ...params
  };
};

export const generateTaskId = (): string => {
  // Simple sequential ID generation (in real implementation would use counter)
  return `T${String(Date.now()).slice(-3)}`;
};

export const validateTask = (task: Task): TaskValidationResult => {
  const errors: TaskValidationError[] = [];
  const warnings: TaskValidationError[] = [];
  
  // Required fields
  if (!task.id) {
    errors.push({ field: 'id', message: 'Task ID is required', severity: 'error' });
  }
  
  if (!task.title) {
    errors.push({ field: 'title', message: 'Task title is required', severity: 'error' });
  }
  
  if (!task.description) {
    errors.push({ field: 'description', message: 'Task description is required', severity: 'error' });
  }
  
  if (!task.phase) {
    errors.push({ field: 'phase', message: 'Task phase is required', severity: 'error' });
  }
  
  // Validation rules
  if (task.estimatedHours <= 0) {
    warnings.push({ field: 'estimatedHours', message: 'Estimated hours should be positive', severity: 'warning' });
  }
  
  if (task.actualHours < 0) {
    errors.push({ field: 'actualHours', message: 'Actual hours cannot be negative', severity: 'error' });
  }
  
  if (task.status === 'completed' && !task.completionDate) {
    warnings.push({ field: 'completionDate', message: 'Completed tasks should have completion date', severity: 'warning' });
  }
  
  if (task.status === 'in-progress' && !task.startDate) {
    warnings.push({ field: 'startDate', message: 'In-progress tasks should have start date', severity: 'warning' });
  }
  
  // File path validation
  task.filePaths.forEach((path, index) => {
    if (!path.startsWith('/') && !path.startsWith('C:\\')) {
      warnings.push({ 
        field: `filePaths[${index}]`, 
        message: 'File paths should be absolute', 
        severity: 'warning' 
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateStatusTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    'pending': ['in-progress', 'blocked', 'cancelled'],
    'in-progress': ['completed', 'blocked', 'cancelled'],
    'blocked': ['in-progress', 'cancelled'],
    'completed': [], // Terminal state
    'cancelled': []  // Terminal state
  };
  
  return validTransitions[from]?.includes(to) ?? false;
};

export const updateTaskStatus = (task: Task, newStatus: TaskStatus): Task => {
  if (!validateStatusTransition(task.status, newStatus)) {
    throw new Error(`Invalid status transition from ${task.status} to ${newStatus}`);
  }
  
  const updatedTask = { ...task };
  updatedTask.status = newStatus;
  updatedTask.lastModified = new Date();
  
  // Set timestamps based on status
  if (newStatus === 'in-progress' && !task.startDate) {
    updatedTask.startDate = new Date();
  }
  
  if (newStatus === 'completed') {
    updatedTask.completionDate = new Date();
    // Clear blockers when completed
    updatedTask.blockers = [];
  }
  
  return updatedTask;
};

export const calculateTaskProgress = (task: Task): number => {
  if (task.status === 'completed') return 100;
  if (task.status === 'cancelled') return 0;
  if (task.status === 'pending') return 0;
  if (task.status === 'blocked') return 0;
  
  // For in-progress, calculate based on time spent vs estimated
  if (task.estimatedHours > 0) {
    const progress = Math.min((task.actualHours / task.estimatedHours) * 100, 90);
    return Math.round(progress);
  }
  
  return 50; // Default for in-progress without time tracking
};

export const getTasksByPhase = (tasks: Task[], phase: string): Task[] => {
  return tasks.filter(task => task.phase === phase);
};

export const getTasksByStatus = (tasks: Task[], status: TaskStatus): Task[] => {
  return tasks.filter(task => task.status === status);
};

export const getTasksByCategory = (tasks: Task[], category: TaskCategory): Task[] => {
  return tasks.filter(task => task.category === category);
};