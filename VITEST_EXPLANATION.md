# Giải thích chi tiết về Vitest - Framework Unit Test cho Frontend

## Tóm tắt nhanh cho buổi vấn đáp

**Câu hỏi:** Tại sao có hơn 100 bài test vitest trong project?

**Trả lời:** Vitest đếm test theo số lượng **test case** (mỗi lệnh `it()` là 1 test), không phải theo số file. Mỗi file test có thể chứa nhiều test case để cover các trường hợp khác nhau. Project hiện có khoảng **140 test cases** phân bố trong 10 file test.

---

## Phần 1: Vitest là gì?

### Định nghĩa cơ bản

**Vitest** là một framework test (công cụ kiểm thử) dành cho JavaScript/TypeScript, được thiết kế đặc biệt cho các project dùng Vite. Nó dùng để viết **unit test** - test kiểm tra từng phần nhỏ của code (hàm, component, store) riêng biệt.

### Tại sao cần Vitest?

Giả sử bạn có một hàm cộng hai số:
```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

Làm sao bạn biết hàm này hoạt động đúng? Bạn có thể:
- Chạy code thủ công mỗi lần thay đổi → Chậm, dễ quên
- Dùng Vitest để tự động kiểm tra → Nhanh, đáng tin cậy

### Vitest so với các loại test khác

| Loại test | Framework | Test cái gì? | Ví dụ trong project |
|-----------|-----------|--------------|---------------------|
| **Unit Test** | Vitest | Từng hàm, component, store riêng lẻ | Test hàm `add()`, test `cart-store` |
| **E2E Test** | Playwright | Toàn bộ flow từ đầu đến cuối | Test flow checkout hoàn chỉnh |
| **Coverage Tool** | Jacoco | Đo lường % code được test | Không phải test framework |

---

## Phần 2: Cấu trúc cơ bản của một file Vitest Test

### Cấu trúc chuẩn

Một file test vitest có cấu trúc như sau:

```typescript
// 1. Import các hàm từ vitest
import { describe, it, expect, beforeEach } from 'vitest';

// 2. Import code cần test
import { myFunction } from './my-file';

// 3. Bắt đầu viết test
describe('Tên nhóm test', () => {
  // Setup trước mỗi test (tùy chọn)
  beforeEach(() => {
    // Reset state, clear data...
  });

  // Test case 1
  it('nên làm gì đó khi input là X', () => {
    // Arrange: Chuẩn bị dữ liệu
    const input = 5;
    
    // Act: Gọi hàm cần test
    const result = myFunction(input);
    
    // Assert: Kiểm tra kết quả
    expect(result).toBe(10);
  });

  // Test case 2
  it('nên làm gì khác khi input là Y', () => {
    // ...
  });
});
```

### Giải thích từng phần

#### 1. Import từ vitest

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
```

- `describe`: Dùng để **nhóm** các test case lại với nhau theo chủ đề
- `it` hoặc `test`: Định nghĩa **một test case** (đây là cái được vitest đếm)
- `expect`: Dùng để **kiểm tra** kết quả (assertion)
- `beforeEach`: Chạy code **trước mỗi test case** (để reset state)

#### 2. describe - Nhóm test case

```typescript
describe('Cart Store', () => {
  // Tất cả test case bên trong đều liên quan đến Cart Store
});
```

- `describe` **KHÔNG** được tính là test case
- Nó chỉ dùng để tổ chức code cho dễ đọc
- Có thể lồng `describe` trong `describe`

#### 3. it/test - Định nghĩa test case

```typescript
it('should add a new item to the cart', () => {
  // Code test ở đây
});
```

- Mỗi `it()` là **1 test case** (được vitest đếm)
- Tên test case nên mô tả rõ ràng: "should [hành động] khi [điều kiện]"
- Có thể dùng `test()` thay cho `it()` (cả hai đều giống nhau)

#### 4. expect - Kiểm tra kết quả

```typescript
expect(result).toBe(10);           // Kiểm tra bằng nhau
expect(items).toHaveLength(1);     // Kiểm tra độ dài mảng
expect(value).toBeGreaterThan(5);  // Kiểm tra lớn hơn
expect(func).toThrow();            // Kiểm tra có throw error không
```

---

## Phần 3: Cách Vitest đếm Test Cases (QUAN TRỌNG)

### Quy tắc đếm

**Vitest đếm theo số lượng lệnh `it()` hoặc `test()`, không đếm `describe()`**

