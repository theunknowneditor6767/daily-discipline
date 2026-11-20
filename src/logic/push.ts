import { formatHM } from './time';
import type { Settings } from './types';
import { lightsOut } from './winddown';

/**
 * Reminder times a server-side cron (Cloudflare Worker, pending the owner's account) would send as web push.
 * Only times and generic text leave the phone; no logs or habits. Empty while settings.pushEnabled is false.
 */
export const reminderSchedule = (s: Settings) =>
  s.pushEnabled
    ? [
        { kind: 'wind-down' as const, at: formatHM(lightsOut(s.anchor) - 60), body: 'Wind-down time. Lights out in an hour.' },
        { kind: 'morning' as const, at: formatHM(s.anchor + 20), body: 'Morning. Tap to log your wake-up.' },
      ]
    : [];
