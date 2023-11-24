// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Functions to do with firing and simulating events.
 */


goog.provide('bot.events');
goog.provide('bot.events.EventArgs');
goog.provide('bot.events.EventType');
goog.provide('bot.events.KeyboardArgs');
goog.provide('bot.events.MSGestureArgs');
goog.provide('bot.events.MSPointerArgs');
goog.provide('bot.events.MouseArgs');
goog.provide('bot.events.Touch');
goog.provide('bot.events.TouchArgs');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.userAgent');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('goog.style');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');


/**
 * Whether the browser supports the construction of touch events.
 *
 * @const
 * @type {boolean}
 */
bot.events.SUPPORTS_TOUCH_EVENTS = !(goog.userAgent.IE &&
  !bot.userAgent.isEngineVersion(10));


/**
 * Whether the browser supports a native touch api.
 * @private {boolean}
 * @const
 */
bot.events.BROKEN_TOUCH_API_ = (function () {
  if (goog.userAgent.product.ANDROID) {
    // Native touch api supported starting in version 4.0 (Ice Cream Sandwich).
    return !bot.userAgent.isProductVersion(4);
  }
  return !bot.userAgent.IOS;
})();


/**
 * Whether the browser supports the construction of MSPointer events.
 *
 * @const
 * @type {boolean}
 */
bot.events.SUPPORTS_MSPOINTER_EVENTS =
  goog.userAgent.IE && bot.getWindow().navigator.msPointerEnabled;


/**
 * Arguments to initialize an event.
 *
 * @typedef {bot.events.MouseArgs|bot.events.KeyboardArgs|bot.events.TouchArgs|
             bot.events.MSGestureArgs|bot.events.MSPointerArgs}
 */
bot.events.EventArgs;


/**
 * Arguments to initialize a mouse event.
 *
 * @typedef {{clientX: number,
 *            clientY: number,
 *            button: number,
 *            altKey: boolean,
 *            ctrlKey: boolean,
 *            shiftKey: boolean,
 *            metaKey: boolean,
 *            relatedTarget: Element,
 *            wheelDelta: number}}
 */
bot.events.MouseArgs;


/**
 * Arguments to initialize a keyboard event.
 *
 * @typedef {{keyCode: number,
 *            charCode: number,
 *            altKey: boolean,
 *            ctrlKey: boolean,
 *            shiftKey: boolean,
 *            metaKey: boolean,
 *            preventDefault: boolean}}
 */
bot.events.KeyboardArgs;


/**
 * Argument to initialize a touch event.
 *
 * @typedef {{touches: !Array.<bot.events.Touch>,
 *            targetTouches: !Array.<bot.events.Touch>,
 *            changedTouches: !Array.<bot.events.Touch>,
 *            altKey: boolean,
 *            ctrlKey: boolean,
 *            shiftKey: boolean,
 *            metaKey: boolean,
 *            relatedTarget: Element,
 *            scale: number,
 *            rotation: number}}
 */
bot.events.TouchArgs;


/**
 * @typedef {{identifier: number,
 *            screenX: number,
 *            screenY: number,
 *            clientX: number,
 *            clientY: number,
 *            pageX: number,
 *            pageY: number}}
 */
bot.events.Touch;


/**
 * Arguments to initialize an MSGesture event.
 *
 * @typedef {{clientX: number,
 *            clientY: number,
 *            translationX: number,
 *            translationY: number,
 *            scale: number,
 *            expansion: number,
 *            rotation: number,
 *            velocityX: number,
 *            velocityY: number,
 *            velocityExpansion: number,
 *            velocityAngular: number,
 *            relatedTarget: Element}}
 */
bot.events.MSGestureArgs;


