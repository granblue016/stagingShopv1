# GIẢI ĐÁP 11 CÂU HỎI CHI TIẾT - SHOPCART AI PLAYBOOK

> File này được tạo để giải thích toàn bộ các câu hỏi quan trọng trong dự án ShopCart AI một cách dễ hiểu nhất, phục vụ cho báo cáo và thuyết trình.

---

## 1. LỆNH `start:all` LÀ GÌ?

### Định nghĩa đơn giản
`start:all` (hay `npm run start:all`) là lệnh **khởi động đồng thời tất cả các dịch vụ** của hệ thống trong **một cửa sổ Terminal duy nhất**.

### Công nghệ đằng sau
Lệnh này sử dụng thư viện `concurrently` (cài đặt trong `package.json`):

```json
// package.json
type Scripts = {
  "start:all": "concurrently \"cd backend && mvn spring-boot:run\" \"cd frontend && npm run dev\" \"cd nlp-service && npm run dev\" --names \"Backend,Frontend,NLP-Service\" --prefix-colors \"green,yellow,blue\""
}
```

### Tại sao cần `start:all`?

| Trước khi có `start:all` | Sau khi có `start:all` |
|--------------------------|------------------------|
| Mở 3 Terminal riêng biệt | Chỉ cần 1 Terminal |
| Chạy lệnh thủ công từng cái | Một lệnh chạy hết |
| Khó theo dõi log (loạn màn hình) | Log có màu sắc riêng cho từng service |
| Dễ quên khởi động service nào đó | Không bỏ sót dịch vụ nào |

### File `start-all.bat` làm gì?
```batch
@echo off
echo Starting ShopCart Services (Concurrently)
call npm install          ← Cài concurrently nếu chưa có
call npm run start:all    ← Chạy tất cả services
```

File `.bat` giúp **click đúp 1 lần** là khởi động cả hệ thống, không cần nhớ lệnh.

### Lệnh Terminal để chạy

**Windows:**
```bash
start-all.bat
```

**Hoặc chạy trực tiếp:**
```bash
npm run start:all
```

---

## 2. SPYING vs MOCKING - PHÂN BIỆT CHI TIẾT

### 2.1 Mocking là gì?

**Mocking = Tạo một bản sao giả (fake) để THAY THẾ hoàn toàn đối tượng thật.**

#### ❌ HIỂU LẦM THƯỜNG GẶP VỀ MOCKING

**Bạn có thể nghĩ:** "Nếu mock là tạo data giả mà không liên quan đến hệ thống thật, thì tại sao cần nó? Tự chế gì thì chế có ý nghĩa gì?"

**Câu trả lời:** Mocking **CÓ LIÊN QUAN TRỰC TIẾP** đến hệ thống thật, nhưng theo cách **KIỂM SOÁT** và **CÔNG LỰC**. Mocking không phải "tạo data ngẫu nhiên", mà là **mô phỏng lại behavior của hệ thống thật** để test được những phần code phụ thuộc vào nó.

---

#### ✅ TẠI SAO MOCKING QUAN TRỌNG? (7 LÝ DO CHÍNH)

##### 1. **ISOLATION - Tách biệt logic khỏi dependency bên ngoài**

**Vấn đề:** Bạn muốn test function `calculateTotalPrice()` trong cart-store.ts, nhưng function này gọi API để lấy tax rate từ backend.

```typescript
// cart-store.ts
async function calculateTotalPrice(items: CartItem[]) {
  const taxRate = await apiFetch('/api/tax/rate');  // ← Gọi API thật
  return items.reduce(...) * (1 + taxRate);
}
```

**Nếu không mock:**
- Test sẽ FAIL nếu backend đang down
- Test sẽ FAIL nếu database chưa có tax data
- Test sẽ CHẬM vì phải chờ network
- Test sẽ PHỤ THUỘC vào môi trường (dev/staging/prod khác nhau)

**Nếu có mock:**
```typescript
vi.mock('@/lib/api-service', () => ({
  apiFetch: vi.fn().mockResolvedValue(0.1),  // ← Giả tax rate = 10%
}));

// Test chạy nhanh, không cần backend, không cần database
const total = await calculateTotalPrice(items);
expect(total).toBe(110);  // 100 * 1.1
```

**Mục đích:** Test logic `calculateTotalPrice()` một cách độc lập, không phụ thuộc vào API/Database/Network.

---

##### 2. **SPEED - Tăng tốc độ test lên hàng trăm lần**

**Thực tế:**
- Gọi API thật: 100-500ms mỗi request
- Gọi Database thật: 50-200ms mỗi query
- Mock trả về ngay lập tức: <1ms

**Ví dụ trong dự án ShopCart:**
```typescript
// auth-store.test.ts - 18 tests
// Nếu gọi API thật mỗi test: 18 * 200ms = 3.6 giây
// Nếu mock: 18 * 0.001ms = 0.018 giây (200x nhanh hơn!)
```

**Mục đích:** Developer chạy test liên tục sau mỗi lần sửa code. Nếu test quá chậm, developer sẽ không chạy test → bugs sẽ xuất hiện.

---

##### 3. **DETERMINISM - Loại bỏ yếu tố ngẫu nhiên**

**Vấn đề với hệ thống thật:**
- API có thể trả về data khác nhau mỗi lần (ví dụ: current timestamp, random ID)
- Database có thể bị thay đổi bởi test khác chạy song song
- Network có thể delay, timeout, fail bất ngờ

**Ví dụ:**
```typescript
// Test function tạo đơn hàng với timestamp hiện tại
async function createOrder() {
  const order = {
    id: generateId(),           // ← Random
    createdAt: new Date(),      // ← Thay đổi mỗi giây
    status: 'pending'
  };
  await db.save(order);
  return order;
}

// Test sẽ FAIL vì createdAt luôn khác nhau
expect(order.createdAt).toBe(new Date());  // ❌ FAIL
```

**Giải pháp với mock:**
```typescript
vi.mock('./utils', () => ({
  generateId: vi.fn().mockReturnValue('fixed-id-123'),
}));

vi.mock('./date-utils', () => ({
  getCurrentDate: vi.fn().mockReturnValue(new Date('2024-01-01')),
}));

// Test sẽ PASS vì data cố định
expect(order.id).toBe('fixed-id-123');  // ✅ PASS
expect(order.createdAt).toEqual(new Date('2024-01-01'));  // ✅ PASS
```

**Mục đích:** Test phải deterministic - chạy 100 lần kết quả phải giống nhau 100 lần.

---

##### 4. **EDGE CASE TESTING - Test các trường hợp hiếm gặp khó xảy ra thật**

**Vấn đề:** Làm sao để test scenario "API trả về lỗi 500" hoặc "Database timeout"? Không thể làm hệ thống thật crash được.

**Ví dụ trong dự án ShopCart:**
```typescript
// api-service.ts
async function fetchWithRetry(url: string, retries: number = 3) {
  try {
    return await fetch(url);
  } catch (error) {
    if (retries > 0) {
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}
```

**Test với mock:**
```typescript
vi.mock('@/lib/api-service', () => ({
  apiFetch: vi.fn()
    // Lần 1: FAIL
    .mockRejectedValueOnce(new Error('Network error'))
    // Lần 2: FAIL
    .mockRejectedValueOnce(new Error('Network error'))
    // Lần 3: SUCCESS
    .mockResolvedValueOnce({ data: 'success' })
}));

// Verify retry logic hoạt động đúng
await expect(fetchWithRetry('/api/data')).resolves.toEqual({ data: 'success' });
expect(apiFetch).toHaveBeenCalledTimes(3);  // ← Đã retry 2 lần
```

**Không thể test scenario này với hệ thống thật** vì không thể làm API fail đúng 2 lần rồi success lần thứ 3 một cách có chủ đích.

