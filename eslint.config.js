import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default [
  //
  // Base JS rules
  //
  js.configs.recommended,

  //
  // TypeScript rules (type-aware)
  //
  ...tseslint.configs.recommendedTypeChecked,

  //
  // React + Hooks (converted from legacy configs)
  //
  ...compat.config(reactPlugin.configs.recommended),
  ...compat.config(reactHooks.configs.recommended),

  //
  // Our project rules / overrides
  //
  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      prettier: prettierPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
    },

    rules: {
      //
      // formatting / style
      //
      semi: ['error', 'never'],
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-tabs': 'error',
      'no-trailing-spaces': 'error',

      // Put first prop of a JSX element on a new line if multiline, etc.
      // (ported from your old .eslintrc)
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-max-props-per-line': [
        'error',
        { maximum: 1, when: 'multiline' },
      ],
      'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],

      //
      // prettier as a rule (so lint fails if it's not pretty)
      //
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          useTabs: false,
          endOfLine: 'lf',
          trailingComma: 'es5',
          printWidth: 100,
        },
      ],

      //
      // TS hygiene
      //
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      //
      // prefer function declarations over const fn = () => {}
      //
      'func-style': ['error', 'declaration', { allowArrowFunctions: false }],

      //
      // React tweaks
      //
      'react/react-in-jsx-scope': 'off', // not needed w/ React 17+
      'react/prop-types': 'off', // you’re using TS

      // react-hooks rules are already provided by compat,
      // but reproducing them here is harmless if we want them loud:
      ...reactHooks.configs.recommended.rules,
    },
  },

  //
  // Ignore junk / infra files so @typescript-eslint's type-aware rules don't choke
  //
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.vite/',
      'coverage/',

      // project config / tooling, not app code
      'eslint.config.js',
      'prettier.config.*',
      'vite.config.*',
      'tsconfig.*',
    ],
  },
]
