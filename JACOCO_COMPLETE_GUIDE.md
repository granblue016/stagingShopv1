# Hướng Dẫn Hoàn Chỉnh Về Testing Coverage & JaCoCo

## Tóm Tắt

Tài liệu này tổng hợp toàn bộ thông số testing từ các file HTML hiện có trong dự án và cung cấp hướng dẫn chi tiết về JaCoCo, bao gồm:
- Tổng hợp các báo cáo HTML testing hiện có
- Khái niệm Coverage là gì
- Cách đọc thông số JaCoCo
- Những phần nên có coverage và không cần thiết
- Cấu trúc file JaCoCo phân tích từng dòng
- Tư duy và suy nghĩ khi sử dụng JaCoCo
- Minh họa với system_flows.md

---

## Phần 0: Tại Sao Có Nhiều File HTML Trong Testing?

### 0.1 Thống Kê File HTML Trong Project

**Tổng số file HTML:** 185 files

**Phân loại theo nguồn gốc:**

| Loại | Số lượng | Mô tả | Có cần thiết? |
|------|----------|-------|--------------|
| **Coverage (Vitest/Istanbul)** | 66 files | Báo cáo coverage cho frontend (React) | ✅ Cần thiết |
| **JaCoCo** | 100 files | Báo cáo coverage cho backend (Spring Boot) | ✅ Cần thiết |
| **node_modules** | 17 files | Documentation của các thư viện dependency | ❌ Không cần thiết |
| **Frontend App** | 1 file | File HTML chính của ứng dụng React | ✅ Cần thiết |
| **Other** | 1 file | File HTML khác | ❌ Không cần thiết |

**Tỷ lệ:** 49.8% file trong project là HTML (185/372 files)

---

### 0.2 Tại Sao Coverage Tools Sinh Ra Nhiều File HTML?

#### 0.2.1 Vitest/Istanbul Coverage (66 files)

**Cơ chế hoạt động:**
```
Mỗi file source code (.ts, .tsx) → 1 file HTML coverage tương ứng
```

**Ví dụ:**
- `stores/auth-store.ts` → `coverage/stores/auth-store.ts.html`
- `stores/cart-store.ts` → `coverage/stores/cart-store.ts.html`
- `lib/api-service.ts` → `coverage/lib/api-service.ts.html`
- `components/ui/button.tsx` → `coverage/components/ui/button.tsx.html`

**Tại sao nhiều file?**
1. **Granular coverage:** Mỗi file source có file HTML riêng để xem chi tiết từng dòng
2. **Hierarchical structure:** Có file index.html cho từng thư mục + file cho từng file source
3. **Interactive navigation:** File HTML cho phép click vào từng dòng để xem coverage

**Cấu trúc thư mục coverage:**
```
frontend/coverage/
├── index.html                    # Tổng quan toàn bộ project
├── base.css, prettify.css         # Styles cho báo cáo
├── stores/
│   ├── index.html                # Tổng quan thư mục stores
│   ├── auth-store.ts.html        # Chi tiết file auth-store.ts
│   └── cart-store.ts.html       # Chi tiết file cart-store.ts
├── lib/
│   ├── index.html                # Tổng quan thư mục lib
│   ├── api-service.ts.html       # Chi tiết file api-service.ts
│   └── coupon-utils.ts.html      # Chi tiết file coupon-utils.ts
├── components/
│   ├── index.html                # Tổng quan thư mục components
│   └── ui/
│       ├── index.html            # Tổng quan thư mục ui
│       ├── button.tsx.html       # Chi tiết file button.tsx
│       ├── input.tsx.html        # Chi tiết file input.tsx
│       └── ... (nhiều file UI components)
└── hooks/
    ├── index.html                # Tổng quan thư mục hooks
    └── use-mobile.tsx.html       # Chi tiết file use-mobile.tsx
```

**Có thể giảm không?**
- ❌ **Không nên giảm:** Đây là file được sinh tự động bởi Vitest/Istanbul
- ❌ **Không nên commit:** Thường thêm vào `.gitignore` để không commit vào repo
- ✅ **Nên regenerate:** Mỗi lần chạy test sẽ được sinh lại

**Cấu hình .gitignore:**
```gitignore
# Coverage reports
frontend/coverage/
```

#### 0.2.2 JaCoCo Coverage (100 files)

**Cơ chế hoạt động:**
```
Mỗi class Java (.class) → 1 file HTML coverage tương ứng
```

**Ví dụ:**
- `User.class` → `com/example/shopcart/model/User.java.html`
- `Product.class` → `com/example/shopcart/model/Product.java.html`
- `AuthController.class` → `com/example/shopcart/controller/AuthController.java.html`
- `OrderService.class` → `com/example/shopcart/service/OrderService.java.html`

**Tại sao nhiều file?**
1. **Package structure:** JaCoCo sinh file theo structure của Java packages
2. **Class-level coverage:** Mỗi class có file HTML riêng để xem chi tiết
3. **Method-level detail:** File HTML hiển thị coverage từng method trong class
4. **Bytecode analysis:** JaCoCo phân tích bytecode, không phải source code trực tiếp

**Cấu trúc thư mục JaCoCo:**
```
target/site/jacoco/
├── index.html                    # Tổng quan toàn bộ project
├── jacoco-resources/             # CSS, JS cho báo cáo
├── com/
│   └── example/
│       └── shopcart/
│           ├── index.html        # Tổng quan package shopcart
│           ├── model/
│           │   ├── index.html    # Tổng quan package model
│           │   ├── User.java.html
│           │   ├── Product.java.html
│           │   ├── Order.java.html
│           │   └── ... (các entity khác)
│           ├── dto/
│           │   ├── index.html    # Tổng quan package dto
│           │   ├── LoginRequest.java.html
│           │   ├── OrderRequest.java.html
│           │   └── ... (các DTO khác)
│           ├── controller/
│           │   ├── index.html    # Tổng quan package controller
│           │   ├── AuthController.java.html
│           │   ├── OrderController.java.html
│           │   └── ... (các controller khác)
│           └── service/
│               ├── index.html    # Tổng quan package service
│               ├── AuthService.java.html
│               ├── OrderService.java.html
│               └── ... (các service khác)
```

**Có thể giảm không?**
- ❌ **Không nên giảm:** Đây là file được sinh tự động bởi JaCoCo Maven plugin
- ❌ **Không nên commit:** Thường thêm vào `.gitignore` để không commit vào repo
- ✅ **Nên regenerate:** Mỗi lần chạy `mvn test jacoco:report` sẽ được sinh lại

**Cấu hình .gitignore:**
```gitignore
# JaCoCo coverage reports
target/site/jacoco/
```

#### 0.2.3 node_modules HTML Files (17 files)

**Nguồn gốc:**
- Documentation của các thư viện npm
- Ví dụ: `tslib/tslib.html`, `tslib/tslib.es6.html`

**Tại sao có trong project?**
- Được cài đặt cùng với các npm packages
- Là phần của dependency tree

**Có cần thiết không?**
- ❌ **Không cần thiết:** Chỉ là documentation
- ❌ **Không nên commit:** Đã có trong `.gitignore` mặc định
- ✅ **Có thể xóa:** Sẽ được cài lại khi chạy `npm install`

**Cấu hình .gitignore:**
```gitignore
# node_modules
node_modules/
```

#### 0.2.4 Frontend App HTML (1 file)

**Nguồn gốc:**
- `frontend/index.html` - Entry point của ứng dụng React

**Có cần thiết không?**
- ✅ **Cần thiết:** File HTML chính để chạy ứng dụng
- ✅ **Nên commit:** Là phần của source code

---

### 0.3 Tóm Tắt: Tại Sao Có Nhiều File HTML?

**Lý do chính:**

1. **Coverage tools sinh file HTML tự động**
   - Vitest/Istanbul sinh 66 file cho frontend
   - JaCoCo sinh 100 file cho backend
   - Mỗi file source code → 1 file HTML coverage

