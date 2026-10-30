import { useState, useEffect, useCallback, useRef } from 'react';

export function usePolling(fetchFn, intervalMs = 15000, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Polling error:', e);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh, intervalMs]);

  return { data, loading, lastUpdated, refresh };
}
