import { addDays, minutesOfDay } from './time';
import type { Day, Days, Settings } from './types';

export const GRACE_MIN = 15;
export const STEP_MIN = 15;
export const GOOD_DAYS_TO_ADVANCE = 3;

export const isGoodWake = (at: Date, anchor: number): boolean => minutesOfDay(at) <= anchor + GRACE_MIN;

/** Propose moving the wake anchor earlier after enough consecutive good mornings. */
export const proposeAdvance = (days: Days, s: Settings, today: string): { from: number; to: number } | null => {
  if (s.anchor <= s.target || s.proposalDismissedOn === today) return null;
  const lastChange = s.anchorHistory.at(-1)?.date ?? '';
  let key = days[today]?.wake ? today : addDays(today, -1);
  let good = 0;
  while (good < GOOD_DAYS_TO_ADVANCE && key > lastChange) {
    const wake = days[key]?.wake;
    if (!wake || !isGoodWake(new Date(wake.at), s.anchor)) return null;
    good++;
    key = addDays(key, -1);
  }
  if (good < GOOD_DAYS_TO_ADVANCE) return null;
  return { from: s.anchor, to: Math.max(s.target, s.anchor - STEP_MIN) };
};

export type AppEvent = 'alarm-stopped' | 'snoozed' | 'in-bed';

export const applyEvent = (day: Day, event: string, now: Date): Day => {
  switch (event) {
    case 'alarm-stopped':
      return day.wake ? day : { ...day, wake: { at: now.toISOString(), source: 'shortcut' } };
    case 'snoozed':
      return { ...day, snoozes: day.snoozes + 1 };
    case 'in-bed':
      return day.bed ? day : { ...day, bed: { at: now.toISOString() } };
    default:
      return day;
  }
};
