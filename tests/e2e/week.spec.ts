import { expect, test } from '@playwright/test';

const iso = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m).toISOString();
const k = (d: number) => `2026-11-${String(d).padStart(2, '0')}`;

// A realistic week: bedtimes drifting earlier, one late morning, abs every day but one.
const days: Record<string, object> = {};
const beds = [[13, 14, 2, 20], [14, 15, 1, 55], [15, 16, 2, 5], [16, 17, 1, 40], [17, 18, 1, 25], [18, 19, 1, 35]];
const wakes: [number, number, number][] = [[14, 9, 35], [15, 10, 5], [16, 9, 40], [17, 9, 30], [18, 9, 25], [19, 9, 33]];
for (const [night, d, h, m] of beds) days[k(night)] = { snoozes: 0, windDown: [true, true, false], workout: false, abs: night !== 15, ate: true, bed: { at: iso(d, h, m) } };
for (const [d, h, m] of wakes) days[k(d)] = { ...(days[k(d)] ?? { snoozes: 0, windDown: [false, false, false], workout: false, abs: true, ate: true }), wake: { at: iso(d, h, m), source: 'shortcut' } };
days[k(19)] = { ...days[k(19)], abs: true, ate: true };
const backup = {
  app: 'dailydiscipline',
  version: 1,
  settings: { anchor: 570, target: 450, windDownSteps: ['Phone away', 'Lights low', 'Read'], plan: {}, planText: '', anchorHistory: [], pushEnabled: false },
  days,
};

test('restore a backup, then the week shows chart, streaks with grace and one sentence', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 19, 20, 0));
  await page.goto('./');
  await page.getByRole('button', { name: 'Setup' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByTestId('toast')).toHaveText('Backup restored');
  await page.getByRole('button', { name: 'Week' }).click();
  await expect(page.getByTestId('feedback')).toContainText('Wake-ups averaged');
  await expect(page.getByTestId('sleep-chart').locator('rect.sleep')).toHaveCount(6);
  // abs done 13,14,16-19; Sunday 15 missed and forgiven by that week's grace
  await expect(page.getByTestId('streak-abs').locator('.tile-n')).toHaveText('6');
  await page.screenshot({ path: 'docs/screenshots/09-week.png', animations: 'disabled', fullPage: true });
});

test('bad backup file is rejected kindly', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Setup' }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"nope":1}') });
  await expect(page.getByTestId('toast')).toHaveText('That file is not a DailyDiscipline backup');
});
