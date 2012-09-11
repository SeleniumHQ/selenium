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
 * @fileoverview Class for managing the interactions between an
 * auto-complete object and a text-input or textarea.
 *
 * IME note:
 *
 * We used to suspend autocomplete while there are IME preedit characters, but
 * now for parity with Search we do not. We still detect the beginning and end
 * of IME entry because we need to listen to more events while an IME commit is
 * happening, but we update continuously as the user types.
 *
 * IMEs vary across operating systems, browsers, and even input languages. This
 * class tries to handle IME for:
 * - Windows x {FF3, IE7, Chrome} x MS IME 2002 (Japanese)
 * - Mac     x {FF3, Safari3}     x Kotoeri (Japanese)
 * - Linux   x {FF3}              x UIM + Anthy (Japanese)
 *
 * TODO(user): We cannot handle {Mac, Linux} x FF3 correctly.
 * TODO(user): We need to support Windows x Google IME.
 *
 * This class was tested with hiragana input. The event sequence when inputting
 * 'ai<enter>' with IME on (which commits two characters) is as follows:
 *
 * Notation: [key down code, key press, key up code]
 *           key code or +: event fired
 *           -: event not fired
 *
 * - Win/FF3: [WIN_IME, +, A], [-, -, ENTER]
 *            Note: No events are fired for 'i'.
 *
 * - Win/IE7: [WIN_IME, -, A], [WIN_IME, -, I], [WIN_IME, -, ENTER]
 *
 * - Win/Chrome: Same as Win/IE7
 *
 * - Mac/FF3: [A, -, A], [I, -, I], [ENTER, -, ENTER]
 *
 * - Mac/Safari3: Same as Win/IE7
 *
 * - Linux/FF3: No events are generated.
 *
 * With IME off,
 *
 * - ALL: [A, +, A], [I, +, I], [ENTER, +, ENTER]
 *        Note: Key code of key press event varies across configuration.
 *
 * With Microsoft Pinyin IME 3.0 (Simplified Chinese),
 *
 * - Win/IE7: Same as Win/IE7 with MS IME 2002 (Japanese)
 *
 *   The issue with this IME is that the key sequence that ends preedit is not
 *   a single ENTER key up.
 *   - ENTER key up following either ENTER or SPACE ends preedit.
 *   - SPACE key up following even number of LEFT, RIGHT, or SPACE (any
 *     combination) ends preedit.
 *   TODO(user): We only support SPACE-then-ENTER sequence.
 *   TODO(mpd): With the change to autocomplete during IME, this might not be an
 *   issue. Remove this comment once tested.
 *
 * With Microsoft Korean IME 2002,
 *
 * - Win/IE7: Same as Win/IE7 with MS IME 2002 (Japanese), but there is no
 *   sequence that ends the preedit.
 *
 * The following is the algorithm we use to detect IME preedit:
 *
 * - WIN_IME key down starts predit.
 * - (1) ENTER key up or (2) CTRL-M key up ends preedit.
 * - Any key press not immediately following WIN_IME key down signifies that
 *   preedit has ended.
 *
 * If you need to change this algorithm, please note the OS, browser, language,
 * and behavior above so that we can avoid regressions. Contact mpd or yuzo
 * if you have questions or concerns.
 *
 */


goog.provide('goog.ui.ac.InputHandler');

goog.require('goog.Disposable');
goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.a11y');
goog.require('goog.dom.selection');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.string');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');



