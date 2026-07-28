import Link from 'next/link';
import { ArrowLeft, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-sky-300"><WifiOff className="h-8 w-8" /></span>
        <h1 className="mt-6 text-3xl font-semibold">You are offline</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">SmartPipeX needs a network connection to retrieve current sensor telemetry. Previously cached application pages may still be available.</p>
        <Link href="/dashboard" className="mt-7 inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
