import { Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput;
  readonly passwordInput;
  readonly signInButton;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    
    // Monitor login API response
    let loginResponseStatus: number | null = null;
    let loginResponseBody: string | null = null;
    
    this.page.on('response', async (response) => {
      if (response.url().includes('/api/auth/login')) {
        loginResponseStatus = response.status();
        try {
          loginResponseBody = await response.text();
          console.log('Login API Response Status:', loginResponseStatus);
          console.log('Login API Response Body:', loginResponseBody);
        } catch (e) {
          console.log('Login API Response Status:', loginResponseStatus);
        }
      }
    });
    
    await this.clickSignIn();
    
    // Wait a moment for the response
    await this.page.waitForTimeout(1000);
    
    // Fail fast if login failed
    if (loginResponseStatus === 401) {
      throw new Error(`Login failed with 401 Unauthorized. Response: ${loginResponseBody}`);
    }
    
    return { status: loginResponseStatus, body: loginResponseBody };
  }
}
