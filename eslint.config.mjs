import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Add your own rules and overrides here
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // 👇 Allow 'any' without lint errors
      '@typescript-eslint/no-explicit-any': 'off',

      // (Optional) still enforce other safe TS rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },

  // Global ignore patterns (keep these last)
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
