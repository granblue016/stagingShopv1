import { describe, it, expect } from 'vitest';
import { getNextAction, canCancel, CUSTOMER_FLOW, flowIndex } from '@/lib/order-state-machine';
import type { OrderStatus } from '@/types';

describe('getNextAction', () => {
  it('should return correct next action for PENDING', () => {
    const result = getNextAction('PENDING');
    expect(result).toEqual({ next: 'PAID', label: 'Mark as Paid' });
  });

  it('should return correct next action for PAID', () => {
    const result = getNextAction('PAID');
    expect(result).toEqual({ next: 'SHIPPED', label: 'Ship Order' });
  });

  it('should return correct next action for SHIPPED', () => {
    const result = getNextAction('SHIPPED');
    expect(result).toEqual({ next: 'DELIVERED', label: 'Mark Delivered' });
  });

  it('should return null for DELIVERED', () => {
    const result = getNextAction('DELIVERED');
    expect(result).toBeNull();
  });

  it('should return null for CANCELLED', () => {
    const result = getNextAction('CANCELLED');
    expect(result).toBeNull();
  });
});

describe('canCancel', () => {
  it('should return true for PENDING status', () => {
    expect(canCancel('PENDING')).toBe(true);
  });

  it('should return true for PAID status', () => {
    expect(canCancel('PAID')).toBe(true);
  });

  it('should return false for SHIPPED status', () => {
    expect(canCancel('SHIPPED')).toBe(false);
  });

  it('should return false for DELIVERED status', () => {
    expect(canCancel('DELIVERED')).toBe(false);
  });

  it('should return false for CANCELLED status', () => {
    expect(canCancel('CANCELLED')).toBe(false);
  });
});

describe('CUSTOMER_FLOW', () => {
  it('should have correct order flow', () => {
    expect(CUSTOMER_FLOW).toEqual(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']);
  });
});

describe('flowIndex', () => {
  it('should return correct index for PENDING', () => {
    expect(flowIndex('PENDING')).toBe(0);
  });

  it('should return correct index for PAID', () => {
    expect(flowIndex('PAID')).toBe(1);
  });

  it('should return correct index for SHIPPED', () => {
    expect(flowIndex('SHIPPED')).toBe(2);
  });

  it('should return correct index for DELIVERED', () => {
    expect(flowIndex('DELIVERED')).toBe(3);
  });

  it('should return -1 for CANCELLED', () => {
    expect(flowIndex('CANCELLED')).toBe(-1);
  });

  it('should return -1 for unknown status', () => {
    expect(flowIndex('UNKNOWN' as OrderStatus)).toBe(-1);
  });
});
