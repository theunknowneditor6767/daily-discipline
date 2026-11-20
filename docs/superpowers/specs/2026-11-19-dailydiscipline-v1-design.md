# DailyDiscipline v1 — Design (2026-11-19)

Decided by the project orchestrator with the owner's go-ahead, built on [docs/research.md](../../research.md).

## Product
Local-first PWA for an iPhone home screen. One screen ("Today") does the daily work; "Week" reviews; "Setup" configures.
Target: ≤3 taps/day. Wake and in-bed are logged automatically by iOS Shortcuts; manual taps = workout, abs, ate (the in-app buttons for wake and bed stay as fallbacks).

## Look
- Dark, calm: background `#0B0D12`, surfaces `#141821`, text `#F2F4F8` / muted `#8A93A6`.
- One accent: sunrise amber `#FFB547` (used for the primary state only; done states fill with accent).
- Type: system stack (`-apple-system`, SF Pro on iPhone), no web fonts (offline, private). Hero numbers 64–88px, tabular figures.
- Motion: 150–300ms ease-out; check-off = scale pop + fill; cards fade/slide in on load; respects `prefers-reduced-motion`.
- Layout for 390×844, safe-area insets, `display: standalone`.

## Features (build order = commit order)
1. **Wake anchor** (core)
   - Settings: `anchor` (current wake time, default 09:30), `target` (default 07:30), step 15 min, 3 good days to advance.
   - Good day = wake logged ≤ anchor + 15 min.
   - After 3 consecutive good days since the last anchor change, propose "Move wake to 9:15?" (never below target). Accept/not yet. Accepting records an anchor history entry.
   - "Good morning" button logs wake now (`source: manual`).
   - URL events: `?event=alarm-stopped` logs wake (`source: shortcut`, once per day); `?event=snoozed` increments today's snooze count. The query is stripped after handling, so a reload does not log twice.
   - Snoozes shown neutrally ("2 snoozes · logged"), no red, no judgement copy.
   - In-app Shortcut setup guide (step-by-step for Alarm stopped / Alarm snoozed / Sleep Focus on).
2. **Wind-down**
   - Lights-out = **current anchor** − 8 h. Deviation from the brief ("wake target − 8 h"): with anchor 9:30 and target 7:30, target-based gives 23:30 bed for a 9:30 wake (10 h in bed), which fights sleep pressure. The anchor-based time moves earlier with the anchor and reaches target − 8 h at the end.
   - Tonight card: "Lights out in 1h 20m" (or "Lights-out was 20m ago" neutrally), 3 wind-down steps he picks (tickable, reset nightly).
   - "In bed" one tap; `?event=in-bed` from Sleep Focus shortcut logs it automatically.
   - Night attribution: a bed log belongs to the night of `date(time − 12h)` (1:10 AM Nov 20 → night of Nov 19).
3. **Training**
   - Paste/enter weekly plan once. Parser: lines starting with a weekday (`Mon`, `Monday`, `mon:` …) start a day; text after the day name = session title; following lines = details. A day missing or titled `rest` = rest day.
   - Today card: session title + details (collapsed), one tap "Done". Abs = its own tick, every day.
4. **Eating**: one daily tick "Ate to plan".
5. **Streaks with grace + Week review**
   - Per habit (wake, bed, workout, abs, ate): streak counts consecutive days; one missed day per ISO week (Mon–Sun) is forgiven; a second miss breaks it. Rest days do not count against workout. Today never counts as a miss until it's over.
   - Week screen: bed/wake chart (last 7 nights, SVG), streak tiles, one sentence of feedback from simple rules (e.g. best habit, wake drift).
6. **Push (flagged off)**: `settings.pushEnabled=false`; UI hidden. Needs a Cloudflare Worker cron + VAPID keys + the owner's free Cloudflare account. Payloads are generic; no data leaves the phone.

## Data (IndexedDB, db `dailydiscipline`)
- `settings` (single record): anchor, target, windDownSteps[3], plan (weekday→{title, details}), anchorHistory[{date, from, to}], pushEnabled.
- `days` keyed `YYYY-MM-DD`: `{ wake?: {at, source}, snoozes, bed?: {at}, windDown: bool[3], workout, abs, ate }`.
- Export: JSON download from Setup. Import: paste/restore from JSON file.

## Architecture
- Vite + Preact + TypeScript. No runtime deps besides Preact.
- `src/logic/*` pure functions (time math, anchor proposal, plan parser, streaks, feedback) — unit-tested with Vitest.
- `src/store/*` IndexedDB wrapper — tested with fake-indexeddb.
- `src/ui/*` Preact components.
- `public/sw.js` hand-written cache-first service worker; `manifest.webmanifest`; PNG icons.
- Proof: Playwright e2e at 390×844 (iPhone 14/15) with screenshots in `docs/screenshots/`. Lighthouse 12 removed the PWA category, so installability is checked by an e2e test (manifest fields, icons, SW registration, offline reload).

## Non-goals (v1)
HealthKit, widgets, accounts, sync, analytics, hosting (local only for now).
