# Hướng dẫn viết Vitest Test - Cách tư duy và Data Flow trong Project

## Phần 1: Data Flow và Mapping Process trong Project

### 1.1 Kiến trúc tổng quan của Frontend Project

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  Components  │───▶│    Stores     │───▶│ API Service  │ │
│  │  (UI Layer)  │    │  (Zustand)   │    │  (fetch)      │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                   │                   │           │
│         │                   │                   ▼           │
│         │                   │            ┌──────────────┐  │
│         │                   │            │   Backend    │  │
│         │                   │            │ (Spring Boot)│  │
│         │                   │            └──────────────┘  │
│         │                   │                                 │
│         ▼                   ▼                                 │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │   Utilities  │    │    Hooks     │                       │
│  │  (pure fns)  │    │ (React)      │                       │
│  └──────────────┘    └──────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Chi tiết

#### Flow 1: User thêm sản phẩm vào giỏ hàng

```
User click "Add to Cart"
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Component (ProductCard.tsx)                               │
│ - User click button                                        │
│ - Gọi: useCartStore.getState().addItem(product, 1)       │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Store (cart-store.ts) - Zustand                          │
│ - Kiểm tra product đã có trong cart chưa                 │
│ - Nếu có: tăng quantity                                   │
│ - Nếu chưa: thêm mới                                      │
│ - Cap quantity tại stockQuantity                          │
│ - Update state                                            │
│ - Persist vào localStorage                               │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Component Re-render                                       │
│ - Header component nhận state mới                         │
│ - Cart badge update số lượng                              │
└─────────────────────────────────────────────────────────┘
```

**Vitest test cho flow này:**
```typescript
// cart-store.test.ts
describe('addItem', () => {
  it('should add a new item to the cart', () => {
    // Arrange: Chuẩn bị product
    const product = { id: '1', name: 'Test', price: 100, stockQuantity: 10, ... };
    
    // Act: Gọi addItem
    useCartStore.getState().addItem(product, 1);
    
    // Assert: Kiểm tra kết quả
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });
});
```

---

#### Flow 2: User login

```
User nhập email/password
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Component (LoginPage.tsx)                                │
│ - User submit form                                       │
│ - Gọi: useAuthStore.getState().login(email, password)    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Store (auth-store.ts) - Zustand                          │
│ - Gọi purgeSession() để clear data cũ                    │
│ - Gọi apiFetch('/api/auth/login', { method: 'POST' })   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ API Service (api-service.ts)                            │
│ - Lấy token từ localStorage (nếu có)                     │
│ - Thêm Authorization header                               │
│ - Gọi fetch đến backend                                  │
│ - Handle error (401, 404, 500, network error)            │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Backend (Spring Boot)                                    │
│ - Validate credentials                                    │
│ - Return user + token                                     │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Store update state                                       │
│ - Set user, token                                        │
│ - Persist vào localStorage                               │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Component Re-render                                       │
│ - Header hiển thị user avatar thay vì login button       │
│ - Admin links xuất hiện nếu role = ADMIN                 │
└─────────────────────────────────────────────────────────┘
```

**Vitest test cho flow này:**
```typescript
// auth-store.test.ts
describe('login', () => {
  it('should set user and token after successful login', async () => {
    // Arrange: Mock apiFetch trả về user + token
    vi.mocked(apiFetch).mockResolvedValueOnce({
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'USER' },
      token: 'test-token-123'
    });
    
    // Act: Gọi login
    await useAuthStore.getState().login('test@example.com', 'password');
    
    // Assert: Kiểm tra state
    expect(useAuthStore.getState().user).toBeDefined();
    expect(useAuthStore.getState().token).toBe('test-token-123');
  });
});
```

---

### 1.3 Mapping Process: Vitest test từng layer như thế nào?

| Layer | File trong project | Vitest test file | Test cái gì? | Tại sao test riêng? |
|-------|-------------------|-----------------|--------------|---------------------|
| **Component** | Header.tsx, ProductCard.tsx | Header.test.tsx, card.test.tsx | UI rendering, props, user interaction | Component phụ thuộc vào store → cần mock store để test riêng |
| **Store** | cart-store.ts, auth-store.ts | cart-store.test.ts, auth-store.test.ts | State logic, actions, getters | Store là business logic → cần test kỹ các edge cases |
| **API Service** | api-service.ts | api-service.test.ts | Fetch logic, error handling, token handling | API service là gateway → cần test error cases |
| **Utility** | format.ts, coupon-utils.ts | format.test.ts, coupon-utils.test.ts | Pure functions | Pure functions dễ test → test nhiều edge cases |
| **Hook** | use-debounced-callback.ts | use-debounced-callback.test.ts | Custom React hooks | Hooks có state/timer → cần test behavior |

