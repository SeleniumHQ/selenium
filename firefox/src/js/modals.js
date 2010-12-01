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
goog.require('webdriver.firefox.utils');


var CI = Components.interfaces;
var CC = Components.classes;


// This function is largely derived from the equivalent function in mozmill
webdriver.modals.findModal_ = function() {
  var wm = webdriver.firefox.utils.windowMediator();
  var window = wm.getMostRecentWindow('');
  window = webdriver.firefox.utils.unwrap(window);

  // Get the WebBrowserChrome and check if it's a modal window
  var chrome = window.QueryInterface(CI.nsIInterfaceRequestor).
      getInterface(CI.nsIWebNavigation).
      QueryInterface(CI.nsIDocShellTreeItem).
      treeOwner.
      QueryInterface(CI.nsIInterfaceRequestor).
      getInterface(CI.nsIWebBrowserChrome);
  if (!chrome.isWindowModal()) {
    Logger.dumpn('window is not modal');
    return null;
  }

  return window;
};


webdriver.modals.findButton_ = function(modal, value) {
  var doc = modal.document;
  var dialog = doc.getElementsByTagName("dialog")[0];
  return dialog.getButton(value);
};


webdriver.modals.clearFlag_ = function(driver) {
  driver.modalOpen = false;
};


webdriver.modals.acceptAlert = function(driver) {
  var modal = webdriver.modals.findModal_();

  var button = webdriver.modals.findButton_(modal, "accept");
  button.click();
  webdriver.modals.clearFlag_(driver);
};


webdriver.modals.dismissAlert = function(driver) {
  var modal = webdriver.modals.findModal_();

  var button = webdriver.modals.findButton_(modal, "cancel");

  if (!button) {
    Logger.dumpn('No cancel button Falling back to the accept button');
    button = webdriver.modals.findButton_(modal, "accept");
  }

  button.click();
  webdriver.modals.clearFlag_(driver);
};
