/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Drag Utilities.
 *
 * Provides extensible functionality for drag & drop behaviour.
 *
 * @see ../demos/drag.html
 * @see ../demos/dragger.html
 */


goog.provide('goog.fx.DragEvent');
goog.provide('goog.fx.Dragger');
goog.provide('goog.fx.Dragger.EventType');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.style.bidi');
goog.require('goog.userAgent');
goog.requireType('goog.events.BrowserEvent');



/**
 * A class that allows mouse or touch-based dragging (moving) of an element
 *
 * @param {Element} target The element that will be dragged.
 * @param {Element=} opt_handle An optional handle to control the drag, if null
 *     the target is used.
 * @param {goog.math.Rect=} opt_limits Object containing left, top, width,
 *     and height.
 *
 * @extends {goog.events.EventTarget}
 * @constructor
 * @struct
 */
goog.fx.Dragger = function(target, opt_handle, opt_limits) {
  'use strict';
  goog.fx.Dragger.base(this, 'constructor');

  /**
   * Reference to drag target element.
   * @type {?Element}
   */
  this.target = target;

  /**
   * Reference to the handler that initiates the drag.
   * @type {?Element}
   */
  this.handle = opt_handle || target;

  /**
   * Object representing the limits of the drag region.
   * @type {goog.math.Rect}
   */
  this.limits = opt_limits || new goog.math.Rect(NaN, NaN, NaN, NaN);

  /**
   * Reference to a document object to use for the events.
   * @private {Document}
   */
  this.document_ = goog.dom.getOwnerDocument(target);

  /** @private {!goog.events.EventHandler} */
  this.eventHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eventHandler_);

  /**
   * Whether the element is rendered right-to-left. We initialize this lazily.
   * @private {boolean|undefined}}
   */
  this.rightToLeft_;

  /**
   * Current x position of mouse or touch relative to viewport.
   * @type {number}
   */
  this.clientX = 0;

  /**
   * Current y position of mouse or touch relative to viewport.
   * @type {number}
   */
  this.clientY = 0;

  /**
   * Current x position of mouse or touch relative to screen. Deprecated because
   * it doesn't take into affect zoom level or pixel density.
   * @type {number}
   * @deprecated Consider switching to clientX instead.
   */
  this.screenX = 0;

  /**
   * Current y position of mouse or touch relative to screen. Deprecated because
   * it doesn't take into affect zoom level or pixel density.
   * @type {number}
   * @deprecated Consider switching to clientY instead.
   */
  this.screenY = 0;

  /**
   * The x position where the first mousedown or touchstart occurred.
   * @type {number}
   */
  this.startX = 0;

  /**
   * The y position where the first mousedown or touchstart occurred.
   * @type {number}
   */
  this.startY = 0;

  /**
   * Current x position of drag relative to target's parent.
   * @type {number}
   */
  this.deltaX = 0;

  /**
   * Current y position of drag relative to target's parent.
   * @type {number}
   */
  this.deltaY = 0;

  /**
   * The current page scroll value.
   * @type {?goog.math.Coordinate}
   */
  this.pageScroll;

  /**
   * Whether dragging is currently enabled.
   * @private {boolean}
   */
  this.enabled_ = true;

  /**
   * Whether object is currently being dragged.
   * @private {boolean}
   */
  this.dragging_ = false;

  /**
   * Whether mousedown should be default prevented.
   * @private {boolean}
   **/
  this.preventMouseDown_ = true;

  /**
   * The amount of distance, in pixels, after which a mousedown or touchstart is
   * considered a drag.
   * @private {number}
   */
  this.hysteresisDistanceSquared_ = 0;

  /**
   * The SCROLL event target used to make drag element follow scrolling.
   * @private {?EventTarget}
   */
  this.scrollTarget_;

  /**
   * Whether IE drag events cancelling is on.
   * @private {boolean}
   */
  this.ieDragStartCancellingOn_ = false;

  /**
   * Whether the dragger implements the changes described in http://b/6324964,
   * making it truly RTL.  This is a temporary flag to allow clients to
   * transition to the new behavior at their convenience.  At some point it will
   * be the default.
   * @private {boolean}
   */
  this.useRightPositioningForRtl_ = false;

  // Add listener. Do not use the event handler here since the event handler is
  // used for listeners added and removed during the drag operation.
  goog.events.listen(
      this.handle,
      [goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN],
      this.startDrag, false, this);

  /** @private {boolean} Avoids setCapture() calls to fix click handlers. */
  this.useSetCapture_ = goog.fx.Dragger.HAS_SET_CAPTURE_;
};
goog.inherits(goog.fx.Dragger, goog.events.EventTarget);
// Dragger is meant to be extended, but defines most properties on its
// prototype, thus making it unsuitable for sealing.