---

## Phần 2: Điểm mạnh của Vitest và Tại sao Test Nhanh Hơn?

### 2.1 Điểm mạnh của Vitest

#### 1. **Tốc độ cực nhanh (Blazing Fast)**

**Tại sao nhanh?**
- Chạy trong **jsdom** (mock browser) → không cần mở browser thật
- Không load CSS, images, fonts
- Không execute JavaScript của browser thật
- Parallel execution: chạy nhiều test cùng lúc

**So sánh thời gian:**
```
Vitest (Unit Test):    ~100ms cho 135 test cases
Playwright (E2E Test): ~30s cho 5 test cases
```

**Ví dụ thực tế:**
```typescript
// Vitest - chạy trong jsdom
it('should add item to cart', () => {
  // Chạy logic thuần, không render UI
  useCartStore.getState().addItem(product, 1);
  expect(items).toHaveLength(1);
});
// Thời gian: < 1ms

// Playwright - phải mở browser thật
test('should add item to cart', async ({ page }) => {
  await page.goto('/products/1');
  await page.click('[data-testid="add-to-cart"]');
  // Phải load toàn bộ page, CSS, images...
  // Thời gian: ~3-5s
});
```

---

#### 2. **Isolation (Tách biệt hoàn toàn)**

**Tại sao quan trọng?**
- Mỗi test chạy độc lập, không ảnh hưởng lẫn nhau
- Fail ở test A không làm fail test B
- Dễ debug: biết chính xác test nào fail

**Ví dụ:**
```typescript
// Test 1: Test thêm item
it('should add item to cart', () => {
  useCartStore.getState().addItem(product, 1);
  expect(items).toHaveLength(1);
});

// Test 2: Test xóa item
it('should remove item from cart', () => {
  // KHÔNG bị ảnh hưởng bởi Test 1
  // Mỗi test có state riêng
  useCartStore.getState().removeItem('1');
  expect(items).toHaveLength(0);
});
```

---

#### 3. **Mock dễ dàng**

**Tại sao quan trọng?**
- Test từng layer riêng lẻ
- Không phụ thuộc vào backend, database, external services
- Test nhanh vì không gọi API thật

**Ví dụ mock store:**
```typescript
// Header.test.tsx
vi.mock('@/stores/cart-store', () => ({
  useCartStore: vi.fn((selector) => selector({
    totalItems: () => 5,
  })),
}));

// Bây giờ test Header không phụ thuộc vào cart-store thật
// Test chỉ tập trung vào UI rendering
```

---

#### 4. **Coverage tốt hơn**

**Tại sao?**
- Unit test test từng hàm, từng branch logic
- Có thể test edge cases mà E2E test không test được
- Coverage cao hơn → code tin cậy hơn

**Ví dụ:**
```typescript
// Vitest có thể test:
it('should handle negative quantity', () => {
  useCartStore.getState().addItem(product, -5);
  // Test edge case này
});

// Playwright khó test:
// User không thể nhập -5 vào UI (input type="number" min="0")
// Nhưng backend có thể nhận -5 từ API call bị hack
```

---

### 2.2 Tại sao Vitest dễ hơn Playwright?

| Đặc điểm | Vitest | Playwright |
|----------|--------|------------|
| **Setup** | Chỉ cần import vitest | Cần install browser driver |
| **Cách viết** | Như code JavaScript thường | Phải học API của Playwright |
| **Debug** | Console.log, debugger bình thường | Phải dùng Playwright Inspector |
| **Tốc độ feedback** | Ngay lập tức (ms) | Chậm hơn (giây) |
| **Maintain** | Dễ thay đổi test khi code thay đổi | Khó hơn vì phụ thuộc vào UI |

---

## Phần 3: Cách Tư duy để Tạo `it()` và `describe()`

### 3.1 Mindset: Test là Documentation

**Quan điểm đúng:**
- Test không chỉ là kiểm tra code có chạy đúng không
- Test là **documentation** cho code
- Người khác đọc test sẽ hiểu code làm gì

**Ví dụ test tốt:**
```typescript
// ❌ Test tên không rõ ràng
it('test 1', () => {
  // ...
});

// ✅ Test tên mô tả rõ ràng behavior
it('should add a new item to the cart when product does not exist', () => {
  // Người đọc hiểu ngay: Thêm sản phẩm mới vào cart
});
```

---

### 3.2 Cách tư duy để viết `describe()`

#### Quy tắc 1: `describe()` = Nhóm các test case liên quan

**Tư duy:** "Những test nào liên quan đến nhau thì nhóm lại"

