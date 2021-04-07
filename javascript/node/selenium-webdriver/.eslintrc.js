module.exports = {
  env: {
    mocha: true,
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['no-only-tests'],
  rules: {
    'no-const-assign': 'error',
    'no-this-before-super': 'error',
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', args: 'all', argsIgnorePattern: '^_' },
    ],
    'constructor-super': 'error',
    'valid-typeof': 'error',
    'no-only-tests/no-only-tests': 'error',
    'node/no-unpublished-require': 'error',
    'node/no-unsupported-features/es-syntax': 0,
    'node/no-unsupported-features/node-builtins': 0,
    'node/no-missing-import': 'error',
  },
}
