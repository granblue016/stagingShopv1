# Hướng Dẫn Step-by-Step: Hiển Thị Tất Cả Báo Cáo Testing HTML

## Tóm Tắt

Tài liệu này hướng dẫn step-by-step cách sinh và hiển thị tất cả các báo cáo testing HTML cho toàn bộ project ShopCart, bao gồm:
- Backend (Spring Boot + JaCoCo)
- Frontend (React + Vitest)
- NLP Service (Node.js + Jest)
- E2E Tests (Playwright)

---

## Phần 1: Backend - JaCoCo Coverage Report

### 1.1 Tổng Quan

**Công cụ:** JaCoCo (Java Code Coverage)
**Framework:** Spring Boot
**Vị trí báo cáo:** `c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html`

### 1.2 Step-by-Step: Sinh và Hiển Thị Báo Cáo JaCoCo

#### Bước 1: Mở Terminal và Di Chuyển Đến Thư Mục Backend

```bash
# Từ thư mục gốc project
cd backend

# Hoặc trực tiếp
cd c:\Users\PC\Desktop\shopcart-playbook\backend
```

#### Bước 2: Chạy Test và Sinh Báo Cáo JaCoCo

```bash
# Chạy test và sinh báo cáo coverage
mvn clean test jacoco:report
```

**Giải thích lệnh:**
- `mvn clean`: Xóa thư mục target (clean build)
- `test`: Chạy tất cả unit tests
- `jacoco:report`: Sinh báo cáo HTML coverage

**Output mong đợi:**
```
[INFO] Tests run: 158, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] --- jacoco:0.8.11:report (report) @ backend ---
[INFO] Loading execution data file C:\Users\PC\Desktop\shopcart-playbook\backend\target\jacoco.exec
[INFO] Analyzed bundle '' with 45 classes
[INFO] 
[INFO] --- jacoco:0.8.11:report (default-cli) @ backend ---
[INFO] Loading execution data file C:\Users\PC\Desktop\shopcart-playbook\backend\target\jacoco.exec
[INFO] Analyzed bundle '' with 46 classes
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

#### Bước 3: Mở Báo Cáo HTML

**Cách 1: Mở trực tiếp bằng trình duyệt**

```bash
# Windows
start c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html

# Hoặc
explorer c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html
```

**Cách 2: Mở bằng VS Code**

1. Mở VS Code
2. Nhấn `Ctrl + O` để mở file
3. Điều hướng đến: `c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html`
4. Nhấn `Open`

**Cách 3: Mở bằng File Explorer**

1. Mở File Explorer
2. Điều hướng đến: `c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\`
3. Double-click vào `index.html`

#### Bước 4: Đọc Báo Cáo JaCoCo

**Phần tổng quan (index.html):**
- **Missed Instructions:** Số bytecode instructions không được cover
- **Cov:** Coverage tổng thể theo instructions
- **Bảng theo package:** Coverage chi tiết từng package

**Màu sắc:**
- 🟢 Green: > 80% coverage (Good)
- 🟡 Yellow: 50-80% coverage (Warning)
- 🔴 Red: < 50% coverage (Critical)

**Điều hướng:**
- Click vào tên package để xem chi tiết
- Click vào tên class để xem coverage từng dòng code
- Màu nền trong source code:
  - Green: Line được cover đầy đủ
  - Yellow: Line được cover một phần (branch không đầy đủ)
  - Red: Line không được cover

### 1.3 Các Báo Cáo JaCoCo Khác

**Báo cáo tổng quan:**
```
c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html
```

**Báo cáo theo package:**
```
c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\com.example.shopcart\index.html
```

**Báo cáo theo class:**
```
c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\com.example.shopcart\model\User.java.html
c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\com.example.shopcart\controller\AuthController.java.html
c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\com.example.shopcart\service\OrderService.java.html
```

---

## Phần 2: Frontend - Vitest Coverage Report

### 2.1 Tổng Quan

**Công cụ:** Vitest + Istanbul
**Framework:** React + Vite
**Vị trí báo cáo:** `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html`

### 2.2 Step-by-Step: Sinh và Hiển Thị Báo Cáo Vitest

#### Bước 1: Mở Terminal và Di Chuyển Đến Thư Mục Frontend

```bash
# Từ thư mục gốc project
cd frontend

