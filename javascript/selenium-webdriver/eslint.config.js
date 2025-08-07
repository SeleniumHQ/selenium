// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// ESLint configuration for the Selenium project using flat config format

// Import required plugin configurations and utilities
const globals = require('globals') // Provides global variables for different environments
const noOnlyTests = require('eslint-plugin-no-only-tests') // Prevents usage of `.only` in test cases
const js = require('@eslint/js') // ESLint's recommended JavaScript config
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended') // Integrates Prettier with ESLint
const mochaPlugin = require('eslint-plugin-mocha') // Linting rules specific to Mocha test framework
const nodePlugin = require('eslint-plugin-n') // Linting rules for Node.js environment

module.exports = [
  // Base JavaScript linting rules
  js.configs.recommended,

  // Enforce Prettier formatting as ESLint rules
  eslintPluginPrettierRecommended,

  // Recommended rules for Mocha
  mochaPlugin.configs.flat.recommended,

  // Recommended Node.js rules for scripts
  nodePlugin.configs['flat/recommended-script'],

  {
    // Define language environment and parser settings
    languageOptions: {
      globals: {
        mocha: true, // Enable global Mocha variables like `describe`, `it`, etc.
        es6: true, // Enable ES6 globals like `Set`, `Map`, etc.
        ...globals.node, // Merge Node.js specific globals
      },
      parserOptions: {
        ecmaVersion: 2022, // Use modern JavaScript syntax (ES2022)
      },
    },

    // File patterns this config applies to
    files: ['**/*.js', 'lib/http.js'],

    // Files/folders to ignore during linting
    ignores: ['node_modules/*', 'generator/*', 'devtools/generator/'],

    // Plugins used
    plugins: {
      'no-only-tests': noOnlyTests, // Plugin to prevent `.only` in tests
    },

    // Custom rule configuration
    rules: {
      // Disallow reassignment of `const` variables
      'no-const-assign': 'error',

      // Disallow using `this` before calling `super()` in constructors
      'no-this-before-super': 'error',

      // Disallow usage of undeclared variables
      'no-undef': 'error',

      // Disallow unreachable code after `return`, `throw`, `continue`, or `break`
      'no-unreachable': 'error',

      // Disallow unused variables, with exceptions for those starting with `_`
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_', // Ignore variables like `_unused`
          args: 'all',
          argsIgnorePattern: '^_',
        },
      ],

      // Require `super()` call in constructors if extending another class
      'constructor-super': 'error',

      // Enforce correct usage of `typeof` comparisons
      'valid-typeof': 'error',

      // Prevent committing `.only` in tests (e.g., `it.only()`, `describe.only()`)
      'no-only-tests/no-only-tests': 'error',

      // Node.js plugin rules for preventing common issues
      'n/no-deprecated-api': ['error'], // Disallow use of deprecated Node.js APIs
      'n/no-missing-import': ['error'], // Disallow importing modules that don't exist
      'n/no-missing-require': ['error'], // Same as above for `require`
      'n/no-mixed-requires': ['error'], // Enforce either all `require` at top or dynamic—not both
      'n/no-new-require': ['error'], // Disallow `new require(...)` statements
      'n/no-unpublished-import': ['error'], // Disallow importing modules not listed in `package.json`
      'n/no-unpublished-require': [
        'error',
        {
          allowModules: [
            'globals',
            '@eslint/js',
            'eslint-plugin-mocha',
            'eslint-plugin-prettier',
            'eslint-plugin-n',
            'eslint-plugin-no-only-tests',
          ],
          tryExtensions: ['.js'], // Only check JS files
        },
      ],
      'n/prefer-node-protocol': ['error'], // Prefer `node:` protocol for built-in Node.js modules

      // Disable specific Mocha rules (likely due to project style)
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

      // Prettier-specific formatting rules
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf', // Use line feed only
          printWidth: 120, // Max line width
          semi: false, // No semicolons
          singleQuote: true, // Use single quotes
          trailingComma: 'all', // Use trailing commas wherever possible
        },
      ],
    },
  },
]
