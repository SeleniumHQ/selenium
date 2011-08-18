/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2007 ThoughtWorks, Inc

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

goog.provide('Utils');

goog.require('bot.dom');
goog.require('bot.userAgent');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('ErrorCode');
goog.require('Logger');


/**
 * A WebDriver error.
 * @param {!number} code The error code.
 * @param {!string|Error} messageOrError The error message, or another Error to
 *     propagate.
 * @constructor
 */
function WebDriverError(code, messageOrError) {

  var message;
  var stack;
  if (messageOrError instanceof Error) {
    message = messageOrError.message;
    stack = messageOrError.stack;
  } else {
    message = messageOrError.toString();
    stack = Error(message).stack.split('\n');
    stack.shift();
    stack = stack.join('\n');
  }

  /**
   * This error's status code.
   * @type {!number}
   */
  this.code = code;

  /**
   * This error's message.
   * @type {string}
   */
  this.message = message;

  /**
   * Captures a stack trace for when this error was thrown.
   * @type {string}
   */
  this.stack = stack;

  /**
   * Used to identify this class since instanceof will not work across
   * component boundaries.
   * @type {!boolean}
   */
  this.isWebDriverError = true;
}


function createSwitchFile(file_content) {
  var filename = "/tmp/switch_window_started";
  var cc = Components.classes;
  var ci = Components.interfaces;

  try {
    // TODO(eran): Look at the OS and only do this where it makes sense.
    var tmpdir = cc['@mozilla.org/file/local;1'].createInstance(ci.nsILocalFile);
    tmpdir.initWithPath("/tmp");

    // Do not create a switch file on systems that do not have a /tmp directory
    // - this serves to prevent creation of a switch file on Windows systems.
    if (!tmpdir.exists()) {
      return;
    }

    var file = cc['@mozilla.org/file/local;1'].createInstance(ci.nsILocalFile);
    file.initWithPath(filename);
    var fileOutputStream = cc['@mozilla.org/network/safe-file-output-stream;1'].createInstance(ci.nsIFileOutputStream);
    fileOutputStream.init(file, -1, -1, null);

    fileOutputStream.write(file_content, file_content.length);
    if (fileOutputStream instanceof ci.nsISafeOutputStream) {
        fileOutputStream.finish();
    } else {
        fileOutputStream.close();
    }
  } catch (e) {
    // Fine. Log it and continue
    Logger.dumpn(e);
  }
}

Utils.getUniqueId = function() {
  if (!Utils._generator) {
    Utils._generator =
    Utils.getService("@mozilla.org/uuid-generator;1", "nsIUUIDGenerator");
  }
  return Utils._generator.generateUUID().toString();
};


Utils.newInstance = function(className, interfaceName) {
  var clazz = Components.classes[className];

  if (!clazz) {
    Logger.dumpn("Unable to find class: " + className);
    return undefined;
  }
  var iface = Components.interfaces[interfaceName];

  return clazz.createInstance(iface);
};


Utils.getService = function(className, serviceName) {
  var clazz = Components.classes[className];
  if (clazz == undefined) {
    throw new Exception();
  }

  return clazz.getService(Components.interfaces[serviceName]);
};


Utils.getServer = function() {
  var handle =
      Utils.newInstance("@googlecode.com/webdriver/fxdriver;1", "nsISupports");
  return handle.wrappedJSObject;
};


Utils.getActiveElement = function(doc) {
  var window = goog.dom.getWindow(doc);

  var element;
  if (doc["activeElement"]) {
    element = doc.activeElement;
  } else {
    var topWindow = window.top;
    element = topWindow.activeElement;

    if (element && doc != element.ownerDocument)
      element = null;
  }

  // Default to the body
  if (!element) {
    element = doc.body;
  }

  return element;
};


Utils.isInHead = function(element) {
  while (element) {
    if (element.tagName && element.tagName.toLowerCase() == "head") {
      return true;
    }
    try {
      element = element.parentNode;
    } catch (e) {
      // Fine. the DOM has dispeared from underneath us
      return false;
    }
  }

  return false;
};


Utils.isEnabled = function(element) {
  return !!!element.disabled;
};


/**
 * Gets the computed style of a DOM {@code element}. If the computed style is
 * inherited from the element's parent, the parent will be queried for its
 * style value. If the style value is an RGB color string, it will be converted
 * to hex ("#rrggbb").
 * @param {Element} element The DOM element whose computed style to retrieve.
 * @param {string} propertyName The name of the CSS style proeprty to get.
 * @return {string} The computed style as a string.
 */
Utils.getStyleProperty = function(element, propertyName) {
  if (!element) {
    return undefined;
  }

  var value = element.ownerDocument.defaultView.getComputedStyle(element, null).
      getPropertyValue(propertyName);

  if ('inherit' == value && element.parentNode.style) {
    value = Utils.getStyleProperty(element.parentNode, propertyName);
  }

  // Convert colours to hex if possible
  var raw = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/.exec(value);
  if (raw) {
    var hex = (Number(raw[1]) << 16) +
              (Number(raw[2]) << 8) +
              (Number(raw[3]));
    hex = (hex & 0x00ffffff) | 0x1000000;
    value = '#' + hex.toString(16).substring(1);
  }

  return value;
};


