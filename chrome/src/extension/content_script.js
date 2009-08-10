ChromeDriverContentScript = {};

ChromeDriverContentScript.internalElementArray = [];
ChromeDriverContentScript.port = null;
ChromeDriverContentScript.injectedScriptElement = null;

if (document.location != "about:blank") {
  //TODO(danielwh): Report bug in chrome that content script is fired on about:blank for new javascript windows
  //If loading windows using window.open, the port is opened
  //while we are on about:blank (which reports window.name as ''),
  //and we use port-per-tab semantics, so don't open the port if
  //we're on about:blank
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
    console.log("Received bad request");
    return;
  }
  console.log("Received request for: " + message.request);
  var response = {response: message.request, value: null};
  if (message.value && message.value.elementId) {
    try {
      var element = internalGetElement(message.value.elementId);
    } catch(e) {
      response.value = e;
      ChromeDriverContentScript.port.postMessage(response);
      return;
    }
  }
  switch (message.request) {
  case "add cookie":
    response.value = setCookie(message.value[0]);
    break;
  case "clear element":
    response.value = clearElement(element);
    break;
  case "click element":
    response.value = clickElement(element);
    break;
  case "delete all cookies":
    response.value = deleteAllCookies();
    break;
  case "delete cookie":
    response.value = deleteCookie(message.value.name);
    break;
  case "execute":
    execute(message.value);
    break;
  case "get cookies":
    response.value = getCookies();
    break;
  case "get element":
    response.value = getElement(false, message.value);
    break;
  case "get element attribute":
    response.value = getElementAttribute(element, message.value.attribute);
    break;
  case "get element css":
    response.value = {statusCode: 200, value: getStyle(element, message.value.css)};
    break;
  case "get element location":
    var coords = getElementCoords(element);
    response.value = {statusCode: 200, value: {class: "java.awt.Point", x: coords[0], y: coords[1]}};
    break;
  case "get element size":
    response.value = {statusCode: 200, value: {class: "java.awt.Dimension",
                                               height: element.offsetHeight,
                                               width: element.offsetWidth}};
    break;
  case "get element tag name":
    response.value = {statusCode: 200, value: element.tagName.toLowerCase()};
    break;
  case "get element text":
    response.value = {statusCode: 200, value: Utils.getText(element)};
    break;
  case "get element value":
    response.value = {statusCode: 200, value: element.value};
    break;
  case "get elements":
    response.value = getElement(true, message.value);
    break;
  case "get source":
    response.value = getSource();
    break;
  case "get title":
    response.value = {statusCode: 200, value: document.title};
    break;
  case "get url":
    response.value = {statusCode: 200, value: document.location.href};
    break;
  case "go back":
    history.back();
    response.value = {statusCode: 204};
    break;
  case "go forward":
    history.forward();
    response.value = {statusCode: 204};
    break;
  case "inject embed":
    injectEmbed(message.value.sessionId, message.value.uuid)
    break;
  case "is element displayed":
    response.value = {statusCode: 200, value: isElementDisplayed(element)};
    break;
  case "is element enabled":
    response.value = {statusCode: 200, value: !element.disabled};
    break;
  case "is element selected":
    response.value = {statusCode: 200, value: findWhetherElementIsSelected(element)};
    break;
  case "refresh":
    document.location.reload(true);
    response.value = {statusCode: 204};
    break;
  case "select element":
    response.value = selectElement(element);
    break;
  case "send element keys":
    response.value = sendElementKeys(element, message.value.value);
    break;
  case "submit element":
    response.value = submitElement(element);
    break;
  case "toggle element":
    response.value = toggleElement(element);
    break;
  default:
    response.value = {statusCode: 404, value: {message: message.request + " is unsupported", class: "java.lang.UnsupportedOperationException"}};
    break;
  }
  if (response.value != null) {
    ChromeDriverContentScript.port.postMessage(response);
  }
  if (message.followup) {
    setTimeout(parsePortMessage(message.followup), 100);
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
  return {statusCode: 204};
}

