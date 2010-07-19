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
// All Rights Reserved.

/**
 * @fileoverview Class to encapsulate an editable field.  Always uses an
 * iframe to contain the editable area, never inherits the style of the
 * surrounding page, and is always a fixed height.
 *
*
 * @author nicksantos@google.com (Nick Santos)
*
 * @see ../demos/editor/editor.html
 * @see ../demos/editor/field_basic.html
 */

goog.provide('goog.editor.Field');
goog.provide('goog.editor.Field.EventType');

goog.require('goog.array');
goog.require('goog.async.Delay');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Command');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.icontent');
goog.require('goog.editor.icontent.FieldFormatInfo');
goog.require('goog.editor.icontent.FieldStyleInfo');
goog.require('goog.editor.node');
goog.require('goog.editor.range');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.functions');
goog.require('goog.string');
goog.require('goog.string.Unicode');
goog.require('goog.style');
goog.require('goog.userAgent');

/**
 * This class encapsulates an editable field.
 *
 * event: load Fires when the field is loaded
 * event: unload Fires when the field is unloaded (made not editable)
 *
 * event: beforechange Fires before the content of the field might change
 *
 * event: delayedchange Fires a short time after field has changed. If multiple
 *                      change events happen really close to each other only
 *                      the last one will trigger the delayedchange event.
 *
 * event: beforefocus Fires before the field becomes active
 * event: focus Fires when the field becomes active. Fires after the blur event
 * event: blur Fires when the field becomes inactive
 *
 * TODO: figure out if blur or beforefocus fires first in IE and make FF match
 *
 * @param {string} id An identifer for the field. This is used to find the
 *    field and the element associated with this field.
 * @param {Document=} opt_doc The document that the element with the given
 *     id can be found in.  If not provided, the default document is used.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.editor.Field = function(id, opt_doc) {
  goog.events.EventTarget.call(this);

  /**
   * The id for this editable field, which must match the id of the element
   * associated with this field.
   * @type {string}
   */
  this.id = id;

  /**
   * The hash code for this field. Should be equal to the id.
   * @type {string}
   * @private
   */
  this.hashCode_ = id;

  /**
   * Dom helper for the editable node.
   * @type {goog.dom.DomHelper}
   * @protected
   */
  this.editableDomHelper = null;

  /**
   * Map of class id to registered plugin.
   * @type {Object}
   * @private
   */
  this.plugins_ = {};


  /**
   * Plugins registered on this field, indexed by the goog.editor.Plugin.Op
   * that they support.
   * @type {Object.<Array>}
   * @private
   */
  this.indexedPlugins_ = {};

  for (var op in goog.editor.Plugin.OPCODE) {
    this.indexedPlugins_[op] = [];
  }


  /**
   * Additional styles to install for the editable field.
   * @type {string}
   * @protected
   */
  this.cssStyles = '';

  // Work around bug https://bugs.webkit.org/show_bug.cgi?id=19086 in affected
  // versions of Webkit by specifying 1px right margin on all immediate children
  // of the editable field. This works in most (but not all) cases.
  // Note. The fix uses a CSS rule which may be quite expensive, especially
  //       in BLENDED mode. Currently this is the only known wokraround.
  // TODO(user): The bug was fixed in community Webkit but not included in
  //       Safari yet. Verify that the next Safari release after 525.18 is
  //       unaffected.
  if (goog.userAgent.WEBKIT && goog.userAgent.isVersion('525.13') &&
      goog.string.compareVersions(goog.userAgent.VERSION, '525.18') <= 0) {
    this.workaroundClassName_ = goog.getCssName('tr-webkit-workaround');
    this.cssStyles = '.' + this.workaroundClassName_ + '>*{padding-right:1}';
  }

  // The field will not listen to change events until it has finished loading
  this.stoppedEvents_ = {};
  this.stopEvent(goog.editor.Field.EventType.CHANGE);
  this.stopEvent(goog.editor.Field.EventType.DELAYEDCHANGE);
  this.isModified_ = false;
  this.isEverModified_ = false;
  this.delayedChangeTimer_ = new goog.async.Delay(this.dispatchDelayedChange_,
      goog.editor.Field.DELAYED_CHANGE_FREQUENCY, this);

  this.debouncedEvents_ = {};
  for (var key in goog.editor.Field.EventType) {
    this.debouncedEvents_[goog.editor.Field.EventType[key]] = 0;
  }

  if (goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
    this.changeTimerGecko_ = new goog.async.Delay(this.handleChange,
        goog.editor.Field.CHANGE_FREQUENCY, this);
  }

  /**
   * @type {goog.events.EventHandler}
   * @protected
   */
  this.eventRegister = new goog.events.EventHandler(this);

  // Wrappers around this field, to be disposed when the field is disposed.
  this.wrappers_ = [];

  this.loadState_ = goog.editor.Field.LoadState_.UNEDITABLE;

  var doc = opt_doc || document;
  this.originalDomHelper = goog.dom.getDomHelper(doc);
  this.originalElement = this.originalDomHelper.getElement(this.id);

  // Default to the same window as the field is in.
  this.appWindow_ = this.originalDomHelper.getWindow();
};
goog.inherits(goog.editor.Field, goog.events.EventTarget);


/**
 * The editable dom node.
 * @type {Element}
 * TODO(user): Make this private!
 */
goog.editor.Field.prototype.field = null;


/**
 * The original node that is being made editable, or null if it has
 * not yet been found.
 * @type {Element}
 * @protected
 */
goog.editor.Field.prototype.originalElement = null;


/**
 * Logging object.
 * @type {goog.debug.Logger}
 * @protected
 */
goog.editor.Field.prototype.logger =
    goog.debug.Logger.getLogger('goog.editor.Field');


/**
 * Event types that can be stopped/started.
 * @enum {string}
 */
goog.editor.Field.EventType = {
  /**
   * Dispatched when the command state of the selection may have changed. This
   * event should be listened to for updating toolbar state.
   */
  COMMAND_VALUE_CHANGE: 'cvc',
  /**
   * Dispatched when the field is loaded and ready to use.
   */
  LOAD: 'load',
  /**
   * Dispatched when the field is fully unloaded and uneditable.
   */
  UNLOAD: 'unload',
  /**
   * Dispatched before the field contents are changed.
   */
  BEFORECHANGE: 'beforechange',
  /**
   * Dispatched when the field contents change, in FF only.
   * Used for internal resizing, please do not use.
   */
  CHANGE: 'change',
  /**
   * Dispatched on a slight delay after changes are made.
   * Use for autosave, or other times your app needs to know
   * that the field contents changed.
   */
  DELAYEDCHANGE: 'delayedchange',
  /**
   * Dispatched before focus in moved into the field.
   */
  BEFOREFOCUS: 'beforefocus',
  /**
   * Dispatched when focus is moved into the field.
   */
  FOCUS: 'focus',
  /**
   * Dispatched when the field is blurred.
   */
  BLUR: 'blur',
  /**
   * Dispach before tab is handled by the field.  This is a legacy way
   * of controlling tab behavior.  Use trog.plugins.AbstractTabHandler now.
   */
  BEFORETAB: 'beforetab',
  /**
   * Dispatched when the selection changes.
   * Use handleSelectionChange from plugin API instead of listening
   * directly to this event.
   */
  SELECTIONCHANGE: 'selectionchange'
};


/**
 * The load state of the field.
 * @enum {number}
 * @private
 */
goog.editor.Field.LoadState_ = {
  UNEDITABLE: 0,
  LOADING: 1,
  EDITABLE: 2
};


/**
 * The amount of time that a debounce blocks an event.
 * TODO(nicksantos): As of 9/30/07, this is only used for blocking
 * a keyup event after a keydown. We might need to tweak this for other
 * types of events. Maybe have a per-event debounce time?
 * @type {number}
 * @private
 */
goog.editor.Field.DEBOUNCE_TIME_MS_ = 500;


/**
 * There is at most one "active" field at a time.  By "active" field, we mean
 * a field that has focus and is being used.
 * @type {?string}
 * @private
 */
goog.editor.Field.activeFieldId_ = null;


/**
 * Whether this field is in "modal interaction" mode. This usually
 * means that it's being edited by a dialog.
 * @type {boolean}
 * @private
 */
goog.editor.Field.prototype.inModalMode_ = false;


/**
 * The window where dialogs and bubbles should be rendered.
 * @type {!Window}
 * @private
 */
goog.editor.Field.prototype.appWindow_;


/**
 * The dom helper for the node to be made editable.
 * @type {goog.dom.DomHelper}
 * @protected
 */
goog.editor.Field.prototype.originalDomHelper;


/**
 * Sets the active field id.
 * @param {?string} fieldId The active field id.
 */
goog.editor.Field.setActiveFieldId = function(fieldId) {
  goog.editor.Field.activeFieldId_ = fieldId;
};


/**
 * @return {?string} The id of the active field.
 */
goog.editor.Field.getActiveFieldId = function() {
  return goog.editor.Field.activeFieldId_;
};


/**
 * @return {boolean} Whether we're in modal interaction mode. When this
 *     returns true, another plugin is interacting with the field contents
 *     in a synchronous way, and expects you not to make changes to
 *     the field's DOM structure or selection.
 */
goog.editor.Field.prototype.inModalMode = function() {
  return this.inModalMode_;
};


/**
 * @param {boolean} inModalMode Sets whether we're in modal interaction mode.
 */
goog.editor.Field.prototype.setModalMode = function(inModalMode) {
  this.inModalMode_ = inModalMode;
};


/**
 * Returns a string usable as a hash code for this field. For field's
 * that were created with an id, the hash code is guaranteed to be the id.
 * TODO(user): I think we can get rid of this.  Seems only used from editor.
 * @return {string} The hash code for this editable field.
 */
goog.editor.Field.prototype.getHashCode = function() {
  return this.hashCode_;
};


/**
 * Returns the editable DOM element or null if this field
 * is not editable.
 * <p>On IE or Safari this is the element with contentEditable=true
 * (in whitebox mode, the iFrame body).
 * <p>On Gecko this is the iFrame body
 * TODO(user): How do we word this for subclass version?
 * @return {Element} The editable DOM element, defined as above.
 */