Utils.addToKnownElements = function(element, rawDoc) {
  var owner = new XPCNativeWrapper(element.ownerDocument);
  var doc = webdriver.firefox.utils.unwrapFor4(rawDoc);
  if (owner != new XPCNativeWrapper(rawDoc)) {
    doc = webdriver.firefox.utils.unwrap(owner);
  }

  // Right. This is ugly. Sorry. The reasoning goes:
  // * Finding elements normally returns a fairly "raw" object
  // * Finding elements by JS returns a fully populated object
  // In both cases, the elements implement the same XPCOM interfaces, but clicks
  // that are aimed at a target frame fail for elements found using JS.
  // Fortunately, if we _always_ wrap elements in an XPCNativeWrapper things
  // work as expected. Except for frames. When frames are wrapped switching to
  // a frame by passing in the element means that the element cache doesn't work
  // as expected (I've not done much research). Consequently, we avoid wrapping
  // elements that looks like a frame.

  var isFrame = element.tagName == goog.dom.TagName.IFRAME ||
      element.tagName == goog.dom.TagName.FRAME;

  var toCompareWith = isFrame ? element : new XPCNativeWrapper(element);

  if (!doc.fxdriver_elements) {
    doc.fxdriver_elements = {};
  }

  for (var e in doc.fxdriver_elements) {
    if (doc.fxdriver_elements[e] == toCompareWith) {
      return e;
    }
  }

  var id = Utils.getUniqueId();
  doc.fxdriver_elements[id] = toCompareWith;

  return id;
};


Utils.getElementAt = function(index, rawDoc) {
  var doc = webdriver.firefox.utils.unwrapFor4(rawDoc);

  // There's a chance that previous "addToKnownElements" had to use the
  // unwrapped document in versions of firefox prior to 4. This won't work as
  // expected and so we need to check for its presence, copy it into the right
  // place and then remove it. This will break element equality in some cases.

  var unwrapped = webdriver.firefox.utils.unwrap(rawDoc);
  if (unwrapped.fxdriver_elements) {
    var existing = doc.fxdriver_elements || {};
    for (var i in unwrapped.fxdriver_elements) {
      var existingElement = unwrapped.fxdriver_elements[i];
      if (bot.dom.isElement(existingElement)) {
        existing[i] = existingElement;
      }
    }
    delete(unwrapped.fxdriver_elements);
    doc.fxdriver_elements = existing;
  }

  var e = doc.fxdriver_elements ? doc.fxdriver_elements[index] : undefined;
  if (e) {
    if (!Utils.isAttachedToDom(e)) {
      delete doc.fxdriver_elements[index];
      throw new WebDriverError(ErrorCode.STALE_ELEMENT_REFERENCE,
          'Element is no longer attached to the DOM');
    }
  } else {
    throw new WebDriverError(ErrorCode.STALE_ELEMENT_REFERENCE,
        'Element not found in the cache');
  }

  return webdriver.firefox.utils.unwrapFor4(e);
};


Utils.isAttachedToDom = function(element) {
  // In Firefox 4, our DOM nodes need to be wrapped in XPCNativeWrappers
  function wrapNode(node) {
    if (bot.userAgent.isFirefox4()) {
      return node ? new XPCNativeWrapper(node) : null;
    }
    return node;
  }

  var documentElement = wrapNode(element.ownerDocument.documentElement);
  var parent = wrapNode(element);

  while (parent && parent != documentElement) {
    parent = wrapNode(parent.parentNode);
  }
  return parent == documentElement;
};


Utils.platform = function(doc) {
  if (!this.userAgentPlatformLowercase) {
    var currentWindow = doc.defaultView;
    this.userAgentPlatformLowercase =
    currentWindow.navigator.platform.toLowerCase();
  }

  return this.userAgentPlatformLowercase;
};


Utils.shiftCount = 0;


Utils.getNativeEvents = function() {
  try {
    var cid = "@openqa.org/nativeevents;1";
    var obj = Components.classes[cid].createInstance();
    return obj.QueryInterface(Components.interfaces.nsINativeEvents);
  } catch(e) {
    Logger.dumpn(e);
    // Unable to retrieve native events. No biggie, because we fall back to
    // synthesis later
    return undefined;
  }
};


Utils.getNodeForNativeEvents = function(element) {
  try {
    // This stuff changes between releases.
    // Do as much up-front work in JS as possible
    var retrieval = Utils.newInstance(
        "@mozilla.org/accessibleRetrieval;1", "nsIAccessibleRetrieval");
    var accessible = retrieval.getAccessibleFor(element.ownerDocument);
    var accessibleDoc =
        accessible.QueryInterface(Components.interfaces.nsIAccessibleDocument);
    return accessibleDoc.QueryInterface(Components.interfaces.nsISupports);
  } catch(e) {
    // Unable to retrieve the accessible doc
    return undefined;
  }
};

