// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2008 Google, Inc. All Rights Reserved

/**
 * @fileoverview Wrapper around {@link goog.ui.Dialog}, to provide
 * dialogs that are smarter about interacting with a rich text editor.
 *
 */

goog.provide('goog.ui.editor.AbstractDialog');
goog.provide('goog.ui.editor.AbstractDialog.Builder');
goog.provide('goog.ui.editor.AbstractDialog.EventType');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.EventTarget');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');
goog.require('goog.ui.Dialog.DefaultButtonKeys');
goog.require('goog.ui.Dialog.Event');
goog.require('goog.ui.Dialog.EventType');


// *** Public interface ***************************************************** //

/**
 * Creates an object that represents a dialog box.
 * @param {goog.dom.DomHelper} domHelper DomHelper to be used to create the
 * dialog's dom structure.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.ui.editor.AbstractDialog = function(domHelper) {
  goog.events.EventTarget.call(this);
  this.dom = domHelper;
};
goog.inherits(goog.ui.editor.AbstractDialog, goog.events.EventTarget);


/**
 * Causes the dialog box to appear, centered on the screen. Lazily creates the
 * dialog if needed.
 */
goog.ui.editor.AbstractDialog.prototype.show = function() {
  // Lazily create the wrapped dialog to be shown.
  if (!this.dialogInternal_) {
    this.dialogInternal_ = this.createDialogControl();
    this.dialogInternal_.addEventListener(goog.ui.Dialog.EventType.AFTER_HIDE,
        this.handleAfterHide_, false, this);
  }

  this.dialogInternal_.setVisible(true);
};

/**
 * Hides the dialog, causing AFTER_HIDE to fire.
 */
goog.ui.editor.AbstractDialog.prototype.hide = function() {
  if (this.dialogInternal_) {
    // This eventually fires the wrapped dialog's AFTER_HIDE event, calling our
    // handleAfterHide_().
    this.dialogInternal_.setVisible(false);
  }
};

/**
 * @return {boolean} Whether the dialog is open.
 */
goog.ui.editor.AbstractDialog.prototype.isOpen = function() {
  return !!this.dialogInternal_ && this.dialogInternal_.isVisible();
};


/**
 * Runs the handler registered on the OK button event and closes the dialog if
 * that handler succeeds.
 * This is useful in cases such as double-clicking an item in the dialog is
 * equivalent to selecting it and clicking the default button.
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.processOkAndClose = function() {
  // Fake an OK event from the wrapped dialog control.
  var evt = new goog.ui.Dialog.Event(goog.ui.Dialog.DefaultButtonKeys.OK, null);
  if (this.handleOk(evt)) {
    // handleOk calls dispatchEvent, so if any listener calls preventDefault it
    // will return false and we won't hide the dialog.
    this.hide();
  }
};


// *** Dialog events ******************************************************** //

/**
 * Event type constants for events the dialog fires.
 * @enum {string}
 */
goog.ui.editor.AbstractDialog.EventType = {
  // This event is fired after the dialog is hidden, no matter if it was closed
  // via OK or Cancel or is being disposed without being hidden first.
  AFTER_HIDE: 'afterhide',
  // Either the cancel or OK events can be canceled via preventDefault or by
  // returning false from their handlers to stop the dialog from closing.
  CANCEL: 'cancel',
  OK: 'ok'
};


// *** Inner helper class *************************************************** //

/**
 * A builder class for the dialog control. All methods except build return this.
 * @param {goog.ui.editor.AbstractDialog} editorDialog Editor dialog object
 *     that will wrap the wrapped dialog object this builder will create.
 * @constructor
 */
goog.ui.editor.AbstractDialog.Builder = function(editorDialog) {
  // We require the editor dialog to be passed in so that the builder can set up
  // ok/cancel listeners by default, making it easier for most dialogs.
  this.editorDialog_ = editorDialog;
  this.wrappedDialog_ = new goog.ui.Dialog('', true, this.editorDialog_.dom);
  this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.editorDialog_.dom);
  this.buttonHandlers_ = {};
  this.addClassName(goog.getCssName('tr-dialog'));
};

/**
 * Sets the title of the dialog.
 * @param {string} title Title HTML (escaped).
 * @return {goog.ui.editor.AbstractDialog.Builder} This.
 */
goog.ui.editor.AbstractDialog.Builder.prototype.setTitle = function(title) {
  this.wrappedDialog_.setTitle(title);
  return this;
};

