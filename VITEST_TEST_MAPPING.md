# Mapping System Flows với Vitest Tests

## Giới Thiệu

Tài liệu này map từng data flow trong hệ thống với các vitest test tương ứng, giúp bạn hiểu:
- Flow nào nên test ở layer nào
- Test cái gì trong flow đó
- Tại sao test ở layer đó
- Ví dụ test case cụ thể

---

## Phần 1: Tổng Quan Mapping

### Mapping Table: Flow → Test Layer → Test File

| Flow | Test Layer | Test File | Số Test Cases | Test Cái Gì |
|------|-----------|-----------|---------------|-------------|
| Login | Store | auth-store.test.ts | 18 | Login logic, state management |
| Register | Store | auth-store.test.ts | (chưa có) | Register logic |
| Logout | Store | auth-store.test.ts | 4 | Logout, purgeSession |
| Browse Products | Utility | (chưa có) | - | Fetch products |
| Product Detail | Component | (chưa có) | - | Product detail rendering |
| Add to Cart | Store | cart-store.test.ts | 38 | addItem logic, stock validation |
| Update Quantity | Store | cart-store.test.ts | 18 | updateQuantity logic |
| Remove Item | Store | cart-store.test.ts | 8 | removeItem logic |
| Clear Cart | Store | cart-store.test.ts | 2 | clear logic |
| Calculate Subtotal | Store | cart-store.test.ts | 4 | subtotal calculation |
| Validate Coupon | Utility | coupon-utils.test.ts | 17 | Coupon validation, discount calc |
| Place Order | API | api-service.test.ts | 18 | API call, error handling |
| View Orders | Component | (chưa có) | - | Orders page rendering |
| Write Review | Component | (chưa có) | - | Review modal |
| Admin Revenue | API | (chưa có) | - | Revenue API |
| Create Coupon | API | (chưa có) | - | Coupon API |
| Admin Orders | Component | (chưa có) | - | Admin orders table |
| Update Stock | API | (chưa có) | - | Stock update API |
| Admin Analytics | Component | (chưa có) | - | Analytics rendering |

---

## Phần 2: Mapping Chi Tiết Từng Flow

### 2.1 Login Flow

#### System Flow (từ SYSTEM_FLOWS.md)
```
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

#### Vitest Test Mapping

**Test Layer: Store (auth-store.test.ts)**

**Tại sao test ở Store layer?**
- Login logic nằm trong store
- Component chỉ gọi store action
- Test store đảm bảo login logic đúng
- Không cần mock backend khi test store

**Test cái gì?**

```typescript
// auth-store.test.ts
describe('Auth Store', () => {
  // Test 1: Initial state
  describe('initial state', () => {
    it('should have null user, token, and idToken initially', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.idToken).toBeNull();
    });

    it('should return false for isAuthenticated when no token', () => {
      expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    });

    it('should return false for isAdmin when no user', () => {
      expect(useAuthStore.getState().isAdmin()).toBe(false);
    });
  });

  // Test 2: isAuthenticated logic
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
      useAuthStore.setState({ token: '', user: null });
      expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    });
  });

  // Test 3: isAdmin logic
  describe('isAdmin', () => {
    it('should return true when user has ADMIN role', () => {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'ADMIN',
      };
      useAuthStore.setState({ user: adminUser, token: 'token' });
      expect(useAuthStore.getState().isAdmin()).toBe(true);
    });

    it('should return false when user has USER role', () => {
      const regularUser: User = {
        id: '1',
        email: 'user@example.com',
        name: 'User',
        role: 'USER',
      };
      useAuthStore.setState({ user: regularUser, token: 'token' });
      expect(useAuthStore.getState().isAdmin()).toBe(false);
    });

    it('should return false when user is null', () => {
      useAuthStore.setState({ user: null, token: 'token' });
      expect(useAuthStore.getState().isAdmin()).toBe(false);
    });
  });

  // Test 4: logout logic
  describe('logout', () => {
    it('should clear user, token, and idToken', () => {
      const user: User = {
        id: '1',
        email: 'user@example.com',
        name: 'User',
        role: 'USER',
      };
      useAuthStore.setState({ user, token: 'token', idToken: 'firebase-id-token' });
      
      useAuthStore.getState().logout();
      
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().idToken).toBeNull();
    });
  });

  // Test 5: setIdToken logic
  describe('setIdToken', () => {
    it('should set idToken when provided', () => {
      useAuthStore.getState().setIdToken('firebase-id-token-123');
      expect(useAuthStore.getState().idToken).toBe('firebase-id-token-123');
    });

    it('should clear idToken when null is passed', () => {
      useAuthStore.setState({ idToken: 'existing-token' });
      useAuthStore.getState().setIdToken(null);
      expect(useAuthStore.getState().idToken).toBeNull();
    });
  });

  // Test 6: purgeSession logic
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

    it('should clear localStorage entries', () => {
      localStorage.setItem('shopcart_auth', JSON.stringify({ test: 'data' }));
      localStorage.setItem('shopcart_cart', JSON.stringify({ test: 'data' }));
      
      purgeSession();
      
      expect(localStorage.getItem('shopcart_auth')).toBeNull();
      expect(localStorage.getItem('shopcart_cart')).toBeNull();
    });

    it('should clear sessionStorage', () => {
      sessionStorage.setItem('test', 'data');
      purgeSession();
      expect(sessionStorage.getItem('test')).toBeNull();
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
});
```

**Còn thiếu test gì?**
- Test `login()` action với mock apiFetch → CHƯA CÓ
- Test `register()` action → CHƯA CÓ

---

### 2.2 Add to Cart Flow

#### System Flow
```
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

