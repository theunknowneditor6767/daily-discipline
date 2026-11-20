export type WakeSource = 'manual' | 'shortcut';

export interface Day {
  wake?: { at: string; source: WakeSource };
  snoozes: number;
  bed?: { at: string };
  windDown: boolean[];
  workout: boolean;
  abs: boolean;
  ate: boolean;
}

export interface Session {
  title: string;
  details: string;
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Settings {
  anchor: number; // wake time, minutes after midnight
  target: number;
  windDownSteps: string[];
  plan: Partial<Record<Weekday, Session>>;
  planText: string;
  anchorHistory: { date: string; from: number; to: number }[];
  proposalDismissedOn?: string;
  pushEnabled: boolean;
}

export type Days = Record<string, Day>;

export const emptyDay = (): Day => ({
  snoozes: 0,
  windDown: [false, false, false],
  workout: false,
  abs: false,
  ate: false,
});

export const defaultSettings = (): Settings => ({
  anchor: 9 * 60 + 30,
  target: 7 * 60 + 30,
  windDownSteps: ['Phone on charger, out of reach', 'Lights low, screens off', 'Read 10 pages'],
  plan: {},
  planText: '',
  anchorHistory: [],
  pushEnabled: false,
});