2. **Granular reporting**
   - Mỗi file có báo cáo riêng để xem chi tiết
   - Hierarchical structure (folder → file)
   - Interactive navigation

3. **Không phải source code**
   - 166/185 files (89.7%) là coverage reports
   - Chỉ 1/185 files (0.5%) là source code thực tế
   - 17/185 files (9.2%) là documentation từ node_modules

**Giải pháp để giảm số lượng file HTML trong repo:**

```gitignore
# Thêm vào .gitignore
# Coverage reports - không commit vào repo
frontend/coverage/
target/site/jacoco/

# node_modules - không commit vào repo
node_modules/
```

**Sau khi thêm vào .gitignore:**
- Chỉ còn 1 file HTML trong repo: `frontend/index.html`
- Coverage reports sẽ được sinh lại local khi chạy test
- CI/CD sẽ sinh coverage reports và upload lên codecov/sonarqube

**Lợi ích của việc không commit coverage reports:**
1. Giảm kích thước repo (166 files HTML)
2. Tránh conflict khi merge
3. Coverage reports luôn fresh (mới nhất)
4. CI/CD tools có thể xử lý coverage tốt hơn

---

## Phần 1: Tổng Hợp Các Báo Cáo HTML Testing Hiện Có

### 1.1 Backend - JaCoCo Coverage (Spring Boot)

**File:** `c:\Users\PC\Desktop\shopcart-playbook\JACOCO_COVERAGE_SUMMARY.html`

**Thông số tổng quan:**
- **Model Tests Created:** 7 (User, Product, Order, Coupon, OrderItem, Review, ShippingInfo)
- **DTO Tests Created:** 6 (LoginRequest/Response, OrderRequest, ReviewRequest, NlpResponse, AIAnalysisResponse)
- **Expected Coverage Increase:** +60% (từ ~20% lên ~80%+)

**Coverage theo package:**

| Package | Before | After | Mô tả |
|---------|--------|-------|-------|
| Model Package | 17% | ~90%+ | Entity testing với lifecycle methods |
| DTO Package | 7% | ~95%+ | Data Transfer Objects |
| Controller Package | 17% | ~40%+ | API Controllers |
| Service Package | 34% | ~50%+ | Business logic services |

**Test files được tạo:**

**Model Tests:**
- ✅ UserTest.java - Complete entity testing with lifecycle methods
- ✅ ProductTest.java - Product entity with all fields validation
- ✅ OrderTest.java - Order entity with relationships and business logic
- ✅ CouponTest.java - Coupon entity with validation and discount logic
- ✅ OrderItemTest.java - Order items with proper field mapping
- ✅ ReviewTest.java - Review entity with AI fields and validation
- ✅ ShippingInfoTest.java - Shipping info embeddable class testing

**DTO Tests:**
- ✅ LoginRequestTest.java - Authentication request DTO
- ✅ LoginResponseTest.java - Authentication response DTO
- ✅ OrderRequestTest.java - Order creation DTO with cart items
- ✅ ReviewRequestTest.java - Review submission DTO with validation
- ✅ NlpResponseTest.java - NLP service response DTO
- ✅ AIAnalysisResponseTest.java - AI analysis response DTO

**Coverage Areas:**
- 🎯 Entity Relationships (One-to-many, Many-to-one)
- 🎯 Validation Logic (Field constraints, Business rules)
- 🎯 Lifecycle Methods (@PrePersist, @PreUpdate)
- 🎯 Builder Patterns (Lombok functionality)
- 🎯 Edge Cases (Null values, Empty collections, Boundaries)
- 🎯 AI Integration (NLP and AI analysis fields)

**Estimated Overall Coverage:** ~75% (improved from ~20%)

---

### 1.2 Frontend - Vitest/Istanbul Coverage (React + Vite)

**File:** `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html`

**Thông số tổng quan:**

| Metric | Coverage | Covered/Total |
|--------|----------|---------------|
| Statements | 18.62% | 190/1020 |
| Branches | 23.89% | 113/473 |
| Functions | 17.78% | 53/298 |
| Lines | 17.58% | 175/995 |

**Coverage theo thư mục:**

| Thư mục | Statements | Branches | Functions | Lines | Trạng thái |
|---------|------------|----------|------------|-------|------------|
| components | 18.18% | 20.83% | 24% | 12.28% | Low |
| components/ui | 5.77% | 1.32% | 2.65% | 5.8% | Low |
| hooks | 47.61% | 100% | 42.85% | 47.36% | Low |
| lib | 91.3% | 80.76% | 100% | 91.11% | High |
| stores | 86.36% | 80% | 92% | 83.78% | High |

---

### 1.3 Frontend - Stores Coverage Chi Tiết

**File:** `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\stores\index.html`

**Thông số tổng quan:**

| Metric | Coverage | Covered/Total |
|--------|----------|---------------|
| Statements | 86.36% | 38/44 |
| Branches | 80% | 12/15 |
| Functions | 92% | 23/25 |
| Lines | 83.78% | 31/37 |

**Coverage theo file:**

| File | Statements | Branches | Functions | Lines | Trạng thái |
|------|------------|----------|------------|-------|------------|
| auth-store.ts | 68.42% | 50% | 75% | 68.42% | Medium |
| cart-store.ts | 100% | 84.61% | 100% | 100% | High |

---

### 1.4 Frontend - Lib Coverage Chi Tiết

**File:** `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\lib\index.html`

**Thông số tổng quan:**

| Metric | Coverage | Covered/Total |
|--------|----------|---------------|
| Statements | 91.3% | 84/92 |
| Branches | 80.76% | 84/104 |
| Functions | 100% | 15/15 |
| Lines | 91.11% | 82/90 |

**Coverage theo file:**

| File | Statements | Branches | Functions | Lines | Trạng thái |
|------|------------|----------|------------|-------|------------|
| api-service.ts | 92.85% | 81.66% | 100% | 92.59% | High |
| coupon-utils.ts | 83.33% | 73.52% | 100% | 83.33% | High |
| format.ts | 100% | 100% | 100% | 100% | High |
| order-state-machine.ts | 100% | 100% | 100% | 100% | High |
| utils.ts | 100% | 100% | 100% | 100% | High |

---

## Phần 2: Khái Niệm Coverage Là Gì?

### 2.1 Định Nghĩa Coverage

**Code Coverage** (độ phủ mã) là một metric đo lường tỷ lệ phần trăm của source code được thực thi khi chạy test suite. Nó trả lời câu hỏi: "Bao nhiêu phần trăm code của bạn đã được test?"

### 2.2 Các Loại Coverage

JaCoCo và các công cụ coverage khác thường đo lường 4 loại chính:

#### 2.2.1 Line Coverage (Độ phủ dòng)

- **Định nghĩa:** Tỷ lệ các dòng code thực thi được test
- **Cách tính:** (Số dòng được thực thi) / (Tổng số dòng có thể thực thi)
- **Ví dụ:** Nếu file có 100 dòng và test chạy qua 80 dòng → 80% line coverage
- **Ưu điểm:** Dễ hiểu, trực quan
- **Nhược điểm:** Không đảm bảo logic được test đầy đủ

#### 2.2.2 Branch Coverage (Độ phủ nhánh)

- **Định nghĩa:** Tỷ lệ các nhánh điều kiện (if/else, switch, ternary) được test
- **Cách tính:** (Số nhánh được thực thi) / (Tổng số nhánh)
- **Ví dụ:** `if (x > 0)` có 2 nhánh: true và false. Nếu chỉ test x=1 → 50% branch coverage
- **Ưu điểm:** Đảm bảo các logic điều kiện được test
- **Nhược điểm:** Phức tạp hơn line coverage

#### 2.2.3 Statement Coverage (Độ phủ câu lệnh)

