'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-slate-500">
      <Link href="/dashboard" className="rounded p-1 hover:bg-slate-100 hover:text-slate-800">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = `/${segments.slice(0, index + 2).join('/')}`;
        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link href={href} className="capitalize hover:text-slate-800">
              {segment.replaceAll('-', ' ')}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