/**
 * Class for managing the interaction between an auto-complete object and a
 * text-input or textarea.
 *
 * @param {?string=} opt_separators Separators to split multiple entries.
 * @param {?string=} opt_literals Characters used to delimit text literals.
 * @param {?boolean=} opt_multi Whether to allow multiple entries
 *     (Default: true).
 * @param {?number=} opt_throttleTime Number of milliseconds to throttle
 *     keyevents with (Default: 150). Use -1 to disable updates on typing. Note
 *     that typing the separator will update autocomplete suggestions.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.ac.InputHandler = function(opt_separators, opt_literals,
    opt_multi, opt_throttleTime) {
  goog.Disposable.call(this);
  var throttleTime = opt_throttleTime || 150;

  /**
   * Whether this input accepts multiple values
   * @type {boolean}
   * @private
   */
  this.multi_ = opt_multi != null ? opt_multi : true;

  // Set separators depends on this.multi_ being set correctly
  this.setSeparators(goog.isDefAndNotNull(opt_separators) ? opt_separators :
      goog.ui.ac.InputHandler.STANDARD_LIST_SEPARATORS);

  /**
   * Characters that are used to delimit literal text. Separarator characters
   * found within literal text are not processed as separators
   * @type {string}
   * @private
   */
  this.literals_ = opt_literals || '';

  /**
   * Whether to prevent the default behavior (moving focus to another element)
   * when tab is pressed.  This occurs by default only for multi-value mode.
   * @type {boolean}
   * @private
   */
  this.preventDefaultOnTab_ = this.multi_;

  /**
   * A timer object used to monitor for changes when an element is active.
   *
   * TODO(user): Consider tuning the throttle time, so that it takes into
   * account the length of the token.  When the token is short it is likely to
   * match lots of rows, therefore we want to check less frequently.  Even
   * something as simple as <3-chars = 150ms, then 100ms otherwise.
   *
   * @type {goog.Timer}
   * @private
   */
  this.timer_ = throttleTime > 0 ? new goog.Timer(throttleTime) : null;

  /**
   * Event handler used by the input handler to manage events.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * Event handler to help us find an input element that already has the focus.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.activateHandler_ = new goog.events.EventHandler(this);

  /**
   * The keyhandler used for listening on most key events.  This takes care of
   * abstracting away some of the browser differences.
   * @type {goog.events.KeyHandler}
   * @private
   */
  this.keyHandler_ = new goog.events.KeyHandler();

  /**
   * The last key down key code.
   * @type {number}
   * @private
   */
  this.lastKeyCode_ = -1;  // Initialize to a non-existent value.
};
goog.inherits(goog.ui.ac.InputHandler, goog.Disposable);


/**
 * Whether or not we need to pause the execution of the blur handler in order
 * to allow the execution of the selection handler to run first. This is
 * currently true when running on IOS version prior to 4.2, since we need
 * some special logic for these devices to handle bug 4484488.
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.REQUIRES_ASYNC_BLUR_ =
    (goog.userAgent.product.IPHONE || goog.userAgent.product.IPAD) &&
        // Check the webkit version against the version for iOS 4.2.1.
        !goog.userAgent.isVersion('533.17.9');


/**
 * Standard list separators.
 * @type {string}
 * @const
 */
goog.ui.ac.InputHandler.STANDARD_LIST_SEPARATORS = ',;';


/**
 * Literals for quotes.
 * @type {string}
 * @const
 */
goog.ui.ac.InputHandler.QUOTE_LITERALS = '"';


/**
 * The AutoComplete instance this inputhandler is associated with.
 * @type {goog.ui.ac.AutoComplete}
 */
goog.ui.ac.InputHandler.prototype.ac_;


/**
 * Characters that can be used to split multiple entries in an input string
 * @type {string}
 * @private
 */
goog.ui.ac.InputHandler.prototype.separators_;


/**
 * The separator we use to reconstruct the string
 * @type {string}
 * @private
 */
goog.ui.ac.InputHandler.prototype.defaultSeparator_;


/**
 * Regular expression used from trimming tokens or null for no trimming.
 * @type {RegExp}
 * @private
 */
goog.ui.ac.InputHandler.prototype.trimmer_;


/**
 * Regular expression to test whether a separator exists
 * @type {RegExp}
 * @private
 */
goog.ui.ac.InputHandler.prototype.separatorCheck_;


/**
 * Should auto-completed tokens be wrapped in whitespace?  Used in selectRow.
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.prototype.whitespaceWrapEntries_ = true;


/**
 * Should the occurrence of a literal indicate a token boundary?
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.prototype.generateNewTokenOnLiteral_ = true;


/**
 * Whether to flip the orientation of up & down for hiliting next
 * and previous autocomplete entries.
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.prototype.upsideDown_ = false;


/**
 * If we're in 'multi' mode, does typing a separator force the updating of
 * suggestions?
 * For example, if somebody finishes typing "obama, hillary,", should the last
 * comma trigger updating suggestions in a guaranteed manner? Especially useful
 * when the suggestions depend on complete keywords. Note that "obama, hill"
 * (a leading sub-string of "obama, hillary" will lead to different and possibly
 * irrelevant suggestions.
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.prototype.separatorUpdates_ = true;


/**
 * If we're in 'multi' mode, does typing a separator force the current term to
 * autocomplete?
 * For example, if 'tomato' is a suggested completion and the user has typed
 * 'to,', do we autocomplete to turn that into 'tomato,'?
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.prototype.separatorSelects_ = true;


/**
 * The id of the currently active timeout, so it can be cleared if required.
 * @type {?number}
 * @private
 */
goog.ui.ac.InputHandler.prototype.activeTimeoutId_ = null;


/**
 * The element that is currently active.
 * @type {Element}
 * @private
 */
goog.ui.ac.InputHandler.prototype.activeElement_ = null;


