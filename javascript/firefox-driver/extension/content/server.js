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

var driver = false;
var domMessenger = null;

// If we're offline, attempt to force online mode, otherwise the server won't
// start. If we can't do it, it's not the end of the world, but it's Not Good.
// It became necessary to do this at some time after Firefox 4.
try {
  var ios = Components.classes['@mozilla.org/network/io-service;1']
      .getService(Components.interfaces.nsIIOService);
  if (ios && ios.offline) {
      ios.offline = false;
  }
} catch (ignoredButItsNotGood) {}


// This will configure a FirefoxDriver and DomMessenger for each
// _browser window_ (not chrome window). Multiple tabs in the same window will
// share a FirefoxDriver and DomMessenger instance.
window.addEventListener('load', function(e) {
  // http://w3c.github.io/webdriver/webdriver-spec.html#security-and-privacy
  var appcontent = document.getElementById('appcontent');
  if (appcontent) {
    appcontent.addEventListener('DOMContentLoaded', function(e) {
      var doc = e.originalTarget || e.target;
      var isSvg = doc.documentElement.nodeName == 'svg';
      var script = isSvg ?
          doc.createElementNS('http://www.w3.org/2000/svg', 'script') :
          doc.createElement('script');
      script.setAttribute('type', 'text/javascript');
      script.textContent = '(' + function() {
        Object.defineProperty(window.navigator, 'webdriver', {
          value: true,
          configurable: false,
          enumerable: true,
          writable: false
        });
      } + ')()';
      doc.documentElement.appendChild(script);
      doc.documentElement.removeChild(script);
    });
  }

  // old fingerprinting path
  var server = Components.classes['@googlecode.com/webdriver/fxdriver;1']
      .createInstance()
      .wrappedJSObject;

  if (!domMessenger) {
    if (appcontent) {
      try {
        var commandProcessor = Components.
            classes['@googlecode.com/webdriver/command-processor;1'].
            getService(Components.interfaces.nsICommandProcessor);
        domMessenger = new DomMessenger(commandProcessor);
        appcontent.addEventListener('DOMContentLoaded',
            function(e) {
              domMessenger.onPageLoad(e);
            }, true);
        appcontent.addEventListener('pagehide',
            function(e) {
              domMessenger.onPageUnload(e);
            }, true);
      } catch (ex) {
        // Not catching this can really mess things up and lead to inexplicable
        // and hard to debug behavior.
        Components.utils.reportError(ex);
      }
    }
  }

  if (!driver) {
    driver = server.newDriver(window);
  }

  server.startListening();
}, true);