/**
 * Arguments to initialize an MSPointer event.
 *
 * @typedef {{clientX: number,
 *            clientY: number,
 *            button: number,
 *            altKey: boolean,
 *            ctrlKey: boolean,
 *            shiftKey: boolean,
 *            metaKey: boolean,
 *            relatedTarget: Element,
 *            width: number,
 *            height: number,
 *            pressure: number,
 *            rotation: number,
 *            pointerId: number,
 *            tiltX: number,
 *            tiltY: number,
 *            pointerType: number,
 *            isPrimary: boolean}}
 */
bot.events.MSPointerArgs;



/**
 * Factory for event objects of a specific type.
 *
 * @constructor
 * @param {string} type Type of the created events.
 * @param {boolean} bubbles Whether the created events bubble.
 * @param {boolean} cancelable Whether the created events are cancelable.
 * @private
 */
bot.events.EventFactory_ = function (type, bubbles, cancelable) {
  /** @private {string} */
  this.type_ = type;

  /** @private {boolean} */
  this.bubbles_ = bubbles;

  /** @private {boolean} */
  this.cancelable_ = cancelable;
};


/**
 * Creates an event.
 *
 * @param {!Element|!Window} target Target element of the event.
 * @param {bot.events.EventArgs=} opt_args Event arguments.
 * @return {!Event} Newly created event.
 */
bot.events.EventFactory_.prototype.create = function (target, opt_args) {
  var doc = goog.dom.getOwnerDocument(target);

  var event = doc.createEvent('HTMLEvents');
  event.initEvent(this.type_, this.bubbles_, this.cancelable_);

  return event;
};


/**
 * Overriding toString to return the unique type string improves debugging,
 * and it allows event types to be mapped in JS objects without collisions.
 *
 * @return {string} String representation of the event type.
 * @override
 */
bot.events.EventFactory_.prototype.toString = function () {
  return this.type_;
};



/**
 * Factory for mouse event objects of a specific type.
 *
 * @constructor
 * @param {string} type Type of the created events.
 * @param {boolean} bubbles Whether the created events bubble.
 * @param {boolean} cancelable Whether the created events are cancelable.
 * @extends {bot.events.EventFactory_}
 * @private
 */
bot.events.MouseEventFactory_ = function (type, bubbles, cancelable) {
  goog.base(this, type, bubbles, cancelable);
};
goog.inherits(bot.events.MouseEventFactory_, bot.events.EventFactory_);


/**
 * @override
 */
bot.events.MouseEventFactory_.prototype.create = function (target, opt_args) {
  // Only Gecko supports the mouse pixel scroll event.
  if (!goog.userAgent.GECKO && this == bot.events.EventType.MOUSEPIXELSCROLL) {
    throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION,
      'Browser does not support a mouse pixel scroll event.');
  }

  var args = /** @type {!bot.events.MouseArgs} */ (opt_args);
  var doc = goog.dom.getOwnerDocument(target);
  var event;

  var view = goog.dom.getWindow(doc);
  event = doc.createEvent('MouseEvents');
  var detail = 1;

  // All browser but Firefox provide the wheelDelta value in the event.
  // Firefox provides the scroll amount in the detail field, where it has the
  // opposite polarity of the wheelDelta (upward scroll is negative) and is a
  // factor of 40 less than the wheelDelta value.
  // The wheelDelta value is normally some multiple of 40.
  if (this == bot.events.EventType.MOUSEWHEEL) {
    if (!goog.userAgent.GECKO) {
      event.wheelDelta = args.wheelDelta;
    }
    if (goog.userAgent.GECKO) {
      detail = args.wheelDelta / -40;
    }
  }

  // Only Gecko supports a mouse pixel scroll event, so we use it as the
  // "standard" and pass it along as is as the "detail" of the event.
  if (goog.userAgent.GECKO && this == bot.events.EventType.MOUSEPIXELSCROLL) {
    detail = args.wheelDelta;
  }

  // For screenX and screenY, we set those to clientX and clientY values.
  // While not strictly correct, applications under test depend on
  // accurate relative positioning which is satisfied.
  event.initMouseEvent(this.type_, this.bubbles_, this.cancelable_, view,
    detail, /*screenX*/ args.clientX, /*screenY*/ args.clientY,
    args.clientX, args.clientY, args.ctrlKey, args.altKey,
    args.shiftKey, args.metaKey, args.button, args.relatedTarget);

  // Trying to modify the properties throws an error,
  // so we define getters to return the correct values.
  if (goog.userAgent.IE &&
    event.pageX === 0 && event.pageY === 0 && Object.defineProperty) {
    var scrollElem = goog.dom.getDomHelper(target).getDocumentScrollElement();
    var clientElem = goog.style.getClientViewportElement(doc);
    var pageX = args.clientX + scrollElem.scrollLeft - clientElem.clientLeft;
    var pageY = args.clientY + scrollElem.scrollTop - clientElem.clientTop;

    Object.defineProperty(event, 'pageX', {
      get: function () {
        return pageX;
      }
    });
    Object.defineProperty(event, 'pageY', {
      get: function () {
        return pageY;
      }
    });
  }

  return event;
};



