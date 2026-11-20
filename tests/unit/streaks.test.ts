import { describe, expect, it } from 'vitest';
import { anchorOn, feedback, nightBars, status, streak, weekOf } from '../../src/logic/streaks';
import { parsePlan } from '../../src/logic/plan';
import { defaultSettings, emptyDay, type Day, type Days } from '../../src/logic/types';

const s = defaultSettings();
const iso = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m).toISOString();
const k = (d: number) => `2026-11-${String(d).padStart(2, '0')}`;
const withDays = (entries: Record<number, Partial<Day>>): Days =>
  Object.fromEntries(Object.entries(entries).map(([d, v]) => [k(Number(d)), { ...emptyDay(), ...v }]));
const abs = (...done: number[]) => withDays(Object.fromEntries(done.map((d) => [d, { abs: true }])));

describe('weekOf', () => {
  it('returns the Monday of the ISO week', () => {
    expect(weekOf('2026-11-19')).toBe('2026-11-16');
    expect(weekOf('2026-11-16')).toBe('2026-11-16');
    expect(weekOf('2026-11-22')).toBe('2026-11-16');
    expect(weekOf('2026-11-15')).toBe('2026-11-09');
  });
});

describe('streak with one grace miss per week', () => {
  it('counts consecutive done days', () => {
    expect(streak('abs', abs(17, 18, 19), s, k(19))).toEqual({ count: 3, graceLeft: true });
  });
  it('forgives one miss in a week', () => {
    const days = { ...abs(16, 18, 19), [k(17)]: emptyDay() };
    expect(streak('abs', days, s, k(19))).toEqual({ count: 3, graceLeft: false });
  });
  it('breaks on a second miss in the same week', () => {
    const days = { ...abs(15, 16, 19), [k(17)]: emptyDay(), [k(18)]: emptyDay() };
    expect(streak('abs', days, s, k(19)).count).toBe(1);
  });
  it('forgives misses in different weeks', () => {
    const days = { ...abs(13, 14, 16, 18, 19), [k(15)]: emptyDay(), [k(17)]: emptyDay() };
    expect(streak('abs', days, s, k(19)).count).toBe(5);
  });
  it('does not count an unfinished today as a miss', () => {
    expect(streak('abs', abs(17, 18), s, k(19))).toEqual({ count: 2, graceLeft: true });
  });
  it('days with no record count as misses', () => {
    expect(streak('abs', abs(14, 15, 18, 19), s, k(19)).count).toBe(2); // 17 graced, 16 breaks
  });
  it('skips rest days for workouts', () => {
    const plan = parsePlan('Mon: A\nWed: B\nFri: C');
    const days = withDays({ 16: { workout: true }, 18: { workout: true } });
    expect(streak('workout', days, { ...s, plan }, k(19)).count).toBe(2);
  });
});

describe('status', () => {
  it('judges wakes against the anchor in effect that morning', () => {
    const changed = { ...s, anchor: 555, anchorHistory: [{ date: k(18), from: 570, to: 555 }] };
    expect(anchorOn(changed, k(18))).toBe(570);
    expect(anchorOn(changed, k(19))).toBe(555);
    const days = withDays({ 18: { wake: { at: iso(18, 9, 40), source: 'manual' } }, 19: { wake: { at: iso(19, 9, 40), source: 'manual' } } });
    expect(status('wake', days, changed, k(18))).toBe('done');
    expect(status('wake', days, changed, k(19))).toBe('miss');
  });
  it('counts bed as done up to 30 min after lights-out', () => {
    expect(status('bed', withDays({ 18: { bed: { at: iso(19, 1, 50) } } }), s, k(18))).toBe('done');
    expect(status('bed', withDays({ 18: { bed: { at: iso(19, 2, 10) } } }), s, k(18))).toBe('miss');
  });
});

describe('nightBars', () => {
  it('places bed and next-morning wake on a 6 PM-based axis', () => {
    const days = withDays({ 18: { bed: { at: iso(19, 1, 30) } }, 19: { wake: { at: iso(19, 9, 30), source: 'manual' } } });
    const bars = nightBars(days, k(19), 2);
    expect(bars).toEqual([
      { key: k(18), bed: 450, wake: 930 },
      { key: k(19), bed: undefined, wake: undefined },
    ]);
  });
});

describe('feedback', () => {
  it('nudges to log when there is no data', () => {
    expect(feedback({}, s, k(19))).toBe('Log a few days and your week will show up here.');
  });
  it('summarises wake drift and the best streak in one sentence', () => {
    const days = withDays({
      17: { abs: true, wake: { at: iso(17, 9, 40), source: 'manual' } },
      18: { abs: true, wake: { at: iso(18, 9, 50), source: 'manual' } },
      19: { abs: true, wake: { at: iso(19, 9, 30), source: 'manual' } },
    });
    expect(feedback(days, s, k(19))).toBe('Wake-ups averaged 9:40 AM, 10 min after your anchor; best streak: abs at 3 days.');
  });
  it('praises an on-anchor week', () => {
    const days = withDays({ 19: { wake: { at: iso(19, 9, 32), source: 'manual' } } });
    expect(feedback(days, s, k(19))).toBe('Wake-ups averaged 9:32 AM, right on your anchor.');
  });
});
