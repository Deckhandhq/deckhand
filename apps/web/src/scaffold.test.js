import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const appRoot = new URL('../', import.meta.url);

describe('SvelteKit scaffold', () => {
  test('contains the Bun adapter and the initial route', () => {
    const packageJson = JSON.parse(readFileSync(new URL('package.json', appRoot), 'utf8'));
    const viteConfig = readFileSync(new URL('vite.config.ts', appRoot), 'utf8');

    expect(packageJson.devDependencies?.['@sveltejs/adapter-bun']).toBeDefined();
    expect(viteConfig).toContain('@sveltejs/adapter-bun');
    expect(existsSync(new URL('src/routes/+page.svelte', appRoot))).toBe(true);
  });
});
