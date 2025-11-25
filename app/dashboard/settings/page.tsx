'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components';
import { formatDate } from '@/utils';
import {
  SettingsManager,
  SystemSettings,
  loadSettings,
  saveSettings,
  resetSettings,
} from '@/lib/settingsManager';

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

// Toggle Switch Component
interface ToggleSwitchProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="ml-4">
        <button
          type="button"
          id={id}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none ${
            checked ? 'bg-blue-600' : 'bg-gray-200'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          role="switch"
          aria-checked={checked}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
        >
          <motion.span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );
};

// Number Input Component
interface NumberInputProps {
  id: string;
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  disabled?: boolean;
}

const NumberInput = ({
  id,
  label,
  description,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  disabled = false,
}: NumberInputProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <input
          type="number"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${
            disabled ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''
          }`}
        />
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ isCustom }: { isCustom: boolean }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
        isCustom ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {isCustom ? '⚙️ Custom' : '📋 Default'}
    </span>
  );
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    leakThreshold: 1.0,
    autoShutoff: false,
    emailAlerts: true,
    telegramAlerts: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] =
    useState<SystemSettings | null>(null);

  // Load settings on component mount
  useEffect(() => {
    const loadInitialSettings = () => {
      try {
        const loadedSettings = loadSettings();
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
        setLoading(false);
      } catch {
        setError('Failed to load settings');
        setLoading(false);
      }
    };

    loadInitialSettings();
  }, []);

  // Check for changes
  useEffect(() => {
    if (originalSettings) {
      const changed = Object.keys(settings).some((key) => {
        const k = key as keyof SystemSettings;
        return settings[k] !== originalSettings[k];
      });
      setHasChanges(changed);
    }
  }, [settings, originalSettings]);

  // Handle setting changes
  const handleSettingChange = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setError(null);
    setSuccessMessage(null);
  };

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await saveSettings(settings);
      setOriginalSettings(settings);
      setSuccessMessage('Settings saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      setSaving(true);
      setError(null);

      const defaultSettings = await resetSettings();
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
      setSuccessMessage('Settings reset to defaults!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    if (originalSettings) {
      setSettings(originalSettings);
      setError(null);
      setSuccessMessage(null);
    }
  };

  // Export settings
  const handleExport = () => {
    try {
      const exportedSettings = SettingsManager.exportSettings();
      const blob = new Blob([exportedSettings], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipeline-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage('Settings exported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('Failed to export settings');
    }
  };

  // Import settings
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setSaving(true);
        const content = e.target?.result as string;
        const importedSettings = await SettingsManager.importSettings(content);
        setSettings(importedSettings);
        setOriginalSettings(importedSettings);
        setSuccessMessage('Settings imported successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to import settings'
        );
      } finally {
        setSaving(false);
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-96 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600"
            />
            <span className="ml-4 text-lg text-gray-600">
              Loading settings...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const isCustom = SettingsManager.hasCustomSettings();

  return (
    <div className="p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl"
      >
        {/* Header Section */}
        <motion.div variants={cardVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                System Settings
              </h1>
              <p className="mt-2 text-gray-600">
                Configure pipeline monitoring preferences -{' '}
                {formatDate(new Date())}
              </p>
            </div>
            <StatusBadge isCustom={isCustom} />
          </div>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <div className="flex items-center">
                <span className="mr-2 text-red-500">❌</span>
                <p className="text-red-800">{error}</p>
              </div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"
            >
              <div className="flex items-center">
                <span className="mr-2 text-green-500">✅</span>
                <p className="text-green-800">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Form */}
        <div className="space-y-8">
          {/* Leak Detection Settings */}
          <motion.div
            variants={cardVariants}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
              🔍 Leak Detection Settings
            </h2>
            <div className="space-y-6">
              <NumberInput
                id="leakThreshold"
                label="Leak Threshold"
                description="Water loss threshold to trigger leak alerts"
                value={settings.leakThreshold}
                onChange={(value) =>
                  handleSettingChange('leakThreshold', value)
                }
                min={0.1}
                max={10.0}
                step={0.1}
                unit="L/min"
                disabled={saving}
              />
            </div>
          </motion.div>

          {/* System Response Settings */}
          <motion.div
            variants={cardVariants}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
              ⚙️ System Response
            </h2>
            <div className="space-y-6">
              <ToggleSwitch
                id="autoShutoff"
                label="Automatic Shutoff"
                description="Automatically shut off the system when a critical leak is detected"
                checked={settings.autoShutoff}
                onChange={(checked) =>
                  handleSettingChange('autoShutoff', checked)
                }
                disabled={saving}
              />
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            variants={cardVariants}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
              🔔 Notification Settings
            </h2>
            <div className="space-y-6">
              <ToggleSwitch
                id="emailAlerts"
                label="Email Alerts"
                description="Send email notifications when leaks are detected"
                checked={settings.emailAlerts}
                onChange={(checked) =>
                  handleSettingChange('emailAlerts', checked)
                }
                disabled={saving}
              />
              <ToggleSwitch
                id="telegramAlerts"
                label="Telegram Alerts"
                description="Send Telegram messages when leaks are detected"
                checked={settings.telegramAlerts}
                onChange={(checked) =>
                  handleSettingChange('telegramAlerts', checked)
                }
                disabled={saving}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={cardVariants}
            className="rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
              💾 Settings Management
            </h2>
            <div className="flex flex-wrap gap-4">
              {/* Save/Discard Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  variant="primary"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                      />
                      Saving...
                    </span>
                  ) : (
                    '💾 Save Changes'
                  )}
                </Button>
                <Button
                  onClick={handleDiscard}
                  disabled={!hasChanges || saving}
                  variant="outline"
                >
                  🔄 Discard Changes
                </Button>
              </div>

              {/* Reset Action */}
              <Button
                onClick={handleReset}
                disabled={saving}
                variant="secondary"
              >
                📋 Reset to Defaults
              </Button>

              {/* Import/Export Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleExport}
                  disabled={saving}
                  variant="ghost"
                >
                  📤 Export Settings
                </Button>
                <div className="relative">
                  <Button
                    onClick={() =>
                      document.getElementById('importFile')?.click()
                    }
                    disabled={saving}
                    variant="ghost"
                  >
                    📥 Import Settings
                  </Button>
                  <input
                    id="importFile"
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>
            </div>

            {/* Settings Preview */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-700">
                Current Settings Preview
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Leak Threshold:</span>{' '}
                  {settings.leakThreshold} L/min
                </div>
                <div>
                  <span className="font-medium">Auto Shutoff:</span>{' '}
                  {settings.autoShutoff ? '✅ Enabled' : '❌ Disabled'}
                </div>
                <div>
                  <span className="font-medium">Email Alerts:</span>{' '}
                  {settings.emailAlerts ? '✅ Enabled' : '❌ Disabled'}
                </div>
                <div>
                  <span className="font-medium">Telegram Alerts:</span>{' '}
                  {settings.telegramAlerts ? '✅ Enabled' : '❌ Disabled'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          variants={cardVariants}
          className="mt-8 rounded-xl bg-white p-6 shadow-lg"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            📝 Settings Information
          </h3>
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Settings are automatically saved to your browser&apos;s local
              storage and will persist between sessions.
            </p>
            <p className="mb-2">
              Use the export function to backup your settings or import them on
              another device.
            </p>
            <p>
              Changes take effect immediately and will be applied to the
              monitoring system in real-time.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
