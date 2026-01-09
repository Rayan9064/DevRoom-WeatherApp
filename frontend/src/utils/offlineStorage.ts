// Offline Storage Utility for Weather Data

interface CachedWeatherData {
  data: any;
  timestamp: number;
}

const STORAGE_KEY = 'weather_offline_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export const offlineStorage = {
  // Save weather data to localStorage
  saveWeatherData: (cityName: string, data: any): void => {
    try {
      const cache = offlineStorage.getCache();
      cache[cityName.toLowerCase()] = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save to offline storage:', error);
    }
  },

  // Get weather data from localStorage
  getWeatherData: (cityName: string): any | null => {
    try {
      const cache = offlineStorage.getCache();
      const cached = cache[cityName.toLowerCase()];

      if (!cached) return null;

      // Check if cache is still valid
      if (Date.now() - cached.timestamp > CACHE_DURATION) {
        delete cache[cityName.toLowerCase()];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Failed to read from offline storage:', error);
      return null;
    }
  },

  // Get all cached data
  getCache: (): Record<string, CachedWeatherData> => {
    try {
      const cache = localStorage.getItem(STORAGE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.error('Failed to parse offline cache:', error);
      return {};
    }
  },

  // Clear expired cache entries
  cleanCache: (): void => {
    try {
      const cache = offlineStorage.getCache();
      const now = Date.now();
      let modified = false;

      Object.keys(cache).forEach(key => {
        if (now - cache[key].timestamp > CACHE_DURATION) {
          delete cache[key];
          modified = true;
        }
      });

      if (modified) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Failed to clean cache:', error);
    }
  },

  // Clear all offline data
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
    }
  },

  // Check if data exists for a city
  hasData: (cityName: string): boolean => {
    return offlineStorage.getWeatherData(cityName) !== null;
  }
};

// Clean cache on module load
offlineStorage.cleanCache();
