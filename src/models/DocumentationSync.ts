/**
 * DocumentationSync Model
 * 
 * Tracks synchronization between documentation files.
 * Maintains consistency across CLAUDE.md, README.md, STATUS.md, and spec files.
 */

export type SyncStatus = 'in-sync' | 'out-of-sync' | 'conflict' | 'error';
export type SyncStrategy = 'full' | 'incremental' | 'selective' | 'manual';
export type ConflictStrategy = 'source-wins' | 'target-wins' | 'merge' | 'manual-intervention';

/**
 * Core DocumentationSync interface
 */
export interface DocumentationSync {
  // Source relationship
  sourceFile: string;        // Primary source document
  targetFiles: string[];     // Files that derive from source
  
  // Sync status
  lastSyncDate: Date;
  syncStatus: SyncStatus;
  conflictDetails: string[];
  
  // Dependencies
  dependencies: DocumentDependency[];
  updateTriggers: UpdateTrigger[];
  
  // Configuration
  syncRules: SyncRule[];
  automaticSync: boolean;
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
}

export interface DocumentDependency {
  file: string;              // Dependent file path
  relationship: DependencyRelationship;
  lastSync: Date;
  status: SyncStatus;
  sections?: SectionMapping[];
}

export type DependencyRelationship = 
  | 'derives-from'           // Content comes from source
  | 'references'             // Points to/mentions source
  | 'synced-with'           // Bidirectional sync
  | 'aggregates';           // Combines multiple sources

export interface SectionMapping {
  sourceSection: string;     // Section in source file
  targetSection: string;     // Corresponding section in target
  syncType: SyncType;
  lastSync: Date;
}

export type SyncType = 
  | 'full-copy'             // Complete section copy
  | 'summary'               // Condensed version
  | 'reference'             // Link/reference only
  | 'transform';            // Modified/processed content

export interface UpdateTrigger {
  type: TriggerType;
  pattern: string;           // File pattern or condition
  action: TriggerAction;
  enabled: boolean;
}

export type TriggerType = 
  | 'file-modified'
  | 'spec-updated'
  | 'task-completed'
  | 'phase-transition'
  | 'git-commit'
  | 'schedule';

export type TriggerAction = 
  | 'full-sync'
  | 'incremental-sync'
  | 'notify-only'
  | 'queue-sync';

/**
 * Synchronization operations
 */
export interface SyncOperation {
  id: string;
  sourceFile: string;
  targetFiles: string[];
  strategy: SyncStrategy;
  
  // Execution
  startTime: Date;
  endTime?: Date;
  status: SyncOperationStatus;
  
  // Results
  syncedFiles: string[];
  failedFiles: SyncFailure[];
  conflicts: SyncConflict[];
  
  // Metadata
  triggeredBy: string;       // What initiated sync
  automated: boolean;
}

export type SyncOperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SyncFailure {
  file: string;
  error: string;
  retryable: boolean;
  retryCount: number;
  lastRetry?: Date;
}

export interface SyncConflict {
  file: string;
  section: string;
  sourceContent: string;
  targetContent: string;
  conflictType: ConflictType;
  resolution?: ConflictResolution;
}

export type ConflictType = 
  | 'content-mismatch'
  | 'structure-change'
  | 'concurrent-modification'
  | 'format-incompatibility';

export interface ConflictResolution {
  strategy: ConflictStrategy;
  resolvedContent: string;
  reasoning: string;
  manual: boolean;
  timestamp: Date;
}

/**
 * Synchronization rules and configuration
 */
export interface SyncRule {
  id: string;
  name: string;
  description: string;
  
  // Conditions
  sourcePattern: string;     // Which files this rule applies to
  targetPattern: string;     // Where content goes
  
  // Behavior
  syncType: SyncType;
  frequency: SyncFrequency;
  conditions: SyncCondition[];
  
  // Processing
  transforms: ContentTransform[];
  filters: ContentFilter[];
  
  // Metadata
  enabled: boolean;
  priority: number;
  lastUsed?: Date;
}

export interface SyncFrequency {
  type: 'immediate' | 'scheduled' | 'manual' | 'triggered';
  schedule?: string;         // Cron expression for scheduled sync
  throttle?: number;         // Minimum time between syncs (ms)
}

export interface SyncCondition {
  field: string;             // What to check (e.g., 'file-size', 'last-modified')
  operator: 'equals' | 'greater-than' | 'less-than' | 'contains' | 'matches';
  value: any;
  negate?: boolean;
}

export interface ContentTransform {
  type: TransformType;
  config: Record<string, any>;
  order: number;
}

export type TransformType = 
  | 'markdown-to-plain'
  | 'summarize'
  | 'extract-sections'
  | 'add-metadata'
  | 'format-conversion'
  | 'token-optimization';

export interface ContentFilter {
  type: FilterType;
  pattern: string;
  include: boolean;          // true = include matching, false = exclude matching
}

export type FilterType = 
  | 'section-header'
  | 'line-pattern'
  | 'word-count'
  | 'file-extension';

/**
 * Sync results and reporting
 */
export interface SyncResult {
  sourceFile: string;
  targetFiles: string[];
  
  // Execution summary
  syncedSuccessfully: string[];
  syncErrors: SyncError[];
  conflictsFound: SyncConflict[];
  
  // Timing
  lastSyncDate: Date;
  duration: number;          // Milliseconds
  
  // Changes
  changesApplied: ContentChange[];
  backupCreated: boolean;
}

