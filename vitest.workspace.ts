import { defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vitest 1.3.0 workspace configuration for constitutional test order
export default defineWorkspace([
  // 1. CONTRACT TESTS - Test service interfaces and contracts first
  {
    test: {
      name: 'contract',
      root: './tests/contract',
      environment: 'node', // Contract tests don't need DOM
      include: ['**/*.test.{ts,js}'],
      setupFiles: ['../setup.ts'],
      
      // Contract tests are critical - stricter settings
      testTimeout: 5000,
      retry: 0, // No retries for contract tests
      bail: 1,  // Stop immediately on contract failure
      
      // Fast execution for contracts
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },

      // Contract-specific coverage
      coverage: {
        provider: 'v8',
        reporter: ['text'],
        include: ['../../src/services/**/*.ts'],
        thresholds: {
          functions: 90, // Higher threshold for service contracts
          statements: 85,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@services': resolve(__dirname, './src/services'),
        '@models': resolve(__dirname, './src/models'),
        '@types': resolve(__dirname, './src/types'),
        '@tests': resolve(__dirname, './tests'),
      },
    },
  },

  // 2. INTEGRATION TESTS - Test service interactions second
  {
    test: {
      name: 'integration',
      root: './tests/integration',
      environment: 'jsdom', // May need DOM for store interactions
      include: ['**/*.test.{ts,js,tsx,jsx}'],
      setupFiles: ['../setup.ts'],
      
      // Integration tests need more time
      testTimeout: 10000,
      retry: 1,
      bail: 3,
      
      // Parallel execution for integration tests
      pool: 'threads',
      poolOptions: {
        threads: {
          minThreads: 1,
          maxThreads: 2,
        },
      },

      // Integration-specific coverage
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        include: [
          '../../src/services/**/*.ts',
          '../../src/stores/**/*.ts',
          '../../src/hooks/**/*.ts',
        ],
        thresholds: {
          functions: 85,
          statements: 80,
          branches: 75,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@services': resolve(__dirname, './src/services'),
        '@stores': resolve(__dirname, './src/stores'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@models': resolve(__dirname, './src/models'),
        '@types': resolve(__dirname, './src/types'),
        '@tests': resolve(__dirname, './tests'),
      },
    },
  },

  // 3. UNIT TESTS - Test individual components last
  {
    test: {
      name: 'unit',
      root: './tests/unit',
      environment: 'jsdom', // Components need DOM
      include: ['**/*.test.{ts,js,tsx,jsx}'],
      setupFiles: ['../setup.ts'],
      
      // Standard unit test settings
      testTimeout: 8000,
      retry: 2,
      bail: 5,
      
      // Parallel execution for unit tests
      pool: 'threads',
      poolOptions: {
        threads: {
          minThreads: 2,
          maxThreads: 4,
        },
      },

      // Component-specific coverage
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: [
          '../../src/components/**/*.{ts,tsx}',
          '../../src/utils/**/*.ts',
          '../../src/hooks/**/*.ts',
        ],
        exclude: [
          '../../src/components/**/index.ts', // Re-export files
          '../../src/components/**/*.types.ts', // Type definitions
        ],
        thresholds: {
          functions: 80,
          statements: 75,
          branches: 70,
          lines: 75,
        },
      },

      // Vitest 1.3.0: CSS modules support for components
      css: {
        modules: {
          classNameStrategy: 'stable',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
        '@models': resolve(__dirname, './src/models'),
        '@tests': resolve(__dirname, './tests'),
      },
    },
  },

  // 4. BENCHMARK TESTS - Performance testing (optional)
  {
    test: {
      name: 'benchmark',
      root: './tests/benchmark',
      environment: 'node',
      include: ['**/*.bench.{ts,js}'],
      
      // Benchmark-specific settings
      testTimeout: 30000,
      retry: 0,
      
      benchmark: {
        include: ['**/*.bench.{ts,js}'],
        exclude: ['node_modules'],
        reporters: ['verbose'],
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@services': resolve(__dirname, './src/services'),
        '@utils': resolve(__dirname, './src/utils'),
      },
    },
  },
]);