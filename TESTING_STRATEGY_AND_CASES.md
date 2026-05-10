# CHIẾN LƯỢC KIỂM THỬ VÀ CÁC BÀI TEST CHI TIẾT

## 1. TỔNG QUAN CHIẾN LƯỢC KIỂM THỬ (TESTING STRATEGY)

### 1.1 Mô hình Test Kim Tự Tháp (Test Pyramid)

Hệ thống ShopCart AI áp dụng mô hình **Test Pyramid** với phân bổ test như sau:

```
                    ▲
                   / \
                  / E2E \          Playwright Tests
                 /  8   \          (8 tests - Luồng người dùng thật)
                /_________\
               / Integration \     NLP Service Tests
              /     37       \    (37 tests - AI logic & Vietnamese)
             /_______________\
            /    Unit Tests    \   Frontend Tests
           /      121          \  (121 tests - Store & Utils)
          /_____________________\
```

| Layer | Công cụ | Số lượng Test | Coverage | Thời gian chạy |
|-------|---------|--------------|-----------|----------------|
| **Unit Tests** | Vitest (Frontend) | 121 | 62.92% statement, 43.9% branch | ~5-10s |
| **Integration Tests** | Jest (NLP Service) | 37 | 45.14% statement, 30.66% branch | ~3-5s |
| **E2E Tests** | Playwright | 8 | - | ~30-60s |
| **Performance Tests** | K6 | 2 | - | Smoke: 30s, Stress: 4.5m |
| **Tổng cộng** | - | **168** | **100% pass rate** | - |

### 1.2 Tại sao dùng Test Pyramid?

**Lý do kiến trúc:**

1. **Unit Tests (Nhiều nhất)**:
   - Tập trung vào logic nghiệp vụ nhỏ nhất
   - Chạy nhanh nhất (milliseconds)
   - Dễ debug khi fail
   - Chi phí thấp nhất
   - Tại sao? Phát hiện bug sớm nhất trong development cycle

2. **Integration Tests (Trung bình)**:
   - Test interaction giữa các modules
   - Mock external dependencies (API, Database)
   - Chạy nhanh hơn E2E
   - Tại sao? Verify components work together without full system

3. **E2E Tests (Ít nhất)**:
   - Test luồng người dùng thật
   - Không mock (hoặc mock tối thiểu)
   - Chạy chậm nhất
   - Chi phí cao nhất
   - Tại sao? Verify critical user journeys work end-to-end

4. **Performance Tests (Đặc biệt)**:
   - Smoke test: Health check nhẹ nhàng
   - Stress test: Tìm điểm gãy dưới load cao
   - Tại sao? Đảm bảo hệ thống chịu được traffic thực tế

### 1.3 Công cụ Kiểm thử Đã Sử Dụng

| Công cụ | Mục đích | Tại sao chọn? |
|---------|---------|---------------|
| **Vitest** | Frontend Unit Tests | Tích hợp sẵn với Vite, nhanh hơn Jest 2-10x, ESM support |
| **Jest** | NLP Service Tests | Ecosystem Completion, Mock capability, TypeScript support tốt |
| **Playwright** | E2E Tests | Cross-browser, faster than Cypress, auto-waiting |
| **K6** | Performance Tests | Developer-friendly, scriptable in JS, good reporting |

---

## 2. PHƯƠNG PHÁP VIẾT TEST (HOW IT WAS WRITTEN)

### 2.1 Kỹ thuật Mocking - Giả lập API và External Services

Mocking là kỹ thuật thay thế các dependencies thật bằng các giả lập (mocks) để:
- Test chạy nhanh mà không cần gọi API thật
- Tránh tốn tiền gọi AI API (Hugging Face, Gemini)
- Control behavior của external services
- Test edge cases mà API thật không dễ trigger

#### 2.1.1 Mocking với Vitest (Frontend)

**Ví dụ 1: Mock apiFetch trong auth-store.test.ts**

```typescript
// Mock toàn bộ api-service module
vi.mock('@/lib/api-service', () => ({
  apiFetch: vi.fn(),  // Giả lập apiFetch function
}));

// Trong test, control behavior của mock
describe('Auth Store', () => {
  it('should call login endpoint', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test' };
    
    // Setup mock để trả về giá trị cụ thể
    (apiFetch as any).mockResolvedValueOnce({
      user: mockUser,
      token: 'fake-jwt-token'
    });
    
    // Gọi hàm login
    await useAuthStore.getState().login('test@example.com', 'password');
    
    // Verify apiFetch được gọi đúng tham số
    expect(apiFetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: { email: 'test@example.com', password: 'password' }
      })
    );
  });
});
```