Utils.useNativeEvents = function() {
  var prefs =
    Utils.getService("@mozilla.org/preferences-service;1", "nsIPrefBranch");
  var enableNativeEvents =
    prefs.prefHasUserValue("webdriver_enable_native_events") ?
    prefs.getBoolPref("webdriver_enable_native_events") : false;

  if (enableNativeEvents && Utils.getNativeEvents()) {
      return true;
  }

  return false;
}

Utils.type = function(doc, element, text, opt_useNativeEvents, jsTimer) {

  // For consistency between native and synthesized events, convert common
  // escape sequences to their Key enum aliases.
  text = text.replace(new RegExp('\b', 'g'), '\uE003').   // DOM_VK_BACK_SPACE
      replace(/\t/g, '\uE004').                           // DOM_VK_TAB
      replace(/(\r\n|\n|\r)/g, '\uE006');                 // DOM_VK_RETURN

  // Special-case file input elements. This is ugly, but should be okay
  if (element.tagName == "INPUT") {
    var inputtype = element.getAttribute("type");
    if (inputtype && inputtype.toLowerCase() == "file") {
      element.value = text;
      Utils.fireHtmlEvent(element, "change");
      return;
    }
  }

  var obj = Utils.getNativeEvents();
  var node = Utils.getNodeForNativeEvents(element);
  var thmgr_cls = Components.classes["@mozilla.org/thread-manager;1"];

  if (opt_useNativeEvents && obj && node && thmgr_cls) {

    var pageUnloadedIndicator = Utils.getPageUnloadedIndicator(element);

    // Now do the native thing.
    obj.sendKeys(node, text);

    Utils.waitForNativeEventsProcessing(element, obj, pageUnloadedIndicator, jsTimer);

    return;
  }

  Logger.dumpn("Doing sendKeys in a non-native way...")
  var controlKey = false;
  var shiftKey = false;
  var altKey = false;
  var metaKey = false;

  Utils.shiftCount = 0;

  var upper = text.toUpperCase();

  for (var i = 0; i < text.length; i++) {
    var c = text.charAt(i);

    // NULL key: reset modifier key states, and continue

    if (c == '\uE000') {
      if (controlKey) {
        var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
        Utils.keyEvent(doc, element, "keyup", kCode, 0,
            controlKey = false, shiftKey, altKey, metaKey);
      }

      if (shiftKey) {
        var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
        Utils.keyEvent(doc, element, "keyup", kCode, 0,
            controlKey, shiftKey = false, altKey, metaKey);
      }

      if (altKey) {
        var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
        Utils.keyEvent(doc, element, "keyup", kCode, 0,
            controlKey, shiftKey, altKey = false, metaKey);
      }

      if (metaKey) {
        var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_META;
        Utils.keyEvent(doc, element, "keyup", kCode, 0,
            controlKey, shiftKey, altKey, metaKey = false);
      }

      continue;
    }

    // otherwise decode keyCode, charCode, modifiers ...

    var modifierEvent = "";
    var charCode = 0;
    var keyCode = 0;

    if (c == '\uE001') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CANCEL;
    } else if (c == '\uE002') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_HELP;
    } else if (c == '\uE003') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_BACK_SPACE;
    } else if (c == '\uE004') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_TAB;
    } else if (c == '\uE005') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CLEAR;
    } else if (c == '\uE006') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_RETURN;
    } else if (c == '\uE007') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ENTER;
    } else if (c == '\uE008') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
      shiftKey = !shiftKey;
      modifierEvent = shiftKey ? "keydown" : "keyup";
    } else if (c == '\uE009') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
      controlKey = !controlKey;
      modifierEvent = controlKey ? "keydown" : "keyup";
    } else if (c == '\uE00A') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
      altKey = !altKey;
      modifierEvent = altKey ? "keydown" : "keyup";
    } else if (c == '\uE03D') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_META;
      metaKey = !metaKey;
      modifierEvent = metaKey ? "keydown" : "keyup";
    } else if (c == '\uE00B') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAUSE;
    } else if (c == '\uE00C') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ESCAPE;
    } else if (c == '\uE00D') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SPACE;
      keyCode = charCode = ' '.charCodeAt(0);  // printable
    } else if (c == '\uE00E') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAGE_UP;
    } else if (c == '\uE00F') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAGE_DOWN;
    } else if (c == '\uE010') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_END;
    } else if (c == '\uE011') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_HOME;
    } else if (c == '\uE012') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_LEFT;
    } else if (c == '\uE013') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_UP;
    } else if (c == '\uE014') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_RIGHT;
    } else if (c == '\uE015') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_DOWN;
    } else if (c == '\uE016') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_INSERT;
    } else if (c == '\uE017') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_DELETE;
    } else if (c == '\uE018') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SEMICOLON;
      charCode = ';'.charCodeAt(0);
    } else if (c == '\uE019') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_EQUALS;
      charCode = '='.charCodeAt(0);
    } else if (c == '\uE01A') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD0;
      charCode = '0'.charCodeAt(0);
    } else if (c == '\uE01B') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD1;
      charCode = '1'.charCodeAt(0);
    } else if (c == '\uE01C') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD2;
      charCode = '2'.charCodeAt(0);
    } else if (c == '\uE01D') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD3;
      charCode = '3'.charCodeAt(0);
    } else if (c == '\uE01E') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD4;
      charCode = '4'.charCodeAt(0);
    } else if (c == '\uE01F') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD5;
      charCode = '5'.charCodeAt(0);
    } else if (c == '\uE020') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD6;
      charCode = '6'.charCodeAt(0);
    } else if (c == '\uE021') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD7;
      charCode = '7'.charCodeAt(0);
    } else if (c == '\uE022') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD8;
      charCode = '8'.charCodeAt(0);
    } else if (c == '\uE023') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD9;
      charCode = '9'.charCodeAt(0);
    } else if (c == '\uE024') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_MULTIPLY;
      charCode = '*'.charCodeAt(0);
    } else if (c == '\uE025') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ADD;
      charCode = '+'.charCodeAt(0);
    } else if (c == '\uE026') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SEPARATOR;
      charCode = ','.charCodeAt(0);
    } else if (c == '\uE027') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SUBTRACT;
      charCode = '-'.charCodeAt(0);
    } else if (c == '\uE028') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_DECIMAL;
      charCode = '.'.charCodeAt(0);
    } else if (c == '\uE029') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_DIVIDE;
      charCode = '/'.charCodeAt(0);
    } else if (c == '\uE031') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F1;
    } else if (c == '\uE032') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F2;
    } else if (c == '\uE033') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F3;
    } else if (c == '\uE034') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F4;
    } else if (c == '\uE035') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F5;
    } else if (c == '\uE036') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F6;
    } else if (c == '\uE037') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F7;
    } else if (c == '\uE038') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F8;
    } else if (c == '\uE039') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F9;
    } else if (c == '\uE03A') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F10;
    } else if (c == '\uE03B') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F11;
    } else if (c == '\uE03C') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_F12;
    } else if (c == ',' || c == '<') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_COMMA;
      charCode = c.charCodeAt(0);
    } else if (c == '.' || c == '>') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PERIOD;
      charCode = c.charCodeAt(0);
    } else if (c == '/' || c == '?') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SLASH;
      charCode = text.charCodeAt(i);
    } else if (c == '`' || c == '~') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_BACK_QUOTE;
      charCode = c.charCodeAt(0);
    } else if (c == '{' || c == '[') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_OPEN_BRACKET;
      charCode = c.charCodeAt(0);
    } else if (c == '\\' || c == '|') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_BACK_SLASH;
      charCode = c.charCodeAt(0);
    } else if (c == '}' || c == ']') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CLOSE_BRACKET;
      charCode = c.charCodeAt(0);
    } else if (c == '\'' || c == '"') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_QUOTE;
      charCode = c.charCodeAt(0);
    } else {
      keyCode = upper.charCodeAt(i);
      charCode = text.charCodeAt(i);
    }

    // generate modifier key event if needed, and continue

    if (modifierEvent) {
      Utils.keyEvent(doc, element, modifierEvent, keyCode, 0,
          controlKey, shiftKey, altKey, metaKey);
      continue;
    }

    // otherwise, shift down if needed

    var needsShift = false;
    if (charCode) {
      needsShift = /[A-Z\!\$\^\*\(\)\+\{\}\:\?\|~@#%&_"<>]/.test(c);
    }

    if (needsShift && !shiftKey) {
      var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
      Utils.keyEvent(doc, element, "keydown", kCode, 0,
          controlKey, true, altKey, metaKey);
      Utils.shiftCount += 1;
    }

    // generate key[down/press/up] for key

    var pressCode = keyCode;
    if (charCode >= 32 && charCode < 127) {
      pressCode = 0;
      if (!needsShift && shiftKey && charCode > 32) {
        // If typing a lowercase character key and the shiftKey is down, the
        // charCode should be mapped to the shifted key value. This assumes
        // a default 104 international keyboard layout.
        if (charCode >= 97 && charCode <= 122) {
          charCode = charCode + 65 - 97;  // [a-z] -> [A-Z]
        } else {
          var mapFrom = '`1234567890-=[]\\;\',./';
          var mapTo = '~!@#$%^&*()_+{}|:"<>?';

          var value = String.fromCharCode(charCode).
              replace(/([\[\\\.])/g, '\\$1');
          var index = mapFrom.search(value);
          if (index >= 0) {
            charCode = mapTo.charCodeAt(index);
          }
        }
      }
    }

    var accepted =
        Utils.keyEvent(doc, element, "keydown", keyCode, 0,
            controlKey, needsShift || shiftKey, altKey, metaKey);

    Utils.keyEvent(doc, element, "keypress", pressCode, charCode,
        controlKey, needsShift || shiftKey, altKey, metaKey, !accepted);

    Utils.keyEvent(doc, element, "keyup", keyCode, 0,
        controlKey, needsShift || shiftKey, altKey, metaKey);

    // shift up if needed

    if (needsShift && !shiftKey) {
      var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
      Utils.keyEvent(doc, element, "keyup", kCode, 0,
          controlKey, false, altKey, metaKey);
    }
  }

  // exit cleanup: keyup active modifier keys

  if (controlKey) {
    var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
    Utils.keyEvent(doc, element, "keyup", kCode, 0,
        controlKey = false, shiftKey, altKey, metaKey);
  }

  if (shiftKey) {
    var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
    Utils.keyEvent(doc, element, "keyup", kCode, 0,
        controlKey, shiftKey = false, altKey, metaKey);
  }

  if (altKey) {
    var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
    Utils.keyEvent(doc, element, "keyup", kCode, 0,
        controlKey, shiftKey, altKey = false, metaKey);
  }

  if (metaKey) {
    var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_META;
    Utils.keyEvent(doc, element, "keyup", kCode, 0,
        controlKey, shiftKey, altKey, metaKey = false);
  }
};