goog.editor.Field.prototype.getElement = function() {
  return this.field;
};


/**
 * Returns original DOM element that is being made editable by Trogedit or
 * null if that element has not yet been found in the appropriate document.
 * @return {Element} The original element.
 */
goog.editor.Field.prototype.getOriginalElement = function() {
  return this.originalElement;
};


/**
 * Registers a keyboard event listener on the field.  This is necessary for
 * Gecko since the fields are contained in an iFrame and there is no way to
 * auto-propagate key events up to the main window.
 * @param {string|Array.<string>} type Event type to listen for or array of
 *    event types, for example goog.events.EventType.KEYDOWN.
 * @param {Function} listener Function to be used as the listener.
 * @param {boolean=} opt_capture Whether to use capture phase (optional,
 *    defaults to false).
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 */
goog.editor.Field.prototype.addListener = function(type, listener, opt_capture,
                                                   opt_handler) {
  var elem = this.getElement();
  // Opera won't fire events on <body> in whitebox mode because we make
  // <html> contentEditable to work around some visual issues.
  // So, if the parent node is contentEditable, listen to events on it instead.
  if (!goog.editor.BrowserFeature.FOCUSES_EDITABLE_BODY_ON_HTML_CLICK &&
      elem.parentNode.contentEditable) {
    elem = elem.parentNode;
  }
  // On Gecko, keyboard events only reliably fire on the document element.
  if (elem && goog.editor.BrowserFeature.USE_DOCUMENT_FOR_KEY_EVENTS) {
    elem = elem.ownerDocument;
  }
  this.eventRegister.listen(elem, type, listener, opt_capture, opt_handler);
};


/**
 * Returns the registered plugin with the given classId.
 * @param {string} classId classId of the plugin.
 * @return {goog.editor.Plugin} Registered plugin with the given classId.
 */
goog.editor.Field.prototype.getPluginByClassId = function(classId) {
  return this.plugins_[classId];
};


/**
 * Registers the plugin with the editable field.
 * @param {goog.editor.Plugin} plugin The plugin to register.
 */
goog.editor.Field.prototype.registerPlugin = function(plugin) {
  var classId = plugin.getTrogClassId();
  if (this.plugins_[classId]) {
    this.logger.severe('Cannot register the same class of plugin twice.');
  }
  this.plugins_[classId] = plugin;

  // Only key events and execute should have these has* functions with a custom
  // handler array since they need to be very careful about performance.
  // The rest of the plugin hooks should be event-based.
  for (var op in goog.editor.Plugin.OPCODE) {
    var opcode = goog.editor.Plugin.OPCODE[op];
    if (plugin[opcode]) {
      this.indexedPlugins_[op].push(plugin);
    }
  }
  plugin.registerFieldObject(this);

  // By default we enable all plugins for fields that are currently loaded.
  if (this.isLoaded()) {
    plugin.enable(this);
  }
};


/**
 * Unregisters the plugin with this field.
 * @param {goog.editor.Plugin} plugin The plugin to unregister.
 */
goog.editor.Field.prototype.unregisterPlugin = function(plugin) {
  var classId = plugin.getTrogClassId();
  if (!this.plugins_[classId]) {
    this.logger.severe('Cannot unregister a plugin that isn\'t registered.');
  }
  delete this.plugins_[classId];

  for (var op in goog.editor.Plugin.OPCODE) {
    var opcode = goog.editor.Plugin.OPCODE[op];
    if (plugin[opcode]) {
      goog.array.remove(this.indexedPlugins_[op], plugin);
    }
  }

  plugin.unregisterFieldObject(this);
};


/**
 * Sets the value that will replace the style attribute of this field's
 * element when the field is made non-editable. This method is called with the
 * current value of the style attribute when the field is made editable.
 * @param {string} cssText The value of the style attribute.
 */
goog.editor.Field.prototype.setInitialStyle = function(cssText) {
  this.cssText = cssText;
};


/**
 * Reset the properties on the original field element to how it was before
 * it was made editable.
 */
goog.editor.Field.prototype.resetOriginalElemProperties = function() {
  var field = this.getOriginalElement();
  field.removeAttribute('contentEditable');
  field.removeAttribute('g_editable');

  if (!this.id) {
    field.removeAttribute('id');
  } else {
    field.id = this.id;
  }

  field.className = this.savedClassName_ || '';

  var cssText = this.cssText;
  if (!cssText) {
    field.removeAttribute('style');
  } else {
    goog.dom.setProperties(field, {'style' : cssText});
  }

  if (goog.isString(this.originalFieldLineHeight_)) {
    goog.style.setStyle(field, 'lineHeight', this.originalFieldLineHeight_);
    this.originalFieldLineHeight_ = null;
  }
};


/**
 * Checks the modified state of the field.
 * Note: Changes that take place while the goog.editor.Field.EventType.CHANGE
 * event is stopped do not effect the modified state.
 * @param {boolean=} opt_useIsEverModified Set to true to check if the field
 *   has ever been modified since it was created, otherwise checks if the field
 *   has been modified since the last goog.editor.Field.EventType.DELAYEDCHANGE
 *   event was dispatched.
 * @return {boolean} Whether the field has been modified.
 */
goog.editor.Field.prototype.isModified = function(opt_useIsEverModified) {
  return opt_useIsEverModified ? this.isEverModified_ : this.isModified_;
};


/**
 * Number of milliseconds after a change when the change event should be fired.
 * @type {number}
 */
goog.editor.Field.CHANGE_FREQUENCY = 15;


/**
 * Number of milliseconds between delayed change events.
 * @type {number}
 */
goog.editor.Field.DELAYED_CHANGE_FREQUENCY = 250;


/**
 * @return {boolean} Whether the field is implemented as an iframe.
 */
goog.editor.Field.prototype.usesIframe = goog.functions.TRUE;


/**
 * @return {boolean} Whether the field should be rendered with a fixed
 *     height, or should expand to fit its contents.
 */
goog.editor.Field.prototype.isFixedHeight = goog.functions.TRUE;


/**
 * Map of keyCodes (not charCodes) that cause changes in the field contents.
 * @type {Object}
 * @private
 */
goog.editor.Field.KEYS_CAUSING_CHANGES_ = {
  46: true, // DEL
  8: true // BACKSPACE
};

if (!goog.userAgent.IE) {
  // Only IE doesn't change the field by default upon tab.
  // TODO(user): This really isn't right now that we have tab plugins.
  goog.editor.Field.KEYS_CAUSING_CHANGES_[9] = true; // TAB
}

/**
 * Map of keyCodes (not charCodes) that when used in conjunction with the
 * Ctrl key cause changes in the field contents. These are the keys that are
 * not handled by basic formatting trogedit plugins.
 * @type {Object}
 * @private
 */
goog.editor.Field.CTRL_KEYS_CAUSING_CHANGES_ = {
  86: true, // V
  88: true // X
};

if (goog.userAgent.IE) {
  // In IE input from IME (Input Method Editor) does not generate keypress
  // event so we have to rely on the keydown event. This way we have
  // false positives while the user is using keyboard to select the
  // character to input, but it is still better than the false negatives
  // that ignores user's final input at all.
  goog.editor.Field.KEYS_CAUSING_CHANGES_[229] = true; // from IME;
}


/**
 * Returns true if the keypress generates a change in contents.
 * @param {goog.events.BrowserEvent} e The event.
 * @param {boolean} testAllKeys True to test for all types of generating keys.
 *     False to test for only the keys found in
 *     goog.editor.Field.KEYS_CAUSING_CHANGES_.
 * @return {boolean} Whether the keypress generates a change in contents.
 * @private
 */
goog.editor.Field.isGeneratingKey_ = function(e, testAllKeys) {
  if (goog.editor.Field.isSpecialGeneratingKey_(e)) {
    return true;
  }

  return !!(testAllKeys && !(e.ctrlKey || e.metaKey) &&
      (!goog.userAgent.GECKO || e.charCode));
};


/**
 * Returns true if the keypress generates a change in the contents.
 * due to a special key listed in goog.editor.Field.KEYS_CAUSING_CHANGES_
 * @param {goog.events.BrowserEvent} e The event.
 * @return {boolean} Whether the keypress generated a change in the contents.
 * @private
 */
goog.editor.Field.isSpecialGeneratingKey_ = function(e) {
  var testCtrlKeys = (e.ctrlKey || e.metaKey) &&
      e.keyCode in goog.editor.Field.CTRL_KEYS_CAUSING_CHANGES_;
  var testRegularKeys = !(e.ctrlKey || e.metaKey) &&
      e.keyCode in goog.editor.Field.KEYS_CAUSING_CHANGES_;

  return testCtrlKeys || testRegularKeys;
};


/**
 * Sets the application window.
 * @param {!Window} appWindow The window where dialogs and bubbles should be
 *     rendered.
 */
goog.editor.Field.prototype.setAppWindow = function(appWindow) {
  this.appWindow_ = appWindow;
};


/**
 * Returns the "application" window, where dialogs and bubbles
 * should be rendered.
 * @return {!Window} The window.
 */
goog.editor.Field.prototype.getAppWindow = function() {
  return this.appWindow_;
};


/**
 * Sets the zIndex that the field should be based off of.
 * TODO(user): Get rid of this completely.  Here for Sites.
 *     Should this be set directly on UI plugins?
 *
 * @param {number} zindex The base zIndex of the editor.
 */
goog.editor.Field.prototype.setBaseZindex = function(zindex) {
  this.baseZindex_ = zindex;
};


/**
 * Returns the zindex of the base level of the field.
 *
 * @return {number} The base zindex of the editor.
 */
goog.editor.Field.prototype.getBaseZindex = function() {
  return this.baseZindex_ || 0;
};


/**
 * Sets up the field object and window util of this field, and enables this
 * editable field with all registered plugins.
 * This is essential to the initialization of the field.
 * It must be called when the field becomes fully loaded and editable.
 * @param {Element} field The field property.
 * @protected
 */