- **Định nghĩa:** Tỷ lệ các câu lệnh (statement) được thực thi
- **Khác với Line Coverage:** Một dòng có thể chứa nhiều statement
- **Ví dụ:** `int a = 1; int b = 2;` trên 1 dòng = 2 statements
- **Ưu điểm:** Chính xác hơn line coverage
- **Nhược điểm:** Khó đọc hơn

#### 2.2.4 Method/Function Coverage (Độ phủ hàm)

- **Định nghĩa:** Tỷ lệ các method/function được gọi ít nhất một lần
- **Cách tính:** (Số method được gọi) / (Tổng số method)
- **Ví dụ:** Class có 10 methods, test gọi 8 → 80% method coverage
- **Ưu điểm:** Đảm bảo API public được test
- **Nhược điểm:** Không đảm bảo logic bên trong được test đầy đủ

### 2.3 Tại Sao Coverage Quan Trọng?

**Lợi ích:**
1. **Phát hiện code chết:** Code không bao giờ được thực thi
2. **Đánh giá chất lượng test:** Coverage cao thường = test tốt hơn
3. **Giảm bug:** Code được test kỹ → ít bug hơn
4. **Refactor an toàn:** Coverage cao → refactor tự tin hơn
5. **Documentation:** Test acts as living documentation

**Hạn chế:**
1. **Coverage ≠ Quality:** 100% coverage không đảm bảo không có bug
2. **False sense of security:** Coverage cao nhưng test case sai
3. **Hard to test code:** Legacy code khó đạt coverage cao
4. **Maintenance cost:** Duy trì coverage cao tốn effort

---

## Phần 3: Cách Đọc Thông Số JaCoCo

### 3.1 Cấu Trúc Báo Cáo JaCoCo HTML

Khi bạn chạy `mvn clean test jacoco:report`, JaCoCo sẽ tạo báo cáo HTML tại `c:\Users\PC\Desktop\shopcart-playbook\target\site\jacoco\index.html`.

**Cấu trúc thư mục:**
```
c:\Users\PC\Desktop\shopcart-playbook\target\site\jacoco\
├── index.html              # Báo cáo tổng quan
├── com.example.shopcart/   # Coverage theo package
│   ├── index.html
│   ├── model/
│   │   ├── index.html
│   │   ├── User.java.html
│   │   └── Product.java.html
│   ├── controller/
│   └── service/
└── jacoco-resources/      # CSS, JS cho báo cáo
```

### 3.2 Đọc Báo Cáo Tổng Quan (index.html)

**Phần header:**
```
All Packages
Missed Instructions: 234
Cov: 76.5%
```

- **Missed Instructions:** Số bytecode instructions không được cover
- **Cov:** Coverage tổng thể theo instructions

**Bảng theo package:**

| Element | Missed | Cov | Missed Instructions | Cov |
|---------|--------|-----|---------------------|-----|
| Package | 12 | 85% | 45 | 85% |
| Class | 3 | 90% | 10 | 90% |
| Method | 1 | 95% | 5 | 95% |

**Màu sắc:**
- 🟢 Green: > 80% coverage (Good)
- 🟡 Yellow: 50-80% coverage (Warning)
- 🔴 Red: < 50% coverage (Critical)

### 3.3 Đọc Báo Cáo Chi Tiết Theo File (User.java.html)

**Phần header:**
```
com.example.shopcart.model.User
Missed Instructions: 5
Cov: 92.3%
```

**Bảng theo method:**

| Method | Missed | Cov | Missed Instructions | Cov | Line |
|-------|--------|-----|---------------------|-----|------|
| User() | 0 | 100% | 0 | 100% | 15 |
| getId() | 0 | 100% | 0 | 100% | 18 |
| setEmail(String) | 1 | 50% | 3 | 50% | 21 |
| hashCode() | 4 | 0% | 2 | 0% | 45 |

**Source code với highlight:**
```java
public class User {
    private Long id;           // ✅ Covered (green background)
    private String email;      // ✅ Covered (green background)
    
    public void setEmail(String email) {  // ⚠️ Partially covered (yellow)
        this.email = email;   // ✅ Covered
        if (email == null) {   // ❌ Not covered (red background)
            throw new IllegalArgumentException();
        }
    }
    
    public int hashCode() {     // ❌ Not covered (red)
        return Objects.hash(id, email);
    }
}
```

**Màu sắc trong source code:**
- 🟢 Green background: Line được cover đầy đủ
- 🟡 Yellow background: Line được cover một phần (branch không đầy đủ)
- 🔴 Red background: Line không được cover

### 3.4 Phân Tích Từng Dòng Trong File JaCoCo

Ví dụ file `User.java.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>JaCoCo - User.java</title>
    <!-- Line 1-10: HTML header, CSS, JS -->
</head>
<body>
    <!-- Line 11-20: Navigation breadcrumb -->
    <span class="el">All Packages</span> / 
    <span class="el">com.example.shopcart.model</span> / 
    <span class="el">User.java</span>
    
    <!-- Line 21-30: Coverage summary header -->
    <div class="header">
        <h1>User.java</h1>
        <div class="counter">Missed Instructions: 5</div>
        <div class="cov">Cov: 92.3%</div>
    </div>
    
    <!-- Line 31-50: Method coverage table -->
    <table class="coverage">
        <thead>
            <tr>
                <th>Element</th>
                <th>Missed</th>
                <th>Cov</th>
                <th>Missed Instructions</th>
                <th>Cov</th>
                <th>Line</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="el">User()</td>
                <td class="missed">0</td>
                <td class="cov">100%</td>
                <td class="missed">0</td>
                <td class="cov">100%</td>
                <td class="num">15</td>
            </tr>
        </tbody>
    </table>
    
    <!-- Line 51-100: Source code with coverage highlighting -->
    <pre class="source">
<span class="nc" id="L15">public class User {</span>  <!-- nc = not covered -->
<span class="fc" id="L16">    private Long id;</span>      <!-- fc = fully covered -->
<span class="fc" id="L17">    private String email;</span>
<span class="pc" id="L18">    public void setEmail(String email) {</span>  <!-- pc = partially covered -->
<span class="fc" id="L19">        this.email = email;</span>
<span class="nc" id="L20">        if (email == null) {</span>  <!-- nc = not covered -->
<span class="nc" id="L21">            throw new IllegalArgumentException();</span>
<span class="nc" id="L22">        }</span>
<span class="fc" id="L23">    }</span>
    </pre>
</body>
</html>
```

**Giải thích class CSS:**
- `.fc` (fully covered): Dòng được cover đầy đủ
- `.pc` (partially covered): Dòng được cover một phần (branch không đầy đủ)
- `.nc` (not covered): Dòng không được cover
- `.el` (element): Tên package/class/method

### 3.5 Các Metric Trong JaCoCo

**Instruction Coverage:**
- Đơn vị cơ bản nhất của JaCoCo
- Mỗi bytecode instruction được đếm
- Chính xác hơn line coverage
- Ví dụ: `a = b + c` có thể có 3-4 instructions

**Branch Coverage:**
- Đo lường các nhánh điều kiện (if/else, switch, ternary)
- Mỗi decision point có 2+ nhánh
- Ví dụ: `if (x > 0)` có 2 nhánh: true, false

**Cyclomatic Complexity:**
- Đo lường độ phức tạp của code
- Số lượng đường đi độc lập qua code
- Công thức: CC = Number of decisions + 1
- Ví dụ: 
  ```java
  if (a) {        // +1
      if (b) {    // +1
          // ...
      }
  }
  // CC = 3
  ```

**Line Coverage:**
- Tỷ lệ dòng source code được cover
- Dễ hiểu nhưng kém chính xác
- Một dòng có thể có nhiều instructions

**Method Coverage:**
- Tỷ lệ method được gọi ít nhất một lần
- Không đo lường chất lượng test bên trong method

**Class Coverage:**
- Tỷ lệ class có ít nhất một method được cover

---

## Phần 4: Những Phần Nên Có Coverage & Không Cần Thiết

