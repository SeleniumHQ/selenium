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


FirefoxDriver.prototype.click = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be clicked";
    respond.send();
    return;
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
        respond.isError = true;
        respond.response = e.toString();
        respond.send();
        return;
      }

      // Fall through to the synthesized click code.
    }
  }

  Utils.dumpn("Falling back to synthesized click");
  var currentlyActive = Utils.getActiveElement(respond.context);

  Utils.fireMouseEventOn(respond.context, element, "mouseover");
  Utils.fireMouseEventOn(respond.context, element, "mousemove");
  Utils.fireMouseEventOn(respond.context, element, "mousedown");
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

  Utils.fireMouseEventOn(respond.context, element, "mouseup");
  Utils.fireMouseEventOn(respond.context, element, "click");

  var browser = Utils.getBrowser(respond.context);
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
    respond.send();
    return;
  }
  contentWindow.setTimeout(checkForLoad, 50);
};


FirefoxDriver.prototype.getText = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (element.tagName == "TITLE") {
    respond.response = Utils.getBrowser(respond.context).contentTitle;
  } else {
    respond.response = Utils.getText(element, true);
  }

  respond.send();
};


FirefoxDriver.prototype.getValue = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (element["value"] !== undefined) {
    respond.response = element.value;
    respond.send();
    return;
  }

  if (element.hasAttribute("value")) {
    respond.response = element.getAttribute("value");
    respond.send();
    return;
  }

  respond.isError = true;
  respond.response = "No match";
  respond.send();
};


FirefoxDriver.prototype.sendKeys = function(respond, value) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be used for typing";
    respond.send();
    return;
  }

  var currentlyActive = Utils.getActiveElement(respond.context);
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

  Utils.type(respond.context, use, value[0], this.enableNativeEvents);

  respond.send();
};


FirefoxDriver.prototype.clear = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be cleared";
    respond.send();
    return;
  }

  var isTextField = element["value"] !== undefined;

  var currentlyActive = Utils.getActiveElement(respond.context);
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
    Utils.fireHtmlEvent(respond.context, element, "change");
  }

  respond.send();
};


FirefoxDriver.prototype.getTagName = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  respond.response = element.tagName.toLowerCase();
  respond.send();
};


FirefoxDriver.prototype.getAttribute = function(respond, value) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  var attributeName = value[0];

  if (element.hasAttribute(attributeName)) {
    respond.response = element.getAttribute(attributeName);
    // Is this block necessary?
    if (attributeName.toLowerCase() == "disabled") {
      respond.response = element.disabled;
    } else if (attributeName.toLowerCase() == "selected") {
      respond.response = element.selected;
    } else if (attributeName.toLowerCase() == "checked") {
      respond.response = element.checked;
    } else if (attributeName.toLowerCase() == "readonly") {
      respond.response = element.readOnly;
    }

    respond.send();
    return;
  }

  attributeName = attributeName.toLowerCase();

  if (attributeName == "disabled") {
    respond.response = (element.disabled === undefined ? false : element.disabled);
    respond.send();
    return;
  } else if ((attributeName == "checked" || attributeName == "selected") &&
             element.tagName.toLowerCase() == "input") {
    respond.response = element.checked;
    respond.send();
    return;
  } else if (attributeName == "selected" && element.tagName.toLowerCase()
      == "option") {
    respond.response = element.selected;
    respond.send();
    return;
  } else if (attributeName == "index" && element.tagName.toLowerCase()
      == "option") {
    respond.response = element.index;
    respond.send();
    return;
  }
  respond.response = null;
  respond.send();
};


FirefoxDriver.prototype.hover = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

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
    respond.isError = true;
    respond.response = "Unable to hover over element";
  }

  respond.send();
};