/**
 * The previous value of the active element.
 * @type {string}
 * @private
 */
goog.ui.ac.InputHandler.prototype.lastValue_ = '';


/**
 * Flag used to indicate that the IME key has been seen and we need to wait for
 * the up event.
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.prototype.waitingForIme_ = false;


/**
 * Flag used to indicate that the user just selected a row and we should
 * therefore ignore the change of the input value.
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.prototype.rowJustSelected_ = false;


/**
 * Flag indicating whether the result list should be updated continuously
 * during typing or only after a short pause.
 * @type {boolean}
 * @private
 */
goog.ui.ac.InputHandler.prototype.updateDuringTyping_ = true;


/**
 * Attach an instance of an AutoComplete
 * @param {goog.ui.ac.AutoComplete} ac Autocomplete object.
 */
goog.ui.ac.InputHandler.prototype.attachAutoComplete = function(ac) {
  this.ac_ = ac;
};


/**
 * Returns the associated autocomplete instance.
 * @return {goog.ui.ac.AutoComplete} The associated autocomplete instance.
 */
goog.ui.ac.InputHandler.prototype.getAutoComplete = function() {
  return this.ac_;
};


/**
 * Returns the current active element.
 * @return {Element} The currently active element.
 */
goog.ui.ac.InputHandler.prototype.getActiveElement = function() {
  return this.activeElement_;
};


/**
 * Returns the value of the current active element.
 * @return {string} The value of the current active element.
 */
goog.ui.ac.InputHandler.prototype.getValue = function() {
  return this.activeElement_.value;
};


/**
 * Sets the value of the current active element.
 * @param {string} value The new value.
 */
goog.ui.ac.InputHandler.prototype.setValue = function(value) {
  this.activeElement_.value = value;
};


/**
 * Returns the current cursor position.
 * @return {number} The index of the cursor position.
 */
goog.ui.ac.InputHandler.prototype.getCursorPosition = function() {
  return goog.dom.selection.getStart(this.activeElement_);
};


/**
 * Sets the cursor at the given position.
 * @param {number} pos The index of the cursor position.
 */
goog.ui.ac.InputHandler.prototype.setCursorPosition = function(pos) {
  goog.dom.selection.setStart(this.activeElement_, pos);
  goog.dom.selection.setEnd(this.activeElement_, pos);
};


/**
 * Attaches the input handler to a target element. The target element
 * should be a textarea, input box, or other focusable element with the
 * same interface.
 * @param {Element|goog.events.EventTarget} target An element to attach the
 *     input handler too.
 */
goog.ui.ac.InputHandler.prototype.attachInput = function(target) {
  if (goog.dom.isElement(target)) {
    goog.dom.a11y.setState(/** @type {Element} */ (target), 'haspopup', true);
  }

  this.eh_.listen(target, goog.events.EventType.FOCUS, this.handleFocus);
  this.eh_.listen(target, goog.events.EventType.BLUR, this.handleBlur);

  if (!this.activeElement_) {
    this.activateHandler_.listen(
        target, goog.events.EventType.KEYDOWN,
        this.onKeyDownOnInactiveElement_);

    // Don't wait for a focus event if the element already has focus.
    if (goog.dom.isElement(target)) {
      var ownerDocument = goog.dom.getOwnerDocument(
          /** @type {Element} */ (target));
      if (goog.dom.getActiveElement(ownerDocument) == target) {
        this.processFocus(/** @type {Element} */ (target));
      }
    }
  }
};


/**
 * Detaches the input handler from the provided element.
 * @param {Element|goog.events.EventTarget} target An element to detach the
 *     input handler from.
 */
goog.ui.ac.InputHandler.prototype.detachInput = function(target) {
  if (target == this.activeElement_) {
    this.handleBlur();
  }
  this.eh_.unlisten(target, goog.events.EventType.FOCUS, this.handleFocus);
  this.eh_.unlisten(target, goog.events.EventType.BLUR, this.handleBlur);

  if (!this.activeElement_) {
    this.activateHandler_.unlisten(
        target, goog.events.EventType.KEYDOWN,
        this.onKeyDownOnInactiveElement_);
  }
};


/**
 * Attaches the input handler to multiple elements.
 * @param {...Element} var_args Elements to attach the input handler too.
 */
goog.ui.ac.InputHandler.prototype.attachInputs = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    this.attachInput(arguments[i]);
  }
};


/**
 * Detaches the input handler from multuple elements.
 * @param {...Element} var_args Variable arguments for elements to unbind from.
 */
goog.ui.ac.InputHandler.prototype.detachInputs = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    this.detachInput(arguments[i]);
  }
};


