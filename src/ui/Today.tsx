import { isEvening } from '../logic/winddown';
import { EatingCard } from './EatingCard';
import { MorningCard } from './MorningCard';
import { TonightCard } from './TonightCard';
import { TrainingCard } from './TrainingCard';
import type { Data } from './useData';

const greeting = (h: number) => (h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');

export function Today({ data, now, goSetup }: { data: Data; now: Date; goSetup: () => void }) {
  const morning = <MorningCard key="m" data={data} now={now} />;
  const tonight = <TonightCard key="t" data={data} now={now} />;
  const training = <TrainingCard key="tr" data={data} now={now} goSetup={goSetup} />;
  const eating = <EatingCard key="e" data={data} now={now} />;
  return (
    <div class="screen" data-testid="today">
      <header class="top">
        <span class="muted">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        <h1 class="title">{greeting(now.getHours())}</h1>
      </header>
      {isEvening(now) ? [tonight, training, eating, morning] : [morning, training, eating, tonight]}
    </div>
  );
}
