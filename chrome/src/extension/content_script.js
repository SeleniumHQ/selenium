/**
 * All functions which take elements assume that they are not null,
 * and are present as passed on the DOM.
 */

ChromeDriverContentScript = {};

ChromeDriverContentScript.internalElementArray = [];
ChromeDriverContentScript.port = null;
ChromeDriverContentScript.currentDocument = window.document;
ChromeDriverContentScript.injectedEmbedElement = null;
//Record this for async calls (execute), so returner knows what to return
//(Also so that we can not re-start commands we have already started executing)
ChromeDriverContentScript.currentSequenceNumber = -1;

if (ChromeDriverContentScript.currentDocument.location != "about:blank") {
  //If loading windows using window.open, the port is opened
  //while we are on about:blank (which always reports window.name as ''),
  //and we use port-per-tab semantics, so don't open the port if
  //we're on about:blank
  ChromeDriverContentScript.port = chrome.extension.connect({name: window.name});
  ChromeDriverContentScript.port.onMessage.addListener(parsePortMessage);
  var isFrameset = (ChromeDriverContentScript.currentDocument.getElementsByTagName("frameset").length > 0);
  ChromeDriverContentScript.port.postMessage({response: {response: "newTabInformation",
      value: {statusCode: "no-op", isFrameset: isFrameset, frameCount: window.frames.length,
      portName: ChromeDriverContentScript.port.name}}, sequenceNumber: -1});
}

/**
 * Parse messages coming in on the port.
 * Sends relevant response back down the port
 * @param message JSON message of format:
 *                {request: {request: "some command"
 *                           [, optional params]},
 *                 sequenceNumber: some sequence number
 *                 [, followup: message']}
 *                 where message' is a message to parse after this one
 */
function parsePortMessage(message) {
  if (message == null || message.request == null) {
    console.log("Received bad request: " + JSON.stringify(message));
    return;
  }
  if (message.sequenceNumber <= ChromeDriverContentScript.currentSequenceNumber) {
    console.log("Already process{ed,ing} request with sequence number: " + message.sequenceNumber + ", ignoring request: " + message);
    return;
  }
  
  ChromeDriverContentScript.currentSequenceNumber = message.sequenceNumber;
  
  console.log("Received request: " + JSON.stringify(message) + " (" + window.name + ")");
  //wait indicates whether this is a potentially page-changing change (see background.js's sendResponseByXHR)
  var response = {response: message.request.request, value: null, wait: true};
  if (message.request.id !== undefined && message.request.id != null) {
    //If it seems an id has been passed, try to resolve that to an element
    try {
      var element = internalGetElement(message.request.id);
    } catch(e) {
      response.value = e;
      ChromeDriverContentScript.port.postMessage({response: response, sequenceNumber: message.sequenceNumber});
      return;
    }
  }
  try {
    switch (message.request.request) {
    case "addCookie":
      response.value = setCookie(message.request.cookie);
      response.wait = false;
      break;
    case "clearElement":
      response.value = clearElement(element);
      break;
    case "clickElement":
      response.value = clickElement(element, message.request.id);
      break;
    case "nonNativeClickElement":
      //TODO(danielwh): Focus/blur events for non-native clicking
      element.scrollIntoView(true);
      //TODO: Work out a way of firing events,
      //now that synthesising them gives appendMessage errors
      console.log("mouse downing");
      Utils.fireMouseEventOn(element, "mousedown");
        console.log("mouse up");
      Utils.fireMouseEventOn(element, "mouseup");
        console.log("mouse click");
      Utils.fireMouseEventOn(element, "click");

      if (element.click) {
        console.log("click");
        execute("try { arguments[0].click(); } catch(e){}", [{
          type: "ELEMENT", value: addElementToInternalArray(element)
        }]);
      }
      response.value = {statusCode: 0};
      break;
    case "deleteAllCookies":
      response.value = deleteAllCookies();
      response.wait = false;
      break;
    case "deleteCookie":
      response.value = deleteCookie(message.request.name);
      response.wait = false;
      break;
    case "executeScript":
      execute(message.request.script, message.request.args);
      //Sends port message back to background page from its own callback
      break;
    case "getCookies":
      response.value = getCookies();
      response.wait = false;
      break;
    case "getCookie":
      response.value = getCookieNamed(message.request.name);
      response.wait = false;
      break;
    case "findChildElement":
    case "findChildElements":
    case "findElement":
    case "findElements":
      response.wait = false;
      findElement(message, response);
      return;  // Nothing more to do.
    case "getElementAttribute":
      response.value = getElementAttribute(element, message.request.name);
      response.wait = false;
      break;
    case "getElementValueOfCssProperty":
      response.value = {statusCode: 0, value: getStyle(element, message.request.propertyName)};
      response.wait = false;
      break;
    case "getElementLocation":
      var coords = getElementCoords(element);
      response.value = {statusCode: 0, value: {type: "POINT", x: coords[0], y: coords[1]}};
      response.wait = false;
      break;
    case "getElementLocationOnceScrolledIntoView":
      element.scrollIntoView(true);
      var coords = getElementCoords(element);
      response.value = {statusCode: 0, value: {type: "POINT", x: coords[0], y: coords[1]}};
      break;
    case "getElementSize":
      response.value = {statusCode: 0, value: getOffsetSizeFromSubElements(element)};
      response.wait = false;
      break;
    case "getElementTagName":
      response.value = {statusCode: 0, value: element.tagName.toLowerCase()};
      response.wait = false;
      break;
    case "getElementText":
      response.value = {statusCode: 0, value: Utils.getText(element)};
      response.wait = false;
      break;
    case "getElementValue":
      response.value = {statusCode: 0, value: element.value};
      response.wait = false;
      break;
    case "getFrameNameFromIndex":
      //TODO(danielwh): Do this by simply looking it up in window.frames when Chrome is fixed.  Track: crbug.com 20773
      getFrameNameFromIndex(message.request.index);
      break;
    case "getPageSource":
      response.value = getSource();
      response.wait = false;
      break;
    case "getTitle":
      response.value = {statusCode: 0, value: Utils.trim(ChromeDriverContentScript.currentDocument.title)};
      response.wait = false;
      break;
    case "getCurrentUrl":
      response.value = {statusCode: 0, value: ChromeDriverContentScript.currentDocument.location.href};
      response.wait = false;
      break;
    case "goBack":
      history.back();
      response.value = {statusCode: 0};
      break;
    case "goForward":
      history.forward();
      response.value = {statusCode: 0};
      break;
    case "hoverOverElement":
      response.value = hoverElement(element, message.request.id);
      break;
    case "injectEmbed":
      injectEmbed();
      break;
    case "isElementDisplayed":
      response.value = {statusCode: 0, value: isElementDisplayed(element)};
      response.wait = false;
      break;
    case "isElementEnabled":
      response.value = {statusCode: 0, value: !element.disabled};
      response.wait = false;
      break;
    case "isElementSelected":
      response.value = {statusCode: 0, value: findWhetherElementIsSelected(element)};
      response.wait = false;
      break;
    case "refresh":
      ChromeDriverContentScript.currentDocument.location.reload(true);
      response.value = {statusCode: 0};
      break;
    case "sendKeysToElement":
      if (typeof message.request.value.splice == 'function' &&
          typeof message.request.value.join == 'function') {
        // Looks like we were given an array of strings. Join them together.
        message.request.value = message.request.value.join('');
      }
      response.value = sendElementKeys(element, message.request.value, message.request.id);
      response.wait = false;
      break;
    case "sendElementNonNativeKeys":
      response.value = sendElementNonNativeKeys(element, message.request.keys);
      response.wait = false;
      break;
    case "setElementSelected":
      response.value = selectElement(element);
      break;
    case "getActiveElement":
      response.value = {statusCode: 0, value: {'ELEMENT':addElementToInternalArray(ChromeDriverContentScript.currentDocument.activeElement).toString()}};
      response.wait = false;
      break;
    case "switchToNamedIFrameIfOneExists":
      response.value = switchToNamedIFrameIfOneExists(message.request.name);
      response.wait = false;
      break;
    case "submitElement":
      response.value = submitElement(element);
      break;
    case "toggleElement":
      response.value = toggleElement(element);
      break;
    case "sniffForMetaRedirects":
      response.value = sniffForMetaRedirects();
      break;
    default:
      response.value = {statusCode: 9, value: {message: message.request.request + " is unsupported"}};
      break;
    }
  } catch (e) {
    console.log("Caught exception " + e + ", sending error response");
    ChromeDriverContentScript.port.postMessage({response: {statusCode: 13, value: {message: "An unexpected error occured while executing " + message.request.request + ", exception dump: " + e}}, sequenceNumber: message.sequenceNumber});
  }
  if (response.value != null) {
    ChromeDriverContentScript.port.postMessage({response: response, sequenceNumber: message.sequenceNumber});
    console.log("Sent response: " + JSON.stringify(response) + " (seq:" + message.sequenceNumber + ")");
  }
  if (message.request.followup) {
    setTimeout(parsePortMessage(message.request.followup), 100);
  }
}

