import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultSettings, settingsApi, type UserSettings } from '../services/trackingService';
import { useAuth } from './AuthContext';
import { migrateLocalData } from '../utils/migrateLocalData';
import { flushQueue } from '../utils/offlineQueue';

interface SettingsContextValue {
  settings: UserSettings;
  loaded: boolean;
  /** Merges a partial change and persists it (optimistic). */
  update: (patch: Partial<UserSettings>) => Promise<void>;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      let s = { ...defaultSettings, ...(await settingsApi.get()) };
      if (user && (await migrateLocalData(user.id, s)) > 0) {
        s = { ...defaultSettings, ...(await settingsApi.get()) };
      }
      setSettings(s);
    } catch {
      /* keep defaults when offline */
    } finally {
      setLoaded(true);
    }
  }, [user]);

  // Send workouts that were finished offline
  useEffect(() => {
    if (!user) return;
    const flush = () => flushQueue(user.id).catch(() => {});
    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) reload();
    else {
      setSettings(defaultSettings);
      setLoaded(false);
    }
  }, [isAuthenticated, reload]);

  const update = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      try {
        setSettings({ ...defaultSettings, ...(await settingsApi.save(next)) });
      } catch (err) {
        setSettings(settings); // roll back
        throw err;
      }
    },
    [settings],
  );

  return <SettingsContext.Provider value={{ settings, loaded, update, reload }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