**Tại sao mock như vậy?**

- **Isolation**: Test auth logic mà không cần Backend chạy
- **Speed**: Không cần wait network request
- **Control**: Có thể test cả success và error scenarios
- **Reproducibility**: Test luôn pass dù API thật có vấn đề

**Ví dụ 2: Mock global.fetch trong api-service.test.ts**

```typescript
describe('API Service', () => {
  beforeEach(() => {
    // Mock global fetch function
    global.fetch = vi.fn();
  });

  it('should handle 401 Unauthorized error', async () => {
    // Setup mock để simulate 401 response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
      text: async () => 'Unauthorized',
    });

    // Gọi apiFetch và catch error
    const error = await apiFetch('/api/orders').catch(e => e) as ApiError;
    
    // Verify error được handle đúng
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });
});
```

**Tại sao mock fetch thay vì apiFetch?**

- **Lower Level**: Mock fetch để test toàn bộ api-service logic
- **Network Simulation**: Có thể test timeout, network errors
- **Error Handling**: Test các edge cases của fetch API

#### 2.1.2 Mocking với Jest (NLP Service)

**Ví dụ: Mock Hugging Face Inference API**

```typescript
import { HfInference } from '@huggingface/inference';

// Mock toàn bộ Hugging Face module
jest.mock('@huggingface/inference');

describe('Sentiment Analyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API key để test demo mode
    process.env.HUGGINGFACE_API_KEY = '';
  });

  test('should use Hugging Face API when valid key is provided', async () => {
    // Set valid API key để enable real API mode
    process.env.HUGGINGFACE_API_KEY = 'valid_api_key_for_testing';
    
    // Mock HfInference instance
    const mockHfInstance = {
      textClassification: jest.fn().mockResolvedValue([
        { label: '5 stars', score: 0.98 }
      ])
    };

    // Mock constructor để trả về mock instance
    MockedHfInference.mockImplementation(() => mockHfInstance as any);

    const review = 'Sản phẩm tuyệt vời!';
    const result = await analyzeSentiment(review);

    // Verify result structure
    expect(result.sentiment).toBeDefined();
    expect(result.rating_score).toBeGreaterThanOrEqual(1);
  });
});
```

**Tại sao mock Hugging Face API?**

- **Cost Saving**: Hugging Face API tốn tiền per request
- **Speed**: Không cần wait AI inference (có thể mất 1-5s)
- **Reliability**: Test không fail do API rate limits hoặc downtime
- **Deterministic**: AI responses có thể khác nhau mỗi lần, mock đảm bảo consistency

**Ví dụ: Mock API Error để Test Fallback**

```typescript
test('should fallback to demo mode on API error', async () => {
  const mockHfInstance = {
    textClassification: jest.fn().mockRejectedValue(new Error('API Error'))
  };

  MockedHfInference.mockImplementation(() => mockHfInstance as any);

  const review = 'Sản phẩm tốt';
  const result = await analyzeSentiment(review);

  // Verify system vẫn trả về result dù API fail
  expect(result.sentiment).toBeDefined();
  expect(result.rating_score).toBeGreaterThanOrEqual(1);
  expect(result.rating_score).toBeLessThanOrEqual(5);
});
```

**Tại sao test fallback logic?**

- **Resilience**: Đảm bảo hệ thống vẫn hoạt động khi AI service down
- **Graceful Degradation**: User vẫn nhận được response (dù là demo mode)
- **Production Safety**: Không crash production khi external service fail

### 2.2 Kỹ thuật Spying - Kiểm tra Function Calls

Spying là kỹ thuật "theo dõi" một function để verify:
- Function có được gọi hay không
- Được gọi với tham số nào
- Được gọi bao nhiêu lần
- Return value là gì

#### 2.2.1 Spying với Vitest

**Ví dụ 1: Spy localStorage.setItem**

```typescript
describe('purgeSession', () => {
  it('should clear localStorage entries', () => {
    // Setup initial state
    localStorage.setItem('shopcart_auth', JSON.stringify({ test: 'data' }));
    localStorage.setItem('shopcart_cart', JSON.stringify({ test: 'data' }));
    
    // Call purgeSession
    purgeSession();
    
    // Verify localStorage.removeItem được gọi đúng
    expect(localStorage.getItem('shopcart_auth')).toBeNull();
    expect(localStorage.getItem('shopcart_cart')).toBeNull();
  });
});
```

**Tại sao spy localStorage?**

- **Side Effect Verification**: Verify function có cleanup đúng
- **No Real I/O**: Không thực sự write đến disk (faster)
- **Test Isolation**: Mỗi test có localStorage riêng

