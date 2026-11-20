import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createStore } from '../../src/store/db';
import { defaultSettings, emptyDay } from '../../src/logic/types';

let n = 0;
const fresh = () => createStore(`test-${n++}`);

describe('store', () => {
  let store: ReturnType<typeof createStore>;
  beforeEach(() => {
    store = fresh();
  });

  it('returns default settings on first run', async () => {
    expect(await store.getSettings()).toEqual(defaultSettings());
  });

  it('saves settings and days', async () => {
    await store.saveSettings({ ...defaultSettings(), anchor: 555 });
    await store.saveDay('2026-11-19', { ...emptyDay(), ate: true });
    expect((await store.getSettings()).anchor).toBe(555);
    expect((await store.getDay('2026-11-19')).ate).toBe(true);
    expect(await store.getDay('2026-11-20')).toEqual(emptyDay());
    expect(Object.keys(await store.allDays())).toEqual(['2026-11-19']);
  });

  it('round-trips export and import', async () => {
    await store.saveSettings({ ...defaultSettings(), anchor: 540 });
    await store.saveDay('2026-11-18', { ...emptyDay(), abs: true });
    const json = await store.exportJSON();
    const other = fresh();
    await other.importJSON(json);
    expect((await other.getSettings()).anchor).toBe(540);
    expect((await other.getDay('2026-11-18')).abs).toBe(true);
  });

  it('rejects invalid import', async () => {
    await expect(store.importJSON('{"nope":1}')).rejects.toThrow();
  });
});
