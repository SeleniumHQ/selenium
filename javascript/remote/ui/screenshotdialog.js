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

goog.provide('remote.ui.ScreenshotDialog');
goog.provide('remote.ui.ScreenshotDialog.State');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.Dialog');



/**
 * Dialog displayed when requesting a screenshot from the server.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
remote.ui.ScreenshotDialog = function() {
  goog.base(this, undefined, true);

  this.setButtonSet(goog.ui.Dialog.ButtonSet.createOk());
  this.setState(remote.ui.ScreenshotDialog.State.LOADING);
};
goog.inherits(remote.ui.ScreenshotDialog, goog.ui.Dialog);


/**
 * The states a ScreenshotDialog may be in.
 * @enum {number}
 */
remote.ui.ScreenshotDialog.State = {
  /** Waiting for the server's response. */
  LOADING: 0,
  /** The server's response has been received. */
  LOADED: 1
};


/**
 * Title displayed while loading a screenshot.
 * @type {string}
 * @const
 */
remote.ui.ScreenshotDialog.LOADING_TITLE = 'Taking Screenshot...';


/**
 * Title displayed when the screenshot is ready.
 * @type {string}
 * @const
 */
remote.ui.ScreenshotDialog.LOADED_TITLE = 'Screenshot';


/**
 * The dialog's state.
 * @private {number}
 */
remote.ui.ScreenshotDialog.prototype.state_ =
    remote.ui.ScreenshotDialog.State.LOADING;


/** @override */
remote.ui.ScreenshotDialog.prototype.disposeInternal = function() {
  delete this.state_;
  goog.base(this, 'disposeInternal');
};


/** @param {number} state The new state. */
remote.ui.ScreenshotDialog.prototype.setState = function(state) {
  this.state_ = state;
  switch (state) {
    case remote.ui.ScreenshotDialog.State.LOADED:
      this.setTitle(remote.ui.ScreenshotDialog.LOADED_TITLE);
      break;

    case remote.ui.ScreenshotDialog.State.LOADING:
    default:
      this.setTitle(remote.ui.ScreenshotDialog.LOADING_TITLE);
      this.setTextContent('');
      break;
  }
};


/**
 * Updates this dialog to display the given screenshot.
 * @param {string} screenshot The screenshot PNG as a base64 string.
 */
remote.ui.ScreenshotDialog.prototype.displayScreenshot = function(screenshot) {
  if (!this.isVisible()) {
    return;
  }

  this.setState(remote.ui.ScreenshotDialog.State.LOADED);

  var url = 'data:image/png;base64,' + screenshot;
  var dom = this.getDomHelper();

  var a = dom.createDom(goog.dom.TagName.A, { 'href': url, 'target': '_blank' },
      dom.createDom(goog.dom.TagName.IMG, { 'src': url }));

  this.setTextContent('');
  goog.dom.appendChild(this.getContentElement(), a);

  this.reposition();
};
