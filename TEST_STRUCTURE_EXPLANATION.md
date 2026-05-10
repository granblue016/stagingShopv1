# Giải Thích Cấu Trúc Test Frontend

## Tổng Quan Về Cấu Trúc Test

Trong folder `frontend/src/test`, test được tổ chức theo cấu trúc sau:

```
frontend/src/test/
├── setup.ts              # File cấu hình test toàn cục
├── components/           # Test cho các React components
│   ├── Header.test.tsx
│   └── ui/
├── hooks/                # Test cho custom React hooks
│   └── use-debounced-callback.test.ts
├── lib/                  # Test cho các utility functions
│   ├── api-service.test.ts
│   ├── coupon-utils.test.ts
│   ├── format.test.ts
│   ├── order-state-machine.test.ts
│   └── utils.test.ts
└── stores/               # Test cho state management (Zustand stores)
    └── auth-store.test.ts
```

### Tại sao chia như vậy?

- **components/**: Test giao diện người dùng, render component, interaction
- **hooks/**: Test logic reuse, custom hooks React
- **lib/**: Test các hàm tiện ích, không phụ thuộc vào React
- **stores/**: Test state management, business logic

---

## Ví Dụ 1: Test Utility Function (format.test.ts)

File này test các hàm format tiền và ngày tháng. Đây là loại test đơn giản nhất, phù hợp cho người mới bắt đầu.

### Full Code

```typescript
import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate } from '@/lib/format';

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
    expect(formatPrice(10.123)).toBe('$10.12');
  });

  it('should format negative numbers', () => {
    expect(formatPrice(-100)).toBe('-$100.00');
  });
});

describe('formatDate', () => {
  it('should format ISO date string correctly', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date);
    expect(formatted).toMatch(/\w+ \d+, \d{4}/);
  });

  it('should handle different date formats', () => {
    const date = '2024-12-25';
    const formatted = formatDate(date);
    expect(formatted).toBeTruthy();
  });

  it('should handle leap years', () => {
    const date = '2024-02-29';
    const formatted = formatDate(date);
    expect(formatted).toBeTruthy();
  });
});
```

### Phân Tích Từng Dòng

#### Dòng 1-2: Import các thư viện cần thiết

```typescript
import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate } from '@/lib/format';
```

**Tại sao?**
- `describe`, `it`, `expect` là các hàm từ Vitest (framework test)
  - `describe`: Gom nhóm các test case liên quan
  - `it`: Định nghĩa một test case cụ thể
  - `expect`: Khẳng định kết quả expected
- Import các hàm cần test từ file `@/lib/format`

**Data Flow**: Import → Khai báo các hàm test → Sử dụng trong test

#### Dòng 4: Bắt đầu describe block cho formatPrice

```typescript
describe('formatPrice', () => {
```

**Tại sao?**
- Gom nhóm tất cả test về `formatPrice` lại với nhau
- Tên `'formatPrice'` mô tả rõ đang test hàm nào
- Khi chạy test, output sẽ hiển thị: `formatPrice` > các test case con

**Data Flow**: 
```
describe('formatPrice')
  ├── it('should format positive numbers correctly')
  ├── it('should format large numbers correctly')
  ├── it('should handle decimal places correctly')
  └── it('should format negative numbers')
```

#### Dòng 5-9: Test case đầu tiên

```typescript
it('should format positive numbers correctly', () => {
  expect(formatPrice(100)).toBe('$100.00');
  expect(formatPrice(99.99)).toBe('$99.99');
  expect(formatPrice(0)).toBe('$0.00');
});
```

**Phân tích từng dòng:**

**Dòng 5:** `it('should format positive numbers correctly', () => {`
- `it`: Định nghĩa một test case
- `'should format positive numbers correctly'`: Tên test case mô tả hành vi expected
- `() => {`: Arrow function chứa code test

**Tại sao tên test như vậy?**
- Sử dụng pattern "should [hành vi]" để mô tả expected behavior
- Dễ đọc: "nên format số dương đúng"
- Khi test fail, message rõ ràng: "should format positive numbers correctly"

**Dòng 6:** `expect(formatPrice(100)).toBe('$100.00');`
- `formatPrice(100)`: Gọi hàm cần test với input 100
- `expect(...)`: Bắt đầu assertion
- `.toBe('$100.00')`: Khẳng định kết quả phải bằng '$100.00'

**Data Flow của dòng này:**
```
Input: 100
  ↓
formatPrice(100) → Hàm xử lý
  ↓
Output: '$100.00'
  ↓
expect('$100.00').toBe('$100.00') → So sánh
  ↓
Pass nếu bằng nhau, Fail nếu khác
```

**Dòng 7-8:** Tương tự với các input khác
- Test nhiều scenario trong cùng một test case
- Tăng coverage mà không cần quá nhiều test case

#### Dòng 11-14: Test số lớn

```typescript
it('should format large numbers correctly', () => {
  expect(formatPrice(1000)).toBe('$1,000.00');
  expect(formatPrice(1000000)).toBe('$1,000,000.00');
});
```

**Tại sao tách thành test case riêng?**
- Test edge case: số lớn có dấu phẩy
- Nếu fail, biết ngay là vấn đề với format số lớn
- Tách biệt logic format số thường vs số lớn

#### Dòng 16-19: Test số thập phân

```typescript
it('should handle decimal places correctly', () => {
  expect(formatPrice(10.5)).toBe('$10.50');
  expect(formatPrice(10.123)).toBe('$10.12');
});
```

**Tại sao?**
- Test rounding behavior
- `10.5` → `10.50` (thêm zero)
- `10.123` → `10.12` (làm tròn 2 chữ số)

#### Dòng 21-23: Test số âm

```typescript
it('should format negative numbers', () => {
  expect(formatPrice(-100)).toBe('-$100.00');
});
```

**Tại sao?**
- Test edge case: số âm
- Kiểm tra có thêm dấu `-` hay không

#### Dòng 26-44: Test formatDate

```typescript
describe('formatDate', () => {
  it('should format ISO date string correctly', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date);
    expect(formatted).toMatch(/\w+ \d+, \d{4}/);
  });
  // ...
});
```

**Dòng 28:** `const date = '2024-01-15T10:30:00Z';`
- Khai báo input test
- ISO 8601 format

**Dòng 30:** `expect(formatted).toMatch(/\w+ \d+, \d{4}/);`
- `.toMatch()`: So sánh với regex pattern
- Pattern: `\w+ \d+, \d{4}` → ví dụ: "January 15, 2024"
- Tại sao dùng `.toMatch()` thay vì `.toBe()`?
  - Không biết chính xác output (phụ thuộc locale)
  - Chỉ cần đúng format, không cần exact string

### Data Flow Tổng Quát cho format.test.ts

```
┌─────────────────────────────────────────┐
│         Vitest Runner                   │
│         (Khởi chạy test)                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    describe('formatPrice')              │
│    (Gom nhóm test)                      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    it('should format...')               │
│    (Test case cụ thể)                   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    formatPrice(100)                     │
│    (Gọi hàm cần test)                   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    Output: '$100.00'                    │
│    (Kết quả thực tế)                    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    expect('$100.00').toBe('$100.00')   │
│    (So sánh vs expected)                │
└──────────────┬──────────────────────────┘
               ↓
         Pass/Fail
```

### Best Practices từ ví dụ này:

1. **Tên test mô tả behavior**: "should [hành vi]" thay vì "test [tên hàm]"
2. **Một test case một scenario**: Tách rõ ràng các case khác nhau
3. **Test edge cases**: Số 0, số âm, số lớn, số thập phân
4. **Sử dụng assertion phù hợp**: `.toBe()` cho exact match, `.toMatch()` cho pattern

---

## Ví Dụ 2: Test React Component với Mock (Header.test.tsx)

File này test component Header, phức tạp hơn vì cần render component và mock dependencies.

### Full Code

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';
import * as cartStore from '@/stores/cart-store';
import * as authStore from '@/stores/auth-store';

// Mock the stores
vi.mock('@/stores/cart-store');
vi.mock('@/stores/auth-store');

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
      totalItems: () => 5,
    }));
    
    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: null,
      isAuthenticated: () => false,
      isAdmin: () => false,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('5');
  });

  it('should show sign in button when not authenticated', () => {
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
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should show user avatar when authenticated', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 0,
    }));
    
    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: { name: 'Test User', email: 'test@example.com' },
      isAuthenticated: () => true,
      isAdmin: () => false,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('should show admin links when user is admin', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 0,
    }));
    
    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: { name: 'Admin User', email: 'admin@example.com' },
      isAuthenticated: () => true,
      isAdmin: () => true,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('AI Analytics')).toBeInTheDocument();
  });
});
```

### Phân Tích Từng Dòng

#### Dòng 1-5: Import dependencies

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';
import * as cartStore from '@/stores/cart-store';
import * as authStore from '@/stores/auth-store';
```

**Giải thích:**
- `vi`: Vitest's mock utilities (vi.mock, vi.fn, vi.clearAllMocks)
- `render`: Render React component vào virtual DOM
- `screen`: Query elements trong rendered component
- `Header`: Component cần test
- `cartStore`, `authStore`: State stores mà Header phụ thuộc

**Tại sao cần mock?**
- Header phụ thuộc vào cartStore và authStore
- Nếu không mock, test sẽ gọi store thật → gây side effects
- Mock giúp kiểm soát state cho mỗi test case

#### Dòng 7-9: Mock stores

```typescript
vi.mock('@/stores/cart-store');
vi.mock('@/stores/auth-store');
```

**Tại sao?**
- `vi.mock()`: Replace toàn bộ module với mock
- Tất cả import từ các module này sẽ là mock
- Tránh gọi store thật trong test

**Data Flow:**
```
Header component
  ↓
Gọi useCartStore()
  ↓
Thay vì store thật → trả về mock
  ↓
Test có thể control return value
```

#### Dòng 11-15: Mock router

```typescript
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
```

**Giải thích từng dòng:**

**Dòng 11:** `vi.mock('@tanstack/react-router', () => ({`
- Mock module `@tanstack/react-router`
- Return object định nghĩa mock implementations

**Dòng 12:** `Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,`
- Mock component `Link` thành thẻ `<a>` thường
- `children`: Nội dung bên trong Link
- `to`: URL destination
- `...props`: Các props khác spread vào thẻ a

**Tại sao mock Link?**
- Link cần router context → phức tạp để setup
- Mock thành `<a>` đơn giản → test vẫn render được
- Không cần test router logic ở đây

**Dòng 13:** `useNavigate: () => vi.fn(),`
- Mock hook `useNavigate` thành function rỗng
- `vi.fn()`: Tạo mock function

#### Dòng 17-20: Setup beforeEach

```typescript
describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
```

**Tại sao cần `beforeEach`?**
- Mỗi test case có thể mock khác nhau
- `vi.clearAllMocks()`: Reset tất cả mock trước mỗi test
- Tránh mock từ test trước ảnh hưởng test sau

**Data Flow:**
```
Test 1: Mock cartStore với 5 items
  ↓
beforeEach: Clear mocks
  ↓
Test 2: Mock cartStore với 0 items (clean slate)
```

#### Dòng 22-36: Test case 1 - Render header với logo

```typescript
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
```

**Phân tích từng phần:**

**Dòng 23-25:** Mock cartStore
```typescript
vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
  totalItems: () => 0,
}));
```

- `vi.mocked(cartStore.useCartStore)`: Type-safe mock
- `.mockImplementation()`: Định nghĩa behavior
- `(selector: any) => selector({...})`: 
  - Zustand store sử dụng selector pattern
  - Store nhận một function selector
  - Selector này gọi với store state
  - Return whatever selector returns

**Tại sao pattern này?**
```typescript
// Trong Header component:
const totalItems = useCartStore(state => state.totalItems())

// Mock cần mimic behavior này:
mockImplementation((selector) => selector({
  totalItems: () => 0  // state giả
}))
```

**Dòng 27-32:** Mock authStore
```typescript
vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
  user: null,
  isAuthenticated: () => false,
  isAdmin: () => false,
  logout: vi.fn(),
}));
```

- Tương tự cartStore
- Mock state: user = null, chưa authenticated, không phải admin

**Dòng 34:** `render(<Header />);`
- Render Header component vào virtual DOM
- Tự động trigger các hooks và store calls

**Dòng 35:** `expect(screen.getByText('ShopCart')).toBeInTheDocument();`
- `screen.getByText('ShopCart')`: Tìm element có text "ShopCart"
- `.toBeInTheDocument()`: Khẳng định element tồn tại trong DOM

**Data Flow đầy đủ:**
```
render(<Header />)
  ↓
Header component mount
  ↓
Gọi useCartStore(state => state.totalItems())
  ↓
Mock trả về: selector({ totalItems: () => 0 }) → 0
  ↓
Gọi useAuthStore(state => state.isAuthenticated())
  ↓
Mock trả về: selector({ isAuthenticated: () => false }) → false
  ↓
Header render với state: 0 items, not authenticated
  ↓
screen.getByText('ShopCart') → Tìm element
  ↓
expect(element).toBeInTheDocument() → Pass
```

#### Dòng 38-52: Test case 2 - Cart badge

```typescript
it('should show cart badge when items in cart', () => {
  vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
    totalItems: () => 5,  // ← Khác test trước: 5 items
  }));
  
  // ... auth mock giống test trước

  render(<Header />);
  expect(screen.getByTestId('cart-badge')).toHaveTextContent('5');
});
```

**Khác biệt:**
- Mock cartStore với 5 items thay vì 0
- `screen.getByTestId('cart-badge')`: Tìm bằng data-testid attribute
- `.toHaveTextContent('5')`: Kiểm tra nội dung text

**Tại sao dùng data-testid?**
- Text có thể thay đổi (i18n, design change)
- data-testid stable hơn
- Trong component: `<span data-testid="cart-badge">{totalItems}</span>`

#### Dòng 54-68: Test case 3 - Sign in button

```typescript
it('should show sign in button when not authenticated', () => {
  // Mock với isAuthenticated = false
  
  render(<Header />);
  expect(screen.getByTestId('login-button')).toBeInTheDocument();
});
```

**Logic:**
- Khi chưa authenticated → show login button
- Khi authenticated → show user avatar (test case 4)

#### Dòng 70-84: Test case 4 - User avatar

```typescript
it('should show user avatar when authenticated', () => {
  vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
    user: { name: 'Test User', email: 'test@example.com' },  // ← Có user
    isAuthenticated: () => true,  // ← Authenticated
    isAdmin: () => false,
    logout: vi.fn(),
  }));

  render(<Header />);
  expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
});
```

**Khác biệt:**
- `user`: object thay vì null
- `isAuthenticated`: return true
- Expected: show avatar thay vì login button

#### Dòng 86-101: Test case 5 - Admin links

```typescript
it('should show admin links when user is admin', () => {
  vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
    user: { name: 'Admin User', email: 'admin@example.com' },
    isAuthenticated: () => true,
    isAdmin: () => true,  // ← Là admin
    logout: vi.fn(),
  }));

  render(<Header />);
  expect(screen.getByText('Admin')).toBeInTheDocument();
  expect(screen.getByText('AI Analytics')).toBeInTheDocument();
});
```

**Logic:**
- Admin user → show thêm admin links
- Test 2 assertions trong cùng test case

### Data Flow Tổng Quát cho Header.test.tsx

```
┌─────────────────────────────────────────┐
│         beforeEach                      │
│         vi.clearAllMocks()              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Mock Setup                      │
│         cartStore, authStore            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         render(<Header />)              │
│         Render component                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Component Lifecycle             │
│         - useCartStore() call           │
│         - useAuthStore() call           │
│         - Render UI based on state      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Query Elements                  │
│         screen.getByText()              │
│         screen.getByTestId()            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Assertions                      │
│         expect().toBeInTheDocument()    │
│         expect().toHaveTextContent()    │
└──────────────┬──────────────────────────┘
               ↓
         Pass/Fail
```

### Best Practices từ ví dụ này:

1. **Mock dependencies**: Isolate test, tránh side effects
2. **beforeEach cleanup**: Reset state giữa test cases
3. **Test different states**: Not authenticated, authenticated, admin
4. **Use data-testid**: Stable selector thay vì text
5. **Describe behavior**: "should show X when Y" pattern

---

## So Sánh Hai Ví Dụ

| Đặc điểm | format.test.ts | Header.test.tsx |
|----------|----------------|-----------------|
| Loại test | Unit test (function) | Component test (React) |
| Phức tạp | Đơn giản | Phức tạp hơn |
| Cần mock | Không | Có (stores, router) |
| Query method | Không cần | screen.getByText, getByTestId |
| Setup | Minimal | Mock setup, beforeEach |
| Data flow | Input → Function → Output | Mock → Render → Query → Assert |

---

## Cấu Trúc Chung Của Một Test File

```typescript
// 1. Import dependencies
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Component } from '@/components/Component';

// 2. Mock dependencies (nếu cần)
vi.mock('@/dependency');

// 3. Describe block
describe('Feature Name', () => {
  // 4. Setup (nếu cần)
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 5. Test cases
  it('should do something', () => {
    // Arrange: Setup
    const input = 'test';
    
    // Act: Execute
    const result = functionUnderTest(input);
    
    // Assert: Verify
    expect(result).toBe('expected');
  });
});
```

### Pattern AAA (Arrange-Act-Assert)

1. **Arrange**: Chuẩn bị data, mock, setup
2. **Act**: Gọi hàm/component cần test
3. **Assert**: Kiểm tra kết quả

Ví dụ trong format.test.ts:
```typescript
it('should format positive numbers correctly', () => {
  // Arrange: (implicit - input trực tiếp trong act)
  
  // Act
  const result = formatPrice(100);
  
  // Assert
  expect(result).toBe('$100.00');
});
```

Ví dụ trong Header.test.tsx:
```typescript
it('should render the header with logo', () => {
  // Arrange
  vi.mocked(cartStore.useCartStore).mockImplementation(...);
  
  // Act
  render(<Header />);
  
  // Assert
  expect(screen.getByText('ShopCart')).toBeInTheDocument();
});
```

---

## Kết Luận

Cấu trúc test trong frontend này tuân theo các best practices:

1. **Tổ chức theo loại**: components, hooks, lib, stores
2. **Sử dụng Vitest**: Fast, modern test framework
3. **Testing Library**: Standard cho React component testing
4. **Mock dependencies**: Isolate test unit
5. **Descriptive naming**: Test names mô tả behavior
6. **AAA pattern**: Arrange-Act-Assert flow rõ ràng

Người mới có thể bắt đầu với:
1. Test utility functions (như format.test.ts)
2. Test simple components
3. Progress đến complex components với mocks

Data flow luôn đi theo hướng: **Setup → Execute → Verify**
