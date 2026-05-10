# BÁO CÁO CÁ NHÂN - KIỂM THỬ PHẦN MỀM

**Môn học:** Kiểm Thử Phần Mềm  
**Giảng viên hướng dẫn:** TS. Từ Lãng Phiêu  
**Tên dự án:** ShopCart AI - Hệ thống Thương mại Điện tử với Tích hợp AI  
**Họ và tên sinh viên:** [Điền tên của bạn]  
**Mã sinh viên:** [Điền mã sinh viên]  
**Lớp:** [Điền lớp]  
**Ngày nộp:** [Điền ngày]

---

## 1. VAI TRÒ & ĐÓNG GÓP (ROLE & CONTRIBUTIONS)

Trong dự án ShopCart AI, tôi đã đóng góp vào các khía cạnh sau của hệ thống kiểm thử:

### 1.1 Thiết lập Unit Test với Vitest

**Nhiệm vụ:**
- Thiết lập Vitest cho Frontend (React/TypeScript)
- Viết 121 unit tests cho các module: Cart Store, Auth Store, API Service, Coupon Utils, Order State Machine, Utils, Format
- Cấu hình Vitest với mocking và spying capabilities

**Kết quả đạt được:**
- 121 unit tests với 100% pass rate
- Coverage: 62.92% statements, 43.9% branches
- Modules có coverage cao: api-service.ts (94.93%), coupon-utils.ts (100%), order-state-machine.ts (100%)

**Các file test chính đã viết:**
- `frontend/src/test/stores/cart-store.test.ts` (36 tests)
- `frontend/src/test/stores/auth-store.test.ts` (14 tests)
- `frontend/src/test/lib/api-service.test.ts` (17 tests)
- `frontend/src/test/lib/coupon-utils.test.ts` (17 tests)
- `frontend/src/test/lib/order-state-machine.test.ts` (17 tests)
- `frontend/src/test/utils/utils.test.ts` (8 tests)
- `frontend/src/test/utils/format.test.ts` (5 tests)
- `frontend/src/test/hooks/use-debounced-callback.test.ts` (6 tests)

### 1.2 Tích hợp Playwright E2E Tests

**Nhiệm vụ:**
- Thiết lập Playwright cho E2E testing
- Viết 8 E2E tests bảo vệ luồng AI và Authentication
- Thiết lập Page Object Model (POM) cho maintainability
- Cấu hình Playwright để xuất HTML report

**Kết quả đạt được:**
- 8 E2E tests với 100% pass rate trên 3 browsers (Chromium, Firefox, WebKit)
- HTML report với timeline, screenshots, video recording
- Page Objects: CartPage.ts, HomePage.ts, LoginPage.ts

**Các file test chính đã viết:**
- `e2e-tests/tests/ai-flow.spec.ts` (8 tests)
- `e2e-tests/pages/CartPage.ts`
- `e2e-tests/pages/HomePage.ts`
- `e2e-tests/pages/LoginPage.ts`

### 1.3 Xây dựng CI/CD Pipeline với GitHub Actions

**Nhiệm vụ:**
- Thiết lập GitHub Actions workflow cho CI/CD
- Tự động chạy unit tests trên mỗi push và pull request
- Tự động chạy E2E tests với service startup
- Cấu hình wait-on để đồng bộ service readiness

**Kết quả đạt được:**
- 2 workflows hoạt động: ci.yml (unit tests) và e2e-tests.yml (E2E tests)
- Tự động chạy tests trên mỗi commit
- Upload coverage reports và test artifacts
- wait-on synchronization cho ports 8080, 8081, 3001

**Các file CI/CD chính đã viết:**
- `.github/workflows/ci.yml`
- `.github/workflows/e2e-tests.yml`

---

## 2. KHÓ KHĂN & CÁCH GIẢI QUYẾT (STRUGGLES & SOLUTIONS)

Trong quá trình phát triển dự án, tôi đã gặp phải 3 khó khăn chính và đã tìm cách giải quyết chúng như sau:

