# DailyDiscipline — Research (2026-11-19)

Research only. No design decisions here. Claims marked **[verify]** need on-device testing.

## 1. iOS home-screen web app (PWA) capabilities

| Capability | Status on iOS (home-screen install) | Implication |
|---|---|---|
| Web Push | Yes since iOS 16.4; permission must be requested from a user tap; home-screen only, not Safari tab | Reminders possible, but **push is sent from a server** (VAPID) — a pure local-only app cannot fire a notification while closed |
| Scheduled local notifications | No (no Notification Triggers API) | Every timed nudge needs a server/cron to send it |
| Background Sync / Periodic Sync / Background Fetch | Not supported; process suspended soon after backgrounding | No background logic; all logic runs while open |
| Badging API | Yes (16.4+) | Icon badge can show "1 thing left today" |
| Wake you up / alarm sound | No. Web app cannot override silent mode or ring | Use native Clock/Sleep alarm; app is companion, not alarm |
| Offline storage | IndexedDB + Cache API work; Safari's 7-day eviction cap does **not** apply to home-screen apps as long as they are used (own days-of-use counter) | Store locally; add export/backup button as insurance **[verify persist()]** |
| Health app (HealthKit) | No web access | Sleep/step data only via manual entry or Shortcuts bridge |
| Widgets / Lock Screen widgets | No for web apps | Home-screen icon + badge only; Shortcuts widget can launch app |
| iOS 26 | Any site added to Home Screen opens as web app by default | Install flow simpler |

**Alarm workarounds (native iOS, free):**
- Health app **Sleep Schedule** → Sleep Focus at bedtime, Wake Up alarm. Sleep Focus can show chosen shortcut/app on Lock Screen.
- Shortcuts personal automation **"Alarm → is stopped / is snoozed"** → "Open URL" to app (e.g. `?event=snooze`). Lets app log real wake/snooze times with zero typing **[verify triggers on current iOS]**.
- Shortcuts "Bedtime begins" / Sleep Focus on → open app wind-down screen. Sleep-Focus-off trigger behaviour has varied across iOS versions **[verify]**.
- Shortcuts can read Health sleep samples and pass them to app via URL params **[verify]** — only route to Health data.
- Fallback: calendar event alerts (native, reliable, no server).

