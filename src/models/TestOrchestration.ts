/**
 * TestOrchestration Model
 * 
 * Manages test execution across different types and phases.
 * Enforces constitutional testing order and coordinates TDD workflows.
 */

import type { TestCase, TestType, TestStatus } from './TestCase';

export type TestPhase = 'contract' | 'integration' | 'e2e' | 'unit';
export type OrchestrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Core TestOrchestration interface
 */
export interface TestOrchestration {
  // Execution management
  suite: string;             // Test suite name
  testTypes: TestType[];     // Types of tests included
  executionOrder: TestPhase[]; // Constitutional order enforcement
  
  // Parallel execution
  parallelGroups: TestGroup[];
  maxConcurrency: number;
  
  // Environment
  environmentSetup: EnvironmentRequirement[];
  teardownSteps: string[];
  
  // Status
  status: OrchestrationStatus;
  startTime?: Date;
  endTime?: Date;
  
  // Results
  results?: TestExecutionResult;
  
  // Configuration
  configuration: OrchestrationConfiguration;
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
}

/**
 * Test grouping and parallel execution
 */
export interface TestGroup {
  groupId: string;
  name: string;
  description: string;
  testCases: string[];       // Test case IDs
  
  // Execution properties
  canRunInParallel: boolean;
  maxConcurrency?: number;
  dependencies: string[];    // Other group IDs this depends on
  
  // Environment requirements
  sharedResources: string[]; // Resources needed by all tests in group
  isolation: IsolationLevel;
  
  // Timing
  estimatedDuration: number; // Milliseconds
  timeout?: number;          // Group timeout
}

export type IsolationLevel = 'none' | 'process' | 'container' | 'full';

export interface EnvironmentRequirement {
  type: RequirementType;
  name: string;
  version?: string;
  configuration?: Record<string, any>;
  required: boolean;
}

export type RequirementType = 
  | 'service'
  | 'database' 
  | 'mock-server'
  | 'test-data'
  | 'browser'
  | 'runtime';

/**
 * Constitutional test order enforcement
 */
export interface ConstitutionalTestOrder {
  phases: TestPhase[];       // Required order: contract → integration → e2e → unit
  enforced: boolean;
  violations: OrderViolation[];
  
  // Phase definitions
  phaseDefinitions: PhaseDefinition[];
}

export interface OrderViolation {
  phase: TestPhase;
  violation: string;
  severity: 'warning' | 'error' | 'critical';
  recommendedAction: string;
  blockingExecution: boolean;
}

export interface PhaseDefinition {
  phase: TestPhase;
  description: string;
  purpose: string;
  
  // Requirements
  prerequisites: string[];   // What must be done before this phase
  exitCriteria: string[];    // What must pass to proceed
  
  // Behavior
  failFast: boolean;         // Stop on first failure
  allowParallel: boolean;    // Can tests in phase run in parallel
  
  // Configuration
  timeout?: number;          // Phase timeout
  retryCount?: number;       // Max retries for failing tests
}

/**
 * Test execution and results
 */
export interface TestExecutionResult {
  // Overall results
  suiteId: string;
  phases: PhaseResult[];
  overallStatus: ExecutionStatus;
  totalDuration: number;     // Milliseconds
  
  // Counts
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  errorTests: number;
  
  // Details
  failureCount: number;
  failures: TestFailureDetail[];
  
  // Performance
  slowestTests: SlowTestResult[];
  parallelEfficiency: number; // 0-1 scale
  
  // Coverage
  coverage?: TestCoverageResult;
}

export type ExecutionStatus = 'passed' | 'failed' | 'error' | 'cancelled' | 'timeout';

export interface PhaseResult {
  phase: TestPhase;
  status: ExecutionStatus;
  tests: TestResult[];
  duration: number;
  
  // Phase-specific metrics
  setupTime: number;
  teardownTime: number;
  parallelGroups: number;
  sequentialTests: number;
}

export interface TestResult {
  testId: string;
  testTitle: string;
  status: TestStatus;
  duration: number;
  error?: string;
  stackTrace?: string;
  retryCount?: number;
  
  // Context
  group?: string;           // Test group if applicable
  environment?: string;     // Environment used
  worker?: string;          // Parallel worker ID
}

export interface TestFailureDetail {
  testId: string;
  testTitle: string;
  phase: TestPhase;
  error: string;
  stackTrace?: string;
  expectedValue?: any;
  actualValue?: any;
  reproducible: boolean;
  
  // Context
  environment: string;
  timestamp: Date;
  retryAttempts: number;
}

export interface SlowTestResult {
  testId: string;
  testTitle: string;
  duration: number;
  threshold: number;        // Expected max duration
  phase: TestPhase;
  suggestions: string[];    // Performance improvement suggestions
}

export interface TestCoverageResult {
  overall: CoverageMetrics;
  byPhase: Record<TestPhase, CoverageMetrics>;
  byFile: FileCoverageMetric[];
  
  // Gaps
  uncoveredCode: UncoveredCodeArea[];
  coverageGaps: CoverageGap[];
}

