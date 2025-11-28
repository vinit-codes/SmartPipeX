'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  Droplets,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Gauge,
  Clock,
  Target,
} from 'lucide-react';

interface ConsumptionData {
  date: string;
  totalConsumption: number;
  averageFlow: number;
  peakFlow: number;
  activeHours: number;
  efficiency: number;
}

interface ConsumptionSummary {
  period: string;
  totalConsumption: number;
  dailyAverage: number;
  weeklyTrend: number;
  monthlyProjection: number;
  efficiency: number;
  comparedToLastPeriod: number;
}

interface ConsumptionResponse {
  consumption: ConsumptionData[];
  summary: ConsumptionSummary;
  source: string;
  period: string;
  days: number;
}

export default function ConsumptionPage() {
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [summary, setSummary] = useState<ConsumptionSummary | null>(null);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState(7);

  const fetchConsumptionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/data/consumption?period=${period}&days=${days}`
      );
      const result = await response.json();

      if (result.success) {
        setConsumptionData(result.data.consumption);
        setSummary(result.data.summary);
        setSource(result.data.source);
      } else {
        setError(result.error || 'Failed to fetch consumption data');
      }
    } catch (err) {
      setError('Network error while fetching consumption data');
      console.error('Consumption data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumptionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, days]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatConsumption = (value: number) => {
    return `${value.toFixed(1)}L`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading consumption data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-500">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchConsumptionData}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Water Consumption
              </h1>
              <p className="text-gray-600">
                Track your daily water usage and consumption patterns
                <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                  {source === 'esp32' ? '🔴 Live ESP32 Data' : '🟡 Demo Data'}
                </span>
              </p>
            </div>

            {/* Period Controls */}
            <div className="mt-4 flex gap-4 md:mt-0">
              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')
                }
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Total Consumption */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Consumption
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatConsumption(summary.totalConsumption)}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Daily Average */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Daily Average
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatConsumption(summary.dailyAverage)}
                  </p>
                </div>
                <div className="rounded-lg bg-green-100 p-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trend</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {summary.weeklyTrend > 0 ? '+' : ''}
                    {summary.weeklyTrend.toFixed(1)}%
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 ${summary.weeklyTrend > 0 ? 'bg-red-100' : 'bg-green-100'}`}
                >
                  {summary.weeklyTrend > 0 ? (
                    <TrendingUp className="h-6 w-6 text-red-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Efficiency */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Efficiency
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {summary.efficiency.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3">
                  <Gauge className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Daily Consumption Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Daily Consumption
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [
                    formatConsumption(value),
                    'Consumption',
                  ]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Bar
                  dataKey="totalConsumption"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Flow Rate Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Flow Rate Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)} L/min`,
                    name === 'averageFlow' ? 'Average Flow' : 'Peak Flow',
                  ]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="averageFlow"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="peakFlow"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Usage Patterns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Active Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Daily Active Hours
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(1)} hours`,
                    'Active Hours',
                  ]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Area
                  type="monotone"
                  dataKey="activeHours"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Efficiency Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              System Efficiency
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={12}
                />
                <YAxis domain={[90, 100]} fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(1)}%`,
                    'Efficiency',
                  ]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#EC4899"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Insights */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              💡 Smart Insights
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Monthly Projection
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  At current usage, you&apos;ll consume approximately{' '}
                  <strong>
                    {formatConsumption(summary.monthlyProjection)}
                  </strong>{' '}
                  this month.
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <div className="mb-2 flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Efficiency Status
                  </span>
                </div>
                <p className="text-sm text-green-800">
                  Your system efficiency is{' '}
                  <strong>{summary.efficiency.toFixed(1)}%</strong> -
                  {summary.efficiency > 98
                    ? ' Excellent!'
                    : summary.efficiency > 95
                      ? ' Good'
                      : ' Needs attention'}
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-4">
                <div className="mb-2 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    Usage Pattern
                  </span>
                </div>
                <p className="text-sm text-purple-800">
                  Your consumption trend is
                  <strong>
                    {' '}
                    {summary.weeklyTrend > 0 ? 'increasing' : 'decreasing'}
                  </strong>{' '}
                  by
                  {Math.abs(summary.weeklyTrend).toFixed(1)}% recently.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
