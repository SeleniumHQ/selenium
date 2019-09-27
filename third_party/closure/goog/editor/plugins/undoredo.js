// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Code for handling edit history (undo/redo).
 *
 */


goog.provide('goog.editor.plugins.UndoRedo');

goog.require('goog.dom');
goog.require('goog.dom.NodeOffset');
goog.require('goog.dom.Range');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.node');
goog.require('goog.editor.plugins.UndoRedoManager');
goog.require('goog.editor.plugins.UndoRedoState');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.log');
goog.require('goog.object');



/**
 * Encapsulates undo/redo logic using a custom undo stack (i.e. not browser
 * built-in). Browser built-in undo stacks are too flaky (e.g. IE's gets
 * clobbered on DOM modifications). Also, this allows interleaving non-editing
 * commands into the undo stack via the UndoRedoManager.
 *
 * @param {goog.editor.plugins.UndoRedoManager=} opt_manager An undo redo
 *    manager to be used by this plugin. If none is provided one is created.
 * @constructor
 * @extends {goog.editor.Plugin}
 */
goog.editor.plugins.UndoRedo = function(opt_manager) {
  goog.editor.Plugin.call(this);

  this.setUndoRedoManager(
      opt_manager || new goog.editor.plugins.UndoRedoManager());

  // Map of goog.editor.Field hashcode to goog.events.EventHandler
  this.eventHandlers_ = {};

  this.currentStates_ = {};

  /**
   * @type {?string}
   * @private
   */
  this.initialFieldChange_ = null;

  /**
   * A copy of {@code goog.editor.plugins.UndoRedo.restoreState} bound to this,
   * used by undo-redo state objects to restore the state of an editable field.
   * @type {Function}
   * @see goog.editor.plugins.UndoRedo#restoreState
   * @private
   */
  this.boundRestoreState_ = goog.bind(this.restoreState, this);
};
goog.inherits(goog.editor.plugins.UndoRedo, goog.editor.Plugin);


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.editor.plugins.UndoRedo.prototype.logger =
    goog.log.getLogger('goog.editor.plugins.UndoRedo');


/**
 * The {@code UndoState_} whose change is in progress, null if an undo or redo
 * is not in progress.
 *
 * @type {goog.editor.plugins.UndoRedo.UndoState_?}
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.inProgressUndo_ = null;


/**
 * The undo-redo stack manager used by this plugin.
 * @type {goog.editor.plugins.UndoRedoManager}
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.undoManager_;


/**
 * The key for the event listener handling state change events from the
 * undo-redo manager.
 * @type {goog.events.Key}
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.managerStateChangeKey_;


/**
 * Commands implemented by this plugin.
 * @enum {string}
 */
goog.editor.plugins.UndoRedo.COMMAND = {
  UNDO: '+undo',
  REDO: '+redo'
};


/**
 * Inverse map of execCommand strings to
 * {@link goog.editor.plugins.UndoRedo.COMMAND} constants. Used to determine
 * whether a string corresponds to a command this plugin handles in O(1) time.
 * @type {Object}
 * @private
 */
goog.editor.plugins.UndoRedo.SUPPORTED_COMMANDS_ =
    goog.object.transpose(goog.editor.plugins.UndoRedo.COMMAND);


/**
 * Set the max undo stack depth (not the real memory usage).
 * @param {number} depth Depth of the stack.
 */
goog.editor.plugins.UndoRedo.prototype.setMaxUndoDepth = function(depth) {
  this.undoManager_.setMaxUndoDepth(depth);
};


/**
 * Set the undo-redo manager used by this plugin. Any state on a previous
 * undo-redo manager is lost.
 * @param {goog.editor.plugins.UndoRedoManager} manager The undo-redo manager.
 */