/**
 * Whether setCapture is supported by the browser.
 * IE and Gecko after 1.9.3 have setCapture. MS Edge and WebKit
 * (https://bugs.webkit.org/show_bug.cgi?id=27330) don't.
 * @type {boolean}
 * @private
 */
goog.fx.Dragger.HAS_SET_CAPTURE_ = goog.global.document &&
    goog.global.document.documentElement &&
    !!goog.global.document.documentElement.setCapture &&
    !!goog.global.document.releaseCapture;


/**
 * Creates copy of node being dragged.  This is a utility function to be used
 * wherever it is inappropriate for the original source to follow the mouse
 * cursor itself.
 *
 * @param {Element} sourceEl Element to copy.
 * @return {!Element} The clone of `sourceEl`.
 */
goog.fx.Dragger.cloneNode = function(sourceEl) {
  'use strict';
  var clonedEl = sourceEl.cloneNode(true),
      origTexts =
          goog.dom.getElementsByTagName(goog.dom.TagName.TEXTAREA, sourceEl),
      dragTexts =
          goog.dom.getElementsByTagName(goog.dom.TagName.TEXTAREA, clonedEl);
  // Cloning does not copy the current value of textarea elements, so correct
  // this manually.
  for (var i = 0; i < origTexts.length; i++) {
    dragTexts[i].value = origTexts[i].value;
  }
  switch (sourceEl.tagName) {
    case String(goog.dom.TagName.TR):
      return goog.dom.createDom(
          goog.dom.TagName.TABLE, null,
          goog.dom.createDom(goog.dom.TagName.TBODY, null, clonedEl));
    case String(goog.dom.TagName.TD):
    case String(goog.dom.TagName.TH):
      return goog.dom.createDom(
          goog.dom.TagName.TABLE, null,
          goog.dom.createDom(
              goog.dom.TagName.TBODY, null,
              goog.dom.createDom(goog.dom.TagName.TR, null, clonedEl)));
    case String(goog.dom.TagName.TEXTAREA):
      /**
       * @suppress {strictMissingProperties} Added to tighten compiler checks
       */
      clonedEl.value = sourceEl.value;
    default:
      return clonedEl;
  }
};


/**
 * Constants for event names.
 * @enum {string}
 */
goog.fx.Dragger.EventType = {
  // The drag action was canceled before the START event. Possible reasons:
  // disabled dragger, dragging with the right mouse button or releasing the
  // button before reaching the hysteresis distance.
  EARLY_CANCEL: 'earlycancel',
  START: 'start',
  BEFOREDRAG: 'beforedrag',
  DRAG: 'drag',
  END: 'end'
};


/**
 * Prevents the dragger from calling setCapture(), even in browsers that support
 * it.  If the draggable item has click handlers, setCapture() can break them.
 * @param {boolean} allow True to use setCapture if the browser supports it.
 */
goog.fx.Dragger.prototype.setAllowSetCapture = function(allow) {
  'use strict';
  this.useSetCapture_ = allow && goog.fx.Dragger.HAS_SET_CAPTURE_;
};


/**
 * Turns on/off true RTL behavior.  This should be called immediately after
 * construction.  This is a temporary flag to allow clients to transition
 * to the new component at their convenience.  At some point true will be the
 * default.
 * @param {boolean} useRightPositioningForRtl True if "right" should be used for
 *     positioning, false if "left" should be used for positioning.
 */
goog.fx.Dragger.prototype.enableRightPositioningForRtl = function(
    useRightPositioningForRtl) {
  'use strict';
  this.useRightPositioningForRtl_ = useRightPositioningForRtl;
};


/**
 * Returns the event handler, intended for subclass use.
 * @return {!goog.events.EventHandler<T>} The event handler.
 * @this {T}
 * @template T
 */
goog.fx.Dragger.prototype.getHandler = function() {
  'use strict';
  // TODO(user): templated "this" values currently result in "this" being
  // "unknown" in the body of the function.
  var self = /** @type {goog.fx.Dragger} */ (this);
  return self.eventHandler_;
};


