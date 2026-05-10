# TỔNG KẾT KIẾN TRÚC HỆ THỐNG SHOPCART AI - HƯỚNG DẪN CHI TIẾT CHO NGƯỜI MỚI

---

## PHẦN 1: TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

### 1.1 Hệ thống gồm những gì?

Hệ thống ShopCart AI là một ứng dụng thương mại điện tử (e-commerce) với tích hợp AI để phân tích review sản phẩm. Hệ thống được chia thành **4 phần chính**:

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                             │
│  (Chrome, Firefox, Safari, Edge, v.v.)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React/TypeScript) - Port 8080                    │
│  - Giao diện người dùng (UI)                                 │
│  - Xử lý tương tác người dùng                                │
│  - Quản lý state (dữ liệu tạm thời)                         │
│  - Gọi API để lấy/ghi dữ liệu                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Java/Spring Boot) - Port 8081                     │
│  - Xử lý logic nghiệp vụ                                     │
│  - Lưu trữ dữ liệu vào database                              │
│  - Cung cấp API cho Frontend                                 │
│  - Gọi NLP Service để phân tích AI                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  NLP SERVICE (Node.js) - Port 3001                           │
│  - Phân tích sentiment (cảm xúc) của review                  │
│  - Phát hiện review giả mạo (spam)                           │
│  - Trích xuất thông tin từ review                            │
│  - Sử dụng AI model từ Hugging Face                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL) - Port 5432                          │
│  - Lưu trữ dữ liệu vĩnh viễn                                 │
│  - Products (sản phẩm)                                      │
│  - Orders (đơn hàng)                                         │
│  - Users (người dùng)                                        │
│  - Reviews (đánh giá)                                        │
│  - Coupons (mã giảm giá)                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Tại sao chia thành 4 phần như vậy?

**Lý do chia nhỏ hệ thống:**

1. **Mỗi phần làm việc riêng biệt**
   - Frontend chỉ lo UI, không cần quan tâm database
   - Backend chỉ lo logic, không cần quan tâm UI
   - NLP Service chỉ lo AI, không cần quan tâm business logic
   - Database chỉ lo lưu trữ, không cần quan tâm logic

2. **Có thể phát triển song song**
   - Frontend dev và Backend dev có thể work cùng lúc
   - NLP dev có thể update AI model mà không ảnh hưởng phần khác

3. **Dễ dàng mở rộng (scalability)**
   - Frontend có thể deploy trên CDN (Cloudflare)
   - Backend có thể chạy nhiều instance cùng lúc
   - NLP Service có thể scale riêng khi load AI tăng

4. **Nếu một phần lỗi, các phần khác vẫn hoạt động**
   - Nếu NLP Service down, Frontend vẫn hoạt động với fallback mode
   - Nếu Backend down, Frontend có thể cache data và show error UI

### 1.3 Công nghệ sử dụng cho từng phần

| Phần | Công nghệ | Tại sao chọn công nghệ này? |
|------|-----------|----------------------------|
| **Frontend** | React 19 + TypeScript + Vite | - React: Framework UI phổ biến nhất<br>- TypeScript: Type-safety, tránh lỗi runtime<br>- Vite: Build tool cực nhanh |
| **State Management** | Zustand | - Đơn giản hơn Redux 50-70%<br>- Code ngắn gọn, dễ hiểu<br>- Tự động lưu vào localStorage |
| **UI Components** | Tailwind CSS + shadcn/ui | - Tailwind: CSS utility-first, nhanh<br>- shadcn/ui: Components đẹp, sẵn dùng |
| **Routing** | TanStack Router | - Type-safe routing<br>- Auto-loading data<br>- Error boundaries |
| **Backend** | Java 17 + Spring Boot | - Java: Enterprise-grade reliability<br>- Spring Boot: Framework phổ biến, nhiều tính năng<br>- Type-safe, strong typing |
| **Database** | PostgreSQL 16 | - Advanced features (JSON, CTEs)<br>- Better concurrency than MySQL<br>- ACID transactions |
| **NLP Service** | Node.js + Hugging Face | - Node.js: Ecosystem AI/ML phong phú<br>- Hugging Face: State-of-the-art AI models<br>- Không cần train model từ đầu |

---

## PHẦN 2: FRONTEND (REACT/TYPESCRIPT) - CHI TIẾT

### 2.1 Frontend là gì?

Frontend là phần giao diện người dùng mà bạn nhìn trên trình duyệt. Nó chịu trách nhiệm:
- Hiển thị sản phẩm, giỏ hàng, checkout
- Xử lý click, type, scroll của user
- Gọi API để lấy/ghi dữ liệu
- Quản lý state (dữ liệu tạm thời)

### 2.2 Cấu trúc folder Frontend

```
frontend/
├── src/
│   ├── components/          # UI components tái sử dụng
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Header.tsx     # Header component
│   │   ├── Footer.tsx     # Footer component
│   │   └── ...
│   ├── routes/             # Các trang (pages)
│   │   ├── index.tsx      # Trang chủ
│   │   ├── product.$id.tsx # Trang chi tiết sản phẩm
│   │   ├── login.tsx      # Trang đăng nhập
│   │   ├── checkout.tsx    # Trang thanh toán
│   │   └── ...
│   ├── stores/             # State management (Zustand)
│   │   ├── cart-store.ts  # Giỏ hàng
│   │   ├── auth-store.ts  # Đăng nhập
│   │   └── ...
│   ├── lib/                # Utilities
│   │   ├── api-service.ts # Gọi API
│   │   ├── coupon-utils.ts # Tính toán coupon
│   │   └── format.ts      # Format giá, ngày tháng
│   └── main.tsx           # Entry point
└── package.json            # Dependencies
```

### 2.3 State Management với Zustand

