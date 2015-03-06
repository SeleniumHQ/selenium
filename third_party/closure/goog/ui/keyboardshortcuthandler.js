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
 * @fileoverview Generic keyboard shortcut handler.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/keyboardshortcuts.html
 */

goog.provide('goog.ui.KeyboardShortcutEvent');
goog.provide('goog.ui.KeyboardShortcutHandler');
goog.provide('goog.ui.KeyboardShortcutHandler.EventType');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyNames');
goog.require('goog.object');
goog.require('goog.userAgent');



/**
 * Component for handling keyboard shortcuts. A shortcut is registered and bound
 * to a specific identifier. Once the shortcut is triggered an event is fired
 * with the identifier for the shortcut. This allows keyboard shortcuts to be
 * customized without modifying the code that listens for them.
 *
 * Supports keyboard shortcuts triggered by a single key, a stroke stroke (key
 * plus at least one modifier) and a sequence of keys or strokes.
 *
 * @param {goog.events.EventTarget|EventTarget} keyTarget Event target that the
 *     key event listener is attached to, typically the applications root
 *     container.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.KeyboardShortcutHandler = function(keyTarget) {
  goog.events.EventTarget.call(this);

  /**
   * Registered keyboard shortcuts tree. Stored as a map with the keyCode and
   * modifier(s) as the key and either a list of further strokes or the shortcut
   * task identifier as the value.
   * @type {!goog.ui.KeyboardShortcutHandler.SequenceTree_}
   * @see #makeStroke_
   * @private
   */
  this.shortcuts_ = {};

  /**
   * The currently active shortcut sequence tree, which represents the position
   * in the complete shortcuts_ tree reached by recent key strokes.
   * @type {!goog.ui.KeyboardShortcutHandler.SequenceTree_}
   * @private
   */
  this.currentTree_ = this.shortcuts_;

  /**
   * The time (in ms, epoch time) of the last keystroke which made progress in
   * the shortcut sequence tree (i.e. the time that currentTree_ was last set).
   * Used for timing out stroke sequences.
   * @type {number}
   * @private
   */
  this.lastStrokeTime_ = 0;

  /**
   * List of numeric key codes for keys that are safe to always regarded as
   * shortcuts, even if entered in a textarea or input field.
   * @type {Object}
   * @private
   */
  this.globalKeys_ = goog.object.createSet(
      goog.ui.KeyboardShortcutHandler.DEFAULT_GLOBAL_KEYS_);

  /**
   * List of input types that should only accept ENTER as a shortcut.
   * @type {Object}
   * @private
   */
  this.textInputs_ = goog.object.createSet(
      goog.ui.KeyboardShortcutHandler.DEFAULT_TEXT_INPUTS_);

  /**
   * Whether to always prevent the default action if a shortcut event is fired.
   * @type {boolean}
   * @private
   */
  this.alwaysPreventDefault_ = true;

  /**
   * Whether to always stop propagation if a shortcut event is fired.
   * @type {boolean}
   * @private
   */
  this.alwaysStopPropagation_ = false;

  /**
   * Whether to treat all shortcuts as if they had been passed
   * to setGlobalKeys().
   * @type {boolean}
   * @private
   */
  this.allShortcutsAreGlobal_ = false;

  /**
   * Whether to treat shortcuts with modifiers as if they had been passed
   * to setGlobalKeys().  Ignored if allShortcutsAreGlobal_ is true.  Applies
   * only to form elements (not content-editable).
   * @type {boolean}
   * @private
   */
  this.modifierShortcutsAreGlobal_ = true;

  /**
   * Whether to treat space key as a shortcut when the focused element is a
   * checkbox, radiobutton or button.
   * @type {boolean}
   * @private
   */
  this.allowSpaceKeyOnButtons_ = false;

  /**
   * Tracks the currently pressed shortcut key, for Firefox.
   * @type {?number}
   * @private
   */
  this.activeShortcutKeyForGecko_ = null;

  this.initializeKeyListener(keyTarget);
};
goog.inherits(goog.ui.KeyboardShortcutHandler, goog.events.EventTarget);
goog.tagUnsealableClass(goog.ui.KeyboardShortcutHandler);



/**
 * A node in a keyboard shortcut sequence tree. A node is either:
 * 1. A terminal node with a non-nullable shortcut string which is the
 *    identifier for the shortcut triggered by traversing the tree to that node.
 * 2. An internal node with a null shortcut string and a
 *    {@code goog.ui.KeyboardShortcutHandler.SequenceTree_} representing the
 *    continued stroke sequences from this node.
 * For clarity, the static factory methods for creating internal and terminal
 * nodes below should be used rather than using this constructor directly.
 * @param {string=} opt_shortcut The shortcut identifier, for terminal nodes.
 * @constructor
 * @struct
 * @private
 */
goog.ui.KeyboardShortcutHandler.SequenceNode_ = function(opt_shortcut) {
  /** @const {?string} The shorcut action identifier, for terminal nodes. */
  this.shortcut = opt_shortcut || null;

  /** @const {goog.ui.KeyboardShortcutHandler.SequenceTree_} */
  this.next = opt_shortcut ? null : {};
};


