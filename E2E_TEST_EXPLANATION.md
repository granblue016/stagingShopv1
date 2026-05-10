# Hướng Dẫn Chi Tiết E2E Tests - Phân Tích Từng Dòng

## Tổng Quan Về E2E Tests

E2E (End-to-End) Testing là phương pháp test toàn bộ ứng dụng từ đầu đến cuối, mô phỏng hành vi của người dùng thực. Trong dự án ShopCart, chúng ta sử dụng **Playwright** - một framework E2E testing hiện đại.

### Cấu Trúc Folder E2E Tests

```
e2e-tests/
├── pages/                  # Page Object Model (POM)
│   ├── HomePage.ts        # Page object cho trang chủ
│   ├── LoginPage.ts      # Page object cho trang login
│   └── CartPage.ts       # Page object cho trang giỏ hàng
├── tests/                 # Test cases
│   ├── admin.spec.ts     # Test admin dashboard
│   ├── ai-flow.spec.ts   # Test AI review summary
│   ├── checkout.spec.ts  # Test checkout flow
│   └── ...
├── playwright.config.ts  # Cấu hình Playwright
└── package.json          # Dependencies
```

### Tại Sao Dùng Page Object Model (POM)?

POM là design pattern giúp:
- **Tái sử dụng code**: Page objects có thể dùng lại ở nhiều test
- **Bảo trì dễ dàng**: Thay đổi UI chỉ cần sửa page object, không sửa từng test
- **Code sạch**: Tách biệt logic page và logic test

---

## Ví Dù 1: Admin Dashboard Flow (admin.spec.ts)

### Full Code

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Admin Dashboard Flow (POM)', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
  });

  test('should login as admin, see admin dashboard, update inventory, and logout', async ({ page }) => {
    // Step 1: Login as admin_test
    await homePage.goto();
    await homePage.clickLoginButton();
    await loginPage.login('admin_test@shopcart.dev', 'Admin123');
    
    // Wait for login to complete
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Sign in')).not.toBeVisible();
    
    // Step 2: Verify Admin Dashboard link is visible in header
    console.log('Page content before checking admin link:', await page.content());
    const adminLink = page.getByRole('link', { name: /Admin/i });
    await expect(adminLink).toBeVisible();
    
    // Step 3: Click Admin Dashboard link
    await adminLink.click();
    
    // Wait for navigation to admin page
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Step 4: Verify we're on admin page
    await expect(page).toHaveURL(/\/admin/);
    
    // Step 5: Navigate to a product to update inventory
    await homePage.goto();
    await homePage.waitForProducts();
    await page.waitForLoadState('networkidle');
    await homePage.clickFirstProduct();
    await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Get current stock quantity
    const stockElement = page.getByText(/Stock/i);
    const currentStockText = await stockElement.textContent();
    console.log(`Current stock: ${currentStockText}`);
    
    // Step 6: Navigate to admin inventory update
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/admin/);
    
    // Step 7: Logout
    console.log('Page content before logout:', await page.content());
    const userAvatar = page.getByTestId('user-avatar');
    await userAvatar.click({ force: true });
    
    const signOutButton = page.getByRole('menuitem', { name: /Sign out/i });
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();
    
    // Verify logout completed
    await page.waitForURL('/', { timeout: 10000 });
    await expect(homePage.loginButton).toBeVisible();
    
    console.log('Admin flow completed successfully');
  });
});
```

### Phân Tích Từng Dòng

#### Dòng 1-3: Import Dependencies

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
```

**Giải thích:**
- `test`: Hàm định nghĩa test case từ Playwright
- `expect`: Hàm assertion để kiểm tra kết quả
- `HomePage`, `LoginPage`: Page objects từ folder pages/

**Tại sao import?**
- Cần các hàm test và assertion từ Playwright
- Cần page objects để tương tác với UI

**Data Flow:** Import → Global scope available trong test file

#### Dòng 5-12: Test Describe Block

```typescript
test.describe('Admin Dashboard Flow (POM)', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
  });
```

**Giải thích:**
- `test.describe()`: Gom nhóm các test case liên quan
- Tên mô tả: "Admin Dashboard Flow (POM)"
- POM = Page Object Model

