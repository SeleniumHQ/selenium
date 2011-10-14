/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2011 Software Freedom Conservatory

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

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
PatientListener.prototype = new DoNothing();


PatientListener.prototype.onStateChange = function(webProgress, request, flags) {
  if (!this.active) {
    return 0;
  }

  if (flags & STATE_STOP) {
    if (request.URI) {
      this.active = false;

      // On versions of firefox prior to 4 removing a listener may cause
      // subsequent listeners to be skipped. Favouring a memory leak over
      // not working properly.
      if (bot.userAgent.isVersion('4')) {
        WebLoadingListener.removeListener(this.browser, this);
      }
      this.onComplete(webProgress);
    }
  }
  return 0;
};


function ImpatientListener(browser, onComplete, opt_window) {
  this.broser = browser;
  this.browserProgress = browser.webProgress;
  this.active = true;
  this.onComplete = onComplete;
  this.win = opt_window || null;
}
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

  if (('complete' == readyState || 'interactive' == readyState) &&
      (location != 'about:blank')) {
    this.active = false;

    // On versions of firefox prior to 4 removing a listener may cause
    // subsequent listeners to be skipped. Favouring a memory leak over
    // not working properly.
    if (bot.userAgent.isVersion('4')) {
      WebLoadingListener.removeListener(this.browser, listener);
    }
    this.onComplete(webProgress || this.browserProgress);
  }

  return 0;
};


var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces["nsIPrefBranch"]);

function buildHandler(browser, toCall, opt_window) {
  if (prefs.prefHasUserValue('webdriver.load.strategy')) {
    if ('fast' == prefs.getCharPref('webdriver.load.strategy')) {
      return new ImpatientListener(browser, toCall, opt_window);
    }
  }
  return new PatientListener(browser, toCall, opt_window);
}

function WebLoadingListener(browser, toCall, opt_window) {
  this.handler = buildHandler(browser, toCall, opt_window);
  browser.addProgressListener(this.handler);
}

WebLoadingListener.removeListener = function(browser, listener) {
  browser.removeProgressListener(listener.handler);
};
