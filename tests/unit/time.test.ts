import { describe, expect, it } from 'vitest';
import { parseHM, formatHM, formatClock, dateKey, minutesOfDay, nightKey, addDays, formatDuration } from '../../src/logic/time';

describe('time helpers', () => {
  it('parses and formats HH:MM', () => {
    expect(parseHM('09:30')).toBe(570);
    expect(parseHM('7:05')).toBe(425);
    expect(formatHM(570)).toBe('09:30');
    expect(formatHM(-30)).toBe('23:30');
  });
  it('formats 12-hour clock', () => {
    expect(formatClock(570)).toBe('9:30 AM');
    expect(formatClock(0)).toBe('12:00 AM');
    expect(formatClock(90)).toBe('1:30 AM');
    expect(formatClock(13 * 60 + 5)).toBe('1:05 PM');
    expect(formatClock(-60)).toBe('11:00 PM');
  });
  it('builds local date keys', () => {
    expect(dateKey(new Date(2026, 10, 9, 23, 59))).toBe('2026-11-09');
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
  });
  it('gives minutes of day', () => {
    expect(minutesOfDay(new Date(2026, 10, 19, 9, 41))).toBe(581);
  });
  it('attributes after-midnight bedtimes to the previous night', () => {
    expect(nightKey(new Date(2026, 10, 20, 1, 10))).toBe('2026-11-19');
    expect(nightKey(new Date(2026, 10, 19, 23, 10))).toBe('2026-11-19');
  });
  it('formats durations', () => {
    expect(formatDuration(80)).toBe('1h 20m');
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(120)).toBe('2h');
  });
});