/**
 * Creates a terminal shortcut sequence node for the given shortcut identifier.
 * @param {string} shortcut The shortcut identifier.
 * @return {!goog.ui.KeyboardShortcutHandler.SequenceNode_}
 * @private
 */
goog.ui.KeyboardShortcutHandler.createTerminalNode_ = function(shortcut) {
  return new goog.ui.KeyboardShortcutHandler.SequenceNode_(shortcut);
};


/**
 * Creates an internal shortcut sequence node - a non-terminal part of a
 * keyboard sequence.
 * @return {!goog.ui.KeyboardShortcutHandler.SequenceNode_}
 * @private
 */
goog.ui.KeyboardShortcutHandler.createInternalNode_ = function() {
  return new goog.ui.KeyboardShortcutHandler.SequenceNode_();
};


/**
 * A map of strokes (represented as numbers) to the nodes reached by those
 * strokes.
 * @typedef {Object<number, goog.ui.KeyboardShortcutHandler.SequenceNode_>}
 * @private
 */
goog.ui.KeyboardShortcutHandler.SequenceTree_;


/**
 * Maximum allowed delay, in milliseconds, allowed between the first and second
 * key in a key sequence.
 * @type {number}
 */
goog.ui.KeyboardShortcutHandler.MAX_KEY_SEQUENCE_DELAY = 1500; // 1.5 sec


/**
 * Bit values for modifier keys.
 * @enum {number}
 */
goog.ui.KeyboardShortcutHandler.Modifiers = {
  NONE: 0,
  SHIFT: 1,
  CTRL: 2,
  ALT: 4,
  META: 8
};


/**
 * Keys marked as global by default.
 * @type {Array<goog.events.KeyCodes>}
 * @private
 */
goog.ui.KeyboardShortcutHandler.DEFAULT_GLOBAL_KEYS_ = [
  goog.events.KeyCodes.ESC,
  goog.events.KeyCodes.F1,
  goog.events.KeyCodes.F2,
  goog.events.KeyCodes.F3,
  goog.events.KeyCodes.F4,
  goog.events.KeyCodes.F5,
  goog.events.KeyCodes.F6,
  goog.events.KeyCodes.F7,
  goog.events.KeyCodes.F8,
  goog.events.KeyCodes.F9,
  goog.events.KeyCodes.F10,
  goog.events.KeyCodes.F11,
  goog.events.KeyCodes.F12,
  goog.events.KeyCodes.PAUSE
];


/**
 * Text input types to allow only ENTER shortcuts.
 * Web Forms 2.0 for HTML5: Section 4.10.7 from 29 May 2012.
 * @type {Array<string>}
 * @private
 */
goog.ui.KeyboardShortcutHandler.DEFAULT_TEXT_INPUTS_ = [
  'color',
  'date',
  'datetime',
  'datetime-local',
  'email',
  'month',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'time',
  'url',
  'week'
];


/**
 * Events.
 * @enum {string}
 */
goog.ui.KeyboardShortcutHandler.EventType = {
  SHORTCUT_TRIGGERED: 'shortcut',
  SHORTCUT_PREFIX: 'shortcut_'
};


/**
 * Cache for name to key code lookup.
 * @type {Object.<number>}
 * @private
 */
goog.ui.KeyboardShortcutHandler.nameToKeyCodeCache_;


/**
 * Target on which to listen for key events.
 * @type {goog.events.EventTarget|EventTarget}
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.keyTarget_;


/**
 * Due to a bug in the way that Gecko on Mac handles cut/copy/paste key events
 * using the meta key, it is necessary to fake the keyDown for the action key
 * (C,V,X) by capturing it on keyUp.
 * Because users will often release the meta key a slight moment before they
 * release the action key, we need this variable that will store whether the
 * meta key has been released recently.
 * It will be cleared after a short delay in the key handling logic.
 * @type {boolean}
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.metaKeyRecentlyReleased_;


/**
 * Whether a key event is a printable-key event. Windows uses ctrl+alt
 * (alt-graph) keys to type characters on European keyboards. For such keys, we
 * cannot identify whether these keys are used for typing characters when
 * receiving keydown events. Therefore, we set this flag when we receive their
 * respective keypress events and fire shortcut events only when we do not
 * receive them.
 * @type {boolean}
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.isPrintableKey_;


/**
 * Static method for getting the key code for a given key.
 * @param {string} name Name of key.
 * @return {number} The key code.
 */
goog.ui.KeyboardShortcutHandler.getKeyCode = function(name) {
  // Build reverse lookup object the first time this method is called.
  if (!goog.ui.KeyboardShortcutHandler.nameToKeyCodeCache_) {
    var map = {};
    for (var key in goog.events.KeyNames) {
      // Explicitly convert the stringified map keys to numbers and normalize.
      map[goog.events.KeyNames[key]] =
          goog.events.KeyCodes.normalizeKeyCode(parseInt(key, 10));
    }
    goog.ui.KeyboardShortcutHandler.nameToKeyCodeCache_ = map;
  }

  // Check if key is in cache.
  return goog.ui.KeyboardShortcutHandler.nameToKeyCodeCache_[name];
};


