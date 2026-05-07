# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Dashboard Flow (POM) >> should login as admin, see admin dashboard, update inventory, and logout
- Location: tests\admin.spec.ts:14:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForResponse: Test timeout of 30000ms exceeded.
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
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | export class HomePage {
  4  |   readonly page: Page;
  5  |   readonly productCard;
  6  |   readonly productName;
  7  |   readonly productPrice;
  8  |   readonly cartButton;
  9  |   readonly viewCartLink;
  10 |   readonly loginButton;
  11 |   readonly cartBadge;
  12 | 
  13 |   constructor(page: Page) {
  14 |     this.page = page;
  15 |     this.productCard = page.locator('[data-testid="product-card"]');
  16 |     this.productName = page.getByTestId('product-name').first();
  17 |     this.productPrice = page.getByTestId('product-price').first();
  18 |     this.cartButton = page.getByLabel('Cart');
  19 |     this.viewCartLink = page.getByRole('link', { name: 'View cart →' });
  20 |     this.loginButton = page.getByTestId('login-button');
  21 |     this.cartBadge = page.locator('[data-testid="cart-badge"]');
  22 |   }
  23 | 
  24 |   async goto() {
  25 |     await this.page.goto('/');
  26 |     await this.page.waitForLoadState('networkidle');
  27 |   }
  28 | 
  29 |   async waitForProducts() {
  30 |     // Wait for API response instead of selector for better stability
> 31 |     const response = await this.page.waitForResponse(resp => resp.url().includes('/api/products'), { timeout: 30000 });
     |                                      ^ Error: page.waitForResponse: Test timeout of 30000ms exceeded.
  32 |     console.log('Products API Response Status:', response.status());
  33 |     if (response.status() !== 200) {
  34 |       console.error('Products API failed with status:', response.status());
  35 |       console.error('Response body:', await response.text());
  36 |     }
  37 |     await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 });
  38 |   }
  39 | 
  40 |   async getProductCount(): Promise<number> {
  41 |     return await this.productCard.count();
  42 |   }
  43 | 
  44 |   async clickFirstProduct() {
  45 |     const firstProduct = this.productCard.first();
  46 |     await firstProduct.click();
  47 |   }
  48 | 
  49 |   async clickViewCart() {
  50 |     await this.viewCartLink.click();
  51 |   }
  52 | 
  53 |   async clickLoginButton() {
  54 |     await this.loginButton.click();
  55 |   }
  56 | 
  57 |   async verifyCartButtonVisible() {
  58 |     await expect(this.cartButton).toBeVisible();
  59 |   }
  60 | }
  61 | 
```