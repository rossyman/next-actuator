import { config, configs as tsConfigs } from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import eslint from '@eslint/js'
import globals from 'globals'

export default config(
  {
    ignores: [
      '**/.next/',
      '**/node_modules/',
      '**/*.d.ts',
      '**/dist/'
    ]
  },
  {
    plugins: {
      '@stylistic': stylistic
    },
    extends: [
      eslint.configs.recommended
    ],
    languageOptions: {
      parserOptions: {
        project: ['./packages/*/tsconfig.json', './apps/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none',
            requireLast: false
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false
          },
          multilineDetection: 'brackets'
        }
      ]
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tsConfigs.stylistic,
      ...tsConfigs.strict
    ],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  }
)
