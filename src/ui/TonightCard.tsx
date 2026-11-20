import { formatClock, minutesOfDay, nightKey } from '../logic/time';
import { lightsOut, minutesToLightsOut, tonightText } from '../logic/winddown';
import { Clock } from './Clock';
import { Tick } from './Tick';
import type { Data } from './useData';

export function TonightCard({ data, now }: { data: Data; now: Date }) {
  const s = data.settings;
  const night = nightKey(now);
  const d = data.day(night);
  const lo = lightsOut(s.anchor);
  const left = minutesToLightsOut(now, s.anchor);

  const toggleStep = (i: number) =>
    data.updateDay(night, (x) => {
      const windDown = [...x.windDown];
      windDown[i] = !windDown[i];
      return { ...x, windDown };
    });
  const inBed = () => data.updateDay(night, (x) => (x.bed ? x : { ...x, bed: { at: new Date().toISOString() } }));

  return (
    <section class="card" data-testid="tonight">
      <header class="card-head">
        <span class="eyebrow">Tonight</span>
        <span class="muted small">Wake {formatClock(s.anchor)} − 8h</span>
      </header>
      <Clock min={lo} testid="lights-out" />
      <div class="hero-sub" data-testid="countdown">
        {d.bed ? `In bed at ${formatClock(minutesOfDay(new Date(d.bed.at)))}` : tonightText(left)}
      </div>

      <div class="ticks">
        {s.windDownSteps.map((step, i) => (
          <Tick key={i} done={!!d.windDown[i]} onToggle={() => toggleStep(i)} testid={`wind-${i}`}>
            {step}
          </Tick>
        ))}
      </div>

      {d.bed ? (
        <div class="done-banner" data-testid="in-bed-done">
          Sleep well. See you at {formatClock(s.anchor)}.
        </div>
      ) : (
        <button class="btn-primary" onClick={inBed}>
          In bed
        </button>
      )}
    </section>
  );
}
