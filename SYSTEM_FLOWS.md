# Toàn Bộ Data Flow của Hệ Thống ShopCart

## Tóm tắt

Tài liệu này mô tả toàn bộ data flow của từng chức năng trong hệ thống ShopCart, từ frontend (React + Vite) đến backend (Spring Boot).

---

## Phần 1: Kiến Trúc Tổng Quan

### Architecture Diagram

```
Frontend (React) → Stores (Zustand) → API Service → Backend (Spring Boot) → Database
```

### Mapping Table

| Component | Store | API Endpoint | Backend Controller |
|-----------|-------|--------------|-------------------|
| LoginPage | auth-store | POST /api/auth/login | AuthController |
| RegisterPage | auth-store | POST /api/auth/register | AuthController |
| ShopPage | cart-store | GET /api/products | ProductController |
| ProductDetail | cart-store | GET /api/products/:id | ProductController |
| CartPage | cart-store | - | - |
| CheckoutPage | cart-store, auth-store | POST /api/orders/checkout | OrderController |
| OrdersPage | auth-store | GET /api/orders/me | OrderController |
| AdminDashboard | auth-store | GET /api/admin/revenue | AdminController |
| AdminOrders | auth-store | GET /api/admin/orders | AdminController |
| AdminAnalytics | auth-store | GET /api/admin/reviews | AdminController |

---

## Phần 2: Flow Chi Tiết Từng Chức Năng

### 2.1 Login Flow

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

---

### 2.2 Register Flow

```
User nhập name, email, password
    ↓
RegisterPage Component (routes/register.tsx)
    - submit() function
    - await register(name, email, password)
    ↓
auth-store
    - purgeSession()
    - apiFetch('/api/auth/register', { method: 'POST', body: { name, email, password } })
    ↓
Backend
    - Validate input
    - Check nếu email đã tồn tại
    - Tạo user mới
    - Return { user } (không có token)
    ↓
Frontend
    - set({ user, token: null })
    - toast.success("Account created")
    - navigate({ to: "/" })
    - User cần login lại
```

---

### 2.3 Logout Flow

```
User click "Sign out"
    ↓
Header Component
    - onClick={() => { logout(); navigate({ to: "/" }); }}
    ↓
auth-store
    - set({ user: null, token: null, idToken: null })
    - purgeSession()
        - useCartStore.getState().clear()
        - localStorage.removeItem('shopcart_auth')
        - localStorage.removeItem('shopcart_cart')
        - sessionStorage.clear()
    ↓
Header Component Re-render
    - isAuthenticated() = false
    - Show login button, hide user avatar
```

---

### 2.4 Product Browsing Flow

```
User truy cập / (ShopPage)
    ↓
ShopPage Component (routes/index.tsx)
    - useEffect → apiFetch('/api/products')
    - Loading: show skeleton
    ↓
Backend
    - GET /api/products
    - Query database: SELECT * FROM products
    - Return array of Product objects
    ↓
Frontend
    - setProducts(products)
    - Render product cards:
        * Image, name, price, description
        * Stock badge (sold out/only X left/in stock)
        * Add to cart button
    ↓
User click "Add to cart"
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

---

### 2.5 Product Detail Flow

```
User truy cập /product/:id
    ↓
ProductDetailPage (routes/product.$id.tsx)
    - useParams() → get id
    - useEffect → 3 API calls:
        * apiFetch(`/api/products/${id}`)
        * apiFetch(`/api/products/${id}/reviews`)
        * apiFetch('/api/orders') (nếu có token)
    ↓
Backend
    - GET /api/products/:id → return product
    - GET /api/products/:id/reviews → return reviews
    - GET /api/orders/me → return user orders
    ↓
Frontend
    - Render product detail
    - Check verified purchase:
        * eligibleOrder = orders.find(o => 
            ['PAID','SHIPPED','DELIVERED'].includes(o.status) 
            && o.items.some(it => it.productId === product.id))
    - Nếu verified → "Write a review" button enabled
    ↓
User select quantity + click "Add to cart"
    - handleAdd()
    - addItem(product, quantity)
    ↓
cart-store
    - Update state + persist
```

---

### 2.6 Cart Management Flow

```
User truy cập /cart
    ↓
CartPage Component (routes/cart.tsx)
    - items = useCartStore(s => s.items)
    - subtotal = useCartStore(s => s.subtotal())
    - updateQuantity = useCartStore(s => s.updateQuantity)
    - removeItem = useCartStore(s => s.removeItem)
    ↓
