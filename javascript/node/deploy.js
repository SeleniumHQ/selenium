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
 * @fileoverview Script used to prepare WebDriverJS as a Node module.
 */

'use strict';

var assert = require('assert'),
    fs = require('fs'),
    path = require('path');

var optparse = require('./optparse');
var gendocs = require('./gendocs');


/**
 * @param {string} srcDir Path to the main source directory.
 * @param {string} outputDirPath Path to the directory to copy src files to.
 */
function copySrcs(srcDir, outputDirPath) {
  var filePaths = fs.readdirSync(srcDir);
  filePaths.forEach(function(filePath) {
    if (filePath === 'node_modules') {
      return;
    }
    filePath = path.join(srcDir, filePath);
    if (fs.statSync(filePath).isDirectory()) {
      copySrcs(filePath, path.join(outputDirPath, path.basename(filePath)));
    } else {
      var dest = path.join(outputDirPath, path.basename(filePath));
      copyFile(filePath, dest);
    }
  });
}


function copyFile(src, dest) {
  createDirectoryIfNecessary(path.dirname(dest));

  var buffer = fs.readFileSync(src);
  fs.writeFileSync(dest, buffer);
}


function copyDirectory(baseDir, dest, exclusions) {
  createDirectoryIfNecessary(dest);
  if (!fs.statSync(dest).isDirectory()) {
    throw Error(dest + ' is not a directory!');
  }

  fs.readdirSync(path.resolve(baseDir)).
      map(function(filePath) {
        return path.join(baseDir, filePath);
      }).
      filter(function(filePath) {
        return !exclusions.some(function(exclusion) {
          return exclusion.test(filePath);
        });
      }).
      forEach(function(srcFile) {
        var destFile = path.join(dest, srcFile.substring(baseDir.length));
        if (fs.statSync(srcFile).isDirectory()) {
          copyDirectory(srcFile, destFile, exclusions);
        } else {
          copyFile(path.resolve(srcFile), destFile);
        }
      });
}


function createDirectoryIfNecessary(dirPath) {
  var toCreate = [];
  var current = dirPath;
  while (!fs.existsSync(current)) {
    toCreate.push(path.basename(current));
    current = path.dirname(current);
  }

  while (toCreate.length) {
    current = path.join(current, toCreate.pop());
    fs.mkdirSync(current);
  }
}


function copyResources(outputDirPath, resources, exclusions) {
  resources.forEach(function(resource) {
    var parts = resource.split(':', 2);
    var src = path.resolve(parts[0]);
    var dest = outputDirPath;

    var isAbsolute = path.resolve(parts[1]) === parts[1];
    if (!isAbsolute) {
      dest = path.join(dest, 'lib');
    }
    dest = path.join(dest, parts[1]);

    if (fs.statSync(src).isDirectory()) {
      copyDirectory(parts[0], dest, exclusions);
    } else {
      copyFile(src, dest);
    }
  });
}


function main() {
  var parser = new optparse.OptionParser().
      path('output', { help: 'Path to the output directory' }).
      path('src', {
        help: 'Path to the module source directory. The entire contents of ' +
            'this directory will be copied recursively to the main output ' +
            'directory.'
      }).
      string('resource', {
        help: 'A resource which should be copied into the final module, in ' +
            'the form of a ":" colon separated pair, the first part ' +
            'designating the source, and the second its destination. If ' +
            'the destination path is absolute, it is relative to the ' +
            'module root, otherwise it will be treated relative to the ' +
            'lib/ directory. If the source refers to a directory, the ' +
            'recursive contents of that directory will be copied to the ' +
            'destination directory.',
        list: true
      }).
      regex('exclude_resource', {
        help: 'A pattern for files to exclude when copying ' +
              'an entire directory of resources.',
        list: true
      });
  parser.parse();

  var options = parser.options;

  console.log('Copying sources...');
  copySrcs(options.src, options.output);
  console.log('Copying resource files...');
  copyResources(options.output, options.resource, options.exclude_resource);
  console.log('Generating documentation...');
  gendocs().then(() => console.log('ALL DONE'), function(e) {
    setTimeout(() => {throw e}, 0);
  });
}


assert.strictEqual(module, require.main, 'This module may not be included');
main();