export interface SyncError {
  file: string;
  error: string;
  severity: 'warning' | 'error' | 'critical';
  recoverable: boolean;
  suggestedFix?: string;
}

export interface ContentChange {
  file: string;
  section: string;
  changeType: ChangeType;
  oldContent?: string;
  newContent?: string;
  lineNumbers?: { start: number; end: number };
}

export type ChangeType = 
  | 'added'
  | 'modified'
  | 'removed'
  | 'moved'
  | 'reformatted';

/**
 * Configuration management
 */
export interface SyncConfiguration {
  // Global settings
  automaticSync: boolean;
  conflictStrategy: ConflictStrategy;
  backupBeforeSync: boolean;
  maxConcurrentSyncs: number;
  
  // Rules and triggers
  syncRules: SyncRule[];
  triggers: UpdateTrigger[];
  
  // File patterns
  excludePatterns: string[];
  includePatterns: string[];
  
  // Performance
  batchSize: number;
  throttleDelay: number;     // ms between operations
  
  // Monitoring
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsEnabled: boolean;
}

/**
 * Utilities and validation
 */
export const createSyncRule = (
  name: string,
  sourcePattern: string,
  targetPattern: string,
  syncType: SyncType
): SyncRule => {
  return {
    id: generateSyncRuleId(),
    name,
    description: `Sync ${sourcePattern} to ${targetPattern}`,
    sourcePattern,
    targetPattern,
    syncType,
    frequency: { type: 'triggered' },
    conditions: [],
    transforms: [],
    filters: [],
    enabled: true,
    priority: 1
  };
};

const generateSyncRuleId = (): string => {
  return `sync-${Date.now().toString(36)}`;
};

export const validateSyncConfiguration = (config: SyncConfiguration): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for duplicate rule names
  const ruleNames = config.syncRules.map(rule => rule.name);
  const duplicateNames = ruleNames.filter((name, index) => ruleNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    errors.push(`Duplicate sync rule names: ${duplicateNames.join(', ')}`);
  }
  
  // Check for circular dependencies
  config.syncRules.forEach(rule => {
    if (rule.sourcePattern === rule.targetPattern) {
      errors.push(`Sync rule "${rule.name}" has same source and target pattern`);
    }
  });
  
  // Validate cron expressions
  config.syncRules.forEach(rule => {
    if (rule.frequency.type === 'scheduled' && rule.frequency.schedule) {
      // Simple validation - real implementation would use cron parser
      if (!/^[\d\s\*\/,-]+$/.test(rule.frequency.schedule)) {
        warnings.push(`Invalid cron expression in rule "${rule.name}"`);
      }
    }
  });
  
  // Performance checks
  if (config.maxConcurrentSyncs > 10) {
    warnings.push('High concurrent sync limit may impact performance');
  }
  
  if (config.batchSize > 100) {
    warnings.push('Large batch size may cause memory issues');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const detectSyncConflicts = (
  sourceContent: string,
  targetContent: string,
  section?: string
): SyncConflict[] => {
  const conflicts: SyncConflict[] = [];
  
  // Simple content comparison - real implementation would be more sophisticated
  if (sourceContent !== targetContent) {
    conflicts.push({
      file: 'target',
      section: section || 'content',
      sourceContent,
      targetContent,
      conflictType: 'content-mismatch'
    });
  }
  
  return conflicts;
};

export const applySyncTransforms = (
  content: string,
  transforms: ContentTransform[]
): string => {
  return transforms
    .sort((a, b) => a.order - b.order)
    .reduce((processedContent, transform) => {
      switch (transform.type) {
        case 'summarize':
          // Simple summarization - take first N characters
          const maxLength = transform.config.maxLength || 500;
          return processedContent.length > maxLength
            ? processedContent.substring(0, maxLength) + '...'
            : processedContent;
            
        case 'extract-sections':
          // Extract specific sections based on config
          const sectionPattern = transform.config.pattern || /^#{1,3}\s+(.+)/gm;
          const matches = processedContent.match(sectionPattern);
          return matches ? matches.join('\n') : processedContent;
          
        case 'token-optimization':
          // Basic token optimization
          return processedContent
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .replace(/\n{3,}/g, '\n\n') // Limit blank lines
            .trim();
            
        default:
          return processedContent;
      }
    }, content);
};

export const calculateSyncMetrics = (operations: SyncOperation[]): SyncMetrics => {
  const total = operations.length;
  const successful = operations.filter(op => op.status === 'completed').length;
  const failed = operations.filter(op => op.status === 'failed').length;
  
  const totalFiles = operations.reduce((sum, op) => sum + op.targetFiles.length, 0);
  const syncedFiles = operations.reduce((sum, op) => sum + op.syncedFiles.length, 0);
  
  const durations = operations
    .filter(op => op.endTime)
    .map(op => op.endTime!.getTime() - op.startTime.getTime());
  
  const averageDuration = durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;
  
  return {
    totalOperations: total,
    successfulOperations: successful,
    failedOperations: failed,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    totalFiles,
    syncedFiles,
    fileSuccessRate: totalFiles > 0 ? (syncedFiles / totalFiles) * 100 : 0,
    averageDuration,
    conflictsResolved: operations.reduce((sum, op) => sum + op.conflicts.length, 0)
  };
};

export interface SyncMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  successRate: number;
  totalFiles: number;
  syncedFiles: number;
  fileSuccessRate: number;
  averageDuration: number;
  conflictsResolved: number;
}