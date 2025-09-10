/**
 * Integration Test: Agent Context Synchronization
 * 
 * Tests the coordination and synchronization of contexts across multiple AI agents
 * involving AgentContextService and DocumentationSyncService.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentContextService } from '@/services/AgentContextService';
import { DocumentationSyncService } from '@/services/DocumentationSyncService';
import type { AgentType } from '@/models/AgentContext';

describe('Agent Context Sync Integration', () => {
  let agentContextService: AgentContextService;
  let documentationSyncService: DocumentationSyncService;

  beforeEach(async () => {
    agentContextService = new AgentContextService();
    documentationSyncService = new DocumentationSyncService();
  });

  afterEach(async () => {
    // Cleanup any created contexts
    console.log('Cleaning up agent contexts...');
  });

  it('should synchronize contexts across multiple agents', async () => {
    // Create contexts for different agent types
    const claudeContext = await agentContextService.createContext(
      'claude', 
      'Memes Wars - Testing agent context synchronization'
    );
    
    const copilotContext = await agentContextService.createContext(
      'copilot',
      'Memes Wars - GitHub Copilot integration testing'
    );

    expect(claudeContext.agentType).toBe('claude');
    expect(copilotContext.agentType).toBe('copilot');
    expect(claudeContext.tokenCount).toBeGreaterThan(0);
    expect(copilotContext.tokenCount).toBeGreaterThan(0);

    // Update primary context with project changes
    const contextUpdate = await agentContextService.updateContext('claude-context', {
      currentPhase: 'Phase 5: Integration Testing',
      recentChanges: [
        'Added agent context sync integration tests',
        'Enhanced multi-agent coordination',
        'Improved context token optimization'
      ],
      activeSpecs: ['004-refactor-all-the']
    });

    expect(contextUpdate.success).toBe(true);
    expect(contextUpdate.updatedFields).toContain('currentPhase');
    expect(contextUpdate.tokenCount).toBeGreaterThan(0);

    // Synchronize contexts from primary to supporting agents
    const syncResult = await agentContextService.syncContexts('claude', ['copilot']);
    
    expect(syncResult.sourceAgent).toBe('claude');
    expect(syncResult.syncedSuccessfully).toContain('copilot');
    expect(syncResult.syncErrors.length).toBe(0);
    expect(syncResult.syncDuration).toBeGreaterThan(0);

    // Validate context consistency
    const consistencyCheck = await agentContextService.validateContextConsistency(['claude', 'copilot']);
    expect(consistencyCheck.consistent).toBe(true);
    expect(consistencyCheck.inconsistencies.length).toBe(0);

    console.log(`✅ Synchronized contexts across ${syncResult.targetAgents.length + 1} agents`);
  });

  it('should handle context conflicts and resolution strategies', async () => {
    // Create contexts with intentionally conflicting updates
    await agentContextService.createContext('claude', 'Conflict resolution test');
    await agentContextService.createContext('copilot', 'Conflict resolution test');

    // Update contexts with conflicting information
    await agentContextService.updateContext('claude-context', {
      currentPhase: 'Phase A: Claude Version',
      recentChanges: ['Claude-specific change 1', 'Claude-specific change 2']
    });

    await agentContextService.updateContext('copilot-context', {
      currentPhase: 'Phase B: Copilot Version', 
      recentChanges: ['Copilot-specific change 1', 'Copilot-specific change 2']
    });

    // Test conflict resolution
    const conflictingUpdates = [
      { agent: 'claude' as AgentType, field: 'currentPhase', value: 'Phase A: Claude Version' },
      { agent: 'copilot' as AgentType, field: 'currentPhase', value: 'Phase B: Copilot Version' }
    ];

    const resolution = await agentContextService.resolveConflicts(conflictingUpdates);
    
    expect(resolution.strategy).toMatch(/merge|priority|manual/);
    expect(resolution.winningAgent).toMatch(/claude|copilot/);
    expect(resolution.reasoning).toContain('agent');

    // Verify resolution is applied
    if (resolution.strategy === 'priority') {
      expect(resolution.winningAgent).toBe('claude'); // Primary agent should win
    }

    console.log(`✅ Resolved conflicts using ${resolution.strategy} strategy`);
  });

  it('should optimize contexts for token limits', async () => {
    // Create context with potentially large content
    const largeContext = await agentContextService.createContext(
      'claude',
      'Large project with extensive documentation, multiple services, complex architecture, detailed specifications, comprehensive testing strategies, and extensive integration requirements'
    );

    // Add substantial content that might exceed token limits
    await agentContextService.updateContext('claude-context', {
      currentPhase: 'Phase 5: Comprehensive Integration Testing with Multiple Services and Complex Workflows',
      recentChanges: [
        'Implemented comprehensive agent context synchronization system',
        'Added multi-agent coordination with conflict resolution strategies',
        'Enhanced documentation sync with automated token optimization',
        'Created extensive integration test suite covering all service interactions',
        'Added performance monitoring and metrics collection',
        'Implemented cross-platform compatibility with Windows and Unix systems'
      ],
      activeSpecs: ['001-extract-current-project', '004-refactor-all-the', 'future-spec-planning']
    });

    // Test token optimization
    const optimizationResult = await agentContextService.optimizeForTokens('claude-context');
    
    expect(optimizationResult.originalTokens).toBeGreaterThan(0);
    expect(optimizationResult.optimizedTokens).toBeLessThanOrEqual(optimizationResult.originalTokens);
    expect(optimizationResult.compressionRatio).toBeGreaterThan(0);
    expect(optimizationResult.sectionsOptimized.length).toBeGreaterThan(0);

    // Verify optimized context is still functional
    const optimizedContext = await agentContextService.loadContext('claude-context');
    expect(optimizedContext.tokenCount).toBeLessThanOrEqual(8000); // Target limit
    expect(optimizedContext.projectSummary).toBeDefined();

    console.log(`✅ Optimized context from ${optimizationResult.originalTokens} to ${optimizationResult.optimizedTokens} tokens`);
  });

  it('should handle agent disconnection and reconnection gracefully', async () => {
    // Set up multi-agent environment
    await agentContextService.createContext('claude', 'Disconnection test');
    await agentContextService.createContext('copilot', 'Disconnection test');
    
    // Establish coordination
    const coordination = await agentContextService.coordinateAgents({
      primaryAgent: 'claude',
      supportingAgents: ['copilot'],
      task: 'integration-testing',
      sharedContext: ['current-phase', 'task-progress']
    });

    expect(coordination.primaryAgent).toBe('claude');
    expect(coordination.supportingAgents).toContain('copilot');

    // Simulate agent disconnection
    const disconnectionResult = await agentContextService.handleAgentDisconnection('copilot');
    
    expect(disconnectionResult.agent).toBe('copilot');
    expect(disconnectionResult.contextPreserved).toBe(true);
    expect(disconnectionResult.reconnectionProcedure).toContain('context');

    // Test context recovery after reconnection
    const recoveryResult = await agentContextService.recoverContext('copilot-context');
    expect(recoveryResult.success).toBe(true);

    // Verify context is functional after recovery
    const recoveredContext = await agentContextService.loadContext('copilot-context');
    expect(recoveredContext.agentType).toBe('copilot');
    expect(recoveredContext.projectSummary).toBeDefined();

    console.log('✅ Successfully handled agent disconnection and recovery');
  });

  it('should provide context-aware navigation and file suggestions', async () => {
    // Create context for navigation testing
    const context = await agentContextService.createContext(
      'claude',
      'Navigation and file location testing'
    );

    // Test location shortcuts for common operations
    const shortcuts = await agentContextService.createLocationShortcuts('implement-service');
    
    expect(shortcuts.operation).toBe('implement-service');
    expect(shortcuts.shortcuts.contractTest).toContain('tests/contract');
    expect(shortcuts.shortcuts.serviceImplementation).toContain('src/services');
    expect(shortcuts.templates.length).toBeGreaterThan(0);
    expect(shortcuts.relatedFiles.length).toBeGreaterThan(0);

    // Test navigation map generation
    const navigationMap = await agentContextService.generateNavigationMap({
      rootPath: '/project',
      components: ['src/', 'tests/', 'specs/', 'docs/'],
      depth: 3
    });

    expect(navigationMap.sections.length).toBeGreaterThan(0);
    expect(navigationMap.quickAccess).toBeDefined();
    expect(navigationMap.aiMarkers.length).toBeGreaterThan(0);

    console.log(`✅ Generated navigation shortcuts for ${Object.keys(shortcuts.shortcuts).length} locations`);
  });

  it('should integrate with documentation sync service', async () => {
    // Create agent context
    await agentContextService.createContext(
      'claude',
      'Documentation integration test'
    );

    // Update context with significant changes
    await agentContextService.updateContext('claude-context', {
      currentPhase: 'Phase 5: Documentation Integration',
      recentChanges: ['Integrated with documentation sync', 'Added agent coordination'],
      activeSpecs: ['004-refactor-all-the']
    });

    // Sync context changes to documentation
    const syncResult = await documentationSyncService.syncSpecToContexts(
      'specs/004-refactor-all-the/spec.md',
      ['CLAUDE.md', '.github/copilot-instructions.md']
    );

    expect(syncResult.syncedSuccessfully.length).toBeGreaterThan(0);
    expect(syncResult.syncErrors.length).toBe(0);

    // Test secondary context synchronization
    const secondarySync = await documentationSyncService.syncSecondaryContexts(
      'CLAUDE.md',
      ['.github/copilot-instructions.md']
    );

    expect(secondarySync.primary).toBe('CLAUDE.md');
    expect(secondarySync.secondary.length).toBeGreaterThan(0);
    expect(secondarySync.inconsistenciesResolved).toBeGreaterThanOrEqual(0);

    // Validate cross-agent context consistency
    const consistencyResult = await documentationSyncService.validateContextConsistency([
      'CLAUDE.md',
      '.github/copilot-instructions.md'
    ]);

    expect(consistencyResult.contexts.length).toBe(2);
    // Some inconsistencies are acceptable during development
    expect(consistencyResult.inconsistencies.length).toBeLessThanOrEqual(3);

    console.log(`✅ Integrated agent contexts with documentation sync (${syncResult.syncedSuccessfully.length} files)`);
  });

  it('should support command registration and context-aware suggestions', async () => {
    // Create context for command testing
    await agentContextService.createContext('claude', 'Command registration test');

    // Register agent-specific commands
    const commands = [
      {
        name: 'spec:validate',
        description: 'Validate current specification',
        usage: 'npm run spec:validate',
        agentType: 'claude' as AgentType,
        category: 'validation'
      },
      {
        name: 'context:sync',
        description: 'Synchronize agent contexts',
        usage: 'npm run context:sync',
        agentType: 'claude' as AgentType,
        category: 'coordination'
      }
    ];

    const registrationResult = await agentContextService.registerCommands(commands);
    
    expect(registrationResult.registered).toBe(2);
    expect(registrationResult.conflicts.length).toBe(0);

    // Test context-aware command suggestions
    const suggestions = await agentContextService.suggestCommands(
      'Phase 5: Integration Testing',
      'claude'
    );

    expect(suggestions.phase).toBe('Phase 5: Integration Testing');
    expect(suggestions.recommended.length).toBeGreaterThan(0);
    expect(suggestions.nextPhasePreparation.length).toBeGreaterThan(0);

    // Verify command priorities are appropriate for current phase
    const highPriorityCommands = suggestions.recommended.filter(cmd => cmd.priority === 'high');
    expect(highPriorityCommands.length).toBeGreaterThan(0);

    console.log(`✅ Registered ${registrationResult.registered} commands and generated ${suggestions.recommended.length} suggestions`);
  });

  it('should maintain performance requirements during synchronization', async () => {
    // Create multiple contexts for performance testing
    const agents: AgentType[] = ['claude', 'copilot'];
    
    for (const agent of agents) {
      await agentContextService.createContext(agent, `Performance test for ${agent}`);
    }

    // Measure context update performance
    const updateStartTime = Date.now();
    await agentContextService.updateContext('claude-context', {
      currentPhase: 'Performance Testing Phase',
      recentChanges: Array.from({ length: 10 }, (_, i) => `Performance change ${i + 1}`)
    });
    const updateDuration = Date.now() - updateStartTime;
    expect(updateDuration).toBeLessThan(1000); // Under 1 second

    // Measure sync performance
    const syncStartTime = Date.now();
    await agentContextService.syncContexts('claude', ['copilot']);
    const syncDuration = Date.now() - syncStartTime;
    expect(syncDuration).toBeLessThan(2000); // Under 2 seconds

    // Measure context summary generation performance
    const summaryStartTime = Date.now();
    const summary = await agentContextService.generateContextSummary('claude');
    const summaryDuration = Date.now() - summaryStartTime;
    expect(summaryDuration).toBeLessThan(500); // Under 500ms
    expect(summary.length).toBeGreaterThan(0);

    // Test consistency validation performance
    const consistencyStartTime = Date.now();
    await agentContextService.validateContextConsistency(agents);
    const consistencyDuration = Date.now() - consistencyStartTime;
    expect(consistencyDuration).toBeLessThan(1000); // Under 1 second

    console.log(`✅ All performance requirements met: update(${updateDuration}ms), sync(${syncDuration}ms), summary(${summaryDuration}ms), consistency(${consistencyDuration}ms)`);
  });
});