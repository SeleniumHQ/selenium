/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2011 Software Freedom Conservancy

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


goog.provide('WebElement');

goog.require('Utils');
goog.require('WebLoadingListener');
goog.require('bot.ErrorCode');
goog.require('bot.action');
goog.require('bot.dom');
goog.require('fxdriver.Logger');
goog.require('fxdriver.moz');
goog.require('fxdriver.preconditions');
goog.require('goog.dom');
goog.require('goog.dom.selection');
goog.require('webdriver.atoms.element');


WebElement.elementEquals = function(respond, parameters) {
  try {
    var elementA = Utils.getElementAt(parameters.id,
                                      respond.session.getDocument());
    var elementB = Utils.getElementAt(parameters.other,
                                      respond.session.getDocument());
    respond.value = elementA == elementB;
  } catch (e) {
    if (e.code && e.code == bot.ErrorCode.STALE_ELEMENT_REFERENCE) {
      // Assume any style elements are not equal to any others.
      // Users shouldn't care about equality of stale elements.
      respond.value = false;
    } else {
      throw e;
    }
  }
  respond.send();
};

WebElement.clickElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var unwrapped = fxdriver.moz.unwrapFor4(element);
  var nativeEvents = Utils.getNativeEvents();
  var node = Utils.getNodeForNativeEvents(unwrapped);
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].
      getService(Components.interfaces.nsIXULAppInfo);
  var versionChecker = Components.
      classes["@mozilla.org/xpcom/version-comparator;1"].
      getService(Components.interfaces.nsIVersionComparator);

  // I'm having trouble getting clicks to work on Firefox 2 on Windows. Always
  // fall back for that
  var useNativeClick =
      versionChecker.compare(appInfo.platformVersion, "1.9") >= 0;
  var thmgr_cls = Components.classes["@mozilla.org/thread-manager;1"];

  // For now, we need to bypass native events for option elements
  var isOption = "option" == unwrapped.tagName.toLowerCase();

  var loc = Utils.getLocation(unwrapped, unwrapped.tagName == "A");
  var elementHalfWidth = (loc.width ? loc.width / 2 : 0);
  var elementHalfHeight = (loc.height ? loc.height / 2 : 0);

  if (!isOption && this.enableNativeEvents && nativeEvents && node && useNativeClick && thmgr_cls) {
    fxdriver.Logger.dumpn("Using native events for click");

    var inViewAfterScroll = bot.action.scrollIntoView(
        unwrapped,
        new goog.math.Coordinate(elementHalfWidth, elementHalfHeight));

    if (!inViewAfterScroll) {
        respond.sendError(
            new WebDriverError(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
                'Element cannot be scrolled into view:' + element));
        return;
    }

    loc = Utils.getLocation(unwrapped, unwrapped.tagName == "A");
    var x = loc.x + elementHalfWidth;
    var y = loc.y + elementHalfHeight;

    // In Firefox 3.6 and above, there's a shared window handle. We need to calculate an offset
    // to add to the x and y locations.

    var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
        getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes['@mozilla.org/xpcom/version-comparator;1'].
        getService(Components.interfaces.nsIVersionComparator);
    if (versionChecker.compare(appInfo.version, '3.6') >= 0) {
      // Get the ultimate parent frame
      var current = unwrapped.ownerDocument.defaultView;
      var ultimateParent = unwrapped.ownerDocument.defaultView.parent;
      while (ultimateParent != current) {
        current = ultimateParent;
        ultimateParent = current.parent;
      }

      var offX = unwrapped.ownerDocument.defaultView.mozInnerScreenX - ultimateParent.mozInnerScreenX;
      var offY = unwrapped.ownerDocument.defaultView.mozInnerScreenY - ultimateParent.mozInnerScreenY;

      x += offX;
      y += offY;
    }

    try {
      var currentPosition = respond.session.getMousePosition();
      Utils.translateByBrowserSpecificOffset(respond.session.getBrowser(), currentPosition);

      var destinationCoordinates = new goog.math.Coordinate(x, y);
      Utils.translateByBrowserSpecificOffset(respond.session.getBrowser(), destinationCoordinates);

      var adjustedX = destinationCoordinates.x;
      var adjustedY = destinationCoordinates.y;

      nativeEvents.mouseMove(node,
                             currentPosition.x,
                             currentPosition.y,
                             adjustedX,
                             adjustedY);

      var pageUnloadedIndicator = Utils.getPageUnloadedIndicator(unwrapped);

      nativeEvents.click(node, adjustedX, adjustedY, 1);

      respond.session.setMousePosition(x, y);

      Utils.waitForNativeEventsProcessing(unwrapped, nativeEvents,
          pageUnloadedIndicator, this.jsTimer);

      respond.send();

      return;
    } catch (e) {
      // Make sure that we only fall through only if
      // the error returned from the native call indicates it's not
      // implemented.

      fxdriver.Logger.dumpn("Detected error when clicking: " + e.name);

      if (e.name != "NS_ERROR_NOT_IMPLEMENTED") {
        throw new WebDriverError(bot.ErrorCode.INVALID_ELEMENT_STATE, e);
      }

      // Fall through to the synthesized click code.
    }
  }

  fxdriver.Logger.dumpn("Falling back to synthesized click");

  // TODO(simon): Delete the above and sink most of it into a "nativeMouse"
  Utils.installWindowCloseListener(respond);
  Utils.installClickListener(respond, WebLoadingListener);

  var res = this.mouse.move(element, elementHalfWidth, elementHalfHeight);
  if (res.status != bot.ErrorCode.SUCCESS) {
    respond.status = res.status;
    respond.value = res.message;
    respond.send();
    return;
  }

  res = this.mouse.click(element);
  respond.status = res.status;
  respond.value = res.message;
};
WebElement.clickElement.preconditions =
    [ fxdriver.preconditions.visible ];


