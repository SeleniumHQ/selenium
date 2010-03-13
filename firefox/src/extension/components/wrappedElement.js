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


FirefoxDriver.prototype.elementEquals = function(respond, parameters) {
  var elementA = Utils.getElementAt(parameters.id,
                                    respond.session.getDocument());
  var elementB = Utils.getElementAt(parameters.other,
                                    respond.session.getDocument());
  respond.value = elementA == elementB;
  respond.send();
};


FirefoxDriver.prototype.clickElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    throw new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE,
        "Element is not currently visible and so may not be clicked");
  }

  var nativeEvents = Utils.getNativeEvents();
  var node = Utils.getNodeForNativeEvents(element);
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].
      getService(Components.interfaces.nsIXULAppInfo);
  var versionChecker = Components.
      classes["@mozilla.org/xpcom/version-comparator;1"].
      getService(Components.interfaces.nsIVersionComparator);

  // I'm having trouble getting clicks to work on Firefox 2 on Windows. Always
  // fall back for that
  var useNativeClick =
      versionChecker.compare(appInfo.platformVersion, "1.9") >= 0;

  if (this.enableNativeEvents && nativeEvents && node && useNativeClick) {
    Utils.dumpn("Using native events for click");
    var loc = Utils.getLocationOnceScrolledIntoView(element);
    var x = loc.x + (loc.width ? loc.width / 2 : 0);
    var y = loc.y + (loc.height ? loc.height / 2 : 0);

    // In Firefox 3.6 and above, there's a shared window handle. We need to calculate an offset
    // to add to the x and y locations.

    var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
        getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes['@mozilla.org/xpcom/version-comparator;1'].
        getService(Components.interfaces.nsIVersionComparator);
    if (versionChecker.compare(appInfo.version, '3.6') >= 0) {
      // Get the ultimate parent frame
      var current = element.ownerDocument.defaultView;
      var ultimateParent = element.ownerDocument.defaultView.parent;
      while (ultimateParent != current) {
        current = ultimateParent;
        ultimateParent = current.parent;
      }
      var offX = element.ownerDocument.defaultView.mozInnerScreenX - ultimateParent.mozInnerScreenX;
      var offY = element.ownerDocument.defaultView.mozInnerScreenY - ultimateParent.mozInnerScreenY;

      x += offX;
      y += offY;
    }

    try {
      nativeEvents.mouseMove(node, this.currentX, this.currentY, x, y);
      nativeEvents.click(node, x, y);
      this.currentX = x;
      this.currentY = y;
      respond.send();
      return;
    } catch (e) {
      // Make sure that we only fall through only if
      // the error returned from the native call indicates it's not
      // implemented.

      Utils.dumpn("Detected error when clicking: " + e.name);

      if (e.name != "NS_ERROR_NOT_IMPLEMENTED") {
        throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE, e);
      }

      // Fall through to the synthesized click code.
    }
  }

  Utils.dumpn("Falling back to synthesized click");
  var doc = respond.session.getDocument()
  var currentlyActive = Utils.getActiveElement(doc);

  Utils.fireMouseEventOn(element, "mouseover");
  Utils.fireMouseEventOn(element, "mousemove");
  Utils.fireMouseEventOn(element, "mousedown");
  if (element != currentlyActive) {
    // Some elements may not have blur, focus functions - for example,
    // elements under an SVG element. Call those only if they exist.
    if (typeof currentlyActive.blur == 'function') {
      currentlyActive.blur();
    }
    if (typeof element.focus == 'function') {
      element.focus();
    }
  }

  Utils.fireMouseEventOn(element, "mouseup");
  Utils.fireMouseEventOn(element, "click");

  var browser = respond.session.getBrowser();
  var alreadyReplied = false;

  var clickListener = new WebLoadingListener(browser, function(event) {
    if (!alreadyReplied) {
      alreadyReplied = true;
      respond.send();
    }
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
      if (!alreadyReplied) {
        alreadyReplied = true;
        respond.send();
      }
    }
  };


  if (contentWindow.closed) {
    // Nulls out the session; client will have to switch to another
    // window on their own.
    respond.send();
    return;
  }
  contentWindow.setTimeout(checkForLoad, 50);
};


