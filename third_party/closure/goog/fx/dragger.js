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
goog.require('goog.events');
goog.require('goog.events.BrowserEvent.MouseButton');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.userAgent');



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
 */
goog.fx.Dragger = function(target, opt_handle, opt_limits) {
  goog.events.EventTarget.call(this);
  this.target = target;
  this.handle = opt_handle || target;
  this.limits = opt_limits || new goog.math.Rect(NaN, NaN, NaN, NaN);

  this.document_ = goog.dom.getOwnerDocument(target);
  this.eventHandler_ = new goog.events.EventHandler(this);

  // Add listener. Do not use the event handler here since the event handler is
  // used for listeners added and removed during the drag operation.
  goog.events.listen(this.handle, [goog.events.EventType.TOUCHSTART,
                     goog.events.EventType.MOUSEDOWN], this.startDrag, false,
                     this);
};
goog.inherits(goog.fx.Dragger, goog.events.EventTarget);


/**
 * Whether setCapture is supported by the browser.
 * @type {boolean}
 * @private
 */
goog.fx.Dragger.HAS_SET_CAPTURE_ =
    // IE and Gecko after 1.9.3 has setCapture
    // WebKit does not yet: https://bugs.webkit.org/show_bug.cgi?id=27330
    goog.userAgent.IE ||
    goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.3');


/**
 * Constants for event names.
 * @enum {string}
 */
goog.fx.Dragger.EventType = {
  START: 'start',
  BEFOREDRAG: 'beforedrag',
  DRAG: 'drag',
  END: 'end'
};


/**
 * Reference to drag target element.
 * @type {Element}
 */
goog.fx.Dragger.prototype.target;


/**
 * Reference to the handler that inititates the drag.
 * @type {Element}
 */
goog.fx.Dragger.prototype.handle;


/**
 * Object representing the limits of the drag region.
 * @type {goog.math.Rect}
 */
goog.fx.Dragger.prototype.limits;


/**
 * Current x position of mouse or touch relative to viewport.
 * @type {number}
 */
goog.fx.Dragger.prototype.clientX = 0;


/**
 * Current y position of mouse or touch relative to viewport.
 * @type {number}
 */
goog.fx.Dragger.prototype.clientY = 0;


/**
 * Current x position of mouse or touch relative to screen. Deprecated because
 * it doesn't take into affect zoom level or pixel density. Consider switching
 * to clientX instead.
 * @type {number}
 * @deprecated
 */
goog.fx.Dragger.prototype.screenX = 0;


/**
 * Current y position of mouse or touch relative to screen. Deprecated because
 * it doesn't take into affect zoom level or pixel density. Consider switching
 * to clientY instead.
 * @type {number}
 * @deprecated
 */
goog.fx.Dragger.prototype.screenY = 0;


/**
 * The x position where the first mousedown or touchstart occurred.
 * @type {number}
 */
goog.fx.Dragger.prototype.startX = 0;


/**
 * The y position where the first mousedown or touchstart occurred.
 * @type {number}
 */
goog.fx.Dragger.prototype.startY = 0;


/**
 * Current x position of drag relative to target's parent.
 * @type {number}
 */
goog.fx.Dragger.prototype.deltaX = 0;


/**
 * Current y position of drag relative to target's parent.
 * @type {number}
 */
goog.fx.Dragger.prototype.deltaY = 0;


/**
 * The current page scroll value.
 * @type {goog.math.Coordinate}
 */
goog.fx.Dragger.prototype.pageScroll;


/**
 * Whether dragging is currently enabled.
 * @type {boolean}
 * @private
 */
goog.fx.Dragger.prototype.enabled_ = true;


/**
 * Whether object is currently being dragged.
 * @type {boolean}
 * @private
 */
goog.fx.Dragger.prototype.dragging_ = false;


/**
 * The amount of distance, in pixels, after which a mousedown or touchstart is
 * considered a drag.
 * @type {number}
 * @private
 */
goog.fx.Dragger.prototype.hysteresisDistanceSquared_ = 0;


/**
 * Timestamp of when the mousedown or touchstart occurred.
 * @type {number}
 * @private
 */
goog.fx.Dragger.prototype.mouseDownTime_ = 0;