**Tại sao dùng describe?**
- Tổ chức test theo feature
- Output test report rõ ràng

**Dòng 6-7:** Khai báo biến page objects
- Sử dụng `let` vì sẽ gán giá trị trong beforeEach
- Biến có thể dùng trong tất cả test cases

**Dòng 9-12:** `test.beforeEach()`
- Chạy trước mỗi test case
- Khởi tạo page objects với page instance từ Playwright

**Tại sao trong beforeEach?**
- Mỗi test cần instance mới để tránh state pollution
- Page object cần page instance từ Playwright

**Data Flow:**
```
Playwright Test Runner → test.describe() → beforeEach() → Initialize page objects → Test case runs
```

#### Dòng 14: Test Case Definition

```typescript
test('should login as admin, see admin dashboard, update inventory, and logout', async ({ page }) => {
```

**Giải thích:**
- `test()`: Định nghĩa test case
- Tên test mô tả expected behavior
- Pattern: "should [hành vi]"
- `async ({ page })`: Async function với page object injected

**Tại sao tên test như vậy?**
- Mô tả rõ scenario
- Dễ đọc khi test fail
- Best practice: "should [verb] [expected result]"

#### Dòng 16-18: Step 1 - Navigate và Login

```typescript
await homePage.goto();
await homePage.clickLoginButton();
await loginPage.login('admin_test@shopcart.dev', 'Admin123');
```

**Giải thích:**
- `homePage.goto()`: Navigate đến trang chủ
- `homePage.clickLoginButton()`: Click login button
- `loginPage.login()`: Fill credentials và submit

**HomePage.goto() method (HomePage.ts Dòng 24-27):**
```typescript
async goto() {
  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle');
}
```

**Giải thích:**
- `page.goto('/')`: Điều hướng đến root URL
- `waitForLoadState('networkidle')`: Đợi tất cả network requests hoàn thành
- `networkidle`: Không có network activity trong ít nhất 500ms

**Tại sao cần waitForLoadState?**
- Đảm bảo page load hoàn toàn trước khi tiếp tục
- Tránh test fail do element chưa render
- Đợi API calls hoàn thành

**Data Flow:**
```
homePage.goto() → page.goto('/') → Browser loads page → React app mounts → API calls → waitForLoadState → Page fully loaded
```

**LoginPage.login() method (LoginPage.ts Dòng 33-65):**
```typescript
async login(email: string, password: string) {
  await this.fillEmail(email);
  await this.fillPassword(password);
  
  // Monitor login API response
  let loginResponseStatus: number | null = null;
  this.page.on('response', async (response) => {
    if (response.url().includes('/api/auth/login')) {
      loginResponseStatus = response.status();
      console.log('Login API Response Status:', loginResponseStatus);
    }
  });
  
  await this.clickSignIn();
  await this.page.waitForTimeout(1000);
  
  if (loginResponseStatus === 401) {
    throw new Error(`Login failed with 401 Unauthorized`);
  }
}
```

**Giải thích:**
- Fill email và password
- Monitor API response để debug
- Click Sign in
- Fail fast nếu login failed

**Data Flow:**
```
fillEmail() → Type email → fillPassword() → Type password → clickSignIn() → POST /api/auth/login → Backend validates → JWT token returned → Save localStorage → Redirect to home
```

#### Dòng 21-23: Verify Login Success

```typescript
await page.waitForURL('/', { timeout: 10000 });
await page.waitForLoadState('networkidle');
await expect(page.getByText('Sign in')).not.toBeVisible();
```

**Giải thích:**
- Đợi URL thay đổi thành `/`
- Đợi network idle
- Verify "Sign in" button KHÔNG visible

**Tại sao verify?**
- Login thành công → "Sign in" button biến mất
- Thay bằng user avatar
- Verify state change

#### Dòng 25-28: Step 2 - Verify Admin Link

```typescript
const adminLink = page.getByRole('link', { name: /Admin/i });
await expect(adminLink).toBeVisible();
```

**Giải thích:**
- `page.getByRole('link', { name: /Admin/i })`: Tìm element với role="link" và text "Admin" (case-insensitive)
- Verify admin link visible

**Tại sao getByRole?**
- Accessible: Role là ARIA attribute
- Semantic: Rõ ràng element là link
- Stable: Role ít thay đổi