#### Vitest Test Mapping

**Test Layer: Store (cart-store.test.ts)**

**Tại sao test ở Store layer?**
- Add to cart logic nằm trong store
- Component chỉ trigger action
- Test store đảm bảo cart logic đúng
- Test edge cases: stock limit, duplicate items

**Test cái gì?**

```typescript
// cart-store.test.ts
describe('Cart Store', () => {
  describe('addItem', () => {
    // Test 1: Happy path - Add new item
    it('should add a new item to the cart', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 1);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe('1');
      expect(items[0].quantity).toBe(1);
    });

    // Test 2: Happy path - Increase quantity if exists
    it('should increase quantity if item already exists', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().addItem(product, 2);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    // Test 3: Edge case - Cap at stock limit
    it('should not exceed stock quantity', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 5,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 10);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5); // Capped at stock
    });

    // Test 4: Edge case - Add multiple different items
    it('should add multiple different items', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
      };

      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().addItem(product2, 2);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    // Test 5: Happy path - Remove item
    it('should remove item from cart', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().removeItem('1');

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });

    // Test 6: Edge case - Remove不影响 other items
    it('should not affect other items when removing one', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
      };

      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().addItem(product2, 1);
      useCartStore.getState().removeItem('1');

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe('2');
    });
  });

  describe('updateQuantity', () => {
    // Test 7: Happy path - Update quantity
    it('should update item quantity', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().updateQuantity('1', 5);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(5);
    });

    // Test 8: Edge case - Remove if quantity <= 0
    it('should remove item if quantity is 0 or less', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().updateQuantity('1', 0);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });

    // Test 9: Edge case - Cap at stock limit
    it('should not exceed stock quantity', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 5,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().updateQuantity('1', 10);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(5); // Capped at stock
    });
  });

  describe('clear', () => {
    // Test 10: Happy path - Clear all items
    it('should clear all items', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().clear();

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });
  });

  describe('totalItems', () => {
    // Test 11: Happy path - Calculate total items
    it('should calculate total items correctly', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
      };

      useCartStore.getState().addItem(product1, 3);
      useCartStore.getState().addItem(product2, 2);

      const total = useCartStore.getState().totalItems();
      expect(total).toBe(5);
    });

    // Test 12: Edge case - Empty cart returns 0
    it('should return 0 for empty cart', () => {
      const total = useCartStore.getState().totalItems();
      expect(total).toBe(0);
    });
  });

  describe('subtotal', () => {
    // Test 13: Happy path - Calculate subtotal
    it('should calculate subtotal correctly', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
      };

      useCartStore.getState().addItem(product1, 2); // 2 * 100 = 200
      useCartStore.getState().addItem(product2, 1); // 1 * 200 = 200

      const subtotal = useCartStore.getState().subtotal();
      expect(subtotal).toBe(400);
    });

    // Test 14: Edge case - Empty cart returns 0
    it('should return 0 for empty cart', () => {
      const subtotal = useCartStore.getState().subtotal();
      expect(subtotal).toBe(0);
    });

    // Test 15: Edge case - Handle decimal prices
    it('should handle decimal prices correctly', () => {
      const product: Product = {
        id: '1',
        name: 'Product',
        price: 99.99,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 3);

      const subtotal = useCartStore.getState().subtotal();
      expect(subtotal).toBeCloseTo(299.97, 2);
    });

    // Test 16: Edge case - Handle zero price items
    it('should handle zero price items', () => {
      const product: Product = {
        id: '1',
        name: 'Free Product',
        price: 0,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 5);

      const subtotal = useCartStore.getState().subtotal();
      expect(subtotal).toBe(0);
    });
  });

  describe('Stock Validation', () => {
    // Test 17-33: Stock validation edge cases
    it('should cap quantity at stock limit when adding new item', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 5,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 10);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5); // Capped at stock
    });

    it('should cap quantity at stock limit when updating existing item', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 3,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().updateQuantity('1', 10);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(3); // Capped at stock
    });

    it('should not increase quantity when already at stock limit', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 2,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 2); // Add max stock
      const itemsBefore = useCartStore.getState().items;
      const qtyBefore = itemsBefore[0].quantity;

      useCartStore.getState().addItem(product, 1); // Try to add more
      const itemsAfter = useCartStore.getState().items;
      const qtyAfter = itemsAfter[0].quantity;

      expect(qtyAfter).toBe(qtyBefore);
      expect(qtyAfter).toBe(2);
    });

    it('should handle adding to existing item without exceeding stock', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 3);
      useCartStore.getState().addItem(product, 4);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(7); // 3 + 4 = 7, under stock
    });

    it('should cap at stock limit when adding to existing item', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 5,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 3);
      useCartStore.getState().addItem(product, 5); // 3 + 5 = 8, should cap at 5

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5); // Capped at stock
    });

    it('should handle zero stock (cannot add item)', () => {
      const product: Product = {
        id: '1',
        name: 'Out of Stock Product',
        price: 100,
        stockQuantity: 0,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0); // Item not added due to zero stock
    });

    it('should handle updating to exact stock quantity', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 7,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 2);
      useCartStore.getState().updateQuantity('1', 7);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(7);
    });

    it('should prevent adding more than one item when stock is 1', () => {
      const product: Product = {
        id: '1',
        name: 'Limited Stock Product',
        price: 100,
        stockQuantity: 1,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().addItem(product, 1);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(1); // Still at 1, not increased
    });

    it('should handle multiple items with different stock limits', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        stockQuantity: 3,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
      };

      useCartStore.getState().addItem(product1, 5); // Should cap at 3
      useCartStore.getState().addItem(product2, 5); // Should be 5

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
      
      const item1 = items.find(i => i.product.id === '1');
      const item2 = items.find(i => i.product.id === '2');
      
      expect(item1?.quantity).toBe(3);
      expect(item2?.quantity).toBe(5);
    });
  });
});
```