/**
 * Adds an OK button to the dialog. Clicking this button will cause {@link
 * handleOk} to run, subsequently dispatching an OK event.
 * @param {string} opt_label The caption for the button, if not "OK".
 * @return {goog.ui.editor.AbstractDialog.Builder} This.
 */
goog.ui.editor.AbstractDialog.Builder.prototype.addOkButton =
    function(opt_label) {
  var key = goog.ui.Dialog.DefaultButtonKeys.OK;
  /** @desc Label for an OK button in an editor dialog. */
  var MSG_EDITOR_DIALOG_OK = goog.getMsg('OK');
  // True means this is the default/OK button.
  this.buttonSet_.set(key, opt_label || MSG_EDITOR_DIALOG_OK, true);
  this.buttonHandlers_[key] = goog.bind(this.editorDialog_.handleOk,
                                        this.editorDialog_);
  return this;
};

/**
 * Adds a Cancel button to the dialog. Clicking this button will cause {@link
 * handleCancel} to run, subsequently dispatching a CANCEL event.
 * @param {string} opt_label The caption for the button, if not "Cancel".
 * @return {goog.ui.editor.AbstractDialog.Builder} This.
 */
goog.ui.editor.AbstractDialog.Builder.prototype.addCancelButton =
    function(opt_label) {
  var key = goog.ui.Dialog.DefaultButtonKeys.CANCEL;
  /** @desc Label for a cancel button in an editor dialog. */
  var MSG_EDITOR_DIALOG_CANCEL = goog.getMsg('Cancel');
  // False means it's not the OK button, true means it's the Cancel button.
  this.buttonSet_.set(key, opt_label || MSG_EDITOR_DIALOG_CANCEL, false, true);
  this.buttonHandlers_[key] = goog.bind(this.editorDialog_.handleCancel,
                                        this.editorDialog_);
  return this;
};

/**
 * Adds a custom button to the dialog.
 * @param {string} label The caption for the button.
 * @param {function(goog.ui.Dialog.EventType):*} handler Function called when
 *     the button is clicked. It is recommended that this function be a method
 *     in the concrete subclass of AbstractDialog using this Builder, and that
 *     it dispatch an event (see {@link handleOk}).
 * @param {string} opt_buttonId Identifier to be used to access the button when
 *     calling AbstractDialog.getButtonElement().
 * @return {goog.ui.editor.AbstractDialog.Builder} This.
 */
goog.ui.editor.AbstractDialog.Builder.prototype.addButton =
    function(label, handler, opt_buttonId) {
  // We don't care what the key is, just that we can match the button with the
  // handler function later.
  var key = opt_buttonId || goog.string.createUniqueString();
  this.buttonSet_.set(key, label);
  this.buttonHandlers_[key] = handler;
  return this;
};

/**
 * Puts a CSS class on the dialog's main element.
 * @param {string} className The class to add.
 * @return {goog.ui.editor.AbstractDialog.Builder} This.
 */
goog.ui.editor.AbstractDialog.Builder.prototype.addClassName =
    function(className) {
  goog.dom.classes.add(this.wrappedDialog_.getDialogElement(), className);
  return this;
};

/**
 * Sets the content element of the dialog.
 * @param {Element} contentElem An element for the main body.
 * @return {goog.ui.editor.AbstractDialog.Builder} This.
 */
goog.ui.editor.AbstractDialog.Builder.prototype.setContent =
    function(contentElem) {
  goog.dom.appendChild(this.wrappedDialog_.getContentElement(), contentElem);
  return this;
};

/**
 * Builds the wrapped dialog control. May only be called once, after which
 * no more methods may be called on this builder.
 * @return {goog.ui.Dialog} The wrapped dialog control.
 */
goog.ui.editor.AbstractDialog.Builder.prototype.build = function() {
  if (this.buttonSet_.isEmpty()) {
    // If caller didn't set any buttons, add an OK and Cancel button by default.
    this.addOkButton();
    this.addCancelButton();
  }
  this.wrappedDialog_.setButtonSet(this.buttonSet_);

  var handlers = this.buttonHandlers_;
  this.buttonHandlers_ = null;
  this.wrappedDialog_.addEventListener(goog.ui.Dialog.EventType.SELECT,
      // Listen for the SELECT event, which means a button was clicked, and
      // call the handler associated with that button via the key property.
      function(e) {
        if (handlers[e.key]) {
          return handlers[e.key](e);
        }
      });

  // All editor dialogs are modal.
  this.wrappedDialog_.setModal(true);

  var dialog = this.wrappedDialog_;
  this.wrappedDialog_ = null;
  return dialog;
};