# Hoặc trực tiếp
cd c:\Users\PC\Desktop\shopcart-playbook\frontend
```

#### Bước 2: Chạy Test với Coverage

```bash
# Chạy test và sinh báo cáo coverage
npm run test:coverage
```

**Giải thích lệnh:**
- `npm run test:coverage`: Chạy Vitest với coverage flag
- Tương đương với: `vitest --coverage`

**Output mong đợi:**
```
> vitest --coverage

 RUN  v4.1.5  c:/Users/PC/Desktop/shopcart-playbook/frontend

       Coverage report from c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage

 % Coverage report from istanbul
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   18.62 |    23.89 |   17.78 |   17.58 |
 components        |   18.18 |    20.83 |      24 |   12.28 |
  ...              |     ... |       ... |     ... |     ... |
 lib               |   91.30 |    80.76 |     100 |   91.11 |
  api-service.ts   |   92.85 |    81.66 |     100 |   92.59 |
  ...              |     ... |       ... |     ... |     ... |
 stores            |   86.36 |       80 |      92 |   83.78 |
  auth-store.ts    |   68.42 |       50 |      75 |   68.42 |
  cart-store.ts    |      100 |    84.61 |     100 |     100 |
-------------------|---------|----------|---------|---------|-------------------
```

#### Bước 3: Mở Báo Cáo HTML

**Cách 1: Mở trực tiếp bằng trình duyệt**

```bash
# Windows
start c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html

# Hoặc
explorer c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html
```

**Cách 2: Mở bằng VS Code**

1. Mở VS Code
2. Nhấn `Ctrl + O` để mở file
3. Điều hướng đến: `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html`
4. Nhấn `Open`

**Cách 3: Mở bằng File Explorer**

1. Mở File Explorer
2. Điều hướng đến: `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\`
3. Double-click vào `index.html`

#### Bước 4: Đọc Báo Cáo Vitest

**Phần tổng quan (index.html):**
- **Statements:** Tỷ lệ câu lệnh được cover
- **Branches:** Tỷ lệ nhánh điều kiện được cover
- **Functions:** Tỷ lệ hàm được cover
- **Lines:** Tỷ lệ dòng code được cover

**Bảng theo thư mục:**
- Click vào tên thư mục để xem chi tiết
- Click vào tên file để xem coverage từng dòng

**Màu sắc:**
- 🟢 Green: > 80% coverage (High)
- 🟡 Yellow: 50-80% coverage (Medium)
- 🔴 Red: < 50% coverage (Low)

**Source code highlighting:**
- Green background: Line được cover
- Red background: Line không được cover
- Yellow background: Line được cover một phần

### 2.3 Các Báo Cáo Vitest Khác

**Báo cáo tổng quan:**
```
c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html
```

**Báo cáo theo thư mục:**
```
c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\stores\index.html
c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\lib\index.html
c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\components\index.html
```

**Báo cáo theo file:**
```
c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\stores\auth-store.ts.html
c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\stores\cart-store.ts.html
c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\lib\api-service.ts.html
c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\lib\coupon-utils.ts.html
```

---

## Phần 3: NLP Service - Jest Coverage Report

### 3.1 Tổng Quan

**Công cụ:** Jest
**Framework:** Node.js + Express
**Vị trí báo cáo:** `c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html`

### 3.2 Step-by-Step: Sinh và Hiển Thị Báo Cáo Jest

#### Bước 1: Mở Terminal và Di Chuyển Đến Thư Mục NLP Service

```bash
# Từ thư mục gốc project
cd nlp-service

