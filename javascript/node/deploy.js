// Copyright 2012 Selenium committers
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Script used to prepare WebDriverJS as a Node module.
 */

'use strict';

var assert = require('assert'),
    child_process = require('child_process'),
    fs = require('fs'),
    path = require('path'),
    vm = require('vm');

var optparse = require('./optparse');


var CLOSURE_BASE_REGEX = /^var goog = goog \|\| \{\};/;
var REQUIRE_REGEX = /^goog\.require\s*\(\s*[\'\"]([^\)]+)[\'\"]\s*\);?$/;
var PROVIDE_REGEX = /^goog\.provide\s*\(\s*[\'\"]([^\)]+)[\'\"]\s*\);?$/;


/**
 * Map of file paths to a hash of what symbols that file provides and requires.
 * @type {!Object.<{provides: !Array.<string>,
 *                  requires: !Array.<string>}>}
 */
var FILE_INFO = {};


/**
 * Map of symbol to path of the file that provides it.
 * @type {!Object.<string>}
 */
var PROVIDERS = {};


/**
 * Map of unprovided symbols to a list of files that require it.
 * @type {!Object.<!Array.<string>>}
 */
var UNPROVIDED = {};


/**
 * Maps file paths to their location in the lib/ directory.
 * @type {!Object.<string>}
 */
var CONTENT_MAP = {};


/**
 * Records a dependency on a symbol from a specific file.
 * @param {string} path Path to the file that requires the symbol.
 * @param {string} symbol The provided symbol.
 */
function addRequiredEdge(path, symbol) {
  var provider = PROVIDERS[symbol];
  if (!provider) {
    UNPROVIDED[symbol] = UNPROVIDED[symbol] || [];
    UNPROVIDED[symbol].push(path);
  }
}


/**
 * Records a symbol as being provided by a specific file.
 * @param {string} path Path to the file that provides the symbol.
 * @param {string} symbol The provided symbol.
 */
function updateProviders(path, symbol) {
  var provider = PROVIDERS[symbol];
  if (provider) {
    throw Error('Duplicate provide: ' + symbol + ':' +
        '\n  ' + provider + '\n  ' + path);
  }
  PROVIDERS[symbol] = path;

  var pendingRequires = UNPROVIDED[symbol];
  if (pendingRequires) {
    delete UNPROVIDED[symbol];
    pendingRequires.forEach(function(path) {
      addRequiredEdge(path, symbol);
    });
  }
}


/**
 * Parses a file for closure dependency info.
 * @param {string} path Path to the file to parse.
 */
function parseFile(path) {
  var contents = fs.readFileSync(path, 'utf8');
  var info = {provides: [], requires: []};
  FILE_INFO[path] = info;

  contents.split(/\n/).forEach(function(line) {
    var match = line.match(REQUIRE_REGEX);
    if (match) {
      info.requires.push(match[1]);
      addRequiredEdge(path, match[1]);
    } else if (match = line.match(PROVIDE_REGEX)) {
      info.provides.push(match[1]);
      updateProviders(path, match[1]);
    } else if (line.match(CLOSURE_BASE_REGEX)) {
      updateProviders(path, 'goog');
    }
  });
}


/**
 * @param {!Array.<string>} filePaths Paths to the library files to resolve.
 * @param {!Array.<string>} contentRoots Paths for the content roots.
 */
function processLibraryFiles(filePaths, contentRoots) {
  var seen = {};

  filePaths.forEach(function(filePath) {
    if (seen[filePath]) return;
    seen[filePath] = 1;

    if (fs.statSync(filePath).isDirectory()) {
      expandDir(filePath);
    } else {
      processFile(filePath);
    }
  });

  function processFile(filePath) {
    assert.ok(contentRoots.some(function(root) {
      if (filePath.substring(0, root.length) === root) {
        CONTENT_MAP[filePath] = filePath.substring(root.length + 1);
        return true;
      }
    }), 'File does not belong to a content root: ' + filePath);
    parseFile(filePath);
  }

  function expandDir(dirPath) {
    if (path.basename(dirPath) === '.svn') return;

    fs.readdirSync(dirPath).forEach(function(file) {
      file = path.join(dirPath, file);
      if (fs.statSync(file).isDirectory()) {
        expandDir(file);
      } else if (file.substring(file.length - 3) === '.js') {
        processFile(file);
      }
    });
  }
}


/**
 * @param {string} srcDir Path to the main source directory.
 * @param {string} outputDirPath Path to the directory to copy src files to.
 */
function copySrcs(srcDir, outputDirPath) {
  var filePaths = fs.readdirSync(srcDir);
  filePaths.forEach(function(filePath) {
    filePath = path.join(srcDir, filePath);
    if (fs.statSync(filePath).isDirectory()) {
      copySrcs(filePath, path.join(outputDirPath, path.basename(filePath)));
    } else {
      var dest = path.join(outputDirPath, path.basename(filePath));
      copyFile(filePath, dest);
    }
  });
}


function copyLibraries(outputDirPath, filePaths) {
  // Always copy over Closure base.
  var base = PROVIDERS['goog'];
  var googDirPath = path.join(outputDirPath, 'lib', CONTENT_MAP[base]);
  googDirPath = path.dirname(googDirPath);

  copy(base);

  var depsFileContents = [
    '// This file has been auto-generated; do not edit by hand'
  ];

  var seenSymbols = {};
  var seenFiles = {};
  var symbols = [];
  var providedSymbols = [];
  filePaths.filter(function(path) {
    return !fs.statSync(path).isDirectory();
  }).forEach(function(path) {
    providedSymbols = providedSymbols.concat(FILE_INFO[path].provides);
    symbols = symbols.concat(FILE_INFO[path].requires);
  });
  providedSymbols.forEach(resolveDeps);
  symbols.forEach(resolveDeps);

  var depsPath = path.join(outputDirPath, 'lib', 'goog', 'deps.js');
  fs.writeFileSync(depsPath, depsFileContents.join('\n') + '\n', 'utf8');

  function resolveDeps(symbol) {
    if (seenSymbols[symbol]) return;
    seenSymbols[symbol] = true;

    if (UNPROVIDED[symbol]) {
      throw Error('Missing provider for ' + JSON.stringify(symbol) +
          '; required in\n  ' + UNPROVIDED[symbol].join('\n  '));
    }

    var file = PROVIDERS[symbol];
    if (seenFiles[file]) return;
    seenFiles[file] = true;

    copy(file);

    var outputPath = pathFor(file);
    var relativePath = path.relative(googDirPath, outputPath);

    depsFileContents.push([
      'goog.addDependency(',
      JSON.stringify(relativePath), ', ',
      JSON.stringify(FILE_INFO[file].provides), ', ',
      JSON.stringify(FILE_INFO[file].requires),
      ');'
    ].join(''));

    FILE_INFO[file].requires.forEach(resolveDeps);
  }

  function pathFor(file) {
    return path.join(outputDirPath, 'lib', CONTENT_MAP[file]);
  }

  function copy(filePath) {
    var dest = pathFor(filePath);
    copyFile(filePath, dest);
  }
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


function generateDocs(outputDir) {
  var libDir = path.join(outputDir, 'lib');
  var excludedDirs = [
    path.join(outputDir, 'example'),
    path.join(libDir, 'test'),
    path.join(outputDir, 'test')
  ];

  var endsWith = function(str, suffix) {
    var l = str.length - suffix.length;
    return l >= 0 && str.indexOf(suffix, l) == l;
  };

  var getFiles = function(dir) {
    return fs.readdirSync(dir).map(function(file) {
      return path.join(dir, file);
    }).filter(function(file) {
      if (fs.statSync(file).isDirectory()) {
        return excludedDirs.indexOf(file) == -1;
      }
      return endsWith(path.basename(file), '.js');
    });
  };

  var config = {
    'output': path.join(outputDir, 'docs'),
    'closureLibraryDir': path.join(outputDir, 'lib', 'goog'),
    'license': path.join(outputDir, 'COPYING'),
    'readme': path.join(outputDir, 'README.md'),
    'language': 'ES5',
    'sources': getFiles(libDir),
    'modules': getFiles(outputDir).filter(function(file) {
      return file != libDir;
    })
  };

  var configFile = outputDir + '-docs.json';
  fs.writeFileSync(configFile, JSON.stringify(config), 'utf8');

  var command = [
      'java -jar', path.join(
          __dirname, '../../third_party/java/dossier/dossier-0.3.0.jar'),
      '-c', configFile
  ].join(' ');
  child_process.exec(command, function(error) {
    if (error) throw error;
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
      path('lib', {
        help: 'Path to a library file that should be copied to the lib/ ' +
            'sub-directory. This file will only be copied over if it is ' +
            'included in the transitive closure of a src file\'s ' +
            'dependencies. If a directory is specified, it will be ' +
            'recursively scanned for its .js files',
        list: true
      }).
      path('root', {
        help: 'A content root for mapping input files to their location under' +
            ' lib/. Each lib file will have its path stripped of any leading' +
            ' content roots befor being copied to the lib/ directory. Each ' +
            'lib file must belong to a directory under a content root.',
        list: true
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

  processLibraryFiles(options.lib, options.root);

  console.log('Copying sources...');
  copySrcs(options.src, options.output);
  console.log('Copying library files...');
  copyLibraries(options.output, options.lib);
  console.log('Copying resource files...');
  copyResources(options.output, options.resource, options.exclude_resource);
  console.log('Generating documentation...');
  generateDocs(options.output);

  console.log('ALL DONE');
}


assert.strictEqual(module, require.main, 'This module may not be included');
main();