/**
 * Sets (or reset) the Drag limits after a Dragger is created.
 * @param {goog.math.Rect?} limits Object containing left, top, width,
 *     height for new Dragger limits. If target is right-to-left and
 *     enableRightPositioningForRtl(true) is called, then rect is interpreted as
 *     right, top, width, and height.
 */
goog.fx.Dragger.prototype.setLimits = function(limits) {
  'use strict';
  this.limits = limits || new goog.math.Rect(NaN, NaN, NaN, NaN);
};


/**
 * Sets the distance the user has to drag the element before a drag operation is
 * started.
 * @param {number} distance The number of pixels after which a mousedown and
 *     move is considered a drag.
 */
goog.fx.Dragger.prototype.setHysteresis = function(distance) {
  'use strict';
  this.hysteresisDistanceSquared_ = Math.pow(distance, 2);
};


/**
 * Gets the distance the user has to drag the element before a drag operation is
 * started.
 * @return {number} distance The number of pixels after which a mousedown and
 *     move is considered a drag.
 */
goog.fx.Dragger.prototype.getHysteresis = function() {
  'use strict';
  return Math.sqrt(this.hysteresisDistanceSquared_);
};


/**
 * Sets the SCROLL event target to make drag element follow scrolling.
 *
 * @param {EventTarget} scrollTarget The event target that dispatches SCROLL
 *     events.
 */
goog.fx.Dragger.prototype.setScrollTarget = function(scrollTarget) {
  'use strict';
  this.scrollTarget_ = scrollTarget;
};


/**
 * Enables cancelling of built-in IE drag events.
 * @param {boolean} cancelIeDragStart Whether to enable cancelling of IE
 *     dragstart event.
 */
goog.fx.Dragger.prototype.setCancelIeDragStart = function(cancelIeDragStart) {
  'use strict';
  this.ieDragStartCancellingOn_ = cancelIeDragStart;
};


/**
 * @return {boolean} Whether the dragger is enabled.
 */
goog.fx.Dragger.prototype.getEnabled = function() {
  'use strict';
  return this.enabled_;
};


/**
 * Set whether dragger is enabled
 * @param {boolean} enabled Whether dragger is enabled.
 */
goog.fx.Dragger.prototype.setEnabled = function(enabled) {
  'use strict';
  this.enabled_ = enabled;
};


/**
 * Set whether mousedown should be default prevented.
 * @param {boolean} preventMouseDown Whether mousedown should be default
 *     prevented.
 */
goog.fx.Dragger.prototype.setPreventMouseDown = function(preventMouseDown) {
  'use strict';
  this.preventMouseDown_ = preventMouseDown;
};


/** @override */
goog.fx.Dragger.prototype.disposeInternal = function() {
  'use strict';
  goog.fx.Dragger.superClass_.disposeInternal.call(this);
  goog.events.unlisten(
      this.handle,
      [goog.events.EventType.TOUCHSTART, goog.events.EventType.MOUSEDOWN],
      this.startDrag, false, this);
  this.cleanUpAfterDragging_();

  this.target = null;
  this.handle = null;
};


/**
 * Whether the DOM element being manipulated is rendered right-to-left.
 * @return {boolean} True if the DOM element is rendered right-to-left, false
 *     otherwise.
 * @private
 */
goog.fx.Dragger.prototype.isRightToLeft_ = function() {
  'use strict';
  if (this.rightToLeft_ === undefined) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.target);
  }
  return this.rightToLeft_;
};


/**
 * Event handler that is used to start the drag
 * @param {goog.events.BrowserEvent} e Event object.
 */