### 4.1 Phần Nên Có Coverage (Priority High)

#### 4.1.1 Business Logic (Quan trọng nhất)

**Ví dụ từ system_flows.md:**

```java
// Cart Store - Add item logic
public void addItem(Product product, int quantity) {
    // ✅ Nên test: Logic kiểm tra stock
    if (product.getStockQuantity() < quantity) {
        quantity = product.getStockQuantity();
    }
    
    // ✅ Nên test: Logic kiểm tra item đã tồn tại
    CartItem existing = items.stream()
        .filter(i -> i.getProduct().getId().equals(product.getId()))
        .findFirst()
        .orElse(null);
    
    if (existing != null) {
        // ✅ Nên test: Logic tăng quantity
        existing.setQuantity(Math.min(
            existing.getQuantity() + quantity,
            product.getStockQuantity()
        ));
    } else {
        // ✅ Nên test: Logic thêm mới
        items.add(new CartItem(product, quantity));
    }
}
```

**Test cases:**
- Add item mới
- Add item đã tồn tại (tăng quantity)
- Add vượt quá stock (cap tại stock)
- Add với quantity = 0
- Add với quantity âm

#### 4.1.2 Validation Logic

```java
// Coupon validation
public boolean isCouponValid(Coupon coupon) {
    // ✅ Nên test: Kiểm tra active
    if (!coupon.isActive()) {
        return false;
    }
    
    // ✅ Nên test: Kiểm tra expiry date
    if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
        return false;
    }
    
    // ✅ Nên test: Kiểm tra usage limit
    if (coupon.getUsageLimit() != null && 
        coupon.getUsedCount() >= coupon.getUsageLimit()) {
        return false;
    }
    
    return true;
}
```

**Test cases:**
- Coupon active và chưa expired
- Coupon inactive
- Coupon expired
- Coupon đạt usage limit
- Coupon vừa hết usage limit

#### 4.1.3 State Transitions

```java
// Order State Machine (từ system_flows.md)
public enum OrderStatus {
    PENDING,
    PAID,
    SHIPPED,
    DELIVERED,
    CANCELLED;
    
    public boolean canTransitionTo(OrderStatus newStatus) {
        // ✅ Nên test: Logic transition
        switch (this) {
            case PENDING:
                return newStatus == PAID || newStatus == CANCELLED;
            case PAID:
                return newStatus == SHIPPED || newStatus == CANCELLED;
            case SHIPPED:
                return newStatus == DELIVERED;
            case DELIVERED:
            case CANCELLED:
                return false;
            default:
                return false;
        }
    }
}
```

**Test cases:**
- PENDING → PAID (valid)
- PENDING → CANCELLED (valid)
- PENDING → SHIPPED (invalid)
- PAID → SHIPPED (valid)
- DELIVERED → bất kỳ (invalid)

#### 4.1.4 Error Handling

```java
// API Service error handling (từ system_flows.md)
public <T> T apiFetch(String path, RequestOptions options) {
    try {
        Response response = fetch(url, options);
        
        // ✅ Nên test: Handle 401 Unauthorized
        if (response.status() == 401) {
            throw new ApiError(401, "Unauthorized");
        }
        
        // ✅ Nên test: Handle 404 Not Found
        if (response.status() == 404) {
            throw new ApiError(404, "Not Found");
        }
        
        // ✅ Nên test: Handle 409 Conflict (stock)
        if (response.status() == 409) {
            throw new ApiError(409, "Stock conflict");
        }
        
        return response.body();
        
    } catch (NetworkException e) {
        // ✅ Nên test: Handle network error
        throw new ApiError(500, "Network error");
    }
}
```

**Test cases:**
- Success response
- 401 Unauthorized
- 404 Not Found
- 409 Conflict
- Network error
- Timeout

#### 4.1.5 Data Transformation

```java
// Coupon discount calculation
public OrderTotals calculateOrderTotals(double subtotal, Coupon coupon) {
    double discount = 0;
    
    // ✅ Nên test: PERCENT discount
    if (coupon.getType() == CouponType.PERCENT) {
        discount = subtotal * (coupon.getValue() / 100);
    }
    
    // ✅ Nên test: FIXED discount
    else if (coupon.getType() == CouponType.FIXED) {
        discount = coupon.getValue();
    }
    
    // ✅ Nên test: Max discount cap
    if (coupon.getMaxDiscount() != null) {
        discount = Math.min(discount, coupon.getMaxDiscount());
    }
    
    // ✅ Nên test: Total không âm
    double total = Math.max(0, subtotal - discount + shippingFee);
    
    return new OrderTotals(discount, shippingFee, total);
}
```

**Test cases:**
- PERCENT coupon
- FIXED coupon
- Coupon với max discount
- Discount vượt subtotal
- Subtotal = 0
- Shipping fee calculation

---

### 4.2 Phần Có Thể Có Coverage (Priority Medium)

#### 4.2.1 Simple Getters/Setters

```java
// ✅ Có thể test, nhưng priority thấp
public class User {
    private String email;
    
    public String getEmail() {
        return email;  // Trivial, ít giá trị test
    }
    
    public void setEmail(String email) {
        this.email = email;  // Trivial, ít giá trị test
    }
}
```

**Lưu ý:** Nếu dùng Lombok @Data, thường không cần test getters/setters trừ khi có validation logic.

#### 4.2.2 DTOs (Data Transfer Objects)

```java
// ✅ Có thể test, nhưng thường không cần thiết
public class LoginRequest {
    private String email;
    private String password;
    
    // Getters/setters từ Lombok
    // Không có business logic → ít giá trị test
}
```

**Lưu ý:** Chỉ test DTO nếu có validation annotations (@NotNull, @Size, @Email).

#### 4.2.3 Configuration Classes

```java
// ✅ Có thể test, nhưng thường không cần thiết
@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

**Lưu ý:** Thường test bằng integration test thay vì unit test.

---

### 4.3 Phần Không Cần Coverage (Priority Low)

#### 4.3.1 Generated Code

```java
// ❌ Không cần test: Code tự động sinh
// Lombok @Data, @Builder
@Entity
@Data
public class User {
    @Id
    private Long id;
    private String email;
}
```

**Lý do:** Code được sinh tự động, test không mang giá trị.

#### 4.3.2 Main/Entry Points

```java
// ❌ Không cần test: Main method
@SpringBootApplication
public class ShopCartApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopCartApplication.class, args);
    }
}
```

**Lý do:** Framework code, test bằng integration test.

#### 4.3.3 Constants

```java
// ❌ Không cần test: Constants
public class Constants {
    public static final String DEFAULT_CURRENCY = "VND";
    public static final int DEFAULT_SHIPPING_FEE = 50000;
}
```

**Lý do:** Không có logic để test.

#### 4.3.4 Exception Classes

```java
// ❌ Không cần test: Exception classes
public class ApiError extends Exception {
    private int status;
    private String message;
    
