'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Gauge,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SourceBadge } from '@/components/dashboard/SourceBadge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { fetchApi } from '@/lib/client/api';
import type { RiskAnalysis, SensorReading } from '@/lib/types';

export default function AnalyticsPage() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [risk, setRisk] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetchApi<SensorReading[]>('/api/data/history?count=144'),
      fetchApi<RiskAnalysis>('/api/data/predict'),
    ])
      .then(([history, analysis]) => {
        setReadings(history);
        setRisk(analysis);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load analytics.');
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(
    () =>
      readings.map((reading) => ({
        time: new Date(reading.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        input: reading.inputFlow,
        output: reading.outputFlow,
        loss: reading.waterLoss,
      })),
    [readings]
  );

  const peakLoss = readings.reduce((max, reading) => Math.max(max, reading.waterLoss), 0);
  const leakCount = readings.filter((reading) => reading.leakDetected).length;
  const averageInput = readings.length
    ? readings.reduce((sum, reading) => sum + reading.inputFlow, 0) / readings.length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Historical analysis"
        title="Flow performance and risk"
        description="Inspect historical sensor behaviour and a transparent heuristic risk score calculated from recent leak frequency, loss volume, and critical events."
        action={readings[0]?.source ? <SourceBadge source={readings[0].source} /> : undefined}
      />

      {loading ? (
        <Card><LoadingState label="Loading historical telemetry" /></Card>
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Risk score"
              value={risk?.riskScore.toFixed(1) || '0.0'}
              unit="/100"
              description={`${risk?.riskCategory || 'Low'} operational risk based on recent readings.`}
              icon={ShieldCheck}
              tone={risk?.riskCategory === 'High' ? 'rose' : risk?.riskCategory === 'Moderate' ? 'amber' : 'emerald'}
            />
            <MetricCard
              title="Leak events"
              value={String(leakCount)}
              description={`${readings.length} readings analysed in the selected window.`}
              icon={AlertTriangle}
              tone={leakCount > 8 ? 'rose' : 'amber'}
            />
            <MetricCard
              title="Peak water loss"
              value={peakLoss.toFixed(2)}
              unit="L/min"
              description="Largest input-output difference in the dataset."
              icon={TrendingUp}
              tone="rose"
            />
            <MetricCard
              title="Average input"
              value={averageInput.toFixed(2)}
              unit="L/min"
              description="Average measured inlet flow across the selected period."
              icon={Gauge}
              tone="sky"
            />
          </div>

          <Card className="p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h2 className="font-semibold text-slate-950">Input and output flow</h2>
                <p className="mt-1 text-xs text-slate-500">Recent telemetry samples</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="h-4 w-4 text-sky-600" />
                {readings.length} data points
              </div>
            </div>
            <div className="mt-6 h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" minTickGap={28} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} unit=" L" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
                    formatter={(value) => `${Number(value).toFixed(2)} L/min`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 14 }} />
                  <Line type="monotone" dataKey="input" name="Input flow" stroke="#0ea5e9" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="output" name="Output flow" stroke="#10b981" strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Risk model</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight text-slate-950">{risk?.riskScore.toFixed(1)}</span>
                <span className="pb-1 text-sm text-slate-500">out of 100</span>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${risk?.riskCategory === 'High' ? 'bg-rose-500' : risk?.riskCategory === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, risk?.riskScore || 0)}%` }}
                />
              </div>
              <dl className="mt-7 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs text-slate-500">Leak frequency</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{risk?.leakFrequency.toFixed(1)}%</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs text-slate-500">Flow efficiency</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{risk?.efficiency.toFixed(1)}%</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-950">Maintenance recommendation</h2>
                  <p className="mt-1 text-xs text-slate-500">Derived from measurable telemetry, not a black-box prediction</p>
                </div>
              </div>
              <p className="mt-6 text-lg leading-8 text-slate-700">{risk?.recommendation}</p>
              <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                The score combines leak frequency, average water loss, and the proportion of critical readings. The complete formula lives in <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-slate-800">lib/domain/leak-detection.ts</code> and is covered by tests.
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
