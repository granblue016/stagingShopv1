import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate } from '@/lib/format';

describe('formatPrice', () => {
  it('should format positive numbers correctly', () => {
    expect(formatPrice(100)).toBe('$100.00');
    expect(formatPrice(99.99)).toBe('$99.99');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should format large numbers correctly', () => {
    expect(formatPrice(1000)).toBe('$1,000.00');
    expect(formatPrice(1000000)).toBe('$1,000,000.00');
  });

  it('should handle decimal places correctly', () => {
    expect(formatPrice(10.5)).toBe('$10.50');
    expect(formatPrice(10.123)).toBe('$10.12');
  });

  it('should format negative numbers', () => {
    expect(formatPrice(-100)).toBe('-$100.00');
  });
});

describe('formatDate', () => {
  it('should format ISO date string correctly', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date);
    expect(formatted).toMatch(/\w+ \d+, \d{4}/);
  });

  it('should handle different date formats', () => {
    const date = '2024-12-25';
    const formatted = formatDate(date);
    expect(formatted).toBeTruthy();
  });

  it('should handle leap years', () => {
    const date = '2024-02-29';
    const formatted = formatDate(date);
    expect(formatted).toBeTruthy();
  });
});
