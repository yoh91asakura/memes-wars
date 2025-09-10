/**
 * AgentContext Model
 * 
 * Configuration and context for AI agent collaboration.
 * Manages multi-agent coordination and context synchronization.
 */

export type AgentType = 'claude' | 'copilot' | 'gemini' | 'custom';

/**
 * Core AgentContext interface
 */
export interface AgentContext {
  // Identity
  agentType: AgentType;
  contextFile: string;       // Agent-specific instruction file
  
  // Project understanding
  projectSummary: string;    // High-level project description
  currentPhase: string;      // Active development phase
  recentChanges: string[];   // Recent significant changes
  
  // Navigation and commands
  keyCommands: AgentCommand[];
  fileLocations: Record<string, string>; // Important file mappings
  
  // Optimization
  tokenCount: number;        // Current context size
  lastOptimized: Date;       // When context was last optimized
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
  version: string;
}

/**
 * Agent command definition
 */
export interface AgentCommand {
  name: string;              // Command name (e.g., "spec:create")
  description: string;       // What the command does
  usage: string;             // Usage example
  agentType: AgentType;      // Which agent can use this
  category: CommandCategory;
  parameters?: CommandParameter[];
  examples?: CommandExample[];
}

export type CommandCategory = 
  | 'spec-kit'
  | 'testing'
  | 'development'
  | 'validation'
  | 'documentation';

export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  required: boolean;
  description: string;
  enumValues?: string[];
  defaultValue?: any;
}

export interface CommandExample {
  command: string;
  description: string;
  expectedOutput?: string;
}

/**
 * Project navigation optimization
 */
export interface ProjectNavigationMap {
  // Quick access patterns
  quickAccess: QuickAccessMap;
  
  // Path simplification
  pathAliases: Record<string, string>;
  
  // Code organization
  sectionMarkers: SectionMarker[];
  
  // Critical paths
  criticalFiles: CriticalFile[];
}

export interface QuickAccessMap {
  currentSpec: string;       // Active specification file
  activeTasks: string;       // Current task list
  keyServices: string[];     // Important service files
  testFiles: string[];       // Relevant test files
  configFiles: string[];     // Configuration files
}

export interface SectionMarker {
  file: string;              // File path
  section: string;           // Section name
  lineNumber: number;        // Approximate line
  purpose: string;           // What this section does
}

export interface CriticalFile {
  path: string;              // File location
  importance: 'critical' | 'high' | 'medium';
  role: string;              // File's role in project
  dependencies: string[];    // Files this depends on
  dependents: string[];      // Files that depend on this
}

/**
 * Context synchronization
 */
export interface ContextSyncResult {
  sourceAgent: AgentType;
  targetAgents: AgentType[];
  syncedSuccessfully: AgentType[];
  syncErrors: SyncError[];
  syncDuration: number;      // Milliseconds
  conflictsResolved: ConflictResolution[];
}

export interface SyncError {
  targetAgent: AgentType;
  error: string;
  recoverable: boolean;
  suggestedFix?: string;
}

export interface ConflictResolution {
  field: string;             // Conflicting field
  sourceValue: any;
  targetValue: any;
  resolution: 'source-wins' | 'target-wins' | 'merge' | 'manual';
  reasoning: string;
}

/**
 * Multi-agent coordination
 */
export interface AgentCoordination {
  sessionId: string;
  primaryAgent: AgentType;
  supportingAgents: AgentType[];
  sharedState: SharedState;
  communicationChannels: CommunicationChannel[];
  conflictResolution: ConflictResolutionStrategy;
}

export interface SharedState {
  currentTask: string;
  workingDirectory: string;
  sharedFiles: string[];
  lockManager: FileLockManager;
  statusUpdates: StatusUpdate[];
}

export interface FileLockManager {
  lockedFiles: Record<string, AgentType>;
  lockRequests: LockRequest[];
  lockTimeout: number;       // Milliseconds
}