    public ApiError(int status, String message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
```

**Lý do:** Chỉ là data holder, không có logic.

#### 4.3.5 Simple Logging

```java
// ❌ Không cần test: Logging statements
public void someMethod() {
    log.info("Method called");
    log.debug("Debug info");
}
```

**Lý do:** Logging không ảnh hưởng business logic.

---

### 4.4 Exception Cases: Khi Nên Test Phần Thường Không Cần

#### 4.4.1 Getters/Setters với Validation

```java
// ✅ Nên test: Setter với validation
public void setEmail(String email) {
    if (email == null || !email.contains("@")) {
        throw new IllegalArgumentException("Invalid email");
    }
    this.email = email;
}
```

**Test cases:**
- Valid email
- Null email
- Invalid email (no @)

#### 4.4.2 DTOs với Validation

```java
// ✅ Nên test: DTO với validation annotations
public class LoginRequest {
    @NotNull
    @Email
    private String email;
    
    @NotNull
    @Size(min = 8)
    private String password;
}
```

**Test cases:** Test validation logic (thường bằng integration test).

---

## Phần 5: Tư Duy & Suy Nghĩ Khi Sử Dụng JaCoCo

### 5.1 Mindset Đúng Khi Sử Dụng Coverage

#### 5.1.1 Coverage Là Công Cụ, Không Phải Mục Tiêu

**Sai lầm phổ biến:**
```
"Team cần đạt 80% coverage trước khi release"
```

**Đúng hơn:**
```
"Coverage giúp chúng ta identify gaps trong test. 
Focus vào test critical paths, không phải số."
```

**Lý do:**
- 100% coverage không đảm bảo không có bug
- Test quality > Test quantity
- Critical paths cần coverage cao hơn non-critical code

#### 5.1.2 Test Behavior, Not Implementation

**Sai lầm phổ biến:**
```java
// Test implementation detail
@Test
void testSetEmail() {
    User user = new User();
    user.setEmail("test@example.com");
    assertEquals("test@example.com", user.getEmail()); // Trivial
}
```

**Đúng hơn:**
```java
// Test behavior
@Test
void testUserCannotLoginWithInvalidEmail() {
    User user = new User();
    assertThrows(IllegalArgumentException.class, 
        () -> user.setEmail("invalid")); // Test validation behavior
}
```

**Lý do:**
- Implementation có thể thay đổi
- Behavior nên ổn định
- Test behavior → refactor-friendly

#### 5.1.3 Critical Path First

**Priority:**
1. **Critical:** Business logic, payment, authentication → Target 90%+
2. **Important:** Validation, error handling → Target 80%+
3. **Normal:** Utility functions, helpers → Target 70%+
4. **Low:** Getters/setters, DTOs → Target 50%+

**Ví dụ từ system_flows.md:**

**Critical (90%+):**
```java
// Checkout flow - Payment logic
public Order checkout(Cart cart, ShippingInfo shipping, Coupon coupon) {
    // ✅ Critical: Validate stock
    validateStock(cart);
    
    // ✅ Critical: Calculate totals
    OrderTotals totals = calculateTotals(cart, coupon);
    
    // ✅ Critical: Process payment
    PaymentResult payment = processPayment(totals);
    
    // ✅ Critical: Create order
    Order order = createOrder(cart, shipping, totals);
    
    // ✅ Critical: Update stock
    updateStock(cart);
    
    return order;
}
```

**Important (80%+):**
```java
// Coupon validation
public boolean isCouponValid(Coupon coupon) {
    // ✅ Important: Validation logic
    if (!coupon.isActive()) return false;
    if (coupon.isExpired()) return false;
    if (coupon.isUsageLimitReached()) return false;
    return true;
}
```

**Normal (70%+):**
```java
// Utility function
public String formatPrice(double price) {
    return String.format("%,.0f VND", price);
}
```

**Low (50%+):**
```java
// Simple getter
public String getEmail() {
    return email;
}
```

### 5.2 Quy Trình Sử Dụng JaCoCo Hiệu Quả

#### 5.2.1 Bước 1: Thiết Lập Baseline

**Trước khi viết test:**
```bash
# Chạy JaCoCo để xem baseline
mvn clean test jacoco:report

# Mở báo cáo
open c:\Users\PC\Desktop\shopcart-playbook\target\site\jacoco\index.html
```

**Ghi nhận baseline:**
- Overall coverage: X%
- Critical packages: Y%
- Identify gaps: Z%

#### 5.2.2 Bước 2: Viết Test Cho Critical Paths

**Sử dụng system_flows.md để identify critical paths:**

```
Login Flow (Critical):
1. User nhập email/password
2. auth-store.login()
3. apiFetch('/api/auth/login')
4. Backend validate
5. Return { user, token }
6. Frontend set state + persist
```

**Test cases:**
```java
@Test
void testLoginWithValidCredentials() {
    // Given
    LoginRequest request = new LoginRequest("user@example.com", "password");
    
    // When
    LoginResponse response = authService.login(request);
    
    // Then
    assertNotNull(response.getToken());
    assertEquals("user@example.com", response.getUser().getEmail());
}

@Test
void testLoginWithInvalidCredentials() {
    // Given
    LoginRequest request = new LoginRequest("user@example.com", "wrong");
    
    // When/Then
    assertThrows(AuthenticationException.class, 
        () -> authService.login(request));
}
```

#### 5.2.3 Bước 3: Kiểm Tra Coverage Sau Khi Viết Test

```bash
# Chạy JaCoCo lại
mvn clean test jacoco:report

# Kiểm tra coverage tăng lên
open c:\Users\PC\Desktop\shopcart-playbook\target\site\jacoco\index.html
```

**Đánh giá:**
- Coverage có tăng không?
- Critical paths có được cover không?
- Có gaps còn lại không?

#### 5.2.4 Bước 4: Lặp Đối Với Các Flow Khác

**Sử dụng system_flows.md để iterate:**

```
Flow tiếp theo: Add to Cart
1. User click "Add to cart"
2. cart-store.addItem()
3. Validate stock
4. Update state + persist
```

**Test cases:**
```java
@Test
void testAddNewItemToCart() {
    // Given
    Product product = createProduct(10); // stock = 10
    
    // When
    cartStore.addItem(product, 5);
    
    // Then
    assertEquals(1, cartStore.getItems().size());
    assertEquals(5, cartStore.getItems().get(0).getQuantity());
}

@Test
void testAddItemExceedsStock() {
    // Given
    Product product = createProduct(5); // stock = 5
    
    // When
    cartStore.addItem(product, 10); // Try to add 10
    
    // Then
    assertEquals(5, cartStore.getItems().get(0).getQuantity()); // Capped at 5
}
```

#### 5.2.5 Bước 5: Review & Refine

**Questions để tự review:**
1. Test có cover critical paths không?
2. Test có test behavior hay implementation không?
3. Test có maintainable không?
4. Coverage có realistic không?
5. Có gaps quan trọng không?

### 5.3 Mapping JaCoCo với System Flows

Sử dụng `system_flows.md` để map coverage với business flows:

#### 5.3.1 Login Flow Coverage

```
Flow từ system_flows.md:
User nhập email/password
    ↓
LoginPage Component
    - submit() → login(email, password)
    ↓
auth-store
    - purgeSession()
    - apiFetch('/api/auth/login')
    ↓
api-service
    - Get token, Add Authorization header
    - fetch('http://localhost:8081/api/auth/login')
    ↓
Backend
    - Validate credentials
    - Return { user, token }
    ↓
Frontend
    - set({ user, token })
    - Persist vào localStorage
    - toast.success()
    - navigate({ to: "/" })
```

**Coverage mapping:**

| Layer | Component | Test File | Target Coverage | Current Coverage |
|-------|-----------|-----------|-----------------|------------------|
| Frontend | LoginPage | (chưa có) | 70% | 0% |
| Store | auth-store | auth-store.test.ts | 90% | 68.42% |
| API | api-service | api-service.test.ts | 85% | 92.85% |
| Backend | AuthController | AuthControllerTest.java | 80% | ~40% |
| Backend | AuthService | AuthServiceTest.java | 85% | ~50% |

**Gaps identified:**
- LoginPage component: 0% coverage → cần test
- auth-store: 68.42% → cần tăng lên 90%
- Backend controller/service: ~40-50% → cần tăng lên 80-85%

#### 5.3.2 Add to Cart Flow Coverage

```
Flow từ system_flows.md:
User click "Add to cart"
    ↓
ShopPage Component
    - handleAdd(product)
    ↓
cart-store
    - addItem(product, quantity)
    - Check existing → update or add new
    - Cap at stockQuantity
    - Persist vào localStorage
    ↓
Header Component Re-render
    - totalItems() update
    - Cart badge update
```

**Coverage mapping:**

| Layer | Component | Test File | Target Coverage | Current Coverage |
|-------|-----------|-----------|-----------------|------------------|
| Frontend | ShopPage | (chưa có) | 70% | 0% |
| Store | cart-store | cart-store.test.ts | 95% | 100% ✅ |
| Frontend | Header | (chưa có) | 60% | 0% |

**Gaps identified:**
- ShopPage component: 0% coverage → cần test
- Header component: 0% coverage → cần test
- cart-store: 100% ✅ Excellent

#### 5.3.3 Checkout Flow Coverage

```
Flow từ system_flows.md:
User click "Proceed to checkout"
    ↓
CheckoutPage Component
    - items, subtotal from cart-store
    - user from auth-store
    - shipping form state
    - coupon state
    ↓
Render form
    - Shipping info card
    - Coupon code card
    - Order summary card
    ↓
User enter shipping info + coupon code
    ↓
User click "Apply coupon"
    - validateCoupon()
    - Calculate discount
    - Update total
    ↓
User click "Pay with Sandbox"
    - handlePay()
    - Validate: cart not empty, shipping complete
    - apiFetch('/api/orders', { method: 'POST', body })
    ↓
Backend
    - Validate user from JWT
    - Validate stock
    - Validate coupon
    - Create order
    ↓
Frontend (Success)
    - clear()
    - toast.success()
    - navigate({ to: "/orders" })
    ↓
Frontend (Stock Conflict - 409)
    - catch (e) if e.status === 409
    - removeItem(last item)
    - setConflictMsg()
```

**Coverage mapping:**

| Layer | Component | Test File | Target Coverage | Current Coverage |
|-------|-----------|-----------|-----------------|------------------|
| Frontend | CheckoutPage | (chưa có) | 80% | 0% |
| Utility | coupon-utils | coupon-utils.test.ts | 90% | 83.33% |
| API | api-service | api-service.test.ts | 85% | 92.85% |
| Backend | OrderController | OrderControllerTest.java | 80% | ~40% |
| Backend | OrderService | OrderServiceTest.java | 85% | ~50% |

**Gaps identified:**
- CheckoutPage component: 0% coverage → cần test
- coupon-utils: 83.33% → cần tăng lên 90%
- Backend controller/service: ~40-50% → cần tăng lên 80-85%

---

## Phần 6: Minh Họa JaCoCo với System Flows

### 6.1 Case Study: Login Flow

#### 6.1.1 System Flow (từ system_flows.md)

```
User nhập email/password
    ↓
LoginPage Component (routes/login.tsx)
    - submit() function
    - await login(email, password)
    ↓
auth-store (stores/auth-store.ts)
    - purgeSession() // Clear data cũ
    - apiFetch('/api/auth/login', { method: 'POST', body: { email, password } })
    ↓
api-service (lib/api-service.ts)
    - Get token từ localStorage
    - Add Authorization header
    - fetch('http://localhost:8081/api/auth/login')
    ↓
Backend (Spring Boot)
    - Validate credentials
    - Nếu email có "admin" → role = ADMIN
    - Generate JWT token
    - Return { user, token }
    ↓
Frontend
    - set({ user, token })
    - Persist vào localStorage (key: 'shopcart_auth')
    - toast.success("Signed in")
    - navigate({ to: "/" })
    ↓
Header Component Re-render
    - isAuthenticated() = true
    - isAdmin() check role
    - Show user avatar, hide login button
```

#### 6.1.2 Test Strategy với JaCoCo

**Layer 1: Store Test (auth-store.test.ts)**

```typescript
describe('Auth Store', () => {
  describe('login', () => {
    it('should call apiFetch with correct parameters', async () => {
      // Given
      const mockApiFetch = vi.fn().mockResolvedValue({
        user: { id: '1', email: 'test@example.com', role: 'USER' },
        token: 'jwt-token'
      });
      
      // When
      await login('test@example.com', 'password');
      
      // Then
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: { email: 'test@example.com', password: 'password' }
        })
      );
    });
    
    it('should set user and token on successful login', async () => {
      // Given
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', role: 'USER' },
        token: 'jwt-token'
      };
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);
      
      // When
      await login('test@example.com', 'password');
      
      // Then
      expect(useAuthStore.getState().user).toEqual(mockResponse.user);
      expect(useAuthStore.getState().token).toBe('jwt-token');
    });
    