goog.editor.Field.prototype.setupFieldObject = function(field) {
  this.loadState_ = goog.editor.Field.LoadState_.EDITABLE;
  this.field = field;
  this.editableDomHelper = goog.dom.getDomHelper(field);
  this.isModified_ = false;
  this.isEverModified_ = false;
  field.setAttribute('g_editable', 'true');
};


/**
 * Help make the field not editable by setting internal data structures to null,
 * and disabling this field with all registered plugins.
 * @private
 */
goog.editor.Field.prototype.tearDownFieldObject_ = function() {
  this.loadState_ = goog.editor.Field.LoadState_.UNEDITABLE;

  for (var classId in this.plugins_) {
    var plugin = this.plugins_[classId];
    if (!plugin.activeOnUneditableFields()) {
      plugin.disable(this);
    }
  }

  this.field = null;
  this.editableDomHelper = null;
};

/**
 * Initialize listeners on the field.
 * @private
 */
goog.editor.Field.prototype.setupChangeListeners_ = function() {
  if (goog.userAgent.OPERA && this.usesIframe()) {
    // We can't use addListener here because we need to listen on
    // the document, not the editable element.
    this.eventRegister.listen(this.getEditableDomHelper().getDocument(),
                              goog.events.EventType.FOCUS,
                              this.dispatchFocusAndBeforeFocus_);
    this.eventRegister.listen(this.getEditableDomHelper().getDocument(),
                              goog.events.EventType.BLUR,
                              this.dispatchBlur);
  } else {
    if (goog.editor.BrowserFeature.SUPPORTS_FOCUSIN) {
      this.addListener(goog.events.EventType.FOCUS, this.dispatchFocus_);
      this.addListener(goog.events.EventType.FOCUSIN,
                       this.dispatchBeforeFocus_);
    } else {
      this.addListener(goog.events.EventType.FOCUS,
                       this.dispatchFocusAndBeforeFocus_);
    }
    this.addListener(goog.events.EventType.BLUR, this.dispatchBlur,
                     goog.editor.BrowserFeature.USE_MUTATION_EVENTS);
  }

  if (goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
    // Ways to detect changes in Mozilla:
    //
    // keypress - check event.charCode (only typable characters has a
    //            charCode), but also keyboard commands lile Ctrl+C will
    //            return a charCode.
    // dragdrop - fires when the user drops something. This does not necessary
    //            lead to a change but we cannot detect if it will or not
    //
    // Known Issues: We cannot detect cut and paste using menus
    //               We cannot detect when someone moves something out of the
    //               field using drag and drop.
    //
    this.setupMutationEventHandlersGecko();
  } else {
    // Ways to detect that a change is about to happen in other browsers.
    // (IE and Safari have these events. Opera appears to work, but we haven't
    //  researched it.)
    //
    // onbeforepaste
    // onbeforecut
    // ondrop - happens when the user drops something on the editable text
    //          field the value at this time does not contain the dropped text
    // ondragleave - when the user drags something from the current document.
    //               This might not cause a change if the action was copy
    //               instead of move
    // onkeypress - IE only fires keypress events if the key will generate
    //              output. It will not trigger for delete and backspace
    // onkeydown - For delete and backspace
    //
    // known issues: IE triggers beforepaste just by opening the edit menu
    //               delete at the end should not cause beforechange
    //               backspace at the beginning should not cause beforechange
    //               see above in ondragleave
    // TODO(user): Why don't we dispatchBeforeChange from the
    // handleDrop event for all browsers?
    this.addListener(['beforecut', 'beforepaste', 'drop', 'dragend'],
        this.dispatchBeforeChange);
    this.addListener(['cut', 'paste'], this.dispatchChange);
    this.addListener('drop', this.handleDrop_);
  }

  // TODO(user): Figure out why we use dragend vs dragdrop and
  // document this better.
  var dropEventName = goog.userAgent.WEBKIT ? 'dragend' : 'dragdrop';
  this.addListener(dropEventName, this.handleDrop_);

  this.addListener(goog.events.EventType.KEYDOWN, this.handleKeyDown_);
  this.addListener(goog.events.EventType.KEYPRESS, this.handleKeyPress_);
  this.addListener(goog.events.EventType.KEYUP, this.handleKeyUp_);

  var selectionChange = goog.bind(this.dispatchSelectionChangeEvent, this);
  this.selectionChangeTimer_ = new goog.async.Delay(selectionChange,
      goog.editor.Field.SELECTION_CHANGE_FREQUENCY_);

  if (goog.editor.BrowserFeature.FOLLOWS_EDITABLE_LINKS) {
    this.addListener(
        goog.events.EventType.CLICK, goog.editor.Field.cancelLinkClick_);
  }

  this.addListener(goog.events.EventType.MOUSEDOWN, this.handleMouseDown_);
  this.addListener(goog.events.EventType.MOUSEUP, this.handleMouseUp_);
};


/**
 * Frequency to check for selection changes.
 * @type {number}
 * @private
 */
goog.editor.Field.SELECTION_CHANGE_FREQUENCY_ = 250;


/**
 * Stops all listeners and timers.
 * @private
 */
goog.editor.Field.prototype.clearListeners_ = function() {
  if (this.eventRegister) {
    this.eventRegister.removeAll();
  }

  if (this.changeTimerGecko_) {
    this.changeTimerGecko_.stop();
  }
  this.delayedChangeTimer_.stop();
};


/**
 * Removes all listeners and destroys the eventhandler object.
 * @override
 */
goog.editor.Field.prototype.disposeInternal = function() {
  if (this.isLoading() || this.isLoaded()) {
    this.logger.warning('Disposing a field that is in use.');
  }

  if (this.getOriginalElement()) {
    this.execCommand(goog.editor.Command.CLEAR_LOREM);
  }

  this.tearDownFieldObject_();
  this.clearListeners_();
  this.originalDomHelper = null;

  if (this.eventRegister) {
    this.eventRegister.dispose();
    this.eventRegister = null;
  }

  this.removeAllWrappers();

  if (goog.editor.Field.getActiveFieldId() == this.id) {
    goog.editor.Field.setActiveFieldId(null);
  }

  for (var classId in this.plugins_) {
    var plugin = this.plugins_[classId];
    if (plugin.isAutoDispose()) {
      plugin.dispose();
    }
  }
  delete(this.plugins_);

  goog.editor.Field.superClass_.disposeInternal.call(this);
};


/**
 * Attach an wrapper to this field, to be thrown out when the field
 * is disposed.
 * @param {goog.Disposable} wrapper The wrapper to attach.
 */
goog.editor.Field.prototype.attachWrapper = function(wrapper) {
  this.wrappers_.push(wrapper);
};


/**
 * Removes all wrappers and destroys them.
 */
goog.editor.Field.prototype.removeAllWrappers = function() {
  var wrapper;
  while (wrapper = this.wrappers_.pop()) {
    wrapper.dispose();
  }
};


/**
 * List of mutation events in Gecko browsers.
 * @type {Array.<string>}
 * @protected
 */
goog.editor.Field.MUTATION_EVENTS_GECKO = [
  'DOMNodeInserted',
  'DOMNodeRemoved',
  'DOMNodeRemovedFromDocument',
  'DOMNodeInsertedIntoDocument',
  'DOMCharacterDataModified'
];


/**
 * Mutation events tell us when something has changed for mozilla.
 * @protected
 */
goog.editor.Field.prototype.setupMutationEventHandlersGecko = function() {
  if (goog.editor.BrowserFeature.HAS_DOM_SUBTREE_MODIFIED_EVENT) {
    this.eventRegister.listen(this.getElement(), 'DOMSubtreeModified',
    this.handleMutationEventGecko_);
  } else {
    var doc = this.getEditableDomHelper().getDocument();
    this.eventRegister.listen(doc, goog.editor.Field.MUTATION_EVENTS_GECKO,
        this.handleMutationEventGecko_, true);

    // DOMAttrModified fires for a lot of events we want to ignore.  This goes
    // through a different handler so that we can ignore many of these.
    this.eventRegister.listen(doc, 'DOMAttrModified',
        goog.bind(this.handleDomAttrChange, this,
            this.handleMutationEventGecko_),
        true);
  }
};


/**
 * Handle before change key events and fire the beforetab event if appropriate.
 * This needs to happen on keydown in IE and keypress in FF.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @return {boolean} Whether to still perform the default key action.  Only set
 *     to true if the actual event has already been canceled.
 * @private
 */
goog.editor.Field.prototype.handleBeforeChangeKeyEvent_ = function(e) {
  // There are two reasons to block a key:
  var block =
      // #1: to intercept a tab
      // TODO: possibly don't allow clients to intercept tabs outside of LIs and
      // maybe tables as well?
      (e.keyCode == goog.events.KeyCodes.TAB && !this.dispatchBeforeTab_(e)) ||
      // #2: to block a Firefox-specific bug where Macs try to navigate
      // back a page when you hit command+left arrow or comamnd-right arrow.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=341886
      // TODO(nicksantos): Get Firefox to fix this.
      (goog.userAgent.GECKO && e.metaKey &&
       (e.keyCode == goog.events.KeyCodes.LEFT ||
        e.keyCode == goog.events.KeyCodes.RIGHT));

  if (block) {
    e.preventDefault();
    return false;
  } else {
    // In Gecko we have both keyCode and charCode. charCode is for human
    // readable characters like a, b and c. However pressing ctrl+c and so on
    // also causes charCode to be set.

    // TODO(user): Del at end of field or backspace at beginning should be
    // ignored.
    this.gotGeneratingKey_ = e.charCode ||
        goog.editor.Field.isGeneratingKey_(e, goog.userAgent.GECKO);
    if (this.gotGeneratingKey_) {
      this.dispatchBeforeChange();
      // TODO(robbyw): Should we return the value of the above?
    }
  }

  return true;
};


/**
 * Keycodes that result in a selectionchange event (e.g. the cursor moving).
 * @enum {number}
 * @private
 */
