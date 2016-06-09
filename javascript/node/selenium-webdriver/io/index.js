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

'use strict';

var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    tmp = require('tmp');


/**
 * @param {!Function} fn .
 * @return {!Promise<T>} .
 * @template T
 */
function checkedCall(fn) {
  return new Promise((resolve, reject) => {
    try {
      fn((err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}



// PUBLIC API



/**
 * Recursively removes a directory and all of its contents. This is equivalent
 * to {@code rm -rf} on a POSIX system.
 * @param {string} dirPath Path to the directory to remove.
 * @return {!Promise} A promise to be resolved when the operation has
 *     completed.
 */
exports.rmDir = function(dirPath) {
  return new Promise(function(fulfill, reject) {
    var numAttempts = 0;
    attemptRm();
    function attemptRm() {
      numAttempts += 1;
      rimraf(dirPath, function(err) {
        if (err) {
          if (err.code && err.code === 'ENOTEMPTY' && numAttempts < 2) {
            attemptRm();
            return;
          }
          reject(err);
        } else {
          fulfill();
        }
      });
    }
  });
};


/**
 * Copies one file to another.
 * @param {string} src The source file.
 * @param {string} dst The destination file.
 * @return {!Promise<string>} A promise for the copied file's path.
 */
exports.copy = function(src, dst) {
  return new Promise(function(fulfill, reject) {
    var rs = fs.createReadStream(src);
    rs.on('error', reject);
    rs.on('end', () => fulfill(dst));

    var ws = fs.createWriteStream(dst);
    ws.on('error', reject);

    rs.pipe(ws);
  });
};


/**
 * Recursively copies the contents of one directory to another.
 * @param {string} src The source directory to copy.
 * @param {string} dst The directory to copy into.
 * @param {(RegExp|function(string): boolean)=} opt_exclude An exclusion filter
 *     as either a regex or predicate function. All files matching this filter
 *     will not be copied.
 * @return {!Promise<string>} A promise for the destination
 *     directory's path once all files have been copied.
 */
exports.copyDir = function(src, dst, opt_exclude) {
  var predicate = opt_exclude;
  if (opt_exclude && typeof opt_exclude !== 'function') {
    predicate = function(p) {
      return !opt_exclude.test(p);
    };
  }

  // TODO(jleyba): Make this function completely async.
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst);
  }

  var files = fs.readdirSync(src);
  files = files.map(function(file) {
    return path.join(src, file);
  });

  if (predicate) {
    files = files.filter(/** @type {function(string): boolean} */(predicate));
  }

  var results = [];
  files.forEach(function(file) {
    var stats = fs.statSync(file);
    var target = path.join(dst, path.basename(file));

    if (stats.isDirectory()) {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, stats.mode);
      }
      results.push(exports.copyDir(file, target, predicate));
    } else {
      results.push(exports.copy(file, target));
    }
  });

  return Promise.all(results).then(() => dst);
};


/**
 * Tests if a file path exists.
 * @param {string} aPath The path to test.
 * @return {!Promise<boolean>} A promise for whether the file exists.
 */
exports.exists = function(aPath) {
  return new Promise(function(fulfill, reject) {
    let type = typeof aPath;
    if (type !== 'string') {
      reject(TypeError(`expected string path, but got ${type}`));
    } else {
      fs.exists(aPath, fulfill);
    }
  });
};


/**
 * Calls `stat(2)`.
 * @param {string} aPath The path to stat.
 * @return {!Promise<!fs.Stats>} A promise for the file stats.
 */
exports.stat = function stat(aPath) {
  return checkedCall(callback => fs.stat(aPath, callback));
};


/**
 * Deletes a name from the filesystem and possibly the file it refers to. Has
 * no effect if the file does not exist.
 * @param {string} aPath The path to remove.
 * @return {!Promise} A promise for when the file has been removed.
 */
exports.unlink = function(aPath) {
  return new Promise(function(fulfill, reject) {
    fs.exists(aPath, function(exists) {
      if (exists) {
        fs.unlink(aPath, function(err) {
          err && reject(err) || fulfill();
        });
      } else {
        fulfill();
      }
    });
  });
};


/**
 * @return {!Promise<string>} A promise for the path to a temporary directory.
 * @see https://www.npmjs.org/package/tmp
 */
exports.tmpDir = function() {
  return checkedCall(tmp.dir);
};


/**
 * @param {{postfix: string}=} opt_options Temporary file options.
 * @return {!Promise<string>} A promise for the path to a temporary file.
 * @see https://www.npmjs.org/package/tmp
 */
exports.tmpFile = function(opt_options) {
  return checkedCall(callback => {
    // |tmp.file| checks arguments length to detect options rather than doing a
    // truthy check, so we must only pass options if there are some to pass.
    if (opt_options) {
      tmp.file(opt_options, callback);
    } else {
      tmp.file(callback);
    }
  });
};


/**
 * Searches the {@code PATH} environment variable for the given file.
 * @param {string} file The file to locate on the PATH.
 * @param {boolean=} opt_checkCwd Whether to always start with the search with
 *     the current working directory, regardless of whether it is explicitly
 *     listed on the PATH.
 * @return {?string} Path to the located file, or {@code null} if it could
 *     not be found.
 */
exports.findInPath = function(file, opt_checkCwd) {
  let dirs = [];
  if (opt_checkCwd) {
    dirs.push(process.cwd());
  }
  dirs.push.apply(dirs, process.env['PATH'].split(path.delimiter));

  let foundInDir = dirs.find(dir => {
    let tmp = path.join(dir, file);
    try {
      let stats = fs.statSync(tmp);
      return stats.isFile() && !stats.isDirectory();
    } catch (ex) {
      return false;
    }
  });

  return foundInDir ? path.join(foundInDir, file) : null;
};


/**
 * Reads the contents of the given file.
 *
 * @param {string} aPath Path to the file to read.
 * @return {!Promise<!Buffer>} A promise that will resolve with a buffer of the
 *     file contents.
 */
exports.read = function(aPath) {
  return checkedCall(callback => fs.readFile(aPath, callback));
};


/**
 * Writes to a file.
 *
 * @param {string} aPath Path to the file to write to.
 * @param {(string|!Buffer)} data The data to write.
 * @return {!Promise} A promise that will resolve when the operation has
 *     completed.
 */
exports.write = function(aPath, data) {
  return checkedCall(callback => fs.writeFile(aPath, data, callback));
};


/**
 * Creates a directory.
 *
 * @param {string} aPath The directory path.
 * @return {!Promise<string>} A promise that will resolve with the path of the
 *     created directory.
 */
exports.mkdir = function(aPath) {
  return checkedCall(callback => {
    fs.mkdir(aPath, undefined, err => {
      if (err && err.code !== 'EEXIST') {
        callback(err);
      } else {
        callback(null, aPath);
      }
    });
  });
};
