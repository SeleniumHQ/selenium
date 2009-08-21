console.log("Content script reached");

/**
 * All functions which take elements assume that they are not null,
 * and are present as passed on the DOM.
 */

ChromeDriverContentScript = {};

ChromeDriverContentScript.internalElementArray = [];
ChromeDriverContentScript.port = null;
ChromeDriverContentScript.injectedScriptElement = null;
ChromeDriverContentScript.injectedEmbedElement = null;
ChromeDriverContentScript.currentSequenceNumber = -1; //For async calls (execute), so returner knows what to return

if (document.location != "about:blank") {
  //If loading windows using window.open, the port is opened
  //while we are on about:blank (which reports window.name as ''),
  //and we use port-per-tab semantics, so don't open the port if
  //we're on about:blank
  console.log("Connecting port");
  ChromeDriverContentScript.port = chrome.extension.connect(window.name);
  ChromeDriverContentScript.port.onMessage.addListener(parsePortMessage);
}

/**
 * Parse messages coming in on the port.
 * Sends up relevant response back down the port
 * @param message JSON message of format:
 *                {request: "some command",
 *                 value: some JSON object param
 *                 [, followup: message']}
 *                 where message' is a message to parse after this one
 */
function parsePortMessage(message) {
  if (message == null || message.request == null) {
    console.log(message);
    console.log("Received bad request");
    return;
  }
  if (message.sequenceNumber <= ChromeDriverContentScript.currentSequenceNumber) {
    console.log("Already processing this sequence number");
    return;
  }
  
  ChromeDriverContentScript.currentSequenceNumber = message.sequenceNumber;
  
  console.log("Received request for: " + message.request.request);
  console.log(JSON.stringify(message));
  var response = {response: message.request.request, value: null, wait: true};
  if (typeof(message.request.elementId) != "undefined" && message.request.elementId != null) {
    try {
      var element = internalGetElement(message.request.elementId);
    } catch(e) {
      console.log("Tried to get element internally, but it wasn't there.  Returning with exception.");
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
    //TODO(danielwh): Focus/blur events
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
  /*case "drag element":
    response.value = dragElement(element, {x: message.value.value[1], y: message.value.value[2]});
    break;*/
  case "execute":
    execute(message.request.script, message.request.args);
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
    response.value = {statusCode: 0, value: {type: "DIMENSION",
                                               height: element.offsetHeight,
                                               width: element.offsetWidth}};
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
    console.log("SENT RESPONSE TO " + message.sequenceNumber);
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
 * Deletes the cookie with the passed name, accessible from the current page
 * @param cookieName name of the cookie to delete
 */
function deleteCookie(cookieName) {
  document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  return {statusCode: 0};
}

/**
 * Get all cookies accessible from the current page as an array of
 * org.openqa.selenium.internal.ReturnedCookie
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
    console.log("tag name");
    elements = getElementsByXPath(root + "/" + lookupValue);
    break;
  case "xpath":
    //Because root trails with a /, if the xpath starts with a /,
    //we need to strip it out, or we'll get unwanted duplication
    if (lookupValue[0] == '/') {
      lookupValue = lookupValue.substring(1, lookupValue.length + 1);
    }
    elements = getElementsByXPath(root + lookupValue);
    console.log("xpath: " + root + lookupValue);
    console.log(elements);
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
 * TODO(danielwh): Not currently working
 */
function dragElement(element, to) {
  var fromCoords = getElementCoords(element);
  var src = {x: fromCoords[0], y: fromCoords[1]};
  var dest = {x: to.x + src.x, y: to.y + src.y};
  console.log(src);
  console.log(dest);
  return {statusCode: "no-op", from: src, to: dest};
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
    console.log(e);
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
 * Execute arbitrary javascript in the page.   Returns by callback to returnFromJavascriptInPage.
 * Yes, this is *horribly* hacky.
 * @param command array with 0th argument as a string of the javascript to execute and
 *                optional 1st argument as an array of wrapped up arguments to pass to the script
 */
function execute(script, passedArgs) {
  console.log(script);
  console.log(JSON.stringify(passedArgs) + " (" + passedArgs.length + ")");
  var func = "function(){" + script + "}";
  var args = [];
  for (var i = 0; i < passedArgs.length; ++i) {
    switch (passedArgs[i].type) {
    case "ELEMENT":
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
      console.log("PUSHING ARG " + passedArgs[i].value);
      args.push(passedArgs[i].value);
      break;
    }
  }
  var scriptTag = document.createElement('script');
  var argsString = JSON.stringify(args).replace(/"/g, "\\\"");
  scriptTag.innerText = 'var e = document.createEvent("MutationEvent");' +
                        'var args = JSON.parse("' + argsString + '");' +
                        'var error = false;' +
                        'var element = null;' +
                        'for (var i = 0; i < args.length; ++i) {' +
                          'if (args[i] && typeof(args[i]) == "object" && args[i].webdriverElementXPath) {' +
                            'args[i] = document.evaluate(args[i].webdriverElementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;' +
                          '}' +
                        '}' +
                        'try {' +
                        'var val = eval(' + func + ').apply(window, args);' +
                        '} catch (exn) {' +
                          'e.initMutationEvent("DOMAttrModified", true, false, null, "EXCEPTION", null, null, 0);' +
                          'document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1].dispatchEvent(e);' +
                           'error = true;' +
                        '}' +
                        'if (!error) {' +
                          'if (typeof(val) == "string") { val = JSON.stringify(val); }' +
                          //Slightly hacky, but will work
                          'else if (typeof(val) == "undefined") { val = null; }' +
                          'else if (typeof(val) == "object" && val && val.nodeType == 1) {' +
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
                          'e.initMutationEvent("DOMAttrModified", true, false, null, null, "{value: " + val + "}", null, 0);' +
                          'document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1].dispatchEvent(e);' +
                        '}';
  scriptTag.addEventListener('DOMAttrModified', returnFromJavascriptInPage, false);
  ChromeDriverContentScript.injectedScriptElement = scriptTag;
  document.getElementsByTagName("body")[0].appendChild(ChromeDriverContentScript.injectedScriptElement);
}

/**
 * Callback from execute(command)
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
  console.log("Finished execing");
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
  console.log("Injecting embed");
  ChromeDriverContentScript.injectedEmbedElement = document.createElement('embed');
  ChromeDriverContentScript.injectedEmbedElement.setAttribute("type", "application/x-chromedriver-reporter");
  document.getElementsByTagName("body")[0].appendChild(ChromeDriverContentScript.injectedEmbedElement);
  //Give the embed time to render.  Hope that the followup doesn't count embeds or anything
  //Wait for it to load before removing
  setTimeout(removeInjectedEmbed, 100);
}

function removeInjectedEmbed() {
  if (ChromeDriverContentScript.injectedEmbedElement != null) {
    document.getElementsByTagName("body")[0].removeChild(ChromeDriverContentScript.injectedEmbedElement);
    ChromeDriverContentScript.injectedEmbedElement = null;
  }
}
