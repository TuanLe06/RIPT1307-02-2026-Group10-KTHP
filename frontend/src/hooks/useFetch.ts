import { useCallback, useRef, useState } from 'react';

interface FetchState<T> {
  data: T | null;
  total: number;
  error: string | null;
}

export function useFetch<T>() {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    total: 0,
    error: null,
  });
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (fetcher: () => Promise<{ data: T[]; total: number }>) => {
      try {
        const result = await fetcher();
        if (mountedRef.current) {
          setState({ data: result.data as T, total: result.total, error: null });
        }
      } catch (err: unknown) {
        if (mountedRef.current) {
          const msg =
            err instanceof Error ? err.message : 'Đã xảy ra lỗi';
          setState({ data: null, total: 0, error: msg });
        }
      }
    },
    [],
  );

  const setError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return { ...state, execute, setError };
}
