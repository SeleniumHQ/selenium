// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Functions to do with firing and simulating events.
 *
 */


goog.provide('bot.events');

goog.require('bot');
goog.require('bot.dom');
goog.require('bot.userAgent');
goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.userAgent');


/**
 * Enumeration of mouse buttons that can be pressed.
 *
 * @enum {number}
 */
bot.events.Button = {
  NONE: null,  // So that we can move a mouse without a button being down
  LEFT: (goog.userAgent.IE ? 1 : 0),
  MIDDLE: (goog.userAgent.IE ? 4 : 1),
  RIGHT: (goog.userAgent.IE ? 2 : 2)
};


/**
 * The related target field is only useful for mouseover, mouseout, dragenter
 * and dragexit events. We use this array to see if the relatedTarget field
 * needs to be assigned a value.
 *
 * https://developer.mozilla.org/en/DOM/event.relatedTarget
 * @private
 * @const
 */
bot.events.RELATED_TARGET_EVENTS_ = [
  goog.events.EventType.DRAGSTART,
  'dragexit', /** goog.events.EventType.DRAGEXIT, */
  goog.events.EventType.MOUSEOVER,
  goog.events.EventType.MOUSEOUT
];


/**
 * @typedef {{x: (number|undefined),
 *            y: (number|undefined),
 *            button: (bot.events.Button|undefined),
 *            bubble: (boolean|undefined),
 *            alt: (boolean|undefined),
 *            control: (boolean|undefined),
 *            shift: (boolean|undefined),
 *            meta: (boolean|undefined),
 *            related: (Element|undefined)}}
 */
bot.events.MouseArgs;


/**
 * Initialize a new mouse event. The opt_args can be used to pass in extra
 * parameters that might be needed, though the function attempts to guess some
 * valid default values. Extra arguments are specified as properties of the
 * object passed in as "opt_args" and can be:
 *
 * <dl>
 * <dt>x</dt>
 * <dd>The x value relative to the client viewport.</dd>
 * <dt>y</dt>
 * <dd>The y value relative to the client viewport.</dd>
 * <dt>button</dt>
 * <dd>The mouse button (from {@code bot.events.button}). Defaults to LEFT</dd>
 * <dt>bubble</dt>
 * <dd>Can the event bubble? Defaults to true</dd>
 * <dt>alt</dt>
 * <dd>Is the "Alt" key pressed. Defaults to false</dd>
 * <dt>control</dt>
 * <dd>Is the "Alt" key pressed. Defaults to false</dd>
 * <dt>shift</dt>
 * <dd>Is the "Alt" key pressed. Defaults to false</dd>
 * <dt>meta</dt>
 * <dd>Is the "Alt" key pressed. Defaults to false</dd>
 * <dt>related</dt>
 * <dd>The related target. Defaults to null</dd>
 * </dl>
 *
 * @param {!Element} element The element on which the event will be fired.
 * @param {!goog.events.EventType} type One of the goog.events.EventType values.
 * @param {!bot.events.MouseArgs=} opt_args See above.
 * @return {!Event} An initialized mouse event, with fields populated from
 *   opt_args.
 * @private
 */
bot.events.newMouseEvent_ = function(element, type, opt_args) {
  var doc = goog.dom.getOwnerDocument(element);
  var win = goog.dom.getWindow(doc);
  var pos = goog.style.getClientPosition(element);

  var args = opt_args || {};
  // Use string indexes so we can be compiled aggressively
  var x = (args['x'] || 0) + pos.x;
  var y = (args['y'] || 0) + pos.y;
  var button = args['button'] || bot.events.Button.LEFT;
  var canBubble = args['bubble'] || true;
  // Only useful for mouseover, mouseout, dragenter and dragexit
  // https://developer.mozilla.org/en/DOM/event.relatedTarget
  var relatedTarget = null;
  if (goog.array.contains(bot.events.RELATED_TARGET_EVENTS_, type)) {
    relatedTarget = args['related'] || null;
  }
  var alt = !!args['alt'];
  var control = !!args['control'];
  var shift = !!args['shift'];
  var meta = !!args['meta'];

  var event;
  // IE path first
  if (element['fireEvent'] && doc && doc['createEventObject']) {
    event = doc.createEventObject();
    event.altKey = alt;
    event.controlKey = control;
    event.metaKey = meta;
    event.shiftKey = shift;

    // NOTE: ie8 does a strange thing with the coordinates passed in the event:
    // - if offset{X,Y} coordinates are specified, they are also used for
    //   client{X,Y}, event if client{X,Y} are also specified.
    // - if only client{X,Y} are specified, they are also used for offset{x,y}
    // Thus, for ie8, it is impossible to set both offset and client
    // and have them be correct when they come out on the other side.
    event.clientX = x;
    event.clientY = y;
    event.button = button;
    event.relatedTarget = relatedTarget;
  } else {
    event = doc.createEvent('MouseEvents');

    if (event['initMouseEvent']) {
      // see http://developer.mozilla.org/en/docs/DOM:event.button and
      // http://developer.mozilla.org/en/docs/DOM:event.initMouseEvent
      // for button ternary logic logic.

      // screenX=0 and screenY=0 are ignored
      event.initMouseEvent(type, canBubble, true, win, 1, 0, 0, x, y,
          control, alt, shift, meta, button, relatedTarget);
    } else {
      // You're in a strange and bad place here.

      event.initEvent(type, canBubble, true);

      event.shiftKey = shift;
      event.metaKey = meta;
      event.altKey = alt;
      event.ctrlKey = control;
      event.button = button;
    }
  }

  return event;
};


