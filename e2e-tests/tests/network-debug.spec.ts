import { test, expect } from '@playwright/test';

test('Network Debug - Check what requests are made', async ({ page }) => {
  console.log('========================================');
  console.log('NETWORK DEBUG TEST');
  console.log('========================================');

  // Log tất cả requests
  page.on('request', request => {
    console.log('📤 REQUEST:', request.url(), request.method());
  });

  // Log tất cả responses
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    console.log('📥 RESPONSE:', url, 'Status:', status);

    // Log chi tiết cho /api/products
    if (url.includes('/api/products')) {
      console.log('✅ /api/products RESPONSE DETECTED!');
      console.log('Status:', status);
      console.log('Headers:', JSON.stringify(response.headers(), null, 2));
      try {
        const body = await response.text();
        console.log('Body:', body);
      } catch (e) {
        console.log('Body: (unable to read)');
      }
    }
  });

  // Log các request thất bại
  page.on('requestfailed', request => {
    console.log('❌ REQUEST FAILED:', request.url(), request.failure());
  });

  console.log('Navigating to homepage...');
  await page.goto('/');
  
  console.log('Waiting for page to load...');
  await page.waitForLoadState('domcontentloaded', { timeout: 8000 });
  
  console.log('========================================');
  console.log('NETWORK DEBUG COMPLETE');
  console.log('========================================');
});
