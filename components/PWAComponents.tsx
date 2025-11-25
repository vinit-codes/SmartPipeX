'use client';

import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, installApp, showInstallPrompt, dismissInstallPrompt } =
    usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!showInstallPrompt || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);

    if (success) {
      console.log('PWA installed successfully');
    }
  };

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-sm">
      <div className="rounded-lg border border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-lg">
        <div className="flex items-start space-x-3">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white">
              Install SmartPipeX
            </h3>
            <p className="mt-1 text-xs text-blue-100">
              Get faster access and work offline. Install the app on your
              device.
            </p>

            {/* Buttons */}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 rounded-md bg-white px-3 py-2 text-xs font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50 disabled:opacity-50"
              >
                {isInstalling ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-2 -ml-1 h-3 w-3 animate-spin text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Installing...
                  </span>
                ) : (
                  'Install'
                )}
              </button>

              <button
                onClick={dismissInstallPrompt}
                className="px-3 py-2 text-xs text-blue-100 transition-colors duration-200 hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={dismissInstallPrompt}
            className="flex-shrink-0 text-blue-100 transition-colors duration-200 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function PWAStatusBadge() {
  const { isInstalled, isOnline } = usePWA();

  return (
    <div className="flex items-center space-x-2">
      {/* PWA Status */}
      {isInstalled && (
        <div className="flex items-center space-x-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span>PWA</span>
        </div>
      )}

      {/* Online Status */}
      <div
        className={`flex items-center space-x-1 rounded-full px-2 py-1 text-xs ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        <div
          className={`h-2 w-2 rounded-full ${
            isOnline ? 'bg-green-400' : 'bg-red-400'
          }`}
        />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
    </div>
  );
}

export function PWAUpdateNotification() {
  const { updateAvailable, updateApp } = {
    updateAvailable: false,
    updateApp: async () => {},
  }; // Placeholder for now
  const [isUpdating, setIsUpdating] = useState(false);

  if (!updateAvailable) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateApp();
    setIsUpdating(false);
  };

  return (
    <div className="fixed top-4 right-4 left-4 z-50 mx-auto max-w-sm">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-600"
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
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Update Available
            </h3>
            <p className="mt-1 text-xs text-yellow-700">
              A new version of SmartPipeX is available with improvements and bug
              fixes.
            </p>

            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="rounded-md bg-yellow-600 px-3 py-1 text-xs text-white transition-colors duration-200 hover:bg-yellow-700 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