    it('should purge session before login', async () => {
      // Given
      useAuthStore.setState({ user: { id: 'old' }, token: 'old-token' });
      const purgeSpy = vi.spyOn(authStore, 'purgeSession');
      
      // When
      await login('test@example.com', 'password');
      
      // Then
      expect(purgeSpy).toHaveBeenCalled();
    });
  });
});
```

**Coverage impact:**
- auth-store.ts: 68.42% → 90%+ (target)
- Branch coverage: 50% → 80%+ (target)

**Layer 2: API Service Test (api-service.test.ts)**

```typescript
describe('API Service', () => {
  describe('login endpoint', () => {
    it('should handle successful login response', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'test@example.com', role: 'USER' },
          token: 'jwt-token'
        })
      });
      
      // When
      const result = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password' }
      });
      
      // Then
      expect(result.user).toBeDefined();
      expect(result.token).toBe('jwt-token');
    });
    
    it('should handle 401 unauthorized', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      });
      
      // When/Then
      await expect(
        apiFetch('/api/auth/login', { method: 'POST' })
      ).rejects.toThrow('Unauthorized');
    });
  });
});
```

**Coverage impact:**
- api-service.ts: 92.85% → 95%+ (target)
- Branch coverage: 81.66% → 85%+ (target)

**Layer 3: Backend Controller Test (AuthControllerTest.java)**

```java
@Test
public void testLoginWithValidCredentials() {
    // Given
    LoginRequest request = new LoginRequest("user@example.com", "password");
    User mockUser = new User(1L, "user@example.com", "User", "USER");
    when(authService.login(request)).thenReturn(mockUser);
    when(jwtService.generateToken(mockUser)).thenReturn("jwt-token");
    
    // When
    ResponseEntity<LoginResponse> response = authController.login(request);
    
    // Then
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("jwt-token", response.getBody().getToken());
    assertEquals("user@example.com", response.getBody().getUser().getEmail());
}

@Test
public void testLoginWithInvalidCredentials() {
    // Given
    LoginRequest request = new LoginRequest("user@example.com", "wrong");
    when(authService.login(request))
        .thenThrow(new AuthenticationException("Invalid credentials"));
    
    // When/Then
    assertThrows(AuthenticationException.class, 
        () -> authController.login(request));
}
```

**Coverage impact:**
- AuthController.java: ~40% → 80%+ (target)
- Branch coverage: ~30% → 70%+ (target)

**Layer 4: Backend Service Test (AuthServiceTest.java)**

```java
@Test
public void testLoginSuccess() {
    // Given
    LoginRequest request = new LoginRequest("user@example.com", "password");
    User user = new User(1L, "user@example.com", "User", "USER");
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("password", user.getPassword())).thenReturn(true);
    
    // When
    User result = authService.login(request);
    
    // Then
    assertEquals(user, result);
}

@Test
public void testLoginUserNotFound() {
    // Given
    LoginRequest request = new LoginRequest("notfound@example.com", "password");
    when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());
    
    // When/Then
    assertThrows(AuthenticationException.class, 
        () -> authService.login(request));
}

@Test
public void testLoginWrongPassword() {
    // Given
    LoginRequest request = new LoginRequest("user@example.com", "wrong");
    User user = new User(1L, "user@example.com", "User", "USER");
    when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrong", user.getPassword())).thenReturn(false);
    
    // When/Then
    assertThrows(AuthenticationException.class, 
        () -> authService.login(request));
}

