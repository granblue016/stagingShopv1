import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call the callback immediately on first invocation', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 400));

    act(() => {
      result.current('arg1', 'arg2');
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should debounce rapid invocations', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 400));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    // Should only call once with the last accepted invocation
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');
  });

  it('should allow invocation after delay period', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 400));

    act(() => {
      result.current('first');
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Fast-forward past the delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current('second');
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('second');
  });

  it('should update callback when function changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ fn, delay }) => useDebouncedCallback(fn, delay),
      { initialProps: { fn: callback1, delay: 400 } }
    );

    act(() => {
      result.current('arg');
    });

    expect(callback1).toHaveBeenCalledWith('arg');

    rerender({ fn: callback2, delay: 400 });

    act(() => {
      vi.advanceTimersByTime(500);
      result.current('arg2');
    });

    expect(callback2).toHaveBeenCalledWith('arg2');
  });

  it('should handle default delay of 400ms', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    act(() => {
      result.current('first');
      result.current('second');
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should respect custom delay', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 1000));

    act(() => {
      result.current('first');
    });

    act(() => {
      vi.advanceTimersByTime(500);
      result.current('second');
    });

    // Should still debounce because 500ms < 1000ms
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
