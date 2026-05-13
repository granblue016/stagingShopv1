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
    await this.page.goto('/', { timeout: 15000 });
    // Use domcontentloaded instead of networkidle to avoid timeout
    await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  }

  async waitForProducts() {
    // Wait for product cards to be visible
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
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
