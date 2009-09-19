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
  respond.context = this.context;

  var element = Utils.getElementAt(respond.elementId, this.context);

  if (!Utils.isDisplayed(element) && !Utils.isInHead(element)) {
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
  // TODO(simon): Get native clicks working for gecko 1.8+
  var useNativeClick =
      versionChecker.compare(appInfo.platformVersion, "1.9") >= 0;

  if (this.enableNativeEvents && nativeEvents && node && useNativeClick) {
    var loc = Utils.getLocationOnceScrolledIntoView(element);
    var x = loc.x + (loc.width ? loc.width / 2 : 0);
    var y = loc.y + (loc.height ? loc.height / 2 : 0);
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
  var currentlyActive = Utils.getActiveElement(this.context);

  Utils.fireMouseEventOn(this.context, element, "mousedown");
  if (element != currentlyActive) {
    currentlyActive.blur();
    element.focus();
  }

  Utils.fireMouseEventOn(this.context, element, "mouseup");
  Utils.fireMouseEventOn(this.context, element, "click");

  var browser = Utils.getBrowser(this.context);
  var alreadyReplied = false;

  var clickListener = new WebLoadingListener(this, function(event) {
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


FirefoxDriver.prototype.getElementText = function(respond) {
  respond.context = this.context;

  var element = Utils.getElementAt(respond.elementId, this.context);

  if (element.tagName == "TITLE") {
    respond.response = Utils.getBrowser(this.context).contentTitle;
  } else {
    respond.response = Utils.getText(element, true);
  }

  respond.send();
};


FirefoxDriver.prototype.getElementValue = function(respond) {
  respond.context = this.context;

  var element = Utils.getElementAt(respond.elementId, this.context);

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
  respond.context = this.context;

  var element = Utils.getElementAt(respond.elementId, this.context);

  if (!Utils.isDisplayed(element) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be used for typing";
    respond.send();
    return;
  }

  var currentlyActive = Utils.getActiveElement(this.context);
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

  Utils.type(this.context, use, value[0], this.enableNativeEvents);

  respond.context = this.context;
  respond.send();
};


FirefoxDriver.prototype.clear = function(respond) {
  respond.context = this.context;

  var element = Utils.getElementAt(respond.elementId, this.context);

  if (!Utils.isDisplayed(element) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be cleared";
    respond.send();
    return;
  }

  var isTextField = element["value"] !== undefined;

  var currentlyActive = Utils.getActiveElement(this.context);
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
    Utils.fireHtmlEvent(this.context, element, "change");
  }

  respond.send();
};


FirefoxDriver.prototype.getTagName = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  respond.response = element.tagName.toLowerCase();
  respond.send();
};


FirefoxDriver.prototype.getElementAttribute = function(respond, value) {
  var element = Utils.getElementAt(respond.elementId, this.context);

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
      respond.response = element.getAttribute('readonly');
    }

    respond.send();
    return;
  }

  attributeName = attributeName.toLowerCase();

  if (attributeName == "disabled") {
    respond.response = element.disabled;
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
  respond.isError = true;
  respond.response = "No match";
  respond.send();
};


FirefoxDriver.prototype.hover = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

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


FirefoxDriver.prototype.submitElement = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var submitElement = Utils.findForm(element);
  if (submitElement) {
    var driver = this;
    new WebLoadingListener(this, function() {
      respond.context = driver.context;
      respond.send();
    });
    if (submitElement["submit"])
      submitElement.submit();
    else
      submitElement.click();
  } else {
    respond.context = this.context;
    respond.send();
  }
};


FirefoxDriver.prototype.getElementSelected = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

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

  respond.context = this.context;
  respond.response = selected;
  respond.send();
};


FirefoxDriver.prototype.setElementSelected = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  if (!Utils.isDisplayed(element) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be selected";
    respond.send();
    return;
  }

  var wasSet = "You may not select an unselectable element";
  respond.context = this.context;
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
    respond.isError = false;
    if (!option.selected) {
      option.selected = true;
      Utils.fireHtmlEvent(this.context, option, "change");
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
        Utils.fireHtmlEvent(this.context, checkbox, "change");
      }
      wasSet = "";
    }
  } catch(e) {
  }

  respond.response = wasSet;
  respond.send();
};


