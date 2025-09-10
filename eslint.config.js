import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      // AI-friendly patterns for better code readability and understanding
      'id-length': ['warn', { min: 2, exceptions: ['_', 'i', 'j', 'x', 'y'] }],
      'max-depth': ['warn', 4],
      'max-lines-per-function': ['warn', 100],
      'complexity': ['warn', 10],
      'max-params': ['warn', 4],
      'prefer-destructuring': ['warn', { array: false, object: true }],
      'object-shorthand': ['warn', 'always'],
      'arrow-spacing': 'warn',
      'space-before-function-paren': ['warn', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
      
      // Card management specific patterns
      'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 100, 1000] }],
      'consistent-return': 'warn',
      'no-nested-ternary': 'warn',
      'prefer-template': 'warn',
    },
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      '.husky/**',
      'archon/**',
    ],
  },
];
