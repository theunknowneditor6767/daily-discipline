import { formatDuration, keyToDate, nightKey } from './time';

const DAY = 24 * 60;
export const SLEEP_MIN = 8 * 60;

/** Lights-out follows the current wake anchor, so it moves earlier as the anchor does. */
export const lightsOut = (anchor: number): number => (((anchor - SLEEP_MIN) % DAY) + DAY) % DAY;

/** Minutes from now until tonight's lights-out; negative once it has passed. */
export const minutesToLightsOut = (now: Date, anchor: number): number => {
  const lo = lightsOut(anchor);
  const target = keyToDate(nightKey(now));
  if (lo < 12 * 60) target.setDate(target.getDate() + 1);
  target.setHours(Math.floor(lo / 60), lo % 60, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 60_000);
};

export const tonightText = (min: number): string =>
  min > 0 ? `Lights out in ${formatDuration(min)}` : min === 0 ? 'Lights out now' : `Lights-out was ${formatDuration(-min)} ago`;

/** Evening = 6 PM through 4:59 AM, when the Tonight card leads. */
export const isEvening = (now: Date): boolean => now.getHours() >= 18 || now.getHours() < 5;
