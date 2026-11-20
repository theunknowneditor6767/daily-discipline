import { dateKey } from '../logic/time';
import { Tick } from './Tick';
import type { Data } from './useData';

export function EatingCard({ data, now }: { data: Data; now: Date }) {
  const today = dateKey(now);
  const d = data.day(today);
  return (
    <section class="card card-compact" data-testid="eating">
      <div class="ticks">
        <Tick done={d.ate} onToggle={() => data.updateDay(today, (x) => ({ ...x, ate: !x.ate }))} testid="ate-tick" meta="Eating">
          Ate to plan
        </Tick>
      </div>
    </section>
  );
}
