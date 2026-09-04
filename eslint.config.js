import js from '@eslint/js'
import query from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // Generated и build-файлы не должны участвовать в lint.
  globalIgnores(['dist/**', 'coverage/**', 'src/routeTree.gen.ts']),
  {
    name: 'base-javascript-and-typescript',
    files: ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    name: 'browser-application',
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      ...query.configs['flat/recommended'],
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    name: 'node-configuration',
    files: ['*.config.{js,cjs,mjs,ts,mts}', 'vite.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  // Этот config отключает stylistic rules, которые конфликтуют с Prettier.
  prettier,
])