/**
 * Deletes the cookie with the passed name, accessible from the current page
 * @param cookieName name of the cookie to delete
 */
function deleteCookie(cookieName) {
  document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  return {statusCode: 204};
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
    cookies.push({name: cookie[0], value: cookie[1], secure: false,
                  class: "org.openqa.selenium.internal.ReturnedCookie"});
  }
  return {statusCode: 200, value: cookies};
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
    return {statusCode: 404, value: {
            message: "You may only set cookies for the current domain",
            class: "org.openqa.selenium.WebDriverException"}};
  } else if (guessPageType() != "html") {
    return {statusCode: 404, value: {
            message: "You may only set cookies on html documents",
            class: "org.openqa.selenium.WebDriverException"}};
  } else {
    document.cookie = cookie.name + '=' + escape(cookie.value) +
        ((cookie.expiry == null || cookie.expiry == undefined) ?
            '' : ';expires=' + (new Date(cookie.expiry.time)).toGMTString()) +
        ((cookie.path == null || cookie.path == undefined) ?
            '' : ';path=' + cookie.path);
    return {statusCode: 204};
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
  //TODO(danielwh): Should probably check for nulls here
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
      return {statusCode: 200, value: []};
    } else {
      //Problem - we were expecting an element
      return {statusCode: 404, value: {
          message: "Unable to locate element with " + lookupBy + " " + lookupValue,
          class: "org.openqa.selenium.NoSuchElementException"}};
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
        return {statusCode: 404, value: {
          message: "Unable to locate element with " + lookupBy + " " + lookupValue,
          class: "org.openqa.selenium.NoSuchElementException"}};
      }
      ChromeDriverContentScript.internalElementArray.push(elements[0]);
      elementsToReturnArray.push('element/' + (ChromeDriverContentScript.internalElementArray.length - 1));
    }
    return {statusCode: 200, value: elementsToReturnArray};
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
      throw {statusCode: 404, value: {message: "Element is obsolete",
             class: "org.openqa.selenium.StaleElementReferenceException"}};
    }
    return element;
  } else {
    throw {statusCode: 404, value: {message: "Element is obsolete",
           class: "org.openqa.selenium.StaleElementReferenceException"}};
  }
}

function clickElement(element) {
  try {
    checkElementIsDisplayed(element)
  } catch (e) {
    return e;
  }
  element.scrollIntoView(true);
  var coords = getElementCoords(element);
  return {statusCode: "no-op", x: coords[0] - document.body.scrollLeft, y: coords[1] - document.body.scrollTop};
}

function clearElement(element) {
  var oldValue = element.value;
  element.value = '';
  if (oldValue != '') {
    Utils.fireHtmlEvent(element, "change");
  }
  return {statusCode: 204};
}

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
  return {statusCode: 200, value: value};
}

/**
 * Gets the source of the current document
 */
function getSource() {
  if (guessPageType() == "html") {
    return {statusCode: 200, value: document.getElementsByTagName("html")[0].outerHTML};
  } else if (guessPageType() == "text") {
    return {statusCode: 200, value: document.getElementsByTagName("pre")[0].innerHTML};
  }
}

function isElementDisplayed(element) {
  try {
    checkElementIsDisplayed(element)
  } catch (e) {
    return false;
  }
  return true;
}

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
        throw {statusCode: 404, value: {message: "Cannot select an input." + type,
                                        class: "java.lang.UnsupportedOperationException"}};
      }
    } else {
      throw {statusCode: 404, value: {message: "Cannot select a " + tagName,
                                      class: "java.lang.UnsupportedOperationException"}};
    }
  } catch(e) {
    console.log(e);
    return e;
  }
  if (!oldValue) {
    Utils.fireHtmlEvent(element, "change");
  }
  return {statusCode: 204};
}

function sendElementKeys(element, value) {
  try {
    checkElementIsDisplayed(element)
  } catch (e) {
    return e;
  }
  element.focus();
  return {statusCode: "no-op", value: value};
}

