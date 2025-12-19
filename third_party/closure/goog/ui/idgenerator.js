// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Generator for unique element IDs.
 */

goog.provide('goog.ui.IdGenerator');



/**
 * Creates a new id generator.
 * @constructor
 * @final
 */
goog.ui.IdGenerator = function() {};
goog.addSingletonGetter(goog.ui.IdGenerator);


/**
 * Next unique ID to use
 * @type {number}
 * @private
 */
goog.ui.IdGenerator.prototype.nextId_ = 0;


/**
 * Random ID prefix to help avoid collisions with other closure JavaScript on
 * the same page that may initialize its own IdGenerator singleton.
 * @type {string}
 * @private
 */
goog.ui.IdGenerator.prototype.idPrefix_ = '';


/**
 * Sets the ID prefix for this singleton. This is a temporary workaround to be
 * backwards compatible with code relying on the undocumented, but consistent,
 * behavior. In the future this will be removed and the prefix will be set to
 * a randomly generated string.
 * @param {string} idPrefix
 */
goog.ui.IdGenerator.prototype.setIdPrefix = function(idPrefix) {
  this.idPrefix_ = idPrefix;
};


/**
 * Gets the next unique ID.
 * @return {string} The next unique identifier.
 */
goog.ui.IdGenerator.prototype.getNextUniqueId = function() {
  return this.idPrefix_ + ':' + (this.nextId_++).toString(36);
};
