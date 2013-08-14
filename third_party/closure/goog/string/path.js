// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for dealing with POSIX path strings. Based on
 * Python's os.path and posixpath.
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.string.path');

goog.require('goog.array');
goog.require('goog.string');


/**
 * Returns the final component of a pathname.
 * See http://docs.python.org/library/os.path.html#os.path.basename
 * @param {string} path A pathname.
 * @return {string} path The final component of a pathname, i.e. everything
 *     after the final slash.
 */
goog.string.path.baseName = function(path) {
  var i = path.lastIndexOf('/') + 1;
  return path.slice(i);
};


/**
 * Alias to goog.string.path.baseName.
 * @param {string} path A pathname.
 * @return {string} path The final component of a pathname.
 * @deprecated Use goog.string.path.baseName.
 */
goog.string.path.basename = goog.string.path.baseName;


/**
 * Returns the directory component of a pathname.
 * See http://docs.python.org/library/os.path.html#os.path.dirname
 * @param {string} path A pathname.
 * @return {string} The directory component of a pathname, i.e. everything
 *     leading up to the final slash.
 */
goog.string.path.dirname = function(path) {
  var i = path.lastIndexOf('/') + 1;
  var head = path.slice(0, i);
  // If the path isn't all forward slashes, trim the trailing slashes.
  if (!/^\/+$/.test(head)) {
    head = head.replace(/\/+$/, '');
  }
  return head;
};


/**
 * Extracts the extension part of a pathname.
 * @param {string} path The path name to process.
 * @return {string} The extension if any, otherwise the empty string.
 */
goog.string.path.extension = function(path) {
  var separator = '.';
  // Combining all adjacent periods in the basename to a single period.
  var baseName = goog.string.path.baseName(path).replace(/\.+/g, separator);
  var separatorIndex = baseName.lastIndexOf(separator);
  return separatorIndex <= 0 ? '' : baseName.substr(separatorIndex + 1);
};


/**
 * Joins one or more path components (e.g. 'foo/' and 'bar' make 'foo/bar').
 * An absolute component will discard all previous component.
 * See http://docs.python.org/library/os.path.html#os.path.join
 * @param {...string} var_args One of more path components.
 * @return {string} The path components joined.
 */
goog.string.path.join = function(var_args) {
  var path = arguments[0];

  for (var i = 1; i < arguments.length; i++) {
    var arg = arguments[i];
    if (goog.string.startsWith(arg, '/')) {
      path = arg;
    } else if (path == '' || goog.string.endsWith(path, '/')) {
      path += arg;
    } else {
      path += '/' + arg;
    }
  }

  return path;
};


/**
 * Normalizes a pathname by collapsing duplicate separators, parent directory
 * references ('..'), and current directory references ('.').
 * See http://docs.python.org/library/os.path.html#os.path.normpath
 * @param {string} path One or more path components.
 * @return {string} The path after normalization.
 */
goog.string.path.normalizePath = function(path) {
  if (path == '') {
    return '.';
  }

  var initialSlashes = '';
  // POSIX will keep two slashes, but three or more will be collapsed to one.
  if (goog.string.startsWith(path, '/')) {
    initialSlashes = '/';
    if (goog.string.startsWith(path, '//') &&
        !goog.string.startsWith(path, '///')) {
      initialSlashes = '//';
    }
  }

  var parts = path.split('/');
  var newParts = [];

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];

    // '' and '.' don't change the directory, ignore.
    if (part == '' || part == '.') {
      continue;
    }

    // A '..' should pop a directory unless this is not an absolute path and
    // we're at the root, or we've travelled upwards relatively in the last
    // iteration.
    if (part != '..' ||
        (!initialSlashes && !newParts.length) ||
        goog.array.peek(newParts) == '..') {
      newParts.push(part);
    } else {
      newParts.pop();
    }
  }

  var returnPath = initialSlashes + newParts.join('/');
  return returnPath || '.';
};


/**
 * Splits a pathname into "dirname" and "baseName" components, where "baseName"
 * is everything after the final slash. Either part may return an empty string.
 * See http://docs.python.org/library/os.path.html#os.path.split
 * @param {string} path A pathname.
 * @return {!Array.<string>} An array of [dirname, basename].
 */
goog.string.path.split = function(path) {
  var head = goog.string.path.dirname(path);
  var tail = goog.string.path.baseName(path);
  return [head, tail];
};

// TODO(nnaze): Implement other useful functions from os.path