FirefoxDriver.prototype.toggleElement = function(respond) {
  respond.context = this.context;

  var element = Utils.getElementAt(respond.elementId, this.context);

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
      Utils.fireHtmlEvent(this.context, checkbox, "change");
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
      Utils.fireHtmlEvent(this.context, option, "change");
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


FirefoxDriver.prototype.isElementDisplayed = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  respond.context = this.context;
  respond.response = Utils.isDisplayed(element) ? "true" : "false";
  respond.send();
};


FirefoxDriver.prototype.getElementLocation = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var location = Utils.getElementLocation(element, this.context);

  respond.context = this.context;
  respond.response = location.x + ", " + location.y;
  respond.send();
};


FirefoxDriver.prototype.getElementSize = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var box = Utils.getLocationOnceScrolledIntoView(element);

  respond.context = this.context;
  respond.response = box.width + ", " + box.height;
  respond.send();
};


FirefoxDriver.prototype.dragAndDrop = function(respond, movementString) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  if (!Utils.isDisplayed(element) && !Utils.isInHead(element)) {
    respond.isError = true;
    respond.response =
    "Element is not currently visible and so may not be used for drag and drop";
    respond.send();
    return;
  }

  // Scroll the first element into view
  //  element.scrollIntoView(true);

  var clientStartXY = Utils.getElementLocation(element, this.context);

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

  var finalLoc = Utils.getElementLocation(element, this.context)

  respond.context = this.context;
  respond.response = finalLoc.x + "," + finalLoc.y;
  respond.send();
};


FirefoxDriver.prototype.findElementByXPath = function(respond, xpath) {
  var element = Utils.getElementAt(respond.elementId, this.context);
  var elements = Utils.findElementsByXPath(xpath, element, this.context)
  if (elements.length > 0) {
    respond.response = elements[0];
  } else {
    respond.isError = true;
    respond.response = 'Unable to locate element using xpath "' + xpath + '"';
  }
  respond.send();
};


FirefoxDriver.prototype.findElementsByXPath = function (respond, xpath) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var indices = Utils.findElementsByXPath(xpath, element, this.context)
  var response = ""
  for (var i = 0; i < indices.length; i++) {
    response += indices[i] + ",";
  }
  response = response.substring(0, response.length - 1);

  respond.context = this.context;
  respond.response = response;

  respond.send();
};


FirefoxDriver.prototype.findElementByLinkText = function(respond, linkText) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var children = element.getElementsByTagName('a');
  for (var i = 0; i < children.length; i++) {
    if (linkText == Utils.getText(children[i])) {
      respond.response = Utils.addToKnownElements(children[i], this.context);
      respond.send();
      return;
    }
  }

  respond.isError = true;
  respond.response = 'Unable to find element by link text "' + linkText + '"';
  respond.send();
};


FirefoxDriver.prototype.findElementsByLinkText = function (respond, linkText) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var children = element.getElementsByTagName("A");
  var response = "";
  for (var i = 0; i < children.length; i++) {

    if (linkText == Utils.getText(children[i])) {
      response += Utils.addToKnownElements(children[i], this.context) + ",";
    }
  }
  response = response.substring(0, response.length - 1);
  respond.context = this.context;
  respond.response = response;

  respond.send();
};


FirefoxDriver.prototype.findElementByPartialLinkText = function(respond,
                                                                linkText) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var allLinks = element.getElementsByTagName("A");
  var index;
  for (var i = 0; i < allLinks.length && !index; i++) {
    var text = Utils.getText(allLinks[i], true);
    if (text.indexOf(linkText) != -1) {
      index = Utils.addToKnownElements(allLinks[i], this.context);
      break;
    }
  }

  respond.context = this.context;

  if (index !== undefined) {
    respond.response = index;
  } else {
    respond.isError = true;
    respond.response =
    "Unable to locate element with link text contains '" + linkText + "'";
  }

  respond.send();
};


FirefoxDriver.prototype.findElementsByPartialLinkText = function (respond,
                                                                  linkText) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var children = element.getElementsByTagName("A");
  var response = "";
  for (var i = 0; i < children.length; i++) {
    if (Utils.getText(children[i]).indexOf(linkText) != -1) {
      response += Utils.addToKnownElements(children[i], this.context) + ",";
    }
  }
  response = response.substring(0, response.length - 1);

  respond.context = this.context;
  respond.response = response;
  respond.send();
};


FirefoxDriver.prototype.findElementByClassName = function(respond, className) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  var xpath =
      ".//*[contains(concat(' ',normalize-space(@class),' '),' " +
      className + " ')]";
  var elements = Utils.findElementsByXPath(xpath, element, this.context)

  if (elements.length > 0) {
    respond.response = elements[0];
  } else {
    respond.isError = true;
    respond.response =
    'Unable to locate element by className "' + className + '"';
  }

  respond.send();
};


