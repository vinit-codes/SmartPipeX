'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchApi } from '@/lib/client/api';
import type { SensorReading } from '@/lib/types';

interface SensorStreamContextValue {
  currentReading: SensorReading | null;
  previousReading: SensorReading | null;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  start: () => void;
  stop: () => void;
  refresh: () => Promise<void>;
}

const SensorStreamContext = createContext<SensorStreamContextValue | null>(null);

export function SensorStreamProvider({
  children,
  interval = 5_000,
}: {
  children: ReactNode;
  interval?: number;
}) {
  const [currentReading, setCurrentReading] = useState<SensorReading | null>(null);
  const [previousReading, setPreviousReading] = useState<SensorReading | null>(
    null
  );
  const [isStreaming, setIsStreaming] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mounted = useRef(true);
  const currentReadingRef = useRef<SensorReading | null>(null);

  const refresh = useCallback(async () => {
    try {
      const reading = await fetchApi<SensorReading>('/api/data/live', {
        cache: 'no-store',
      });
      if (!mounted.current) return;

      setPreviousReading(currentReadingRef.current);
      currentReadingRef.current = reading;
      setCurrentReading(reading);
      setLastUpdated(new Date());
      setError(null);
    } catch (requestError) {
      if (!mounted.current) return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load live sensor data.'
      );
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isStreaming) return;

    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      await refresh();
      if (!cancelled) {
        timer = window.setTimeout(() => void poll(), interval);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [interval, isStreaming, refresh]);

  const value = useMemo<SensorStreamContextValue>(
    () => ({
      currentReading,
      previousReading,
      isStreaming,
      isLoading,
      error,
      lastUpdated,
      start: () => setIsStreaming(true),
      stop: () => setIsStreaming(false),
      refresh,
    }),
    [
      currentReading,
      previousReading,
      isStreaming,
      isLoading,
      error,
      lastUpdated,
      refresh,
    ]
  );

  return (
    <SensorStreamContext.Provider value={value}>
      {children}
    </SensorStreamContext.Provider>
  );
}

export function useSensorStream() {
  const context = useContext(SensorStreamContext);
  if (!context) {
    throw new Error('useSensorStream must be used inside SensorStreamProvider');
  }
  return context;
}
