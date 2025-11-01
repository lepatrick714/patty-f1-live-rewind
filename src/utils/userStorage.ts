/**
 * Central utilities for managing user data in localStorage
 * This file contains all localStorage operations to keep them organized in one place
 */

// Storage keys - centralized for easy management
export const STORAGE_KEYS = {
  YEAR_SELECTOR_SEEN: 'f1_year_selector_seen',
  RACE_DAY_SELECTOR_SEEN: 'f1_race_day_selector_seen',
  SESSION_SELECTOR_SEEN: 'f1_session_selector_seen',
  // Add more storage keys here as needed
  // USER_PREFERENCES: 'user_preferences',
  // LAST_SELECTED_YEAR: 'last_selected_year',
} as const;

/**
 * Safe localStorage getter - handles SSR and potential errors
 */
const getFromStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to read from localStorage for key: ${key}`, error);
    return null;
  }
};

/**
 * Safe localStorage setter - handles SSR and potential errors
 */
const setInStorage = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to write to localStorage for key: ${key}`, error);
    return false;
  }
};

/**
 * Safe localStorage remover - handles SSR and potential errors
 */
const removeFromStorage = (key: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove from localStorage for key: ${key}`, error);
    return false;
  }
};

// Year Selector specific functions
export const yearSelectorStorage = {
  /**
   * Check if user has seen the year selector before
   */
  hasSeenYearSelector: (): boolean => {
    return getFromStorage(STORAGE_KEYS.YEAR_SELECTOR_SEEN) === 'true';
  },

  /**
   * Mark that user has seen the year selector
   */
  markYearSelectorSeen: (): boolean => {
    return setInStorage(STORAGE_KEYS.YEAR_SELECTOR_SEEN, 'true');
  },

  /**
   * Reset year selector seen status (useful for testing/debugging)
   */
  resetYearSelectorSeen: (): boolean => {
    return removeFromStorage(STORAGE_KEYS.YEAR_SELECTOR_SEEN);
  },
};

// Race Day Selector specific functions
export const raceDaySelectorStorage = {
  /**
   * Check if user has seen the race day selector before
   */
  hasSeenRaceDaySelector: (): boolean => {
    return getFromStorage(STORAGE_KEYS.RACE_DAY_SELECTOR_SEEN) === 'true';
  },

  /**
   * Mark that user has seen the race day selector
   */
  markRaceDaySelectorSeen: (): boolean => {
    return setInStorage(STORAGE_KEYS.RACE_DAY_SELECTOR_SEEN, 'true');
  },

  /**
   * Reset race day selector seen status (useful for testing/debugging)
   */
  resetRaceDaySelectorSeen: (): boolean => {
    return removeFromStorage(STORAGE_KEYS.RACE_DAY_SELECTOR_SEEN);
  },
};

// Session Selector specific functions
export const sessionSelectorStorage = {
  /**
   * Check if user has seen the session selector before
   */
  hasSeenSessionSelector: (): boolean => {
    return getFromStorage(STORAGE_KEYS.SESSION_SELECTOR_SEEN) === 'true';
  },

  /**
   * Mark that user has seen the session selector
   */
  markSessionSelectorSeen: (): boolean => {
    return setInStorage(STORAGE_KEYS.SESSION_SELECTOR_SEEN, 'true');
  },

  /**
   * Reset session selector seen status (useful for testing/debugging)
   */
  resetSessionSelectorSeen: (): boolean => {
    return removeFromStorage(STORAGE_KEYS.SESSION_SELECTOR_SEEN);
  },
};

// Generic storage utilities for future use
export const userStorage = {
  get: getFromStorage,
  set: setInStorage,
  remove: removeFromStorage,
  
  /**
   * Get a boolean value from storage
   */
  getBoolean: (key: string, defaultValue = false): boolean => {
    const value = getFromStorage(key);
    return value === 'true' ? true : value === 'false' ? false : defaultValue;
  },

  /**
   * Set a boolean value in storage
   */
  setBoolean: (key: string, value: boolean): boolean => {
    return setInStorage(key, value.toString());
  },

  /**
   * Get a JSON object from storage
   */
  getObject: <T>(key: string, defaultValue: T | null = null): T | null => {
    const value = getFromStorage(key);
    if (!value) return defaultValue;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON from localStorage for key: ${key}`, error);
      return defaultValue;
    }
  },

  /**
   * Set a JSON object in storage
   */
  setObject: <T>(key: string, value: T): boolean => {
    try {
      return setInStorage(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to stringify JSON for localStorage key: ${key}`, error);
      return false;
    }
  },
};