**State là gì?**
State là dữ liệu tạm thời của ứng dụng. Ví dụ:
- Giỏ hàng có bao nhiêu sản phẩm?
- User đã đăng nhập chưa?
- Số lượng sản phẩm đang chọn là bao nhiêu?

**Tại sao cần State Management?**
- Để chia sẻ data giữa các components
- Để lưu data khi user navigate giữa các trang
- Để cập nhật UI khi data thay đổi

**Zustand là gì?**
Zustand là một thư viện quản lý state đơn giản hơn Redux. Nó có 3 đặc điểm chính:
1. **Đơn giản**: Không cần reducers, actions, dispatch
2. **Ngắn gọn**: Code ít hơn 50-70% so với Redux
3. **Persist**: Tự động lưu vào localStorage

#### 2.3.1 cart-store.ts - Giỏ hàng

**File:** `frontend/src/stores/cart-store.ts`

**Xương sống của chức năng giỏ hàng:**
1. **State initialization**: Khởi tạo giỏ hàng rỗng
2. **Add item**: Thêm sản phẩm với validation stock
3. **Update quantity**: Cập nhật số lượng với giới hạn stock
4. **Remove item**: Xóa sản phẩm khỏi giỏ
5. **Calculate totals**: Tính tổng tiền và số lượng
6. **Persist**: Tự động lưu vào localStorage

**Lưu trữ:** Data trong `cart-store` được lưu ở 2 nơi:
1. **Memory (Zustand store)**: Tạm thời trong RAM, mất khi reload page
2. **localStorage (Persistent)**: Vĩnh viễn trong browser, giữ sau reload

**Ví dụ code thực tế:**

```typescript
// frontend/src/stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
  };
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartItem['product'], quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          const currentQty = existing?.quantity ?? 0;
          
          // KEY LOGIC: Không cho vượt quá stockQuantity
          const nextQty = Math.min(currentQty + quantity, product.stockQuantity);
          
          if (nextQty === currentQty) return state; // Đã đạt max stock
          
          if (existing) {
            // Sản phẩm đã có trong giỏ → cập nhật số lượng
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: nextQty }
                  : i
              ),
            };
          }
          
          // Sản phẩm mới trong giỏ → thêm mới
          return {
            items: [...state.items, { product, quantity: nextQty }],
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => {
          const item = state.items.find((i) => i.product.id === productId);
          if (!item) return state;
          
          const nextQty = Math.min(quantity, item.product.stockQuantity);
          
          return {
            items: state.items.map((i) =>
              i.product.id === productId
                ? { ...i, quantity: nextQty }
                : i
            ),
          };
        });
      },
      
      clear: () => set({ items: [] }),
      
      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },
      
      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: 'shopcart_cart' } // Key để lưu trong localStorage
  )
);
```

**Giải thích code:**
- `create()`: Tạo Zustand store
- `persist()`: Middleware để tự động lưu vào localStorage
- `addItem()`: Hàm quan trọng nhất - xử lý logic thêm sản phẩm với validation
- `Math.min()`: Đảm bảo không vượt quá stock
- `subtotal()`: Computed property - tính tổng tiền khi cần
- `totalItems()`: Computed property - tính tổng số lượng khi cần

**Quy trình quan trọng:**
1. User click "Add to cart" → Component gọi `addItem()`
2. Zustand check sản phẩm đã có chưa
3. Nếu có → cộng thêm số lượng (có giới hạn stock)
4. Nếu không → thêm mới vào giỏ
5. `persist` middleware tự động lưu vào localStorage
6. UI re-render tự động khi state thay đổi

**Lưu trữ:**
- **Memory (Zustand)**: Tạm thời, mất khi reload
- **localStorage**: Vĩnh viễn, key = "shopcart_cart"
- **Database**: CHƯA lưu, chỉ lưu khi user checkout

#### 2.3.2 auth-store.ts - Đăng nhập

**File:** `frontend/src/stores/auth-store.ts`

**Xương sống của chức năng đăng nhập:**
1. **State initialization**: Khởi tạo user, token rỗng
2. **Login**: Gọi API đăng nhập, lưu token
3. **Logout**: Xóa session data
4. **Authentication check**: Kiểm tra user đã đăng nhập chưa
5. **Authorization check**: Kiểm tra quyền admin
6. **Purge session**: Xóa toàn bộ data khi logout (security critical)
7. **Persist**: Tự động lưu vào localStorage

**Lưu trữ:** Data trong `auth-store` được lưu ở 2 nơi:
1. **Memory (Zustand store)**: Tạm thời
2. **localStorage (Persistent)**: Vĩnh viễn, key = "shopcart_auth"

**Ví dụ code thực tế:**

```typescript
// frontend/src/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  idToken: string | null; // Firebase ID Token cho NLP Service
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  setIdToken: (idToken: string | null) => void;
}

// Security critical: Xóa toàn bộ session data
export function purgeSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shopcart_auth');
    localStorage.removeItem('shopcart_cart');
    sessionStorage.clear();
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      idToken: null,
      
      login: async (email, password) => {
        // KEY SECURITY: Luôn xóa session cũ trước khi login mới
        purgeSession();
        
        // Gọi API đăng nhập
        const response = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        
        const { user, token } = response;
        
        set({ user, token });
      },
      
      logout: () => {
        // Xóa state
        set({ user: null, token: null, idToken: null });
        
        // Xóa localStorage (persist middleware sẽ làm, nhưng thêm để chắc chắn)
        purgeSession();
      },
      
      isAuthenticated: () => {
        return !!get().token;
      },
      
      isAdmin: () => {
        const user = get().user;
        return user?.role === 'ADMIN';
      },
      
      setIdToken: (idToken) => {
        set({ idToken });
      },
    }),
    { name: 'shopcart_auth' }
  )
);
```