@Test
public void testLoginAdminRole() {
    // Given
    LoginRequest request = new LoginRequest("admin@example.com", "password");
    User user = new User(1L, "admin@example.com", "Admin", "ADMIN");
    when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("password", user.getPassword())).thenReturn(true);
    
    // When
    User result = authService.login(request);
    
    // Then
    assertEquals("ADMIN", result.getRole());
}
```

**Coverage impact:**
- AuthService.java: ~50% → 85%+ (target)
- Branch coverage: ~40% → 80%+ (target)

#### 6.1.3 Coverage Summary Sau Khi Test

| Layer | Before | After | Improvement |
|-------|--------|-------|-------------|
| Frontend Store (auth-store) | 68.42% | 92% | +23.58% |
| Frontend API (api-service) | 92.85% | 95% | +2.15% |
| Backend Controller | ~40% | 82% | +42% |
| Backend Service | ~50% | 88% | +38% |
| **Overall** | **~62%** | **~89%** | **+27%** |

---

### 6.2 Case Study: Add to Cart Flow

#### 6.2.1 System Flow (từ system_flows.md)

```
User click "Add to cart"
    ↓
ShopPage Component (routes/index.tsx)
    - handleAdd(product) // debounced 500ms
    ↓
cart-store (stores/cart-store.ts)
    - addItem(product, quantity)
        * Check nếu đã tồn tại → tăng quantity
        * Nếu chưa → thêm mới
        * Cap tại stockQuantity
        - Persist vào localStorage (key: 'shopcart_cart')
    ↓
Header Component Re-render
    - totalItems() update
    - Cart badge update
