/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A record declaration to allow ClientRect and other rectangle
 * like objects to be used with goog.math.Rect.
 */

goog.provide('goog.math.IRect');


/**
 * Record for representing rectangular regions, allows compatibility between
 * things like ClientRect and goog.math.Rect.
 *
 * @record
 */
goog.math.IRect = function() {};


/** @type {number} */
goog.math.IRect.prototype.left;


/** @type {number} */
goog.math.IRect.prototype.top;


/** @type {number} */
goog.math.IRect.prototype.width;


/** @type {number} */
goog.math.IRect.prototype.height;
