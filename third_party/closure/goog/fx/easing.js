/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Easing functions for animations.
 */

goog.provide('goog.fx.easing');


/**
 * Ease in - Start slow and speed up.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
goog.fx.easing.easeIn = function(t) {
  'use strict';
  return goog.fx.easing.easeInInternal_(t, 3);
};


/**
 * Ease in with specifiable exponent.
 * @param {number} t Input between 0 and 1.
 * @param {number} exp Ease exponent.
 * @return {number} Output between 0 and 1.
 * @private
 */
goog.fx.easing.easeInInternal_ = function(t, exp) {
  'use strict';
  return Math.pow(t, exp);
};


/**
 * Ease out - Start fastest and slows to a stop.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
goog.fx.easing.easeOut = function(t) {
  'use strict';
  return goog.fx.easing.easeOutInternal_(t, 3);
};


/**
 * Ease out with specifiable exponent.
 * @param {number} t Input between 0 and 1.
 * @param {number} exp Ease exponent.
 * @return {number} Output between 0 and 1.
 * @private
 */
goog.fx.easing.easeOutInternal_ = function(t, exp) {
  'use strict';
  return 1 - goog.fx.easing.easeInInternal_(1 - t, exp);
};


/**
 * Ease out long - Start fastest and slows to a stop with a long ease.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
goog.fx.easing.easeOutLong = function(t) {
  'use strict';
  return goog.fx.easing.easeOutInternal_(t, 4);
};


/**
 * Ease in and out - Start slow, speed up, then slow down.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
goog.fx.easing.inAndOut = function(t) {
  'use strict';
  return 3 * t * t - 2 * t * t * t;
};
