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

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  process.stderr.write(`Usage: node ${path.basename(__filename)} <src file> <dst file>\n`);
  process.exit(-1);
}

const buffer = fs.readFileSync(process.argv[2]);
fs.writeFileSync(process.argv[3], `// GENERATED CODE - DO NOT EDIT
module.exports = ${buffer.toString('utf8').trim()};
`);
