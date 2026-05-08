import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['line'], ['html', { open: 'never' }]],
  timeout: 60000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30000,
    actionTimeout: 30000,
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Collect coverage from the browser
        contextOptions: {
          javaScriptEnabled: true,
        },
      },
    },
  ],
  webServer: undefined,
  // Collect coverage after each test
  globalSetup: require.resolve('./coverage-setup.ts'),
});
