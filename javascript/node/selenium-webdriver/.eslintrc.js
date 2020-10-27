module.exports = {
  env: {
    mocha: true,
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', 'prettier'],
  plugins: ['prettier', 'no-only-tests'],
  rules: {
    'prettier/prettier': 'error',
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