Render cart items
    - Product image, name, price each
    - Quantity controls: [-] [qty] [+]
    - Total price: price * quantity
    - Trash button
    ↓
User click [-] or [+]
    - updateQuantity(productId, newQuantity)
        * If quantity <= 0 → remove item
        * Else → update with Math.min(quantity, stock)
    ↓
User click Trash
    - removeItem(productId)
        * Filter items array
    ↓
cart-store
    - Update state + persist
    ↓
Header Component Re-render
    - Cart badge update
```

---

### 2.7 Checkout Flow

```
User click "Proceed to checkout"
    ↓
CheckoutPage (routes/checkout.tsx)
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
    - Mock validation (production sẽ gọi backend)
    - setCoupon(c)
    - Calculate discount
        * PERCENT: subtotal * (value/100)
        * FIXED: value
    - Update total = subtotal - discount + shippingFee (50k)
    ↓
User click "Pay with Sandbox"
    - handlePay()
    - Validate: cart not empty, shipping complete
    - apiFetch('/api/orders', {
        method: 'POST',
        body: {
          cartItems: items.map(i => ({ productId, quantity })),
          shipping, subtotal, discount, shippingFee, total, couponCode
        }
      })
    ↓
api-service
    - Translate: POST /api/orders → POST /api/orders/checkout
    - Add Authorization header
    - fetch('http://localhost:8081/api/orders/checkout')
    ↓
Backend
    - Validate user from JWT
    - Validate stock cho từng item
        * Nếu insufficient → throw 409 Conflict
        * Update stock = stock - quantity
    - Validate coupon (nếu có)
        * Check active, not expired, minSpend
        * Update usedCount
    - Create order:
        * orderId = ORD-XXX
        * status = PENDING
        * customerEmail = user.email
        * items, totalAmount, shippingInfo, createdAt
    - Return order object
    ↓
Frontend (Success)
    - clear() // Clear cart-store
    - localStorage.removeItem('shopcart_cart')
    - toast.success("Payment successful!")
    - navigate({ to: "/orders", search: { highlight: orderId } })
    ↓
Frontend (Stock Conflict - 409)
    - catch (e) if e.status === 409
    - removeItem(last item)
    - setConflictMsg("Someone else just bought the last item")
    - Show alert with conflict message
```

---

### 2.8 Order Management Flow (User)

```
User truy cập /orders
    ↓
OrdersPage (routes/orders.tsx)
    - beforeLoad: redirect to /login if not authenticated
    - useEffect → apiFetch('/api/orders')
    ↓
api-service
    - Translate: GET /api/orders → GET /api/orders/me
    - Add Authorization header
    ↓
Backend
    - GET /api/orders/me
    - Query: SELECT * FROM orders WHERE customerEmail = :user.email
    - Return user's orders
    ↓
Frontend
    - Render order list:
        * Order ID, OrderStatusBadge, date, items count, total
        * "View receipt" button → open dialog
        * "Write a review" button (nếu DELIVERED)
        * OrderStatusStepper
    ↓
User click "View receipt"
    - Dialog with order detail:
        * Items list, total, shipping info
    ↓
User click "Write a review"
    - WriteReviewModal opens
    - User select product from order
    - User enter rating (1-5) + review text
    - Submit review
    - Reload orders + reviews
```

---

### 2.9 Admin Dashboard Flow

```
User truy cập /admin
    ↓
AdminDashboard (routes/admin/index.tsx)
    - Check isAdmin() from auth-store
    - If not admin → show access denied
    ↓
useEffect → 2 API calls:
    - fetchRevenue() → GET /api/admin/revenue
    - fetchCoupons() → GET /api/admin/coupons
    ↓
Backend: GET /api/admin/revenue
    - Validate admin role
    - Query: SUM(totalAmount) WHERE status IN ('PAID','SHIPPED','DELIVERED')
    - Return { revenue, currency }
    ↓
Backend: GET /api/admin/coupons
    - Validate admin role
    - Query: SELECT * FROM coupons
    - Return coupons array
    ↓
Frontend
    - Render Revenue Card:
        * Display total revenue (VND format)
        * "Cập nhật" button
    - Render Coupon Management Card:
        * Form tạo coupon (code, type, value, expiry, minSpend, maxDiscount, usageLimit)
        * "Tạo mã giảm giá" button
    - Render Coupon List Card:
        * List coupons with details
        * "Delete" button
    ↓