FirefoxDriver.prototype.getElementText = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (element.tagName == "TITLE") {
    respond.value = respond.session.getBrowser().contentTitle;
  } else {
    respond.value = Utils.getText(element, true);
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

  throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
      'Element does not have a value attribute');
};


FirefoxDriver.prototype.sendKeysToElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    throw new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE,
        "Element is not currently visible and so may not be used for typing");
  }

  var currentlyActive = Utils.getActiveElement(respond.session.getDocument());
  if (currentlyActive != element) {
    currentlyActive.blur();
    element.focus();
    element.ownerDocument.defaultView.focus();
  }

  var use = element;
  var tagName = element.tagName.toLowerCase();
  if (tagName == "body" && element.ownerDocument.defaultView.frameElement) {
    element.ownerDocument.defaultView.focus();

    // Turns out, this is what we should be using as the target
    // to send events to
    use = element.ownerDocument.getElementsByTagName("html")[0];
  }

  Utils.type(respond.session.getDocument(), use, parameters.value.join(''), this.enableNativeEvents);

  respond.send();
};


FirefoxDriver.prototype.clearElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    throw new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE,
        "Element is not currently visible and so may not be cleared");
  }

  var isTextField = element["value"] !== undefined;

  var currentlyActive = Utils.getActiveElement(respond.session.getDocument());
  if (currentlyActive != element) {
    currentlyActive.blur();
    element.focus();
  }

  var currentValue = undefined;
  if (element["value"] !== undefined) {
    currentValue = element.value;
  } else if (element.hasAttribute("value")) {
    currentValue = element.getAttribute("value");
  }

  if (isTextField) {
    element.value = "";
  } else {
    element.setAttribute("value", "");
  }

  if (currentValue !== undefined && currentValue != "") {
    Utils.fireHtmlEvent(element, "change");
  }

  respond.send();
};


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

  if (element.hasAttribute(attributeName)) {
    respond.value = element.getAttribute(attributeName);
    // Is this block necessary?
    if (attributeName.toLowerCase() == "disabled") {
      respond.value = element.disabled;
    } else if (attributeName.toLowerCase() == "selected") {
      respond.value = element.selected;
    } else if (attributeName.toLowerCase() == "checked") {
      respond.value = element.checked;
    } else if (attributeName.toLowerCase() == "readonly") {
      respond.value = element.readOnly;
    }

    respond.send();
    return;
  }

  attributeName = attributeName.toLowerCase();

  if (attributeName == "disabled") {
    respond.value = (element.disabled === undefined ? false : element.disabled);
    respond.send();
    return;
  } else if ((attributeName == "checked" || attributeName == "selected") &&
             element.tagName.toLowerCase() == "input") {
    respond.value = element.checked;
    respond.send();
    return;
  } else if (attributeName == "selected" && element.tagName.toLowerCase()
      == "option") {
    respond.value = element.selected;
    respond.send();
    return;
  } else if (attributeName == "index" && element.tagName.toLowerCase()
      == "option") {
    respond.value = element.index;
    respond.send();
    return;
  }
  respond.value = null;
  respond.send();
};


FirefoxDriver.prototype.isElementEnabled = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = !!!element.disabled;
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

    events.mouseMove(node, this.currentX, this.currentY, x, y);
    this.currentX = x;
    this.currentY = y;
  } else {
    // TODO: use the correct error type here.
    throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
        "Unable to hover over element");
  }

  respond.send();
};

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
        });
        element.submit();
        return;
      } else {
        //Event was blocked, so don't submit
        respond.send();
        return;
      }
    } else {
      throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
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


FirefoxDriver.prototype.setElementSelected = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    throw new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE,
        "Element is not currently visible and so may not be selected");
  }

  function safeQueryInterface(element, queryFor) {
    try {
      return element.QueryInterface(queryFor);
    } catch (ignored) {
      return null;
    }
  }

  var option = safeQueryInterface(
      element, Components.interfaces.nsIDOMHTMLOptionElement);
  if (option) {
    var select = element;
    while (select.parentNode && select.tagName.toLowerCase() != 'select') {
      select = select.parentNode;
    }
    select = safeQueryInterface(
        select, Components.interfaces.nsIDOMHTMLSelectElement);
    if (!select) {
      //If we're not within a select element, fire the event from the option, and hope that it bubbles up
      Utils.dumpn("Falling back to event firing from option, not select element");
      select = option;
    }

    if (!option.selected) {
      option.selected = true;
      Utils.fireHtmlEvent(select, 'change');
    }

    respond.status = ErrorCode.SUCCESS;
    respond.value = '';
    respond.send();
    return;
  }

  var inputElement = safeQueryInterface(
      element, Components.interfaces.nsIDOMHTMLInputElement);
  if (inputElement) {
    if (inputElement.disabled) {
      throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
          "You may not select a disabled element");
    }

    if (inputElement.type == 'checkbox' || inputElement.type == 'radio') {
      if (!inputElement.checked) {
        inputElement.checked = true;
        Utils.fireHtmlEvent(inputElement, 'change');
      }

      respond.status = ErrorCode.SUCCESS;
      respond.value = '';
      respond.send();
      return;
    }
  }

  throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
      'You may not select an unselectable element');
};


