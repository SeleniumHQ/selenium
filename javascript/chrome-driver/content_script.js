/**
 * All functions which take elements assume that they are not null,
 * and are present as passed on the DOM.
 */

ChromeDriverContentScript = {};

ChromeDriverContentScript.internalElementArray = [];
ChromeDriverContentScript.port = null;
// TODO(jleyba): Doesn't look like this is needed anymore.
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
  ChromeDriverContentScript.port.postMessage({response: {response: "newTabInformation",
      value: {statusCode: "no-op", frameCount: window.frames.length,
      portName: ChromeDriverContentScript.port.name, isDefaultContent: (window == window.top)}}, sequenceNumber: -1});
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

      var script = [
        'var element = arguments[0];',
        'function fire(type) {',
        '  console.log("Firing " + type);',
        '  var event = element.ownerDocument.createEvent("MouseEvents");',
        '  event.initMouseEvent(type, true, true,',
        'element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false,',
        'false, false, 0, element);',
        '  element.dispatchEvent(event);',
        '}',
        'fire("mousedown");',
        'fire("mouseup");',
        'fire("click");'
      ].join('');
      var args = [{'ELEMENT': addElementToInternalArray(element)}];

      execute(script, args);
      break;
    case "executeScript":
      execute(message.request.script, message.request.args);
      //Sends port message back to background page from its own callback
      break;
    case "executeAsyncScript":
      execute(message.request.script, message.request.args, message.asyncTimeout);
      //Sends port message back to background page from its own callback
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
    case "switchToFrame":
      switchToFrame(message.request.locator);
      response.value = null;
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
        (cookie.expiry ? 
            // Expiry is specified in seconds since January 1, 1970, UTC. We need it
            // in milliseconds to create our Date object.
            (';expires=' + (new Date(cookie.expiry * 1000)).toGMTString()) :
            '') +
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
    var xpath = lookupValue;
    try {
      elements = getElementsByXPath(xpath, parent);
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
  for (var element = 0; element < elements.length; ++element) {
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
    if (findWhetherElementIsSelected(element)) {
      value = "true";
    }
    break;
  case "checked":
    if (element.checked) {
      value = "true";
    }
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
  var pageType = guessPageType();
  if ("text" == pageType) {
    return {
      statusCode: 0,
      value: ChromeDriverContentScript.currentDocument.getElementsByTagName("pre")[0].innerHTML
    };
  }
  return {
    statusCode: 0,
    value: new XMLSerializer().serializeToString(ChromeDriverContentScript.currentDocument)
  };
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
    checkElementIsDisplayed(element);
    checkElementNotDisabled(element);
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
 * Yes, this is *horribly* hacky.
 * We can't share objects between content script and page, so have to wrap up arguments as JSON
 * @param {string} script The javascript snippet to execute in the current page.
 * @param {Array.<*>} passedArgs An array of JSON arguments to pass to the
 *     injected script. DOMElements should be specified as JSON objects of the
 *     form {ELEMENT: string}.
 * @param {number} asyncTimeout The amount of time, in milliseconds, to wait
 *     for an asynchronous script to finish execution before returning an
 *     error.
 * @param {function({statusCode:number, value:*})} callback Function to call
 *     when the script has completed.
 */
function execute_(script, passedArgs, asyncTimeout, callback) {
  console.log("executing " + script + ", args: " + JSON.stringify(passedArgs));
  try {
    var args = parseWrappedArguments(passedArgs);
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

  var scriptTag = ChromeDriverContentScript.currentDocument.createElement('script');
  scriptTag.setAttribute('type', 'application/javascript');
  scriptTag.setAttribute('src', chrome.extension.getURL('./evaluate.js'));
  console.log('created script with src: ', scriptTag.getAttribute('src'));

  var scriptLoadTimeout = window.setTimeout(function() {
    scriptTag.parentNode.removeChild(scriptTag);
    window.removeEventListener('webdriver-evaluate-ready', runScript, true);
    window.clearTimeout(scriptLoadTimeout);

    console.error('Timed out waiting for our script evaluator to load');
    callback({
      statusCode: 17,
      value: {
        message: 'Timed out waiting for script evaluator to load'
      }
    });
  }, 10 * 1000);

  function runScript() {
    scriptTag.parentNode.removeChild(scriptTag);
    window.removeEventListener('webdriver-evaluate-ready', runScript, true);
    window.clearTimeout(scriptLoadTimeout);

    console.info('Script evaluator attached and ready; injecting script');

    function handleResponse(e) {
      window.removeEventListener('webdriver-evaluate-response', handleResponse, true);
      console.log('Got response: ' + e.data);
      var response = parseReturnValueFromScript(JSON.parse(e.data));
      callback(response);
    }
    window.addEventListener('webdriver-evaluate-response', handleResponse, true);

    var data = JSON.stringify({
      'script': script,
      'args': args,
      'asyncTimeout': asyncTimeout
    });
    var e = document.createEvent('MessageEvent');
    e.initMessageEvent('webdriver-evaluate', /*bubbles=*/true,
        /*cancelable=*/false, data, /*origin=*/'', /*lastEventId=*/'',
        /*source=*/window, /*ports=*/null);
    window.dispatchEvent(e);
  }
  window.addEventListener('webdriver-evaluate-ready', runScript, true);

  console.info('Injecting script tag');
  ChromeDriverContentScript.currentDocument.documentElement.
      appendChild(scriptTag);
}

function execute(script, passedArgs, asyncTimeout) {
  var callback = function(response) {
    ChromeDriverContentScript.port.postMessage({
      sequenceNumber: ChromeDriverContentScript.currentSequenceNumber,
      response: {
        response: "execute",
        value: response
      }
    });
  };
  execute_(script, passedArgs,
           typeof asyncTimeout == 'undefined' ? -1 : asyncTimeout,
           callback);
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

function switchToFrame(id) {
  // We use the fact that Function.prototype.toString() will de-compile this to
  // its source code so we can inject it into the page in a SCRIPT tag. We have
  // to execute this within the context of the page since our content script
  // does not share a JavaScript context with the current page (but we do share
  // a DOM).
  var findFrame = function(id) {
    function getFrameIndex(element) {
      if (element.nodeType != 1 || !/^i?frame$/i.test(element.tagName)) {
        throw Error('Element is not a frame: ' + element +
                    '\n  nodeType == ' + element.nodeType +
                    '\n  tagName == ' + element.tagName);
      }

      for (var i = 0; i < window.frames.length; i++) {
        if (element.contentWindow == window.frames[i]) {
          console.info('Frame index is: ', i);
          return i;
        }
      }
      throw Error('Frame is not part of this window\'s DOM');
    }

    try {
      if (typeof id == 'number') {
        if (id > -1 && id < window.frames.length) {
          return id;
        }
        throw Error('Frame index is out of bounds: ' +
                    id + ' >= ' + window.frames.length);
      } else if (typeof id == 'string') {
        // We could have a frame name, or an element ID, so use an XPath
        // expression to find all of the (i)frames on the page. We cannot
        // iterate over window.frames since we need to check the frame name,
        // and if the frame is in a different domain, the check will fail.

        // Translate tag name from upper to lower. We only care about frames,
        // so only translate those characters...
        var toLower = 'translate(name(), "IFRAME", "iframe")';

        id = JSON.stringify(id);
        var xpath = [
          '//*[(', toLower, ' = "frame" or ', toLower, ' = "iframe")',
          // id was wrapped with JSON.stringify when this function was
          // compiled, so it will be properly quoted for us.
          ' and (@name=', id, ' or @id=', id, ')]'
        ].join('');
        console.info('Searching for frame element by XPath: ', xpath);
        var result = document.evaluate(xpath, document, null,
            XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (!result) {
          throw Error('Failed to find an element: ' + xpath);
        }
        return getFrameIndex(result);

      // The only other value frame identifier is a DOM element.
      // Technically, null signals window.top, but that should be handled
      // by the background page directly.
      } else if (typeof id == 'object' && id.nodeType) {
        return getFrameIndex(id);
      } else {
        throw Error('Unsupported frame locator: (' + (typeof id) + ') ' + id);
      }
    } catch (ex) {
      ex.status = 8;  // "No such frame" == 8
      throw ex;
    }
  };

  execute_('return (' + findFrame + ').apply(null, arguments);', [id], -1, function(response) {
    if (response.statusCode) {
      ChromeDriverContentScript.port.postMessage({
        sequenceNumber: ChromeDriverContentScript.currentSequenceNumber,
        response: {
          response: 'switchToFrame',
          value: response
        }
      });
      return;
    }

    // Found our frame - tell it to activate itself with the background page.
    // The sendFrameMessage function is defined in content_prescript.js which
    // is loaded at document_start.
    sendFrameMessage(response.value, {
      sequenceNumber: ChromeDriverContentScript.currentSequenceNumber,
      request: 'activatePort'
    });
  });
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
  var htmlElement = ChromeDriverContentScript.currentDocument.getElementsByTagName("html")[0];
  if (!htmlElement) {
    return "xml";
  }

  var source = htmlElement.outerHTML;
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
function getElementsByXPath(xpath, context) {
  context = context || ChromeDriverContentScript.currentDocument;
  var elements = [];
  var foundElements = ChromeDriverContentScript.currentDocument.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
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
