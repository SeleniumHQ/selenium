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

goog.provide('remote.ui.OpenScriptDialog');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.ui.Component');
goog.require('goog.ui.LabelInput');
goog.require('remote.ui.ActionDialog');



/**
 * Dialog used to specify a WebDriverJS script that should be loaded by a
 * session.
 * @constructor
 * @extends {remote.ui.ActionDialog}
 */
remote.ui.OpenScriptDialog = function() {
  goog.base(this, 'Open WebDriverJS Script');

  goog.events.listen(this, goog.ui.Component.EventType.SHOW,
      this.onShow_, false, this);

  /**
   * Input for the URL to open.
   * @private {!goog.ui.LabelInput}
   */
  this.input_ = new goog.ui.LabelInput('Script URL');
  this.addChild(this.input_);
};
goog.inherits(remote.ui.OpenScriptDialog, remote.ui.ActionDialog);


/** @override */
remote.ui.OpenScriptDialog.prototype.disposeInternal = function() {
  delete this.input_;
  goog.base(this, 'disposeInternal');
};


/** @override */
remote.ui.OpenScriptDialog.prototype.createContentDom = function() {
  var link = goog.dom.createDom(goog.dom.TagName.A, {
    'href': 'https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs',
    'target': '_blank'
  }, 'WebDriverJS');

  this.input_.createDom();
  goog.dom.classlist.add(this.input_.getElement(), 'url-input');

  var dom = this.getDomHelper();
  return dom.createDom(goog.dom.TagName.DIV, null,
      dom.createDom(goog.dom.TagName.P, null,
          'Open a page that has the ', link,
          ' client. The page will be opened with the query ' +
              'parameters required to communicate with the server.'),
      this.input_.getElement());
};


/**
 * @return {Element} The DOM element for the URL text box.
 */
remote.ui.OpenScriptDialog.prototype.getUrlElement = function() {
  return this.input_.getElement();
};


/**
 * Handler for when this dialog is shown.
 * @private
 */
remote.ui.OpenScriptDialog.prototype.onShow_ = function() {
  this.input_.clear();
  // goog.ui.LabelInput restricts access to #check_, which would
  // restore the place holder text for us, so we have to trick it into running.
  this.input_.getElement().focus();
  this.input_.getElement().blur();
};


/** @override */
remote.ui.OpenScriptDialog.prototype.getUserSelection = function() {
  return this.input_.getValue();
};


/** @override */
remote.ui.OpenScriptDialog.prototype.hasUserSelection = function() {
  return this.input_.hasChanged();
};
