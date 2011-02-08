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
 * @fileoverview Mock file object.
 *
 */

goog.provide('goog.testing.fs.File');

goog.require('goog.testing.fs.Blob');



/**
 * A mock file object.
 *
 * @param {string} name The name of the file.
 * @param {string=} opt_data The string data encapsulated by the blob.
 * @param {string=} opt_type The mime type of the blob.
 * @constructor
 * @extends {goog.testing.fs.Blob}
 */
goog.testing.fs.File = function(name, opt_data, opt_type) {
  goog.base(this, opt_data, opt_type);

  /**
   * @see http://www.w3.org/TR/FileAPI/#dfn-name
   * @type {string}
   */
  this.name = name;
};
goog.inherits(goog.testing.fs.File, goog.testing.fs.Blob);


/**
 * @see http://www.w3.org/TR/FileAPI/#dfn-lastModifiedDate
 * @type {Date}
 */
goog.testing.fs.File.prototype.lastModifiedDate = null;
