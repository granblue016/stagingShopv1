import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiFetch, ApiError, resetMockDB } from '@/lib/api-service';
import type { Product, Order, Coupon } from '@/types';

describe('API Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    // Mock fetch
    global.fetch = vi.fn();
  });

  describe('apiFetch', () => {
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

    it('should make POST request with body', async () => {
      const mockOrder: Order = {
        orderId: 'ORD-001',
        status: 'pending' as const,
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

    it('should handle network error (fetch failure)', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiFetch('/api/products')).rejects.toThrow(ApiError);
      await expect(apiFetch('/api/products')).rejects.toMatchObject({
        status: 500,
        message: 'Không thể kết nối đến máy chủ 8081. Hãy kiểm tra xem Backend đã chạy chưa.',
      });
    });

    it('should handle 204 No Content response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiFetch('/api/some-endpoint');

      expect(result).toEqual({});
    });

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

    it('should handle PATCH /api/admin/products/{id}/stock translation', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiFetch('/api/admin/products/123/stock', { method: 'PATCH' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8081/api/admin/inventory/123/stock',
        expect.any(Object)
      );
    });

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

    it('should handle missing localStorage (SSR)', async () => {
      // Simulate SSR environment
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

  describe('resetMockDB', () => {
    it('should log message when called', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      resetMockDB();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mock DB đã bị gỡ bỏ')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('ApiError', () => {
    it('should create ApiError with status and message', () => {
      const error = new ApiError(404, 'Not Found');

      expect(error).toBeInstanceOf(Error);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
    });
  });
});
