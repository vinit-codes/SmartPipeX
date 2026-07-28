'use client';

import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, Filter } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SourceBadge } from '@/components/dashboard/SourceBadge';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { fetchApiResult } from '@/lib/client/api';
import type { DataSource, LeakAlert, LeakSeverity } from '@/lib/types';

interface AlertsPayload {
  alerts: LeakAlert[];
  summary: { total: number; critical: number; medium: number; mild: number };
}

const severityStyles = {
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  mild: 'border-sky-200 bg-sky-50 text-sky-700',
} as const;

export default function AlertsPage() {
  const [severity, setSeverity] = useState<LeakSeverity | 'all'>('all');
  const [payload, setPayload] = useState<AlertsPayload | null>(null);
  const [source, setSource] = useState<DataSource>('simulation');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApiResult<AlertsPayload>(
        `/api/data/alerts?count=500&severity=${severity}`,
        { cache: 'no-store' }
      );
      setPayload(result.data);
      const responseSource = result.meta?.source;
      setSource(
        responseSource === 'esp32' ||
          responseSource === 'database' ||
          responseSource === 'simulation'
          ? responseSource
          : 'simulation'
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load alerts.');
    } finally {
      setLoading(false);
    }
  }, [severity]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Incident management"
        title="Leak alerts"
        description="Review detected flow-loss events, compare severity, and identify the readings that need immediate inspection."
        action={<SourceBadge source={source} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total events" value={String(payload?.summary.total || 0)} description="Events in the analysed telemetry window." icon={BellRing} tone="sky" />
        <MetricCard title="Critical" value={String(payload?.summary.critical || 0)} description="Highest severity readings requiring inspection." icon={AlertTriangle} tone="rose" />
        <MetricCard title="Medium" value={String(payload?.summary.medium || 0)} description="Sustained or elevated flow-loss readings." icon={AlertTriangle} tone="amber" />
        <MetricCard title="Mild" value={String(payload?.summary.mild || 0)} description="Early deviations above the configured threshold." icon={CheckCircle2} tone="emerald" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-semibold text-slate-950">Detected events</h2>
            <p className="mt-1 text-xs text-slate-500">Newest readings appear first</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="sr-only sm:not-sr-only">Severity</span>
            <select
              value={severity}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setSeverity(event.target.value as LeakSeverity | 'all')
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="medium">Medium</option>
              <option value="mild">Mild</option>
            </select>
          </label>
        </div>

        {loading ? (
          <LoadingState label="Loading leak events" />
        ) : error ? (
          <div className="p-6"><ErrorState message={error} /></div>
        ) : payload?.alerts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Severity</th>
                  <th className="px-6 py-3 font-semibold">Detected</th>
                  <th className="px-6 py-3 font-semibold">Device</th>
                  <th className="px-6 py-3 font-semibold">Input</th>
                  <th className="px-6 py-3 font-semibold">Output</th>
                  <th className="px-6 py-3 font-semibold">Loss</th>
                  <th className="px-6 py-3 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payload.alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <Badge className={severityStyles[alert.severity || 'mild']}>
                        {(alert.severity || 'mild').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{new Date(alert.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{alert.deviceId}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{alert.inputFlow.toFixed(2)} L/min</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{alert.outputFlow.toFixed(2)} L/min</td>
                    <td className="px-6 py-4 font-semibold text-rose-700">{alert.waterLoss.toFixed(2)} L/min</td>
                    <td className="px-6 py-4 text-slate-700">{alert.severityScore.toFixed(1)}/10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <span className="rounded-full bg-emerald-50 p-3 text-emerald-700"><CheckCircle2 className="h-6 w-6" /></span>
            <h3 className="mt-4 font-semibold text-slate-950">No matching events</h3>
            <p className="mt-1 text-sm text-slate-500">No leak readings match the selected severity.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