User click "Tạo mã giảm giá"
    - handleCreateCoupon()
    - apiFetch('/api/admin/coupons', { method: 'POST', body })
    ↓
Backend: POST /api/admin/coupons
    - Validate admin role
    - Insert coupon into database
    - Return created coupon
    ↓
Frontend
    - toast.success()
    - Clear form
    - fetchCoupons() // Reload list
    ↓
User click "Delete" coupon
    - handleDeleteCoupon(couponId)
    - apiFetch(`/api/admin/coupons/${couponId}`, { method: 'DELETE' })
    ↓
Backend: DELETE /api/admin/coupons/:id
    - Validate admin role
    - Delete coupon from database
    ↓
Frontend
    - toast.success()
    - fetchCoupons() // Reload list
```

---

### 2.10 Admin Orders Management Flow

```
User truy cập /admin/orders
    ↓
AdminPage (routes/admin/orders.tsx)
    - beforeLoad: check admin role
    - Tabs: Orders | Inventory
    ↓
Orders Table Tab
    - useEffect → apiFetch('/api/admin/orders')
    ↓
Backend: GET /api/admin/orders
    - Validate admin role
    - Query: SELECT * FROM orders
    - Return all orders
    ↓
Frontend
    - Filter by status
    - Sort by date or amount
    - Render table:
        * Order ID, date, customer, amount, status
        * "Next action" button (dựa trên getNextAction)
        * "Cancel" button (nếu canCancel)
    ↓
User click "Next action" (e.g., "Mark as Paid")
    - updateStatus(orderId, 'PAID')
    - Optimistic update local state
    - apiFetch(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: { status } })
    ↓
Backend: PATCH /api/admin/orders/:id/status
    - Validate admin role
    - Update order status
    - Return updated order
    ↓
Frontend
    - toast.success()
    ↓
Inventory Table Tab
    - useEffect → apiFetch('/api/products')
    ↓
Backend: GET /api/products
    - Return all products
    ↓
Frontend
    - Render table:
        * Product (image + name), category, price, stock
        * Stock color coded (red if 0, warning if <=3)
        * "Edit stock" button
    ↓
User click "Edit stock"
    - Open dialog with stock input
    - User enter new stock
    - Click "Save"
    - apiFetch(`/api/admin/products/${id}/stock`, { method: 'PATCH', body: { stockQuantity } })
    ↓
Backend: PATCH /api/admin/products/:id/stock
    - Validate admin role
    - Update product stockQuantity
    - Return updated product
    ↓
Frontend
    - toast.success()
    - refresh() // Reload list
```

---

### 2.11 Admin Analytics Flow

```
User truy cập /admin/analytics
    ↓
AnalyticsPage (routes/admin/analytics.tsx)
    - beforeLoad: check admin role
    - useEffect → apiFetch('/api/admin/reviews')
    ↓
Backend: GET /api/admin/reviews
    - Validate admin role
    - Query: SELECT * FROM reviews
    - Return reviews with AI analysis:
        * sentiment, aiSentiment, aiRating
        * aiPrimaryEmotion, priority, isFake, helpfulnessScore
    ↓
Frontend
    - Render sections:
        1. TriageAlerts: CRITICAL or isFake reviews
        2. SentimentOverview: Pie chart (Positive/Negative/Neutral)
        3. AiSentimentComparison: AI Agreement vs Disagreement
        4. EmotionAnalysis: Emotion tags with frequency
        5. AllReviewsTable: Searchable, filterable table
    ↓
User interactions:
    - Click review row → open ReviewDetailModal
    - Click chart segment → open ChartDetailModal
    - Search/filter reviews table
```

---

## Phần 3: State Management Flow

### 3.1 auth-store Flow

```
┌─────────────────────────────────────────────────────────┐
│ Component (LoginPage, Header, etc.)                     │
│ useAuthStore(selector)                                    │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ auth-store (Zustand)                                     │
│ stores/auth-store.ts                                      │
├─────────────────────────────────────────────────────────┤
│ State:                                                     │
│ - user: User │ null                                      │
│ - token: string │ null                                   │
│ - idToken: string │ null (Firebase token)               │
│                                                             │
│ Actions:                                                   │
│ - login(email, password)                                  │
│   → apiFetch → set({ user, token })                       │
│                                                             │
│ - register(name, email, password)                          │
│   → apiFetch → set({ user, token: null })                  │
│                                                             │
│ - logout()                                                 │
│   → set({ user: null, token: null })                       │
│   → purgeSession()                                         │
│                                                             │
│ - setIdToken(idToken)                                      │
│   → set({ idToken })                                       │
│                                                             │
│ Getters:                                                   │
│ - isAuthenticated() → !!token                              │
│ - isAdmin() → user?.role === "ADMIN"                       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Persist Middleware (Zustand)                              │
│ localStorage['shopcart_auth'] = {                          │
│   state: { user, token, idToken }                          │
│ }                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 3.2 cart-store Flow

