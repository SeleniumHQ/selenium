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
 * @fileoverview A plugin for the LinkDialog.
 *
 * @author nicksantos@google.com (Nick Santos)
 * @author marcosalmeida@google.com (Marcos Almeida)
 * @author robbyw@google.com (Robby Walker)
 */

goog.provide('goog.editor.plugins.LinkDialogPlugin');

goog.require('goog.editor.Command');
goog.require('goog.editor.plugins.AbstractDialogPlugin');
goog.require('goog.events.EventHandler');
goog.require('goog.functions');
goog.require('goog.ui.editor.AbstractDialog.EventType');
goog.require('goog.ui.editor.LinkDialog');
goog.require('goog.ui.editor.LinkDialog.OkEvent');



/**
 * A plugin that opens the link dialog.
 * @constructor
 * @extends {goog.editor.plugins.AbstractDialogPlugin}
 */
goog.editor.plugins.LinkDialogPlugin = function() {
  goog.base(this, goog.editor.Command.MODAL_LINK_EDITOR);

  /**
   * Event handler for this object.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);
};
goog.inherits(goog.editor.plugins.LinkDialogPlugin,
    goog.editor.plugins.AbstractDialogPlugin);


/**
 * Link object that the dialog is editing.
 * @type {goog.editor.Link}
 * @protected
 */
goog.editor.plugins.LinkDialogPlugin.prototype.currentLink_;


/**
 * Optional warning to show about email addresses.
 * @type {string|undefined}
 * @private
 */
goog.editor.plugins.LinkDialogPlugin.prototype.emailWarning_;


/**
 * Whether to stop referrer leaks.  Defaults to false.
 * @type {boolean}
 * @private
 */
goog.editor.plugins.LinkDialogPlugin.prototype.stopReferrerLeaks_ = false;


/** @inheritDoc */
goog.editor.plugins.LinkDialogPlugin.prototype.getTrogClassId =
    goog.functions.constant('LinkDialogPlugin');


/**
 * Tells the plugin to stop leaking the page's url via the referrer header when
 * the "test this link" link is clicked. When the user clicks on a link, the
 * browser makes a request for the link url, passing the url of the current page
 * in the request headers. If the user wants the current url to be kept secret
 * (e.g. an unpublished document), the owner of the url that was clicked will
 * see the secret url in the request headers, and it will no longer be a secret.
 * Calling this method will not send a referrer header in the request, just as
 * if the user had opened a blank window and typed the url in themselves.
 */
goog.editor.plugins.LinkDialogPlugin.prototype.stopReferrerLeaks = function() {
  this.stopReferrerLeaks_ = true;
};


/**
 * Sets the warning message to show to users about including email addresses on
 * public web pages.
 * @param {string} emailWarning Warning message to show users about including
 *     email addresses on the web.
 */
goog.editor.plugins.LinkDialogPlugin.prototype.setEmailWarning = function(
    emailWarning) {
  this.emailWarning_ = emailWarning;
};


/**
 * Handles execCommand by opening the dialog.
 * @param {string} command The command to execute.
 * @param {*=} opt_arg {@link A goog.editor.Link} object representing the link
 *     being edited.
 * @return {*} Always returns true, indicating the dialog was shown.
 * @protected
 * @override
 */
goog.editor.plugins.LinkDialogPlugin.prototype.execCommandInternal = function(
    command, opt_arg) {
  this.currentLink_ = /** @type {goog.editor.Link} */(opt_arg);
  return goog.base(this, 'execCommandInternal', command, opt_arg);
};


/**
 * Handles when the dialog closes.
 * @param {goog.events.Event} e The AFTER_HIDE event object.
 * @override
 * @protected
 */
goog.editor.plugins.LinkDialogPlugin.prototype.handleAfterHide = function(e) {
  goog.base(this, 'handleAfterHide', e);
  this.currentLink_ = null;
};


/**
 * @return {goog.events.EventHandler} The event handler.
 * @protected
 */
goog.editor.plugins.LinkDialogPlugin.prototype.getEventHandler = function() {
  return this.eventHandler_;
};


/**
 * @return {goog.editor.Link} The link being edited.
 * @protected
 */
goog.editor.plugins.LinkDialogPlugin.prototype.getCurrentLink = function() {
  return this.currentLink_;
};


/**
 * Creates a new instance of the dialog and registers for the relevant events.
 * @param {goog.dom.DomHelper} dialogDomHelper The dom helper to be used to
 *     create the dialog.
 * @param {*} link The target link (should be a goog.editor.Link).
 * @return {goog.ui.editor.LinkDialog} The dialog.
 * @override
 * @protected
 */
goog.editor.plugins.LinkDialogPlugin.prototype.createDialog = function(
    dialogDomHelper, link) {
  var dialog = new goog.ui.editor.LinkDialog(dialogDomHelper,
      /** @type {goog.editor.Link} */ (link));
  if (this.emailWarning_) {
    dialog.setEmailWarning(this.emailWarning_);
  }
  dialog.setStopReferrerLeaks(this.stopReferrerLeaks_);
  this.eventHandler_.
      listen(dialog, goog.ui.editor.AbstractDialog.EventType.OK,
          this.handleOk_).
      listen(dialog, goog.ui.editor.AbstractDialog.EventType.CANCEL,
          this.handleCancel_);
  return dialog;
};


/** @inheritDoc */
goog.editor.plugins.LinkDialogPlugin.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.eventHandler_.dispose();
};


/**
 * Handles the OK event from the dialog by updating the link in the field.
 * @param {goog.ui.editor.LinkDialog.OkEvent} e OK event object.
 * @private
 */
goog.editor.plugins.LinkDialogPlugin.prototype.handleOk_ = function(e) {
  // We're not restoring the original selection, so clear it out.
  this.disposeOriginalSelection();

  this.currentLink_.setTextAndUrl(e.linkText, e.linkUrl);
  // Place cursor to the right of the modified link.
  this.currentLink_.placeCursorRightOf();

  this.fieldObject.dispatchSelectionChangeEvent();
  this.fieldObject.dispatchChange();

  this.eventHandler_.removeAll();
};


/**
 * Handles the CANCEL event from the dialog by clearing the anchor if needed.
 * @param {goog.events.Event} e Event object.
 * @private
 */
goog.editor.plugins.LinkDialogPlugin.prototype.handleCancel_ = function(e) {
  if (this.currentLink_.isNew()) {
    goog.dom.flattenElement(this.currentLink_.getAnchor());
    // Make sure listeners know the anchor was flattened out.
    this.fieldObject.dispatchChange();
  }

  this.eventHandler_.removeAll();
};