**Mục đích:** Test error handling, retry logic, timeout handling - những thứ khó xảy ra thật nhưng critical phải test.

---

##### 5. **COST - Tiết kiệm chi phí API calls bên ngoài**

**Ví dụ trong dự án ShopCart:**
```typescript
// NLP Service gọi Hugging Face API
// Mỗi call API tốn tiền (Hugging Face tính phí theo số request)
// Nếu chạy test 37 lần mỗi ngày = 37 * $0.001 = $0.037/ngày
// 1 năm = $13.5 chỉ cho test!
```

**Giải pháp:** Mock Hugging Face API trong test
```typescript
jest.mock('@huggingface/inference');
const mockHf = {
  textClassification: jest.fn().mockResolvedValue([
    { label: 'POSITIVE', score: 0.95 }
  ])
};
// Test chạy miễn phí, không tốn API calls
```

**Mục đích:** Test không nên tốn tiền. Mock giúp tiết kiệm chi phí API calls bên ngoài (OpenAI, Hugging Face, Stripe, AWS, etc.).

---

##### 6. **PARALLEL TESTING - Chạy test song song không conflict**

**Vấn đề:** Nếu test dùng database thật, 2 test chạy song song có thể:
- Test A đọc data, Test B sửa data → Test A fail
- Test A và Test B cùng insert vào cùng table → Conflict
- Test A xóa data mà Test B đang cần → Test B fail

**Giải pháp:** Mock database
```typescript
vi.mock('@/lib/db', () => ({
  query: vi.fn().mockResolvedValue([
    { id: 1, name: 'Product A' },
    { id: 2, name: 'Product B' }
  ])
}));

// Test A, B, C, D... chạy song song không conflict
// Mỗi test có data giả riêng, không ảnh hưởng lẫn nhau
```

**Mục đích:** CI/CD chạy test song song để nhanh hơn. Mock giúp tránh conflict giữa các test.

---

##### 7. **DEVELOPMENT WITHOUT DEPENDENCIES - Phát triển khi dependency chưa sẵn sàng**

**Vấn đề thực tế:** Frontend team muốn test login flow, nhưng Backend team chưa xong API login.

**Giải pháp:** Mock API login
```typescript
vi.mock('@/lib/api-service', () => ({
  apiFetch: vi.fn()
    .mockResolvedValueOnce({
      user: { id: '1', name: 'Test User' },
      token: 'fake-token-123'
    })
}));

// Frontend test login flow dù Backend chưa có
await login('test@test.com', 'password');
expect(user).toEqual({ id: '1', name: 'Test User' });
```

**Mục đích:** Không bị blocked bởi dependency khác. Có thể phát triển song song (Frontend và Backend làm việc cùng lúc).

---

#### 📊 TÓM TẮT SO SÁNH: CÓ MOCK vs KHÔNG MOCK

| Tiêu chí | **Không Mock** | **Có Mock** |
|----------|----------------|-------------|
| **Tốc độ** | Chậm (network, DB) | Nhanh (<1ms) |
| **Độ ổn định** | Thấp (phụ thuộc môi trường) | Cao (deterministic) |
| **Chi phí** | Cao (API calls, server) | Thấp (chỉ CPU local) |
| **Test edge cases** | Khó/không thể | Dễ |
| **Chạy song song** | Khó (conflict DB) | Dễ |
| **Phát triển** | Bị block dependency | Tự do phát triển |

---

#### 🎯 MOCKING TRONG DỰ ÁN SHOPCART - VÍ DỤ THỰC TẾ

##### Ví dụ 1: Mock API Service (Frontend Unit Tests)

```typescript
// auth-store.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';
import { apiFetch } from '@/lib/api-service';

// Mock toàn bộ api-service module
vi.mock('@/lib/api-service', () => ({
  apiFetch: vi.fn()
}));

describe('Auth Store - Login', () => {
  beforeEach(() => {
    // Reset mock trước mỗi test
    vi.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    // Setup: Giả API trả về success
    (apiFetch as any).mockResolvedValueOnce({
      user: { id: '1', name: 'Test User', email: 'test@test.com' },
      token: 'fake-jwt-token-123'
    });

    // Action: Gọi login
    await useAuthStore.getState().login('test@test.com', 'password');

    // Assertion: Verify state được cập nhật
    expect(useAuthStore.getState().user).toEqual({
      id: '1',
      name: 'Test User',
      email: 'test@test.com'
    });
    expect(useAuthStore.getState().token).toBe('fake-jwt-token-123');

    // Assertion: Verify API được gọi đúng cách
    expect(apiFetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('test@test.com')
      })
    );
  });

  it('should handle login failure with wrong password', async () => {
    // Setup: Giả API trả về lỗi 401
    (apiFetch as any).mockRejectedValueOnce({
      response: { status: 401 },
      message: 'Invalid credentials'
    });

    // Action: Gọi login với password sai
    await expect(
      useAuthStore.getState().login('test@test.com', 'wrong-password')
    ).rejects.toThrow('Invalid credentials');

    // Assertion: Verify state không bị thay đổi
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
```

**Mục đích của mock này:**
- Test logic login trong auth-store **không cần Backend chạy**
- Test cả success và failure scenarios
- Test chạy nhanh (~5ms thay vì 200ms)
- Có thể chạy bất kỳ lúc nào, không phụ thuộc network

---

##### Ví dụ 2: Mock Hugging Face AI (NLP Service Tests)

```typescript
// sentiment-analyzer.test.ts
import { analyzeSentiment } from './sentiment-analyzer';
import { HfInference } from '@huggingface/inference';

// Mock Hugging Face module
jest.mock('@huggingface/inference');

describe('Sentiment Analyzer', () => {
  let mockHf: any;

  beforeEach(() => {
    // Setup: Tạo mock instance
    mockHf = {
      textClassification: jest.fn()
    };
    (HfInference as jest.Mock).mockImplementation(() => mockHf);
  });

  it('should analyze positive Vietnamese review correctly', async () => {
    // Setup: Giả AI model trả về kết quả
    mockHf.textClassification.mockResolvedValueOnce([
      { label: '5 stars', score: 0.98 }
    ]);

    // Action: Gọi phân tích sentiment
    const result = await analyzeSentiment('Sản phẩm tuyệt vời, rất hài lòng!');

    // Assertion: Verify kết quả được parse đúng
    expect(result.rating_score).toBeGreaterThanOrEqual(4);
    expect(result.sentiment).toBe('POSITIVE');

    // Assertion: Verify AI model được gọi đúng input
    expect(mockHf.textClassification).toHaveBeenCalledWith({
      model: 'nlptown/bert-base-multilingual-uncased-sentiment',
      inputs: 'Sản phẩm tuyệt vời, rất hài lòng!'
    });
  });

  it('should handle AI model failure gracefully', async () => {
    // Setup: Giả AI model throw error
    mockHf.textClassification.mockRejectedValueOnce(
      new Error('Hugging Face API timeout')
    );

    // Action: Gọi phân tích
    const result = await analyzeSentiment('Test review');

    // Assertion: Verify fallback logic hoạt động
    expect(result).toHaveProperty('rating_score');
    expect(result).toHaveProperty('sentiment');
    // Không crash, vẫn trả về kết quả fallback
  });
});
```

**Mục đích của mock này:**
- Test logic phân tích sentiment **không cần gọi Hugging Face API thật**
- Không tốn tiền API calls
- Test cả success và failure scenarios (API timeout, network error)
- Có thể test fallback logic (demo mode) mà không cần tắt API key thật

---

##### Ví dụ 3: Mock localStorage (Browser Storage)

