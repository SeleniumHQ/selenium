// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('Utils');

goog.require('WebLoadingListener');
goog.require('bot.ErrorCode');
goog.require('bot.dom');
goog.require('bot.userAgent');
goog.require('fxdriver.logging');
goog.require('fxdriver.moz');
goog.require('fxdriver.utils');
goog.require('fxdriver.error');
goog.require('goog.dom');
goog.require('goog.log');
goog.require('goog.string');
goog.require('goog.style');


/**
 * @private {goog.log.Logger}
 * @const
 */
Utils.LOG_ = fxdriver.logging.getLogger('fxdriver.Utils');

Utils.newInstance = function(className, interfaceName) {
  var clazz = Components.classes[className];

  if (!clazz) {
    goog.log.warning(Utils.LOG_, 'Unable to find class: ' + className);
    return undefined;
  }
  var iface = Components.interfaces[interfaceName];

  try {
    return clazz.createInstance(iface);
  } catch (e) {
    goog.log.warning(Utils.LOG_,
        'Cannot create: ' + className + ' from ' + interfaceName,
        e);
    throw e;
  }
};


Utils.getServer = function() {
  var handle =
      Utils.newInstance('@googlecode.com/webdriver/fxdriver;1', 'nsISupports');
  return handle.wrappedJSObject;
};


Utils.getActiveElement = function(doc) {
  var window = goog.dom.getWindow(doc);

  var element;
  if (doc['activeElement']) {
    element = doc.activeElement;
  } else {
    var topWindow = window.top;
    element = topWindow.activeElement;

    if (element && doc != element.ownerDocument)
      element = null;
  }

  // Default to the body
  if (!element) {
    element = Utils.getMainDocumentElement(doc);
  }

  return element;
};


Utils.addToKnownElements = function(element) {
  var cache = {};
  Components.utils['import']('resource://fxdriver/modules/web-element-cache.js', cache);

  return cache.put(element);
};


Utils.getElementAt = function(index, currentDoc) {
  var cache = {};
  Components.utils['import']('resource://fxdriver/modules/web-element-cache.js', cache);

  return cache.get(index, currentDoc);
};


