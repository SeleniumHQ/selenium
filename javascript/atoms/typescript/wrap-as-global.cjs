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

// Publishes a built atom as a browser global so the QUnit pages can load it
// with a plain <script> tag.
//
// The input is the same `.generated.js` the language bindings inject, so the
// test pages exercise the shipped artifact byte for byte rather than a
// separately-built copy of it.
//
// Usage: wrap-as-global.cjs <input.generated.js> <output.js> <dotted.global.name>

const fs = require('node:fs')

const [inputPath, outputPath, globalName] = process.argv.slice(2)

if (!inputPath || !outputPath || !globalName) {
  throw new Error('Expected input path, output path, and dotted global name')
}

const licenseHeader = `// Licensed to the Software Freedom Conservancy (SFC) under one
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
`

const segments = globalName.split('.')
if (segments.some((segment) => !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(segment))) {
  throw new Error(`Not a usable dotted global name: ${globalName}`)
}

// Build up each intermediate namespace so several atoms can share a prefix
// without the load order between their <script> tags mattering.
const namespaces = segments.slice(0, -1).map((_segment, index) => {
  const path = `window.${segments.slice(0, index + 1).join('.')}`
  return `${path} = ${path} || {};`
})

const atom = fs.readFileSync(inputPath, 'utf8').trimEnd()

fs.writeFileSync(outputPath, `${licenseHeader}\n${namespaces.join('\n')}\nwindow.${globalName} = ${atom};\n`)
