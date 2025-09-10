/**
 * TestCase Model
 * 
 * Represents test scenarios for validating implementation.
 * Core component of TDD workflow and constitutional testing order.
 */

export type TestType = 'unit' | 'integration' | 'e2e' | 'contract' | 'performance';
export type TestStatus = 'not-written' | 'failing' | 'passing' | 'skipped' | 'error';

/**
 * Core TestCase interface
 */
export interface TestCase {
  // Identity
  id: string;                // Unique test identifier
  title: string;             // Test description
  type: TestType;
  
  // Context
  feature: string;           // Feature being tested
  scenario: string;          // Specific test scenario
  
  // Test specification (Given-When-Then)
  givenConditions: string[]; // Test preconditions
  whenActions: string[];     // Actions performed
  thenExpectations: string[]; // Expected outcomes
  
  // Implementation details
  filePath: string;          // Test file location
  testFunction: string;      // Actual test function name
  
  // Status and execution
  status: TestStatus;
  lastRun?: Date;
  duration?: number;         // Milliseconds
  
  // Error information
  errorMessage?: string;
  stackTrace?: string;
  
  // Metadata
  createdDate: Date;
  lastModified: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Test suite organization
 */
export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  
  // Suite configuration
  setupScript?: string;      // Before all tests
  teardownScript?: string;   // After all tests
  timeout?: number;          // Suite timeout in ms
  
  // Dependencies
  requires: string[];        // Required services/modules
  
  // Execution results
  lastRun?: Date;
  status: TestSuiteStatus;
  results?: TestSuiteResult;
}

export type TestSuiteStatus = 'not-run' | 'running' | 'passed' | 'failed' | 'error';

export interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  errorTests: number;
  
  duration: number;          // Total execution time
  coverage?: TestCoverage;
  
  failures: TestFailureDetail[];
}

export interface TestFailureDetail {
  testId: string;
  testTitle: string;
  error: string;
  stackTrace?: string;
  expectedValue?: any;
  actualValue?: any;
}

export interface TestCoverage {
  lines: CoverageMetric;
  functions: CoverageMetric;
  branches: CoverageMetric;
  statements: CoverageMetric;
}

export interface CoverageMetric {
  total: number;
  covered: number;
  percentage: number;
}

/**
 * Constitutional test order management
 */
export interface ConstitutionalTestOrder {
  phases: TestType[];        // Order: contract → integration → e2e → unit
  enforced: boolean;
  violations: OrderViolation[];
}

export interface OrderViolation {
  phase: TestType;
  violation: string;
  recommendedAction: string;
}

/**
 * Test data and mocking
 */
export interface TestData {
  id: string;
  name: string;
  type: 'fixture' | 'mock' | 'stub' | 'spy';
  data: any;
  
  // Usage context
  testCases: string[];       // Test IDs that use this data
  setup?: string;            // Setup code
  cleanup?: string;          // Cleanup code
}

export interface MockDefinition {
  service: string;           // Service being mocked
  methods: MockMethod[];
  behavior: MockBehavior;
}

export interface MockMethod {
  name: string;
  parameters: any[];
  returnValue: any;
  sideEffects?: string[];
  callCount?: number;
}

export type MockBehavior = 'strict' | 'loose' | 'spy';

/**
 * Test utilities and validation
 */
export const createTestCase = (
  title: string,
  type: TestType,
  feature: string
): TestCase => {
  return {
    id: generateTestId(),
    title,
    type,
    feature,
    scenario: title,
    givenConditions: [],
    whenActions: [],
    thenExpectations: [],
    filePath: '',
    testFunction: '',
    status: 'not-written',
    createdDate: new Date(),
    lastModified: new Date(),
    tags: [],
    priority: 'medium'
  };
};

export const generateTestId = (): string => {
  return `TEST-${Date.now().toString(36).toUpperCase()}`;
};

export const validateGivenWhenThen = (testCase: TestCase): string[] => {
  const violations: string[] = [];
  
  if (testCase.givenConditions.length === 0) {
    violations.push('Test must specify Given conditions (preconditions)');
  }
  
  if (testCase.whenActions.length === 0) {
    violations.push('Test must specify When actions (what is being tested)');
  }
  
  if (testCase.thenExpectations.length === 0) {
    violations.push('Test must specify Then expectations (expected outcomes)');
  }
  
  // Check for proper format
  testCase.givenConditions.forEach((given, index) => {
    if (!given.toLowerCase().startsWith('given') && index === 0) {
      violations.push('First Given condition should start with "Given"');
    }
  });
  
  testCase.whenActions.forEach((when, index) => {
    if (!when.toLowerCase().startsWith('when') && index === 0) {
      violations.push('First When action should start with "When"');
    }
  });
  
  testCase.thenExpectations.forEach((then, index) => {
    if (!then.toLowerCase().startsWith('then') && index === 0) {
      violations.push('First Then expectation should start with "Then"');
    }
  });
  
  return violations;
};

