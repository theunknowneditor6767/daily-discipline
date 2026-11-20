import { useState } from 'preact/hooks';
import type { Store } from '../store/db';
import { Setup } from './Setup';
import { Today } from './Today';
import { useData, useNow, type Data } from './useData';
import { Week } from './Week';

type Tab = 'today' | 'week' | 'setup';
const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'setup', label: 'Setup' },
];

export function App({ store }: { store: Store }) {
  const raw = useData(store);
  const now = useNow();
  const [tab, setTab] = useState<Tab>('today');
  if (!raw.settings) return <div class="app" />;
  const data = raw as Data;

  return (
    <div class="app">
      <main key={tab} class="fade-in">
        {tab === 'today' && <Today data={data} now={now} goSetup={() => setTab('setup')} />}
        {tab === 'week' && <Week data={data} now={now} />}
        {tab === 'setup' &&<Setup data={data} store={store} />}
      </main>
      {data.toast && (
        <div class="toast" role="status" data-testid="toast">
          {data.toast}
        </div>
      )}
      <nav class="tabbar">
        {TABS.map((t) => (
          <button key={t.id} class={tab === t.id ? 'active' : ''} onClick={() => { setTab(t.id); data.setToast(null); }} aria-current={tab === t.id}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
