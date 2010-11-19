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

/**
 * @fileoverview Code for managing series of undo-redo actions in the form of
 * {@link goog.editor.plugins.UndoRedoState}s.
 *
 */


goog.provide('goog.editor.plugins.UndoRedoManager');
goog.provide('goog.editor.plugins.UndoRedoManager.EventType');

goog.require('goog.editor.plugins.UndoRedoState');
goog.require('goog.events.EventTarget');



/**
 * Manages undo and redo operations through a series of {@code UndoRedoState}s
 * maintained on undo and redo stacks.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.editor.plugins.UndoRedoManager = function() {
  goog.events.EventTarget.call(this);

  /**
   * The maximum number of states on the undo stack at any time. Used to limit
   * the memory footprint of the undo-redo stack.
   * TODO(user) have a separate memory size based limit.
   * @type {number}
   * @private
   */
  this.maxUndoDepth_ = 100;

  /**
   * The undo stack.
   * @type {Array.<goog.editor.plugins.UndoRedoState>}
   * @private
   */
  this.undoStack_ = [];

  /**
   * The redo stack.
   * @type {Array.<goog.editor.plugins.UndoRedoState>}
   * @private
   */
  this.redoStack_ = [];

  /**
   * A queue of pending undo or redo actions. Stored as objects with two
   * properties: func and state. The func property stores the undo or redo
   * function to be called, the state property stores the state that method
   * came from.
   * @type {Array.<Object>}
   * @private
   */
  this.pendingActions_ = [];
};
goog.inherits(goog.editor.plugins.UndoRedoManager, goog.events.EventTarget);


/**
 * Event types for the events dispatched by undo-redo manager.
 * @enum {string}
 */
goog.editor.plugins.UndoRedoManager.EventType = {
  /**
   * Signifies that he undo or redo stack transitioned between 0 and 1 states,
   * meaning that the ability to peform undo or redo operations has changed.
   */
  STATE_CHANGE: 'state_change',

  /**
   * Signifies that a state was just added to the undo stack. Events of this
   * type will have a {@code state} property whose value is the state that
   * was just added.
   */
  STATE_ADDED: 'state_added',

  /**
   * Signifies that the undo method of a state is about to be called.
   * Events of this type will have a {@code state} property whose value is the
   * state whose undo action is about to be performed. If the event is cancelled
   * the action does not proceed, but the state will still transition between
   * stacks.
   */
  BEFORE_UNDO: 'before_undo',

  /**
   * Signifies that the redo method of a state is about to be called.
   * Events of this type will have a {@code state} property whose value is the
   * state whose redo action is about to be performed. If the event is cancelled
   * the action does not proceed, but the state will still transition between
   * stacks.
   */
  BEFORE_REDO: 'before_redo'
};


/**
 * The key for the listener for the completion of the asynchronous state whose
 * undo or redo action is in progress. Null if no action is in progress.
 * @type {?number}
 * @private
 */
goog.editor.plugins.UndoRedoManager.prototype.inProgressActionKey_ = null;


/**
 * Set the max undo stack depth (not the real memory usage).
 * @param {number} depth Depth of the stack.
 */
goog.editor.plugins.UndoRedoManager.prototype.setMaxUndoDepth =
    function(depth) {
  this.maxUndoDepth_ = depth;
};


/**
 * Add state to the undo stack. This clears the redo stack.
 *
 * @param {goog.editor.plugins.UndoRedoState} state The state to add to the undo
 *     stack.
 */
goog.editor.plugins.UndoRedoManager.prototype.addState = function(state) {
  // TODO: is the state.equals check necessary?
  if (this.undoStack_.length == 0 ||
      !state.equals(this.undoStack_[this.undoStack_.length - 1])) {
    this.undoStack_.push(state);
    if (this.undoStack_.length > this.maxUndoDepth_) {
      this.undoStack_.shift();
    }
    // Clobber the redo stack.
    var redoLength = this.redoStack_.length;
    this.redoStack_.length = 0;

    this.dispatchEvent({
      type: goog.editor.plugins.UndoRedoManager.EventType.STATE_ADDED,
      state: state
    });

    // If the redo state had states on it, then clobbering the redo stack above
    // has caused a state change.
    if (this.undoStack_.length == 1 || redoLength) {
      this.dispatchStateChange_();
    }
  }
};


/**
 * Dispatches a STATE_CHANGE event with this manager as the target.
 * @private
 */
goog.editor.plugins.UndoRedoManager.prototype.dispatchStateChange_ =
    function() {
  this.dispatchEvent(
      goog.editor.plugins.UndoRedoManager.EventType.STATE_CHANGE);
};


/**
 * Performs the undo operation of the state at the top of the undo stack, moving
 * that state to the top of the redo stack. If the undo stack is empty, does
 * nothing.
 */