# Hoặc trực tiếp
cd c:\Users\PC\Desktop\shopcart-playbook\nlp-service
```

#### Bước 2: Chạy Test với Coverage

```bash
# Chạy test và sinh báo cáo coverage
npm run test:coverage
```

**Giải thích lệnh:**
- `npm run test:coverage`: Chạy Jest với coverage flag
- Tương đương với: `jest --coverage`

**Output mong đợi:**
```
> nlp-service@1.0.0 test:coverage
> jest --coverage

 PASS  ./index.test.ts
  NLP Service
    ✓ should analyze sentiment (2 ms)
    ✓ should handle errors
    ✓ should validate input

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   85.71 |    75.00 |     100 |   85.71 |
 index.ts |   85.71 |    75.00 |     100 |   85.71 | 15-16
----------|---------|----------|---------|---------|-------------------
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

#### Bước 3: Mở Báo Cáo HTML

**Cách 1: Mở trực tiếp bằng trình duyệt**

```bash
# Windows
start c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html

# Hoặc
explorer c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html
```

**Cách 2: Mở bằng VS Code**

1. Mở VS Code  
2. Nhấn `Ctrl + O` để mở file
3. Điều hướng đến: `c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html`
4. Nhấn `Open`

**Cách 3: Mở bằng File Explorer**

1. Mở File Explorer
2. Điều hướng đến: `c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\`
3. Double-click vào `index.html`

#### Bước 4: Đọc Báo Cáo Jest

**Phần tổng quan (index.html):**
- **Statements:** Tỷ lệ câu lệnh được cover
- **Branches:** Tỷ lệ nhánh điều kiện được cover
- **Functions:** Tỷ lệ hàm được cover
- **Lines:** Tỷ lệ dòng code được cover

**Bảng theo file:**
- Click vào tên file để xem chi tiết từng dòng

**Màu sắc:**
- Green: Line được cover
- Red: Line không được cover
- Yellow: Line được cover một phần

### 2.3 Các Báo Cáo Jest Khác

**Báo cáo tổng quan:**
```
c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html
```

**Báo cáo theo file:**
```
c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.ts.html
```

---

## Phần 4: E2E Tests - Playwright Report

### 4.1 Tổng Quan

**Công cụ:** Playwright
**Framework:** End-to-End Testing
**Vị trí báo cáo:** `c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\index.html`

### 4.2 Step-by-Step: Sinh và Hiển Thị Báo Cáo Playwright

#### Bước 1: Mở Terminal và Di Chuyển Đến Thư Mục E2E Tests

```bash
# Từ thư mục gốc project
cd e2e-tests

# Hoặc trực tiếp
cd c:\Users\PC\Desktop\shopcart-playbook\e2e-tests
```

#### Bước 2: Đảm Bảo Các Services Đang Chạy

**Option 1: Chạy tất cả services từ thư mục gốc**

```bash
# Từ thư mục gốc project
cd c:\Users\PC\Desktop\shopcart-playbook
npm start
```

**Option 2: Chạy từng service riêng**

```bash
# Terminal 1: Backend
cd c:\Users\PC\Desktop\shopcart-playbook\backend
mvn spring-boot:run

# Terminal 2: Frontend
cd c:\Users\PC\Desktop\shopcart-playbook\frontend
npm run dev

# Terminal 3: NLP Service
cd c:\Users\PC\Desktop\shopcart-playbook\nlp-service
npm run dev
```

**Kiểm tra services đang chạy:**
- Backend: http://localhost:8081
- Frontend: http://localhost:8080
- NLP Service: http://localhost:3001

#### Bước 3: Chạy E2E Tests

```bash
# Chạy E2E tests (headless mode)
npm test

# Hoặc từ thư mục gốc
cd c:\Users\PC\Desktop\shopcart-playbook
npm run test:e2e
```

**Giải thích lệnh:**
- `npm test`: Chạy Playwright tests
- Tests chạy ở chế độ headless (không hiển thị browser)
- Báo cáo HTML được sinh tự động

**Output mong đợi:**
```
Running 5 tests using 1 worker

  ✓  [chromium] › auth.spec.ts:3:7 › Login flow › should login successfully (2.1s)
  ✓  [chromium] › auth.spec.ts:15:7 › Login flow › should show error with invalid credentials (1.8s)
  ✓  [chromium] › checkout.spec.ts:3:7 › Checkout flow › should complete checkout (3.2s)
  ✓  [chromium] › cart.spec.ts:3:7 › Cart flow › should add items to cart (2.5s)
  ✓  [chromium] › admin.spec.ts:3:7 › Admin flow › should access admin dashboard (2.9s)

  5 passed (12.5s)
