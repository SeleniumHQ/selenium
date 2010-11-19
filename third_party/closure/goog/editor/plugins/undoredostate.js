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
 * @fileoverview Code for an UndoRedoState interface representing an undo and
 * redo action for a particular state change. To be used by
 * {@link goog.editor.plugins.UndoRedoManager}.
 *
 */


goog.provide('goog.editor.plugins.UndoRedoState');

goog.require('goog.events.EventTarget');



/**
 * Represents an undo and redo action for a particular state transition.
 *
 * @param {boolean} asynchronous Whether the undo or redo actions for this
 *     state complete asynchronously. If true, then this state must fire
 *     an ACTION_COMPLETED event when undo or redo is complete.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.editor.plugins.UndoRedoState = function(asynchronous) {
  /**
   * Indicates if the undo or redo actions for this state complete
   * asynchronously.
   * @type {boolean}
   * @private
   */
  this.asynchronous_ = asynchronous;
};
goog.inherits(goog.editor.plugins.UndoRedoState, goog.events.EventTarget);


/**
 * Event type for events indicating that this state has completed an undo or
 * redo operation.
 */
goog.editor.plugins.UndoRedoState.ACTION_COMPLETED = 'action_completed';


/**
 * @return {boolean} Whether or not the undo and redo actions of this state
 *     complete asynchronously. If true, the state will fire an ACTION_COMPLETED
 *     event when an undo or redo action is complete.
 */
goog.editor.plugins.UndoRedoState.prototype.isAsynchronous = function() {
  return this.asynchronous_;
};


/**
 * Undoes the action represented by this state.
 */
goog.editor.plugins.UndoRedoState.prototype.undo = goog.abstractMethod;


/**
 * Redoes the action represented by this state.
 */
goog.editor.plugins.UndoRedoState.prototype.redo = goog.abstractMethod;


/**
 * Checks if two undo-redo states are the same.
 * @param {goog.editor.plugins.UndoRedoState} state The state to compare.
 * @return {boolean} Wether the two states are equal.
 */
goog.editor.plugins.UndoRedoState.prototype.equals = goog.abstractMethod;
