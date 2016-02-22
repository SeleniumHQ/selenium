// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview A generic interface for saving and restoring ranges.
 *
 * @author robbyw@google.com (Robby Walker)
 */


goog.provide('goog.dom.SavedRange');

goog.require('goog.Disposable');
goog.require('goog.log');



/**
 * Abstract interface for a saved range.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.dom.SavedRange = function() {
  goog.Disposable.call(this);
};
goog.inherits(goog.dom.SavedRange, goog.Disposable);


/**
 * Logging object.
 * @type {goog.log.Logger}
 * @private
 */
goog.dom.SavedRange.logger_ =
    goog.log.getLogger('goog.dom.SavedRange');


/**
 * Restores the range and by default disposes of the saved copy.  Take note:
 * this means the by default SavedRange objects are single use objects.
 * @param {boolean=} opt_stayAlive Whether this SavedRange should stay alive
 *     (not be disposed) after restoring the range. Defaults to false (dispose).
 * @return {goog.dom.AbstractRange} The restored range.
 */
goog.dom.SavedRange.prototype.restore = function(opt_stayAlive) {
  if (this.isDisposed()) {
    goog.log.error(goog.dom.SavedRange.logger_,
        'Disposed SavedRange objects cannot be restored.');
  }

  var range = this.restoreInternal();
  if (!opt_stayAlive) {
    this.dispose();
  }
  return range;
};


/**
 * Internal method to restore the saved range.
 * @return {goog.dom.AbstractRange} The restored range.
 */
goog.dom.SavedRange.prototype.restoreInternal = goog.abstractMethod;