goog.editor.plugins.UndoRedo.prototype.setUndoRedoManager = function(manager) {
  if (this.managerStateChangeKey_) {
    goog.events.unlistenByKey(this.managerStateChangeKey_);
  }

  this.undoManager_ = manager;
  this.managerStateChangeKey_ = goog.events.listen(
      this.undoManager_,
      goog.editor.plugins.UndoRedoManager.EventType.STATE_CHANGE,
      this.dispatchCommandValueChange_, false, this);
};


/**
 * Whether the string corresponds to a command this plugin handles.
 * @param {string} command Command string to check.
 * @return {boolean} Whether the string corresponds to a command
 *     this plugin handles.
 * @override
 */
goog.editor.plugins.UndoRedo.prototype.isSupportedCommand = function(command) {
  return command in goog.editor.plugins.UndoRedo.SUPPORTED_COMMANDS_;
};


/**
 * Unregisters and disables the fieldObject with this plugin. Thie does *not*
 * clobber the undo stack for the fieldObject though.
 * TODO(user): For the multifield version, we really should add a way to
 * ignore undo actions on field's that have been made uneditable.
 * This is probably as simple as skipping over entries in the undo stack
 * that have a hashcode of an uneditable field.
 * @param {goog.editor.Field} fieldObject The field to register with the plugin.
 * @override
 */
goog.editor.plugins.UndoRedo.prototype.unregisterFieldObject = function(
    fieldObject) {
  this.disable(fieldObject);
  this.setFieldObject(null);
};


/**
 * This is so subclasses can deal with multifield undo-redo.
 * @return {goog.editor.Field} The active field object for this field. This is
 *     the one registered field object for the single-plugin case and the
 *     focused field for the multi-field plugin case.
 */
goog.editor.plugins.UndoRedo.prototype.getCurrentFieldObject = function() {
  return this.getFieldObject();
};


/**
 * This is so subclasses can deal with multifield undo-redo.
 * @param {string} fieldHashCode The Field's hashcode.
 * @return {goog.editor.Field} The field object with the hashcode.
 */
goog.editor.plugins.UndoRedo.prototype.getFieldObjectForHash = function(
    fieldHashCode) {
  // With single field undoredo, there's only one Field involved.
  return this.getFieldObject();
};


/**
 * This is so subclasses can deal with multifield undo-redo.
 * @return {goog.editor.Field} Target for COMMAND_VALUE_CHANGE events.
 */
goog.editor.plugins.UndoRedo.prototype.getCurrentEventTarget = function() {
  return this.getFieldObject();
};


/** @override */
goog.editor.plugins.UndoRedo.prototype.enable = function(fieldObject) {
  if (this.isEnabled(fieldObject)) {
    return;
  }

  // Don't want pending delayed changes from when undo-redo was disabled
  // firing after undo-redo is enabled since they might cause undo-redo stack
  // updates.
  fieldObject.clearDelayedChange();

  var eventHandler = new goog.events.EventHandler(this);

  // TODO(user): From ojan during a code review:
  // The beforechange handler is meant to be there so you can grab the cursor
  // position *before* the change is made as that's where you want the cursor to
  // be after an undo.
  //
  // It kinda looks like updateCurrentState_ doesn't do that correctly right
  // now, but it really should be fixed to do so. The cursor position stored in
  // the state should be the cursor position before any changes are made, not
  // the cursor position when the change finishes.
  //
  // It also seems like the if check below is just a bad one. We should do this
  // for browsers that use mutation events as well even though the beforechange
  // happens too late...maybe not. I don't know about this.
  if (!goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
    // We don't listen to beforechange in mutation-event browsers because
    // there we fire beforechange, then syncronously file change. The point
    // of before change is to capture before the user has changed anything.
    eventHandler.listen(
        fieldObject, goog.editor.Field.EventType.BEFORECHANGE,
        this.handleBeforeChange_);
  }
  eventHandler.listen(
      fieldObject, goog.editor.Field.EventType.DELAYEDCHANGE,
      this.handleDelayedChange_);
  eventHandler.listen(
      fieldObject, goog.editor.Field.EventType.BLUR, this.handleBlur_);

  this.eventHandlers_[fieldObject.getHashCode()] = eventHandler;

  // We want to capture the initial state of a Trogedit field before any
  // editing has happened. This is necessary so that we can undo the first
  // change to a field, even if we don't handle beforeChange.
  this.updateCurrentState_(fieldObject);
};


