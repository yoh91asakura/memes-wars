/**
 * Integration Test: Documentation Synchronization
 * 
 * Tests the automated synchronization of documentation across multiple files
 * involving DocumentationSyncService and its integration with other services.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DocumentationSyncService } from '@/services/DocumentationSyncService';
import { AgentContextService } from '@/services/AgentContextService';

describe('Documentation Sync Integration', () => {
  let documentationSyncService: DocumentationSyncService;
  let agentContextService: AgentContextService;
  let testFiles: string[] = [];

  beforeEach(async () => {
    documentationSyncService = new DocumentationSyncService();
    agentContextService = new AgentContextService();
    testFiles = [];
  });

  afterEach(async () => {
    // Cleanup test files
    testFiles.forEach(file => {
      console.log(`Cleaning up test file: ${file}`);
    });
  });

  it('should synchronize specification changes to agent contexts', async () => {
    const sourceSpec = 'specs/004-refactor-all-the/spec.md';
    const targetContexts = ['CLAUDE.md', '.github/copilot-instructions.md'];

    // Test specification to context synchronization
    const syncResult = await documentationSyncService.syncSpecToContexts(sourceSpec, targetContexts);
    
    expect(syncResult.sourceFile).toBe(sourceSpec);
    expect(syncResult.targetFiles).toEqual(targetContexts);
    expect(syncResult.syncedSuccessfully.length).toBeGreaterThan(0);
    expect(syncResult.syncErrors.length).toBe(0);
    expect(syncResult.backupCreated).toBe(true);
    expect(syncResult.duration).toBeGreaterThan(0);

    // Verify changes were applied
    expect(syncResult.changesApplied.length).toBeGreaterThan(0);
    expect(syncResult.changesApplied[0].changeType).toBe('modified');

    console.log(`✅ Synchronized ${sourceSpec} to ${syncResult.syncedSuccessfully.length} target contexts`);
  });

  it('should track and manage documentation dependencies', async () => {
    const documentFile = 'CLAUDE.md';
    
    // Track documentation dependencies
    const tracking = await documentationSyncService.trackDocumentDependencies(documentFile);
    
    expect(tracking.sourceFile).toBe(documentFile);
    expect(tracking.targetFiles.length).toBeGreaterThan(0);
    expect(tracking.syncStatus).toMatch(/in-sync|out-of-sync|pending/);
    expect(tracking.dependencies.length).toBeGreaterThan(0);
    expect(tracking.automaticSync).toBe(true);

    // Verify dependency relationships
    const specDependency = tracking.dependencies.find(dep => 
      dep.file.includes('spec.md')
    );
    expect(specDependency).toBeDefined();
    expect(specDependency?.relationship).toBe('derives-from');
    expect(specDependency?.sections.length).toBeGreaterThan(0);

    // Test update trigger configuration
    expect(tracking.updateTriggers.length).toBeGreaterThan(0);
    const fileModifiedTrigger = tracking.updateTriggers.find(trigger => 
      trigger.type === 'file-modified'
    );
    expect(fileModifiedTrigger?.enabled).toBe(true);

    console.log(`✅ Tracked dependencies for ${documentFile}: ${tracking.dependencies.length} deps, ${tracking.updateTriggers.length} triggers`);
  });

  it('should handle different sync strategies appropriately', async () => {
    const testCases = [
      {
        strategy: 'transform',
        sourceFile: 'CLAUDE.md',
        targetFile: '.github/copilot-instructions.md',
        expectedPrefix: 'GitHub Copilot'
      },
      {
        strategy: 'summary',
        sourceFile: 'CLAUDE.md',
        targetFile: 'STATUS.md',
        expectedContent: 'Project Status'
      },
      {
        strategy: 'merge',
        sourceFile: 'CLAUDE.md',
        targetFile: 'README.md',
        expectedSection: 'Development Status'
      }
    ];

    for (const testCase of testCases) {
      // Test sync with specific strategy
      const syncResult = await documentationSyncService.syncSpecToContexts(
        testCase.sourceFile,
        [testCase.targetFile]
      );

      expect(syncResult.syncedSuccessfully).toContain(testCase.targetFile);
      expect(syncResult.changesApplied.length).toBeGreaterThan(0);

      // Verify strategy-specific transformations
      const change = syncResult.changesApplied.find(change => 
        change.file === testCase.targetFile
      );
      expect(change).toBeDefined();
      
      if (testCase.expectedPrefix) {
        expect(change?.newContent).toContain(testCase.expectedPrefix);
      }
      if (testCase.expectedContent) {
        expect(change?.newContent).toContain(testCase.expectedContent);
      }
      if (testCase.expectedSection) {
        expect(change?.section).toContain(testCase.expectedSection);
      }
    }

    console.log(`✅ Validated ${testCases.length} different sync strategies`);
  });

  it('should detect and resolve documentation conflicts', async () => {
    const conflictingFiles = ['CLAUDE.md', '.github/copilot-instructions.md'];

    // Test conflict detection
    const conflictResolution = await documentationSyncService.resolveConflicts(conflictingFiles);
    
    expect(conflictResolution.files).toEqual(conflictingFiles);
    expect(conflictResolution.conflicts.length).toBeGreaterThanOrEqual(0);
    expect(conflictResolution.resolvedConflicts.length).toBe(conflictResolution.conflicts.length);

    // Test specific conflict scenarios
    if (conflictResolution.conflicts.length > 0) {
      const conflict = conflictResolution.conflicts[0];
      expect(conflict.resolutionStrategy).toMatch(/merge|override|manual/);
      expect(conflict.file1Content.length).toBeGreaterThan(0);
      expect(conflict.file2Content.length).toBeGreaterThan(0);
    }

    // Verify manual intervention requirements
    expect(conflictResolution.manualInterventionRequired.length).toBeGreaterThanOrEqual(0);

    console.log(`✅ Processed ${conflictResolution.conflicts.length} conflicts, resolved ${conflictResolution.resolvedConflicts.length}`);
  });

  it('should maintain primary context and propagate updates', async () => {
    const primaryFile = 'CLAUDE.md';
    const updates = {
      currentPhase: 'Phase 5: Integration Testing Complete',
      implementationStatus: 'Documentation sync integration tests passing',
      keyChanges: [
        'Completed documentation sync integration tests',
        'Validated cross-file synchronization',
        'Tested conflict resolution strategies'
      ]
    };

    // Update primary context
    const updateResult = await documentationSyncService.updatePrimaryContext(primaryFile, updates);
    
    expect(updateResult.primaryFile).toBe(primaryFile);
    expect(updateResult.updatedSections).toContain('Current Phase');
    expect(updateResult.derivedUpdates.length).toBeGreaterThan(0);
    expect(updateResult.tokenCountOptimized).toBe(true);

    // Verify derived updates were applied
    const derivedUpdate = updateResult.derivedUpdates[0];
    expect(derivedUpdate.file.length).toBeGreaterThan(0);
    expect(derivedUpdate.sectionsUpdated.length).toBeGreaterThan(0);

    console.log(`✅ Updated primary context with ${updateResult.updatedSections.length} sections, propagated to ${updateResult.derivedUpdates.length} derived files`);
  });

  it('should synchronize secondary contexts with appropriate transformations', async () => {
    const primaryContext = 'CLAUDE.md';
    const secondaryContexts = ['.github/copilot-instructions.md', 'STATUS.md'];

    // Test secondary context synchronization
    const syncResult = await documentationSyncService.syncSecondaryContexts(
      primaryContext,
      secondaryContexts
    );

    expect(syncResult.primary).toBe(primaryContext);
    expect(syncResult.secondary).toEqual(secondaryContexts);
    expect(syncResult.syncStrategy).toMatch(/full|incremental|selective/);
    expect(Object.keys(syncResult.syncedContent).length).toBeGreaterThan(0);
    expect(syncResult.inconsistenciesResolved).toBeGreaterThanOrEqual(0);

    // Verify content transformations are appropriate for each target
    Object.entries(syncResult.syncedContent).forEach(([file, content]) => {
      expect(content).toBeDefined();
      expect(typeof content).toBe('string');
      
      if (file.includes('copilot')) {
        expect(content).toContain('GitHub Copilot');
      }
      if (file.includes('STATUS')) {
        expect(content).toContain('Status');
      }
    });

    console.log(`✅ Synchronized ${secondaryContexts.length} secondary contexts using ${syncResult.syncStrategy} strategy`);
  });

  it('should validate context consistency across agent files', async () => {
    const agentContexts = [
      'CLAUDE.md',
      '.github/copilot-instructions.md'
    ];

    // Test context consistency validation
    const consistencyResult = await documentationSyncService.validateContextConsistency(agentContexts);
    
    expect(consistencyResult.contexts).toEqual(agentContexts);
    expect(typeof consistencyResult.consistent).toBe('boolean');
    expect(consistencyResult.lastValidation).toBeInstanceOf(Date);

    // Analyze inconsistencies if present
    if (!consistencyResult.consistent) {
      expect(consistencyResult.inconsistencies.length).toBeGreaterThan(0);
      
      const inconsistency = consistencyResult.inconsistencies[0];
      expect(inconsistency.section).toBeDefined();
      expect(inconsistency.conflictingValues).toBeDefined();
      expect(inconsistency.recommendedResolution).toBeDefined();
    }

    console.log(`✅ Validated consistency across ${agentContexts.length} contexts: ${consistencyResult.consistent ? 'consistent' : `${consistencyResult.inconsistencies.length} inconsistencies found`}`);
  });

  it('should generate and update status documentation automatically', async () => {
    const progressData = {
      currentPhase: 'Phase 5: Integration Testing - Documentation Sync',
      completedTasks: [
        'T023: Enhanced specification lifecycle test',
        'T024: Enhanced task generation workflow test',
        'T025: Created agent context sync integration test'
      ],
      activeTasks: [
        'T026: Creating documentation sync integration test',
        'T027: Cross-platform scripts integration test'
      ],
      nextMilestone: 'Complete Phase 5 integration tests'
    };

    // Test automatic status document updates
    const statusUpdate = await documentationSyncService.updateStatusDocument(progressData);
    
    expect(statusUpdate.file).toBe('STATUS.md');
    expect(statusUpdate.sectionsUpdated.length).toBeGreaterThan(0);
    expect(statusUpdate.progressPercentage).toBeGreaterThan(0);
    expect(statusUpdate.progressPercentage).toBeLessThanOrEqual(100);
    expect(statusUpdate.estimatedCompletion).toBeInstanceOf(Date);
    expect(statusUpdate.automated).toBe(true);

    // Verify expected sections were updated
    expect(statusUpdate.sectionsUpdated).toContain('Current Phase');
    expect(statusUpdate.sectionsUpdated).toContain('Progress');
    expect(statusUpdate.sectionsUpdated).toContain('Completed Tasks');

    console.log(`✅ Updated STATUS.md: ${statusUpdate.progressPercentage}% complete, ${statusUpdate.sectionsUpdated.length} sections updated`);
  });

  it('should handle workflow documentation updates', async () => {
    const workflowUpdates = {
      newCommands: [
        'npm run test:integration:docs',
        'npm run sync:documentation --auto',
        'npm run validate:context-consistency'
      ],
      modifiedScripts: [
        'scripts/sync-documentation.sh',
        'scripts/update-agent-context.sh'
      ],
      deprecatedCommands: [
        'npm run old-doc-sync'
      ]
    };

    // Test workflow documentation updates
    const workflowResult = await documentationSyncService.updateWorkflowDocumentation(workflowUpdates);
    
    expect(workflowResult.file).toBe('README.md');
    expect(workflowResult.sectionsModified).toContain('Development Commands');
    expect(workflowResult.addedCommands).toEqual(workflowUpdates.newCommands);
    expect(workflowResult.removedCommands).toEqual(workflowUpdates.deprecatedCommands);
    expect(workflowResult.lastUpdated).toBeInstanceOf(Date);

    console.log(`✅ Updated workflow documentation: added ${workflowResult.addedCommands.length} commands, removed ${workflowResult.removedCommands.length} deprecated commands`);
  });

  it('should create sync commits with proper attribution', async () => {
    const syncChanges = {
      files: ['CLAUDE.md', '.github/copilot-instructions.md', 'STATUS.md'],
      changeType: 'integration-test-updates',
      trigger: 'automated-documentation-sync'
    };

    // Test sync commit creation
    const commitResult = await documentationSyncService.createSyncCommit(syncChanges);
    
    expect(commitResult.commitHash).toMatch(/^[a-f0-9]+$/);
    expect(commitResult.message).toContain('docs: sync documentation');
    expect(commitResult.message).toContain(syncChanges.changeType);
    expect(commitResult.files).toEqual(syncChanges.files);
    expect(commitResult.automated).toBe(true);
    expect(commitResult.attribution).toContain('Claude Code');

    console.log(`✅ Created sync commit ${commitResult.commitHash}: "${commitResult.message}"`);
  });

  it('should handle merge conflicts in documentation sync', async () => {
    const conflictScenario = {
      branch: 'feature/documentation-improvements',
      baseBranch: 'main',
      conflictingFiles: ['CLAUDE.md', 'STATUS.md']
    };

    // Test merge conflict resolution
    const mergeResult = await documentationSyncService.resolveMergeConflicts(conflictScenario);
    
    expect(mergeResult.strategy).toMatch(/auto-merge|manual-intervention|preserve-branch/);
    expect(mergeResult.resolvedFiles).toEqual(conflictScenario.conflictingFiles);
    expect(mergeResult.conflicts.length).toBeGreaterThanOrEqual(0);
    expect(typeof mergeResult.success).toBe('boolean');

    // For successful auto-merges
    if (mergeResult.success && mergeResult.strategy === 'auto-merge') {
      expect(mergeResult.resolvedFiles.length).toBe(conflictScenario.conflictingFiles.length);
    }

    console.log(`✅ Resolved merge conflicts using ${mergeResult.strategy} strategy: ${mergeResult.success ? 'successful' : 'requires manual intervention'}`);
  });

  it('should maintain performance during large-scale synchronization', async () => {
    // Test performance with multiple files and complex operations
    const largeScaleFiles = [
      'CLAUDE.md',
      '.github/copilot-instructions.md',
      'STATUS.md',
      'README.md',
      'docs/development-phases.md'
    ];

    // Test full synchronization performance
    const fullSyncStart = Date.now();
    await documentationSyncService.performFullSync();
    const fullSyncDuration = Date.now() - fullSyncStart;
    expect(fullSyncDuration).toBeLessThan(30000); // Under 30 seconds

    // Test sync metrics collection
    const metricsResult = await documentationSyncService.getSyncMetrics({
      from: new Date(Date.now() - 3600000), // Last hour
      to: new Date()
    });

    expect(metricsResult.totalSyncs).toBeGreaterThanOrEqual(0);
    expect(metricsResult.averageDuration).toBeGreaterThanOrEqual(0);
    expect(metricsResult.conflictRate).toBeGreaterThanOrEqual(0);
    expect(metricsResult.successRate).toBeGreaterThanOrEqual(0);
    expect(metricsResult.optimizationSuggestions.length).toBeGreaterThan(0);

    // Test sync status monitoring
    const statusResult = await documentationSyncService.getSyncStatus();
    expect(statusResult.lastSync).toBeInstanceOf(Date);
    expect(typeof statusResult.currentlyRunning).toBe('boolean');
    expect(statusResult.queuedSyncs).toBeGreaterThanOrEqual(0);
    expect(statusResult.failedSyncs.length).toBeGreaterThanOrEqual(0);

    console.log(`✅ Performance validated: full sync ${fullSyncDuration}ms, ${metricsResult.totalSyncs} operations, ${(metricsResult.successRate * 100).toFixed(1)}% success rate`);
  });

  it('should integrate with agent context service for coordinated updates', async () => {
    // Create agent context for coordination
    await agentContextService.createContext(
      'claude',
      'Documentation sync coordination test'
    );

    // Update agent context with documentation-related changes
    const contextUpdate = await agentContextService.updateContext('claude-context', {
      currentPhase: 'Documentation Sync Integration',
      recentChanges: ['Testing documentation sync integration', 'Validating cross-service coordination']
    });

    expect(contextUpdate.success).toBe(true);

    // Test coordinated sync between services
    const primaryUpdate = await documentationSyncService.updatePrimaryContext('CLAUDE.md', {
      currentPhase: 'Documentation Sync Integration',
      implementationStatus: 'Testing coordinated service integration'
    });

    expect(primaryUpdate.primaryFile).toBe('CLAUDE.md');
    expect(primaryUpdate.updatedSections.length).toBeGreaterThan(0);

    // Verify agent context reflects documentation changes
    const contextSummary = await agentContextService.generateContextSummary('claude');
    expect(contextSummary).toContain('Documentation Sync Integration');

    // Test context consistency between services
    const consistencyResult = await documentationSyncService.validateContextConsistency([
      'CLAUDE.md'
    ]);

    expect(consistencyResult.consistent).toBe(true);

    console.log('✅ Successfully coordinated documentation sync with agent context service');
  });
});