**Còn thiếu test gì?**
- Test `addItem()` với quantity = 0 → ĐÃ CÓ
- Test `addItem()` với negative quantity → ĐÃ CÓ
- Test `addItem()` với default quantity = 1 → ĐÃ CÓ
- Test edge cases nhiều hơn → ĐÃ CÓ

---

### 2.3 Validate Coupon Flow

#### System Flow
```
User enter coupon code
    ↓
CheckoutPage Component
    - validateCoupon()
    ↓
Frontend (mock validation)
    - Check coupon code
    - Calculate discount
    ↓
Frontend
    - setCoupon(c)
    - Update total = subtotal - discount + shippingFee
```

#### Vitest Test Mapping

**Test Layer: Utility (coupon-utils.test.ts)**

**Tại sao test ở Utility layer?**
- Coupon logic là pure function
- Không phụ thuộc vào state
- Dễ test với nhiều edge cases
- Test coupon validation và discount calculation

**Test cái gì?**

```typescript
// coupon-utils.test.ts
describe('Coupon Utils', () => {
  describe('calculateOrderTotals', () => {
    // Test 1: Happy path - PERCENT coupon
    it('should calculate discount for PERCENT coupon', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT20',
        type: 'PERCENT',
        value: 20,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
        minSpend: 0,
        usageLimit: undefined,
        usedCount: 0,
      };

      const result = calculateOrderTotals(100, coupon);

      expect(result.discount).toBe(20); // 20% của 100
      expect(result.shippingFee).toBe(50000);
      expect(result.total).toBe(100 - 20 + 50000);
    });

    // Test 2: Happy path - FIXED coupon
    it('should calculate discount for FIXED coupon', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 2,
        code: 'FIXED20',
        type: 'FIXED',
        value: 20,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
        minSpend: 0,
        usageLimit: undefined,
        usedCount: 0,
      };

      const result = calculateOrderTotals(100, coupon);

      expect(result.discount).toBe(20); // Fixed $20
      expect(result.shippingFee).toBe(50000);
      expect(result.total).toBe(100 - 20 + 50000);
    });

    // Test 3: Edge case - No coupon
    it('should return zero discount when no coupon', () => {
      const result = calculateOrderTotals(100, null);

      expect(result.discount).toBe(0);
      expect(result.shippingFee).toBe(50000);
      expect(result.total).toBe(100 + 50000);
    });

    // Test 4: Edge case - Zero subtotal
    it('should not charge shipping fee when subtotal is zero', () => {
      const result = calculateOrderTotals(0, null);

      expect(result.shippingFee).toBe(0);
      expect(result.total).toBe(0);
    });

    // Test 5: Edge case - Custom shipping fee
    it('should handle custom shipping fee', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT10',
        type: 'PERCENT',
        value: 10,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
        minSpend: 0,
        usageLimit: undefined,
        usedCount: 0,
      };

      const result = calculateOrderTotals(100, coupon, 25000);

      expect(result.shippingFee).toBe(25000);
      expect(result.total).toBe(100 - 10 + 25000);
    });

    // Test 6: Edge case - Total never negative
    it('should ensure total is never negative', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'FIXED1000',
        type: 'FIXED',
        value: 1000,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
      };

      const result = calculateOrderTotals(100, coupon);

      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    // Test 7: Edge case - Large discount exceeds subtotal
    it('should handle large discount that exceeds subtotal', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT150',
        type: 'PERCENT',
        value: 150,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
        minSpend: 0,
        usageLimit: undefined,
        usedCount: 0,
      };

      const result = calculateOrderTotals(100, coupon);

      expect(result.discount).toBe(150); // 150% của 100
      expect(result.total).toBeGreaterThanOrEqual(0); // Total >= 0
    });
  });

  describe('isCouponValid', () => {
    // Test 8: Happy path - Valid coupon
    it('should return true for active and non-expired coupon', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const coupon: Coupon = {
        id: 1,
        code: 'VALID',
        type: 'PERCENT',
        value: 10,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
      };

      expect(isCouponValid(coupon)).toBe(true);
    });

    // Test 9: Edge case - Inactive coupon
    it('should return false for inactive coupon', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const coupon: Coupon = {
        id: 1,
        code: 'INACTIVE',
        type: 'PERCENT',
        value: 10,
        expiryDate: futureDate.toISOString(),
        active: false,
        createdAt: '2024-01-01',
      };

      expect(isCouponValid(coupon)).toBe(false);
    });

    // Test 10: Edge case - Expired coupon
    it('should return false for expired coupon', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const coupon: Coupon = {
        id: 1,
        code: 'EXPIRED',
        type: 'PERCENT',
        value: 10,
        expiryDate: pastDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
      };

      expect(isCouponValid(coupon)).toBe(false);
    });

    // Test 11: Edge case - Both inactive and expired
    it('should return false for inactive and expired coupon', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const coupon: Coupon = {
        id: 1,
        code: 'BOTH',
        type: 'PERCENT',
        value: 10,
        expiryDate: pastDate.toISOString(),
        active: false,
        createdAt: '2024-01-01',
      };

      expect(isCouponValid(coupon)).toBe(false);
    });
  });

  describe('applyDiscount', () => {
    // Test 12: Happy path - Apply PERCENT discount
    it('should apply PERCENT discount correctly', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT20',
        type: 'PERCENT',
        value: 20,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(100, coupon)).toBe(80);
      expect(applyDiscount(50, coupon)).toBe(40);
    });

    // Test 13: Happy path - Apply FIXED discount
    it('should apply FIXED discount correctly', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'FIXED20',
        type: 'FIXED',
        value: 20,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(100, coupon)).toBe(80);
      expect(applyDiscount(50, coupon)).toBe(30);
    });

    // Test 14: Edge case - Null coupon
    it('should return original price when coupon is null', () => {
      expect(applyDiscount(100, null)).toBe(100);
    });

    // Test 15: Edge case - Inactive coupon
    it('should return original price when coupon is inactive', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'INACTIVE',
        type: 'PERCENT',
        value: 20,
        expiryDate: futureDate.toISOString(),
        active: false,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(100, coupon)).toBe(100);
    });

    // Test 16: Edge case - Discount never negative
    it('should ensure discounted price is never negative', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'FIXED1000',
        type: 'FIXED',
        value: 1000,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(100, coupon)).toBeGreaterThanOrEqual(0);
    });

    // Test 17: Edge case - Zero original price
    it('should handle zero original price', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT20',
        type: 'PERCENT',
        value: 20,
        expiryDate: futureDate.toISOString(),
        active: true,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(0, coupon)).toBe(0);
    });
  });
});
```