Utils.isAttachedToDom = function(element) {
  // In Firefox 4, our DOM nodes need to be wrapped in XPCNativeWrappers
  function wrapNode(node) {
    if (bot.userAgent.isProductVersion(4)) {
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


Utils.shiftCount = 0;


Utils.getNativeComponent = function(componentId, componentInterface) {
  try {
    var obj = Components.classes[componentId].createInstance();
    return obj.QueryInterface(componentInterface);
  } catch (e) {
    return undefined;
  }
};

Utils.getNativeIME = function() {
  return Utils.getNativeComponent('@openqa.org/nativeime;1', Components.interfaces.nsINativeIME);
};

Utils.getPageLoadStrategy = function() {
  var prefs =
      fxdriver.moz.getService('@mozilla.org/preferences-service;1', 'nsIPrefBranch');
  return prefs.prefHasUserValue('webdriver.load.strategy') ?
      prefs.getCharPref('webdriver.load.strategy') : 'normal';
};

Utils.initWebLoadingListener = function(respond, opt_window) {
  var browser = respond.session.getBrowser();
  var topWindow = browser.contentWindow;
  var window = opt_window || topWindow;
  respond.session.setWaitForPageLoad(true);
  // Wait for the reload to finish before sending the response.
  new WebLoadingListener(browser, function(timedOut, opt_stopWaiting) {
    // Reset to the top window.
    respond.session.setWindow(browser.contentWindow);
    if (opt_stopWaiting) {
      respond.session.setWaitForPageLoad(false);
    }
    if (timedOut) {
      respond.session.setWaitForPageLoad(false);
      respond.sendError(new WebDriverError(bot.ErrorCode.TIMEOUT,
                                           'Timed out waiting for page load.'));
    } else {
      respond.send();
    }
  }, respond.session.getPageLoadTimeout(), window);
};

Utils.type = function(session, element, text, jsTimer, releaseModifiers,
    opt_keysState) {

  var doc = session.getDocument();
  // For consistency between native and synthesized events, convert common
  // escape sequences to their Key enum aliases.
  text = text.replace(/[\b]/g, '\uE003').   // DOM_VK_BACK_SPACE
      replace(/\t/g, '\uE004').                           // DOM_VK_TAB
      replace(/(\r\n|\n|\r)/g, '\uE006');                 // DOM_VK_RETURN

  goog.log.info(Utils.LOG_, 'Doing sendKeys...');
  var controlKey = false;
  var shiftKey = false;
  var altKey = false;
  var metaKey = false;
  if (opt_keysState) {
    controlKey = opt_keysState.isControlPressed();
    shiftKey = opt_keysState.isShiftPressed();
    altKey = opt_keysState.isAltPressed();
    metaKey = opt_keysState.isMetaPressed();
  }

  Utils.shiftCount = 0;

  var upper = text.toUpperCase();

  for (var i = 0; i < text.length; i++) {
    var c = text.charAt(i);

    // NULL key: reset modifier key states, and continue

    if (c == '\uE000') {
      if (controlKey) {
        var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
        Utils.keyEvent(session, element, 'keyup', kCode, 0,
                       controlKey = false, shiftKey, altKey, metaKey);
      }

      if (shiftKey) {
        var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
        Utils.keyEvent(session, element, 'keyup', kCode, 0,
                       controlKey, shiftKey = false, altKey, metaKey);
      }

      if (altKey) {
        var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
        Utils.keyEvent(session, element, 'keyup', kCode, 0,
                       controlKey, shiftKey, altKey = false, metaKey);
      }

      if (metaKey) {
        var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_META;
        Utils.keyEvent(session, element, 'keyup', kCode, 0,
                       controlKey, shiftKey, altKey, metaKey = false);
      }

      continue;
    }

    // otherwise decode keyCode, charCode, modifiers ...

    var modifierEvent = '';
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
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_RETURN;
    } else if (c == '\uE008') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
      shiftKey = !shiftKey;
      modifierEvent = shiftKey ? 'keydown' : 'keyup';
    } else if (c == '\uE009') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
      controlKey = !controlKey;
      modifierEvent = controlKey ? 'keydown' : 'keyup';
    } else if (c == '\uE00A') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
      altKey = !altKey;
      modifierEvent = altKey ? 'keydown' : 'keyup';
    } else if (c == '\uE03D') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_META;
      metaKey = !metaKey;
      modifierEvent = metaKey ? 'keydown' : 'keyup';
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
    } else if (c == '^') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CIRCUMFLEX;
      charCode = c.charCodeAt(0);
    } else if (c == '!') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_EXCLAMATION;
      charCode = c.charCodeAt(0);
    } else if (c == '#') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_HASH;
      charCode = c.charCodeAt(0);
    } else if (c == '$') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_DOLLAR;
      charCode = c.charCodeAt(0);
    } else if (c == '%') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_PERCENT;
      charCode = c.charCodeAt(0);
    } else if (c == '&') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_AMPERSAND;
      charCode = c.charCodeAt(0);
    } else if (c == '_') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_UNDERSCORE;
      charCode = c.charCodeAt(0);
    } else if (c == '-') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_HYPHEN_MINUS;
      charCode = c.charCodeAt(0);
    } else if (c == '(') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_OPEN_BRACKET;
      charCode = c.charCodeAt(0);
    } else if (c == ')') {
      keyCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CLOSE_BRACKET;
      charCode = c.charCodeAt(0);
    } else {
      keyCode = upper.charCodeAt(i);
      charCode = text.charCodeAt(i);
    }

    // generate modifier key event if needed, and continue

    if (modifierEvent) {
      Utils.keyEvent(session, element, modifierEvent, keyCode, 0,
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
      Utils.keyEvent(session, element, 'keydown', kCode, 0,
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
      Utils.keyEvent(session, element, 'keydown', keyCode, 0,
                     controlKey, needsShift || shiftKey, altKey, metaKey);

    if (accepted) {
      Utils.keyEvent(session, element, 'keypress', pressCode, charCode,
                     controlKey, needsShift || shiftKey, altKey, metaKey);
    }

    Utils.keyEvent(session, element, 'keyup', keyCode, 0,
                   controlKey, needsShift || shiftKey, altKey, metaKey);

    // shift up if needed

    if (needsShift && !shiftKey) {
      var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
      Utils.keyEvent(session, element, 'keyup', kCode, 0,
                     controlKey, false, altKey, metaKey);
    }
  }

  // exit cleanup: keyup active modifier keys

  if (controlKey && releaseModifiers) {
    var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
    Utils.keyEvent(session, element, 'keyup', kCode, 0,
                   controlKey = false, shiftKey, altKey, metaKey);
  }

  if (shiftKey && releaseModifiers) {
    var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
    Utils.keyEvent(session, element, 'keyup', kCode, 0,
                   controlKey, shiftKey = false, altKey, metaKey);
  }

  if (altKey && releaseModifiers) {
    var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
    Utils.keyEvent(session, element, 'keyup', kCode, 0,
                   controlKey, shiftKey, altKey = false, metaKey);
  }

  if (metaKey && releaseModifiers) {
    var kCode = Components.interfaces.nsIDOMKeyEvent.DOM_VK_META;
    Utils.keyEvent(session, element, 'keyup', kCode, 0,
                   controlKey, shiftKey, altKey, metaKey = false);
  }

  if (opt_keysState) {
    opt_keysState.setControlPressed(controlKey);
    opt_keysState.setShiftPressed(shiftKey);
    opt_keysState.setAltPressed(altKey);
    opt_keysState.setMetaPressed(metaKey);
  }
};


Utils.keyEvent = function(session, element, type, keyCode, charCode,
                          controlState, shiftState, altState, metaState) {

  var doc = session.getDocument();
  // Silently bail out if the element is no longer attached to the DOM.
  var isAttachedToDom = goog.dom.getAncestor(element, function(node) {
    return node === element.ownerDocument.documentElement;
  }, true);

  if (!isAttachedToDom) {
    return false;
  }

  var windowUtils = session.getChromeWindow()
      .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIDOMWindowUtils);

  var modifiers = 0;
  if (controlState) {
    modifiers += windowUtils.MODIFIER_CONTROL;
  }
  if (altState) {
    modifiers += windowUtils.MODIFIER_ALT;
  }
  if (shiftState) {
    modifiers += windowUtils.MODIFIER_SHIFT;
  }
  if (metaState) {
    modifiers += windowUtils.MODIFIER_META;
  }

  return windowUtils.sendKeyEvent(type, keyCode, charCode, modifiers, 0);
};


