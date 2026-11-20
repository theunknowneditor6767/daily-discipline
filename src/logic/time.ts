const DAY = 24 * 60;
const wrap = (min: number) => ((min % DAY) + DAY) % DAY;
const pad = (n: number) => String(n).padStart(2, '0');

export const parseHM = (hm: string): number => {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};

export const formatHM = (min: number): string => {
  const w = wrap(min);
  return `${pad(Math.floor(w / 60))}:${pad(w % 60)}`;
};

export const formatClock = (min: number): string => {
  const w = wrap(min);
  const h = Math.floor(w / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(w % 60)} ${h < 12 ? 'AM' : 'PM'}`;
};

export const dateKey = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const keyToDate = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key: string, n: number): string => {
  const d = keyToDate(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

export const minutesOfDay = (d: Date): number => d.getHours() * 60 + d.getMinutes();

/** Bedtimes after midnight belong to the previous night. */
export const nightKey = (d: Date): string => dateKey(new Date(d.getTime() - 12 * 3600_000));

export const formatDuration = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};
