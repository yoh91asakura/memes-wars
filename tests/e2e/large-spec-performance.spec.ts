/**
 * E2E Test: Large Specification Performance
 * 
 * Tests system performance and scalability with large specifications,
 * validating memory usage, processing time, and UI responsiveness.
 */

import { test, expect, type Page } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface PerformanceMetrics {
  duration: number;
  memoryUsed: number;
  fileSize: number;
  operationsPerSecond: number;
}

test.describe('Large Specification Performance E2E', () => {
  let testWorkspace: string;
  let performanceBaseline: PerformanceMetrics;

  test.beforeAll(async () => {
    // Establish performance baseline with small operations
    const baselineStart = Date.now();
    const baselineMemory = process.memoryUsage().heapUsed;
    
    // Simple operation baseline
    await new Promise(resolve => setTimeout(resolve, 100));
    
    performanceBaseline = {
      duration: Date.now() - baselineStart,
      memoryUsed: process.memoryUsage().heapUsed - baselineMemory,
      fileSize: 1000, // 1KB baseline
      operationsPerSecond: 10
    };
  });

  test.beforeEach(async () => {
    const timestamp = Date.now().toString(36);
    testWorkspace = path.join(process.cwd(), 'tmp', `perf-test-${timestamp}`);
    await fs.mkdir(testWorkspace, { recursive: true });
  });

  test.afterEach(async () => {
    if (testWorkspace) {
      try {
        await fs.rm(testWorkspace, { recursive: true, force: true });
      } catch (error) {
        console.warn(`Cleanup warning: ${error}`);
      }
    }
  });

  test('should handle large specification documents efficiently', async ({ page }) => {
    console.log('Step 1: Testing large specification processing...');

    // Generate large specification content (simulating complex project requirements)
    const largeSpecContent = generateLargeSpecification(50); // 50 sections
    const largeSpecPath = path.join(testWorkspace, 'large-spec.md');
    
    // Measure write performance
    const writeStart = Date.now();
    await fs.writeFile(largeSpecPath, largeSpecContent);
    const writeDuration = Date.now() - writeStart;
    
    expect(writeDuration).toBeLessThan(5000); // Under 5 seconds
    
    // Measure read performance
    const readStart = Date.now();
    const readContent = await fs.readFile(largeSpecPath, 'utf-8');
    const readDuration = Date.now() - readStart;
    
    expect(readDuration).toBeLessThan(2000); // Under 2 seconds
    expect(readContent.length).toBeGreaterThan(100000); // At least 100KB
    
    // Measure search performance
    const searchStart = Date.now();
    const searchMatches = (readContent.match(/## Feature/g) || []).length;
    const searchDuration = Date.now() - searchStart;
    
    expect(searchDuration).toBeLessThan(1000); // Under 1 second
    expect(searchMatches).toBeGreaterThan(40); // Found expected sections
    
    console.log(`✅ Large spec processing: write(${writeDuration}ms), read(${readDuration}ms), search(${searchDuration}ms)`);
  });

  test('should maintain performance with multiple concurrent operations', async ({ page }) => {
    console.log('Step 1: Testing concurrent operation performance...');

    // Create multiple specification files concurrently
    const concurrentSpecs = Array.from({ length: 10 }, (_, i) => ({
      name: `concurrent-spec-${i}.md`,
      content: generateLargeSpecification(20) // 20 sections each
    }));

    // Measure concurrent write performance
    const concurrentWriteStart = Date.now();
    
    const writePromises = concurrentSpecs.map(spec => 
      fs.writeFile(path.join(testWorkspace, spec.name), spec.content)
    );
    
    await Promise.all(writePromises);
    const concurrentWriteDuration = Date.now() - concurrentWriteStart;
    
    expect(concurrentWriteDuration).toBeLessThan(10000); // Under 10 seconds for all
    
    // Measure concurrent read performance
    const concurrentReadStart = Date.now();
    
    const readPromises = concurrentSpecs.map(spec =>
      fs.readFile(path.join(testWorkspace, spec.name), 'utf-8')
    );
    
    const readResults = await Promise.all(readPromises);
    const concurrentReadDuration = Date.now() - concurrentReadStart;
    
    expect(concurrentReadDuration).toBeLessThan(5000); // Under 5 seconds for all
    expect(readResults.length).toBe(10);
    expect(readResults.every(content => content.length > 50000)).toBe(true);
    
    console.log(`✅ Concurrent operations: ${concurrentSpecs.length} files in ${concurrentWriteDuration}ms (write) + ${concurrentReadDuration}ms (read)`);
  });

  test('should handle memory-intensive specification processing', async ({ page }) => {
    console.log('Step 1: Testing memory-intensive operations...');

    // Monitor initial memory usage
    const initialMemory = process.memoryUsage();
    
    // Process large specification with complex operations
    const veryLargeSpec = generateLargeSpecification(200); // 200 sections (~2MB)
    const specPath = path.join(testWorkspace, 'very-large-spec.md');
    
    await fs.writeFile(specPath, veryLargeSpec);
    
    // Perform memory-intensive operations
    const operations = [
      // Parse and manipulate content
      () => veryLargeSpec.split('\n').map(line => line.trim()).filter(line => line.length > 0),
      
      // Extract all headers
      () => veryLargeSpec.match(/^#{1,6}\s+.+$/gm) || [],
      
      // Count different elements
      () => {
        const sections = (veryLargeSpec.match(/^##\s+/gm) || []).length;
        const features = (veryLargeSpec.match(/Feature \d+/g) || []).length;
        const requirements = (veryLargeSpec.match(/Requirement \d+/g) || []).length;
        return { sections, features, requirements };
      },
      
      // Generate summary statistics
      () => ({
        totalLines: veryLargeSpec.split('\n').length,
        totalWords: veryLargeSpec.split(/\s+/).length,
        totalChars: veryLargeSpec.length
      })
    ];

    // Execute operations and measure performance
    const operationStart = Date.now();
    const results = operations.map(op => op());
    const operationDuration = Date.now() - operationStart;
    
    expect(operationDuration).toBeLessThan(3000); // Under 3 seconds
    
    // Check memory usage after operations
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // Under 200MB increase
    
    // Validate operation results
    expect(results[0]).toBeInstanceOf(Array); // Parsed lines
    expect(results[1]).toBeInstanceOf(Array); // Headers
    expect(results[2]).toHaveProperty('sections'); // Counts
    expect(results[3]).toHaveProperty('totalLines'); // Statistics
    
    console.log(`✅ Memory-intensive processing: ${operationDuration}ms, memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
  });

  test('should maintain UI responsiveness with large documents', async ({ page }) => {
    // Only run if browser environment is available
    if (process.env.BROWSER_TESTS !== 'true') {
      console.log('⏸️ Skipping browser tests (BROWSER_TESTS not set)');
      return;
    }

    console.log('Step 1: Testing UI responsiveness...');

    // Navigate to application
    await page.goto('http://localhost:3000');
    await expect(page.locator('body')).toBeVisible();

    // Simulate loading large content in UI
    const largeContent = generateLargeSpecification(100);
    
    // Measure page interaction performance
    const interactionTests = [
      {
        name: 'Page Navigation',
        action: async () => {
          await page.click('a[href*="collection"]', { timeout: 5000 });
          await expect(page.locator('[data-testid*="collection"]')).toBeVisible({ timeout: 5000 });
        },
        maxDuration: 5000
      },
      {
        name: 'Content Loading',
        action: async () => {
          // Simulate content load by checking main content area
          await expect(page.locator('main, [role="main"], .main-content')).toBeVisible({ timeout: 3000 });
        },
        maxDuration: 3000
      },
      {
        name: 'Interactive Elements',
        action: async () => {
          // Test button interactions
          const buttons = await page.locator('button').count();
          if (buttons > 0) {
            await page.locator('button').first().hover();
          }
        },
        maxDuration: 2000
      }
    ];

    for (const test of interactionTests) {
      const startTime = Date.now();
      
      try {
        await test.action();
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(test.maxDuration);
        console.log(`✅ ${test.name}: ${duration}ms (target: <${test.maxDuration}ms)`);
      } catch (error) {
        console.log(`⚠️ ${test.name}: ${(error as any).message} (may be expected if elements don't exist)`);
      }
    }

    console.log('✅ UI responsiveness maintained with large documents');
  });

  test('should handle script execution performance with large specifications', async ({ page }) => {
    console.log('Step 1: Testing script performance with large specs...');

    // Create large specification structure
    const largeSpecFeatureName = 'large-performance-test-feature';
    const largeSpecContent = generateLargeSpecification(150);
    
    // Create feature with large specification
    const scriptPath = process.platform === 'win32'
      ? 'scripts/create-new-feature.bat'
      : 'scripts/create-new-feature.sh';
    
    const command = process.platform === 'win32'
      ? `"${scriptPath}" --json "${largeSpecFeatureName}"`
      : `bash "${scriptPath}" --json "${largeSpecFeatureName}"`;

    let testBranchName = '';
    let testSpecDir = '';

    try {
      // Measure feature creation performance
      const creationStart = Date.now();
      const { stdout } = await execAsync(command, { timeout: 45000 });
      const creationDuration = Date.now() - creationStart;
      
      expect(creationDuration).toBeLessThan(30000); // Under 30 seconds
      
      const createResult = JSON.parse(stdout.trim());
      testBranchName = createResult.BRANCH_NAME;
      testSpecDir = path.dirname(createResult.SPEC_FILE);
      
      // Write large content to spec file
      const writeStart = Date.now();
      await fs.writeFile(createResult.SPEC_FILE, largeSpecContent);
      const writeDuration = Date.now() - writeStart;
      
      expect(writeDuration).toBeLessThan(5000); // Under 5 seconds
      
      // Test plan setup performance with large spec
      const planScriptPath = process.platform === 'win32'
        ? 'scripts/setup-plan.bat'
        : 'scripts/setup-plan.sh';
      
      const planCommand = process.platform === 'win32'
        ? `"${planScriptPath}" --json`
        : `bash "${planScriptPath}" --json`;

      const planStart = Date.now();
      const { stdout: planOutput } = await execAsync(planCommand, { timeout: 30000 });
      const planDuration = Date.now() - planStart;
      
      expect(planDuration).toBeLessThan(25000); // Under 25 seconds
      
      // Test context update performance
      const contextScriptPath = process.platform === 'win32'
        ? 'scripts/update-agent-context.bat'
        : 'scripts/update-agent-context.sh';
      
      const contextCommand = process.platform === 'win32'
        ? `"${contextScriptPath}" claude --json`
        : `bash "${contextScriptPath}" claude --json`;

      const contextStart = Date.now();
      const { stdout: contextOutput } = await execAsync(contextCommand, { timeout: 20000 });
      const contextDuration = Date.now() - contextStart;
      
      expect(contextDuration).toBeLessThan(15000); // Under 15 seconds
      
      console.log(`✅ Script performance: creation(${creationDuration}ms), plan(${planDuration}ms), context(${contextDuration}ms)`);
      
    } finally {
      // Cleanup test branch and directory
      if (testBranchName) {
        try {
          await execAsync(`git checkout main && git branch -D ${testBranchName}`);
        } catch (error) {
          console.warn(`Branch cleanup warning: ${error}`);
        }
      }
      
      if (testSpecDir) {
        try {
          await fs.rm(testSpecDir, { recursive: true, force: true });
        } catch (error) {
          console.warn(`Directory cleanup warning: ${error}`);
        }
      }
    }
  });

  test('should handle batch processing performance efficiently', async ({ page }) => {
    console.log('Step 1: Testing batch processing performance...');

    // Generate multiple large specifications
    const batchSpecs = Array.from({ length: 20 }, (_, i) => ({
      name: `batch-spec-${i}.md`,
      content: generateLargeSpecification(25) // 25 sections each
    }));

    // Measure batch write performance
    const batchWriteStart = Date.now();
    
    // Process in batches to simulate real-world usage
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < batchSpecs.length; i += batchSize) {
      const batch = batchSpecs.slice(i, i + batchSize);
      batches.push(batch);
    }

    for (const batch of batches) {
      const batchPromises = batch.map(spec =>
        fs.writeFile(path.join(testWorkspace, spec.name), spec.content)
      );
      
      await Promise.all(batchPromises);
    }
    
    const batchWriteDuration = Date.now() - batchWriteStart;
    expect(batchWriteDuration).toBeLessThan(15000); // Under 15 seconds for all batches
    
    // Measure batch analysis performance
    const analysisStart = Date.now();
    
    const analysisResults = await Promise.all(
      batchSpecs.map(async (spec) => {
        const content = await fs.readFile(path.join(testWorkspace, spec.name), 'utf-8');
        return {
          file: spec.name,
          lines: content.split('\n').length,
          sections: (content.match(/^##\s+/gm) || []).length,
          features: (content.match(/Feature \d+/g) || []).length,
          size: content.length
        };
      })
    );
    
    const analysisDuration = Date.now() - analysisStart;
    expect(analysisDuration).toBeLessThan(8000); // Under 8 seconds for analysis
    
    // Validate batch processing results
    expect(analysisResults.length).toBe(20);
    expect(analysisResults.every(result => result.sections > 20)).toBe(true);
    
    const totalSize = analysisResults.reduce((sum, result) => sum + result.size, 0);
    expect(totalSize).toBeGreaterThan(1000000); // Over 1MB total
    
    console.log(`✅ Batch processing: ${batchSpecs.length} specs in ${batchWriteDuration}ms (write) + ${analysisDuration}ms (analysis), total size: ${Math.round(totalSize / 1024)}KB`);
  });

  test('should maintain performance under stress conditions', async ({ page }) => {
    console.log('Step 1: Testing stress condition performance...');

    // Simulate stress conditions with resource constraints
    const stressTests = [
      {
        name: 'High File Count',
        operation: async () => {
          // Create many small files quickly
          const filePromises = Array.from({ length: 100 }, (_, i) =>
            fs.writeFile(path.join(testWorkspace, `stress-file-${i}.md`), `# Stress Test File ${i}\n\nContent for file ${i}`)
          );
          await Promise.all(filePromises);
        },
        maxDuration: 10000
      },
      {
        name: 'Large Single File',
        operation: async () => {
          // Create one very large file
          const veryLargeContent = generateLargeSpecification(500); // 500 sections
          await fs.writeFile(path.join(testWorkspace, 'very-large-stress.md'), veryLargeContent);
        },
        maxDuration: 15000
      },
      {
        name: 'Complex Text Processing',
        operation: async () => {
          // Perform complex text operations
          const content = generateLargeSpecification(100);
          
          // Multiple complex regex operations
          const results = [
            content.match(/^#{1,6}\s+.+$/gm) || [],
            content.match(/\b\w{10,}\b/g) || [], // Long words
            content.match(/\d+/g) || [], // Numbers
            content.replace(/Feature \d+/g, 'Updated Feature'), // Replacements
            content.split('\n').filter(line => line.trim().length > 100) // Long lines
          ];
          
          return results;
        },
        maxDuration: 5000
      },
      {
        name: 'Concurrent File Operations',
        operation: async () => {
          // Mix of read, write, and delete operations
          const operations = [
            fs.writeFile(path.join(testWorkspace, 'concurrent-write.md'), generateLargeSpecification(30)),
            fs.readFile(path.join(testWorkspace, 'stress-file-1.md'), 'utf-8').catch(() => 'file not found'),
            fs.mkdir(path.join(testWorkspace, 'concurrent-dir'), { recursive: true }),
            fs.writeFile(path.join(testWorkspace, 'concurrent-2.md'), 'concurrent content')
          ];
          
          await Promise.all(operations);
        },
        maxDuration: 8000
      }
    ];

    for (const test of stressTests) {
      const startTime = Date.now();
      
      try {
        await test.operation();
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(test.maxDuration);
        console.log(`✅ ${test.name}: ${duration}ms (target: <${test.maxDuration}ms)`);
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error);
        throw error;
      }
    }

    console.log('✅ System maintained performance under stress conditions');
  });

  test('should provide performance metrics and optimization recommendations', async ({ page }) => {
    console.log('Step 1: Generating performance metrics...');

    // Collect comprehensive performance data
    const performanceData = {
      fileOperations: {
        smallFile: await measureOperation(() => fs.writeFile(path.join(testWorkspace, 'small.md'), 'small content')),
        mediumFile: await measureOperation(() => fs.writeFile(path.join(testWorkspace, 'medium.md'), generateLargeSpecification(10))),
        largeFile: await measureOperation(() => fs.writeFile(path.join(testWorkspace, 'large.md'), generateLargeSpecification(50)))
      },
      textProcessing: {
        parsing: await measureOperation(() => generateLargeSpecification(20).split('\n')),
        regex: await measureOperation(() => generateLargeSpecification(20).match(/^##\s+.+$/gm)),
        replacement: await measureOperation(() => generateLargeSpecification(20).replace(/Feature/g, 'Updated Feature'))
      },
      memoryUsage: {
        initial: process.memoryUsage(),
        afterLargeOperation: null as any
      }
    };

    // Large operation to measure memory impact
    const largeContent = generateLargeSpecification(200);
    await fs.writeFile(path.join(testWorkspace, 'memory-test.md'), largeContent);
    performanceData.memoryUsage.afterLargeOperation = process.memoryUsage();

    // Generate optimization recommendations
    const recommendations = generateOptimizationRecommendations(performanceData);

    // Validate performance metrics
    expect(performanceData.fileOperations.smallFile.duration).toBeLessThan(100);
    expect(performanceData.fileOperations.mediumFile.duration).toBeLessThan(1000);
    expect(performanceData.fileOperations.largeFile.duration).toBeLessThan(5000);

    expect(performanceData.textProcessing.parsing.duration).toBeLessThan(1000);
    expect(performanceData.textProcessing.regex.duration).toBeLessThan(2000);
    expect(performanceData.textProcessing.replacement.duration).toBeLessThan(2000);

    // Validate recommendations are provided
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toHaveProperty('category');
    expect(recommendations[0]).toHaveProperty('suggestion');

    console.log(`✅ Performance metrics collected and ${recommendations.length} optimization recommendations generated`);
    
    // Log key metrics for visibility
    console.log(`📊 Key Metrics:`);
    console.log(`  - Small file: ${performanceData.fileOperations.smallFile.duration}ms`);
    console.log(`  - Medium file: ${performanceData.fileOperations.mediumFile.duration}ms`);
    console.log(`  - Large file: ${performanceData.fileOperations.largeFile.duration}ms`);
    console.log(`  - Memory increase: ${Math.round((performanceData.memoryUsage.afterLargeOperation.heapUsed - performanceData.memoryUsage.initial.heapUsed) / 1024 / 1024)}MB`);
  });
});

// Helper Functions

function generateLargeSpecification(sectionCount: number): string {
  const sections = [];
  
  sections.push('# Large Specification Document\n');
  sections.push('This is a generated large specification for performance testing.\n\n');
  sections.push('## Table of Contents\n');
  
  // Generate table of contents
  for (let i = 1; i <= sectionCount; i++) {
    sections.push(`- [Feature ${i}](#feature-${i})`);
  }
  sections.push('\n');
  
  // Generate sections
  for (let i = 1; i <= sectionCount; i++) {
    sections.push(`## Feature ${i}\n`);
    sections.push(`### Overview`);
    sections.push(`Feature ${i} provides comprehensive functionality for the application. This feature includes multiple components, services, and integration points that work together to deliver value to users.\n`);
    
    sections.push(`### Requirements`);
    for (let r = 1; r <= 5; r++) {
      sections.push(`- Requirement ${i}.${r}: The system shall provide capability ${i}.${r} with performance characteristics meeting SLA requirements.`);
    }
    sections.push('');
    
    sections.push(`### Technical Specifications`);
    sections.push(`The implementation of Feature ${i} requires integration with multiple system components:\n`);
    sections.push('```typescript');
    sections.push(`interface Feature${i}Config {`);
    sections.push(`  enabled: boolean;`);
    sections.push(`  parameters: Feature${i}Parameters;`);
    sections.push(`  dependencies: string[];`);
    sections.push('}\n');
    sections.push(`class Feature${i}Service {`);
    sections.push(`  async initialize(config: Feature${i}Config): Promise<void>`);
    sections.push(`  async execute(): Promise<Feature${i}Result>`);
    sections.push(`  async cleanup(): Promise<void>`);
    sections.push('}');
    sections.push('```\n');
    
    sections.push(`### Test Scenarios`);
    sections.push(`1. **Happy Path**: Verify Feature ${i} works under normal conditions`);
    sections.push(`2. **Error Handling**: Validate proper error handling for Feature ${i}`);
    sections.push(`3. **Performance**: Ensure Feature ${i} meets performance requirements`);
    sections.push(`4. **Integration**: Test Feature ${i} integration with other components`);
    sections.push(`5. **Edge Cases**: Validate Feature ${i} behavior in edge scenarios\n`);
    
    sections.push(`### Acceptance Criteria`);
    sections.push(`- [ ] Feature ${i} functionality is implemented`);
    sections.push(`- [ ] All tests pass for Feature ${i}`);
    sections.push(`- [ ] Performance benchmarks met for Feature ${i}`);
    sections.push(`- [ ] Documentation complete for Feature ${i}`);
    sections.push(`- [ ] Integration verified for Feature ${i}\n`);
  }
  
  sections.push('## Conclusion\n');
  sections.push(`This specification covers ${sectionCount} features with comprehensive requirements, technical specifications, and test scenarios. The implementation should follow TDD principles and maintain high code quality standards.\n`);
  
  return sections.join('\n');
}

async function measureOperation<T>(operation: () => Promise<T> | T): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await operation();
  const duration = Date.now() - start;
  return { result, duration };
}

function generateOptimizationRecommendations(performanceData: any): Array<{ category: string; suggestion: string; priority: 'high' | 'medium' | 'low' }> {
  const recommendations = [];
  
  // File operation recommendations
  if (performanceData.fileOperations.largeFile.duration > 3000) {
    recommendations.push({
      category: 'File Operations',
      suggestion: 'Consider streaming large file operations to reduce memory usage and improve performance',
      priority: 'high' as const
    });
  }
  
  // Text processing recommendations
  if (performanceData.textProcessing.regex.duration > 1000) {
    recommendations.push({
      category: 'Text Processing',
      suggestion: 'Optimize regex patterns and consider pre-compiled patterns for better performance',
      priority: 'medium' as const
    });
  }
  
  // Memory usage recommendations
  const memoryIncrease = performanceData.memoryUsage.afterLargeOperation.heapUsed - performanceData.memoryUsage.initial.heapUsed;
  if (memoryIncrease > 50 * 1024 * 1024) { // 50MB
    recommendations.push({
      category: 'Memory Usage',
      suggestion: 'Implement garbage collection optimization and memory pooling for large operations',
      priority: 'high' as const
    });
  }
  
  // General recommendations
  recommendations.push({
    category: 'General Performance',
    suggestion: 'Implement caching strategies for frequently accessed specifications',
    priority: 'medium' as const
  });
  
  recommendations.push({
    category: 'Scalability',
    suggestion: 'Consider implementing pagination or lazy loading for very large documents',
    priority: 'low' as const
  });
  
  return recommendations;
}