/**
 * Reference to a document object to use for the events.
 * @type {Document}
 * @private
 */
goog.fx.Dragger.prototype.document_;


/**
 * Event handler used to simplify managing events.
 * @type {goog.events.EventHandler}
 * @private
 */
goog.fx.Dragger.prototype.eventHandler_;


/**
 * The SCROLL event target used to make drag element follow scrolling.
 * @type {EventTarget}
 * @private
 */
goog.fx.Dragger.prototype.scrollTarget_;


/**
 * Whether IE drag events cancelling is on.
 * @type {boolean}
 * @private
 */
goog.fx.Dragger.prototype.ieDragStartCancellingOn_ = false;


/**
 * Returns the event handler, intended for subclass use.
 * @return {goog.events.EventHandler} The event handler.
 */
goog.fx.Dragger.prototype.getHandler = function() {
  return this.eventHandler_;
};


/**
 * Sets (or reset) the Drag limits after a Dragger is created.
 * @param {goog.math.Rect?} limits Object containing left, top, width,
 *     height for new Dragger limits.
 */
goog.fx.Dragger.prototype.setLimits = function(limits) {
  this.limits = limits || new goog.math.Rect(NaN, NaN, NaN, NaN);
};


/**
 * Sets the distance the user has to drag the element before a drag operation is
 * started.
 * @param {number} distance The number of pixels after which a mousedown and
 *     move is considered a drag.
 */
goog.fx.Dragger.prototype.setHysteresis = function(distance) {
  this.hysteresisDistanceSquared_ = Math.pow(distance, 2);
};


/**
 * Gets the distance the user has to drag the element before a drag operation is
 * started.
 * @return {number} distance The number of pixels after which a mousedown and
 *     move is considered a drag.
 */
goog.fx.Dragger.prototype.getHysteresis = function() {
  return Math.sqrt(this.hysteresisDistanceSquared_);
};


/**
 * Sets the SCROLL event target to make drag element follow scrolling.
 *
 * @param {EventTarget} scrollTarget The event target that dispatches SCROLL
 *     events.
 */
goog.fx.Dragger.prototype.setScrollTarget = function(scrollTarget) {
  this.scrollTarget_ = scrollTarget;
};


/**
 * Enables cancelling of built-in IE drag events.
 * @param {boolean} cancelIeDragStart Whether to enable cancelling of IE
 *     dragstart event.
 */
goog.fx.Dragger.prototype.setCancelIeDragStart = function(cancelIeDragStart) {
  this.ieDragStartCancellingOn_ = cancelIeDragStart;
};


/**
 * @return {boolean} Whether the dragger is enabled.
 */
goog.fx.Dragger.prototype.getEnabled = function() {
  return this.enabled_;
};


/**
 * Set whether dragger is enabled
 * @param {boolean} enabled Whether dragger is enabled.
 */
goog.fx.Dragger.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
};


/**
 * Tears down the drag object, removes listeners, and nullifies references.
 */
goog.fx.Dragger.prototype.disposeInternal = function() {
  goog.fx.Dragger.superClass_.disposeInternal.call(this);

  goog.events.unlisten(this.handle, [goog.events.EventType.TOUCHSTART,
                       goog.events.EventType.MOUSEDOWN], this.startDrag, false,
                       this);
  this.eventHandler_.dispose();

  delete this.target;
  delete this.handle;
  delete this.eventHandler_;
};


/**
 * Event handler that is used to start the drag
 * @param {goog.events.BrowserEvent} e Event object.
 */
goog.fx.Dragger.prototype.startDrag = function(e) {
  var isMouseDown = e.type == goog.events.EventType.MOUSEDOWN;

  // Dragger.startDrag() can be called by AbstractDragDrop with a mousemove
  // event and IE does not report pressed mouse buttons on mousemove. Also,
  // it does not make sense to check for the button if the user is already
  // dragging.

  if (this.enabled_ && !this.dragging_ &&
      (!isMouseDown || e.isMouseActionButton())) {
    this.maybeReinitTouchEvent_(e);
    if (this.hysteresisDistanceSquared_ == 0) {
      this.initializeDrag_(e);
      if (this.dragging_) {
        e.preventDefault();
      } else {
        // If the start drag is cancelled, don't setup for a drag.
        return;
      }
    } else {
      // Need to preventDefault for hysteresis to prevent page getting selected.
      e.preventDefault();
    }
    this.setupDragHandlers();

    this.clientX = this.startX = e.clientX;
    this.clientY = this.startY = e.clientY;
    this.screenX = e.screenX;
    this.screenY = e.screenY;
    this.deltaX = this.target.offsetLeft;
    this.deltaY = this.target.offsetTop;
    this.pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();

    this.mouseDownTime_ = goog.now();
  }
};