/**
 * Selects the given row.  Implements the SelectionHandler interface.
 * @param {Object} row The row to select.
 * @param {boolean=} opt_multi Should this be treated as a single or multi-token
 *     auto-complete?  Overrides previous setting of opt_multi on constructor.
 * @return {boolean} Whether to suppress the update event.
 */
goog.ui.ac.InputHandler.prototype.selectRow = function(row, opt_multi) {
  this.setTokenText(row.toString(), opt_multi);
  return false;
};


/**
 * Sets the text of the current token without updating the autocomplete
 * choices.
 * @param {string} tokenText The text for the current token.
 * @param {boolean=} opt_multi Should this be treated as a single or multi-token
 *     auto-complete?  Overrides previous setting of opt_multi on constructor.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.setTokenText =
    function(tokenText, opt_multi) {
  if (goog.isDef(opt_multi) ? opt_multi : this.multi_) {
    var index = this.getTokenIndex_(this.getValue(), this.getCursorPosition());

    // Break up the current input string.
    var entries = this.splitInput_(this.getValue());

    // Get the new value, ignoring whitespace associated with the entry.
    var replaceValue = tokenText;

    // Only add punctuation if there isn't already a separator available.
    if (!this.separatorCheck_.test(replaceValue)) {
      replaceValue = goog.string.trimRight(replaceValue) +
                     this.defaultSeparator_;
    }

    // Ensure there's whitespace wrapping the entries, if whitespaceWrapEntries_
    // has been set to true.
    if (this.whitespaceWrapEntries_) {
      if (index != 0 && !goog.string.isEmpty(entries[index - 1])) {
        replaceValue = ' ' + replaceValue;
      }
      // Add a space only if it's the last token; otherwise, we assume the
      // next token already has the proper spacing.
      if (index == entries.length - 1) {
        replaceValue = replaceValue + ' ';
      }
    }

    // If the token needs changing, then update the input box and move the
    // cursor to the correct position.
    if (replaceValue != entries[index]) {

      // Replace the value in the array.
      entries[index] = replaceValue;

      var el = this.activeElement_;
      // If there is an uncommitted IME in Firefox or IE 9, setting the value
      // fails and results in actually clearing the value that's already in the
      // input.
      // The FF bug is http://bugzilla.mozilla.org/show_bug.cgi?id=549674
      // Blurring before setting the value works around this problem. We'd like
      // to do this only if there is an uncommitted IME, but this isn't possible
      // to detect. Since text editing is finicky we restrict this
      // workaround to Firefox and IE 9 where it's necessary.
      if (goog.userAgent.GECKO ||
          (goog.userAgent.IE && goog.userAgent.isVersion('9'))) {
        el.blur();
      }
      // Join the array and replace the contents of the input.
      el.value = entries.join('');

      // Calculate which position to put the cursor at.
      var pos = 0;
      for (var i = 0; i <= index; i++) {
        pos += entries[i].length;
      }

      // Set the cursor.
      el.focus();
      this.setCursorPosition(pos);
    }
  } else {
    this.setValue(tokenText);
  }

  // Avoid triggering an autocomplete just because the value changed.
  this.rowJustSelected_ = true;
};


/** @override */
goog.ui.ac.InputHandler.prototype.disposeInternal = function() {
  goog.ui.ac.InputHandler.superClass_.disposeInternal.call(this);
  if (this.activeTimeoutId_ != null) {
    // Need to check against null explicitly because 0 is a valid value.
    window.clearTimeout(this.activeTimeoutId_);
  }
  this.eh_.dispose();
  delete this.eh_;
  this.activateHandler_.dispose();
  this.keyHandler_.dispose();
};


/**
 * Sets the entry separator characters.
 *
 * @param {string} separators The separator characters to set.
 */
goog.ui.ac.InputHandler.prototype.setSeparators = function(separators) {
  this.separators_ = separators;
  this.defaultSeparator_ = this.separators_.substring(0, 1);

  var wspaceExp = this.multi_ ? '[\\s' + this.separators_ + ']+' : '[\\s]+';

  this.trimmer_ = new RegExp('^' + wspaceExp + '|' + wspaceExp + '$', 'g');
  this.separatorCheck_ = new RegExp('\\s*[' + this.separators_ + ']$');
};


/**
 * Sets whether to flip the orientation of up & down for hiliting next
 * and previous autocomplete entries.
 * @param {boolean} upsideDown Whether the orientation is upside down.
 */
goog.ui.ac.InputHandler.prototype.setUpsideDown = function(upsideDown) {
  this.upsideDown_ = upsideDown;
};


