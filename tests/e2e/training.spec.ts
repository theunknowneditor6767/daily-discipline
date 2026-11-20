import { expect, test } from '@playwright/test';

const at = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m);
const PLAN = `Mon: Push — bench 4x8
Incline DB 3x10
Tue: Pull
Wed: Rest
Thu: Legs
Squat 5x5
RDL 3x8
Fri: Upper`;

test('paste a weekly plan once, see today\'s session, tick done and abs', async ({ page }) => {
  await page.clock.setFixedTime(at(19, 12, 0)); // Thursday
  await page.goto('./');
  await expect(page.getByTestId('training')).toContainText('Paste your weekly program');
  await page.getByRole('button', { name: 'Add my plan' }).click();
  await page.getByTestId('plan-input').fill(PLAN);
  await expect(page.getByTestId('plan-preview')).toContainText('Legs');
  await page.screenshot({ path: 'docs/screenshots/07-plan-editor.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  await page.getByRole('button', { name: 'Today' }).click();

  await expect(page.getByTestId('session-title')).toHaveText('Legs');
  await page.getByRole('button', { name: 'Show details' }).click();
  await expect(page.getByTestId('session-details')).toContainText('RDL 3x8');
  await page.getByTestId('workout-tick').click();
  await page.getByTestId('abs-tick').click();
  await expect(page.getByTestId('workout-tick')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('abs-tick')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('training').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/screenshots/08-training-done.png', animations: 'disabled' });
  await page.waitForTimeout(200);
  await page.reload();
  await expect(page.getByTestId('workout-tick')).toHaveAttribute('aria-pressed', 'true');
});

test('rest day shows only the abs tick', async ({ page }) => {
  await page.clock.setFixedTime(at(18, 12, 0)); // Wednesday
  await page.goto('./');
  await page.getByRole('button', { name: 'Setup' }).click();
  await page.getByTestId('plan-input').fill(PLAN);
  await page.getByRole('button', { name: 'Save plan' }).click();
  await page.getByRole('button', { name: 'Today' }).click();
  await expect(page.getByTestId('session-title')).toHaveText('Rest day');
  await expect(page.getByTestId('workout-tick')).toHaveCount(0);
  await expect(page.getByTestId('abs-tick')).toBeVisible();
});