### 2.1 Khó khăn 1: Coverage ban đầu rất thấp (1.78%)

**Vấn đề:**
Khi bắt đầu viết unit tests, coverage của dự án rất thấp, chỉ đạt 1.78%. Điều này do:
- Hầu hết các functions chưa được test
- Các dependencies external (API, localStorage) chưa được mock
- Logic nghiệp vụ phức tạp chưa được cover đầy đủ

**Nguyên nhân:**
- Thiếu hiểu biết về kỹ thuật mocking
- Không biết cách tách biệt logic từ dependencies
- Chưa có strategy rõ ràng cho test writing

**Cách giải quyết:**
1. **Áp dụng kỹ thuật Mocking với vi.mock:**
   - Mock `api-service.ts` để test stores mà không cần gọi API thật
   - Mock `localStorage` để test persistence logic
   - Mock external dependencies để test logic nghiệp vụ độc lập

   ```typescript
   // Ví dụ mock api-service
   vi.mock('@/lib/api-service', () => ({
     apiFetch: vi.fn().mockResolvedValue({ user: { id: '1' }, token: 'fake' })
   }));
   ```

2. **Tăng coverage cho api-service.ts từ 1.78% lên 94.93%:**
   - Test tất cả error scenarios (404, 500, network errors)
   - Test token refresh logic
   - Test request/response interceptors
   - Test error handling và retry logic

3. **Áp dụng AAA pattern (Arrange-Act-Assert):**
   - Mỗi test tuân thủ cấu trúc rõ ràng
   - Arrange: Setup test data và mocks
   - Act: Gọi function cần test
   - Assert: Verify kết quả mong đợi

**Kết quả:**
- api-service.ts coverage tăng từ 1.78% lên 94.93%
- Tổng coverage frontend tăng lên 62.92% statements
- 121 unit tests với 100% pass rate

**Bài học:**
- Mocking là kỹ thuật quan trọng để tăng coverage
- Test error cases quan trọng hơn happy paths
- AAA pattern giúp test dễ đọc và maintain

### 2.2 Khó khăn 2: Lỗi CI/CD Pipeline trên GitHub (Node version cũ, Service container Postgres fail)

**Vấn đề:**
Khi setup CI/CD pipeline với GitHub Actions, gặp các lỗi:
1. Node version quá cũ (Node 16) không tương thích với các dependencies mới
2. PostgreSQL container fail to start trong CI environment
3. Services (Backend, Frontend, NLP) không ready khi tests bắt đầu chạy
4. Tests fail với timeout errors do services chưa khởi động xong

**Nguyên nhân:**
- GitHub Actions runners có resource limitations
- PostgreSQL container cần thời gian để initialize database
- Không có synchronization mechanism giữa service startup và test execution
- Node version mismatch với local development environment

**Cách giải quyết:**
1. **Cập nhật Node version lên Node 20:**
   - Update `package.json` engines field
   - Update GitHub Actions workflow để setup Node 20
   - Update local development environment để match CI

   ```yaml
   # .github/workflows/ci.yml
   - name: Setup Node.js
     uses: actions/setup-node@v3
     with:
       node-version: '20'
   ```

2. **Thêm healthcheck cho PostgreSQL container:**
   - Cấu hình healthcheck để đảm bảo PostgreSQL ready
   - Thêm retry logic cho container startup
   - Sử dụng official PostgreSQL image với proper healthcheck

   ```yaml
   # .github/workflows/e2e-tests.yml
   - name: Start PostgreSQL
     run: |
       docker run -d -p 5432:5432 \
         -e POSTGRES_PASSWORD=postgres \
         -e POSTGRES_DB=shopcart_db \
         --health-cmd pg_isready \
         --health-interval 10s \
         --health-timeout 5s \
         --health-retries 5 \
         postgres:16
   ```