/**
 * Sets whether auto-completed tokens should be wrapped with whitespace.
 * @param {boolean} newValue boolean value indicating whether or not
 *     auto-completed tokens should be wrapped with whitespace.
 */
goog.ui.ac.InputHandler.prototype.setWhitespaceWrapEntries =
    function(newValue) {
  this.whitespaceWrapEntries_ = newValue;
};


/**
 * Sets whether new tokens should be generated from literals.  That is, should
 * hello'world be two tokens, assuming ' is a literal?
 * @param {boolean} newValue boolean value indicating whether or not
 * new tokens should be generated from literals.
 */
goog.ui.ac.InputHandler.prototype.setGenerateNewTokenOnLiteral =
    function(newValue) {
  this.generateNewTokenOnLiteral_ = newValue;
};


/**
 * Sets the regular expression used to trim the tokens before passing them to
 * the matcher:  every substring that matches the given regular expression will
 * be removed.  This can also be set to null to disable trimming.
 * @param {RegExp} trimmer Regexp to use for trimming or null to disable it.
 */
goog.ui.ac.InputHandler.prototype.setTrimmingRegExp = function(trimmer) {
  this.trimmer_ = trimmer;
};


/**
 * Sets whether we will prevent the default input behavior (moving focus to the
 * next focusable  element) on TAB.
 * @param {boolean} newValue Whether to preventDefault on TAB.
 */
goog.ui.ac.InputHandler.prototype.setPreventDefaultOnTab = function(newValue) {
  this.preventDefaultOnTab_ = newValue;
};


/**
 * Sets whether separators perform autocomplete.
 * @param {boolean} newValue Whether to autocomplete on separators.
 */
goog.ui.ac.InputHandler.prototype.setSeparatorCompletes = function(newValue) {
  this.separatorUpdates_ = newValue;
  this.separatorSelects_ = newValue;
};


/**
 * Sets whether separators perform autocomplete.
 * @param {boolean} newValue Whether to autocomplete on separators.
 */
goog.ui.ac.InputHandler.prototype.setSeparatorSelects = function(newValue) {
  this.separatorSelects_ = newValue;
};


/**
 * Gets the time to wait before updating the results. If the update during
 * typing flag is switched on, this delay counts from the last update,
 * otherwise from the last keypress.
 * @return {number} Throttle time in milliseconds.
 */
goog.ui.ac.InputHandler.prototype.getThrottleTime = function() {
  return this.timer_ ? this.timer_.getInterval() : -1;
};


/**
 * Sets whether a row has just been selected.
 * @param {boolean} justSelected Whether or not the row has just been selected.
 */
goog.ui.ac.InputHandler.prototype.setRowJustSelected = function(justSelected) {
  this.rowJustSelected_ = justSelected;
};


/**
 * Sets the time to wait before updating the results.
 * @param {number} time New throttle time in milliseconds.
 */
goog.ui.ac.InputHandler.prototype.setThrottleTime = function(time) {
  if (time < 0) {
    this.timer_.dispose();
    this.timer_ = null;
    return;
  }
  if (this.timer_) {
    this.timer_.setInterval(time);
  } else {
    this.timer_ = new goog.Timer(time);
  }
};


/**
 * Gets whether the result list is updated during typing.
 * @return {boolean} Value of the flag.
 */
goog.ui.ac.InputHandler.prototype.getUpdateDuringTyping = function() {
  return this.updateDuringTyping_;
};


/**
 * Sets whether the result list should be updated during typing.
 * @param {boolean} value New value of the flag.
 */
goog.ui.ac.InputHandler.prototype.setUpdateDuringTyping = function(value) {
  this.updateDuringTyping_ = value;
};


