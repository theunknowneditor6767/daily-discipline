import { defaultSettings, emptyDay, type Day, type Days, type Settings } from '../logic/types';

const req = <T>(r: IDBRequest<T>) =>
  new Promise<T>((res, rej) => {
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

const open = (name: string) =>
  new Promise<IDBDatabase>((res, rej) => {
    const r = indexedDB.open(name, 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('settings');
      r.result.createObjectStore('days');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

export const createStore = (name = 'dailydiscipline') => {
  const db = open(name);
  const tx = async (store: 'settings' | 'days', mode: IDBTransactionMode = 'readonly') =>
    (await db).transaction(store, mode).objectStore(store);

  const getSettings = async (): Promise<Settings> => ({
    ...defaultSettings(),
    ...((await req((await tx('settings')).get('settings'))) as Settings | undefined),
  });
  const saveSettings = async (s: Settings) => {
    await req((await tx('settings', 'readwrite')).put(s, 'settings'));
  };
  const getDay = async (key: string): Promise<Day> => ({
    ...emptyDay(),
    ...((await req((await tx('days')).get(key))) as Day | undefined),
  });
  const saveDay = async (key: string, day: Day) => {
    await req((await tx('days', 'readwrite')).put(day, key));
  };
  const allDays = async (): Promise<Days> => {
    const store = await tx('days');
    const [keys, values] = await Promise.all([req(store.getAllKeys()), req(store.getAll())]);
    return Object.fromEntries(keys.map((k, i) => [String(k), { ...emptyDay(), ...values[i] }]));
  };
  const exportJSON = async () =>
    JSON.stringify({ app: 'dailydiscipline', version: 1, settings: await getSettings(), days: await allDays() }, null, 2);
  const importJSON = async (json: string) => {
    const data = JSON.parse(json);
    if (data?.app !== 'dailydiscipline' || typeof data.settings !== 'object' || typeof data.days !== 'object') {
      throw new Error('Not a DailyDiscipline backup');
    }
    await saveSettings({ ...defaultSettings(), ...data.settings });
    for (const [k, d] of Object.entries(data.days as Days)) await saveDay(k, { ...emptyDay(), ...d });
  };

  return { getSettings, saveSettings, getDay, saveDay, allDays, exportJSON, importJSON };
};

export type Store = ReturnType<typeof createStore>;
