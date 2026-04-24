import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, configPrettier],
    plugins: {
      prettier: prettier,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
]);