```typescript
// cart-store.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cart-store';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock as any;

describe('Cart Store - Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save cart to localStorage when item added', () => {
    // Action: Thêm sản phẩm vào giỏ
    useCartStore.getState().addItem(
      { id: '1', name: 'MacBook', price: 1000, stockQuantity: 10 },
      2
    );

    // Assertion: Verify localStorage.setItem được gọi
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'shopcart_cart',
      expect.stringContaining('MacBook')
    );
  });

  it('should restore cart from localStorage on init', () => {
    // Setup: Giả localStorage đã có data
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        items: [{ product: { id: '1', name: 'iPhone' }, quantity: 1 }]
      })
    );

    // Action: Khởi tạo store mới
    const newStore = useCartStore.getState();

    // Assertion: Verify data được restore
    expect(newStore.items).toHaveLength(1);
    expect(newStore.items[0].product.name).toBe('iPhone');
  });
});
```

**Mục đích của mock này:**
- Test persistence logic **không cần browser thật**
- Test cả save và restore scenarios
- Có thể kiểm tra localStorage được gọi đúng cách (spy + mock hybrid)
- Test chạy trong CI/CD không có browser

---

#### 🔗 MOCKING vs SPYING - KHI NÀO DÙNG CÁI NÀO?

| Tình huống | Dùng Mocking | Dùng Spying |
|------------|--------------|-------------|
| Test logic phụ thuộc vào API/Database | ✅ Mock | ❌ |
| Test function tự chạy độc lập | ❌ Không cần | ✅ Spy (nếu cần verify) |
| Test error handling (API fail, DB timeout) | ✅ Mock | ❌ |
| Verify function được gọi đúng cách | ✅ Mock (để kiểm soát) | ✅ Spy (nếu function thật cần chạy) |
| Test performance/speed | ✅ Mock (nhanh hơn) | ❌ |
| Test integration với hệ thống thật | ❌ Không mock | ✅ Spying (để monitor) |

**Quy tắc vàng:**
- **Unit test** → Mock nhiều để test logic nhanh, độc lập
- **Integration test** → Mock ít hơn, để test interaction thật
- **E2E test** → Hầu như không mock, test toàn bộ hệ thống thật

---

#### 💡 KẾT LUẬN: MOCKING KHÔNG PHẢI "TẠO DATA GIẢ NGẪU NHIÊN"

Mocking là:
- **Mô phỏng behavior của hệ thống thật** theo cách có chủ đích
- **Kiểm soát input/output** để test được logic của code phụ thuộc
- **Isolate test** khỏi dependency bên ngoài (API, DB, Network)
- **Tăng tốc độ, độ ổn định, giảm chi phí** của test suite

Mocking KHÔNG phải:
- Tạo data ngẫu nhiên không liên quan
- Cheat hay bypass test
- Thay thế testing thật (vẫn cần E2E test để verify integration)

**Trong dự án ShopCart:**
- 121 Frontend Unit Tests → Mock API, localStorage, fetch
- 37 NLP Service Tests → Mock Hugging Face AI
- 8 E2E Tests → Không mock (hoặc mock tối thiểu) để test hệ thống thật

Đây là **test pyramid chuẩn**: Nhiều unit test (mock-heavy) ở đáy, ít E2E test (no-mock) ở đỉnh.

### 2.2 Spying là gì?

**Spying = Theo dõi (quấy rầy) một function đã tồn tại, ghi lại cách nó được gọi mà KHÔNG thay đổi behavior ban đầu.**

#### Ví dụ thực tế (Vitest)

```typescript
// Spy console.log - vẫn cho nó log ra màn hình, nhưng ghi lại nó đã log gì
const consoleSpy = vi.spyOn(console, 'log');

resetMockDB();  // Hàm này vẫn chạy bình thường, vẫn log ra console

// Verify console.log đã được gọi với nội dung chứa 'Mock DB đã bị gỡ bỏ'
expect(consoleSpy).toHaveBeenCalledWith(
  expect.stringContaining('Mock DB đã bị gỡ bỏ')
);

consoleSpy.mockRestore();  // Trả lại console.log như cũ
```

#### Ví dụ khác: Theo dõi hàm đã tồn tại

```typescript
// localStorage.removeItem vẫn hoạt động bình thường
// nhưng chúng ta "nghe lén" xem nó có được gọi không
const removeItemSpy = vi.spyOn(localStorage, 'removeItem');

purgeSession();  // Hàm này gọi localStorage.removeItem bên trong

// Verify removeItem đã được gọi với key đúng
expect(removeItemSpy).toHaveBeenCalledWith('shopcart_auth');
expect(removeItemSpy).toHaveBeenCalledWith('shopcart_cart');

removeItemSpy.mockRestore();
```

### 2.3 Bảng so sánh chi tiết

| Tiêu chí | **Mocking** | **Spying** |
|----------|-------------|------------|
| **Mục đích** | Thay thế dependency bằng bản giả | Theo dõi behavior của function thật |
| **Function gốc** | Bị thay thế hoàn toàn, KHÔNG chạy | Vẫn chạy bình thường |
| **Side effects** | Không có (vì chạy code giả) | Vẫn có (vì chạy code thật) |
| **Khi nào dùng** | Cần isolate test khỏi database/API | Cần verify function được gọi đúng cách |
| **Ví dụ thực tế** | Giả API call thay vì gọi server thật | Kiểm tra console.log có được gọi không |

### 2.4 Ví dụ minh họa cuộc sống

**Mocking** như thuê một diễn viên đóng thế bạn đi họp:
- Bạn không đi họp thật
- Diễn viên nói đúng những gì bạn bảo
- Bạn kiểm soát hoàn toàn kết quả

**Spying** như gắn camera theo dõi bạn đi họp:
- Bạn vẫn đi họp thật
- Camera ghi lại bạn nói gì, với ai
- Bạn xem lại để verify mình đã làm đúng

---

## 3. UNIT TESTS (Vitest) vs E2E TESTS (Playwright) - PHÂN TÍCH CHUYÊN SÂU

### 3.1 Vị trí trong Test Pyramid

```
                    ▲
                   / \          ← E2E Tests (Playwright)
                  / E2E \         8 tests - Chậm, đắt tiền
                 /  8   \        Test toàn bộ hệ thống
                /_________\
               / Integration \   ← NLP Service Tests
              /     37       \     37 tests
             /_______________\
            /    Unit Tests    \  ← Vitest (Frontend)
           /      121          \    121 tests - Nhanh, rẻ
          /_____________________\
```

### 3.2 So sánh chi tiết từng khía cạnh

| Khía cạnh | **Unit Tests (Vitest)** | **E2E Tests (Playwright)** |
|-----------|------------------------|---------------------------|
| **Phạm vi test** | Một hàm, một component nhỏ | Toàn bộ luồng từ UI → Backend → DB |
| **Tốc độ** | ~5-10 giây cho 121 tests | ~30-60 giây cho 8 tests |
| **Chi phí** | Thấp (chạy local, không cần server) | Cao (cần tất cả services chạy) |
| **Mock/Stub** | Mock nhiều (API, database, localStorage) | Không mock hoặc mock tối thiểu |
| **Mục đích** | Verify logic đúng | Verify user thật dùng được |
| **Flakiness** | Thấp (ít yếu tố bên ngoài) | Cao (phụ thuộc network, timing) |
| **Debug khi fail** | Dễ - biết đúng hàm nào sai | Khó - phải xem trace, screenshot |

### 3.3 Ví dụ cụ thể: Test chức năng "Thêm vào giỏ hàng"

**Unit Test (Vitest) - Test logic trong store:**

```typescript
// cart-store.test.ts
it('should cap quantity at stock limit', () => {
  const product = { id: '1', name: 'MacBook', stockQuantity: 5 };
  
  // Thêm 10 sản phẩm nhưng stock chỉ có 5
  useCartStore.getState().addItem(product, 10);
  
  // Verify chỉ có 5 được thêm vào giỏ
  expect(useCartStore.getState().items[0].quantity).toBe(5);
});
```

