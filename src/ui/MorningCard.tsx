import { isGoodWake, proposeAdvance } from '../logic/anchor';
import { dateKey, formatClock, minutesOfDay } from '../logic/time';
import { isEvening } from '../logic/winddown';
import { Clock } from './Clock';
import type { Data } from './useData';

const snoozeText = (n: number) => (n === 1 ? '1 snooze' : `${n} snoozes`);

export function MorningCard({ data, now }: { data: Data; now: Date }) {
  const { settings: s } = data;
  const today = dateKey(now);
  const d = data.day(today);
  const proposal = proposeAdvance(data.days, s, today);
  const stepsLeft = Math.max(0, Math.ceil((s.anchor - s.target) / 15));
  const wake = d.wake ? new Date(d.wake.at) : null;
  const good = wake ? isGoodWake(wake, s.anchor) : false;

  const logWake = () =>
    data.updateDay(today, (x) => (x.wake ? x : { ...x, wake: { at: new Date().toISOString(), source: 'manual' } }));
  const accept = () =>
    proposal &&
    data.updateSettings((x) => ({
      ...x,
      anchor: proposal.to,
      anchorHistory: [...x.anchorHistory, { date: today, from: proposal.from, to: proposal.to }],
    }));
  const dismiss = () => data.updateSettings((x) => ({ ...x, proposalDismissedOn: today }));

  return (
    <section class="card" data-testid="morning">
      <header class="card-head">
        <span class="eyebrow">Morning</span>
        <span class="muted small">
          {stepsLeft === 0 ? 'At your target' : `Heading to ${formatClock(s.target)} · ${stepsLeft} step${stepsLeft === 1 ? '' : 's'}`}
        </span>
      </header>

      {isEvening(now) && !proposal ? (
        <div class="hero-row" data-testid="next-wake">
          <div>
            <div class="hero hero-sm">{formatClock(s.anchor)}</div>
            <div class="hero-sub">Next wake · keep the alarm across the room</div>
          </div>
        </div>
      ) : wake ? (
        <>
          <div class="hero-row">
            <Clock min={minutesOfDay(wake)} testid="wake-time" />
            <span class={`chip ${good ? 'chip-on' : ''}`} data-testid="wake-chip">
              {good ? 'On anchor' : 'Logged'}
            </span>
          </div>
          <div class="hero-sub">
            {d.wake!.source === 'shortcut' ? 'Up with the alarm' : 'Up'} · anchor {formatClock(s.anchor)}
          </div>
        </>
      ) : (
        <>
          <Clock min={s.anchor} testid="anchor-time" />
          <div class="hero-sub">Today's wake anchor</div>
          {now.getHours() < 12 ? (
            <button class="btn-primary" onClick={logWake}>
              Good morning
            </button>
          ) : (
            <button class="btn-ghost small" onClick={logWake}>
              Log wake-up now
            </button>
          )}
        </>
      )}

      {d.snoozes > 0 && (
        <p class="note" data-testid="snoozes">
          {snoozeText(d.snoozes)} · noted
        </p>
      )}

      {proposal && (
        <div class="proposal" data-testid="proposal">
          <p>
            Three steady mornings. Move your anchor to <strong>{formatClock(proposal.to)}</strong>?
          </p>
          <div class="row">
            <button class="btn-primary small" onClick={accept}>
              Move it
            </button>
            <button class="btn-ghost small" onClick={dismiss}>
              Not yet
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
