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
 */

goog.provide('goog.string.path');

goog.require('goog.array');
goog.require('goog.string');


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
    } else if (path == '' || goog.string.endsWith(arg, '/')) {
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

// TODO(user): Implement other useful functions from os.path