/**
 * Deletes all cookies accessible from the current page.
 */
function deleteAllCookies() {
  var cookies = getAllCookiesAsStrings();
  for (var i = 0; i < cookies.length; ++i) {
    var cookie = cookies[i].split("=");
    deleteCookie(cookie[0]);
  }
  return {statusCode: 0};
}

/**
 * Deletes the cookie with the passed name, accessible from the current page (i.e. with path of the current directory or above)
 * @param cookieName name of the cookie to delete
 */
function deleteCookie(cookieName) {
  //It's possible we're trying to delete cookies within iframes.
  //iframe stuff is unsupported in Chrome at the moment (track crbug.com/20773)
  //But for the iframe to be loaded and have cookies, it must be of same origin,
  //so we'll try deleting the cookie as if it was on this page anyway...
  //(Yes, this is a hack)
  //TODO(danielwh): Remove the cookieDocument stuff when Chrome fix frame support
  try {
    var fullpath = ChromeDriverContentScript.currentDocument.location.pathname;
    var cookieDocument = ChromeDriverContentScript.currentDocument;
  } catch (e) {
    console.log("Falling back on non-iframe document to delete cookies");
    var cookieDocument = document;
    var fullpath = cookieDocument.location.pathname;
  }
  var hostParts = cookieDocument.location.hostname.split(".");

  fullpath = fullpath.split('/');
  fullpath.pop(); //Get rid of the file
  //TODO(danielwh): Tidy up these loops and this repeated code
  for (var segment in fullpath) {
    var path = '';
    for (var i = 0; i < segment; ++i) {
      path += fullpath[i + 1] + '/';
    }
    //Delete cookie with trailing /
    cookieDocument.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + path;
    //Delete cookie without trailing /
    cookieDocument.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + path.substring(0, path.length - 1);

    var domain = "";
    for (var i = hostParts.length - 1; i >= 0; --i) {
      domain = "." + hostParts[i] + domain;
      //Delete cookie with trailing /
      cookieDocument.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + path + ";domain=" + domain;

      cookieDocument.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + path + ";domain=" + domain;
      //Delete cookie without trailing /
      cookieDocument.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + path.substring(0, path.length - 1) + ";domain=" + domain;

      cookieDocument.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + path.substring(0, path.length - 1) + ";domain=" + domain.substring(1);
    }
  }
  return {statusCode: 0};
}

/**
 * Get all cookies accessible from the current page as an array of
 * {name: some name, value: some value, secure: false} values
 */
function getCookies() {
  var cookies = [];
  var cookieStrings = getAllCookiesAsStrings();
  for (var i = 0; i < cookieStrings.length; ++i) {
    var cookie = cookieStrings[i].split("=");
    cookies.push({type: "COOKIE", name: cookie[0], value: cookie[1], secure: false});
  }
  return {statusCode: 0, value: cookies};
}

/**
 * Get the cookie accessible from the current page with the passed name
 * @param name name of the cookie
 */
function getCookieNamed(name) {
  var cookies = [];
  var cookieStrings = getAllCookiesAsStrings();
  for (var i = 0; i < cookieStrings.length; ++i) {
    var cookie = cookieStrings[i].split("=");
    if (cookie[0] == name) {
      return {statusCode: 0, value: {type: "COOKIE", name: cookie[0], value: cookie[1], secure: false}};
    }
  }
  return {statusCode: 0, value: null};
}

/**
 * Gets all cookies accessible from the current page as an array of
 * key=value strings
 */
