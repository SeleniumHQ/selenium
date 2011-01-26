// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A wrapper for the HTML5 FileSystem object.
 *
 */

goog.provide('goog.fs.FileSystem');

goog.require('goog.fs.DirectoryEntry');



/**
 * A local filesystem.
 *
 * This shouldn't be instantiated directly. Instead, it should be accessed via
 * {@link goog.fs.getTemporary} or {@link goog.fs.getPersistent}.
 *
 * @param {!FileSystem} fs The underlying FileSystem object.
 * @constructor
 */
goog.fs.FileSystem = function(fs) {
  /**
   * The underlying FileSystem object.
   *
   * @type {!FileSystem}
   * @private
   */
  this.fs_ = fs;
};


/**
 * @return {string} The name of the filesystem.
 */
goog.fs.FileSystem.prototype.getName = function() {
  return this.fs_.name;
};


/**
 * @return {!goog.fs.DirectoryEntry} The root directory of the filesystem.
 */
goog.fs.FileSystem.prototype.getRoot = function() {
  return new goog.fs.DirectoryEntry(this, this.fs_.root);
};
