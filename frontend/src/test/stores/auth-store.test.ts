import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, purgeSession } from '@/stores/auth-store';
import type { User } from '@/types';
import { useCartStore } from '@/stores/cart-store';

// Mock apiFetch
vi.mock('@/lib/api-service', () => ({
  apiFetch: vi.fn(),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    // Reset auth store
    useAuthStore.setState({ user: null, token: null, idToken: null });
    // Reset cart store
    useCartStore.getState().clear();
  });

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

    it('should update idToken when new token is provided', () => {
      useAuthStore.setState({ idToken: 'old-token' });
      useAuthStore.getState().setIdToken('new-token');
      
      expect(useAuthStore.getState().idToken).toBe('new-token');
    });

    it('should persist idToken across state updates', () => {
      useAuthStore.getState().setIdToken('persistent-token');
      useAuthStore.setState({ user: null }); // Other state change
      
      expect(useAuthStore.getState().idToken).toBe('persistent-token');
    });
  });

  describe('purgeSession', () => {
    it('should clear cart store', () => {
      // Add item to cart
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
      // Mock localStorage to throw error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      expect(() => purgeSession()).not.toThrow();
      
      localStorage.removeItem = originalRemoveItem;
    });
  });
});
