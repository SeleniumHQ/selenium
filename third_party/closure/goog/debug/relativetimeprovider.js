/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Definition the goog.debug.RelativeTimeProvider class.
 */

goog.provide('goog.debug.RelativeTimeProvider');



/**
 * A simple object to keep track of a timestamp considered the start of
 * something. The main use is for the logger system to maintain a start time
 * that is occasionally reset. For example, in Gmail, we reset this relative
 * time at the start of a user action so that timings are offset from the
 * beginning of the action. This class also provides a singleton as the default
 * behavior for most use cases is to share the same start time.
 *
 * @constructor
 * @final
 */
goog.debug.RelativeTimeProvider = function() {
  'use strict';
  /**
   * The start time.
   * @type {number}
   * @private
   */
  this.relativeTimeStart_ = goog.now();
};


/**
 * Default instance.
 * @type {?goog.debug.RelativeTimeProvider}
 * @private
 */
goog.debug.RelativeTimeProvider.defaultInstance_ = null;


/**
 * Sets the start time to the specified time.
 * @param {number} timeStamp The start time.
 */
goog.debug.RelativeTimeProvider.prototype.set = function(timeStamp) {
  'use strict';
  this.relativeTimeStart_ = timeStamp;
};


/**
 * Resets the start time to now.
 */
goog.debug.RelativeTimeProvider.prototype.reset = function() {
  'use strict';
  this.set(goog.now());
};


/**
 * @return {number} The start time.
 */
goog.debug.RelativeTimeProvider.prototype.get = function() {
  'use strict';
  return this.relativeTimeStart_;
};


/**
 * @return {!goog.debug.RelativeTimeProvider} The default instance.
 */
goog.debug.RelativeTimeProvider.getDefaultInstance = function() {
  'use strict';
  if (!goog.debug.RelativeTimeProvider.defaultInstance_) {
    goog.debug.RelativeTimeProvider.defaultInstance_ =
        new goog.debug.RelativeTimeProvider();
  }
  return goog.debug.RelativeTimeProvider.defaultInstance_;
};