```
┌─────────────────────────────────────────────────────────┐
│ Component (ShopPage, CartPage, Header)                   │
│ useCartStore(selector)                                    │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ cart-store (Zustand)                                     │
│ stores/cart-store.ts                                      │
├─────────────────────────────────────────────────────────┤
│ State:                                                     │
│ - items: CartItem[]                                      │
│                                                             │
│ Actions:                                                   │
│ - addItem(product, quantity = 1)                          │
│   → Check existing → update or add new                    │
│   → Cap at stockQuantity                                  │
│                                                             │
│ - removeItem(productId)                                   │
│   → Filter items array                                    │
│                                                             │
│ - updateQuantity(productId, quantity)                     │
│   → If quantity <= 0 → remove                             │
│   → Else → update with Math.min(quantity, stock)         │
│                                                             │
│ - clear()                                                   │
│   → set({ items: [] })                                     │
│                                                             │
│ Getters:                                                   │
│ - totalItems() → sum of quantities                         │
│ - subtotal() → sum of (price * quantity)                   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Persist Middleware (Zustand)                              │
│ localStorage['shopcart_cart'] = {                           │
│   state: { items }                                         │
│ }                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Phần 4: API Service Flow

### 4.1 apiFetch Flow

```
Component calls apiFetch(path, options)
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ apiFetch<T>(path, init)                                   │
│ lib/api-service.ts                                          │
├─────────────────────────────────────────────────────────┤
│ 1. Get token from localStorage                             │
│    - localStorage.getItem('shopcart_auth')                 │
│    - Parse JSON → state?.token                             │
│                                                             │
│ 2. Translate route (route mapping)                        │
│    - POST /api/orders → POST /api/orders/checkout          │
│    - GET /api/orders → GET /api/orders/me                  │
│    - PATCH /api/admin/products/:id/stock                   │
│      → PATCH /api/products/:id/stock                        │
│                                                             │
│ 3. Build URL                                               │
│    - http://localhost:8081{backendPath}                   │
│                                                             │
│ 4. Build headers                                          │
│    - Content-Type: application/json                        │
│    - Authorization: Bearer {token} (nếu có)                │
│                                                             │
│ 5. Build options                                           │
│    - method, headers, body (JSON string)                  │
│                                                             │
│ 6. Call fetch()                                             │
│                                                             │
│ 7. Handle response                                        │
│    - If !ok → throw ApiError(status, message)              │
│    - If status === 204 → return {}                          │
│    - Else → return await response.json()                   │
│                                                             │
│ 8. Handle error                                           │
│    - Network error → ApiError(500, "Không thể kết nối...") │
│    - Other errors → ApiError(status, message)              │
└─────────────────────────────────────────────────────────┘
```

---

### 4.2 Route Mapping Table

| Frontend Path | Backend Path | Method | Notes |
|---------------|--------------|--------|-------|
| /api/auth/login | /api/auth/login | POST | Login |
| /api/auth/register | /api/auth/register | POST | Register |
| /api/products | /api/products | GET | Get all products |
| /api/products/:id | /api/products/:id | GET | Get product detail |
| /api/products/:id/reviews | /api/products/:id/reviews | GET | Get product reviews |
| /api/orders (GET) | /api/orders/me | GET | Get user orders |
| /api/orders (POST) | /api/orders/checkout | POST | Create order |
| /api/admin/revenue | /api/admin/revenue | GET | Get total revenue |
| /api/admin/coupons | /api/admin/coupons | GET | Get all coupons |
| /api/admin/coupons (POST) | /api/admin/coupons | POST | Create coupon |
| /api/admin/coupons/:id (DELETE) | /api/admin/coupons/:id | DELETE | Delete coupon |
| /api/admin/orders | /api/admin/orders | GET | Get all orders |
| /api/admin/orders/:id/status | /api/admin/orders/:id/status | PATCH | Update order status |
| /api/admin/products | /api/products | GET | Get all products |
| /api/admin/products/:id/stock | /api/products/:id/stock | PATCH | Update product stock |
| /api/admin/reviews | /api/admin/reviews | GET | Get all reviews with AI |

---

## Phần 5: Error Handling Flow

### 5.1 API Error Handling

```
API call fails
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ api-service: ApiError class                               │
│ class ApiError extends Error {                             │
│   status: number                                         │
│   constructor(status, message)                             │
│ }                                                          │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Component catch block                                     │
│ try {                                                      │
│   await apiFetch(...)                                     │
│ } catch (e) {                                              │
│   if (e instanceof ApiError) {                             │
│     switch(e.status) {                                    │
│       case 401: toast.error("Unauthorized"); break;       │
│       case 404: toast.error("Not Found"); break;          │
│       case 409: // Stock conflict                          │
│         removeItem(lastItem);                             │
│         setConflictMsg("...");                             │
│         break;                                             │
│       case 500: toast.error("Server Error"); break;        │
│     }                                                      │
│   }                                                         │
│ }                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Phần 6: Summary Table

