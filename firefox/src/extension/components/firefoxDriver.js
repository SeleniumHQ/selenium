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


function FirefoxDriver(server, enableNativeEvents, win) {
  this.server = server;
  this.enableNativeEvents = enableNativeEvents;
  this.window = win;

  this.currentX = 0;
  this.currentY = 0;
}


/**
 * Enumeration of supported speed values.
 * @enum {number}
 */
FirefoxDriver.Speed = {
  SLOW: 1,
  MEDIUM: 10,
  FAST: 100
};


FirefoxDriver.prototype.__defineGetter__("id", function() {
  if (!this.id_) {
    this.id_ = this.server.getNextId();
  }

  return this.id_;
});


FirefoxDriver.prototype.getCurrentWindowHandle = function(respond) {
  respond.value = this.id;
  respond.send();
};


FirefoxDriver.prototype.get = function(respond, parameters) {
  var url = parameters.url;
  // Check to see if the given url is the same as the current one, but
  // with a different anchor tag.
  var current = respond.session.getWindow().location;
  var ioService =
      Utils.getService("@mozilla.org/network/io-service;1", "nsIIOService");
  var currentUri = ioService.newURI(current, "", null);
  var futureUri = ioService.newURI(url, "", currentUri);

  var loadEventExpected = true;

  if (currentUri && futureUri &&
      currentUri.prePath == futureUri.prePath &&
      currentUri.filePath == futureUri.filePath) {
    // Looks like we're at the same url with a ref
    // Being clever and checking the ref was causing me headaches.
    // Brute force for now
    loadEventExpected = futureUri.path.indexOf("#") == -1;
  }

  if (loadEventExpected) {
    new WebLoadingListener(respond.session.getBrowser(), function() {
      // TODO: Rescue the URI and response code from the event
      var responseText = "";
      // Focus on the top window.
      respond.session.setWindow(respond.session.getBrowser().contentWindow);
      respond.value = responseText;
      respond.send();
    });
  }

  respond.session.getBrowser().loadURI(url);

  if (!loadEventExpected) {
    respond.send();
  }
};


