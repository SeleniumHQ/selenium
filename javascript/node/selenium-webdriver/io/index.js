// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var fs = require('fs'),
    path = require('path');


var PATH_SEPARATOR = process.platform === 'win32' ? ';' : ':';


// PUBLIC API


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

  var dirs = process.env['PATH'].split(PATH_SEPARATOR);
  var found = null;
  dirs.forEach(function(dir) {
    var tmp = path.join(dir, file);
    if (!found && fs.existsSync(tmp)) {
      found = tmp;
    }
  });
  return found;
};