**Ví dụ từ cart-store.test.ts:**
```typescript
describe('Cart Store', () => {
  // Tất cả test về cart store đều ở đây
  
  describe('addItem', () => {
    // Tất cả test về addItem đều ở đây
    it('should add a new item', () => { ... });
    it('should increase quantity', () => { ... });
    it('should not exceed stock', () => { ... });
  });
  
  describe('removeItem', () => {
    // Tất cả test về removeItem đều ở đây
    it('should remove item', () => { ... });
    it('should not affect other items', () => { ... });
  });
});
```

**Tại sao nhóm như vậy?**
- Dễ tìm test khi cần sửa
- Dễ hiểu structure của code
- Dễ chạy test cụ thể (chạy nhóm addItem thôi)

---

#### Quy tắc 2: `describe()` lồng nhau theo hierarchy

**Tư duy:** "Từ chung → cụ thể"

**Ví dụ:**
```typescript
describe('Cart Store', () => {              // Level 1: Tên file/function chính
  describe('addItem', () => {                // Level 2: Tên action cụ thể
    describe('happy path', () => {            // Level 3: Scenario type
      it('should add new item', () => { ... });
      it('should increase quantity', () => { ... });
    });
    
    describe('edge cases', () => {            // Level 3: Scenario type
      it('should handle zero quantity', () => { ... });
      it('should handle negative quantity', () => { ... });
    });
    
    describe('error cases', () => {           // Level 3: Scenario type
      it('should handle missing product', () => { ... });
    });
  });
});
```

---

#### Quy tắc 3: `describe()` theo scenario type

**Tư duy:** "Phân loại test theo loại scenario"

**3 loại scenario phổ biến:**

1. **Happy Path**: Trường hợp thành công bình thường
2. **Edge Cases**: Trường hợp biên (zero, null, negative, large values)
3. **Error Cases**: Trường hợp lỗi (network error, invalid input)

**Ví dụ:**
```typescript
describe('addItem', () => {
  describe('happy path', () => {
    it('should add new item when product does not exist', () => { ... });
    it('should increase quantity when product already exists', () => { ... });
  });
  
  describe('edge cases', () => {
    it('should handle zero quantity', () => { ... });
    it('should handle negative quantity', () => { ... });
    it('should cap at stock limit', () => { ... });
    it('should handle zero stock', () => { ... });
  });
  
  describe('error cases', () => {
    it('should handle missing product data', () => { ... });
    it('should handle invalid product object', () => { ... });
  });
});
```

---

### 3.3 Cách tư duy để viết `it()`

#### Quy tắc 1: `it()` = Một scenario cụ thể

**Tư duy:** "Mỗi test chỉ test một scenario duy nhất"

**❌ Test sai (test nhiều scenario):**
```typescript
it('should handle cart operations', () => {
  useCartStore.getState().addItem(product, 1);  // Scenario 1
  useCartStore.getState().removeItem('1');      // Scenario 2
  useCartStore.getState().clear();              // Scenario 3
  // Test 3 scenario trong 1 test → khó debug
});
```

**✅ Test đúng (mỗi test 1 scenario):**
```typescript
it('should add a new item to the cart', () => {
  useCartStore.getState().addItem(product, 1);
  expect(items).toHaveLength(1);
});

it('should remove an item from the cart', () => {
  useCartStore.getState().addItem(product, 1);
  useCartStore.getState().removeItem('1');
  expect(items).toHaveLength(0);
});

it('should clear all items from the cart', () => {
  useCartStore.getState().addItem(product, 1);
  useCartStore.getState().clear();
  expect(items).toHaveLength(0);
});
```

---

#### Quy tắc 2: Tên `it()` theo pattern "should [action] when [condition]"

**Tư duy:** "Tên test phải mô tả rõ behavior"

**Pattern:**
```
should [hành động] khi [điều kiện]
```

**Ví dụ:**
```typescript
// ❌ Tên không rõ ràng
it('test add item', () => { ... });

// ✅ Tên rõ ràng
it('should add a new item to the cart when product does not exist', () => { ... });
it('should increase quantity when product already exists in cart', () => { ... });
it('should cap quantity at stock limit when adding more than available', () => { ... });
it('should return 0 for empty cart when calculating subtotal', () => { ... });
```

---

#### Quy tắc 3: Structure của `it()` = AAA (Arrange, Act, Assert)

**Tư duy:** "Tách biệt rõ ràng 3 bước"

**AAA Pattern:**
```
1. Arrange: Chuẩn bị dữ liệu
2. Act: Gọi hàm cần test
3. Assert: Kiểm tra kết quả
```

