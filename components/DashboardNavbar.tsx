'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  AlertTriangle,
  Settings,
  Home,
  Activity,
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main dashboard',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Charts & insights',
  },
  {
    name: 'Alerts',
    href: '/dashboard/alerts',
    icon: AlertTriangle,
    description: 'System alerts',
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configuration',
  },
];

export function DashboardNavbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Activity className="h-5 w-5 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                  SmartPipeX
                </h1>
                <p className="-mt-1 text-xs text-gray-500">Pipeline Monitor</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className={clsx(
                      'relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      'group flex items-center space-x-2',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative">
                      <Icon
                        className={clsx(
                          'h-4 w-4 transition-colors',
                          isActive
                            ? 'text-blue-600'
                            : 'text-gray-500 group-hover:text-gray-700'
                        )}
                      />
                      {/* Show alert indicator on Alerts tab */}
                      {item.name === 'Alerts' && (
                        <motion.div
                          className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                    </div>
                    <span className="hidden sm:block">{item.name}</span>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="inset-x0 absolute -bottom-px h-0.5 rounded-full bg-blue-600"
                        layoutId="navbar-indicator"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Quick Status */}
          <div className="flex items-center space-x-3">
            {/* System Status Indicator */}
            <div className="hidden items-center space-x-2 md:flex">
              <div className="flex items-center space-x-1">
                <motion.div
                  className="h-2 w-2 rounded-full bg-green-500"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <span className="text-xs text-gray-500">System Online</span>
              </div>
            </div>

            {/* Home Button */}
            <Link href="/">
              <motion.div
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Home"
              >
                <Home className="h-5 w-5" />
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Mobile Navigation Drawer (for future use)
export function MobileNavDrawer() {
  return (
    <div className="md:hidden">
      {/* Mobile nav implementation can be added here */}
    </div>
  );
}