#### Dòng 30-38: Step 3-4 - Click Admin Link và Verify

```typescript
await adminLink.click();
await page.waitForURL(/\/admin/, { timeout: 10000 });
await page.waitForLoadState('networkidle');
await expect(page).toHaveURL(/\/admin/);
```

**Giải thích:**
- Click admin link
- Đợi URL match regex `/\/admin/`
- Verify current URL

**Data Flow:**
```
adminLink.click() → Navigate to /admin → AdminDashboard component mounts → API calls → waitForURL → Verify URL
```

#### Dòng 40-51: Step 5 - Navigate to Product

```typescript
await homePage.goto();
await homePage.waitForProducts();
await page.waitForLoadState('networkidle');
await homePage.clickFirstProduct();
await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });
await page.waitForLoadState('networkidle');

const stockElement = page.getByText(/Stock/i);
const currentStockText = await stockElement.textContent();
console.log(`Current stock: ${currentStockText}`);
```

**Giải thích:**
- Navigate về home
- Click product đầu tiên
- Get stock quantity
- Log ra console

**waitForProducts() method (HomePage.ts Dòng 29-32):**
```typescript
async waitForProducts() {
  await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
}
```

#### Dòng 53-65: Step 6-7 - Admin và Logout

```typescript
await page.goto('/admin');
await page.waitForLoadState('networkidle');
await expect(page).toHaveURL(/\/admin/);

const userAvatar = page.getByTestId('user-avatar');
await userAvatar.click({ force: true });

const signOutButton = page.getByRole('menuitem', { name: /Sign out/i });
await expect(signOutButton).toBeVisible();
await signOutButton.click();

await page.waitForURL('/', { timeout: 10000 });
await expect(homePage.loginButton).toBeVisible();
```

**Giải thích:**
- Navigate về admin
- Click user avatar (force click để bypass visibility check)
- Click Sign out
- Verify logout thành công

**Tại sao force click?**
- Dropdown menu có thể chưa visible
- Element có thể bị z-index che
- Force click bypass visibility check

**Data Flow:**
```
userAvatar.click() → Open dropdown → signOutButton.click() → Clear localStorage → Clear Zustand stores → Redirect to home → Verify login button visible
```

### Sequence Diagram - Admin Dashboard Flow

```
Playwright → Browser → Frontend → Backend
  │           │          │          │
  │goto('/')   │          │          │
  │──────────>│GET /     │          │
  │           │─────────>│GET /api/products
  │           │          │─────────>│
  │           │<─────────│Products  │
  │           │<─────────│          │
  │clickLogin()│          │          │
  │──────────>│/login     │          │
  │           │─────────>│          │
  │fillEmail()│Type email│          │
  │──────────>│          │          │
  │clickSignIn()│POST /api/auth/login
  │           │─────────>│─────────>│
  │           │<─────────│JWT token │
  │           │Save localStorage
  │waitForURL('/')│       │          │
  │<──────────│Redirect /│          │
  │expect(Admin link)│    │          │
  │──────────>│Visible ✓ │          │
  │clickAdminLink()│      │          │
  │──────────>│/admin     │          │
  │           │─────────>│GET /api/orders
  │           │          │─────────>│
  │waitForURL(/admin/)│   │          │
  │<──────────│          │          │
  │clickUserAvatar()│     │          │
  │──────────>│Open dropdown│       │
  │clickSignOut()│       │          │
  │──────────>│Clear localStorage
  │waitForURL('/')│       │          │
  │<──────────│Redirect /│          │
  │expect(Sign in)│       │          │
  │──────────>│Visible ✓ │          │
```

### Process Mapping - Admin Dashboard Flow

```
1. SETUP: Initialize HomePage, LoginPage
2. NAVIGATE HOME: goto('/') → Products loaded from API
3. CLICK LOGIN: Navigate to /login
4. FILL CREDENTIALS: email + password
5. SUBMIT LOGIN: POST /api/auth/login → JWT token → Save localStorage
6. VERIFY LOGIN: waitForURL('/') → 'Sign in' not visible
7. VERIFY ADMIN LINK: getByRole('link', { name: /Admin/i }) → Visible
8. CLICK ADMIN LINK: Navigate to /admin → Admin dashboard loaded
9. NAVIGATE PRODUCT: goto('/') → clickFirstProduct() → /product/1
10. NAVIGATE ADMIN: goto('/admin') → Verify accessible
11. LOGOUT: click userAvatar → click Sign out → Clear localStorage → Redirect home
12. VERIFY LOGOUT: waitForURL('/') → loginButton visible
```