/** @override */
goog.editor.plugins.UndoRedo.prototype.disable = function(fieldObject) {
  // Process any pending changes so we don't lose any undo-redo states that we
  // want prior to disabling undo-redo.
  fieldObject.clearDelayedChange();

  var eventHandler = this.eventHandlers_[fieldObject.getHashCode()];
  if (eventHandler) {
    eventHandler.dispose();
    delete this.eventHandlers_[fieldObject.getHashCode()];
  }

  // We delete the current state of the field on disable. When we re-enable
  // the state will be re-fetched. In most cases the content will be the same,
  // but this allows us to pick up changes while not editable. That way, when
  // undoing after starting an editable session, you can always undo to the
  // state you started in. Given this sequence of events:
  // Make editable
  // Type 'anakin'
  // Make not editable
  // Set HTML to be 'padme'
  // Make editable
  // Type 'dark side'
  // Undo
  // Without re-snapshoting current state on enable, the undo would go from
  // 'dark-side' -> 'anakin', rather than 'dark-side' -> 'padme'. You couldn't
  // undo the field to the state that existed immediately after it was made
  // editable for the second time.
  if (this.currentStates_[fieldObject.getHashCode()]) {
    delete this.currentStates_[fieldObject.getHashCode()];
  }
};


/** @override */
goog.editor.plugins.UndoRedo.prototype.isEnabled = function(fieldObject) {
  // All enabled plugins have a eventHandler so reuse that map rather than
  // storing additional enabled state.
  return !!this.eventHandlers_[fieldObject.getHashCode()];
};


/** @override */
goog.editor.plugins.UndoRedo.prototype.disposeInternal = function() {
  goog.editor.plugins.UndoRedo.superClass_.disposeInternal.call(this);

  for (var hashcode in this.eventHandlers_) {
    this.eventHandlers_[hashcode].dispose();
    delete this.eventHandlers_[hashcode];
  }
  this.setFieldObject(null);

  if (this.undoManager_) {
    this.undoManager_.dispose();
    delete this.undoManager_;
  }
};


/** @override */
goog.editor.plugins.UndoRedo.prototype.getTrogClassId = function() {
  return 'UndoRedo';
};


/** @override */
goog.editor.plugins.UndoRedo.prototype.execCommand = function(
    command, var_args) {
  if (command == goog.editor.plugins.UndoRedo.COMMAND.UNDO) {
    this.undoManager_.undo();
  } else if (command == goog.editor.plugins.UndoRedo.COMMAND.REDO) {
    this.undoManager_.redo();
  }
};


/** @override */
goog.editor.plugins.UndoRedo.prototype.queryCommandValue = function(command) {
  var state = null;
  if (command == goog.editor.plugins.UndoRedo.COMMAND.UNDO) {
    state = this.undoManager_.hasUndoState();
  } else if (command == goog.editor.plugins.UndoRedo.COMMAND.REDO) {
    state = this.undoManager_.hasRedoState();
  }
  return state;
};


/**
 * Dispatches the COMMAND_VALUE_CHANGE event on the editable field or the field
 * manager, as appropriate.
 * Note: Really, people using multi field mode should be listening directly
 * to the undo-redo manager for events.
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.dispatchCommandValueChange_ =
    function() {
  var eventTarget = this.getCurrentEventTarget();
  eventTarget.dispatchEvent({
    type: goog.editor.Field.EventType.COMMAND_VALUE_CHANGE,
    commands: [
      goog.editor.plugins.UndoRedo.COMMAND.REDO,
      goog.editor.plugins.UndoRedo.COMMAND.UNDO
    ]
  });
};


/**
 * Restores the state of the editable field.
 * @param {goog.editor.plugins.UndoRedo.UndoState_} state The state initiating
 *    the restore.
 * @param {string} content The content to restore.
 * @param {goog.editor.plugins.UndoRedo.CursorPosition_?} cursorPosition
 *     The cursor position within the content.
 */
