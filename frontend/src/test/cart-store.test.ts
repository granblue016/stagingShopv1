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
  });
});