Utils.fireHtmlEvent = function(element, eventName) {
  var doc = element.ownerDocument;
  var e = doc.createEvent('HTMLEvents');
  e.initEvent(eventName, true, true);
  return element.dispatchEvent(e);
};


Utils.getLocation = function(element, opt_onlyFirstRect) {
  element = element.wrappedJSObject ? element.wrappedJSObject : element;
  var rect = undefined;
  if (opt_onlyFirstRect && element.getClientRects().length > 1) {
    for (var i = 0; i < element.getClientRects().length; i++) {
      var candidate = element.getClientRects()[i];
      if (candidate.width != 0 && candidate.height != 0) {
        rect = candidate;
        break;
      }
    }
  }
  if (!rect) {
    rect = bot.dom.getClientRect(element);
  }
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  };
};


/**
 * Gets location of element in window-handle space.
 */
Utils.getLocationRelativeToWindowHandle = function(element, opt_onlyFirstRect) {
  var location = Utils.getLocation(element, opt_onlyFirstRect);

  // In Firefox 3.6 and above, there's a shared window handle.
  // We need to calculate an offset to add to the x and y locations.

  if (bot.userAgent.isProductVersion(3.6)) {
    // Get the ultimate parent frame
    var currentParent = element.ownerDocument.defaultView;
    var ultimateParent = currentParent.top;

    var offX = currentParent.mozInnerScreenX - ultimateParent.mozInnerScreenX;
    var offY = element.ownerDocument.defaultView.mozInnerScreenY - ultimateParent.mozInnerScreenY;

    location.x += offX;
    location.y += offY;
  }

  return location;
};