export interface CoverageMetrics {
  lines: number;
  coveredLines: number;
  functions: number;
  coveredFunctions: number;
  branches: number;
  coveredBranches: number;
  statements: number;
  coveredStatements: number;
  
  // Percentages
  linePercentage: number;
  functionPercentage: number;
  branchPercentage: number;
  statementPercentage: number;
}

export interface FileCoverageMetric {
  file: string;
  coverage: CoverageMetrics;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface UncoveredCodeArea {
  file: string;
  startLine: number;
  endLine: number;
  type: 'function' | 'branch' | 'statement';
  complexity: number;
}

export interface CoverageGap {
  type: 'missing-unit-tests' | 'missing-integration-tests' | 'missing-e2e-tests';
  files: string[];
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

/**
 * Configuration and settings
 */
export interface OrchestrationConfiguration {
  // Execution settings
  enforceConstitutionalOrder: boolean;
  failFast: boolean;
  parallelExecution: boolean;
  maxWorkers: number;
  
  // Timeouts
  testTimeout: number;       // Per test timeout
  suiteTimeout: number;      // Overall suite timeout
  setupTimeout: number;      // Environment setup timeout
  
  // Retry logic
  retryFailedTests: boolean;
  maxRetries: number;
  retryDelay: number;        // ms between retries
  
  // Reporting
  verboseOutput: boolean;
  generateReports: boolean;
  reportFormats: ReportFormat[];
  
  // Environment
  environmentIsolation: IsolationLevel;
  cleanupBetweenTests: boolean;
  preserveTestData: boolean;
  
  // Performance
  collectCoverage: boolean;
  collectMetrics: boolean;
  profileSlowTests: boolean;
}

export type ReportFormat = 'json' | 'xml' | 'html' | 'markdown' | 'junit';

/**
 * Test environment management
 */
export interface TestEnvironment {
  id: string;
  name: string;
  status: EnvironmentStatus;
  
  // Services
  services: Record<string, ServiceInstance>;
  mockData: Record<string, any>;
  
  // Lifecycle
  setupScript?: string;
  teardownScript?: string;
  healthCheckScript?: string;
  
  // Resources
  ports: number[];
  volumes: string[];
  networks: string[];
  
  // Cleanup
  cleanup: () => Promise<void>;
}

export type EnvironmentStatus = 'initializing' | 'ready' | 'error' | 'destroyed';

export interface ServiceInstance {
  name: string;
  type: RequirementType;
  url?: string;
  port?: number;
  status: 'starting' | 'ready' | 'error' | 'stopped';
  healthCheck?: () => Promise<boolean>;
}

/**
 * TDD workflow support
 */
export interface TDDWorkflowValidation {
  testFile: string;
  implementationFile: string;
  
  // Validation results
  testExists: boolean;
  implementationExists: boolean;
  testsFailWithoutImplementation: boolean;
  tddCompliant: boolean;
  
  // Violations
  violations: TDDViolation[];
}

export interface TDDViolation {
  type: 'implementation-before-test' | 'tests-not-failing' | 'missing-tests';
  description: string;
  severity: 'warning' | 'error';
  remediation: string;
}

export interface TDDCycle {
  phase: 'red' | 'green' | 'refactor';
  lastTransition: Date;
  cycleCount: number;
  
  // Current state
  currentState: TDDState;
  
