import { useEffect, useRef } from "react";

export function useDelay(callback: () => void, delay: number, deps: any[] = []) {
  const savedCallback = useRef(callback);

  // Always keep the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(handler); // Cleanup on unmount or dep change
  }, deps); // Re-run if dependencies change
}