Utils.getBrowserSpecificOffset = function(inBrowser) {
  // In Firefox 4, there's a shared window handle. We need to calculate an offset
  // to add to the x and y locations.
  var browserSpecificXOffset = 0;
  var browserSpecificYOffset = 0;

  if (bot.userAgent.isProductVersion(4)) {
    var rect = inBrowser.getBoundingClientRect();
    browserSpecificYOffset += rect.top;
    browserSpecificXOffset += rect.left;
    goog.log.info(Utils.LOG_,
        'Browser-specific offset (X,Y): ' + browserSpecificXOffset
        + ', ' + browserSpecificYOffset);
  }

  return {x: browserSpecificXOffset, y: browserSpecificYOffset};
};


Utils.scrollIntoView = function(element, opt_elementScrollBehavior, opt_coords) {
  if (!Utils.isInView(element, opt_coords)) {
    element.scrollIntoView(opt_elementScrollBehavior);
  }
  var overflow = bot.dom.getOverflowState(element, opt_coords);
  if (overflow != bot.dom.OverflowState.NONE) {
    if (element.scrollIntoView) {
      element.scrollIntoView(opt_elementScrollBehavior);
    }
  }
  return bot.action.scrollIntoView(element, opt_coords);
};


Utils.isInView = function(element, opt_coords) {
  var location = Utils.getLocation(element, element.tagName == 'A');
  var coords = opt_coords || new goog.math.Coordinate(0, 0);
  location.x = location.x + coords.x;
  location.y = location.y + coords.y;

  var win = goog.dom.getWindow(goog.dom.getOwnerDocument(element));
  for (var frame = win.frameElement; frame; frame = win.frameElement) {
    var frameLocation = Utils.getLocation(frame);
    if (location.x < frameLocation.x || location.x > frameLocation.x + frameLocation.width
        || location.y < frameLocation.y || location.y > frameLocation.y + frameLocation.height)
    {
      return false;
    }
    win = goog.dom.getWindow(goog.dom.getOwnerDocument(frame));
  }

  var viewportSize = goog.dom.getViewportSize(win);
  if (location.x < 0 || location.x > viewportSize.width
      || location.y < 0 || location.y > viewportSize.height)
  {
    return false;
  }

  return true;
};


Utils.getLocationOnceScrolledIntoView = function(element, opt_elementScrollBehavior, opt_onlyFirstRect) {
  Utils.scrollIntoView(element, opt_elementScrollBehavior);
  return Utils.getLocationRelativeToWindowHandle(element, opt_onlyFirstRect);
};


Utils.getClickablePoint = function(element) {
  element = element.wrappedJSObject ? element.wrappedJSObject : element;
  var rect = bot.dom.getClientRect(element);

  var rects = goog.array.filter(element.getClientRects(), function(r) {
    return r.width != 0 && r.height != 0;
  });

  var isClickableAt = function(coord) {
    // get the outermost ancestor of the element. This will be either the document
    // or a shadow root.
    var owner = element;
    while (owner.parentNode) {
      owner = owner.parentNode;
    }

    var elementAtPoint = owner.elementFromPoint(coord.x, coord.y);

    // element may be huge, so coordinates are outside the viewport
    if (elementAtPoint === null) {
      return true;
    }

    if (element == elementAtPoint) {
      return true;
    }

    // allow clicks to element descendants
    var parentElemIter = elementAtPoint.parentNode;
    while (parentElemIter) {
      if (parentElemIter == element) {
        return true;
      }
      parentElemIter = parentElemIter.parentNode;
    }

    // elementFromPoint does not appear to be reliable. This will catch
    // other cases where the parent element is found instead.
    // ex.  <button><span/><button>, click on span, but elementFromPoint
    //      returned the button element.
    parentElemIter = element.parentNode;
    while (parentElemIter) {
      if (parentElemIter == elementAtPoint) {
        return true;
      }
      parentElemIter = parentElemIter.parentNode;
    }
  };

  var rectPointRelativeToView = function(x, y, r) {
    return { x: r.left + x, y: r.top + y }
  };

  var rectPointRelativeToMainRect = function(x, y, r) {
    return { x: r.left - rect.left + x, y: r.top - rect.top + y }
  };

  var findClickablePoint = function(r) {
    // center, center of edges, corners
    var offsets = [
      { x: Math.floor(r.width / 2), y: Math.floor(r.height / 2) }, // center
      { x: Math.floor(r.width / 2), y: 0}, // top edge center
      { x: 0, y: Math.floor(r.height / 2)}, // left edge center
      { x: r.width - 2, y: Math.floor(r.height / 2)}, // right edge center
      { x: Math.floor(r.width / 2), y: r.height - 2}, // bottom edge center
      { x: 0, y: 0 }, // top left corner
      { x: r.width - 1, y: 0 }, // top right corner
      { x: 0,  y: r.height - 1 }, // bottom left corner
      { x: r.width - 1, y: r.height - 1} // bottom right corner
    ]

    return goog.array.find(offsets, function(offset){
      return isClickableAt(rectPointRelativeToView(offset.x, offset.y, r));
    })
  };

  if (rects.length > 1) {
    goog.log.warning(Utils.LOG_, 'Multirect element ', rects.length);
    for (var i = 0; i < rects.length; i++) {
      var p = findClickablePoint(rects[i]);
      if (p){
        goog.log.warning(Utils.LOG_, 'Found clickable point in rect ' + rects[i]);
        return rectPointRelativeToMainRect(p.x, p.y, rects[i]);
      }
    }
  }

  // Fallback to the main rect
  var p = findClickablePoint(rect);
  if (p) {
    return p;
  }

  // Expected to return a point so if there is no clickable point return middle
  return { x: Math.floor(rect.width / 2), y: Math.floor(rect.height / 2) };
};