WebElement.getElementText = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (element.tagName == "TITLE") {
    respond.value = respond.session.getBrowser().contentTitle;
  } else {
    respond.value = webdriver.atoms.element.getText(element);
  }

  respond.send();
};


WebElement.getElementValue = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (element["value"] !== undefined) {
    respond.value = element.value;
    respond.send();
    return;
  }

  if (element.hasAttribute("value")) {
    respond.value = element.getAttribute("value");
    respond.send();
    return;
  }

  throw new WebDriverError(bot.ErrorCode.INVALID_ELEMENT_STATE,
      'Element does not have a value attribute');
};


WebElement.sendKeysToElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var browser = respond.session.getBrowser();
  var dispatcher = browser.ownerDocument.commandDispatcher;
  var currentDocument =
      dispatcher.focusedElement && goog.dom.getOwnerDocument(dispatcher.focusedElement);
  currentDocument = currentDocument ? new XPCNativeWrapper(currentDocument) : null;

  var alreadyFocused = true;
  var currentlyActive = Utils.getActiveElement(respond.session.getDocument());
  var newDocument = goog.dom.getOwnerDocument(currentlyActive);

  if (currentlyActive != element || currentDocument != new XPCNativeWrapper(newDocument)) {
    fxdriver.Logger.dumpn("Need to switch focus");
    alreadyFocused = false;
    currentlyActive.blur();
    element.focus();
    element.ownerDocument.defaultView.focus();
  } else {
    fxdriver.Logger.dumpn("No need to switch focus");
  }

  var use = element;
  var tagName = element.tagName.toLowerCase();
  if (tagName == "body" && element.ownerDocument.defaultView.frameElement) {
    element.ownerDocument.defaultView.focus();

    // Turns out, this is what we should be using as the target
    // to send events to
    use = element.ownerDocument.getElementsByTagName("html")[0];
  }

  // Handle the special case of the file input element here

  if (element.tagName == "INPUT") {
    var inputtype = element.getAttribute("type");
    if (inputtype && inputtype.toLowerCase() == "file") {
      element.value = parameters.value.join('');
      Utils.fireHtmlEvent(element, "change");
      respond.send();
      return;
    }
  }

  var originalDriver = this;

  // We may need a beat for firefox to hand over focus.
  this.jsTimer.setTimeout(function() {
    // Unless the element already had focus, set the cursor location to the end of the line
    // TODO(simon): This seems a little arbitrary.
    if(!alreadyFocused && bot.dom.isEditable(element)) {
        var length = element.value ? element.value.length : goog.dom.getTextContent(element).length;
        goog.dom.selection.setCursorPosition(element, length);
    }

    Utils.type(respond.session.getDocument(), use, parameters.value.join(''),
        originalDriver.enableNativeEvents, originalDriver.jsTimer, true /*release modifiers*/);

    respond.send();
  }, 0);
};
WebElement.sendKeysToElement.preconditions =
    [ fxdriver.preconditions.visible, fxdriver.preconditions.enabled ];