/**
 * Sets whether to always prevent the default action when a shortcut event is
 * fired. If false, the default action is prevented only if preventDefault is
 * called on either of the corresponding SHORTCUT_TRIGGERED or SHORTCUT_PREFIX
 * events. If true, the default action is prevented whenever a shortcut event
 * is fired. The default value is true.
 * @param {boolean} alwaysPreventDefault Whether to always call preventDefault.
 */
goog.ui.KeyboardShortcutHandler.prototype.setAlwaysPreventDefault = function(
    alwaysPreventDefault) {
  this.alwaysPreventDefault_ = alwaysPreventDefault;
};


/**
 * Returns whether the default action will always be prevented when a shortcut
 * event is fired. The default value is true.
 * @see #setAlwaysPreventDefault
 * @return {boolean} Whether preventDefault will always be called.
 */
goog.ui.KeyboardShortcutHandler.prototype.getAlwaysPreventDefault = function() {
  return this.alwaysPreventDefault_;
};


/**
 * Sets whether to always stop propagation for the event when fired. If false,
 * the propagation is stopped only if stopPropagation is called on either of the
 * corresponding SHORT_CUT_TRIGGERED or SHORTCUT_PREFIX events. If true, the
 * event is prevented from propagating beyond its target whenever it is fired.
 * The default value is false.
 * @param {boolean} alwaysStopPropagation Whether to always call
 *     stopPropagation.
 */
goog.ui.KeyboardShortcutHandler.prototype.setAlwaysStopPropagation = function(
    alwaysStopPropagation) {
  this.alwaysStopPropagation_ = alwaysStopPropagation;
};


/**
 * Returns whether the event will always be stopped from propagating beyond its
 * target when a shortcut event is fired. The default value is false.
 * @see #setAlwaysStopPropagation
 * @return {boolean} Whether stopPropagation will always be called.
 */
goog.ui.KeyboardShortcutHandler.prototype.getAlwaysStopPropagation =
    function() {
  return this.alwaysStopPropagation_;
};


/**
 * Sets whether to treat all shortcuts (including modifier shortcuts) as if the
 * keys had been passed to the setGlobalKeys function.
 * @param {boolean} allShortcutsGlobal Whether to treat all shortcuts as global.
 */
goog.ui.KeyboardShortcutHandler.prototype.setAllShortcutsAreGlobal = function(
    allShortcutsGlobal) {
  this.allShortcutsAreGlobal_ = allShortcutsGlobal;
};


/**
 * Returns whether all shortcuts (including modifier shortcuts) are treated as
 * if the keys had been passed to the setGlobalKeys function.
 * @see #setAllShortcutsAreGlobal
 * @return {boolean} Whether all shortcuts are treated as globals.
 */
goog.ui.KeyboardShortcutHandler.prototype.getAllShortcutsAreGlobal =
    function() {
  return this.allShortcutsAreGlobal_;
};


/**
 * Sets whether to treat shortcuts with modifiers as if the keys had been
 * passed to the setGlobalKeys function.  Ignored if you have called
 * setAllShortcutsAreGlobal(true).  Applies only to form elements (not
 * content-editable).
 * @param {boolean} modifierShortcutsGlobal Whether to treat shortcuts with
 *     modifiers as global.
 */
goog.ui.KeyboardShortcutHandler.prototype.setModifierShortcutsAreGlobal =
    function(modifierShortcutsGlobal) {
  this.modifierShortcutsAreGlobal_ = modifierShortcutsGlobal;
};


/**
 * Returns whether shortcuts with modifiers are treated as if the keys had been
 * passed to the setGlobalKeys function.  Ignored if you have called
 * setAllShortcutsAreGlobal(true).  Applies only to form elements (not
 * content-editable).
 * @see #setModifierShortcutsAreGlobal
 * @return {boolean} Whether shortcuts with modifiers are treated as globals.
 */
goog.ui.KeyboardShortcutHandler.prototype.getModifierShortcutsAreGlobal =
    function() {
  return this.modifierShortcutsAreGlobal_;
};


/**
 * Sets whether to treat space key as a shortcut when the focused element is a
 * checkbox, radiobutton or button.
 * @param {boolean} allowSpaceKeyOnButtons Whether to treat space key as a
 *     shortcut when the focused element is a checkbox, radiobutton or button.
 */
goog.ui.KeyboardShortcutHandler.prototype.setAllowSpaceKeyOnButtons = function(
    allowSpaceKeyOnButtons) {
  this.allowSpaceKeyOnButtons_ = allowSpaceKeyOnButtons;
};


