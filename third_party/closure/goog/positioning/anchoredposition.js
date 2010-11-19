// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Client positioning class.
 *
 */

goog.provide('goog.positioning.AnchoredPosition');

goog.require('goog.math.Box');
goog.require('goog.positioning');
goog.require('goog.positioning.AbstractPosition');



/**
 * Encapsulates a popup position where the popup is anchored at a corner of
 * an element.
 *
 * When using AnchoredPosition, it is recommended that the popup element
 * specified in the Popup constructor or Popup.setElement be absolutely
 * positioned.
 *
 * @param {Element} anchorElement Element the movable element should be
 *     anchored against.
 * @param {goog.positioning.Corner} corner Corner of anchored element the
 *     movable element should be positioned at.
 * @constructor
 * @extends {goog.positioning.AbstractPosition}
 */
goog.positioning.AnchoredPosition = function(anchorElement, corner) {
  /**
   * Element the movable element should be anchored against.
   * @type {Element}
   */
  this.element = anchorElement;

  /**
   * Corner of anchored element the movable element should be positioned at.
   * @type {goog.positioning.Corner}
   */
  this.corner = corner;
};
goog.inherits(goog.positioning.AnchoredPosition,
              goog.positioning.AbstractPosition);


/**
 * Repositions the movable element.
 *
 * @param {Element} movableElement Element to position.
 * @param {goog.positioning.Corner} movableCorner Corner of the movable element
 *     that should be positioned adjacent to the anchored element.
 * @param {goog.math.Box=} opt_margin A margin specifin pixels.
 * @param {goog.math.Size=} opt_preferredSize PreferredSize of the
 *     movableElement (unused in this class).
 */
goog.positioning.AnchoredPosition.prototype.reposition = function(
    movableElement, movableCorner, opt_margin, opt_preferredSize) {
  goog.positioning.positionAtAnchor(this.element,
                                    this.corner,
                                    movableElement,
                                    movableCorner,
                                    undefined,
                                    opt_margin);
};
