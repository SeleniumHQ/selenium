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
 * @fileoverview Methods for dealing with modal dialogs.
 */

goog.provide('fxdriver.modals');

goog.require('WebDriverError');
goog.require('bot.ErrorCode');
goog.require('fxdriver.Timer');
goog.require('fxdriver.logging');
goog.require('fxdriver.moz');
goog.require('fxdriver.utils');

fxdriver.modals.isModalPresent = function(callback, timeout) {
    fxdriver.modaltimer = new fxdriver.Timer();
    fxdriver.modaltimer.runWhenTrue(
    function() {
      var modal = fxdriver.modals.find_();
      return modal && modal.document;
    },
    function() { callback(true) },
    timeout,
    function() { callback(false) });
};


fxdriver.modals.acceptAlert = function(driver) {
  var modal = fxdriver.modals.find_();
  var button = fxdriver.modals.findButton_(modal, 'accept');
  button.click();
  fxdriver.modals.clearFlag_(driver);
};


fxdriver.modals.dismissAlert = function(driver) {
  var modal = fxdriver.modals.find_();
  var button = fxdriver.modals.findButton_(modal, 'cancel');

  if (!button) {
    fxdriver.logging.info('No cancel button Falling back to the accept button');
    button = fxdriver.modals.findButton_(modal, 'accept');
  }

  button.click();
  fxdriver.modals.clearFlag_(driver);
};


fxdriver.modals.getText = function(driver) {
  return driver.modalOpen;
};

fxdriver.modals.setValue = function(driver, value) {
  var modal = fxdriver.modals.find_();
  var textbox = modal.document.getElementById('loginTextbox');

  try {
    var isVisible = false;
    if (bot.userAgent.isProductVersion(8)) {
      isVisible = textbox.clientHeight != 0;
    } else {
      isVisible = textbox.selectionStart > -1;
    }

    if (isVisible) {
      textbox.value = value;
      return;
    }
  } catch (ignored) {}

  throw new WebDriverError(bot.ErrorCode.ELEMENT_NOT_VISIBLE, 'Alert did not have a text box');
};


fxdriver.modals.find_ = function() {
  var window = fxdriver.utils.windowMediator().getMostRecentWindow('');
  window = fxdriver.moz.unwrap(window);

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


fxdriver.modals.findButton_ = function(modal, value) {
  var doc = modal.document;
  var dialog = doc.getElementsByTagName('dialog')[0];
  return dialog.getButton(value);
};


fxdriver.modals.setFlag = function(driver, flagValue) {
  driver.modalOpen = flagValue;
};


fxdriver.modals.clearFlag_ = function(driver) {
  fxdriver.modals.setFlag(driver, false);
};


fxdriver.modals.findAssociatedDriver_ = function(window) {
  var ww = CC['@mozilla.org/embedcomp/window-watcher;1'].getService(CI['nsIWindowWatcher']);

  var parent = window ? window : ww.activeWindow;
  if (parent.wrappedJSObject) {
    parent = parent.wrappedJSObject;
  }
  var top = parent.top;

  // Now iterate over all open browsers to find the one we belong to
  var wm = CC['@mozilla.org/appshell/window-mediator;1'].getService(CI['nsIWindowMediator']);
  var allWindows = wm.getEnumerator('navigator:browser');
  while (allWindows.hasMoreElements()) {
    var chrome = allWindows.getNext().QueryInterface(CI.nsIDOMWindow);
    if (chrome.content == window) {
      return chrome.fxdriver;
    } else if (chrome.content.top == window.top) {
      return chrome.fxdriver;
    }
  }

  // There's no meaningful way we can reach this.
  fxdriver.logging.info('Unable to find the associated driver');
  return undefined;
};

fxdriver.modals.signalOpenModal = function(parent, text) {
  fxdriver.logging.info('signalOpenModal');
  // Try to grab the top level window
  var driver = fxdriver.modals.findAssociatedDriver_(parent);
  if (driver && driver.response_) {
    fxdriver.modals.setFlag(driver, text);
    var res = driver.response_;
    if (driver.response_.name == 'executeAsyncScript' && !driver.response_.responseSent_) {
      // Special case handling. If a modal is open when executeAsyncScript
      // tries to respond with a result, it doesn't do anything, so that this
      // codepath can be followed.
      fxdriver.modals.isModalPresent(function(present) {
        var errorMessage = 'Unexpected modal dialog (text: ' + text + ')';
        if (present) {
          try {
            fxdriver.modals.dismissAlert(driver);
          } catch (e) {
            errorMessage +=
                ' The alert could not be closed. The browser may be in a ' +
                'wildly inconsistent state, and the alert may still be ' +
                'open. This is not good. If you can reliably reproduce this' +
                ', please report a new issue at ' +
                'https://code.google.com/p/selenium/issues/entry ' +
                'with reproduction steps. Exception message: ' + e;
          }
        } else {
          errorMessage += ' The alert disappeared before it could be closed.';
        }
        res.sendError(new WebDriverError(bot.ErrorCode.MODAL_DIALOG_OPENED,
            errorMessage, {alert: {text: text}}));
      }, 2000);
    } else {
      // We hope that modals can only be opened by actions which don't pay
      // attention to the results of the command. Given this, the only ways we
      // can get to this code path are:
      //   * The command being executed was a getAlertText command, in which
      //     case we expect the text of the alert to be returned
      //   * The command being executed was an action which caused the alert
      //     to be displayed, but we ignore the results of actions, so the
      //     value will be ignored.
      res.value = text;
      res.send();
    }
  }
};


/**
 * Ensure that the given value is an acceptable one for the unexpected alert
 * behaviour setting.
 *
 * @param {string?} value The value to check.
 * @return {string} The acceptable value, or 'dismiss'.
 */
fxdriver.modals.asAcceptableAlertValue = function(value) {
  if ('accept' == value || 'ignore' == value) {
    return value;
  }

  return 'dismiss';
};


/**
 * Configure modal behaviours for the firefox driver.
 *
 * @param {string?} unexpectedAlertBehaviour How to handle unexpected alerts.
 */
fxdriver.modals.configure = function(unexpectedAlertBehaviour) {
  var prefs = fxdriver.moz.getService(
      '@mozilla.org/preferences-service;1', 'nsIPrefBranch');

  var value = fxdriver.modals.asAcceptableAlertValue(unexpectedAlertBehaviour);
  prefs.setCharPref('webdriver_unexpected_alert_behaviour', value);
};


/**
 * @return {string} The behavior when an unexpected alert is seen.
 */
fxdriver.modals.getUnexpectedAlertBehaviour = function() {
  var prefs = fxdriver.moz.getService(
      '@mozilla.org/preferences-service;1', 'nsIPrefBranch');

  if (!prefs.prefHasUserValue('webdriver_unexpected_alert_behaviour')) {
    return 'dismiss';
  }

  var raw = prefs.getCharPref('webdriver_unexpected_alert_behaviour');
  return fxdriver.modals.asAcceptableAlertValue(raw);
};
