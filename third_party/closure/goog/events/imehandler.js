// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Input Method Editors (IMEs) are OS-level widgets that make
 * it easier to type non-ascii characters on ascii keyboards (in particular,
 * characters that require more than one keystroke).
 *
 * When the user wants to type such a character, a modal menu pops up and
 * suggests possible "next" characters in the IME character sequence. After
 * typing N characters, the user hits "enter" to commit the IME to the field.
 * N differs from language to language.
 *
 * This class offers high-level events for how the user is interacting with the
 * IME in editable regions.
 *
 * Known Issues:
 *
 * Firefox always fires an extra pair of compositionstart/compositionend events.
 * We do not normalize for this.
 *
 * Opera does not fire any IME events.
 *
 * Spurious UPDATE events are common on all browsers.
 *
 * We currently do a bad job detecting when the IME closes on IE, and
 * make a "best effort" guess on when we know it's closed.
 *
 */

goog.provide('goog.events.ImeHandler');
goog.provide('goog.events.ImeHandler.Event');
goog.provide('goog.events.ImeHandler.EventType');

goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');



/**
 * Dispatches high-level events for IMEs.
 * @param {Element} el The element to listen on.
 * @extends {goog.events.EventTarget}
 * @constructor
 * @final
 */
goog.events.ImeHandler = function(el) {
  goog.events.ImeHandler.base(this, 'constructor');

  /**
   * The element to listen on.
   * @type {Element}
   * @private
   */
  this.el_ = el;

  /**
   * Tracks the keyup event only, because it has a different life-cycle from
   * other events.
   * @type {goog.events.EventHandler.<!goog.events.ImeHandler>}
   * @private
   */
  this.keyUpHandler_ = new goog.events.EventHandler(this);

  /**
   * Tracks all the browser events.
   * @type {goog.events.EventHandler.<!goog.events.ImeHandler>}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);

  if (goog.events.ImeHandler.USES_COMPOSITION_EVENTS) {
    this.handler_.
        listen(el, 'compositionstart', this.handleCompositionStart_).
        listen(el, 'compositionend', this.handleCompositionEnd_).
        listen(el, 'compositionupdate', this.handleTextModifyingInput_);
  }

  this.handler_.
      listen(el, 'textInput', this.handleTextInput_).
      listen(el, 'text', this.handleTextModifyingInput_).
      listen(el, goog.events.EventType.KEYDOWN, this.handleKeyDown_);
};
goog.inherits(goog.events.ImeHandler, goog.events.EventTarget);


/**
 * Event types fired by ImeHandler. These events do not make any guarantees
 * about whether they were fired before or after the event in question.
 * @enum {string}
 */
goog.events.ImeHandler.EventType = {
  // After the IME opens.
  START: 'startIme',

  // An update to the state of the IME. An 'update' does not necessarily mean
  // that the text contents of the field were modified in any way.
  UPDATE: 'updateIme',

  // After the IME closes.
  END: 'endIme'
};



/**
 * An event fired by ImeHandler.
 * @param {goog.events.ImeHandler.EventType} type The type.
 * @param {goog.events.BrowserEvent} reason The trigger for this event.
 * @constructor
 * @extends {goog.events.Event}
 * @final
 */
goog.events.ImeHandler.Event = function(type, reason) {
  goog.events.ImeHandler.Event.base(this, 'constructor', type);

  /**
   * The event that triggered this.
   * @type {goog.events.BrowserEvent}
   */
  this.reason = reason;
};
goog.inherits(goog.events.ImeHandler.Event, goog.events.Event);


/**
 * Whether to use the composition events.
 * @type {boolean}
 */
goog.events.ImeHandler.USES_COMPOSITION_EVENTS =
    goog.userAgent.GECKO ||
    (goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher(532));


/**
 * Stores whether IME mode is active.
 * @type {boolean}
 * @private
 */
goog.events.ImeHandler.prototype.imeMode_ = false;


/**
 * The keyCode value of the last keyDown event. This value is used for
 * identiying whether or not a textInput event is sent by an IME.
 * @type {number}
 * @private
 */
goog.events.ImeHandler.prototype.lastKeyCode_ = 0;


/**
 * @return {boolean} Whether an IME is active.
 */
goog.events.ImeHandler.prototype.isImeMode = function() {
  return this.imeMode_;
};


/**
 * Handles the compositionstart event.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.handleCompositionStart_ =
    function(e) {
  this.handleImeActivate_(e);
};


/**
 * Handles the compositionend event.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.handleCompositionEnd_ = function(e) {
  this.handleImeDeactivate_(e);
};


/**
 * Handles the compositionupdate and text events.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.handleTextModifyingInput_ =
    function(e) {
  if (this.isImeMode()) {
    this.processImeComposition_(e);
  }
};


/**
 * Handles IME activation.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.handleImeActivate_ = function(e) {
  if (this.imeMode_) {
    return;
  }

  // Listens for keyup events to handle unexpected IME keydown events on older
  // versions of webkit.
  //
  // In those versions, we currently use textInput events deactivate IME
  // (see handleTextInput_() for the reason). However,
  // Safari fires a keydown event (as a result of pressing keys to commit IME
  // text) with keyCode == WIN_IME after textInput event. This activates IME
  // mode again unnecessarily. To prevent this problem, listens keyup events
  // which can use to determine whether IME text has been committed.
  if (goog.userAgent.WEBKIT &&
      !goog.events.ImeHandler.USES_COMPOSITION_EVENTS) {
    this.keyUpHandler_.listen(this.el_,
        goog.events.EventType.KEYUP, this.handleKeyUpSafari4_);
  }

  this.imeMode_ = true;
  this.dispatchEvent(
      new goog.events.ImeHandler.Event(
          goog.events.ImeHandler.EventType.START, e));
};


/**
 * Handles the IME compose changes.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.processImeComposition_ = function(e) {
  this.dispatchEvent(
      new goog.events.ImeHandler.Event(
          goog.events.ImeHandler.EventType.UPDATE, e));
};


/**
 * Handles IME deactivation.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.handleImeDeactivate_ = function(e) {
  this.imeMode_ = false;
  this.keyUpHandler_.removeAll();
  this.dispatchEvent(
      new goog.events.ImeHandler.Event(
          goog.events.ImeHandler.EventType.END, e));
};


/**
 * Handles a key down event.
 * @param {!goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.handleKeyDown_ = function(e) {
  // Firefox and Chrome have a separate event for IME composition ('text'
  // and 'compositionupdate', respectively), other browsers do not.
  if (!goog.events.ImeHandler.USES_COMPOSITION_EVENTS) {
    var imeMode = this.isImeMode();
    // If we're in IE and we detect an IME input on keyDown then activate
    // the IME, otherwise if the imeMode was previously active, deactivate.
    if (!imeMode && e.keyCode == goog.events.KeyCodes.WIN_IME) {
      this.handleImeActivate_(e);
    } else if (imeMode && e.keyCode != goog.events.KeyCodes.WIN_IME) {
      if (goog.events.ImeHandler.isImeDeactivateKeyEvent_(e)) {
        this.handleImeDeactivate_(e);
      }
    } else if (imeMode) {
      this.processImeComposition_(e);
    }
  }

  // Safari on Mac doesn't send IME events in the right order so that we must
  // ignore some modifier key events to insert IME text correctly.
  if (goog.events.ImeHandler.isImeDeactivateKeyEvent_(e)) {
    this.lastKeyCode_ = e.keyCode;
  }
};


/**
 * Handles a textInput event.
 * @param {!goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.handleTextInput_ = function(e) {
  // Some WebKit-based browsers including Safari 4 don't send composition
  // events. So, we turn down IME mode when it's still there.
  if (!goog.events.ImeHandler.USES_COMPOSITION_EVENTS &&
      goog.userAgent.WEBKIT &&
      this.lastKeyCode_ == goog.events.KeyCodes.WIN_IME &&
      this.isImeMode()) {
    this.handleImeDeactivate_(e);
  }
};


/**
 * Handles the key up event for any IME activity. This handler is just used to
 * prevent activating IME unnecessary in Safari at this time.
 * @param {!goog.events.BrowserEvent} e The event.
 * @private
 */
goog.events.ImeHandler.prototype.handleKeyUpSafari4_ = function(e) {
  if (this.isImeMode()) {
    switch (e.keyCode) {
      // These keyup events indicates that IME text has been committed or
      // cancelled. We should turn off IME mode when these keyup events
      // received.
      case goog.events.KeyCodes.ENTER:
      case goog.events.KeyCodes.TAB:
      case goog.events.KeyCodes.ESC:
        this.handleImeDeactivate_(e);
        break;
    }
  }
};


/**
 * Returns whether the given event should be treated as an IME
 * deactivation trigger.
 * @param {!goog.events.Event} e The event.
 * @return {boolean} Whether the given event is an IME deactivate trigger.
 * @private
 */
goog.events.ImeHandler.isImeDeactivateKeyEvent_ = function(e) {
  // Which key events involve IME deactivation depends on the user's
  // environment (i.e. browsers, platforms, and IMEs). Usually Shift key
  // and Ctrl key does not involve IME deactivation, so we currently assume
  // that these keys are not IME deactivation trigger.
  switch (e.keyCode) {
    case goog.events.KeyCodes.SHIFT:
    case goog.events.KeyCodes.CTRL:
      return false;
    default:
      return true;
  }
};


/** @override */
goog.events.ImeHandler.prototype.disposeInternal = function() {
  this.handler_.dispose();
  this.keyUpHandler_.dispose();
  this.el_ = null;
  goog.events.ImeHandler.base(this, 'disposeInternal');
};
