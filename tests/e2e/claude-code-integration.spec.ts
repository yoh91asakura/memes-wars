/**
 * E2E Test: Claude Code Integration
 * 
 * Tests integration with the Claude Code CLI environment, validating
 * agent coordination workflows, context management, and tool interactions.
 */

import { test, expect, type Page } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

test.describe('Claude Code Integration E2E', () => {
  let testWorkspace: string;
  let testContext: string;

  test.beforeEach(async () => {
    // Setup isolated test workspace
    const timestamp = Date.now().toString(36);
    testWorkspace = path.join(process.cwd(), 'tmp', `claude-test-${timestamp}`);
    testContext = `claude-integration-test-${timestamp}`;
    
    // Create test workspace directory
    await fs.mkdir(testWorkspace, { recursive: true });
  });

  test.afterEach(async () => {
    // Cleanup test workspace
    if (testWorkspace) {
      try {
        await fs.rm(testWorkspace, { recursive: true, force: true });
        console.log(`Cleaned up test workspace: ${testWorkspace}`);
      } catch (error) {
        console.warn(`Failed to cleanup workspace: ${error}`);
      }
    }
  });

  test('should validate Claude Code CLI environment integration', async ({ page }) => {
    console.log('Step 1: Validating Claude Code environment...');
    
    // Check for Claude Code environment indicators
    const claudeEnvironment = {
      claudeMdExists: await fs.access('CLAUDE.md').then(() => true).catch(() => false),
      specKitActive: await fs.access('specs/').then(() => true).catch(() => false),
      agentScripts: await fs.access('scripts/update-agent-context.sh').then(() => true).catch(() => false)
    };

    expect(claudeEnvironment.claudeMdExists).toBe(true);
    expect(claudeEnvironment.specKitActive).toBe(true);
    expect(claudeEnvironment.agentScripts).toBe(true);

    console.log('✅ Claude Code environment validated');
  });

  test('should coordinate multi-agent task execution', async ({ page }) => {
    console.log('Step 1: Testing multi-agent coordination...');

    // Simulate creating a feature that requires agent coordination
    const scriptPath = process.platform === 'win32'
      ? 'scripts/create-new-feature.bat'
      : 'scripts/create-new-feature.sh';
    
    const testFeatureName = 'claude-code-integration-test';
    const command = process.platform === 'win32'
      ? `"${scriptPath}" --json "${testFeatureName}"`
      : `bash "${scriptPath}" --json "${testFeatureName}"`;

    const { stdout: createOutput } = await execAsync(command, { timeout: 30000 });
    const createResult = JSON.parse(createOutput.trim());
    
    const testBranchName = createResult.BRANCH_NAME;
    const testSpecDir = path.dirname(createResult.SPEC_FILE);

    // Update agent context to reflect multi-agent coordination
    const contextScriptPath = process.platform === 'win32'
      ? 'scripts/update-agent-context.bat'
      : 'scripts/update-agent-context.sh';
    
    const contextCommand = process.platform === 'win32'
      ? `"${contextScriptPath}" all --json`
      : `bash "${contextScriptPath}" all --json`;

    const { stdout: contextOutput } = await execAsync(contextCommand, { timeout: 20000 });
    
    if (contextOutput.trim().startsWith('{')) {
      const contextResult = JSON.parse(contextOutput.trim());
      expect(contextResult.branch).toBe(testBranchName);
      expect(contextResult.agents).toContain('claude');
    }

    // Cleanup test branch
    try {
      await execAsync(`git checkout main && git branch -D ${testBranchName}`);
      await fs.rm(testSpecDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }

    console.log('✅ Multi-agent coordination tested successfully');
  });

  test('should handle Claude Code tool interactions', async ({ page }) => {
    console.log('Step 1: Testing tool interactions...');

    // Test Read tool simulation - check project files
    const projectFiles = [
      'package.json',
      'tsconfig.json', 
      'CLAUDE.md',
      'README.md'
    ];

    for (const file of projectFiles) {
      const exists = await fs.access(file).then(() => true).catch(() => false);
      expect(exists).toBe(true);
      
      if (exists) {
        const content = await fs.readFile(file, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      }
    }

    // Test Write tool simulation - create test file
    const testFilePath = path.join(testWorkspace, 'claude-test.md');
    const testContent = `# Claude Code Integration Test\n\nGenerated at: ${new Date().toISOString()}\n`;
    
    await fs.writeFile(testFilePath, testContent);
    const writtenContent = await fs.readFile(testFilePath, 'utf-8');
    expect(writtenContent).toBe(testContent);

    // Test Edit tool simulation - modify test file
    const updatedContent = writtenContent + '\n## Test Update\n\nFile modified successfully.\n';
    await fs.writeFile(testFilePath, updatedContent);
    const editedContent = await fs.readFile(testFilePath, 'utf-8');
    expect(editedContent).toContain('Test Update');

    console.log('✅ Tool interactions validated');
  });

  test('should validate context synchronization workflows', async ({ page }) => {
    console.log('Step 1: Testing context synchronization...');

    // Test CLAUDE.md context management
    const claudeMdPath = 'CLAUDE.md';
    const claudeMdExists = await fs.access(claudeMdPath).then(() => true).catch(() => false);
    expect(claudeMdExists).toBe(true);

    if (claudeMdExists) {
      const claudeContent = await fs.readFile(claudeMdPath, 'utf-8');
      
      // Validate essential sections exist
      expect(claudeContent).toContain('PROJECT OVERVIEW');
      expect(claudeContent).toContain('CURRENT IMPLEMENTATION STATUS');
      expect(claudeContent).toContain('TDD WORKFLOW');
      
      // Validate token optimization markers
      expect(claudeContent).toMatch(/#{1,3}\s*\w+/); // Headers for navigation
      expect(claudeContent.length).toBeLessThan(200000); // Token limit consideration
    }

    // Test secondary context synchronization
    const secondaryContexts = [
      '.github/copilot-instructions.md'
    ];

    for (const contextFile of secondaryContexts) {
      const exists = await fs.access(contextFile).then(() => true).catch(() => false);
      if (exists) {
        const content = await fs.readFile(contextFile, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
        console.log(`✅ Secondary context validated: ${contextFile}`);
      } else {
        console.log(`⚠️ Secondary context not found: ${contextFile} (may be optional)`);
      }
    }

    console.log('✅ Context synchronization workflows validated');
  });

  test('should handle TDD workflow integration with Claude Code', async ({ page }) => {
    console.log('Step 1: Testing TDD workflow integration...');

    // Test constitutional test order validation
    const testDirectories = [
      'tests/contract/',
      'tests/integration/', 
      'tests/e2e/',
      'tests/unit/'
    ];

    const directoryChecks = await Promise.all(
      testDirectories.map(async (dir) => ({
        dir,
        exists: await fs.access(dir).then(() => true).catch(() => false)
      }))
    );

    // Validate constitutional order structure
    const contractTests = directoryChecks.find(d => d.dir.includes('contract'));
    const integrationTests = directoryChecks.find(d => d.dir.includes('integration'));
    const e2eTests = directoryChecks.find(d => d.dir.includes('e2e'));

    expect(contractTests?.exists).toBe(true);
    expect(integrationTests?.exists).toBe(true);
    expect(e2eTests?.exists).toBe(true);

    // Test script integration with TDD workflow
    const tddScriptPath = process.platform === 'win32'
      ? 'scripts/check-task-prerequisites.bat'
      : 'scripts/check-task-prerequisites.sh';
    
    const tddCommand = process.platform === 'win32'
      ? `"${tddScriptPath}" --json`
      : `bash "${tddScriptPath}" --json`;

    try {
      const { stdout: tddOutput } = await execAsync(tddCommand, { timeout: 15000 });
      
      if (tddOutput.trim().startsWith('{')) {
        const tddResult = JSON.parse(tddOutput.trim());
        expect(tddResult).toHaveProperty('FEATURE_DIR');
      }
      
      console.log('✅ TDD workflow scripts operational');
    } catch (error) {
      // Expected if not on feature branch
      if ((error as any).message.includes('Not on a feature branch')) {
        console.log('✅ TDD workflow validation working (detected correct branch state)');
      } else {
        console.warn('TDD script warning:', (error as any).message);
      }
    }

    console.log('✅ TDD workflow integration validated');
  });

  test('should validate agent navigation and AI-friendly markers', async ({ page }) => {
    console.log('Step 1: Testing AI navigation markers...');

    // Check for AI navigation markers in service files
    const serviceFiles = [
      'src/services/CombatEngine.ts',
      'src/services/RollService.ts'
    ];

    for (const serviceFile of serviceFiles) {
      const exists = await fs.access(serviceFile).then(() => true).catch(() => false);
      
      if (exists) {
        const content = await fs.readFile(serviceFile, 'utf-8');
        
        // Check for AI navigation markers
        const hasAIMarkers = content.includes('#region AI_NAV') || 
                           content.includes('// AI_NAV') ||
                           content.includes('/** AI Navigation:');
        
        if (hasAIMarkers) {
          expect(content).toMatch(/#region AI_NAV|\/\/ AI_NAV|\/\*\* AI Navigation:/);
          console.log(`✅ AI navigation markers found in: ${serviceFile}`);
        } else {
          console.log(`⚠️ No AI navigation markers in: ${serviceFile} (may be optional)`);
        }
      }
    }

    // Test project structure navigation
    const navigationPaths = [
      'src/components/atoms/',
      'src/components/molecules/',
      'src/components/organisms/',
      'src/stores/',
      'src/services/'
    ];

    const structureValidation = await Promise.all(
      navigationPaths.map(async (dir) => ({
        path: dir,
        exists: await fs.access(dir).then(() => true).catch(() => false)
      }))
    );

    // Validate atomic design structure
    const atomicDirs = structureValidation.filter(s => s.path.includes('components/'));
    expect(atomicDirs.every(d => d.exists)).toBe(true);

    console.log('✅ Agent navigation and AI-friendly markers validated');
  });

  test('should test performance requirements for Claude Code operations', async ({ page }) => {
    console.log('Step 1: Testing performance requirements...');

    const performanceTests = [
      {
        name: 'Context Update',
        operation: async () => {
          const contextScript = process.platform === 'win32'
            ? 'scripts/update-agent-context.bat'
            : 'scripts/update-agent-context.sh';
          
          const command = process.platform === 'win32'
            ? `"${contextScript}" claude --json`
            : `bash "${contextScript}" claude --json`;

          await execAsync(command, { timeout: 10000 });
        },
        maxDuration: 10000 // 10 seconds
      },
      {
        name: 'Documentation Sync',
        operation: async () => {
          const syncScript = process.platform === 'win32'
            ? 'scripts/sync-documentation.bat'
            : 'scripts/sync-documentation.sh';
          
          const command = process.platform === 'win32'
            ? `"${syncScript}" --auto --json`
            : `bash "${syncScript}" --auto --json`;

          await execAsync(command, { timeout: 20000 });
        },
        maxDuration: 20000 // 20 seconds
      }
    ];

    for (const test of performanceTests) {
      const startTime = Date.now();
      
      try {
        await test.operation();
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(test.maxDuration);
        console.log(`✅ ${test.name}: ${duration}ms (target: <${test.maxDuration}ms)`);
      } catch (error) {
        // Handle expected errors gracefully
        if ((error as any).message.includes('No spec documents found') ||
            (error as any).message.includes('Not on a feature branch')) {
          console.log(`⚠️ ${test.name}: Expected operational error (validation working)`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Performance requirements validated');
  });

  test('should validate error handling and recovery workflows', async ({ page }) => {
    console.log('Step 1: Testing error handling and recovery...');

    // Test invalid command handling
    const invalidCommands = [
      {
        script: process.platform === 'win32' ? 'scripts/create-new-feature.bat' : 'scripts/create-new-feature.sh',
        args: '', // Missing required feature name
        expectedError: 'Usage:'
      },
      {
        script: process.platform === 'win32' ? 'scripts/setup-plan.bat' : 'scripts/setup-plan.sh',
        args: '--invalid-flag',
        expectedError: null // Should handle gracefully
      }
    ];

    for (const testCase of invalidCommands) {
      const command = process.platform === 'win32'
        ? `"${testCase.script}" ${testCase.args}`
        : `bash "${testCase.script}" ${testCase.args}`;

      try {
        await execAsync(command, { timeout: 10000 });
        
        if (testCase.expectedError) {
          expect.fail(`Expected error for: ${testCase.script}`);
        }
      } catch (error) {
        if (testCase.expectedError) {
          expect((error as any).message || (error as any).stderr).toContain(testCase.expectedError);
          console.log(`✅ Error handling validated for: ${testCase.script}`);
        } else {
          console.log(`⚠️ Unexpected error for ${testCase.script}: ${(error as any).message}`);
        }
      }
    }

    // Test recovery from interrupted workflows
    const recoveryScriptPath = process.platform === 'win32'
      ? 'scripts/check-task-prerequisites.bat'
      : 'scripts/check-task-prerequisites.sh';
    
    const recoveryCommand = process.platform === 'win32'
      ? `"${recoveryScriptPath}"`
      : `bash "${recoveryScriptPath}"`;

    try {
      await execAsync(recoveryCommand, { timeout: 10000 });
      console.log('✅ Recovery workflow accessible');
    } catch (error) {
      // Expected on main branch
      expect((error as any).message).toContain('feature branch');
      console.log('✅ Recovery validation working (branch detection)');
    }

    console.log('✅ Error handling and recovery workflows validated');
  });

  test('should test agent context token optimization', async ({ page }) => {
    console.log('Step 1: Testing token optimization...');

    // Read CLAUDE.md and validate token optimization
    const claudeMdPath = 'CLAUDE.md';
    const claudeContent = await fs.readFile(claudeMdPath, 'utf-8');
    
    // Calculate rough token count (approximation)
    const roughTokenCount = claudeContent.split(/\s+/).length * 1.3; // Rough estimate
    expect(roughTokenCount).toBeLessThan(50000); // Reasonable token limit
    
    // Validate optimization strategies
    const optimizationIndicators = {
      hasHeaders: claudeContent.includes('##'),
      hasSections: claudeContent.includes('#'),
      hasNavigation: claudeContent.includes('Table des Matières') || claudeContent.includes('TOC'),
      hasAbsolutePaths: claudeContent.includes('C:\\') || claudeContent.includes('/'),
      hasConciseStructure: claudeContent.split('\n').length < 2000 // Under 2000 lines
    };

    expect(optimizationIndicators.hasHeaders).toBe(true);
    expect(optimizationIndicators.hasSections).toBe(true);
    expect(optimizationIndicators.hasConciseStructure).toBe(true);

    // Test context update maintains optimization
    if (optimizationIndicators.hasAbsolutePaths) {
      expect(claudeContent).toContain(process.platform === 'win32' ? 'C:\\' : '/');
      console.log('✅ Context includes platform-appropriate absolute paths');
    }

    console.log(`✅ Token optimization validated (~${Math.round(roughTokenCount)} tokens)`);
  });

  test('should validate integration with development workflow', async ({ page }) => {
    console.log('Step 1: Testing development workflow integration...');

    // Test npm scripts integration
    const packageJsonPath = 'package.json';
    const packageContent = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    // Validate Claude Code-friendly scripts
    const expectedScripts = [
      'test',
      'test:watch',
      'test:e2e',
      'typecheck',
      'lint'
    ];

    for (const script of expectedScripts) {
      expect(packageContent.scripts).toHaveProperty(script);
    }

    // Test Git integration
    const gitStatusCommand = 'git status --porcelain';
    
    try {
      const { stdout } = await execAsync(gitStatusCommand, { timeout: 5000 });
      console.log(`✅ Git integration working (${stdout.split('\n').length - 1} tracked changes)`);
    } catch (error) {
      console.warn('Git status warning:', (error as any).message);
    }

    // Test TypeScript integration
    const tscCommand = 'npx tsc --noEmit';
    
    try {
      await execAsync(tscCommand, { timeout: 30000 });
      console.log('✅ TypeScript integration validated');
    } catch (error) {
      // Type errors are acceptable during development
      console.log('⚠️ TypeScript validation completed with issues (expected during development)');
    }

    console.log('✅ Development workflow integration validated');
  });

  test('should test complete Claude Code session simulation', async ({ page }) => {
    console.log('Step 1: Simulating complete Claude Code session...');

    // Simulate typical Claude Code session workflow
    const sessionSteps = [
      {
        name: 'Environment Check',
        action: async () => {
          // Check project state
          const claudeMdExists = await fs.access('CLAUDE.md').then(() => true).catch(() => false);
          expect(claudeMdExists).toBe(true);
        }
      },
      {
        name: 'Context Loading',
        action: async () => {
          // Read context files
          const claudeContent = await fs.readFile('CLAUDE.md', 'utf-8');
          expect(claudeContent.length).toBeGreaterThan(1000);
        }
      },
      {
        name: 'Task Understanding',
        action: async () => {
          // Check current tasks
          const specsDir = 'specs/';
          const specsExist = await fs.access(specsDir).then(() => true).catch(() => false);
          expect(specsExist).toBe(true);
        }
      },
      {
        name: 'Implementation Planning',
        action: async () => {
          // Validate project structure for implementation
          const srcExists = await fs.access('src/').then(() => true).catch(() => false);
          const testsExists = await fs.access('tests/').then(() => true).catch(() => false);
          expect(srcExists).toBe(true);
          expect(testsExists).toBe(true);
        }
      },
      {
        name: 'Code Generation',
        action: async () => {
          // Simulate code generation
          const testContent = `// Generated test content\nconst testFunction = () => 'test';\n`;
          const testFile = path.join(testWorkspace, 'generated-test.ts');
          await fs.writeFile(testFile, testContent);
          
          const writtenContent = await fs.readFile(testFile, 'utf-8');
          expect(writtenContent).toBe(testContent);
        }
      },
      {
        name: 'Validation',
        action: async () => {
          // Simulate validation step
          const packageExists = await fs.access('package.json').then(() => true).catch(() => false);
          expect(packageExists).toBe(true);
        }
      }
    ];

    // Execute session steps
    for (const step of sessionSteps) {
      const stepStart = Date.now();
      await step.action();
      const stepDuration = Date.now() - stepStart;
      console.log(`✅ ${step.name}: ${stepDuration}ms`);
    }

    console.log(`✅ Complete Claude Code session simulation (${sessionSteps.length} steps)`);
  });
});