```

#### Bước 4: Mở Báo Cáo HTML

**Cách 1: Mở trực tiếp bằng trình duyệt**

```bash
# Windows
start c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\index.html

# Hoặc
explorer c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\index.html
```

**Cách 2: Mở bằng VS Code**

1. Mở VS Code
2. Nhấn `Ctrl + O` để mở file
3. Điều hướng đến: `c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\index.html`
4. Nhấn `Open`

**Cách 3: Mở bằng File Explorer**

1. Mở File Explorer
2. Điều hướng đến: `c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\`
3. Double-click vào `index.html`

#### Bước 5: Đọc Báo Cáo Playwright

**Phần tổng quan (index.html):**
- **Test Suites:** Tổng số test suites
- **Tests:** Tổng số tests
- **Passed/Skipped/Failed:** Số lượng tests theo trạng thái
- **Duration:** Thời gian chạy tests

**Chi tiết từng test:**
- Click vào tên test để xem chi tiết
- Xem screenshots (nếu có)
- Xem traces (nếu có)
- Xem video (nếu có)

**Màu sắc:**
- 🟢 Green: Test passed
- 🔴 Red: Test failed
- 🟡 Yellow: Test skipped

### 4.3 Chạy E2E Tests với UI Mode (Tùy chọn)

```bash
# Chạy với UI mode (hiển thị browser)
npm run test:watch

# Hoặc
npx playwright test --ui
```

**Giải thích:**
- UI mode cho phép chạy tests interactively
- Có thể debug tests trực tiếp
- Xem browser actions real-time

### 4.4 Chạy E2E Tests với Headed Mode (Tùy chọn)

```bash
# Chạy với headed mode (hiển thị browser)
npm run test:headed

# Hoặc
npx playwright test --headed
```

**Giải thích:**
- Headed mode hiển thị browser trong quá trình chạy test
- Hữu ích để debug và xem test chạy real-time

---

## Phần 5: Tổng Hợp Tất Cả Báo Cáo Testing

### 5.1 Bảng Tóm Tắt Các Báo Cáo

| Phần | Công cụ | Lệnh sinh báo cáo | Vị trí báo cáo HTML |
|------|---------|------------------|---------------------|
| **Backend** | JaCoCo | `mvn clean test jacoco:report` | `c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html` |
| **Frontend** | Vitest | `npm run test:coverage` | `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html` |
| **NLP Service** | Jest | `npm run test:coverage` | `c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html` |
| **E2E Tests** | Playwright | `npm test` | `c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\index.html` |

### 5.2 Quy Trình Sinh Tất Cả Báo Cáo (One-Time)

#### Bước 1: Chạy Backend Tests

```bash
cd c:\Users\PC\Desktop\shopcart-playbook\backend
mvn clean test jacoco:report
```

#### Bước 2: Chạy Frontend Tests

```bash
cd c:\Users\PC\Desktop\shopcart-playbook\frontend
npm run test:coverage
```

#### Bước 3: Chạy NLP Service Tests

```bash
cd c:\Users\PC\Desktop\shopcart-playbook\nlp-service
npm run test:coverage
```

#### Bước 4: Chạy E2E Tests

```bash
# Đảm bảo services đang chạy trước
cd c:\Users\PC\Desktop\shopcart-playbook
npm start

# Mở terminal mới và chạy E2E tests
cd c:\Users\PC\Desktop\shopcart-playbook\e2e-tests
npm test
```

### 5.3 Mở Tất Cả Báo Cáo Cùng Lúc

**Script PowerShell để mở tất cả báo cáo:**

```powershell
# Mở tất cả báo cáo testing HTML
start c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html
start c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html
start c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html
start c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\index.html
```

**Lưu script thành file `open-all-reports.ps1`:**

```powershell
# File: c:\Users\PC\Desktop\shopcart-playbook\open-all-reports.ps1