goog.editor.Field.SELECTION_CHANGE_KEYCODES_ = {
  8: 1,  // backspace
  9: 1,  // tab
  13: 1, // enter
  33: 1, // page up
  34: 1, // page down
  35: 1, // end
  36: 1, // home
  37: 1, // left
  38: 1, // up
  39: 1, // right
  40: 1, // down
  46: 1  // delete
};


/**
 * Map of keyCodes (not charCodes) that when used in conjunction with the
 * Ctrl key cause selection changes in the field contents. These are the keys
 * that are not handled by the basic formatting trogedit plugins. Note that
 * combinations like Ctrl-left etc are already handled in
 * SELECTION_CHANGE_KEYCODES_
 * @type {Object}
 * @private
 */
goog.editor.Field.CTRL_KEYS_CAUSING_SELECTION_CHANGES_ = {
  65: true, // A
  86: true, // V
  88: true // X
};


/**
 * Map of keyCodes (not charCodes) that might need to be handled as a keyboard
 * shortcut (even when ctrl/meta key is not pressed) by some plugin. Currently
 * it is a small list. If it grows too big we can optimize it by using ranges
 * or extending it from SELECTION_CHANGE_KEYCODES_
 * @type {Object}
 * @private
 */
goog.editor.Field.POTENTIAL_SHORTCUT_KEYCODES_ = {
  8: 1,  // backspace
  9: 1,  // tab
  13: 1, // enter
  27: 1, // esc
  33: 1, // page up
  34: 1, // page down
  37: 1, // left
  38: 1, // up
  39: 1, // right
  40: 1  // down
};


/**
 * Calls all the plugins of the given operation, in sequence, with the
 * given arguments. This is short-circuiting: once one plugin cancels
 * the event, no more plugins will be invoked.
 * @param {goog.editor.Plugin.Op} op A plugin op.
 * @param {...*} var_args The arguments to the plugin.
 * @return {boolean} True if one of the plugins cancel the event, false
 *    otherwise.
 * @private
 */
goog.editor.Field.prototype.invokeShortCircuitingOp_ = function(op, var_args) {
  var plugins = this.indexedPlugins_[op];
  var argList = goog.array.slice(arguments, 1);
  for (var i = 0; i < plugins.length; ++i) {
    // If the plugin returns true, that means it handled the event and
    // we shouldn't propagate to the other plugins.
    var plugin = plugins[i];
    if ((plugin.isEnabled(this) ||
         goog.editor.Plugin.IRREPRESSIBLE_OPS[op]) &&
        plugin[goog.editor.Plugin.OPCODE[op]].apply(plugin, argList)) {
      // Only one plugin is allowed to handle the event. If for some reason
      // a plugin wants to handle it and still allow other plugins to handle
      // it, it shouldn't return true.
      return true;
    }
  }

  return false;
};


/**
 * Invoke this operation on all plugins with the given arguments.
 * @param {goog.editor.Plugin.Op} op A plugin op.
 * @param {...*} var_args The arguments to the plugin.
 * @private
 */
goog.editor.Field.prototype.invokeOp_ = function(op, var_args) {
  var plugins = this.indexedPlugins_[op];
  var argList = goog.array.slice(arguments, 1);
  for (var i = 0; i < plugins.length; ++i) {
    var plugin = plugins[i];
    if (plugin.isEnabled(this) ||
        goog.editor.Plugin.IRREPRESSIBLE_OPS[op]) {
      plugin[goog.editor.Plugin.OPCODE[op]].apply(plugin, argList);
    }
  }
};


/**
 * Reduce this argument over all plugins. The result of each plugin invocation
 * will be passed to the next plugin invocation. See goog.array.reduce.
 * @param {goog.editor.Plugin.Op} op A plugin op.
 * @param {string} arg The argument to reduce. For now, we assume it's a
 *     string, but we should widen this later if there are reducing
 *     plugins that don't operate on strings.
 * @param {...*} var_args Any extra arguments to pass to the plugin. These args
 *     will not be reduced.
 * @return {string} The reduced argument.
 * @private
 */
goog.editor.Field.prototype.reduceOp_ = function(op, arg, var_args) {
  var plugins = this.indexedPlugins_[op];
  var argList = goog.array.slice(arguments, 1);
  for (var i = 0; i < plugins.length; ++i) {
    var plugin = plugins[i];
    if (plugin.isEnabled(this) ||
        goog.editor.Plugin.IRREPRESSIBLE_OPS[op]) {
      argList[0] = plugin[goog.editor.Plugin.OPCODE[op]].apply(
          plugin, argList);
    }
  }
  return argList[0];
};


/**
 * Prepare the given contents, then inject them into the editable field.
 * @param {?string} contents The contents to prepare.
 * @param {Element} field The field element.
 * @protected
 */
goog.editor.Field.prototype.injectContents = function(contents, field) {
  var styles = {};
  var newHtml = this.getInjectableContents(contents, styles);
  goog.style.setStyle(field, styles);
  field.innerHTML = newHtml;
};


/**
 * Returns prepared contents that can be injected into the editable field.
 * @param {?string} contents The contents to prepare.
 * @param {Object} styles A map that will be populated with styles that should
 *     be applied to the field element together with the contents.
 * @return {string} The prepared contents.
 */
goog.editor.Field.prototype.getInjectableContents = function(contents, styles) {
  return this.reduceOp_(
      goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML, contents || '', styles);
};


/**
 * Handles keydown on the field.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.editor.Field.prototype.handleKeyDown_ = function(e) {
  if (!goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
    if (!this.handleBeforeChangeKeyEvent_(e)) {
      return;
    }
  }

  if (!this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.KEYDOWN, e) &&
      goog.editor.BrowserFeature.USES_KEYDOWN) {
    this.handleKeyboardShortcut_(e);
  }
};


/**
 * Handles keypress on the field.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.editor.Field.prototype.handleKeyPress_ = function(e) {
  if (goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
    if (!this.handleBeforeChangeKeyEvent_(e)) {
      return;
    }
  } else {
    // In IE only keys that generate output trigger keypress
    // In Mozilla charCode is set for keys generating content.
    this.gotGeneratingKey_ = true;
    this.dispatchBeforeChange();
  }

  if (!this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.KEYPRESS, e) &&
      !goog.editor.BrowserFeature.USES_KEYDOWN) {
    this.handleKeyboardShortcut_(e);
  }
};


/**
 * Handles keyup on the field.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.editor.Field.prototype.handleKeyUp_ = function(e) {
  if (!goog.editor.BrowserFeature.USE_MUTATION_EVENTS &&
      (this.gotGeneratingKey_ ||
       goog.editor.Field.isSpecialGeneratingKey_(e))) {
    // The special keys won't have set the gotGeneratingKey flag, so we check
    // for them explicitly
    this.handleChange();
  }

  this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.KEYUP, e);

  if (this.isEventStopped(goog.editor.Field.EventType.SELECTIONCHANGE)) {
    return;
  }

  if (goog.editor.Field.SELECTION_CHANGE_KEYCODES_[e.keyCode] ||
      ((e.ctrlKey || e.metaKey) &&
       goog.editor.Field.CTRL_KEYS_CAUSING_SELECTION_CHANGES_[e.keyCode])) {
    this.selectionChangeTimer_.start();
  }
};


/**
 * Handles keyboard shortcuts on the field.  Note that we bake this into our
 * handleKeyPress/handleKeyDown rather than using goog.events.KeyHandler or
 * goog.ui.KeyboardShortcutHandler for performance reasons.  Since these
 * are handled on every key stroke, we do not want to be going out to the
 * event system every time.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.editor.Field.prototype.handleKeyboardShortcut_ = function(e) {
  // Alt key is used for i18n languages to enter certain characters. like
  // control + alt + z (used for IMEs) and control + alt + s for Polish.
  // So we don't invoke handleKeyboardShortcut at all for alt keys.
  if (e.altKey) {
    return;
  }

  var isModifierPressed = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  if (isModifierPressed ||
      goog.editor.Field.POTENTIAL_SHORTCUT_KEYCODES_[e.keyCode]) {
    // TODO(user): goog.events.KeyHandler uses much more complicated logic
    // to determine key.  Consider changing to what they do.
    var key = e.charCode || e.keyCode;

    if (key == 17) { // Ctrl key
      // In IE and Webkit pressing Ctrl key itself results in this event.
      return;
    }

    var stringKey = String.fromCharCode(key).toLowerCase();
    if (this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.SHORTCUT,
            e, stringKey, isModifierPressed)) {
      e.preventDefault();
      // We don't call stopPropagation as some other handler outside of
      // trogedit might need it.
    }
  }
};


/**
 * Executes an editing command as per the registered plugins.
 * @param {string} command The command to execute.
 * @param {...*} var_args Any additional parameters needed to execute the
 *     command.
 * @return {*} False if the command wasn't handled, otherwise, the result of
 *     the command.
 */
goog.editor.Field.prototype.execCommand = function(command, var_args) {
  var args = arguments;
  var result;

  var plugins = this.indexedPlugins_[goog.editor.Plugin.Op.EXEC_COMMAND];
  for (var i = 0; i < plugins.length; ++i) {
    // If the plugin supports the command, that means it handled the
    // event and we shouldn't propagate to the other plugins.
    var plugin = plugins[i];
    if (plugin.isEnabled(this) && plugin.isSupportedCommand(command)) {
      result = plugin.execCommand.apply(plugin, args);
      break;
    }
  }

  return result;
};


/**
 * Gets the value of command(s).
 * @param {string|Array.<string>} commands String name(s) of the command.
 * @return {*} Value of each command. Returns false (or array of falses)
 *     if designMode is off or the field is otherwise uneditable, and
 *     there are no activeOnUneditable plugins for the command.
 */
goog.editor.Field.prototype.queryCommandValue = function(commands) {
  var isEditable = this.isLoaded() && this.isSelectionEditable();
  if (goog.isString(commands)) {
    return this.queryCommandValueInternal_(commands, isEditable);
  } else {
    var state = {};
    for (var i = 0; i < commands.length; i++) {
      state[commands[i]] = this.queryCommandValueInternal_(commands[i],
          isEditable);
    }
    return state;
  }
};


