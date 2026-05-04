import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable callback that ignores invocations occurring within `delay` ms
 * of the previous accepted invocation. Useful for "Add to cart" spam guard.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay = 400,
) {
  const lastCallRef = useRef(0);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  return useCallback(
    (...args: TArgs) => {
      const now = Date.now();
      if (now - lastCallRef.current < delay) return;
      lastCallRef.current = now;
      fnRef.current(...args);
    },
    [delay],
  );
}
