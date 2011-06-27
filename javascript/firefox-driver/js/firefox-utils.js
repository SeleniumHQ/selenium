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
goog.require('goog.array');
goog.require('Logger');


var CC = Components.classes;
var CI = Components.interfaces;
var CR = Components.results;


webdriver.firefox.utils.queryInterface = function(self, iids) {
  return function(iid) {
    if (!iid) {
      return CR.NS_ERROR_NO_INTERFACE;
    }

    if (iid.equals(CI.nsISupports)) {
      return self;
    }

    var match = goog.array.reduce(iids, function(result, curr) {
      if (!curr) {
        return result;
      }

      return result || curr.equals(iid);
    }, false);

    if (match) {
      return self;
    }
    throw CR.NS_ERROR_NO_INTERFACE;
  };
};


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


// This method closely follows unwrapNode() from mozmill-tests
/**
 * Unwraps a something which is wrapped into a XPCNativeWrapper or XrayWrapper.
 *
 * @param {!Object} thing The "something" to unwrap.
 * @returns {!Object} The object, unwrapped if possible.
 */
webdriver.firefox.utils.unwrap = function(thing) {
  // TODO(simon): This is identical to the same function in firefox-chrome
  if (!goog.isDefAndNotNull(thing)) {
    return thing;
  }

  // If we've already unwrapped the object, don't unwrap it again.
  // TODO(simon): see whether XPCWrapper->IsSecurityWrapper is available in JS
  if (thing.__fxdriver_unwrapped) {
    return thing;
  }

  if (thing['wrappedJSObject']) {
    thing.wrappedJSObject.__fxdriver_unwrapped = true;
    return thing.wrappedJSObject;
  }

  // unwrap is not available on older branches (3.5 and 3.6) - Bug 533596
  try {
    var isWrapper = thing == XPCNativeWrapper(thing);
    if (isWrapper) {
      var unwrapped = XPCNativeWrapper.unwrap(thing);
      var toReturn = !!unwrapped ? unwrapped : thing;
      toReturn.__fxdriver_unwrapped = true;
      return toReturn;
    }
  } catch(e) {
    // Unwrapping will fail for JS literals - numbers, for example. Catch
    // the exception and proceed, it will eventually be returned as-is.
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


webdriver.firefox.utils.isFirefox4 = function() {
  var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
        getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.
        classes['@mozilla.org/xpcom/version-comparator;1'].
        getService(Components.interfaces.nsIVersionComparator);

    return versionChecker.compare(appInfo.version, '4.0b1') >= 0;
};


webdriver.firefox.utils.unwrapFor4 = function(doc) {
  if (webdriver.firefox.utils.isFirefox4()) {
    return webdriver.firefox.utils.unwrap(doc);
  }
  return doc;
};


/**
 * @param {!Element} element The element to use
 * @param {int} x X coordinate
 * @param {int} y Y coordinate
 */
webdriver.firefox.utils.newCoordinates = function(element, x, y) {
  return {
    QueryInterface: function(iid) {
      if (iid.equals(Components.interfaces.wdICoorinate) ||
          iid.equals(Components.interfaces.nsISupports))
        return this;
      throw Components.results.NS_NOINTERFACE;
    },
    auxiliary: element ? new XPCNativeWrapper(element) : null,
    x: x,
    y: y
  };
}