### Ví dụ minh họa

#### Ví dụ 1: File đơn giản

```typescript
import { describe, it, expect } from 'vitest';

describe('Math Utils', () => {
  it('should add two numbers', () => {
    expect(2 + 2).toBe(4);
  });

  it('should subtract two numbers', () => {
    expect(5 - 3).toBe(2);
  });

  it('should multiply two numbers', () => {
    expect(3 * 4).toBe(12);
  });
});
```

**Kết quả:** 3 test cases (3 lệnh `it()`)

---

#### Ví dụ 2: Describe lồng nhau

```typescript
import { describe, it, expect } from 'vitest';

describe('Cart Store', () => {           // ❌ Không đếm
  describe('addItem', () => {             // ❌ Không đếm
    it('should add new item', () => {     // ✅ 1 test case
      // ...
    });

    it('should increase quantity', () => { // ✅ 1 test case
      // ...
    });
  });

  describe('removeItem', () => {          // ❌ Không đếm
    it('should remove item', () => {     // ✅ 1 test case
      // ...
    });
  });
});
```

**Kết quả:** 3 test cases (3 lệnh `it()`)

---

#### Ví dụ 3: Test với beforeEach

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset state trước mỗi test
    localStorage.clear();
  });

  it('should return false when not authenticated', () => {
    // ✅ 1 test case
    expect(isAuthenticated()).toBe(false);
  });

  it('should return true when token exists', () => {
    // ✅ 1 test case
    localStorage.setItem('token', 'abc');
    expect(isAuthenticated()).toBe(true);
  });
});
```

**Kết quả:** 2 test cases (2 lệnh `it()`)

---

### Đếm test cases trong project của bạn

Dưới đây là cách đếm test cases trong từng file:

#### File: `cart-store.test.ts`

```typescript
describe('Cart Store', () => {
  describe('addItem', () => {
    it('should add a new item to the cart', () => { ... });        // 1
    it('should increase quantity if item already exists', () => { ... }); // 2
    it('should not exceed stock quantity', () => { ... });         // 3
    it('should add multiple different items', () => { ... });       // 4
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => { ... });             // 5
    it('should not affect other items when removing one', () => { ... }); // 6
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => { ... });              // 7
    it('should remove item if quantity is 0 or less', () => { ... }); // 8
    it('should not exceed stock quantity', () => { ... });         // 9
  });

  describe('clear', () => {
    it('should clear all items', () => { ... });                   // 10
  });

  describe('totalItems', () => {
    it('should calculate total items correctly', () => { ... });    // 11
    it('should return 0 for empty cart', () => { ... });          // 12
  });

  describe('subtotal', () => {
    it('should calculate subtotal correctly', () => { ... });      // 13
    it('should return 0 for empty cart', () => { ... });          // 14
    it('should handle decimal prices correctly', () => { ... });   // 15
    it('should handle zero price items', () => { ... });           // 16
  });

  describe('edge cases', () => {
    it('should handle adding item with quantity 0', () => { ... }); // 17
    it('should handle adding item with negative quantity', () => { ... }); // 18
    it('should not add item when already at max stock quantity', () => { ... }); // 19
    it('should use default quantity of 1 when not specified', () => { ... }); // 20
    it('should handle updating to exact stock quantity', () => { ... }); // 21
    it('should handle removing non-existent item gracefully', () => { ... }); // 22
    it('should handle updating quantity of non-existent item', () => { ... }); // 23
    it('should handle clearing empty cart', () => { ... });         // 24
  });

  describe('Stock Validation', () => {
    it('should cap quantity at stock limit when adding new item', () => { ... }); // 25
    it('should cap quantity at stock limit when updating existing item', () => { ... }); // 26
    it('should not increase quantity when already at stock limit', () => { ... }); // 27
    it('should handle adding to existing item without exceeding stock', () => { ... }); // 28
    it('should cap at stock limit when adding to existing item', () => { ... }); // 29
    it('should handle zero stock (cannot add item)', () => { ... }); // 30
    it('should handle updating to exact stock quantity', () => { ... }); // 31
    it('should prevent adding more than one item when stock is 1', () => { ... }); // 32
    it('should handle multiple items with different stock limits', () => { ... }); // 33
  });
});
```

**Tổng:** 33 test cases trong file này

---

## Phần 4: Phân tích chi tiết các nhóm test trong project

### Tổng quan

| File test | Số test cases | Nhóm chức năng |
|-----------|--------------|----------------|
| `cart-store.test.ts` | 33 | Giỏ hàng (Zustand store) |
| `auth-store.test.ts` | 18 | Xác thực (Zustand store) |
| `coupon-utils.test.ts` | 17 | Coupon & tính toán đơn hàng |
| `api-service.test.ts` | 18 | Gọi API backend |
| `order-state-machine.test.ts` | 16 | Trạng thái đơn hàng |
| `utils.test.ts` | 8 | Utility functions |
| `format.test.ts` | 7 | Format giá & ngày |
| `use-debounced-callback.test.ts` | 7 | React hook |
| `card.test.tsx` | 6 | UI Component |
| `Header.test.tsx` | 5 | UI Component |
| **Tổng** | **~135** | |

---

### Nhóm 1: Store Tests (Zustand State Management)

#### File: `cart-store.test.ts` (33 test cases)

**Mục đích:** Test giỏ hàng - quản lý sản phẩm trong giỏ hàng

**Các chức năng được test:**
- `addItem`: Thêm sản phẩm vào giỏ
- `removeItem`: Xóa sản phẩm khỏi giỏ
- `updateQuantity`: Cập nhật số lượng
- `clear`: Xóa toàn bộ giỏ
- `totalItems`: Tính tổng số lượng sản phẩm
- `subtotal`: Tính tổng tiền

**Tại sao có nhiều test?**

Mỗi chức năng cần test nhiều trường hợp:

```typescript
// Ví dụ: Test addItem
it('should add a new item to the cart', () => {
  // Happy path: Thêm sản phẩm bình thường
});