**Ví dụ:**
```typescript
it('should add a new item to the cart', () => {
  // Arrange: Chuẩn bị dữ liệu
  const product: Product = {
    id: '1',
    name: 'Test Product',
    price: 100,
    stockQuantity: 10,
    category: 'Electronics',
    description: 'Test',
    imageUrl: 'http://test.com/image.jpg',
  };

  // Act: Gọi hàm cần test
  useCartStore.getState().addItem(product, 1);

  // Assert: Kiểm tra kết quả
  const items = useCartStore.getState().items;
  expect(items).toHaveLength(1);
  expect(items[0].product.id).toBe('1');
  expect(items[0].quantity).toBe(1);
});
```

**Tại sao AAA quan trọng?**
- Dễ đọc: Người khác hiểu ngay flow của test
- Dễ debug: Biết chính xác bước nào fail
- Dễ maintain: Dễ thay đổi arrange khi cần

---

#### Quy tắc 4: Test theo input → output

**Tư duy:** "Cho input X, expect output Y"

**Ví dụ với function:**
```typescript
// Function cần test
function calculateDiscount(price: number, discountPercent: number): number {
  return price * (discountPercent / 100);
}

// Test theo input → output
it('should return 20 when price is 100 and discount is 20%', () => {
  // Input: price = 100, discountPercent = 20
  const result = calculateDiscount(100, 20);
  
  // Output: expect 20
  expect(result).toBe(20);
});

it('should return 0 when price is 0 regardless of discount', () => {
  // Input: price = 0, discountPercent = 50
  const result = calculateDiscount(0, 50);
  
  // Output: expect 0
  expect(result).toBe(0);
});
```

---

#### Quy tắc 5: Test theo state transition

**Tư duy:** "Từ state A → state B sau khi gọi action"

**Ví dụ với store:**
```typescript
it('should transition from empty cart to cart with 1 item', () => {
  // Initial state: Cart rỗng
  expect(useCartStore.getState().items).toHaveLength(0);
  
  // Action: Thêm item
  useCartStore.getState().addItem(product, 1);
  
  // Final state: Cart có 1 item
  expect(useCartStore.getState().items).toHaveLength(1);
});
```

---

### 3.4 Checklist để viết test tốt

Trước khi viết test, tự hỏi:

1. **Function này làm gì?** → Đặt tên `describe()` phù hợp
2. **Có những scenario nào?** → Happy path, edge cases, error cases
3. **Input là gì? Output là gì?** → Viết test theo input → output
4. **Có state transition không?** → Test từ state A → state B
5. **Có phụ thuộc gì không?** → Mock dependencies nếu cần
6. **Tên test có rõ ràng không?** → Dùng pattern "should [action] when [condition]"
7. **Test có độc lập không?** → Mỗi test 1 scenario, dùng `beforeEach` để reset

---

## Phần 4: Cấu trúc Chuẩn của File Vitest Test

### 4.1 Template cho Store Test

```typescript
// 1. Import từ vitest
import { describe, it, expect, beforeEach } from 'vitest';

// 2. Import store cần test
import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/types';

// 3. Bắt đầu với describe chính
describe('Cart Store', () => {
  
  // 4. Setup trước mỗi test
  beforeEach(() => {
    // Reset state để test độc lập
    useCartStore.getState().clear();
  });

  // 5. Nhóm theo action
  describe('addItem', () => {
    
    // 6. Happy path tests
    describe('happy path', () => {
      it('should add a new item when product does not exist', () => {
        // Arrange
        const product: Product = {
          id: '1',
          name: 'Test Product',
          price: 100,
          stockQuantity: 10,
          category: 'Electronics',
          description: 'Test',
          imageUrl: 'http://test.com/image.jpg',
        };

        // Act
        useCartStore.getState().addItem(product, 1);

        // Assert
        const items = useCartStore.getState().items;
        expect(items).toHaveLength(1);
        expect(items[0].product.id).toBe('1');
        expect(items[0].quantity).toBe(1);
      });

      it('should increase quantity when product already exists', () => {
        // Arrange
        const product: Product = { /* ... */ };
        useCartStore.getState().addItem(product, 1); // Add first

        // Act
        useCartStore.getState().addItem(product, 2); // Add more

        // Assert
        const items = useCartStore.getState().items;
        expect(items).toHaveLength(1);
        expect(items[0].quantity).toBe(3); // 1 + 2
      });
    });

    // 7. Edge case tests
    describe('edge cases', () => {
      it('should handle zero quantity', () => {
        const product: Product = { /* ... */ };
        
        useCartStore.getState().addItem(product, 0);
        
        const items = useCartStore.getState().items;
        expect(items).toHaveLength(0); // Không thêm
      });

      it('should cap quantity at stock limit', () => {
        const product: Product = {
          /* ... */
          stockQuantity: 5,
        };
        
        useCartStore.getState().addItem(product, 10); // Thử thêm 10
        
        const items = useCartStore.getState().items;
        expect(items[0].quantity).toBe(5); // Chỉ được 5
      });
    });

    // 8. Error case tests (nếu có)
    describe('error cases', () => {
      it('should handle missing product data', () => {
        const invalidProduct = null as any;
        
        expect(() => {
          useCartStore.getState().addItem(invalidProduct, 1);
        }).toThrow();
      });
    });
  });

  // 9. Lặp lại cho các action khác
  describe('removeItem', () => {
    beforeEach(() => {
      // Setup riêng cho nhóm removeItem nếu cần
    });

    it('should remove item from cart', () => {
      // ...
    });
  });
});
```