**Ví dụ 2: Spy console.log**

```typescript
describe('resetMockDB', () => {
  it('should log message when called', () => {
    // Spy console.log
    const consoleSpy = vi.spyOn(console, 'log');
    
    resetMockDB();

    // Verify console.log được gọi với message cụ thể
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Mock DB đã bị gỡ bỏ')
    );

    // Restore original function
    consoleSpy.mockRestore();
  });
});
```

**Tại sao spy console.log?**

- **Logging Verification**: Đảm bảo important messages được log
- **Debug Aid**: Help debug khi test fail
- **Documentation**: Log messages serve as documentation

**Ví dụ 3: Spy với mock implementation**

```typescript
it('should handle storage errors gracefully', () => {
  // Mock localStorage.removeItem để throw error
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = vi.fn(() => {
    throw new Error('Storage error');
  });
  
  // Verify function không throw error
  expect(() => purgeSession()).not.toThrow();
  
  // Restore original function
  localStorage.removeItem = originalRemoveItem;
});
```

**Tại sao spy error scenarios?**

- **Error Handling**: Verify function handle errors gracefully
- **Robustness**: Đảm bảo system không crash khi storage fail
- **Edge Cases**: Test scenarios khó reproduce (quota exceeded, private mode)

#### 2.2.2 Spying với Jest

**Ví dụ: Spy Hugging Face API calls**

```typescript
test('should retry with different models on failure', async () => {
  const mockHfInstance = {
    textClassification: jest.fn()
      .mockRejectedValueOnce(new Error('Model 1 failed'))
      .mockRejectedValueOnce(new Error('Model 2 failed'))
      .mockResolvedValue([{ label: '3 stars', score: 0.7 }])
  };

  MockedHfInference.mockImplementation(() => mockHfInstance as any);

  const review = 'Sản phẩm ổn';
  const result = await analyzeSentiment(review);

  // Verify textClassification được gọi 3 lần (retry mechanism)
  expect(mockHfInstance.textClassification).toHaveBeenCalledTimes(3);
  
  // Verify result vẫn valid dù 2 lần fail
  expect(result.sentiment).toBeDefined();
});
```

**Tại sao spy retry logic?**

- **Resilience Testing**: Verify retry mechanism hoạt động
- **Performance**: Đảm bảo không retry vô hạn
- **Fallback**: Test fallback khi tất cả models fail

---

## 3. CHI TIẾT CÁC BÀI TEST QUAN TRỌNG (WHAT IS TESTED)

### 3.1 Frontend Tests - Store & Logic

#### 3.1.1 Cart Store Tests (cart-store.test.ts)

**Tổng quan:**
- Số lượng test: **36 test cases**
- File: `frontend/src/test/cart-store.test.ts`
- Coverage: Stock validation, cart operations, edge cases

**9 Test Cases Quan Trọng về Stock Validation:**

| Test Case | Mô tả | Tại sao quan trọng? |
|-----------|-------|---------------------|
| 1. **should cap quantity at stock limit when adding new item** | User thêm 10 items nhưng stock chỉ có 5 → quantity được cap ở 5 | Tránh overselling, race condition |
| 2. **should cap quantity at stock limit when updating existing item** | User update quantity lên 10 nhưng stock là 3 → cap ở 3 | Frontend validation trước khi gọi Backend |
| 3. **should not increase quantity when already at stock limit** | User đã có 2 items (stock=2), thêm 1 nữa → không tăng | Prevent incremental overselling |
| 4. **should handle adding to existing item without exceeding stock** | Có 3 items, thêm 4 nữa → total 7 (dưới stock 10) | Normal case, verify accumulation logic |
| 5. **should cap at stock limit when adding to existing item** | Có 3 items, thêm 5 (total 8) nhưng stock 5 → cap ở 5 | Edge case của accumulation |
| 6. **should handle zero stock (cannot add item)** | Stock = 0, user thêm 1 item → không thêm | Prevent adding out-of-stock items |
| 7. **should handle updating to exact stock quantity** | Update quantity bằng chính stock limit → cho phép | Boundary test |
| 8. **should prevent adding more than one item when stock is 1** | Stock = 1, thêm 2 lần → vẫn chỉ 1 item | Critical edge case |
| 9. **should handle multiple items with different stock limits** | 2 sản phẩm với stock khác nhau → cap đúng từng cái | Multi-item scenario |

**Code Snippet - Stock Validation Test:**

