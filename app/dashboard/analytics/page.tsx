'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components';
import { formatDate } from '@/utils';

// TypeScript interfaces for the dataset
interface SensorReading {
  timestamp: string;
  inputFlow: number;
  outputFlow: number;
  leakDetected: boolean;
  waterLoss: number;
}

interface ApiResponse {
  success: boolean;
  data: SensorReading[];
  message?: string;
}

interface ChartDataPoint {
  time: string;
  inputFlow: number;
  outputFlow: number;
  waterLoss: number;
  timestamp: Date;
}

interface EventSummary {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface PredictiveAnalysis {
  riskScore: number;
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  leakFrequency: number;
  avgFlowDifference: number;
  recommendation: string;
  analysisTimestamp: string;
  sampleSize: number;
}

interface PredictiveApiResponse {
  success: boolean;
  data: {
    prediction: PredictiveAnalysis;
    metadata: {
      analysisType: string;
      algorithm: string;
      confidenceLevel: string;
      nextAnalysisRecommended: string;
    };
  };
  message?: string;
}

// Animation variants

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Custom colors for charts
const CHART_COLORS = {
  inputFlow: '#3B82F6', // Blue
  outputFlow: '#10B981', // Green
  waterLoss: '#EF4444', // Red
  normal: '#22C55E', // Green
  leak: '#F59E0B', // Amber
};

const PIE_COLORS = [CHART_COLORS.normal, CHART_COLORS.leak];

// Custom tooltip components
const FlowTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-lg">
        <p className="font-semibold text-gray-700">{`Time: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value} L/min`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const WaterLossTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-lg">
        <p className="font-semibold text-gray-700">{`Time: ${label}`}</p>
        <p className="text-sm text-red-600">
          {`Water Loss: ${payload[0].value} L/min`}
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: EventSummary }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border bg-white p-3 shadow-lg">
        <p className="font-semibold text-gray-700">{data.name}</p>
        <p className="text-sm">Count: {data.value}</p>
        <p className="text-sm">
          Percentage: {data.payload.percentage.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataRange, setDataRange] = useState(300);

