/**
 * All functions which take elements assume that they are not null,
 * and are present as passed on the DOM.
 */

ChromeDriverContentScript = {};

ChromeDriverContentScript.internalElementArray = [];
ChromeDriverContentScript.port = null;
ChromeDriverContentScript.injectedScriptElement = null;
ChromeDriverContentScript.injectedEmbedElement = null;
//Record this for async calls (execute), so returner knows what to return
//(Also so that we can not re-start commands we have already started executing)
ChromeDriverContentScript.currentSequenceNumber = -1;

if (document.location != "about:blank") {
  //If loading windows using window.open, the port is opened
  //while we are on about:blank (which always reports window.name as ''),
  //and we use port-per-tab semantics, so don't open the port if
  //we're on about:blank
  ChromeDriverContentScript.port = chrome.extension.connect(window.name);
  ChromeDriverContentScript.port.onMessage.addListener(parsePortMessage);
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
  
  console.log("Received request: " + JSON.stringify(message));
  //wait indicates whether this is a potentially page-changing change (see background.js's sendResponseByXHR)
  var response = {response: message.request.request, value: null, wait: true};
  if (typeof(message.request.elementId) != "undefined" && message.request.elementId != null) {
    //If it seems an elementId has been passed, try to resolve that to an element
    try {
      var element = internalGetElement(message.request.elementId);
    } catch(e) {
      response.value = e;
      ChromeDriverContentScript.port.postMessage({response: response, sequenceNumber: message.sequenceNumber});
      return;
    }
  }
  switch (message.request.request) {
  case "addCookie":
    response.value = setCookie(message.request.cookie);
    response.wait = false;
    break;
  case "clearElement":
    response.value = clearElement(element);
    break;
  case "clickElement":
    response.value = clickElement(element, message.request.elementId);
    break;
  case "nonNativeClickElement":
    //TODO(danielwh): Focus/blur events for non-native clicking
    element.scrollIntoView(true);
    Utils.fireMouseEventOn(element, "mousedown");
    Utils.fireMouseEventOn(element, "mouseup");
    Utils.fireMouseEventOn(element, "click");
    if (element.click) {
      element.click();
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
  case "execute":
    execute(message.request.script, message.request.args);
    //Sends port message back to background page from its own callback
    break;
  case "getCookies":
    response.value = getCookies();
    response.wait = false;
    break;
  case "getElement":
    response.value = getElement(false, message.request.by);
    response.wait = false;
    break;
  case "getElements":
    response.value = getElement(true, message.request.by);
    response.wait = false;
    break;
  case "getElementAttribute":
    response.value = getElementAttribute(element, message.request.attribute);
    response.wait = false;
    break;
  case "getElementValueOfCssProperty":
    response.value = {statusCode: 0, value: getStyle(element, message.request.css)};
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
    response.value = {statusCode: 0, value: document.title};
    response.wait = false;
    break;
  case "getCurrentUrl":
    response.value = {statusCode: 0, value: document.location.href};
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
    document.location.reload(true);
    response.value = {statusCode: 0};
    break;
  case "sendElementKeys":
    response.value = sendElementKeys(element, message.request.keys, message.request.elementId);
    break;
  case "sendElementNonNativeKeys":
    response.value = sendElementNonNativeKeys(element, message.request.keys);
    break;
  case "setElementSelected":
    response.value = selectElement(element);
    break;
  case "submitElement":
    response.value = submitElement(element);
    break;
  case "toggleElement":
    response.value = toggleElement(element);
    break;
  default:
    response.value = {statusCode: 9, value: {message: message.request.request + " is unsupported"}};
    break;
  }
  if (response.value != null) {
    ChromeDriverContentScript.port.postMessage({response: response, sequenceNumber: message.sequenceNumber})
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
  var fullpath = document.location.pathname;
  fullpath = fullpath.split('/');
  fullpath.pop(); //Get rid of the file
  for (var segment in fullpath) {
    var path = '';
    for (var i = 0; i < segment; ++i) {
      path += fullpath[segment] + '/';
    }
    //Delete cookie with trailing /
    document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + path;
    //Delete cookie without trailing /
    document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + path.substring(0, path.length - 1);
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
    cookies.push({name: cookie[0], value: cookie[1], secure: false});
  }
  return {statusCode: 0, value: cookies};
}

/**
 * Gets all cookies accessible from the current page as an array of
 * key=value strings
 */
function getAllCookiesAsStrings() {
  var cookieStrings = document.cookie.split('; ');
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
  var currLocation = document.location;
  var currDomain = currLocation.host;
  if (currLocation.port != 80) { currDomain += ":" + currLocation.port; }
  if (cookie.domain != null && cookie.domain != undefined &&
      currDomain.indexOf(cookie.domain) == -1) {
      // Not quite right, but close enough. (See r783)
    return {statusCode: 2, value: {
            message: "You may only set cookies for the current domain"}};
  } else if (guessPageType() != "html") {
    return {statusCode: 2, value: {
            message: "You may only set cookies on html documents"}};
  } else {
    document.cookie = cookie.name + '=' + escape(cookie.value) +
        ((cookie.expiry == null || cookie.expiry == undefined) ?
            '' : ';expires=' + (new Date(cookie.expiry.time)).toGMTString()) +
        ((cookie.path == null || cookie.path == undefined) ?
            '' : ';path=' + cookie.path);
    return {statusCode: 0};
  }
}

/**
 * Get an element, or a set of elements, by some lookup
 * Called by both findElement and findElements
 * @param plural true if want array of all elements, false if singular element
 * @param parsed array showing how to look up, e.g. ["id", "cheese"] or
 *               [{"id": 0, using: "id", value: "cheese"}]
 */
function getElement(plural, parsed) {
  var root = "./"; //root always ends with /, so // lookups should only start with one additional /
  var lookupBy = "";
  var lookupValue = "";
  var parent = null;
  if (parsed[0].id != null) {
    try {
      parent = internalGetElement(parsed[0].id);
    } catch (e) {
      return e;
    }
    //Looking for children
    root = getXPathOfElement(parent) + "/";
    lookupBy = parsed[0].using;
    lookupValue = parsed[0].value;
  } else {
    lookupBy = parsed[0];
    lookupValue = parsed[1];
    parent = document;
  }

  var elements = [];
  var attribute = '';
  switch (lookupBy) {
  case "class name":
    elements = getElementsByXPath(root +
        "/*[contains(concat(' ',normalize-space(@class),' '),' " +
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
    elements = getElementsByXPath(root + "/" + lookupValue);
    break;
  case "xpath":
    //Because root trails with a /, if the xpath starts with a /,
    //we need to strip it out, or we'll get unwanted duplication
    if (lookupValue[0] == '/') {
      lookupValue = lookupValue.substring(1, lookupValue.length + 1);
    }
    elements = getElementsByXPath(root + lookupValue);
    break;
  }
  if (attribute != '') {
    elements = getElementsByXPath(root + "/*[@" + attribute + "='" + lookupValue + "']");
  }
  if (elements == null || elements.length == 0) {
    if (plural) {
      //Fine, no elements matched
      return {statusCode: 0, value: []};
    } else {
      //Problem - we were expecting an element
      return {statusCode: 7, value: {
          message: "Unable to locate element with " + lookupBy + " " + lookupValue}};
    }
  } else {
    var elementsToReturnArray = [];
    if (plural) {
      //Add all found elements to the page's elements, and push each to the array to return
      var from = ChromeDriverContentScript.internalElementArray.length;
      ChromeDriverContentScript.internalElementArray = ChromeDriverContentScript.internalElementArray.concat(elements);
      for (var i = from; i < ChromeDriverContentScript.internalElementArray.length; i++) {
        elementsToReturnArray.push('element/' + i);
      }
    } else {
      if (!elements[0]) {
        return {statusCode: 7, value: {
          message: "Unable to locate element with " + lookupBy + " " + lookupValue}};
      }
      //Add the first found elements to the page's elements, and push it to the array to return
      ChromeDriverContentScript.internalElementArray.push(elements[0]);
      elementsToReturnArray.push('element/' + (ChromeDriverContentScript.internalElementArray.length - 1));
    }
    return {statusCode: 0, value: elementsToReturnArray};
  }
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
  var coords = getElementCoords(element);
  return {statusCode: "no-op", elementId: elementId, x: coords[0] - document.body.scrollLeft, y: coords[1] - document.body.scrollTop};
}

/**
 * Clears the passed element
 */
function clearElement(element) {
  var oldValue = element.value;
  element.value = '';
  if (oldValue != '') {
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
    return {statusCode: 0, value: document.getElementsByTagName("html")[0].outerHTML};
  } else if (guessPageType() == "text") {
    return {statusCode: 0, value: document.getElementsByTagName("pre")[0].innerHTML};
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
    Utils.fireHtmlEvent(element, "change");
  }
  return {statusCode: 0};
}

/**
 * Focus the element so that native code can type to it
 */
function sendElementKeys(element, keys, elementId) {
  try {
    checkElementIsDisplayed(element)
  } catch (e) {
    return e;
  }
  element.focus();
  return {statusCode: "no-op", keys: keys, elementId: elementId};
}

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
      element.submit();
      return {statusCode: 0};
    }
    element = element.parentElement;
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
        parent = parent.parentElement;
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
  if (changed) {
    Utils.fireHtmlEvent(element, "change");
  }
  return {statusCode: 0, value: newValue};
}

/**
 * Gets the CSS property asked for
 * @param style CSS property to get
 */
function getStyle(element, style) {
  var value = document.defaultView.getComputedStyle(element, null).getPropertyValue(style);
  return rgbToRRGGBB(value);
}

/**
 * Execute arbitrary javascript in the page.
 * Returns by callback to returnFromJavascriptInPage.
 * Yes, this is *horribly* hacky.
 * We can't share objects between content script and page, so have to wrap up arguments as JSON
 * @param script script to execute as a string
 * @param passedArgs array of arguments to pass to the script
 */
function execute(script, passedArgs) {
  var func = "function(){" + script + "}";
  var args = [];
  //Parse the arguments into actual values (which are wrapped up in JSON)
  for (var i = 0; i < passedArgs.length; ++i) {
    switch (passedArgs[i].type) {
    case "ELEMENT":
      //Wrap up as a special object with the element's canonical xpath, which the page can work out
      var element_id = passedArgs[i].value.replace("element/", "");
      var element = null;
      try {
        element = internalGetElement(element_id);
      } catch (e) {
        ChromeDriverContentScript.port.postMessage({response: "execute", value:
            {statusCode: 10,
             message: "Tried use obsolete element as argument when executing javascript."}});
        return;
      }
      args.push({webdriverElementXPath: getXPathOfElement(element)});
      break;
    //Intentional falling through because Javascript will parse things properly
    case "STRING":
    case "BOOLEAN":
    case "NUMBER":
      args.push(passedArgs[i].value);
      break;
    }
  }
  //Add a script tag to the page, containing the script we wish to execute
  var scriptTag = document.createElement('script');
  var argsString = JSON.stringify(args).replace(/"/g, "\\\"");
  scriptTag.innerText = 'var e = document.createEvent("MutationEvent");' +
                        //Dump our arguments in an array
                        'var args = JSON.parse("' + argsString + '");' +
                        'var error = false;' +
                        'var element = null;' +
                        'for (var i = 0; i < args.length; ++i) {' +
                          'if (args[i] && typeof(args[i]) == "object" && args[i].webdriverElementXPath) {' +
                            //If this is an element (because it has the proper xpath), turn it into an actual element object
                            'args[i] = document.evaluate(args[i].webdriverElementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;' +
                          '}' +
                        '}' +
                        'try {' +
                        'var val = eval(' + func + ').apply(window, args);' +
                        '} catch (exn) {' +
                          //Fire mutation event with prevValue set to EXCEPTION to indicate an error in the script
                          'e.initMutationEvent("DOMAttrModified", true, false, null, "EXCEPTION", null, null, 0);' +
                          'document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1].dispatchEvent(e);' +
                           'error = true;' +
                        '}' +
                        'if (!error) {' +
                          'if (typeof(val) == "string") { val = JSON.stringify(val); }' +
                          'else if (typeof(val) == "undefined") { val = null; }' +
                          'else if (typeof(val) == "object" && val && val.nodeType == 1) {' +
                            //If we're returning an element, turn it into a special xpath-containing object
                            'var path = "";' +
                            'for (; val && val.nodeType == 1; val = val.parentNode) {' +
                              'var index = 1;' +
                              'for (var sibling = val.previousSibling; sibling; sibling = sibling.previousSibling) {' +
                                'if (sibling.nodeType == 1 && sibling.tagName && sibling.tagName == val.tagName) {' +
                                  'index++;' +
                                '}' +
                              '}' +
                              'path = "/" + val.tagName + "[" + index + "]" + path;' +
                            '}' +
                            'val = JSON.stringify({webdriverElementXPath: path});' +
                          '}' +
                          //Fire mutation event with newValue set to the JSON of our return value
                          'e.initMutationEvent("DOMAttrModified", true, false, null, null, "{value: " + val + "}", null, 0);' +
                          'document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1].dispatchEvent(e);' +
                        '}';
  scriptTag.addEventListener('DOMAttrModified', returnFromJavascriptInPage, false);
  ChromeDriverContentScript.injectedScriptElement = scriptTag;
  document.getElementsByTagName("body")[0].appendChild(ChromeDriverContentScript.injectedScriptElement);
}

/**
 * Callback from execute
 */
function returnFromJavascriptInPage(e) {
  if (ChromeDriverContentScript.injectedScriptElement == null) {
    console.log("Somehow the returnFromJavascriptInPage hander was reached.");
    return;
  }
  if (e.prevValue == "EXCEPTION") {
    ChromeDriverContentScript.port.postMessage({sequenceNumber: ChromeDriverContentScript.currentSequenceNumber,
        response: {response: "execute", value: {statusCode: 17,
        message: "Tried to execute bad javascript."}}});
    return;
  }
  var result = JSON.parse(e.newValue).value;
  var value = {"type":"NULL"};
  if (result && typeof(result) == "object" && result.webdriverElementXPath) {
    //If we're returning an element, turn it into an actual element object
    ChromeDriverContentScript.internalElementArray.push(getElementsByXPath(result.webdriverElementXPath)[0]);
    value = {value:"element/" + (ChromeDriverContentScript.internalElementArray.length - 1), type:"ELEMENT"};
  } else if (result != null) {
    switch (typeof(result)) {
    //Intentional falling through because we treat all "VALUE"s the same
    case "string":
    case "number":
    case "boolean":
      value = {value: result, type: "VALUE"};
      break;
    }
  }
  removeInjectedScript();
  ChromeDriverContentScript.port.postMessage({sequenceNumber: ChromeDriverContentScript.currentSequenceNumber, response: {response: "execute", value: {statusCode: 0, value: value}}});
}

/**
 * Removes the script tag injected in the page by execute
 */
function removeInjectedScript() {
  if (ChromeDriverContentScript.injectedScriptElement != null) {
    document.getElementsByTagName("body")[0].removeChild(ChromeDriverContentScript.injectedScriptElement);
    ChromeDriverContentScript.injectedScriptElement = null;
  }
}

/**
 * Inject an embed tag so the native code can grab the HWND
 */
function injectEmbed() {
  ChromeDriverContentScript.injectedEmbedElement = document.createElement('embed');
  ChromeDriverContentScript.injectedEmbedElement.setAttribute("type", "application/x-chromedriver-reporter");
  document.getElementsByTagName("body")[0].appendChild(ChromeDriverContentScript.injectedEmbedElement);
  //Give the embed time to render.  Hope that the followup doesn't count embeds or anything
  setTimeout(removeInjectedEmbed, 100);
}

function removeInjectedEmbed() {
  if (ChromeDriverContentScript.injectedEmbedElement != null) {
    document.getElementsByTagName("body")[0].removeChild(ChromeDriverContentScript.injectedEmbedElement);
    ChromeDriverContentScript.injectedEmbedElement = null;
  }
}