```typescript
describe('Stock Validation', () => {
  it('should cap quantity at stock limit when adding new item', () => {
    const product: Product = {
      id: '1',
      name: 'Test Product',
      price: 100,
      description: 'Test description',
      imageUrl: 'http://test.com/image.jpg',
      stockQuantity: 5,
      category: 'Electronics',
    };

    useCartStore.getState().addItem(product, 10);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5); // Capped at stock limit
  });

  it('should prevent adding more than one item when stock is 1', () => {
    const product: Product = {
      id: '1',
      name: 'Limited Stock Product',
      price: 100,
      description: 'Test description',
      imageUrl: 'http://test.com/image.jpg',
      stockQuantity: 1,
      category: 'Electronics',
    };

    useCartStore.getState().addItem(product, 1);
    useCartStore.getState().addItem(product, 1);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1); // Still at 1, not increased
  });
});
```

**Logic đằng sau Stock Validation Tests:**

1. **Frontend-First Defense**: Validate stock ở Frontend để:
   - Giảm 80-90% request thừa đến Backend
   - Instant feedback cho user
   - Better UX (không cần wait API)

2. **Race Condition Prevention**: `Math.min(currentQty + quantity, stockQuantity)`
   - Đảm bảo không bao giờ vượt quá stock
   - Kể cả khi user spam click

3. **Boundary Testing**: Test các edge cases:
   - Stock = 0 (out of stock)
   - Stock = 1 (limited quantity)
   - Exact stock limit (boundary)
   - Multiple items với different stocks

#### 3.1.2 Auth Store Tests (auth-store.test.ts)

**Tổng quan:**
- Số lượng test: **14 test cases**
- File: `frontend/src/test/stores/auth-store.test.ts`
- Coverage: Firebase Gatekeeper, session management, purgeSession

**Test Cases về Firebase Gatekeeper:**

| Test Case | Mô tả | Tại sao quan trọng? |
|-----------|-------|---------------------|
| 1. **should set idToken when provided** | Set Firebase ID Token → verify persisted | Gatekeeper cho AI features |
| 2. **should clear idToken when null is passed** | Pass null → idToken cleared | Logout scenario |
| 3. **should update idToken when new token is provided** | Update token → verify new value | Token refresh scenario |
| 4. **should persist idToken across state updates** | Update state khác → idToken vẫn giữ | Persistence verification |
| 5. **purgeSession should clear cart store** | purgeSession() → cart cleared | Session isolation |
| 6. **purgeSession should clear localStorage entries** | purgeSession() → localStorage cleared | Data leak prevention |
| 7. **purgeSession should clear sessionStorage** | purgeSession() → sessionStorage cleared | Complete session cleanup |
| 8. **purgeSession should handle storage errors gracefully** | Mock storage error → không throw | Robustness under errors |

**Code Snippet - Firebase Gatekeeper Test:**

```typescript
describe('setIdToken', () => {
  it('should set idToken when provided', () => {
    useAuthStore.getState().setIdToken('firebase-id-token-123');
    
    expect(useAuthStore.getState().idToken).toBe('firebase-id-token-123');
  });

  it('should persist idToken across state updates', () => {
    useAuthStore.getState().setIdToken('persistent-token');
    useAuthStore.setState({ user: null }); // Other state change
    
    expect(useAuthStore.getState().idToken).toBe('persistent-token');
  });
});

describe('purgeSession', () => {
  it('should clear cart store', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 100,
      description: 'Test',
      imageUrl: 'http://test.com/image.jpg',
      stockQuantity: 10,
      category: 'Electronics',
    };
    useCartStore.getState().addItem(product, 1);
    expect(useCartStore.getState().items).toHaveLength(1);
    
    purgeSession();
    
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('should handle storage errors gracefully', () => {
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = vi.fn(() => {
      throw new Error('Storage error');
    });
    
    expect(() => purgeSession()).not.toThrow();
    
    localStorage.removeItem = originalRemoveItem;
  });
});
```

**Logic đằng sau Firebase Gatekeeper Tests:**

1. **Dual Token System**:
   - `token`: JWT từ Backend cho API calls
   - `idToken`: Firebase ID Token cho NLP Service
   - Test verify cả 2 tokens được manage đúng

2. **Session Isolation**:
   - `purgeSession()` xóa toàn bộ session data
   - Tránh data leak giữa các user
   - Test verify cleanup hoàn toàn

3. **Error Resilience**:
   - Storage có thể fail (quota exceeded, private mode)
   - System vẫn hoạt động dù storage error
   - Test verify graceful error handling

#### 3.1.3 API Service Tests (api-service.test.ts)

**Tổng quan:**
- Số lượng test: **17 test cases**
- File: `frontend/src/test/lib/api-service.test.ts`
- Coverage: Error handling, route translation, authentication

