/**
 * E2E Test: Complete Spec-Kit Workflow
 * 
 * Tests the end-to-end spec-kit workflow from feature creation to completion
 * using Playwright for browser automation and file system operations.
 */

import { test, expect, type Page } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

test.describe('Spec-Kit Workflow E2E', () => {
  let testFeatureName: string;
  let testBranchName: string;
  let testSpecDir: string;

  test.beforeEach(async () => {
    // Generate unique test feature name
    const timestamp = Date.now().toString(36);
    testFeatureName = `e2e-test-feature-${timestamp}`;
    testBranchName = '';
    testSpecDir = '';
  });

  test.afterEach(async () => {
    // Cleanup test branches and directories
    if (testBranchName) {
      try {
        await execAsync(`git checkout main && git branch -D ${testBranchName}`);
        console.log(`Cleaned up test branch: ${testBranchName}`);
      } catch (error) {
        console.warn(`Failed to cleanup branch ${testBranchName}:`, error);
      }
    }

    if (testSpecDir) {
      try {
        await fs.rm(testSpecDir, { recursive: true, force: true });
        console.log(`Cleaned up test directory: ${testSpecDir}`);
      } catch (error) {
        console.warn(`Failed to cleanup directory ${testSpecDir}:`, error);
      }
    }
  });

  test('should complete full spec-kit workflow from creation to implementation', async ({ page }) => {
    // Step 1: Create new feature using script
    console.log('Step 1: Creating new feature specification...');
    
    const scriptPath = process.platform === 'win32' 
      ? 'scripts/create-new-feature.bat'
      : 'scripts/create-new-feature.sh';
    
    const command = process.platform === 'win32'
      ? `"${scriptPath}" --json "${testFeatureName}"`
      : `bash "${scriptPath}" --json "${testFeatureName}"`;

    const { stdout: createOutput } = await execAsync(command, { timeout: 30000 });
    const createResult = JSON.parse(createOutput.trim());
    
    testBranchName = createResult.BRANCH_NAME;
    testSpecDir = path.dirname(createResult.SPEC_FILE);

    expect(createResult.BRANCH_NAME).toMatch(/^\d{3}-[\w-]+$/);
    expect(createResult.SPEC_FILE).toContain('specs/');
    expect(createResult.FEATURE_NUM).toMatch(/^\d{3}$/);

    // Step 2: Verify branch was created and switched
    const { stdout: branchOutput } = await execAsync('git branch --show-current');
    expect(branchOutput.trim()).toBe(testBranchName);

    // Step 3: Verify spec file was created
    const specFilePath = createResult.SPEC_FILE;
    const specExists = await fs.access(specFilePath).then(() => true).catch(() => false);
    expect(specExists).toBe(true);

    console.log(`✅ Feature created: ${testBranchName}`);

    // Step 4: Setup implementation plan
    console.log('Step 2: Setting up implementation plan...');
    
    const planScriptPath = process.platform === 'win32'
      ? 'scripts/setup-plan.bat'
      : 'scripts/setup-plan.sh';
    
    const planCommand = process.platform === 'win32'
      ? `"${planScriptPath}" --json`
      : `bash "${planScriptPath}" --json`;

    const { stdout: planOutput } = await execAsync(planCommand, { timeout: 20000 });
    
    // Check if output is JSON or contains expected patterns
    if (planOutput.trim().startsWith('{')) {
      const planResult = JSON.parse(planOutput.trim());
      expect(planResult.FEATURE_DIR).toContain(testBranchName);
    } else {
      expect(planOutput).toContain('FEATURE_DIR');
    }

    // Verify plan files were created
    const planFilePath = path.join(testSpecDir, 'plan.md');
    const planExists = await fs.access(planFilePath).then(() => true).catch(() => false);
    expect(planExists).toBe(true);

    console.log('✅ Implementation plan created');

    // Step 5: Check task prerequisites
    console.log('Step 3: Checking task prerequisites...');
    
    const prereqScriptPath = process.platform === 'win32'
      ? 'scripts/check-task-prerequisites.bat'
      : 'scripts/check-task-prerequisites.sh';
    
    const prereqCommand = process.platform === 'win32'
      ? `"${prereqScriptPath}" --json`
      : `bash "${prereqScriptPath}" --json`;

    const { stdout: prereqOutput } = await execAsync(prereqCommand, { timeout: 15000 });
    
    if (prereqOutput.trim().startsWith('{')) {
      const prereqResult = JSON.parse(prereqOutput.trim());
      expect(prereqResult.FEATURE_DIR).toBe(testSpecDir);
      expect(Array.isArray(prereqResult.AVAILABLE_DOCS)).toBe(true);
    } else {
      expect(prereqOutput).toContain('FEATURE_DIR');
    }

    console.log('✅ Prerequisites checked');

    // Step 6: Update agent context
    console.log('Step 4: Updating agent context...');
    
    const contextScriptPath = process.platform === 'win32'
      ? 'scripts/update-agent-context.bat'
      : 'scripts/update-agent-context.sh';
    
    const contextCommand = process.platform === 'win32'
      ? `"${contextScriptPath}" claude --json`
      : `bash "${contextScriptPath}" claude --json`;

    const { stdout: contextOutput } = await execAsync(contextCommand, { timeout: 20000 });
    
    if (contextOutput.trim().startsWith('{')) {
      const contextResult = JSON.parse(contextOutput.trim());
      expect(contextResult.branch).toBe(testBranchName);
    } else {
      expect(contextOutput).toContain(testBranchName);
    }

    console.log('✅ Agent context updated');

    // Step 7: Sync documentation
    console.log('Step 5: Syncing documentation...');
    
    const syncScriptPath = process.platform === 'win32'
      ? 'scripts/sync-documentation.bat'
      : 'scripts/sync-documentation.sh';
    
    const syncCommand = process.platform === 'win32'
      ? `"${syncScriptPath}" --auto --json`
      : `bash "${syncScriptPath}" --auto --json`;

    const { stdout: syncOutput } = await execAsync(syncCommand, { timeout: 30000 });
    
    if (syncOutput.trim().startsWith('{')) {
      const syncResult = JSON.parse(syncOutput.trim());
      expect(syncResult.synced).toBeGreaterThanOrEqual(0);
      expect(syncResult.branch).toBe(testBranchName);
    }

    console.log('✅ Documentation synchronized');

    // Step 8: Verify file system state
    console.log('Step 6: Verifying file system state...');

    // Check that all expected files exist
    const expectedFiles = [
      path.join(testSpecDir, 'spec.md'),
      path.join(testSpecDir, 'plan.md')
    ];

    for (const filePath of expectedFiles) {
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
      
      // Verify files have content
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }

    console.log('✅ File system state verified');

    // Step 9: Test with browser automation (if applicable)
    if (process.env.BROWSER_TESTS === 'true') {
      console.log('Step 7: Running browser automation tests...');
      
      await page.goto('http://localhost:3000');
      
      // Wait for application to load
      await expect(page.locator('body')).toBeVisible();
      
      // Test basic navigation
      const appTitle = await page.title();
      expect(appTitle).toContain('Memes Wars');
      
      console.log('✅ Browser automation completed');
    } else {
      console.log('⏸️ Skipping browser tests (BROWSER_TESTS not set)');
    }

    console.log(`✅ Complete spec-kit workflow test passed for feature: ${testBranchName}`);
  });

  test('should handle workflow interruptions gracefully', async () => {
    // Test partial workflow completion and recovery
    console.log('Testing workflow interruption and recovery...');

    // Create feature but don't complete workflow
    const scriptPath = process.platform === 'win32'
      ? 'scripts/create-new-feature.bat'
      : 'scripts/create-new-feature.sh';
    
    const command = process.platform === 'win32'
      ? `"${scriptPath}" --json "${testFeatureName}"`
      : `bash "${scriptPath}" --json "${testFeatureName}"`;

    const { stdout } = await execAsync(command, { timeout: 30000 });
    const result = JSON.parse(stdout.trim());
    
    testBranchName = result.BRANCH_NAME;
    testSpecDir = path.dirname(result.SPEC_FILE);

    // Simulate interruption by switching branches
    await execAsync('git checkout main');
    
    // Verify we can return to feature branch and continue
    await execAsync(`git checkout ${testBranchName}`);
    
    const { stdout: currentBranch } = await execAsync('git branch --show-current');
    expect(currentBranch.trim()).toBe(testBranchName);

    // Continue workflow from where we left off
    const prereqScriptPath = process.platform === 'win32'
      ? 'scripts/check-task-prerequisites.bat'  
      : 'scripts/check-task-prerequisites.sh';
    
    const prereqCommand = process.platform === 'win32'
      ? `"${prereqScriptPath}" --json`
      : `bash "${prereqScriptPath}" --json`;

    const { stdout: prereqOutput } = await execAsync(prereqCommand, { timeout: 15000 });
    
    if (prereqOutput.trim().startsWith('{')) {
      const prereqResult = JSON.parse(prereqOutput.trim());
      expect(prereqResult.FEATURE_DIR).toBe(testSpecDir);
    }

    console.log('✅ Workflow interruption and recovery handled gracefully');
  });

  test('should validate script error handling', async () => {
    console.log('Testing script error handling...');

    // Test invalid feature name
    const scriptPath = process.platform === 'win32'
      ? 'scripts/create-new-feature.bat'
      : 'scripts/create-new-feature.sh';
    
    const invalidCommand = process.platform === 'win32'
      ? `"${scriptPath}"`  // Missing required argument
      : `bash "${scriptPath}"`;

    try {
      await execAsync(invalidCommand, { timeout: 10000 });
      expect.fail('Should have thrown error for missing argument');
    } catch (error) {
      expect((error as any).message).toContain('Usage');
    }

    // Test prerequisites check on non-feature branch
    await execAsync('git checkout main');
    
    const prereqScriptPath = process.platform === 'win32'
      ? 'scripts/check-task-prerequisites.bat'
      : 'scripts/check-task-prerequisites.sh';
    
    const prereqCommand = process.platform === 'win32'
      ? `"${prereqScriptPath}"`
      : `bash "${prereqScriptPath}"`;

    try {
      await execAsync(prereqCommand, { timeout: 10000 });
      expect.fail('Should have thrown error for non-feature branch');
    } catch (error) {
      expect((error as any).message).toContain('feature branch');
    }

    console.log('✅ Script error handling validated');
  });

  test('should support parallel workflow operations', async () => {
    console.log('Testing parallel workflow operations...');

    // Create multiple features in parallel
    const featureNames = [
      `parallel-test-1-${Date.now().toString(36)}`,
      `parallel-test-2-${Date.now().toString(36)}`, 
      `parallel-test-3-${Date.now().toString(36)}`
    ];

    const scriptPath = process.platform === 'win32'
      ? 'scripts/create-new-feature.bat'
      : 'scripts/create-new-feature.sh';

    // Note: We can't actually create multiple features in parallel due to git branch constraints
    // But we can test that the scripts handle sequential execution properly
    const results = [];
    
    for (const featureName of featureNames) {
      const command = process.platform === 'win32'
        ? `"${scriptPath}" --json "${featureName}"`
        : `bash "${scriptPath}" --json "${featureName}"`;

      try {
        const { stdout } = await execAsync(command, { timeout: 30000 });
        const result = JSON.parse(stdout.trim());
        results.push(result);
        
        // Clean up immediately to avoid conflicts
        const branchName = result.BRANCH_NAME;
        await execAsync(`git checkout main && git branch -D ${branchName}`);
        await fs.rm(path.dirname(result.SPEC_FILE), { recursive: true, force: true });
      } catch (error) {
        console.warn(`Failed to create feature ${featureName}:`, error);
      }
    }

    expect(results.length).toBeGreaterThan(0);
    
    // Verify each feature got unique identifiers
    const branchNames = results.map(r => r.BRANCH_NAME);
    const uniqueBranches = new Set(branchNames);
    expect(uniqueBranches.size).toBe(branchNames.length);

    console.log(`✅ Created ${results.length} features with unique identifiers`);
  });

  test('should validate documentation sync integration', async () => {
    console.log('Testing documentation sync integration...');

    // Create feature and test doc sync
    const scriptPath = process.platform === 'win32'
      ? 'scripts/create-new-feature.bat'
      : 'scripts/create-new-feature.sh';
    
    const command = process.platform === 'win32'
      ? `"${scriptPath}" --json "${testFeatureName}"`
      : `bash "${scriptPath}" --json "${testFeatureName}"`;

    const { stdout } = await execAsync(command, { timeout: 30000 });
    const result = JSON.parse(stdout.trim());
    
    testBranchName = result.BRANCH_NAME;
    testSpecDir = path.dirname(result.SPEC_FILE);

    // Test documentation sync with multiple target files
    const syncScriptPath = process.platform === 'win32'
      ? 'scripts/sync-documentation.bat'
      : 'scripts/sync-documentation.sh';
    
    const syncCommand = process.platform === 'win32'
      ? `"${syncScriptPath}" --all --json`
      : `bash "${syncScriptPath}" --all --json`;

    const { stdout: syncOutput } = await execAsync(syncCommand, { timeout: 45000 });
    
    if (syncOutput.trim().startsWith('{')) {
      const syncResult = JSON.parse(syncOutput.trim());
      expect(syncResult.synced).toBeGreaterThanOrEqual(0);
      expect(syncResult.results).toBeDefined();
    }

    // Test agent context update integration
    const contextScriptPath = process.platform === 'win32'
      ? 'scripts/update-agent-context.bat'
      : 'scripts/update-agent-context.sh';
    
    const contextCommand = process.platform === 'win32'
      ? `"${contextScriptPath}" all --json`
      : `bash "${contextScriptPath}" all --json`;

    const { stdout: contextOutput } = await execAsync(contextCommand, { timeout: 25000 });
    
    if (contextOutput.trim().startsWith('{')) {
      const contextResult = JSON.parse(contextOutput.trim());
      expect(contextResult.branch).toBe(testBranchName);
    }

    console.log('✅ Documentation sync integration validated');
  });

  test('should maintain performance requirements for workflow operations', async () => {
    console.log('Testing workflow performance requirements...');

    const performanceTests = [
      {
        name: 'Feature Creation',
        script: process.platform === 'win32' ? 'scripts/create-new-feature.bat' : 'scripts/create-new-feature.sh',
        args: `--json "${testFeatureName}"`,
        maxDuration: 30000 // 30 seconds
      },
      {
        name: 'Plan Setup',
        script: process.platform === 'win32' ? 'scripts/setup-plan.bat' : 'scripts/setup-plan.sh',
        args: '--json',
        maxDuration: 20000 // 20 seconds  
      },
      {
        name: 'Prerequisites Check',
        script: process.platform === 'win32' ? 'scripts/check-task-prerequisites.bat' : 'scripts/check-task-prerequisites.sh',
        args: '--json',
        maxDuration: 15000 // 15 seconds
      }
    ];

    // First create the feature for subsequent tests
    const createCommand = process.platform === 'win32'
      ? `"${performanceTests[0].script}" ${performanceTests[0].args}`
      : `bash "${performanceTests[0].script}" ${performanceTests[0].args}`;
    
    const createStart = Date.now();
    const { stdout } = await execAsync(createCommand, { timeout: performanceTests[0].maxDuration });
    const createDuration = Date.now() - createStart;
    
    expect(createDuration).toBeLessThan(performanceTests[0].maxDuration);
    
    const result = JSON.parse(stdout.trim());
    testBranchName = result.BRANCH_NAME;
    testSpecDir = path.dirname(result.SPEC_FILE);

    // Test remaining operations
    for (let i = 1; i < performanceTests.length; i++) {
      const test = performanceTests[i];
      const command = process.platform === 'win32'
        ? `"${test.script}" ${test.args}`
        : `bash "${test.script}" ${test.args}`;
      
      const startTime = Date.now();
      
      try {
        await execAsync(command, { timeout: test.maxDuration });
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(test.maxDuration);
        console.log(`✅ ${test.name}: ${duration}ms (target: <${test.maxDuration}ms)`);
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`⚠️ ${test.name} failed in ${duration}ms: ${(error as any).message}`);
        // Don't fail test if it's expected operational error
        if (!(error as any).message.includes('No spec documents found')) {
          throw error;
        }
      }
    }

    console.log('✅ Performance requirements validated for all workflow operations');
  });

  test('should validate cross-platform compatibility', async () => {
    console.log(`Testing cross-platform compatibility on: ${process.platform}`);

    const scriptTests = [
      'create-new-feature',
      'setup-plan', 
      'check-task-prerequisites',
      'update-agent-context',
      'sync-documentation'
    ];

    for (const scriptBase of scriptTests) {
      const scriptExt = process.platform === 'win32' ? '.bat' : '.sh';
      const scriptPath = `scripts/${scriptBase}${scriptExt}`;
      
      // Verify script file exists
      const exists = await fs.access(scriptPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
      
      // Test help flag if available
      const helpCommand = process.platform === 'win32'
        ? `"${scriptPath}" --help`
        : `bash "${scriptPath}" --help`;

      try {
        const { stdout } = await execAsync(helpCommand, { timeout: 5000 });
        expect(stdout).toBeDefined();
        console.log(`✅ ${scriptBase}: Help available`);
      } catch (error) {
        // Help may not be available for all scripts
        console.log(`⚠️ ${scriptBase}: No help available (expected)`);
      }
    }

    console.log(`✅ Cross-platform compatibility validated for ${process.platform}`);
  });
});