/**
 * Registers a keyboard shortcut.
 * @param {string} identifier Identifier for the task performed by the keyboard
 *                 combination. Multiple shortcuts can be provided for the same
 *                 task by specifying the same identifier.
 * @param {...(number|string|Array<number>)} var_args See below.
 *
 * param {number} keyCode Numeric code for key
 * param {number=} opt_modifiers Bitmap indicating required modifier keys.
 *                goog.ui.KeyboardShortcutHandler.Modifiers.SHIFT, CONTROL,
 *                ALT, or META.
 *
 * The last two parameters can be repeated any number of times to create a
 * shortcut using a sequence of strokes. Instead of varagrs the second parameter
 * could also be an array where each element would be ragarded as a parameter.
 *
 * A string representation of the shortcut can be supplied instead of the last
 * two parameters. In that case the method only takes two arguments, the
 * identifier and the string.
 *
 * Examples:
 *   g               registerShortcut(str, G_KEYCODE)
 *   Ctrl+g          registerShortcut(str, G_KEYCODE, CTRL)
 *   Ctrl+Shift+g    registerShortcut(str, G_KEYCODE, CTRL | SHIFT)
 *   Ctrl+g a        registerShortcut(str, G_KEYCODE, CTRL, A_KEYCODE)
 *   Ctrl+g Shift+a  registerShortcut(str, G_KEYCODE, CTRL, A_KEYCODE, SHIFT)
 *   g a             registerShortcut(str, G_KEYCODE, NONE, A_KEYCODE)
 *
 * Examples using string representation for shortcuts:
 *   g               registerShortcut(str, 'g')
 *   Ctrl+g          registerShortcut(str, 'ctrl+g')
 *   Ctrl+Shift+g    registerShortcut(str, 'ctrl+shift+g')
 *   Ctrl+g a        registerShortcut(str, 'ctrl+g a')
 *   Ctrl+g Shift+a  registerShortcut(str, 'ctrl+g shift+a')
 *   g a             registerShortcut(str, 'g a').
 */
goog.ui.KeyboardShortcutHandler.prototype.registerShortcut = function(
    identifier, var_args) {

  // Add shortcut to shortcuts_ tree
  goog.ui.KeyboardShortcutHandler.setShortcut_(
      this.shortcuts_, this.interpretStrokes_(1, arguments), identifier);
};


/**
 * Unregisters a keyboard shortcut by keyCode and modifiers or string
 * representation of sequence.
 *
 * param {number} keyCode Numeric code for key
 * param {number=} opt_modifiers Bitmap indicating required modifier keys.
 *                 goog.ui.KeyboardShortcutHandler.Modifiers.SHIFT, CONTROL,
 *                 ALT, or META.
 *
 * The two parameters can be repeated any number of times to create a shortcut
 * using a sequence of strokes.
 *
 * A string representation of the shortcut can be supplied instead see
 * {@link #registerShortcut} for syntax. In that case the method only takes one
 * argument.
 *
 * @param {...(number|string|Array<number>)} var_args String representation, or
 *     array or list of alternating key codes and modifiers.
 */
goog.ui.KeyboardShortcutHandler.prototype.unregisterShortcut = function(
    var_args) {
  // Remove shortcut from tree.
  goog.ui.KeyboardShortcutHandler.unsetShortcut_(
      this.shortcuts_, this.interpretStrokes_(0, arguments));
};


/**
 * Verifies if a particular keyboard shortcut is registered already. It has
 * the same interface as the unregistering of shortcuts.
 *
 * param {number} keyCode Numeric code for key
 * param {number=} opt_modifiers Bitmap indicating required modifier keys.
 *                 goog.ui.KeyboardShortcutHandler.Modifiers.SHIFT, CONTROL,
 *                 ALT, or META.
 *
 * The two parameters can be repeated any number of times to create a shortcut
 * using a sequence of strokes.
 *
 * A string representation of the shortcut can be supplied instead see
 * {@link #registerShortcut} for syntax. In that case the method only takes one
 * argument.
 *
 * @param {...(number|string|Array<number>)} var_args String representation, or
 *     array or list of alternating key codes and modifiers.
 * @return {boolean} Whether the specified keyboard shortcut is registered.
 */
goog.ui.KeyboardShortcutHandler.prototype.isShortcutRegistered = function(
    var_args) {
  return this.checkShortcut_(this.interpretStrokes_(0, arguments));
};


/**
 * Parses the variable arguments for registerShortcut and unregisterShortcut.
 * @param {number} initialIndex The first index of "args" to treat as
 *     variable arguments.
 * @param {Object} args The "arguments" array passed
 *     to registerShortcut or unregisterShortcut.  Please see the comments in
 *     registerShortcut for list of allowed forms.
 * @return {!Array<number>} The sequence of strokes, represented as numbers.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.interpretStrokes_ = function(
    initialIndex, args) {
  var strokes;

  // Build strokes array from string.
  if (goog.isString(args[initialIndex])) {
    strokes = goog.array.map(
        goog.ui.KeyboardShortcutHandler.parseStringShortcut(args[initialIndex]),
        function(stroke) {
          goog.asserts.assertNumber(
              stroke.keyCode, 'A non-modifier key is needed in each stroke.');
          return goog.ui.KeyboardShortcutHandler.makeStroke_(
              stroke.keyCode, stroke.modifiers);
        });

  // Build strokes array from arguments list or from array.
  } else {
    var strokesArgs = args, i = initialIndex;
    if (goog.isArray(args[initialIndex])) {
      strokesArgs = args[initialIndex];
      i = 0;
    }

    strokes = [];
    for (; i < strokesArgs.length; i += 2) {
      strokes.push(goog.ui.KeyboardShortcutHandler.makeStroke_(
          strokesArgs[i], strokesArgs[i + 1]));
    }
  }

  return strokes;
};


/**
 * Unregisters all keyboard shortcuts.
 */