Write-Host "Opening all testing reports..." -ForegroundColor Green

# Backend JaCoCo
Write-Host "Opening Backend JaCoCo Report..." -ForegroundColor Yellow
start c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html

# Frontend Vitest
Write-Host "Opening Frontend Vitest Report..." -ForegroundColor Yellow
start c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html

# NLP Service Jest
Write-Host "Opening NLP Service Jest Report..." -ForegroundColor Yellow
start c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html

# E2E Playwright
Write-Host "Opening E2E Playwright Report..." -ForegroundColor Yellow
start c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\index.html

Write-Host "All reports opened successfully!" -ForegroundColor Green
```

**Chạy script:**

```powershell
# Từ thư mục gốc project
cd c:\Users\PC\Desktop\shopcart-playbook
.\open-all-reports.ps1
```

---

## Phần 6: Troubleshooting

### 6.1 Backend JaCoCo - Không Sinh Được Báo Cáo

**Vấn đề:** Lỗi "No POM in this directory"

**Giải pháp:**
```bash
# Đảm bảo đang ở thư mục backend
cd c:\Users\PC\Desktop\shopcart-playbook\backend

# Chạy lại
mvn clean test jacoco:report
```

**Vấn đề:** Báo cáo không được sinh

**Giải pháp:**
```bash
# Xóa thư mục target và chạy lại
mvn clean
mvn test jacoco:report
```

### 6.2 Frontend Vitest - Không Sinh Được Báo Cáo

**Vấn đề:** Lỗi "vitest not found"

**Giải pháp:**
```bash
# Cài đặt dependencies
cd c:\Users\PC\Desktop\shopcart-playbook\frontend
npm install

# Chạy lại
npm run test:coverage
```

**Vấn đề:** Báo cáo không được sinh

**Giải pháp:**
```bash
# Xóa thư mục coverage và chạy lại
rm -rf coverage
npm run test:coverage
```

### 6.3 NLP Service Jest - Không Sinh Được Báo Cáo

**Vấn đề:** Lỗi "jest not found"

**Giải pháp:**
```bash
# Cài đặt dependencies
cd c:\Users\PC\Desktop\shopcart-playbook\nlp-service
npm install

# Chạy lại
npm run test:coverage
```

**Vấn đề:** Báo cáo không được sinh

**Giải pháp:**
```bash
# Xóa thư mục coverage và chạy lại
rm -rf coverage
npm run test:coverage
```

### 6.4 E2E Playwright - Không Sinh Được Báo Cáo

**Vấn đề:** Tests fail vì services không chạy

**Giải pháp:**
```bash
# Đảm bảo tất cả services đang chạy
cd c:\Users\PC\Desktop\shopcart-playbook
npm start

# Mở terminal mới và chạy tests
cd e2e-tests
npm test
```

**Vấn đề:** Báo cáo không được sinh

**Giải pháp:**
```bash
# Xóa thư mục playwright-report và chạy lại
rm -rf playwright-report
npm test
```

**Vấn đề:** Playwright browsers không được cài đặt

**Giải pháp:**
```bash
cd c:\Users\PC\Desktop\shopcart-playbook\e2e-tests
npm run install:browsers
```

---

## Phần 7: Best Practices

### 7.1 Khi Nên Sinh Báo Cáo Coverage

- **Trước khi commit code:** Để đảm bảo code mới được test
- **Trước khi merge PR:** Để review coverage changes
- **Sau khi refactor:** Để đảm bảo không giảm coverage
- **Trước khi release:** Để đảm bảo chất lượng code

### 7.2 Khi Nên Chạy E2E Tests

- **Trước khi release:** Để đảm bảo flows hoạt động đúng
- **Sau khi thay đổi critical flows:** Để verify không break
- **Trong CI/CD pipeline:** Để automated testing

### 7.3 Không Nên Commit Coverage Reports

**Thêm vào `.gitignore`:**

```gitignore
# Backend JaCoCo reports
backend/target/site/jacoco/

# Frontend Vitest reports
frontend/coverage/

# NLP Service Jest reports
nlp-service/coverage/

# E2E Playwright reports
e2e-tests/playwright-report/
e2e-tests/test-results/

