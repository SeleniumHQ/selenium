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
 * @fileoverview  Class for making an element detach and float to remain visible
 * even when the viewport has been scrolled.
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
goog.provide('goog.ui.ScrollFloater.EventType');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
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

  goog.ui.ScrollFloater.base(this, 'constructor', domHelper);

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

  /**
   * A vertical offset from which to start floating the element.  This is
   * useful in cases when there are 'position:fixed' elements covering up
   * part of the viewport.
   * @type {number}
   * @private
   */
  this.viewportTopOffset_ = 0;

  /**
   * An element used to define the boundaries within which the floater can
   * be positioned.
   * @type {Element}
   * @private
   */
  this.containerElement_ = null;

  /**
   * Container element's bounding rectangle.
   * @type {goog.math.Rect}
   * @private
   */
  this.containerBounds_ = null;

  /**
   * Element's original bounding rectangle.
   * @type {goog.math.Rect}
   * @private
   */
  this.originalBounds_ = null;

  /**
   * Element's top offset when it's not floated or pinned.
   * @type {number}
   * @private
   */
  this.originalTopOffset_ = 0;

  /**
   * The placeholder element dropped in to hold the layout for
   * the floated element.
   * @type {Element}
   * @private
   */
  this.placeholder_ = null;

  /**
   * Whether scrolling is enabled for this element; true by default.
   * The {@link #setScrollingEnabled} method can be used to change this value.
   * @type {boolean}
   * @private
   */
  this.scrollingEnabled_ = true;

  /**
   * A flag indicating whether this instance is currently pinned to the bottom
   * of the container element.
   * @type {boolean}
   * @private
   */
  this.pinned_ = false;

  /**
   * A flag indicating whether this instance is currently floating.
   * @type {boolean}
   * @private
   */
  this.floating_ = false;
};
goog.inherits(goog.ui.ScrollFloater, goog.ui.Component);


/**
 * Events dispatched by this component.
 * @enum {string}
 */
goog.ui.ScrollFloater.EventType = {
  /**
   * Dispatched when the component starts floating. The event is
   * cancellable.
   */
  FLOAT: 'float',

  /**
   * Dispatched when the component returns to its original state.
   * The event is cancellable.
   */
  DOCK: 'dock',

  /**
   * Dispatched when the component gets pinned to the bottom of the
   * container element.  This event is cancellable.
   */
  PIN: 'pin'
};


/**
 * The element can float at different positions on the page.
 * @enum {number}
 * @private
 */
goog.ui.ScrollFloater.FloatMode_ = {
  TOP: 0,
  BOTTOM: 1
};


/**
 * The style properties which are stored when we float an element, so they
 * can be restored when it 'docks' again.
 * @type {Array<string>}
 * @private
 */
goog.ui.ScrollFloater.STORED_STYLE_PROPS_ = [
  'position', 'top', 'left', 'width', 'cssFloat'];


/**
 * The style elements managed for the placeholder object.
 * @type {Array<string>}
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
 * @override
 */
goog.ui.ScrollFloater.prototype.createDom = function() {
  goog.ui.ScrollFloater.base(this, 'createDom');

  this.decorateInternal(this.getElement());
};


/**
 * Decorates the floated element with the standard ScrollFloater CSS class.
 * @param {Element} element The element to decorate.
 * @override
 */
goog.ui.ScrollFloater.prototype.decorateInternal = function(element) {
  goog.ui.ScrollFloater.base(this, 'decorateInternal', element);
  goog.asserts.assert(element);
  goog.dom.classlist.add(element, goog.ui.ScrollFloater.CSS_CLASS_);
};


/** @override */
goog.ui.ScrollFloater.prototype.enterDocument = function() {
  goog.ui.ScrollFloater.base(this, 'enterDocument');

  if (!this.placeholder_) {
    this.placeholder_ = this.getDomHelper().createDom(
        goog.dom.TagName.DIV, {'style': 'visibility:hidden'});
  }

  this.update();

  this.setScrollingEnabled(this.scrollingEnabled_);
  var win = this.getDomHelper().getWindow();
  this.getHandler().
      listen(win, goog.events.EventType.SCROLL, this.handleScroll_).
      listen(win, goog.events.EventType.RESIZE, this.update);
};


/**
 * Forces the component to update the cached element positions and sizes and
 * to re-evaluate whether the the component should be docked, floated or
 * pinned.
 */
goog.ui.ScrollFloater.prototype.update = function() {
  if (!this.isInDocument()) {
    return;
  }

  // These values can only be calculated when the element is in its original
  // state, so we dock first, and then re-evaluate.
  this.dock_();
  if (this.containerElement_) {
    this.containerBounds_ = goog.style.getBounds(this.containerElement_);
  }
  this.originalBounds_ = goog.style.getBounds(this.getElement());
  this.originalTopOffset_ = goog.style.getPageOffset(this.getElement()).y;
  this.handleScroll_();
};


