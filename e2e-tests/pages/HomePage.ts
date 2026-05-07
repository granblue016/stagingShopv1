import { Page, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly productCard;
  readonly productName;
  readonly productPrice;
  readonly cartButton;
  readonly viewCartLink;
  readonly loginButton;
  readonly cartBadge;

  constructor(page: Page) {
    this.page = page;
    this.productCard = page.locator('[data-testid="product-card"]');
    this.productName = page.getByTestId('product-name').first();
    this.productPrice = page.getByTestId('product-price').first();
    this.cartButton = page.getByLabel('Cart');
    this.viewCartLink = page.getByRole('link', { name: 'View cart →' });
    this.loginButton = page.getByTestId('login-button');
    this.cartBadge = page.locator('[data-testid="cart-badge"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForProducts() {
    // Wait for API response instead of selector for better stability
    const response = await this.page.waitForResponse(resp => resp.url().includes('/api/products'), { timeout: 30000 });
    console.log('Products API Response Status:', response.status());
    if (response.status() !== 200) {
      console.error('Products API failed with status:', response.status());
      console.error('Response body:', await response.text());
    }
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 });
  }

  async getProductCount(): Promise<number> {
    return await this.productCard.count();
  }

  async clickFirstProduct() {
    const firstProduct = this.productCard.first();
    await firstProduct.click();
  }

  async clickViewCart() {
    await this.viewCartLink.click();
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async verifyCartButtonVisible() {
    await expect(this.cartButton).toBeVisible();
  }
}
