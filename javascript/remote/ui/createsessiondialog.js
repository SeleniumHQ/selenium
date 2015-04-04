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

goog.provide('remote.ui.CreateSessionDialog');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.ui.Component');
goog.require('remote.ui.ActionDialog');


/**
 * Dialog used to configure a new session request.
 * @param {!Array.<!(Object|string)>} browsers List of possible browsers to
 *     create sessions for: each browser should be defined either by its name,
 *     or a fully defined capabilities object.
 * @constructor
 * @extends {remote.ui.ActionDialog}
 */
remote.ui.CreateSessionDialog = function(browsers) {
  goog.base(this, 'Create a New Session');

  /** @private {!Array.<!Object>} */
  this.browsers_ = goog.array.map(browsers, function(browser) {
    return goog.isString(browser) ? {'browserName': browser} : browser;
  });

  goog.events.listen(this, goog.ui.Component.EventType.SHOW,
      this.onShow_, false, this);
};
goog.inherits(remote.ui.CreateSessionDialog, remote.ui.ActionDialog);


/**
 * Select for the new session browser; initialized in
 * {@code createContentDom()}.
 * @private {Element}
 */
remote.ui.CreateSessionDialog.prototype.browserSelect_ = null;


/** @override */
remote.ui.CreateSessionDialog.prototype.disposeInternal = function() {
  delete this.browsers_;
  delete this.browserSelect_;
  goog.base(this, 'disposeInternal');
};


/** @override */
remote.ui.CreateSessionDialog.prototype.createContentDom = function() {
  var dom = this.getDomHelper();
  this.browserSelect_ = dom.createDom(goog.dom.TagName.SELECT, null,
      createOption(''));
  goog.array.forEach(this.browsers_, function(browser) {
    goog.dom.appendChild(this.browserSelect_, createOption(browser));
  }, this);
  return dom.createDom(goog.dom.TagName.LABEL, null,
      'Browser:\xa0', this.browserSelect_);

  function createOption(capabilities) {
    var displayText = capabilities['browserName'];
    var version = capabilities['version'];
    if (version) {
      displayText += ' ' + version;
    }
    return dom.createDom(goog.dom.TagName.OPTION, null, displayText);
  }
};


/**
 * @return {Element} The browser select DOM element for this instance.
 */
remote.ui.CreateSessionDialog.prototype.getBrowserSelectElement = function() {
  return this.browserSelect_;
};


/** @override */
remote.ui.CreateSessionDialog.prototype.getUserSelection = function() {
  return this.browsers_[this.browserSelect_.selectedIndex - 1];
};


/** @override */
remote.ui.CreateSessionDialog.prototype.hasUserSelection = function() {
  return !!this.browserSelect_.selectedIndex;
};


/**
 * Handler for when this dialog is shown.
 * @param {!goog.events.Event} e The show event.
 * @private
 */
remote.ui.CreateSessionDialog.prototype.onShow_ = function(e) {
  this.browserSelect_.selectedIndex = 0;
};