3. **Dùng wait-on để đồng bộ port readiness:**
   - Sử dụng `wait-on` package để đợi services ready
   - Configure timeout 60s cho mỗi port
   - Sequential wait để đảm bảo dependencies ready

   ```yaml
   - name: Wait for services
     run: |
       npx wait-on http://localhost:8080 --timeout 60000
       npx wait-on http://localhost:8081 --timeout 60000
       npx wait-on http://localhost:3001 --timeout 60000
   ```

4. **Optimize resource usage:**
   - Configure `maxThreads: 1` cho Vitest để prevent CPU overload
   - Chạy tests sequential thay vì parallel trên CI
   - Configure retries cho flaky tests

**Kết quả:**
- CI/CD pipeline hoạt động ổn định
- Tests chạy thành công trên mỗi push và pull request
- Service startup synchronized với test execution
- No more timeout errors

**Bài học:**
- CI/CD cần proper synchronization mechanism
- Resource optimization quan trọng trên shared runners
- Healthcheck là must-have cho containerized services
- wait-on là công cụ đơn giản nhưng hiệu quả

### 2.3 Khó khăn 3: Lỗi môi trường (cảnh báo React DOM Props, lỗi Assertions)

**Vấn đề:**
Khi chạy tests, gặp các lỗi môi trường:
1. React DOM Props warnings: Các props không được validate đúng
2. Console assertion errors: Tests fail vì console.error/ console.warn
3. Test flakiness do async operations không được handle đúng
4. Spy cleanup issues: Spies không được restored sau tests

**Nguyên nhân:**
- Component UI có props không được type-check đúng
- ConsoleSpy không được cleanup sau mỗi test
- Async operations (API calls, state updates) không được await đúng
- Test isolation không được đảm bảo

**Cách giải quyết:**
1. **Cập nhật logic consoleSpy:**
   - Implement proper spy cleanup trong `beforeEach` và `afterEach`
   - Mock console.error và console.warn để tests không fail
   - Restore original console functions sau mỗi test

   ```typescript
   // frontend/src/test/stores/auth-store.test.ts
   beforeEach(() => {
     consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
   });

   afterEach(() => {
     consoleSpy.mockRestore();
   });
   ```

2. **Dọn dẹp component UI:**
   - Fix React DOM Props warnings bằng cách type-check props
   - Implement proper prop validation với TypeScript
   - Remove unused props và default props

   ```typescript
   // Fix prop types
   interface ProductCardProps {
     product: Product;
     onAddToCart?: (product: Product) => void;
   }
   ```

3. **Handle async operations đúng:**
   - Sử dụng `await` cho tất cả async operations
   - Implement proper waiting strategies cho state updates
   - Use `act()` từ React Testing Library cho component updates

   ```typescript
   it('should update cart after adding item', async () => {
     await act(async () => {
       useCartStore.getState().addItem(product, 1);
     });
     expect(useCartStore.getState().items).toHaveLength(1);
   });
   ```

4. **Ensure test isolation:**
   - Reset state trong `beforeEach`
   - Clear mocks và spies sau mỗi test
   - Use fresh instances cho mỗi test

   ```typescript
   beforeEach(() => {
     useCartStore.setState({ items: [] });
     vi.clearAllMocks();
   });
   ```

**Kết quả:**
- Không còn React DOM Props warnings
- Console assertions được handle đúng
- Tests không còn flaky
- Test isolation được đảm bảo

**Bài học:**
- Test isolation là critical cho reliable tests
- ConsoleSpy cần proper cleanup
- Async operations cần careful handling
- TypeScript prop types prevent runtime errors

---

## 3. BÀI HỌC TÂM ĐẮC (KEY TAKEAWAYS)

Từ quá trình phát triển và kiểm thử dự án ShopCart AI, tôi đã rút ra các bài học quan trọng sau:

### 3.1 Hiểu sâu về Test Pyramid