**Giải thích code:**
- `purgeSession()`: Hàm security critical - xóa toàn bộ session data
- `login()`: Gọi API và lưu token
- `logout()`: Xóa state và localStorage
- `isAuthenticated()`: Check xem có token không
- `isAdmin()`: Check role của user
- `setIdToken()`: Set Firebase ID Token cho NLP Service

**Quy trình quan trọng:**
1. User nhập email/password → Component gọi `login()`
2. `purgeSession()` xóa data cũ (security)
3. Gọi API `/api/auth/login`
4. Backend trả về `{ user, token }`
5. Zustand lưu vào state
6. `persist` middleware tự động lưu vào localStorage
7. UI re-render với user đã đăng nhập

**Lưu trữ:**
- **Memory (Zustand)**: Tạm thời
- **localStorage**: Vĩnh viễn, key = "shopcart_auth"
- **Database**: Backend lưu user info và JWT token trong database

### 2.4 API Service Layer - Gọi API

**File:** `frontend/src/lib/api-service.ts`

**Xương sống của chức năng gọi API:**
1. **Token management**: Lấy và gán JWT token tự động
2. **Route translation**: Map Frontend paths → Backend paths
3. **Request building**: Xây dựng URL và headers
4. **Error handling**: Parse error messages và throw custom errors
5. **Connection detection**: Detect khi Backend không kết nối

**Chức năng:** Gọi API đến Backend với tự động gán JWT token

**Ví dụ code thực tế:**

```typescript
// frontend/src/lib/api-service.ts

const BASE_URL = 'http://localhost:8081';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Lấy JWT token từ localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const authData = localStorage.getItem('shopcart_auth');
  if (!authData) return null;
  
  try {
    const parsed = JSON.parse(authData);
    return parsed.token || null;
  } catch {
    return null;
  }
}

// Route translation: Frontend paths → Backend paths
function translatePath(path: string, method?: string): string {
  // Ví dụ: POST /api/orders → /api/orders/checkout
  if (path === '/api/orders' && method === 'POST') {
    return '/api/orders/checkout';
  }
  
  // Ví dụ: GET /api/orders → /api/orders/me
  if (path === '/api/orders' && method === 'GET') {
    return '/api/orders/me';
  }
  
  return path;
}

// Hàm gọi API chính
export async function apiFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const method = init?.method || 'GET';
  const backendPath = translatePath(path, method);
  const url = `${BASE_URL}${backendPath}`;
  
  // Xây dựng headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // KEY LOGIC: Tự động gán JWT token
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  };
  
  try {
    const response = await fetch(url, options);
    
    // Error handling
    if (!response.ok) {
      let errorMessage = 'Đã xảy ra lỗi hệ thống từ máy chủ.';
      
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.message ||
          errorData.error ||
          (await response.text()) ||
          errorMessage;
      } catch (e) {
        errorMessage = (await response.text()) || errorMessage;
      }
      
      throw new ApiError(response.status, errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Connection error detection
    throw new ApiError(
      500,
      'Không thể kết nối đến máy chủ 8081. Hãy kiểm tra xem Backend đã chạy chưa.'
    );
  }
}
```

**Giải thích code:**
- `getToken()`: Lấy JWT token từ localStorage
- `translatePath()`: Map Frontend paths → Backend paths (ví dụ: `/api/orders` POST → `/api/orders/checkout`)
- `apiFetch()`: Hàm chính - xây dựng request, gán token, handle errors
- `ApiError`: Custom error class với status code
- `Authorization` header: Tự động gán JWT token nếu có

**Quy trình quan trọng:**
1. Component gọi `apiFetch('/api/products')`
2. `getToken()` đọc token từ localStorage
3. `translatePath()` map path (nếu cần)
4. Xây dựng headers với `Authorization: Bearer {token}`
5. Gọi `fetch(url, options)`
6. Backend xử lý và trả về response
7. Parse JSON hoặc throw error
8. Return data cho Component

**Lưu trữ:**
- **Input**: Token đọc từ localStorage
- **Output**: Data trả về cho Component (không lưu trong api-service)
- **Temporary**: Data chỉ tồn tại trong function scope, sau đó return

### 2.5 Route Components - Các trang

#### 2.5.1 product.$id.tsx - Trang chi tiết sản phẩm

**File:** `frontend/src/routes/product.$id.tsx`

**Chức năng:** Hiển thị chi tiết sản phẩm, reviews, và cho phép thêm vào giỏ

**Lưu trữ:**
- **useState**: Tạm thời trong component memory, mất khi unmount
- **Zustand stores**: Persistent trong localStorage

**Luồng chảy thông tin khi user navigate đến trang sản phẩm:**

```
User click vào sản phẩm
    ↓
TanStack Router navigate đến /product/1
    ↓
ProductPage component mounts
    ↓
useEffect chạy
    ↓
apiFetch("/api/products/1") được gọi
    ↓
api-service.ts gán JWT token vào header
    ↓
HTTP GET request đến Backend: http://localhost:8081/api/products/1
    ↓
Backend query PostgreSQL: SELECT * FROM products WHERE id = 1
    ↓
Backend trả về Product JSON
    ↓
Frontend nhận response và setProduct()
    ↓
React re-render với product data
    ↓
UI hiển thị product details
```

**Lưu trữ:**
- **useState (product, reviews, error, qty)**: Tạm thời trong component memory
- **Zustand stores**: Persistent trong localStorage
- **Database**: Backend lưu trong PostgreSQL

---

## PHẦN 3: BACKEND (JAVA/SPRING BOOT) - CHI TIẾT

### 3.1 Backend là gì?

Backend là phần server-side xử lý logic nghiệp vụ. Nó chịu trách nhiệm:
- Cung cấp REST API cho Frontend
- Xử lý logic nghiệp vụ (checkout, validation, v.v.)
- Lưu trữ và truy xuất dữ liệu từ Database
- Gọi NLP Service để phân tích AI
- Authentication và Authorization

### 3.2 Cấu trúc folder Backend