export interface LockRequest {
  file: string;
  requestingAgent: AgentType;
  requestTime: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface StatusUpdate {
  agent: AgentType;
  timestamp: Date;
  status: string;
  details?: any;
}

export interface CommunicationChannel {
  id: string;
  type: 'file' | 'memory' | 'network';
  participants: AgentType[];
  protocol: CommunicationProtocol;
}

export interface CommunicationProtocol {
  format: 'json' | 'markdown' | 'yaml';
  encryption?: boolean;
  compression?: boolean;
  retryPolicy?: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;         // Milliseconds
}

export type ConflictResolutionStrategy = 
  | 'primary-wins'
  | 'consensus'
  | 'voting'
  | 'manual-intervention';

/**
 * Token optimization
 */
export interface TokenOptimization {
  originalTokens: number;
  optimizedTokens: number;
  compressionRatio: number;  // optimized/original
  sectionsCompressed: CompressionResult[];
  targetTokenLimit: number;
}

export interface CompressionResult {
  section: string;
  originalSize: number;
  compressedSize: number;
  method: CompressionMethod;
}

export type CompressionMethod = 
  | 'summarization'
  | 'keyword-extraction'
  | 'reference-linking'
  | 'archival';

/**
 * Context utilities
 */
export const createAgentContext = (
  agentType: AgentType,
  projectSummary: string
): AgentContext => {
  const contextFiles: Record<AgentType, string> = {
    claude: 'CLAUDE.md',
    copilot: '.github/copilot-instructions.md',
    gemini: 'GEMINI.md',
    custom: 'AGENT_CONTEXT.md'
  };
  
  return {
    agentType,
    contextFile: contextFiles[agentType],
    projectSummary,
    currentPhase: 'Phase 0: Initial Setup',
    recentChanges: [],
    keyCommands: [],
    fileLocations: {},
    tokenCount: 0,
    lastOptimized: new Date(),
    createdDate: new Date(),
    lastModified: new Date(),
    version: '1.0.0'
  };
};

export const calculateTokenCount = (context: AgentContext): number => {
  // Simplified token calculation (actual would use proper tokenization)
  const textContent = [
    context.projectSummary,
    context.currentPhase,
    ...context.recentChanges,
    ...context.keyCommands.map(cmd => cmd.description),
    ...Object.values(context.fileLocations)
  ].join(' ');
  
  // Rough estimate: ~4 characters per token
  return Math.ceil(textContent.length / 4);
};

export const optimizeContextForTokens = (
  context: AgentContext,
  targetLimit: number = 8000
): TokenOptimization => {
  const originalTokens = calculateTokenCount(context);
  
  if (originalTokens <= targetLimit) {
    return {
      originalTokens,
      optimizedTokens: originalTokens,
      compressionRatio: 1.0,
      sectionsCompressed: [],
      targetTokenLimit: targetLimit
    };
  }
  
  // Apply compression strategies
  const compressionResults: CompressionResult[] = [];
  
  // 1. Summarize recent changes (keep only last 5)
  if (context.recentChanges.length > 5) {
    const originalSize = context.recentChanges.join(' ').length;
    context.recentChanges = context.recentChanges.slice(-5);
    const compressedSize = context.recentChanges.join(' ').length;
    
    compressionResults.push({
      section: 'recentChanges',
      originalSize,
      compressedSize,
      method: 'summarization'
    });
  }
  
  // 2. Compress command descriptions
  context.keyCommands.forEach(cmd => {
    if (cmd.description.length > 100) {
      const originalSize = cmd.description.length;
      cmd.description = cmd.description.substring(0, 97) + '...';
      compressionResults.push({
        section: `command-${cmd.name}`,
        originalSize,
        compressedSize: cmd.description.length,
        method: 'keyword-extraction'
      });
    }
  });
  
  const optimizedTokens = calculateTokenCount(context);
  
  return {
    originalTokens,
    optimizedTokens,
    compressionRatio: optimizedTokens / originalTokens,
    sectionsCompressed: compressionResults,
    targetTokenLimit: targetLimit
  };
};

export const generateNavigationMap = (projectStructure: any): ProjectNavigationMap => {
  return {
    quickAccess: {
      currentSpec: 'specs/004-refactor-all-the/spec.md',
      activeTasks: 'specs/004-refactor-all-the/tasks.md',
      keyServices: [
        'src/services/SpecService.ts',
        'src/services/TestOrchestrationService.ts',
        'src/services/AgentContextService.ts',
        'src/services/DocumentationSyncService.ts'
      ],
      testFiles: [
        'tests/contract/',
        'tests/integration/',
        'tests/e2e/'
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'vitest.config.ts',
        'playwright.config.ts'
      ]
    },
    pathAliases: {
      '@services': 'src/services/',
      '@models': 'src/models/',
      '@components': 'src/components/',
      '@tests': 'tests/',
      '@specs': 'specs/'
    },
    sectionMarkers: [],
    criticalFiles: [
      {
        path: 'CLAUDE.md',
        importance: 'critical',
        role: 'Primary AI context and instructions',
        dependencies: ['specs/', 'src/', 'tests/'],
        dependents: ['.github/copilot-instructions.md']
      },
      {
        path: 'package.json',
        importance: 'critical',
        role: 'Project configuration and scripts',
        dependencies: [],
        dependents: ['all source files']
      }
    ]
  };
};

export const validateContextConsistency = (
  contexts: AgentContext[]
): ContextConsistencyResult => {
  const inconsistencies: ContextInconsistency[] = [];
  
  if (contexts.length < 2) {
    return {
      consistent: true,
      inconsistencies: [],
      lastValidation: new Date()
    };
  }
  
  const [primary, ...others] = contexts;
  
  if (!primary) {
    return {
      consistent: false,
      inconsistencies: [],
      lastValidation: new Date()
    };
  }
  
  // Check phase consistency
  others.forEach(context => {
    if (context.currentPhase !== primary.currentPhase) {
      inconsistencies.push({
        field: 'currentPhase',
        primaryValue: primary.currentPhase,
        conflictingValue: context.currentPhase,
        agent: context.agentType,
        impact: 'medium'
      });
    }
  });
  
  // Check project summary consistency
  others.forEach(context => {
    if (context.projectSummary !== primary.projectSummary) {
      inconsistencies.push({
        field: 'projectSummary',
        primaryValue: primary.projectSummary,
        conflictingValue: context.projectSummary,
        agent: context.agentType,
        impact: 'low'
      });
    }
  });
  
  return {
    consistent: inconsistencies.length === 0,
    inconsistencies,
    lastValidation: new Date()
  };
};

export interface ContextConsistencyResult {
  consistent: boolean;
  inconsistencies: ContextInconsistency[];
  lastValidation: Date;
}

export interface ContextInconsistency {
  field: string;
  primaryValue: any;
  conflictingValue: any;
  agent: AgentType;
  impact: 'low' | 'medium' | 'high';
}