goog.ui.KeyboardShortcutHandler.prototype.unregisterAll = function() {
  this.shortcuts_ = {};
};


/**
 * Sets the global keys; keys that are safe to always regarded as shortcuts,
 * even if entered in a textarea or input field.
 * @param {Array<number>} keys List of keys.
 */
goog.ui.KeyboardShortcutHandler.prototype.setGlobalKeys = function(keys) {
  this.globalKeys_ = goog.object.createSet(keys);
};


/**
 * @return {!Array<string>} The global keys, i.e. keys that are safe to always
 *     regard as shortcuts, even if entered in a textarea or input field.
 */
goog.ui.KeyboardShortcutHandler.prototype.getGlobalKeys = function() {
  return goog.object.getKeys(this.globalKeys_);
};


/** @override */
goog.ui.KeyboardShortcutHandler.prototype.disposeInternal = function() {
  goog.ui.KeyboardShortcutHandler.superClass_.disposeInternal.call(this);
  this.unregisterAll();
  this.clearKeyListener();
};


/**
 * Returns event type for a specific shortcut.
 * @param {string} identifier Identifier for the shortcut task.
 * @return {string} Theh event type.
 */
goog.ui.KeyboardShortcutHandler.prototype.getEventType =
    function(identifier) {

  return goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_PREFIX + identifier;
};


/**
 * Builds stroke array from string representation of shortcut.
 * @param {string} s String representation of shortcut.
 * @return {!Array<!{keyCode: ?number, modifiers: number}>} The stroke array.  A
 *     null keyCode means no non-modifier key was part of the stroke.
 */
goog.ui.KeyboardShortcutHandler.parseStringShortcut = function(s) {
  // Normalize whitespace and force to lower case.
  s = s.replace(/[ +]*\+[ +]*/g, '+').replace(/[ ]+/g, ' ').toLowerCase();

  // Build strokes array from string, space separates strokes, plus separates
  // individual keys.
  var groups = s.split(' ');
  var strokes = [];
  for (var group, i = 0; group = groups[i]; i++) {
    var keys = group.split('+');
    // Explicitly re-initialize key data (JS does not have block scoping).
    var keyCode = null;
    var modifiers = goog.ui.KeyboardShortcutHandler.Modifiers.NONE;
    for (var key, j = 0; key = keys[j]; j++) {
      switch (key) {
        case 'shift':
          modifiers |= goog.ui.KeyboardShortcutHandler.Modifiers.SHIFT;
          continue;
        case 'ctrl':
          modifiers |= goog.ui.KeyboardShortcutHandler.Modifiers.CTRL;
          continue;
        case 'alt':
          modifiers |= goog.ui.KeyboardShortcutHandler.Modifiers.ALT;
          continue;
        case 'meta':
          modifiers |= goog.ui.KeyboardShortcutHandler.Modifiers.META;
          continue;
      }
      if (!goog.isNull(keyCode)) {
        goog.asserts.fail('At most one non-modifier key can be in a stroke.');
      }
      keyCode = goog.ui.KeyboardShortcutHandler.getKeyCode(key);
      goog.asserts.assertNumber(
          keyCode, 'Key name not found in goog.events.KeyNames: ' + key);
      break;
    }
    strokes.push({keyCode: keyCode, modifiers: modifiers});
  }

  return strokes;
};


/**
 * Adds a key event listener that triggers {@link #handleKeyDown_} when keys
 * are pressed.
 * @param {goog.events.EventTarget|EventTarget} keyTarget Event target that the
 *     event listener should be attached to.
 * @protected
 */
goog.ui.KeyboardShortcutHandler.prototype.initializeKeyListener =
    function(keyTarget) {
  this.keyTarget_ = keyTarget;

  goog.events.listen(this.keyTarget_, goog.events.EventType.KEYDOWN,
      this.handleKeyDown_, false, this);

  if (goog.userAgent.GECKO) {
    goog.events.listen(this.keyTarget_, goog.events.EventType.KEYUP,
        this.handleGeckoKeyUp_, false, this);
  }

  // Windows uses ctrl+alt keys (a.k.a. alt-graph keys) for typing characters
  // on European keyboards (e.g. ctrl+alt+e for an an euro sign.) Unfortunately,
  // Windows browsers except Firefox does not have any methods except listening
  // keypress and keyup events to identify if ctrl+alt keys are really used for
  // inputting characters. Therefore, we listen to these events and prevent
  // firing shortcut-key events if ctrl+alt keys are used for typing characters.
  if (goog.userAgent.WINDOWS && !goog.userAgent.GECKO) {
    goog.events.listen(this.keyTarget_, goog.events.EventType.KEYPRESS,
                       this.handleWindowsKeyPress_, false, this);
    goog.events.listen(this.keyTarget_, goog.events.EventType.KEYUP,
                       this.handleWindowsKeyUp_, false, this);
  }
};


