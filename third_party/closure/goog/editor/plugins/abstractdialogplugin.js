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
 * @fileoverview An abstract superclass for TrogEdit dialog plugins. Each
 * Trogedit dialog has its own plugin.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.editor.plugins.AbstractDialogPlugin');
goog.provide('goog.editor.plugins.AbstractDialogPlugin.EventType');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.editor.Field');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.range');
goog.require('goog.events');
goog.require('goog.ui.editor.AbstractDialog');


// *** Public interface ***************************************************** //



/**
 * An abstract superclass for a Trogedit plugin that creates exactly one
 * dialog. By default dialogs are not reused -- each time execCommand is called,
 * a new instance of the dialog object is created (and the old one disposed of).
 * To enable reusing of the dialog object, subclasses should call
 * setReuseDialog() after calling the superclass constructor.
 * @param {string} command The command that this plugin handles.
 * @constructor
 * @extends {goog.editor.Plugin}
 */
goog.editor.plugins.AbstractDialogPlugin = function(command) {
  goog.editor.plugins.AbstractDialogPlugin.base(this, 'constructor');

  /**
   * The command that this plugin handles.
   * @private {string}
   */
  this.command_ = command;

  /** @private {function()} */
  this.restoreScrollPosition_ = function() {};

  /**
   * The current dialog that was created and opened by this plugin.
   * @private {?goog.ui.editor.AbstractDialog}
   */
  this.dialog_ = null;

  /**
   * Whether this plugin should reuse the same instance of the dialog each time
   * execCommand is called or create a new one.
   * @private {boolean}
   */
  this.reuseDialog_ = false;

  /**
   * Mutex to prevent recursive calls to disposeDialog_.
   * @private {boolean}
   */
  this.isDisposingDialog_ = false;

  /**
   * SavedRange representing the selection before the dialog was opened.
   * @private {?goog.dom.SavedRange}
   */
  this.savedRange_ = null;
};
goog.inherits(goog.editor.plugins.AbstractDialogPlugin, goog.editor.Plugin);


/** @override */
goog.editor.plugins.AbstractDialogPlugin.prototype.isSupportedCommand =
    function(command) {
  return command == this.command_;
};


/**
 * Handles execCommand. Dialog plugins don't make any changes when they open a
 * dialog, just when the dialog closes (because only modal dialogs are
 * supported). Hence this method does not dispatch the change events that the
 * superclass method does.
 * @param {string} command The command to execute.
 * @param {...*} var_args Any additional parameters needed to
 *     execute the command.
 * @return {*} The result of the execCommand, if any.
 * @override
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.execCommand = function(
    command, var_args) {
  return this.execCommandInternal.apply(this, arguments);
};


// *** Events *************************************************************** //


/**
 * Event type constants for events the dialog plugins fire.
 * @enum {string}
 */
goog.editor.plugins.AbstractDialogPlugin.EventType = {
  // This event is fired when a dialog has been opened.
  OPENED: 'dialogOpened',
  // This event is fired when a dialog has been closed.
  CLOSED: 'dialogClosed'
};


// *** Protected interface ************************************************** //