---

## Ví Dù 2: Checkout Flow with Coupon (checkout.spec.ts)

### Full Code

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';

test.describe('Checkout Flow with Coupon (POM)', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
  });

  test('should login, add to cart, apply coupon, verify total, and checkout', async ({ page }) => {
    // Step 1: Login as user_test
    await homePage.goto();
    await homePage.clickLoginButton();
    await loginPage.login('user_test@shopcart.dev', 'User123');
    
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page.getByText('Sign in')).not.toBeVisible();
    
    // Step 2: Add first product to cart
    await homePage.waitForProducts();
    await homePage.clickFirstProduct();
    await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });
    
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();
    
    await page.waitForTimeout(1000);
    await expect(homePage.cartBadge).toHaveText('1');
    
    // Step 3: Navigate to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Step 4: Fill shipping information
    await page.getByLabel('Full name').fill('Test User');
    await page.getByLabel('Address').fill('123 Test Street');
    await page.getByLabel('City').fill('Test City');
    await page.getByLabel('Postal code').fill('12345');
    await page.getByLabel('Country').fill('Test Country');
    
    // Step 5: Apply coupon SAVE10 (10% discount)
    const couponInput = page.getByPlaceholder('Try WELCOME10 or SAVE20');
    await couponInput.fill('SAVE10');
    
    const applyButton = page.getByRole('button', { name: 'Apply' });
    await applyButton.click();
    
    await expect(page.getByText(/SAVE10.*off applied/)).toBeVisible({ timeout: 5000 });
    
    // Step 6: Verify order summary
    await expect(page.getByText('Order summary')).toBeVisible();
    await expect(page.getByText(/Discount/i)).toBeVisible();
    await expect(page.getByText('Shipping', { exact: true })).toBeVisible();
    
    // Step 7: Complete checkout
    const payButton = page.getByRole('button', { name: /Pay with Sandbox/i });
    await expect(payButton).toBeVisible();
    await expect(payButton).toBeEnabled();
    
    console.log('Checkout flow completed successfully with coupon applied');
  });
});
```

### Phân Tích Từng Dòng

#### Dòng 1-4: Import Dependencies

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';
```

**Giải thích:**
- Import test framework và 3 page objects
- CartPage cho giỏ hàng operations

#### Dòng 6-15: Test Describe và BeforeEach

```typescript
test.describe('Checkout Flow with Coupon (POM)', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);
  });
```

**Giải thích:**
- Khởi tạo 3 page objects
- Mỗi test có instance mới

#### Dòng 17-25: Step 1 - Login

```typescript
await homePage.goto();
await homePage.clickLoginButton();
await loginPage.login('user_test@shopcart.dev', 'User123');

await page.waitForURL('/', { timeout: 10000 });
await expect(page.getByText('Sign in')).not.toBeVisible();
```

**Giải thích:**
- Login với user thường (không phải admin)
- Verify login success

**Data Flow:**
```
goto('/') → clickLoginButton() → login() → POST /api/auth/login → JWT token → Save localStorage → Redirect home → Verify 'Sign in' not visible
```

#### Dòng 27-41: Step 2 - Add to Cart

```typescript
await homePage.waitForProducts();
await homePage.clickFirstProduct();
await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });

const addToCartButton = page.getByRole('button', { name: /add to cart/i });
await expect(addToCartButton).toBeVisible();
await addToCartButton.click();

await page.waitForTimeout(1000);
await expect(homePage.cartBadge).toHaveText('1');
```

**Giải thích:**
- Navigate đến product
- Click "Add to cart"
- Wait 1 giây cho debounced action
- Verify cart badge shows "1"

**Tại sao waitForTimeout?**
- Debounced action trong frontend (useDebouncedCallback)
- Zustand persist cần time để save
- UI re-render cần time