goog.editor.plugins.UndoRedo.prototype.restoreState = function(
    state, content, cursorPosition) {
  // Fire any pending changes to get the current field state up to date and
  // then stop listening to changes while doing the undo/redo.
  var fieldObj = this.getFieldObjectForHash(state.fieldHashCode);
  if (!fieldObj) {
    return;
  }

  // Fires any pending changes, and stops the change events. Still want to
  // dispatch before change, as a change is being made and the change event
  // will be manually dispatched below after the new content has been restored
  // (also restarting change events).
  fieldObj.stopChangeEvents(true, true);

  // To prevent the situation where we stop change events and then an exception
  // happens before we can restart change events, the following code must be in
  // a try-finally block.
  try {
    fieldObj.dispatchBeforeChange();

    // Restore the state
    fieldObj.execCommand(goog.editor.Command.CLEAR_LOREM, true);

    // We specifically set the raw innerHTML of the field here as that's what
    // we get from the field when we save an undo/redo state. There's
    // no need to clean/unclean the contents in either direction.
    goog.editor.node.replaceInnerHtml(fieldObj.getElement(), content);

    if (cursorPosition) {
      cursorPosition.select();
    }

    var previousFieldObject = this.getCurrentFieldObject();
    fieldObj.focus();

    // Apps that integrate their undo-redo with Trogedit may be
    // in a state where there is no previous field object (no field focused at
    // the time of undo), so check for existence first.
    if (previousFieldObject &&
        previousFieldObject.getHashCode() != state.fieldHashCode) {
      previousFieldObject.execCommand(goog.editor.Command.UPDATE_LOREM);
    }

    // We need to update currentState_ to reflect the change.
    this.currentStates_[state.fieldHashCode].setUndoState(
        content, cursorPosition);
  } catch (e) {
    goog.log.error(this.logger, 'Error while restoring undo state', e);
  } finally {
    // Clear the delayed change event, set flag so we know not to act on it.
    this.inProgressUndo_ = state;
    // Notify the editor that we've changed (fire autosave).
    // Note that this starts up change events again, so we don't have to
    // manually do so even though we stopped change events above.
    fieldObj.dispatchChange();
    fieldObj.dispatchSelectionChangeEvent();
  }
};


/**
 * @override
 */
goog.editor.plugins.UndoRedo.prototype.handleKeyboardShortcut = function(
    e, key, isModifierPressed) {
  if (isModifierPressed) {
    var command;
    if (key == 'z') {
      command = e.shiftKey ? goog.editor.plugins.UndoRedo.COMMAND.REDO :
                             goog.editor.plugins.UndoRedo.COMMAND.UNDO;
    } else if (key == 'y') {
      command = goog.editor.plugins.UndoRedo.COMMAND.REDO;
    }

    if (command) {
      // In the case where Trogedit shares its undo redo stack with another
      // application it's possible that an undo or redo will not be for an
      // goog.editor.Field. In this case we don't want to go through the
      // goog.editor.Field execCommand flow which stops and restarts events on
      // the current field. Only Trogedit UndoState's have a fieldHashCode so
      // use that to distinguish between Trogedit and other states.
      var state = command == goog.editor.plugins.UndoRedo.COMMAND.UNDO ?
          this.undoManager_.undoPeek() :
          this.undoManager_.redoPeek();
      if (state && state.fieldHashCode) {
        this.getCurrentFieldObject().execCommand(command);
      } else {
        this.execCommand(command);
      }

      return true;
    }
  }

  return false;
};


/**
 * Clear the undo/redo stack.
 */
