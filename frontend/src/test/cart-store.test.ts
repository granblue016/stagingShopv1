import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/types';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  describe('addItem', () => {
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

    it('should increase quantity if item already exists', () => {
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
      useCartStore.getState().addItem(product, 2);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    it('should not exceed stock quantity', () => {
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
      expect(items[0].quantity).toBe(5);
    });

    it('should add multiple different items', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().addItem(product2, 2);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
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
      useCartStore.getState().removeItem('1');

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it('should not affect other items when removing one', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
        stockQuantity: 10,
        category: 'Electronics',
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
    it('should update item quantity', () => {
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
      useCartStore.getState().updateQuantity('1', 5);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0 or less', () => {
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
      useCartStore.getState().updateQuantity('1', 0);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it('should not exceed stock quantity', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 5,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().updateQuantity('1', 10);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(5);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
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
      useCartStore.getState().clear();

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });
  });

  describe('totalItems', () => {
    it('should calculate total items correctly', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product1, 3);
      useCartStore.getState().addItem(product2, 2);

      const total = useCartStore.getState().totalItems();
      expect(total).toBe(5);
    });

    it('should return 0 for empty cart', () => {
      const total = useCartStore.getState().totalItems();
      expect(total).toBe(0);
    });
  });

  describe('subtotal', () => {
    it('should calculate subtotal correctly', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product1, 2); // 2 * 100 = 200
      useCartStore.getState().addItem(product2, 1); // 1 * 200 = 200

      const subtotal = useCartStore.getState().subtotal();
      expect(subtotal).toBe(400);
    });

    it('should return 0 for empty cart', () => {
      const subtotal = useCartStore.getState().subtotal();
      expect(subtotal).toBe(0);
    });

    it('should handle decimal prices correctly', () => {
      const product: Product = {
        id: '1',
        name: 'Product',
        price: 99.99,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 3);

      const subtotal = useCartStore.getState().subtotal();
      expect(subtotal).toBeCloseTo(299.97, 2);
    });

    it('should handle zero price items', () => {
      const product: Product = {
        id: '1',
        name: 'Free Product',
        price: 0,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 5);

      const subtotal = useCartStore.getState().subtotal();
      expect(subtotal).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle adding item with quantity 0', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 0);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it('should handle adding item with negative quantity by adding it', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, -5);

      const items = useCartStore.getState().items;
      // The cart store doesn't validate negative quantities, it adds them
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBeLessThan(0);
    });

    it('should not add item when already at max stock quantity', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 5,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 5);
      const itemsBefore = useCartStore.getState().items;
      const qtyBefore = itemsBefore[0].quantity;

      useCartStore.getState().addItem(product, 1);
      const itemsAfter = useCartStore.getState().items;
      const qtyAfter = itemsAfter[0].quantity;

      // Quantity should not change when already at max
      expect(qtyAfter).toBe(qtyBefore);
      expect(qtyAfter).toBe(5);
    });

    it('should use default quantity of 1 when not specified', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(1);
    });

    it('should handle updating to exact stock quantity', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 5,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 3);
      useCartStore.getState().updateQuantity('1', 5);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(5);
    });

    it('should handle removing non-existent item gracefully', () => {
      useCartStore.getState().removeItem('non-existent-id');

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it('should handle updating quantity of non-existent item', () => {
      useCartStore.getState().updateQuantity('non-existent-id', 5);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it('should handle clearing empty cart', () => {
      useCartStore.getState().clear();

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(0);
    });
  });

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

    it('should cap quantity at stock limit when updating existing item', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 3,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 1);
      useCartStore.getState().updateQuantity('1', 10);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(3); // Capped at stock limit
    });

    it('should not increase quantity when already at stock limit', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 2,
        category: 'Electronics',
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
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 10,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 3);
      useCartStore.getState().addItem(product, 4);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(7); // 3 + 4 = 7, under stock limit
    });

    it('should cap at stock limit when adding to existing item', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 5,
        category: 'Electronics',
      };

      useCartStore.getState().addItem(product, 3);
      useCartStore.getState().addItem(product, 5); // 3 + 5 = 8, should cap at 5

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5); // Capped at stock limit
    });

    it('should handle zero stock (cannot add item)', () => {
      const product: Product = {
        id: '1',
        name: 'Out of Stock Product',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 0,
        category: 'Electronics',
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
        description: 'Test description',
        imageUrl: 'http://test.com/image.jpg',
        stockQuantity: 7,
        category: 'Electronics',
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

    it('should handle multiple items with different stock limits', () => {
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 100,
        description: 'Test description',
        imageUrl: 'http://test.com/image1.jpg',
        stockQuantity: 3,
        category: 'Electronics',
      };

      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 200,
        description: 'Test description',
        imageUrl: 'http://test.com/image2.jpg',
        stockQuantity: 10,
        category: 'Electronics',
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
