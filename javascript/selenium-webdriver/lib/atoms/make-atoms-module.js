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

const fs = require('node:fs')
const path = require('node:path')

if (process.argv.length < 3) {
  process.stderr.write(`Usage: node ${path.basename(__filename)} <src file> <dst file>\n`)
  // eslint-disable-next-line n/no-process-exit
  process.exit(-1)
}

const buffer = fs.readFileSync(process.argv[2])

// Shared license + note text, copied next to this file by BUILD.bazel — see scripts/*.txt.
const commentLines = (text) =>
  text
    .split('\n')
    .map((line) => `// ${line}`.trimEnd())
    .join('\n')
const LICENSE_HEADER = commentLines(
  fs.readFileSync(path.join(__dirname, 'license_header.txt'), 'utf8').replace(/\n$/, ''),
)
const GENERATED_NOTE = commentLines(
  fs
    .readFileSync(path.join(__dirname, 'generated_note_template.txt'), 'utf8')
    .replace('{generator}', 'make-atoms-module.js')
    .replace('{command}', 'bazel build //javascript/selenium-webdriver/lib/atoms:all')
    .trim(),
)

fs.writeFileSync(
  process.argv[3],
  `${LICENSE_HEADER}

${GENERATED_NOTE}
module.exports = ${buffer.toString('utf8').trim()};
`,
)