goog.editor.plugins.UndoRedo.prototype.clearHistory = function() {
  // Fire all pending change events, so that they don't come back
  // asynchronously to fill the queue.
  this.getFieldObject().stopChangeEvents(true, true);
  this.undoManager_.clearHistory();
  this.getFieldObject().startChangeEvents();
};


/**
 * Refreshes the current state of the editable field as maintained by undo-redo,
 * without adding any undo-redo states to the stack.
 * @param {goog.editor.Field} fieldObject The editable field.
 */
goog.editor.plugins.UndoRedo.prototype.refreshCurrentState = function(
    fieldObject) {
  if (this.isEnabled(fieldObject)) {
    if (this.currentStates_[fieldObject.getHashCode()]) {
      delete this.currentStates_[fieldObject.getHashCode()];
    }
    this.updateCurrentState_(fieldObject);
  }
};


/**
 * Before the field changes, we want to save the state.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.handleBeforeChange_ = function(e) {
  if (this.inProgressUndo_) {
    // We are in between a previous undo and its delayed change event.
    // Continuing here clobbers the redo stack.
    // This does mean that if you are trying to undo/redo really quickly, it
    // will be gated by the speed of delayed change events.
    return;
  }

  var fieldObj = /** @type {goog.editor.Field} */ (e.target);
  var fieldHashCode = fieldObj.getHashCode();

  if (this.initialFieldChange_ != fieldHashCode) {
    this.initialFieldChange_ = fieldHashCode;
    this.updateCurrentState_(fieldObj);
  }
};


/**
 * After some idle time, we want to save the state.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.handleDelayedChange_ = function(e) {
  // This was undo making a change, don't add it BACK into the history
  if (this.inProgressUndo_) {
    // Must clear this.inProgressUndo_ before dispatching event because the
    // dispatch can cause another, queued undo that should be allowed to go
    // through.
    var state = this.inProgressUndo_;
    this.inProgressUndo_ = null;
    state.dispatchEvent(goog.editor.plugins.UndoRedoState.ACTION_COMPLETED);
    return;
  }

  this.updateCurrentState_(/** @type {goog.editor.Field} */ (e.target));
};


/**
 * When the user blurs away, we need to save the state on that field.
 * @param {goog.events.Event} e The event.
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.handleBlur_ = function(e) {
  var fieldObj = /** @type {goog.editor.Field} */ (e.target);
  if (fieldObj) {
    fieldObj.clearDelayedChange();
  }
};


/**
 * Returns the goog.editor.plugins.UndoRedo.CursorPosition_ for the current
 * selection in the given Field.
 * @param {goog.editor.Field} fieldObj The field object.
 * @return {goog.editor.plugins.UndoRedo.CursorPosition_} The CursorPosition_ or
 *    null if there is no valid selection.
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.getCursorPosition_ = function(fieldObj) {
  var cursorPos = new goog.editor.plugins.UndoRedo.CursorPosition_(fieldObj);
  if (!cursorPos.isValid()) {
    return null;
  }
  return cursorPos;
};


/**
 * Helper method for saving state.
 * @param {goog.editor.Field} fieldObj The field object.
 * @private
 */