**Data Flow:**
```
clickFirstProduct() → /product/1 → addToCartButton.click() → cartStore.addItem() → Zustand persist → localStorage → UI re-render → Cart badge: "1"
```

#### Dòng 43-45: Step 3 - Navigate to Checkout

```typescript
await page.goto('/checkout');
await page.waitForLoadState('networkidle');
```

**Giải thích:**
- Navigate trực tiếp đến `/checkout`
- Đợi network idle

**Data Flow:**
```
goto('/checkout') → CheckoutPage mounts → Load cart from Zustand → Load from localStorage if empty → Render form → API calls → networkidle
```

#### Dòng 47-52: Step 4 - Fill Shipping Info

```typescript
await page.getByLabel('Full name').fill('Test User');
await page.getByLabel('Address').fill('123 Test Street');
await page.getByLabel('City').fill('Test City');
await page.getByLabel('Postal code').fill('12345');
await page.getByLabel('Country').fill('Test Country');
```

**Giải thích:**
- `getByLabel()`: Tìm input với label
- `.fill()`: Điền text vào input

**Tại sao getByLabel?**
- Semantic: Label liên kết với input
- Accessible: Screen readers dùng label
- Standard HTML

**Data Flow:**
```
getByLabel('Full name').fill() → Find input → Type text → DOM updated → React state updated → Form state updated
```

#### Dòng 54-62: Step 5 - Apply Coupon

```typescript
const couponInput = page.getByPlaceholder('Try WELCOME10 or SAVE20');
await couponInput.fill('SAVE10');

const applyButton = page.getByRole('button', { name: 'Apply' });
await applyButton.click();

await expect(page.getByText(/SAVE10.*off applied/)).toBeVisible({ timeout: 5000 });
```

**Giải thích:**
- Fill coupon code "SAVE10"
- Click Apply button
- Verify UI shows "SAVE10 — 10% off applied"

**Regex: `/SAVE10.*off applied/`**
- `SAVE10`: Literal text
- `.*`: Any character (zero or more)
- Flexible match cho different formats

**Data Flow:**
```
fill('SAVE10') → applyButton.click() → POST /api/coupons/validate → Backend validates → Calculates discount → Response → Frontend updates order summary → UI shows applied
```

#### Dòng 64-73: Step 6 - Verify Order Summary

```typescript
await expect(page.getByText('Order summary')).toBeVisible();
await expect(page.getByText(/Discount/i)).toBeVisible();
await expect(page.getByText('Shipping', { exact: true })).toBeVisible();
```

**Giải thích:**
- Verify order summary section visible
- Verify discount shown
- Verify shipping fee shown

**exact: true**: Exact match "Shipping", không match "Shipping fee"

#### Dòng 75-83: Step 7 - Complete Checkout

```typescript
const payButton = page.getByRole('button', { name: /Pay with Sandbox/i });
await expect(payButton).toBeVisible();
await expect(payButton).toBeEnabled();
```

**Giải thích:**
- Verify pay button visible
- Verify button enabled (clickable)
- Test không thực sự click vì backend có thể không running

### Sequence Diagram - Checkout Flow

```
Playwright → Browser → Frontend → Backend
  │           │          │          │
  │goto('/')   │          │          │
  │──────────>│GET /     │          │
  │           │─────────>│GET /api/products
  │           │          │─────────>│
  │           │<─────────│Products  │
  │clickLogin()│          │          │
  │──────────>│/login     │          │
  │fillEmail()│Type email│          │
  │──────────>│          │          │
  │clickSignIn()│POST /api/auth/login
  │           │─────────>│─────────>│
  │           │<─────────│JWT token │
  │           │Save localStorage
  │waitForURL('/')│       │          │
  │<──────────│Redirect /│          │
  │clickFirstProduct()│   │          │
  │──────────>│/product/1│          │
  │           │─────────>│GET /api/products/1
  │           │          │─────────>│
  │           │<─────────│Product   │
  │addToCartButton.click()│         │
  │──────────>│cartStore.addItem()
  │           │Save localStorage
  │           │UI re-render
  │waitForTimeout(1000)│           │
  │<──────────│Cart badge: "1"      │
  │goto('/checkout')│      │          │
  │──────────>│/checkout │          │
  │           │Load cart │          │
  │fill('Full name')│     │          │
  │──────────>│Type text │          │
  │fill('SAVE10')│       │          │
  │──────────>│Type coupon│         │
  │applyButton.click()│   │          │
  │──────────>│POST /api/coupons/validate
  │           │─────────>│─────────>│
  │           │<─────────│Discount  │
  │           │Update summary│      │
  │expect(SAVE10...applied)│       │
  │──────────>│Visible ✓ │          │
  │expect(payButton).toBeEnabled()│
  │──────────>│Enabled ✓ │          │
```

