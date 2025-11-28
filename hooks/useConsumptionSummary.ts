'use client';

import { useState, useEffect } from 'react';

interface ConsumptionSummary {
  todayConsumption: number;
  weeklyAverage: number;
  monthlyProjection: number;
  efficiency: number;
  trend: number;
  source: string;
}

export function useConsumptionSummary() {
  const [summary, setSummary] = useState<ConsumptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/data/consumption?period=daily&days=7');
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        const todayData = data.consumption[data.consumption.length - 1];

        setSummary({
          todayConsumption: todayData?.totalConsumption || 0,
          weeklyAverage: data.summary.dailyAverage,
          monthlyProjection: data.summary.monthlyProjection,
          efficiency: data.summary.efficiency,
          trend: data.summary.weeklyTrend,
          source: data.source,
        });
      } else {
        setError(result.error || 'Failed to fetch consumption data');
      }
    } catch (err) {
      setError('Network error while fetching consumption data');
      console.error('Consumption summary fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();

    // Refresh every 5 minutes
    const interval = setInterval(fetchSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { summary, loading, error, refetch: fetchSummary };
}
