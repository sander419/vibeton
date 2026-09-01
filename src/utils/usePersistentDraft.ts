import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from "react";

export interface PersistentDraftOptions {
  autoSaveIntervalMs?: number; // Periodic interval in ms (default 5000ms)
  debounceMs?: number; // Debounce before writing to localStorage
}

export interface PersistentDraftResult<T> {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  clearDraft: () => void;
  forceSave: () => void;
  hasDraft: boolean;
  isSaving: boolean;
  lastSavedTime: Date | null;
  savedAtFormatted: string;
  isRestoredFromStorage: boolean;
}

/**
 * Hook for syncing form state with localStorage
 * Supports periodic background auto-saving, debounced instant writes,
 * restoring on mount, explicit timestamps ("Saved at HH:MM:SS"),
 * and clearing upon submission.
 */
export function usePersistentDraft<T>(
  key: string,
  initialValues: T,
  options: PersistentDraftOptions = {}
): PersistentDraftResult<T> {
  const { autoSaveIntervalMs = 5000, debounceMs = 300 } = options;

  const [isRestoredFromStorage, setIsRestoredFromStorage] = useState(false);

  const [data, setData] = useState<T>(() => {
    if (typeof window === "undefined") return initialValues;
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        // Check if there is actual content differ from initial
        const merged = typeof initialValues === "object" && initialValues !== null && !Array.isArray(initialValues)
          ? { ...initialValues, ...parsed }
          : parsed;
        return merged;
      }
    } catch (e) {
      console.warn(`[usePersistentDraft] Failed to load draft for key "${key}":`, e);
    }
    return initialValues;
  });

  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const ts = localStorage.getItem(`${key}_saved_at`);
      return ts ? new Date(ts) : null;
    } catch {
      return null;
    }
  });

  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(key) !== null;
  });

  const [isSaving, setIsSaving] = useState(false);
  const isFirstRender = useRef(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Track initial restore flag on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setIsRestoredFromStorage(true);
      }
    } catch {
      // ignore
    }
  }, [key]);

  // Actual write function to localStorage
  const persistToStorage = useCallback((currentData: T) => {
    try {
      setIsSaving(true);
      if (currentData === undefined || currentData === null) {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_saved_at`);
        setHasDraft(false);
        setLastSavedTime(null);
      } else {
        // If it's an object, check if it's not totally empty/default
        localStorage.setItem(key, JSON.stringify(currentData));
        const now = new Date();
        localStorage.setItem(`${key}_saved_at`, now.toISOString());
        setHasDraft(true);
        setLastSavedTime(now);
      }
    } catch (e) {
      console.warn(`[usePersistentDraft] Failed to save draft for key "${key}":`, e);
    } finally {
      // Short delay for visual smoothness of saving indicator
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }
  }, [key]);

  // Debounced auto-save whenever data changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      persistToStorage(data);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [data, debounceMs, persistToStorage]);

  // Periodic heartbeat timer: Auto-saves every `autoSaveIntervalMs` during long writing sessions
  useEffect(() => {
    if (autoSaveIntervalMs <= 0) return;

    const interval = setInterval(() => {
      // If there is data in memory, ensure it's flushed and timestamped
      if (dataRef.current !== undefined && dataRef.current !== null) {
        persistToStorage(dataRef.current);
      }
    }, autoSaveIntervalMs);

    return () => clearInterval(interval);
  }, [autoSaveIntervalMs, persistToStorage]);

  // Update a single field in the object draft
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData((prev) => {
      if (typeof prev === "object" && prev !== null) {
        return { ...prev, [field]: value };
      }
      return value as unknown as T;
    });
  }, []);

  // Clear draft from localStorage and reset to initial values
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_saved_at`);
    } catch (e) {
      console.warn(`[usePersistentDraft] Failed to clear draft for key "${key}":`, e);
    }
    setData(initialValues);
    setHasDraft(false);
    setLastSavedTime(null);
    setIsRestoredFromStorage(false);
  }, [key, initialValues]);

  // Manual trigger to force save right now
  const forceSave = useCallback(() => {
    persistToStorage(dataRef.current);
  }, [persistToStorage]);

  // Formatted timestamp string for display
  const savedAtFormatted = lastSavedTime
    ? lastSavedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "";

  return {
    data,
    setData,
    updateField,
    clearDraft,
    forceSave,
    hasDraft,
    isSaving,
    lastSavedTime,
    savedAtFormatted,
    isRestoredFromStorage
  };
}