# Test execution data
backend/target/jacoco.exec
```

**Lý do:**
- Giảm kích thước repo
- Tránh conflict khi merge
- Coverage reports luôn fresh (mới nhất)
- CI/CD tools có thể xử lý coverage tốt hơn

### 7.4 CI/CD Integration

**GitHub Actions example:**

```yaml
name: Test & Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Backend tests
      - name: Backend Test
        run: |
          cd backend
          mvn clean test jacoco:report
          
      # Frontend tests
      - name: Frontend Test
        run: |
          cd frontend
          npm install
          npm run test:coverage
          
      # NLP Service tests
      - name: NLP Service Test
        run: |
          cd nlp-service
          npm install
          npm run test:coverage
          
      # E2E tests
      - name: E2E Test
        run: |
          npm start &
          cd e2e-tests
          npm install
          npm test
          
      # Upload coverage
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: |
            backend/target/site/jacoco/jacoco.xml
            frontend/coverage/coverage-final.json
            nlp-service/coverage/coverage-final.json
```

---

## Phần 8: Summary

### 8.1 Quick Reference

| Task | Command | Report Location |
|------|---------|-----------------|
| Backend Test + Coverage | `cd backend && mvn clean test jacoco:report` | `backend/target/site/jacoco/index.html` |
| Frontend Test + Coverage | `cd frontend && npm run test:coverage` | `frontend/coverage/index.html` |
| NLP Service Test + Coverage | `cd nlp-service && npm run test:coverage` | `nlp-service/coverage/index.html` |
| E2E Tests | `cd e2e-tests && npm test` | `e2e-tests/playwright-report/index.html` |

### 8.2 Open All Reports (One Command)

```powershell
start c:\Users\PC\Desktop\shopcart-playbook\backend\target\site\jacoco\index.html
start c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html
start c:\Users\PC\Desktop\shopcart-playbook\nlp-service\coverage\index.html
start c:\Users\PC\Desktop\shopcart-playbook\e2e-tests\playwright-report\index.html
```

### 8.3 Key Takeaways

1. **Backend:** Sử dụng JaCoCo với Maven
2. **Frontend:** Sử dụng Vitest với Istanbul
3. **NLP Service:** Sử dụng Jest
4. **E2E:** Sử dụng Playwright
5. **Không commit coverage reports** vào repo
6. **Sử dụng CI/CD** để automated testing
7. **Review coverage** trước khi merge/release

---

## Phần 9: Additional Resources

### 9.1 Documentation

- **JaCoCo:** https://www.jacoco.org/jacoco/trunk/doc/
- **Vitest:** https://vitest.dev/guide/coverage.html
- **Jest:** https://jestjs.io/docs/configuration#collectcoverage-boolean
- **Playwright:** https://playwright.dev/docs/test-reporters

### 9.2 Project-Specific Files

- **System Flows:** `c:\Users\PC\Desktop\shopcart-playbook\SYSTEM_FLOWS.md`
- **Vitest Test Mapping:** `c:\Users\PC\Desktop\shopcart-playbook\VITEST_TEST_MAPPING.md`
- **JaCoCo Complete Guide:** `c:\Users\PC\Desktop\shopcart-playbook\JACOCO_COMPLETE_GUIDE.md`
- **E2E Test Explanation:** `c:\Users\PC\Desktop\shopcart-playbook\E2E_TEST_EXPLANATION.md`

---

## Phần 10: Conclusion

Bằng cách làm theo hướng dẫn step-by-step trong tài liệu này, bạn sẽ có thể:
1. Sinh báo cáo coverage cho tất cả phần của project
2. Hiển thị báo cáo HTML trên trình duyệt
3. Đọc và hiểu các metric coverage
4. Troubleshoot các vấn đề phổ biến
5. Tích hợp vào CI/CD pipeline

Coverage là công cụ quan trọng để đảm bảo chất lượng code, nhưng nhớ rằng:
- Coverage ≠ Quality
- Test behavior, không phải implementation
- Critical paths cần coverage cao hơn
- Review coverage trước khi merge/release
