/*
 Copyright 2010 WebDriver committers
 Copyright 2010 Google Inc.

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

/**
 * @fileoverview Methods for dealing with modal dialogs
 */

goog.provide('webdriver.modals');

goog.require('Logger');
goog.require('Timer');
goog.require('webdriver.firefox.utils');


var CI = Components.interfaces;
var CC = Components.classes;


webdriver.modals.actualFind_ = function(windowMediator) {
  var window = windowMediator.getMostRecentWindow('');
  window = webdriver.firefox.utils.unwrap(window);

  // Get the WebBrowserChrome and check if it's a modal window
  var chrome = window.QueryInterface(CI.nsIInterfaceRequestor).
      getInterface(CI.nsIWebNavigation).
      QueryInterface(CI.nsIDocShellTreeItem).
      treeOwner.
      QueryInterface(CI.nsIInterfaceRequestor).
      getInterface(CI.nsIWebBrowserChrome);
  if (!chrome.isWindowModal()) {
    return null;
  }

  return window;
};


// This function is largely derived from the equivalent function in mozmill
webdriver.modals.findModal_ = function(callback, errback, timeout) {
  var wm = webdriver.firefox.utils.windowMediator();

  var timer = new Timer();
  timer.runWhenTrue(function() { return webdriver.modals.actualFind_(wm) }, callback, timeout, errback);
};


webdriver.modals.findButton_ = function(modal, value) {
  var doc = modal.document;
  var dialog = doc.getElementsByTagName("dialog")[0];
  return dialog.getButton(value);
};


webdriver.modals.clearFlag_ = function(driver) {
  driver.modalOpen = false;
};


webdriver.modals.setFlag = function(driver, flagValue) {
  driver.modalOpen = flagValue;
};


webdriver.modals.acceptAlert = function(driver, timeout, callback, errback) {
  webdriver.modals.findModal_(function(modal) {
    var button = webdriver.modals.findButton_(modal, "accept");
    button.click();
    webdriver.modals.clearFlag_(driver);
    callback();
  }, errback, timeout);
};


webdriver.modals.dismissAlert = function(driver, timeout, callback, errback) {
  webdriver.modals.findModal_(function(modal) {
    var button = webdriver.modals.findButton_(modal, "cancel");

    if (!button) {
      Logger.dumpn('No cancel button Falling back to the accept button');
      button = webdriver.modals.findButton_(modal, "accept");
    }

    button.click();
    webdriver.modals.clearFlag_(driver);
    callback();
  }, errback, timeout);
};


// API kept consistent
webdriver.modals.getText = function(driver, timeout, callback, unused) {
  return callback(driver.modalOpen);
};

webdriver.modals.setValue = function(driver, timeout, value, callback, errback) {
  webdriver.modals.findModal_(function(modal) {
    var textbox = modal.document.getElementById('loginTextbox');
    textbox.value = value;
    callback();
  }, errback, timeout);
};

webdriver.modals.errback = function(respond) {
  return function() {
    respond.status = ErrorCode.UNHANDLED_ERROR;
    respond.value = { message: 'Unable to dismiss alert. Is an alert present?' };
    respond.send();
  }
};

webdriver.modals.success = function(respond) {
  return goog.bind(respond.send, respond);
};

webdriver.modals.findAssociatedDriver_ = function(window) {
  var ww = CC["@mozilla.org/embedcomp/window-watcher;1"].getService(CI["nsIWindowWatcher"]);

  var parent = window ? window : ww.activeWindow;
  if (parent.wrappedJSObject) {
    parent = parent.wrappedJSObject;
  }
  var top = parent.top;

  // Now iterate over all open browsers to find the one we belong to
  var wm = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI["nsIWindowMediator"]);
  var allWindows = wm.getEnumerator("navigator:browser");
  while (allWindows.hasMoreElements()) {
    var chrome = allWindows.getNext().QueryInterface(CI.nsIDOMWindow);
    if (chrome.content == window) {
      return chrome.fxdriver;
    } else if(chrome.content.parent == window.parent) {
      return chrome.fxdriver;
    }
  }

  // There's no meaningful way we can reach this.
  Logger.dumpn('Unable to find the associated driver');
  return undefined;
};

webdriver.modals.signalOpenModal = function(parent, text) {
  // Try to grab the top level window
  var driver = webdriver.modals.findAssociatedDriver_(parent);

  if (driver && driver.response_) {
    webdriver.modals.setFlag(driver, text);

    var res = driver.response_;
    res.value = {
      text: text
    };
    res.statusCode = ErrorCode.MODAL_DIALOG_OPENED;
    res.send();
  }
};