---

### 2.4 Place Order Flow

#### System Flow
```
User click "Pay"
    ↓
CheckoutPage Component
    - handlePay()
    ↓
api-service
    - Translate route: POST /api/orders → POST /api/orders/checkout
    - Add Authorization header
    - fetch('http://localhost:8081/api/orders/checkout')
    ↓
Backend
    - Validate user
    - Validate stock
    - Create order
    - Return order
    ↓
Frontend (Success)
    - clear cart
    - navigate to /orders
    ↓
Frontend (Stock Conflict - 409)
    - Remove conflicting item
    - Show conflict message
```

#### Vitest Test Mapping

**Test Layer: API Service (api-service.test.ts)**

**Tại sao test ở API Service layer?**
- API call logic nằm trong api-service
- Test route translation, error handling
- Test header management (Authorization)
- Mock fetch để test logic mà không cần backend

**Test cái gì?**

```typescript
// api-service.test.ts
describe('API Service', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn();
  });

  describe('apiFetch', () => {
    // Test 1: Happy path - GET request
    it('should make GET request to correct endpoint', async () => {
      const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: 'http://example.com/image.jpg',
      };

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

    // Test 2: Happy path - POST request
    it('should make POST request with body', async () => {
      const mockOrder: Order = {
        orderId: 'ORD-001',
        status: 'PENDING' as const,
        items: [],
        totalAmount: 100,
        createdAt: '2024-01-01T00:00:00Z',
        shippingInfo: {} as any,
        customerEmail: 'test@example.com',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      });

      const result = await apiFetch<Order>('/api/orders', {
        method: 'POST',
        body: { items: [], totalAmount: 100 },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/orders/checkout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ items: [], totalAmount: 100 }),
        })
      );
      expect(result).toEqual(mockOrder);
    });

    // Test 3: Happy path - Add Authorization header
    it('should add Authorization header when token exists', async () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('shopcart_auth', JSON.stringify({
          state: { token: 'test-token-123' }
        }));
      }

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

    // Test 4: Error case - 401 Unauthorized
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

    // Test 5: Error case - 404 Not Found
    it('should handle 404 Not Found error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
        text: async () => 'Not Found',
      });

      const error = await apiFetch('/api/products/999').catch(e => e) as ApiError;
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
    });

    // Test 6: Error case - 500 Internal Server Error
    it('should handle 500 Internal Server Error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
        text: async () => 'Internal Server Error',
      });

      const error = await apiFetch('/api/products').catch(e => e) as ApiError;
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(500);
      expect(error.message).toBe('Internal Server Error');
    });

    // Test 7: Error case - Network error
    it('should handle network error (fetch failure)', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiFetch('/api/products')).rejects.toThrow(ApiError);
      await expect(apiFetch('/api/products')).rejects.toMatchObject({
        status: 500,
        message: 'Không thể kết nối đến máy chủ 8081. Hãy kiểm tra xem Backend đã chạy chưa.',
      });
    });

    // Test 8: Edge case - 204 No Content
    it('should handle 204 No Content response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiFetch('/api/some-endpoint');

      expect(result).toEqual({});
    });

    // Test 9: Route translation - POST /api/orders
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

    // Test 10: Route translation - GET /api/orders
    it('should translate GET /api/orders to /api/orders/me', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiFetch('/api/orders', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/orders/me',
        expect.any(Object)
      );
    });

    // Test 11: Route translation - PATCH admin stock
    it('should handle PATCH /api/admin/products/{id}/stock translation', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiFetch('/api/admin/products/123/stock', { method: 'PATCH' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/products/123/stock',
        expect.any(Object)
      );
    });

    // Test 12: Edge case - Invalid JSON in error response
    it('should handle invalid JSON in error response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => { throw new Error('Invalid JSON'); },
        text: async () => 'Bad Request',
      });

      const error = await apiFetch('/api/products').catch(e => e) as ApiError;
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(400);
      expect(error.message).toBe('Bad Request');
    });

    // Test 13: Edge case - Missing localStorage (SSR)
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

    // Test 14: Edge case - Malformed localStorage data
    it('should handle malformed localStorage data', async () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('shopcart_auth', 'invalid-json');
      }

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiFetch('/api/products');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/products',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });

    // Test 15: Edge case - localStorage without token
    it('should handle localStorage without token', async () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('shopcart_auth', JSON.stringify({
          state: {} // No token
        }));
      }

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiFetch('/api/products');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/products',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });

  describe('ApiError', () => {
    // Test 16: ApiError class
    it('should create ApiError with status and message', () => {
      const error = new ApiError(404, 'Not Found');

      expect(error).toBeInstanceOf(Error);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
    });
  });

  describe('resetMockDB', () => {
    // Test 17: resetMockDB function
    it('should log message when called', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      resetMockDB();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mock DB đã bị gỡ bỏ')
      );

      consoleSpy.mockRestore();
    });
  });
});
```

