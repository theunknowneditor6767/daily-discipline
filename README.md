# DailyDiscipline

Local-first iPhone home-screen app (PWA): wake anchor, wind-down, training, abs, eating, streaks with grace.
Data lives only in the phone's IndexedDB (export/restore in Setup). No analytics, no accounts.

```bash
npm install
npm run dev        # local dev server
npm run verify     # unit tests + type-checked build + Playwright e2e (390x844), screenshots -> docs/screenshots/
```

Design: `docs/superpowers/specs/2026-11-19-dailydiscipline-v1-design.md`. Research: `docs/research.md`. Plan/state: `plan/`.

Install on iPhone needs HTTPS hosting (not set up yet). Then: Safari → Share → Add to Home Screen, and follow Setup → iPhone Shortcuts.
Push reminders are flagged off (`settings.pushEnabled`); they need a Cloudflare Worker cron (see `src/logic/push.ts`).
