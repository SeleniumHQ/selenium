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
 * @fileoverview Helper object used by modal elements to control aria
 * visibility of the rest of the page.
 */

goog.provide('goog.ui.ModalAriaVisibilityHelper');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');



/**
 * Helper object to control aria visibility of the rest of the page (background)
 * for a given element. Example usage is to restrict screenreader focus to
 * a modal popup while it is visible.
 *
 * WARNING: This will work only if the element is rendered directly in the
 * 'body' element.
 *
 * @param {!Element} element The given element.
 * @param {!goog.dom.DomHelper} domHelper DomHelper for the page.
 * @constructor
 */
goog.ui.ModalAriaVisibilityHelper = function(element, domHelper) {
  /**
   * @private {!Element}
   */
  this.element_ = element;

  /**
   * @private {!goog.dom.DomHelper}
   */
  this.dom_ = domHelper;
};


/**
 * The elements set to aria-hidden when the popup was made visible.
 * @type {Array<!Element>}
 * @private
 */
goog.ui.ModalAriaVisibilityHelper.prototype.hiddenElements_;


/**
 * Sets aria-hidden on the rest of the page to restrict screen reader focus.
 * Top-level elements with an explicit aria-hidden state are not altered.
 * @param {boolean} hide Whether to hide or show the rest of the page.
 */
goog.ui.ModalAriaVisibilityHelper.prototype.setBackgroundVisibility = function(
    hide) {
  if (hide) {
    if (!this.hiddenElements_) {
      this.hiddenElements_ = [];
    }
    var topLevelChildren = this.dom_.getChildren(this.dom_.getDocument().body);
    for (var i = 0; i < topLevelChildren.length; i++) {
      var child = topLevelChildren[i];
      if (child != this.element_ &&
          !goog.a11y.aria.getState(child, goog.a11y.aria.State.HIDDEN)) {
        goog.a11y.aria.setState(child, goog.a11y.aria.State.HIDDEN, true);
        this.hiddenElements_.push(child);
      }
    }
  } else if (this.hiddenElements_) {
    for (var i = 0; i < this.hiddenElements_.length; i++) {
      goog.a11y.aria.removeState(
          this.hiddenElements_[i], goog.a11y.aria.State.HIDDEN);
    }
    this.hiddenElements_ = null;
  }
};
