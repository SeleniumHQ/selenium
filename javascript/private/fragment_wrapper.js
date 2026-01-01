#!/usr/bin/env node

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

/**
 * @fileoverview Wraps an esbuild bundle in the Selenium fragment pattern.
 *
 * The wrapper pattern ensures:
 * 1. The fragment never pollutes the global scope by using its own scope
 * 2. We import window.navigator into this scope since the code may need it
 * 3. The exported function is returned and can be called with arguments
 *
 * Input: An esbuild IIFE bundle that assigns to globalThis.__fragment__
 * Output: A wrapped function that can be embedded in browser automation code
 *
 * Usage: node fragment_wrapper.js <bundle.js>
 */

const fs = require('fs');

// Find the .js file among the arguments (esbuild may output .js + .js.map)
const args = process.argv.slice(2);
const bundlePath = args.find(arg => arg.endsWith('.js') && !arg.endsWith('.map.js'));

if (!bundlePath) {
  console.error('Usage: node fragment_wrapper.js <bundle.js> [bundle.js.map]');
  console.error('Received args:', args);
  process.exit(1);
}

const bundle = fs.readFileSync(bundlePath, 'utf-8');

// The original Closure wrapper pattern:
// function(){
//   return (function(){
//     %output%;
//     return this.se_exportedFunctionSymbol.apply(null,arguments);
//   }).apply(window, arguments);
// }

// Our modern equivalent:
// 1. The bundle runs and assigns the function to this.__fragment__
// 2. We call that function with the provided arguments
// 3. The inner function runs with `this === window` for navigator/document access

// Strip sourcemap comment for cleaner output
const bundleClean = bundle.replace(/\/\/# sourceMappingURL=.*$/gm, '').trim();

const wrapped = `function(){return(function(){${bundleClean};return this.__fragment__.apply(null,arguments)}).apply(window,arguments)}`;

console.log(wrapped);
