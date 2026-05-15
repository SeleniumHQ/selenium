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

// Wraps the compiled findElements TypeScript output as a browser global so that
// test HTML pages can load it directly via <script> and access it as
// window.bot.locators.typescript.findElements.

const fs = require('node:fs')

const [inputPath, outputPath] = process.argv.slice(2)

if (!inputPath || !outputPath) {
  throw new Error('Expected input and output file paths')
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
// under the License.`

const preamble = `
window.bot = window.bot || {};
window.bot.locators = window.bot.locators || {};
window.bot.locators.typescript = window.bot.locators.typescript || {};
window.bot.locators.typescript.findElements = `

const input = fs.readFileSync(inputPath, 'utf8')

if (!input.trimStart().startsWith('(function ()')) {
  throw new Error(
    `Unexpected compiled output format. Expected it to start with "(function ()", got: ${input.slice(0, 80)}`,
  )
}

const output = licenseHeader + preamble + input.trimStart()
fs.writeFileSync(outputPath, output)
