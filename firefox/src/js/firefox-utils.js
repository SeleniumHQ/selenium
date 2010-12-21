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
 * @fileoverview Functions that form common utility methods in the firefox
 * driver.
 */

// Large parts of this file are derived from Mozilla's MozMill tool.

goog.provide('webdriver.firefox.utils');

goog.require('bot.Error');
goog.require('bot.ErrorCode');


var CC = Components.classes;
var CI = Components.interfaces;


webdriver.firefox.utils.windowMediator = function() {
  var clazz = CC['@mozilla.org/appshell/window-mediator;1'];
  if (!clazz) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_COMMAND);
  }

  return clazz.getService(CI['nsIWindowMediator']);
};


webdriver.firefox.utils.getChromeWindow = function(win) {
  return win
      .QueryInterface(CI.nsIInterfaceRequestor)
      .getInterface(CI.nsIWebNavigation)
      .QueryInterface(CI.nsIDocShellTreeItem)
      .rootTreeItem
      .QueryInterface(CI.nsIInterfaceRequestor)
      .getInterface(CI.nsIDOMWindow)
      .QueryInterface(CI.nsIDOMChromeWindow);
};


// TODO(simon): Roll this out throughout the codebase before Firefox 4 is released.
// This method closely follows unwrapNode() from mozmill-tests
/**
 * Unwraps a something which is wrapped into a XPCNativeWrapper or XrayWrapper.
 *
 * @param {!Object} thing The "something" to unwrap.
 * @returns {!Object} The object, unwrapped if possible.
 */
webdriver.firefox.utils.unwrap = function(thing) {
  if (!goog.isDefAndNotNull(thing)) {
    return thing;
  }

  // unwrap is not available on older branches (3.5 and 3.6) - Bug 533596

  if (XPCNativeWrapper && "unwrap" in XPCNativeWrapper) {
    try {
      return XPCNativeWrapper.unwrap(thing);
    } catch(e) {
      //Unwrapping will fail for JS literals - numbers, for example. Catch
      // the exception and proceed, it will eventually be returend as-is.
      Logger.dumpn("Unwrap failed: " + e);
    }

  }

  if (thing['wrappedJSObject']) {
    return thing.wrappedJSObject;
  }

  return thing;
};

/**
 * For Firefox 4, some objects (like the Window) are wrapped to make them safe
 * to access from privileged code but this hides fields we need, like the
 * frames array. Remove this wrapping.
 * See: https://developer.mozilla.org/en/XPCNativeWrapper
 */
webdriver.firefox.utils.unwrapXpcOnly = function(thing) {
  if (XPCNativeWrapper && "unwrap" in XPCNativeWrapper) {
    try {
      return XPCNativeWrapper.unwrap(thing);
    } catch(e) {
      //Unwrapping will fail for JS literals - numbers, for example. Catch
      // the exception and proceed, it will eventually be returend as-is.
      Logger.dumpn("Unwrap From XPC only failed: " + e);
    }

  }
  
  return thing;
};

