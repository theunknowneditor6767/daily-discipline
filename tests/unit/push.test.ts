import { describe, expect, it } from 'vitest';
import { reminderSchedule } from '../../src/logic/push';
import { defaultSettings } from '../../src/logic/types';

describe('reminderSchedule (for the future Worker cron)', () => {
  it('is empty while push is flagged off', () => {
    expect(reminderSchedule(defaultSettings())).toEqual([]);
  });
  it('schedules a wind-down reminder 1h before lights-out and a morning nudge 20 min after the anchor', () => {
    expect(reminderSchedule({ ...defaultSettings(), pushEnabled: true })).toEqual([
      { kind: 'wind-down', at: '00:30', body: 'Wind-down time. Lights out in an hour.' },
      { kind: 'morning', at: '09:50', body: 'Morning. Tap to log your wake-up.' },
    ]);
  });
});
