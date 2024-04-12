import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // globalSetup: require.resolve('./global-setup'), // TODO add dummy env vars here
  // globalTeardown: require.resolve('./global-teardown'), 

  // TODO: change this comment for local testing --
  /**
   * There seems to be a bug that keeps the webserver open after running tests locally https://github.com/microsoft/playwright/issues/11907
   * causing errors when trying to run `wasp start` afterwards. To avoid this, we can run the webserver only on CI.
   * For local development, we start the app manually with `wasp start` and then run `npx playwright test` to run the tests.
   */
  webServer: {
    command: 'npm run ci:e2e:start',
    // Wait for the backend to start
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  }
});
