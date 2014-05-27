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
 * @fileoverview A class for managing the editor toolbar.
 *
 * @author attila@google.com (Attila Bodis)
 * @author jparent@google.com (Julie Parent)
 * @see ../../demos/editor/editor.html
 */

goog.provide('goog.ui.editor.ToolbarController');

goog.require('goog.editor.Field');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Component');



/**
 * A class for managing the editor toolbar.  Acts as a bridge between
 * a {@link goog.editor.Field} and a {@link goog.ui.Toolbar}.
 *
 * The {@code toolbar} argument must be an instance of {@link goog.ui.Toolbar}
 * or a subclass.  This class doesn't care how the toolbar was created.  As
 * long as one or more controls hosted  in the toolbar have IDs that match
 * built-in {@link goog.editor.Command}s, they will function as expected.  It is
 * the caller's responsibility to ensure that the toolbar is already rendered
 * or that it decorates an existing element.
 *
 *
 * @param {!goog.editor.Field} field Editable field to be controlled by the
 *     toolbar.
 * @param {!goog.ui.Toolbar} toolbar Toolbar to control the editable field.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.editor.ToolbarController = function(field, toolbar) {
  goog.events.EventTarget.call(this);

  /**
   * Event handler to listen for field events and user actions.
   * @type {!goog.events.EventHandler.<!goog.ui.editor.ToolbarController>}
   * @private
   */
  this.handler_ = new goog.events.EventHandler(this);

  /**
   * The field instance controlled by the toolbar.
   * @type {!goog.editor.Field}
   * @private
   */
  this.field_ = field;

  /**
   * The toolbar that controls the field.
   * @type {!goog.ui.Toolbar}
   * @private
   */
  this.toolbar_ = toolbar;

  /**
   * Editing commands whose state is to be queried when updating the toolbar.
   * @type {!Array.<string>}
   * @private
   */
  this.queryCommands_ = [];

  // Iterate over all buttons, and find those which correspond to
  // queryable commands. Add them to the list of commands to query on
  // each COMMAND_VALUE_CHANGE event.
  this.toolbar_.forEachChild(function(button) {
    if (button.queryable) {
      this.queryCommands_.push(this.getComponentId(button.getId()));
    }
  }, this);

  // Make sure the toolbar doesn't steal keyboard focus.
  this.toolbar_.setFocusable(false);

  // Hook up handlers that update the toolbar in response to field events,
  // and to execute editor commands in response to toolbar events.
  this.handler_.
      listen(this.field_, goog.editor.Field.EventType.COMMAND_VALUE_CHANGE,
          this.updateToolbar).
      listen(this.toolbar_, goog.ui.Component.EventType.ACTION,
          this.handleAction);
};
goog.inherits(goog.ui.editor.ToolbarController, goog.events.EventTarget);


/**
 * Returns the Closure component ID of the control that corresponds to the
 * given {@link goog.editor.Command} constant.
 * Subclasses may override this method if they want to use a custom mapping
 * scheme from commands to controls.
 * @param {string} command Editor command.
 * @return {string} Closure component ID of the corresponding toolbar
 *     control, if any.
 * @protected
 */
goog.ui.editor.ToolbarController.prototype.getComponentId = function(command) {
  // The default implementation assumes that the component ID is the same as
  // the command constant.
  return command;
};


/**
 * Returns the {@link goog.editor.Command} constant
 * that corresponds to the given Closure component ID.  Subclasses may override
 * this method if they want to use a custom mapping scheme from controls to
 * commands.
 * @param {string} id Closure component ID of a toolbar control.
 * @return {string} Editor command or dialog constant corresponding to the
 *     toolbar control, if any.
 * @protected
 */
goog.ui.editor.ToolbarController.prototype.getCommand = function(id) {
  // The default implementation assumes that the component ID is the same as
  // the command constant.
  return id;
};


/**
 * Returns the event handler object for the editor toolbar.  Useful for classes
 * that extend {@code goog.ui.editor.ToolbarController}.
 * @return {!goog.events.EventHandler.<T>} The event handler object.
 * @protected
 * @this T
 * @template T
 */
goog.ui.editor.ToolbarController.prototype.getHandler = function() {
  return this.handler_;
};


