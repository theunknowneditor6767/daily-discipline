import { expect, test } from '@playwright/test';

test('one tap marks ate to plan and it persists', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 19, 13, 0));
  await page.goto('./');
  const tick = page.getByTestId('ate-tick');
  await expect(tick).toHaveAttribute('aria-pressed', 'false');
  await tick.click();
  await expect(tick).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(200);
  await page.reload();
  await expect(page.getByTestId('ate-tick')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('ate-tick').click();
  await expect(page.getByTestId('ate-tick')).toHaveAttribute('aria-pressed', 'false');
});