goog.editor.plugins.UndoRedo.prototype.updateCurrentState_ = function(
    fieldObj) {
  var fieldHashCode = fieldObj.getHashCode();
  // We specifically grab the raw innerHTML of the field here as that's what
  // we would set on the field in the case of an undo/redo operation. There's
  // no need to clean/unclean the contents in either direction. In the case of
  // lorem ipsum being used, we want to capture the effective state (empty, no
  // cursor position) rather than capturing the lorem html.
  var content, cursorPos;
  if (fieldObj.queryCommandValue(goog.editor.Command.USING_LOREM)) {
    content = '';
    cursorPos = null;
  } else {
    content = fieldObj.getElement().innerHTML;
    cursorPos = this.getCursorPosition_(fieldObj);
  }

  var currentState = this.currentStates_[fieldHashCode];
  if (currentState) {
    // Don't create states if the content hasn't changed (spurious
    // delayed change). This can happen when lorem is cleared, for example.
    if (currentState.undoContent_ == content) {
      return;
    } else if (content == '' || currentState.undoContent_ == '') {
      // If lorem ipsum is on we say the contents are the empty string. However,
      // for an empty text shape with focus, the empty contents might not be
      // the same, depending on plugins. We want these two empty states to be
      // considered identical because to the user they are indistinguishable,
      // so we use fieldObj.getInjectableContents to map between them.
      // We cannot use getInjectableContents when first creating the undo
      // content for a field with lorem, because on enable when this is first
      // called we can't guarantee plugin registration order, so the
      // injectableContents at that time might not match the final
      // injectableContents.
      var emptyContents = fieldObj.getInjectableContents('', {});
      if (content == emptyContents && currentState.undoContent_ == '' ||
          currentState.undoContent_ == emptyContents && content == '') {
        return;
      }
    }

    currentState.setRedoState(content, cursorPos);
    this.undoManager_.addState(currentState);
  }

  this.currentStates_[fieldHashCode] =
      new goog.editor.plugins.UndoRedo.UndoState_(
          fieldHashCode, content, cursorPos, this.boundRestoreState_);
};



/**
 * This object encapsulates the state of an editable field.
 *
 * @param {string} fieldHashCode String the id of the field we're saving the
 *     content of.
 * @param {string} content String the actual text we're saving.
 * @param {goog.editor.plugins.UndoRedo.CursorPosition_?} cursorPosition
 *     CursorPosLite object for the cursor position in the field.
 * @param {Function} restore The function used to restore editable field state.
 * @private
 * @constructor
 * @extends {goog.editor.plugins.UndoRedoState}
 */
goog.editor.plugins.UndoRedo.UndoState_ = function(
    fieldHashCode, content, cursorPosition, restore) {
  goog.editor.plugins.UndoRedoState.call(this, true);

  /**
   * The hash code for the field whose content is being saved.
   * @type {string}
   */
  this.fieldHashCode = fieldHashCode;

  /**
   * The bound copy of {@code goog.editor.plugins.UndoRedo.restoreState} used by
   * this state.
   * @type {Function}
   * @private
   */
  this.restore_ = restore;

  this.setUndoState(content, cursorPosition);
};
goog.inherits(
    goog.editor.plugins.UndoRedo.UndoState_, goog.editor.plugins.UndoRedoState);


/**
 * The content to restore on undo.
 * @type {string}
 * @private
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.undoContent_;


/**
 * The cursor position to restore on undo.
 * @type {goog.editor.plugins.UndoRedo.CursorPosition_?}
 * @private
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.undoCursorPosition_;


/**
 * The content to restore on redo, undefined until the state is pushed onto the
 * undo stack.
 * @type {string|undefined}
 * @private
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.redoContent_;


/**
 * The cursor position to restore on redo, undefined until the state is pushed
 * onto the undo stack.
 * @type {goog.editor.plugins.UndoRedo.CursorPosition_|null|undefined}
 * @private
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.redoCursorPosition_;


/**
 * Performs the undo operation represented by this state.
 * @override
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.undo = function() {
  this.restore_(this, this.undoContent_, this.undoCursorPosition_);
};


/**
 * Performs the redo operation represented by this state.
 * @override
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.redo = function() {
  this.restore_(this, this.redoContent_, this.redoCursorPosition_);
};


/**
 * Updates the undo portion of this state. Should only be used to update the
 * current state of an editable field, which is not yet on the undo stack after
 * an undo or redo operation. You should never be modifying states on the stack!
 * @param {string} content The current content.
 * @param {goog.editor.plugins.UndoRedo.CursorPosition_?} cursorPosition
 *     The current cursor position.
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.setUndoState = function(
    content, cursorPosition) {
  this.undoContent_ = content;
  this.undoCursorPosition_ = cursorPosition;
};


/**
 * Adds redo information to this state. This method should be called before the
 * state is added onto the undo stack.
 *
 * @param {string} content The content to restore on a redo.
 * @param {goog.editor.plugins.UndoRedo.CursorPosition_?} cursorPosition
 *     The cursor position to restore on a redo.
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.setRedoState = function(
    content, cursorPosition) {
  this.redoContent_ = content;
  this.redoCursorPosition_ = cursorPosition;
};


/**
 * Checks if the *contents* of two
 * {@code goog.editor.plugins.UndoRedo.UndoState_}s are the same.  We don't
 * bother checking the cursor position (that's not something we'd want to save
 * anyway).
 * @param {goog.editor.plugins.UndoRedoState} rhs The state to compare.
 * @return {boolean} Whether the contents are the same.
 * @override
 */