/**
 * Handler for when a keyup event is fired in Firefox (Gecko).
 * @param {goog.events.BrowserEvent} e The key event.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.handleGeckoKeyUp_ = function(e) {
  // Due to a bug in the way that Gecko on Mac handles cut/copy/paste key events
  // using the meta key, it is necessary to fake the keyDown for the action keys
  // (C,V,X) by capturing it on keyUp.
  // This is because the keyDown events themselves are not fired by the browser
  // in this case.
  // Because users will often release the meta key a slight moment before they
  // release the action key, we need to store whether the meta key has been
  // released recently to avoid "flaky" cutting/pasting behavior.
  if (goog.userAgent.MAC) {
    if (e.keyCode == goog.events.KeyCodes.MAC_FF_META) {
      this.metaKeyRecentlyReleased_ = true;
      goog.Timer.callOnce(function() {
        this.metaKeyRecentlyReleased_ = false;
      }, 400, this);
      return;
    }

    var metaKey = e.metaKey || this.metaKeyRecentlyReleased_;
    if ((e.keyCode == goog.events.KeyCodes.C ||
        e.keyCode == goog.events.KeyCodes.X ||
        e.keyCode == goog.events.KeyCodes.V) && metaKey) {
      e.metaKey = metaKey;
      this.handleKeyDown_(e);
    }
  }

  // Firefox triggers buttons on space keyUp instead of keyDown.  So if space
  // keyDown activated a shortcut, do NOT also trigger the focused button.
  if (goog.events.KeyCodes.SPACE == this.activeShortcutKeyForGecko_ &&
      goog.events.KeyCodes.SPACE == e.keyCode) {
    e.preventDefault();
  }
  this.activeShortcutKeyForGecko_ = null;
};


/**
 * Returns whether this event is possibly used for typing a printable character.
 * Windows uses ctrl+alt (a.k.a. alt-graph) keys for typing characters on
 * European keyboards. Since only Firefox provides a method that can identify
 * whether ctrl+alt keys are used for typing characters, we need to check
 * whether Windows sends a keypress event to prevent firing shortcut event if
 * this event is used for typing characters.
 * @param {goog.events.BrowserEvent} e The key event.
 * @return {boolean} Whether this event is a possible printable-key event.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.isPossiblePrintableKey_ =
    function(e) {
  return goog.userAgent.WINDOWS && !goog.userAgent.GECKO &&
      e.ctrlKey && e.altKey && !e.shiftKey;
};


/**
 * Handler for when a keypress event is fired on Windows.
 * @param {goog.events.BrowserEvent} e The key event.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.handleWindowsKeyPress_ = function(e) {
  // When this keypress event consists of a printable character, set the flag to
  // prevent firing shortcut key events when we receive the succeeding keyup
  // event. We accept all Unicode characters except control ones since this
  // keyCode may be a non-ASCII character.
  if (e.keyCode > 0x20 && this.isPossiblePrintableKey_(e)) {
    this.isPrintableKey_ = true;
  }
};


/**
 * Handler for when a keyup event is fired on Windows.
 * @param {goog.events.BrowserEvent} e The key event.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.handleWindowsKeyUp_ = function(e) {
  // For possible printable-key events, try firing a shortcut-key event only
  // when this event is not used for typing a character.
  if (!this.isPrintableKey_ && this.isPossiblePrintableKey_(e)) {
    this.handleKeyDown_(e);
  }
};


/**
 * Removes the listener that was added by link {@link #initializeKeyListener}.
 * @protected
 */
goog.ui.KeyboardShortcutHandler.prototype.clearKeyListener = function() {
  goog.events.unlisten(this.keyTarget_, goog.events.EventType.KEYDOWN,
      this.handleKeyDown_, false, this);
  if (goog.userAgent.GECKO) {
    goog.events.unlisten(this.keyTarget_, goog.events.EventType.KEYUP,
        this.handleGeckoKeyUp_, false, this);
  }
  if (goog.userAgent.WINDOWS && !goog.userAgent.GECKO) {
    goog.events.unlisten(this.keyTarget_, goog.events.EventType.KEYPRESS,
        this.handleWindowsKeyPress_, false, this);
    goog.events.unlisten(this.keyTarget_, goog.events.EventType.KEYUP,
        this.handleWindowsKeyUp_, false, this);
  }
  this.keyTarget_ = null;
};


/**
 * Adds a shortcut stroke sequence to the given sequence tree. Recursive.
 * @param {!goog.ui.KeyboardShortcutHandler.SequenceTree_} tree The stroke
 *     sequence tree to add to.
 * @param {Array<number>} strokes Array of strokes for shortcut.
 * @param {string} identifier Identifier for the task performed by shortcut.
 * @private
 */