function getAllCookiesAsStrings() {
  //It's possible we're trying to delete cookies within iframes.
  //iframe stuff is unsupported in Chrome at the moment (track crbug.com/20773)
  //But for the iframe to be loaded and have cookies, it must be of same origin,
  //so we'll try deleting the cookie as if it was on this page anyway...
  //(Yes, this is a hack)
  //TODO(danielwh): Remove the cookieDocument stuff when Chrome fix frame support
  var cookieDocument = ChromeDriverContentScript.currentDocument;
  try {
    var tempFullpath = ChromeDriverContentScript.currentDocument.location.pathname;
  } catch (e) {
    cookieDocument = document;
  }
  var cookieStrings = cookieDocument.cookie.split('; ');
  var cookies = [];
  for (var i = 0; i < cookieStrings.length; ++i) {
    if (cookieStrings[i] == '') {
      break;
    }
     cookies.push(cookieStrings[i]);
  }
   return cookies;
}

/**
 * Add the passed cookie to the page's cookies
 * @param cookie org.openqa.selenium.Cookie to add
 */
function setCookie(cookie) {
  //It's possible we're trying to delete cookies within iframes.
  //iframe stuff is unsupported in Chrome at the moment (track crbug.com/20773)
  //But for the iframe to be loaded and have cookies, it must be of same origin,
  //so we'll try deleting the cookie as if it was on this page anyway...
  //(Yes, this is a hack)
  //TODO(danielwh): Remove the cookieDocument stuff when Chrome fix frame support
  try {
    var currLocation = ChromeDriverContentScript.currentDocument.location;
    var currDomain = currLocation.host;
    var cookieDocument = ChromeDriverContentScript.currentDocument;
  } catch (e) {
    cookieDocument = document;
    var currLocation = ChromeDriverContentScript.currentDocument.location;
    var currDomain = currLocation.host;
  }

  if (currLocation.port != 80) { currDomain += ":" + currLocation.port; }
  if (cookie.domain != null && cookie.domain !== undefined &&
      currDomain.indexOf(cookie.domain) == -1) {
      // Not quite right, but close enough. (See r783)
    return {statusCode: 24, value: {
            message: "You may only set cookies for the current domain"}};
  } else if (guessPageType() != "html") {
    return {statusCode: 25, value: {
            message: "You may only set cookies on html documents"}};
  } else {
    cookieDocument.cookie = cookie.name + '=' + escape(cookie.value) +
        ((cookie.expiry == null || cookie.expiry === undefined) ?
            '' : ';expires=' + (new Date(cookie.expiry.time)).toGMTString()) +
        ((cookie.path == null || cookie.path === undefined) ?
            '' : ';path=' + cookie.path);
    return {statusCode: 0};
  }
}

/**
 * Responds to a request to find an element on the page.
 * @param {Object} message The request from the background page.
 * @param {Object} resp The response to send when the search has completed.
 */
function findElement(message, resp) {
  var req = message.request;
  var startTime = new Date().getTime();
  var plural = req.request == 'findChildElements' ||
               req.request == 'findElements';
  var wait = message.implicitWait;

  function send(response) {
    ChromeDriverContentScript.port.postMessage({
      response: response,
      sequenceNumber: message.sequenceNumber
    });
    console.log("Sent response: " + JSON.stringify(response) +
        " (seq:" + message.sequenceNumber + ")");
  }

  function doSearch() {
    var found;
    try {
      found = getElement(req.using, req.value, req.id);
    } catch (ex) {
      console.error('Caught exception; sending error response', ex);
      send({
        statusCode: 13,
        value: {
          message: "An unexpected error occured while executing " +
              req.request + ", exception dump: " + ex
        }
      });
    }

    var done = !wait || found.length;
    if (done) {
      if (!plural && !found.length) {
        resp.value = {
          statusCode: 7,
          value: {
            message: 'After ' + (new Date().getTime() - startTime) + 'ms, ' +
                'unable to find element with ' +
                req.using + ' ' + req.value
          }
        };
      } else {
        resp.value = {
          statusCode: 0,
          value: (plural ? found : found[0])
        };
      }
      send(resp);
    } else if (new Date().getTime() - startTime > wait) {
      if (plural) {
        resp.value = {statusCode: 0, value: []};
      } else {
        resp.value = {
          statusCode: 7,
          value: {
            message: 'Unable to find element with ' +
                req.using + ' ' + req.value
          }
        };
      }
      send(resp);
    } else {
      setTimeout(doSearch, 100);
    }
  }

  doSearch();
}


/**
 * Get an element, or a set of elements, by some lookup
 * @param {string} lookupBy The lookup strategy to use.
 * @param {string} lookupValue What to lookup.
 * @param {string} id Internal ID of the parent element to restrict the lookup
 *     to.
 * @return {Array} An array of the elements matching the search criteria.
 */
function getElement(lookupBy, lookupValue, id) {
  var root = "";
  var parent = null;
  if (id !== undefined && id != null) {
    parent = internalGetElement(id);
    //Looking for children
    root = getXPathOfElement(parent);
  } else {
    parent = ChromeDriverContentScript.currentDocument;
  }

  var elements = [];
  var attribute = '';
  switch (lookupBy) {
  case "class name":
    elements = getElementsByXPath(root +
        "//*[contains(concat(' ',normalize-space(@class),' '),' " +
        lookupValue + " ')]");
    break;
  case "name":
    attribute = 'name';
    break;
  case "id":
    attribute = 'id';
    break;
  case "link text":
    elements = getElementsByLinkText(parent, lookupValue);
    break;
  case "partial link text":
    elements = getElementsByPartialLinkText(parent, lookupValue);
    break;
  case "tag name":
    elements = getElementsByXPath(root + "//" + lookupValue);
    break;
  case "css":
    elements = parent.querySelectorAll(lookupValue);
    break;
  case "xpath":
    if (root != "" && lookupValue[0] != "/") {
      //Because xpath is relative to the parent, if there is a parent, and the lookup seems to be implied sub-lookup, we add a /
      root = root + "/";
    }
    var xpath = root + lookupValue;
    try {
      elements = getElementsByXPath(xpath);
    } catch (e) {
      return {statusCode: 19, value: {message: "Could not look up element by xpath " + xpath}};
    }
    break;
  }
  if (attribute != '') {
    elements = getElementsByXPath(root + "//*[@" + attribute + "='" + lookupValue + "']");
  }

  if (elements == null || elements.length == 0) {
    return [];
  }

  var toReturn = [];
  //Add all found elements to the page's elements, and push each to the array to return
  var addedElements = addElementsToInternalArray(elements);
  for (var addedElement in addedElements) {
    toReturn.push({
      'ELEMENT': addedElements[addedElement].toString()
    });
  }
  return toReturn;
}