/** @override */
goog.ui.ScrollFloater.prototype.disposeInternal = function() {
  goog.ui.ScrollFloater.base(this, 'disposeInternal');

  this.placeholder_ = null;
};


/**
 * Sets whether the element should be floated if it scrolls out of view.
 * @param {boolean} enable Whether floating is enabled for this element.
 */
goog.ui.ScrollFloater.prototype.setScrollingEnabled = function(enable) {
  this.scrollingEnabled_ = enable;

  if (enable) {
    this.applyIeBgHack_();
    this.handleScroll_();
  } else {
    this.dock_();
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
 * @return {boolean} Whether the component is currently pinned to the bottom
 *     of the container.
 */
goog.ui.ScrollFloater.prototype.isPinned = function() {
  return this.pinned_;
};


/**
 * @param {number} offset A vertical offset from the top of the viewport, from
 *    which to start floating the element. Default is 0. This is useful in cases
 *    when there are 'position:fixed' elements covering up part of the viewport.
 */
goog.ui.ScrollFloater.prototype.setViewportTopOffset = function(offset) {
  this.viewportTopOffset_ = offset;
  this.update();
};


/**
 * @param {Element} container An element used to define the boundaries within
 *     which the floater can be positioned. If not specified, scrolling the page
 *     down far enough may result in the floated element extending past the
 *     containing element as it is being scrolled out of the viewport. In some
 *     cases, such as a list with a sticky header, this may be undesirable. If
 *     the container element is specified and the floated element extends past
 *     the bottom of the container, the element will be pinned to the bottom of
 *     the container.
 */
goog.ui.ScrollFloater.prototype.setContainerElement = function(container) {
  this.containerElement_ = container;
  this.update();
};


/**
 * When a scroll event occurs, compares the element's position to the current
 * document scroll position, and stops or starts floating behavior if needed.
 * @param {goog.events.Event=} opt_e The event, which is ignored.
 * @private
 */
goog.ui.ScrollFloater.prototype.handleScroll_ = function(opt_e) {
  if (this.scrollingEnabled_) {
    var scrollTop = this.getDomHelper().getDocumentScroll().y;

    if (this.originalBounds_.top - scrollTop >= this.viewportTopOffset_) {
      this.dock_();
      return;
    }

    var effectiveElementHeight = this.originalBounds_.height +
        this.viewportTopOffset_;

    // If the element extends past the container, we need to pin it instead.
    if (this.containerElement_) {
      var containerBottom = this.containerBounds_.top +
          this.containerBounds_.height;

      if (scrollTop > containerBottom - effectiveElementHeight) {
        this.pin_();
        return;
      }
    }

    var windowHeight = this.getDomHelper().getViewportSize().height;

    // If the element is shorter than the window or the user uses IE < 7,
    // float it at the top.
    if (this.needsIePositionHack_() || effectiveElementHeight < windowHeight) {
      this.float_(goog.ui.ScrollFloater.FloatMode_.TOP);
      return;
    }

    // If the element is taller than the window and is extending past the
    // bottom, allow it scroll with the page until the bottom of the element is
    // fully visible.
    if (this.originalBounds_.height + this.originalTopOffset_ >
        windowHeight + scrollTop) {
      this.dock_();
    } else {
      // Pin the element to the bottom of the page since the user has scrolled
      // past it.
      this.float_(goog.ui.ScrollFloater.FloatMode_.BOTTOM);
    }
  }
};


/**
 * Pins the element to the bottom of the container, making as much of the
 * element visible as possible without extending past it.
 * @private
 */
goog.ui.ScrollFloater.prototype.pin_ = function() {
  if (this.floating_ && !this.dock_()) {
    return;
  }

  // Ignore if the component is pinned or the PIN event is cancelled.
  if (this.pinned_ ||
      !this.dispatchEvent(goog.ui.ScrollFloater.EventType.PIN)) {
    return;
  }

  var elem = this.getElement();

  this.storeOriginalStyles_();

  elem.style.position = 'relative';
  elem.style.top = this.containerBounds_.height - this.originalBounds_.height -
      this.originalBounds_.top + this.containerBounds_.top + 'px';

  this.pinned_ = true;
};


/**
 * Begins floating behavior, making the element position:fixed (or IE hacked
 * equivalent) and inserting a placeholder where it used to be to keep the
 * layout from shifting around. For IE < 7 users, we only support floating at
 * the top.
 * @param {goog.ui.ScrollFloater.FloatMode_} floatMode The position at which we
 *     should float.
 * @private
 */
goog.ui.ScrollFloater.prototype.float_ = function(floatMode) {
  var isTop = floatMode == goog.ui.ScrollFloater.FloatMode_.TOP;
  if (this.pinned_ && !this.dock_()) {
    return;
  }

  // Ignore if the component is floating or the FLOAT event is cancelled.
  if (this.floating_ ||
      !this.dispatchEvent(goog.ui.ScrollFloater.EventType.FLOAT)) {
    return;
  }

  var elem = /** @type {!HTMLElement} */ (this.getElement());
  var doc = this.getDomHelper().getDocument();

  // Read properties of element before modifying it.
  var originalLeft_ = goog.style.getPageOffsetLeft(elem);
  var originalWidth_ = goog.style.getContentBoxSize(elem).width;

  this.storeOriginalStyles_();

  goog.style.setSize(this.placeholder_, elem.offsetWidth, elem.offsetHeight);

  // Make element float.
  goog.style.setStyle(elem, {
    'left': originalLeft_ + 'px',
    'width': originalWidth_ + 'px',
    'cssFloat': 'none'
  });

  // If parents are the same, avoid detaching and reattaching elem.
  // This prevents Flash embeds from being reloaded, for example.
  if (elem.parentNode == this.parentElement_) {
    elem.parentNode.insertBefore(this.placeholder_, elem);
  } else {
    elem.parentNode.replaceChild(this.placeholder_, elem);
    this.parentElement_.appendChild(elem);
  }

  // Versions of IE below 7-in-standards-mode don't handle 'position: fixed',
  // so we must emulate it using an IE-specific idiom for JS-based calculated
  // style values. These users will only ever float at the top (bottom floating
  // not supported.) Also checked in handleScroll_.
  if (this.needsIePositionHack_()) {
    elem.style.position = 'absolute';
    elem.style.setExpression('top',
        'document.compatMode=="CSS1Compat"?' +
        'documentElement.scrollTop:document.body.scrollTop');
  } else {
    elem.style.position = 'fixed';
    if (isTop) {
      elem.style.top = this.viewportTopOffset_ + 'px';
      elem.style.bottom = 'auto';
    } else {
      elem.style.top = 'auto';
      elem.style.bottom = 0;
    }
  }

  this.floating_ = true;
};


/**
 * Stops floating behavior, returning element to its original state.
 * @return {boolean} True if the the element has been docked.  False if the
 *     element is already docked or the event was cancelled.
 * @private
 */
goog.ui.ScrollFloater.prototype.dock_ = function() {
  // Ignore if the component is docked or the DOCK event is cancelled.
  if (!(this.floating_ || this.pinned_) ||
      !this.dispatchEvent(goog.ui.ScrollFloater.EventType.DOCK)) {
    return false;
  }

  var elem = this.getElement();

  if (this.floating_) {
    this.restoreOriginalStyles_();

    if (this.needsIePositionHack_()) {
      elem.style.removeExpression('top');
    }

    // If placeholder_ was inserted and didn't replace elem then elem has
    // the right parent already, no need to replace (which removes elem before
    // inserting it).
    if (this.placeholder_.parentNode == this.parentElement_) {
      this.placeholder_.parentNode.removeChild(this.placeholder_);
    } else {
      this.placeholder_.parentNode.replaceChild(elem, this.placeholder_);
    }
  }

  if (this.pinned_) {
    this.restoreOriginalStyles_();
  }

  this.floating_ = this.pinned_ = false;

  return true;
};


/**
 * @private
 */
goog.ui.ScrollFloater.prototype.storeOriginalStyles_ = function() {
  var elem = this.getElement();
  this.originalStyles_ = {};

  // Store styles while not floating so we can restore them when the
  // element stops floating.
  goog.array.forEach(goog.ui.ScrollFloater.STORED_STYLE_PROPS_,
                     function(property) {
                       this.originalStyles_[property] = elem.style[property];
                     },
                     this);

  // Copy relevant styles to placeholder so it will be layed out the same
  // as the element that's about to be floated.
  goog.array.forEach(goog.ui.ScrollFloater.PLACEHOLDER_STYLE_PROPS_,
                     function(property) {
                       this.placeholder_.style[property] =
                           elem.style[property] ||
                               goog.style.getCascadedStyle(elem, property) ||
                               goog.style.getComputedStyle(elem, property);
                     },
                     this);
};


/**
 * @private
 */
goog.ui.ScrollFloater.prototype.restoreOriginalStyles_ = function() {
  var elem = this.getElement();
  for (var prop in this.originalStyles_) {
    elem.style[prop] = this.originalStyles_[prop];
  }
};


/**
 * Determines whether we need to apply the position hack to emulated position:
 * fixed on this browser.
 * @return {boolean} Whether the current browser needs the position hack.
 * @private
 */
goog.ui.ScrollFloater.prototype.needsIePositionHack_ = function() {
  return goog.userAgent.IE &&
      !(goog.userAgent.isVersionOrHigher('7') &&
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
