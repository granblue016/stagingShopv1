import { describe, it, expect } from 'vitest';
import { getNextAction, canCancel, CUSTOMER_FLOW, flowIndex } from '@/lib/order-state-machine';
import type { OrderStatus } from '@/types';

describe('getNextAction', () => {
  it('should return correct next action for pending', () => {
    const result = getNextAction('pending');
    expect(result).toEqual({ next: 'paid', label: 'Mark as Paid' });
  });

  it('should return correct next action for paid', () => {
    const result = getNextAction('paid');
    expect(result).toEqual({ next: 'shipped', label: 'Ship Order' });
  });

  it('should return correct next action for shipped', () => {
    const result = getNextAction('shipped');
    expect(result).toEqual({ next: 'delivered', label: 'Mark Delivered' });
  });

  it('should return null for delivered', () => {
    const result = getNextAction('delivered');
    expect(result).toBeNull();
  });

  it('should return null for cancelled', () => {
    const result = getNextAction('cancelled');
    expect(result).toBeNull();
  });
});

describe('canCancel', () => {
  it('should return true for pending status', () => {
    expect(canCancel('pending')).toBe(true);
  });

  it('should return true for paid status', () => {
    expect(canCancel('paid')).toBe(true);
  });

  it('should return false for shipped status', () => {
    expect(canCancel('shipped')).toBe(false);
  });

  it('should return false for delivered status', () => {
    expect(canCancel('delivered')).toBe(false);
  });

  it('should return false for cancelled status', () => {
    expect(canCancel('cancelled')).toBe(false);
  });
});

describe('CUSTOMER_FLOW', () => {
  it('should have correct order flow', () => {
    expect(CUSTOMER_FLOW).toEqual(['pending', 'paid', 'shipped', 'delivered']);
  });
});

describe('flowIndex', () => {
  it('should return correct index for pending', () => {
    expect(flowIndex('pending')).toBe(0);
  });

  it('should return correct index for paid', () => {
    expect(flowIndex('paid')).toBe(1);
  });

  it('should return correct index for shipped', () => {
    expect(flowIndex('shipped')).toBe(2);
  });

  it('should return correct index for delivered', () => {
    expect(flowIndex('delivered')).toBe(3);
  });

  it('should return -1 for cancelled', () => {
    expect(flowIndex('cancelled')).toBe(-1);
  });

  it('should return -1 for unknown status', () => {
    expect(flowIndex('UNKNOWN' as OrderStatus)).toBe(-1);
  });
});