/**
 * Adds the element to the internal element store, if it isn't already there.
 * @return index of element in the array
 */
function addElementToInternalArray(element) {
  for (var existingElement in ChromeDriverContentScript.internalElementArray) {
    if (element == ChromeDriverContentScript.internalElementArray[existingElement]) {
      return existingElement;
    }
  }
  ChromeDriverContentScript.internalElementArray.push(element);
  return (ChromeDriverContentScript.internalElementArray.length - 1);
}

function addElementsToInternalArray(elements) {
  var toReturn = [];
  for (var element in elements) {
    toReturn.push(addElementToInternalArray(elements[element]));
  }
  return toReturn;
}

/**
 * Gets an element which we have previously looked up by its internal ID
 * @param elementIdAsString the element's internal ID
 * @return element with the passed internal ID
 * @throws if element ID was stale: wrapped up
 *         org.openqa.selenium.StaleElementReferenceException ready to send
 */
function internalGetElement(elementIdAsString) {
  var elementId = parseInt(elementIdAsString);
  if (elementId != null && elementId >= 0 &&
      ChromeDriverContentScript.internalElementArray.length >= elementId + 1) {
    var element = ChromeDriverContentScript.internalElementArray[elementId];
    var parent = element;
    while (parent && parent != element.ownerDocument.documentElement) {
      parent = parent.parentNode;
    }
    if (parent !== element.ownerDocument.documentElement) {
      throw {statusCode: 10, value: {message: "Element is obsolete"}};
    }
    return element;
  } else {
    throw {statusCode: 10, value: {message: "Element is obsolete"}};
  }
}

/**
 * Ensures the passed element is in view, so that the native click event can be sent
 * @return object to send back to background page to trigger a native click
 */
function clickElement(element, elementId) {
  try {
    checkElementIsDisplayed(element)
  } catch (e) {
    return e;
  }
  element.scrollIntoView(true);
  var size = getOffsetSizeFromSubElements(element);
  var coords = getElementCoords(element);
  return {statusCode: "no-op", id: elementId,
          x: parseInt(coords[0] - ChromeDriverContentScript.currentDocument.body.scrollLeft + (size.width ? size.width / 2 : 0)),
          y: parseInt(coords[1] - ChromeDriverContentScript.currentDocument.body.scrollTop + (size.height ? size.height / 2 : 0))};
}

/**
 * Ensures the passed element is in view, so that the native click event can be sent
 * @return object to send back to background page to trigger a native click
 */
function hoverElement(element, elementId) {
  try {
    checkElementIsDisplayed(element)
  } catch (e) {
    return e;
  }
  element.scrollIntoView(true);
  var size = getOffsetSizeFromSubElements(element)
  var coords = getElementCoords(element);
  console.log("element.clientX: " + element.clientX);
  return {statusCode: "no-op", id: elementId,
      oldX: 0,
      oldY: 0,
      newX: coords[0] - ChromeDriverContentScript.currentDocument.body.scrollLeft + (size.width ? size.width / 2 : 0),
      newY: coords[1] - ChromeDriverContentScript.currentDocument.body.scrollTop + (size.height ? size.height / 2 : 0)};
}

/**
 * Clears the passed element
 */
function clearElement(element) {
  var oldValue = element.value;
  element.value = '';
  if (oldValue != '') {
    //TODO: Work out a way of firing events,
    //now that synthesising them gives appendMessage errors
    Utils.fireHtmlEvent(element, "change");
  }
  return {statusCode: 0};
}

/**
 * Gets the attribute of the element
 * If the attribute is {disabled, selected, checked, index}, always returns
 * the sensible default (i.e. never null)
 */
function getElementAttribute(element, attribute) {
  var value = null;
  switch (attribute.toLowerCase()) {
  case "disabled":
    value = (element.disabled ? element.disabled : "false");
    break;
  case "selected":
    value = findWhetherElementIsSelected(element);
    break;
  case "checked":
    value = (element.checked ? element.checked : "false");
    break;
  case "index":
    value = element.index;
    break;
  }
  if (value == null) {
    value = element.getAttribute(attribute);
  }
  return {statusCode: 0, value: value};
}

/**
 * Gets the source of the current document
 */
function getSource() {
  if (guessPageType() == "html") {
    return {statusCode: 0, value: ChromeDriverContentScript.currentDocument.getElementsByTagName("html")[0].outerHTML};
  } else if (guessPageType() == "text") {
    return {statusCode: 0, value: ChromeDriverContentScript.currentDocument.getElementsByTagName("pre")[0].innerHTML};
  }
}

/**
 * Get whether the element is currently displayed (i.e. can be seen in the browser)
 */