**Test Cases về Error Handling:**

| Test Case | Mô tả | Tại sao quan trọng? |
|-----------|-------|---------------------|
| 1. **should handle 401 Unauthorized error** | Mock 401 → verify ApiError thrown | Authentication failure |
| 2. **should handle 404 Not Found error** | Mock 404 → verify ApiError thrown | Resource not found |
| 3. **should handle 500 Internal Server Error** | Mock 500 → verify ApiError thrown | Server error |
| 4. **should handle network error (fetch failure)** | Mock network error → verify custom message | Connection failure |
| 5. **should handle 204 No Content response** | Mock 204 → verify empty object returned | Empty response handling |
| 6. **should handle invalid JSON in error response** | Mock invalid JSON → fallback to text | Malformed response |
| 7. **should handle missing localStorage (SSR)** | Delete window object → verify no crash | Server-side rendering |
| 8. **should handle malformed localStorage data** | Set invalid JSON → verify no crash | Corrupted storage |

**Code Snippet - Error Handling Test:**

```typescript
describe('apiFetch', () => {
  it('should handle 401 Unauthorized error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
      text: async () => 'Unauthorized',
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

  it('should handle missing localStorage (SSR)', async () => {
    const originalWindow = global.window;
    delete (global as any).window;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const result = await apiFetch('/api/products');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8081/api/products',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        // Should not have Authorization header
      })
    );

    global.window = originalWindow;
  });
});
```

**Logic đằng sau Error Handling Tests:**

1. **User-Friendly Messages**:
   - 401 → "Unauthorized"
   - Network error → "Không thể kết nối đến máy chủ 8081"
   - Tại sao? Help user debug vấn đề

2. **Graceful Degradation**:
   - Invalid JSON → Fallback to text response
   - Missing localStorage → Don't crash (SSR compatible)
   - Tại sao? System vẫn hoạt động dù có lỗi nhỏ

3. **Route Translation**:
   - Frontend paths → Backend paths mapping
   - Test verify translation đúng
   - Tại sao? Frontend và Backend có thể có different API conventions

### 3.2 NLP Service Tests (Node.js/LangChain)

#### 3.2.1 Vietnamese Alignment Tests

**Tổng quan:**
- Số lượng test: **7 test cases**
- File: `nlp-service/sentiment-analyzer.test.ts`
- Coverage: Tiếng Việt có dấu, Telex, VNI, technical terms

**Test Cases về Vietnamese Alignment:**

| Test Case | Mô tả | Tại sao quan trọng? |
|-----------|-------|---------------------|
| 1. **should detect positive sentiment in Vietnamese with accents** | "Sản phẩm này tuyệt vời! Mình rất hài lòng." | Vietnamese với dấu đầy đủ |
| 2. **should detect negative sentiment in Vietnamese with accents** | "Sản phẩm rất tệ, mình thất vọng vô cùng." | Negative Vietnamese |
| 3. **should handle Vietnamese Telex input (te, ne, etc.)** | "San pham nay tot qua, minh rat hai long." | Telex input (không dấu) |
| 4. **should extract Vietnamese aspect keywords correctly** | "Pin trâu được 8 tiếng, màn hình sắc nét..." | Aspect extraction (pin, màn hình, hiệu năng) |
| 5. **should detect Vietnamese technical issue keywords** | "Máy bị lỗi màn hình xanh, hỏng phím..." | Technical issue detection |
| 6. **should detect Vietnamese feature suggestions** | "Ướ gì máy có đèn nền bàn phím..." | Feature suggestion detection |
| 7. **should detect competitor mentions in Vietnamese** | "Acer ổn nhưng so với Dell thì vẫn kém hơn." | Competitor mention detection |

**Code Snippet - Vietnamese Alignment Test:**

```typescript
describe('Vietnamese Language Alignment Tests', () => {
  test('should detect positive sentiment in Vietnamese with accents', async () => {
    const review = 'Sản phẩm này tuyệt vời! Mình rất hài lòng với chất lượng.';
    const result = await analyzeSentiment(review);

    expect(result.sentiment).toBe('Positive');
    expect(result.rating_score).toBeGreaterThanOrEqual(4);
    expect(['Joy', 'Satisfaction']).toContain(result.primary_emotion);
  });

  test('should handle Vietnamese Telex input (te, ne, etc.)', async () => {
    const review = 'San pham nay tot qua, minh rat hai long.';
    const result = await analyzeSentiment(review);

    // Should still detect positive sentiment even with Telex
    expect(['Positive', 'Neutral', 'Negative']).toContain(result.sentiment);
  });

  test('should extract Vietnamese aspect keywords correctly', async () => {
    const review = 'Pin trâu được 8 tiếng, màn hình sắc nét, hiệu năng ổn định.';
    const result = await analyzeSentiment(review);

    expect(result.aspects).toBeDefined();
    expect(result.aspects.pin).toBeDefined();
    expect(result.aspects.man_hinh).toBeDefined();
    expect(result.aspects.hieu_nang).toBeDefined();
  });
});
```

