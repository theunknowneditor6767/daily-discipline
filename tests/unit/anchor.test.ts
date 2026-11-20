import { describe, expect, it } from 'vitest';
import { isGoodWake, proposeAdvance, applyEvent } from '../../src/logic/anchor';
import { defaultSettings, emptyDay, type Days } from '../../src/logic/types';

const wakeAt = (key: string, hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  const [y, mo, d] = key.split('-').map(Number);
  return { ...emptyDay(), wake: { at: new Date(y, mo - 1, d, h, m).toISOString(), source: 'manual' as const } };
};

const run = (times: Record<string, string>): Days =>
  Object.fromEntries(Object.entries(times).map(([k, t]) => [k, wakeAt(k, t)]));

describe('isGoodWake', () => {
  it('counts wakes up to 15 min after anchor as good', () => {
    expect(isGoodWake(new Date(2026, 10, 19, 9, 45), 570)).toBe(true);
    expect(isGoodWake(new Date(2026, 10, 19, 9, 46), 570)).toBe(false);
    expect(isGoodWake(new Date(2026, 10, 19, 8, 0), 570)).toBe(true);
  });
});

describe('proposeAdvance', () => {
  const s = defaultSettings();
  it('proposes 15 min earlier after 3 consecutive good days', () => {
    const days = run({ '2026-11-17': '09:35', '2026-11-18': '09:30', '2026-11-19': '09:20' });
    expect(proposeAdvance(days, s, '2026-11-19')).toEqual({ from: 570, to: 555 });
  });
  it('does not propose with a late day in the run', () => {
    const days = run({ '2026-11-17': '09:35', '2026-11-18': '10:00', '2026-11-19': '09:20' });
    expect(proposeAdvance(days, s, '2026-11-19')).toBeNull();
  });
  it('counts from yesterday when today has no wake yet', () => {
    const days = run({ '2026-11-16': '09:35', '2026-11-17': '09:35', '2026-11-18': '09:30' });
    expect(proposeAdvance(days, s, '2026-11-19')).toEqual({ from: 570, to: 555 });
  });
  it('ignores days on or before the last anchor change', () => {
    const days = run({ '2026-11-17': '09:00', '2026-11-18': '09:00', '2026-11-19': '09:00' });
    const changed = { ...s, anchor: 555, anchorHistory: [{ date: '2026-11-17', from: 570, to: 555 }] };
    expect(proposeAdvance(days, changed, '2026-11-19')).toBeNull();
  });
  it('never goes below target and stops at target', () => {
    const days = run({ '2026-11-17': '07:30', '2026-11-18': '07:30', '2026-11-19': '07:30' });
    expect(proposeAdvance(days, { ...s, anchor: 460 }, '2026-11-19')).toEqual({ from: 460, to: 450 });
    expect(proposeAdvance(days, { ...s, anchor: 450 }, '2026-11-19')).toBeNull();
  });
  it('stays quiet the day the proposal was dismissed', () => {
    const days = run({ '2026-11-17': '09:35', '2026-11-18': '09:30', '2026-11-19': '09:20' });
    expect(proposeAdvance(days, { ...s, proposalDismissedOn: '2026-11-19' }, '2026-11-19')).toBeNull();
  });
});

describe('applyEvent', () => {
  const now = new Date(2026, 10, 19, 9, 32);
  it('logs wake from alarm-stopped once', () => {
    const d = applyEvent(emptyDay(), 'alarm-stopped', now);
    expect(d.wake).toEqual({ at: now.toISOString(), source: 'shortcut' });
    const later = applyEvent(d, 'alarm-stopped', new Date(2026, 10, 19, 10, 0));
    expect(later.wake!.at).toBe(now.toISOString());
  });
  it('counts snoozes', () => {
    const d = applyEvent(applyEvent(emptyDay(), 'snoozed', now), 'snoozed', now);
    expect(d.snoozes).toBe(2);
  });
  it('logs bed from in-bed once', () => {
    const d = applyEvent(emptyDay(), 'in-bed', now);
    expect(d.bed).toEqual({ at: now.toISOString() });
  });
  it('ignores unknown events', () => {
    expect(applyEvent(emptyDay(), 'nope', now)).toEqual(emptyDay());
  });
});