goog.ui.KeyboardShortcutHandler.setShortcut_ = function(
    tree, strokes, identifier) {
  var stroke = strokes.shift();
  var node = tree[stroke];
  if (node && (strokes.length == 0 || node.shortcut)) {
    // This new shortcut would override an existing shortcut or shortcut prefix
    // (since the new strokes end at an existing node), or an existing shortcut
    // would be triggered by the prefix to this new shortcut (since there is
    // already a terminal node on the path we are trying to create).
    throw Error('Keyboard shortcut conflicts with existing shortcut');
  }

  if (strokes.length) {
    node = goog.object.setIfUndefined(tree, stroke.toString(),
        goog.ui.KeyboardShortcutHandler.createInternalNode_());
    goog.ui.KeyboardShortcutHandler.setShortcut_(
        goog.asserts.assert(node.next, 'An internal node must have a next map'),
        strokes, identifier);
  } else {
    // Add a terminal node.
    tree[stroke] =
        goog.ui.KeyboardShortcutHandler.createTerminalNode_(identifier);
  }
};


/**
 * Removes a shortcut stroke sequence from the given sequence tree, pruning any
 * dead branches of the tree. Recursive.
 * @param {!goog.ui.KeyboardShortcutHandler.SequenceTree_} tree The stroke
 *     sequence tree to remove from.
 * @param {Array<number>} strokes Array of strokes for shortcut to remove.
 * @private
 */
goog.ui.KeyboardShortcutHandler.unsetShortcut_ = function(tree, strokes) {
  var stroke = strokes.shift();
  var node = tree[stroke];

  if (!node) {
    // The given stroke sequence is not in the tree.
    return;
  }
  if (strokes.length == 0) {
    // Base case - the end of the stroke sequence.
    if (!node.shortcut) {
      // The given stroke sequence does not end at a terminal node.
      return;
    }
    delete tree[stroke];
  } else {
    if (!node.next) {
      // The given stroke sequence is not in the tree.
      return;
    }
    // Recursively remove the rest of the shortcut sequence from the node.next
    // subtree.
    goog.ui.KeyboardShortcutHandler.unsetShortcut_(node.next, strokes);
    if (goog.object.isEmpty(node.next)) {
      // The node.next subtree is now empty (the last stroke in it was just
      // removed), so prune this dead branch of the tree.
      delete tree[stroke];
    }
  }
};


/**
 * Checks if a particular keyboard shortcut is registered.
 * @param {Array<number>} strokes Strokes array.
 * @return {boolean} True iff the keyboard is registred.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.checkShortcut_ = function(strokes) {
  var tree = this.shortcuts_;
  while (strokes.length > 0 && tree) {
    var node = tree[strokes.shift()];
    if (!node) {
      return false;
    }
    if (strokes.length == 0 && node.shortcut) {
      return true;
    }
    tree = node.next;
  }
  return false;
};


/**
 * Constructs key from key code and modifiers.
 *
 * The lower 8 bits are used for the key code, the following 3 for modifiers and
 * the remaining bits are unused.
 *
 * @param {number} keyCode Numeric key code.
 * @param {number} modifiers Required modifiers.
 * @return {number} The key.
 * @private
 */
goog.ui.KeyboardShortcutHandler.makeStroke_ = function(keyCode, modifiers) {
  // Make sure key code is just 8 bits and OR it with the modifiers left shifted
  // 8 bits.
  return (keyCode & 255) | (modifiers << 8);
};


/**
 * Keypress handler.
 * @param {goog.events.BrowserEvent} event Keypress event.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.handleKeyDown_ = function(event) {
  if (!this.isValidShortcut_(event)) {
    return;
  }
  // For possible printable-key events, we cannot identify whether the events
  // are used for typing characters until we receive respective keyup events.
  // Therefore, we handle this event when we receive a succeeding keyup event
  // to verify this event is not used for typing characters.
  if (event.type == 'keydown' && this.isPossiblePrintableKey_(event)) {
    this.isPrintableKey_ = false;
    return;
  }

  var keyCode = goog.events.KeyCodes.normalizeKeyCode(event.keyCode);

  var modifiers =
      (event.shiftKey ? goog.ui.KeyboardShortcutHandler.Modifiers.SHIFT : 0) |
      (event.ctrlKey ? goog.ui.KeyboardShortcutHandler.Modifiers.CTRL : 0) |
      (event.altKey ? goog.ui.KeyboardShortcutHandler.Modifiers.ALT : 0) |
      (event.metaKey ? goog.ui.KeyboardShortcutHandler.Modifiers.META : 0);
  var stroke = goog.ui.KeyboardShortcutHandler.makeStroke_(keyCode, modifiers);

  if (!this.currentTree_[stroke] || this.hasSequenceTimedOut_()) {
    // Either this stroke does not continue any active sequence, or the
    // currently active sequence has timed out. Reset shortcut tree progress.
    this.setCurrentTree_(this.shortcuts_);
  }

  var node = this.currentTree_[stroke];
  if (!node) {
    // This stroke does not correspond to a shortcut or continued sequence.
    return;
  }
  if (node.next) {
    // This stroke does not trigger a shortcut, but entered stroke(s) are a part
    // of a sequence. Progress in the sequence tree and record time to allow the
    // following stroke(s) to trigger the shortcut.
    this.setCurrentTree_(node.next);
    // Prevent default action so that the rest of the stroke sequence can be
    // completed.
    event.preventDefault();
    return;
  }
  // This stroke triggers a shortcut. Any active sequence has been completed, so
  // reset the sequence tree.
  this.setCurrentTree_(this.shortcuts_);

  // Dispatch the triggered keyboard shortcut event. In addition to the generic
  // keyboard shortcut event a more specific fine grained one, specific for the
  // shortcut identifier, is fired.
  if (this.alwaysPreventDefault_) {
    event.preventDefault();
  }

  if (this.alwaysStopPropagation_) {
    event.stopPropagation();
  }

  var shortcut = goog.asserts.assertString(
      node.shortcut, 'A terminal node must have a string shortcut identifier.');
  // Dispatch SHORTCUT_TRIGGERED event
  var target = /** @type {Node} */ (event.target);
  var triggerEvent = new goog.ui.KeyboardShortcutEvent(
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED, shortcut,
      target);
  var retVal = this.dispatchEvent(triggerEvent);

  // Dispatch SHORTCUT_PREFIX_<identifier> event
  var prefixEvent = new goog.ui.KeyboardShortcutEvent(
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_PREFIX + shortcut,
      shortcut, target);
  retVal &= this.dispatchEvent(prefixEvent);

  // The default action is prevented if 'preventDefault' was
  // called on either event, or if a listener returned false.
  if (!retVal) {
    event.preventDefault();
  }

  // For Firefox, track which shortcut key was pushed.
  if (goog.userAgent.GECKO) {
    this.activeShortcutKeyForGecko_ = keyCode;
  }
};


