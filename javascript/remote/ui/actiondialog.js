// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('remote.ui.ActionDialog');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.ui.Component');
goog.require('goog.ui.Dialog');



/**
 * Dialog opened to present the user with more options upon selecting a
 * particular action.
 * @param {string} title The dialog title.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
remote.ui.ActionDialog = function(title) {
  goog.base(this, /*opt_class=*/undefined, /*useIframeMask=*/true);
  this.setTitle(title);

  goog.events.listen(this, goog.ui.Dialog.EventType.SELECT,
      this.onUserSelect_, false, this);
};
goog.inherits(remote.ui.ActionDialog, goog.ui.Dialog);


/** @override */
remote.ui.ActionDialog.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.appendChild(this.getContentElement(), this.createContentDom());
};


/** @override */
remote.ui.ActionDialog.prototype.setVisible = function(visible) {
  goog.base(this, 'setVisible', visible);
  if (visible) {
    this.dispatchEvent(goog.ui.Component.EventType.SHOW);
  }
};


/**
 * Creates the content element for this dialog. Must be defined by sub-types.
 * @return {!Element} The DOM content for this dialog.
 * @protected
 */
remote.ui.ActionDialog.prototype.createContentDom = goog.abstractMethod;


/**
 * Returns the user's selection for this dialog. Must be defined by sub-types.
 * @return {*} The user's selection.
 */
remote.ui.ActionDialog.prototype.getUserSelection = goog.abstractMethod;


/**
 * @return {boolean} Whether the user made a selection on this dialog, or
 *     choose to cancel their action.
 * @protected
 */
remote.ui.ActionDialog.prototype.hasUserSelection = goog.abstractMethod;


/**
 * Event handler for {@link goog.ui.Dialog.EventType.SELECT} events. If the
 * event key is "ok", will dispatch a
 * {@link goog.ui.Component.EventType.ACTION} event.
 * @param {!goog.ui.Dialog.Event} e The select event.
 * @private
 */
remote.ui.ActionDialog.prototype.onUserSelect_ = function(e) {
  if (e.key != 'ok' || !this.hasUserSelection()) {
    return;
  }
  this.dispatchEvent(goog.ui.Component.EventType.ACTION);
};