function isElementDisplayed(element) {
  try {
    checkElementIsDisplayed(element)
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Selects the element (i.e. sets its selected/checked value to true)
 * @param element An option element or input element with type checkbox or radio
 */
function selectElement(element) {
  var oldValue = true;
  try {
    checkElementIsDisplayed(element);
    checkElementNotDisabled(element);
    var tagName = element.tagName.toLowerCase();
    if (tagName == "option") {
      oldValue = element.selected;
      element.selected = true;
    } else if (tagName == "input") {
      var type = element.getAttribute("type").toLowerCase();
      if (type == "checkbox") {
        oldValue = element.checked;
        element.checked = true;
      } else if (type == "radio") {
        oldValue = element.checked;
        element.checked = true;
      } else {
        throw {statusCode: 12, value: {message: "Cannot select an input." + type}};
      }
    } else {
      throw {statusCode: 12, value: {message: "Cannot select a " + tagName}};
    }
  } catch(e) {
    return e;
  }
  if (!oldValue) {
    //TODO: Work out a way of firing events,
    //now that synthesising them gives appendMessage errors
    if (tagName == "option") {
      var select = element;
      while (select.parentNode != null && select.tagName.toLowerCase() != "select") {
        select = select.parentNode;
      }
      if (select.tagName.toLowerCase() == "select") {
        element = select;
      } else {
        //If we're not within a select element, fire the event from the option, and hope that it bubbles up
        console.log("Falling back to event firing from option, not select element");
      }
    }
    Utils.fireHtmlEvent(element, "change");
  }
  return {statusCode: 0};
}

/**
 * Focus the element so that native code can type to it
 * @param keys the string to type.  Must not be an array.
 */
function sendElementKeys(element, keys, elementId) {
  try {
    checkElementIsDisplayed(element)
  } catch (e) {
    return e;
  }
  var oldFocusedElement = ChromeDriverContentScript.currentDocument.activeElement;
  if (oldFocusedElement != element) {
    //TODO: Work out a way of firing events,
    //now that synthesising them gives appendMessage errors
    Utils.fireHtmlEventAndConditionallyPerformAction(oldFocusedElement, "blur", function() {oldFocusedElement.blur();});
    Utils.fireHtmlEventAndConditionallyPerformAction(element, "focus", function() {element.focus();});
  }
  return {statusCode: "no-op", keys: keys, id: elementId};
}

/**
 * @param keys the string to type.  Must not be an array.
 */
function sendElementNonNativeKeys(element, keys) {
  //TODO(danielwh): Any kind of actually support for non-native keys
  for (var i = 0; i < keys.length; i++) {
    element.value += keys.charAt(i);
  }
  return {statusCode: 0};
}

/**
 * Submits the element if it is a form, or the closest enclosing form otherwise
 */
function submitElement(element) {
  while (element != null) {
    if (element.tagName.toLowerCase() == "form") {
      Utils.fireHtmlEventAndConditionallyPerformAction(element, "submit", function() {element.submit();});
      return {statusCode: 0};
    }
    element = element.parentNode;
  }
  return {statusCode: 12, value: {message: "Cannot submit an element not in a form"}};
}

/**
 * Toggles the element if it is an input element of type checkbox,
 * or option element in a multi-select select element
 */
function toggleElement(element) {
  var changed = false;
  var oldValue = null;
  var newValue = null;
  try {
    checkElementIsDisplayed(element);
    checkElementNotDisabled(element);
    var tagName = element.tagName.toLowerCase();
    if (tagName == "option") {
      var parent = element;
      while (parent != null && parent.tagName.toLowerCase() != "select") {
        parent = parent.parentNode;
      }
      if (parent == null) {
        throw {statusCode: 12, value: {message: "option tag had no select tag parent"}};
      }
      oldValue = element.selected;
      if (oldValue && !parent.multiple) {
        throw {statusCode: 12, value: {message: "Cannot unselect a single element select"}};
      }
      newValue = element.selected = !oldValue;
    } else if (tagName == "input") {
      var type = element.getAttribute("type").toLowerCase();
      if (type == "checkbox") {
        oldValue = element.checked;
        newValue = element.checked = !oldValue;
        changed = true;
      } else {
        throw {statusCode: 12, value: {message: "Cannot toggle an input." + type}};
      }
    } else {
      throw {statusCode: 12, value: {message: "Cannot toggle a " + tagName}};
    }
  } catch (e) {
    return e;
  }
  console.log("New value: " + newValue);

  if (changed) {
    //TODO: Work out a way of firing events,
    //now that synthesising them gives appendMessage errors
    Utils.fireHtmlEvent(element, "change");
  }
  return {statusCode: 0, value: newValue};
}

/**
 * Gets the CSS property asked for
 * @param style CSS property to get
 */
function getStyle(element, style) {
  var value = ChromeDriverContentScript.currentDocument.defaultView.getComputedStyle(element, null).getPropertyValue(style);
  return rgbToRRGGBB(value);
}

function switchToNamedIFrameIfOneExists(name) {
  var iframes = ChromeDriverContentScript.currentDocument.getElementsByTagName("iframe");
  for (var i = 0; i < iframes.length; ++i) {
    if (iframes[i].name == name || iframes[i].id == name) {
      ChromeDriverContentScript.currentDocument = iframes[i].contentDocument;
      return {statusCode: 0};
    }
  }
  return {statusCode: 8, value: {message: 'Could not find iframe to switch to by name:' + name}};
}

function sniffForMetaRedirects() {
  for (var i = 0; i < ChromeDriverContentScript.currentDocument.getElementsByTagName("meta").length; ++i) {
    if (ChromeDriverContentScript.currentDocument.getElementsByTagName("meta")[i].hasAttribute("http-equiv") &&
        ChromeDriverContentScript.currentDocument.getElementsByTagName("meta")[i].getAttribute("http-equiv").toLowerCase == "refresh") {
      return {statusCode: "no-op", value: true};
    }
  }
  return {statusCode: "no-op", value: false};
}

function parseWrappedArguments(wrappedArguments) {
  var converted = [];
  while (wrappedArguments && wrappedArguments.length > 0) {
    var t = wrappedArguments.shift();
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
          converted.push(parseWrappedArguments(t));

        } else if (typeof t['ELEMENT'] === 'string' ||
                   typeof t['ELEMENT'] === 'number') {
          //Wrap up as a special object with the element's canonical xpath,
          // which the page can work out
          var element_id = t['ELEMENT'];
          var element = null;
          try {
            element = internalGetElement(element_id);
          } catch (e) {
            throw {
              statusCode: 10,
              message:'Tried to use obsolete element as a JavaScript argument.'
            };
          }
          converted.push({
            webdriverElementXPath: getXPathOfElement(element)
          });

        } else {
          var convertedObj = {};
          for (var prop in t) {
            convertedObj[prop] = parseWrappedArguments(t[prop]);
          }
          converted.push(convertedObj);
        }
        break;

      default:
        throw {
          statusCode: 17,
          message: 'Bad javascript argument: ' + (typeof t)
        };
    }
  }
  return converted;
}

/**
 * Execute arbitrary javascript in the page.
 * Returns by callback to returnFromJavascriptInPage.
 * Yes, this is *horribly* hacky.
 * We can't share objects between content script and page, so have to wrap up arguments as JSON
 * @param {string} script The javascript snippet to execute in the current page.
 * @param {Array.<*>} passedArgs An array of JSON arguments to pass to the
 *     injected script. DOMElements should be specified as JSON objects of the
 *     form {ELEMENT: string}.
 * @param callback function to call when the result is returned.  Passed a DOMAttrModified event which should be parsed as returnFromJavascriptInPage
 * TODO: Make the callback be passed the parsed result.
 */
