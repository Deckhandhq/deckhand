import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const candidates = [
  new URL('./contract.json', import.meta.url),
  new URL('./generated/contract.json', import.meta.url),
];

describe('Prisma contract scaffold', () => {
  test('emits a readable contract', () => {
    const found = candidates.find((url) => existsSync(url));
    expect(found).toBeDefined();
    if (found) {
      const contract = JSON.parse(readFileSync(found, 'utf8'));
      expect(contract).toBeTruthy();
      expect(Array.isArray(contract)).toBe(false);
    }
  });
});