FirefoxDriver.prototype.findChildElementsByClassName = function(respond,
                                                                className) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  if (element["getElementsByClassName"]) {
    var result = element.getElementsByClassName(className);

    var response = "";
    for (var i = 0; i < result.length; i++) {
      var e = result[i];
      var index = Utils.addToKnownElements(e, this.context);
      response += index + ",";
    }
    // Strip the trailing comma
    response = response.substring(0, response.length - 1);

    respond.context = this.context;
    respond.response = response;
    respond.send();
  } else {
    this.findElementsByXPath(respond,
        ".//*[contains(concat(' ',normalize-space(@class),' '),' " +
        className + " ')]");
  }
};


FirefoxDriver.prototype.findElementById = function(respond, id) {
  var doc = Utils.getDocument(this.context);
  var parentElement = Utils.getElementAt(respond.elementId, this.context);

  var element = doc.getElementById(id);
  var isChild = false;

  if (element) {
    var tmp = element;
    while (tmp != null) {
      if (tmp == parentElement) {
        isChild = true;
        break;
      }
      tmp = tmp.parentNode
    }
    if (isChild) {
      respond.response = Utils.addToKnownElements(element, this.context);
    } else {
      //The first match is not a child of the current node, fall back
      //to xpath to see if there are any children nodes with that id
      elements = Utils.findElementsByXPath("*[@id = '" + id
          + "']", parentElement, this.context)
      if (elements.length > 0) {
        respond.response = elements[0];
      } else {
        respond.isError = true;
        respond.response = "Unable to locate element using id '" + id + "'";
      }
    }
  } else {
    respond.isError = true;
    respond.response = "Unable to locate element using id '" + id + "'";
  }
  respond.send();
};


FirefoxDriver.prototype.findElementsById = function(respond, id) {
  this.findElementsByXPath(respond, './/*[@id = "' + id + '"]');
};


FirefoxDriver.prototype.findElementByName = function(respond, name) {
  var xpath = './/*[@name = "' + name + '"]';
  var element = Utils.getElementAt(respond.elementId, this.context);
  var elements = Utils.findElementsByXPath(xpath, element, this.context)
  if (elements.length > 0) {
    respond.response = elements[0];
  } else {
    respond.isError = true;
    respond.response =
    'Unable to locate element by name "' + name + '"';
  }

  respond.send();
};


FirefoxDriver.prototype.findElementsByName = function(respond, name) {
  this.findElementsByXPath(respond, './/*[@name = "' + name + '"]');
};


FirefoxDriver.prototype.findElementByTagName = function(respond, name) {
  var parentElement = Utils.getElementAt(respond.elementId, this.context);

  var elements = parentElement.getElementsByTagName(name);
  if (elements.length) {
    respond.response = Utils.addToKnownElements(elements[0], this.context);
  } else {
    respond.isError = true;
    respond.response = "Unable to find element with tag name '" + name + "'";
  }

  respond.send();
};


FirefoxDriver.prototype.findElementsByTagName = function(respond, name) {
  var parentElement = Utils.getElementAt(respond.elementId, this.context);

  var elements = parentElement.getElementsByTagName(name);
  var response = "";
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var index = Utils.addToKnownElements(element, this.context);
    response += index + ",";
  }
  // Strip the trailing comma
  response = response.substring(0, response.length - 1);

  respond.context = this.context;
  respond.response = response;
  respond.send();
};


FirefoxDriver.prototype.getElementCssProperty = function(respond,
                                                         propertyName) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  respond.response = Utils.getStyleProperty(element, propertyName); // Coeerce to a string
  respond.send();
};


FirefoxDriver.prototype.getLocationOnceScrolledIntoView = function(respond) {
  var element = Utils.getElementAt(respond.elementId, this.context);

  if (!Utils.isDisplayed(element)) {
    respond.response = undefined;
    respond.send();
    return;
  }

  element.ownerDocument.body.focus();
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
    // Element doesn't have an accessibility node
  }

  // Fallback. Use the (deprecated) method to find out where the element is in
  // the viewport. This should be fine to use because we only fall down this
  // code path on older versions of Firefox (I think!)
  var theDoc = Utils.getDocument(this.context);
  var box = theDoc.getBoxObjectFor(element);

  respond.response = {
    x : box.screenX,
    y : box.screenY
  };
  respond.send();
};