/**
 * Editor dialog that will wrap the wrapped dialog this builder will create.
 * @type {goog.ui.editor.AbstractDialog}
 * @private
 */
goog.ui.editor.AbstractDialog.Builder.prototype.editorDialog_;

/**
 * wrapped dialog control being built by this builder.
 * @type {goog.ui.Dialog}
 * @private
 */
goog.ui.editor.AbstractDialog.Builder.prototype.wrappedDialog_;

/**
 * Set of buttons to be added to the wrapped dialog control.
 * @type {goog.ui.Dialog.ButtonSet}
 * @private
 */
goog.ui.editor.AbstractDialog.Builder.prototype.buttonSet_;

/**
 * Map from keys that will be returned in the wrapped dialog SELECT events to
 * handler functions to be called to handle those events.
 * @type {Object}
 * @private
 */
goog.ui.editor.AbstractDialog.Builder.prototype.buttonHandlers_;


// *** Protected interface ************************************************** //

/**
 * The DOM helper for the parent document.
 * @type {goog.dom.DomHelper}
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.dom;


/**
 * Creates and returns the goog.ui.Dialog control that is being wrapped
 * by this object.
 * @return {goog.ui.Dialog} Created Dialog control.
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.createDialogControl =
    goog.abstractMethod;

/**
 * Returns the HTML Button element for the OK button in this dialog.
 * @return {Element} The button element if found, else null.
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.getOkButtonElement = function() {
  return this.getButtonElement(goog.ui.Dialog.DefaultButtonKeys.OK);
};

/**
 * Returns the HTML Button element for the Cancel button in this dialog.
 * @return {Element} The button element if found, else null.
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.getCancelButtonElement = function() {
  return this.getButtonElement(goog.ui.Dialog.DefaultButtonKeys.CANCEL);
};

/**
 * Returns the HTML Button element for the button added to this dialog with
 * the given button id.
 * @param {string} buttonId The id of the button to get.
 * @return {Element} The button element if found, else null.
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.getButtonElement = function(buttonId) {
  return this.dialogInternal_.getButtonSet().getButton(buttonId);
};


/**
 * Creates and returns the event object to be used when dispatching the OK
 * event to listeners, or returns null to prevent the dialog from closing.
 * Subclasses should override this to return their own subclass of
 * goog.events.Event that includes all data a plugin would need from the dialog.
 * @param {goog.events.Event} e The event object dispatched by the wrapped
 *     dialog.
 * @return {goog.events.Event} The event object to be used when dispatching the
 *     OK event to listeners.
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.createOkEvent = goog.abstractMethod;

/**
 * Handles the event dispatched by the wrapped dialog control when the user
 * clicks the OK button. Attempts to create the OK event object and dispatches
 * it if successful.
 * @param {goog.ui.Dialog.Event} e wrapped dialog OK event object.
 * @return {boolean} Whether the default action (closing the dialog) should
 *     still be executed. This will be false if the OK event could not be
 *     created to be dispatched, or if any listener to that event returs false
 *     or calls preventDefault.
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.handleOk = function(e) {
  var eventObj = this.createOkEvent(e);
  if (eventObj) {
    return this.dispatchEvent(eventObj);
  } else {
    return false;
  }
};

/**
 * Handles the event dispatched by the wrapped dialog control when the user
 * clicks the Cancel button. Simply dispatches a CANCEL event.
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.handleCancel = function() {
  this.dispatchEvent(goog.ui.editor.AbstractDialog.EventType.CANCEL);
};


/**
 * Disposes of the dialog. If the dialog is open, it will be hidden and
 * AFTER_HIDE will be dispatched.
 * @override
 * @protected
 */
goog.ui.editor.AbstractDialog.prototype.disposeInternal = function() {
  if (this.dialogInternal_) {
    this.hide();

    this.dialogInternal_.dispose();
    this.dialogInternal_ = null;
  }

  goog.ui.editor.AbstractDialog.superClass_.disposeInternal.call(this);
};


// *** Private implementation *********************************************** //

/**
 * The wrapped dialog widget.
 * @type {goog.ui.Dialog}
 * @private
 */
goog.ui.editor.AbstractDialog.prototype.dialogInternal_;


/**
 * Cleans up after the dialog is hidden and fires the AFTER_HIDE event. Should
 * be a listener for the wrapped dialog's AFTER_HIDE event.
 * @private
 */
goog.ui.editor.AbstractDialog.prototype.handleAfterHide_ = function() {
  this.dispatchEvent(goog.ui.editor.AbstractDialog.EventType.AFTER_HIDE);
};