function submitElement(element) {
  while (element != null) {
    if (element.tagName.toLowerCase() == "form") {
      element.submit();
      return {statusCode: 204};
    }
    element = element.parentElement;
  }
  return {statusCode: 404, value: {message: "Cannot submit an element not in a form",
                                   class: "java.lang.UnsupportedOperationException"}};
}

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
        throw {statusCode: 404, value: {message: "option tag had no select tag parent",
                                        class: "org.openqa.selenium.WebDriverException"}};
      }
      oldValue = element.selected;
      if (oldValue && !parent.multiple) {
        throw {statusCode: 404, value: {message: "Cannot unselect a single element select",
                                        class: "java.lang.UnsupportedOperationException"}};
      }
      newValue = element.selected = !oldValue;
    } else if (tagName == "input") {
      var type = element.getAttribute("type").toLowerCase();
      if (type == "checkbox") {
        oldValue = element.checked;
        newValue = element.checked = !oldValue;
        changed = true;
      } else {
        throw {statusCode: 404, value: {message: "Cannot toggle an input." + type,
                                        class: "java.lang.UnsupportedOperationException"}};
      }
    } else {
      throw {statusCode: 404, value: {message: "Cannot toggle a " + tagName,
                                      class: "java.lang.UnsupportedOperationException"}};
    }
  } catch (e) {
    return e;
  }
  if (changed) {
    Utils.fireHtmlEvent(element, "change");
  }
  return {statusCode: 200, value: newValue};
}

function getStyle(element, style) {
  var value = document.defaultView.getComputedStyle(element, null).getPropertyValue(style);
  return rgbToRRGGBB(value);
}

function execute(command) {
  var func = "function(){" + command[0] + "}";
  var args = [];
  if (command.length > 1) {
    for (var i = 0; i < command[1].length; ++i) {
      switch (command[1][i].type) {
      case "ELEMENT":
        var element_id = command[1][i].value.replace("element/", "");
        var element = null;
        try {
          element = internalGetElement(element_id);
        } catch (e) {
          //TODO(danielwh): FAIL
          return;
        }
        args.push({webdriverElementXPath: getXPathOfElement(element)});
        break;
      //Intentional falling through because Javascript will parse things properly
      case "STRING":
      case "BOOLEAN":
      case "NUMBER":
        args.push(command[1][i].value);
        break;
      }
    }
  }
  var scriptTag = document.createElement('script');
  var argsString = JSON.stringify(args).replace(/"/g, "\\\"");
  //TODO(danielwh): See if more escaping is needed
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
  //setTimeout(scriptHasDied, 800);
}

function returnFromJavascriptInPage(e) {
  if (ChromeDriverContentScript.injectedScriptElement == null) {
    console.log("Somehow the returnFromJavascriptInPage hander was reached.");
    return;
  }
  if (e.prevValue == "EXCEPTION") {
    ChromeDriverContentScript.port.postMessage({response: "execute", value: {statusCode: 404,
        message: "Tried to execute bad javascript.",
        class: "org.openqa.selenium.WebDriverException"}});
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
  ChromeDriverContentScript.port.postMessage({response: "execute", value: {statusCode: 200, value: value}});
}

function removeInjectedScript() {
  document.getElementsByTagName("body")[0].removeChild(ChromeDriverContentScript.injectedScriptElement);
  ChromeDriverContentScript.injectedScriptElement = null;
}

function injectEmbed(sessionId, uuid) {
  console.log("Injecting embed");
  var embed = document.createElement('embed');
  embed.setAttribute("type", "application/x-webdriver-reporter");
  embed.setAttribute("session_id", sessionId);
  embed.setAttribute("id", uuid);
  document.getElementsByTagName("body")[0].appendChild(embed);
  //Give the embed time to render.  Hope that the followup doesn't count embeds or anything
  setTimeout('document.getElementsByTagName("body")[0].removeChild(document.getElementById("' + uuid + '"))', 100);
  console.log("Embed removed");
}
