import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes with undefined/null', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
  });

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });

  it('should handle conflicting tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle objects with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should handle mixed inputs', () => {
    expect(cn('foo', { bar: true, baz: false }, ['qux'])).toBe('foo bar qux');
  });

  it('should return empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});