  // Predictive analysis state
  const [prediction, setPrediction] = useState<PredictiveAnalysis | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Process data for charts
  const chartData: ChartDataPoint[] = data.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    inputFlow: reading.inputFlow,
    outputFlow: reading.outputFlow,
    waterLoss: reading.waterLoss,
    timestamp: new Date(reading.timestamp),
  }));

  // Calculate event summary for pie chart
  const eventSummary: EventSummary[] = (() => {
    const totalReadings = data.length;
    const leakEvents = data.filter((reading) => reading.leakDetected).length;
    const normalEvents = totalReadings - leakEvents;

    return [
      {
        name: 'Normal Operations',
        value: normalEvents,
        percentage:
          totalReadings > 0 ? (normalEvents / totalReadings) * 100 : 0,
      },
      {
        name: 'Leak Events',
        value: leakEvents,
        percentage: totalReadings > 0 ? (leakEvents / totalReadings) * 100 : 0,
      },
    ];
  })();

  // Fetch historical data
  const fetchHistoricalData = async (count: number = 300) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/data/history?count=${count}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch predictive analysis
  const fetchPrediction = async (samples: number = 50) => {
    try {
      setPredictionLoading(true);
      setPredictionError(null);

      const response = await fetch(`/api/data/predict?samples=${samples}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PredictiveApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch prediction');
      }

      setPrediction(result.data.prediction);
    } catch (err) {
      setPredictionError(
        err instanceof Error ? err.message : 'An error occurred'
      );
      console.error('Error fetching prediction:', err);
    } finally {
      setPredictionLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchHistoricalData(dataRange);
    fetchPrediction(50); // Fetch prediction with 50 samples
  }, [dataRange]);

  // Handle data range change
  const handleRangeChange = (newRange: number) => {
    setDataRange(newRange);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-96 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600"
            />
            <span className="ml-4 text-lg text-gray-600">
              Loading analytics data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-96 items-center justify-center">
            <div className="rounded-lg bg-red-50 p-6 text-center">
              <h2 className="text-xl font-semibold text-red-800">
                Error Loading Data
              </h2>
              <p className="mt-2 text-red-600">{error}</p>
              <Button
                onClick={() => fetchHistoricalData(dataRange)}
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
    <div className="p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl"
      >
        {/* Header Section */}
        <motion.div variants={cardVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Pipeline Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Historical data analysis and insights - {formatDate(new Date())}
          </p>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          variants={cardVariants}
          className="mb-8 rounded-xl bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Data Controls
              </h2>
              <p className="text-sm text-gray-600">
                Currently showing {data.length} readings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Data Points:
              </span>
              <div className="flex gap-2">
                {[200, 300, 400, 500].map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={dataRange === range ? 'primary' : 'outline'}
                    onClick={() => handleRangeChange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => {
                  fetchHistoricalData(dataRange);
                  fetchPrediction(50);
                }}
                variant="secondary"
                size="sm"
              >
                🔄 Refresh All
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid gap-8">
          {/* Flow Rate Charts */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input vs Output Flow Line Chart */}
            <motion.div
              variants={cardVariants}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Flow Rate Comparison
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Input flow vs Output flow over time
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      stroke="#6b7280"
                      fontSize={12}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      label={{
                        value: 'Flow (L/min)',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <Tooltip content={<FlowTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="inputFlow"
                      stroke={CHART_COLORS.inputFlow}
                      strokeWidth={2}
                      dot={false}
                      name="Input Flow"
                    />
                    <Line
                      type="monotone"
                      dataKey="outputFlow"
                      stroke={CHART_COLORS.outputFlow}
                      strokeWidth={2}
                      dot={false}
                      name="Output Flow"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Water Loss Bar Chart */}
            <motion.div
              variants={cardVariants}
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Water Loss Analysis
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Water loss per reading over time
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.filter((d) => d.waterLoss > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      stroke="#6b7280"
                      fontSize={12}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      label={{
                        value: 'Water Loss (L/min)',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <Tooltip content={<WaterLossTooltip />} />
                    <Bar
                      dataKey="waterLoss"
                      fill={CHART_COLORS.waterLoss}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Event Summary Pie Chart */}
            <motion.div
              variants={cardVariants}
              className="rounded-xl bg-white p-6 shadow-lg lg:col-span-1"
            >
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                System Events Summary
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Normal vs leak detection events
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventSummary}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {eventSummary.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Statistics Summary */}
            <motion.div
              variants={cardVariants}
              className="rounded-xl bg-white p-6 shadow-lg lg:col-span-2"
            >
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Statistical Summary
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Average Input Flow */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {data.length > 0
                      ? (
                          data.reduce((sum, r) => sum + r.inputFlow, 0) /
                          data.length
                        ).toFixed(2)
                      : '0.00'}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    Avg Input Flow (L/min)
                  </div>
                </div>

                {/* Average Output Flow */}
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {data.length > 0
                      ? (
                          data.reduce((sum, r) => sum + r.outputFlow, 0) /
                          data.length
                        ).toFixed(2)
                      : '0.00'}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Avg Output Flow (L/min)
                  </div>
                </div>

                {/* Total Water Loss */}
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="text-2xl font-bold text-red-700">
                    {data.reduce((sum, r) => sum + r.waterLoss, 0).toFixed(2)}
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    Total Water Loss (L)
                  </div>
                </div>

                {/* System Efficiency */}
                <div className="rounded-lg bg-purple-50 p-4">
                  <div className="text-2xl font-bold text-purple-700">
                    {data.length > 0
                      ? (
                          (data.reduce(
                            (sum, r) =>
                              sum +
                              (r.inputFlow > 0
                                ? r.outputFlow / r.inputFlow
                                : 0),
                            0
                          ) /
                            data.filter((r) => r.inputFlow > 0).length) *
                          100
                        ).toFixed(1)
                      : '0.0'}
                    %
                  </div>
                  <div className="text-sm font-medium text-purple-600">
                    Avg Efficiency
                  </div>
                </div>
              </div>

              {/* Leak Event Details */}
              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-gray-800">
                  Leak Event Analysis
                </h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded bg-yellow-50 p-3">
                    <div className="text-lg font-bold text-yellow-700">
                      {eventSummary[1]?.value || 0}
                    </div>
                    <div className="text-xs text-yellow-600">
                      Total Leak Events
                    </div>
                  </div>
                  <div className="rounded bg-yellow-50 p-3">
                    <div className="text-lg font-bold text-yellow-700">
                      {eventSummary[1]?.percentage.toFixed(1) || '0.0'}%
                    </div>
                    <div className="text-xs text-yellow-600">Leak Rate</div>
                  </div>
                  <div className="rounded bg-yellow-50 p-3">
                    <div className="text-lg font-bold text-yellow-700">
                      {data.length > 0
                        ? Math.max(...data.map((r) => r.waterLoss)).toFixed(2)
                        : '0.00'}
                    </div>
                    <div className="text-xs text-yellow-600">
                      Max Water Loss (L/min)
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI Predictive Analysis Section */}
          <motion.div
            variants={cardVariants}
            className="mt-8 rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                🤖 AI Predictive Maintenance
              </h3>
              <Button
                onClick={() => fetchPrediction(50)}
                disabled={predictionLoading}
                variant="outline"
                size="sm"
              >
                {predictionLoading ? '🔄 Analyzing...' : '🔍 Run Analysis'}
              </Button>
            </div>

            {predictionError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-red-800">
                  Failed to load predictive analysis
                </p>
                <p className="mt-1 text-sm text-red-600">{predictionError}</p>
              </div>
            ) : predictionLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600"
                />
                <span className="ml-3 text-gray-600">
                  Analyzing system patterns...
                </span>
              </div>
            ) : prediction ? (
              <div className="space-y-6">
                {/* Risk Score Display */}
                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-3 rounded-full px-6 py-3 text-lg font-semibold ${
                      prediction.riskCategory === 'High Risk'
                        ? 'border-2 border-red-300 bg-red-100 text-red-800'
                        : prediction.riskCategory === 'Moderate Risk'
                          ? 'border-2 border-yellow-300 bg-yellow-100 text-yellow-800'
                          : 'border-2 border-green-300 bg-green-100 text-green-800'
                    }`}
                  >
                    <span className="text-2xl">
                      {prediction.riskCategory === 'High Risk'
                        ? '🚨'
                        : prediction.riskCategory === 'Moderate Risk'
                          ? '⚠️'
                          : '✅'}
                    </span>
                    <span>{prediction.riskCategory}</span>
                    <span className="ml-2 text-sm opacity-75">
                      Score: {prediction.riskScore}
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {prediction.riskScore}
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      Risk Score
                    </div>
                    <div className="mt-1 text-xs text-blue-500">
                      0-20: Low, 21-40: Moderate, 41+: High
                    </div>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {prediction.leakFrequency}%
                    </div>
                    <div className="text-sm font-medium text-purple-600">
                      Leak Frequency
                    </div>
                    <div className="mt-1 text-xs text-purple-500">
                      Last 50 readings
                    </div>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">
                      {prediction.avgFlowDifference}
                    </div>
                    <div className="text-sm font-medium text-orange-600">
                      Avg Flow Diff (L/min)
                    </div>
                    <div className="mt-1 text-xs text-orange-500">
                      Input - Output
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {prediction.sampleSize}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      Samples Analyzed
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Data points
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
                    💡 AI Recommendations
                  </h4>
                  <p className="leading-relaxed text-gray-700">
                    {prediction.recommendation}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Analysis completed:{' '}
                      {new Date(prediction.analysisTimestamp).toLocaleString()}
                    </span>
                    <span>Algorithm: Risk-based Pattern Analysis</span>
                  </div>
                </div>

                {/* Action Items */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Button
                    variant={
                      prediction.riskCategory === 'High Risk'
                        ? 'primary'
                        : 'outline'
                    }
                    size="sm"
                    className="w-full"
                  >
                    📋 Schedule Maintenance
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    📊 Generate Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    🔔 Set Alert
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p>
                  Click &quot;Run Analysis&quot; to perform AI predictive
                  maintenance analysis
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