export const validateConstitutionalOrder = (testSuites: TestSuite[]): ConstitutionalTestOrder => {
  const violations: OrderViolation[] = [];
  const expectedOrder: TestType[] = ['contract', 'integration', 'e2e', 'unit'];
  
  // Check that contract tests exist and run first
  const hasContractTests = testSuites.some(suite => 
    suite.testCases.some(test => test.type === 'contract')
  );
  
  if (!hasContractTests) {
    violations.push({
      phase: 'contract',
      violation: 'No contract tests found',
      recommendedAction: 'Create contract tests before implementing services'
    });
  }
  
  // Check that integration tests exist
  const hasIntegrationTests = testSuites.some(suite =>
    suite.testCases.some(test => test.type === 'integration')
  );
  
  if (!hasIntegrationTests) {
    violations.push({
      phase: 'integration',
      violation: 'No integration tests found',
      recommendedAction: 'Create integration tests to validate service interactions'
    });
  }
  
  // Check E2E coverage
  const hasE2ETests = testSuites.some(suite =>
    suite.testCases.some(test => test.type === 'e2e')
  );
  
  if (!hasE2ETests) {
    violations.push({
      phase: 'e2e',
      violation: 'No E2E tests found',
      recommendedAction: 'Create E2E tests to validate complete workflows'
    });
  }
  
  return {
    phases: expectedOrder,
    enforced: true,
    violations
  };
};

export const calculateTestMetrics = (testSuites: TestSuite[]): TestMetrics => {
  const allTests = testSuites.flatMap(suite => suite.testCases);
  
  const byType = allTests.reduce((acc, test) => {
    acc[test.type] = (acc[test.type] || 0) + 1;
    return acc;
  }, {} as Record<TestType, number>);
  
  const byStatus = allTests.reduce((acc, test) => {
    acc[test.status] = (acc[test.status] || 0) + 1;
    return acc;
  }, {} as Record<TestStatus, number>);
  
  const totalTests = allTests.length;
  const passingTests = byStatus.passing || 0;
  const failingTests = (byStatus.failing || 0) + (byStatus.error || 0);
  
  return {
    total: totalTests,
    passing: passingTests,
    failing: failingTests,
    skipped: byStatus.skipped || 0,
    coverage: totalTests > 0 ? Math.round((passingTests / totalTests) * 100) : 0,
    byType,
    byStatus,
    testDensity: calculateTestDensity(allTests)
  };
};

export interface TestMetrics {
  total: number;
  passing: number;
  failing: number;
  skipped: number;
  coverage: number;
  byType: Record<TestType, number>;
  byStatus: Record<TestStatus, number>;
  testDensity: TestDensity;
}

export interface TestDensity {
  contractTests: number;     // Tests per service contract
  unitTests: number;         // Tests per function/method
  integrationTests: number;  // Tests per service interaction
  e2eTests: number;         // Tests per user workflow
}

const calculateTestDensity = (tests: TestCase[]): TestDensity => {
  // Simplified calculation - in real implementation would analyze codebase
  const contractTests = tests.filter(t => t.type === 'contract').length;
  const unitTests = tests.filter(t => t.type === 'unit').length;
  const integrationTests = tests.filter(t => t.type === 'integration').length;
  const e2eTests = tests.filter(t => t.type === 'e2e').length;
  
  return {
    contractTests,
    unitTests,
    integrationTests,
    e2eTests
  };
};

export const generateTestFromUserStory = (
  userStory: { asA: string; iWant: string; soThat: string },
  acceptanceScenarios: Array<{ given: string[]; when: string[]; then: string[] }>
): TestCase[] => {
  return acceptanceScenarios.map((scenario, index) => ({
    id: generateTestId(),
    title: `${userStory.iWant} - Scenario ${index + 1}`,
    type: 'e2e' as TestType,
    feature: userStory.iWant,
    scenario: `As a ${userStory.asA}, I want to ${userStory.iWant} so that ${userStory.soThat}`,
    givenConditions: scenario.given,
    whenActions: scenario.when,
    thenExpectations: scenario.then,
    filePath: '',
    testFunction: '',
    status: 'not-written' as TestStatus,
    createdDate: new Date(),
    lastModified: new Date(),
    tags: ['user-story', 'acceptance'],
    priority: 'high' as const
  }));
};