**Logic đằng sau Vietnamese Alignment Tests:**

1. **Multi-Input Format Support**:
   - Unicode có dấu: "Sản phẩm"
   - Telex: "San pham"
   - VNI: "Sản phảm" (nếu có)
   - Tại sao? User có thể gõ theo nhiều cách

2. **Vietnamese-Specific Aspects**:
   - `pin` (battery)
   - `man_hinh` (screen)
   - `hieu_nang` (performance)
   - Tại sao? Vietnamese reviews dùng các terms này

3. **Cultural Context**:
   - "Ướ gì" (wish)
   - "Giá mà" (if only)
   - "Tuyệt vời" (excellent)
   - Tại sao? Vietnamese sentiment expressions khác English

#### 3.2.2 Schema Validation Tests

**Tổng quan:**
- Số lượng test: **8 test cases**
- Coverage: Zod schema validation, enum values, ranges

**Test Cases về Schema Validation:**

| Test Case | Mô tả | Tại sao quan trọng? |
|-----------|-------|---------------------|
| 1. **should return valid SentimentAnalysis schema** | Verify tất cả required fields present | Schema completeness |
| 2. **rating_score should be between 1 and 5** | Test range validation | Rating bounds |
| 3. **sentiment should be valid enum value** | Test ["Positive", "Negative", "Neutral"] | Enum validation |
| 4. **primary_emotion should be valid enum value** | Test ["Anger", "Disappointment", "Joy", "Satisfaction", "Neutral"] | Emotion enum |
| 5. **priority should be valid enum value** | Test ["CRITICAL", "HIGH", "MEDIUM", "LOW"] | Priority enum |
| 6. **helpfulness_score should be between 1 and 10** | Test range validation | Score bounds |
| 7. **aspects should contain all required fields** | Test pin, man_hinh, hieu_nang | Aspect completeness |
| 8. **should handle malformed JSON from AI** | Mock invalid JSON → fallback to demo | AI response error handling |

**Code Snippet - Schema Validation Test:**

```typescript
describe('Schema Validation Tests', () => {
  test('should return valid SentimentAnalysis schema', async () => {
    const review = 'Sản phẩm tốt';
    const result = await analyzeSentiment(review);

    expect(result).toHaveProperty('rating_score');
    expect(result).toHaveProperty('sentiment');
    expect(result).toHaveProperty('is_fake_review');
    expect(result).toHaveProperty('aspects');
    expect(result).toHaveProperty('justification');
    expect(result).toHaveProperty('competitor_mentioned');
    expect(result).toHaveProperty('needs_support');
    expect(result).toHaveProperty('technical_issue');
    expect(result).toHaveProperty('primary_emotion');
    expect(result).toHaveProperty('priority');
    expect(result).toHaveProperty('helpfulness_score');
  });

  test('rating_score should be between 1 and 5', async () => {
    const review = 'Sản phẩm tốt';
    const result = await analyzeSentiment(review);

    expect(result.rating_score).toBeGreaterThanOrEqual(1);
    expect(result.rating_score).toBeLessThanOrEqual(5);
  });

  test('sentiment should be valid enum value', async () => {
    const review = 'Sản phẩm tốt';
    const result = await analyzeSentiment(review);

    expect(['Positive', 'Negative', 'Neutral']).toContain(result.sentiment);
  });
});
```

**Logic đằng sau Schema Validation Tests:**

1. **Type Safety**:
   - Zod schema đảm bảo output structure
   - Test verify schema enforcement
   - Tại sao? Prevent runtime errors từ malformed AI responses

2. **Enum Validation**:
   - Sentiment, Emotion, Priority enums
   - Test verify only valid values
   - Tại sao? Avoid invalid states in system

3. **Range Validation**:
   - rating_score: 1-5
   - helpfulness_score: 1-10
   - Test verify bounds
   - Tại sao? Prevent out-of-range values

### 3.3 Playwright E2E Tests - Luồng Người Dùng Thật

#### 3.3.1 AI Flow Tests

**Tổng quan:**
- Số lượng test: **8 test cases**
- File: `e2e-tests/tests/ai-flow.spec.ts`
- Coverage: AI Review Summary display, navigation, authentication