/**
 * Gets the value of this command.
 * @param {string} command The command to check.
 * @param {boolean} isEditable Whether the field is currently editable.
 * @return {*} The state of this command. Null if not handled.
 *     False if the field is uneditable and there are no handlers for
 *     uneditable commands.
 * @private
 */
goog.editor.Field.prototype.queryCommandValueInternal_ = function(command,
    isEditable) {
  var plugins = this.indexedPlugins_[goog.editor.Plugin.Op.QUERY_COMMAND];
  for (var i = 0; i < plugins.length; ++i) {
    var plugin = plugins[i];
    if (plugin.isEnabled(this) && plugin.isSupportedCommand(command) &&
        (isEditable || plugin.activeOnUneditableFields())) {
      return plugin.queryCommandValue(command);
    }
  }
  return isEditable ? null : false;
};


/**
 * Fires a change event only if the attribute change effects the editiable
 * field. We ignore events that are internal browser events (ie scrollbar
 * state change)
 * @param {Function} handler The function to call if this is not an internal
 *     browser event.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @protected
 */
goog.editor.Field.prototype.handleDomAttrChange = function(handler, e) {
  if (this.isEventStopped(goog.editor.Field.EventType.CHANGE)) {
    return;
  }

  e = e.getBrowserEvent();

  // For XUL elements, since we don't care what they are doing
  try {
    if (e.originalTarget.prefix || e.originalTarget.nodeName == 'scrollbar') {
      return;
    }
  } catch (ex1) {
    // Some XUL nodes don't like you reading their properties.  If we got
    // the exception, this implies  a XUL node so we can return.
    return;
  }

  // Check if prev and new values are different, sometimes this fires when
  // nothing has really changed.
  if (e.prevValue == e.newValue) {
    return;
  }
  handler.call(this, e);
};


/**
 * Handle a mutation event.
 * @param {goog.events.BrowserEvent|Event} e The browser event.
 * @private
 */
goog.editor.Field.prototype.handleMutationEventGecko_ = function(e) {
  if (this.isEventStopped(goog.editor.Field.EventType.CHANGE)) {
    return;
  }

  e = e.getBrowserEvent ? e.getBrowserEvent() : e;
  // For people with firebug, firebug sets this property on elements it is
  // inserting into the dom.
  if (e.target.firebugIgnore) {
    return;
  }

  this.isModified_ = true;
  this.isEverModified_ = true;
  this.changeTimerGecko_.start();
};


/**
 * Handle drop events. Deal with focus/selection issues and set the document
 * as changed.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.editor.Field.prototype.handleDrop_ = function(e) {
  if (goog.userAgent.IE) {
    // TODO(user): This should really be done in the loremipsum plugin.
    this.execCommand(goog.editor.Command.CLEAR_LOREM, true);
  }

  // TODO(user): I just moved this code to this location, but I wonder why
  // it is only done for this case.  Investigate.
  if (goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
    this.dispatchFocusAndBeforeFocus_();
  }

  this.dispatchChange();
};


/**
 * @return {HTMLIFrameElement} The iframe that's body is editable.
 * @protected
 */
goog.editor.Field.prototype.getEditableIframe = function() {
  var dh;
  if (this.usesIframe() && (dh = this.getEditableDomHelper())) {
    // If the iframe has been destroyed, the dh could still exist since the
    // node may not be gc'ed, but fetching the window can fail.
    var win = dh.getWindow();
    return /** @type {HTMLIFrameElement} */ (win && win.frameElement);
  }
  return null;
};


/**
 * @return {goog.dom.DomHelper?} The dom helper for the editable node.
 */
goog.editor.Field.prototype.getEditableDomHelper = function() {
  return this.editableDomHelper;
};


/**
 * @return {goog.dom.AbstractRange?} Closure range object wrapping the selection
 *     in this field or null if this field is not currently editable.
 */
goog.editor.Field.prototype.getRange = function() {
  var win = this.editableDomHelper && this.editableDomHelper.getWindow();
  return win && goog.dom.Range.createFromWindow(win);
};


/**
 * Dispatch a selection change event, optionally caused by the given browser
 * event.
 * @param {goog.events.BrowserEvent=} opt_e Optional browser event causing this
 *     event.
 */
goog.editor.Field.prototype.dispatchSelectionChangeEvent = function(opt_e) {
  if (this.isEventStopped(goog.editor.Field.EventType.SELECTIONCHANGE)) {
    return;
  }

  // The selection is editable only if the selection is inside the
  // editable field.
  var range = this.getRange();
  var rangeContainer = range && range.getContainerElement();
  this.isSelectionEditable_ = !!rangeContainer &&
      goog.dom.contains(this.getElement(), rangeContainer);

  this.dispatchCommandValueChange();
  this.dispatchEvent({
    type: goog.editor.Field.EventType.SELECTIONCHANGE,
    originalType: opt_e && opt_e.type
  });

  this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.SELECTION, opt_e);
};


/**
 * This dispatches the beforechange event on the editable field
 */
goog.editor.Field.prototype.dispatchBeforeChange = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.BEFORECHANGE)) {
    return;
  }

  this.dispatchEvent(goog.editor.Field.EventType.BEFORECHANGE);
};


/**
 * This dispatches the beforetab event on the editable field. If this event is
 * cancelled, then the default tab behavior is prevented.
 * @param {goog.events.BrowserEvent} e The tab event.
 * @private
 * @return {boolean} The result of dispatchEvent.
 */
goog.editor.Field.prototype.dispatchBeforeTab_ = function(e) {
  return this.dispatchEvent({
    type: goog.editor.Field.EventType.BEFORETAB,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
    ctrlKey: e.ctrlKey
  });
};


/**
 * Temporarily ignore change events. If the time has already been set, it will
 * fire immediately now.  Further setting of the timer is stopped and
 * dispatching of events is stopped until startChangeEvents is called.
 * @param {boolean=} opt_stopChange Whether to ignore base change events.
 * @param {boolean=} opt_stopDelayedChange Whether to ignore delayed change
 *     events.
 */
goog.editor.Field.prototype.stopChangeEvents = function(opt_stopChange,
    opt_stopDelayedChange) {
  if (opt_stopChange) {
    if (this.changeTimerGecko_) {
      this.changeTimerGecko_.fireIfActive();
    }

    this.stopEvent(goog.editor.Field.EventType.CHANGE);
  }
  if (opt_stopDelayedChange) {
    this.clearDelayedChange();
    this.stopEvent(goog.editor.Field.EventType.DELAYEDCHANGE);
  }
};


/**
 * Start change events again and fire once if desired.
 * @param {boolean=} opt_fireChange Whether to fire the change event
 *      immediately.
 * @param {boolean=} opt_fireDelayedChange Whether to fire the delayed change
 *      event immediately.
 */
goog.editor.Field.prototype.startChangeEvents = function(opt_fireChange,
    opt_fireDelayedChange) {

  if (!opt_fireChange && this.changeTimerGecko_) {
    // In the case where change events were stopped and we're not firing
    // them on start, the user was trying to suppress all change or delayed
    // change events. Clear the change timer now while the events are still
    // stopped so that its firing doesn't fire a stopped change event, or
    // queue up a delayed change event that we were trying to stop.
    this.changeTimerGecko_.fireIfActive();
  }

  this.startEvent(goog.editor.Field.EventType.CHANGE);
  this.startEvent(goog.editor.Field.EventType.DELAYEDCHANGE);
  if (opt_fireChange) {
    this.handleChange();
  }

  if (opt_fireDelayedChange) {
    this.dispatchDelayedChange_();
  }
};


/**
 * Stops the event of the given type from being dispatched.
 * @param {goog.editor.Field.EventType} eventType type of event to stop.
 */
goog.editor.Field.prototype.stopEvent = function(eventType) {
  this.stoppedEvents_[eventType] = 1;
};


/**
 * Re-starts the event of the given type being dispatched, if it had
 * previously been stopped with stopEvent().
 * @param {goog.editor.Field.EventType} eventType type of event to start.
 */
goog.editor.Field.prototype.startEvent = function(eventType) {
  // Toggling this bit on/off instead of deleting it/re-adding it
  // saves array allocations.
  this.stoppedEvents_[eventType] = 0;
};


/**
 * Block an event for a short amount of time. Intended
 * for the situation where an event pair fires in quick succession
 * (e.g., mousedown/mouseup, keydown/keyup, focus/blur),
 * and we want the second event in the pair to get "debounced."
 *
 * WARNING: This should never be used to solve race conditions or for
 * mission-critical actions. It should only be used for UI improvements,
 * where it's okay if the behavior is non-deterministic.
 *
 * @param {goog.editor.Field.EventType} eventType type of event to debounce.
 */
goog.editor.Field.prototype.debounceEvent = function(eventType) {
  this.debouncedEvents_[eventType] = goog.now();
};


/**
 * Checks if the event of the given type has stopped being dispatched
 * @param {goog.editor.Field.EventType} eventType type of event to check.
 * @return {boolean} true if the event has been stopped with stopEvent().
 * @protected
 */
goog.editor.Field.prototype.isEventStopped = function(eventType) {
  return !!this.stoppedEvents_[eventType] ||
      (this.debouncedEvents_[eventType] &&
       (goog.now() - this.debouncedEvents_[eventType] <=
        goog.editor.Field.DEBOUNCE_TIME_MS_));
};


/**
 * Calls a function to manipulate the dom of this field. This method should be
 * used whenever Trogedit clients need to modify the dom of the field, so that
 * delayed change events are handled appropriately. Extra delayed change events
 * will cause undesired states to be added to the undo-redo stack. This method
 * will always fire at most one delayed change event, depending on the value of
 * {@code opt_preventDelayedChange}.
 *
 * @param {function()} func The function to call that will manipulate the dom.
 * @param {boolean=} opt_preventDelayedChange Whether delayed change should be
 *      prevented after calling {@code func}. Defaults to always firing
 *      delayed change.
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 */
goog.editor.Field.prototype.manipulateDom = function(func,
    opt_preventDelayedChange, opt_handler) {

  this.stopChangeEvents(true, true);
  // We don't want any problems with the passed in function permanently
  // stopping change events. That would break Trogedit.
  try {
    func.call(opt_handler);
  } finally {
    // If the field isn't loaded then change and delayed change events will be
    // started as part of the onload behavior.
    if (this.isLoaded()) {
      // We assume that func always modified the dom and so fire a single change
      // event. Delayed change is only fired if not prevented by the user.
      if (opt_preventDelayedChange) {
        this.startEvent(goog.editor.Field.EventType.CHANGE);
        this.handleChange();
        this.startEvent(goog.editor.Field.EventType.DELAYEDCHANGE);
      } else {
        this.dispatchChange();
      }
    }
  }
};