/**
 * Data structure representing keyboard event arguments that may be
 * passed to the fire function.
 *
 * @typedef {{keyCode: (number|undefined),
 *            charCode: (number|undefined),
 *            alt: (boolean|undefined),
 *            ctrl: (boolean|undefined),
 *            shift: (boolean|undefined),
 *            meta: (boolean|undefined)}}
 */
bot.events.KeyboardArgs;


/**
 * Initialize a new keyboard event.
 *
 * @param {!Element} element The element on which the event will be fired.
 * @param {!goog.events.EventType} type The type of keyboard event being sent,
 *   should be KEYPRESS, KEYDOWN, or KEYUP.
 * @param {!bot.events.KeyboardArgs=} opt_args See above.
 * @return {!Event} An initialized keyboard event, with fields populated from
 *   opt_args.
 * @private
 */
bot.events.newKeyEvent_ = function(element, type, opt_args) {
  var doc = goog.dom.getOwnerDocument(element);
  var win = goog.dom.getWindow(doc);

  var args = opt_args || {};
  var keyCode = args['keyCode'] || 0;
  var charCode = args['charCode'] || 0;
  var alt = !!args['alt'];
  var control = !!args['ctrl'];
  var shift = !!args['shift'];
  var meta = !!args['meta'];

  var event;
  if (goog.userAgent.GECKO) {
    event = doc.createEvent('KeyboardEvent');
    event.initKeyEvent(type,
                       /* bubbles= */ true,
                       /* cancelable= */true,
                       /* view= */ win,
                       control,
                       alt,
                       shift,
                       meta,
                       keyCode,
                       charCode);
  } else if (goog.userAgent.IE) {
    event = doc.createEventObject();
    event.keyCode = keyCode;
    event.altKey = alt;
    event.ctrlKey = control;
    event.metaKey = meta;
    event.shiftKey = shift;
  } else { // For both WebKit and Opera.
    event = doc.createEvent('Events');
    event.initEvent(type, true, true);
    event.charCode = charCode;
    event.keyCode = keyCode;
    event.altKey = alt;
    event.ctrlKey = control;
    event.metaKey = meta;
    event.shiftKey = shift;
  }

  return event;
};


/**
 * Data structure representing arguments that may be passed to the fire
 * function.
 *
 * @typedef {{bubble: (boolean|undefined),
 *            alt: (boolean|undefined),
 *            control: (boolean|undefined),
 *            shift: (boolean|undefined),
 *            meta: (boolean|undefined)}}
 */
bot.events.HtmlArgs;


/**
 * Initialize a new HTML event. The opt_args can be used to pass in extra
 * parameters that might be needed, though the function attempts to guess some
 * valid default values. Extra arguments are specified as properties of the
 * object passed in as "opt_args" and can be:
 *
 * <dl>
 * <dt>bubble</dt>
 * <dd>Can the event bubble? Defaults to true</dd>
 * <dt>alt</dt>
 * <dd>Is the "Alt" key pressed. Defaults to false</dd>
 * <dt>control</dt>
 * <dd>Is the "Alt" key pressed. Defaults to false</dd>
 * <dt>shift</dt>
 * <dd>Is the "Alt" key pressed. Defaults to false</dd>
 * <dt>meta</dt>
 * <dd>Is the "Alt" key pressed. Defaults to false</dd>
 * </dl>
 *
 * @param {!Element} element The element on which the event will be fired.
 * @param {!goog.events.EventType} type One of the goog.events.EventType values.
 * @param {!bot.events.HtmlArgs=} opt_args See above.
 * @return {!Event} An initialized event object, with fields populated from
 *   opt_args.
 * @private
 */
