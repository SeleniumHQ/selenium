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

goog.provide('WebLoadingListener');
goog.provide('fxdriver.io');

goog.require('fxdriver.Timer');
goog.require('fxdriver.logging');
goog.require('fxdriver.moz');
goog.require('goog.log');


/**
 * @param {string} current The URL the browser is currently on.
 * @param {?string} future The destination URL, if known.
 * @return {Boolean} Whether a full page load would be expected if future is
 *    followed.
 */
fxdriver.io.isLoadExpected = function(current, future) {
  if (!future) {
    // Assume that we'll go somewhere exciting.
    return true;
  }

  var ioService =
      fxdriver.moz.getService('@mozilla.org/network/io-service;1', 'nsIIOService');
  var currentUri = ioService.newURI(current, '', null);
  var futureUri = ioService.newURI(future, '', currentUri);

  var loadEventExpected = true;
  if (futureUri.scheme == 'javascript') {
    // Assume that we're just modifying the local page.
    return false;
  }

  if (currentUri && futureUri &&
      currentUri.prePath == futureUri.prePath &&
      currentUri.filePath == futureUri.filePath) {
    // Looks like we're at the same url with a ref
    // Being clever and checking the ref was causing me headaches.
    // Brute force for now
    loadEventExpected = futureUri.path.indexOf('#') == -1;
  }

  return loadEventExpected;
};


var STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

function DoNothing(browser, onComplete, opt_window) {
  this.browser = browser;
  this.onComplete = onComplete;
  this.win = opt_window;
  this.active = true;
}
DoNothing.prototype.onLocationChange = function() { return 0; };
DoNothing.prototype.onProgressChange = function() { return 0; };
DoNothing.prototype.onStateChange = function() { return 0; };
DoNothing.prototype.onStatusChange = function() { return 0; };
DoNothing.prototype.onSecurityChange = function() { return 0; };
DoNothing.prototype.onLinkIconAvailable = function() { return 0; };

DoNothing.prototype.QueryInterface = function(iid) {
  if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
      iid.equals(Components.interfaces.nsISupportsWeakReference) ||
      iid.equals(Components.interfaces.nsISupports)) {
    return this;
  }
  throw Components.results.NS_NOINTERFACE;
};


function PatientListener(browser, onComplete, opt_window) {
  this.browser = browser;
  this.onComplete = onComplete;
  this.win = opt_window;
  this.active = true;
}

/**
 * @private {goog.log.Logger}
 * @const
 */
PatientListener.LOG_ = fxdriver.logging.getLogger('fxdriver.PatientListener');

PatientListener.prototype = new DoNothing();


PatientListener.prototype.onStateChange = function(webProgress, request, flags) {
  if (!this.active) {
    return 0;
  }

  if (flags & STATE_STOP) {
    goog.log.info(PatientListener.LOG_, 'request status is ' + request.status);
    if (request.URI) {
      this.active = false;

      // On versions of firefox prior to 4 removing a listener may cause
      // subsequent listeners to be skipped. Favouring a memory leak over
      // not working properly.
      if (bot.userAgent.isProductVersion('4')) {
        WebLoadingListener.removeListener(this.browser, this);
      }
      this.onComplete();
    }
  }
  return 0;
};


function ImpatientListener(browser, onComplete, opt_window) {
  this.browser = browser;
  this.browserProgress = browser.webProgress;
  this.active = true;
  this.onComplete = onComplete;
  this.win = opt_window || null;
}


/**
 * @private {goog.log.Logger}
 * @const
 */
ImpatientListener.LOG_ = fxdriver.logging.getLogger(
    'fxdriver.ImpatientListener');


ImpatientListener.prototype = new PatientListener();

ImpatientListener.prototype.onProgressChange = function(webProgress) {
  if (!this.active) {
    return 0;
  }

  // The expected webProgress is not always given to this method:
  // https://bugzilla.mozilla.org/show_bug.cgi?id=693970
  // Consequently, we'll need to iterate over the browser's load group
  // looking for what we want to find. Or do we....

  if (!this.win || this.win.closed) {
    return 0;
  }

  var readyState = this.win.document && this.win.document.readyState;
  var location = this.win.document.location;

  goog.log.info(ImpatientListener.LOG_, 'readyState is ' + readyState);

  if (('complete' == readyState || 'interactive' == readyState) &&
      (location != 'about:blank')) {
    this.active = false;

    // On versions of firefox prior to 4 removing a listener may cause
    // subsequent listeners to be skipped. Favouring a memory leak over
    // not working properly.
    if (bot.userAgent.isProductVersion('4')) {
      WebLoadingListener.removeListener(this.browser, this);
    }
    this.onComplete(false, true);
  }

  return 0;
};


var prefs = Components.classes['@mozilla.org/preferences-service;1']
    .getService(Components.interfaces['nsIPrefBranch']);

/**
 * Builds a nsIWebProgressListener for the given browser.
 * @param {!nsIWebProgress} browser The browser window to listen to for load
 *     events.
 * @param {function(boolean)} toCall The function to call when listener detects
 *     that the browser has finished loading.
 * @param {Window=} opt_window The DOM window being watched.
 * @return {!nsIWebProgressListener} The new listener.
 */
function buildHandler(browser, toCall, opt_window) {
  var strategy = Utils.getPageLoadStrategy();
  if ('normal' == strategy) {
    return new PatientListener(browser, toCall, opt_window);
  }
  if ('unstable' == strategy || 'eager' == strategy) {
    return new ImpatientListener(browser, toCall, opt_window);
  }

  var log = fxdriver.logging.getLogger('fxdriver.WebLoadingListener');
  goog.log.warning(log, 'Unsupported page loading strategy: ' + strategy);
  // Fall back to 'normal' strategy
  return new PatientListener(browser, toCall, opt_window);
}

var loadingListenerTimer;

/**
 * @param {!nsIWebProgress} browser The browser window to listen to for load
 *     events.
 * @param {function(boolean)} toCall The function to call when either the
 *     timeout expires or the browser finishes loading.
 * @param {number} timeout The timeout to use, in milliseconds.
 * @param {Window=} opt_window The DOM window being watched.
 * @constructor
 */
WebLoadingListener = function(browser, toCall, timeout, opt_window) {
  var strategy = Utils.getPageLoadStrategy();
  if ('none' == strategy) {
    toCall(false, true);
    return;
  }

  loadingListenerTimer = new fxdriver.Timer();
  var func = function(timedOut, opt_stopWaiting) {
    loadingListenerTimer.cancel();
    toCall(timedOut, opt_stopWaiting);
  };

  /** @type {!nsIWebProgressListener} */
  this.handler = buildHandler(browser, func, opt_window);

  browser.addProgressListener(this.handler);
  if (timeout == -1) {
    timeout = 1000 * 60 * 30; // 30 minutes is a loooong time.
  }

  var handler = this.handler;
  loadingListenerTimer.setTimeout(function() {
    if (browser.removeProgressListener) {
      browser.removeProgressListener(handler);
    }
    func(true);
  }, timeout);
};

/**
 * Removes a progress listener from the given browser.
 * @param {!nsIWebProgress} browser The browser to remove a listener from.
 * @param {!WebLoadingListener} listener The listener to remove.
 */
WebLoadingListener.removeListener = function(browser, listener) {
  if (browser.removeProgressListener && listener.handler) {
    browser.removeProgressListener(listener.handler);
  }
};
