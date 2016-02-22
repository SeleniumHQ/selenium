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

/**
 * @fileoverview A lightweight client used to establish a connection with the
 * SafariDriver when the browser is first launched.
 */

goog.provide('safaridriver.client');

goog.require('goog.Uri');
goog.require('goog.debug.DivConsole');
goog.require('goog.log');
goog.require('safaridriver.message.Connect');


/**
 * Initializes the client.
 */
safaridriver.client.init = function() {
  var h2 = document.createElement('h2');
  h2.innerHTML = 'SafariDriver Launcher';
  document.body.appendChild(h2);

  var div = document.createElement('div');
  document.body.appendChild(div);

  var divConsole = new goog.debug.DivConsole(div);
  divConsole.setCapturing(true);

  var log = goog.log.getLogger('safaridriver.client');

  var url = new goog.Uri(window.location).getQueryData().get('url');
  if (!url) {
    goog.log.error(log,
        'No url specified. Please reload this page with the url parameter set');
    return;
  }
  url = new goog.Uri(url);

  goog.log.info(log, 'Connecting to SafariDriver browser extension...');
  goog.log.info(log,
      'This will fail if you have not installed the latest SafariDriver ' +
      'extension from\n' +
      'http://selenium-release.storage.googleapis.com/index.html');
  goog.log.info(log,
      'Extension logs may be viewed by clicking the Selenium [\u2713] ' +
      'button on the Safari toolbar');
  var numAttempts = 0;
  var message = new safaridriver.message.Connect(url.toString());
  connect();

  function connect() {
    numAttempts += 1;
    var acknowledged = message.sendSync(window);
    if (acknowledged) {
      goog.log.info(log, 'Connected to extension');
      goog.log.info(log, 'Requesting extension connect to client at ' + url);
    } else if (numAttempts < 5) {
      var timeout = 250 * numAttempts;
      setTimeout(connect, timeout);
    } else {
      goog.log.error(log,
          'Unable to establish a connection with the SafariDriver extension');
    }
  }
};
goog.exportSymbol('init', safaridriver.client.init);
