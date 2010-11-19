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
 * @fileoverview  Class for making an element detach and float to remain
 * visible when otherwise it would have scrolled up out of view.
 * <p>
 * The element remains at its normal position in the layout until scrolling
 * would cause its top edge to scroll off the top of the viewport; at that
 * point, the element is replaced with an invisible placeholder (to keep the
 * layout stable), reattached in the dom tree to a new parent (the body element
 * by default), and set to "fixed" positioning (emulated for IE < 7) so that it
 * remains at its original X position while staying fixed to the top of the
 * viewport in the Y dimension.
 * <p>
 * When the window is scrolled up past the point where the original element
 * would be fully visible again, the element snaps back into place, replacing
 * the placeholder.
 *
 * @see ../demos/scrollfloater.html
 *
 * Adapted from http://go/elementfloater.js
 */


goog.provide('goog.ui.ScrollFloater');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.userAgent');



/**
 * Creates a ScrollFloater; see file overview for details.
 *
 * @param {Element=} opt_parentElement Where to attach the element when it's
 *     floating.  Default is the document body.  If the floating element
 *     contains form inputs, it will be necessary to attach it to the
 *     corresponding form element, or to an element in the DOM subtree under
 *     the form element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.ScrollFloater = function(opt_parentElement, opt_domHelper) {
  // If a parentElement is supplied, we want to use its domHelper,
  // ignoring the caller-supplied one.
  var domHelper = opt_parentElement ?
      goog.dom.getDomHelper(opt_parentElement) : opt_domHelper;

  goog.ui.Component.call(this, domHelper);

  /**
   * The element to which the scroll-floated element will be attached
   * when it is floating.
   * @type {Element}
   * @private
   */
  this.parentElement_ =
      opt_parentElement || this.getDomHelper().getDocument().body;

  /**
   * The original styles applied to the element before it began floating;
   * used to restore those styles when the element stops floating.
   * @type {Object}
   * @private
   */
  this.originalStyles_ = {};
};
goog.inherits(goog.ui.ScrollFloater, goog.ui.Component);


/**
 * The placeholder element dropped in to hold the layout for
 * the floated element.
 * @type {Element}
 * @private
 */
goog.ui.ScrollFloater.prototype.placeholder_;


/**
 * Whether scrolling is enabled for this element; true by default.
 * The {@link #setScrollingEnabled} method can be used to change this value.
 * @type {boolean}
 * @private
 */
goog.ui.ScrollFloater.prototype.scrollingEnabled_ = true;


/**
 * A flag indicating whether this instance is currently floating.
 * @type {boolean}
 * @private
 */
goog.ui.ScrollFloater.prototype.floating_ = false;


/**
 * The original vertical page offset at which the top of the element
 * was rendered.
 * @type {number}
 * @private
 */
goog.ui.ScrollFloater.prototype.originalOffset_;


/**
 * The style properties which are stored when we float an element, so they
 * can be restored when it 'docks' again.
 * @type {Array.<string>}
 * @private
 */
goog.ui.ScrollFloater.STORED_STYLE_PROPS_ = [
  'position', 'top', 'left', 'width', 'cssFloat'];


/**
 * The style elements managed for the placeholder object.
 * @type {Array.<string>}
 * @private
 */
goog.ui.ScrollFloater.PLACEHOLDER_STYLE_PROPS_ = [
  'position', 'top', 'left', 'display', 'cssFloat',
  'marginTop', 'marginLeft', 'marginRight', 'marginBottom'];


/**
 * The class name applied to the floating element.
 * @type {string}
 * @private
 */
goog.ui.ScrollFloater.CSS_CLASS_ = goog.getCssName('goog-scrollfloater');


/**
 * Delegates dom creation to superclass, then constructs and
 * decorates required DOM elements.
 */
goog.ui.ScrollFloater.prototype.createDom = function() {
  goog.ui.ScrollFloater.superClass_.createDom.call(this);

  this.decorateInternal(this.getElement());
};


/**
 * Decorates the floated element with the standard ScrollFloater CSS class.
 * @param {Element} element The element to decorate.
 */
goog.ui.ScrollFloater.prototype.decorateInternal = function(element) {
  goog.ui.ScrollFloater.superClass_.decorateInternal.call(this, element);

  goog.dom.classes.add(element, goog.ui.ScrollFloater.CSS_CLASS_);
};


/** @inheritDoc */
goog.ui.ScrollFloater.prototype.enterDocument = function() {
  goog.ui.ScrollFloater.superClass_.enterDocument.call(this);

  if (!this.placeholder_) {
    this.placeholder_ =
        this.getDomHelper().createDom('div', {'style': 'visibility:hidden'});
  }

  this.originalOffset_ = goog.style.getPageOffsetTop(this.getElement());
  this.setScrollingEnabled(this.scrollingEnabled_);
  this.getHandler().listen(
      window, goog.events.EventType.SCROLL, this.update_);
  this.getHandler().listen(
      window, goog.events.EventType.RESIZE, this.handleResize_);
};


/** @inheritDoc */
goog.ui.ScrollFloater.prototype.disposeInternal = function() {
  goog.ui.ScrollFloater.superClass_.disposeInternal.call(this);

  delete this.placeholder_;
};


/**
 * Sets whether the element should be floated if it scrolls out of view.
 * @param {boolean} enable Whether floating is enabled for this element.
 */
goog.ui.ScrollFloater.prototype.setScrollingEnabled = function(enable) {
  this.scrollingEnabled_ = enable;

  if (enable) {
    this.applyIeBgHack_();
    this.update_();
  } else {
    this.stopFloating_();
  }
};


