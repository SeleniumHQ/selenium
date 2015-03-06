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

goog.provide('fxdriver.utils');

goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.userAgent');
goog.require('fxdriver.moz');
goog.require('goog.array');



fxdriver.moz.queryInterface = function(self, iids) {
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


fxdriver.utils.windowMediator = function() {
  var clazz = CC['@mozilla.org/appshell/window-mediator;1'];
  if (!clazz) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_COMMAND);
  }

  return clazz.getService(CI['nsIWindowMediator']);
};


fxdriver.utils.getChromeWindow = function(win) {
  return win
      .QueryInterface(CI.nsIInterfaceRequestor)
      .getInterface(CI.nsIWebNavigation)
      .QueryInterface(CI.nsIDocShellTreeItem)
      .rootTreeItem
      .QueryInterface(CI.nsIInterfaceRequestor)
      .getInterface(CI.nsIDOMWindow)
      .QueryInterface(CI.nsIDOMChromeWindow);
};


/**
 * Generate a unique id.
 *
 * @return {string} A new, unique id.
 */
fxdriver.utils.getUniqueId = function() {
  // TODO(simon): initialize this statically.
  if (!fxdriver.utils._generator) {
    fxdriver.utils._generator =
    fxdriver.moz.getService('@mozilla.org/uuid-generator;1', 'nsIUUIDGenerator');
  }
  return fxdriver.utils._generator.generateUUID().toString();
};


/**
 * @param {!Element} element The element to use.
 * @param {int} x X coordinate.
 * @param {int} y Y coordinate.
 */
fxdriver.utils.newCoordinates = function(element, x, y) {
  return {
    QueryInterface: function(iid) {
      if (iid.equals(Components.interfaces.wdICoordinate) ||
          iid.equals(Components.interfaces.nsISupports))
        return this;
      throw Components.results.NS_NOINTERFACE;
    },
    auxiliary: element,
    x: x,
    y: y
  };
};