/**
 * Creates a new instance of this plugin's dialog. Must be overridden by
 * subclasses.
 * Implementations should expect that the editor is inactive and cannot be
 * focused, nor will its caret position (or selection) be determinable until
 * after the dialogs goog.ui.PopupBase.EventType.HIDE event has been handled.
 * @param {!goog.dom.DomHelper} dialogDomHelper The dom helper to be used to
 *     create the dialog.
 * @param {*=} opt_arg The dialog specific argument. Concrete subclasses should
 *     declare a specific type.
 * @return {goog.ui.editor.AbstractDialog} The newly created dialog.
 * @protected
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.createDialog =
    goog.abstractMethod;


/**
 * Returns the current dialog that was created and opened by this plugin.
 * @return {goog.ui.editor.AbstractDialog} The current dialog that was created
 *     and opened by this plugin.
 * @protected
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.getDialog = function() {
  return this.dialog_;
};


/**
 * Sets whether this plugin should reuse the same instance of the dialog each
 * time execCommand is called or create a new one. This is intended for use by
 * subclasses only, hence protected.
 * @param {boolean} reuse Whether to reuse the dialog.
 * @protected
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.setReuseDialog = function(
    reuse) {
  this.reuseDialog_ = reuse;
};


/**
 * Handles execCommand by opening the dialog. Dispatches
 * {@link goog.editor.plugins.AbstractDialogPlugin.EventType.OPENED} after the
 * dialog is shown.
 * @param {string} command The command to execute.
 * @param {*=} opt_arg The dialog specific argument. Should be the same as
 *     {@link createDialog}.
 * @return {*} Always returns true, indicating the dialog was shown.
 * @protected
 * @override
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.execCommandInternal =
    function(command, opt_arg) {
  // If this plugin should not reuse dialog instances, first dispose of the
  // previous dialog.
  if (!this.reuseDialog_) {
    this.disposeDialog_();
  }
  // If there is no dialog yet (or we aren't reusing the previous one), create
  // one.
  if (!this.dialog_) {
    this.dialog_ = this.createDialog(
        // TODO(user): Add Field.getAppDomHelper. (Note dom helper will
        // need to be updated if setAppWindow is called by clients.)
        goog.dom.getDomHelper(this.getFieldObject().getAppWindow()), opt_arg);
  }

  // Since we're opening a dialog, we need to clear the selection because the
  // focus will be going to the dialog, and if we leave an selection in the
  // editor while another selection is active in the dialog as the user is
  // typing, some browsers will screw up the original selection. But first we
  // save it so we can restore it when the dialog closes.
  // getRange may return null if there is no selection in the field.
  var tempRange = this.getFieldObject().getRange();
  // saveUsingDom() did not work as well as saveUsingNormalizedCarets(),
  // not sure why.

  this.restoreScrollPosition_ = this.saveScrollPosition();
  this.savedRange_ =
      tempRange && goog.editor.range.saveUsingNormalizedCarets(tempRange);
  goog.dom.Range.clearSelection(
      this.getFieldObject().getEditableDomHelper().getWindow());

  // Listen for the dialog closing so we can clean up.
  goog.events.listenOnce(
      this.dialog_, goog.ui.editor.AbstractDialog.EventType.AFTER_HIDE,
      this.handleAfterHide, false, this);

  this.getFieldObject().setModalMode(true);
  this.dialog_.show();
  this.dispatchEvent(goog.editor.plugins.AbstractDialogPlugin.EventType.OPENED);

  // Since the selection has left the document, dispatch a selection
  // change event.
  this.getFieldObject().dispatchSelectionChangeEvent();

  return true;
};


/**
 * Cleans up after the dialog has closed, including restoring the selection to
 * what it was before the dialog was opened. If a subclass modifies the editable
 * field's content such that the original selection is no longer valid (usually
 * the case when the user clicks OK, and sometimes also on Cancel), it is that
 * subclass' responsibility to place the selection in the desired place during
 * the OK or Cancel (or other) handler. In that case, this method will leave the
 * selection in place.
 * @param {goog.events.Event} e The AFTER_HIDE event object.
 * @protected
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.handleAfterHide = function(
    e) {
  this.getFieldObject().setModalMode(false);
  this.restoreOriginalSelection();
  this.restoreScrollPosition_();

  if (!this.reuseDialog_) {
    this.disposeDialog_();
  }

  this.dispatchEvent(goog.editor.plugins.AbstractDialogPlugin.EventType.CLOSED);

  // Since the selection has returned to the document, dispatch a selection
  // change event.
  this.getFieldObject().dispatchSelectionChangeEvent();

  // When the dialog closes due to pressing enter or escape, that happens on the
  // keydown event. But the browser will still fire a keyup event after that,
  // which is caught by the editable field and causes it to try to fire a
  // selection change event. To avoid that, we "debounce" the selection change
  // event, meaning the editable field will not fire that event if the keyup
  // that caused it immediately after this dialog was hidden ("immediately"
  // means a small number of milliseconds defined by the editable field).
  this.getFieldObject().debounceEvent(
      goog.editor.Field.EventType.SELECTIONCHANGE);
};


/**
 * Restores the selection in the editable field to what it was before the dialog
 * was opened. This is not guaranteed to work if the contents of the field
 * have changed.
 * @protected
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.restoreOriginalSelection =
    function() {
  this.getFieldObject().restoreSavedRange(this.savedRange_);
  this.savedRange_ = null;
};


/**
 * Cleans up the structure used to save the original selection before the dialog
 * was opened. Should be used by subclasses that don't restore the original
 * selection via restoreOriginalSelection.
 * @protected
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.disposeOriginalSelection =
    function() {
  if (this.savedRange_) {
    this.savedRange_.dispose();
    this.savedRange_ = null;
  }
};


/** @override */
goog.editor.plugins.AbstractDialogPlugin.prototype.disposeInternal =
    function() {
  this.disposeDialog_();
  goog.editor.plugins.AbstractDialogPlugin.base(this, 'disposeInternal');
};


// *** Private implementation *********************************************** //


/**
 * Disposes of the dialog if needed. It is this abstract class' responsibility
 * to dispose of the dialog. The "if needed" refers to the fact this method
 * might be called twice (nested calls, not sequential) in the dispose flow, so
 * if the dialog was already disposed once it should not be disposed again.
 * @private
 */
goog.editor.plugins.AbstractDialogPlugin.prototype.disposeDialog_ = function() {
  // Wrap disposing the dialog in a mutex. Otherwise disposing it would cause it
  // to get hidden (if it is still open) and fire AFTER_HIDE, which in
  // turn would cause the dialog to be disposed again (closure only flags an
  // object as disposed after the dispose call chain completes, so it doesn't
  // prevent recursive dispose calls).
  if (this.dialog_ && !this.isDisposingDialog_) {
    this.isDisposingDialog_ = true;
    this.dialog_.dispose();
    this.dialog_ = null;
    this.isDisposingDialog_ = false;
  }
};