/**
 * Handles a key event.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @return {boolean} True if the key event was handled.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.handleKeyEvent = function(e) {
  switch (e.keyCode) {

    // If the menu is open and 'down' caused a change then prevent the default
    // action and prevent scrolling.  If the box isn't a multi autocomplete
    // and the menu isn't open, we force it open now.
    case goog.events.KeyCodes.DOWN:
      if (this.ac_.isOpen()) {
        this.moveDown_();
        e.preventDefault();
        return true;

      } else if (!this.multi_) {
        this.update(true);
        e.preventDefault();
        return true;
      }
      break;

    // If the menu is open and 'up' caused a change then prevent the default
    // action and prevent scrolling.
    case goog.events.KeyCodes.UP:
      if (this.ac_.isOpen()) {
        this.moveUp_();
        e.preventDefault();
        return true;
      }
      break;

    // If tab key is pressed, select the current highlighted item.  The default
    // action is also prevented if the input is a multi input, to prevent the
    // user tabbing out of the field.
    case goog.events.KeyCodes.TAB:
      if (this.ac_.isOpen() && !e.shiftKey) {
        // Ensure the menu is up to date before completing.
        this.update();
        if (this.ac_.selectHilited() && this.preventDefaultOnTab_) {
          e.preventDefault();
          return true;
        }
      } else {
        this.ac_.dismiss();
      }
      break;

    // On enter, just select the highlighted row.
    case goog.events.KeyCodes.ENTER:
      if (this.ac_.isOpen()) {
        // Ensure the menu is up to date before completing.
        this.update();
        if (this.ac_.selectHilited()) {
          e.preventDefault();
          e.stopPropagation();
          return true;
        }
      } else {
        this.ac_.dismiss();
      }
      break;

    // On escape tell the autocomplete to dismiss.
    case goog.events.KeyCodes.ESC:
      if (this.ac_.isOpen()) {
        this.ac_.dismiss();
        e.preventDefault();
        e.stopPropagation();
        return true;
      }
      break;

    // The IME keycode indicates an IME sequence has started, we ignore all
    // changes until we get an enter key-up.
    case goog.events.KeyCodes.WIN_IME:
      if (!this.waitingForIme_) {
        this.startWaitingForIme_();
        return true;
      }
      break;

    default:
      if (this.timer_ && !this.updateDuringTyping_) {
        // Waits throttle time before sending the request again.
        this.timer_.stop();
        this.timer_.start();
      }
  }

  return this.handleSeparator_(e);
};


/**
 * Handles a key event for a separator key.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @return {boolean} True if the key event was handled.
 * @private
 */
goog.ui.ac.InputHandler.prototype.handleSeparator_ = function(e) {
  var isSeparatorKey = this.multi_ && e.charCode &&
      this.separators_.indexOf(String.fromCharCode(e.charCode)) != -1;
  if (this.separatorUpdates_ && isSeparatorKey) {
    this.update();
  }
  if (this.separatorSelects_ && isSeparatorKey) {
    if (this.ac_.selectHilited()) {
      e.preventDefault();
      return true;
    }
  }
  return false;
};


/**
 * @return {boolean} Whether this inputhandler need to listen on key-up.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.needKeyUpListener = function() {
  return false;
};


/**
 * Handles the key up event. Registered only if needKeyUpListener returns true.
 * @param {goog.events.Event} e The keyup event.
 * @return {boolean} Whether an action was taken or not.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.handleKeyUp = function(e) {
  return false;
};


/**
 * Adds the necessary input event handlers.
 * @private
 */
goog.ui.ac.InputHandler.prototype.addEventHandlers_ = function() {
  this.keyHandler_.attach(this.activeElement_);
  this.eh_.listen(
      this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKey_);
  if (this.needKeyUpListener()) {
    this.eh_.listen(this.activeElement_,
        goog.events.EventType.KEYUP, this.handleKeyUp);
  }
  this.eh_.listen(this.activeElement_,
      goog.events.EventType.MOUSEDOWN, this.onMouseDown_);

  // IE also needs a keypress to check if the user typed a separator
  if (goog.userAgent.IE) {
    this.eh_.listen(this.activeElement_,
        goog.events.EventType.KEYPRESS, this.onIeKeyPress_);
  }
};


/**
 * Removes the necessary input event handlers.
 * @private
 */
goog.ui.ac.InputHandler.prototype.removeEventHandlers_ = function() {
  this.eh_.unlisten(
      this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.onKey_);
  this.keyHandler_.detach();
  this.eh_.unlisten(this.activeElement_,
      goog.events.EventType.KEYUP, this.handleKeyUp);
  this.eh_.unlisten(this.activeElement_,
      goog.events.EventType.MOUSEDOWN, this.onMouseDown_);

  if (goog.userAgent.IE) {
    this.eh_.unlisten(this.activeElement_,
        goog.events.EventType.KEYPRESS, this.onIeKeyPress_);
  }

  if (this.waitingForIme_) {
    this.stopWaitingForIme_();
  }
};


/**
 * Handles an element getting focus.
 * @param {goog.events.Event} e Browser event object.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.handleFocus = function(e) {
  this.processFocus(/** @type {Element} */ (e.target || null));
};