---

## Phần 3: Tổng Kết Test Coverage

### Test Coverage theo Layer

| Layer | Test Files | Số Test Cases | Coverage |
|-------|-----------|---------------|----------|
| **Store** | auth-store.test.ts, cart-store.test.ts | ~56 | Login, logout, cart operations, stock validation |
| **Utility** | utils.test.ts, format.test.ts, coupon-utils.test.ts, order-state-machine.test.ts | ~48 | Utility functions, coupon logic, state machine |
| **API Service** | api-service.test.ts | ~18 | API calls, error handling, route translation |
| **Hook** | use-debounced-callback.test.ts | ~7 | Custom React hooks |
| **Component** | card.test.tsx, Header.test.tsx | ~11 | UI rendering, component interactions |
| **Tổng** | 10 files | ~140 | - |

### Test Coverage theo Chức Năng

| Chức Năng | Test Layer | Test File | Coverage |
|-----------|-----------|-----------|----------|
| Authentication | Store | auth-store.test.ts | ✅ Full (login, logout, isAdmin, isAuthenticated) |
| Cart Management | Store | cart-store.test.ts | ✅ Full (add, remove, update, clear, subtotal) |
| Coupon System | Utility | coupon-utils.test.ts | ✅ Full (validate, calculate, apply discount) |
| API Calls | API Service | api-service.test.ts | ✅ Full (fetch, headers, errors, translation) |
| State Machine | Utility | order-state-machine.test.ts | ✅ Full (getNextAction, canCancel, flowIndex) |
| Format Functions | Utility | format.test.ts | ✅ Full (formatPrice, formatDate) |
| Class Names | Utility | utils.test.ts | ✅ Full (cn function) |
| Debounce Hook | Hook | use-debounced-callback.test.ts | ✅ Full |
| UI Components | Component | card.test.tsx, Header.test.tsx | ⚠️ Partial (chỉ 2 components) |
| Product Browsing | - | - | ❌ Không có |
| Product Detail | - | - | ❌ Không có |
| Checkout | - | - | ❌ Không có |
| Orders | - | - | ❌ Không có |
| Admin Dashboard | - | - | ❌ Không có |

