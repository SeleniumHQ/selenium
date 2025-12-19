#!/usr/bin/env node
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