it('should increase quantity if item already exists', () => {
  // Edge case: Sản phẩm đã có trong giỏ → tăng số lượng
});

it('should not exceed stock quantity', () => {
  // Edge case: Số lượng vượt quá stock → giới hạn
});

it('should add multiple different items', () => {
  // Edge case: Thêm nhiều sản phẩm khác nhau
});
```

**Tại sao có test "negative quantity"?**

```typescript
it('should handle adding item with negative quantity', () => {
  // Đây KHÔNG phải chức năng được support
  // Mà là test để đảm bảo app không crash khi user cố tình nhập số âm
  // Ví dụ: User hack browser, nhập -5 vào input
  // App nên handle gracefully (không crash, có thể reject hoặc log error)
});
```

---

#### File: `auth-store.test.ts` (18 test cases)

**Mục đích:** Test xác thực - login, logout, kiểm tra quyền

**Các chức năng được test:**
- `isAuthenticated`: Kiểm tra user đã login chưa
- `isAdmin`: Kiểm tra user có phải admin không
- `logout`: Đăng xuất
- `setIdToken`: Set Firebase token
- `purgeSession`: Xóa toàn bộ session (cart, localStorage)

**Ví dụ test:**

```typescript
describe('isAuthenticated', () => {
  it('should return true when token exists', () => {
    useAuthStore.setState({ token: 'valid-token', user: null });
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('should return false when token is null', () => {
    useAuthStore.setState({ token: null, user: null });
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('should return false when token is empty string', () => {
    // Edge case: Token rỗng cũng coi như chưa login
    useAuthStore.setState({ token: '', user: null });
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });
});
```

---

### Nhóm 2: Utility Tests (Hàm tiện ích)

#### File: `utils.test.ts` (8 test cases)

**Mục đích:** Test function `cn()` - merge class names (cho Tailwind CSS)

```typescript
describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes with undefined/null', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
  });

  it('should handle conflicting tailwind classes correctly', () => {
    // px-2 và px-4 conflict → px-4 wins (Tailwind rule)
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle objects with boolean values', () => {
    // { foo: true, bar: false } → chỉ lấy foo
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should handle mixed inputs', () => {
    expect(cn('foo', { bar: true, baz: false }, ['qux'])).toBe('foo bar qux');
  });

  it('should return empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});
```

**Tại sao cần nhiều test?** Function `cn()` nhận nhiều loại input khác nhau (string, array, object) → cần test từng loại.

---

#### File: `format.test.ts` (7 test cases)

**Mục đích:** Test format giá tiền và ngày tháng

```typescript
describe('formatPrice', () => {
  it('should format positive numbers correctly', () => {
    expect(formatPrice(100)).toBe('$100.00');
    expect(formatPrice(99.99)).toBe('$99.99');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should format large numbers correctly', () => {
    expect(formatPrice(1000)).toBe('$1,000.00');
    expect(formatPrice(1000000)).toBe('$1,000,000.00');
  });

  it('should handle decimal places correctly', () => {
    expect(formatPrice(10.5)).toBe('$10.50');
    expect(formatPrice(10.123)).toBe('$10.12'); // Round to 2 decimals
  });

  it('should format negative numbers', () => {
    expect(formatPrice(-100)).toBe('-$100.00');
  });
});

describe('formatDate', () => {
  it('should format ISO date string correctly', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date);
    expect(formatted).toMatch(/\w+ \d+, \d{4}/); // "January 15, 2024"
  });

  it('should handle different date formats', () => { ... });
  it('should handle leap years', () => { ... });
});
```

---

#### File: `coupon-utils.test.ts` (17 test cases)

**Mục đích:** Test logic coupon - tính discount, validate coupon

**Các chức năng:**
- `calculateOrderTotals`: Tính tổng tiền sau khi áp dụng coupon
- `isCouponValid`: Kiểm tra coupon có hợp lệ không
- `applyDiscount`: Áp dụng discount vào giá

**Ví dụ test:**

```typescript
describe('calculateOrderTotals', () => {
  it('should calculate discount for PERCENT coupon', () => {
    const coupon: Coupon = {
      id: 1,
      code: 'PERCENT20',
      type: 'PERCENT',
      value: 20, // 20% off
      expiryDate: futureDate.toISOString(),
      active: true,
      // ...
    };

    const result = calculateOrderTotals(100, coupon);

    expect(result.discount).toBe(20); // 20% của 100 = 20
    expect(result.shippingFee).toBe(50000);
    expect(result.total).toBe(100 - 20 + 50000); // 50080
  });

  it('should calculate discount for FIXED coupon', () => {
    // Coupon giảm cố định $20
    const coupon: Coupon = {
      type: 'FIXED',
      value: 20,
      // ...
    };

    const result = calculateOrderTotals(100, coupon);

    expect(result.discount).toBe(20); // Giảm $20 cố định
  });

  it('should return zero discount when no coupon', () => {
    const result = calculateOrderTotals(100, null);
    expect(result.discount).toBe(0);
  });

  it('should ensure total is never negative', () => {
    // Edge case: Discount lớn hơn subtotal
    const coupon: Coupon = {
      type: 'FIXED',
      value: 1000,
      // ...
    };

    const result = calculateOrderTotals(100, coupon);
    expect(result.total).toBeGreaterThanOrEqual(0); // Không được âm
  });
});
```

---

#### File: `order-state-machine.test.ts` (16 test cases)

**Mục đích:** Test trạng thái đơn hàng (Pending → Paid → Shipped → Delivered)

```typescript
describe('getNextAction', () => {
  it('should return correct next action for PENDING', () => {
    const result = getNextAction('PENDING');
    expect(result).toEqual({ next: 'PAID', label: 'Mark as Paid' });
  });

  it('should return correct next action for PAID', () => {
    const result = getNextAction('PAID');
    expect(result).toEqual({ next: 'SHIPPED', label: 'Ship Order' });
  });

  it('should return correct next action for SHIPPED', () => {
    const result = getNextAction('SHIPPED');
    expect(result).toEqual({ next: 'DELIVERED', label: 'Mark Delivered' });
  });

  it('should return null for DELIVERED', () => {
    // Đã giao xong → không có action tiếp theo
    const result = getNextAction('DELIVERED');
    expect(result).toBeNull();
  });

  it('should return null for CANCELLED', () => {
    // Đã hủy → không có action tiếp theo
    const result = getNextAction('CANCELLED');
    expect(result).toBeNull();
  });
});

describe('canCancel', () => {
  it('should return true for PENDING status', () => {
    expect(canCancel('PENDING')).toBe(true);
  });

  it('should return true for PAID status', () => {
    expect(canCancel('PAID')).toBe(true);
  });

  it('should return false for SHIPPED status', () => {
    // Đã ship → không thể hủy
    expect(canCancel('SHIPPED')).toBe(false);
  });

  it('should return false for DELIVERED status', () => {
    expect(canCancel('DELIVERED')).toBe(false);
  });
});
```

---

### Nhóm 3: API Service Tests (Gọi Backend)

#### File: `api-service.test.ts` (18 test cases)

**Mục đích:** Test function `apiFetch()` - gọi API backend

**Các trường hợp được test:**
- GET request, POST request
- Thêm Authorization header khi có token
- Xử lý lỗi: 401 Unauthorized, 404 Not Found, 500 Internal Server Error
- Xử lý network error (mất kết nối)
- Translate URL (POST /api/orders → /api/orders/checkout)

**Ví dụ test:**

```typescript
describe('apiFetch', () => {
  it('should make GET request to correct endpoint', async () => {
    const mockProduct = { id: '1', name: 'Test Product', price: 100 };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    });

    const result = await apiFetch<Product>('/api/products/1');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8081/api/products/1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result).toEqual(mockProduct);
  });

  it('should add Authorization header when token exists', async () => {
    localStorage.setItem('shopcart_auth', JSON.stringify({
      state: { token: 'test-token-123' }
    }));

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiFetch('/api/orders');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8081/api/orders/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token-123',
        }),
      })
    );
  });

  it('should handle 401 Unauthorized error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const error = await apiFetch('/api/orders').catch(e => e) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('should handle network error (fetch failure)', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(apiFetch('/api/products')).rejects.toThrow(ApiError);
    await expect(apiFetch('/api/products')).rejects.toMatchObject({
      status: 500,
      message: 'Không thể kết nối đến máy chủ 8081. Hãy kiểm tra xem Backend đã chạy chưa.',
    });
  });
});
```

**Tại sao cần test network error?** Để đảm bảo khi backend down hoặc mất mạng, app sẽ hiển thị thông báo lỗi thân thiện thay vì crash.

---

### Nhóm 4: Hook Tests (React Hooks)

#### File: `use-debounced-callback.test.ts` (7 test cases)

**Mục đích:** Test custom hook `useDebouncedCallback` - delay execution

```typescript
describe('useDebouncedCallback', () => {
  it('should call the callback immediately on first invocation', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 400));

    act(() => {
      result.current('arg1', 'arg2');
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should debounce rapid invocations', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 400));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    // Chỉ gọi 1 lần với invocation đầu tiên accepted
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');
  });

  it('should allow invocation after delay period', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 400));

    act(() => {
      result.current('first');
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Fast-forward past the delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current('second');
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('second');
  });
});
```

**Tại sao cần test hook?** Hook có logic phức tạp (timer, state) → cần test để đảm bảo hoạt động đúng.

---

### Nhóm 5: Component Tests (UI)

#### File: `card.test.tsx` (6 test cases)

**Mục đích:** Test Card component từ shadcn/ui

```typescript
describe('Card Components', () => {
  it('should render Card component', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render Card with custom className', () => {
    const { container } = render(<Card className="custom-class">Card content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('should render CardHeader', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should render CardTitle', () => {
    render(<CardTitle>Card Title</CardTitle>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('should render CardContent', () => {
    render(<CardContent>Content text</CardContent>);
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  it('should render composed Card structure', () => {
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
```

**Tại sao test UI component?** Để đảm bảo component render đúng và nhận props đúng.

---

#### File: `Header.test.tsx` (5 test cases)

**Mục đích:** Test Header component - hiển thị navigation, cart badge, user info

```typescript
describe('Header Component', () => {
  it('should render the header with logo', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 0,
    }));

    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: null,
      isAuthenticated: () => false,
      isAdmin: () => false,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByText('ShopCart')).toBeInTheDocument();
  });

  it('should show cart badge when items in cart', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 5, // Có 5 items trong cart
    }));

    // Mock auth store...

    render(<Header />);
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('5');
  });

  it('should show sign in button when not authenticated', () => {
    // Mock chưa login...

    render(<Header />);
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should show user avatar when authenticated', () => {
    // Mock đã login...

    render(<Header />);
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('should show admin links when user is admin', () => {
    // Mock admin user...

    render(<Header />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AI Analytics')).toBeInTheDocument();
  });
});
```

**Tại sao cần mock store?** Component Header phụ thuộc vào cart-store và auth-store → cần mock để test component riêng biệt.

---

## Phần 5: Tại sao có test cho chức năng "không tồn tại"?

### Ví dụ: Test negative quantity trong cart-store.test.ts

```typescript
it('should handle adding item with negative quantity by adding it', () => {
  const product: Product = {
    id: '1',
    name: 'Test Product',
    price: 100,
    // ...
    stockQuantity: 10,
  };

  useCartStore.getState().addItem(product, -5); // Thêm -5 items

  const items = useCartStore.getState().items;
  expect(items).toHaveLength(1);
  expect(items[0].quantity).toBeLessThan(0); // Quantity = -5
});
```

**Câu hỏi:** Tại sao test negative quantity? App không cho phép nhập số âm mà?

**Trả lời:** Đây là **defensive programming** (lập trình phòng thủ)

### Tại sao cần test edge case?

1. **User có thể hack browser:**
   - Mở DevTools
   - Thay đổi value của input từ 5 thành -5
   - Submit form
   - App nên handle gracefully (không crash)

2. **Data corruption:**
   - Database có thể bị lỗi
   - API trả về data sai
   - App nên validate và handle

3. **Future changes:**
   - Có thể sau này team quyết định cho phép negative quantity (ví dụ: refund/return)
   - Test này đảm bảo logic vẫn đúng

4. **Documentation:**
   - Test này document behavior hiện tại
   - Team khác đọc test sẽ biết: "Oh, app hiện tại cho phép negative quantity, cần fix"

### Các loại edge case thường test

| Loại edge case | Ví dụ | Tại sao test? |
|----------------|-------|---------------|
| **Zero value** | quantity = 0 | Không crash khi input rỗng |
| **Negative value** | quantity = -5 | Handle user hack/browser manipulation |
| **Very large value** | quantity = 999999 | Không overflow, performance OK |
| **Null/undefined** | product = null | Handle missing data gracefully |
| **Empty array** | items = [] | Không crash khi không có data |
| **Invalid format** | date = "invalid" | Handle malformed input |

---

## Phần 6: So sánh Vitest với Playwright và Jacoco

### Bảng so sánh chi tiết

| Đặc điểm | Vitest | Playwright | Jacoco |
|----------|--------|------------|--------|
| **Loại framework** | Unit Test Framework | E2E Test Framework | Coverage Tool |
| **Test cái gì?** | Hàm, component, store riêng lẻ | Toàn bộ flow user từ đầu đến cuối | Không test, chỉ đo coverage |
| **Số lượng test trong project** | ~135 test cases | ~5 test cases | Không có test |
| **Tốc độ chạy** | Rất nhanh (ms) | Chậm hơn (giây đến phút) | Nhanh (phân tích code) |
| **Môi trường chạy** | jsdom (mock browser) | Browser thật (Chrome, Firefox) | Static analysis |
| **Ví dụ test** | Test hàm `add(a, b)` | Test flow: Login → Add to cart → Checkout | Không có |
| **Độ tin cậy** | Tin cậy cho logic riêng lẻ | Tin cậy cho toàn bộ flow | Không áp dụng |

### Ví dụ so sánh: Test chức năng "Thêm sản phẩm vào giỏ"

#### Vitest (Unit Test)

```typescript
// cart-store.test.ts
it('should add a new item to the cart', () => {
  const product: Product = {
    id: '1',
    name: 'Test Product',
    price: 100,
    // ...
  };

  useCartStore.getState().addItem(product, 1);

  const items = useCartStore.getState().items;
  expect(items).toHaveLength(1);
  expect(items[0].product.id).toBe('1');
});
```

**Ưu điểm:**
- Chạy rất nhanh (< 1ms)
- Test chính xác logic của store
- Dễ debug khi fail
- Có thể test nhiều edge cases

**Nhược điểm:**
- Không test UI
- Không test integration với các phần khác

---

#### Playwright (E2E Test)

```typescript
// e2e-tests/tests/checkout.spec.ts
test('should add product to cart and checkout', async ({ page }) => {
  // 1. Navigate to product page
  await page.goto('/products/1');

  // 2. Click "Add to cart" button
  await page.click('[data-testid="add-to-cart-button"]');

  // 3. Navigate to cart
  await page.goto('/cart');

  // 4. Verify product in cart
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

  // 5. Click checkout
  await page.click('[data-testid="checkout-button"]');

  // 6. Fill shipping info
  await page.fill('[name="address"]', '123 Test St');

  // 7. Submit order
  await page.click('[data-testid="submit-order"]');

  // 8. Verify success
  await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
});
```

**Ưu điểm:**
- Test toàn bộ flow như user thật
- Test UI + logic + integration
- Phát hiện bug mà unit test không thấy

**Nhược điểm:**
- Chạy chậm hơn (giây đến phút)
- Khó debug khi fail
- Harder to maintain
- Không thể test nhiều edge cases (quá tốn kém)

---

#### Jacoco (Coverage Tool)

```bash
# Jacoco không có test, chỉ đo coverage
mvn test jacoco:report
```

Jacoco sẽ báo cáo:
- Line coverage: 85% code được test
- Branch coverage: 70% branch được test
- Method coverage: 90% method được test

**Ưu điểm:**
- Biết được phần nào code chưa được test
- Giúp improve test coverage

**Nhược điểm:**
- Không test logic
- Chỉ là metric, không đảm bảo quality

---

### Tại sao Vitist có nhiều test hơn Playwright?

**Vitest nhiều vì:**
1. **Test từng hàm nhỏ:** Mỗi hàm cần nhiều test cases (happy path + edge cases)
2. **Tốc độ nhanh:** Dễ viết nhiều test mà không tốn nhiều thời gian
3. **Unit test granularity:** Test từng scenario riêng lẻ

**Playwright ít vì:**
1. **Test toàn bộ flow:** Mỗi test cover nhiều chức năng cùng lúc
2. **Chạy chậm:** Viết nhiều test sẽ tốn nhiều thời gian chạy
3. **Focus on critical paths:** Chỉ test các flow quan trọng nhất

---

## Phần 7: Cấu trúc cần có của một file Vitest Test

### Template chuẩn

```typescript
// 1. Import từ vitest và testing library
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';

// 2. Import code cần test
import { myFunction } from '@/lib/my-file';
import { MyComponent } from '@/components/MyComponent';
import { useMyHook } from '@/hooks/useMyHook';

// 3. Mock dependencies (nếu cần)
vi.mock('@/lib/api-service', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

// 4. Bắt đầu test với describe
describe('Tên nhóm chức năng', () => {
  
  // 5. Setup trước mỗi test (tùy chọn)
  beforeEach(() => {
    // Reset state, clear mocks, clear localStorage
    vi.clearAllMocks();
    localStorage.clear();
    useCartStore.getState().clear();
  });

  // 6. Cleanup sau mỗi test (tùy chọn)
  afterEach(() => {
    // Restore mocks, cleanup timers
    vi.restoreAllMocks();
  });

  // 7. Test case 1
  it('nên [hành động] khi [điều kiện]', () => {
    // Arrange: Chuẩn bị dữ liệu
    const input = 5;
    const expected = 10;

    // Act: Gọi hàm cần test
    const result = myFunction(input);

    // Assert: Kiểm tra kết quả
    expect(result).toBe(expected);
  });

  // 8. Test case 2
  it('nên [hành động khác] khi [điều kiện khác]', () => {
    // ...
  });

  // 9. Test edge cases
  describe('edge cases', () => {
    it('should handle null input', () => {
      expect(myFunction(null)).toBe(0);
    });

    it('should handle undefined input', () => {
      expect(myFunction(undefined)).toBe(0);
    });

    it('should handle empty input', () => {
      expect(myFunction('')).toBe(0);
    });
  });

  // 10. Test error cases
  describe('error handling', () => {
    it('should throw error when input is invalid', () => {
      expect(() => myFunction(-1)).toThrow('Invalid input');
    });
  });
});
```

---

### Các hàm assertion thường dùng trong expect

```typescript
// Equality
expect(value).toBe(expected);              // ===
expect(value).toEqual(expected);          // Deep equality
expect(value).toStrictEqual(expected);    // Strict equality

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toBeGreaterThanOrEqual(5);
expect(value).toBeCloseTo(3.14, 2);        // Float with precision

// Strings
expect(value).toMatch(/regex/);
expect(value).toContain('substring');

// Arrays/Objects
expect(array).toHaveLength(3);
expect(array).toContain(item);
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', value);

// Booleans
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Functions/Errors
expect(func).toHaveBeenCalled();
expect(func).toHaveBeenCalledWith(arg1, arg2);
expect(func).toHaveBeenCalledTimes(3);
expect(() => func()).toThrow();
expect(() => func()).toThrow('Error message');

// DOM elements (cho component test)
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('text');
expect(element).toHaveClass('class-name');
expect(element).toBeVisible();
expect(element).toBeDisabled();
```

---

## Phần 8: Câu hỏi và trả lời cho buổi vấn đáp

### Câu 1: Tại sao project có hơn 100 bài test vitest?

**Trả lời:** 
- Vitest đếm theo số lượng **test case** (mỗi `it()` là 1 test), không phải theo file
- Project có khoảng **135 test cases** phân bố trong 10 file test
- Mỗi file test có thể chứa nhiều test cases để cover:
  - Happy paths (trường hợp thành công)
  - Edge cases (trường hợp biên: zero, null, negative, large values)
  - Error cases (trường hợp lỗi: network error, invalid input)
  - Different scenarios (khác nhau)

---

### Câu 2: 1 bài test được tính như thế nào trong vitest?

**Trả lời:**
- **1 test case = 1 lệnh `it()` hoặc `test()`**
- Lệnh `describe()` KHÔNG được tính là test case, chỉ dùng để nhóm test
- Ví dụ:
  ```typescript
  describe('Group', () => {        // ❌ Không đếm
    it('test 1', () => { ... });   // ✅ 1 test case
    it('test 2', () => { ... });   // ✅ 1 test case
  });
  ```
  → Tổng: 2 test cases

---

### Câu 3: Tại sao có test cho chức năng "không tồn tại" trong project?

**Trả lời:**
- Đó là **edge case testing** - test các trường hợp biên
- Mục đích:
  1. **Defensive programming:** Handle khi user hack browser hoặc data corrupted
  2. **Future-proofing:** Chuẩn bị cho thay đổi tương lai
  3. **Documentation:** Document behavior hiện tại
  4. **Robustness:** Đảm bảo app không crash với input bất ngờ
- Ví dụ: Test negative quantity không phải app cho phép nhập số âm, mà là test để đảm bảo app không crash khi user cố tình nhập -5

---

### Câu 4: Các nhóm chính trong vitest test là gì?

**Trả lời:**
1. **Store Tests** (Zustand state management): cart-store, auth-store
2. **Utility Tests** (Hàm tiện ích): utils, format, coupon-utils, order-state-machine
3. **API Service Tests** (Gọi backend): api-service
4. **Hook Tests** (React hooks): use-debounced-callback
5. **Component Tests** (UI): Card, Header

---

### Câu 5: Tại sao vitest có nhiều test hơn playwright?

**Trả lời:**
- **Vitest (Unit Test):**
  - Test từng hàm/component riêng lẻ
  - Mỗi chức năng cần nhiều test cases (happy path + edge cases)
  - Chạy rất nhanh → dễ viết nhiều test
  - Tổng: ~135 test cases

- **Playwright (E2E Test):**
  - Test toàn bộ flow từ đầu đến cuối
  - Mỗi test cover nhiều chức năng cùng lúc
  - Chạy chậm hơn → chỉ test critical paths
  - Tổng: ~5 test cases

---

### Câu 6: Cấu trúc cần có của một file vitest test là gì?

**Trả lời:**
1. Import từ vitest: `describe`, `it`, `expect`, `beforeEach`
2. Import code cần test
3. Mock dependencies (nếu cần)
4. `describe()` để nhóm test cases
5. `beforeEach()` để setup trước mỗi test
6. `it()` để định nghĩa test case (Arrange → Act → Assert)
7. `expect()` để kiểm tra kết quả

---

## Phần 9: Lệnh chạy Vitest trong project

### Chạy tất cả test

```bash
cd frontend
npm test
```

### Chạy test trong watch mode (tự động chạy lại khi code thay đổi)

```bash
npm test -- --watch
```

### Chạy test cụ thể

```bash
npm test cart-store.test.ts
```

### Chạy test với coverage

```bash
npm test -- --coverage
```

### Chạy test trong UI mode (để xem kết quả trực quan)

```bash
npm test -- --ui
```

---

## Phần 10: Kết luận

### Tóm tắt

1. **Vitest là unit test framework** - test từng hàm, component, store riêng lẻ
2. **1 test case = 1 lệnh `it()`** - `describe()` không được tính
3. **Project có ~135 test cases** - nhiều vì test nhiều edge cases
4. **Có 5 nhóm test chính:** Store, Utility, API, Hook, Component
5. **Edge case testing** - test chức năng "không tồn tại" để đảm bảo robustness
6. **Vitest > Playwright** vì unit test test từng scenario riêng lẻ, E2E test test toàn bộ flow

### Lời khuyên cho buổi vấn đáp

- Nhấn mạnh vào **cách vitest đếm test** (it() = 1 test)
- Giải thích **tại sao cần nhiều test** (happy path + edge cases)
- Phân biệt rõ **unit test vs E2E test**
- Cho ví dụ cụ thể từ project của bạn

---

**Chúc bạn buổi vấn đáp thành công! 🎉**