FirefoxDriver.prototype.toggleElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (!Utils.isDisplayed(element) && !Utils.isInHead(element)) {
    throw new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE,
        "Element is not currently visible and so may not be toggled");
  }

  try {
    var checkbox =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
    if (checkbox.type == "checkbox") {
      checkbox.checked = !checkbox.checked;
      Utils.fireHtmlEvent(checkbox, "change");
      respond.value = checkbox.checked;
      respond.send();
      return;
    }
  } catch(e) {
  }

  try {
    var option =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement);

    // Find our containing select and see if it allows multiple selections
    var select = option.parentNode;
    while (select && select.tagName != "SELECT") {
      select = select.parentNode;
    }

    if (select && select.multiple) {
      option.selected = !option.selected;
      Utils.fireHtmlEvent(option, "change");
      respond.value = option.selected;
      respond.send();
      return;
    }
  } catch(e) {
  }

    throw new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
      "You may only toggle an element that is either a checkbox or an "  +
      "option in a select that allows multiple selections");
};


FirefoxDriver.prototype.isElementDisplayed = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = Utils.isDisplayed(element, false);
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

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    throw new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE,
        "Element is not currently visible and so may not be used for " +
        "drag and drop");
  }

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

  // Restrict the desitnation into the sensible dimension
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


FirefoxDriver.prototype.getElementValueOfCssProperty = function(respond,
                                                                parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = Utils.getStyleProperty(element, parameters.propertyName); // Coeerce to a string
  respond.send();
};


FirefoxDriver.prototype.getElementLocationOnceScrolledIntoView = function(
    respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (!Utils.isDisplayed(element, true)) {
    respond.value = undefined;
    respond.send();
    return;
  }

  var theDoc = element.ownerDocument;
  theDoc.body.focus();
  element.scrollIntoView(true);

  var retrieval = Utils.newInstance(
      "@mozilla.org/accessibleRetrieval;1", "nsIAccessibleRetrieval");

  try {
    var accessible = retrieval.getAccessibleFor(element);
    var x = {}, y = {}, width = {}, height = {};
    accessible.getBounds(x, y, width, height);

    respond.value = {
      x : x.value,
      y : y.value
    };
    respond.send();
    return;
  } catch(e) {
    // Element doesn't have an accessibility node. Fall through
  }

  // If we have the box object (which is deprecated) we could try using it
  var theDoc = respond.session.getDocument();
  if (theDoc.getBoxObjectFor) {
    // Fallback. Use the (deprecated) method to find out where the element is in
    // the viewport. This should be fine to use because we only fall down this
    // code path on older versions of Firefox (I think!)

    var box = theDoc.getBoxObjectFor(element);

    respond.value = {
      x : box.screenX,
      y : box.screenY
    };
    respond.send();
  }

  // Fine. Come up with a good guess. This should be the element location
  // added to the current window location. It'll probably be off
  var x = theDoc.defaultView.screenX;
  var y = theDoc.defaultView.screenY;

  var rect = element.getBoundingClientRect()
  respond.value = {
    x : x + rect.left,
    y : y + rect.top  
  }
  respond.send();
};