/**
 * Factory for keyboard event objects of a specific type.
 *
 * @constructor
 * @param {string} type Type of the created events.
 * @param {boolean} bubbles Whether the created events bubble.
 * @param {boolean} cancelable Whether the created events are cancelable.
 * @extends {bot.events.EventFactory_}
 * @private
 */
bot.events.KeyboardEventFactory_ = function (type, bubbles, cancelable) {
  goog.base(this, type, bubbles, cancelable);
};
goog.inherits(bot.events.KeyboardEventFactory_, bot.events.EventFactory_);


/**
 * @override
 */
bot.events.KeyboardEventFactory_.prototype.create = function (target, opt_args) {
  var args = /** @type {!bot.events.KeyboardArgs} */ (opt_args);
  var doc = goog.dom.getOwnerDocument(target);
  var event;

  if (goog.userAgent.GECKO && !bot.userAgent.isEngineVersion(93)) {
    var view = goog.dom.getWindow(doc);
    var keyCode = args.charCode ? 0 : args.keyCode;
    event = doc.createEvent('KeyboardEvent');
    event.initKeyEvent(this.type_, this.bubbles_, this.cancelable_, view,
      args.ctrlKey, args.altKey, args.shiftKey, args.metaKey, keyCode,
      args.charCode);
    // https://bugzilla.mozilla.org/show_bug.cgi?id=501496
    if (this.type_ == bot.events.EventType.KEYPRESS && args.preventDefault) {
      event.preventDefault();
    }
  } else {
    event = doc.createEvent('Events');
    event.initEvent(this.type_, this.bubbles_, this.cancelable_);
    event.altKey = args.altKey;
    event.ctrlKey = args.ctrlKey;
    event.metaKey = args.metaKey;
    event.shiftKey = args.shiftKey;
    event.keyCode = args.charCode || args.keyCode;
    if (goog.userAgent.WEBKIT || goog.userAgent.EDGE) {
      event.charCode = (this == bot.events.EventType.KEYPRESS) ?
        event.keyCode : 0;
    }
  }

  return event;
};



/**
 * Enum representing which mechanism to use for creating touch events.
 * @enum {number}
 * @private
 */
bot.events.TouchEventStrategy_ = {
  MOUSE_EVENTS: 1,
  INIT_TOUCH_EVENT: 2,
  TOUCH_EVENT_CTOR: 3
};



/**
 * Factory for touch event objects of a specific type.
 *
 * @constructor
 * @param {string} type Type of the created events.
 * @param {boolean} bubbles Whether the created events bubble.
 * @param {boolean} cancelable Whether the created events are cancelable.
 * @extends {bot.events.EventFactory_}
 * @private
 */
bot.events.TouchEventFactory_ = function (type, bubbles, cancelable) {
  goog.base(this, type, bubbles, cancelable);
};
goog.inherits(bot.events.TouchEventFactory_, bot.events.EventFactory_);


