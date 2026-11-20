import { expect, test } from '@playwright/test';

test('installable: manifest, icons and iOS meta tags', async ({ page, request }) => {
  await page.goto('./');
  const manifest = await (await request.get('manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('./');
  expect(manifest.scope).toBe('./');
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
  expect(manifest.icons.some((i: { sizes: string }) => i.sizes === '512x512')).toBe(true);
  expect((await request.get('apple-touch-icon.png')).ok()).toBe(true);
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  await expect(page.locator('link[rel=manifest]')).toHaveAttribute('href', '/daily-discipline/manifest.webmanifest');
});

test('service worker serves the app offline', async ({ page, context }) => {
  await page.goto('./');
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(new URL(scope).pathname).toBe('/daily-discipline/');
  await page.reload(); // let the controlling SW cache assets
  await expect(page.getByTestId('today')).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId('today')).toBeVisible();
  await context.setOffline(false);
});