---

### 4.2 Template cho Component Test

```typescript
// 1. Import từ vitest và testing library
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// 2. Import component cần test
import { Header } from '@/components/Header';

// 3. Mock dependencies
vi.mock('@/stores/cart-store', () => ({
  useCartStore: vi.fn(),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

// 4. Mock router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

// 5. Bắt đầu test
describe('Header Component', () => {
  
  // 6. Setup trước mỗi test
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks
  });

  // 7. Test rendering với state khác nhau
  describe('rendering', () => {
    it('should show logo when cart is empty and user not logged in', () => {
      // Mock state
      vi.mocked(useCartStore).mockImplementation((selector: any) => selector({
        totalItems: () => 0,
      }));
      
      vi.mocked(useAuthStore).mockImplementation((selector: any) => selector({
        user: null,
        isAuthenticated: () => false,
        isAdmin: () => false,
        logout: vi.fn(),
      }));

      // Render component
      render(<Header />);

      // Assert
      expect(screen.getByText('ShopCart')).toBeInTheDocument();
    });

    it('should show cart badge when items in cart', () => {
      vi.mocked(useCartStore).mockImplementation((selector: any) => selector({
        totalItems: () => 5,
      }));
      
      vi.mocked(useAuthStore).mockImplementation((selector: any) => selector({
        user: null,
        isAuthenticated: () => false,
        isAdmin: () => false,
        logout: vi.fn(),
      }));

      render(<Header />);

      expect(screen.getByTestId('cart-badge')).toHaveTextContent('5');
    });

    it('should show user avatar when logged in', () => {
      vi.mocked(useCartStore).mockImplementation((selector: any) => selector({
        totalItems: () => 0,
      }));
      
      vi.mocked(useAuthStore).mockImplementation((selector: any) => selector({
        user: { name: 'Test User', email: 'test@example.com' },
        isAuthenticated: () => true,
        isAdmin: () => false,
        logout: vi.fn(),
      }));

      render(<Header />);

      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    });
  });

  // 8. Test user interaction
  describe('user interaction', () => {
    it('should call logout when sign out clicked', () => {
      const mockLogout = vi.fn();
      
      vi.mocked(useCartStore).mockImplementation((selector: any) => selector({
        totalItems: () => 0,
      }));
      
      vi.mocked(useAuthStore).mockImplementation((selector: any) => selector({
        user: { name: 'Test User', email: 'test@example.com' },
        isAuthenticated: () => true,
        isAdmin: () => false,
        logout: mockLogout,
      }));

      render(<Header />);

      // Click sign out button
      const signOutButton = screen.getByText('Sign out');
      signOutButton.click();

      // Assert
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
```

---

### 4.3 Template cho Utility Test (Pure Function)

```typescript
import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate } from '@/lib/format';

describe('Format Utilities', () => {
  
  describe('formatPrice', () => {
    
    describe('happy path', () => {
      it('should format positive integer correctly', () => {
        expect(formatPrice(100)).toBe('$100.00');
      });

      it('should format decimal correctly', () => {
        expect(formatPrice(99.99)).toBe('$99.99');
      });

      it('should format zero correctly', () => {
        expect(formatPrice(0)).toBe('$0.00');
      });
    });

    describe('edge cases', () => {
      it('should format large numbers with commas', () => {
        expect(formatPrice(1000000)).toBe('$1,000,000.00');
      });

      it('should round to 2 decimal places', () => {
        expect(formatPrice(10.123)).toBe('$10.12');
      });

      it('should handle negative numbers', () => {
        expect(formatPrice(-100)).toBe('-$100.00');
      });
    });

    describe('error cases', () => {
      it('should handle NaN', () => {
        expect(formatPrice(NaN)).toBe('$NaN.00');
      });

      it('should handle Infinity', () => {
        expect(formatPrice(Infinity)).toBe('$Infinity.00');
      });
    });
  });

  describe('formatDate', () => {
    // Similar structure for formatDate
  });
});
```

---

### 4.4 Template cho API Service Test

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiFetch, ApiError } from '@/lib/api-service';