goog.fx.Dragger.prototype.startDrag = function(e) {
  'use strict';
  var isMouseDown = e.type == goog.events.EventType.MOUSEDOWN;

  // Dragger.startDrag() can be called by AbstractDragDrop with a mousemove
  // event and IE does not report pressed mouse buttons on mousemove. Also,
  // it does not make sense to check for the button if the user is already
  // dragging.

  if (this.enabled_ && !this.dragging_ &&
      (!isMouseDown || e.isMouseActionButton())) {
    if (this.hysteresisDistanceSquared_ == 0) {
      if (this.fireDragStart_(e)) {
        this.dragging_ = true;
        if (this.preventMouseDown_ && isMouseDown) {
          e.preventDefault();
        }
      } else {
        // If the start drag is cancelled, don't setup for a drag.
        return;
      }
    } else if (this.preventMouseDown_ && isMouseDown) {
      // Need to preventDefault for hysteresis to prevent page getting selected.
      e.preventDefault();
    }
    this.setupDragHandlers();

    this.clientX = this.startX = e.clientX;
    this.clientY = this.startY = e.clientY;
    this.screenX = e.screenX;
    this.screenY = e.screenY;
    this.computeInitialPosition();
    this.pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();
  } else {
    this.dispatchEvent(goog.fx.Dragger.EventType.EARLY_CANCEL);
  }
};


/**
 * Sets up event handlers when dragging starts.
 * @protected
 */
goog.fx.Dragger.prototype.setupDragHandlers = function() {
  'use strict';
  var doc = this.document_;
  var docEl = doc.documentElement;
  // Use bubbling when we have setCapture since we got reports that IE has
  // problems with the capturing events in combination with setCapture.
  var useCapture = !this.useSetCapture_;

  this.eventHandler_.listen(
      doc, [goog.events.EventType.TOUCHMOVE, goog.events.EventType.MOUSEMOVE],
      this.handleMove_, {capture: useCapture, passive: false});
  this.eventHandler_.listen(
      doc, [goog.events.EventType.TOUCHEND, goog.events.EventType.MOUSEUP],
      this.endDrag, useCapture);

  if (this.useSetCapture_) {
    docEl.setCapture(false);
    this.eventHandler_.listen(
        docEl, goog.events.EventType.LOSECAPTURE, this.endDrag);
  } else {
    // Make sure we stop the dragging if the window loses focus.
    // Don't use capture in this listener because we only want to end the drag
    // if the actual window loses focus. Since blur events do not bubble we use
    // a bubbling listener on the window.
    this.eventHandler_.listen(
        goog.dom.getWindow(doc), goog.events.EventType.BLUR, this.endDrag);
  }

  if (goog.userAgent.IE && this.ieDragStartCancellingOn_) {
    // Cancel IE's 'ondragstart' event.
    this.eventHandler_.listen(
        doc, goog.events.EventType.DRAGSTART, goog.events.Event.preventDefault);
  }

  if (this.scrollTarget_) {
    this.eventHandler_.listen(
        this.scrollTarget_, goog.events.EventType.SCROLL, this.onScroll_,
        useCapture);
  }
};


/**
 * Fires a goog.fx.Dragger.EventType.START event.
 * @param {goog.events.BrowserEvent} e Browser event that triggered the drag.
 * @return {boolean} False iff preventDefault was called on the DragEvent.
 * @private
 */
goog.fx.Dragger.prototype.fireDragStart_ = function(e) {
  'use strict';
  return this.dispatchEvent(new goog.fx.DragEvent(
      goog.fx.Dragger.EventType.START, this, e.clientX, e.clientY, e));
};


/**
 * Unregisters the event handlers that are only active during dragging, and
 * releases mouse capture.
 * @private
 */
goog.fx.Dragger.prototype.cleanUpAfterDragging_ = function() {
  'use strict';
  this.eventHandler_.removeAll();
  if (this.useSetCapture_) {
    this.document_.releaseCapture();
  }
};


/**
 * Event handler that is used to end the drag.
 * @param {goog.events.BrowserEvent} e Event object.
 * @param {boolean=} opt_dragCanceled Whether the drag has been canceled.
 */
goog.fx.Dragger.prototype.endDrag = function(e, opt_dragCanceled) {
  'use strict';
  this.cleanUpAfterDragging_();

  if (this.dragging_) {
    this.dragging_ = false;

    var x = this.limitX(this.deltaX);
    var y = this.limitY(this.deltaY);
    var dragCanceled =
        opt_dragCanceled || e.type == goog.events.EventType.TOUCHCANCEL;
    this.dispatchEvent(
        new goog.fx.DragEvent(
            goog.fx.Dragger.EventType.END, this, e.clientX, e.clientY, e, x, y,
            dragCanceled));
  } else {
    this.dispatchEvent(goog.fx.Dragger.EventType.EARLY_CANCEL);
  }
};


/**
 * Event handler that is used to end the drag by cancelling it.
 * @param {goog.events.BrowserEvent} e Event object.
 */