**Test Cases về AI Flow:**

| Test Case | Mô tả | Tại sao quan trọng? |
|-----------|-------|---------------------|
| 1. **should display AI Review Summary on product page** | Navigate → verify AI summary visible | Basic AI feature display |
| 2. **should display AI insights about product features** | Verify AI mentions specific aspects | Content accuracy |
| 3. **should maintain AI summary when navigating between products** | Navigate products → AI persists | Navigation consistency |
| 4. **should display AI summary with proper styling** | Verify Sparkles icon, Beta badge | UI/UX verification |
| 5. **should show customer reviews below AI summary** | Verify both sections visible | Layout verification |
| 6. **authenticated user can write review after viewing AI summary** | Login → verify write review button | Integration with auth |
| 7. **AI summary remains visible during page interactions** | Interact with quantity, add to cart → AI persists | State persistence |
| 8. **should redirect to login when accessing AI features without authentication** | Clear cookies → try access → verify redirect | Gatekeeper verification |

**Code Snippet - AI Flow Test:**

```typescript
test.describe('AI Review Summary Flow', () => {
  test('should display AI Review Summary on product page', async ({ page }) => {
    // Step 1: Navigate to home page
    await homePage.goto();
    await homePage.waitForProducts();

    // Step 2: Click on first product to view details
    await homePage.clickFirstProduct();
    
    // Wait for product detail page to load
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
  });

  test('should redirect to login when accessing AI features without authentication', async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
    
    await homePage.goto();
    await homePage.waitForProducts();
    await homePage.clickFirstProduct();
    await page.waitForURL(/\/product\/\d+/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Verify AI Review Summary is visible (public content)
    await expect(page.getByText('AI Review Summary')).toBeVisible();

    // Click login button to test redirect flow
    await homePage.clickLoginButton();
    
    // Verify we're on the login page
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page.getByTestId('login-button')).toBeVisible();
  });
});
```

**Logic đằng sau AI Flow Tests:**

1. **Real User Journey**:
   - Simulate user navigation
   - Verify AI summary displays correctly
   - Tại sao? Ensure AI feature works in real browser

2. **Gatekeeper Verification**:
   - Test redirect to login when not authenticated
   - Verify protected AI features
   - Tại sao? Security verification

3. **State Persistence**:
   - AI summary persists during interactions
   - Verify no state loss
   - Tại sao? UX consistency

### 3.4 K6 Performance Tests

#### 3.4.1 Smoke Test (smoke-test.js)

**Cấu hình:**

```javascript
export const options = {
  vus: 3,                    // 3 Virtual Users
  duration: '30s',           // Chạy 30 giây
  thresholds: {
    http_req_duration: ['p(95)<500'],     // 95% requests < 500ms
    http_req_failed: ['rate<0.1'],       // Error rate < 10%
  },
};
```

**Test Scenarios:**

1. **Frontend Homepage**: GET http://localhost:8080
2. **Backend Health**: GET http://localhost:8081/api/health
3. **Backend Products**: GET http://localhost:8081/api/products
4. **NLP Service Health**: GET http://localhost:3001/health

**Tại sao smoke test nhẹ nhàng?**

- **Health Check**: Verify tất cả services đang chạy
- **Quick Feedback**: Chạy nhanh (30s) để detect issues sớm
- **Low Load**: Không impact production
- **CI/CD Integration**: Dễ chạy trong pipeline

#### 3.4.2 Stress Test (stress-test.js)