goog.editor.plugins.UndoRedoManager.prototype.undo = function() {
  this.shiftState_(this.undoStack_, this.redoStack_);
};


/**
 * Performs the redo operation of the state at the top of the redo stack, moving
 * that state to the top of the undo stack. If redo undo stack is empty, does
 * nothing.
 */
goog.editor.plugins.UndoRedoManager.prototype.redo = function() {
  this.shiftState_(this.redoStack_, this.undoStack_);
};


/**
 * @return {boolean} Wether the undo stack has items on it, i.e., if it is
 *     possible to perform an undo operation.
 */
goog.editor.plugins.UndoRedoManager.prototype.hasUndoState = function() {
  return this.undoStack_.length > 0;
};


/**
 * @return {boolean} Wether the redo stack has items on it, i.e., if it is
 *     possible to perform a redo operation.
 */
goog.editor.plugins.UndoRedoManager.prototype.hasRedoState = function() {
  return this.redoStack_.length > 0;
};


/**
 * Move a state from one stack to the other, performing the appropriate undo
 * or redo action.
 *
 * @param {Array.<goog.editor.plugins.UndoRedoState>} fromStack Stack to move
 *     the state from.
 * @param {Array.<goog.editor.plugins.UndoRedoState>} toStack Stack to move
 *     the state to.
 * @private
 */
goog.editor.plugins.UndoRedoManager.prototype.shiftState_ = function(
    fromStack, toStack) {
  if (fromStack.length) {
    var state = fromStack.pop();

    // Push the current state into the redo stack.
    toStack.push(state);

    this.addAction_({
      type: fromStack == this.undoStack_ ?
          goog.editor.plugins.UndoRedoManager.EventType.BEFORE_UNDO :
          goog.editor.plugins.UndoRedoManager.EventType.BEFORE_REDO,
      func: fromStack == this.undoStack_ ? state.undo : state.redo,
      state: state
    });

    // If either stack transitioned between 0 and 1 in size then the ability
    // to do an undo or redo has changed and we must dispatch a state change.
    if (fromStack.length == 0 || toStack.length == 1) {
      this.dispatchStateChange_();
    }
  }
};


/**
 * Adds an action to the queue of pending undo or redo actions. If no actions
 * are pending, immediately performs the action.
 *
 * @param {Object} action An undo or redo action. Stored as an object with two
 *     properties: func and state. The func property stores the undo or redo
 *     function to be called, the state property stores the state that method
 *     came from.
 * @private
 */
goog.editor.plugins.UndoRedoManager.prototype.addAction_ = function(action) {
  this.pendingActions_.push(action);
  if (this.pendingActions_.length == 1) {
    this.doAction_();
  }
};


/**
 * Executes the action at the front of the pending actions queue. If an action
 * is already in progress or the queue is empty, does nothing.
 * @private
 */
goog.editor.plugins.UndoRedoManager.prototype.doAction_ = function() {
  if (this.inProgressActionKey_ || this.pendingActions_.length == 0) {
    return;
  }

  var action = this.pendingActions_.shift();

  var e = {
    type: action.type,
    state: action.state
  };

  if (this.dispatchEvent(e)) {
    if (action.state.isAsynchronous()) {
      this.inProgressActionKey_ = goog.events.listen(action.state,
          goog.editor.plugins.UndoRedoState.ACTION_COMPLETED,
          this.finishAction_, false, this);
      action.func.call(action.state);
    } else {
      action.func.call(action.state);
      this.doAction_();
    }
  }
};


/**
 * Finishes processing the current in progress action, starting the next queued
 * action if one exists.
 * @private
 */
goog.editor.plugins.UndoRedoManager.prototype.finishAction_ = function() {
  goog.events.unlistenByKey(/** @type {number} */ (this.inProgressActionKey_));
  this.inProgressActionKey_ = null;
  this.doAction_();
};


/**
 * Clears the undo and redo stacks.
 */
goog.editor.plugins.UndoRedoManager.prototype.clearHistory = function() {
  if (this.undoStack_.length > 0 || this.redoStack_.length > 0) {
    this.undoStack_.length = 0;
    this.redoStack_.length = 0;
    this.dispatchStateChange_();
  }
};


/**
 * @return {goog.editor.plugins.UndoRedoState|undefined} The state at the top of
 *     the undo stack without removing it from the stack.
 */
goog.editor.plugins.UndoRedoManager.prototype.undoPeek = function() {
  return this.undoStack_[this.undoStack_.length - 1];
};


/**
 * @return {goog.editor.plugins.UndoRedoState|undefined} The state at the top of
 *     the redo stack without removing it from the stack.
 */
goog.editor.plugins.UndoRedoManager.prototype.redoPeek = function() {
  return this.redoStack_[this.redoStack_.length - 1];
};
