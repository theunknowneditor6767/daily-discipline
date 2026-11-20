import { feedback, HABITS, nightBars, status, streak, type Habit } from '../logic/streaks';
import { dateKey, keyToDate } from '../logic/time';
import { lightsOut } from '../logic/winddown';
import type { Data } from './useData';

const TILE_LABEL: Record<Habit, string> = { wake: 'Wake', bed: 'Bed', workout: 'Training', abs: 'Abs', ate: 'Eating' };

// Chart axis: minutes after 6 PM. 9 PM (180) at top to noon (1080) at bottom.
const TOP = 180;
const BOTTOM = 1080;
const W = 358;
const H = 260;
const PAD_L = 34;
const PAD_B = 22;
const y = (min: number) => ((Math.min(BOTTOM, Math.max(TOP, min)) - TOP) / (BOTTOM - TOP)) * (H - PAD_B);
const TICKS = [
  { m: 240, l: '10p' },
  { m: 360, l: '12a' },
  { m: 480, l: '2a' },
  { m: 600, l: '4a' },
  { m: 720, l: '6a' },
  { m: 840, l: '8a' },
  { m: 960, l: '10a' },
];
const fromSix = (clockMin: number) => (clockMin < 18 * 60 ? clockMin + 6 * 60 : clockMin - 18 * 60);

function SleepChart({ data, today }: { data: Data; today: string }) {
  const bars = nightBars(data.days, today, 7);
  const colW = (W - PAD_L) / bars.length;
  const lo = y(fromSix(lightsOut(data.settings.anchor)));
  const an = y(fromSix(data.settings.anchor));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="chart" role="img" aria-label="Bed and wake times, last 7 nights" data-testid="sleep-chart">
      {TICKS.map((t) => (
        <g key={t.m}>
          <line x1={PAD_L} x2={W} y1={y(t.m)} y2={y(t.m)} class="grid" />
          <text x={0} y={y(t.m) + 4} class="axis">
            {t.l}
          </text>
        </g>
      ))}
      <line x1={PAD_L} x2={W} y1={lo} y2={lo} class="target" />
      <line x1={PAD_L} x2={W} y1={an} y2={an} class="target" />
      {bars.map((b, i) => {
        const cx = PAD_L + colW * i + colW / 2;
        return (
          <g key={b.key} class="bar" style={{ animationDelay: `${i * 50}ms` }}>
            {b.bed !== undefined && b.wake !== undefined && (
              <rect x={cx - 9} width={18} y={y(b.bed)} height={Math.max(4, y(b.wake) - y(b.bed))} rx={9} class="sleep" />
            )}
            {b.bed !== undefined && <circle cx={cx} cy={y(b.bed)} r={5} class="dot-bed" />}
            {b.wake !== undefined && <circle cx={cx} cy={y(b.wake)} r={5} class="dot-wake" />}
            <text x={cx} y={H - 4} class="axis" text-anchor="middle">
              {keyToDate(b.key).toLocaleDateString('en-US', { weekday: 'narrow' })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Week({ data, now }: { data: Data; now: Date }) {
  const today = dateKey(now);
  return (
    <div class="screen" data-testid="week">
      <header class="top">
        <span class="muted">Last 7 days</span>
        <h1 class="title">Your week</h1>
      </header>

      <section class="card feedback" data-testid="feedback">
        {feedback(data.days, data.settings, today)}
      </section>

      <section class="card">
        <header class="card-head">
          <span class="eyebrow">Sleep</span>
          <span class="legend">
            <i class="dot-bed" /> bed <i class="dot-wake" /> wake <i class="dash" /> targets
          </span>
        </header>
        <SleepChart data={data} today={today} />
      </section>

      <section class="tiles" data-testid="streaks">
        {HABITS.map((h) => {
          const st = streak(h, data.days, data.settings, today);
          const rest = h === 'workout' && status(h, data.days, data.settings, today) === 'skip';
          return (
            <div class="card tile" key={h} data-testid={`streak-${h}`}>
              <span class="tile-n">{st.count}</span>
              <span class="tile-l">{TILE_LABEL[h]}</span>
              <span class="tile-g">{h === 'workout' && !Object.keys(data.settings.plan).length ? 'no plan yet' : rest ? 'rest day' : st.graceLeft ? '1 grace left' : 'grace used'}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
