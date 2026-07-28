'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  BellRing,
  Droplets,
  Menu,
  Settings2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils';

const links = [
  { href: '/dashboard', label: 'Overview', icon: Activity },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/alerts', label: 'Alerts', icon: BellRing },
  { href: '/dashboard/consumption', label: 'Consumption', icon: Droplets },
  { href: '/dashboard/settings', label: 'System', icon: Settings2 },
];

export function DashboardNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SmartPipeX home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <Droplets className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-slate-950">SmartPipeX</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">IoT monitoring</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Dashboard navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://youtu.be/gSAjCysyyeM"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
          >
            Hardware demo
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden" aria-label="Mobile dashboard navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  pathname === href ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
