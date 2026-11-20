import { isGoodWake } from './anchor';
import { sessionFor } from './plan';
import { addDays, formatClock, keyToDate, minutesOfDay } from './time';
import type { Days, Settings } from './types';
import { minutesToLightsOut } from './winddown';

export type Habit = 'wake' | 'bed' | 'workout' | 'abs' | 'ate';
export const HABITS: Habit[] = ['wake', 'bed', 'workout', 'abs', 'ate'];
export const HABIT_LABEL: Record<Habit, string> = {
  wake: 'wake on anchor',
  bed: 'in bed on time',
  workout: 'training',
  abs: 'abs',
  ate: 'eating to plan',
};
export const BED_GRACE_MIN = 30;

/** Monday (ISO week start) of the week containing key. */
export const weekOf = (key: string): string => addDays(key, -((keyToDate(key).getDay() + 6) % 7));

/** Anchor that applied on the morning of key; a change accepted on day D applies from D+1. */
export const anchorOn = (s: Settings, key: string): number =>
  s.anchorHistory.find((h) => h.date >= key)?.from ?? s.anchor;

export const status = (habit: Habit, days: Days, s: Settings, key: string): 'done' | 'miss' | 'skip' => {
  const d = days[key];
  switch (habit) {
    case 'wake':
      return d?.wake && isGoodWake(new Date(d.wake.at), anchorOn(s, key)) ? 'done' : 'miss';
    case 'bed':
      return d?.bed && minutesToLightsOut(new Date(d.bed.at), anchorOn(s, addDays(key, 1))) >= -BED_GRACE_MIN
        ? 'done'
        : 'miss';
    case 'workout':
      if (!sessionFor(s.plan, keyToDate(key))) return 'skip';
      return d?.workout ? 'done' : 'miss';
    default:
      return d?.[habit] ? 'done' : 'miss';
  }
};

/** Consecutive done days ending today; one miss per ISO week is forgiven, an unfinished today never breaks it. */
export const streak = (habit: Habit, days: Days, s: Settings, today: string): { count: number; graceLeft: boolean } => {
  const earliest = Object.keys(days).sort()[0] ?? today;
  const graceUsed = new Set<string>();
  let count = status(habit, days, s, today) === 'done' ? 1 : 0;
  for (let key = addDays(today, -1); key >= earliest; key = addDays(key, -1)) {
    const st = status(habit, days, s, key);
    if (st === 'done') count++;
    else if (st === 'miss') {
      if (graceUsed.has(weekOf(key))) break;
      graceUsed.add(weekOf(key));
    }
  }
  return { count, graceLeft: !graceUsed.has(weekOf(today)) };
};

/** Bed and next-morning wake for the last n nights, in minutes after 6 PM of that night. */
export const nightBars = (days: Days, today: string, n = 7) =>
  Array.from({ length: n }, (_, i) => {
    const key = addDays(today, i - n + 1);
    const base = keyToDate(key).getTime() + 18 * 3600_000;
    const rel = (iso?: string) => (iso ? Math.round((new Date(iso).getTime() - base) / 60_000) : undefined);
    return { key, bed: rel(days[key]?.bed?.at), wake: rel(days[addDays(key, 1)]?.wake?.at) };
  });

/** One sentence of feedback for the week ending today. */
export const feedback = (days: Days, s: Settings, today: string): string => {
  const keys = Array.from({ length: 7 }, (_, i) => addDays(today, -i));
  if (!keys.some((k) => days[k])) return 'Log a few days and your week will show up here.';

  const wakes = keys.flatMap((k) => (days[k]?.wake ? [minutesOfDay(new Date(days[k].wake!.at))] : []));
  const parts: string[] = [];
  if (wakes.length) {
    const avg = Math.round(wakes.reduce((a, b) => a + b, 0) / wakes.length);
    const diff = avg - s.anchor;
    const rel = Math.abs(diff) <= 5 ? 'right on your anchor' : diff > 0 ? `${diff} min after your anchor` : `${-diff} min before your anchor`;
    parts.push(`Wake-ups averaged ${formatClock(avg)}, ${rel}`);
  }
  const best = HABITS.map((h) => ({ h, n: streak(h, days, s, today).count })).reduce((a, b) => (b.n > a.n ? b : a));
  if (best.n >= 2) parts.push(`${parts.length ? 'best' : 'Best'} streak: ${HABIT_LABEL[best.h]} at ${best.n} days`);
  return parts.length ? `${parts.join('; ')}.` : 'Keep logging — one tap at a time.';
};