Sources: [WebKit – Web Push for web apps on iOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) · [Apple – Sending web push](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) · [firt.dev iOS PWA compatibility](https://firt.dev/notes/pwa-ios/) · [MagicBell iOS PWA limitations](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) · [Apple forums – 7-day persistence](https://developer.apple.com/forums/thread/710157) · [WebKit bug 237350](https://bugs.webkit.org/show_bug.cgi?id=237350) · [web.dev storage](https://web.dev/articles/storage-for-the-web) · [Apple Shortcuts – Sleep Focus shortcuts](https://support.apple.com/guide/shortcuts/apd33e6b4bfd/ios) · [Home Assistant – Focus triggers iOS 26](https://community.home-assistant.io/t/blog-post-using-any-ios-18-ios-26-focus-mode-to-trigger-ha-automations/901179) · [Derek Seaman – Sleep focus automation caveats](https://www.derekseaman.com/?p=11765)

## 2. Night-owl sleep-schedule fixes (evidence)

| Lever | Evidence | App angle |
|---|---|---|
| **Fixed wake time, 7 days/week** | Core of delayed-sleep-phase treatment; consistent wake times prevent relapse. Fixed advanced schedule alone shifted circadian phase in young adults, with or without light | Anchor metric = wake time, not bedtime |
| **Gradual advance** | Reviews recommend *incremental* advances of wake time; no trial validates a specific 15-min/day rate. Common clinical practice: 15–30 min every few days | Step target (e.g. 10:00→9:30→9:00) only after a stable week **[rate is practice, not proven]** |
| **Morning bright light** | Morning light + evening light restriction advanced rhythms (Rosenthal 1990); light-therapy efficacy in adults inconsistent across trials | "Get outside / open blinds within 30 min" check |
| **Evening light/screen restriction, wind-down** | Part of successful protocols (light restriction in evening) | Wind-down checklist triggered by Sleep Focus |
| **Low-dose early-evening melatonin** | Recommended in reviews alongside light | Mention only as "ask a doctor"; app gives no medical advice |
| **Snooze** | Mixed: Ogawa 2022 — snoozing prolonged sleep inertia; 2023 J Sleep Res — brief (~30 min) snoozing in habitual snoozers did no harm and slightly helped cognition | Don't shame snoozing; set alarm at *real* get-up time; track snooze count as data |
| **Alarm placement** | Common behavioural advice (phone across room); no strong trial found | Optional tip, not core |

Takeaway: anchor wake time first; bedtime follows sleep pressure. Durability is the weak point — long-term relapse common, so maintenance matters more than the initial shift.

Sources: [Review – incremental wake advance + light + melatonin (PMC3208844)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3208844) · [Rosenthal 1990, bright morning light DSPS](https://pubmed.ncbi.nlm.nih.gov/2267478/) · [DSWPD diagnosis & treatment](https://pubmed.ncbi.nlm.nih.gov/27542884/) · [Fixed schedule ± blue light (PMC4830627)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4830627) · [2018 RCT, light vs control](https://pubmed.ncbi.nlm.nih.gov/29680419/) · [2021 light-therapy review (PMC7959333)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7959333) · [Ogawa 2022 snooze & sleep inertia](https://pmc.ncbi.nlm.nih.gov/articles/PMC9804954/) · [Scientific American on 2023 snooze study](https://scientificamerican.com/article/is-snoozing-the-alarm-good-or-bad-for-your-health)

## 3. Why habit apps stick vs get abandoned

| Finding | Evidence | Design implication |
|---|---|---|
| Habit formation is slow and variable | Lally 2010: median 66 days to automaticity, range 18–254; missing a day or two had little effect | Show "automaticity journey", not 21-day promise |
| All-or-nothing streaks backfire | Missed day ≠ reset per Lally; apps adding grace days (1/week, log until next-day end) are vendor practice, not trials | Streak with grace days / "never miss twice" rule |
| If-then plans work | Gollwitzer & Sheeran 2006 meta-analysis, 94 tests, d≈0.65; strongest for starting actions | Each habit stored as "When X, I will Y" |
| Temptation bundling | Milkman 2014 (n=226) gym-only audiobooks raised visits; 2020 (n=6,792) +10–14% weekly workouts | "Only during workout" reward slot (podcast/playlist) |
| Retention is brutal | Industry blogs: ~5–8% of users active at day 30 (no peer-reviewed data) | Minimal friction: ≤3 taps/day, no daily forms |
| Identity framing | Popular (Atomic Habits); found no direct trial in this search | Use lightly ("night-owl reformed" copy), don't rely on it |
| Accountability | Not researched deeply here; known effect of commitment/partner | Optional share-out, opt-in only |

Sources: [UCL – how long to form a habit](https://www.ucl.ac.uk/news/2009/aug/how-long-does-it-take-form-habit) · [BPS digest on Lally 2010](https://bps.org.uk/research-digest/how-form-habit) · [Gollwitzer & Sheeran 2006 meta-analysis](https://kops.uni-konstanz.de/entities/publication/2e749bfb-8533-437c-8203-7e788c910c5f) · [Milkman 2014 temptation bundling](https://repository.upenn.edu/oid_papers/150) · [Milkman et al. 2020 field experiment](https://faculty.wharton.upenn.edu/wp-content/uploads/2017/07/TemptationBundling.pdf) · [social.plus fitness retention](https://www.social.plus/blog/to-fitness-app-teams-your-members-need-more-than-workouts-to-stay-motivated) · [The Decision Lab – well-being apps](https://thedecisionlab.com/big-problems/improving-well-being-apps)

## 4. $0 private hosting

| Option | Cost | Privacy | Push? | Notes |
|---|---|---|---|---|
| **Cloudflare Pages (static) + Worker cron** | $0 (500 builds/mo, unlimited static bandwidth; Workers free 100k req/day) | Data stays in IndexedDB on phone; Worker holds only push subscription + reminder times | Yes — Cron Trigger sends web push | Best fit if reminders wanted. Skip Web Analytics (CLAUDE.md: no third-party analytics) |
| Vercel Hobby | $0, non-commercial | Same model | Yes via cron (Hobby cron limited) **[verify limits]** | Fine alternative; Cloudflare simpler for cron |
| GitHub Pages | $0 | Static only | No server → no push | Repo must be public on free plan **[verify]** |
| Local-only PWA (served from a home PC over a VPN) | $0 | Max privacy | No push; needs PC reachable to install/update | HTTPS needed for service worker |

Rule: push payloads generic ("Wind-down time"), no personal data leaves phone; HTTPS required for install + push.

Sources: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits) · [Cloudflare Pages product](https://www.cloudflare.com/products/pages) · [Temps – Pages free tier 2026](https://temps.sh/blog/cloudflare-pages-free-tier-limits-2026)

## Key constraints (summary)

1. App cannot ring/wake him — native Sleep Schedule alarm stays the alarm; Shortcuts automations bridge alarm/snooze/Sleep Focus events into app.
2. Timed reminders need a tiny server (Cloudflare Worker cron, $0); local-only = no reminders while closed.
3. No HealthKit, no widgets, no background work.
4. Local IndexedDB is safe if used regularly; ship export/backup.
5. Sleep plan: fixed wake time first, gradual advance, morning light; don't shame snoozing.
6. Habits: grace days, if-then plans, ≤3 taps/day.