describe('API Service', () => {
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    // Mock global fetch
    global.fetch = vi.fn();
  });

  describe('apiFetch', () => {
    
    describe('successful requests', () => {
      it('should make GET request and return data', async () => {
        // Arrange
        const mockData = { id: '1', name: 'Test' };
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        });

        // Act
        const result = await apiFetch('/api/products/1');

        // Assert
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8081/api/products/1',
          expect.objectContaining({
            method: 'GET',
          })
        );
      });

      it('should add Authorization header when token exists', async () => {
        // Arrange
        localStorage.setItem('shopcart_auth', JSON.stringify({
          state: { token: 'test-token' }
        }));
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

        // Act
        await apiFetch('/api/orders');

        // Assert
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token',
            }),
          })
        );
      });
    });

    describe('error handling', () => {
      it('should throw ApiError for 401 Unauthorized', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized' }),
        });

        await expect(apiFetch('/api/orders')).rejects.toThrow(ApiError);
      });

      it('should throw ApiError for network error', async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

        await expect(apiFetch('/api/products')).rejects.toThrow(ApiError);
      });
    });

    describe('route translation', () => {
      it('should translate POST /api/orders to /api/orders/checkout', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

        await apiFetch('/api/orders', { method: 'POST' });

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8081/api/orders/checkout',
          expect.any(Object)
        );
      });
    });
  });
});
```

---

## Phần 5: Test Từng Component là Như Thế Nào?

### 5.1 Khái niệm "Test Component"

**Test component** = Test UI layer riêng biệt, không phụ thuộc vào store, API, hay các dependency khác.

**Tại sao test component riêng?**
1. Component chỉ chịu trách nhiệm rendering UI
2. Component nhận props/state và render ra HTML
3. Test component = test rendering logic, không test business logic

---

### 5.2 Cách Test Component

#### Bước 1: Mock dependencies

Component phụ thuộc vào:
- Store (useCartStore, useAuthStore)
- Router (useNavigate, Link)
- External libraries (date-fns, etc.)

**Mock tất cả để test component riêng:**
```typescript
// Mock store
vi.mock('@/stores/cart-store', () => ({
  useCartStore: vi.fn((selector) => selector({
    totalItems: () => 5,
  })),
}));

// Mock router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
```

---

#### Bước 2: Test rendering với các state khác nhau

Component có thể render khác nhau tùy state:
- Cart rỗng vs cart có item
- User chưa login vs đã login
- User thường vs admin

**Test từng scenario:**
```typescript
describe('Header Component', () => {
  it('should render without cart badge when cart is empty', () => {
    vi.mocked(useCartStore).mockImplementation((selector) => selector({
      totalItems: () => 0,
    }));

    render(<Header />);

    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
  });

  it('should render with cart badge when cart has items', () => {
    vi.mocked(useCartStore).mockImplementation((selector) => selector({
      totalItems: () => 5,
    }));

    render(<Header />);

    expect(screen.getByTestId('cart-badge')).toHaveTextContent('5');
  });

  it('should render login button when user not authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) => selector({
      isAuthenticated: () => false,
    }));

    render(<Header />);

    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should render user avatar when user authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) => selector({
      isAuthenticated: () => true,
      user: { name: 'Test' },
    }));

    render(<Header />);

    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });
});
```

---

#### Bước 3: Test user interaction

Component có buttons, inputs, links → test khi user click/typing

**Ví dụ:**
```typescript
describe('Header Component', () => {
  it('should call logout when sign out clicked', () => {
    const mockLogout = vi.fn();
    
    vi.mocked(useAuthStore).mockImplementation((selector) => selector({
      isAuthenticated: () => true,
      logout: mockLogout,
    }));

    render(<Header />);

    // Find and click sign out button
    const signOutButton = screen.getByText('Sign out');
    signOutButton.click();

    // Assert logout was called
    expect(mockLogout).toHaveBeenCalled();
  });
});
```

---

### 5.3 Test Component vs Test Store

| Đặc điểm | Test Component | Test Store |
|----------|----------------|------------|
| **Test cái gì?** | UI rendering, user interaction | Business logic, state management |
| **Mock gì?** | Store, router, dependencies | Database, API (nếu cần) |
| **Tool gì?** | @testing-library/react | Vitest thuần |
| **Assertion gì?** | Element tồn tại, text content, class | State values, return values |
| **Ví dụ** | "Header hiển thị badge khi cart có item" | "addItem tăng quantity khi item đã tồn tại" |

---

### 5.4 Ví dụ thực tế: Test Card Component

```typescript
// card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

