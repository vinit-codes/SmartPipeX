import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  Droplets,
  Gauge,
  PlayCircle,
  Radio,
  ServerCog,
  ShieldCheck,
} from 'lucide-react';

const capabilities = [
  {
    icon: Radio,
    title: 'Hardware-tested ingestion',
    description: 'ESP32 firmware sends paired flow-sensor readings to a validated HTTP endpoint.',
  },
  {
    icon: Gauge,
    title: 'Deterministic leak scoring',
    description: 'A transparent domain model classifies loss severity without hiding logic behind an AI label.',
  },
  {
    icon: Database,
    title: 'Persistent telemetry',
    description: 'MongoDB stores readings, devices, and generated alerts through a pooled server connection.',
  },
  {
    icon: BarChart3,
    title: 'Operational analytics',
    description: 'Responsive dashboards surface live flow, historical trends, alerts, consumption, and risk.',
  },
];

const engineeringPoints = [
  'API-key protected device ingestion',
  'Typed API contracts and validation',
  'Graceful simulation fallback',
  'Responsive PWA-ready interface',
  'Pure leak-analysis domain functions',
  'CI checks for lint, types, tests, and build',
];

const dataPath = [
  {
    icon: Cpu,
    title: 'ESP32 + flow sensors',
    description: 'Captures input and output pulse rates',
  },
  {
    icon: ServerCog,
    title: 'Next.js ingestion API',
    description: 'Authenticates and validates device payloads',
  },
  {
    icon: Database,
    title: 'MongoDB telemetry store',
    description: 'Persists readings, devices, and alerts',
  },
  {
    icon: BarChart3,
    title: 'Operations dashboard',
    description: 'Surfaces live status and historical insight',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_42%),radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.13),transparent_32%)]" />

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-slate-950">
              <Droplets className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">SmartPipeX</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">IoT leak monitoring</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="https://youtu.be/gSAjCysyyeM"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              Hardware demo
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
            >
              Open dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Tested with physical ESP32 hardware
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
            Real-time pipeline intelligence, from sensor to screen.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            SmartPipeX is a full-stack IoT monitoring system that receives paired flow readings, detects abnormal water loss, stores telemetry, and turns it into actionable operational dashboards.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Explore the live dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="https://youtu.be/gSAjCysyyeM"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Watch ESP32 test
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
            {['Next.js 16', 'TypeScript', 'MongoDB', 'ESP32', 'Recharts', 'PWA'].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative lg:pt-6">
          <div className="absolute -inset-6 rounded-[2rem] bg-sky-500/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-5 shadow-2xl shadow-sky-950/40 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-semibold">Pipeline 01</p>
                <p className="mt-1 text-xs text-slate-400">ESP32_DEV_PIPELINE_001</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Monitoring
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.045] p-4 ring-1 ring-white/10">
                <p className="text-xs text-slate-400">Input flow</p>
                <p className="mt-2 text-3xl font-semibold">3.18 <span className="text-xs text-slate-500">L/min</span></p>
              </div>
              <div className="rounded-2xl bg-white/[0.045] p-4 ring-1 ring-white/10">
                <p className="text-xs text-slate-400">Output flow</p>
                <p className="mt-2 text-3xl font-semibold">3.09 <span className="text-xs text-slate-500">L/min</span></p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-sky-500/10 p-5 ring-1 ring-emerald-300/15">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">System status</p>
                  <p className="mt-2 text-xl font-semibold">Flow within threshold</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">97.2% delivery efficiency with 0.09 L/min measured loss.</p>
                </div>
                <ShieldCheck className="h-7 w-7 text-emerald-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-xs text-slate-400">
              <span className="text-emerald-400">POST</span>
              /api/ingest
              <span className="ml-auto text-slate-600">201 Created</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-5 py-18 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">End-to-end engineering</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">More than a dashboard mock-up.</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">The repository includes firmware, ingestion security, domain logic, persistence, resilient fallback behaviour, analytics, documentation, and automated quality checks.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <span className="inline-flex rounded-xl bg-sky-400/10 p-2.5 text-sky-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Data path</p>
          <div className="mt-6 grid gap-3">
            {dataPath.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sky-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {description}
                  </p>
                </div>
                <span className="ml-auto text-xs font-semibold text-slate-600">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">Repository quality</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Designed to be evaluated by engineers.</h2>
          <p className="mt-4 text-base leading-7 text-slate-400">SmartPipeX keeps the engineering decisions visible: the leak model is pure and testable, simulated data is clearly labelled, production ingestion is protected, and every major workflow is documented.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {engineeringPoints.map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                {point}
              </div>
            ))}
          </div>
          <div className="mt-9">
            <Link href="/dashboard" className="inline-flex items-center font-semibold text-sky-300 hover:text-sky-200">
              Inspect the dashboard experience
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Built by Vineeth Kundu as a full-stack IoT engineering project.</p>
          <p>ESP32 · Next.js · TypeScript · MongoDB</p>
        </div>
      </footer>
    </main>
  );
}