/**
 * @override
 */
bot.events.TouchEventFactory_.prototype.create = function (target, opt_args) {
  if (!bot.events.SUPPORTS_TOUCH_EVENTS) {
    throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION,
      'Browser does not support firing touch events.');
  }

  var args = /** @type {!bot.events.TouchArgs} */ (opt_args);
  var doc = goog.dom.getOwnerDocument(target);
  var view = goog.dom.getWindow(doc);

  // Creates a TouchList, using native touch Api, for touch events.
  function createNativeTouchList(touchListArgs) {
    var touches = goog.array.map(touchListArgs, function (touchArg) {
      return doc.createTouch(view, target, touchArg.identifier,
        touchArg.pageX, touchArg.pageY, touchArg.screenX, touchArg.screenY);
    });

    return doc.createTouchList.apply(doc, touches);
  }

  // Creates a TouchList, using simulated touch Api, for touch events.
  function createGenericTouchList(touchListArgs) {
    var touches = goog.array.map(touchListArgs, function (touchArg) {
      // The target field is not part of the W3C spec, but both android and iOS
      // add the target field to each touch.
      return {
        identifier: touchArg.identifier,
        screenX: touchArg.screenX,
        screenY: touchArg.screenY,
        clientX: touchArg.clientX,
        clientY: touchArg.clientY,
        pageX: touchArg.pageX,
        pageY: touchArg.pageY,
        target: target
      };
    });
    touches.item = function (i) {
      return touches[i];
    };
    return touches;
  }

  function createTouchEventTouchList(touchListArgs) {
    /** @type {!Array<!Touch>} */
    var touches = goog.array.map(touchListArgs, function (touchArg) {
      return new Touch({
        identifier: touchArg.identifier,
        screenX: touchArg.screenX,
        screenY: touchArg.screenY,
        clientX: touchArg.clientX,
        clientY: touchArg.clientY,
        pageX: touchArg.pageX,
        pageY: touchArg.pageY,
        target: target
      });
    });
    return touches;
  }

  function createTouchList(touchStrategy, touches) {
    switch (touchStrategy) {
      case bot.events.TouchEventStrategy_.MOUSE_EVENTS:
        return createGenericTouchList(touches);
      case bot.events.TouchEventStrategy_.INIT_TOUCH_EVENT:
        return createNativeTouchList(touches);
      case bot.events.TouchEventStrategy_.TOUCH_EVENT_CTOR:
        return createTouchEventTouchList(touches);
    }
    return null;
  }

  // TODO(juangj): Always use the TouchEvent constructor, if available.
  var strategy;
  if (bot.events.BROKEN_TOUCH_API_) {
    strategy = bot.events.TouchEventStrategy_.MOUSE_EVENTS;
  } else {
    if (TouchEvent.prototype.initTouchEvent) {
      strategy = bot.events.TouchEventStrategy_.INIT_TOUCH_EVENT;
    } else if (TouchEvent && TouchEvent.length > 0) {
      strategy = bot.events.TouchEventStrategy_.TOUCH_EVENT_CTOR;
    } else {
      throw new bot.Error(
        bot.ErrorCode.UNSUPPORTED_OPERATION,
        'Not able to create touch events in this browser');
    }
  }

  // As a performance optimization, reuse the created touchlist when the lists
  // are the same, which is often the case in practice.
  var changedTouches = createTouchList(strategy, args.changedTouches);
  var touches = (args.touches == args.changedTouches) ?
    changedTouches : createTouchList(strategy, args.touches);
  var targetTouches = (args.targetTouches == args.changedTouches) ?
    changedTouches : createTouchList(strategy, args.targetTouches);

  var event;
  if (strategy == bot.events.TouchEventStrategy_.MOUSE_EVENTS) {
    event = doc.createEvent('MouseEvents');
    event.initMouseEvent(this.type_, this.bubbles_, this.cancelable_, view,
        /*detail*/ 1, /*screenX*/ 0, /*screenY*/ 0, args.clientX, args.clientY,
      args.ctrlKey, args.altKey, args.shiftKey, args.metaKey, /*button*/ 0,
      args.relatedTarget);
    event.touches = touches;
    event.targetTouches = targetTouches;
    event.changedTouches = changedTouches;
    event.scale = args.scale;
    event.rotation = args.rotation;
  } else if (strategy == bot.events.TouchEventStrategy_.INIT_TOUCH_EVENT) {
    event = doc.createEvent('TouchEvent');
    // Different browsers have different implementations of initTouchEvent.
    if (event.initTouchEvent.length == 0) {
      // Chrome/Android.
      event.initTouchEvent(touches, targetTouches, changedTouches,
        this.type_, view, /*screenX*/ 0, /*screenY*/ 0, args.clientX,
        args.clientY, args.ctrlKey, args.altKey, args.shiftKey, args.metaKey);
    } else {
      // iOS.
      event.initTouchEvent(this.type_, this.bubbles_, this.cancelable_, view,
          /*detail*/ 1, /*screenX*/ 0, /*screenY*/ 0, args.clientX,
        args.clientY, args.ctrlKey, args.altKey, args.shiftKey, args.metaKey,
        touches, targetTouches, changedTouches, args.scale, args.rotation);
    }
    event.relatedTarget = args.relatedTarget;
  } else if (strategy == bot.events.TouchEventStrategy_.TOUCH_EVENT_CTOR) {
    var touchProperties = /** @type {!TouchEventInit} */ ({
      touches: touches,
      targetTouches: targetTouches,
      changedTouches: changedTouches,
      bubbles: this.bubbles_,
      cancelable: this.cancelable_,
      ctrlKey: args.ctrlKey,
      shiftKey: args.shiftKey,
      altKey: args.altKey,
      metaKey: args.metaKey
    });
    event = new TouchEvent(this.type_, touchProperties);
  } else {
    throw new bot.Error(
      bot.ErrorCode.UNSUPPORTED_OPERATION,
      'Illegal TouchEventStrategy_ value (this is a bug)');
  }

  return event;
};