**Khái niệm:**
Test Pyramid là mô hình phân bổ test theo 3 layers:
- **Unit Tests (Nhiều nhất):** Test logic nghiệp vụ nhỏ nhất, chạy nhanh, dễ debug
- **Integration Tests (Trung bình):** Test interaction giữa các modules
- **E2E Tests (Ít nhất):** Test luồng người dùng thật, chạy chậm

**Áp dụng thực tế:**
Trong dự án ShopCart AI, tôi đã áp dụng Test Pyramid như sau:
- 121 Unit Tests (Vitest) - 72% tổng số tests
- 37 Integration Tests (Jest) - 22% tổng số tests
- 8 E2E Tests (Playwright) - 5% tổng số tests
- 2 Performance Tests (K6) - 1% tổng số tests

**Tại sao Test Pyramid quan trọng?**
1. **Fast Feedback:** Unit tests chạy nhanh nhất (milliseconds), phát hiện bug sớm nhất
2. **Cost-Effective:** Unit tests chi phí thấp nhất để maintain
3. **Debugging:** Unit tests dễ debug nhất khi fail
4. **Reliability:** E2E tests flaky nhất, nên giữ số lượng ít

**Bài học:**
- Balance giữa 3 loại test là key
- Unit tests nên chiếm phần lớn nhất (70-80%)
- E2E tests chỉ cho critical user journeys
- Integration tests bridge gap giữa unit và E2E

### 3.2 Test-Driven Development (TDD) theo sách của Kent Beck

**Khái niệm:**
TDD là quy trình phát triển software theo 3 bước:
1. **Red:** Viết test fail trước (chưa có implementation)
2. **Green:** Viết code đủ để test pass
3. **Refactor:** Refactor code mà không làm test fail

**Reference:** Kent Beck - "Test-Driven Development: By Example" [Reference 8 trong đề bài]

**Áp dụng thực tế:**
Trong dự án ShopCart AI, tôi đã áp dụng TDD cho một số modules:

**Ví dụ với Cart Store Stock Validation:**

```typescript
// RED: Viết test trước (sẽ fail vì chưa có code)
it('should cap quantity at stock limit when adding new item', () => {
  const product = { id: '1', stockQuantity: 5 };
  useCartStore.getState().addItem(product, 10);
  expect(useCartStore.getState().items[0].quantity).toBe(5);
});

// GREEN: Viết code để test pass
addItem: (product, quantity = 1) => {
  set((state) => {
    const existing = state.items.find((i) => i.product.id === product.id);
    const currentQty = existing?.quantity ?? 0;
    const nextQty = Math.min(currentQty + quantity, product.stockQuantity);
    
    if (nextQty === currentQty) return state;
    
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: nextQty }
            : i
        ),
      };
    }
    
    return {
      items: [...state.items, { product, quantity: nextQty }],
    };
  });
},

// REFACTOR: Refactor code để clean hơn
// Tách logic validation ra function riêng
function validateQuantity(currentQty: number, quantity: number, stockLimit: number): number {
  return Math.min(currentQty + quantity, stockLimit);
}
```

**Tại sao TDD quan trọng?**
1. **Design-First:** TDD giúp thiết kế API tốt hơn trước khi implement
2. **Regression Prevention:** Tests serve as documentation và regression guard
3. **Confidence:** Refactor an toàn vì có test bảo vệ
4. **Focus:** TDD giúp focus trên requirements thay vì implementation details

**Bài học:**
- TDD không phải viết tất cả tests trước, mà là viết test trước cho mỗi feature
- Red-Green-Refactor cycle giúp code quality tốt hơn
- Tests serve as living documentation
- TDD giảm bug rate và increase confidence

### 3.3 Vận hành Microservices Thực Tế

**Khái niệm:**
Microservices là kiến trúc chia ứng dụng thành các services nhỏ, độc lập, deploy riêng biệt.

