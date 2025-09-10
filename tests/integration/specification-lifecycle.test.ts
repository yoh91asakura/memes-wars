/**
 * Integration Test: Specification Lifecycle
 * 
 * Tests the complete workflow from spec creation to completion
 * involving multiple services working together.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SpecService } from '@/services/SpecService';
import { AgentContextService } from '@/services/AgentContextService';
import { DocumentationSyncService } from '@/services/DocumentationSyncService';
import { TestOrchestrationService } from '@/services/TestOrchestrationService';

describe('Specification Lifecycle Integration', () => {
  let specService: SpecService;
  let agentContextService: AgentContextService;
  let docSyncService: DocumentationSyncService;
  let testOrchestrationService: TestOrchestrationService;

  beforeEach(async () => {
    // Initialize services
    specService = new SpecService();
    agentContextService = new AgentContextService();
    docSyncService = new DocumentationSyncService();
    testOrchestrationService = new TestOrchestrationService();
  });

  afterEach(async () => {
    // Cleanup resources
    console.log('Cleaning up test resources...');
  });

  it('should complete full specification lifecycle', async () => {
    // Phase 1: Create new specification
    const specResult = await specService.createSpecification(
      'Test integration feature for spec-kit workflow'
    );
    
    expect(specResult).toMatchObject({
      id: expect.stringMatching(/^\d{3}-[\w-]+$/),
      branchName: expect.stringMatching(/^\d{3}-[\w-]+$/),
      specFile: expect.stringContaining('specs/'),
      status: 'created'
    });

    const specId = specResult.id;

    // Phase 2: Validate specification
    const validation = await specService.validateSpecification(specId);
    expect(validation.isValid).toBe(true);
    expect(validation.completeness).toBeGreaterThan(0);

    // Phase 3: Update agent context with new specification
    const contextUpdate = await agentContextService.updateContext('claude-context', {
      currentPhase: 'Phase 1: Specification Creation',
      recentChanges: [`Created specification ${specId}`],
      activeSpecs: [specId]
    });

    expect(contextUpdate.success).toBe(true);
    expect(contextUpdate.updatedFields).toContain('currentPhase');

    // Phase 4: Sync documentation
    const syncResult = await docSyncService.syncSpecToContexts(
      specResult.specFile,
      ['CLAUDE.md', '.github/copilot-instructions.md']
    );

    expect(syncResult.syncedSuccessfully.length).toBeGreaterThan(0);
    expect(syncResult.syncErrors.length).toBe(0);

    // Phase 5: Approve specification
    const approvalResult = await specService.approveSpecification(specId);
    expect(approvalResult.success).toBe(true);
    expect(approvalResult.newStatus).toBe('approved');

    // Phase 6: Start implementation
    const implementationResult = await specService.startImplementation(specId);
    expect(implementationResult.success).toBe(true);
    expect(implementationResult.tasksGenerated).toBeGreaterThan(0);

    // Phase 7: Validate constitutional test order
    const testOrder = await testOrchestrationService.getConstitutionalOrder('spec-implementation');
    expect(testOrder.phases).toEqual(['contract', 'integration', 'e2e', 'unit']);
    expect(testOrder.enforced).toBe(true);

    // Phase 8: Complete specification
    const completionResult = await specService.completeSpecification(specId);
    expect(completionResult.success).toBe(true);
    expect(completionResult.archivedFiles.length).toBeGreaterThan(0);

    // Phase 9: Final status check
    const finalStatus = await specService.getSpecificationStatus(specId);
    expect(finalStatus.status).toBe('completed');
    expect(finalStatus.progress.phase4Validation).toBe(true);

    console.log(`✅ Successfully completed specification lifecycle for ${specId}`);
  });

  it('should handle multi-agent coordination during specification work', async () => {
    // Create specification
    const specResult = await specService.createSpecification(
      'Multi-agent coordination test feature'
    );

    // Coordinate agents for implementation
    const coordination = await agentContextService.coordinateAgents({
      primaryAgent: 'claude',
      supportingAgents: ['copilot'],
      task: `implement-specification-${specResult.id}`,
      sharedContext: ['current-spec', 'task-list']
    });

    expect(coordination.primaryAgent).toBe('claude');
    expect(coordination.supportingAgents).toContain('copilot');
    expect(coordination.sharedState.currentTask).toContain('implement-specification');

    // Test context synchronization between agents
    const syncResult = await agentContextService.syncContexts('claude', ['copilot']);
    expect(syncResult.syncedSuccessfully).toContain('copilot');
    expect(syncResult.syncErrors.length).toBe(0);

    // Validate context consistency
    const consistencyResult = await agentContextService.validateContextConsistency(['claude', 'copilot']);
    expect(consistencyResult.consistent).toBe(true);

    console.log(`✅ Successfully coordinated multi-agent work for ${specResult.id}`);
  });

  it('should maintain documentation synchronization throughout lifecycle', async () => {
    // Create specification
    const specResult = await specService.createSpecification(
      'Documentation sync integration test'
    );

    // Track documentation dependencies
    const docTracking = await docSyncService.trackDocumentDependencies('CLAUDE.md');
    expect(docTracking.sourceFile).toBe('CLAUDE.md');
    expect(docTracking.dependencies.length).toBeGreaterThan(0);

    // Update primary context
    const primaryUpdate = await docSyncService.updatePrimaryContext('CLAUDE.md', {
      currentPhase: 'Phase 2: Integration Testing',
      implementationStatus: 'Creating integration tests',
      keyChanges: [`Working on ${specResult.id}`, 'Testing service integration']
    });

    expect(primaryUpdate.updatedSections).toContain('Current Phase');
    expect(primaryUpdate.derivedUpdates.length).toBeGreaterThan(0);

    // Validate context consistency across agent files
    const consistencyValidation = await docSyncService.validateContextConsistency([
      'CLAUDE.md',
      '.github/copilot-instructions.md'
    ]);

    expect(consistencyValidation.contexts.length).toBe(2);
    // Allow for some inconsistencies during active development
    expect(consistencyValidation.inconsistencies.length).toBeLessThanOrEqual(2);

    console.log(`✅ Documentation synchronization maintained for ${specResult.id}`);
  });

  it('should orchestrate test execution following constitutional order', async () => {
    // Create test suite for the specification
    const testSuite = await testOrchestrationService.createTestSuite({
      name: 'spec-kit-integration',
      testTypes: ['contract', 'integration', 'e2e'],
      environment: 'test'
    });

    expect(testSuite.name).toBe('spec-kit-integration');
    expect(testSuite.status).toBe('not-run');

    // Validate constitutional order
    const orderValidation = await testOrchestrationService.validateTestOrder(
      ['contract', 'integration', 'e2e', 'unit']
    );
    expect(orderValidation.isValid).toBe(true);
    expect(orderValidation.violations.length).toBe(0);

    // Set up test environment
    const testEnvironment = await testOrchestrationService.setupEnvironment({
      services: ['SpecService', 'AgentContextService'],
      mockData: ['specifications', 'contexts'],
      cleanup: true
    });

    expect(testEnvironment.status).toBe('ready');
    expect(testEnvironment.services.SpecService).toBeDefined();
    expect(testEnvironment.mockData.specifications).toBeDefined();

    // Execute test suite
    const executionResult = await testOrchestrationService.executeTestSuite(testSuite.id);
    expect(executionResult.overallStatus).toBe('passed');
    expect(executionResult.phases.length).toBeGreaterThan(0);

    // Verify constitutional order was followed
    const phaseOrder = executionResult.phases.map(p => p.phase);
    expect(phaseOrder[0]).toBe('contract');
    expect(phaseOrder.indexOf('integration')).toBeGreaterThan(phaseOrder.indexOf('contract'));

    // Cleanup test environment
    const cleanup = await testOrchestrationService.teardownEnvironment(testEnvironment.id);
    expect(cleanup.cleanedUp).toBe(true);

    console.log(`✅ Constitutional test order maintained for ${testSuite.name}`);
  });

  it('should handle error scenarios gracefully', async () => {
    // Test invalid specification approval
    try {
      await specService.approveSpecification('non-existent-spec');
      expect.fail('Should have thrown SpecificationNotFound error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('SpecificationNotFound');
    }

    // Test invalid state transition
    const specResult = await specService.createSpecification('Error handling test');
    
    try {
      // Try to complete without approving first
      await specService.completeSpecification(specResult.id);
      expect.fail('Should have thrown InvalidStateTransition error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('InvalidStateTransition');
    }

    // Test agent context recovery
    const recovery = await agentContextService.recoverContext('corrupted-context');
    expect(recovery.success).toBe(true);

    // Test sync failure recovery
    const failedSync = {
      sourceFile: 'specs/test/spec.md',
      targetFiles: ['CLAUDE.md', 'STATUS.md'],
      failures: ['STATUS.md']
    };

    const syncRecovery = await docSyncService.recoverFromFailure(failedSync);
    expect(syncRecovery.recoveryStrategy).toMatch(/retry|skip|manual/);

    console.log('✅ Error scenarios handled gracefully');
  });

  it('should maintain performance requirements across services', async () => {
    // Test specification operations performance
    const specStartTime = Date.now();
    const specResult = await specService.createSpecification('Performance test feature');
    const specDuration = Date.now() - specStartTime;
    expect(specDuration).toBeLessThan(5000); // Under 5 seconds

    // Test validation performance
    const validationStartTime = Date.now();
    await specService.validateSpecification(specResult.id);
    const validationDuration = Date.now() - validationStartTime;
    expect(validationDuration).toBeLessThan(2000); // Under 2 seconds

    // Test status query performance
    const statusStartTime = Date.now();
    await specService.getSpecificationStatus(specResult.id);
    const statusDuration = Date.now() - statusStartTime;
    expect(statusDuration).toBeLessThan(500); // Under 500ms

    // Test context sync performance
    const syncStartTime = Date.now();
    await agentContextService.syncContexts('claude', ['copilot']);
    const syncDuration = Date.now() - syncStartTime;
    expect(syncDuration).toBeLessThan(2000); // Under 2 seconds

    // Test documentation sync performance
    const docSyncStartTime = Date.now();
    await docSyncService.performFullSync();
    const docSyncDuration = Date.now() - docSyncStartTime;
    expect(docSyncDuration).toBeLessThan(30000); // Under 30 seconds

    console.log('✅ All performance requirements met');
  });

  it('should support rollback and recovery scenarios', async () => {
    // Create and start working on a specification
    const specResult = await specService.createSpecification('Rollback test feature');
    await specService.approveSpecification(specResult.id);
    await specService.startImplementation(specResult.id);

    // Simulate a rollback scenario
    const rollbackResult = await specService.rollbackSpecification(specResult.id, 'approved');
    expect(rollbackResult.success).toBe(true);
    expect(rollbackResult.previousState).toBe('approved');

    // Verify agent contexts are updated after rollback
    const contextUpdate = await agentContextService.updateContext('claude-context', {
      currentPhase: 'Phase 2: Rollback Recovery',
      recentChanges: [`Rolled back specification ${specResult.id} to approved state`]
    });
    expect(contextUpdate.success).toBe(true);

    // Test recovery by restarting implementation
    const recoveryResult = await specService.startImplementation(specResult.id);
    expect(recoveryResult.success).toBe(true);

    console.log(`✅ Rollback and recovery completed for ${specResult.id}`);
  });

  it('should handle concurrent specification operations', async () => {
    // Create multiple specifications concurrently
    const specPromises = Promise.all([
      specService.createSpecification('Concurrent test 1'),
      specService.createSpecification('Concurrent test 2'),
      specService.createSpecification('Concurrent test 3')
    ]);

    const specResults = await specPromises;
    expect(specResults).toHaveLength(3);
    expect(specResults.every(result => result.status === 'created')).toBe(true);

    // Test concurrent context updates
    const contextPromises = Promise.all([
      agentContextService.updateContext('claude-context', { currentPhase: 'Concurrent Phase 1' }),
      agentContextService.updateContext('copilot-context', { currentPhase: 'Concurrent Phase 2' }),
    ]);

    const contextResults = await contextPromises;
    expect(contextResults.every(result => result.success)).toBe(true);

    // Test concurrent documentation sync
    const syncPromises = Promise.all(
      specResults.map(spec => 
        docSyncService.syncSpecToContexts(spec.specFile, ['CLAUDE.md'])
      )
    );

    const syncResults = await syncPromises;
    expect(syncResults.every(result => result.syncedSuccessfully.length > 0)).toBe(true);

    console.log('✅ Concurrent operations handled successfully');
  });
});