/**
 * Checks if a given keypress event may be treated as a shortcut.
 * @param {goog.events.BrowserEvent} event Keypress event.
 * @return {boolean} Whether to attempt to process the event as a shortcut.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.isValidShortcut_ = function(event) {
  var keyCode = event.keyCode;

  // Ignore Ctrl, Shift and ALT
  if (keyCode == goog.events.KeyCodes.SHIFT ||
      keyCode == goog.events.KeyCodes.CTRL ||
      keyCode == goog.events.KeyCodes.ALT) {
    return false;
  }
  var el = /** @type {Element} */ (event.target);
  var isFormElement =
      el.tagName == 'TEXTAREA' || el.tagName == 'INPUT' ||
      el.tagName == 'BUTTON' || el.tagName == 'SELECT';

  var isContentEditable = !isFormElement && (el.isContentEditable ||
      (el.ownerDocument && el.ownerDocument.designMode == 'on'));

  if (!isFormElement && !isContentEditable) {
    return true;
  }
  // Always allow keys registered as global to be used (typically Esc, the
  // F-keys and other keys that are not typically used to manipulate text).
  if (this.globalKeys_[keyCode] || this.allShortcutsAreGlobal_) {
    return true;
  }
  if (isContentEditable) {
    // For events originating from an element in editing mode we only let
    // global key codes through.
    return false;
  }
  // Event target is one of (TEXTAREA, INPUT, BUTTON, SELECT).
  // Allow modifier shortcuts, unless we shouldn't.
  if (this.modifierShortcutsAreGlobal_ && (
      event.altKey || event.ctrlKey || event.metaKey)) {
    return true;
  }
  // Allow ENTER to be used as shortcut for text inputs.
  if (el.tagName == 'INPUT' && this.textInputs_[el.type]) {
    return keyCode == goog.events.KeyCodes.ENTER;
  }
  // Checkboxes, radiobuttons and buttons. Allow all but SPACE as shortcut.
  if (el.tagName == 'INPUT' || el.tagName == 'BUTTON') {
    // TODO(gboyer): If more flexibility is needed, create protected helper
    // methods for each case (e.g. button, input, etc).
    if (this.allowSpaceKeyOnButtons_) {
      return true;
    } else {
      return keyCode != goog.events.KeyCodes.SPACE;
    }
  }
  // Don't allow any additional shortcut keys for textareas or selects.
  return false;
};


/**
 * @return {boolean} True iff the current stroke sequence has timed out.
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.hasSequenceTimedOut_ = function() {
  return goog.now() - this.lastStrokeTime_ >=
      goog.ui.KeyboardShortcutHandler.MAX_KEY_SEQUENCE_DELAY;
};


/**
 * Sets the current keyboard shortcut sequence tree and updates the last stroke
 * time.
 * @param {!goog.ui.KeyboardShortcutHandler.SequenceTree_} tree
 * @private
 */
goog.ui.KeyboardShortcutHandler.prototype.setCurrentTree_ = function(tree) {
  this.currentTree_ = tree;
  this.lastStrokeTime_ = goog.now();
};



/**
 * Object representing a keyboard shortcut event.
 * @param {string} type Event type.
 * @param {string} identifier Task identifier for the triggered shortcut.
 * @param {Node|goog.events.EventTarget} target Target the original key press
 *     event originated from.
 * @extends {goog.events.Event}
 * @constructor
 * @final
 */
goog.ui.KeyboardShortcutEvent = function(type, identifier, target) {
  goog.events.Event.call(this, type, target);

  /**
   * Task identifier for the triggered shortcut
   * @type {string}
   */
  this.identifier = identifier;
};
goog.inherits(goog.ui.KeyboardShortcutEvent, goog.events.Event);
