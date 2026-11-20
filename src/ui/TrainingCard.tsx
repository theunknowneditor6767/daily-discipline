import { useState } from 'preact/hooks';
import { sessionFor } from '../logic/plan';
import { dateKey } from '../logic/time';
import { Tick } from './Tick';
import type { Data } from './useData';

export function TrainingCard({ data, now, goSetup }: { data: Data; now: Date; goSetup: () => void }) {
  const [open, setOpen] = useState(false);
  const today = dateKey(now);
  const d = data.day(today);
  const hasPlan = Object.keys(data.settings.plan).length > 0;
  const session = sessionFor(data.settings.plan, now);
  const toggle = (k: 'workout' | 'abs') => data.updateDay(today, (x) => ({ ...x, [k]: !x[k] }));

  return (
    <section class="card" data-testid="training">
      <header class="card-head">
        <span class="eyebrow">Training</span>
        <span class="muted small">{now.toLocaleDateString('en-US', { weekday: 'long' })}</span>
      </header>

      {!hasPlan ? (
        <div class="empty">
          <p class="muted">Paste your weekly program once and today's session shows up here.</p>
          <button class="btn-ghost small" onClick={goSetup}>
            Add my plan
          </button>
        </div>
      ) : session ? (
        <>
          <h2 class="session-title" data-testid="session-title">
            {session.title}
          </h2>
          {session.details && (
            <>
              <button class="link" onClick={() => setOpen(!open)} aria-expanded={open}>
                {open ? 'Hide details' : 'Show details'}
              </button>
              {open && (
                <pre class="session-details" data-testid="session-details">
                  {session.details}
                </pre>
              )}
            </>
          )}
        </>
      ) : (
        <h2 class="session-title muted" data-testid="session-title">
          Rest day
        </h2>
      )}

      <div class="ticks">
        {session && (
          <Tick done={d.workout} onToggle={() => toggle('workout')} testid="workout-tick">
            Session done
          </Tick>
        )}
        <Tick done={d.abs} onToggle={() => toggle('abs')} testid="abs-tick">
          Abs
        </Tick>
      </div>
    </section>
  );
}