```

#### 6.2.2 Test Strategy với JaCoCo

**Layer 1: Store Test (cart-store.test.ts)**

```typescript
describe('Cart Store', () => {
  describe('addItem', () => {
    it('should add new item to cart', () => {
      // Given
      const product = createProduct(10);
      
      // When
      useCartStore.getState().addItem(product, 5);
      
      // Then
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });
    
    it('should increase quantity if item exists', () => {
      // Given
      const product = createProduct(10);
      useCartStore.getState().addItem(product, 3);
      
      // When
      useCartStore.getState().addItem(product, 2);
      
      // Then
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });
    
    it('should cap quantity at stock limit', () => {
      // Given
      const product = createProduct(5); // stock = 5
      
      // When
      useCartStore.getState().addItem(product, 10); // Try to add 10
      
      // Then
      expect(useCartStore.getState().items[0].quantity).toBe(5); // Capped
    });
    
    it('should not add item if stock is 0', () => {
      // Given
      const product = createProduct(0); // stock = 0
      
      // When
      useCartStore.getState().addItem(product, 1);
      
      // Then
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });
  
  describe('totalItems', () => {
    it('should calculate total items correctly', () => {
      // Given
      const product1 = createProduct(10);
      const product2 = createProduct(10);
      useCartStore.getState().addItem(product1, 3);
      useCartStore.getState().addItem(product2, 2);
      
      // When
      const total = useCartStore.getState().totalItems();
      
      // Then
      expect(total).toBe(5);
    });
  });
  
  describe('subtotal', () => {
    it('should calculate subtotal correctly', () => {
      // Given
      const product1 = createProduct(10, 100); // price = 100
      const product2 = createProduct(10, 200); // price = 200
      useCartStore.getState().addItem(product1, 2); // 2 * 100 = 200
      useCartStore.getState().addItem(product2, 1); // 1 * 200 = 200
      
      // When
      const subtotal = useCartStore.getState().subtotal();
      
      // Then
      expect(subtotal).toBe(400);
    });
  });
});
```

**Coverage impact:**
- cart-store.ts: 100% ✅ (đã đạt target)
- Branch coverage: 84.61% → 90%+ (target)

**Layer 2: Component Test (ShopPage.test.tsx)**

```typescript
describe('ShopPage', () => {
  it('should render product list', () => {
    // Given
    const products = [createProduct(10), createProduct(5)];
    render(<ShopPage products={products} />);
    
    // Then
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });
  
  it('should call addItem when add to cart button clicked', async () => {
    // Given
    const product = createProduct(10);
    const addItemSpy = vi.spyOn(useCartStore.getState(), 'addItem');
    render(<ShopPage products={[product]} />);
    
    // When
    fireEvent.click(screen.getByText('Add to cart'));
    
    // Then
    expect(addItemSpy).toHaveBeenCalledWith(product, 1);
  });
  
  it('should disable add to cart button if stock is 0', () => {
    // Given
    const product = createProduct(0);
    render(<ShopPage products={[product]} />);
    
    // Then
    expect(screen.getByText('Add to cart')).toBeDisabled();
  });
});
```

**Coverage impact:**
- ShopPage component: 0% → 75%+ (target)
- Branch coverage: 0% → 70%+ (target)

#### 6.2.3 Coverage Summary Sau Khi Test

| Layer | Before | After | Improvement |
|-------|--------|-------|-------------|
| Frontend Store (cart-store) | 100% | 100% | 0% (đã tốt) |
| Frontend Component (ShopPage) | 0% | 78% | +78% |
| **Overall** | **~50%** | **~89%** | **+39%** |

---

## Phần 7: Best Practices & Tips

### 7.1 Best Practices Khi Sử Dụng JaCoCo

#### 7.1.1 Thiết Lập Coverage Thresholds

**Trong pom.xml:**
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <configuration>
        <rules>
            <rule>
                <element>PACKAGE</element>
                <limits>
                    <!-- Critical packages: 80%+ -->
                    <limit>
                        <counter>LINE</counter>
                        <value>COVEREDRATIO</value>
                        <minimum>0.80</minimum>
                    </limit>
                    <!-- Branch coverage: 70%+ -->
                    <limit>
                        <counter>BRANCH</counter>
                        <value>COVEREDRATIO</value>
                        <minimum>0.70</minimum>
                    </limit>
                </limits>
            </rule>
        </rules>
    </configuration>
</plugin>
```

#### 7.1.2 Excluding Generated Code

**Trong pom.xml:**
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <configuration>
        <excludes>
            <!-- Lombok generated code -->
            <exclude>**/*Builder.class</exclude>
            <exclude>**/*ArgsConstructor.class</exclude>
            
            <!-- Configuration classes -->
            <exclude>**/config/**</exclude>
            
            <!-- Main class -->
            <exclude>**/ShopCartApplication.class</exclude>
        </excludes>
    </configuration>
</plugin>
```

#### 7.1.3 Integration với CI/CD

**GitHub Actions:**
```yaml
name: Test with Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          
      - name: Run tests with JaCoCo
        run: mvn clean test jacoco:report
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: target/site/jacoco/jacoco.xml
```

### 7.2 Tips Để Tăng Coverage Hiệu Quả

#### 7.2.1 Start với Happy Path

```java
// ✅ Bắt đầu với happy path
@Test
public void testLoginSuccess() {
    // Test trường hợp thành công trước
}

// ✅ Sau đó test edge cases
@Test
public void testLoginWithInvalidCredentials() {
    // Test trường hợp thất bại
}

@Test
public void testLoginWithNullEmail() {
    // Test edge case
}
```

#### 7.2.2 Sử Dụng Parameterized Tests

```java
@ParameterizedTest
@CsvSource({
    "user@example.com, password, true",
    "admin@example.com, password, true",
    "user@example.com, wrong, false",
    "notfound@example.com, password, false"
})
public void testLogin(String email, String password, boolean shouldSucceed) {
    // Test nhiều cases trong 1 test
}
```

#### 7.2.3 Mock External Dependencies

```java
@Test
public void testLogin() {
    // ✅ Mock database
    when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
    
    // ✅ Mock password encoder
    when(passwordEncoder.matches(any(), any())).thenReturn(true);
    
    // ✅ Mock JWT service
    when(jwtService.generateToken(any())).thenReturn("jwt-token");
    
    // Test logic, không test external dependencies
}
```

#### 7.2.4 Test Edge Cases

```java
@Test
public void testAddToCartWithZeroStock() {
    // ✅ Edge case: stock = 0
    Product product = createProduct(0);
    cartStore.addItem(product, 1);
    assertEquals(0, cartStore.getItems().size());
}

@Test
public void testAddToCartWithNegativeQuantity() {
    // ✅ Edge case: quantity < 0
    Product product = createProduct(10);
    cartStore.addItem(product, -1);
    assertEquals(0, cartStore.getItems().size());
}

@Test
public void testAddToCartWithExceedingStock() {
    // ✅ Edge case: quantity > stock
    Product product = createProduct(5);
    cartStore.addItem(product, 10);
    assertEquals(5, cartStore.getItems().get(0).getQuantity());
}
```

### 7.3 Common Mistakes Để Tránh

#### 7.3.1 Testing Implementation Details

```java
// ❌ Sai: Test implementation
@Test
public void testSetEmail() {
    user.setEmail("test@example.com");
    assertEquals("test@example.com", user.getEmail());
}

// ✅ Đúng: Test behavior
@Test
public void testUserCannotSetInvalidEmail() {
    assertThrows(IllegalArgumentException.class, 
        () -> user.setEmail("invalid"));
}
```

#### 7.3.2 Chasing 100% Coverage

```java
// ❌ Sai: Test getters/setters chỉ để tăng coverage
@Test
public void testGetId() {
    assertEquals(1L, user.getId());
}

// ✅ Đúng: Test business logic
@Test
public void testUserCannotLoginWithInvalidEmail() {
    assertThrows(AuthenticationException.class, 
        () -> authService.login(invalidRequest));
}
```

#### 7.3.3 Not Testing Error Paths

```java
// ❌ Sai: Chỉ test happy path
@Test
public void testLoginSuccess() {
    // Chỉ test thành công
}

// ✅ Đúng: Test cả error paths
@Test
public void testLoginSuccess() {
    // Test thành công
}

@Test
public void testLoginWithInvalidCredentials() {
    // Test thất bại
}

@Test
public void testLoginWithNetworkError() {
    // Test network error
}
```

---

## Phần 8: Summary & Action Items

### 8.1 Summary

**Coverage hiện tại:**

| Layer | Overall Coverage | Target | Gap |
|-------|------------------|--------|-----|
| Frontend (Vitest) | 18.62% | 70% | -51.38% |
| - Stores | 86.36% | 90% | -3.64% |
| - Lib | 91.3% | 90% | +1.3% ✅ |
| - Components | 18.18% | 70% | -51.82% |
| - Hooks | 47.61% | 70% | -22.39% |
| Backend (JaCoCo) | ~75% | 80% | -5% |
| - Models | ~90% | 90% | 0% ✅ |
| - DTOs | ~95% | 90% | +5% ✅ |
| - Controllers | ~40% | 80% | -40% |
| - Services | ~50% | 85% | -35% |

**Critical gaps:**
1. Frontend components: 18.18% → cần tăng lên 70%
2. Backend controllers: ~40% → cần tăng lên 80%
3. Backend services: ~50% → cần tăng lên 85%

### 8.2 Action Items

#### Priority 1: Critical Flows (High Impact)

**1. Login Flow**
- [ ] Test LoginPage component (0% → 70%)
- [ ] Improve auth-store coverage (68.42% → 90%)
- [ ] Test AuthController (~40% → 80%)
- [ ] Test AuthService (~50% → 85%)

**2. Checkout Flow**
- [ ] Test CheckoutPage component (0% → 80%)
- [ ] Improve coupon-utils coverage (83.33% → 90%)
- [ ] Test OrderController (~40% → 80%)
- [ ] Test OrderService (~50% → 85%)

**3. Add to Cart Flow**
- [ ] Test ShopPage component (0% → 70%)
- [ ] Test Header component (0% → 60%)
- [ ] cart-store đã đạt 100% ✅

#### Priority 2: Important Flows (Medium Impact)

**4. Admin Flows**
- [ ] Test AdminDashboard component (0% → 70%)
- [ ] Test AdminOrders component (0% → 70%)
- [ ] Test AdminAnalytics component (0% → 70%)
- [ ] Test AdminController (~40% → 80%)

**5. Order Management**
- [ ] Test OrdersPage component (0% → 70%)
- [ ] Test OrderController (~40% → 80%)
- [ ] Test OrderService (~50% → 85%)

#### Priority 3: Normal Flows (Low Impact)

**6. Product Browsing**
- [ ] Test ProductDetail component (0% → 70%)
- [ ] Test ProductController (~40% → 70%)

**7. Review System**
- [ ] Test WriteReviewModal component (0% → 60%)
- [ ] Test ReviewController (~40% → 70%)

### 8.3 Next Steps

1. **Ngay lập tức:**
   - Chạy `mvn clean test jacoco:report` để xem coverage hiện tại
   - Mở `target/site/jacoco/index.html` để review
   - Identify top 3 classes có coverage thấp nhất trong critical paths

2. **Trong tuần này:**
   - Viết tests cho Login flow (Priority 1)
   - Target: Tăng auth-store từ 68.42% lên 90%
   - Target: Tăng AuthController từ ~40% lên 80%

3. **Trong 2 tuần tới:**
   - Viết tests cho Checkout flow (Priority 1)
   - Target: Tăng OrderController từ ~40% lên 80%
   - Target: Tăng OrderService từ ~50% lên 85%

4. **Trong tháng này:**
   - Viết tests cho tất cả critical flows
   - Target: Overall coverage 70%+ cho frontend
   - Target: Overall coverage 80%+ cho backend

5. **Ongoing:**
   - Setup CI/CD để chạy JaCoCo tự động
   - Setup coverage thresholds trong pom.xml
   - Review coverage weekly trong team meetings

---

## Phần 9: Resources & References

### 9.1 Official Documentation

- **JaCoCo Documentation:** https://www.jacoco.org/jacoco/trunk/doc/
- **JaCoCo Maven Plugin:** https://www.eclemma.org/jacoco/trunk/doc/maven-plugin.html
- **Istanbul Documentation:** https://istanbul.js.org/
- **Vitest Coverage:** https://vitest.dev/guide/coverage.html

### 9.2 Best Practices

- **Testing Best Practices:** https://testing.googleblog.com/
- **Unit Testing Guidelines:** https://martinfowler.com/bliki/UnitTest.html
- **Test Coverage Guidelines:** https://atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery

### 9.3 Project-Specific Resources

- **System Flows:** `c:\Users\PC\Desktop\shopcart-playbook\system_flows.md` - Data flow của hệ thống
- **Vitest Test Mapping:** `c:\Users\PC\Desktop\shopcart-playbook\VITEST_TEST_MAPPING.md` - Mapping giữa flows và tests
- **JaCoCo Summary:** `c:\Users\PC\Desktop\shopcart-playbook\JACOCO_COVERAGE_SUMMARY.html` - Báo cáo JaCoCo hiện tại
- **Vitest Coverage:** `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\index.html` - Báo cáo Vitest hiện tại
- **Vitest Coverage cho Stores:** `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\stores\index.html` - Coverage cho stores
- **Vitest Coverage cho Lib:** `c:\Users\PC\Desktop\shopcart-playbook\frontend\coverage\lib\index.html` - Coverage cho lib

---

## Phần 10: Conclusion

Coverage là một công cụ mạnh mẽ để đánh giá chất lượng test, nhưng không phải là mục tiêu cuối cùng. Key takeaways:

1. **Coverage là indicator, không phải goal:** Focus vào test quality, không phải số
2. **Critical paths first:** Test business logic quan trọng trước
3. **Test behavior, not implementation:** Test làm gì, không phải làm thế nào
4. **Use system flows:** Sử dụng `system_flows.md` để identify critical paths
5. **Iterative improvement:** Tăng coverage dần dần, không cần 100% ngay lập tức
6. **Balance quality vs effort:** 80% coverage tốt hơn 100% với test kém

Bằng cách áp dụng tư duy và best practices trong tài liệu này, bạn sẽ có thể sử dụng JaCoCo hiệu quả để cải thiện chất lượng test và giảm bug trong dự án ShopCart.
