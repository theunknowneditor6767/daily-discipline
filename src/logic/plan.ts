import type { Session, Settings, Weekday } from './types';

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const HEADER =
  /^(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b\s*[:\-–—]?\s*(.*)$/i;
const REST = /^rest\b/i;

/** Parse a pasted weekly plan: lines starting with a weekday open that day's session. */
export const parsePlan = (text: string): Settings['plan'] => {
  const plan: Settings['plan'] = {};
  let current: { day: Weekday; title: string; lines: string[] } | null = null;
  const flush = () => {
    if (!current || REST.test(current.title)) return;
    const lines = [...current.lines];
    const title = current.title || lines.shift() || '';
    if (title) plan[current.day] = { title, details: lines.join('\n') };
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const m = HEADER.exec(line);
    if (m) {
      flush();
      current = { day: m[1].slice(0, 3).toLowerCase() as Weekday, title: m[2].trim(), lines: [] };
    } else if (line && current) {
      current.lines.push(line);
    }
  }
  flush();
  return plan;
};

export const weekdayOf = (d: Date): Weekday => WEEKDAYS[d.getDay()];

export const sessionFor = (plan: Settings['plan'], d: Date): Session | null => plan[weekdayOf(d)] ?? null;
