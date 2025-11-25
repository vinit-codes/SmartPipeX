/**
 * Example component demonstrating how to use the SensorStreamProvider
 * This shows different ways to consume real-time sensor data
 */

'use client';

import { useSensorStream } from '@/components';

export function SensorStreamDemo() {
  const {
    currentReading,
    previousReading,
    isStreaming,
    error,
    start,
    stop,
    lastUpdated,
  } = useSensorStream();

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Sensor Stream Demo Component
      </h3>

      {/* Stream Status */}
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span className="text-sm">
          Stream Status: {isStreaming ? 'Active' : 'Inactive'}
        </span>
        {lastUpdated && (
          <span className="ml-2 text-xs text-gray-500">
            (Last update: {lastUpdated.toLocaleTimeString()})
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
          Error: {error}
        </div>
      )}

      {/* Control Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={start}
          disabled={isStreaming}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:bg-gray-400"
        >
          Start Stream
        </button>
        <button
          onClick={stop}
          disabled={!isStreaming}
          className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:bg-gray-400"
        >
          Stop Stream
        </button>
      </div>

      {/* Current Reading */}
      {currentReading && (
        <div className="mb-4 rounded bg-blue-50 p-3">
          <h4 className="font-medium text-blue-900">Current Reading:</h4>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <span>Input: {currentReading.inputFlow} L/min</span>
            <span>Output: {currentReading.outputFlow} L/min</span>
            <span>Loss: {currentReading.waterLoss} L/min</span>
            <span
              className={
                currentReading.leakDetected ? 'text-red-600' : 'text-green-600'
              }
            >
              {currentReading.leakDetected ? 'LEAK DETECTED' : 'Normal'}
            </span>
          </div>
        </div>
      )}

      {/* Previous Reading Comparison */}
      {previousReading && currentReading && (
        <div className="rounded bg-gray-50 p-3">
          <h4 className="font-medium text-gray-900">Change from Previous:</h4>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <span
              className={
                currentReading.inputFlow > previousReading.inputFlow
                  ? 'text-green-600'
                  : currentReading.inputFlow < previousReading.inputFlow
                    ? 'text-red-600'
                    : 'text-gray-600'
              }
            >
              Input:{' '}
              {(currentReading.inputFlow - previousReading.inputFlow).toFixed(
                3
              )}{' '}
              L/min
            </span>
            <span
              className={
                currentReading.outputFlow > previousReading.outputFlow
                  ? 'text-green-600'
                  : currentReading.outputFlow < previousReading.outputFlow
                    ? 'text-red-600'
                    : 'text-gray-600'
              }
            >
              Output:{' '}
              {(currentReading.outputFlow - previousReading.outputFlow).toFixed(
                3
              )}{' '}
              L/min
            </span>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!currentReading && !error && (
        <div className="rounded bg-gray-50 p-3 text-center text-sm text-gray-500">
          No sensor data available.{' '}
          {!isStreaming && 'Click "Start Stream" to begin monitoring.'}
        </div>
      )}
    </div>
  );
}