Utils.keyEvent = function(doc, element, type, keyCode, charCode,
                          controlState, shiftState, altState, metaState,
                          shouldPreventDefault) {
  var preventDefault = shouldPreventDefault == undefined ? false
      : shouldPreventDefault;

  var keyboardEvent = doc.createEvent("KeyEvents");
  var currentView = doc.defaultView;

  keyboardEvent.initKeyEvent(
      type, //  in DOMString typeArg,
      true, //  in boolean canBubbleArg
      true, //  in boolean cancelableArg
      currentView, //  in nsIDOMAbstractView viewArg
      controlState, //  in boolean ctrlKeyArg
      altState, //  in boolean altKeyArg
      shiftState, //  in boolean shiftKeyArg
      metaState, //  in boolean metaKeyArg
      keyCode, //  in unsigned long keyCodeArg
      charCode);    //  in unsigned long charCodeArg

  if (preventDefault) {
    keyboardEvent.preventDefault();
  }

  return element.dispatchEvent(keyboardEvent);
};


Utils.fireHtmlEvent = function(element, eventName) {
  var doc = element.ownerDocument;
  var e = doc.createEvent("HTMLEvents");
  e.initEvent(eventName, true, true);
  return element.dispatchEvent(e);
};


Utils.findForm = function(element) {
  // Are we already on an element that can be used to submit the form?
  try {
    element.QueryInterface(Components.interfaces.nsIDOMHTMLButtonElement);
    return element;
  } catch(e) {
  }

  try {
    var input =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
    if (input.type == "image" || input.type == "submit")
      return input;
  } catch(e) {
  }

  var form = element;
  while (form) {
    if (form["submit"])
      return form;
    form = form.parentNode;
  }
  return undefined;
};