/**
 * Sets up event handlers when dragging starts.
 * @protected
 */
goog.fx.Dragger.prototype.setupDragHandlers = function() {
  var doc = this.document_;
  var docEl = doc.documentElement;
  // Use bubbling when we have setCapture since we got reports that IE has
  // problems with the capturing events in combination with setCapture.
  var useCapture = !goog.fx.Dragger.HAS_SET_CAPTURE_;

  this.eventHandler_.listen(doc, [goog.events.EventType.TOUCHMOVE,
                            goog.events.EventType.MOUSEMOVE],
                            this.handleMove_, useCapture);
  this.eventHandler_.listen(doc, [goog.events.EventType.TOUCHEND,
                            goog.events.EventType.MOUSEUP], this.endDrag,
                            useCapture);

  if (goog.fx.Dragger.HAS_SET_CAPTURE_) {
    docEl.setCapture(false);
    this.eventHandler_.listen(docEl,
                              goog.events.EventType.LOSECAPTURE,
                              this.endDrag);
  } else {
    // Make sure we stop the dragging if the window loses focus.
    // Don't use capture in this listener because we only want to end the drag
    // if the actual window loses focus. Since blur events do not bubble we use
    // a bubbling listener on the window.
    this.eventHandler_.listen(goog.dom.getWindow(doc),
                              goog.events.EventType.BLUR,
                              this.endDrag);
  }

  if (goog.userAgent.IE && this.ieDragStartCancellingOn_) {
    // Cancel IE's 'ondragstart' event.
    this.eventHandler_.listen(doc, goog.events.EventType.DRAGSTART,
                              goog.events.Event.preventDefault);
  }

  if (this.scrollTarget_) {
    this.eventHandler_.listen(this.scrollTarget_, goog.events.EventType.SCROLL,
                              this.onScroll_, useCapture);
  }
};


/**
 * Event handler that is used to start the drag
 * @param {goog.events.BrowserEvent|goog.events.Event} e Event object.
 * @private
 */
goog.fx.Dragger.prototype.initializeDrag_ = function(e) {
  var rv = this.dispatchEvent(new goog.fx.DragEvent(
      goog.fx.Dragger.EventType.START, this, e.clientX, e.clientY,
      /** @type {goog.events.BrowserEvent} */(e)));
  if (rv !== false) {
    this.dragging_ = true;
  }
};


/**
 * Event handler that is used to end the drag
 * @param {goog.events.BrowserEvent} e Event object.
 * @param {boolean=} opt_dragCanceled Whether the drag has been canceled.
 */
goog.fx.Dragger.prototype.endDrag = function(e, opt_dragCanceled) {
  this.eventHandler_.removeAll();

  if (goog.fx.Dragger.HAS_SET_CAPTURE_) {
    this.document_.releaseCapture();
  }

  if (this.dragging_) {
    this.maybeReinitTouchEvent_(e);
    this.dragging_ = false;

    var x = this.limitX(this.deltaX);
    var y = this.limitY(this.deltaY);
    var dragCancelled = opt_dragCanceled ||
                        e.type == goog.events.EventType.TOUCHCANCEL;
    this.dispatchEvent(new goog.fx.DragEvent(
        goog.fx.Dragger.EventType.END, this, e.clientX, e.clientY, e, x, y,
        dragCancelled));
  }

  // Call preventDefault to prevent mouseup from being raised if this is a
  // touchend event.
  if (e.type == goog.events.EventType.TOUCHEND ||
      e.type == goog.events.EventType.TOUCHCANCEL) {
    e.preventDefault();
  }
};


