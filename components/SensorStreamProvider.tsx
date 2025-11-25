'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { SensorReading } from '@/lib/mockData';

interface SensorStreamContextType {
  currentReading: SensorReading | null;
  previousReading: SensorReading | null;
  isStreaming: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  lastUpdated: Date | null;
}

const SensorStreamContext = createContext<SensorStreamContextType | undefined>(
  undefined
);

interface SensorStreamProviderProps {
  children: React.ReactNode;
  autoStart?: boolean;
  interval?: number;
}

export function SensorStreamProvider({
  children,
  autoStart = true,
  interval = 1000,
}: SensorStreamProviderProps) {
  const [currentReading, setCurrentReading] = useState<SensorReading | null>(
    null
  );
  const [previousReading, setPreviousReading] = useState<SensorReading | null>(
    null
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchLiveData = useCallback(async () => {
    try {
      const response = await fetch('/api/data/live');
      const result = await response.json();

      if (!isMountedRef.current) return; // Prevent state updates if unmounted

      if (result.success && result.data) {
        setPreviousReading((prev) => prev);
        setCurrentReading((prev) => {
          setPreviousReading(prev);
          return result.data;
        });
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch sensor data');
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      console.error('Error fetching live sensor data:', err);
    }
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsStreaming(true);
    setError(null);

    // Fetch immediately
    fetchLiveData();

    // Set up interval
    intervalRef.current = setInterval(fetchLiveData, interval);
  }, [fetchLiveData, interval]);

  // Auto-start on mount and handle cleanup
  useEffect(() => {
    isMountedRef.current = true;

    if (autoStart) {
      const timer = setTimeout(() => {
        start();
      }, 0);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoStart, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update interval when it changes
  useEffect(() => {
    if (isStreaming) {
      const timer = setTimeout(() => {
        stop();
        start();
      }, 0);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [interval, isStreaming, stop, start]);

  const contextValue: SensorStreamContextType = {
    currentReading,
    previousReading,
    isStreaming,
    error,
    start,
    stop,
    lastUpdated,
  };

  return (
    <SensorStreamContext.Provider value={contextValue}>
      {children}
    </SensorStreamContext.Provider>
  );
}

export function useSensorStream(): SensorStreamContextType {
  const context = useContext(SensorStreamContext);
  if (context === undefined) {
    throw new Error(
      'useSensorStream must be used within a SensorStreamProvider'
    );
  }
  return context;
}
