import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vitest/config';
import preact from '@preact/preset-vite';

/** Emits sw.js with the hashed build assets injected as its precache list. */
const serviceWorker = (): Plugin => ({
  name: 'dd-service-worker',
  apply: 'build',
  generateBundle(_, bundle) {
    const files = Object.keys(bundle).filter((f) => !f.endsWith('.html'));
    const icons = ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
    const version = createHash('sha1').update(files.join()).digest('hex').slice(0, 10);
    const header = `self.__PRECACHE__ = ${JSON.stringify([...files, ...icons])};\nself.__VERSION__ = '${version}';\n`;
    this.emitFile({ type: 'asset', fileName: 'sw.js', source: header + readFileSync('src/sw.js', 'utf8') });
  },
});

/** GitHub Pages serves the app from /daily-discipline/. */
export const BASE = '/daily-discipline/';

export default defineConfig({
  base: BASE,
  plugins: [preact(), serviceWorker()],
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
