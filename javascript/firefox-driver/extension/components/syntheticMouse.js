/*
 Copyright 2011 WebDriver committers
 Copyright 2011 Google Inc.

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

var CC = Components.classes;
var CI = Components.interfaces;
var CU = Components.utils;

CU.import("resource://gre/modules/XPCOMUtils.jsm");

const CONSOLE = CC["@mozilla.org/consoleservice;1"].
                  getService(CI["nsIConsoleService"]);

function SyntheticMouse() {
  // Get the wonder of the events
  CU.import('resource://fxdriver/modules/atoms.js');
  // And the utility methods we may need
  CU.import('resource://fxdriver/modules/utils.js');

  this.wrappedJSObject = this;

  this.QueryInterface = webdriver.firefox.utils.queryInterface(this,
      [CI.nsISupports, CI.wdIMouse]);
}

// wdIMouse

SyntheticMouse.prototype.mouseMove = function(coordinates) {
  if (!coordinates.auxiliary) {
    throw new bot.Error("No element specified for mouse move.");
  }

  var element = webdriver.firefox.utils.unwrap(coordinates.auxiliary);

  if (goog.isFunction(element.scrollIntoView)) {
    element.scrollIntoView();
  }

  var parent = element.parent;
  while (parent && parent.nodeType != goog.dom.NodeType.ELEMENT) {
    parent = parent.parent;
  }

  var fireAndCheck = function(e, eventName, opt_coordinates) {
    if (!e) {
      return false;
    }
    bot.events.fire(e, eventName, opt_coordinates);
    return bot.dom.isShown(element, /*ignoreOpacity=*/true);
  };

  var proceed = fireAndCheck(parent, goog.events.EventType.MOUSEOUT) &&
      fireAndCheck(element, goog.events.EventType.MOUSEOVER, coordinates) &&
      fireAndCheck(element, goog.events.EventType.MOUSEMOVE, coordinates);

  if (!proceed) {
    return;
  }

  if (element.onmouseover) {
    element.onmouseover();
  }
};


// And finally, registering
SyntheticMouse.prototype.classDescription = "Pure JS implementation of a mouse";
SyntheticMouse.prototype.contractID = '@googlecode.com/webdriver/syntheticmouse;1';
SyntheticMouse.prototype.classID = Components.ID('{E8F9FEFE-C513-4097-98BE-BE00A41D3645}');

const components = [SyntheticMouse];
var NSGetFactory, NSGetModule;
if (XPCOMUtils.generateNSGetFactory) {
  NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
} else {
  NSGetModule = XPCOMUtils.generateNSGetModule(components);
}