goog.editor.plugins.UndoRedo.UndoState_.prototype.equals = function(rhs) {
  return this.fieldHashCode == rhs.fieldHashCode &&
      this.undoContent_ == rhs.undoContent_ &&
      this.redoContent_ == rhs.redoContent_;
};



/**
 * Stores the state of the selection in a way the survives DOM modifications
 * that don't modify the user-interactable content (e.g. making something bold
 * vs. typing a character).
 *
 * TODO(user): Completely get rid of this and use goog.dom.SavedCaretRange.
 *
 * @param {goog.editor.Field} field The field the selection is in.
 * @private
 * @constructor
 */
goog.editor.plugins.UndoRedo.CursorPosition_ = function(field) {
  this.field_ = field;

  var win = field.getEditableDomHelper().getWindow();
  var range = field.getRange();
  var isValidRange =
      !!range && range.isRangeInDocument() && range.getWindow() == win;
  range = isValidRange ? range : null;

  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    this.initW3C_(range);
  } else if (goog.editor.BrowserFeature.HAS_IE_RANGES) {
    this.initIE_(range);
  }
};


/**
 * The standards compliant version keeps a list of childNode offsets.
 * @param {goog.dom.AbstractRange?} range The range to save.
 * @private
 */
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.initW3C_ = function(
    range) {
  this.isValid_ = false;

  // TODO: Check if the range is in the field before trying to save it
  // for FF 3 contentEditable.
  if (!range) {
    return;
  }

  var anchorNode = range.getAnchorNode();
  var focusNode = range.getFocusNode();
  if (!anchorNode || !focusNode) {
    return;
  }

  var anchorOffset = range.getAnchorOffset();
  var anchor = new goog.dom.NodeOffset(anchorNode, this.field_.getElement());

  var focusOffset = range.getFocusOffset();
  var focus = new goog.dom.NodeOffset(focusNode, this.field_.getElement());

  // Test range direction.
  if (range.isReversed()) {
    this.startOffset_ = focus;
    this.startChildOffset_ = focusOffset;
    this.endOffset_ = anchor;
    this.endChildOffset_ = anchorOffset;
  } else {
    this.startOffset_ = anchor;
    this.startChildOffset_ = anchorOffset;
    this.endOffset_ = focus;
    this.endChildOffset_ = focusOffset;
  }

  this.isValid_ = true;
};


/**
 * In IE, we just keep track of the text offset (number of characters).
 * @param {goog.dom.AbstractRange?} range The range to save.
 * @private
 */
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.initIE_ = function(
    range) {
  this.isValid_ = false;

  if (!range) {
    return;
  }

  var ieRange = range.getTextRange(0).getBrowserRangeObject();

  if (!goog.dom.contains(this.field_.getElement(), ieRange.parentElement())) {
    return;
  }

  // Create a range that encompasses the contentEditable region to serve
  // as a reference to form ranges below.
  var contentEditableRange =
      this.field_.getEditableDomHelper().getDocument().body.createTextRange();
  contentEditableRange.moveToElementText(this.field_.getElement());

  // startMarker is a range from the start of the contentEditable node to the
  // start of the current selection.
  var startMarker = ieRange.duplicate();
  startMarker.collapse(true);
  startMarker.setEndPoint('StartToStart', contentEditableRange);
  this.startOffset_ =
      goog.editor.plugins.UndoRedo.CursorPosition_.computeEndOffsetIE_(
          startMarker);

  // endMarker is a range from the start of the contentEditable node to the
  // end of the current selection.
  var endMarker = ieRange.duplicate();
  endMarker.setEndPoint('StartToStart', contentEditableRange);
  this.endOffset_ =
      goog.editor.plugins.UndoRedo.CursorPosition_.computeEndOffsetIE_(
          endMarker);

  this.isValid_ = true;
};