Utils.fireMouseEventOn = function(element, eventName, clientX, clientY) {
  Utils.triggerMouseEvent(element, eventName, clientX, clientY);
};


Utils.triggerMouseEvent = function(element, eventType, clientX, clientY) {
  var event = element.ownerDocument.createEvent("MouseEvents");
  var view = element.ownerDocument.defaultView;

  clientX = clientX || 0;
  clientY = clientY || 0;

  event.initMouseEvent(eventType, true, true, view, 1, 0, 0, clientX, clientY,
      false, false, false, false, 0, element);
  element.dispatchEvent(event);
};


Utils.findDocumentInFrame = function(browser, frameId) {
  var frame = Utils.findFrame(browser, frameId);
  return frame ? frame.document : null;
};


Utils.findFrame = function(browser, frameId) {
  var stringId = "" + frameId;
  var names = stringId.split(".");
  var frame = browser.contentWindow;
  for (var i = 0; i < names.length; i++) {
    // Try a numerical index first
    var index = names[i] - 0;
    if (!isNaN(index)) {
      frame = frame.frames[index];
      if (frame) {
        return frame;
      }
    } else {
      // Fine. Use the name and loop
      var found = false;
      for (var j = 0; j < frame.frames.length; j++) {
        var f = frame.frames[j];
        var wholeRestOfName = names.slice(i).join(".");
        if (f.name == wholeRestOfName || f.frameElement.id == wholeRestOfName) {
          return f;
        }
        if (f.name == names[i] || f.frameElement.id == names[i]) {
          frame = f;
          found = true;
          break;
        }
      }

      if (!found) {
        return null;
      }
    }
  }

  return frame;
};


Utils.getElementLocation = function(element) {
  var x = element.offsetLeft;
  var y = element.offsetTop;
  var elementParent = element.offsetParent;
  while (elementParent != null) {
    if (elementParent.tagName == "TABLE") {
      var parentBorder = parseInt(elementParent.border);
      if (isNaN(parentBorder)) {
        var parentFrame = elementParent.getAttribute('frame');
        if (parentFrame != null) {
          x += 1;
          y += 1;
        }
      } else if (parentBorder > 0) {
        x += parentBorder;
        y += parentBorder;
      }
    }
    x += elementParent.offsetLeft;
    y += elementParent.offsetTop;
    elementParent = elementParent.offsetParent;
  }

  // Netscape can get confused in some cases, such that the height of the parent
  // is smaller than that of the element (which it shouldn't really be). If this
  // is the case, we need to exclude this element, since it will result in too
  // large a 'top' return value.
  if (element.offsetParent && element.offsetParent.offsetHeight
      && element.offsetParent.offsetHeight < element.offsetHeight) {
    // skip the parent that's too small
    element = element.offsetParent.offsetParent;
  } else {
    // Next up...
    element = element.offsetParent;
  }
  var location = new Object();
  location.x = x;
  location.y = y;
  return location;
};


