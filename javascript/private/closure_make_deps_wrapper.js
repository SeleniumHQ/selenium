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
 * Wrapper for closure-make-deps that reads file arguments from a response file.
 *
 * This avoids Windows command line length limits by reading the file list from
 * a file instead of passing them as command line arguments.
 *
 * Usage: closure_make_deps_wrapper.js <files_list> <output> <closure_path>
 */

const fs = require('fs');
const path = require('path');
const closureMakeDeps = require('google-closure-deps').closureMakeDeps;

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error(
        'Usage: closure_make_deps_wrapper.js <files_list> <output> <closure_path>');
    process.exit(1);
  }

  const [filesListPath, outputPath, closurePath] = args;

  const filesContent = fs.readFileSync(filesListPath, 'utf8');
  const files = filesContent.trim().split('\n').filter(f => f.length > 0);

  const cliArgs = [
    '--closure-path', closurePath,
    '--no-validate',
    ...files.flatMap(f => ['--file', f]),
  ];

  try {
    const result = await closureMakeDeps.execute(cliArgs);

    for (const error of result.errors) {
      console.error(error.toString());
    }

    if (result.text) {
      fs.writeFileSync(outputPath, result.text);
    } else {
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