/**
 * Dispatches a command value change event.
 * @param {Array.<string>=} opt_commands Commands whose state has
 *     changed.
 */
goog.editor.Field.prototype.dispatchCommandValueChange =
    function(opt_commands) {
  if (opt_commands) {
    this.dispatchEvent({
      type: goog.editor.Field.EventType.COMMAND_VALUE_CHANGE,
      commands: opt_commands
    });
  } else {
    this.dispatchEvent(goog.editor.Field.EventType.COMMAND_VALUE_CHANGE);
  }
};


/**
 * Dispatches the appropriate set of change events. This only fires
 * synchronous change events in blended-mode, iframe-using mozilla. It just
 * starts the appropriate timer for goog.editor.Field.EventType.DELAYEDCHANGE.
 * This also starts up change events again if they were stopped.
 *
 * @param {boolean=} opt_noDelay True if
 *      goog.editor.Field.EventType.DELAYEDCHANGE should be fired syncronously.
 */
goog.editor.Field.prototype.dispatchChange = function(opt_noDelay) {
  this.startChangeEvents(true, opt_noDelay);
};


/**
 * Handle a change in the Editable Field.  Marks the field has modified,
 * dispatches the change event on the editable field (moz only), starts the
 * timer for the delayed change event.  Note that these actions only occur if
 * the proper events are not stopped.
 */
goog.editor.Field.prototype.handleChange = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.CHANGE)) {
    return;
  }

  // Clear the changeTimerGecko_ if it's active, since any manual call to
  // handle change is equiavlent to changeTimerGecko_.fire().
  if (this.changeTimerGecko_) {
    this.changeTimerGecko_.stop();
  }

  this.isModified_ = true;
  this.isEverModified_ = true;

  if (this.isEventStopped(goog.editor.Field.EventType.DELAYEDCHANGE)) {
    return;
  }

  this.delayedChangeTimer_.start();
};


/**
 * Dispatch a delayed change event.
 * @private
 */
goog.editor.Field.prototype.dispatchDelayedChange_ = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.DELAYEDCHANGE)) {
    return;
  }
  // Clear the delayedChangeTimer_ if it's active, since any manual call to
  // dispatchDelayedChange_ is equivalent to delayedChangeTimer_.fire().
  this.delayedChangeTimer_.stop();
  this.isModified_ = false;
  this.dispatchEvent(goog.editor.Field.EventType.DELAYEDCHANGE);
};


/**
 * Don't wait for the timer and just fire the delayed change event if it's
 * pending.
 */
goog.editor.Field.prototype.clearDelayedChange = function() {
  // The changeTimerGecko_ will queue up a delayed change so to fully clear
  // delayed change we must also clear this timer.
  if (this.changeTimerGecko_) {
    this.changeTimerGecko_.fireIfActive();
  }
  this.delayedChangeTimer_.fireIfActive();
};


/**
 * Dispatch beforefocus and focus for FF. Note that both of these actually
 * happen in the document's "focus" event. Unfortunately, we don't actually
 * have a way of getting in before the focus event in FF (boo! hiss!).
 * In IE, we use onfocusin for before focus and onfocus for focus.
 * @private
 */
goog.editor.Field.prototype.dispatchFocusAndBeforeFocus_ = function() {
  this.dispatchBeforeFocus_();
  this.dispatchFocus_();
};


/**
 * Dispatches a before focus event.
 * @private
 */
goog.editor.Field.prototype.dispatchBeforeFocus_ = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.BEFOREFOCUS)) {
    return;
  }

  this.execCommand(goog.editor.Command.CLEAR_LOREM, true);
  this.dispatchEvent(goog.editor.Field.EventType.BEFOREFOCUS);
};


/**
 * Dispatches a focus event.
 * @private
 */
goog.editor.Field.prototype.dispatchFocus_ = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.FOCUS)) {
    return;
  }
  goog.editor.Field.setActiveFieldId(this.id);

  this.isSelectionEditable_ = true;

  this.dispatchEvent(goog.editor.Field.EventType.FOCUS);

  if (goog.editor.BrowserFeature.
      PUTS_CURSOR_BEFORE_FIRST_BLOCK_ELEMENT_ON_FOCUS) {
    // If the cursor is at the beginning of the field, make sure that it is
    // in the first user-visible line break, e.g.,
    // no selection: <div><p>...</p></div> --> <div><p>|cursor|...</p></div>
    // <div>|cursor|<p>...</p></div> --> <div><p>|cursor|...</p></div>
    // <body>|cursor|<p>...</p></body> --> <body><p>|cursor|...</p></body>
    var field = this.getElement();
    var range = this.getRange();

    if (range) {
      var focusNode = range.getFocusNode();
      if (range.getFocusOffset() == 0 && (!focusNode || focusNode == field ||
          focusNode.tagName == goog.dom.TagName.BODY)) {
        goog.editor.range.selectNodeStart(field);
      }
    }
  }

  if (!goog.editor.BrowserFeature.CLEARS_SELECTION_WHEN_FOCUS_LEAVES &&
      this.usesIframe()) {
    var parent = this.getEditableDomHelper().getWindow().parent;
    parent.getSelection().removeAllRanges();
  }
};


/**
 * Dispatches a blur event.
 * @protected
 */
goog.editor.Field.prototype.dispatchBlur = function() {
  if (this.isEventStopped(goog.editor.Field.EventType.BLUR)) {
    return;
  }

  // Another field may have already been registered as active, so only
  // clear out the active field id if we still think this field is active.
  if (goog.editor.Field.getActiveFieldId() == this.id) {
    goog.editor.Field.setActiveFieldId(null);
  }

  this.isSelectionEditable_ = false;
  this.dispatchEvent(goog.editor.Field.EventType.BLUR);
};


/**
 * @return {boolean} Whether the selection is editable.
 */
goog.editor.Field.prototype.isSelectionEditable = function() {
  return this.isSelectionEditable_;
};


/**
 * Event handler for clicks in browsers that will follow a link when the user
 * clicks, even if it's editable. We stop the click manually
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.editor.Field.cancelLinkClick_ = function(e) {
  if (goog.dom.getAncestorByTagNameAndClass(e.target, goog.dom.TagName.A)) {
    e.preventDefault();
  }
};


/**
 * Handle mouse down inside the editable field.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.editor.Field.prototype.handleMouseDown_ = function(e) {
  // If the user clicks on an object (like an image) in the field
  // and the activeField is not set, set it.
  if (!goog.editor.Field.getActiveFieldId()) {
    goog.editor.Field.setActiveFieldId(this.id);
  }

  // Open links in a new window if the user control + clicks.
  if (goog.userAgent.IE) {
    var targetElement = e.target;
    if (targetElement &&
        targetElement.tagName == goog.dom.TagName.A && e.ctrlKey) {
      this.originalDomHelper.getWindow().open(targetElement.href);
    }
  }
};


/**
 * Handle mouse up inside the editable field.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.editor.Field.prototype.handleMouseUp_ = function(e) {
  /*
   * We fire a selection change event immediately for listeners that depend on
   * the native browser event object (e).  On IE, a listener that tries to
   * retrieve the selection with goog.dom.Range may see an out-of-date
   * selection range.
   */
  this.dispatchSelectionChangeEvent(e);
  if (goog.userAgent.IE) {
    /*
     * Fire a second selection change event for listeners that need an
     * up-to-date selection range.  This event will not include a native
     * event object.
     */
    this.selectionChangeTimer_.start();
  }
};


/**
 * Retrieve the HTML contents of a field.
 *
 * Do NOT just get the innerHTML of a field directly--there's a lot of
 * processing that needs to happen.
  * @return {string} The scrubbed contents of the field.
 */
goog.editor.Field.prototype.getCleanContents = function() {
  if (this.queryCommandValue(goog.editor.Command.USING_LOREM)) {
    return goog.string.Unicode.NBSP;
  }

  if (!this.isLoaded()) {
    // The field is uneditable, so it's ok to read contents directly.
    var elem = this.getOriginalElement();
    if (!elem) {
      this.logger.shout("Couldn't get the field element to read the contents");
    }
    return elem.innerHTML;
  }

  var fieldCopy = this.getFieldCopy();

  // Allow the plugins to handle their cleanup.
  this.invokeOp_(goog.editor.Plugin.Op.CLEAN_CONTENTS_DOM, fieldCopy);
  return this.reduceOp_(
      goog.editor.Plugin.Op.CLEAN_CONTENTS_HTML, fieldCopy.innerHTML);
};


/**
 * Get the copy of the editable field element, which has the innerHTML set
 * correctly.
 * @return {Element} The copy of the editable field.
 * @protected
 */
goog.editor.Field.prototype.getFieldCopy = function() {
  var field = this.getElement();
  // Deep cloneNode strips some script tag contents in IE, so we do this.
  var fieldCopy = /** @type {Element} */(field.cloneNode(false));

  // For some reason, when IE sets innerHtml of the cloned node, it strips
  // script tags that fall at the beginning of an element. Appending a
  // non-breaking space prevents this.
  var html = field.innerHTML;
  if (goog.userAgent.IE && html.match(/^\s*<script/i)) {
    html = goog.string.Unicode.NBSP + html;
  }
  fieldCopy.innerHTML = html;
  return fieldCopy;
};