function execute_(script, passedArgs, callback) {
  console.log("executing " + script + ", args: " + JSON.stringify(passedArgs));
  var func = "function(){" + script + "}";
  var args;
  try {
    args = parseWrappedArguments(passedArgs);
  } catch (ex) {
    ChromeDriverContentScript.port.postMessage({
      response: {
        statusCode: (ex.statusCode || 17),
        message: (ex.message || ex.toString())
      },
      sequenceNumber: ChromeDriverContentScript.currentSequenceNumber
    });
    return;
  }

  //Add a script tag to the page, containing the script we wish to execute
  var scriptTag = ChromeDriverContentScript.currentDocument.createElement('script');
  var argsString = JSON.stringify(args).replace(/"/g, "\\\"");

  // We use the fact that Function.prototype.toString() will decompile this to
  // its source code so we can inject it into the page in a SCRIPT tag.
  function executeInjectedScript(fn, argsAsString) {
    var e = document.createEvent("MutationEvent");
    var args = JSON.parse(argsAsString);
    var element = null;
    for (var i = 0; i < args.length; i++) {
      if (args[i] && typeof args[i] == 'object' &&
          args[i].webdriverElementXPath) {
        //If this is an element (because it has the proper xpath), turn it into
        //an actual element object
        args[i] = document.evaluate(args[i].webdriverElementXPath, document,
            null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      }
    }
    try {
      var val = fn.apply(window, args);

      // prepares the injected script result to be converted to json to be sent
      // back to the content script.
      function convertResultToJson(result) {
        switch (typeof result) {
          case 'string':
          case 'number':
          case 'boolean':
            return result;
          case 'undefined':
            return null;
          case 'object':
            if (result == null) {
              return result;
            }
            // Result was an array.
            if (typeof result.length === 'number' &&
                !(result.propertyIsEnumerable('length'))) {
              var converted = [];
              for (var i = 0; i < result.length; i++) {
                converted.push(convertResultToJson(result[i]));
              }
              return converted;
            }
            // Result is a DOMNode; make sure it's a DOMElement
            if (typeof result.nodeType == 'number') {
              if (result.nodeType != 1) {
                // Non-valid JSON value; we'll fail over when trying to
                // stringify this, so fail early.
                throw Error('Invalid script return type: result.nodeType == ' +
                    result.nodeType);
              }
              var path = '';
              for (; result && result.nodeType == 1;
                  result = result.parentNode) {
                var index = 1;
                for (var sibling = result.previousSibling; sibling;
                    sibling = sibling.previousSibling) {
                  if (sibling.nodeType == 1 && sibling.tagName &&
                      sibling.tagName == result.tagName) {
                    index++;
                  }
                }
                path = '/' + result.tagName + '[' + index + ']' + path;
              }
              return {webdriverElementXPath: path};
            }
            // Result is an object; convert each property.
            var converted = {};
            for (var prop in result) {
              converted[prop] = convertResultToJson(result[prop]);
            }
            return converted;

          case 'function':
          default:
            throw Error('Invalid script return type: ' + (typeof result));
        }  // switch
      }

      val = JSON.stringify({
        value: convertResultToJson(val)
      });
      console.info('returning from injected script: ' + val);
      //Fire mutation event with newValue set to the JSON of our return value
      e.initMutationEvent(
          "DOMAttrModified", true, false, null, null, val, null, 0);
    } catch (ex) {
      //Fire mutation event with prevValue set to EXCEPTION to indicate an error
      //in the script
      console.error('injected script failed: ' + ex.toString());
      e.initMutationEvent("DOMAttrModified", true, false, null, "EXCEPTION",
          null, null, 0);
    }
    var scriptTags = document.getElementsByTagName("script");
    var scriptTag = scriptTags[scriptTags.length - 1];
    scriptTag.dispatchEvent(e);
    document.documentElement.removeChild(scriptTag);
  }

  scriptTag.innerHTML =
      '(' + executeInjectedScript + ')(' + func + ', "' + argsString + '");';

  scriptTag.addEventListener('DOMAttrModified', callback, false);
  ChromeDriverContentScript.currentDocument.documentElement.
      appendChild(scriptTag);
}

function execute(script, passedArgs) {
  execute_(script, passedArgs, returnFromJavascriptInPage);
}

function parseReturnValueFromScript(result) {
  switch (typeof result) {
    case 'string':
    case 'number':
    case 'boolean':
      return result;

    case 'object':
      if (result == null) {
        return result;
      }

      // Received an array, parse each element.
      if (typeof result.length === 'number' &&
          !(result.propertyIsEnumerable('length'))) {
        var converted = [];
        for (var i = 0; i < result.length; i++) {
          converted.push(parseReturnValueFromScript(result[i]));
        }
        return converted;
      }

      // Script returned an element; return it's cached ID.
      if (typeof result.webdriverElementXPath === 'string') {
        //If we're returning an element, turn it into an actual element object
        var element = getElementsByXPath(result.webdriverElementXPath)[0];
        return {'ELEMENT': addElementToInternalArray(element).toString()};
      }

      // We were given a plain-old JSON object. Parse each property.
      var convertedObj = {};
      for (var prop in result) {
        convertedObj[prop] = parseReturnValueFromScript(result[prop]);
      }
      return convertedObj;

    // The script we inject to the page should never give us a result of type
    // 'function' or 'undefined', so we do not need to check for those, but
    // just go ahead and return null for completeness.
    case 'function':
    case 'undefined':
    default:
      return null;
  }
}

/**
 * Callback from execute
 */
function returnFromJavascriptInPage(e) {
  if (e.prevValue == "EXCEPTION") {
    ChromeDriverContentScript.port.postMessage({sequenceNumber: ChromeDriverContentScript.currentSequenceNumber,
        response: {response: "execute", value: {statusCode: 17,
        value: {message: "Tried to execute bad javascript."}}}});
    return;
  }
  console.log("Got result");
  console.log("Result was: " + e.newValue);
  var result = JSON.parse(e.newValue).value;
  var value = parseReturnValueFromScript(result);
  console.log("Return value: " + JSON.stringify(value));
  ChromeDriverContentScript.port.postMessage({sequenceNumber: ChromeDriverContentScript.currentSequenceNumber, response: {response: "execute", value: {statusCode: 0, value: value}}});
}

function getFrameNameFromIndex(index) {
  var scriptTag = ChromeDriverContentScript.currentDocument.createElement('script');
  scriptTag.innerText = 'var e = document.createEvent("MutationEvent");' +
                        'try {' +
                          'var val = window.frames[' + index + '].name;' +
                          'e.initMutationEvent("DOMAttrModified", true, false, null, null, val, null, 0);' +
                        '} catch (exn) {' +
                          //Fire mutation event with prevValue set to EXCEPTION to indicate an error in the script
                          'e.initMutationEvent("DOMAttrModified", true, false, null, "EXCEPTION", null, null, 0);' +
                        '}' +
                        'document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1].dispatchEvent(e);' +
                        'document.getElementsByTagName("html")[0].removeChild(document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1]);';
  scriptTag.addEventListener('DOMAttrModified', returnFromGetFrameNameFromIndexJavascriptInPage, false);
  try {
    if (ChromeDriverContentScript.currentDocument.getElementsByTagName("frameset").length > 0) {
      ChromeDriverContentScript.currentDocument.getElementsByTagName("frameset")[0].appendChild(scriptTag);
    } else {
      ChromeDriverContentScript.currentDocument.getElementsByTagName("html")[0].appendChild(scriptTag);
    }
  } catch (e) {
    ChromeDriverContentScript.port.postMessage({sequenceNumber: ChromeDriverContentScript.currentSequenceNumber,
        response: {response: "getFrameNameFromIndex", value: {statusCode: 8,
        message: "Page seemed not to be a frameset.  Couldn't find frame"}}});
  }
}

function returnFromGetFrameNameFromIndexJavascriptInPage(e) {
  if (e.prevValue == "EXCEPTION") {
    ChromeDriverContentScript.port.postMessage({sequenceNumber: ChromeDriverContentScript.currentSequenceNumber,
        response: {response: "getFrameNameFromIndex", value: {statusCode: 8,
        value: {message: "No such frame"}}}});
  } else {
    ChromeDriverContentScript.port.postMessage({sequenceNumber: ChromeDriverContentScript.currentSequenceNumber,
        response: {response: "getFrameNameFromIndex", value: {statusCode: "no-op",
        name: e.newValue}}});
  }
}

/**
 * Inject an embed tag so the native code can grab the HWND
 */
function injectEmbed() {
  ChromeDriverContentScript.injectedEmbedElement = ChromeDriverContentScript.currentDocument.createElement('embed');
  ChromeDriverContentScript.injectedEmbedElement.setAttribute("type", "application/x-chromedriver-reporter");
  ChromeDriverContentScript.injectedEmbedElement.setAttribute("style", "width: 0; height: 0;");
  ChromeDriverContentScript.currentDocument.getElementsByTagName("html")[0].appendChild(ChromeDriverContentScript.injectedEmbedElement);
  //Give the embed time to render.  Hope that the followup doesn't count embeds or anything
  setTimeout(removeInjectedEmbed, 100);
}

function removeInjectedEmbed() {
  if (ChromeDriverContentScript.injectedEmbedElement != null) {
    ChromeDriverContentScript.currentDocument.getElementsByTagName("html")[0].removeChild(ChromeDriverContentScript.injectedEmbedElement);
    ChromeDriverContentScript.injectedEmbedElement = null;
  }
}

/**
 * Guesses whether we have an HTML document or a text file
 */
function guessPageType() {
  var source = ChromeDriverContentScript.currentDocument.getElementsByTagName("html")[0].outerHTML;
  var textSourceBegins = '<html><body><pre style="word-wrap: break-word; white-space: pre-wrap;">';
  var textSourceEnds = '</pre></body></html>';
  
  if (source.substr(0, textSourceBegins.length) == textSourceBegins && 
      source.substr(0 - textSourceEnds.length) == textSourceEnds) {
    return "text";
  } else {
    return "html";
  }
}

/**
 * Gets an array of elements which match the passed xpath string
 */
function getElementsByXPath(xpath) {
  var elements = [];
  var foundElements = ChromeDriverContentScript.currentDocument.evaluate(xpath, ChromeDriverContentScript.currentDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  var this_element = foundElements.iterateNext();
  while (this_element) {
    elements.push(this_element);
    this_element = foundElements.iterateNext();
  }
  return elements;
}

/**
 * Gets canonical xpath of the passed element, e.g. /HTML/BODY/P[1]
 */
function getXPathOfElement(element) {
  var path = "";
  for (; element && element.nodeType == 1; element = element.parentNode) {
    index = getElementIndexForXPath(element);
    path = "/" + element.tagName + "[" + index + "]" + path;
  }
  return path;	
}

/**
 * Returns n for the nth element of type element.tagName in the page
 */
function getElementIndexForXPath(element) {
  var index = 1;
  for (var sibling = element.previousSibling; sibling ; sibling = sibling.previousSibling) {
    if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
      index++;
    }
  }
  return index;
}

/**
 * Gets an array of link elements whose displayed text is linkText
 */
function getElementsByLinkText(parent, linkText) {
  var links = parent.getElementsByTagName("a");
  var matchingLinks = [];
  for (var i = 0; i < links.length; i++) {
    if (Utils.getText(links[i]) == linkText) {
      matchingLinks.push(links[i]);
    }
  }
  return matchingLinks;
}

/**
 * Gets an array of link elements whose displayed text includes linkText
 */
function getElementsByPartialLinkText(parent, partialLinkText) {
  var links = parent.getElementsByTagName("a");
  var matchingLinks = [];
  for (var i = 0; i < links.length; i++) {
    if (Utils.getText(links[i]).indexOf(partialLinkText) > -1) {
      matchingLinks.push(links[i]);
    }
  }
  return matchingLinks;
}

/**
 * Throws exception if element is not displayed
 * @return nothing if element is displayed
 * @throws ElementNotVisibleException object ready to be sent if element is not displayed
 */
function checkElementIsDisplayed(element) {
  if (element.tagName.toLowerCase() == "title") {
    //Always visible
    return;
  }
  if (!Utils.isDisplayed(element)) {
    throw {statusCode: 11, value: {message: "Element was not visible"}};
  }
}

/**
 * Throws exception if element is disabled
 * @return nothing if element is enabled
 * @throws UnsupoprtedOperationException object ready to be sent if element is disabled
 */
function checkElementNotDisabled(element) {
  if (element.disabled) {
    throw {statusCode: 12, value: {message: "Cannot operate on disabled element"}};
  }
}

/**
 * Checks whether element is selected/checked
 * @return true if element is {selectable and selected, checkable and checked},
 *         false otherwise
 */
function findWhetherElementIsSelected(element) {
  var selected = false;
  try {
    var tagName = element.tagName.toLowerCase();
    if (tagName == "option") {
      selected = element.selected;
    } else if (tagName == "input") {
      var type = element.getAttribute("type").toLowerCase();
      if (type == "checkbox" || type == "radio") {
        selected = element.checked;
      }
    } else {
      selected = element.getAttribute("selected");
    }
  } catch (e) {
    selected = false;
  }
  return selected;
}

/**
 * Gets the coordinates of the top-left corner of the element on the browser window
 * (NOT the displayed portion, the WHOLE page)
 * Heavily influenced by com.google.gwt.dom.client.DOMImplSafari,
 * which is released under Apache 2
 * It's not actually correct...
 * @return array: [x, y]
 */
function getElementCoords(elem) {
  var left = 0;
  var top = 0;
  if (frameElement) {
    left += frameElement.offsetLeft;
    top += frameElement.offsetTop;
  }
  try {
    if (elem.getBoundingClientRect) {
      var rect = elem.getBoundingClientRect();
      left += rect.left + ChromeDriverContentScript.currentDocument.body.scrollLeft;
      top += rect.top + ChromeDriverContentScript.currentDocument.body.scrollTop;
      return [left, top];
    }
  } catch(e) {
    var left = 0;
    var top = 0;
    if (frameElement) {
      left += frameElement.offsetLeft;
      top += frameElement.offsetTop;
    }
  }
  
  //The below is ugly and NOT ACTUALLY RIGHT
  
  // Unattached elements and elements (or their ancestors) with style
  // 'display: none' have no offset{Top,Left}.
  if (elem.offsetTop == null || elem.offsetLeft == null) {
    return [left, top];
  }

  var doc = elem.ownerDocument;
  var curr = elem.parentNode;
  if (curr) {
    // This intentionally excludes body which has a null offsetParent.
    while (curr.offsetParent) {
      top -= curr.scrollTop;
      left -= curr.scrollLeft;

      // In RTL mode, offsetLeft is relative to the left edge of the
      // scrollable area when scrolled all the way to the right, so we need
      // to add back that difference.
      if (getStyle(curr, 'direction') == 'rtl') {
        left += (curr.scrollWidth - curr.clientWidth);
      }

      curr = curr.parentNode;
    }
  }

  while (elem) {
    top += elem.offsetTop;
    left += elem.offsetLeft;

    if (getStyle(elem, 'position') == 'fixed') {
      top += doc.body.scrollTop;
      left += doc.body.scrollLeft;
      return [left, top];
    }


    // Webkit bug: a top-level absolutely positioned element includes the
    // body's offset position already.
    var parent = elem.offsetParent;
    if (parent && (parent.tagName == 'BODY') &&
        (getStyle(elem, 'position') == 'absolute')) {
      break;
    }

    elem = parent;
  }
  return [left, top];
}

/**
 * Gets the maximum offsetHeight and offsetWidth of an element or those of its sub-elements
 * In place because element.offset{Height,Width} returns incorrectly in WebKit (see bug 28810)
 * @param element element to get max dimensions of
 * @param width optional greatest width seen so far (omit when calling)
 * @param height optional greatest height seen so far (omit when calling)
 * @return an object of form: {type: "DIMENSION", width: maxOffsetWidth, height: maxOffsetHeight}
 */
function getOffsetSizeFromSubElements(element, maxWidth, maxHeight) {
  if (element.getBoundingClientRect) {
    var rect = element.getBoundingClientRect();
    return {type: "DIMENSION", width: rect.width, height: rect.height};
  }
  //The below isn't correct, but is a hack with a decent probability of being correct, if the element has no BoundingClientRect
  //TODO(danielwh): Fix this up a bit
  maxWidth = (maxWidth === undefined || element.offsetWidth > maxWidth) ? element.offsetWidth : maxWidth;
  maxHeight = (maxHeight === undefined || element.offsetHeight > maxHeight) ? element.offsetHeight : maxHeight;
  for (var child in element.children) {
    var childSize = getOffsetSizeFromSubElements(element.children[child], maxWidth, maxHeight);
    maxWidth = (childSize.width > maxWidth) ? childSize.width : maxWidth;
    maxHeight = (childSize.height > maxHeight) ? childSize.height : maxHeight;
  }
  return {type: "DIMENSION", width: maxWidth, height: maxHeight};
}

/**
 * Converts rgb(x, y, z) colours to #RRGGBB colours
 * @param rgb string of form either rgb(x, y, z) or rgba(x, y, z, a) with x, y, z, a numbers
 * @return string of form #RRGGBB where RR, GG, BB are two-digit lower-case hex values
 */
function rgbToRRGGBB(rgb) {
  var r, g, b;
  var values = rgb.split(",");
  if (values.length == 3 && values[0].length > 4 && values[0].substr(0, 4) == "rgb(") {
    r = decimalToHex(values[0].substr(4));
    g = decimalToHex(values[1]);
    b = decimalToHex(values[2].substr(0, values[2].length - 1));
    if (r == null || g == null || b == null) {
      return null;
    }
    return "#" + r + g + b;
  } else if (rgb == "rgba(0, 0, 0, 0)") {
    return "transparent";
  } else {
    return rgb;
  }
}

/**
 * Convert a number from decimal to a hex string of at least two digits
 * @return null if value was not an int, two digit string representation
 *        (with leading zero if needed) of value in base 16 otherwise
 */
function decimalToHex(value) {
  value = parseInt(value).toString(16);
  if (value == null) {
    return null;
  }
  if (value.length == 1) {
    value = '0' + '' + value;
  }
  return value;
}
