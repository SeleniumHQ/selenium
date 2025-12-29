/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

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
  'use strict';
  this.idPrefix_ = idPrefix;
};


/**
 * Gets the next unique ID.
 * @return {string} The next unique identifier.
 */
goog.ui.IdGenerator.prototype.getNextUniqueId = function() {
  'use strict';
  return this.idPrefix_ + ':' + (this.nextId_++).toString(36);
};