/**
 * Registers handlers for the active element when it receives focus.
 * @param {Element} target The element to focus.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.processFocus = function(target) {
  this.activateHandler_.removeAll();

  if (this.ac_) {
    this.ac_.cancelDelayedDismiss();
  }

  // Double-check whether the active element has actually changed.
  // This is a fix for Safari 3, which fires spurious focus events.
  if (target != this.activeElement_) {
    this.activeElement_ = target;
    if (this.timer_) {
      this.timer_.start();
      this.eh_.listen(this.timer_, goog.Timer.TICK, this.onTick_);
    }
    this.lastValue_ = this.getValue();
    this.addEventHandlers_();
  }
};


/**
 * Handles an element blurring.
 * @param {goog.events.Event=} opt_e Browser event object.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.handleBlur = function(opt_e) {
  // Phones running iOS prior to version 4.2.
  if (goog.ui.ac.InputHandler.REQUIRES_ASYNC_BLUR_) {
    // @bug 4484488 This is required so that the menu works correctly on
    // iOS prior to version 4.2. Otherwise, the blur action closes the menu
    // before the menu button click can be processed.
    // In order to fix the bug, we set a timeout to process the blur event, so
    // that any pending selection event can be processed first.
    this.activeTimeoutId_ =
        window.setTimeout(goog.bind(this.processBlur_, this), 0);
    return;
  } else {
    this.processBlur_();
  }
};


/**
 * Helper function that does the logic to handle an element blurring.
 * @private
 */
goog.ui.ac.InputHandler.prototype.processBlur_ = function() {
  // it's possible that a blur event could fire when there's no active element,
  // in the case where attachInput was called on an input that already had
  // the focus
  if (this.activeElement_) {
    this.removeEventHandlers_();
    this.activeElement_ = null;

    if (this.timer_) {
      this.timer_.stop();
      this.eh_.unlisten(this.timer_, goog.Timer.TICK, this.onTick_);
    }

    if (this.ac_) {
      // Pause dismissal slightly to take into account any other events that
      // might fire on the renderer (e.g. a click will lose the focus).
      this.ac_.dismissOnDelay();
    }
  }
};


/**
 * Handles the timer's tick event.  Calculates the current token, and reports
 * any update to the autocomplete.
 * @param {goog.events.Event} e Browser event object.
 * @private
 */
goog.ui.ac.InputHandler.prototype.onTick_ = function(e) {
  this.update();
};


/**
 * Handles typing in an inactive input element. Activate it.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @private
 */
goog.ui.ac.InputHandler.prototype.onKeyDownOnInactiveElement_ = function(e) {
  this.handleFocus(e);
};


/**
 * Handles typing in the active input element.  Checks if the key is a special
 * key and does the relevent action as appropriate.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @private
 */
goog.ui.ac.InputHandler.prototype.onKey_ = function(e) {
  this.lastKeyCode_ = e.keyCode;
  if (this.ac_) {
    this.handleKeyEvent(e);
  }
};


/**
 * Handles a KEYPRESS event generated by typing in the active input element.
 * Checks if IME input is ended.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @private
 */
goog.ui.ac.InputHandler.prototype.onKeyPress_ = function(e) {
  if (this.waitingForIme_ &&
      this.lastKeyCode_ != goog.events.KeyCodes.WIN_IME) {
    this.stopWaitingForIme_();
  }
};


/**
 * Handles the key-up event.  This is only ever used by Mac FF or when we are in
 * an IME entry scenario.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @private
 */
goog.ui.ac.InputHandler.prototype.onKeyUp_ = function(e) {
  if (this.waitingForIme_ &&
      (e.keyCode == goog.events.KeyCodes.ENTER ||
       (e.keyCode == goog.events.KeyCodes.M && e.ctrlKey))) {
    this.stopWaitingForIme_();
  }
};


/**
 * Handles mouse-down event.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @private
 */
goog.ui.ac.InputHandler.prototype.onMouseDown_ = function(e) {
  if (this.ac_) {
    this.handleMouseDown(e);
  }
};


/**
 * For subclasses to override to handle the mouse-down event.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.handleMouseDown = function(e) {
};


/**
 * Starts waiting for IME.
 * @private
 */
goog.ui.ac.InputHandler.prototype.startWaitingForIme_ = function() {
  if (this.waitingForIme_) {
    return;
  }
  this.eh_.listen(
      this.activeElement_, goog.events.EventType.KEYUP, this.onKeyUp_);
  this.eh_.listen(
      this.activeElement_, goog.events.EventType.KEYPRESS, this.onKeyPress_);
  this.waitingForIme_ = true;
};


/**
 * Stops waiting for IME.
 * @private
 */
goog.ui.ac.InputHandler.prototype.stopWaitingForIme_ = function() {
  if (!this.waitingForIme_) {
    return;
  }
  this.waitingForIme_ = false;
  this.eh_.unlisten(
      this.activeElement_, goog.events.EventType.KEYPRESS, this.onKeyPress_);
  this.eh_.unlisten(
      this.activeElement_, goog.events.EventType.KEYUP, this.onKeyUp_);
};