WebElement.clearElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  bot.setWindow(respond.session.getWindow());
  bot.action.clear(element);
  respond.send();
};
WebElement.clearElement.preconditions =
    [ fxdriver.preconditions.visible, fxdriver.preconditions.enabled, fxdriver.preconditions.writable ];


WebElement.getElementTagName = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  respond.value = element.tagName.toLowerCase();
  respond.send();
};


WebElement.getElementAttribute = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                  respond.session.getDocument());
  var attributeName = parameters.name;
  
  respond.value = webdriver.atoms.element.getAttribute(element, attributeName);
  respond.send();
};


WebElement.isElementEnabled = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = Utils.isEnabled(element);
  respond.send();
};


WebElement.submitElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (element) {
    while (element.parentNode != null && element.tagName.toLowerCase() != "form") {
      element = element.parentNode;
    }
    if (element.tagName && element.tagName.toLowerCase() == "form") {
      if (Utils.fireHtmlEvent(element, "submit")) {
        new WebLoadingListener(respond.session.getBrowser(), function(timedOut) {
          if (timedOut) {
            respond.sendError(new WebDriverError(bot.ErrorCode.TIMEOUT,
                'Timed out waiting for page load.'));
          } else {
          respond.send();
          }
        }, respond.session.getPageLoadTimeout(), respond.session.getWindow());
        element.submit();
        return;
      } else {
        //Event was blocked, so don't submit
        respond.send();
        return;
      }
    } else {
      throw new WebDriverError(bot.ErrorCode.INVALID_ELEMENT_STATE,
          "Element was not in a form so couldn't submit");
    }
  } else {
    respond.send();
    return;
  }
};

WebElement.isElementSelected = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var selected = false;

  try {
    var option =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement);
    selected = option.selected;
  } catch(e) {
  }

  try {
    var inputElement =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
    if (inputElement.type == "checkbox" || inputElement.type == "radio") {
      selected = inputElement.checked;
    }
  } catch(e) {
  }

  respond.value = selected;
  respond.send();
};


WebElement.isElementDisplayed = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = bot.dom.isShown(element);
  respond.send();
};


WebElement.getElementLocation = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var location = Utils.getElementLocation(element);

  respond.value = {
    x: Math.round(location.x),
    y: Math.round(location.y)
  };

  respond.send();
};


WebElement.getElementSize = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var box = Utils.getLocationOnceScrolledIntoView(element);

  respond.value = {
    width: Math.round(box.width),
    height: Math.round(box.height)
  };
  respond.send();
};


WebElement.getElementValueOfCssProperty = function(respond,
                                                                parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = bot.dom.getEffectiveStyle(element, parameters.propertyName);
  respond.send();
};


WebElement.getElementLocationOnceScrolledIntoView = function(
    respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (!bot.dom.isShown(element,/*ignoreOpacity=*/true)) {
    respond.value = undefined;
    respond.send();
    return;
  }

  var theDoc = element.ownerDocument;
  theDoc.body.focus();
  var elementLocation = Utils.getLocationOnceScrolledIntoView(element);

  respond.value = {
    x : Math.round(elementLocation.x),
    y : Math.round(elementLocation.y)
  };

  respond.send();
};


