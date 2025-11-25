'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  AlertTriangle,
  Settings,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    name: 'Real-time Monitoring',
    description:
      'Live sensor data streaming with intelligent leak detection and severity scoring.',
    icon: Activity,
    color: 'bg-blue-500',
  },
  {
    name: 'Analytics & Insights',
    description:
      'Interactive charts and AI-powered predictive maintenance recommendations.',
    icon: BarChart3,
    color: 'bg-green-500',
  },
  {
    name: 'Alert Management',
    description:
      'Categorized alerts with severity levels and comprehensive filtering options.',
    icon: AlertTriangle,
    color: 'bg-yellow-500',
  },
  {
    name: 'Smart Settings',
    description:
      'Configurable thresholds and notification preferences with localStorage persistence.',
    icon: Settings,
    color: 'bg-purple-500',
  },
];

const quickLinks = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    description: 'Main monitoring interface',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    description: 'Charts & insights',
  },
  { name: 'Alerts', href: '/dashboard/alerts', description: 'System alerts' },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    description: 'Configuration',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-6 flex items-center justify-center">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Activity className="h-8 w-8 text-white" />
            </motion.div>
          </div>

          <h1 className="mb-6 text-6xl font-bold text-gray-900">
            Smart<span className="text-blue-600">PipeX</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
            Intelligent pipeline leak detection and monitoring system with
            real-time analytics, predictive maintenance, and comprehensive alert
            management.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-4`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {feature.name}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16 text-center"
        >
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
            >
              Launch Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl"
        >
          <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">
            Quick Access
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {link.name}
                  </h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
