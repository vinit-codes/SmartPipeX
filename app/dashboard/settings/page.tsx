'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  Code2,
  Cpu,
  Database,
  KeyRound,
  ServerCog,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { fetchApi } from '@/lib/client/api';

interface HealthResponse {
  status: 'healthy' | 'degraded';
  database: 'connected' | 'unavailable' | 'not-configured';
  version: string;
  timestamp: string;
}

const architectureSteps = [
  {
    icon: Cpu,
    title: 'ESP32 device',
    description: 'Reads inlet and outlet flow sensors',
  },
  {
    icon: ShieldCheck,
    title: 'Validated ingestion',
    description: 'Checks API key, payload, ranges, and timestamp',
  },
  {
    icon: ServerCog,
    title: 'Domain service',
    description: 'Calculates water loss and leak severity',
  },
  {
    icon: Database,
    title: 'MongoDB',
    description: 'Stores readings, device heartbeat, and alerts',
  },
  {
    icon: Cloud,
    title: 'Next.js dashboard',
    description: 'Polls typed APIs and renders operational analytics',
  },
];

const endpoints = [
  {
    method: 'POST',
    route: '/api/ingest',
    description: 'Validate and persist ESP32 sensor readings',
  },
  {
    method: 'GET',
    route: '/api/data/live',
    description: 'Return the latest reading or labelled simulation fallback',
  },
  {
    method: 'GET',
    route: '/api/data/history',
    description: 'Return historical telemetry for charts and analysis',
  },
  {
    method: 'GET',
    route: '/api/data/alerts',
    description: 'Return leak-only readings filtered by severity',
  },
  {
    method: 'GET',
    route: '/api/data/predict',
    description: 'Calculate the transparent operational risk score',
  },
];

export default function SystemPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchApi<HealthResponse>('/api/health', { cache: 'no-store' })
      .then(setHealth)
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load system health.');
      });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System design"
        title="Integration and runtime status"
        description="Inspect the application data path, production environment requirements, and the API surface used by ESP32 devices and the monitoring dashboard."
      />

      {error ? (
        <ErrorState message={error} />
      ) : !health ? (
        <Card><LoadingState label="Checking application health" /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span>
              <Badge className={health.status === 'healthy' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>{health.status}</Badge>
            </div>
            <p className="mt-5 text-sm text-slate-500">Application</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">API operational</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-sky-50 p-2.5 text-sky-700"><Database className="h-5 w-5" /></span>
              <Badge className={health.database === 'connected' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : health.database === 'not-configured' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-rose-200 bg-rose-50 text-rose-700'}>{health.database}</Badge>
            </div>
            <p className="mt-5 text-sm text-slate-500">MongoDB</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{health.database === 'connected' ? 'Telemetry enabled' : 'Simulation fallback'}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><ShieldCheck className="h-5 w-5" /></span>
              <Badge className="border-slate-200 bg-slate-50 text-slate-600">v{health.version}</Badge>
            </div>
            <p className="mt-5 text-sm text-slate-500">Ingestion security</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">API key supported</p>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Architecture</p>
          <div className="mt-5 space-y-3">
            {architectureSteps.map(
              ({ icon: Icon, title, description }, index) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-xl border border-slate-200 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">
                        {title}
                      </p>
                      <span className="text-[10px] font-bold text-slate-300">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-sky-50 p-2.5 text-sky-700"><Code2 className="h-5 w-5" /></span>
              <div><h2 className="font-semibold text-slate-950">API surface</h2><p className="mt-1 text-xs text-slate-500">Small, explicit routes mapped to system responsibilities</p></div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {endpoints.map(({ method, route, description }) => (
              <div key={route} className="grid gap-2 p-5 sm:grid-cols-[64px_190px_1fr] sm:items-center">
                <Badge className={method === 'POST' ? 'w-fit border-emerald-200 bg-emerald-50 text-emerald-700' : 'w-fit border-sky-200 bg-sky-50 text-sky-700'}>{method}</Badge>
                <code className="font-mono text-xs font-semibold text-slate-800">{route}</code>
                <p className="text-xs leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="grid gap-7 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><KeyRound className="h-5 w-5" /></span>
              <div><h2 className="font-semibold text-slate-950">Production environment</h2><p className="mt-1 text-xs text-slate-500">Secrets are never committed to the repository</p></div>
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-300">
              <div><span className="text-sky-300">MONGODB_URI</span>=mongodb+srv://...</div>
              <div><span className="text-sky-300">MONGODB_DB</span>=smartpipex</div>
              <div><span className="text-sky-300">INGEST_API_KEY</span>=replace-with-a-long-random-secret</div>
              <div><span className="text-sky-300">DEFAULT_DEVICE_ID</span>=ESP32_DEV_PIPELINE_001</div>
              <div><span className="text-sky-300">LEAK_THRESHOLD_LPM</span>=0.3</div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <h3 className="font-semibold text-amber-950">Hardware mode needs MongoDB</h3>
                <p className="mt-2 text-sm leading-6 text-amber-900/75">Without a database connection, read APIs intentionally fall back to deterministic simulation data and label that source in the interface. The ingestion endpoint returns a clear 503 response instead of pretending sensor data was stored.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
