import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import oxlint from 'eslint-plugin-oxlint'
import { globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  /** Settings */
  [globalIgnores(['dist/'])],

  /** Basic Config */
  eslint.configs.recommended,
  {
    rules: {
      'no-fallthrough': 'off',
    },
  },

  /** TypeScript */
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  /** Prettier */
  eslintConfigPrettier,

  /** Oxlint */
  oxlint.configs['flat/recommended'],
)
