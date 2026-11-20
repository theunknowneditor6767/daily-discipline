import { useCallback, useEffect, useState } from 'preact/hooks';
import { applyEvent } from '../logic/anchor';
import { dateKey, nightKey } from '../logic/time';
import { emptyDay, type Day, type Days, type Settings } from '../logic/types';
import type { Store } from '../store/db';

export const useNow = (intervalMs = 30_000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

const EVENT_TOAST: Record<string, string> = {
  'alarm-stopped': 'Wake logged',
  snoozed: 'Snooze logged',
  'in-bed': 'In bed — logged',
};

export const useData = (store: Store) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [days, setDays] = useState<Days>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(location.search);
      const event = params.get('event');
      if (event && EVENT_TOAST[event]) {
        const now = new Date();
        const key = event === 'in-bed' ? nightKey(now) : dateKey(now);
        await store.saveDay(key, applyEvent(await store.getDay(key), event, now));
        setToast(EVENT_TOAST[event]);
      }
      if (event) history.replaceState(null, '', location.pathname);
      setSettings(await store.getSettings());
      setDays(await store.allDays());
    })();
  }, [store]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const day = useCallback((key: string): Day => days[key] ?? emptyDay(), [days]);

  const updateDay = useCallback(
    async (key: string, fn: (d: Day) => Day) => {
      const next = fn(days[key] ?? emptyDay());
      setDays((all) => ({ ...all, [key]: next }));
      await store.saveDay(key, next);
    },
    [days, store],
  );

  const updateSettings = useCallback(
    async (fn: (s: Settings) => Settings) => {
      if (!settings) return;
      const next = fn(settings);
      setSettings(next);
      await store.saveSettings(next);
    },
    [settings, store],
  );

  const reload = useCallback(async () => {
    setSettings(await store.getSettings());
    setDays(await store.allDays());
  }, [store]);

  return { settings, days, day, updateDay, updateSettings, toast, setToast, reload };
};

export type Data = ReturnType<typeof useData> & { settings: Settings };
