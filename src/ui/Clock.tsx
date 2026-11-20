import { formatClock } from '../logic/time';

/** Big clock figure with a small AM/PM suffix. */
export function Clock({ min, testid }: { min: number; testid?: string }) {
  const [hm, ampm] = formatClock(min).split(' ');
  return (
    <div class="hero" data-testid={testid}>
      {hm}
      <span class="ampm">{ampm}</span>
    </div>
  );
}