**Điều Unit Test kiểm tra:**
- Logic capping có chạy đúng không?
- Công thức tính subtotal có đúng không?
- `localStorage.setItem` có được gọi không?

**E2E Test (Playwright) - Test người dùng thật click:**

```typescript
// checkout.spec.ts
test('should add product to cart and show badge', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="product-card"]').first();
  await page.getByRole('button', { name: /add to cart/i }).click();
  
  // Verify badge hiển thị "1"
  await expect(page.locator('[data-testid="cart-badge"]'))
    .toHaveText('1');
});
```

**Điều E2E Test kiểm tra:**
- User click nút "Add to cart" có hoạt động không?
- Database có cập nhật không?
- UI có re-render hiển thị badge không?
- Nếu backend down thì sao?

### 3.4 Tại sao cần cả hai?

**Unit Tests giúp phát triển nhanh:**
- Developer chạy sau mỗi lần sửa code
- Phát hiện lỗi logic ngay lập tức
- Không cần khởi động cả hệ thống

**E2E Tests giúp đảm bảo hệ thống chạy được:**
- QA/PM nhìn thấy user journey hoạt động
- Bắt lỗi integration giữa Frontend và Backend
- Verify critical paths trước khi release

### 3.5 Phân bổ trong dự án thực tế

| Layer | Số lượng | Thời gian | Chi phí bảo trì |
|-------|----------|-----------|-----------------|
| Unit Tests | 121 | 5-10s | Thấp |
| Integration (NLP) | 37 | 3-5s | Trung bình |
| E2E Tests | 8 | 30-60s | Cao |
| **Tổng** | **168** | ~40s-75s | - |

---

## 4. `findByIdForUpdate()` - ROW-LEVEL LOCK & RACE CONDITION

### 4.1 Code thực tế

```java
// ProductRepository.java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
```

```java
// OrderService.java
@Transactional
public Order createOrder(OrderRequest request, Long userId) {
    // ... xử lý từng item trong giỏ hàng
    List<OrderItem> orderItems = request.getCartItems().stream().map(itemDto -> {
        // Dùng findByIdForUpdate để KHÓA sản phẩm
        Product product = productRepository.findByIdForUpdate(itemDto.getProductId())
            .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Kiểm tra tồn kho
        if (product.getStockQuantity() < itemDto.getQuantity()) {
            throw new RuntimeException("Sản phẩm không đủ hàng!");
        }

        // Trừ kho
        product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
        productRepository.save(product);
        // ...
    }).collect(Collectors.toList());
}
```

### 4.2 Tại sao cần Row-Level Lock?

**Bối cảnh:** 2 người cùng mua sản phẩm cuối cùng (stock = 1)

#### ❌ KHÔNG có Lock (Race Condition xảy ra):

| Thời điểm | User A | User B | Stock trong DB |
|-----------|--------|--------|----------------|
| T1 | Đọc stock = 1 | | 1 |
| T2 | | Đọc stock = 1 | 1 |
| T3 | Kiểm tra: 1 >= 1 ✅ | | 1 |
| T4 | | Kiểm tra: 1 >= 1 ✅ | 1 |
| T5 | Trừ stock → còn 0 | | **0** |
| T6 | | Trừ stock → còn -1 | **-1** ❌ |
| T7 | Lưu đơn hàng A | | |
| T8 | | Lưu đơn hàng B | |

**Kết quả:** Bán quá số lượng tồn kho (overselling). Cả 2 đều nghĩ mình mua được!

#### ✅ CÓ Lock (`findByIdForUpdate`):

| Thời điểm | User A | User B | Stock | Trạng thái khóa |
|-----------|--------|--------|-------|-----------------|
| T1 | Gọi `findByIdForUpdate(1)` → **KHÓA DÒNG** | | 1 | 🔒 User A giữ khóa |
| T2 | Đọc stock = 1 | | 1 | 🔒 User A giữ khóa |
| T3 | Kiểm tra: 1 >= 1 ✅ | Gọi `findByIdForUpdate(1)` → **CHỜ** | 1 | ⏳ User B đợi |
| T4 | Trừ stock → còn 0 | ⏳ Đang chờ... | **0** | 🔒 User A giữ khóa |
| T5 | Commit transaction → **MỞ KHÓA** | | 0 | 🔓 Mở khóa |
| T6 | | Bây giờ mới được đọc stock = 0 | 0 | 🔒 User B giữ khóa |
| T7 | | Kiểm tra: 0 < 1 ❌ → **THROW EXCEPTION** | 0 | 🔓 Mở khóa |

**Kết quả:** User A mua thành công, User B nhận thông báo "Hết hàng". Không có overselling!

### 4.3 Cơ chế `@Lock(LockModeType.PESSIMISTIC_WRITE)`

```sql
-- Khi Java gọi findByIdForUpdate, JPA tự sinh SQL:
SELECT * FROM products WHERE id = 1 FOR UPDATE;
--                                    ^^^^^^^^^
--                                    Khóa dòng này cho đến khi transaction kết thúc
```

**Đặc điểm:**
- **PESSIMISTIC_WRITE**: Khi A đang sửa, B phải chờ
- **Scope**: Chỉ khóa **1 dòng** (không khóa cả bảng)
- **Duration**: Khóa tồn tại trong suốt `@Transactional`
- **Auto-release**: Tự động mở khóa khi commit hoặc rollback

### 4.4 Tại sao không khóa cả bảng?

Nếu khóa cả bảng (`LOCK TABLE products`), khi User A mua MacBook, User C không thể xem iPhone → Hệ thống chậm, trải nghiệm kém.

**Row-Level Lock** chỉ khóa sản phẩm cụ thể, các sản phẩm khác vẫn bán bình thường.

---

## 5. "MOUNT" TRONG E2E TESTING LÀ GÌ?

### 5.1 Định nghĩa

**Mount** trong React/Vue/Angular có nghĩa là:
> "Component được tạo ra, gắn vào DOM, và bắt đầu vòng đời của nó"

### 5.2 Chuỗi sự kiện khi `goto('/checkout')`

```
User/Playwright gọi: goto('/checkout')
    ↓
Browser request URL /checkout
    ↓
Frontend Router nhận route '/checkout'
    ↓
▶▶ CHECKOUTPAGE MOUNTS ◀◀  ← Đây là "mount"
    ↓
React tạo instance của CheckoutPage component
    ↓
Constructor / Initial state được thiết lập
    ↓
useEffect hooks chạy
    ↓
Load cart từ Zustand store (trong RAM)
    ↓
Nếu Zustand rỗng → Load từ localStorage (browser disk)
    ↓
Render form (name, address, city...)
    ↓
Các API calls bắt đầu (nếu cần load thêm data)
    ↓
page.waitForLoadState('networkidle') ← Chờ network yên lặng 500ms
    ↓
Test tiếp tục tương tác
```

### 5.3 Tại sao tôi dùng "mount" nhiều trong E2E explanation?

Vì trong Playwright, đây là **mốc thời gian quan trọng** để hiểu flow:

| Giai đoạn | Điều gì xảy ra | Tại sao quan trọng với E2E |
|-----------|---------------|---------------------------|
| **Pre-mount** | Browser đang tải HTML/CSS/JS | Playwright đợi `goto()` |
| **Mount** | Component khởi tạo, hooks chạy | State được khôi phục từ localStorage |
| **Post-mount** | API calls, re-render | Playwright đợi `networkidle` |

**Ví dụ thực tế trong test:**