  // History
  phaseHistory: TDDPhaseRecord[];
}

export interface TDDState {
  testsCount: number;
  passingTests: number;
  failingTests: number;
  lastTestRun: Date;
  codeChanged: boolean;
}

export interface TDDPhaseRecord {
  phase: 'red' | 'green' | 'refactor';
  startTime: Date;
  endTime: Date;
  testsRun: number;
  changesCommitted: boolean;
}

/**
 * Utilities and orchestration functions
 */
export const validateConstitutionalOrder = (
  testSuite: TestCase[]
): ConstitutionalTestOrder => {
  const violations: OrderViolation[] = [];
  const expectedOrder: TestPhase[] = ['contract', 'integration', 'e2e', 'unit'];
  
  // Check for required phases
  const presentPhases = new Set(testSuite.map(test => mapTestTypeToPhase(test.type)));
  
  if (!presentPhases.has('contract')) {
    violations.push({
      phase: 'contract',
      violation: 'Missing contract tests',
      severity: 'critical',
      recommendedAction: 'Create contract tests before implementing services',
      blockingExecution: true
    });
  }
  
  return {
    phases: expectedOrder,
    enforced: true,
    violations,
    phaseDefinitions: createDefaultPhaseDefinitions()
  };
};

const mapTestTypeToPhase = (testType: TestType): TestPhase => {
  const mapping: Record<TestType, TestPhase> = {
    'contract': 'contract',
    'integration': 'integration',
    'e2e': 'e2e',
    'unit': 'unit',
    'performance': 'e2e'  // Map performance tests to e2e phase
  };
  
  return mapping[testType] || 'unit';
};

const createDefaultPhaseDefinitions = (): PhaseDefinition[] => {
  return [
    {
      phase: 'contract',
      description: 'Contract tests define service interfaces',
      purpose: 'Validate API contracts before implementation',
      prerequisites: ['Service contracts defined'],
      exitCriteria: ['All contract tests pass', 'Service interfaces validated'],
      failFast: true,
      allowParallel: true
    },
    {
      phase: 'integration',
      description: 'Integration tests validate service interactions',
      purpose: 'Ensure services work together correctly',
      prerequisites: ['Contract tests passing', 'Services implemented'],
      exitCriteria: ['Service interactions validated', 'Data flow confirmed'],
      failFast: false,
      allowParallel: true
    },
    {
      phase: 'e2e',
      description: 'End-to-end tests validate complete workflows',
      purpose: 'Ensure full user scenarios work',
      prerequisites: ['Integration tests passing', 'UI implemented'],
      exitCriteria: ['User workflows complete', 'System functions end-to-end'],
      failFast: false,
      allowParallel: false
    },
    {
      phase: 'unit',
      description: 'Unit tests validate individual components',
      purpose: 'Ensure components work in isolation',
      prerequisites: ['Components implemented'],
      exitCriteria: ['All components tested', 'Code coverage achieved'],
      failFast: false,
      allowParallel: true
    }
  ];
};

export const analyzeParallelCapability = (
  testCases: TestCase[]
): ParallelAnalysisResult => {
  const groups: TestGroup[] = [];
  const sequential: string[] = [];
  const dependencies: Record<string, string[]> = {};
  
  // Group tests by type and dependencies
  const testsByType = testCases.reduce((acc, test) => {
    const phase = mapTestTypeToPhase(test.type);
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(test);
    return acc;
  }, {} as Record<TestPhase, TestCase[]>);
  
  // Create parallel groups for each phase
  Object.entries(testsByType).forEach(([phase, tests]) => {
    if (tests.length > 1) {
      groups.push({
        groupId: `${phase}-group`,
        name: `${phase} tests`,
        description: `Parallel execution of ${phase} tests`,
        testCases: tests.map(t => t.id),
        canRunInParallel: phase !== 'e2e', // E2E tests typically can't run in parallel
        dependencies: [],
        sharedResources: [],
        isolation: 'process',
        estimatedDuration: Math.max(...tests.map(t => 30000)) // 30s default
      });
    } else {
      sequential.push(...tests.map(t => t.id));
    }
  });
  
  return {
    groups,
    sequential,
    dependencies
  };
};

export interface ParallelAnalysisResult {
  groups: TestGroup[];
  sequential: string[];
  dependencies: Record<string, string[]>;
}

export const calculateExecutionMetrics = (result: TestExecutionResult): ExecutionMetrics => {
  const phases = result.phases;
  const totalDuration = result.totalDuration;
  
  // Calculate average duration per phase
  const phaseDurations = phases.map(p => p.duration);
  const averagePhaseDuration = phaseDurations.reduce((sum, d) => sum + d, 0) / phases.length;
  
  // Find slowest tests
  const allTests = phases.flatMap(p => p.tests);
  const slowestTests = allTests
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .map(test => ({
      testId: test.testId,
      testTitle: test.testTitle,
      duration: test.duration,
      threshold: 5000, // 5 second threshold
      phase: phases.find(p => p.tests.includes(test))?.phase || 'unknown' as TestPhase,
      suggestions: generatePerformanceSuggestions(test)
    }));
  
  // Calculate failure rate
  const failureRate = result.totalTests > 0 
    ? (result.failedTests / result.totalTests) * 100 
    : 0;
  
  // Calculate parallel efficiency
  const theoreticalMinDuration = Math.max(...phaseDurations);
  const parallelEfficiency = theoreticalMinDuration / totalDuration;
  
  return {
    averageDuration: totalDuration / result.totalTests,
    slowestTests,
    failureRate,
    parallelEfficiency,
    recommendations: generateOptimizationRecommendations(result)
  };
};

export interface ExecutionMetrics {
  averageDuration: number;
  slowestTests: SlowTestResult[];
  failureRate: number;
  parallelEfficiency: number;
  recommendations: string[];
}

const generatePerformanceSuggestions = (test: TestResult): string[] => {
  const suggestions: string[] = [];
  
  if (test.duration > 10000) {
    suggestions.push('Consider breaking into smaller test cases');
    suggestions.push('Review test setup and teardown efficiency');
  }
  
  if (test.retryCount && test.retryCount > 0) {
    suggestions.push('Investigate test flakiness and improve stability');
  }
  
  return suggestions;
};

const generateOptimizationRecommendations = (result: TestExecutionResult): string[] => {
  const recommendations: string[] = [];
  
  if (result.parallelEfficiency < 0.7) {
    recommendations.push('Consider increasing parallel execution opportunities');
  }
  
  if (result.failureCount > result.totalTests * 0.1) {
    recommendations.push('High failure rate - review test quality and stability');
  }
  
  return recommendations;
};