FirefoxDriver.prototype.close = function(respond) {
  // Grab all the references we'll need. Once we call close all this might go away
  var wm = Utils.getService(
      "@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
  var appService = Utils.getService(
      "@mozilla.org/toolkit/app-startup;1", "nsIAppStartup");
  var forceQuit = Components.interfaces.nsIAppStartup.eForceQuit;

  // Here we go!
  try {
    var browser = respond.session.getBrowser();
    createSwitchFile("close:" + browser.id);
    browser.contentWindow.close();
  } catch(e) {
    dump(e);
  }

  // Send the response so the client doesn't get a connection refused socket
  // error.
  respond.send();

  // If we're on a Mac we might have closed all the windows but not quit, so
  // ensure that we do actually quit :)
  var allWindows = wm.getEnumerator("navigator:browser");
  if (!allWindows.hasMoreElements()) {
    appService.quit(forceQuit);
    return;  // The client should catch the fact that the socket suddenly closes
  }
};


FirefoxDriver.prototype.executeScript = function(respond, parameters) {
  var window = respond.session.getWindow();
  var doc = window.document;

  var runScript;

  // Pre 2.0.0.15
  if (window['alert'] && !window.wrappedJSObject) {
    runScript = function(scriptSrc) {
      return window.eval(scriptSrc);
    };
  } else {
    runScript = function(scriptSrc, args) {
      window = window.wrappedJSObject;
      var sandbox = new Components.utils.Sandbox(window);
      sandbox.window = window;
      sandbox.__webdriverParams = args;
      sandbox.document = window.document;
      sandbox.unsafeWindow = window;
      sandbox.__proto__ = window;

      return Components.utils.evalInSandbox(scriptSrc, sandbox);
    };
  }

  var converted = Utils.unwrapParameters(
      parameters.args, respond.session.getDocument());

  try {
    var scriptSrc = "var __webdriverFunc = function(){" + parameters.script
        + "};  __webdriverFunc.apply(window, __webdriverParams);";
    var result = runScript(scriptSrc, converted);
  } catch (e) {
    Utils.dumpn(JSON.stringify(e));
    throw new WebDriverError(ErrorCode.UNEXPECTED_JAVASCRIPT_ERROR, e);
  }

  respond.value = Utils.wrapResult(result, respond.session.getDocument());
  respond.send();
};


FirefoxDriver.prototype.getCurrentUrl = function(respond) {
  var url = respond.session.getWindow().location;
  if (!url) {
    url = respond.session.getBrowser().contentWindow.location;
  }
  respond.value = "" + url;
  respond.send();
};


FirefoxDriver.prototype.getTitle = function(respond) {
  respond.value = respond.session.getBrowser().contentTitle;
  respond.send();
};


FirefoxDriver.prototype.getPageSource = function(respond) {
  var source = respond.session.getDocument().
      getElementsByTagName("html")[0].innerHTML;

  respond.value = "<html>" + source + "</html>";
  respond.send();
};

var normalizeXPath = function(xpath, opt_contextNode) {
  if (opt_contextNode && xpath) {
    var parentXPath = Utils.getXPathOfElement(opt_contextNode);
    if (parentXPath && parentXPath.length > 0) {
      if (xpath[0] != '/' && xpath[0] != '(') {
        return parentXPath + "/" + xpath;
      } else {
        return parentXPath + xpath;
      }
    }
  }
  return xpath;
};


/**
 * Searches for the first element in {@code theDocument} matching the given
 * {@code xpath} expression.
 * @param {nsIDOMDocument} theDocument The document to search in.
 * @param {string} xpath The XPath expression to evaluate.
 * @param {nsIDOMNode} opt_contextNode The context node for the query; defaults
 *     to {@code theDocument}.
 * @return {nsIDOMNode} The first matching node.
 * @private
 */
FirefoxDriver.prototype.findElementByXPath_ = function(theDocument, xpath,
                                                       opt_contextNode) {
  var contextNode = theDocument;
  if (opt_contextNode) {
    contextNode = opt_contextNode;
    xpath = normalizeXPath(xpath, opt_contextNode);
  }
  return theDocument.evaluate(xpath, contextNode, null,
      Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE, null).
      singleNodeValue;
};


/**
 * Searches for elements matching the given {@code xpath} expression in the
 * specified document.
 * @param {nsIDOMDocument} theDocument The document to search in.
 * @param {string} xpath The XPath expression to evaluate.
 * @param {nsIDOMNode} opt_contextNode The context node for the query; defaults
 *     to {@code theDocument}.
 * @return {Array.<nsIDOMNode>} The matching nodes.
 * @private
 */
FirefoxDriver.prototype.findElementsByXPath_ = function(theDocument, xpath,
                                                        opt_contextNode) {
  var contextNode = theDocument;
  if (opt_contextNode) {
    contextNode = opt_contextNode;
    xpath = normalizeXPath(xpath, opt_contextNode);
  }
  var result = theDocument.evaluate(xpath, contextNode, null,
      Components.interfaces.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  var elements = [];
  var element = result.iterateNext();
  while (element) {
    elements.push(element);
    element = result.iterateNext();
  }
  return elements;
};


/**
 * An enumeration of the supported element locator methods.
 * @enum {string}
 */
FirefoxDriver.ElementLocator = {
  ID: 'id',
  NAME: 'name',
  CLASS_NAME: 'class name',
  CSS_SELECTOR: 'css selector',
  TAG_NAME: 'tag name',
  LINK_TEXT: 'link text',
  PARTIAL_LINK_TEXT: 'partial link text',
  XPATH: 'xpath'
};


/**
 * Finds an element on the current page. The response value will be the UUID of
 * the located element, or an error message if an element could not be found.
 * @param {Response} respond Object to send the command response with.
 * @param {FirefoxDriver.ElementLocator} method The locator method to use.
 * @param {string} selector What to search for; see {@code ElementLocator} for
 *     details on what the selector should be for each element.
 * @param {string} opt_parentElementId If defined, the search will be restricted
 *     to the corresponding element's subtree.
 * @param {number=} opt_startTime When this search operation started. Defaults
 *     to the current time.
 * @private
 */
FirefoxDriver.prototype.findElementInternal_ = function(respond, method,
                                                        selector,
                                                        opt_parentElementId,
                                                        opt_startTime) {
  var startTime = typeof opt_startTime == 'number' ? opt_startTime :
                                                     new Date().getTime();
  var theDocument = respond.session.getDocument();
  var rootNode = typeof opt_parentElementId == 'string' ?
      Utils.getElementAt(opt_parentElementId, theDocument) : theDocument;

  var element;
  switch (method) {
    case FirefoxDriver.ElementLocator.ID:
      element = rootNode === theDocument ?
          theDocument.getElementById(selector) :
          this.findElementByXPath_(
              theDocument, './/*[@id="' + selector + '"]', rootNode);
      break;

    case FirefoxDriver.ElementLocator.NAME:
      element = rootNode.getElementsByName ?
          rootNode.getElementsByName(selector)[0] :
          this.findElementByXPath_(
              theDocument, './/*[@name ="' + selector + '"]', rootNode);
      break;

    case FirefoxDriver.ElementLocator.CLASS_NAME:
      element = rootNode.getElementsByClassName ?
                rootNode.getElementsByClassName(selector)[0] :  // FF 3+
                this.findElementByXPath_(theDocument,           // FF 2
                    '//*[contains(concat(" ",normalize-space(@class)," ")," ' +
                    selector + ' ")]', rootNode);
      break;

    case FirefoxDriver.ElementLocator.CSS_SELECTOR:
      if (rootNode['querySelector']) {
        element = rootNode.querySelector(selector);
      } else {
        throw new WebDriverError(ErrorCode.UNKNOWN_COMMAND,
            "CSS Selectors not supported natively");
      }
      break;

    case FirefoxDriver.ElementLocator.TAG_NAME:
      element = rootNode.getElementsByTagName(selector)[0];
      break;

    case FirefoxDriver.ElementLocator.XPATH:
      element = this.findElementByXPath_(theDocument, selector, rootNode);
      break;

    case FirefoxDriver.ElementLocator.LINK_TEXT:
    case FirefoxDriver.ElementLocator.PARTIAL_LINK_TEXT:
      var allLinks = rootNode.getElementsByTagName('A');
      for (var i = 0; i < allLinks.length && !element; i++) {
        var text = Utils.getText(allLinks[i], true);
        if (FirefoxDriver.ElementLocator.PARTIAL_LINK_TEXT == method) {
          if (text.indexOf(selector) != -1) {
            element = allLinks[i];
          }
        } else if (text == selector) {
          element = allLinks[i];
        }
      }
      break;

    default:
      throw new WebDriverError(ErrorCode.UNKNOWN_COMMAND,
          'Unsupported element locator method: ' + method);
      return;
  }

  if (element) {
    var id = Utils.addToKnownElements(element, respond.session.getDocument());
    respond.value = {'ELEMENT': id};
    respond.send();
  } else {
    var wait = respond.session.getImplicitWait();
    if (wait == 0 || new Date().getTime() - startTime > wait) {
      respond.sendError(new WebDriverError(ErrorCode.NO_SUCH_ELEMENT,
          'Unable to locate element: ' + JSON.stringify({
              method: method,
              selector: selector
          })));
    } else {
      var self = this;
      var timer = Components.classes['@mozilla.org/timer;1'].
          createInstance(Components.interfaces.nsITimer);
      timer.initWithCallback({
        notify: function() {
          self.findElementInternal_(respond, method, selector,
              opt_parentElementId, startTime);
        }
      }, 10, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    }
  }
};


/**
 * Finds an element on the current page. The response value will be the UUID of
 * the located element, or an error message if an element could not be found.
 * @param {Response} respond Object to send the command response with.
 * @param {{using: string, value: string}} parameters A JSON object
 *     specifying the search parameters:
 *     - using: A method to search with, as defined in the
 *       {@code Firefox.ElementLocator} enum.
 *     - value: What to search for.
 */
FirefoxDriver.prototype.findElement = function(respond, parameters) {
  this.findElementInternal_(respond, parameters.using, parameters.value);
};


/**
 * Finds an element on the current page that is the child of a corresponding
 * search parameter. The response value will be the UUID of the located element,
 * or an error message if an element could not be found.
 * @param {Response} respond Object to send the command response with.
 * @param {{id: string, using: string, value: string}} parameters A JSON object
 *     specifying the search parameters:
 *     - id: UUID of the element to base the search from.
 *     - using: A method to search with, as defined in the
 *       {@code Firefox.ElementLocator} enum.
 *     - value: What to search for.
 */
FirefoxDriver.prototype.findChildElement = function(respond, parameters) {
  this.findElementInternal_(respond, parameters.using, parameters.value, parameters.id);
};


/**
 * Finds elements on the current page. The response value will an array of UUIDs
 * for the located elements.
 * @param {Response} respond Object to send the command response with.
 * @param {FirefoxDriver.ElementLocator} method The locator method to use.
 * @param {string} selector What to search for; see {@code ElementLocator} for
 *     details on what the selector should be for each element.
 * @param {string} opt_parentElementId If defined, the search will be restricted
 *     to the corresponding element's subtree.
 * @param {number=} opt_startTime When this search operation started. Defaults
 *     to the current time.
 * @private
 */
FirefoxDriver.prototype.findElementsInternal_ = function(respond, method,
                                                         selector,
                                                         opt_parentElementId,
                                                         opt_startTime) {
  var startTime = typeof opt_startTime == 'number' ? opt_startTime :
                                                     new Date().getTime();
  var theDocument = respond.session.getDocument();
  var rootNode = typeof opt_parentElementId == 'string' ?
      Utils.getElementAt(opt_parentElementId, theDocument) : theDocument;

  var elements;
  switch (method) {
    case FirefoxDriver.ElementLocator.ID:
      selector = './/*[@id="' + selector + '"]';
      // Fall-through
    case FirefoxDriver.ElementLocator.XPATH:
      elements = this.findElementsByXPath_(
          theDocument, selector, rootNode);
      break;

    case FirefoxDriver.ElementLocator.NAME:
      elements = rootNode.getElementsByName ?
          rootNode.getElementsByName(selector) :
          this.findElementsByXPath_(
              theDocument, './/*[@name="' + selector + '"]', rootNode);
      break;

    case FirefoxDriver.ElementLocator.CSS_SELECTOR:
      if (rootNode['querySelector']) {
        elements = rootNode.querySelectorAll(selector);
      } else {
        throw new WebDriverError(ErrorCode.UNKNOWN_COMMAND,
            "CSS Selectors not supported natively");
      }
      break;

    case FirefoxDriver.ElementLocator.TAG_NAME:
      elements = rootNode.getElementsByTagName(selector);
      break;

    case FirefoxDriver.ElementLocator.CLASS_NAME:
      elements = rootNode.getElementsByClassName ?
      rootNode.getElementsByClassName(selector) :  // FF 3+
      this.findElementsByXPath_(theDocument,       // FF 2
          './/*[contains(concat(" ",normalize-space(@class)," ")," ' +
          selector + ' ")]', rootNode);
      break;

    case FirefoxDriver.ElementLocator.LINK_TEXT:
    case FirefoxDriver.ElementLocator.PARTIAL_LINK_TEXT:
      elements =  rootNode.getElementsByTagName('A');
      elements = Array.filter(elements, function(element) {
        var text = Utils.getText(element, true);
        if (FirefoxDriver.ElementLocator.PARTIAL_LINK_TEXT == method) {
          return text.indexOf(selector) != -1;
        } else {
          return text == selector;
        }
      });
      break;

    default:
      throw new WebDriverError(ErrorCode.UNKNOWN_COMMAND,
          'Unsupported element locator method: ' + method);
      return;
  }

  var elementIds = [];
  for (var j = 0; j < elements.length; j++) {
    var element = elements[j];
    var elementId = Utils.addToKnownElements(
        element, respond.session.getDocument());
    elementIds.push({'ELEMENT': elementId});
  }

  var wait = respond.session.getImplicitWait();
  if (wait && !elementIds.length && new Date().getTime() - startTime <= wait) {
    var self = this;
    var timer = Components.classes['@mozilla.org/timer;1'].
        createInstance(Components.interfaces.nsITimer);
    timer.initWithCallback({
      notify: function() {
        self.findElementsInternal_(respond, method, selector,
            opt_parentElementId, startTime);
      }
    }, 10, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
  } else {
    respond.value = elementIds;
    respond.send();
  }
};


/**
 * Searches for multiple elements on the page. The response value will be an
 * array of UUIDs for the located elements.
 * @param {Response} respond Object to send the command response with.
 * @param {{using: string, value: string}} parameters A JSON object
 *     specifying the search parameters:
 *     - using: A method to search with, as defined in the
 *       {@code Firefox.ElementLocator} enum.
 *     - value: What to search for.
 */
FirefoxDriver.prototype.findElements = function(respond, parameters) {
  this.findElementsInternal_(respond, parameters.using, parameters.value);
};


/**
 * Searches for multiple elements on the page that are children of the
 * corresponding search parameter. The response value will be an array of UUIDs
 * for the located elements.
 * @param {{id: string, using: string, value: string}} parameters A JSON object
 *     specifying the search parameters:
 *     - id: UUID of the element to base the search from.
 *     - using: A method to search with, as defined in the
 *       {@code Firefox.ElementLocator} enum.
 *     - value: What to search for.
 */
FirefoxDriver.prototype.findChildElements = function(respond, parameters) {
  this.findElementsInternal_(respond, parameters.using, parameters.value, parameters.id);
};


FirefoxDriver.prototype.switchToFrame = function(respond, parameters) {
  var browser = respond.session.getBrowser();
  if (parameters.id == null) {
    respond.session.setWindow(respond.session.getBrowser().contentWindow);
  } else {
    var frameDoc = Utils.findDocumentInFrame(browser, parameters.id);
    if (frameDoc) {
      respond.session.setWindow(frameDoc.defaultView);
    } else {
      throw new WebDriverError(ErrorCode.NO_SUCH_FRAME,
          "Cannot find frame with id: " + parameters.id);
    }
  }
  respond.send();
};


FirefoxDriver.prototype.getActiveElement = function(respond) {
  var element = Utils.getActiveElement(respond.session.getDocument());
  var id = Utils.addToKnownElements(element, respond.session.getDocument());

  respond.value = {'ELEMENT':id};
  respond.send();
};


FirefoxDriver.prototype.goBack = function(respond) {
  var browser = respond.session.getBrowser();

  if (browser.canGoBack) {
    browser.goBack();
  }

  respond.send();
};


FirefoxDriver.prototype.goForward = function(respond) {
  var browser = respond.session.getBrowser();

  if (browser.canGoForward) {
    browser.goForward();
  }

  respond.send();
};


FirefoxDriver.prototype.refresh = function(respond) {
  var browser = respond.session.getBrowser();
  browser.contentWindow.location.reload(true);
  // Wait for the reload to finish before sending the response.
  new WebLoadingListener(respond.session.getBrowser(), function() {
    // Reset to the top window.
    respond.session.setWindow(browser.contentWindow);
    respond.send();
  });
};


FirefoxDriver.prototype.addCookie = function(respond, parameters) {
  var cookie = parameters.cookie;

  if (cookie.expiry) {
    cookie.expiry = cookie.expiry.time ? new Date(cookie.expiry.time) :
                                         new Date(cookie.expiry);
  } else {
    var date = new Date();
    date.setYear(2030);
    cookie.expiry = date;
  }

  cookie.expiry = cookie.expiry.getTime() / 1000; // Stored in seconds

  if (!cookie.domain) {
    var location = respond.session.getBrowser().contentWindow.location;
    cookie.domain = location.hostname;
  } else {
    var currLocation = respond.session.getBrowser().contentWindow.location;
    var currDomain = currLocation.host;
    if (currDomain.indexOf(cookie.domain) == -1) {  // Not quite right, but close enough
      throw new WebDriverError(ErrorCode.INVALID_COOKIE_DOMAIN,
          "You may only set cookies for the current domain");
    }
  }

  // The cookie's domain may include a port. Which is bad. Remove it
  // We'll catch ip6 addresses by mistake. Since no-one uses those
  // this will be okay for now.
  if (cookie.domain.match(/:\d+$/)) {
    cookie.domain = cookie.domain.replace(/:\d+$/, "");
  }

  var document = respond.session.getDocument();
  if (!document || !document.contentType.match(/html/i)) {
    throw new WebDriverError(ErrorCode.UNABLE_TO_SET_COOKIE,
        "You may only set cookies on html documents");
  }

  var cookieManager =
      Utils.getService("@mozilla.org/cookiemanager;1", "nsICookieManager2");

  // The signature for "add" is different in firefox 3 and 2. We should sniff
  // the browser version and call the right version of the method, but for now
  // we'll use brute-force.
  try {
    cookieManager.add(cookie.domain, cookie.path, cookie.name, cookie.value,
        cookie.secure, false, cookie.expiry);
  } catch(e) {
    cookieManager.add(cookie.domain, cookie.path, cookie.name, cookie.value,
        cookie.secure, false, false, cookie.expiry);
  }

  respond.send();
};

function getVisibleCookies(location) {
  var results = [];

  var currentPath = location.pathname;
  if (!currentPath) currentPath = "/";
  var isForCurrentPath = function(aPath) {
    return currentPath.indexOf(aPath) != -1;
  };
  var cm = Utils.getService("@mozilla.org/cookiemanager;1", "nsICookieManager");
  var e = cm.enumerator;
  while (e.hasMoreElements()) {
    var cookie = e.getNext().QueryInterface(Components.interfaces["nsICookie"]);

    // Take the hostname and progressively shorten it
    var hostname = location.hostname;
    do {
      if ((cookie.host == "." + hostname || cookie.host == hostname)
          && isForCurrentPath(cookie.path)) {
        results.push(cookie);
        break;
      }
      hostname = hostname.replace(/^.*?\./, "");
    } while (hostname.indexOf(".") != -1);
  }

  return results;
};

FirefoxDriver.prototype.getCookies = function(respond) {
  var toReturn = [];
  var cookies = getVisibleCookies(respond.session.getBrowser().
      contentWindow.location);
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    toReturn.push({
      'name': cookie.name,
      'value': cookie.value,
      'path': cookie.path,
      'domain': cookie.host,
      'secure': cookie.isSecure
    });
  }

  respond.value = toReturn;
  respond.send();
};


// This is damn ugly, but it turns out that just deleting a cookie from the document
// doesn't always do The Right Thing
FirefoxDriver.prototype.deleteCookie = function(respond, parameters) {
  var toDelete = parameters.name;
  var cm = Utils.getService("@mozilla.org/cookiemanager;1", "nsICookieManager");

  var cookies = getVisibleCookies(respond.session.getBrowser().
      contentWindow.location);
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    if (cookie.name == toDelete) {
      cm.remove(cookie.host, cookie.name, cookie.path, false);
    }
  }

  respond.send();
};


FirefoxDriver.prototype.deleteAllCookies = function(respond) {
  var cm = Utils.getService("@mozilla.org/cookiemanager;1", "nsICookieManager");
  var cookies = getVisibleCookies(respond.session.getBrowser().
      contentWindow.location);

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    cm.remove(cookie.host, cookie.name, cookie.path, false);
  }

  respond.send();
};


FirefoxDriver.prototype.setSpeed = function(respond, parameters) {
  if (!(parameters.speed in FirefoxDriver.Speed)) {
    var validSpeeds = [];
    for (var prop in FirefoxDriver.Speed) {
      validSpeeds.push(prop);
    }
    throw new WebDriverError(ErrorCode.UNHANDLED_ERROR,
        'Speed value expected to be one of ' + JSON.stringify(validSpeeds) +
        ', but was "' + parameters.speed + '"');
  }
  respond.session.setInputSpeed(FirefoxDriver.Speed[parameters.speed]);
  respond.send();
};


FirefoxDriver.prototype.getSpeed = function(respond) {
  var speed = respond.session.getInputSpeed();
  for (var prop in FirefoxDriver.Speed) {
    if (FirefoxDriver.Speed[prop] == speed) {
      respond.value = prop;
    }
  }
  respond.send();
};


FirefoxDriver.prototype.implicitlyWait = function(respond, parameters) {
  respond.session.setImplicitWait(parameters.ms);
  respond.send();
};


FirefoxDriver.prototype.saveScreenshot = function(respond, pngFile) {
  var window = respond.session.getBrowser().contentWindow;
  try {
    var canvas = Screenshooter.grab(window);
    try {
      Screenshooter.save(canvas, pngFile);
    } catch(e) {
      throw new WebDriverError(ErrorCode.UNHANDLED_ERROR,
          'Could not save screenshot to ' + pngFile + ' - ' + e);
    }
  } catch(e) {
    throw new WebDriverError(ErrorCode.UNHANDLED_ERROR,
        'Could not take screenshot of current page - ' + e);
  }
  respond.send();
};


FirefoxDriver.prototype.screenshot = function(respond) {
  var window = respond.session.getBrowser().contentWindow;
  try {
    var canvas = Screenshooter.grab(window);
    respond.value = Screenshooter.toBase64(canvas);
  } catch (e) {
    throw new WebDriverError(ErrorCode.UNHANDLED_ERROR,
        'Could not take screenshot of current page - ' + e);
  }
  respond.send();
};

FirefoxDriver.prototype.dismissAlert = function(respond, parameters) {
  var alertText = parameters.text;
  // TODO(simon): Is there a type for alerts?
  var wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
  var allWindows = wm.getEnumerator("");
  while (allWindows.hasMoreElements()) {
    var alert = allWindows.getNext();
    var doc = alert.document;
    if (doc && doc.documentURI == "chrome://global/content/commonDialog.xul") {
      var dialog = doc.getElementsByTagName("dialog")[0];
      dialog.getButton("accept").click();
      break;
    }
  }
  respond.send();
};
