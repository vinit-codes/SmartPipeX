'use client';

import { useEffect, useState } from 'react';
// Using simple SVG icons instead of lucide-react for offline page
const WifiOff = ({ className }: { className?: string }) => (
  <svg
    className={className || 'h-12 w-12 text-red-400'}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 5.636L5.636 18.364m0 0L18.364 5.636m-2.828 7.07L8.465 9.535m7.071 7.071L8.465 9.535"
    />
  </svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg
    className={className || 'h-5 w-5'}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const Zap = ({ className }: { className?: string }) => (
  <svg
    className={className || 'h-5 w-5'}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    window.location.reload();
  };

  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md text-center">
        {/* Offline Icon */}
        <div className="relative mb-8">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800">
            <WifiOff className="h-12 w-12 text-red-400" />
          </div>
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
            <span className="text-xs font-bold text-white">!</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-6 rounded-lg bg-slate-800/50 p-6 backdrop-blur-sm">
          <h1 className="mb-2 text-2xl font-bold text-white">
            {isOnline ? 'Connection Restored' : "You're Offline"}
          </h1>

          {isOnline ? (
            <p className="mb-4 text-green-400">
              Great! Your internet connection has been restored.
            </p>
          ) : (
            <p className="mb-4 text-slate-300">
              SmartPipeX is not available right now. Please check your internet
              connection and try again.
            </p>
          )}

          {/* Connection Status Indicator */}
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isOnline ? 'animate-pulse bg-green-400' : 'bg-red-400'
              }`}
            />
            <span className="text-sm text-slate-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Offline Features */}
        {!isOnline && (
          <div className="mb-6 rounded-lg bg-slate-800/30 p-4">
            <h2 className="mb-3 flex items-center justify-center text-lg font-semibold text-white">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Offline Features
            </h2>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span>Cached dashboard data available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span>Settings saved locally</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span>Offline alerts stored</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isOnline ? (
            <button
              onClick={goToDashboard}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
            >
              <Zap className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </button>
          ) : (
            <button
              onClick={handleRetry}
              disabled={retryCount > 3}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-slate-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-slate-700 disabled:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${retryCount > 0 ? 'animate-spin' : ''}`}
              />
              <span>
                {retryCount > 3
                  ? 'Too many attempts'
                  : retryCount > 0
                    ? 'Retrying...'
                    : 'Try Again'}
              </span>
            </button>
          )}

          <button
            onClick={() => window.history.back()}
            className="w-full rounded-lg border border-slate-600 bg-transparent px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>

        {/* Retry Counter */}
        {retryCount > 0 && (
          <div className="mt-4 text-xs text-slate-400">
            Retry attempt: {retryCount}/3
          </div>
        )}

        {/* App Info */}
        <div className="mt-8 border-t border-slate-700 pt-6">
          <div className="space-y-1 text-xs text-slate-500">
            <div>SmartPipeX PWA</div>
            <div>Pipeline Monitoring System</div>
            <div className="flex items-center justify-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              <span>Offline Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
