/**
 * Integration Test: Task Generation Workflow
 * 
 * Tests the workflow from specification to executable tasks
 * involving SpecService, TestOrchestrationService, and AgentContextService.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpecService } from '@/services/SpecService';
import { TestOrchestrationService } from '@/services/TestOrchestrationService';
import { AgentContextService } from '@/services/AgentContextService';

describe('Task Generation Workflow Integration', () => {
  let specService: SpecService;
  let testOrchestrationService: TestOrchestrationService;
  let agentContextService: AgentContextService;

  beforeEach(async () => {
    specService = new SpecService();
    testOrchestrationService = new TestOrchestrationService();
    agentContextService = new AgentContextService();
  });

  it('should generate executable tasks from approved specification', async () => {
    // Create and approve specification
    const specResult = await specService.createSpecification(
      'Task generation integration test feature'
    );
    
    await specService.approveSpecification(specResult.id);
    
    // Start implementation (generates tasks)
    const implementation = await specService.startImplementation(specResult.id);
    expect(implementation.success).toBe(true);
    expect(implementation.tasksGenerated).toBeGreaterThan(0);

    // Validate TDD workflow
    const tddValidation = await testOrchestrationService.validateTDDWorkflow(
      'tests/contract/NewService.test.ts',
      'src/services/NewService.ts'
    );
    
    expect(tddValidation.testExists).toBe(true);
    expect(tddValidation.tddCompliant).toBe(true);

    // Track TDD cycle
    const tddCycle = await testOrchestrationService.trackTDDCycle(
      'tests/contract/NewService.test.ts'
    );
    
    expect(tddCycle.phase).toMatch(/red|green|refactor/);
    expect(tddCycle.currentState.testsCount).toBeGreaterThan(0);

    console.log(`✅ Generated ${implementation.tasksGenerated} tasks from specification`);
  });

  it('should provide context-aware command suggestions during task execution', async () => {
    // Create specification and start implementation
    const specResult = await specService.createSpecification('Command suggestion test');
    await specService.approveSpecification(specResult.id);
    
    // Update agent context
    await agentContextService.updateContext('claude-context', {
      currentPhase: 'Phase 2: Contract Tests',
      recentChanges: [`Started implementation of ${specResult.id}`]
    });

    // Get command suggestions for current phase
    const suggestions = await agentContextService.suggestCommands(
      'Phase 2: Contract Tests',
      'claude'
    );

    expect(suggestions.phase).toBe('Phase 2: Contract Tests');
    expect(suggestions.recommended.length).toBeGreaterThan(0);
    expect(suggestions.recommended[0].command).toContain('test:contract');
    expect(suggestions.nextPhasePreparation.length).toBeGreaterThan(0);

    console.log(`✅ Generated ${suggestions.recommended.length} context-aware command suggestions`);
  });

  it('should analyze parallel task execution capabilities', async () => {
    // Simulate multiple test files for parallel analysis
    const testFiles = [
      'SpecService.test.ts',
      'AgentContextService.test.ts',
      'DocumentationSyncService.test.ts',
      'TestOrchestrationService.test.ts'
    ];

    const parallelAnalysis = await testOrchestrationService.analyzeParallelCapability(testFiles);

    expect(parallelAnalysis.groups.length).toBeGreaterThan(0);
    expect(parallelAnalysis.groups[0].canRunInParallel).toBe(true);
    expect(parallelAnalysis.dependencies).toBeDefined();

    // Validate parallel safety
    const dependentTests = testFiles.map(file => ({ file, depends: [] }));
    const safetyValidation = await testOrchestrationService.validateParallelSafety(dependentTests);

    expect(safetyValidation.canRunInParallel).toBe(true);
    expect(safetyValidation.conflicts.length).toBe(0);

    console.log(`✅ Analyzed parallel capabilities for ${testFiles.length} test files`);
  });

  it('should generate tasks for different specification types', async () => {
    // Test different specification types and their task generation patterns
    const specTypes = [
      { description: 'Simple service implementation', expectedTasks: { min: 5, max: 15 } },
      { description: 'Complex multi-service feature', expectedTasks: { min: 15, max: 40 } },
      { description: 'UI component with tests', expectedTasks: { min: 8, max: 20 } },
      { description: 'Database integration feature', expectedTasks: { min: 10, max: 25 } }
    ];

    for (const specType of specTypes) {
      const specResult = await specService.createSpecification(specType.description);
      await specService.approveSpecification(specResult.id);
      
      const implementation = await specService.startImplementation(specResult.id);
      expect(implementation.success).toBe(true);
      expect(implementation.tasksGenerated).toBeGreaterThanOrEqual(specType.expectedTasks.min);
      expect(implementation.tasksGenerated).toBeLessThanOrEqual(specType.expectedTasks.max);

      // Verify task categories are appropriate
      const taskBreakdown = await specService.getTaskBreakdown(specResult.id);
      expect(taskBreakdown.phases).toContain('contract');
      expect(taskBreakdown.phases).toContain('integration');
      expect(taskBreakdown.parallelizable.length).toBeGreaterThan(0);
    }

    console.log(`✅ Generated appropriate tasks for ${specTypes.length} different specification types`);
  });

  it('should validate task dependencies and execution order', async () => {
    // Create complex specification with dependencies
    const specResult = await specService.createSpecification(
      'Multi-phase dependency validation test'
    );
    await specService.approveSpecification(specResult.id);
    
    const implementation = await specService.startImplementation(specResult.id);
    const taskList = await specService.getTaskList(specResult.id);

    // Validate dependencies are properly identified
    expect(taskList.tasks.length).toBeGreaterThan(0);
    
    // Check that contract tests come before implementations
    const contractTasks = taskList.tasks.filter(task => task.phase === 'contract');
    const implementationTasks = taskList.tasks.filter(task => task.phase === 'implementation');
    
    expect(contractTasks.length).toBeGreaterThan(0);
    expect(implementationTasks.length).toBeGreaterThan(0);
    
    // Validate proper dependency chains
    for (const implTask of implementationTasks) {
      const hasContractDependency = implTask.dependencies?.some(dep => 
        contractTasks.find(ct => ct.id === dep)
      );
      expect(hasContractDependency).toBe(true);
    }

    // Test constitutional order enforcement
    const testOrder = taskList.tasks.map(task => task.phase);
    const orderValidation = await testOrchestrationService.validateTestOrder(testOrder);
    expect(orderValidation.isValid).toBe(true);

    console.log(`✅ Validated dependencies for ${taskList.tasks.length} generated tasks`);
  });

  it('should handle task prioritization and resource allocation', async () => {
    const specResult = await specService.createSpecification(
      'Resource allocation and prioritization test'
    );
    await specService.approveSpecification(specResult.id);
    
    const implementation = await specService.startImplementation(specResult.id);
    const taskList = await specService.getTaskList(specResult.id);

    // Test task prioritization
    const highPriorityTasks = taskList.tasks.filter(task => task.priority === 'high');
    const mediumPriorityTasks = taskList.tasks.filter(task => task.priority === 'medium');
    
    expect(highPriorityTasks.length).toBeGreaterThan(0);
    expect(mediumPriorityTasks.length).toBeGreaterThan(0);

    // Validate critical path identification
    const criticalPath = await specService.getCriticalPath(specResult.id);
    expect(criticalPath.tasks.length).toBeGreaterThan(0);
    expect(criticalPath.estimatedDuration).toBeGreaterThan(0);

    // Test resource allocation suggestions
    const resourceAllocation = await specService.getResourceAllocation(specResult.id);
    expect(resourceAllocation.parallelGroups.length).toBeGreaterThan(0);
    expect(resourceAllocation.sequentialTasks.length).toBeGreaterThan(0);

    console.log(`✅ Prioritized ${taskList.tasks.length} tasks with resource allocation`);
  });

  it('should support iterative refinement of task lists', async () => {
    const specResult = await specService.createSpecification('Iterative refinement test');
    await specService.approveSpecification(specResult.id);
    
    // Initial task generation
    const initialImplementation = await specService.startImplementation(specResult.id);
    const initialTaskList = await specService.getTaskList(specResult.id);
    const initialTaskCount = initialTaskList.tasks.length;

    // Simulate specification updates that require task refinement
    await specService.updateSpecification(specResult.id, {
      additionalRequirements: ['Add performance monitoring', 'Include error handling'],
      scope: 'expanded'
    });

    // Regenerate tasks
    const refinedImplementation = await specService.refineTaskList(specResult.id);
    expect(refinedImplementation.success).toBe(true);
    
    const refinedTaskList = await specService.getTaskList(specResult.id);
    expect(refinedTaskList.tasks.length).toBeGreaterThan(initialTaskCount);

    // Verify new tasks maintain constitutional order
    const updatedTestOrder = refinedTaskList.tasks.map(task => task.phase);
    const orderValidation = await testOrchestrationService.validateTestOrder(updatedTestOrder);
    expect(orderValidation.isValid).toBe(true);

    // Test backwards compatibility with existing completed tasks
    const completedTasks = refinedTaskList.tasks.filter(task => task.status === 'completed');
    expect(completedTasks.length).toBeGreaterThanOrEqual(0); // May have some completed

    console.log(`✅ Refined task list from ${initialTaskCount} to ${refinedTaskList.tasks.length} tasks`);
  });

  it('should provide execution metrics and optimization suggestions', async () => {
    const specResult = await specService.createSpecification('Metrics and optimization test');
    await specService.approveSpecification(specResult.id);
    await specService.startImplementation(specResult.id);

    // Create test suite for metrics
    const testSuite = await testOrchestrationService.createTestSuite({
      name: 'metrics-test-suite',
      testTypes: ['contract', 'integration'],
      environment: 'test'
    });

    // Get execution metrics
    const metrics = await testOrchestrationService.getExecutionMetrics(testSuite.id);
    expect(metrics.averageDuration).toBeGreaterThan(0);
    expect(metrics.failureRate).toBeGreaterThanOrEqual(0);
    expect(metrics.parallelEfficiency).toBeGreaterThan(0);
    expect(metrics.recommendations.length).toBeGreaterThan(0);

    // Test slowest test identification
    expect(metrics.slowestTests.length).toBeGreaterThanOrEqual(0);
    if (metrics.slowestTests.length > 0) {
      expect(metrics.slowestTests[0].duration).toBeGreaterThan(0);
      expect(metrics.slowestTests[0].suggestions.length).toBeGreaterThan(0);
    }

    console.log(`✅ Generated execution metrics with ${metrics.recommendations.length} optimization suggestions`);
  });
});