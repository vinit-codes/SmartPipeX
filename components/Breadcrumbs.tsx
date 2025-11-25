'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

const pathNameMap: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/alerts': 'Alerts',
  '/dashboard/settings': 'Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    const title =
      pathNameMap[href] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      title,
      href,
      isLast,
    };
  });

  // Don't show breadcrumbs if we're at home
  if (pathname === '/' || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
      <Link
        href="/"
        className="flex items-center transition-colors hover:text-gray-900"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((breadcrumb) => (
        <div key={breadcrumb.href} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />

          {breadcrumb.isLast ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-medium text-gray-900"
            >
              {breadcrumb.title}
            </motion.span>
          ) : (
            <Link
              href={breadcrumb.href}
              className={clsx(
                'transition-colors hover:text-gray-900',
                'rounded-sm px-1 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
              )}
            >
              {breadcrumb.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
