import { expect, test } from '@playwright/test';

const at = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m);

test('evening shows lights-out countdown first, wind-down ticks and one-tap in bed', async ({ page }) => {
  await page.clock.setFixedTime(at(19, 23, 50));
  await page.goto('./');
  const cards = page.locator('section.card');
  await expect(cards.first()).toHaveAttribute('data-testid', 'tonight');
  await expect(page.getByTestId('lights-out')).toHaveText('1:30AM');
  await expect(page.getByTestId('countdown')).toHaveText('Lights out in 1h 40m');
  await expect(page.getByTestId('next-wake')).toContainText('9:30 AM');
  await expect(page.getByRole('button', { name: 'Good morning' })).toHaveCount(0);
  await page.getByTestId('wind-0').click();
  await page.getByTestId('wind-1').click();
  await expect(page.getByTestId('wind-0')).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: 'docs/screenshots/05-tonight.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'In bed' }).click();
  await expect(page.getByTestId('countdown')).toHaveText('In bed at 11:50 PM');
  await expect(page.getByTestId('in-bed-done')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('wind-1')).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: 'docs/screenshots/06-in-bed.png', animations: 'disabled' });
});

test('after-midnight in-bed from Sleep Focus belongs to the previous night', async ({ page }) => {
  await page.clock.setFixedTime(at(20, 1, 40));
  await page.goto('./?event=in-bed');
  await expect(page.getByTestId('toast')).toHaveText('In bed — logged');
  await expect(page.getByTestId('countdown')).toHaveText('In bed at 1:40 AM');
});

test('lights-out follows the anchor and wind-down steps are editable', async ({ page }) => {
  await page.clock.setFixedTime(at(19, 14, 0));
  await page.goto('./');
  await page.getByRole('button', { name: 'Setup' }).click();
  await page.getByTestId('anchor-input').fill('08:00');
  await page.getByTestId('wind-input-2').fill('Stretch 5 min');
  await page.getByTestId('wind-input-2').blur();
  await page.getByRole('button', { name: 'Today' }).click();
  await expect(page.getByTestId('lights-out')).toHaveText('12:00AM');
  await expect(page.getByTestId('wind-2')).toContainText('Stretch 5 min');
});