/**
 * Handles the key-press event for IE, checking to see if the user typed a
 * separator character.
 * @param {goog.events.BrowserEvent} e Browser event object.
 * @private
 */
goog.ui.ac.InputHandler.prototype.onIeKeyPress_ = function(e) {
  this.handleSeparator_(e);
};


/**
 * Checks if an update has occurred and notified the autocomplete of the new
 * token.
 * @param {boolean=} opt_force If true the menu will be forced to update.
 */
goog.ui.ac.InputHandler.prototype.update = function(opt_force) {
  if (this.activeElement_ &&
      (opt_force || this.getValue() != this.lastValue_)) {
    if (opt_force || !this.rowJustSelected_) {
      var token = this.parseToken();

      if (this.ac_) {
        this.ac_.setTarget(this.activeElement_);
        this.ac_.setToken(token, this.getValue());
      }
    }
    this.lastValue_ = this.getValue();
  }
  this.rowJustSelected_ = false;
};


/**
 * Parses a text area or input box for the currently highlighted token.
 * @return {string} Token to complete.
 * @protected
 */
goog.ui.ac.InputHandler.prototype.parseToken = function() {
  return this.parseToken_();
};


/**
 * Moves hilite up.  May hilite next or previous depending on orientation.
 * @return {boolean} True if successful.
 * @private
 */
goog.ui.ac.InputHandler.prototype.moveUp_ = function() {
  return this.upsideDown_ ? this.ac_.hiliteNext() : this.ac_.hilitePrev();
};


/**
 * Moves hilite down.  May hilite next or previous depending on orientation.
 * @return {boolean} True if successful.
 * @private
 */
goog.ui.ac.InputHandler.prototype.moveDown_ = function() {
  return this.upsideDown_ ? this.ac_.hilitePrev() : this.ac_.hiliteNext();
};


/**
 * Parses a text area or input box for the currently highlighted token.
 * @return {string} Token to complete.
 * @private
 */
goog.ui.ac.InputHandler.prototype.parseToken_ = function() {
  var caret = this.getCursorPosition();
  var text = this.getValue();
  return this.trim_(this.splitInput_(text)[this.getTokenIndex_(text, caret)]);
};


/**
 * Trims a token of characters that we want to ignore
 * @param {string} text string to trim.
 * @return {string} Trimmed string.
 * @private
 */
goog.ui.ac.InputHandler.prototype.trim_ = function(text) {
  return this.trimmer_ ? String(text).replace(this.trimmer_, '') : text;
};


/**
 * Gets the index of the currently highlighted token
 * @param {string} text string to parse.
 * @param {number} caret Position of cursor in string.
 * @return {number} Index of token.
 * @private
 */
goog.ui.ac.InputHandler.prototype.getTokenIndex_ = function(text, caret) {
  // Split up the input string into multiple entries
  var entries = this.splitInput_(text);

  // Short-circuit to select the last entry
  if (caret == text.length) return entries.length - 1;

  // Calculate which of the entries the cursor is currently in
  var current = 0;
  for (var i = 0, pos = 0; i < entries.length && pos <= caret; i++) {
    pos += entries[i].length;
    current = i;
  }

  // Get the token for the current item
  return current;
};


/**
 * Splits an input string of text at the occurance of a character in
 * {@link goog.ui.ac.InputHandler.prototype.separators_} and creates
 * an array of tokens.  Each token may contain additional whitespace and
 * formatting marks.  If necessary use
 * {@link goog.ui.ac.InputHandler.prototype.trim_} to clean up the
 * entries.
 *
 * @param {string} text Input text.
 * @return {Array} Parsed array.
 * @private
 */
goog.ui.ac.InputHandler.prototype.splitInput_ = function(text) {
  if (!this.multi_) {
    return [text];
  }

  var arr = String(text).split('');
  var parts = [];
  var cache = [];

  for (var i = 0, inLiteral = false; i < arr.length; i++) {
    if (this.literals_ && this.literals_.indexOf(arr[i]) != -1) {
      if (this.generateNewTokenOnLiteral_ && !inLiteral) {
        parts.push(cache.join(''));
        cache.length = 0;
      }
      cache.push(arr[i]);
      inLiteral = !inLiteral;

    } else if (!inLiteral && this.separators_.indexOf(arr[i]) != -1) {
      cache.push(arr[i]);
      parts.push(cache.join(''));
      cache.length = 0;

    } else {
      cache.push(arr[i]);
    }
  }
  parts.push(cache.join(''));

  return parts;
};
