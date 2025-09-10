# Service Contract: AgentContextService

**Purpose**: Manage AI agent context, communication, and collaboration for optimal development workflows  
**Version**: 1.0.0  
**Last Updated**: 2025-09-09

## Interface Definition

### Core Operations

#### `updateAgentContext(agentType: AgentType, context: ContextUpdate): ContextResult`
Updates agent-specific context files with current project state and relevant information.

**Input**:
```typescript
interface ContextUpdate {
  projectSummary?: string;
  currentPhase?: string;
  recentChanges?: string[];
  activeSpec?: string;
  keyCommands?: Command[];
  fileLocations?: Record<string, string>;
  customInstructions?: string[];
}

type AgentType = "claude" | "copilot" | "gemini" | "custom";
```

**Output**:
```typescript
interface ContextResult {
  agentType: AgentType;
  contextFile: string;
  lastUpdated: Date;
  lineCount: number;
  sizeBytes: number;
  syncStatus: "success" | "partial" | "failed";
}
```

**Behavior**:
- Update agent-specific instruction file (CLAUDE.md, .github/copilot-instructions.md, etc.)
- Preserve manual additions between markers
- Keep context under token limits (150 lines for efficiency)
- Add only NEW information to avoid duplication
- Maintain readability and AI-parseable format

#### `getOptimalContext(agentType: AgentType, task: string): OptimalContextResult`
Retrieves the most relevant context for a specific task and agent type.

**Input**:
- `agentType`: Target AI agent type
- `task`: Current task or query description

**Output**:
```typescript
interface OptimalContextResult {
  contextSummary: string;
  relevantFiles: string[];
  applicableCommands: Command[];
  recentContext: string[];
  suggestedApproach: string[];
  tokenEstimate: number;
}
```

**Behavior**:
- Analyze task requirements against available context
- Prioritize most relevant information
- Suggest optimal approach based on agent capabilities
- Estimate token usage for context efficiency
- Return structured, actionable information

#### `facilitateAgentCollaboration(session: CollaborationSession): CollaborationResult`
Coordinates multiple AI agents working on the same project or feature.

**Input**:
```typescript
interface CollaborationSession {
  sessionId: string;
  participants: AgentParticipant[];
  sharedGoal: string;
  workAllocation: WorkAllocation[];
  communicationChannel: string;
}

interface AgentParticipant {
  agentType: AgentType;
  agentId: string;
  capabilities: string[];
  workload: number; // 0-100%
  availability: "available" | "busy" | "offline";
}
```

**Output**:
```typescript
interface CollaborationResult {
  sessionStatus: "initiated" | "active" | "completed" | "failed";
  taskDistribution: TaskDistribution[];
  communicationLog: AgentMessage[];
  conflictResolutions: ConflictResolution[];
  outcomes: CollaborationOutcome[];
}
```

#### `synchronizeContext(sourceAgent: AgentType, targetAgents: AgentType[]): SyncResult`
Synchronizes context and state between different AI agents.

**Input**:
- `sourceAgent`: Agent with authoritative context
- `targetAgents`: Agents to receive context updates

**Output**:
```typescript
interface SyncResult {
  syncedAgents: AgentType[];
  failedAgents: AgentType[];
  conflictCount: number;
  resolutionStrategies: string[];
  syncTimestamp: Date;
}
```

### Context Management

#### `validateContextIntegrity(agentType: AgentType): IntegrityResult`
Validates that agent context is consistent, complete, and up-to-date.

#### `archiveContextVersion(agentType: AgentType, milestone: string): ArchiveResult`
Archives current context state for rollback and historical reference.

#### `generateContextDiff(agentType: AgentType, fromVersion: string, toVersion: string): ContextDiff`
Generates difference report between context versions.

## Data Types

### Agent Communication Types
```typescript
interface AgentMessage {
  fromAgent: AgentType;
  toAgent: AgentType | "broadcast";
  messageType: "info" | "request" | "response" | "warning" | "error";
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

interface Command {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  category: "dev" | "test" | "build" | "spec" | "git";
}

interface WorkAllocation {
  agentType: AgentType;
  tasks: string[];
  files: string[];
  priority: "low" | "medium" | "high";
  dependencies: string[];
}
```

### Context Structure Types
```typescript
interface ContextStructure {
  header: ContextHeader;
  projectOverview: ProjectOverview;
  currentStatus: CurrentStatus;
  keyInformation: KeyInformation;
  commands: Command[];
  fileLocations: FileLocations;
  customSections: CustomSection[];
}

interface ContextHeader {
  projectName: string;
  version: string;
  lastUpdated: Date;
  agentType: AgentType;
  tokenCount: number;
}

interface ProjectOverview {
  description: string;
  techStack: string[];
  architecture: string;
  keyFeatures: string[];
}

interface CurrentStatus {
  activePhase: string;
  currentSpec: string;
  recentChanges: string[];
  nextSteps: string[];
}
```

