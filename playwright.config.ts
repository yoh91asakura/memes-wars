import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

/**
 * Playwright 1.54.2 Configuration for React TypeScript Project
 * Optimized for Memes Wars Card Game Testing
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory structure - points specifically to tests/e2e/
  testDir: './tests/e2e',
  
  // Test file matching patterns for different test types
  testMatch: [
    '**/tests/e2e/**/*.spec.ts',
    '**/tests/e2e/**/*.test.ts'
  ],
  
  // Test organization
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  // Retry strategy
  retries: process.env.CI ? 2 : 0,
  
  // Worker configuration - 4 parallel workers as requested
  workers: process.env.CI ? 2 : 4,
  
  // Timeout configuration optimized for game testing
  timeout: 120 * 1000, // 2 minutes for complex game flows
  expect: {
    timeout: 15 * 1000, // 15 seconds for game state assertions
  },
  
  // Global test timeout
  globalTimeout: 60 * 60 * 1000, // 1 hour for full test suite
  
  // Reporter configuration - HTML reports as requested
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never', // Don't auto-open in CI
      host: 'localhost',
      port: 9323
    }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    // Add blob reporter for Playwright 1.54.2+ trace viewer
    ['blob']
  ],
  
  // Output directory for test artifacts
  outputDir: './test-results',
  
  // Global test configuration
  use: {
    // Base URL for the React app
    baseURL: 'http://localhost:3000',
    
    // Browser context options
    ignoreHTTPSErrors: true,
    
    // Screenshots on failure as requested
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    // Videos on failure as requested
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    
    // Trace collection for debugging
    trace: 'retain-on-failure',
    
    // Performance optimizations for game testing
    actionTimeout: 15 * 1000, // 15 seconds for game actions
    navigationTimeout: 30 * 1000, // 30 seconds for page loads
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Viewport for consistent testing
    viewport: { width: 1280, height: 720 },
    
    // Device scale factor
    deviceScaleFactor: 1,
    
    // Color scheme
    colorScheme: 'light',
    
    // User agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Playwright-Test'
  },

  // Browser projects - chromium, firefox, webkit as requested
  projects: [
    // Setup project for authentication and test preparation
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'teardown'
    },
    
    // Teardown project
    {
      name: 'teardown',
      testMatch: /global\.teardown\.ts/
    },

    // Chromium project
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chromium-specific optimizations for Playwright 1.54.2
        channel: 'chrome', // Use stable Chrome if available
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      },
      dependencies: ['setup']
    },

    // Firefox project
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox-specific configurations
        launchOptions: {
          firefoxUserPrefs: {
            'dom.disable_beforeunload': true,
            'dom.max_script_run_time': 0,
            'dom.max_chrome_script_run_time': 0,
            'security.tls.insecure_fallback_hosts': 'localhost'
          }
        }
      },
      dependencies: ['setup']
    },

    // WebKit project
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // WebKit-specific configurations for game performance
        launchOptions: {
          args: [
            '--disable-web-security',
            '--allow-running-insecure-content'
          ]
        }
      },
      dependencies: ['setup']
    },

    // Mobile testing projects for responsive game design
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile-specific viewport adjustments
        viewport: { width: 393, height: 851 }
      },
      dependencies: ['setup'],
      // Run mobile tests only on specific scenarios
      testIgnore: ['**/desktop-only/**']
    },

    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro'],
        // Tablet-specific configurations
        viewport: { width: 1024, height: 1366 }
      },
      dependencies: ['setup']
    }
  ],

  // Web server configuration for React development server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start React app
    stdout: 'ignore',
    stderr: 'pipe', // Capture errors for debugging
    env: {
      // Environment variables for testing
      NODE_ENV: 'test',
      REACT_APP_API_URL: 'http://localhost:3001',
      // Disable analytics in test mode
      REACT_APP_DISABLE_ANALYTICS: 'true'
    }
  },

  // Playwright 1.54.2 specific configurations
  metadata: {
    'test-framework': 'playwright',
    'game-type': 'card-game',
    'platform': 'react-typescript'
  },

  // Test directory patterns for the requested structure
  testDirs: [
    './tests/e2e',        // Primary E2E tests directory
    './tests/contract',   // Contract/API tests
    './tests/integration' // Integration tests
  ],

  // Global setup and teardown files
  // globalSetup: './tests/setup.ts', // Disabled - conflicts with Vitest
  
  // Artifacts and reporting
  preserveOutput: 'failures-only',
  
  // Playwright 1.54.2 new features
  respectGitIgnore: true,
  
  // Performance monitoring
  reportSlowTests: {
    max: 5,
    threshold: 15000 // Report tests slower than 15 seconds
  }
});