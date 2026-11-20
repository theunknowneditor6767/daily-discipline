import { expect, test } from '@playwright/test';

const at = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m);

test('fresh app shows the wake anchor and logs Good morning', async ({ page }) => {
  await page.clock.setFixedTime(at(19, 9, 41));
  await page.goto('./');
  await expect(page.getByTestId('anchor-time')).toHaveText('9:30AM');
  await page.screenshot({ path: 'docs/screenshots/01-morning-fresh.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'Good morning' }).click();
  await expect(page.getByTestId('wake-time')).toHaveText('9:41AM');
  await expect(page.getByTestId('wake-chip')).toHaveText('On anchor');
});

test('Shortcut URLs log snoozes and wake once, then strip the query', async ({ page }) => {
  await page.clock.setFixedTime(at(19, 9, 30));
  await page.goto('./?event=snoozed');
  await expect(page.getByTestId('toast')).toHaveText('Snooze logged');
  await page.goto('./?event=snoozed');
  await expect(page.getByTestId('toast')).toHaveText('Snooze logged');
  await page.clock.setFixedTime(at(19, 9, 52));
  await page.goto('./?event=alarm-stopped');
  await expect(page.getByTestId('toast')).toHaveText('Wake logged');
  expect(new URL(page.url()).search).toBe('');
  await page.reload();
  await expect(page.getByTestId('wake-time')).toHaveText('9:52AM');
  await expect(page.getByTestId('snoozes')).toHaveText('2 snoozes · noted');
  await expect(page.getByTestId('wake-chip')).toHaveText('Logged');
  await page.screenshot({ path: 'docs/screenshots/02-morning-snoozed.png', animations: 'disabled' });
});

test('three steady mornings propose moving the anchor 15 min earlier', async ({ page }) => {
  for (const d of [17, 18, 19]) {
    await page.clock.setFixedTime(at(d, 9, 35));
    await page.goto('./?event=alarm-stopped');
    await expect(page.getByTestId('wake-time')).toBeVisible();
  }
  await expect(page.getByTestId('proposal')).toContainText('9:15 AM');
  await page.screenshot({ path: 'docs/screenshots/03-morning-proposal.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'Move it' }).click();
  await expect(page.getByTestId('proposal')).toHaveCount(0);
  await expect(page.getByTestId('morning')).toContainText('7 steps');
  await page.waitForTimeout(200); // let the IndexedDB write commit before reload
  await page.clock.setFixedTime(at(20, 8, 0));
  await page.reload();
  await expect(page.getByTestId('anchor-time')).toHaveText('9:15AM');
});

test('Setup shows the Shortcut guide with event URLs', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Setup' }).click();
  await page.getByRole('button', { name: /iPhone Shortcuts/ }).click();
  const guide = page.getByTestId('shortcut-guide');
  await expect(guide).toContainText('/daily-discipline/?event=alarm-stopped');
  await expect(guide).toContainText('?event=snoozed');
  await expect(guide).toContainText('?event=in-bed');
  await page.screenshot({ path: 'docs/screenshots/04-setup-shortcuts.png', fullPage: true, animations: 'disabled' });
});
