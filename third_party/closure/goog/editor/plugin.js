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
// All Rights Reserved.

/**
 * @fileoverview Abstract API for TrogEdit plugins.
 *
 * @see ../demos/editor/editor.html
 */

goog.provide('goog.editor.Plugin');

// TODO(user): Remove the dependency on goog.editor.Command asap. Currently only
// needed for execCommand issues with links.
goog.require('goog.events.EventTarget');
goog.require('goog.functions');
goog.require('goog.log');
goog.require('goog.object');
goog.require('goog.reflect');
goog.require('goog.userAgent');



/**
 * Abstract API for trogedit plugins.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.editor.Plugin = function() {
  goog.events.EventTarget.call(this);

  /**
   * Whether this plugin is enabled for the registered field object.
   * @type {boolean}
   * @private
   */
  this.enabled_ = this.activeOnUneditableFields();

  /**
   * The field object this plugin is attached to.
   * @type {goog.editor.Field}
   * @protected
   * @deprecated Use goog.editor.Plugin.getFieldObject and
   *     goog.editor.Plugin.setFieldObject.
   */
  this.fieldObject = null;

  /**
   * Indicates if this plugin should be automatically disposed when the
   * registered field is disposed. This should be changed to false for
   * plugins used as multi-field plugins.
   * @type {boolean}
   * @private
   */
  this.autoDispose_ = true;

  /**
   * The logger for this plugin.
   * @type {?goog.log.Logger}
   * @protected
   */
  this.logger = goog.log.getLogger('goog.editor.Plugin');

};
goog.inherits(goog.editor.Plugin, goog.events.EventTarget);


/**
 * @return {goog.dom.DomHelper?} The dom helper object associated with the
 *     currently active field.
 */
goog.editor.Plugin.prototype.getFieldDomHelper = function() {
  return this.getFieldObject() && this.getFieldObject().getEditableDomHelper();
};


/**
 * Sets the field object for use with this plugin.
 * @return {goog.editor.Field} The editable field object.
 * @protected
 * @suppress {deprecated} Until fieldObject can be made private.
 */
goog.editor.Plugin.prototype.getFieldObject = function() {
  return this.fieldObject;
};


/**
 * Sets the field object for use with this plugin.
 * @param {goog.editor.Field} fieldObject The editable field object.
 * @protected
 * @suppress {deprecated} Until fieldObject can be made private.
 */
goog.editor.Plugin.prototype.setFieldObject = function(fieldObject) {
  this.fieldObject = fieldObject;
};


/**
 * Registers the field object for use with this plugin.
 * @param {goog.editor.Field} fieldObject The editable field object.
 */
goog.editor.Plugin.prototype.registerFieldObject = function(fieldObject) {
  this.setFieldObject(fieldObject);
};


/**
 * Unregisters and disables this plugin for the current field object.
 * @param {goog.editor.Field} fieldObj The field object. For single-field
 *     plugins, this parameter is ignored.
 */
goog.editor.Plugin.prototype.unregisterFieldObject = function(fieldObj) {
  if (this.getFieldObject()) {
    this.disable(this.getFieldObject());
    this.setFieldObject(null);
  }
};


/**
 * Enables this plugin for the specified, registered field object. A field
 * object should only be enabled when it is loaded.
 * @param {goog.editor.Field} fieldObject The field object.
 */
goog.editor.Plugin.prototype.enable = function(fieldObject) {
  if (this.getFieldObject() == fieldObject) {
    this.enabled_ = true;
  } else {
    goog.log.error(
        this.logger, 'Trying to enable an unregistered field with ' +
            'this plugin.');
  }
};


/**
 * Disables this plugin for the specified, registered field object.
 * @param {goog.editor.Field} fieldObject The field object.
 */
goog.editor.Plugin.prototype.disable = function(fieldObject) {
  if (this.getFieldObject() == fieldObject) {
    this.enabled_ = false;
  } else {
    goog.log.error(
        this.logger, 'Trying to disable an unregistered field ' +
            'with this plugin.');
  }
};


/**
 * Returns whether this plugin is enabled for the field object.
 *
 * @param {goog.editor.Field} fieldObject The field object.
 * @return {boolean} Whether this plugin is enabled for the field object.
 */
goog.editor.Plugin.prototype.isEnabled = function(fieldObject) {
  return this.getFieldObject() == fieldObject ? this.enabled_ : false;
};


/**
 * Set if this plugin should automatically be disposed when the registered
 * field is disposed.
 * @param {boolean} autoDispose Whether to autoDispose.
 */
goog.editor.Plugin.prototype.setAutoDispose = function(autoDispose) {
  this.autoDispose_ = autoDispose;
};


/**
 * @return {boolean} Whether or not this plugin should automatically be disposed
 *     when it's registered field is disposed.
 */
goog.editor.Plugin.prototype.isAutoDispose = function() {
  return this.autoDispose_;
};


/**
 * @return {boolean} If true, field will not disable the command
 *     when the field becomes uneditable.
 */