```
backend/
├── src/main/java/com/shopcart/backend/
│   ├── controller/          # REST API endpoints
│   │   ├── ProductController.java  # API sản phẩm
│   │   ├── OrderController.java    # API đơn hàng
│   │   ├── ReviewController.java   # API review
│   │   └── AuthController.java     # API đăng nhập
│   ├── service/             # Business logic
│   │   ├── ProductService.java
│   │   ├── OrderService.java
│   │   ├── ReviewService.java
│   │   ├── NlpService.java         # Gọi NLP Service
│   │   └── AuthService.java
│   ├── repository/          # Data access (JPA)
│   │   ├── ProductRepository.java
│   │   ├── OrderRepository.java
│   │   └── ReviewRepository.java
│   ├── model/               # Database entities
│   │   ├── Product.java
│   │   ├── Order.java
│   │   ├── Review.java
│   │   └── User.java
│   └── config/              # Configuration
│       ├── SecurityConfig.java
│       └── CorsConfig.java
└── src/main/resources/
    ├── application.properties  # Configuration
    └── data.sql               # Seed data
```

### 3.3 Layered Architecture

Backend sử dụng **Layered Architecture** - chia code thành các layer:

```
┌─────────────────────────────────────────┐
│  Controller Layer (REST API Endpoints)   │
│  - Nhận HTTP requests từ Frontend       │
│  - Validate input                       │
│  - Gọi Service layer                    │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Service Layer (Business Logic)         │
│  - Xử lý logic nghiệp vụ                 │
│  - Gọi Repository layer                 │
│  - Gọi NLP Service (nếu cần)            │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Repository Layer (Data Access)         │
│  - Truy xuất dữ liệu từ Database         │
│  - JPA/Hibernate ORM                     │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Database (PostgreSQL)                  │
│  - Lưu trữ dữ liệu vĩnh viễn            │
└─────────────────────────────────────────┘
```

**Tại sao chia thành layers?**
- **Separation of Concerns**: Mỗi layer có trách nhiệm riêng
- **Reusability**: Service có thể dùng bởi nhiều controllers
- **Testability**: Có thể test từng layer riêng
- **Maintainability**: Dễ dàng maintain và update

### 3.4 Product Module - Sản phẩm

#### 3.4.1 ProductController.java - API Endpoints

**File:** `backend/src/main/java/com/shopcart/backend/controller/ProductController.java`

**Xương sống của chức năng Product API:**
1. **Request routing**: Nhận HTTP requests từ Frontend
2. **Input validation**: Validate input parameters
3. **Service delegation**: Gọi ProductService để xử lý logic
4. **Response building**: Xây dựng HTTP response với status code
5. **Error handling**: Handle errors và trả về appropriate status codes

**Chức năng:** Cung cấp REST API cho sản phẩm

**Ví dụ code thực tế:**

```java
// backend/src/main/java/com/shopcart/backend/controller/ProductController.java

package com.shopcart.backend.controller;

import com.shopcart.backend.model.Product;
import com.shopcart.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // GET /api/products - Lấy tất cả sản phẩm
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products); // HTTP 200 OK
    }

    // GET /api/products/{id} - Lấy sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok) // Nếu tìm thấy → HTTP 200 OK
                .orElse(ResponseEntity.notFound().build()); // Nếu không tìm thấy → HTTP 404
    }

    // PATCH /api/products/{id}/stock - Cập nhật stock
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity
    ) {
        Product updatedProduct = productService.updateStock(id, quantity);
        return ResponseEntity.ok(updatedProduct);
    }
}
```

**Giải thích code:**
- `@RestController`: Annotation đánh dấu class là REST controller
- `@RequestMapping("/api/products")`: Base URL cho tất cả endpoints
- `@Autowired`: Inject ProductService (dependency injection)
- `@GetMapping`: HTTP GET method
- `@PostMapping`: HTTP POST method
- `@PatchMapping`: HTTP PATCH method
- `@PathVariable`: Extract path variable (ví dụ: `/products/1` → id = 1)
- `@RequestParam`: Extract query parameter (ví dụ: `/products/1/stock?quantity=5`)
- `ResponseEntity`: Spring class để xây dựng HTTP response với status code
- `ResponseEntity.ok()`: HTTP 200 OK
- `ResponseEntity.notFound()`: HTTP 404 Not Found

**Quy trình quan trọng:**
1. Frontend gửi HTTP GET request đến `/api/products`
2. Spring Boot routing request đến `ProductController.getAllProducts()`
3. Controller gọi `productService.getAllProducts()`
4. Service gọi Repository để query database
5. Repository trả về List<Product>
6. Controller xây dựng ResponseEntity với HTTP 200 OK
7. Spring Boot convert sang JSON
8. Frontend nhận JSON response

**Lưu trữ:**
- **Input**: Không có (đọc từ Database)
- **Output**: List<Product> (temporary trong memory)
- **Database**: PostgreSQL lưu products table

#### 3.4.2 Product.java - Database Entity

**File:** `backend/src/main/java/com/shopcart/backend/model/Product.java`

**Chức năng:** JPA entity map sang database table

**Fields:**
- `id`: Primary key (auto-increment)
- `name`: Tên sản phẩm
- `description`: Mô tả
- `price`: Giá
- `imageUrl`: URL ảnh
- `stockQuantity`: Số lượng tồn kho
- `category`: Danh mục

**Lưu trữ:**
- **Memory**: Product object tồn tại trong RAM khi được query từ database
- **Database**: PostgreSQL lưu trong products table
- **Persistent**: Vĩnh viễn trong database

### 3.5 Order Module - Đơn hàng (ACID Transaction)

#### 3.5.1 OrderService.java - Business Logic

**File:** `backend/src/main/java/com/shopcart/backend/service/OrderService.java`

