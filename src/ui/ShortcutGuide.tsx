/** The installed app's address; Shortcuts must open this exact URL so events land in the home-screen app's storage. */
export const LIVE_URL = 'https://theunknowneditor6767.github.io/daily-discipline/';
const base = () => LIVE_URL;

const AUTOMATIONS = [
  {
    title: 'Log your wake-up',
    trigger: 'Alarm → choose your wake alarm → Is Stopped',
    event: 'alarm-stopped',
  },
  {
    title: 'Count snoozes',
    trigger: 'Alarm → choose your wake alarm → Is Snoozed',
    event: 'snoozed',
  },
  {
    title: 'Log "in bed"',
    trigger: 'Sleep (Focus) → When Turning On',
    event: 'in-bed',
  },
];

export function ShortcutGuide() {
  return (
    <div class="guide" data-testid="shortcut-guide">
      <p class="muted">
        Three automations log things for you, so you don't have to tap. Set each one up once in the{' '}
        <strong>Shortcuts</strong> app.
      </p>
      {AUTOMATIONS.map((a, i) => (
        <div class="guide-step" key={a.event}>
          <div class="guide-num">{i + 1}</div>
          <div>
            <h4>{a.title}</h4>
            <ol>
              <li>Shortcuts → Automation → <strong>+</strong> (New Automation).</li>
              <li>
                Trigger: <strong>{a.trigger}</strong>. Pick <strong>Run Immediately</strong>.
              </li>
              <li>
                Action: <strong>Open URLs</strong> with:
                <code class="url">{`${base()}?event=${a.event}`}</code>
              </li>
              <li>Tap Done.</li>
            </ol>
          </div>
        </div>
      ))}
      <p class="muted small">
        Opening the link logs the event. The app strips it from the address straight away, so reloading never logs it twice.
        Sleep Focus comes from Health → Sleep Schedule, which also keeps your real wake alarm.
      </p>
    </div>
  );
}
