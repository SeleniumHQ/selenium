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

// Mirrors javascript/selenium-webdriver/eslint.config.js so both packages read the same.
const globals = require('globals')
const noOnlyTests = require('eslint-plugin-no-only-tests')
const js = require('@eslint/js')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const mochaPlugin = require('eslint-plugin-mocha').default
const nodePlugin = require('eslint-plugin-n')

module.exports = [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  mochaPlugin.configs.recommended,
  nodePlugin.configs['flat/recommended-script'],
  {
    languageOptions: {
      globals: {
        mocha: true,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 2022,
      },
    },
    files: ['**/*.js'],
    ignores: ['node_modules/*'],
    plugins: {
      'no-only-tests': noOnlyTests,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', args: 'all', argsIgnorePattern: '^_' }],
      'no-only-tests/no-only-tests': 'error',
      // selenium-webdriver comes from the workspace, and is added to the published package.json at release.
      'n/no-extraneous-require': ['error', { allowModules: ['selenium-webdriver'] }],
      'n/no-missing-require': ['error', { allowModules: ['selenium-webdriver'] }],
      'n/no-unpublished-require': 'off',
      'n/hashbang': 'off',
      'mocha/no-mocha-arrows': 'off',
      'mocha/max-top-level-suites': 'off',
    },
  },
]