/**
 * @return {boolean} Whether the component is enabled for scroll-floating.
 */
goog.ui.ScrollFloater.prototype.isScrollingEnabled = function() {
  return this.scrollingEnabled_;
};


/**
 * @return {boolean} Whether the component is currently scroll-floating.
 */
goog.ui.ScrollFloater.prototype.isFloating = function() {
  return this.floating_;
};


/**
 * When a scroll event occurs, compares the element's position to the current
 * document scroll position, and stops or starts floating behavior if needed.
 * @param {goog.events.Event=} opt_e The event, which is ignored.
 * @private
 */
goog.ui.ScrollFloater.prototype.update_ = function(opt_e) {
  if (this.scrollingEnabled_) {
    var doc = this.getDomHelper().getDocument();
    var currentScrollTop = this.getDomHelper().getDocumentScroll().y;

    if (currentScrollTop > this.originalOffset_) {
      this.startFloating_();
    } else {
      this.stopFloating_();
    }
  }
};


/**
 * Begins floating behavior, making the element position:fixed (or IE hacked
 * equivalent) and inserting a placeholder where it used to be to keep the
 * layout from shifting around.
 * @private
 */
goog.ui.ScrollFloater.prototype.startFloating_ = function() {
  if (this.floating_) {
    return;
  }

  var elem = this.getElement();
  var doc = this.getDomHelper().getDocument();

  // Read properties of element before modifying it.
  var originalLeft_ = goog.style.getPageOffsetLeft(elem);
  var originalWidth_ = goog.style.getContentBoxSize(elem).width;

  this.originalStyles_ = {};

  // Store styles while not floating so we can restore them when the
  // element stops floating.
  goog.object.forEach(goog.ui.ScrollFloater.STORED_STYLE_PROPS_,
                      function(property) {
                        this.originalStyles_[property] = elem.style[property];
                      },
                      this);

  // Copy relevant styles to placeholder so it will be layed out the same
  // as the element that's about to be floated.
  goog.object.forEach(goog.ui.ScrollFloater.PLACEHOLDER_STYLE_PROPS_,
                      function(property) {
                        this.placeholder_.style[property] =
                            elem.style[property] ||
                                goog.style.getCascadedStyle(elem, property) ||
                                goog.style.getComputedStyle(elem, property);
                      },
                      this);

  goog.style.setSize(this.placeholder_, elem.offsetWidth, elem.offsetHeight);

  // Make element float.

  goog.style.setStyle(elem, {
    'left': originalLeft_ + 'px',
    'width': originalWidth_ + 'px',
    'cssFloat': 'none'
  });

  elem.parentNode.replaceChild(this.placeholder_, elem);
  this.parentElement_.appendChild(elem);

  // Versions of IE below 7-in-standards-mode don't handle 'position: fixed',
  // so we must emulate it using an IE-specific idiom for JS-based calculated
  // style values.

  if (this.needsIePositionHack_()) {
    elem.style.position = 'absolute';
    elem.style.setExpression('top',
        'document.compatMode=="CSS1Compat"?' +
        'documentElement.scrollTop:document.body.scrollTop');
  } else {
    elem.style.position = 'fixed';
    elem.style.top = '0';
  }

  this.floating_ = true;
};


/**
 * Stops floating behavior, returning element to its original state.
 * @private
 */
goog.ui.ScrollFloater.prototype.stopFloating_ = function() {
  if (this.floating_) {
    var elem = this.getElement();

    for (var prop in this.originalStyles_) {
      elem.style[prop] = this.originalStyles_[prop];
    }

    if (this.needsIePositionHack_()) {
      elem.style.removeExpression('top');
    }

    this.placeholder_.parentNode.replaceChild(elem, this.placeholder_);
    this.floating_ = false;
  }
};


/**
 * Responds to window resize events by snapping the floater back to the new
 * version of its original position, then allowing it to float again if
 * appropriate.
 * @private
 */
goog.ui.ScrollFloater.prototype.handleResize_ = function() {
  this.stopFloating_();
  this.originalOffset_ = goog.style.getPageOffsetTop(this.getElement());
  this.update_();
};


/**
 * Determines whether we need to apply the position hack to emulated position:
 * fixed on this browser.
 * @return {boolean} Whether the current browser needs the position hack.
 * @private
 */
goog.ui.ScrollFloater.prototype.needsIePositionHack_ = function() {
  return goog.userAgent.IE &&
      !(goog.userAgent.isVersion('7') &&
          this.getDomHelper().isCss1CompatMode());
};


/**
 * Sets some magic CSS properties that make float-scrolling work smoothly
 * in IE6 (and IE7 in quirks mode). Without this hack, the floating element
 * will appear jumpy when you scroll the document. This involves modifying
 * the background of the HTML element (or BODY in quirks mode). If there's
 * already a background image in use this is not required.
 * For further reading, see
 * http://annevankesteren.nl/2005/01/position-fixed-in-ie
 * @private
 */
goog.ui.ScrollFloater.prototype.applyIeBgHack_ = function() {
  if (this.needsIePositionHack_()) {
    var doc = this.getDomHelper().getDocument();
    var topLevelElement = goog.style.getClientViewportElement(doc);

    if (topLevelElement.currentStyle.backgroundImage == 'none') {
      // Using an https URL if the current windowbp is https avoids an IE
      // "This page contains a mix of secure and nonsecure items" warning.
      topLevelElement.style.backgroundImage =
          this.getDomHelper().getWindow().location.protocol == 'https:' ?
              'url(https:///)' : 'url(about:blank)';
      topLevelElement.style.backgroundAttachment = 'fixed';
    }
  }
};