goog.fx.Dragger.prototype.endDragCancel = function(e) {
  'use strict';
  this.endDrag(e, true);
};


/**
 * Event handler that is used on mouse / touch move to update the drag
 * @param {goog.events.BrowserEvent} e Event object.
 * @private
 */
goog.fx.Dragger.prototype.handleMove_ = function(e) {
  'use strict';
  if (this.enabled_) {
    // dx in right-to-left cases is relative to the right.
    var sign =
        this.useRightPositioningForRtl_ && this.isRightToLeft_() ? -1 : 1;
    var dx = sign * (e.clientX - this.clientX);
    var dy = e.clientY - this.clientY;
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    this.screenX = e.screenX;
    this.screenY = e.screenY;

    if (!this.dragging_) {
      var diffX = this.startX - this.clientX;
      var diffY = this.startY - this.clientY;
      var distance = diffX * diffX + diffY * diffY;
      if (distance > this.hysteresisDistanceSquared_) {
        if (this.fireDragStart_(e)) {
          this.dragging_ = true;
        } else {
          // DragListGroup disposes of the dragger if BEFOREDRAGSTART is
          // canceled.
          if (!this.isDisposed()) {
            this.endDrag(e);
          }
          return;
        }
      }
    }

    var pos = this.calculatePosition_(dx, dy);
    var x = pos.x;
    var y = pos.y;

    if (this.dragging_) {
      var rv = this.dispatchEvent(
          new goog.fx.DragEvent(
              goog.fx.Dragger.EventType.BEFOREDRAG, this, e.clientX, e.clientY,
              e, x, y));

      // Only do the defaultAction and dispatch drag event if predrag didn't
      // prevent default
      if (rv) {
        this.doDrag(e, x, y, false);
        e.preventDefault();
      }
    }
  }
};


/**
 * Calculates the drag position.
 *
 * @param {number} dx The horizontal movement delta.
 * @param {number} dy The vertical movement delta.
 * @return {!goog.math.Coordinate} The newly calculated drag element position.
 * @private
 */
goog.fx.Dragger.prototype.calculatePosition_ = function(dx, dy) {
  'use strict';
  // Update the position for any change in body scrolling
  var pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();
  dx += pageScroll.x - this.pageScroll.x;
  dy += pageScroll.y - this.pageScroll.y;
  this.pageScroll = pageScroll;

  this.deltaX += dx;
  this.deltaY += dy;

  var x = this.limitX(this.deltaX);
  var y = this.limitY(this.deltaY);
  return new goog.math.Coordinate(x, y);
};


/**
 * Event handler for scroll target scrolling.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.fx.Dragger.prototype.onScroll_ = function(e) {
  'use strict';
  var pos = this.calculatePosition_(0, 0);
  e.clientX = this.clientX;
  e.clientY = this.clientY;
  this.doDrag(e, pos.x, pos.y, true);
};


/**
 * @param {goog.events.BrowserEvent} e The closure object
 *     representing the browser event that caused a drag event.
 * @param {number} x The new horizontal position for the drag element.
 * @param {number} y The new vertical position for the drag element.
 * @param {boolean} dragFromScroll Whether dragging was caused by scrolling
 *     the associated scroll target.
 * @protected
 */
goog.fx.Dragger.prototype.doDrag = function(e, x, y, dragFromScroll) {
  'use strict';
  this.defaultAction(x, y);
  this.dispatchEvent(
      new goog.fx.DragEvent(
          goog.fx.Dragger.EventType.DRAG, this, e.clientX, e.clientY, e, x, y));
};


/**
 * Returns the 'real' x after limits are applied (allows for some
 * limits to be undefined).
 * @param {number} x X-coordinate to limit.
 * @return {number} The 'real' X-coordinate after limits are applied.
 */
goog.fx.Dragger.prototype.limitX = function(x) {
  'use strict';
  var rect = this.limits;
  var left = !isNaN(rect.left) ? rect.left : null;
  var width = !isNaN(rect.width) ? rect.width : 0;
  var maxX = left != null ? left + width : Infinity;
  var minX = left != null ? left : -Infinity;
  return Math.min(maxX, Math.max(minX, x));
};


/**
 * Returns the 'real' y after limits are applied (allows for some
 * limits to be undefined).
 * @param {number} y Y-coordinate to limit.
 * @return {number} The 'real' Y-coordinate after limits are applied.
 */
