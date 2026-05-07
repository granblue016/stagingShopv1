# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Dashboard Flow (POM) >> should access admin center from dropdown menu
- Location: tests\admin.spec.ts:103:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('menuitem', { name: /Admin Center/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('menuitem', { name: /Admin Center/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "ShopCart" [ref=e5] [cursor=pointer]:
        - /url: /
        - img [ref=e7]
        - generic [ref=e11]: ShopCart
      - navigation [ref=e12]:
        - link "Shop" [ref=e13] [cursor=pointer]:
          - /url: /
        - link "My Orders" [ref=e14] [cursor=pointer]:
          - /url: /orders
        - link "Admin" [ref=e15] [cursor=pointer]:
          - /url: /admin/orders
        - link "AI Analytics" [ref=e16] [cursor=pointer]:
          - /url: /admin/analytics
      - generic [ref=e17]:
        - link "Cart" [ref=e18] [cursor=pointer]:
          - /url: /cart
          - img
        - button [ref=e19]:
          - img
  - main [ref=e20]:
    - generic [ref=e21]:
      - generic [ref=e25]:
        - generic [ref=e26]:
          - img [ref=e27]
          - text: Curated tech, fast checkout
        - heading "Premium gear, delivered fast" [level=1] [ref=e30]
        - paragraph [ref=e31]: Shop the latest in audio, wearables, and home tech. Real-time inventory, instant checkout.
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - heading "Featured products" [level=2] [ref=e35]
            - paragraph [ref=e36]: Hand-picked items in stock now.
          - link "View cart →" [ref=e37] [cursor=pointer]:
            - /url: /cart
        - generic [ref=e38]:
          - generic [ref=e39]:
            - link "Wireless Headphones Electronics Wireless Headphones High-quality wireless headphones with noise cancellation and 30-hour battery life." [ref=e40] [cursor=pointer]:
              - /url: /product/1
              - img "Wireless Headphones" [ref=e42]
              - generic [ref=e43]:
                - generic [ref=e44]: Electronics
                - heading "Wireless Headphones" [level=3] [ref=e45]
                - paragraph [ref=e46]: High-quality wireless headphones with noise cancellation and 30-hour battery life.
            - generic [ref=e47]:
              - generic [ref=e48]: $149.99
              - button "Add" [ref=e49]:
                - img
                - text: Add
          - generic [ref=e50]:
            - link "Smart Watch Electronics Smart Watch Feature-rich smartwatch with health tracking, GPS, and water resistance." [ref=e51] [cursor=pointer]:
              - /url: /product/2
              - img "Smart Watch" [ref=e53]
              - generic [ref=e54]:
                - generic [ref=e55]: Electronics
                - heading "Smart Watch" [level=3] [ref=e56]
                - paragraph [ref=e57]: Feature-rich smartwatch with health tracking, GPS, and water resistance.
            - generic [ref=e58]:
              - generic [ref=e59]: $299.99
              - button "Add" [ref=e60]:
                - img
                - text: Add
          - generic [ref=e61]:
            - link "Running Shoes Sports Running Shoes Lightweight and comfortable running shoes with advanced cushioning technology." [ref=e62] [cursor=pointer]:
              - /url: /product/3
              - img "Running Shoes" [ref=e64]
              - generic [ref=e65]:
                - generic [ref=e66]: Sports
                - heading "Running Shoes" [level=3] [ref=e67]
                - paragraph [ref=e68]: Lightweight and comfortable running shoes with advanced cushioning technology.
            - generic [ref=e69]:
              - generic [ref=e70]: $89.99
              - button "Add" [ref=e71]:
                - img
                - text: Add
          - generic [ref=e72]:
            - link "Laptop Backpack Accessories Laptop Backpack Durable and spacious backpack with padded laptop compartment and multiple pockets." [ref=e73] [cursor=pointer]:
              - /url: /product/4
              - img "Laptop Backpack" [ref=e75]
              - generic [ref=e76]:
                - generic [ref=e77]: Accessories
                - heading "Laptop Backpack" [level=3] [ref=e78]
                - paragraph [ref=e79]: Durable and spacious backpack with padded laptop compartment and multiple pockets.
            - generic [ref=e80]:
              - generic [ref=e81]: $59.99
              - button "Add" [ref=e82]:
                - img
                - text: Add
          - generic [ref=e83]:
            - link "Bluetooth Speaker Electronics Bluetooth Speaker Portable Bluetooth speaker with powerful bass and 12-hour battery life." [ref=e84] [cursor=pointer]:
              - /url: /product/5
              - img "Bluetooth Speaker" [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e88]: Electronics
                - heading "Bluetooth Speaker" [level=3] [ref=e89]
                - paragraph [ref=e90]: Portable Bluetooth speaker with powerful bass and 12-hour battery life.
            - generic [ref=e91]:
              - generic [ref=e92]: $79.99
              - button "Add" [ref=e93]:
                - img
                - text: Add
          - generic [ref=e94]:
            - link "Yoga Mat Sports Yoga Mat Non-slip yoga mat with extra thickness for comfort during workouts." [ref=e95] [cursor=pointer]:
              - /url: /product/6
              - img "Yoga Mat" [ref=e97]
              - generic [ref=e98]:
                - generic [ref=e99]: Sports
                - heading "Yoga Mat" [level=3] [ref=e100]
                - paragraph [ref=e101]: Non-slip yoga mat with extra thickness for comfort during workouts.
            - generic [ref=e102]:
              - generic [ref=e103]: $34.99
              - button "Add" [ref=e104]:
                - img
                - text: Add
  - region "Notifications alt+T":
    - list:
      - listitem [active] [ref=e105]:
        - img [ref=e107]
        - generic [ref=e110]: Signed in
```

# Test source

```ts
  19  |     
  20  |     // Wait for login to complete
  21  |     await page.waitForURL('/', { timeout: 10000 });
  22  |     await page.waitForLoadState('networkidle');
  23  |     await expect(page.getByText('Sign in')).not.toBeVisible();
  24  |     
  25  |     // Step 2: Verify Admin Dashboard link is visible in header
  26  |     console.log('Page content before checking admin link:', await page.content());
  27  |     const adminLink = page.getByRole('link', { name: /Admin/i });
  28  |     await expect(adminLink).toBeVisible();
  29  |     
  30  |     // Step 3: Click Admin Dashboard link
  31  |     await adminLink.click();
  32  |     
  33  |     // Wait for navigation to admin page
  34  |     await page.waitForURL(/\/admin/, { timeout: 10000 });
  35  |     await page.waitForLoadState('networkidle');
  36  |     
  37  |     // Step 4: Verify we're on admin page
  38  |     await expect(page).toHaveURL(/\/admin/);
  39  |     
  40  |     // Step 5: Navigate to a product to update inventory
  41  |     await homePage.goto();
  42  |     await homePage.waitForProducts();
  43  |     await page.waitForLoadState('networkidle');
  44  |     await homePage.clickFirstProduct();
  45  |     await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });
  46  |     await page.waitForLoadState('networkidle');
  47  |     
  48  |     // Get current stock quantity
  49  |     const stockElement = page.getByText(/Stock/i);
  50  |     const currentStockText = await stockElement.textContent();
  51  |     console.log(`Current stock: ${currentStockText}`);
  52  |     
  53  |     // Step 6: Navigate to admin inventory update
  54  |     // For this test, we'll verify the admin can access the admin section
  55  |     // In a real implementation, you would:
  56  |     // 1. Navigate to admin inventory management page
  57  |     // 2. Update stock quantity for a product
  58  |     // 3. Verify the update was successful
  59  |     
  60  |     // Navigate back to admin section
  61  |     await page.goto('/admin');
  62  |     await page.waitForLoadState('networkidle');
  63  |     
  64  |     // Verify admin section is accessible
  65  |     await expect(page).toHaveURL(/\/admin/);
  66  |     
  67  |     // Step 7: Logout
  68  |     console.log('Page content before logout:', await page.content());
  69  |     const userAvatar = page.getByTestId('user-avatar');
  70  |     await userAvatar.click({ force: true });
  71  |     
  72  |     const signOutButton = page.getByRole('menuitem', { name: /Sign out/i });
  73  |     await expect(signOutButton).toBeVisible();
  74  |     await signOutButton.click();
  75  |     
  76  |     // Verify logout completed - should be redirected to home and see Sign in button
  77  |     await page.waitForURL('/', { timeout: 10000 });
  78  |     await expect(homePage.loginButton).toBeVisible();
  79  |     
  80  |     console.log('Admin flow completed successfully');
  81  |   });
  82  | 
  83  |   test('should not show admin dashboard for regular user', async ({ page }) => {
  84  |     // Login as regular user
  85  |     await homePage.goto();
  86  |     await homePage.clickLoginButton();
  87  |     await loginPage.login('user_test@shopcart.dev', 'User123');
  88  |     await page.waitForURL('/', { timeout: 10000 });
  89  |     await page.waitForLoadState('networkidle');
  90  |     
  91  |     // Verify Admin Dashboard link is NOT visible
  92  |     console.log('Page content after user login:', await page.content());
  93  |     const adminLink = page.getByRole('link', { name: /Admin/i });
  94  |     await expect(adminLink).not.toBeVisible();
  95  |     
  96  |     // Verify regular user can still see My Orders
  97  |     const myOrdersLink = page.getByRole('link', { name: /My Orders/i });
  98  |     await expect(myOrdersLink).toBeVisible();
  99  |     
  100 |     console.log('Admin dashboard correctly hidden for regular user');
  101 |   });
  102 | 
  103 |   test('should access admin center from dropdown menu', async ({ page }) => {
  104 |     // Login as admin
  105 |     await homePage.goto();
  106 |     await homePage.clickLoginButton();
  107 |     await loginPage.login('admin_test@shopcart.dev', 'Admin123');
  108 |     await page.waitForURL('/', { timeout: 10000 });
  109 |     await page.waitForLoadState('networkidle');
  110 |     
  111 |     // Click user avatar to open dropdown
  112 |     console.log('Page content before clicking avatar:', await page.content());
  113 |     const userAvatar = page.getByTestId('user-avatar');
  114 |     await userAvatar.click({ force: true });
  115 |     
  116 |     console.log('Page content after clicking avatar:', await page.content());
  117 |     // Verify Admin Center option is visible in dropdown
  118 |     const adminCenterOption = page.getByRole('menuitem', { name: /Admin Center/i });
> 119 |     await expect(adminCenterOption).toBeVisible();
      |                                     ^ Error: expect(locator).toBeVisible() failed
  120 |     
  121 |     // Click Admin Center
  122 |     await adminCenterOption.click();
  123 |     
  124 |     // Verify navigation to admin page
  125 |     await page.waitForURL(/\/admin/, { timeout: 10000 });
  126 |     await page.waitForLoadState('networkidle');
  127 |     await expect(page).toHaveURL(/\/admin/);
  128 |     
  129 |     console.log('Admin Center accessed from dropdown successfully');
  130 |   });
  131 | });
  132 | 
```