'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Droplets,
  Gauge,
  Radio,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useSensorStream } from '@/components';
import { LeakStatus } from '@/components/dashboard/LeakStatus';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SourceBadge } from '@/components/dashboard/SourceBadge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { fetchApi } from '@/lib/client/api';
import type { ConsumptionSummary, LeakAlert } from '@/lib/types';

interface AlertsPayload {
  alerts: LeakAlert[];
  summary: { total: number; critical: number; medium: number; mild: number };
}

const flowBars = [
  { key: 'inputFlow', label: 'Input', barClass: 'bg-sky-500' },
  { key: 'outputFlow', label: 'Output', barClass: 'bg-emerald-500' },
] as const;

export default function DashboardPage() {
  const {
    currentReading,
    isStreaming,
    isLoading,
    error,
    lastUpdated,
    start,
    stop,
    refresh,
  } = useSensorStream();
  const [alerts, setAlerts] = useState<LeakAlert[]>([]);
  const [consumption, setConsumption] = useState<ConsumptionSummary | null>(null);

  useEffect(() => {
    void Promise.all([
      fetchApi<AlertsPayload>('/api/data/alerts?count=240'),
      fetchApi<ConsumptionSummary>('/api/data/consumption?days=7'),
    ])
      .then(([alertsPayload, consumptionPayload]) => {
        setAlerts(alertsPayload.alerts.slice(0, 4));
        setConsumption(consumptionPayload);
      })
      .catch(() => {
        // Live monitoring remains usable even when secondary widgets fail.
      });
  }, []);

  const efficiency = currentReading
    ? currentReading.inputFlow === 0
      ? 100
      : (currentReading.outputFlow / currentReading.inputFlow) * 100
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations overview"
        title="Pipeline monitoring dashboard"
        description="Live telemetry, current leak state, recent incidents, and delivery efficiency from the monitored pipeline section."
        action={
          <div className="flex items-center gap-2">
            {currentReading?.source && <SourceBadge source={currentReading.source} />}
            <button
              type="button"
              onClick={() => (isStreaming ? stop() : start())}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {isStreaming ? 'Pause stream' : 'Resume stream'}
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-lg bg-slate-950 p-2.5 text-white hover:bg-slate-800"
              aria-label="Refresh live reading"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {isLoading && !currentReading ? (
        <Card><LoadingState label="Connecting to the sensor stream" /></Card>
      ) : error && !currentReading ? (
        <ErrorState message={error} />
      ) : currentReading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Input flow"
              value={currentReading.inputFlow.toFixed(2)}
              unit="L/min"
              description="Measured at the pipeline inlet sensor."
              icon={Droplets}
              tone="sky"
            />
            <MetricCard
              title="Output flow"
              value={currentReading.outputFlow.toFixed(2)}
              unit="L/min"
              description="Measured after the monitored section."
              icon={Activity}
              tone="emerald"
            />
            <MetricCard
              title="Delivery efficiency"
              value={efficiency.toFixed(1)}
              unit="%"
              description="Output flow as a percentage of input flow."
              icon={Gauge}
              tone={efficiency >= 90 ? 'emerald' : 'amber'}
            />
            <MetricCard
              title="Device"
              value={currentReading.deviceId.replace('ESP32_', '').slice(0, 13)}
              description={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for timestamp'}
              icon={Radio}
              tone="sky"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <LeakStatus reading={currentReading} />
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">Flow comparison</h2>
                  <p className="mt-1 text-xs text-slate-500">Live inlet versus outlet measurement</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <span className={`h-2 w-2 rounded-full ${isStreaming ? 'animate-pulse bg-emerald-500' : 'bg-slate-300'}`} />
                  {isStreaming ? 'Streaming' : 'Paused'}
                </span>
              </div>
              <div className="mt-8 space-y-7">
                {flowBars.map(({ key, label, barClass }) => {
                  const value = currentReading[key];
                  const width = Math.min(
                    100,
                    (value / Math.max(currentReading.inputFlow, 4)) * 100
                  );
                  return (
                    <div key={key}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {label} sensor
                        </span>
                        <span className="font-semibold text-slate-950">
                          {value.toFixed(2)} L/min
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-sky-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Threshold-based detection</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">A leak is flagged when measured flow loss exceeds the configured 0.30 L/min threshold.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">Recent leak events</h2>
                  <p className="mt-1 text-xs text-slate-500">Most recent events from the active data source</p>
                </div>
                <Link href="/dashboard/alerts" className="inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-900">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="mt-5 divide-y divide-slate-100">
                {alerts.length ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <span className={`h-2.5 w-2.5 rounded-full ${alert.severity === 'critical' ? 'bg-rose-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-sky-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{alert.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{alert.waterLoss.toFixed(2)} L/min</span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">No recent leak events.</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">Water delivery</h2>
                  <p className="mt-1 text-xs text-slate-500">Seven-day consumption summary</p>
                </div>
                <Droplets className="h-5 w-5 text-sky-600" />
              </div>
              {consumption ? (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-sky-50 p-4">
                    <p className="text-xs font-medium text-sky-700">Delivered</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{consumption.summary.totalDelivered.toFixed(0)} L</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-4">
                    <p className="text-xs font-medium text-rose-700">Measured loss</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{consumption.summary.totalWaterLoss.toFixed(0)} L</p>
                  </div>
                  <div className="col-span-2 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Overall efficiency</span>
                      <span className="font-semibold text-slate-950">{consumption.summary.efficiency.toFixed(1)}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, consumption.summary.efficiency)}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <LoadingState label="Calculating consumption" />
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
