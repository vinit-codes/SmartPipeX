'use client';

import { Button, useSensorStream } from '@/components';
import { formatDate } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PWAInstallPrompt,
  PWAUpdateNotification,
  PWAStatusBadge,
} from '@/components/PWAComponents';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const valueVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity },
  },
};

// Status indicator component
function StatusIndicator({
  isActive,
  size = 'sm',
}: {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <motion.div
      className={`rounded-full ${sizeClass} ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
      variants={isActive ? pulseVariants : {}}
      animate={isActive ? 'pulse' : 'initial'}
    />
  );
}

// Enhanced metric card component
function MetricCard({
  title,
  value,
  unit,
  trend,
  status,
  icon,
}: {
  title: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
  icon?: string;
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'from-red-500 to-red-600 text-white';
      case 'warning':
        return 'from-yellow-400 to-yellow-500 text-white';
      default:
        return 'from-blue-500 to-blue-600 text-white';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getStatusColor()} p-6 shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
          </div>
          <motion.div
            key={value}
            variants={valueVariants}
            initial="hidden"
            animate="visible"
            className="mt-2"
          >
            <span className="text-3xl font-bold">{value}</span>
            <span className="ml-1 text-sm opacity-75">{unit}</span>
          </motion.div>
        </div>
        {trend && (
          <motion.div
            className={`text-xl ${getTrendColor()}`}
            animate={{
              rotateZ: trend === 'up' ? -45 : trend === 'down' ? 45 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {getTrendIcon()}
          </motion.div>
        )}
      </div>

      {/* Animated background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        animate={{
          x: ['-100%', '100%'],
          opacity: [0, 0.1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
    </motion.div>
  );
}

// Leak status banner component
function LeakStatusBanner({
  isLeaking,
  waterLoss,
}: {
  isLeaking: boolean;
  waterLoss: number;
}) {
  if (!isLeaking) return null;

  const severity =
    waterLoss > 2 ? 'critical' : waterLoss > 1 ? 'warning' : 'minor';

  const getBannerStyles = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-orange-500 border-orange-600';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`mb-6 rounded-lg border-2 ${getBannerStyles()} p-4 text-white shadow-lg`}
      >
        <motion.div
          className="flex items-center gap-4"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            🚨
          </motion.span>
          <div>
            <h3 className="text-xl font-bold">
              {severity === 'critical'
                ? 'CRITICAL LEAK DETECTED'
                : 'LEAK DETECTED'}
            </h3>
            <p className="text-sm opacity-90">
              Water loss: {waterLoss} L/min - Immediate attention required
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DashboardPage() {
  const currentDate = formatDate(new Date());
  const {
    currentReading,
    previousReading,
    isStreaming,
    error,
    start,
    stop,
    lastUpdated,
  } = useSensorStream();

  // Use real-time reading or fallback to generated data for display
  const displayReading = currentReading || {
    timestamp: new Date().toISOString(),
    inputFlow: 0,
    outputFlow: 0,
    waterLoss: 0,
    leakDetected: false,
  };

  // Calculate trends
  const getTrend = (current: number, previous: number) => {
    const diff = Math.abs(current - previous);
    if (diff < 0.01) return 'stable';
    return current > previous ? 'up' : 'down';
  };

  const inputTrend = previousReading
    ? getTrend(displayReading.inputFlow, previousReading.inputFlow)
    : 'stable';
  const outputTrend = previousReading
    ? getTrend(displayReading.outputFlow, previousReading.outputFlow)
    : 'stable';

  // Determine leak status
  const getLeakStatus = () => {
    if (!displayReading.leakDetected) return 'normal';
    return displayReading.waterLoss > 2 ? 'critical' : 'warning';
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl"
      >
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold text-gray-900"
            >
              Pipeline Monitoring Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-2 text-gray-600"
            >
              Real-time leak detection system - {currentDate}
            </motion.p>
          </div>

          {/* PWA Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <PWAStatusBadge />
          </motion.div>
        </div>

        {/* Leak Alert Banner */}
        <LeakStatusBanner
          isLeaking={displayReading.leakDetected}
          waterLoss={displayReading.waterLoss}
        />

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8 rounded-xl bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <StatusIndicator isActive={isStreaming} size="md" />
                <span className="text-lg font-semibold text-gray-900">
                  {isStreaming ? 'Live Stream Active' : 'Stream Inactive'}
                </span>
              </div>
              {lastUpdated && (
                <motion.span
                  key={lastUpdated.getTime()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700"
                >
                  Updated: {lastUpdated.toLocaleTimeString()}
                </motion.span>
              )}
              {error && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-full bg-red-50 px-3 py-1 text-sm text-red-700"
                >
                  Error: {error}
                </motion.span>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant={isStreaming ? 'outline' : 'primary'}
                onClick={isStreaming ? stop : start}
              >
                {isStreaming ? 'Stop Stream' : 'Start Stream'}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Metrics Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Input Flow"
            value={displayReading.inputFlow}
            unit="L/min"
            trend={inputTrend}
            icon="🌊"
            status="normal"
          />

          <MetricCard
            title="Output Flow"
            value={displayReading.outputFlow}
            unit="L/min"
            trend={outputTrend}
            icon="💧"
            status="normal"
          />

          <MetricCard
            title="Water Loss"
            value={displayReading.waterLoss}
            unit="L/min"
            icon="⚠️"
            status={getLeakStatus()}
          />

          <MetricCard
            title="System Efficiency"
            value={
              displayReading.inputFlow > 0
                ? parseFloat(
                    (
                      (displayReading.outputFlow / displayReading.inputFlow) *
                      100
                    ).toFixed(1)
                  )
                : 0
            }
            unit="%"
            icon="📊"
            status={displayReading.leakDetected ? 'warning' : 'normal'}
          />
        </div>

        {/* Real-time Data Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-8 rounded-xl bg-white p-6 shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Live Pipeline Status
          </h2>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Flow Visualization */}
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-green-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Flow Analysis
                  </h3>
                  {currentReading && (
                    <motion.span
                      key={currentReading.timestamp}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                    >
                      Live Data
                    </motion.span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Input Flow Bar */}
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-blue-700">
                        Input Flow
                      </span>
                      <span className="text-blue-600">
                        {displayReading.inputFlow} L/min
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-blue-100">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (displayReading.inputFlow / 4) * 100)}%`,
                        }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Output Flow Bar */}
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-green-700">
                        Output Flow
                      </span>
                      <span className="text-green-600">
                        {displayReading.outputFlow} L/min
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-green-100">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (displayReading.outputFlow / 4) * 100)}%`,
                        }}
                        transition={{
                          duration: 1,
                          ease: 'easeOut',
                          delay: 0.2,
                        }}
                      />
                    </div>
                  </div>

                  {/* Water Loss Indicator */}
                  {displayReading.waterLoss > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-red-700">
                          Water Loss
                        </span>
                        <span className="text-red-600">
                          {displayReading.waterLoss} L/min
                        </span>
                      </div>
                      <div className="h-4 rounded-full bg-red-100">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, (displayReading.waterLoss / 2) * 100)}%`,
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Panel */}
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-semibold text-gray-800">
                  System Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stream Status</span>
                    <span
                      className={`text-sm font-medium ${isStreaming ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {isStreaming ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Leak Detection
                    </span>
                    <span
                      className={`text-sm font-medium ${displayReading.leakDetected ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {displayReading.leakDetected ? 'Alert' : 'Normal'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <span className="text-sm font-medium text-blue-600">
                      {displayReading.inputFlow > 0
                        ? (
                            (displayReading.outputFlow /
                              displayReading.inputFlow) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {currentReading && (
                <motion.div
                  key={currentReading.timestamp}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg bg-blue-50 p-4"
                >
                  <h4 className="mb-2 font-semibold text-blue-900">
                    Latest Reading
                  </h4>
                  <p className="text-xs text-blue-700">
                    {new Date(currentReading.timestamp).toLocaleString()}
                  </p>
                  <motion.div
                    className={`mt-2 rounded px-2 py-1 text-xs font-medium ${
                      currentReading.leakDetected
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                    animate={
                      currentReading.leakDetected ? { scale: [1, 1.05, 1] } : {}
                    }
                    transition={{
                      duration: 1,
                      repeat: currentReading.leakDetected ? Infinity : 0,
                    }}
                  >
                    {currentReading.leakDetected
                      ? '🚨 Leak Detected'
                      : '✅ All Systems Normal'}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="rounded-xl bg-white p-6 shadow-lg"
        >
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="primary">📊 View Reports</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="secondary">📥 Export Data</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline">⚙️ System Settings</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost">🔔 Configure Alerts</Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* PWA Components */}
      <PWAInstallPrompt />
      <PWAUpdateNotification />
    </div>
  );
}