**Áp dụng thực tế:**
Dự án ShopCart AI có 4 microservices:
1. **Frontend (React/TypeScript):** Port 8080
2. **Backend (Java/Spring Boot):** Port 8081
3. **NLP Service (Node.js):** Port 3001
4. **Database (PostgreSQL):** Port 5432

**Thách thức khi testing microservices:**
1. **Service Startup Synchronization:**
   - Services cần time để startup
   - Tests fail nếu services chưa ready
   - **Giải pháp:** Sử dụng wait-on để synchronize port readiness

2. **Dependency Management:**
   - Services phụ thuộc lẫn nhau
   - Tests cần mock external services
   - **Giải pháp:** Mock API calls, stub database responses

3. **Environment Consistency:**
   - Local, CI, Production environments khác nhau
   - Tests fail do environment differences
   - **Giải pháp:** Docker containers, environment variables

4. **Resource Constraints:**
   - CI/CD runners có limited resources
   - Services consume memory/CPU
   - **Giải pháp:** Optimize resource usage, sequential execution

**Bài học:**
- Microservices testing phức tạp hơn monolith
- Synchronization là key challenge
- Docker giúp ensure environment consistency
- CI/CD pipeline cần proper configuration

### 3.4 Mocking và Spying Strategy

**Khái niệm:**
- **Mocking:** Thay thế dependency thật bằng bản giả
- **Spying:** Theo dõi function calls để verify behavior

**Áp dụng thực tế:**

**Mocking API Service:**
```typescript
vi.mock('@/lib/api-service', () => ({
  apiFetch: vi.fn().mockResolvedValue({ user: { id: '1' }, token: 'fake' })
}));
```

**Spying localStorage:**
```typescript
const localStorageSpy = vi.spyOn(localStorage, 'setItem');
useCartStore.getState().addItem(product, 1);
expect(localStorageSpy).toHaveBeenCalledWith('shopcart_cart', expect.any(String));
```

**Bài học:**
- Mocking giúp test chạy nhanh mà không cần dependency thật
- Spying giúp verify function calls
- Don't over-mock - vẫn cần E2E tests để verify integration
- Mocks cần được cleanup sau mỗi test

### 3.5 CI/CD Automation là Must-Have

**Khái niệm:**
CI/CD (Continuous Integration/Continuous Deployment) là practice tự động hóa build, test, deployment.

**Áp dụng thực tế:**
GitHub Actions workflows:
- **ci.yml:** Tự động chạy unit tests trên mỗi push
- **e2e-tests.yml:** Tự động chạy E2E tests với service startup

**Lợi ích:**
1. **Fast Feedback:** Catch bugs sớm trước khi merge
2. **Consistency:** Tests chạy trong môi trường nhất quán
3. **Automation:** Không cần manual test runs
4. **Confidence:** Merge code với confidence cao hơn

**Bài học:**
- CI/CD không phải luxury, mà là necessity
- Proper synchronization là key cho reliable CI/CD
- Resource optimization quan trọng trên shared runners
- Artifacts retention giúp debug failures

---

## 4. TỔNG KẾT

Dự án ShopCart AI là một trải nghiệm học tập quý giá về kiểm thử phần mềm. Từ việc đối mặt với coverage thấp, CI/CD failures, và environment issues, tôi đã học được:

1. **Test Pyramid** là framework đúng đắn để phân bổ tests
2. **TDD** giúp viết code quality tốt hơn và giảm bug rate
3. **Mocking và Spying** là công cụ mạnh để test logic nghiệp vụ độc lập
4. **CI/CD Automation** là must-have cho modern software development
5. **Microservices Testing** đòi hỏi careful planning và synchronization

Những bài học này không chỉ áp dụng cho dự án ShopCart AI mà còn có thể áp dụng cho các dự án tương lai. Kiểm thử không chỉ là việc viết tests, mà là một mindset cần được áp dụng xuyên suốt development lifecycle.

---

**Người lập báo cáo:** [Điền tên của bạn]  
**Ngày lập:** [Điền ngày]  
**Chữ ký:** ___________________
