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
 *
 */

goog.provide('goog.ui.IdGenerator');



/**
 * Creates a new id generator.
 * @constructor
 */
goog.ui.IdGenerator = function() {
};
goog.addSingletonGetter(goog.ui.IdGenerator);


/**
 * Next unique ID to use
 * @type {number}
 * @private
 */
goog.ui.IdGenerator.prototype.nextId_ = 0;


/**
 * Gets the next unique ID.
 * @return {string} The next unique identifier.
 */
goog.ui.IdGenerator.prototype.getNextUniqueId = function() {
  return ':' + (this.nextId_++).toString(36);
};


/**
 * Default instance for id generation. Done as an instance instead of statics
 * so it's possible to inject a mock for unit testing purposes.
 * @type {goog.ui.IdGenerator}
 * @deprecated Use goog.ui.IdGenerator.getInstance() instead and do not refer
 * to goog.ui.IdGenerator.instance anymore.
 */
goog.ui.IdGenerator.instance = goog.ui.IdGenerator.getInstance();