/**
 * @return {boolean} Whether this object is valid.
 */
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.isValid = function() {
  return this.isValid_;
};


/**
 * @return {string} A string representation of this object.
 * @override
 */
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.toString = function() {
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    return 'W3C:' + this.startOffset_.toString() + '\n' +
        this.startChildOffset_ + ':' + this.endOffset_.toString() + '\n' +
        this.endChildOffset_;
  }
  return 'IE:' + this.startOffset_ + ',' + this.endOffset_;
};


/**
 * Makes the browser's selection match the cursor position.
 */
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.select = function() {
  var range = this.getRange_(this.field_.getElement());
  if (range) {
    if (goog.editor.BrowserFeature.HAS_IE_RANGES) {
      this.field_.getElement().focus();
    }
    goog.dom.Range.createFromBrowserRange(range).select();
  }
};


/**
 * Get the range that encompases the the cursor position relative to a given
 * base node.
 * @param {Element} baseNode The node to get the cursor position relative to.
 * @return {Range|TextRange|null} The browser range for this position.
 * @private
 */
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.getRange_ = function(
    baseNode) {
  if (goog.editor.BrowserFeature.HAS_W3C_RANGES) {
    var startNode = this.startOffset_.findTargetNode(baseNode);
    var endNode = this.endOffset_.findTargetNode(baseNode);
    if (!startNode || !endNode) {
      return null;
    }

    // Create range.
    return /** @type {Range} */ (
        goog.dom.Range
            .createFromNodes(
                startNode, this.startChildOffset_, endNode,
                this.endChildOffset_)
            .getBrowserRangeObject());
  }

  // Create a collapsed selection at the start of the contentEditable region,
  // which the offsets were calculated relative to before.  Note that we force
  // a text range here so we can use moveToElementText.
  var sel = baseNode.ownerDocument.body.createTextRange();
  sel.moveToElementText(baseNode);
  sel.collapse(true);
  sel.moveEnd('character', this.endOffset_);
  sel.moveStart('character', this.startOffset_);
  return sel;
};


/**
 * Compute the number of characters to the end of the range in IE.
 * @param {TextRange} range The range to compute an offset for.
 * @return {number} The number of characters to the end of the range.
 * @private
 */
goog.editor.plugins.UndoRedo.CursorPosition_.computeEndOffsetIE_ = function(
    range) {
  var testRange = range.duplicate();

  // The number of offset characters is a little off depending on
  // what type of block elements happen to be between the start of the
  // textedit and the cursor position.  We fudge the offset until the
  // two ranges match.
  var text = range.text;
  var guess = text.length;

  testRange.collapse(true);
  testRange.moveEnd('character', guess);

  // Adjust the range until the end points match.  This doesn't quite
  // work if we're at the end of the field so we give up after a few
  // iterations.
  var diff;
  var numTries = 10;
  while (diff = testRange.compareEndPoints('EndToEnd', range)) {
    guess -= diff;
    testRange.moveEnd('character', -diff);
    --numTries;
    if (0 == numTries) {
      break;
    }
  }
  // When we set innerHTML, blank lines become a single space, causing
  // the cursor position to be off by one.  So we accommodate for blank
  // lines.
  var offset = 0;
  var pos = text.indexOf('\n\r');
  while (pos != -1) {
    ++offset;
    pos = text.indexOf('\n\r', pos + 1);
  }
  return guess + offset;
};