**Xương sống của chức năng xử lý đơn hàng (CRITICAL):**
1. **Transaction management**: @Transactional đảm bảo ACID properties
2. **Coupon validation**: Validate và tính discount
3. **Stock validation**: Kiểm tra stock trước khi trừ
4. **Row-level locking**: findByIdForUpdate khóa product row
5. **Stock deduction**: Trừ stock sau khi validate
6. **Order creation**: Tạo Order và OrderItem entities
7. **Snapshot preservation**: Lưu snapshot product tại thời điểm mua

**Chức năng:** Xử lý đơn hàng với ACID transaction

**Ví dụ code thực tế:**

```java
// backend/src/main/java/com/shopcart/backend/service/OrderService.java

package com.shopcart.backend.service;

import com.shopcart.backend.model.*;
import com.shopcart.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    // KEY ANNOTATION: Đảm bảo toàn bộ method chạy trong 1 ACID transaction
    @Transactional
    public Order createOrder(OrderRequest request, Long userId) {
        // STEP 1: Xử lý mã giảm giá
        Double discountAmount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCodeAndActiveTrue(request.getCouponCode())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));
            
            // Validate expiry date
            if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Mã giảm giá đã hết hạn");
            }
            
            // Tính discount
            if ("PERCENT".equals(coupon.getType())) {
                discountAmount = request.getSubtotal() * (coupon.getValue() / 100);
            } else if ("FIXED".equals(coupon.getType())) {
                discountAmount = coupon.getValue();
            }
        }
        
        // STEP 2: Tạo Order object
        Order order = Order.builder()
                .userId(userId)
                .subtotal(request.getSubtotal())
                .discount(discountAmount)
                .shippingFee(request.getShippingFee())
                .total(request.getSubtotal() - discountAmount + request.getShippingFee())
                .shipping(request.getShipping())
                .status("pending")
                .build();
        
        // STEP 3: Xử lý từng món hàng và trừ tồn kho
        List<OrderItem> orderItems = request.getCartItems().stream().map(itemDto -> {
            // KEY LOGIC: findByIdForUpdate để KHÓA sản phẩm (Row-Level Lock)
            // Điều này ngăn 2 user cùng mua sản phẩm cuối cùng cùng lúc
            Product product = productRepository.findByIdForUpdate(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            
            // Kiểm tra tồn kho
            if (product.getStockQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getName() + " hiện không đủ hàng!");
            }
            
            // Trừ kho
            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
            productRepository.save(product);
            
            // Lưu snapshot của product tại thời điểm mua
            // Điều này đảm bảo order history chính xác ngay cả khi sản phẩm sau đó đổi tên/giá
            return OrderItem.builder()
                    .productId(product.getId())
                    .name(product.getName())        // Snapshot
                    .price(product.getPrice())        // Snapshot
                    .quantity(itemDto.getQuantity())
                    .imageUrl(product.getImageUrl())  // Snapshot
                    .order(order)
                    .build();
        }).collect(Collectors.toList());
        
        order.setItems(orderItems);
        
        // STEP 4: Lưu order vào database
        // CascadeType.ALL sẽ tự động lưu orderItems
        return orderRepository.save(order);
        
        // Nếu bất kỳ step nào throw exception → toàn bộ transaction rollback
        // Điều này đảm bảo không có partial order (stock trừ nhưng order không save)
    }
}
```

**Giải thích code:**
- `@Service`: Annotation đánh dấu class là Spring service
- `@Transactional`: **CRITICAL** - Đảm bảo toàn bộ method chạy trong 1 ACID transaction
  - Nếu bất kỳ step fail → toàn bộ transaction rollback
  - Tránh partial order (stock trừ nhưng order không save)
- `findByIdForUpdate()`: **CRITICAL** - Row-Level Lock
  - Khóa product row trong database khi đọc
  - Tránh race condition khi 2 user cùng mua sản phẩm cuối cùng
- `@Builder`: Lombok annotation để build object theo pattern
- `CascadeType.ALL`: JPA cascade - tự động lưu orderItems khi lưu order

**Quy trình quan trọng (Checkout Flow):**
1. Frontend gửi POST request với cart items
2. OrderService.createOrder() được gọi với @Transactional
3. Validate coupon (nếu có)
4. Tính discountAmount
5. Tạo Order object (chưa lưu vào database)
6. FOR EACH cart item:
   - `findByIdForUpdate()` khóa product row
   - Check stockQuantity
   - Nếu không đủ → throw exception → transaction rollback
   - Nếu đủ → trừ stock và save product
   - Tạo OrderItem với snapshot product data
7. Lưu Order vào database
8. CascadeType.ALL tự động lưu OrderItems
9. Transaction commit
10. Trả về Order object cho Frontend

**Tính năng quan trọng:**

- `@Transactional`: Đảm bảo toàn bộ method chạy trong 1 transaction
  - Nếu bất kỳ step fail, toàn bộ transaction rollback
  - Tránh partial order (stock trừ nhưng order không save)

- `findByIdForUpdate`: Row-Level Lock
  - Khóa product row trong database khi đọc
  - Tránh race condition khi 2 user cùng mua sản phẩm cuối cùng

- Stock validation before deduction
  - Check trước khi trừ để fail fast

- OrderItem snapshot
  - Lưu snapshot của product tại thời điểm mua (name, price, imageUrl)
  - Nếu sản phẩm sau đó đổi tên/giá, order history vẫn chính xác

**Lưu trữ:** OrderService không lưu data, chỉ xử lý logic.

### 3.6 Review Module - AI Integration

#### 3.6.1 ReviewController.java

**Chức năng:** REST API cho review

**Endpoints:**
- `POST /api/reviews`: Tạo review mới

**Lưu trữ:**
- **Input**: ReviewRequest (productId, rating, content, userId)
- **Output**: Review object (với AI analysis)
- **Database**: PostgreSQL insert reviews table