/**
 * Event handler that is used to end the drag by cancelling it.
 * @param {goog.events.BrowserEvent} e Event object.
 */
goog.fx.Dragger.prototype.endDragCancel = function(e) {
  this.endDrag(e, true);
};


/**
 * Re-initializes the event with the first target touch event or, in the case
 * of a stop event, the last changed touch.
 * @param {goog.events.BrowserEvent} e
 * @private
 */
goog.fx.Dragger.prototype.maybeReinitTouchEvent_ = function(e) {
  var type = e.type;

  if (type == goog.events.EventType.TOUCHSTART ||
      type == goog.events.EventType.TOUCHMOVE) {
    e.init(e.getBrowserEvent().targetTouches[0], e.currentTarget);
  } else if (type == goog.events.EventType.TOUCHEND ||
             type == goog.events.EventType.TOUCHCANCEL) {
    e.init(e.getBrowserEvent().changedTouches[0], e.currentTarget);
  }
};


/**
 * Event handler that is used on mouse / touch move to update the drag
 * @param {goog.events.BrowserEvent} e Event object.
 * @private
 */
// TODO(nicksantos): Rename this function to handleMove_ once we've fixed gmail.
goog.fx.Dragger.prototype.handleMove_ = function(e) {
  if (this.enabled_) {
    this.maybeReinitTouchEvent_(e);
    var dx = e.clientX - this.clientX;
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
        this.initializeDrag_(e);
        if (!this.dragging_) {
          // If the start drag is cancelled, stop trying to drag.
          this.endDrag(e);
          return;
        }
      }
    }

    var pos = this.calculatePosition_(dx, dy);
    var x = pos.x;
    var y = pos.y;

    if (this.dragging_) {

      var rv = this.dispatchEvent(new goog.fx.DragEvent(
          goog.fx.Dragger.EventType.BEFOREDRAG, this, e.clientX, e.clientY,
          e, x, y));

      // Only do the defaultAction and dispatch drag event if predrag didn't
      // prevent default
      if (rv !== false) {
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
 * @return {goog.math.Coordinate} The newly calculated drag element position.
 * @private
 */
goog.fx.Dragger.prototype.calculatePosition_ = function(dx, dy) {
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
  var pos = this.calculatePosition_(0, 0);
  e.clientX = this.pageScroll.x - this.clientX;
  e.clientY = this.pageScroll.y - this.clientY;
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
  this.defaultAction(x, y);
  this.dispatchEvent(new goog.fx.DragEvent(
      goog.fx.Dragger.EventType.DRAG, this, e.clientX, e.clientY, e, x, y));
};


/**
 * Returns the 'real' x after limits are applied (allows for some
 * limits to be undefined).
 * @param {number} x X-coordinate to limit.
 * @return {number} The 'real' X-coordinate after limits are applied.
 */
goog.fx.Dragger.prototype.limitX = function(x) {
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
  var rect = this.limits;
  var top = !isNaN(rect.top) ? rect.top : null;
  var height = !isNaN(rect.height) ? rect.height : 0;
  var maxY = top != null ? top + height : Infinity;
  var minY = top != null ? top : -Infinity;
  return Math.min(maxY, Math.max(minY, y));
};


/**
 * Overridable function for handling the default action of the drag behaviour.
 * Normally this is simply moving the element to x,y though in some cases it
 * might be used to resize the layer.  This is basically a shortcut to
 * implementing a default ondrag event handler.
 * @param {number} x X-coordinate for target element.
 * @param {number} y Y-coordinate for target element.
 */
goog.fx.Dragger.prototype.defaultAction = function(x, y) {
  this.target.style.left = x + 'px';
  this.target.style.top = y + 'px';
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
 * @extends {goog.events.Event}
 */
goog.fx.DragEvent = function(type, dragobj, clientX, clientY, browserEvent,
                             opt_actX, opt_actY, opt_dragCanceled) {
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
  this.left = goog.isDef(opt_actX) ? opt_actX : dragobj.deltaX;

  /**
   * The real y-position of the drag if it has been limited
   * @type {number}
   */
  this.top = goog.isDef(opt_actY) ? opt_actY : dragobj.deltaY;

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