### Process Mapping - Checkout Flow

```
1. SETUP: Initialize HomePage, LoginPage, CartPage
2. LOGIN: goto('/') → clickLoginButton() → login() → JWT token → Save localStorage → Redirect home
3. NAVIGATE PRODUCT: waitForProducts() → clickFirstProduct() → /product/1
4. ADD TO CART: addToCartButton.click() → cartStore.addItem() → Zustand persist → localStorage → Cart badge: "1"
5. NAVIGATE CHECKOUT: goto('/checkout') → Load cart from store → Render form
6. FILL SHIPPING: getByLabel().fill() cho từng field → Form state updated
7. APPLY COUPON: fill('SAVE10') → applyButton.click() → POST /api/coupons/validate → Discount calculated → UI updated
8. VERIFY SUMMARY: Order summary visible → Discount shown → Shipping shown
9. VERIFY PAYMENT: Pay button visible → Pay button enabled
```

---

## Ví Dù 3: AI Review Summary Flow (ai-flow.spec.ts)

### Full Code

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

test.describe('AI Review Summary Flow', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
  });

  test('should display AI Review Summary on product page', async ({ page }) => {
    // Step 1: Navigate to home page
    await homePage.goto();
    await homePage.waitForProducts();

    // Step 2: Click on first product to view details
    await homePage.clickFirstProduct();
    
    await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Step 3: Verify AI Review Summary section is visible
    const aiSummarySection = page.getByText('AI Review Summary');
    await expect(aiSummarySection).toBeVisible();

    // Step 4: Verify AI summary content is displayed
    const aiSummaryContent = page.getByText(/AI notes that customers love/);
    await expect(aiSummaryContent).toBeVisible();

    // Step 5: Verify Beta badge is shown
    const betaBadge = page.getByText('Beta');
    await expect(betaBadge).toBeVisible();

    console.log('AI Review Summary displayed successfully');
  });
});
```

### Phân Tích Từng Dòng

#### Dòng 1-4: Import Dependencies

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
```

**Giải thích:**
- Import Playwright và page objects
- LoginPage không dùng nhưng import cho consistency

#### Dòng 6-12: Test Describe và BeforeEach

```typescript
test.describe('AI Review Summary Flow', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
  });
```

**Giải thích:**
- Tương tự các test khác
- Khởi tạo page objects

#### Dòng 14-38: Test Case - Display AI Review Summary

```typescript
test('should display AI Review Summary on product page', async ({ page }) => {
  await homePage.goto();
  await homePage.waitForProducts();

  await homePage.clickFirstProduct();
  await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  const aiSummarySection = page.getByText('AI Review Summary');
  await expect(aiSummarySection).toBeVisible();

  const aiSummaryContent = page.getByText(/AI notes that customers love/);
  await expect(aiSummaryContent).toBeVisible();

  const betaBadge = page.getByText('Beta');
  await expect(betaBadge).toBeVisible();

  console.log('AI Review Summary displayed successfully');
});
```

**Phân tích từng dòng:**

#### Dòng 16-17: Step 1 - Navigate to Home

```typescript
await homePage.goto();
await homePage.waitForProducts();
```

**Giải thích:**
- Navigate đến trang chủ
- Đợi products load

**Data Flow:**
```
goto('/') → page.goto('/') → waitForLoadState('networkidle') → Products loaded from API → waitForProducts() → Products visible
```

#### Dòng 19-22: Step 2 - Navigate to Product

```typescript
await homePage.clickFirstProduct();
await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });
await page.waitForLoadState('networkidle');
```

**Giải thích:**
- Click product đầu tiên
- Đợi product page load
- Đợi network idle

