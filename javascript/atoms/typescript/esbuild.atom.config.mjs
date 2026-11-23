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

// Every binding injects an atom as `return (<atom text>).apply(null, arguments)`,
// so the build has to emit a bare *expression* that evaluates to the atom
// function — not a module and not a statement.
//
// esbuild's `iife` + `globalName` emits the statement
//     var __seleniumAtom = (() => { ... })();
// whose value is the entry module's export namespace. The banner and footer
// below close over that statement and hand back the default export, turning the
// file into the single expression the bindings expect.
//
// Options Bazel's esbuild rule owns (bundle, entryPoints, format, outfile,
// platform, target) are deliberately absent; setting them here would be
// silently overridden.

const GLOBAL_NAME = '__seleniumAtom'

export default {
  globalName: GLOBAL_NAME,
  banner: { js: '(function () {' },
  footer: { js: `return ${GLOBAL_NAME}.default;\n})()` },

  // The atom text crosses the wire on every call, so keep it free of comments.
  // esbuild prints from the AST and already drops ordinary comments; this only
  // stops an `@license`/`@preserve` marker in a source file from surviving.
  legalComments: 'none',
}
