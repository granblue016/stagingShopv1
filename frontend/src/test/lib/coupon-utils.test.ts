import { describe, it, expect } from 'vitest';
import { calculateOrderTotals, isCouponValid, applyDiscount } from '@/lib/coupon-utils';
import type { Coupon } from '@/types';

describe('Coupon Utils', () => {
  describe('calculateOrderTotals', () => {
    it('should calculate discount for PERCENT coupon', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT20',
        type: 'PERCENT',
        value: 20,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
        minSpend: 0, // Add minSpend to pass validation
        usageLimit: null, // No usage limit
        usedCount: 0,
      };

      const result = calculateOrderTotals(100, coupon);

      expect(result.discount).toBe(20); // 20% of 100
      expect(result.shippingFee).toBe(50000);
      expect(result.total).toBe(100 - 20 + 50000);
    });

    it('should calculate discount for FIXED coupon', () => {
      const coupon: Coupon = {
        id: 2,
        code: 'FIXED20',
        type: 'FIXED',
        value: 20,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
        minSpend: 0, // Add minSpend to pass validation
        usageLimit: undefined, // No usage limit
        usedCount: 0,
      };

      const result = calculateOrderTotals(100, coupon);

      expect(result.discount).toBe(20); // Fixed $20
      expect(result.shippingFee).toBe(50000);
      expect(result.total).toBe(100 - 20 + 50000);
    });

    it('should return zero discount when no coupon', () => {
      const result = calculateOrderTotals(100, null);

      expect(result.discount).toBe(0);
      expect(result.shippingFee).toBe(50000);
      expect(result.total).toBe(100 + 50000);
    });

    it('should not charge shipping fee when subtotal is zero', () => {
      const result = calculateOrderTotals(0, null);

      expect(result.shippingFee).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should handle custom shipping fee', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT10',
        type: 'PERCENT',
        value: 10,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
        minSpend: 0, // Add minSpend to pass validation
        usageLimit: undefined, // No usage limit
        usedCount: 0,
      };

      const result = calculateOrderTotals(100, coupon, 25000);

      expect(result.shippingFee).toBe(25000);
      expect(result.total).toBe(100 - 10 + 25000);
    });

    it('should ensure total is never negative', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'FIXED1000',
        type: 'FIXED',
        value: 1000,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
      };

      const result = calculateOrderTotals(100, coupon);

      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle large discount that exceeds subtotal', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT150',
        type: 'PERCENT',
        value: 150,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
        minSpend: 0, // Add minSpend to pass validation
        usageLimit: undefined, // No usage limit
        usedCount: 0,
      };

      const result = calculateOrderTotals(100, coupon);

      expect(result.discount).toBe(150); // 150% of 100
      expect(result.total).toBeGreaterThanOrEqual(0); // Total should be >= 0
    });
  });

  describe('isCouponValid', () => {
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
    it('should apply PERCENT discount correctly', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT20',
        type: 'PERCENT',
        value: 20,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(100, coupon)).toBe(80);
      expect(applyDiscount(50, coupon)).toBe(40);
    });

    it('should apply FIXED discount correctly', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'FIXED20',
        type: 'FIXED',
        value: 20,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(100, coupon)).toBe(80);
      expect(applyDiscount(50, coupon)).toBe(30);
    });

    it('should return original price when coupon is null', () => {
      expect(applyDiscount(100, null)).toBe(100);
    });

    it('should return original price when coupon is inactive', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'INACTIVE',
        type: 'PERCENT',
        value: 20,
        expiryDate: '2025-12-31',
        active: false,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(100, coupon)).toBe(100);
    });

    it('should ensure discounted price is never negative', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'FIXED1000',
        type: 'FIXED',
        value: 1000,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(100, coupon)).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero original price', () => {
      const coupon: Coupon = {
        id: 1,
        code: 'PERCENT20',
        type: 'PERCENT',
        value: 20,
        expiryDate: '2025-12-31',
        active: true,
        createdAt: '2024-01-01',
      };

      expect(applyDiscount(0, coupon)).toBe(0);
    });
  });
});