/**
 * Sets the contents of the field.
 * @param {boolean} addParas Boolean to specify whether to add paragraphs
 *    to long fields.
 * @param {?string} html html to insert.  If html=null, then this defaults
 *    to a nsbp for mozilla and an empty string for IE.
 * @param {boolean=} opt_dontFireDelayedChange True to make this content change
 *    not fire a delayed change event.
 * @param {boolean=} opt_applyLorem Whether to apply lorem ipsum styles.
 */
goog.editor.Field.prototype.setHtml = function(
    addParas, html, opt_dontFireDelayedChange, opt_applyLorem) {
  if (this.isLoading()) {
    this.logger.severe("Can't set html while loading Trogedit");
    return;
  }

  // Clear the lorem ipsum style, always.
  if (opt_applyLorem) {
    this.execCommand(goog.editor.Command.CLEAR_LOREM);
  }

  if (html && addParas) {
    html = '<p>' + html + '</p>';
  }

  // If we don't want change events to fire, we have to turn off change events
  // before setting the field contents, since that causes mutation events.
  if (opt_dontFireDelayedChange) {
    this.stopChangeEvents(false, true);
  }

  this.setInnerHtml_(html);

  // Set the lorem ipsum style, if the element is empty.
  if (opt_applyLorem) {
    this.execCommand(goog.editor.Command.UPDATE_LOREM);
  }

  // TODO(user): This check should probably be moved to isEventStopped and
  // startEvent.
  if (this.isLoaded()) {
    if (opt_dontFireDelayedChange) { // Turn back on change events
      // We must fire change timer if necessary before restarting change events!
      // Otherwise, the change timer firing after we restart events will cause
      // the delayed change we were trying to stop. Flow:
      //   Stop delayed change
      //   setInnerHtml_, this starts the change timer
      //   start delayed change
      //   change timer fires
      //   starts delayed change timer since event was not stopped
      //   delayed change fires for the delayed change we tried to stop.
      if (goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
        this.changeTimerGecko_.fireIfActive();
      }
      this.startChangeEvents();
    } else { // Mark the document as changed and fire change events.
      this.dispatchChange();
    }
  }
};


/**
 * Sets the inner HTML of the field. Works on both editable and
 * uneditable fields.
 * @param {?string} html The new inner HTML of the field.
 * @private
 */
goog.editor.Field.prototype.setInnerHtml_ = function(html) {
  var field = this.getElement();
  if (field) {
    // Safari will put <style> tags into *new* <head> elements. When setting
    // HTML, we need to remove these spare <head>s to make sure there's a
    // clean slate, but keep the first <head>.
    // Note:  We punt on this issue for the non iframe case since
    // we don't want to screw with the main document.
    if (this.usesIframe() && goog.editor.BrowserFeature.MOVES_STYLE_TO_HEAD) {
      var heads = field.ownerDocument.getElementsByTagName('HEAD');
      for (var i = heads.length - 1; i >= 1; --i) {
        heads[i].parentNode.removeChild(heads[i]);
      }
    }
  } else {
    field = this.getOriginalElement();
  }

  if (field) {
    this.injectContents(html, field);
  }
};


/**
 * Attemps to turn on designMode for a document.  This function can fail under
 * certain circumstances related to the load event, and will throw an exception.
 * @protected
 */
goog.editor.Field.prototype.turnOnDesignModeGecko = function() {
  var doc = this.getEditableDomHelper().getDocument();

  // NOTE(nicksantos): This will fail under certain conditions, like
  // when the node has display: none. It's up to clients to ensure that
  // their fields are valid when they try to make them editable.
  doc.designMode = 'on';

  if (goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS) {
    doc.execCommand('styleWithCSS', false, false);
  }
};


/**
 * Installs styles if needed. Only writes styles when they can't be written
 * inline directly into the field.
 * @protected
 */
goog.editor.Field.prototype.installStyles = function() {
  if (this.cssStyles && this.shouldLoadAsynchronously()) {
    goog.style.installStyles(this.cssStyles, this.getElement());
  }
};


/**
 * Signal that the field is loaded and ready to use.  Change events now are
 * in effect.
 * @private
 */
goog.editor.Field.prototype.dispatchLoadEvent_ = function() {
  var field = this.getElement();

  // Apply workaround className if necessary, see goog.editor.Field constructor
  // for more details.
  if (this.workaroundClassName_) {
    goog.dom.classes.add(field, this.workaroundClassName_);
  }

  this.installStyles();
  this.startChangeEvents();
  this.logger.info('Dispatching load ' + this.id);
  this.dispatchEvent(goog.editor.Field.EventType.LOAD);
};


/**
 * @return {boolean} Whether the field is uneditable.
 */
goog.editor.Field.prototype.isUneditable = function() {
  return this.loadState_ == goog.editor.Field.LoadState_.UNEDITABLE;
};


/**
 * @return {boolean} Whether the field has finished loading.
 */
goog.editor.Field.prototype.isLoaded = function() {
  return this.loadState_ == goog.editor.Field.LoadState_.EDITABLE;
};


/**
 * @return {boolean} Whether the field is in the process of loading.
 */
goog.editor.Field.prototype.isLoading = function() {
  return this.loadState_ == goog.editor.Field.LoadState_.LOADING;
};


/**
 * Gives the field focus.
 */
goog.editor.Field.prototype.focus = function() {
  // TODO(user): This is actually the wrong codepath for focusing in WebKit
  // (WebKit doesn't focus when you do this), but putting WebKit on the "right"
  // codepath seems to cause test failures. We should figure out what's going on
  // so focus can work in WebKit and all the tests can pass.
  if (!goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE ||
      goog.userAgent.WEBKIT) {
    this.getEditableDomHelper().getWindow().focus();
  } else {
    if (goog.userAgent.OPERA) {
      // Opera will scroll to the bottom of the focused document, even
      // if it is contained in an iframe that is scrolled to the top and
      // the bottom flows past the end of it. To prevent this,
      // save the scroll position of the document containing the editor
      // iframe, then restore it after the focus.
      var scrollX = this.appWindow_.pageXOffset;
      var scrollY = this.appWindow_.pageYOffset;
    }
    var element = this.getElement();
    // Opera won't focus <body> in whitebox mode because we actually make
    // <html> contentEditable instead to work around some visual issues.
    // So we must focus <html> instead if <html> is the contentEditable
    // element.
    if (!goog.editor.BrowserFeature.FOCUSES_EDITABLE_BODY_ON_HTML_CLICK &&
        element.parentNode.contentEditable) {
      element = element.parentNode;
    }
    element.focus();
    if (goog.userAgent.OPERA) {
      this.appWindow_.scrollTo(
          /** @type {number} */ (scrollX), /** @type {number} */ (scrollY));
    }
  }
};


/**
 * Gives the field focus and places the cursor at the start of the field.
 */
goog.editor.Field.prototype.focusAndPlaceCursorAtStart = function() {
  // NOTE(user): Excluding Gecko to maintain existing behavior post refactoring
  // placeCursorAtStart into its own method. In Gecko browsers that currently
  // have a selection the existing selection will be restored, otherwise it
  // will go to the start.
  // TODO(user): Refactor the code using this and related methods. We should
  // only mess with the selection in the case where there is not an existing
  // selection in the field.
  if (goog.editor.BrowserFeature.HAS_IE_RANGES || goog.userAgent.WEBKIT) {
    this.placeCursorAtStart();
  }
  this.focus();
};


/**
 * Place the cursor at the start of this field. It's recommended that you only
 * use this method (and manipulate the selection in general) when there is not
 * an existing selection in the field.
 */
goog.editor.Field.prototype.placeCursorAtStart = function() {
  var field = this.getElement();
  if (field) {
    var cursorPosition = goog.editor.node.getLeftMostLeaf(field);
    if (field == cursorPosition) {
      // The leftmost leaf we found was the field element itself (which likely
      // means the field element is empty). We can't place the cursor next to
      // the field element, so just place it at the beginning.
      goog.dom.Range.createCaret(field, 0).select();
    } else {
      goog.editor.range.placeCursorNextTo(cursorPosition, true);
    }
    this.dispatchSelectionChangeEvent();
  }
};


/**
 * Makes a field editable.
 *
 * @param {string=} opt_iframeSrc URL to set the iframe src to if necessary.
 */
goog.editor.Field.prototype.makeEditable = function(opt_iframeSrc) {
  this.loadState_ = goog.editor.Field.LoadState_.LOADING;

  var field = this.getOriginalElement();

  // TODO: In the fieldObj, save the field's id, className, cssText
  // in order to reset it on closeField. That way, we can muck with the field's
  // css, id, class and restore to how it was at the end.
  this.nodeName = field.nodeName;
  this.savedClassName_ = field.className;
  this.setInitialStyle(field.style.cssText);

  field.className += ' editable';

  this.makeEditableInternal(opt_iframeSrc);
};


/**
 * Handles actually making something editable - creating necessary nodes,
 * injecting content, etc.
 * @param {string=} opt_iframeSrc URL to set the iframe src to if necessary.
 * @protected
 */
goog.editor.Field.prototype.makeEditableInternal = function(opt_iframeSrc) {
  this.makeIframeField_(opt_iframeSrc);
};


/**
 * Handle the loading of the field (e.g. once the field is ready to setup).
 * TODO(user): this should probably just be moved into dispatchLoadEvent_.
 * @protected
 */
goog.editor.Field.prototype.handleFieldLoad = function() {
  if (goog.userAgent.IE) {
    // This must happen AFTER the browser has realized contentEditable is
    // on.  This does not work if it directly follows the setting of the
    // contentEditable attribute.  It seems that doing the getElemById
    // above is enough to force IE to update its state.
    goog.dom.Range.clearSelection(this.editableDomHelper.getWindow());
  }

  if (goog.editor.Field.getActiveFieldId() != this.id) {
    this.execCommand(goog.editor.Command.UPDATE_LOREM);
  }

  this.setupChangeListeners_();
  this.dispatchLoadEvent_();

  // Enabling plugins after we fire the load event so that clients have a
  // chance to set initial field contents before we start mucking with
  // everything.
  for (var classId in this.plugins_) {
    this.plugins_[classId].enable(this);
  }
};