describe('Card Components', () => {
  
  describe('Card', () => {
    it('should render children content', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('CardHeader', () => {
    it('should render header content', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('should render title with correct tag', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H3'); // CardTitle renders <h3>
    });
  });

  describe('CardContent', () => {
    it('should render content text', () => {
      render(<CardContent>Content text</CardContent>);
      expect(screen.getByText('Content text')).toBeInTheDocument();
    });
  });

  describe('composed Card', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>Card content</CardContent>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });
  });
});
```

---

## Phần 6: Workflow Viết Test từ A-Z

### 6.1 Bước 1: Xác định cái cần test

**Câu hỏi:**
- Function này làm gì?
- Có những scenario nào?
- Input là gì? Output là gì?

**Ví dụ:**
```
Function: addItem(product, quantity)
- Thêm sản phẩm vào giỏ hàng
- Nếu sản phẩm đã có → tăng quantity
- Không vượt quá stockQuantity
```

---

### 6.2 Bước 2: Viết describe structure

```typescript
describe('addItem', () => {
  describe('happy path', () => {
    // Test trường hợp thành công
  });

  describe('edge cases', () => {
    // Test trường hợp biên
  });

  describe('error cases', () => {
    // Test trường hợp lỗi
  });
});
```

---

### 6.3 Bước 3: Viết test cases cho happy path

```typescript
describe('happy path', () => {
  it('should add new item when product does not exist', () => {
    // Arrange
    const product = createMockProduct();
    
    // Act
    useCartStore.getState().addItem(product, 1);
    
    // Assert
    expect(items).toHaveLength(1);
  });

  it('should increase quantity when product exists', () => {
    // Arrange
    const product = createMockProduct();
    useCartStore.getState().addItem(product, 1);
    
    // Act
    useCartStore.getState().addItem(product, 2);
    
    // Assert
    expect(items[0].quantity).toBe(3);
  });
});
```

---

### 6.4 Bước 4: Viết test cases cho edge cases

**Brainstorm edge cases:**
- Zero quantity?
- Negative quantity?
- Quantity > stock?
- Stock = 0?
- Product = null?

```typescript
describe('edge cases', () => {
  it('should handle zero quantity', () => {
    useCartStore.getState().addItem(product, 0);
    expect(items).toHaveLength(0);
  });

  it('should cap at stock limit', () => {
    const product = createMockProduct({ stockQuantity: 5 });
    useCartStore.getState().addItem(product, 10);
    expect(items[0].quantity).toBe(5);
  });

  it('should handle zero stock', () => {
    const product = createMockProduct({ stockQuantity: 0 });
    useCartStore.getState().addItem(product, 1);
    expect(items).toHaveLength(0);
  });
});
```

---

### 6.5 Bước 5: Chạy test và fix

```bash
npm test cart-store.test.ts
```

Nếu fail:
- Debug bằng console.log
- Kiểm tra arrange/act/assert
- Fix code hoặc fix test

---

### 6.6 Bước 6: Refactor test

Khi test pass, refactor để:
- DRY (Don't Repeat Yourself)
- Tạo helper functions
- Gộp similar tests

```typescript
// Before: Repeat code
it('should add new item', () => {
  const product = { id: '1', name: 'Test', price: 100, stockQuantity: 10, ... };
  useCartStore.getState().addItem(product, 1);
  expect(items).toHaveLength(1);
});

// After: Use helper
function createMockProduct(overrides = {}) {
  return {
    id: '1',
    name: 'Test Product',
    price: 100,
    stockQuantity: 10,
    category: 'Electronics',
    description: 'Test',
    imageUrl: 'http://test.com/image.jpg',
    ...overrides,
  };
}

it('should add new item', () => {
  const product = createMockProduct();
  useCartStore.getState().addItem(product, 1);
  expect(items).toHaveLength(1);
});
```

---

## Phần 7: Tips và Best Practices

### 7.1 Naming Conventions

**describe():**
- Dùng noun phrase (danh từ)
- Mô tả functionality, không phải implementation
- ✅ `describe('addItem')`
- ❌ `describe('when adding item')`

**it():**
- Dùng pattern "should [action] when [condition]"
- Mô tả behavior, không phải implementation
- ✅ `it('should add item when product does not exist')`
- ❌ `it('adds item')`
- ❌ `it('test 1')`

---

### 7.2 Test Independence

**Quy tắc:** Mỗi test phải chạy độc lập

**❌ Sai: Test phụ thuộc vào test khác**
```typescript
it('should add item', () => {
  useCartStore.getState().addItem(product, 1);
});