```typescript
await page.goto('/checkout');
// → CheckoutPage mounts ở đây

await page.waitForLoadState('networkidle');
// → Đợi mount + load data + render xong

// Bây giờ mới an toàn để tương tác
await page.getByLabel('Full name').fill('Test User');
```

Nếu không đợi mount xong, có thể form chưa render → Playwright không tìm thấy input → Test FAIL.

### 5.4 "Mount" vs "Render" vs "Paint"

| Thuật ngữ | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| **Mount** | Component được khởi tạo và gắn vào DOM tree | ReactDOM.render() hoặc route change |
| **Render** | Component vẽ ra HTML dựa trên state/props | JSX được convert thành DOM nodes |
| **Paint** | Browser vẽ pixel lên màn hình | Chrome composite layers |

Trong E2E, ta quan tâm **Mount** vì đó là điểm logic bắt đầu chạy (hooks, API calls).

---

## 6. 3 STATE MANAGEMENT TRONG DỰ ÁN

### 6.1 Kiến trúc 3 lớp State

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER (localStorage)                                     │
│  ├─ shopcart_auth  → { user, token }                        │
│  ├─ shopcart_cart  → { items: [...] }                       │
│  └─ Chỉ lưu STRING, không chạy logic                      │
│     Không mất khi reload, mất khi xóa cache                │
└─────────────────────────────────────────────────────────────┘
                              ↑↓ persist middleware
┌─────────────────────────────────────────────────────────────┐
│  ZUSTAND (Global State - Memory/RAM)                        │
│  ├─ auth-store.ts  → user, token, idToken, login/logout    │
│  ├─ cart-store.ts  → items, addItem, removeItem...           │
│  └─ Chứa CẢ state + logic (functions)                      │
│     Mất khi reload nhưng tự động restore từ localStorage    │
└─────────────────────────────────────────────────────────────┘
                              ↑↓ selectors/hooks
┌─────────────────────────────────────────────────────────────┐
│  useState (Component State - Temporary)                       │
│  ├─ checkout.tsx → formData { name, address, city }        │
│  ├─ product.$id.tsx → qty (số lượng chọn mua)              │
│  └─ Chỉ tồn tại trong 1 component                           │
│     Mất khi unmount (rời khỏi trang)                       │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Vai trò từng loại

#### Zustand - "Bộ não trung tâm"

```typescript
// cart-store.ts
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => set((state) => {
        // Logic kiểm tra stock, capping quantity...
        const nextQty = Math.min(currentQty + quantity, product.stockQuantity);
        return { items: [...] };
      }),
      // ...
    }),
    { name: "shopcart_cart" }  // ← Tên key trong localStorage
  )
);
```

**Trách nhiệm:**
- Lưu trữ state **toàn cục** (global) cho cả ứng dụng
- Chứa **business logic** (tính toán, validation)
- **Tự động sync** với localStorage qua `persist` middleware

#### localStorage - "Ổ cứng mini của browser"

```typescript
// localStorage chỉ lưu data thô, không có logic
localStorage.getItem("shopcart_cart");  // '{"items":[{"product":{"id":1...}}]}'
```

**Trách nhiệm:**
- **Persistence**: Giữ data sau khi F5 reload
- **Cross-session**: Data vẫn còn khi đóng mở lại tab
- **String-only**: Chỉ lưu JSON string

**Quan hệ với Zustand:**
- Zustand = RAM (nhanh, có logic, mất khi tắt trình duyệt)
- localStorage = Disk (chậm hơn, chỉ data, giữ lâu dài)
- `persist` middleware = Cầu nối tự động sao lưu RAM → Disk

#### useState - "Trí nhớ ngắn hạn của component"

```typescript
// checkout.tsx
const [formData, setFormData] = useState({
  name: '',
  address: '',
  city: '',
});
```

**Trách nhiệm:**
- Lưu trữ tạm thời trong 1 component (ví dụ: form input)
- Không chia sẻ với component khác
- Mất khi user chuyển trang

### 6.3 Tại sao Frontend cần cả 3?

| Tình huống | useState | Zustand | localStorage |
|------------|----------|---------|--------------|
| User nhập địa chỉ giao hàng | ✅ Lưu tạm form | ❌ Không cần | ❌ Không cần |
| Thêm sản phẩm vào giỏ | ❌ Không đủ | ✅ Lưu global | ✅ Backup persist |
| F5 reload trang | ❌ Mất hết | ✅ Restore từ localStorage | ✅ Có sẵn data |
| Đăng nhập/Đăng xuất | ❌ Không liên quan | ✅ Cập nhật auth state | ✅ Xóa key khi logout |

### 6.4 Câu hỏi của bạn: "Frontend chỉ quan tâm Zustand phải không?"

**Đúng, về mặt code, Frontend chỉ tương tác với Zustand.**

```typescript
// Developer chỉ viết:
const { items, addItem } = useCartStore();

// Không bao giờ viết trực tiếp:
localStorage.setItem('shopcart_cart', ...);  // ❌ Không làm thế
```

**Nhưng** localStorage vẫn âm thầm hoạt động phía sau:

```
User click "Add to cart"
    ↓
Zustand cập nhật state (items)
    ↓
persist middleware tự động:
    localStorage.setItem('shopcart_cart', JSON.stringify(newState))
    ↓
User F5 reload
    ↓
Zustand khởi tạo → đọc localStorage
    localStorage.getItem('shopcart_cart')
    ↓
Restore state về như cũ
```

**Vậy nên:** Frontend code → chỉ thấy Zustand. Nhưng hệ thống → cần cả 3 lớp để hoạt động mượt.

---

## 7. NLP SERVICE - DATA FLOW & SEQUENCE DIAGRAM & LANGCHAIN

### 7.1 NLP Service làm gì?

NLP Service nhận một đoạn review (đánh giá) của khách hàng, phân tích bằng AI, trả về:
- Điểm đánh giá (1-5 sao)
- Sentiment (Positive/Negative/Neutral)
- Có phải review giả không
- Phân tích từng khía cạnh (pin, màn hình, hiệu năng)
- Cảm xúc chính, mức độ ưu tiên, đối thủ được nhắc đến...

### 7.2 Kiến trúc tổng quan

```
┌─────────────────┐         ┌─────────────────────────────┐
│   Frontend      │ POST /analyze          │      NLP Service            │
│  (React)        │───────────────────────>│     (Node.js/Express)       │
│                 │  { reviewText: "..." } │                             │
│                 │<───────────────────────│  POST /analyze              │
│                 │  { sentiment, score }  │       │                     │
└─────────────────┘         └──────────────┼─────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────────┐
                              │   HUGGING FACE INFERENCE    │
                              │   (AI Model trên cloud)     │
                              │   - nlptown/bert...         │
                              │   - cardiffnlp/twitter...   │
                              └─────────────────────────────┘
```

### 7.3 Sequence Diagram - Chi tiết từng bước

```
Frontend                    NLP Service                Hugging Face API
   │                            │                             │
   │  POST /api/reviews/analyze │                             │
   │───────────────────────────>│                             │
   │                            │                             │
   │                            │  Gọi analyzeSentiment()     │
   │                            │       trong sentiment-      │
   │                            │       analyzer.ts           │
   │                            │                             │
   │                            │  Kiểm tra API Key có hợp lệ?│
   │                            │                             │
   │                            │  NẾU KHÔNG CÓ KEY:          │
   │                            │  → Chạy Enhanced Demo Mode   │
   │                            │  (dùng keyword matching)     │
   │                            │                             │
   │                            │  NẾU CÓ KEY:                │
   │                            │  → Thử model 1              │
   │                            │     hf.textClassification() │
   │                            │────────────────────────────>│
   │                            │                             │
   │                            │  NẾU model 1 FAIL:          │
   │                            │  → Thử model 2              │
   │                            │     hf.fillMask()           │
   │                            │────────────────────────────>│
   │                            │                             │
   │                            │  NẾU model 2 FAIL:          │
   │                            │  → Thử model 3              │
   │                            │     hf.textGeneration()     │
   │                            │────────────────────────────>│
   │                            │                             │
   │                            │<────────────────────────────│
   │                            │  Response từ AI             │
   │                            │                             │
   │                            │  Parse response → Map sang   │
   │                            │  SentimentAnalysis object   │
   │                            │  (rating_score, sentiment,  │
   │                            │   aspects, priority...)      │
   │                            │                             │
   │<───────────────────────────│  Trả về JSON kết quả        │
   │                            │                             │
```