/**
 * Factory for MSGesture event objects of a specific type.
 *
 * @constructor
 * @param {string} type Type of the created events.
 * @param {boolean} bubbles Whether the created events bubble.
 * @param {boolean} cancelable Whether the created events are cancelable.
 * @extends {bot.events.EventFactory_}
 * @private
 */
bot.events.MSGestureEventFactory_ = function (type, bubbles, cancelable) {
  goog.base(this, type, bubbles, cancelable);
};
goog.inherits(bot.events.MSGestureEventFactory_, bot.events.EventFactory_);


/**
 * @override
 */
bot.events.MSGestureEventFactory_.prototype.create = function (target,
  opt_args) {
  if (!bot.events.SUPPORTS_MSPOINTER_EVENTS) {
    throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION,
      'Browser does not support MSGesture events.');
  }

  var args = /** @type {!bot.events.MSGestureArgs} */ (opt_args);
  var doc = goog.dom.getOwnerDocument(target);
  var view = goog.dom.getWindow(doc);
  var event = doc.createEvent('MSGestureEvent');
  var timestamp = (new Date).getTime();

  // See http://msdn.microsoft.com/en-us/library/windows/apps/hh441187.aspx
  event.initGestureEvent(this.type_, this.bubbles_, this.cancelable_, view,
                         /*detail*/ 1, /*screenX*/ 0, /*screenY*/ 0,
    args.clientX, args.clientY, /*offsetX*/ 0,
                         /*offsetY*/ 0, args.translationX, args.translationY,
    args.scale, args.expansion, args.rotation,
    args.velocityX, args.velocityY, args.velocityExpansion,
    args.velocityAngular, timestamp, args.relatedTarget);
  return event;
};



