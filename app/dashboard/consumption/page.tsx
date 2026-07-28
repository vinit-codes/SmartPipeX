'use client';

import { useEffect, useState } from 'react';
import { Droplets, Gauge, TrendingDown, Waves } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import type { ConsumptionSummary } from '@/lib/types';

export default function ConsumptionPage() {
  const [data, setData] = useState<ConsumptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchApi<ConsumptionSummary>('/api/data/consumption?days=7')
      .then(setData)
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load consumption.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Water accounting"
        title="Consumption and delivery efficiency"
        description="Estimate how much water entered the monitored section, how much reached the outlet, and how much was lost between both sensors."
        action={data ? <SourceBadge source={data.source} /> : undefined}
      />

      {loading ? (
        <Card><LoadingState label="Calculating water delivery" /></Card>
      ) : error ? (
        <ErrorState message={error} />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Input volume" value={data.summary.totalInput.toFixed(0)} unit="L" description="Estimated volume measured at the inlet." icon={Waves} tone="sky" />
            <MetricCard title="Delivered volume" value={data.summary.totalDelivered.toFixed(0)} unit="L" description="Estimated volume measured at the outlet." icon={Droplets} tone="emerald" />
            <MetricCard title="Measured loss" value={data.summary.totalWaterLoss.toFixed(0)} unit="L" description="Difference between estimated input and output volume." icon={TrendingDown} tone="rose" />
            <MetricCard title="Efficiency" value={data.summary.efficiency.toFixed(1)} unit="%" description="Delivered volume divided by inlet volume." icon={Gauge} tone={data.summary.efficiency >= 90 ? 'emerald' : 'amber'} />
          </div>

          <Card className="p-5 sm:p-6">
            <div>
              <h2 className="font-semibold text-slate-950">Daily volume comparison</h2>
              <p className="mt-1 text-xs text-slate-500">Estimated litres from five-minute flow readings</p>
            </div>
            <div className="mt-6 h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.consumption} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} unit=" L" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
                    formatter={(value) => `${Number(value).toFixed(0)} L`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 14 }} />
                  <Bar dataKey="inputVolume" name="Input volume" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="deliveredVolume" name="Delivered volume" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="waterLoss" name="Measured loss" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {data.consumption.map((point) => (
              <Card key={point.label} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-950">{point.label}</p>
                  <span className={`text-sm font-semibold ${point.efficiency >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>{point.efficiency.toFixed(1)}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, point.efficiency)}%` }} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-slate-500">Delivered</dt><dd className="mt-1 font-semibold text-slate-900">{point.deliveredVolume.toFixed(0)} L</dd></div>
                  <div><dt className="text-xs text-slate-500">Loss</dt><dd className="mt-1 font-semibold text-rose-700">{point.waterLoss.toFixed(0)} L</dd></div>
                </dl>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