### 7.4 Data Flow chi tiết

```
Bước 1: Frontend thu thập review
└─> User viết: "Pin rất tệ, màn hình đẹp nhưng chậm quá"
    
Bước 2: Gửi tới Backend (Spring Boot)
└─> Backend nhận, lưu review vào DB
    Gọi NLP Service để phân tích
    
Bước 3: NLP Service xử lý
└─> Endpoint POST /analyze nhận { reviewText }
    Gọi analyzeSentiment(reviewText)
    
Bước 4: AI Analysis (có 2 nhánh)

┌─ Nhánh A: Không có API Key ─┐
│ • Đếm keyword positive/negative│
│ • "tệ" = negative            │
│ • "đẹp" = positive           │
│ • "chậm" = negative          │
│ → Kết quả: Negative, 2 sao   │
└──────────────────────────────┘

┌─ Nhánh B: Có API Key (Hugging Face) ─┐
│ • Gửi review cho AI model BERT        │
│ • Model phân tích ngữ cảnh tiếng Việt │
│ • Trả về label: "NEGATIVE", score: 0.92│
│ → Parse thành: Negative, 2 sao       │
└───────────────────────────────────────┘

Bước 5: Trích xuất thông tin bổ sung
└─> Aspects: { pin: "Kém", màn_hình: "Tốt", hiệu_năng: "Kém" }
    Emotion: "Disappointment"
    Priority: "HIGH" (negative + có vấn đề kỹ thuật)
    Needs_support: true
    
Bước 6: Trả về Frontend
└─> Backend nhận kết quả AI, lưu vào DB
    Frontend hiển thị "AI Review Summary" cho user xem
```

### 7.5 LangChain là gì? Có dùng trong dự án không?

**LangChain** là framework giúp xây dựng ứng dụng AI bằng cách:
- Kết nối nhiều "component" AI lại với nhau
- Quản lý prompt templates
- Xử lý chain of thought
- Lưu trữ memory giữa các lượt hội thoại

**Trong dự án ShopCart AI:**

```typescript
// README.md ghi: "LangChain (AI framework)"
// NHƯNG thực tế trong sentiment-analyzer.ts:

import { HfInference } from "@huggingface/inference";

// Code chỉ dùng HfInference TRỰC TIẾP, không qua LangChain
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

await hf.textClassification({ model, inputs: review });
```

**Kết luận:**
- README ghi có LangChain nhưng **code thực tế không dùng LangChain**
- Thay vào đó, dùng **Hugging Face Inference API trực tiếp**
- Có thể LangChain được dự định nhưng chưa implement, hoặc dùng trong tương lai

**Tại sao lại không cần LangChain trong trường hợp này?**
- Task đơn giản: Input 1 review → Output 1 kết quả
- Không cần "chain" nhiều bước AI
- Không cần memory giữa các lượt
- Hugging Face Inference đủ mạnh để xử lý trực tiếp

### 7.6 Cách suy nghĩ để tự viết/phát triển AI

Nếu bạn muốn tự làm hoặc giám sát phần AI:

```
1. Xác định INPUT:
   └─> Một đoạn text (review tiếng Việt)

2. Xác định OUTPUT mong muốn:
   └─> Cần biết: tốt/xấu? mấy sao? khía cạnh nào tốt/xấu?

3. Chọn AI Model:
   └─> Đa ngôn ngữ? → bert-base-multilingual
   └─> Tiếng Việt tốt? → vie-words2vec hoặc phoBERT
   └─> Cloud hay local? → Hugging Face Inference (cloud)

4. Xử lý Response:
   └─> AI trả về dạng gì? (label + score)
   └─> Cần parse/map sang format của mình

5. Fallback (phương án dự phòng):
   └─> Nếu AI down → Demo mode (keyword matching)
   └─> Nếu model này fail → Thử model khác
```

---

## 8. SECURITY - TOÀN BỘ DATA FLOW & SEQUENCE DIAGRAM

### 8.1 Tóm tắt các công nghệ bảo mật đang dùng

| Công nghệ | Trạng thái | Ai chịu trách nhiệm | Ghi chú |
|-----------|-----------|---------------------|---------|
| **CORS** | ✅ Đang dùng | Backend (Spring Boot) | Cho phép Frontend (8080) gọi API |
| **CSRF** | ❌ Đã tắt | Backend | `csrf.disable()` vì dùng JWT Bearer |
| **JWT** | ⚠️ Giả lập | Backend | Dùng UUID thay vì JWT chuẩn |
| **OAuth2** | ❌ Không có | - | Chưa tích hợp |
| **Firebase** | ⚠️ Một phần | Frontend | Chỉ dùng cho AI features (idToken) |
| **Password Encoder** | ⚠️ Dev mode | Backend | `NoOpPasswordEncoder` (plain text) |