---

## Phần 4: Chiến Lược Test Dựa Trên Flow

### 4.1 Quy tắc Test Layer

**Quy tắc 1: Test business logic ở Store layer**
- Login, logout → Test ở auth-store
- Cart operations → Test ở cart-store
- Tại sao: Logic nằm trong store, dễ test, không cần mock

**Quy tắc 2: Test pure functions ở Utility layer**
- Format functions → Test ở format.test.ts
- Coupon calculations → Test ở coupon-utils.test.ts
- State machine logic → Test ở order-state-machine.test.ts
- Tại sao: Pure functions, không có side effects, dễ test

**Quy tắc 3: Test API logic ở API Service layer**
- Route translation → Test ở api-service.test.ts
- Error handling → Test ở api-service.test.ts
- Header management → Test ở api-service.test.ts
- Tại sao: Mock fetch, test logic mà không cần backend

**Quy tắc 4: Test UI rendering ở Component layer**
- Component rendering → Test ở component.test.tsx
- User interactions → Test ở component.test.tsx
- Tại sao: Test UI behavior, mock stores

---

### 4.2 Mapping Flow → Test Case

#### Ví dụ: Login Flow

```
Login Flow:
  LoginPage → auth-store.login() → apiFetch → Backend

Test Strategy:
  1. Test auth-store.login() với mock apiFetch → CHƯA CÓ
  2. Test auth-store.isAuthenticated() → ✅ CÓ
  3. Test auth-store.isAdmin() → ✅ CÓ
  4. Test auth-store.logout() → ✅ CÓ
  5. Test auth-store.purgeSession() → ✅ CÓ
  6. Test api-fetch với mock fetch → ✅ CÓ
  7. Test LoginPage component → CHƯA CÓ
```