### 6.1 All Functions and Their Flows

| Function | Component | Store | API | Backend | Purpose |
|----------|-----------|-------|-----|---------|---------|
| Login | LoginPage | auth-store | POST /api/auth/login | AuthController | User login |
| Register | RegisterPage | auth-store | POST /api/auth/register | AuthController | User registration |
| Logout | Header | auth-store | - | - | User logout |
| Browse Products | ShopPage | - | GET /api/products | ProductController | View all products |
| View Product Detail | ProductDetailPage | cart-store | GET /api/products/:id | ProductController | View product details |
| Add to Cart | ShopPage, ProductDetail | cart-store | - | - | Add item to cart |
| Update Quantity | CartPage | cart-store | - | - | Update cart item quantity |
| Remove Item | CartPage | cart-store | - | - | Remove item from cart |
| Clear Cart | CheckoutPage | cart-store | - | - | Clear all items |
| Validate Coupon | CheckoutPage | - | - | - | Apply coupon discount |
| Place Order | CheckoutPage | cart-store, auth-store | POST /api/orders/checkout | OrderController | Create order |
| View Orders | OrdersPage | auth-store | GET /api/orders/me | OrderController | View user orders |
| Write Review | ProductDetail, OrdersPage | - | POST /api/reviews | ReviewController | Submit review |
| View Revenue | AdminDashboard | auth-store | GET /api/admin/revenue | AdminController | View total revenue |
| Create Coupon | AdminDashboard | - | POST /api/admin/coupons | AdminController | Create coupon |
| Delete Coupon | AdminDashboard | - | DELETE /api/admin/coupons/:id | AdminController | Delete coupon |
| View All Orders | AdminOrders | auth-store | GET /api/admin/orders | AdminController | View all orders |
| Update Order Status | AdminOrders | - | PATCH /api/admin/orders/:id/status | AdminController | Update order status |
| Update Stock | AdminOrders | - | PATCH /api/admin/products/:id/stock | AdminController | Update product stock |
| View Review Analytics | AdminAnalytics | auth-store | GET /api/admin/reviews | AdminController | View AI analytics |

---

## Phần 7: Key Insights for Testing

### 7.1 Test Layers Based on Flow

1. **Unit Test (Vitest):**
   - Test store actions (addItem, removeItem, updateQuantity)
   - Test utility functions (formatPrice, calculateOrderTotals)
   - Test API service error handling (mock fetch)

2. **Component Test (Vitest + Testing Library):**
   - Test component rendering with different states
   - Test user interactions (click, type)
   - Mock stores to test component independently

3. **Integration Test (Playwright):**
   - Test end-to-end flows (login → add to cart → checkout)
   - Test actual browser behavior

### 7.2 Critical Points to Test

- **Stock validation:** Ensure cart doesn't exceed stock
- **Authentication:** Protected routes redirect to login
- **Authorization:** Admin-only routes check role
- **Error handling:** 409 conflict handled gracefully
- **Persistence:** Data persists after page reload

---

## Phần 8: Conclusion

Hệ thống ShopCart có architecture rõ ràng với 3 main layers:
1. **Frontend:** React components → Zustand stores → API service
2. **Backend:** Spring Boot controllers → Services → Repositories → Database
3. **NLP Service:** Python service for review analysis

Mỗi chức năng có flow data rõ ràng từ UI → Store → API → Backend → Database, giúp dễ dàng debug và test.
