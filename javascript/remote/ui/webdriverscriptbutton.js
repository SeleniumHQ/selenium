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

goog.provide('remote.ui.WebDriverScriptButton');

goog.require('goog.events');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('remote.ui.Event');
goog.require('remote.ui.OpenScriptDialog');



/**
 * Control for loading a WebDriverJS script in a particular session.
 * @constructor
 * @extends {goog.ui.Button}
 */
remote.ui.WebDriverScriptButton = function() {
  goog.base(this, 'Load Script');

  /**
   * Dialog used to load a script for the current session.
   * @private {!remote.ui.OpenScriptDialog}
   */
  this.openScriptDialog_ = new remote.ui.OpenScriptDialog();

  goog.events.listen(this.openScriptDialog_, goog.ui.Component.EventType.ACTION,
      this.onLoadScript_, false, this);
  goog.events.listen(this, goog.ui.Component.EventType.ACTION,
      goog.bind(this.openScriptDialog_.setVisible, this.openScriptDialog_,
          true));
};
goog.inherits(remote.ui.WebDriverScriptButton, goog.ui.Button);


/**
 * The type of event dispatched by the {@link remote.ui.WebDriverScriptButton}
 * when the user indicates they wish to load a WebDriverJS script with the
 * selected session.
 * @type {string}
 * @const
 */
remote.ui.WebDriverScriptButton.LOAD_SCRIPT = 'loadscript';


/** @override */
remote.ui.WebDriverScriptButton.prototype.disposeInternal = function() {
  this.openScriptDialog_.dispose();
  delete this.openScriptDialog_;
  goog.base(this, 'disposeInternal');
};


/**
 * Callback for when the user has made a selection in a
 * {@link remote.ui.OpenScriptDialog}. Dispatches a
 * {@link remote.ui.WebDriverScriptButton.LOAD_SCRIPT} event with the URL to
 * load as data.
 * @private
 */
remote.ui.WebDriverScriptButton.prototype.onLoadScript_ = function() {
  var event = new remote.ui.Event(remote.ui.WebDriverScriptButton.LOAD_SCRIPT,
      this, this.openScriptDialog_.getUserSelection());
  this.dispatchEvent(event);
};