#### 3.6.2 ReviewService.java - AI Integration

**Chức năng:** Xử lý review với AI analysis

**Luồng chảy thông tin cho AI analysis:**

```
nlpService.analyzeSentimentWithUserRating(content, rating) được gọi
    ↓
NlpService xây dựng WebClient
    ↓
WebClient gửi HTTP POST request đến NLP Service: http://localhost:3001/analyze
    ↓
Body: { reviewText: content }
    ↓
NLP Service nhận request
    ↓
NLP Service phân tích sentiment (Hugging Face hoặc demo mode)
    ↓
NLP Service trả về JSON response
    ↓
Backend nhận response
    ↓
Backend parse JSON với Vietnamese accuracy check
    ↓
Nếu user rating vs AI sentiment discrepancy ≥ 3 stars → Apply correction
    ↓
Map AI result vào Review entity
    ↓
Review object được update với AI data (trong memory)
```

**Lưu trữ:**
- **Input**: content (String), rating (Integer)
- **Output**: NlpResponse object (temporary trong memory)
- **NLP Service**: NLP Service không lưu, chỉ process và return
- **Memory**: Review object (temporary trong memory)

---

## PHẦN 4: NLP SERVICE (NODE.JS) - CHI TIẾT

### 4.1 NLP Service là gì?

NLP Service là microservice chuyên trách phân tích AI:
- Phân tích sentiment (cảm xúc) của review
- Phát hiện review giả mạo (spam)
- Trích xuất thông tin từ review (aspects, emotions, v.v.)
- Sử dụng AI model từ Hugging Face

### 4.2 Cấu trúc folder NLP Service

```
nlp-service/
├── index.ts              # Express server entry point
├── sentiment-analyzer.ts  # Core AI logic
└── package.json          # Dependencies
```

### 4.3 Express Server - API Endpoints

**File:** `nlp-service/index.ts`

**Chức năng:** Express server cung cấp API endpoints

**Endpoints:**
- `POST /analyze`: Phân tích sentiment của review
- `GET /health`: Health check

**Luồng chảy thông tin:**

```
Backend gọi POST http://localhost:3001/analyze với body: { reviewText: "..." }
    ↓
Express server nhận request
    ↓
express.json() middleware parse body
    ↓
/analyze endpoint handler được gọi
    ↓
Extract reviewText từ req.body
    ↓
Validate reviewText không null
    ↓
analyzeSentiment(reviewText) được gọi
    ↓
Hugging Face API hoặc demo mode
    ↓
Trả về sentiment analysis result
    ↓
res.json(result) gửi response
    ↓
Backend nhận JSON response
```

**Lưu trữ:**
- **Input**: reviewText (String) - từ request body
- **Output**: sentiment analysis result (JSON)
- **Temporary**: Không lưu, chỉ process và return
- **Hugging Face**: External service, không lưu

### 4.4 Sentiment Analyzer - AI Logic

**File:** `nlp-service/sentiment-analyzer.ts`

**Xương sống của chức năng phân tích AI:**
1. **API key validation**: Check có Hugging Face API key hợp lệ không
2. **Model selection**: Thử 3 model đa ngôn ngữ khác nhau
3. **Retry mechanism**: Nếu model fail → thử model khác
4. **Fallback mode**: Nếu tất cả fail → dùng demo mode
5. **Keyword analysis**: Demo mode dùng Vietnamese keywords
6. **Sentiment calculation**: Tính sentiment, rating, emotion, priority
7. **Response formatting**: Trả về structured JSON response

**Chức năng:** Phân tích sentiment với Hugging Face AI hoặc demo mode

**Ví dụ code thực tế:**

