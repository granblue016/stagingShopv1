import { Page, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems;
  readonly cartTotal;
  readonly checkoutButton;
  readonly addToCartButton;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('[data-testid="cart-item"]');
    this.cartTotal = page.getByTestId('cart-total');
    this.checkoutButton = page.getByRole('button', { name: /checkout/i });
    this.addToCartButton = page.getByRole('button', { name: /add/i });
  }

  async goto() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getCartTotal(): Promise<string> {
    const element = await this.cartTotal.textContent();
    return element || '0';
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async clickAddToCart() {
    await this.addToCartButton.click();
  }

  async verifyCartNotEmpty() {
    const count = await this.getItemCount();
    expect(count).toBeGreaterThan(0);
  }
}
