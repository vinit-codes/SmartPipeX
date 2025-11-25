'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components';
import { formatDate } from '@/utils';

// TypeScript interfaces
interface AlertReading {
  timestamp: string;
  inputFlow: number;
  outputFlow: number;
  leakDetected: boolean;
  waterLoss: number;
  severity: 'low' | 'medium' | 'high';
  alertMessage: string;
}

interface AlertsApiResponse {
  success: boolean;
  data: {
    alerts: AlertReading[];
    summary: {
      totalSamplesGenerated: number;
      totalLeaksFound: number;
      leakPercentage: string;
      alertsReturned: number;
      severityFilter: string;
      severityBreakdown: {
        low: number;
        medium: number;
        high: number;
      };
    };
  };
  message?: string;
}

type SortField =
  | 'timestamp'
  | 'inputFlow'
  | 'outputFlow'
  | 'waterLoss'
  | 'severity';
type SortDirection = 'asc' | 'desc';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

// Utility functions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return '🚨';
    case 'medium':
      return '⚠️';
    case 'low':
      return '💧';
    default:
      return '📊';
  }
};

const formatSeverity = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'Critical';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Mild';
    default:
      return severity;
  }
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertReading[]>([]);
  const [summary, setSummary] = useState<
    AlertsApiResponse['data']['summary'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering and pagination state
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch alerts data
  const fetchAlerts = async (severity: string = 'all', count: number = 500) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/data/alerts?count=${count}&severity=${severity}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AlertsApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch alerts');
      }

      setAlerts(result.data.alerts);
      setSummary(result.data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filter changes
  useEffect(() => {
    fetchAlerts(severityFilter);
  }, [severityFilter]);

  // Sort and filter alerts
  const sortedAndFilteredAlerts = useMemo(() => {
    const filtered = [...alerts];

    // Sort alerts
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'severity':
          // Custom sorting for severity: high > medium > low
          const severityOrder = { high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [alerts, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedAndFilteredAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = sortedAndFilteredAlerts.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle filter change
  const handleFilterChange = (severity: string) => {
    setSeverityFilter(severity);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return sortDirection === 'asc' ? (
      <span className="text-blue-600">↑</span>
    ) : (
      <span className="text-blue-600">↓</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-96 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600"
            />
            <span className="ml-4 text-lg text-gray-600">
              Loading alerts...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-96 items-center justify-center">
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <h2 className="text-xl font-semibold text-red-800">
                Error Loading Alerts
              </h2>
              <p className="mt-2 text-red-600">{error}</p>
              <Button
                onClick={() => fetchAlerts(severityFilter)}
                className="mt-4"
                variant="primary"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl"
      >
        {/* Header Section */}
        <motion.div variants={cardVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Leak Alerts</h1>
          <p className="mt-2 text-gray-600">
            Pipeline leak detection alerts - {formatDate(new Date())}
          </p>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div
            variants={cardVariants}
            className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center">
                <div className="text-3xl">📊</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.alertsReturned}
                  </div>
                  <div className="text-sm text-gray-600">Total Alerts</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center">
                <div className="text-3xl">🚨</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-red-600">
                    {summary.severityBreakdown.high}
                  </div>
                  <div className="text-sm text-gray-600">Critical Alerts</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center">
                <div className="text-3xl">⚠️</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {summary.severityBreakdown.medium}
                  </div>
                  <div className="text-sm text-gray-600">Medium Alerts</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center">
                <div className="text-3xl">💧</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.severityBreakdown.low}
                  </div>
                  <div className="text-sm text-gray-600">Mild Alerts</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls Section */}
        <motion.div
          variants={cardVariants}
          className="mb-8 rounded-xl bg-white p-6 shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Filter by Severity:
                </label>
                <div className="flex gap-2">
                  {['all', 'high', 'medium', 'low'].map((severity) => (
                    <Button
                      key={severity}
                      size="sm"
                      variant={
                        severityFilter === severity ? 'primary' : 'outline'
                      }
                      onClick={() => handleFilterChange(severity)}
                    >
                      {severity === 'all' ? 'All' : formatSeverity(severity)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Items per page:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => fetchAlerts(severityFilter)}
                variant="secondary"
                size="sm"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Alerts Table */}
        <motion.div
          variants={cardVariants}
          className="rounded-xl bg-white shadow-lg"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Time of Leak <SortIcon field="timestamp" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('inputFlow')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Input Flow <SortIcon field="inputFlow" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('outputFlow')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Output Flow <SortIcon field="outputFlow" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('waterLoss')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Water Loss <SortIcon field="waterLoss" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('severity')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Severity <SortIcon field="severity" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence mode="popLayout">
                  {currentAlerts.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No alerts found for the selected criteria.
                      </td>
                    </motion.tr>
                  ) : (
                    currentAlerts.map((alert, index) => (
                      <motion.tr
                        key={`${alert.timestamp}-${index}`}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {alert.inputFlow.toFixed(2)} L/min
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {alert.outputFlow.toFixed(2)} L/min
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-red-600">
                            {alert.waterLoss.toFixed(2)} L/min
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${getSeverityColor(alert.severity)}`}
                          >
                            {getSeverityIcon(alert.severity)}{' '}
                            {formatSeverity(alert.severity)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {alert.alertMessage}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(endIndex, sortedAndFilteredAlerts.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">
                      {sortedAndFilteredAlerts.length}
                    </span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="rounded-r-none"
                    >
                      Previous
                    </Button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={
                            currentPage === pageNum ? 'primary' : 'outline'
                          }
                          size="sm"
                          className="rounded-none"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="rounded-l-none"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        {summary && (
          <motion.div
            variants={cardVariants}
            className="mt-8 rounded-xl bg-white p-6 shadow-lg"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Alert Summary
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.totalSamplesGenerated}
                </div>
                <div className="text-sm text-gray-600">Samples Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {summary.totalLeaksFound}
                </div>
                <div className="text-sm text-gray-600">
                  Total Leaks Detected
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {summary.leakPercentage}%
                </div>
                <div className="text-sm text-gray-600">Leak Detection Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summary.totalSamplesGenerated - summary.totalLeaksFound}
                </div>
                <div className="text-sm text-gray-600">Normal Readings</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