```typescript
// nlp-service/sentiment-analyzer.ts

import { HfInference } from '@huggingface/inference';

interface SentimentAnalysis {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  rating_score: number; // 1-5
  is_fake_review: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  primary_emotion: 'Anger' | 'Disappointment' | 'Joy' | 'Satisfaction' | 'Neutral';
  justification: string;
}

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Check nếu có API key hợp lệ
const hasValidApiKey = process.env.HUGGINGFACE_API_KEY &&
  !process.env.HUGGINGFACE_API_KEY.includes('please_replace') &&
  process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_api_key_here' &&
  process.env.HUGGINGFACE_API_KEY.length > 10;

export async function analyzeSentiment(review: string): Promise<SentimentAnalysis> {
  if (!hasValidApiKey) {
    // Fallback DEMO MODE
    return analyzeWithDemoMode(review);
  }

  // API MODE: Thử 3 model đa ngôn ngữ khác nhau
  const models = [
    'nlptown/bert-base-multilingual-uncased-sentiment',
    'cardiffnlp/twitter-xlm-roberta-base-sentiment',
    'distilbert-base-multilingual-cased'
  ];

  for (let attempt = 0; attempt < models.length; attempt++) {
    const currentModel = models[attempt];
    try {
      const response = await hf.textClassification({
        model: currentModel,
        inputs: review
      });

      // Parse response và return
      return parseHuggingFaceResponse(response);
    } catch (error) {
      if (attempt < models.length - 1) {
        // Đợi 1 giây trước khi thử model tiếp theo
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Tất cả model fail → fallback demo mode
        return analyzeWithDemoMode(review);
      }
    }
  }

  // Should never reach here, but TypeScript cần return
  return analyzeWithDemoMode(review);
}

// DEMO MODE: Keyword-based analysis với Vietnamese keywords
function analyzeWithDemoMode(review: string): SentimentAnalysis {
  const lowerReview = review.toLowerCase();

  // Vietnamese positive keywords
  const positiveKeywords = ['tốt', 'hay', 'nhanh', 'sắc nét', 'hài lòng', 'tuyệt vời', 'ổn'];
  const veryPositiveKeywords = ['rất tốt', 'tuyệt vời', 'hoàn hảo', 'xuất sắc'];

  // Vietnamese negative keywords
  const negativeKeywords = ['kém', 'chậm', 'hỏng', 'tệ', 'thất vọng', 'dở'];
  const veryNegativeKeywords = ['rất tệ', 'khủng khiếp', 'tức giận', 'scam'];

  // Count keywords
  const positiveCount = positiveKeywords.filter(kw => lowerReview.includes(kw)).length;
  const negativeCount = negativeKeywords.filter(kw => lowerReview.includes(kw)).length;

  // Determine sentiment
  let sentiment: 'Positive' | 'Negative' | 'Neutral';
  let rating_score: number;
  let primary_emotion: SentimentAnalysis['primary_emotion'];
  let priority: SentimentAnalysis['priority'];

  if (veryPositiveKeywords.some(kw => lowerReview.includes(kw))) {
    sentiment = 'Positive';
    rating_score = 5;
    primary_emotion = 'Joy';
    priority = 'LOW';
  } else if (veryNegativeKeywords.some(kw => lowerReview.includes(kw))) {
    sentiment = 'Negative';
    rating_score = 1;
    primary_emotion = lowerReview.includes('tức giận') ? 'Anger' : 'Disappointment';
    priority = 'HIGH';
  } else if (positiveCount > negativeCount) {
    sentiment = 'Positive';
    rating_score = positiveCount >= 2 ? 4 : 3;
    primary_emotion = 'Satisfaction';
    priority = 'MEDIUM';
  } else if (negativeCount > positiveCount) {
    sentiment = 'Negative';
    rating_score = negativeCount >= 2 ? 2 : 3;
    primary_emotion = 'Disappointment';
    priority = 'MEDIUM';
  } else {
    sentiment = 'Neutral';
    rating_score = 3;
    primary_emotion = 'Neutral';
    priority = 'LOW';
  }

  return {
    sentiment,
    rating_score,
    is_fake_review: false,
    priority,
    primary_emotion,
    justification: `Phân tích dựa trên ${positiveCount} positive keywords và ${negativeCount} negative keywords`
  };
}

function parseHuggingFaceResponse(response: any): SentimentAnalysis {
  // Parse response từ Hugging Face API
  // ... implementation details
  return {
    sentiment: 'Positive',
    rating_score: 5,
    is_fake_review: false,
    priority: 'LOW',
    primary_emotion: 'Joy',
    justification: 'AI analysis from Hugging Face'
  };
}
```

**Giải thích code:**
- `HfInference`: Hugging Face SDK để gọi AI models
- `hasValidApiKey`: Check API key có hợp lệ không
- `analyzeSentiment()`: Hàm chính - thử API mode trước, fallback demo mode
- `models`: Array 3 model đa ngôn ngữ để thử lần lượt
- `analyzeWithDemoMode()`: Fallback khi không có API key hoặc tất cả models fail
- Vietnamese keywords: Keywords đặc thù cho tiếng Việt
- `setTimeout()`: Đợi 1 giây giữa các retry để tránh rate limiting

**Quy trình quan trọng:**
1. Backend gọi POST `/analyze` với review text
2. NLP Service check `hasValidApiKey`
3. Nếu có API key → thử 3 models lần lượt
4. Nếu model fail → đợi 1 giây → thử model tiếp theo
5. Nếu tất cả fail → fallback demo mode
6. Demo mode phân tích với Vietnamese keywords
7. Trả về structured JSON response
8. Backend nhận và parse response

**Chế độ hoạt động:**

1. **API MODE**: Nếu có Hugging Face API key hợp lệ
   - Thử 3 model đa ngôn ngữ khác nhau
   - Nếu tất cả fail → fallback demo mode

2. **DEMO MODE**: Nếu không có API key
   - Keyword-based analysis với Vietnamese keywords
   - Count positive/negative keywords
   - Determine sentiment, rating, emotion, priority

**Lưu trữ:**
- **Input**: review (String)
- **Output**: SentimentAnalysis object
- **Hugging Face**: External API, không lưu
- **Temporary**: response object (trong function scope)

---

## PHẦN 5: DATABASE (POSTGRESQL) - CHI TIẾT

### 5.1 Database là gì?

Database là nơi lưu trữ dữ liệu vĩnh viễn. Trong hệ thống này, chúng ta dùng PostgreSQL - một relational database mạnh mẽ.

### 5.2 Các bảng (Tables) chính

