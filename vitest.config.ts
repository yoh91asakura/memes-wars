import { defineConfig, defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Main configuration for constitutional test order
export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest 1.3.0: Sequential test execution for constitutional order
    sequence: {
      hooks: 'stack',
      setupFiles: 'list',
    },
    
    // Run tests in constitutional order: contract -> integration -> unit
    sequence: {
      concurrent: false, // Enforce sequential execution
      shuffle: false,    // Maintain order
    },

    // Environment configuration
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],

    // Test file patterns in constitutional order
    include: [
      // 1. Contract tests - Test service interfaces first
      'tests/contract/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // 2. Integration tests - Test service interactions
      'tests/integration/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // 3. Unit tests - Test individual components
      'tests/unit/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // 4. Source tests (if any)
      'src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'build',
      'coverage',
      'tests/e2e/**/*', // E2E handled by Playwright
    ],

    // Coverage configuration targeting 80%+
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // 80%+ coverage thresholds
      thresholds: {
        branches: 80,
        functions: 85,
        lines: 80,
        statements: 80,
      },

      // Include all source files for coverage analysis
      all: true,
      clean: true,
      
      // Exclude patterns
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'coverage/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/constants/**',
        '**/data/**/*.ts', // Static data files
        '**/.{eslint,prettier}rc.{js,cjs,yml}',
        'src/vite-env.d.ts',
        'src/main.tsx', // Entry point
        // Exclude utility files with simple logic
        'src/utils/format.ts',
        'src/utils/browserCheck.ts',
      ],

      // Vitest 1.3.0: Advanced coverage options
      skipFull: false,
      perFile: true,
      watermarks: {
        statements: [70, 80],
        functions: [70, 85],
        branches: [70, 80],
        lines: [70, 80],
      },
    },

    // Test execution configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    
    // Vitest 1.3.0: Reporter configuration
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html',
    },

    // Vitest 1.3.0: Benchmark support (if needed)
    benchmark: {
      include: ['**/*.bench.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    },

    // Watch mode configuration
    watch: {
      exclude: ['node_modules', 'dist', '.git', 'coverage'],
    },

    // Pool configuration for optimal performance
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
      },
    },

    // Vitest 1.3.0: Retry configuration
    retry: 2,
    bail: 5, // Stop after 5 failures

    // Mock configuration
    deps: {
      inline: [
        // Inline dependencies that need to be transformed
        '@tanstack/react-query',
        'framer-motion',
        'styled-components',
      ],
    },

    // Vitest 1.3.0: CSS handling
    css: {
      modules: {
        classNameStrategy: 'stable',
      },
    },
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@models': resolve(__dirname, './src/models'),
      '@data': resolve(__dirname, './src/data'),
      '@stores': resolve(__dirname, './src/stores'),
      '@tests': resolve(__dirname, './tests'),
    },
  },

  // Define statement to ensure TypeScript compatibility
  define: {
    'import.meta.vitest': 'undefined',
  },
});