### 8.2 Data Flow đăng nhập chi tiết

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  USER    │      │ FRONTEND │      │  BACKEND │      │   DB     │
│ (Browser)│      │ (React)  │      │ (Spring) │      │(PostgreSQL│
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ Nhập email/pass │                 │                 │
     │────────────────>│                 │                 │
     │                 │ POST /api/auth/login               │
     │                 │ { email, password }               │
     │                 │────────────────>│                 │
     │                 │                 │ CORS Check      │
     │                 │                 │ ✓ localhost:8080│
     │                 │                 │                 │
     │                 │                 │ SELECT * FROM users
     │                 │                 │ WHERE email = ? │
     │                 │                 │────────────────>│
     │                 │                 │<────────────────│
     │                 │                 │ User found      │
     │                 │                 │                 │
     │                 │                 │ NoOpPasswordEncoder
     │                 │                 │ compare plain text
     │                 │                 │ (dev only!)     │
     │                 │                 │                 │
     │                 │                 │ Generate UUID   │
     │                 │                 │ (token ngẫu nhiên)
     │                 │                 │                 │
     │                 │                 │ UPDATE users    │
     │                 │                 │ SET token = UUID│
     │                 │                 │────────────────>│
     │                 │                 │<────────────────│
     │                 │                 │                 │
     │                 │<────────────────│ { token, user } │
     │                 │                 │                 │
     │                 │ localStorage.setItem('shopcart_auth', JSON)
     │                 │ Zustand setState({ user, token })
     │                 │                 │                 │
     │<────────────────│ Redirect to /   │                 │
     │                 │                 │                 │
```

### 8.3 Các request sau đăng nhập (Authenticated Requests)

```
Frontend muốn đặt hàng:

GET /api/orders
Headers:
  Authorization: Bearer <UUID_TOKEN>
                    │
                    ▼
Backend: TokenAuthenticationFilter chạy
         │
         ├─> Lấy header "Authorization"
         ├─> Bỏ prefix "Bearer " → lấy token
         ├─> SELECT * FROM users WHERE token = ?
         ├─> Tìm thấy User → Tạo Authentication object
         └─> Set vào SecurityContextHolder
                    │
                    ▼
Spring Security kiểm tra @PreAuthorize
                    │
                    ▼
Controller xử lý request
                    │
                    ▼
Trả về response 200 + data
```

### 8.4 Firebase Auth - Chỉ dùng cho AI

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  FRONTEND    │      │   BACKEND     │     │  NLP Service │
│  (React)     │      │  (Spring)     │     │  (Node.js)   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │ Login với email/password (thường)       │
       │                     │                     │
       │                     │                     │
       │ AI Features cần bảo vệ?                │
       │ (Như xem AI Summary)                  │
       │                     │                     │
       │ Firebase Auth SDK   │                     │
       │ → getIdToken()      │                     │
       │                     │                     │
       │ POST /api/ai/summary│                     │
       │ Headers:            │                     │
       │   Authorization: Bearer <FIREBASE_ID_TOKEN>
       │                     │                     │
       │                     │ Verify Firebase Token│
       │                     │ (Gatekeeper)        │
       │                     │                     │
       │                     │ Valid? → Cho qua    │
       │                     │ Invalid? → 401      │
       │                     │                     │
```

**Lưu ý quan trọng:**
- Đăng nhập thường → Dùng UUID token (Backend tự quản lý)
- Truy cập AI → Dùng Firebase ID Token (Google quản lý)
- Đây là **2 hệ thống auth song song**, không phải OAuth2 truyền thống

### 8.5 Tại sao không có OAuth2 Provider riêng?

- Dự án dùng **Custom Auth** (email/password lưu trong PostgreSQL)
- Không tích hợp Google/Facebook/GitHub OAuth
- Firebase chỉ dùng để verify identity cho AI features
- Nếu muốn OAuth2 đúng nghĩa, cần thêm Spring Security OAuth2 Client

### 8.6 Vấn đề bảo mật hiện tại (Dev Mode)

```java
// SecurityConfig.java
@Bean
public PasswordEncoder passwordEncoder() {
    return org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance();
    // ⚠️ PLAIN TEXT PASSWORD - chỉ dùng cho development
}
```

**Đề xuất cho production:**
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();  // Mã hóa mật khẩu an toàn
}
```

---

## 9. TỔNG HỢP TẤT CẢ TEST CASES

### 9.1 Bảng tổng hợp

| Loại Test | Số lượng | Framework | Coverage | Thời gian |
|-----------|----------|-----------|----------|-----------|
| **Frontend Unit Tests** | 121 | Vitest | 62.92% statements, 43.9% branches | ~5-10s |
| **NLP Service Tests** | 37 | Jest | 45.14% statements, 30.66% branches | ~3-5s |
| **E2E Tests** | 8 | Playwright | - | ~30-60s |
| **Performance Tests** | 2 | K6 | - | Smoke: 30s, Stress: 4.5m |
| **TỔNG CỘNG** | **168** | - | - | - |

### 9.2 Chi tiết Frontend Unit Tests (121 tests)

| Module | Tests | Coverage | Mô tả |
|--------|-------|----------|-------|
| `api-service.ts` | 17 | 94.93% | Xử lý HTTP 401/404/500, timeout, retry |
| `coupon-utils.ts` | 17 | 100% | Tính toán coupon PERCENT/FIXED, expiry |
| `order-state-machine.ts` | 17 | 100% | Luồng trạng thái đơn hàng |
| `utils.ts` | 8 | 100% | Helper functions |
| `format.ts` | 5 | 100% | Format giá, ngày tháng |
| `auth-store.ts` | 18 | 52.27% | Login, logout, token, Firebase idToken |
| `cart-store.ts` | 33 | 68.42% | Add item, remove, update qty, stock validation |
| `use-debounced-callback.ts` | 6 | 47.61% | Debounce logic |

### 9.3 Chi tiết NLP Service Tests (37 tests)

| Module | Tests | Mô tả |
|--------|-------|-------|
| `sentiment-analyzer.ts` | 12 | Phân tích sentiment tiếng Việt |
| `schema-validator.ts` | 8 | Validate output structure (Zod schema) |
| `priority-calculator.ts` | 6 | Tính priority CRITICAL/HIGH/MEDIUM/LOW |
| `fake-review-detector.ts` | 5 | Phát hiện review giả mạo |
| `helpfulness-scorer.ts` | 6 | Tính điểm chất lượng review |

### 9.4 Chi tiết E2E Tests (8 tests)

| Test | Thời gian | Mô tả |
|------|-----------|-------|
| AI Review Summary display | ~5s | Verify AI summary hiển thị trên product page |
| AI insights product features | ~4s | Verify phân tích tính năng sản phẩm |
| AI summary persistence | ~5s | Verify AI summary vẫn còn khi navigate qua lại |
| AI summary styling | ~3s | Verify icon Sparkles, badge Beta |
| Customer reviews positioning | ~4s | Verify reviews nằm dưới AI summary |
| Authenticated review writing | ~5s | User đăng nhập viết review |
| AI summary during interactions | ~4s | AI summary vẫn hiển thị khi click |
| Gatekeeper redirect | ~3s | User chưa login → redirect về login |

### 9.5 Chi tiết Performance Tests (2 tests)

| Test | Cấu hình | Mục tiêu |
|------|----------|----------|
| Smoke Test | 3 VUs, 30s | Kiểm tra service còn sống không |
| Stress Test | 0-100 VUs, 2 phút | Tìm điểm gãy khi tải cao |

### 9.6 Pass Rate

- **Overall Pass Rate: 100%** (168/168 tests pass)
- **CI/CD**: Có retry 2 lần cho E2E tests
- **Flaky tests**: Đã giải quyết bằng `wait-on` cho service startup

---

## 10. FILE `.BAT` KHỞI ĐỘNG & GIẢI QUYẾT LỖI E2E TIMEOUT

### 10.1 Vấn đề gặp phải

**Triệu chứng:**
- E2E test chạy đứng yên không có response
- Báo lỗi `Timeout 60000ms exceeded`
- Service có thể đã chạy nhưng test không kết nối được

### 10.2 Tại sao chuyển sang file `.bat`?

**Trước:** Developer mở 3 Terminal riêng biệt, chạy thủ công:
```bash
# Terminal 1
cd backend && mvn spring-boot:run

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd nlp-service && npm run dev
```

**Vấn đề:**
- Dễ quên khởi động service nào đó
- Khó kiểm soát thứ tự khởi động
- Mỗi người làm một kiểu → không nhất quán

**Sau:** File `start-all.bat`:
```batch
@echo off
call npm install         ← Đảm bảo dependencies đầy đủ
call npm run start:all   ← Chạy tất cả trong 1 process tree
```

### 10.3 Tại sao E2E test bị timeout "đứng đó không làm gì"?

**Nguyên nhân chính: Race Condition giữa Service Startup và Test Execution**

```
Không có wait-on (FAIL):

T+0s   E2E test bắt đầu chạy
       Backend đang compile Maven... (chưa sẵn sàng)
       
T+5s   Test gọi POST /api/auth/login
       ❌ Backend chưa chạy → Không có phản hồi
       
T+65s  ⏱️ TIMEOUT! Test FAIL

T+90s  Backend finally khởi động xong  ← Muộn quá rồi!
```

**Nguyên nhân phụ:**
1. **Port conflict**: Service nào đó đã chiếm port
2. **Database chưa chạy**: Backend khởi động trước PostgreSQL
3. **NLP Service chậm**: `npm install` chạy lại làm mất thời gian
4. **Headless mode issue**: Playwright headless đôi khi không tương thích với UI render

### 10.4 Giải pháp đã áp dụng

**1. File `.bat` đảm bảo consistency:**
- Mọi người chạy cùng một cách
- `npm install` chạy trước để đảm bảo dependencies
- `concurrently` quản lý tất cả processes trong 1 terminal

**2. CI/CD dùng `wait-on`:**

```yaml
# .github/workflows/e2e-tests.yml
- name: Wait for services
  run: |
    npx wait-on http://localhost:8080  --timeout 60000
    npx wait-on http://localhost:8081  --timeout 60000
    npx wait-on http://localhost:3001  --timeout 60000