```
┌─────────────────────────────────────────────────────────────┐
│ products                                                     │
│ - id (PK, AUTO_INCREMENT)                                   │
│ - name (VARCHAR, NOT NULL)                                   │
│ - description (VARCHAR(1000))                                │
│ - price (DOUBLE, NOT NULL)                                   │
│ - image_url (VARCHAR)                                        │
│ - stock_quantity (INTEGER, NOT NULL)                         │
│ - category (VARCHAR)                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ users                                                        │
│ - id (PK, AUTO_INCREMENT)                                   │
│ - email (VARCHAR, UNIQUE, NOT NULL)                          │
│ - password (VARCHAR, NOT NULL)                               │
│ - role (VARCHAR: 'USER' or 'ADMIN')                          │
│ - created_at (TIMESTAMP)                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ orders                                                       │
│ - id (PK, AUTO_INCREMENT)                                   │
│ - user_id (FK → users.id)                                   │
│ - subtotal (DOUBLE, NOT NULL)                               │
│ - discount (DOUBLE)                                          │
│ - shipping_fee (DOUBLE, NOT NULL)                            │
│ - total (DOUBLE, NOT NULL)                                  │
│ - status (VARCHAR: 'pending', 'paid', 'shipped', 'delivered')│
│ - created_at (TIMESTAMP)                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ order_items                                                   │
│ - id (PK, AUTO_INCREMENT)                                   │
│ - order_id (FK → orders.id)                                 │
│ - product_id (FK → products.id)                              │
│ - name (VARCHAR) - Snapshot                                  │
│ - price (DOUBLE) - Snapshot                                  │
│ - quantity (INTEGER)                                         │
│ - image_url (VARCHAR) - Snapshot                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ reviews                                                      │
│ - id (PK, AUTO_INCREMENT)                                   │
│ - user_id (FK → users.id)                                   │
│ - product_id (FK → products.id)                             │
│ - content (VARCHAR(1000), NOT NULL)                          │
│ - rating (INTEGER, NOT NULL)                                 │
│ - sentiment (VARCHAR) - AI analysis                          │
│ - is_fake (BOOLEAN) - AI analysis                            │
│ - priority (VARCHAR) - AI analysis                           │
│ - helpfulness_score (INTEGER) - AI analysis                  │
│ - ai_sentiment (VARCHAR) - AI analysis                      │
│ - ai_rating (INTEGER) - AI analysis                          │
│ - ai_priority (VARCHAR) - AI analysis                        │
│ - ai_primary_emotion (VARCHAR) - AI analysis                 │
│ - created_at (TIMESTAMP)                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ coupons                                                      │
│ - id (PK, AUTO_INCREMENT)                                   │
│ - code (VARCHAR, UNIQUE, NOT NULL)                          │
│ - type (VARCHAR: 'PERCENT' or 'FIXED')                       │
│ - value (DOUBLE, NOT NULL)                                   │
│ - expiry_date (TIMESTAMP)                                    │
│ - active (BOOLEAN, NOT NULL)                                 │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Tại sao dùng PostgreSQL?

1. **ACID Transactions**: Đảm bảo data consistency
2. **Foreign Keys**: Enforce referential integrity
3. **JSON Support**: Có thể lưu JSON data
4. **CTEs (Common Table Expressions)**: Complex queries dễ dàng
5. **Better Concurrency**: MVCC (Multi-Version Concurrency Control)

### 5.4 Data Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ DATA LIFECYCLE                                               │
└─────────────────────────────────────────────────────────────┘

1. TEMPORARY (Frontend - Component State)
   - useState, variables trong function
   - Mất khi component unmount
   - Ví dụ: qty, error, loading state

2. PERSISTENT (Frontend - Zustand + localStorage)
   - cart-store: Giỏ hàng
   - auth-store: User session
   - Mất khi user clear browser data

3. PERSISTENT (Backend - Memory)
   - Product object khi query từ database
   - Order object khi đang xử lý
   - Mất khi request kết thúc

4. PERSISTENT (Database - PostgreSQL)
   - Products, Orders, Users, Reviews, Coupons
   - Vĩnh viễn (trừ khi bị delete)
   - Backup và restore
```

---

## PHẦN 6: TỔNG KẾT

### 6.1 Key Takeaways

1. **Microservices Architecture**
   - Frontend, Backend, NLP Service tách biệt
   - Mỗi service có trách nhiệm riêng
   - Có thể scale và deploy riêng

2. **State Management**
   - **Zustand**: Global state với localStorage persistence
   - **useState**: Component state (temporary)
   - **Database**: Persistent storage

3. **Data Flow**
   - Frontend → Backend → Database (đối với CRUD operations)
   - Frontend → Backend → NLP Service → Backend → Database (đối với AI features)
   - Luồng chảy rõ ràng, dễ debug

4. **Lưu trữ Data**
   - **Temporary**: useState, function variables, backend memory objects
   - **Persistent**: localStorage (Frontend), PostgreSQL (Database)
   - **External**: Hugging Face API (không lưu)

5. **Error Handling**
   - Frontend: Error boundaries, try-catch, user-friendly messages
   - Backend: @Transactional rollback, GlobalExceptionHandler
   - NLP Service: Fallback demo mode, retry mechanism

### 6.2 File Mapping Summary

| File | Chức Năng | Lưu Trữ | Data Flow |
|------|-----------|---------|-----------|
| `frontend/src/stores/cart-store.ts` | Giỏ hàng state | Zustand (memory) + localStorage (persistent) | Component → Store → localStorage |
| `frontend/src/stores/auth-store.ts` | Auth state | Zustand (memory) + localStorage (persistent) | Component → Store → localStorage |
| `frontend/src/lib/api-service.ts` | API calls | Không lưu (function) | Component → API Service → Backend |
| `frontend/src/routes/product.$id.tsx` | Product page | useState (temporary) | API → Component → UI |
| `backend/src/main/java/com/shopcart/backend/controller/ProductController.java` | Product API | Không lưu (routing) | Frontend → Controller → Service |
| `backend/src/main/java/com/shopcart/backend/service/ProductService.java` | Product logic | Không lưu (temporary objects) | Controller → Service → Repository |
| `backend/src/main/java/com/shopcart/backend/service/OrderService.java` | Order logic (@Transactional) | Không lưu (temporary objects) | Controller → Service → Repository → Database |
| `backend/src/main/java/com/shopcart/backend/service/NlpService.java` | NLP integration | Không lưu (temporary objects) | Service → NLP Service → Backend |
| `nlp-service/index.ts` | Express server | Không lưu (routing) | Backend → NLP Service → Hugging Face |
| `nlp-service/sentiment-analyzer.ts` | AI logic | Không lưu (temporary) | NLP Service → Hugging Face → NLP Service |
| PostgreSQL Database | Persistent storage | Vĩnh viễn | Backend → Database |

### 7.3 Architecture Benefits

1. **Scalability**: Mỗi service có thể scale riêng
2. **Reliability**: Fallback mechanisms (demo mode, error boundaries)
3. **Maintainability**: Layered architecture, separation of concerns
4. **User Experience**: Instant feedback, clear errors, smooth interactions
5. **Security**: JWT authentication, verified purchase checks, row-level locking

Đây là foundation vững chắc để xây dựng e-commerce platform với AI-powered features.
