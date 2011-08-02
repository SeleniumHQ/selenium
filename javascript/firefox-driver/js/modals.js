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

goog.require('ErrorCode');
goog.require('Logger');
goog.require('Timer');
goog.require('webdriver.firefox.utils');


var CI = Components.interfaces;
var CC = Components.classes;


webdriver.modals.isModalPresent = function(callback, timeout) {
  var timer = new Timer();
  timer.runWhenTrue(
    function() { return webdriver.modals.find_() },
    function() { callback(true) },
    timeout,
    function() { callback(false) });
};


webdriver.modals.acceptAlert = function(driver) {
  var modal = webdriver.modals.find_();
  var button = webdriver.modals.findButton_(modal, "accept");
  button.click();
  webdriver.modals.clearFlag_(driver);
};


webdriver.modals.dismissAlert = function(driver) {
  var modal = webdriver.modals.find_();
  var button = webdriver.modals.findButton_(modal, "cancel");

  if (!button) {
    Logger.dumpn('No cancel button Falling back to the accept button');
    button = webdriver.modals.findButton_(modal, "accept");
  }

  button.click();
  webdriver.modals.clearFlag_(driver);
};


webdriver.modals.getText = function(driver) {
  return driver.modalOpen
};

webdriver.modals.setValue = function(driver, value) {
  var modal = webdriver.modals.find_();
  var textbox = modal.document.getElementById('loginTextbox');
  try {
    var trueIfTextboxExists = textbox.selectionStart > -1;
    if (trueIfTextboxExists) {
      textbox.value = value;
    }
  } catch (e) {
    throw new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE, 'Alert did not have a text box');
  }
};


webdriver.modals.find_ = function() {
  var window = webdriver.firefox.utils.windowMediator().getMostRecentWindow('');
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


webdriver.modals.findButton_ = function(modal, value) {
  var doc = modal.document;
  var dialog = doc.getElementsByTagName("dialog")[0];
  return dialog.getButton(value);
};


webdriver.modals.setFlag = function(driver, flagValue) {
  driver.modalOpen = flagValue;
};


webdriver.modals.clearFlag_ = function(driver) {
  webdriver.modals.setFlag(driver, false);
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
  Logger.dumpn("signalOpenModal");
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