- name: Run E2E tests
  run: cd e2e-tests && npx playwright test
```

**3. Playwright config:**
```typescript
// playwright.config.ts
{
  timeout: 60000,           // Mỗi test có 60 giây
  navigationTimeout: 30000, // Navigation chờ tối đa 30 giây
  actionTimeout: 30000,     // Mỗi action chờ tối đa 30 giây
  retries: process.env.CI ? 2 : 0,  // Retry 2 lần trên CI
}
```

### 10.5 Có nên thường xuyên dùng file `.bat`?

| Kịch bản | Khuyến nghị |
|----------|-------------|
| **Development local** | ✅ Nên dùng `.bat` hoặc `npm run start:all` |
| **CI/CD (GitHub Actions)** | ✅ Dùng `wait-on` + script khởi động riêng |
| **Production deploy** | ❌ Không dùng `.bat`. Dùng Docker/Systemd/Kubernetes |
| **Team > 3 người** | ✅ Nên có script chuẩn (`.bat` cho Win, `.sh` cho Mac/Linux) |

### 10.6 Khi gặp lỗi E2E timeout, troubleshoot như thế nào?

```bash
# Bước 1: Kiểm tra service có chạy không
curl http://localhost:8080    # Frontend
curl http://localhost:8081    # Backend
curl http://localhost:3001    # NLP Service

# Bước 2: Kiểm tra port có bị chiếm không (Windows)
netstat -ano | findstr :8080

# Bước 3: Chạy Playwright với headed mode để xem UI
npx playwright test --headed

# Bước 4: Chạy 1 test cụ thể với debug
npx playwright test tests/checkout.spec.ts --debug

# Bước 5: Xem trace khi fail
npx playwright show-trace trace.zip
```

---

## 11. TẠI SAO LOẠI BỎ DOCKER & NGINX?

### 11.1 Docker - Đề xuất ban đầu

**Lý do đề xuất Docker:**
- Mỗi developer có môi trường khác nhau (Windows, Mac, Linux)
- Docker đảm bảo: "Chạy được trên máy tôi = Chạy được trên máy bạn"
- Dễ dàng khởi động PostgreSQL mà không cần cài đặt thủ công
- Tách biệt dependencies, tránh xung đột version

**Cấu hình dự định:**
```yaml
# docker-compose.yml (dự định)
version: '3.8'
services:
  db:
    image: postgres:16
    ports: ["5432:5432"]
  backend:
    build: ./backend
    ports: ["8081:8081"]
    depends_on: [db]
  frontend:
    build: ./frontend
    ports: ["8080:8080"]
  nlp-service:
    build: ./nlp-service
    ports: ["3001:3001"]
```

### 11.2 Tại sao loại bỏ Docker?

**Khó khăn gặp phải:**

| Vấn đề | Giải thích |
|--------|------------|
| **Frontend dev server** | Vite dev server (`npm run dev`) cần hot-reload, Docker volume mount phức tạp |
| **Backend Maven** | `mvn spring-boot:run` cần download dependencies lần đầu, Docker layer caching khó optimize |
| **Windows compatibility** | Docker Desktop trên Windows ăn nhiều RAM, chậm, hay gặp lỗi WSL2 |
| **E2E testing phức tạp** | Playwright cần kết nối đến service trong container, port mapping rắc rối |
| **Thời gian build** | `docker-compose build` lâu hơn nhiều so với chạy trực tiếp |
| **Learning curve** | Team mới học, thêm Docker là thêm 1 lớp phức tạp |

**Quyết định:** Vì đây là dự án học tập, ưu tiên **dễ debug** hơn **production-like**. Chạy trực tiếp giúp phát hiện lỗi nhanh hơn.

### 11.3 Nginx - Đề xuất ban đầu

**Lý do đề xuất Nginx:**
- **Reverse Proxy**: Gộp nhiều port (8080, 8081, 3001) thành 1 port (80)
- **Load Balancing**: Phân phối request đến nhiều instance backend
- **SSL Termination**: Tự động HTTPS
- **Static file serving**: Serve frontend build nhanh hơn Node.js

**Cấu hình dự định:**
```nginx
server {
    listen 80;
    
    location / {
        proxy_pass http://localhost:8080;  # Frontend
    }
    
    location /api/ {
        proxy_pass http://localhost:8081;  # Backend
    }
    
    location /nlp/ {
        proxy_pass http://localhost:3001;  # NLP Service
    }
}
```

### 11.4 Tại sao loại bỏ Nginx?

**Khó khăn gặp phải:**

| Vấn đề | Giải thích |
|--------|------------|
| **Development không cần** | Local dev, mỗi service chạy port riêng tiện hơn |
| **CORS phức tạp thêm** | Thêm proxy layer → thêm vấn đề CORS cần debug |
| **E2E tests bị ảnh hưởng** | Playwright cần trỏ đúng port, thêm proxy là thêm điểm hỏng |
| **Windows setup** | Cài Nginx trên Windows không native, dùng WSL hoặc binary rườm rà |
| **Không cần SSL local** | Chỉ cần HTTP cho development |
| **Không cần load balance** | Chỉ chạy 1 instance mỗi service |

### 11.5 Tóm tắt lý do loại bỏ

```
┌─────────────────────────────────────────────────────────────┐
│  MỤC TIÊU DỰ ÁN: Học tập & Demo                             │
│  → Ưu tiên: Dễ chạy, dễ debug, dễ giải thích                │
│  → Không ưu tiên: Production scalability                   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │  Docker   │    │  Nginx   │    │  E2E    │
        │  (loại)   │    │  (loại)  │    │ (giữ lại│
        └─────────┘    └─────────┘    │ nhưng    │
                                      │ simplify)│
                                      └─────────┘
        Lý do chung: Thêm lớp abstraction không cần thiết
                     cho môi trường development
```

### 11.6 Bài học & Khó khăn trong quá trình thực hiện

| Khó khăn | Giải pháp đã áp dụng | Bài học |
|----------|---------------------|---------|
| E2E tests fail do services chưa sẵn sàng | `wait-on` trong CI/CD + file `.bat` | Luôn đợi dependencies ready trước khi test |
| E2E tests flaky do timing | `retries: 2`, `networkidle`, `waitForTimeout` | Web async → cần wait đúng chỗ |
| Port conflicts | Script kill port trước khi start | Quản lý lifecycle của processes |
| Local dev không đồng nhất | `start-all.bat` + `concurrently` | Chuẩn hóa môi trường dev |
| Frontend test cần mock nhiều | `vi.mock()`, `global.fetch = vi.fn()` | Unit test phải isolated |

### 11.7 Khi nào NÊN dùng Docker/Nginx?

| Giai đoạn | Docker | Nginx |
|-----------|--------|-------|
| **Development 1-2 devs** | ❌ Không cần | ❌ Không cần |
| **Development team > 5 người** | ✅ Cần | ⚠️ Có thể cần |
| **Staging/Testing** | ✅ Bắt buộc | ✅ Nên có |
| **Production** | ✅ Bắt buộc | ✅ Bắt buộc |
| **Microservices thật sự** | ✅ Kubernetes | ✅ Ingress Controller |

**Kết luận:** Việc loại bỏ Docker và Nginx là **hợp lý cho scope hiện tại** (học tập, demo, nhóm nhỏ). Đây là **technical debt có chủ đích** (intentional technical debt) để tập trung vào business logic và testing.

---

*File được tạo để giải thích tổng hợp 11 câu hỏi quan trọng trong dự án ShopCart AI Playbook.*