FirefoxDriver.prototype.submit = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (element) {
    while (element.parentNode != null && element.tagName.toLowerCase() != "form") {
      element = element.parentNode;
    }
    if (element.tagName && element.tagName.toLowerCase() == "form") {
      if (Utils.fireHtmlEvent(respond.context, element, "submit")) {
        new WebLoadingListener(Utils.getBrowser(respond.context), function() {
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
      respond.isError = true;
      respond.response = "Element was not in a form so couldn't submit";
      respond.send();
      return;
    }
  } else {
    respond.send();
    return;
  }
};

FirefoxDriver.prototype.isSelected = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

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

  respond.response = selected;
  respond.send();
};


FirefoxDriver.prototype.setSelected = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be selected";
    respond.send();
    return;
  }

  var wasSet = "You may not select an unselectable element";
  respond.isError = true;

  try {
    var inputElement =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
    if (inputElement.disabled) {
      respond.response = "You may not select a disabled element";
      respond.send();
      return;
    }
  } catch(e) {
  }

  try {
    var option =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement);
    var select = element;
    while (select.parentNode != null && select.tagName.toLowerCase() != "select") {
      select = select.parentNode;
    }
    if (select.tagName.toLowerCase() == "select") {
      select = select.QueryInterface(Components.interfaces.nsIDOMHTMLSelectElement);
    } else {
      //If we're not within a select element, fire the event from the option, and hope that it bubbles up
      Utils.dumpn("Falling back to event firing from option, not select element");
      select = option;
    }
    respond.isError = false;
    if (!option.selected) {
      option.selected = true;
      Utils.fireHtmlEvent(respond.context, select, "change");
    }
    wasSet = "";
  } catch(e) {
  }

  try {
    var checkbox =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
    respond.isError = false;
    if (checkbox.type == "checkbox" || checkbox.type == "radio") {
      if (!checkbox.checked) {
        checkbox.checked = true;
        Utils.fireHtmlEvent(respond.context, checkbox, "change");
      }
      wasSet = "";
    }
  } catch(e) {
  }

  respond.response = wasSet;
  respond.send();
};


FirefoxDriver.prototype.toggle = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (!Utils.isDisplayed(element) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be toggled";
    respond.send();
    return;
  }

  try {
    var checkbox =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
    if (checkbox.type == "checkbox") {
      checkbox.checked = !checkbox.checked;
      Utils.fireHtmlEvent(respond.context, checkbox, "change");
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
      Utils.fireHtmlEvent(respond.context, option, "change");
      respond.send();
      return;
    }
  } catch(e) {
  }

  respond.isError = true;
  respond.response =
      "You may only toggle an element that is either a checkbox or an "  +
      "option in a select that allows multiple selections";
  respond.send();
};


FirefoxDriver.prototype.isDisplayed = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);
  respond.response = Utils.isDisplayed(element, false);
  respond.send();
};


FirefoxDriver.prototype.getLocation = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  var location = Utils.getElementLocation(element, respond.context);

  respond.response = {
    x: Math.round(location.x),
    y: Math.round(location.y)
  };
  respond.send();
};


FirefoxDriver.prototype.getSize = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  var box = Utils.getLocationOnceScrolledIntoView(element);

  respond.response = {
    width: Math.round(box.width),
    height: Math.round(box.height)
  };
  respond.send();
};


FirefoxDriver.prototype.dragElement = function(respond, movementString) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (!Utils.isDisplayed(element, true) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be used for drag and drop";
    respond.send();
    return;
  }

  // Scroll the first element into view
  //  element.scrollIntoView(true);

  var clientStartXY = Utils.getElementLocation(element, respond.context);

  var clientStartX = clientStartXY.x;
  var clientStartY = clientStartXY.y;

  var movementX = movementString[0];
  var movementY = movementString[1];

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

  var mouseSpeed = this.mouseSpeed;
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

  var finalLoc = Utils.getElementLocation(element, respond.context)

  respond.response = finalLoc.x + "," + finalLoc.y;
  respond.send();
};


FirefoxDriver.prototype.getValueOfCssProperty = function(respond,
                                                         propertyName) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  respond.response = Utils.getStyleProperty(element, propertyName); // Coeerce to a string
  respond.send();
};


FirefoxDriver.prototype.getLocationOnceScrolledIntoView = function(respond) {
  var element = Utils.getElementAt(respond.elementId, respond.context);

  if (!Utils.isDisplayed(element, true)) {
    respond.response = undefined;
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

    respond.response = {
      x : x.value,
      y : y.value
    };
    respond.send();
    return;
  } catch(e) {
    // Element doesn't have an accessibility node. Fall through
  }

  // If we have the box object (which is deprecated) we could try using it
  if (theDoc.getBoxObjectFor) {
    // Fallback. Use the (deprecated) method to find out where the element is in
    // the viewport. This should be fine to use because we only fall down this
    // code path on older versions of Firefox (I think!)

    var box = theDoc.getBoxObjectFor(element);

    respond.response = {
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
  respond.response = {
    x : x + rect.left,
    y : y + rect.top  
  }
  respond.send();
};