/**
 * Factory for MSPointer event objects of a specific type.
 *
 * @constructor
 * @param {string} type Type of the created events.
 * @param {boolean} bubbles Whether the created events bubble.
 * @param {boolean} cancelable Whether the created events are cancelable.
 * @extends {bot.events.EventFactory_}
 * @private
 */
bot.events.MSPointerEventFactory_ = function (type, bubbles, cancelable) {
  goog.base(this, type, bubbles, cancelable);
};
goog.inherits(bot.events.MSPointerEventFactory_, bot.events.EventFactory_);


/**
 * @override
 * @suppress {checkTypes} Closure compiler externs don't know about pointer
 *     events
 */
bot.events.MSPointerEventFactory_.prototype.create = function (target,
  opt_args) {
  if (!bot.events.SUPPORTS_MSPOINTER_EVENTS) {
    throw new bot.Error(bot.ErrorCode.UNSUPPORTED_OPERATION,
      'Browser does not support MSPointer events.');
  }

  var args = /** @type {!bot.events.MSPointerArgs} */ (opt_args);
  var doc = goog.dom.getOwnerDocument(target);
  var view = goog.dom.getWindow(doc);
  var event = doc.createEvent('MSPointerEvent');

  // See http://msdn.microsoft.com/en-us/library/ie/hh772109(v=vs.85).aspx
  event.initPointerEvent(this.type_, this.bubbles_, this.cancelable_, view,
                         /*detail*/ 0, /*screenX*/ 0, /*screenY*/ 0,
    args.clientX, args.clientY, args.ctrlKey, args.altKey,
    args.shiftKey, args.metaKey, args.button,
    args.relatedTarget, /*offsetX*/ 0, /*offsetY*/ 0,
    args.width, args.height, args.pressure, args.rotation,
    args.tiltX, args.tiltY, args.pointerId,
    args.pointerType, /*hwTimeStamp*/ 0, args.isPrimary);

  return event;
};


/**
 * The types of events this modules supports firing.
 *
 * <p>To see which events bubble and are cancelable, see:
 * http://en.wikipedia.org/wiki/DOM_events and
 * http://www.w3.org/Submission/pointer-events/#pointer-event-types
 *
 * @enum {!bot.events.EventFactory_}
 */