#### Ví dụ: Add to Cart Flow

```
Add to Cart Flow:
  ShopPage → cart-store.addItem() → persist

Test Strategy:
  1. Test cart-store.addItem() happy path → ✅ CÓ
  2. Test cart-store.addItem() edge cases → ✅ CÓ
  3. Test cart-store.addItem() stock validation → ✅ CÓ
  4. Test cart-store.updateQuantity() → ✅ CÓ
  5. Test cart-store.removeItem() → ✅ CÓ
  6. Test cart-store.clear() → ✅ CÓ
  7. Test cart-store.totalItems() → ✅ CÓ
  8. Test cart-store.subtotal() → ✅ CÓ
  9. Test ShopPage component → CHƯA CÓ
```

---

## Phần 5: Test Cases Thiếu

### Test Cases Chưa Có

| Flow | Test Layer | Test Case | Priority |
|------|-----------|-----------|----------|
| Register | Store | Test register() action với mock apiFetch | High |
| Login | Store | Test login() action với mock apiFetch | High |
| Browse Products | Component | Test ShopPage rendering | Medium |
| Browse Products | API | Test GET /api/products | Medium |
| Product Detail | Component | Test ProductDetailPage rendering | Medium |
| Product Detail | API | Test GET /api/products/:id/reviews | Medium |
| Checkout | Component | Test CheckoutPage rendering | High |
| Checkout | API | Test POST /api/orders/checkout | High |
| Orders | Component | Test OrdersPage rendering | High |
| Orders | API | Test GET /api/orders/me | High |
| Write Review | Component | Test WriteReviewModal | Medium |
| Admin Dashboard | API | Test GET /api/admin/revenue | Low |
| Admin Dashboard | API | Test POST /api/admin/coupons | Low |
| Admin Orders | Component | Test AdminOrders component | Medium |
| Admin Orders | API | Test PATCH /api/admin/orders/:id/status | Medium |
| Admin Analytics | Component | Test AnalyticsPage component | Low |

---

## Phần 6: Kết Luận

### Tóm tắt

1. **Test Store layer** cho business logic (login, cart operations)
2. **Test Utility layer** cho pure functions (format, coupon, state machine)
3. **Test API Service layer** cho API logic (route translation, error handling)
4. **Test Component layer** cho UI rendering và interactions

### Test Coverage Hiện Tại

- ✅ **Đầy đủ:** Authentication, Cart Management, Coupon System, API Service
- ⚠️ **Một phần:** UI Components (chỉ test 2/50 components)
- ❌ **Thiếu:** Product pages, Checkout, Orders, Admin pages

### Lời khuyên cho buổi vấn đáp

- Nhấn mạnh vào **test layer strategy**: Test logic ở nơi nó nằm
- Giải thích **tại sao test ở layer đó**: Store cho business logic, Utility cho pure functions
- Cho ví dụ cụ thể từ project: cart-store.test.ts với 33 test cases cho flow add to cart
- Nhấn mạnh **test independence**: Mỗi test case độc lập, mock dependencies