Utils.findElementsByXPath = function (xpath, contextNode, doc) {
  var result = doc.evaluate(xpath, contextNode, null,
      Components.interfaces.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  var indices = [];
  var element = result.iterateNext();
  while (element) {
    var index = Utils.addToKnownElements(element, doc);
    indices.push(index);
    element = result.iterateNext();
  }
  return indices;
};

Utils.locationsEqual = function(location1, location2) {
  var locationProperties = ['x', 'y', 'width', 'height'];

  for (var i in locationProperties) {
    var p = locationProperties[i];
    if (location1[p] !== location2[p]) {
      return false;
    }
  }

  return true;
};

Utils.getLocationViaAccessibilityInterface = function(element) {
  var retrieval = Utils.newInstance(
    "@mozilla.org/accessibleRetrieval;1", "nsIAccessibleRetrieval");
  var accessible = retrieval.getAccessibleFor(element);

  if (! accessible) {
    return;
  }

  var x = {}, y = {}, width = {}, height = {};
  accessible.getBounds(x, y, width, height);

  return {
    x : x.value,
    y : y.value,
    width: width.value,
    height: height.value
  };
};

Utils.getLocation = function(element, opt_onlyFirstRect) {
  try {
    element = element.wrappedJSObject ? element.wrappedJSObject : element;
    var clientRect = undefined;
    if (opt_onlyFirstRect && element.getClientRects().length > 1) {
      clientRect = element.getClientRects()[0];
    } else {
      clientRect = element.getBoundingClientRect();
    }

    // Firefox 3.5
    if (clientRect['width']) {
      return {
        x : clientRect.left + 3,
        y : clientRect.top,
        width: clientRect.width,
        height: clientRect.height
      };
    }

    // Firefox 3.0.14 seems to have top, bottom attributes.
    if (clientRect['top'] !== undefined) {
      var retWidth = clientRect.right - clientRect.left;
      var retHeight = clientRect.bottom - clientRect.top;
      return {
        x : clientRect.left,
        y : clientRect.top,
        width: retWidth,
        height: retHeight
      }
    }

    // Firefox 3.0, but lacking client rect
    Logger.dumpn("Falling back to firefox3 mechanism");
    var accessibleLocation = Utils.getLocationViaAccessibilityInterface(element);
    accessibleLocation.x = clientRect.left + 3;
    accessibleLocation.y = clientRect.top;
    return accessibleLocation;
  } catch(e) {
    Logger.dumpn(e);
    // Element doesn't have an accessibility node
    Logger.dumpn("Falling back to using closure to find the location of the element");

    var position = goog.style.getClientPosition(element);
    var size = goog.style.getBorderBoxSize(element);
    var shown = bot.dom.isShown(element, /*ignoreOpacity=*/true);

    return {
      x: position.x,
      y: position.y,
      width: shown ? size.width : 0,
      height: shown ? size.height : 0
    };
  }
};


Utils.getLocationOnceScrolledIntoView = function(element, opt_onlyFirstRect) {
  // Some elements may not a scrollIntoView function - for example,
  // elements under an SVG element. Call those only if they exist.
  if (typeof element.scrollIntoView == 'function') {
    element.scrollIntoView(true);
  }

  return Utils.getLocation(element, opt_onlyFirstRect);
};


Utils.unwrapParameters = function(wrappedParameters, doc) {
  var converted = [];
  while (wrappedParameters && wrappedParameters.length > 0) {
    var t = wrappedParameters.shift();
    switch (typeof t) {
      case 'number':
      case 'string':
      case 'boolean':
        converted.push(t);
        break;
      case 'object':
        if (t == null) {
          converted.push(null);
        } else if (typeof t.length === 'number' &&
            !(t.propertyIsEnumerable('length'))) {
          converted.push(Utils.unwrapParameters(t, doc));
        } else if (typeof t['ELEMENT'] === 'string') {
          var element = Utils.getElementAt(t['ELEMENT'], doc);
          element = element.wrappedJSObject ? element.wrappedJSObject : element;
          converted.push(element);
        } else {
          var convertedObj = {};
          for (var prop in t) {
            convertedObj[prop] = Utils.unwrapParameters(t[prop], doc);
          }
          converted.push(convertedObj);
        }
        break;
    }
  }
  return converted;
};


Utils.isArray_ = function(obj) {
  return (obj !== undefined &&
    obj.constructor.toString().indexOf("Array") != -1);
};


Utils.isHtmlCollection_ = function(obj) {
  return (obj !== undefined && obj['length'] &&
    obj['item'] && obj['namedItem']); 
};


Utils.wrapResult = function(result, doc) {
  result = webdriver.firefox.utils.unwrap(result);

  // Sophisticated.
  switch (typeof result) {
    case 'string':
    case 'number':
    case 'boolean':
      return result;

    case 'function':
      return result.toString();

    case 'undefined':
      return null;

    case 'object':
      if (result == null) {
        return null;
      }

      // There's got to be a more intelligent way of detecting this.
      if (result['tagName']) {
        return {'ELEMENT': Utils.addToKnownElements(result, doc)};
      }

      if (typeof result.length === 'number' &&
          !(result.propertyIsEnumerable('length'))) {
        var array = [];
        for (var i = 0; i < result.length; i++) {
          array.push(Utils.wrapResult(result[i], doc));
        }
        return array;
      }

      try {
        var nodeList = result.QueryInterface(CI.nsIDOMNodeList);
        var array = [];
        for (var i = 0; i < nodeList.length; i++) {
          array.push(Utils.wrapResult(result.item(i), doc));
        }
        return array;
      } catch (ignored) {
        Logger.dumpn(ignored);
      }

      var convertedObj = {};
      for (var prop in result) {
        convertedObj[prop] = Utils.wrapResult(result[prop], doc);
      }
      return convertedObj;

    default:
      return result;
  }
};
    
/**
 * Gets canonical xpath of the passed element, e.g. /HTML[1]/BODY[1]/P[1]
 */
Utils.getXPathOfElement = function(element) {
  var path = "";
  for (; element && element.nodeType == 1; element = element.parentNode) {
    index = Utils.getElementIndexForXPath_(element);
    path = "/" + element.tagName + "[" + index + "]" + path;
  }
  return path;	
};

/**
 * Returns n for the nth child of the parent of that element, of type element.tagName, starting at 1
 */
Utils.getElementIndexForXPath_ = function (element) {
  var index = 1;
  for (var sibling = element.previousSibling; sibling ; sibling = sibling.previousSibling) {
    if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
      index++;
    }
  }
  return index;
};

