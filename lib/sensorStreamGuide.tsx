/**
 * Real-time Sensor Stream System Usage Guide
 *
 * This guide demonstrates how to implement and use the real-time data simulation
 * system with React Context for pipeline leak detection.
 */

import React from 'react';
import { useSensorStream } from '@/components';

// ========================================
// 1. BASIC SETUP - Provider Configuration
// ========================================

/*
// In your layout or root component:
export default function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <SensorStreamProvider 
      autoStart={true}     // Start streaming automatically
      interval={1000}      // Fetch every 1000ms (1 second)
    >
      {children}
    </SensorStreamProvider>
  );
}
*/

// ========================================
// 2. CONSUMING DATA - Hook Usage
// ========================================

/*
// Hook returns the following properties:
const {
  currentReading,    // Latest sensor reading or null
  previousReading,   // Previous reading for comparison
  isStreaming,       // Boolean: is the stream active?
  error,            // Error message or null
  start,            // Function to start streaming
  stop,             // Function to stop streaming
  lastUpdated,      // Date of last successful update
} = useSensorStream();
*/

// ========================================
// 3. EXAMPLES - Different Use Cases
// ========================================

// Example 1: Simple Status Display
function StreamStatus() {
  const { isStreaming, lastUpdated, error } = useSensorStream();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full ${isStreaming ? 'bg-green-500' : 'bg-gray-400'}`}
      />
      <span>{isStreaming ? 'Live' : 'Offline'}</span>
      {lastUpdated && <span>({lastUpdated.toLocaleTimeString()})</span>}
      {error && <span className="text-red-600">Error: {error}</span>}
    </div>
  );
}

// Example 2: Current Reading Display
function CurrentReadingCard() {
  const { currentReading } = useSensorStream();

  if (!currentReading) {
    return <div>No data available</div>;
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3>Current Flow</h3>
      <p>Input: {currentReading.inputFlow} L/min</p>
      <p>Output: {currentReading.outputFlow} L/min</p>
      <p
        className={
          currentReading.leakDetected ? 'text-red-600' : 'text-green-600'
        }
      >
        {currentReading.leakDetected ? '⚠️ Leak Detected' : '✅ Normal'}
      </p>
    </div>
  );
}

// Example 3: Stream Controls
function StreamControls() {
  const { isStreaming, start, stop, error } = useSensorStream();

  return (
    <div className="flex gap-2">
      <button
        onClick={isStreaming ? stop : start}
        className={`rounded px-4 py-2 text-white ${
          isStreaming ? 'bg-red-600' : 'bg-green-600'
        }`}
      >
        {isStreaming ? 'Stop Stream' : 'Start Stream'}
      </button>
      {error && (
        <button
          onClick={start}
          className="rounded bg-yellow-600 px-4 py-2 text-white"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Example 4: Leak Alert System
function LeakAlertBanner() {
  const { currentReading, isStreaming } = useSensorStream();

  // Only show if streaming and leak detected
  if (!isStreaming || !currentReading?.leakDetected) {
    return null;
  }

  const severity = currentReading.waterLoss > 2 ? 'critical' : 'warning';

  return (
    <div
      className={`rounded-lg p-4 ${
        severity === 'critical'
          ? 'bg-red-100 text-red-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      <div className="flex items-center">
        <span className="mr-2 text-2xl">🚨</span>
        <div>
          <h3 className="font-bold">
            {severity === 'critical' ? 'CRITICAL LEAK' : 'LEAK DETECTED'}
          </h3>
          <p>Water loss: {currentReading.waterLoss} L/min</p>
          <p className="text-sm">
            Input: {currentReading.inputFlow} L/min → Output:{' '}
            {currentReading.outputFlow} L/min
          </p>
        </div>
      </div>
    </div>
  );
}

