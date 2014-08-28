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
 * @fileoverview Animated zippy widget implementation.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/zippy.html
 */

goog.provide('goog.ui.AnimatedZippy');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Transition');
goog.require('goog.fx.easing');
goog.require('goog.ui.Zippy');
goog.require('goog.ui.ZippyEvent');



/**
 * Zippy widget. Expandable/collapsible container, clicking the header toggles
 * the visibility of the content.
 *
 * @param {Element|string|null} header Header element, either element
 *     reference, string id or null if no header exists.
 * @param {Element|string} content Content element, either element reference or
 *     string id.
 * @param {boolean=} opt_expanded Initial expanded/visibility state. Defaults to
 *     false.
 * @param {goog.dom.DomHelper=} opt_domHelper An optional DOM helper.
 * @constructor
 * @extends {goog.ui.Zippy}
 */
goog.ui.AnimatedZippy = function(header, content, opt_expanded, opt_domHelper) {
  var domHelper = opt_domHelper || goog.dom.getDomHelper();

  // Create wrapper element and move content into it.
  var elWrapper = domHelper.createDom('div', {'style': 'overflow:hidden'});
  var elContent = domHelper.getElement(content);
  elContent.parentNode.replaceChild(elWrapper, elContent);
  elWrapper.appendChild(elContent);

  /**
   * Content wrapper, used for animation.
   * @type {Element}
   * @private
   */
  this.elWrapper_ = elWrapper;

  /**
   * Reference to animation or null if animation is not active.
   * @type {goog.fx.Animation}
   * @private
   */
  this.anim_ = null;

  // Call constructor of super class.
  goog.ui.Zippy.call(this, header, elContent, opt_expanded,
      undefined, domHelper);

  // Set initial state.
  // NOTE: Set the class names as well otherwise animated zippys
  // start with empty class names.
  var expanded = this.isExpanded();
  this.elWrapper_.style.display = expanded ? '' : 'none';
  this.updateHeaderClassName(expanded);
};
goog.inherits(goog.ui.AnimatedZippy, goog.ui.Zippy);
goog.tagUnsealableClass(goog.ui.AnimatedZippy);


/**
 * Duration of expand/collapse animation, in milliseconds.
 * @type {number}
 */
goog.ui.AnimatedZippy.prototype.animationDuration = 500;


/**
 * Acceleration function for expand/collapse animation.
 * @type {!Function}
 */
goog.ui.AnimatedZippy.prototype.animationAcceleration = goog.fx.easing.easeOut;


/**
 * @return {boolean} Whether the zippy is in the process of being expanded or
 *     collapsed.
 */
goog.ui.AnimatedZippy.prototype.isBusy = function() {
  return this.anim_ != null;
};


/**
 * Sets expanded state.
 *
 * @param {boolean} expanded Expanded/visibility state.
 * @override
 */
goog.ui.AnimatedZippy.prototype.setExpanded = function(expanded) {
  if (this.isExpanded() == expanded && !this.anim_) {
    return;
  }

  // Reset display property of wrapper to allow content element to be
  // measured.
  if (this.elWrapper_.style.display == 'none') {
    this.elWrapper_.style.display = '';
  }

  // Measure content element.
  var h = this.getContentElement().offsetHeight;

  // Stop active animation (if any) and determine starting height.
  var startH = 0;
  if (this.anim_) {
    expanded = this.isExpanded();
    goog.events.removeAll(this.anim_);
    this.anim_.stop(false);

    var marginTop = parseInt(this.getContentElement().style.marginTop, 10);
    startH = h - Math.abs(marginTop);
  } else {
    startH = expanded ? 0 : h;
  }

  // Updates header class name after the animation has been stopped.
  this.updateHeaderClassName(expanded);

  // Set up expand/collapse animation.
  this.anim_ = new goog.fx.Animation([0, startH],
                                     [0, expanded ? h : 0],
                                     this.animationDuration,
                                     this.animationAcceleration);

  var events = [goog.fx.Transition.EventType.BEGIN,
                goog.fx.Animation.EventType.ANIMATE,
                goog.fx.Transition.EventType.END];
  goog.events.listen(this.anim_, events, this.onAnimate_, false, this);
  goog.events.listen(this.anim_,
                     goog.fx.Transition.EventType.END,
                     goog.bind(this.onAnimationCompleted_, this, expanded));

  // Start animation.
  this.anim_.play(false);
};


/**
 * Called during animation
 *
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.ui.AnimatedZippy.prototype.onAnimate_ = function(e) {
  var contentElement = this.getContentElement();
  var h = contentElement.offsetHeight;
  contentElement.style.marginTop = (e.y - h) + 'px';
};


/**
 * Called once the expand/collapse animation has completed.
 *
 * @param {boolean} expanded Expanded/visibility state.
 * @private
 */
goog.ui.AnimatedZippy.prototype.onAnimationCompleted_ = function(expanded) {
  // Fix wrong end position if the content has changed during the animation.
  if (expanded) {
    this.getContentElement().style.marginTop = '0';
  }

  goog.events.removeAll(/** @type {!goog.fx.Animation} */ (this.anim_));
  this.setExpandedInternal(expanded);
  this.anim_ = null;

  if (!expanded) {
    this.elWrapper_.style.display = 'none';
  }

  // Fire toggle event.
  this.dispatchEvent(new goog.ui.ZippyEvent(goog.ui.Zippy.Events.TOGGLE,
                                            this, expanded));
};
