import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright sans lancement automatique du serveur
 * Utilisez cette config si vous avez déjà un serveur lancé
 * Pour l'utiliser : npx playwright test --config=playwright.config.noserver.ts
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],
  
  /* Global timeout for each test */
  timeout: 30 * 1000,
  
  /* Global timeout for expect assertions */
  expect: {
    timeout: 5 * 1000,
  },
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* Action timeout - for click, fill, etc. */
    actionTimeout: 10 * 1000,
    
    /* Navigation timeout - for page.goto, page.reload, etc. */
    navigationTimeout: 30 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* NO webServer configuration - assumes server is already running */
});