Utils.loadUrl = function(url) {
  Logger.dumpn("Loading: " + url);
  var ioService = Utils.getService("@mozilla.org/network/io-service;1", "nsIIOService");
  var channel = ioService.newChannel(url, null, null);
  var channelStream = channel.open();

  var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .createInstance(Components.interfaces.nsIScriptableInputStream);
  scriptableStream.init(channelStream);

  var converter = Utils.newInstance("@mozilla.org/intl/scriptableunicodeconverter",
                      'nsIScriptableUnicodeConverter');
  converter.charset = 'UTF-8';

  var text = '';

  // This doesn't feel right to me.
  for (var chunk = scriptableStream.read(4096); chunk; chunk = scriptableStream.read(4096)) {
    text += converter.ConvertToUnicode(chunk);
  }

  scriptableStream.close();
  channelStream.close();

  Logger.dumpn("Done reading: " + url);
  return text;
};

Utils.installWindowCloseListener = function (respond) {
  var browser = respond.session.getBrowser();

  // Override the "respond.send" function to remove the observer, otherwise
  // it'll just get awkward
  var originalSend = goog.bind(respond.send, respond);
  respond.send = function() {
    mediator.unregisterNotification(observer);
    originalSend();
  };

  // Register a listener for the window closing.
  var observer = {
    observe: function(subject, topic, opt_data) {
      if ('domwindowclosed' != topic) {
        return;
      }

      var target = browser.contentWindow;
      var source = subject.content;


      if (target == source) {
        Logger.dumpn("Window was closed.");
        respond.send();
      }
    }
  };

  var mediator = Utils.getService('@mozilla.org/embedcomp/window-watcher;1', 'nsIWindowWatcher');
  mediator.registerNotification(observer);
};

Utils.installClickListener = function(respond, WebLoadingListener) {
  var browser = respond.session.getBrowser();
  var currentWindow = respond.session.getWindow()

  var clickListener = new WebLoadingListener(browser, function(webProgress) {
    Logger.dumpn("New page loading.");
    if (webProgress.DOMWindow != currentWindow
        && webProgress.DOMWindow == browser.contentWindow) {
      Logger.dumpn("Detected page load in top window; changing session focus from " +
                   "frame to new top window.");
      respond.session.setWindow(browser.contentWindow);
    }
    respond.send();
  });

  var contentWindow = browser.contentWindow;

  var checkForLoad = function() {
    // Returning should be handled by the click listener, unless we're not
    // actually loading something. Do a check and return if we are. There's a
    // race condition here, in that the click event and load may have finished
    // before we get here. For now, let's pretend that doesn't happen. The other
    // race condition is that we make this check before the load has begun. With
    // all the javascript out there, this might actually be a bit of a problem.
    var docLoaderService = browser.webProgress;
    if (!docLoaderService.isLoadingDocument) {
      WebLoadingListener.removeListener(browser, clickListener);
      Logger.dumpn("Not loading document anymore.");
      respond.send();
    }
  };


  if (contentWindow.closed) {
    // Nulls out the session; client will have to switch to another
    // window on their own.
    Logger.dumpn("Content window closed.");
    respond.send();
    return;
  }
  contentWindow.setTimeout(checkForLoad, 50);
};

