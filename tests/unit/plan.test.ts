import { describe, expect, it } from 'vitest';
import { parsePlan, sessionFor, weekdayOf } from '../../src/logic/plan';

const TEXT = `My program (week A)
Mon: Push — bench 4x8
Incline DB 3x10
  dips 3xAMRAP
Tue - Pull
rows 4x8
Wednesday rest
thu: Legs
squat 5x5

FRIDAY Upper
Sat:
Run 5k easy
Sunday: Rest`;

describe('parsePlan', () => {
  const plan = parsePlan(TEXT);
  it('reads day headers with any separator and following detail lines', () => {
    expect(plan.mon).toEqual({ title: 'Push — bench 4x8', details: 'Incline DB 3x10\ndips 3xAMRAP' });
    expect(plan.tue).toEqual({ title: 'Pull', details: 'rows 4x8' });
    expect(plan.thu).toEqual({ title: 'Legs', details: 'squat 5x5' });
    expect(plan.fri).toEqual({ title: 'Upper', details: '' });
  });
  it('treats rest and missing days as rest', () => {
    expect(plan.wed).toBeUndefined();
    expect(plan.sun).toBeUndefined();
  });
  it('promotes the first detail line when a day header has no title', () => {
    expect(plan.sat).toEqual({ title: 'Run 5k easy', details: '' });
  });
  it('ignores words that merely start with a day name', () => {
    expect(parsePlan('Monday: A\nSundae after')).toEqual({ mon: { title: 'A', details: 'Sundae after' } });
  });
});

describe('sessionFor', () => {
  it('maps dates to weekdays', () => {
    expect(weekdayOf(new Date(2026, 10, 19))).toBe('thu');
    expect(weekdayOf(new Date(2026, 10, 22))).toBe('sun');
    expect(sessionFor(parsePlan(TEXT), new Date(2026, 10, 19))?.title).toBe('Legs');
    expect(sessionFor(parsePlan(TEXT), new Date(2026, 10, 18))).toBeNull();
  });
});