goog.editor.Plugin.prototype.activeOnUneditableFields = goog.functions.FALSE;


/**
 * @param {string} command The command to check.
 * @return {boolean} If true, field will not dispatch change events
 *     for commands of this type. This is useful for "seamless" plugins like
 *     dialogs and lorem ipsum.
 */
goog.editor.Plugin.prototype.isSilentCommand = goog.functions.FALSE;


/** @override */
goog.editor.Plugin.prototype.disposeInternal = function() {
  if (this.getFieldObject()) {
    this.unregisterFieldObject(this.getFieldObject());
  }

  goog.editor.Plugin.superClass_.disposeInternal.call(this);
};


/**
 * @return {string} The ID unique to this plugin class. Note that different
 *     instances off the plugin share the same classId.
 */
goog.editor.Plugin.prototype.getTrogClassId;


/**
 * An enum of operations that plugins may support.
 * @enum {number}
 */
goog.editor.Plugin.Op = {
  KEYDOWN: 1,
  KEYPRESS: 2,
  KEYUP: 3,
  SELECTION: 4,
  SHORTCUT: 5,
  EXEC_COMMAND: 6,
  QUERY_COMMAND: 7,
  PREPARE_CONTENTS_HTML: 8,
  CLEAN_CONTENTS_HTML: 10,
  CLEAN_CONTENTS_DOM: 11
};


/**
 * A map from plugin operations to the names of the methods that
 * invoke those operations.
 */
goog.editor.Plugin.OPCODE =
    goog.object.transpose(goog.reflect.object(goog.editor.Plugin, {
      handleKeyDown: goog.editor.Plugin.Op.KEYDOWN,
      handleKeyPress: goog.editor.Plugin.Op.KEYPRESS,
      handleKeyUp: goog.editor.Plugin.Op.KEYUP,
      handleSelectionChange: goog.editor.Plugin.Op.SELECTION,
      handleKeyboardShortcut: goog.editor.Plugin.Op.SHORTCUT,
      execCommand: goog.editor.Plugin.Op.EXEC_COMMAND,
      queryCommandValue: goog.editor.Plugin.Op.QUERY_COMMAND,
      prepareContentsHtml: goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML,
      cleanContentsHtml: goog.editor.Plugin.Op.CLEAN_CONTENTS_HTML,
      cleanContentsDom: goog.editor.Plugin.Op.CLEAN_CONTENTS_DOM
    }));


/**
 * A set of op codes that run even on disabled plugins.
 */
goog.editor.Plugin.IRREPRESSIBLE_OPS = goog.object.createSet(
    goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML,
    goog.editor.Plugin.Op.CLEAN_CONTENTS_HTML,
    goog.editor.Plugin.Op.CLEAN_CONTENTS_DOM);


/**
 * Handles keydown. It is run before handleKeyboardShortcut and if it returns
 * true handleKeyboardShortcut will not be called.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @return {boolean} Whether the event was handled and thus should *not* be
 *     propagated to other plugins or handleKeyboardShortcut.
 */
goog.editor.Plugin.prototype.handleKeyDown;


/**
 * Handles keypress. It is run before handleKeyboardShortcut and if it returns
 * true handleKeyboardShortcut will not be called.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @return {boolean} Whether the event was handled and thus should *not* be
 *     propagated to other plugins or handleKeyboardShortcut.
 */
goog.editor.Plugin.prototype.handleKeyPress;


/**
 * Handles keyup.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @return {boolean} Whether the event was handled and thus should *not* be
 *     propagated to other plugins.
 */
goog.editor.Plugin.prototype.handleKeyUp;


/**
 * Handles selection change.
 * @param {!goog.events.BrowserEvent=} opt_e The browser event.
 * @param {!Node=} opt_target The node the selection changed to.
 * @return {boolean} Whether the event was handled and thus should *not* be
 *     propagated to other plugins.
 */
goog.editor.Plugin.prototype.handleSelectionChange;


/**
 * Handles keyboard shortcuts.  Preferred to using handleKey* as it will use
 * the proper event based on browser and will be more performant. If
 * handleKeyPress/handleKeyDown returns true, this will not be called. If the
 * plugin handles the shortcut, it is responsible for dispatching appropriate
 * events (change, selection change at the time of this comment). If the plugin
 * calls execCommand on the editable field, then execCommand already takes care
 * of dispatching events.
 * NOTE: For performance reasons this is only called when any key is pressed
 * in conjunction with ctrl/meta keys OR when a small subset of keys (defined
 * in goog.editor.Field.POTENTIAL_SHORTCUT_KEYCODES_) are pressed without
 * ctrl/meta keys. We specifically don't invoke it when altKey is pressed since
 * alt key is used in many i8n UIs to enter certain characters.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @param {string} key The key pressed.
 * @param {boolean} isModifierPressed Whether the ctrl/meta key was pressed or
 *     not.
 * @return {boolean} Whether the event was handled and thus should *not* be
 *     propagated to other plugins. We also call preventDefault on the event if
 *     the return value is true.
 */