bot.events.EventType = {
  BLUR: new bot.events.EventFactory_('blur', false, false),
  CHANGE: new bot.events.EventFactory_('change', true, false),
  FOCUS: new bot.events.EventFactory_('focus', false, false),
  FOCUSIN: new bot.events.EventFactory_('focusin', true, false),
  FOCUSOUT: new bot.events.EventFactory_('focusout', true, false),
  INPUT: new bot.events.EventFactory_('input', true, false),
  ORIENTATIONCHANGE: new bot.events.EventFactory_(
    'orientationchange', false, false),
  PROPERTYCHANGE: new bot.events.EventFactory_('propertychange', false, false),
  SELECT: new bot.events.EventFactory_('select', true, false),
  SUBMIT: new bot.events.EventFactory_('submit', true, true),
  TEXTINPUT: new bot.events.EventFactory_('textInput', true, true),

  // Mouse events.
  CLICK: new bot.events.MouseEventFactory_('click', true, true),
  CONTEXTMENU: new bot.events.MouseEventFactory_('contextmenu', true, true),
  DBLCLICK: new bot.events.MouseEventFactory_('dblclick', true, true),
  MOUSEDOWN: new bot.events.MouseEventFactory_('mousedown', true, true),
  MOUSEMOVE: new bot.events.MouseEventFactory_('mousemove', true, false),
  MOUSEOUT: new bot.events.MouseEventFactory_('mouseout', true, true),
  MOUSEOVER: new bot.events.MouseEventFactory_('mouseover', true, true),
  MOUSEUP: new bot.events.MouseEventFactory_('mouseup', true, true),
  MOUSEWHEEL: new bot.events.MouseEventFactory_(
    goog.userAgent.GECKO ? 'DOMMouseScroll' : 'mousewheel', true, true),
  MOUSEPIXELSCROLL: new bot.events.MouseEventFactory_(
    'MozMousePixelScroll', true, true),

  // Keyboard events.
  KEYDOWN: new bot.events.KeyboardEventFactory_('keydown', true, true),
  KEYPRESS: new bot.events.KeyboardEventFactory_('keypress', true, true),
  KEYUP: new bot.events.KeyboardEventFactory_('keyup', true, true),

  // Touch events.
  TOUCHEND: new bot.events.TouchEventFactory_('touchend', true, true),
  TOUCHMOVE: new bot.events.TouchEventFactory_('touchmove', true, true),
  TOUCHSTART: new bot.events.TouchEventFactory_('touchstart', true, true),

  // MSGesture events
  MSGESTURECHANGE: new bot.events.MSGestureEventFactory_(
    'MSGestureChange', true, true),
  MSGESTUREEND: new bot.events.MSGestureEventFactory_(
    'MSGestureEnd', true, true),
  MSGESTUREHOLD: new bot.events.MSGestureEventFactory_(
    'MSGestureHold', true, true),
  MSGESTURESTART: new bot.events.MSGestureEventFactory_(
    'MSGestureStart', true, true),
  MSGESTURETAP: new bot.events.MSGestureEventFactory_(
    'MSGestureTap', true, true),
  MSINERTIASTART: new bot.events.MSGestureEventFactory_(
    'MSInertiaStart', true, true),

  // MSPointer events
  MSGOTPOINTERCAPTURE: new bot.events.MSPointerEventFactory_(
    'MSGotPointerCapture', true, false),
  MSLOSTPOINTERCAPTURE: new bot.events.MSPointerEventFactory_(
    'MSLostPointerCapture', true, false),
  MSPOINTERCANCEL: new bot.events.MSPointerEventFactory_(
    'MSPointerCancel', true, true),
  MSPOINTERDOWN: new bot.events.MSPointerEventFactory_(
    'MSPointerDown', true, true),
  MSPOINTERMOVE: new bot.events.MSPointerEventFactory_(
    'MSPointerMove', true, true),
  MSPOINTEROVER: new bot.events.MSPointerEventFactory_(
    'MSPointerOver', true, true),
  MSPOINTEROUT: new bot.events.MSPointerEventFactory_(
    'MSPointerOut', true, true),
  MSPOINTERUP: new bot.events.MSPointerEventFactory_(
    'MSPointerUp', true, true)
};


/**
 * Fire a named event on a particular element.
 *
 * @param {!Element|!Window} target The element on which to fire the event.
 * @param {!bot.events.EventType} type Event type.
 * @param {bot.events.EventArgs=} opt_args Arguments to initialize the event.
 * @return {boolean} Whether the event fired successfully or was cancelled.
 */
bot.events.fire = function (target, type, opt_args) {
  var factory = /** @type {!bot.events.EventFactory_} */ (type);
  var event = factory.create(target, opt_args);

  // Ensure the event's isTrusted property is set to false, so that
  // bot.events.isSynthetic() can identify synthetic events from native ones.
  if (!('isTrusted' in event)) {
    event['isTrusted'] = false;
  }
  return target.dispatchEvent(event);
};


/**
 * Returns whether the event was synthetically created by the atoms;
 * if false, was created by the browser in response to a live user action.
 *
 * @param {!(Event|goog.events.BrowserEvent)} event An event.
 * @return {boolean} Whether the event was synthetically created.
 */
bot.events.isSynthetic = function (event) {
  var e = event.getBrowserEvent ? event.getBrowserEvent() : event;
  return 'isTrusted' in e ? !e['isTrusted'] : false;
};