/**
 * Returns the field instance managed by the toolbar.  Useful for
 * classes that extend {@code goog.ui.editor.ToolbarController}.
 * @return {!goog.editor.Field} The field managed by the toolbar.
 * @protected
 */
goog.ui.editor.ToolbarController.prototype.getField = function() {
  return this.field_;
};


/**
 * Returns the toolbar UI component that manages the editor.  Useful for
 * classes that extend {@code goog.ui.editor.ToolbarController}.
 * @return {!goog.ui.Toolbar} The toolbar UI component.
 */
goog.ui.editor.ToolbarController.prototype.getToolbar = function() {
  return this.toolbar_;
};


/**
 * @return {boolean} Whether the toolbar is visible.
 */
goog.ui.editor.ToolbarController.prototype.isVisible = function() {
  return this.toolbar_.isVisible();
};


/**
 * Shows or hides the toolbar.
 * @param {boolean} visible Whether to show or hide the toolbar.
 */
goog.ui.editor.ToolbarController.prototype.setVisible = function(visible) {
  this.toolbar_.setVisible(visible);
};


/**
 * @return {boolean} Whether the toolbar is enabled.
 */
goog.ui.editor.ToolbarController.prototype.isEnabled = function() {
  return this.toolbar_.isEnabled();
};


/**
 * Enables or disables the toolbar.
 * @param {boolean} enabled Whether to enable or disable the toolbar.
 */
goog.ui.editor.ToolbarController.prototype.setEnabled = function(enabled) {
  this.toolbar_.setEnabled(enabled);
};


/**
 * Programmatically blurs the editor toolbar, un-highlighting the currently
 * highlighted item, and closing the currently open menu (if any).
 */
goog.ui.editor.ToolbarController.prototype.blur = function() {
  // We can't just call this.toolbar_.getElement().blur(), because the toolbar
  // element itself isn't focusable, so goog.ui.Container#handleBlur isn't
  // registered to handle blur events.
  this.toolbar_.handleBlur(null);
};


/** @override */
goog.ui.editor.ToolbarController.prototype.disposeInternal = function() {
  goog.ui.editor.ToolbarController.superClass_.disposeInternal.call(this);
  if (this.handler_) {
    this.handler_.dispose();
    delete this.handler_;
  }
  if (this.toolbar_) {
    this.toolbar_.dispose();
    delete this.toolbar_;
  }
  delete this.field_;
  delete this.queryCommands_;
};


/**
 * Updates the toolbar in response to editor events.  Specifically, updates
 * button states based on {@code COMMAND_VALUE_CHANGE} events, reflecting the
 * effective formatting of the selection.
 * @param {goog.events.Event} e Editor event to handle.
 * @protected
 */
goog.ui.editor.ToolbarController.prototype.updateToolbar = function(e) {
  if (!this.toolbar_.isEnabled() ||
      !this.dispatchEvent(goog.ui.Component.EventType.CHANGE)) {
    return;
  }

  var state;

  /** @preserveTry */
  try {
    /** @type {Array.<string>} */
    e.commands; // Added by dispatchEvent.

    // If the COMMAND_VALUE_CHANGE event specifies which commands changed
    // state, then we only need to update those ones, otherwise update all
    // commands.
    state = /** @type {Object} */ (
        this.field_.queryCommandValue(e.commands || this.queryCommands_));
  } catch (ex) {
    // TODO(attila): Find out when/why this happens.
    state = {};
  }

  this.updateToolbarFromState(state);
};


/**
 * Updates the toolbar to reflect a given state.
 * @param {Object} state Object mapping editor commands to values.
 */
goog.ui.editor.ToolbarController.prototype.updateToolbarFromState =
    function(state) {
  for (var command in state) {
    var button = this.toolbar_.getChild(this.getComponentId(command));
    if (button) {
      var value = state[command];
      if (button.updateFromValue) {
        button.updateFromValue(value);
      } else {
        button.setChecked(!!value);
      }
    }
  }
};


/**
 * Handles {@code ACTION} events dispatched by toolbar buttons in response to
 * user actions by executing the corresponding field command.
 * @param {goog.events.Event} e Action event to handle.
 * @protected
 */
goog.ui.editor.ToolbarController.prototype.handleAction = function(e) {
  var command = this.getCommand(e.target.getId());
  this.field_.execCommand(command, e.target.getValue());
};
