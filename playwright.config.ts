import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: {
    // LIVE_URL runs the same suite against the deployed site, e.g. https://<user>.github.io/daily-discipline/
    baseURL: process.env.LIVE_URL ?? 'http://localhost:4173/daily-discipline/',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  },
  webServer: process.env.LIVE_URL
    ? undefined
    : { command: 'npm run preview', url: 'http://localhost:4173/daily-discipline/', reuseExistingServer: false },
});
