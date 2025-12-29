/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Abstract base class for positioning implementations.
 */

goog.provide('goog.positioning.AbstractPosition');

goog.requireType('goog.math.Box');
goog.requireType('goog.math.Size');
goog.requireType('goog.positioning.Corner');



/**
 * Abstract position object. Encapsulates position and overflow handling.
 *
 * @constructor
 */
goog.positioning.AbstractPosition = function() {};


/**
 * Repositions the element. Abstract method, should be overloaded.
 *
 * @param {Element} movableElement Element to position.
 * @param {goog.positioning.Corner} corner Corner of the movable element that
 *     should be positioned adjacent to the anchored element.
 * @param {goog.math.Box=} opt_margin A margin specified in pixels.
 * @param {goog.math.Size=} opt_preferredSize PreferredSize of the
 *     movableElement.
 */
goog.positioning.AbstractPosition.prototype.reposition = function(
    movableElement, corner, opt_margin, opt_preferredSize) {};