goog.fx.Dragger.prototype.limitY = function(y) {
  'use strict';
  var rect = this.limits;
  var top = !isNaN(rect.top) ? rect.top : null;
  var height = !isNaN(rect.height) ? rect.height : 0;
  var maxY = top != null ? top + height : Infinity;
  var minY = top != null ? top : -Infinity;
  return Math.min(maxY, Math.max(minY, y));
};


/**
 * Overridable function for computing the initial position of the target
 * before dragging begins.
 * @protected
 */
goog.fx.Dragger.prototype.computeInitialPosition = function() {
  'use strict';
  this.deltaX = this.useRightPositioningForRtl_ ?
      goog.style.bidi.getOffsetStart(this.target) :
      /** @type {!HTMLElement} */ (this.target).offsetLeft;
  this.deltaY = /** @type {!HTMLElement} */ (this.target).offsetTop;
};


/**
 * Overridable function for handling the default action of the drag behaviour.
 * Normally this is simply moving the element to x,y though in some cases it
 * might be used to resize the layer.  This is basically a shortcut to
 * implementing a default ondrag event handler.
 * @param {number} x X-coordinate for target element. In right-to-left, x this
 *     is the number of pixels the target should be moved to from the right.
 * @param {number} y Y-coordinate for target element.
 */
goog.fx.Dragger.prototype.defaultAction = function(x, y) {
  'use strict';
  if (this.useRightPositioningForRtl_ && this.isRightToLeft_()) {
    this.target.style.right = x + 'px';
  } else {
    this.target.style.left = x + 'px';
  }
  this.target.style.top = y + 'px';
};


/**
 * @return {boolean} Whether the dragger is currently in the midst of a drag.
 */
goog.fx.Dragger.prototype.isDragging = function() {
  'use strict';
  return this.dragging_;
};



/**
 * Object representing a drag event
 * @param {string} type Event type.
 * @param {goog.fx.Dragger} dragobj Drag object initiating event.
 * @param {number} clientX X-coordinate relative to the viewport.
 * @param {number} clientY Y-coordinate relative to the viewport.
 * @param {goog.events.BrowserEvent} browserEvent The closure object
 *   representing the browser event that caused this drag event.
 * @param {number=} opt_actX Optional actual x for drag if it has been limited.
 * @param {number=} opt_actY Optional actual y for drag if it has been limited.
 * @param {boolean=} opt_dragCanceled Whether the drag has been canceled.
 * @constructor
 * @struct
 * @extends {goog.events.Event}
 */
goog.fx.DragEvent = function(
    type, dragobj, clientX, clientY, browserEvent, opt_actX, opt_actY,
    opt_dragCanceled) {
  'use strict';
  goog.events.Event.call(this, type);

  /**
   * X-coordinate relative to the viewport
   * @type {number}
   */
  this.clientX = clientX;

  /**
   * Y-coordinate relative to the viewport
   * @type {number}
   */
  this.clientY = clientY;

  /**
   * The closure object representing the browser event that caused this drag
   * event.
   * @type {goog.events.BrowserEvent}
   */
  this.browserEvent = browserEvent;

  /**
   * The real x-position of the drag if it has been limited
   * @type {number}
   */
  this.left = (opt_actX !== undefined) ? opt_actX : dragobj.deltaX;

  /**
   * The real y-position of the drag if it has been limited
   * @type {number}
   */
  this.top = (opt_actY !== undefined) ? opt_actY : dragobj.deltaY;

  /**
   * Reference to the drag object for this event
   * @type {goog.fx.Dragger}
   */
  this.dragger = dragobj;

  /**
   * Whether drag was canceled with this event. Used to differentiate between
   * a legitimate drag END that can result in an action and a drag END which is
   * a result of a drag cancelation. For now it can happen 1) with drag END
   * event on FireFox when user drags the mouse out of the window, 2) with
   * drag END event on IE7 which is generated on MOUSEMOVE event when user
   * moves the mouse into the document after the mouse button has been
   * released, 3) when TOUCHCANCEL is raised instead of TOUCHEND (on touch
   * events).
   * @type {boolean}
   */
  this.dragCanceled = !!opt_dragCanceled;
};
goog.inherits(goog.fx.DragEvent, goog.events.Event);
