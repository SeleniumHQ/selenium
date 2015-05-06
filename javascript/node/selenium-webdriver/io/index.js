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

var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    tmp = require('tmp');

var promise = require('..').promise;



// PUBLIC API



/**
 * Recursively removes a directory and all of its contents. This is equivalent
 * to {@code rm -rf} on a POSIX system.
 * @param {string} path Path to the directory to remove.
 * @return {!promise.Promise} A promise to be resolved when the operation has
 *     completed.
 */
exports.rmDir = function(path) {
  return new promise.Promise(function(fulfill, reject) {
    var numAttempts = 0;
    attemptRm();
    function attemptRm() {
      numAttempts += 1;
      rimraf(path, function(err) {
        if (err) {
          if (err.code === 'ENOTEMPTY' && numAttempts < 2) {
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
 * @return {!promise.Promise.<string>} A promise for the copied file's path.
 */
exports.copy = function(src, dst) {
  var copied = promise.defer();

  var rs = fs.createReadStream(src);
  rs.on('error', copied.reject);
  rs.on('end', function() {
    copied.fulfill(dst);
  });

  var ws = fs.createWriteStream(dst);
  ws.on('error', copied.reject);

  rs.pipe(ws);

  return copied.promise;
};


/**
 * Recursively copies the contents of one directory to another.
 * @param {string} src The source directory to copy.
 * @param {string} dst The directory to copy into.
 * @param {(RegEx|function(string): boolean)=} opt_exclude An exclusion filter
 *     as either a regex or predicate function. All files matching this filter
 *     will not be copied.
 * @return {!promise.Promise.<string>} A promise for the destination
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
    files = files.filter(predicate);
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

  return promise.all(results).then(function() {
    return dst;
  });
};


/**
 * Tests if a file path exists.
 * @param {string} path The path to test.
 * @return {!promise.Promise.<boolean>} A promise for whether the file exists.
 */
exports.exists = function(path) {
  var result = promise.defer();
  fs.exists(path, result.fulfill);
  return result.promise;
};


/**
 * Deletes a name from the filesystem and possibly the file it refers to. Has
 * no effect if the file does not exist.
 * @param {string} path The path to remove.
 * @return {!promise.Promise} A promise for when the file has been removed.
 */
exports.unlink = function(path) {
  return new promise.Promise(function(fulfill, reject) {
    fs.exists(path, function(exists) {
      if (exists) {
        fs.unlink(path, function(err) {
          err && reject(err) || fulfill();
        });
      } else {
        fulfill();
      }
    });
  });
};


/**
 * @return {!promise.Promise.<string>} A promise for the path to a temporary
 *     directory.
 * @see https://www.npmjs.org/package/tmp
 */
exports.tmpDir = function() {
  return promise.checkedNodeCall(tmp.dir);
};


/**
 * @param {{postfix: string}=} opt_options Temporary file options.
 * @return {!promise.Promise.<string>} A promise for the path to a temporary
 *     file.
 * @see https://www.npmjs.org/package/tmp
 */
exports.tmpFile = function(opt_options) {
  // |tmp.file| checks arguments length to detect options rather than doing a
  // truthy check, so we must only pass options if there are some to pass.
  return opt_options ?
      promise.checkedNodeCall(tmp.file, opt_options) :
      promise.checkedNodeCall(tmp.file);
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
  if (opt_checkCwd) {
    var tmp = path.join(process.cwd(), file);
    if (fs.existsSync(tmp)) {
      return tmp;
    }
  }

  var dirs = process.env['PATH'].split(path.delimiter);
  var found = null;
  dirs.forEach(function(dir) {
    var tmp = path.join(dir, file);
    if (!found && fs.existsSync(tmp)) {
      found = tmp;
    }
  });
  return found;
};