### Collaboration Types
```typescript
interface TaskDistribution {
  agentType: AgentType;
  assignedTasks: string[];
  estimatedEffort: number;
  startTime: Date;
  expectedCompletion: Date;
}

interface ConflictResolution {
  conflictType: "file-modification" | "task-overlap" | "context-mismatch";
  description: string;
  resolution: string;
  resolvedBy: AgentType;
  resolvedAt: Date;
}

interface CollaborationOutcome {
  taskCompleted: string;
  contributingAgents: AgentType[];
  qualityScore: number;
  timeTaken: number;
  artifacts: string[];
}
```

## Agent-Specific Behaviors

### Claude Code Integration
```typescript
interface ClaudeContext {
  claudeMdPath: string;
  todoTracking: boolean;
  planMode: boolean;
  specKitWorkflow: boolean;
  memoryManagement: "auto" | "manual";
}
```

**Claude-Specific Features**:
- Integration with CLAUDE.md for project context
- Todo list management with TodoWrite tool
- Plan mode for complex implementations
- Spec-kit workflow integration
- Memory optimization for large projects

### GitHub Copilot Integration
```typescript
interface CopilotContext {
  instructionsPath: string; // .github/copilot-instructions.md
  codeStyleGuide: string;
  preferredPatterns: string[];
  avoidPatterns: string[];
}
```

**Copilot-Specific Features**:
- Code completion optimization
- Style guide enforcement
- Pattern recognition training
- Comment-driven development

### Custom Agent Support
```typescript
interface CustomAgentConfig {
  agentId: string;
  capabilities: AgentCapability[];
  contextFormat: "markdown" | "json" | "xml" | "yaml";
  communicationProtocol: "http" | "websocket" | "file" | "cli";
  updateFrequency: "realtime" | "periodic" | "manual";
}
```

## Error Handling

### Error Types
- `ContextSizeExceeded`: Context file exceeds token limits
- `AgentNotFound`: Specified agent type not supported
- `SyncConflict`: Conflicting context updates
- `CommunicationFailure`: Inter-agent communication failed
- `IntegrityViolation`: Context consistency check failed

### Error Recovery
- Automatic context compression for size violations
- Conflict resolution using timestamp and priority
- Fallback communication channels
- Context rollback to last known good state

## Dependencies

### Internal Dependencies
- SpecService for current specification context
- TaskService for active task information
- DocumentationSync for keeping context current
- FileSystemService for context file management

### External Dependencies
- Git for version tracking of context changes
- File system for reading/writing context files
- Network services for agent communication
- Templating engine for context generation

## Usage Examples

### Updating Claude Context
```typescript
const result = await agentContext.updateAgentContext("claude", {
  currentPhase: "Phase 1: Design & Contracts",
  activeSpec: "004-refactor-all-the",
  recentChanges: [
    "Added comprehensive research.md with best practices",
    "Created service contracts for spec and test orchestration"
  ],
  keyCommands: [
    { name: "npm run test", description: "Run test suite", usage: "npm run test", examples: [] }
  ]
});
```

### Facilitating Multi-Agent Collaboration
```typescript
const collaboration = await agentContext.facilitateAgentCollaboration({
  sessionId: "refactor-session-001",
  participants: [
    { agentType: "claude", agentId: "claude-1", capabilities: ["planning", "testing"], workload: 60 },
    { agentType: "copilot", agentId: "copilot-1", capabilities: ["coding", "completion"], workload: 40 }
  ],
  sharedGoal: "Complete spec-kit refactoring implementation",
  workAllocation: [
    { agentType: "claude", tasks: ["test-orchestration", "documentation"], files: [], priority: "high", dependencies: [] },
    { agentType: "copilot", tasks: ["code-implementation", "refactoring"], files: [], priority: "medium", dependencies: ["test-orchestration"] }
  ],
  communicationChannel: "shared-context"
});
```

### Getting Optimal Context for Task
```typescript
const optimalContext = await agentContext.getOptimalContext(
  "claude",
  "Implement Playwright test automation for spec-kit workflows"
);
console.log("Suggested approach:", optimalContext.suggestedApproach);
```

## Performance Requirements

- Context updates: < 2 seconds
- Context retrieval: < 500ms
- Agent synchronization: < 5 seconds
- Context validation: < 1 second
- Token count estimation: < 100ms

## Security and Privacy

### Data Protection
- No sensitive information in context files
- Secure agent-to-agent communication
- Context encryption for sensitive projects
- Access control for agent capabilities

### Audit Trail
- Log all context modifications
- Track agent access patterns
- Monitor collaboration sessions
- Record conflict resolutions

## Monitoring and Analytics

### Context Quality Metrics
- Context relevance score (0-100)
- Token efficiency ratio
- Update frequency patterns
- Agent satisfaction scores

### Collaboration Metrics
- Multi-agent session success rate
- Task completion velocity
- Conflict resolution time
- Code quality improvements

### Performance Monitoring
- Context file size trends
- Update operation latency
- Synchronization success rate
- Agent response times

## Future Enhancements

### Planned Features
- Machine learning for context optimization
- Predictive context preloading
- Advanced conflict resolution algorithms
- Real-time collaboration dashboards
- Integration with more AI agent types

### Scalability Improvements
- Distributed context management
- Caching strategies for large projects
- Incremental context updates
- Context compression algorithms