Utils.waitForNativeEventsProcessing = function(element, nativeEvents, pageUnloadedData, jsTimer) {
  var thmgr_cls = Components.classes["@mozilla.org/thread-manager;1"];
  var node = Utils.getNodeForNativeEvents(element);

  var hasEvents = {};
  var threadmgr =
      thmgr_cls.getService(Components.interfaces.nsIThreadManager);
  var thread = threadmgr.currentThread;

  do {

    // This sleep is needed so that Firefox on Linux will manage to process
    // all of the keyboard events before returning control to the caller
    // code (otherwise the caller may not find all of the keystrokes it
    // has entered).
    var doneNativeEventWait = false;

    var callback = function() {
      Logger.dumpn("Done native event wait.");
      doneNativeEventWait = true; };

    jsTimer.setTimeout(callback, 100);

    nativeEvents.hasUnhandledEvents(node, hasEvents);

    Logger.dumpn("Pending native events: " + hasEvents.value);
    var numEventsProcessed = 0;
    // Do it as long as the timeout function has not been called and the
    // page has not been unloaded. If the page has been unloaded, there is no
    // point in waiting for other native events to be processed in this page
    // as they "belong" to the next page.
    while ((!doneNativeEventWait) && (hasEvents.value) &&
           (!pageUnloadedData.wasUnloaded) && (numEventsProcessed < 350)) {
      thread.processNextEvent(true);
      numEventsProcessed += 1;
    }
    Logger.dumpn("Extra events processed: " + numEventsProcessed +
                 " Page Unloaded: " + pageUnloadedData.wasUnloaded);

  } while ((hasEvents.value == true) && (!pageUnloadedData.wasUnloaded));
  Logger.dumpn("Done main loop.");

  if (pageUnloadedData.wasUnloaded) {
      Logger.dumpn("Page has been reloaded while waiting for native events to "
          + "be processed. Remaining events? " + hasEvents.value);
  } else {
    Utils.removePageUnloadEventListener(element, pageUnloadedData);
  }

  // It is possible that, even though the native code reports all of the
  // keyboard events are out of the GDK event queue, the process is not done.
  // These keyboard events are converted into Javascript events - and not all
  // of them may have been processed. In fact, this is the common case when
  // the sleep timeout above is less than 500 msec.
  // The appropriate thing to do is process all the remaining JS events.
  // Only existing events in the queue should be processed - hence the call
  // to processNextEvent with false.

  var numExtraEventsProcessed = 0;
  var hasMoreEvents = thread.processNextEvent(false);
  // A safety net to prevent the code from endlessly staying in this loop,
  // in case there is some source of events that's constantly generating them.
  var MAX_EXTRA_EVENTS_TO_PROCESS = 200;

  while ((hasMoreEvents) &&
      (numExtraEventsProcessed < MAX_EXTRA_EVENTS_TO_PROCESS)) {
    hasMoreEvents = thread.processNextEvent(false);
    numExtraEventsProcessed += 1;
  }

  Logger.dumpn("Done extra event loop, " + numExtraEventsProcessed);
};

Utils.getPageUnloadedIndicator = function(element) {
  var toReturn = {
    // This indicates that a the page has been unloaded
    'wasUnloaded': false
  };


  // This is the standard indicator that a page has been unloaded, but
  // due to Firefox's caching policy, will occur only when Firefox works
  // *without* caching at all.
  var unloadFunction = function() { toReturn.wasUnloaded = true };
  toReturn.callback = unloadFunction;

  element.ownerDocument.body.addEventListener("unload",
      unloadFunction, false);

  // This is a Firefox specific event - See:
  // https://developer.mozilla.org/En/Using_Firefox_1.5_caching
  element.ownerDocument.defaultView.addEventListener("pagehide",
      unloadFunction, false);

  return toReturn;
};

Utils.removePageUnloadEventListener = function(element, pageUnloadData) {
  if (pageUnloadData.callback) {
    // Remove event listeners...
    element.ownerDocument.body.removeEventListener("unload",
        pageUnloadData.callback, false);
    element.ownerDocument.defaultView.removeEventListener("pagehide",
      pageUnloadData.callback, false);
  }
};

Utils.convertNSIArrayToNative = function(arrayToConvert) {
  var returnArray = [];

  if (arrayToConvert == null) {
    return returnArray;
  }
  
  returnArray.length = arrayToConvert.length;

  // Copy the contents of the array as each string is nsISupportsString,
  // not a native Javascript type.
  var enginesEnumerator = arrayToConvert.enumerate();
  var returnArrayIndex = 0;
  while (enginesEnumerator.hasMoreElements()) {
    var CI = Components.interfaces;

    var currentEngine = enginesEnumerator.getNext();
    var engineString = currentEngine.QueryInterface(CI.nsISupportsCString);
    returnArray[returnArrayIndex] = engineString.toString();
    returnArrayIndex += 1;
  }

  return returnArray;
};
