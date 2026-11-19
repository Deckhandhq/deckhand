import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/src/prisma/generated/**',
    '**/src/prisma/contract.d.ts',
    '**/migrations/snapshots/**'
  ] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      globals: { ...globals.node, Bun: 'readonly' }
    }
  }
);