**Data Flow:**
```
clickFirstProduct() → /product/1 → ProductPage mounts → Load product details → Load reviews → Render product info + reviews → AI Review Summary rendered
```

#### Dòng 24-26: Step 3 - Verify AI Summary Section

```typescript
const aiSummarySection = page.getByText('AI Review Summary');
await expect(aiSummarySection).toBeVisible();
```

**Giải thích:**
- `getByText('AI Review Summary')`: Tìm element với text chính xác
- Verify element visible

**Tại sao getByText?**
- Heading text thường unique
- Stable selector
- Easy to read

**Data Flow:**
```
getByText('AI Review Summary') → Find element → Check visibility → Pass if visible
```

#### Dòng 28-30: Step 4 - Verify AI Content

```typescript
const aiSummaryContent = page.getByText(/AI notes that customers love/);
await expect(aiSummaryContent).toBeVisible();
```

**Giải thích:**
- Regex pattern match
- Flexible cho different AI content

**Regex: `/AI notes that customers love/`**
- Match text chứa pattern này
- Ví dụ: "AI notes that customers love the build quality and battery life"

#### Dòng 32-34: Step 5 - Verify Beta Badge

```typescript
const betaBadge = page.getByText('Beta');
await expect(betaBadge).toBeVisible();
```

**Giải thích:**
- Verify badge "Beta" visible
- Indicate feature in beta/testing

### Sequence Diagram - AI Review Summary Flow

```
Playwright → Browser → Frontend → Backend
  │           │          │          │
  │goto('/')   │          │          │
  │──────────>│GET /     │          │
  │           │─────────>│GET /api/products
  │           │          │─────────>│
  │           │<─────────│Products  │
  │clickFirstProduct()│   │          │
  │──────────>│/product/1│          │
  │           │─────────>│GET /api/products/1
  │           │          │─────────>│
  │           │<─────────│Product   │
  │           │          │GET /api/products/1/reviews
  │           │          │─────────>│
  │           │<─────────│Reviews   │
  │           │Render product + reviews
  │           │Render AI Review Summary
  │expect(AI Review Summary)│       │
  │──────────>│Visible ✓ │          │
  │expect(AI notes that...)│       │
  │──────────>│Visible ✓ │          │
  │expect(Beta)│          │          │
  │──────────>│Visible ✓ │          │
```

### Process Mapping - AI Review Summary Flow

```
1. SETUP: Initialize HomePage, LoginPage
2. NAVIGATE HOME: goto('/') → Products loaded from API
3. NAVIGATE PRODUCT: clickFirstProduct() → /product/1 → Load product details → Load reviews → Render AI Review Summary
4. VERIFY AI SECTION: getByText('AI Review Summary') → Visible
5. VERIFY AI CONTENT: getByText(/AI notes that customers love/) → Visible
6. VERIFY BETA BADGE: getByText('Beta') → Visible
```

---

## Tóm Tắt Các Page Objects

### HomePage.ts

```typescript
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
```

**Locators sử dụng:**
- `page.locator('[data-testid="..."]')`: CSS selector với data-testid
- `page.getByTestId('...')`: Playwright's getByTestId
- `page.getByLabel('...')`: Tìm bằng label attribute
- `page.getByRole('link', { name: ... })`: Tìm bằng ARIA role

### LoginPage.ts

```typescript
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
    await this.page.waitForTimeout(1000);
    
    if (loginResponseStatus === 401) {
      throw new Error(`Login failed with 401 Unauthorized. Response: ${loginResponseBody}`);
    }
    
    return { status: loginResponseStatus, body: loginResponseBody };
  }
}
```

**Locators sử dụng:**
- `page.locator('#email')`: CSS selector với id
- `page.locator('#password')`: CSS selector với id
- `page.getByRole('button', { name: 'Sign in' })`: ARIA role

**Feature đặc biệt:**
- Monitor API response với `page.on('response', ...)`
- Fail fast nếu login failed (401)
- Debug logging

### CartPage.ts

```typescript
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
```

**Locators sử dụng:**
- `page.locator('[data-testid="cart-item"]')`: Cart items
- `page.getByTestId('cart-total')`: Cart total
- `page.getByRole('button', { name: /checkout/i })`: Regex match

---

## Playwright Config (playwright.config.ts)

