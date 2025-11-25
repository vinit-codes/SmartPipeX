/**
 * Settings Manager for Pipeline Leak Detection System
 * Handles saving and loading user preferences from localStorage
 */

export interface SystemSettings {
  leakThreshold: number; // Water loss threshold in L/min
  autoShutoff: boolean; // Automatically shut off system on critical leak
  emailAlerts: boolean; // Send email notifications for leaks
  telegramAlerts: boolean; // Send Telegram notifications for leaks
}

// Default settings
const DEFAULT_SETTINGS: SystemSettings = {
  leakThreshold: 0.3, // 0.3 L/min default threshold
  autoShutoff: false,
  emailAlerts: true,
  telegramAlerts: false,
};

const STORAGE_KEY = 'pipelineSettings';

export class SettingsManager {
  /**
   * Load settings from localStorage
   * Returns default settings if none are found or if there's an error
   */
  static loadSettings(): SystemSettings {
    try {
      if (typeof window === 'undefined') {
        // Server-side rendering - return defaults
        return { ...DEFAULT_SETTINGS };
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { ...DEFAULT_SETTINGS };
      }

      const parsed = JSON.parse(stored) as Partial<SystemSettings>;

      // Merge with defaults to ensure all properties exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Save settings to localStorage
   * @param settings - The settings object to save
   * @returns Promise that resolves when settings are saved
   */
  static async saveSettings(settings: SystemSettings): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('localStorage is not available on server-side');
      }

      // Validate settings before saving
      const validatedSettings = this.validateSettings(settings);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedSettings));

      // Simulate API call delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Settings saved successfully:', validatedSettings);
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
      throw error;
    }
  }

  /**
   * Reset settings to default values
   * @returns Promise that resolves when settings are reset
   */
  static async resetSettings(): Promise<SystemSettings> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('localStorage is not available on server-side');
      }

      localStorage.removeItem(STORAGE_KEY);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const defaultSettings = { ...DEFAULT_SETTINGS };
      console.log('Settings reset to defaults:', defaultSettings);

      return defaultSettings;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }

  /**
   * Get a specific setting value
   * @param key - The setting key to retrieve
   * @returns The setting value or default if not found
   */
  static getSetting<K extends keyof SystemSettings>(key: K): SystemSettings[K] {
    const settings = this.loadSettings();
    return settings[key];
  }

  /**
   * Update a single setting
   * @param key - The setting key to update
   * @param value - The new value
   * @returns Promise that resolves when setting is updated
   */
  static async updateSetting<K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ): Promise<void> {
    const currentSettings = this.loadSettings();
    const updatedSettings = {
      ...currentSettings,
      [key]: value,
    };

    await this.saveSettings(updatedSettings);
  }

  /**
   * Validate settings object to ensure all values are within acceptable ranges
   * @param settings - Settings to validate
   * @returns Validated settings object
   */
  private static validateSettings(settings: SystemSettings): SystemSettings {
    const validated = { ...settings };

    // Validate leak threshold (must be between 0.1 and 10.0 L/min)
    if (
      typeof validated.leakThreshold !== 'number' ||
      validated.leakThreshold < 0.1 ||
      validated.leakThreshold > 10.0
    ) {
      console.warn(
        `Invalid leakThreshold: ${validated.leakThreshold}, using default`
      );
      validated.leakThreshold = DEFAULT_SETTINGS.leakThreshold;
    }

    // Ensure boolean values
    validated.autoShutoff = Boolean(validated.autoShutoff);
    validated.emailAlerts = Boolean(validated.emailAlerts);
    validated.telegramAlerts = Boolean(validated.telegramAlerts);

    return validated;
  }

  /**
   * Export settings as JSON string for backup
   * @returns JSON string of current settings
   */
  static exportSettings(): string {
    const settings = this.loadSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON string
   * @param jsonString - JSON string containing settings
   * @returns Promise that resolves when settings are imported
   */
  static async importSettings(jsonString: string): Promise<SystemSettings> {
    try {
      const imported = JSON.parse(jsonString) as Partial<SystemSettings>;
      const settings = {
        ...DEFAULT_SETTINGS,
        ...imported,
      };

      await this.saveSettings(settings);
      return settings;
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  /**
   * Check if settings have been customized from defaults
   * @returns true if any setting differs from default
   */
  static hasCustomSettings(): boolean {
    const current = this.loadSettings();
    const defaults = DEFAULT_SETTINGS;

    return Object.keys(defaults).some((key) => {
      const k = key as keyof SystemSettings;
      return current[k] !== defaults[k];
    });
  }
}

// Convenience functions for common operations
export const loadSettings = () => SettingsManager.loadSettings();
export const saveSettings = (settings: SystemSettings) =>
  SettingsManager.saveSettings(settings);
export const resetSettings = () => SettingsManager.resetSettings();
export const getSetting = <K extends keyof SystemSettings>(key: K) =>
  SettingsManager.getSetting(key);
export const updateSetting = <K extends keyof SystemSettings>(
  key: K,
  value: SystemSettings[K]
) => SettingsManager.updateSetting(key, value);