/**
 * Closes the field and cancels all pending change timers.  Note that this
 * means that if a change event has not fired yet, it will not fire.  Clients
 * should check fieldOj.isModified() if they depend on the final change event.
 * Throws an error if the field is already uneditable.
 *
 * @param {boolean=} opt_skipRestore True to prevent copying of editable field
 *     contents back into the original node.
 */
goog.editor.Field.prototype.makeUneditable = function(opt_skipRestore) {
  if (this.isUneditable()) {
    throw Error('makeUneditable: Field is already uneditable');
  }

  // Fire any events waiting on a timeout.
  // Clearing delayed change also clears changeTimerGecko_.
  this.clearDelayedChange();
  this.selectionChangeTimer_.fireIfActive();
  this.execCommand(goog.editor.Command.CLEAR_LOREM);

  var html = null;
  if (!opt_skipRestore && this.getElement()) {
    // Rest of cleanup is simpler if field was never initialized.
    html = this.getCleanContents();
  }

  // First clean up anything that happens in makeFieldEditable
  // (i.e. anything that needs cleanup even if field has not loaded).
  this.clearFieldLoadListener_();

  var field = this.getOriginalElement();
  if (goog.editor.Field.getActiveFieldId() == field.id) {
    goog.editor.Field.setActiveFieldId(null);
  }

  // Clear all listeners before removing the nodes from the dom - if
  // there are listeners on the iframe window, Firefox throws errors trying
  // to unlisten once the iframe is no longer in the dom.
  this.clearListeners_();

  // For fields that have loaded, clean up anything that happened in
  // handleFieldOpen or later.
  // If html is provided, copy it back and reset the properties on the field
  // so that the original node will have the same properties as it did before
  // it was made editable.
  if (goog.isString(html)) {
    field.innerHTML = html;
    this.resetOriginalElemProperties();
  }

  this.restoreDom();
  this.tearDownFieldObject_();

  // On Safari, make sure to un-focus the field so that the
  // native "current field" highlight style gets removed.
  if (goog.userAgent.WEBKIT) {
    field.blur();
  }

  this.execCommand(goog.editor.Command.UPDATE_LOREM);
  this.dispatchEvent(goog.editor.Field.EventType.UNLOAD);
};


/**
 * Restores the dom to how it was before being made editable.
 * @protected
 */
goog.editor.Field.prototype.restoreDom = function() {
  // TODO(user): Consider only removing the iframe if we are
  // restoring the original node, aka, if opt_html.
  var field = this.getOriginalElement();
  // TODO(robbyw): Consider throwing an error if !field.
  if (field) {
    // If the field is in the process of loading when it starts getting torn
    // up, the iframe will not exist.
    var iframe = this.getEditableIframe();
    if (iframe) {
      goog.dom.replaceNode(field, iframe);
    }
  }
};


/**
 * Returns true if the field needs to be loaded asynchrnously.
 * @return {boolean} True if loads are async.
 * @protected
 */
goog.editor.Field.prototype.shouldLoadAsynchronously = function() {
  if (!goog.isDef(this.isHttps_)) {
    this.isHttps_ = false;

    if (goog.userAgent.IE && this.usesIframe()) {
      // IE iframes need to load asynchronously if they are in https as we need
      // to set an actual src on the iframe and wait for it to load.

      // Find the top-most window we have access to and see if it's https.
      // Technically this could fail if we have an http frame in an https frame
      // on the same domain (or vice versa), but walking up the window heirarchy
      // to find the first window that has an http* protocol seems like
      // overkill.
      var win = this.originalDomHelper.getWindow();
      while (win != win.parent) {
        try {
          win = win.parent;
        } catch (e) {
          break;
        }
      }
      var loc = win.location;
      this.isHttps_ = loc.protocol == 'https:' &&
          loc.search.indexOf('nocheckhttps') == -1;
    }
  }
  return this.isHttps_;
};


/**
 * Start the editable iframe creation process for Mozilla or IE whitebox.
 * The iframes load asynchronously.
 *
 * @param {string=} opt_iframeSrc URL to set the iframe src to if necessary.
 * @private
 */
goog.editor.Field.prototype.makeIframeField_ = function(opt_iframeSrc) {
  var field = this.getOriginalElement();
  // TODO(robbyw): Consider throwing an error if !field.
  if (field) {
    var html = field.innerHTML;

    // Invoke prepareContentsHtml on all plugins to prepare html for editing.
    // Make sure this is done before calling this.attachFrame which removes the
    // original element from DOM tree. Plugins may assume that the original
    // element is still in its original position in DOM.
    var styles = {};
    html = this.reduceOp_(goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML,
        html, styles);

    var iframe = /** @type {HTMLIFrameElement} */(
        this.originalDomHelper.createDom(goog.dom.TagName.IFRAME,
            this.getIframeAttributes()));

    // TODO(nicksantos): Figure out if this is ever needed in SAFARI?
    // In IE over HTTPS we need to wait for a load event before we set up the
    // iframe, this is to prevent a security prompt or access is denied
    // errors.
    // NOTE(user): This hasn't been confirmed.  isHttps_ allows a query
    // param, nocheckhttps, which we can use to ascertain if this is actually
    // needed.  It was originally thought to be needed for IE6 SP1, but
    // errors have been seen in IE7 as well.
    if (this.shouldLoadAsynchronously()) {
      // onLoad is the function to call once the iframe is ready to continue
      // loading.
      var onLoad = goog.bind(this.iframeFieldLoadHandler, this, iframe,
          html, styles);

      this.fieldLoadListenerKey_ = goog.events.listen(iframe,
          goog.events.EventType.LOAD, onLoad, true);

      if (opt_iframeSrc) {
        iframe.src = opt_iframeSrc;
      }
    }

    this.attachIframe(iframe);

    // Only continue if its not IE HTTPS in which case we're waiting for load.
    if (!this.shouldLoadAsynchronously()) {
      this.iframeFieldLoadHandler(iframe, html, styles);
    }
  }
};


/**
 * Given the original field element, and the iframe that is destined to
 * become the editable field, styles them appropriately and add the iframe
 * to the dom.
 *
 * @param {HTMLIFrameElement} iframe The iframe element.
 * @protected
 * @notypecheck
 */
goog.editor.Field.prototype.attachIframe = function(iframe) {
  var field = this.getOriginalElement();
  // TODO(user): Why do we do these two lines .. and why whitebox only?
  iframe.className = field.className;
  iframe.id = field.id;
  goog.dom.replaceNode(iframe, field);
};


/**
 * @param {Object} extraStyles A map of extra styles.
 * @return {goog.editor.icontent.FieldFormatInfo} The FieldFormatInfo object for
 *     this field's configuration.
 * @protected
 * @notypecheck
 */
goog.editor.Field.prototype.getFieldFormatInfo = function(extraStyles) {
  var originalElement = this.getOriginalElement();
  var isStandardsMode = goog.editor.node.isStandardsMode(originalElement);

  return new goog.editor.icontent.FieldFormatInfo(
      this.id,
      isStandardsMode,
      false,
      false,
      extraStyles);
};


/**
 * Writes the html content into the iframe.  Handles writing any aditional
 * styling as well.
 * @param {HTMLIFrameElement} iframe Iframe to write contents into.
 * @param {string} innerHtml The html content to write into the iframe.
 * @param {Object} extraStyles A map of extra style attributes.
 * @protected
 */
goog.editor.Field.prototype.writeIframeContent = function(
    iframe, innerHtml, extraStyles) {
  var formatInfo = this.getFieldFormatInfo(extraStyles);

  if (this.shouldLoadAsynchronously()) {
    var doc = goog.dom.getFrameContentDocument(iframe);
    goog.editor.icontent.writeHttpsInitialIframe(formatInfo, doc, innerHtml);
  } else {
    var styleInfo = new goog.editor.icontent.FieldStyleInfo(
        this.getElement(), this.cssStyles);
    goog.editor.icontent.writeNormalInitialIframe(formatInfo, innerHtml,
        styleInfo, iframe);
  }
};


/**
 * The function to call when the editable iframe loads.
 *
 * @param {HTMLIFrameElement} iframe Iframe that just loaded.
 * @param {string} innerHtml Html to put inside the body of the iframe.
 * @param {Object} styles Property-value map of CSS styles to install on
 *     editable field.
 * @protected
 */
goog.editor.Field.prototype.iframeFieldLoadHandler = function(iframe,
    innerHtml, styles) {
  this.clearFieldLoadListener_();

  iframe.allowTransparency = 'true';
  this.writeIframeContent(iframe, innerHtml, styles);
  var doc = goog.dom.getFrameContentDocument(iframe);

  // Make sure to get this pointer after the doc.write as the doc.write
  // clobbers all the document contents.
  var body = doc.body;
  this.setupFieldObject(body);

  if (!goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) {
    this.turnOnDesignModeGecko();
  }

  this.handleFieldLoad();
};


/**
 * Clears fieldLoadListener for a field. Must be called even (especially?) if
 * the field is not yet loaded and therefore not in this.fieldMap_
 * @private
 */
goog.editor.Field.prototype.clearFieldLoadListener_ = function() {
  if (this.fieldLoadListenerKey_) {
    goog.events.unlistenByKey(this.fieldLoadListenerKey_);
    this.fieldLoadListenerKey_ = null;
  }
};


/**
 * @return {Object} Get the HTML attributes for this field's iframe.
 * @protected
 */
goog.editor.Field.prototype.getIframeAttributes = function() {
  var iframeStyle = 'padding:0;' + this.getOriginalElement().style.cssText;

  if (!goog.string.endsWith(iframeStyle, ';')) {
    iframeStyle += ';';
  }

  iframeStyle += 'background-color:white;';

  // Ensure that the iframe has default overflow styling.  If overflow is
  // set to auto, an IE rendering bug can occur when it tries to render a
  // table at the very bottom of the field, such that the table would cause
  // a scrollbar, that makes the entire field go blank.
  if (goog.userAgent.IE) {
    iframeStyle += 'overflow:visible;';
  }

  return { 'frameBorder': 0, 'style': iframeStyle };
};
