import { useEffect, useState } from 'react';

/**
 * Hook that debounces a value - delays updating the debounced value until after
 * wait time has elapsed since the last time the function was invoked.
 *
 * @param value - The value to debounce
 * @param delay - The number of milliseconds to delay
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on component unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
