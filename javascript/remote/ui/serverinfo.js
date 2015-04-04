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

goog.provide('remote.ui.ServerInfo');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.ui.Component');



/**
 * Simple widget for displaying information about a WebDriver server,
 * as returned by the /status command handler.
 * @constructor
 * @extends {goog.ui.Component}
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#status
 */
remote.ui.ServerInfo = function() {
  goog.base(this);
};
goog.inherits(remote.ui.ServerInfo, goog.ui.Component);


/** @override */
remote.ui.ServerInfo.prototype.createDom = function() {
  this.setElementInternal(this.getDomHelper().
      createDom(goog.dom.TagName.DIV, 'server-info'));
  this.updateInfo();
};


/**
 * Updates the displayed server info.
 * @param {string=} opt_os The operating system the server is running on.
 * @param {string=} opt_version The server version.
 * @param {string=} opt_revision The revision the server was built from.
 */
remote.ui.ServerInfo.prototype.updateInfo = function(opt_os, opt_version,
                                                     opt_revision) {
  var contents = [];

  if (opt_os) {
    contents.push(opt_os);
  }

  if (opt_version) {
    contents.push('v' + opt_version);
  }

  if (opt_revision) {
    contents.push('r' + opt_revision);
  }

  goog.dom.setTextContent(this.getElement(),
      contents.length ? contents.join('\xa0\xa0|\xa0\xa0') :
          'Server info unavailable');
};
