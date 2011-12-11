/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2011 Software Freedom Conservatory

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


Components.utils.import('resource://fxdriver/modules/atoms.js');

var FirefoxDriver = FirefoxDriver || function(){};


FirefoxDriver.prototype.elementEquals = function(respond, parameters) {
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

FirefoxDriver.prototype.clickElement = function(respond, parameters) {
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

      var browserOffset = this.getBrowserSpecificOffset_(respond.session.getBrowser());

      var adjustedX = x + browserOffset.x;
      var adjustedY = y + browserOffset.y;

      nativeEvents.mouseMove(node, currentPosition.x + browserOffset.x,
          currentPosition.y + browserOffset.y, adjustedX, adjustedY);

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
FirefoxDriver.prototype.clickElement.preconditions =
    [ fxdriver.preconditions.visible ];


FirefoxDriver.prototype.getElementText = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (element.tagName == "TITLE") {
    respond.value = respond.session.getBrowser().contentTitle;
  } else {
    respond.value = webdriver.atoms.element.getText(element);
  }

  respond.send();
};


FirefoxDriver.prototype.getElementValue = function(respond, parameters) {
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


FirefoxDriver.prototype.sendKeysToElement = function(respond, parameters) {
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
FirefoxDriver.prototype.sendKeysToElement.preconditions =
    [ fxdriver.preconditions.visible, fxdriver.preconditions.enabled ];


FirefoxDriver.prototype.clearElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  bot.setWindow(respond.session.getWindow());
  bot.action.clear(element);
  respond.send();
};
FirefoxDriver.prototype.clearElement.preconditions =
    [ fxdriver.preconditions.visible, fxdriver.preconditions.enabled, fxdriver.preconditions.writable ];


FirefoxDriver.prototype.getElementTagName = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  respond.value = element.tagName.toLowerCase();
  respond.send();
};


FirefoxDriver.prototype.getElementAttribute = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                  respond.session.getDocument());
  var attributeName = parameters.name;
  
  respond.value = webdriver.atoms.element.getAttribute(element, attributeName);
  respond.send();
};


FirefoxDriver.prototype.isElementEnabled = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = Utils.isEnabled(element);
  respond.send();
};


FirefoxDriver.prototype.hoverOverElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var events = Utils.getNativeEvents();
  var node = Utils.getNodeForNativeEvents(element);

  if (this.enableNativeEvents && events && node) {
    var loc = Utils.getLocationOnceScrolledIntoView(element);

    var x = loc.x + (loc.width ? loc.width / 2 : 0);
    var y = loc.y + (loc.height ? loc.height / 2 : 0);

    var currentPosition = respond.session.getMousePosition();

    events.mouseMove(node, currentPosition.x, currentPosition.y, x, y);
    respond.session.setMousePosition(x, y);
  } else {
    // TODO: use the correct error type here.
    throw new WebDriverError(bot.ErrorCode.INVALID_ELEMENT_STATE,
        "Unable to hover over element");
  }

  respond.send();
};
FirefoxDriver.prototype.hoverOverElement.preconditions =
    [ fxdriver.preconditions.visible ];


FirefoxDriver.prototype.submitElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (element) {
    while (element.parentNode != null && element.tagName.toLowerCase() != "form") {
      element = element.parentNode;
    }
    if (element.tagName && element.tagName.toLowerCase() == "form") {
      if (Utils.fireHtmlEvent(element, "submit")) {
        new WebLoadingListener(respond.session.getBrowser(), function() {
          respond.send();
        }, respond.session.getWindow());
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

FirefoxDriver.prototype.isElementSelected = function(respond, parameters) {
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


FirefoxDriver.prototype.isElementDisplayed = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = bot.dom.isShown(element);
  respond.send();
};


FirefoxDriver.prototype.getElementLocation = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var location = Utils.getElementLocation(element);

  respond.value = {
    x: Math.round(location.x),
    y: Math.round(location.y)
  };

  respond.send();
};


FirefoxDriver.prototype.getElementSize = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var box = Utils.getLocationOnceScrolledIntoView(element);

  respond.value = {
    width: Math.round(box.width),
    height: Math.round(box.height)
  };
  respond.send();
};


FirefoxDriver.prototype.dragElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  // Scroll the first element into view
  //  element.scrollIntoView(true);

  var clientStartXY = Utils.getElementLocation(element);

  var clientStartX = clientStartXY.x;
  var clientStartY = clientStartXY.y;

  var movementX = parameters.x;
  var movementY = parameters.y;

  var clientFinishX = ((clientStartX + movementX) < 0) ? 0 : (clientStartX
      + movementX);
  var clientFinishY = ((clientStartY + movementY) < 0) ? 0 : (clientStartY
      + movementY);

  // Restrict the destination into the sensible dimension
  var body = element.ownerDocument.body;

  if (clientFinishX > body.scrollWidth)
    clientFinishX = body.scrollWidth;
  if (clientFinishY > body.scrollHeight)
    clientFinishY = body.scrollHeight;

  var mouseSpeed = respond.session.getInputSpeed();
  var move = function(current, dest) {
    if (current == dest) return current;
    if (Math.abs(current - dest) < mouseSpeed) return dest;
    return (current < dest) ? current + mouseSpeed : current - mouseSpeed;
  };

  Utils.triggerMouseEvent(element, 'mousedown', clientStartX, clientStartY);
  Utils.triggerMouseEvent(element, 'mousemove', clientStartX, clientStartY);
  var clientX = clientStartX;
  var clientY = clientStartY;

  while ((clientX != clientFinishX) || (clientY != clientFinishY)) {
    clientX = move(clientX, clientFinishX);
    clientY = move(clientY, clientFinishY);

    Utils.triggerMouseEvent(element, 'mousemove', clientX, clientY);
  }

  Utils.triggerMouseEvent(element, 'mousemove', clientFinishX, clientFinishY);

  // TODO(simon.m.stewart) If we can tell which element is under the cursor,
  // send the mouseup to that
  Utils.triggerMouseEvent(element, 'mouseup', clientFinishX, clientFinishY);

  var finalLoc = Utils.getElementLocation(element);

  respond.value = finalLoc.x + "," + finalLoc.y;
  respond.send();
};
FirefoxDriver.prototype.dragElement.preconditions = 
    [ fxdriver.preconditions.visible ];


FirefoxDriver.prototype.getElementValueOfCssProperty = function(respond,
                                                                parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = bot.dom.getEffectiveStyle(element, parameters.propertyName);
  respond.send();
};


FirefoxDriver.prototype.getElementLocationOnceScrolledIntoView = function(
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


