import { useState } from 'preact/hooks';
import { formatHM, parseHM } from '../logic/time';
import type { Store } from '../store/db';
import { PlanEditor } from './PlanEditor';
import { ShortcutGuide } from './ShortcutGuide';
import type { Data } from './useData';

export function Setup({ data, store }: { data: Data; store: Store }) {
  const s = data.settings;
  const [guideOpen, setGuideOpen] = useState(false);

  const exportData = async () => {
    const blob = new Blob([await store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dailydiscipline-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await store.importJSON(await file.text());
      await data.reload();
      data.setToast('Backup restored');
    } catch {
      data.setToast('That file is not a DailyDiscipline backup');
    }
  };

  return (
    <div class="screen" data-testid="setup">
      <h1 class="title">Setup</h1>

      <section class="card">
        <span class="eyebrow">Sleep</span>
        <label class="field">
          <span>Wake anchor (now)</span>
          <input
            type="time"
            data-testid="anchor-input"
            value={formatHM(s.anchor)}
            onChange={(e) => data.updateSettings((x) => ({ ...x, anchor: parseHM((e.target as HTMLInputElement).value) }))}
          />
        </label>
        <label class="field">
          <span>Wake target</span>
          <input
            type="time"
            data-testid="target-input"
            value={formatHM(s.target)}
            onChange={(e) => data.updateSettings((x) => ({ ...x, target: parseHM((e.target as HTMLInputElement).value) }))}
          />
        </label>
        <p class="muted small">After three mornings within 15 min of your anchor, the app offers to move it 15 min earlier until you reach the target.</p>
      </section>

      <section class="card">
        <span class="eyebrow">Wind-down (pick 3)</span>
        {s.windDownSteps.map((step, i) => (
          <label class="field" key={i}>
            <span>Step {i + 1}</span>
            <input
              type="text"
              data-testid={`wind-input-${i}`}
              value={step}
              onChange={(e) =>
                data.updateSettings((x) => {
                  const windDownSteps = [...x.windDownSteps];
                  windDownSteps[i] = (e.target as HTMLInputElement).value;
                  return { ...x, windDownSteps };
                })
              }
            />
          </label>
        ))}
      </section>

      <PlanEditor data={data} />

      <section class="card">
        <button class="disclosure" onClick={() => setGuideOpen(!guideOpen)} aria-expanded={guideOpen}>
          <span class="eyebrow">iPhone Shortcuts</span>
          <span class="muted">{guideOpen ? 'Hide' : 'Set up'}</span>
        </button>
        {guideOpen && <ShortcutGuide />}
      </section>

      <section class="card">
        <span class="eyebrow">Your data</span>
        <p class="muted small">Everything stays on this phone. Back it up now and then.</p>
        <div class="row">
          <button class="btn-ghost small" onClick={exportData}>
            Export backup
          </button>
          <label class="btn-ghost small file-btn">
            Restore
            <input type="file" accept="application/json" onChange={importData} />
          </label>
        </div>
      </section>
    </div>
  );
}
