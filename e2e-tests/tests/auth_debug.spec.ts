import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Auth Debug Test - Login Only', () => {
  test('should login with admin_test@shopcart.dev / Admin123 and check API response', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('=== AUTH DEBUG TEST START ===');
    console.log('Email: admin_test@shopcart.dev');
    console.log('Password: Admin123');

    // Navigate to login page
    await loginPage.goto();
    console.log('✓ Navigated to login page');

    // Fill in credentials
    await loginPage.fillEmail('admin_test@shopcart.dev');
    await loginPage.fillPassword('Admin123');
    console.log('✓ Filled credentials');

    // Monitor network for login API call
    let apiResponseCode: number | null = null;
    let apiResponseBody: string | null = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/login')) {
        apiResponseCode = response.status();
        try {
          apiResponseBody = await response.text();
          console.log(`=== API RESPONSE ===`);
          console.log(`Status: ${apiResponseCode}`);
          console.log(`Body: ${apiResponseBody}`);
        } catch (e) {
          console.log(`Status: ${apiResponseCode} (could not read body)`);
        }
      }
    });

    // Click Sign in
    await loginPage.clickSignIn();
    console.log('✓ Clicked Sign in button');

    // Wait 5 seconds to observe API response
    await page.waitForTimeout(5000);

    // Report results
    console.log('=== TEST RESULTS ===');
    if (apiResponseCode === 200) {
      console.log('✓ SUCCESS: Login API returned 200 OK');
    } else if (apiResponseCode === 401) {
      console.log('✗ FAILED: Login API returned 401 Unauthorized');
    } else if (apiResponseCode === null) {
      console.log('⚠ WARNING: No API response captured');
    } else {
      console.log(`⚠ UNEXPECTED: Login API returned ${apiResponseCode}`);
    }

    // Take screenshot for debugging
    await page.screenshot({ path: 'auth-debug-screenshot.png' });
    console.log('✓ Screenshot saved to auth-debug-screenshot.png');

    // Close page
    await page.close();
  });
});
