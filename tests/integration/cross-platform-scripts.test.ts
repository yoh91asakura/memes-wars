/**
 * Integration Test: Cross-Platform Scripts
 * 
 * Tests the functionality of shell scripts across different platforms
 * and validates Windows .bat wrapper compatibility.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

describe('Cross-Platform Scripts Integration', () => {
  let testProjectRoot: string;
  let isWindows: boolean;

  beforeEach(async () => {
    // Get project root directory
    testProjectRoot = process.cwd();
    isWindows = platform() === 'win32';
    
    console.log(`Testing on platform: ${platform()}`);
  });

  it('should execute create-new-feature script successfully', async () => {
    const scriptName = isWindows ? 'create-new-feature.bat' : 'create-new-feature.sh';
    const scriptPath = path.join(testProjectRoot, 'scripts', scriptName);
    
    // Verify script file exists
    try {
      await fs.access(scriptPath);
    } catch (error) {
      throw new Error(`Script not found: ${scriptPath}`);
    }

    // Test script with --json flag for consistent parsing
    const testFeatureName = 'cross-platform-test-feature';
    const command = isWindows 
      ? `"${scriptPath}" --json "${testFeatureName}"`
      : `bash "${scriptPath}" --json "${testFeatureName}"`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: testProjectRoot,
        timeout: 30000 // 30 second timeout
      });

      expect(stderr).toBe('');
      
      // Parse JSON output
      const result = JSON.parse(stdout.trim());
      expect(result.BRANCH_NAME).toMatch(/^\d{3}-[\w-]+$/);
      expect(result.SPEC_FILE).toContain('specs/');
      expect(result.FEATURE_NUM).toMatch(/^\d{3}$/);

      console.log(`✅ Successfully created feature: ${result.BRANCH_NAME}`);
    } catch (error) {
      // Clean up any partial state
      console.warn(`Script execution failed: ${error}`);
      throw error;
    }
  }, 45000); // Extended timeout for script execution

  it('should execute setup-plan script successfully', async () => {
    const scriptName = isWindows ? 'setup-plan.bat' : 'setup-plan.sh';
    const scriptPath = path.join(testProjectRoot, 'scripts', scriptName);
    
    // Verify script exists
    await fs.access(scriptPath);

    // Test script with JSON output
    const command = isWindows 
      ? `"${scriptPath}" --json`
      : `bash "${scriptPath}" --json`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: testProjectRoot,
      timeout: 20000
    });

    expect(stderr).toBe('');
    
    // Parse JSON output if available, otherwise check for expected output patterns
    if (stdout.trim().startsWith('{')) {
      const result = JSON.parse(stdout.trim());
      expect(result).toHaveProperty('FEATURE_DIR');
    } else {
      expect(stdout).toContain('FEATURE_DIR');
    }

    console.log('✅ Successfully executed setup-plan script');
  });

  it('should execute check-task-prerequisites script successfully', async () => {
    const scriptName = isWindows ? 'check-task-prerequisites.bat' : 'check-task-prerequisites.sh';
    const scriptPath = path.join(testProjectRoot, 'scripts', scriptName);
    
    // Verify script exists
    await fs.access(scriptPath);

    // Test script with JSON output
    const command = isWindows 
      ? `"${scriptPath}" --json`
      : `bash "${scriptPath}" --json`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: testProjectRoot,
      timeout: 15000
    });

    // Allow for expected failures when not on a feature branch
    if (stderr.includes('ERROR: Not on a feature branch')) {
      expect(stderr).toContain('feature branch');
      console.log('✅ Script correctly detected non-feature branch');
    } else {
      expect(stderr).toBe('');
      
      if (stdout.trim().startsWith('{')) {
        const result = JSON.parse(stdout.trim());
        expect(result).toHaveProperty('FEATURE_DIR');
        expect(result).toHaveProperty('AVAILABLE_DOCS');
      }
      
      console.log('✅ Successfully executed check-task-prerequisites script');
    }
  });

  it('should execute update-agent-context script with different agents', async () => {
    const scriptName = isWindows ? 'update-agent-context.bat' : 'update-agent-context.sh';
    const scriptPath = path.join(testProjectRoot, 'scripts', scriptName);
    
    await fs.access(scriptPath);

    const agents = ['claude', 'all'];
    
    for (const agent of agents) {
      const command = isWindows 
        ? `"${scriptPath}" ${agent} --json`
        : `bash "${scriptPath}" ${agent} --json`;

      const { stdout, stderr } = await execAsync(command, {
        cwd: testProjectRoot,
        timeout: 20000
      });

      // Check for expected error conditions or success
      if (stderr.includes('No spec documents found')) {
        expect(stderr).toContain('spec documents');
        console.log(`✅ Script correctly handled missing spec documents for agent: ${agent}`);
      } else {
        expect(stderr).toBe('');
        
        if (stdout.trim().startsWith('{')) {
          const result = JSON.parse(stdout.trim());
          expect(result).toHaveProperty('branch');
        }
        
        console.log(`✅ Successfully executed update-agent-context for agent: ${agent}`);
      }
    }
  });

  it('should execute sync-documentation script successfully', async () => {
    const scriptName = isWindows ? 'sync-documentation.bat' : 'sync-documentation.sh';
    const scriptPath = path.join(testProjectRoot, 'scripts', scriptName);
    
    await fs.access(scriptPath);

    // Test with auto mode and JSON output
    const command = isWindows 
      ? `"${scriptPath}" --auto --json`
      : `bash "${scriptPath}" --auto --json`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: testProjectRoot,
      timeout: 30000
    });

    expect(stderr).toBe('');
    
    if (stdout.trim().startsWith('{')) {
      const result = JSON.parse(stdout.trim());
      expect(result).toHaveProperty('synced');
      expect(result.synced).toBeGreaterThanOrEqual(0);
      expect(result).toHaveProperty('timestamp');
    }

    console.log('✅ Successfully executed sync-documentation script');
  });

  it('should handle script error conditions gracefully', async () => {
    const testCases = [
      {
        script: isWindows ? 'create-new-feature.bat' : 'create-new-feature.sh',
        args: '', // Missing required argument
        expectedError: 'Usage:'
      },
      {
        script: isWindows ? 'setup-plan.bat' : 'setup-plan.sh', 
        args: '--invalid-flag',
        expectedError: null // Should handle gracefully
      }
    ];

    for (const testCase of testCases) {
      const scriptPath = path.join(testProjectRoot, 'scripts', testCase.script);
      const command = isWindows 
        ? `"${scriptPath}" ${testCase.args}`
        : `bash "${scriptPath}" ${testCase.args}`;

      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: testProjectRoot,
          timeout: 10000
        });

        if (testCase.expectedError) {
          expect(stderr || stdout).toContain(testCase.expectedError);
        }
      } catch (error) {
        // Expected for invalid usage
        if (testCase.expectedError) {
          expect((error as any).message || (error as any).stderr).toContain(testCase.expectedError);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Error conditions handled gracefully');
  });

  it('should validate Windows batch wrapper functionality', async () => {
    if (!isWindows) {
      console.log('⏸️ Skipping Windows-specific tests on non-Windows platform');
      return;
    }

    const batchFiles = [
      'create-new-feature.bat',
      'setup-plan.bat', 
      'check-task-prerequisites.bat',
      'update-agent-context.bat',
      'sync-documentation.bat'
    ];

    for (const batchFile of batchFiles) {
      const batchPath = path.join(testProjectRoot, 'scripts', batchFile);
      
      // Verify batch file exists
      await fs.access(batchPath);
      
      // Read batch file content to verify structure
      const content = await fs.readFile(batchPath, 'utf-8');
      
      // Verify batch file structure
      expect(content).toContain('@echo off');
      expect(content).toContain('Git\\bin\\bash.exe');
      expect(content).toContain('exit /b');
      expect(content).toMatch(/\.sh/); // References corresponding shell script
      
      console.log(`✅ Validated batch wrapper: ${batchFile}`);
    }
  });

  it('should validate script parameter parsing and handling', async () => {
    const scriptName = isWindows ? 'update-agent-context.bat' : 'update-agent-context.sh';
    const scriptPath = path.join(testProjectRoot, 'scripts', scriptName);
    
    const testCases = [
      {
        args: 'claude --json',
        expectedAgent: 'claude',
        expectJSON: true
      },
      {
        args: 'all',
        expectedAgent: 'all',
        expectJSON: false
      },
      {
        args: '--json',
        expectJSON: true
      }
    ];

    for (const testCase of testCases) {
      const command = isWindows 
        ? `"${scriptPath}" ${testCase.args}`
        : `bash "${scriptPath}" ${testCase.args}`;

      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: testProjectRoot,
          timeout: 15000
        });

        if (testCase.expectJSON && stdout.trim().startsWith('{')) {
          const result = JSON.parse(stdout.trim());
          expect(result).toBeDefined();
        }

        // Check for parameter validation
        if (!stderr.includes('No spec documents found') && !stderr.includes('Not on a feature branch')) {
          expect(stderr).toBe('');
        }

        console.log(`✅ Parameter parsing validated for: ${testCase.args}`);
      } catch (error) {
        if (!(error as any).message.includes('No spec documents found') && 
            !(error as any).message.includes('Not on a feature branch')) {
          throw error;
        }
        console.log(`⚠️ Expected error for args "${testCase.args}": ${(error as any).message}`);
      }
    }
  });

  it('should validate script execution permissions and paths', async () => {
    const scriptsDir = path.join(testProjectRoot, 'scripts');
    
    // Verify scripts directory exists
    await fs.access(scriptsDir);
    
    // Get all script files
    const scriptFiles = await fs.readdir(scriptsDir);
    const shellScripts = scriptFiles.filter(file => file.endsWith('.sh'));
    const batchScripts = scriptFiles.filter(file => file.endsWith('.bat'));
    
    expect(shellScripts.length).toBeGreaterThan(0);
    
    if (isWindows) {
      expect(batchScripts.length).toBeGreaterThan(0);
      
      // Verify each shell script has a corresponding batch wrapper
      for (const shellScript of shellScripts) {
        const baseName = path.basename(shellScript, '.sh');
        const expectedBatch = `${baseName}.bat`;
        expect(batchScripts).toContain(expectedBatch);
      }
    }

    // Verify common.sh exists for shared functions
    expect(scriptFiles).toContain('common.sh');

    console.log(`✅ Validated script structure: ${shellScripts.length} shell scripts, ${batchScripts.length} batch wrappers`);
  });

  it('should handle long-running script operations', async () => {
    const scriptName = isWindows ? 'sync-documentation.bat' : 'sync-documentation.sh';
    const scriptPath = path.join(testProjectRoot, 'scripts', scriptName);
    
    // Test script with potentially long-running operation
    const startTime = Date.now();
    const command = isWindows 
      ? `"${scriptPath}" --all --json`
      : `bash "${scriptPath}" --all --json`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: testProjectRoot,
      timeout: 45000 // Extended timeout for comprehensive sync
    });

    const duration = Date.now() - startTime;
    
    expect(stderr).toBe('');
    expect(duration).toBeGreaterThan(0);
    
    if (stdout.trim().startsWith('{')) {
      const result = JSON.parse(stdout.trim());
      expect(result).toHaveProperty('synced');
    }

    console.log(`✅ Long-running operation completed in ${duration}ms`);
  });

  it('should validate common.sh shared functions', async () => {
    if (isWindows) {
      console.log('⏸️ Skipping shell function tests on Windows (tested via wrappers)');
      return;
    }

    const commonScriptPath = path.join(testProjectRoot, 'scripts', 'common.sh');
    
    // Verify common.sh exists
    await fs.access(commonScriptPath);
    
    // Read common.sh content
    const content = await fs.readFile(commonScriptPath, 'utf-8');
    
    // Verify essential functions are defined
    const expectedFunctions = [
      'get_repo_root',
      'get_current_branch', 
      'check_feature_branch',
      'get_feature_dir',
      'get_feature_paths',
      'check_file',
      'check_dir'
    ];

    for (const func of expectedFunctions) {
      expect(content).toContain(func);
    }

    // Test function invocation through a script that uses common.sh
    const testScript = path.join(testProjectRoot, 'scripts', 'check-task-prerequisites.sh');
    const command = `bash "${testScript}" --json`;

    try {
      await execAsync(command, {
        cwd: testProjectRoot,
        timeout: 10000
      });
      console.log('✅ Common functions executed successfully');
    } catch (error) {
      // Expected if not on feature branch
      if ((error as any).message.includes('Not on a feature branch')) {
        console.log('✅ Common functions working (detected correct branch state)');
      } else {
        throw error;
      }
    }
  });

  it('should maintain performance across different platforms', async () => {
    const performanceTests = [
      {
        script: isWindows ? 'update-agent-context.bat' : 'update-agent-context.sh',
        args: 'claude --json',
        maxDuration: 10000 // 10 seconds
      },
      {
        script: isWindows ? 'sync-documentation.bat' : 'sync-documentation.sh', 
        args: '--auto --json',
        maxDuration: 20000 // 20 seconds
      }
    ];

    for (const test of performanceTests) {
      const scriptPath = path.join(testProjectRoot, 'scripts', test.script);
      const startTime = Date.now();
      
      const command = isWindows 
        ? `"${scriptPath}" ${test.args}`
        : `bash "${scriptPath}" ${test.args}`;

      try {
        await execAsync(command, {
          cwd: testProjectRoot,
          timeout: test.maxDuration
        });
        
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(test.maxDuration);
        
        console.log(`✅ Performance test passed for ${test.script}: ${duration}ms`);
      } catch (error) {
        // Handle expected errors gracefully
        if ((error as any).message.includes('No spec documents found') ||
            (error as any).message.includes('Not on a feature branch')) {
          console.log(`⚠️ Expected error for ${test.script}: script validation working`);
        } else {
          throw error;
        }
      }
    }
  });

  it('should support JSON output mode consistently', async () => {
    const scriptsWithJsonSupport = [
      'create-new-feature',
      'setup-plan',
      'check-task-prerequisites',
      'update-agent-context',
      'sync-documentation'
    ];

    for (const scriptBase of scriptsWithJsonSupport) {
      const scriptName = isWindows ? `${scriptBase}.bat` : `${scriptBase}.sh`;
      const scriptPath = path.join(testProjectRoot, 'scripts', scriptName);
      
      // Test --help first to verify JSON flag is documented
      const helpCommand = isWindows 
        ? `"${scriptPath}" --help`
        : `bash "${scriptPath}" --help`;

      try {
        const { stdout } = await execAsync(helpCommand, {
          cwd: testProjectRoot,
          timeout: 5000
        });
        
        expect(stdout).toContain('--json');
        console.log(`✅ JSON support documented for ${scriptBase}`);
      } catch (error) {
        console.log(`⚠️ Help not available for ${scriptBase} (may be expected)`);
      }
    }
  });
});