bot.events.newHtmlEvent_ = function(element, type, opt_args) {
  var doc = goog.dom.getOwnerDocument(element);
  var win = goog.dom.getWindow(doc);

  var args = opt_args || {};
  var canBubble = args['bubble'] !== false;
  var alt = !!args['alt'];
  var control = !!args['control'];
  var shift = !!args['shift'];
  var meta = !!args['meta'];

  var event;
  if (element['fireEvent'] && doc && doc['createEventObject']) {
    event = doc.createEventObject();
    event.altKey = alt;
    event.ctrl = control;
    event.metaKey = meta;
    event.shiftKey = shift;
  } else {
    event = doc.createEvent('HTMLEvents');
    event.initEvent(type, canBubble, true);
    event.shiftKey = shift;
    event.metaKey = meta;
    event.altKey = alt;
    event.ctrlKey = control;
  }

  return event;
};


/**
 * Maps symbolic names to functions used to initialize the event.
 *
 * @type {!Object.<goog.events.EventType,
 *        function(!Element, !goog.events.EventType, ...): !Event>}
 * @private
 * @const
 */
bot.events.INIT_FUNCTIONS_ = {};
bot.events.INIT_FUNCTIONS_[goog.events.EventType.CLICK] =
    bot.events.newMouseEvent_;
bot.events.INIT_FUNCTIONS_[goog.events.EventType.KEYDOWN] =
    bot.events.newKeyEvent_;
bot.events.INIT_FUNCTIONS_[goog.events.EventType.KEYPRESS] =
    bot.events.newKeyEvent_;
bot.events.INIT_FUNCTIONS_[goog.events.EventType.KEYUP] =
    bot.events.newKeyEvent_;
bot.events.INIT_FUNCTIONS_[goog.events.EventType.MOUSEDOWN] =
    bot.events.newMouseEvent_;
bot.events.INIT_FUNCTIONS_[goog.events.EventType.MOUSEMOVE] =
    bot.events.newMouseEvent_;
bot.events.INIT_FUNCTIONS_[goog.events.EventType.MOUSEOUT] =
    bot.events.newMouseEvent_;
bot.events.INIT_FUNCTIONS_[goog.events.EventType.MOUSEOVER] =
    bot.events.newMouseEvent_;
bot.events.INIT_FUNCTIONS_[goog.events.EventType.MOUSEUP] =
    bot.events.newMouseEvent_;


/**
 * Dispatch the event in a browser-safe way.
 *
 * @param {!Element} target The element on which this event will fire.
 * @param {!goog.events.EventType} type The type of event to fire.
 * @param {!Object} event The initialized event.
 * @return {boolean} Whether the event fired successfully or was cancelled.
 * @private
 */
bot.events.dispatchEvent_ = function(target, type, event) {
  // Amusingly, fireEvent is native code on IE 7-, so we can't just use
  // goog.isFunction
  if (goog.isFunction(target['fireEvent']) ||
      goog.isObject(target['fireEvent'])) {
    // when we go this route, window.event is never set to contain the
    // event we have just created.  ideally we could just slide it in
    // as follows in the try-block below, but this normally doesn't
    // work.  This is why I try to avoid this code path, which is only
    // required if we need to set attributes on the event (e.g.,
    // clientX).
    try {
      var doc = goog.dom.getOwnerDocument(target);
      var win = goog.dom.getWindow(doc);

      win.event = event;
    } catch (e) {
      // work around for http://jira.openqa.org/browse/SEL-280 -- make
      // the event available somewhere:
    }
    return target.fireEvent('on' + type, event);
  } else {
    return target.dispatchEvent((/**@type {Event} */event));
  }
};


/**
 * Fire a named event on a particular element.
 *
 * @param {!Element} target The element on which to fire the event.
 * @param {!goog.events.EventType} type The type of event.
 * @param {!(bot.events.MouseArgs|bot.events.HtmlArgs|
 *           bot.events.KeyboardArgs)=} opt_args Arguments, used to initialize
 *     the event.
 * @return {boolean} Whether the event fired successfully or was cancelled.
 */
bot.events.fire = function(target, type, opt_args) {
  var init = bot.events.INIT_FUNCTIONS_[type] || bot.events.newHtmlEvent_;

  var event = init(target, type, opt_args);

  return bot.events.dispatchEvent_(target, type, event);
};

bot.events.areSynthesisedEventsTrusted = function() {
  return !goog.userAgent.IE &&
      (goog.userAgent.GECKO &&
       bot.isFirefoxExtension() && bot.userAgent.isVersion(4));
};

bot.events.synthesisedEventsCanOpenJavascriptWindows = function() {
  return goog.userAgent.GECKO && bot.isFirefoxExtension();
};