Utils.unwrapParameters = function(wrappedParameters, doc) {
  switch (typeof wrappedParameters) {
    case 'number':
    case 'string':
    case 'boolean':
      return wrappedParameters;

    case 'object':
      if (wrappedParameters == null) {
        return null;

      } else if (typeof wrappedParameters.length === 'number' &&
          !(wrappedParameters.propertyIsEnumerable('length'))) {

        var converted = [];
        while (wrappedParameters && wrappedParameters.length > 0) {
          var t = wrappedParameters.shift();
          converted.push(Utils.unwrapParameters(t, doc));
        }

        return converted;

      } else if (typeof wrappedParameters['ELEMENT'] === 'string') {
        var element = Utils.getElementAt(wrappedParameters['ELEMENT'], doc);
        element = element.wrappedJSObject ? element.wrappedJSObject : element;
        return element;

      } else {
        var convertedObj = {};
        for (var prop in wrappedParameters) {
          convertedObj[prop] = Utils.unwrapParameters(wrappedParameters[prop], doc);
        }
        return convertedObj;
      }
      break;
  }
};


Utils.wrapResult = function(result, doc) {
  result = fxdriver.moz.unwrap(result);

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
      if (result.nodeType == 1 && result['tagName']) {
        return {'ELEMENT': Utils.addToKnownElements(result)};
      }

      if (typeof result.getMonth === 'function') {
        return result.toJSON();
      }

      if (typeof result.length === 'number' &&
          !(result.propertyIsEnumerable('length'))) {
        var array = [];
        for (var i = 0; i < result.length; i++) {
          array.push(Utils.wrapResult(result[i], doc));
        }
        return array;
      }

      // Document. Grab the document element.
      if (result.nodeType == 9) {
        return Utils.wrapResult(result.documentElement);
      }

      try {
        var nodeList = result.QueryInterface(CI.nsIDOMNodeList);
        var array = [];
        for (var i = 0; i < nodeList.length; i++) {
          array.push(Utils.wrapResult(result.item(i), doc));
        }
        return array;
      } catch (ignored) {
        goog.log.warning(Utils.LOG_, 'Error wrapping NodeList', ignored);
      }

      try {
        // There's got to be a better way, but 'result instanceof Error' returns false
        if (Object.getPrototypeOf(result) != null && goog.string.endsWith(Object.getPrototypeOf(result).toString(), 'Error')) {
          try {
            return fxdriver.error.toJSON(result);
          } catch (ignored2) {
            goog.log.info(Utils.LOG_, 'Error', ignored2);
            return result.toString();
          }
        }
      } catch (ignored) {
        goog.log.info(Utils.LOG_, 'Error', ignored);
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


Utils.loadUrl = function(url) {
  goog.log.info(Utils.LOG_, 'Loading: ' + url);
  var ioService = fxdriver.moz.getService('@mozilla.org/network/io-service;1', 'nsIIOService');
  var channel = ioService.newChannel(url, null, null);
  var channelStream = channel.open();

  var scriptableStream = Components.classes['@mozilla.org/scriptableinputstream;1']
                                 .createInstance(Components.interfaces.nsIScriptableInputStream);
  scriptableStream.init(channelStream);

  var converter = Utils.newInstance('@mozilla.org/intl/scriptableunicodeconverter',
                      'nsIScriptableUnicodeConverter');
  converter.charset = 'UTF-8';

  var text = '';

  // This doesn't feel right to me.
  for (var chunk = scriptableStream.read(4096); chunk; chunk = scriptableStream.read(4096)) {
    text += converter.ConvertToUnicode(chunk);
  }

  scriptableStream.close();
  channelStream.close();

  goog.log.info(Utils.LOG_, 'Done reading: ' + url);
  return text;
};

Utils.installWindowCloseListener = function(respond) {
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
        goog.log.info(Utils.LOG_, 'Window was closed.');
        respond.send();
      }
    }
  };

  var mediator = fxdriver.moz.getService('@mozilla.org/embedcomp/window-watcher;1', 'nsIWindowWatcher');
  mediator.registerNotification(observer);
};