```typescript
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
        contextOptions: {
          javaScriptEnabled: true,
        },
      },
    },
  ],
  webServer: undefined,
  globalSetup: require.resolve('./coverage-setup.ts'),
});
```

**Giải thích cấu hình:**

- `testDir: './tests'`: Thư mục chứa test files
- `fullyParallel: false`: Chạy test sequentially (không parallel)
- `retries: process.env.CI ? 2 : 0`: Retry 2 lần ở CI, 0 lần local
- `workers: 1`: Chạy với 1 worker
- `reporter`: Line reporter + HTML reporter
- `timeout: 60000`: Timeout 60 giây cho mỗi test
- `baseURL`: Base URL cho application (default http://localhost:8080)
- `trace: 'on-first-retry'`: Capture trace khi retry
- `screenshot: 'only-on-failure'`: Chụp screenshot khi fail
- `headless: true`: Chạy không có GUI
- `projects: [{ name: 'chromium' }]`: Chạy trên Chromium browser
- `globalSetup`: Setup file cho coverage

---

## Best Practices Cho E2E Testing

### 1. Sử Dụng Page Object Model

**Tại sao?**
- Tái sử dụng code
- Bảo trì dễ dàng
- Tách biệt logic

**Ví dụ:**
```typescript
// ❌ Bad: Direct selectors in test
await page.locator('[data-testid="product-card"]').first().click();

// ✅ Good: Use page object
await homePage.clickFirstProduct();
```

### 2. Sử Dụng Stable Locators

**Priority:**
1. `data-testid`: Most stable
2. `getByRole()`: Accessible
3. `getByLabel()`: Semantic
4. `getByText()`: Can change
5. CSS selectors: Fragile

**Ví dụ:**
```typescript
// ❌ Bad: CSS class can change
await page.locator('.btn-primary').click();

// ✅ Good: data-testid stable
await page.getByTestId('submit-button').click();

// ✅ Good: getByRole accessible
await page.getByRole('button', { name: 'Submit' }).click();
```

### 3. Wait Cho Element

**Tại sao?**
- Tránh flaky tests
- Đợi element render
- Đợi API calls

**Ví dụ:**
```typescript
// ❌ Bad: No wait
await page.click('#button');

// ✅ Good: Wait for element
await expect(page.getByTestId('button')).toBeVisible();
await page.getByTestId('button').click();

// ✅ Good: Wait for URL
await page.waitForURL('/dashboard');
```

### 4. Use Assertions

**Tại sao?**
- Verify expected behavior
- Catch regressions
- Document expectations

**Ví dụ:**
```typescript
// ❌ Bad: No assertion
await page.click('#button');

// ✅ Good: With assertion
await page.click('#button');
await expect(page.getByText('Success')).toBeVisible();
```

### 5. Debug với Console.log

**Tại sao?**
- Troubleshoot failures
- Understand flow
- Log state

**Ví dụ:**
```typescript
console.log('Page content:', await page.content());
console.log('Current URL:', page.url());
console.log('Stock:', await stockElement.textContent());
```

### 6. Handle Timeouts

**Tại sao?**
- Avoid indefinite waits
- Fail fast
- Configurable

**Ví dụ:**
```typescript
// Default timeout
await page.waitForURL('/', { timeout: 30000 });

// Custom timeout
await expect(element).toBeVisible({ timeout: 5000 });
```

### 7. Test Isolation

**Tại sao?**
- Tests không phụ thuộc nhau
- Có thể chạy riêng lẻ
- Dễ debug

**Ví dụ:**
```typescript
// ✅ Good: beforeEach cleanup
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/');
});
```

---

## Key Insights

1. **E2E Testing mô phỏng user behavior**: Click, type, navigate như user thật
2. **Playwright mạnh mẽ**: Multi-browser support, auto-wait, trace, screenshot
3. **POM pattern**: Tái sử dụng code, bảo trì dễ dàng
4. **Stable locators**: Ưu tiên data-testid, getByRole, getByLabel
5. **Assertions**: Verify expected behavior
6. **Waits**: Đợi element render, URL change, network idle
7. **Debug**: Console.log, trace, screenshot khi fail
8. **Isolation**: Mỗi test independent, cleanup trong beforeEach