**Cấu hình:**

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 0 },    // Warm-up period
    { duration: '30s', target: 20 },   // Ramp up to 20 VUs
    { duration: '30s', target: 50 },   // Ramp up to 50 VUs
    { duration: '30s', target: 100 },  // Ramp up to 100 VUs
    { duration: '1m', target: 100 },    // Stay at 100 VUs for 1 minute
    { duration: '30s', target: 50 },    // Ramp down to 50 VUs
    { duration: '30s', target: 0 },     // Ramp down to 0 VUs
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],   // P95 < 2s
    http_req_duration: ['p(90)<1000'],   // P90 < 1s
    http_req_failed: ['rate<0.1'],       // Error rate < 10%
  },
};
```

**Test Scenarios:**

1. **NLP Service /analyze endpoint**: POST với random Vietnamese reviews
2. **Health Check**: Periodic health checks (mỗi 10 VUs)

**Sample Reviews:**

```javascript
const sampleReviews = [
  'Sản phẩm này tuyệt vời! Mình đã dùng được 3 tháng và rất hài lòng.',
  'Đừng mua máy này! Hư hỏng liên tục, mới dùng 2 tuần đã bị lỗi.',
  'Máy ổn trong tầm giá. Thiết kế mỏng nhẹ dễ mang đi.',
  'Tốt tốt tốt tốt tốt! Mua ngay đi! Sản phẩm tốt nhất!',
  'Dùng Acer ổn nhưng so với Dell thì vẫn kém hơn.',
  'Máy này TỨC GIẬN quá! Mới mua 3 ngày đã bị màn hình xanh liên tục.',
  'Đã dùng sản phẩm được 6 tháng và muốn chia sẻ trải nghiệm chi tiết.',
  'Mua ngay hôm nay! Giảm giá 30%! Free ship toàn quốc!',
];
```

**Tại sao stress test ép tải 100 VUs?**

- **Find Breaking Point**: Tìm điểm gãy của hệ thống
- **Capacity Planning**: Biết hệ thống chịu được bao nhiêu load
- **Performance Bottleneck**: Tìm bottlenecks dưới load cao
- **Resilience Verification**: Verify system không crash under stress

**Logic đằng sau Ramp-up/Ramp-down:**

1. **Warm-up (30s, 0 VUs)**:
   - Cho system stabilize
   - Tại sao? Avoid cold start artifacts

2. **Gradual Ramp-up (30s each, 0→20→50→100 VUs)**:
   - Tăng load dần để observe behavior
   - Tại sao? Detect degradation points

3. **Sustained Load (1m, 100 VUs)**:
   - Giữ load cao để verify stability
   - Tại sao? Test memory leaks, connection pool exhaustion

4. **Gradual Ramp-down (30s each, 100→50→0 VUs)**:
   - Giảm load dần để verify recovery
   - Tại sao? System should recover gracefully

---

## 4. TỔNG KẾT TEST COVERAGE

### 4.1 Bảng Tóm Tắt Test Count

| Component | Test Type | Test Count | Key Areas Tested |
|-----------|-----------|------------|------------------|
| **Frontend** | Unit Tests (Vitest) | 121 | Stock validation, Auth gatekeeper, API errors, Utils |
| **NLP Service** | Integration Tests (Jest) | 37 | Vietnamese alignment, Schema validation, Priority logic |
| **E2E** | End-to-End (Playwright) | 8 | AI flow, Checkout, Auth redirect, Admin |
| **Performance** | Load/Stress (K6) | 2 | Smoke health check, Stress test 100 VUs |
| **Tổng cộng** | - | **168** | - |

### 4.2 Coverage Metrics

| Service | Statement Coverage | Branch Coverage | Test Pass Rate |
|---------|-------------------|----------------|----------------|
| Frontend | 62.92% | 43.9% | 100% |
| NLP Service | 45.14% | 30.66% | 100% |
| E2E | - | - | 100% |

### 4.3 Test Execution Time

| Test Suite | Execution Time | Parallel Execution |
|------------|----------------|-------------------|
| Frontend Unit Tests | ~5-10s | Yes (Vitest parallel) |
| NLP Service Tests | ~3-5s | Yes (Jest parallel) |
| E2E Tests | ~30-60s | No (sequential) |
| Performance Smoke | 30s | Yes (K6 VUs) |
| Performance Stress | 4.5m | Yes (K6 VUs) |

---

## 5. KẾT LUẬN

Hệ thống ShopCart AI đã xây dựng một bộ test toàn diện với **168 test cases** đạt **100% pass rate**, áp dụng mô hình Test Pyramid với:

- **Unit Tests (121)**: Focus vào logic nghiệp vụ nhỏ nhất với mocking và spying
- **Integration Tests (37)**: Test NLP Service với Vietnamese alignment và schema validation
- **E2E Tests (8)**: Verify critical user journeys với Playwright
- **Performance Tests (2)**: Smoke test cho health check và stress test cho load testing

Các kỹ thuật chính đã sử dụng:
- **Mocking**: Giả lập API Backend và Hugging Face để test nhanh và tiết kiệm chi phí
- **Spying**: Theo dõi function calls để verify behavior và side effects
- **Vietnamese Alignment**: Test đặc thù tiếng Việt (có dấu, Telex, technical terms)
- **Schema Validation**: Đảm bảo AI responses match expected structure với Zod

Bộ test này đảm bảo:
- **Early Bug Detection**: Unit tests catch bugs sớm trong development
- **Regression Prevention**: E2E tests prevent breaking changes
- **Performance Monitoring**: K6 tests ensure system handles load
- **Vietnamese Support**: Specialized tests for Vietnamese language processing
