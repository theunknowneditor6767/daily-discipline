import type { ComponentChildren } from 'preact';

/** A full-width tappable row with an animated check box. */
export function Tick({
  done,
  onToggle,
  children,
  meta,
  testid,
}: {
  done: boolean;
  onToggle: () => void;
  children: ComponentChildren;
  meta?: ComponentChildren;
  testid?: string;
}) {
  return (
    <button class={`tick ${done ? 'done' : ''}`} onClick={onToggle} aria-pressed={done} data-testid={testid}>
      <span class="box">
        <svg viewBox="0 0 16 16" fill="none" stroke="#1a1206" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </span>
      <span class="label">{children}</span>
      {meta && <span class="meta">{meta}</span>}
    </button>
  );
}