goog.editor.Plugin.prototype.handleKeyboardShortcut;


/**
 * Handles execCommand. This default implementation handles dispatching
 * BEFORECHANGE, CHANGE, and SELECTIONCHANGE events, and calls
 * execCommandInternal to perform the actual command. Plugins that want to
 * do their own event dispatching should override execCommand, otherwise
 * it is preferred to only override execCommandInternal.
 *
 * This version of execCommand will only work for single field plugins.
 * Multi-field plugins must override execCommand.
 *
 * @param {string} command The command to execute.
 * @param {...*} var_args Any additional parameters needed to
 *     execute the command.
 * @return {*} The result of the execCommand, if any.
 */
goog.editor.Plugin.prototype.execCommand = function(command, var_args) {
  // TODO(user): Replace all uses of isSilentCommand with plugins that just
  // override this base execCommand method.
  var silent = this.isSilentCommand(command);
  if (!silent) {
    // Stop listening to mutation events in Firefox while text formatting
    // is happening.  This prevents us from trying to size the field in the
    // middle of an execCommand, catching the field in a strange intermediary
    // state where both replacement nodes and original nodes are appended to
    // the dom.  Note that change events get turned back on by
    // fieldObj.dispatchChange.
    if (goog.userAgent.GECKO) {
      this.getFieldObject().stopChangeEvents(true, true);
    }

    this.getFieldObject().dispatchBeforeChange();
  }

  try {
    var result = this.execCommandInternal.apply(this, arguments);
  } finally {
    // If the above execCommandInternal call throws an exception, we still need
    // to turn change events back on (see http://b/issue?id=1471355).
    // NOTE: If if you add to or change the methods called in this finally
    // block, please add them as expected calls to the unit test function
    // testExecCommandException().
    if (!silent) {
      // dispatchChange includes a call to startChangeEvents, which unwinds the
      // call to stopChangeEvents made before the try block.
      this.getFieldObject().dispatchChange();
      this.getFieldObject().dispatchSelectionChangeEvent();
    }
  }

  return result;
};


/**
 * Handles execCommand. This default implementation does nothing, and is
 * called by execCommand, which handles event dispatching. This method should
 * be overriden by plugins that don't need to do their own event dispatching.
 * If custom event dispatching is needed, execCommand shoul be overriden
 * instead.
 *
 * @param {string} command The command to execute.
 * @param {...*} var_args Any additional parameters needed to
 *     execute the command.
 * @return {*} The result of the execCommand, if any.
 * @protected
 */
goog.editor.Plugin.prototype.execCommandInternal;


/**
 * Gets the state of this command if this plugin serves that command.
 * @param {string} command The command to check.
 * @return {*} The value of the command.
 */
goog.editor.Plugin.prototype.queryCommandValue;


/**
 * Prepares the given HTML for editing. Strips out content that should not
 * appear in an editor, and normalizes content as appropriate. The inverse
 * of cleanContentsHtml.
 *
 * This op is invoked even on disabled plugins.
 *
 * @param {string} originalHtml The original HTML.
 * @param {Object} styles A map of strings. If the plugin wants to add
 *     any styles to the field element, it should add them as key-value
 *     pairs to this object.
 * @return {string} New HTML that's ok for editing.
 */
goog.editor.Plugin.prototype.prepareContentsHtml;


/**
 * Cleans the contents of the node passed to it. The node contents are modified
 * directly, and the modifications will subsequently be used, for operations
 * such as saving the innerHTML of the editor etc. Since the plugins act on
 * the DOM directly, this method can be very expensive.
 *
 * This op is invoked even on disabled plugins.
 *
 * @param {!Element} fieldCopy The copy of the editable field which
 *     needs to be cleaned up.
 */
goog.editor.Plugin.prototype.cleanContentsDom;


/**
 * Cleans the html contents of Trogedit. Both cleanContentsDom and
 * and cleanContentsHtml will be called on contents extracted from Trogedit.
 * The inverse of prepareContentsHtml.
 *
 * This op is invoked even on disabled plugins.
 *
 * @param {string} originalHtml The trogedit HTML.
 * @return {string} Cleaned-up HTML.
 */
goog.editor.Plugin.prototype.cleanContentsHtml;


/**
 * Whether the string corresponds to a command this plugin handles.
 * @param {string} command Command string to check.
 * @return {boolean} Whether the plugin handles this type of command.
 */
goog.editor.Plugin.prototype.isSupportedCommand = function(command) {
  return false;
};


/**
 * Saves the field's scroll position.  See b/7279077 for context.
 * Currently only does anything in Edge, since all other browsers
 * already seem to work correctly.
 * @return {function()} A function to restore the current scroll position.
 * @protected
 */
goog.editor.Plugin.prototype.saveScrollPosition = function() {
  if (this.getFieldObject() && goog.userAgent.EDGE) {
    var win = this.getFieldObject().getEditableDomHelper().getWindow();
    return win.scrollTo.bind(win, win.scrollX, win.scrollY);
  }
  return function() {};
};