it('should remove item', () => {
  // Phụ thuộc vào test trước
  useCartStore.getState().removeItem('1');
});
```

**✅ Đúng: Mỗi test setup riêng**
```typescript
describe('removeItem', () => {
  beforeEach(() => {
    // Setup cho tất cả test trong nhóm này
    useCartStore.getState().addItem(product, 1);
  });

  it('should remove item', () => {
    useCartStore.getState().removeItem('1');
    expect(items).toHaveLength(0);
  });
});
```

---

### 7.3 Test Only Public API

**Quy tắc:** Chỉ test public functions, không test private/internal

**❌ Sai: Test internal implementation**
```typescript
it('should update items array directly', () => {
  // Test implementation detail - fragile
  expect(state.items).toBeInstanceOf(Array);
});
```

**✅ Đúng: Test public behavior**
```typescript
it('should return correct total items count', () => {
  // Test public API - stable
  expect(useCartStore.getState().totalItems()).toBe(5);
});
```

---

### 7.4 Avoid Test Implementation Details

**Quy tắc:** Test behavior, không test implementation

**❌ Sai: Test CSS class names**
```typescript
it('should have correct class', () => {
  const { container } = render(<Card />);
  expect(container.firstChild).toHaveClass('bg-white');
});
```

**✅ Đúng: Test user-visible behavior**
```typescript
it('should render card content', () => {
  render(<Card>Content</Card>);
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

---

### 7.5 Use Meaningful Test Data

**❌ Sai: Dùng data vô nghĩa**
```typescript
it('should add item', () => {
  const product = { id: 'x', name: 'y', price: 999 };
  // Data không mô tả rõ scenario
});
```

**✅ Đúng: Dùng data mô tả scenario**
```typescript
it('should add item with stock limit', () => {
  const product = {
    id: '1',
    name: 'Limited Stock Product',
    price: 100,
    stockQuantity: 5, // Rõ ràng là product có giới hạn stock
  };
});
```

---

## Phần 8: Câu hỏi và Trả lời cho Buổi Vấn Đáp

### Câu 1: Tại sao cần test component riêng khi đã test store?

**Trả lời:**
- Component và store có trách nhiệm khác nhau
- Component = UI rendering, Store = business logic
- Test component đảm bảo UI hiển thị đúng với props/state
- Test store đảm bảo logic đúng
- Cả 2 layer đều cần test để đảm bảo quality

---

### Câu 2: Tại sao mock dependencies khi test component?

**Trả lời:**
- Để test component riêng biệt (isolation)
- Component test không nên phụ thuộc vào store/API
- Mock cho phép test component với nhiều state khác nhau
- Test nhanh hơn vì không gọi store/API thật

---

### Câu 3: Cách xác định nên viết bao nhiêu test case?

**Trả lời:**
- Happy path: 1-2 test cases
- Edge cases: 1 test case cho mỗi edge case quan trọng
- Error cases: 1 test case cho mỗi error type
- Quy tắc chung: Test đủ để cover tất cả branches logic

---

### Câu 4: Tại sao vitest test nhanh hơn playwright?

**Trả lời:**
- Vitest chạy trong jsdom (mock browser) → không load CSS, images, fonts
- Playwright mở browser thật → phải load toàn bộ page
- Vitest test logic thuần → không render UI thật
- Playwright test toàn bộ flow → phải navigate, click, wait

---

### Câu 5: Cách tư duy để viết test case mới?

**Trả lời:**
1. Xác định function làm gì
2. Brainstorm scenarios (happy, edge, error)
3. Cho input X, expect output Y
4. Viết test theo AAA pattern
5. Đặt tên test mô tả behavior rõ ràng

---

## Phần 9: Lệnh Hữu Ích

### Chạy test

```bash
# Chạy tất cả test
npm test

# Chạy test trong watch mode
npm test -- --watch

# Chạy test cụ thể
npm test cart-store.test.ts

# Chạy test với coverage
npm test -- --coverage

# Chạy test trong UI mode
npm test -- --ui
```

---

## Phần 10: Kết luận

### Tóm tắt

1. **Data Flow:** Component → Store → API Service → Backend
2. **Mapping Process:** Test từng layer riêng biệt với mock dependencies
3. **Điểm mạnh Vitest:** Nhanh, isolation, mock dễ, coverage tốt
4. **Cách tư duy describe:** Nhóm test theo functionality/scenario
5. **Cách tư duy it:** Mỗi test 1 scenario, dùng AAA pattern
6. **Test Component:** Mock dependencies, test rendering và interaction
7. **Best Practices:** Test independence, test public API, avoid implementation details

### Lời khuyên cho buổi vấn đáp

- Nhấn mạnh vào **isolation** và **mock**
- Giải thích **AAA pattern** rõ ràng
- Cho ví dụ từ project của bạn
- Phân biệt **component test** vs **store test**

---

**Chúc bạn thành công với Vitest! 🚀**