// Example 5: Change Detection
function FlowChangeIndicator() {
  const { currentReading, previousReading } = useSensorStream();

  if (!currentReading || !previousReading) {
    return <span className="text-gray-500">-</span>;
  }

  const inputChange = currentReading.inputFlow - previousReading.inputFlow;
  const outputChange = currentReading.outputFlow - previousReading.outputFlow;

  const getChangeIcon = (change: number) => {
    if (Math.abs(change) < 0.01) return '→';
    return change > 0 ? '↗' : '↘';
  };

  const getChangeColor = (change: number) => {
    if (Math.abs(change) < 0.01) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="flex gap-4 text-sm">
      <span className={getChangeColor(inputChange)}>
        Input: {getChangeIcon(inputChange)} {Math.abs(inputChange).toFixed(3)}
      </span>
      <span className={getChangeColor(outputChange)}>
        Output: {getChangeIcon(outputChange)}{' '}
        {Math.abs(outputChange).toFixed(3)}
      </span>
    </div>
  );
}

// ========================================
// 4. ADVANCED PATTERNS
// ========================================

// Pattern 1: Custom Hook for Leak Detection
function useLeakDetection() {
  const { currentReading, isStreaming } = useSensorStream();

  const hasLeak = isStreaming && currentReading?.leakDetected;
  const leakSeverity =
    currentReading?.waterLoss && currentReading.waterLoss > 2
      ? 'critical'
      : 'warning';

  return {
    hasLeak,
    leakSeverity,
    waterLoss: currentReading?.waterLoss || 0,
  };
}

// Pattern 2: Data Aggregation Hook
function useSensorStatistics() {
  const { currentReading, previousReading } = useSensorStream();

  // Calculate efficiency and other metrics
  const efficiency = currentReading
    ? ((currentReading.outputFlow / currentReading.inputFlow) * 100).toFixed(1)
    : '0';

  const trend =
    previousReading && currentReading
      ? currentReading.waterLoss - previousReading.waterLoss
      : 0;

  return {
    efficiency: `${efficiency}%`,
    trend,
    isImproving: trend < 0,
    isWorsening: trend > 0,
  };
}

// Pattern 3: Effect Hook for Notifications
function useLeakNotifications() {
  const { currentReading, previousReading } = useSensorStream();

  // Effect to trigger notifications when leak state changes
  React.useEffect(() => {
    // New leak detected
    if (currentReading?.leakDetected && !previousReading?.leakDetected) {
      console.log('🚨 NEW LEAK DETECTED!');
      // Here you could:
      // - Show browser notification
      // - Play alert sound
      // - Send webhook/email
      // - Log to analytics
    }

    // Leak resolved
    if (!currentReading?.leakDetected && previousReading?.leakDetected) {
      console.log('✅ Leak resolved');
    }
  }, [currentReading?.leakDetected, previousReading?.leakDetected]);
}

// ========================================
// 5. CONFIGURATION OPTIONS
// ========================================

/*
// Provider Configuration Examples:

// Standard configuration (1 second updates, auto-start)
<SensorStreamProvider autoStart={true} interval={1000}>

// High-frequency monitoring (500ms updates)
<SensorStreamProvider autoStart={true} interval={500}>

// Manual start (don't auto-start streaming)
<SensorStreamProvider autoStart={false} interval={1000}>

// Slow monitoring (5 second updates)
<SensorStreamProvider autoStart={true} interval={5000}>
*/

// ========================================
// 6. ERROR HANDLING PATTERNS
// ========================================

function RobustSensorDisplay() {
  const { currentReading, error, isStreaming, start } = useSensorStream();

  // Show loading state
  if (!currentReading && isStreaming && !error) {
    return <div>Loading sensor data...</div>;
  }

  // Show error state with retry
  if (error) {
    return (
      <div className="rounded bg-red-50 p-4">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={start}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-white"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Show no data state
  if (!currentReading) {
    return (
      <div className="text-gray-500">
        No sensor data available
        {!isStreaming && (
          <button onClick={start} className="ml-2 text-blue-600 underline">
            Start Monitoring
          </button>
        )}
      </div>
    );
  }

  // Show normal data
  return (
    <div>
      <p>
        Flow: {currentReading.inputFlow} → {currentReading.outputFlow} L/min
      </p>
      <p>Loss: {currentReading.waterLoss} L/min</p>
    </div>
  );
}

export {
  StreamStatus,
  CurrentReadingCard,
  StreamControls,
  LeakAlertBanner,
  FlowChangeIndicator,
  useLeakDetection,
  useSensorStatistics,
  useLeakNotifications,
  RobustSensorDisplay,
};
