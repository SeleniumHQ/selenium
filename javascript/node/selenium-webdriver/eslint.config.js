const globals = require('globals')
const noOnlyTests = require('eslint-plugin-no-only-tests')
const js = require('@eslint/js')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const mochaPlugin = require('eslint-plugin-mocha')

module.exports = [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  mochaPlugin.configs.flat.recommended,
  {
    languageOptions: {
      globals: {
        mocha: true,
        es6: true,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2022,
      },
    },
    files: ['**/*.js', 'lib/http.js'],
    ignores: ['node_modules/*', 'generator/*', 'devtools/generator/'],
    plugins: {
      'no-only-tests': noOnlyTests,
    },
    rules: {
      'no-const-assign': 'error',
      'no-this-before-super': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          args: 'all',
          argsIgnorePattern: '^_',
        },
      ],
      'constructor-super': 'error',
      'valid-typeof': 'error',
      'no-only-tests/no-only-tests': 'error',
      'mocha/no-skipped-tests': ['off'],
      'mocha/no-mocha-arrows': ['off'],
      'mocha/no-setup-in-describe': ['off'],
      'mocha/no-top-level-hooks': ['off'],
      'mocha/no-sibling-hooks': ['off'],
      'mocha/no-exports': ['off'],
      'mocha/no-empty-description': ['off'],
      'mocha/max-top-level-suites': ['off'],
      'mocha/consistent-spacing-between-blocks': ['off'],
      'mocha/no-nested-tests': ['off'],
      'mocha/no-pending-tests': ['off'],
      'mocha/no-identical-title': ['off'],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf',
          printWidth: 120,
          semi: false,
          singleQuote: true,
          trailingComma: 'all',
        },
      ],
    },
  },
]