Utils.installClickListener = function(respond, WebLoadingListener) {
  var browser = respond.session.getBrowser();
  var currentWindow = respond.session.getWindow();

  var clickListener = new WebLoadingListener(browser, function(timedOut) {
    goog.log.info(Utils.LOG_, 'New page loading.');

    var currentWindowGone;

    try {
      // currentWindow.closed is only reliable for top-level windows,
      // not frames/iframes
      // (see http://msdn.microsoft.com/en-us/library/ms533574(VS.85).aspx),
      // because from most javascript contexts, the only way to access window
      // objects is for a popup, for from a currently open window.
      // wdsession.getWindow has some fallback logic in case this doesn't work.
      //
      currentWindowGone = currentWindow.closed;
    } catch(e) {
      // dead object
      currentWindowGone = true;
    }

    if (currentWindowGone) {
      goog.log.info(Utils.LOG_,
          'Detected page load in top window; changing session focus from ' +
          'frame to new top window.');
     respond.session.setWindow(browser.contentWindow);
    }
    if (timedOut) {
      respond.sendError(new WebDriverError(bot.ErrorCode.TIMEOUT,
          'Timed out waiting for page load.'));
    }
    respond.send();
  }, respond.session.getPageLoadTimeout(), currentWindow);

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
      goog.log.info(Utils.LOG_, 'Not loading document anymore.');
      respond.send();
    }
  };


  if (contentWindow.closed) {
    // Nulls out the session; client will have to switch to another
    // window on their own.
    goog.log.info(Utils.LOG_, 'Content window closed.');
    respond.send();
    return;
  }
  contentWindow.setTimeout(checkForLoad, 50);
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

  var mainDocumentElement = Utils.getMainDocumentElement(element.ownerDocument);
  mainDocumentElement.addEventListener('unload', unloadFunction, false);

  // This is a Firefox specific event - See:
  // https://developer.mozilla.org/En/Using_Firefox_1.5_caching
  element.ownerDocument.defaultView.addEventListener('pagehide',
      unloadFunction, false);

  return toReturn;
};

Utils.removePageUnloadEventListener = function(element, pageUnloadData) {
  if (pageUnloadData.callback) {
    // Remove event listeners...
    if (element.ownerDocument) {
      var mainDocumentElement = Utils.getMainDocumentElement(element.ownerDocument);
      if (mainDocumentElement) {
        mainDocumentElement.removeEventListener('unload',
            pageUnloadData.callback, false);
      }
      if (element.ownerDocument.defaultView) {
        element.ownerDocument.defaultView.removeEventListener('pagehide',
            pageUnloadData.callback, false);
      }
    }
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

Utils.isSVG = function(doc) {
  return doc.documentElement && doc.documentElement.nodeName == 'svg';
};

Utils.getMainDocumentElement = function(doc) {
  try {
    if (Utils.isSVG(doc))
      return doc.documentElement;
    return doc.body;
  } catch (ex) {
    if (ex instanceof TypeError) {
      return null;
    } else {
      throw ex;
    }
  }
};
