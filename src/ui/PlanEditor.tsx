import { useState } from 'preact/hooks';
import { parsePlan } from '../logic/plan';
import type { Weekday } from '../logic/types';
import type { Data } from './useData';

const ORDER: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PLACEHOLDER = `Mon: Push — bench 4x8
Incline DB 3x10
Tue: Pull
Wed: Rest
Thu: Legs
…`;

export function PlanEditor({ data }: { data: Data }) {
  const [text, setText] = useState(data.settings.planText);
  const plan = parsePlan(text);
  const dirty = text !== data.settings.planText;
  const save = () => {
    data.updateSettings((x) => ({ ...x, planText: text, plan }));
    data.setToast('Plan saved');
  };

  return (
    <section class="card">
      <span class="eyebrow">Weekly training plan</span>
      <p class="muted small">Paste it as you write it. Start each day with its name (Mon, Tuesday…). Lines below are the details.</p>
      <textarea
        data-testid="plan-input"
        placeholder={PLACEHOLDER}
        value={text}
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
      />
      <div class="week-preview" data-testid="plan-preview">
        {ORDER.map((d) => (
          <div key={d} class={`wp-day ${plan[d] ? 'on' : ''}`}>
            <span>{d.slice(0, 2)}</span>
            <small>{plan[d]?.title ?? 'Rest'}</small>
          </div>
        ))}
      </div>
      <button class="btn-primary" disabled={!dirty} onClick={save}>
        {dirty ? 'Save plan' : 'Saved'}
      </button>
    </section>
  );
}
