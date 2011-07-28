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

  // Default to a two second timeout.
  this.alertTimeout = 2000;

  this.currentX = 0;
  this.currentY = 0;

  // We do this here to work around an issue in the import function:
  // https://groups.google.com/group/mozilla.dev.apps.firefox/browse_thread/thread/e178d41afa2ccc87?hl=en&pli=1#
  var atoms = {};
  Components.utils.import('resource://fxdriver/modules/atoms.js', atoms);

  var utils = {};
  Components.utils.import('resource://fxdriver/modules/utils.js', utils);

  goog.userAgent.GECKO = true;

  FirefoxDriver.listenerScript = Utils.loadUrl("resource://fxdriver/evaluate.js");

  this.jsTimer = new Timer();
  this.mouse = Utils.newInstance("@googlecode.com/webdriver/syntheticmouse;1", "wdIMouse");
}


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
      var responseText = "";
      // Focus on the top window.
      respond.session.setWindow(respond.session.getBrowser().contentWindow);
      respond.value = responseText;
      respond.send();
    });
  }

  respond.session.getBrowser().loadURI(url);

  if (!loadEventExpected) {
    Logger.dumpn("No load event expected");
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

  var numOpenWindows = 0;
  var allWindows = wm.getEnumerator("navigator:browser");
  while (allWindows.hasMoreElements()) {
    numOpenWindows += 1;
    allWindows.getNext();
  }

  // If we're on a Mac we may close all the windows but not quit, so
  // ensure that we do actually quit. For Windows, if we don't quit,
  // Firefox will crash. So, whatever the case may be, if that's the last
  // window - just quit Firefox.
  if (numOpenWindows == 1) {
    respond.send();

    // Use an nsITimer to give the response time to go out.
    var event = function(timer) {
        // Create a switch file so the native events library will
        // let all events through in case of a close.
        createSwitchFile("close:<ALL>");
        appService.quit(forceQuit);
    };

    this.nstimer = new Timer();
    this.nstimer.setTimeout(event, 500);
    
    return;  // The client should catch the fact that the socket suddenly closes
  }

  // Here we go!
  try {
    var browser = respond.session.getBrowser();
    createSwitchFile("close:" + browser.id);
    browser.contentWindow.close();
  } catch(e) {
    Logger.dump(e);
  }

  // Send the response so the client doesn't get a connection refused socket
  // error.
  respond.send();
};


function injectAndExecuteScript(respond, parameters, isAsync, timer) {
  var doc = respond.session.getDocument();

  var script = parameters['script'];
  var converted = Utils.unwrapParameters(parameters['args'], doc);

  if (doc.designMode && "on" == doc.designMode.toLowerCase()) {
    if (isAsync) {
      respond.sendError(
          'Document designMode is enabled; advanced operations, ' +
          'like asynchronous script execution, are not supported. ' +
          'For more information, see ' +
          'https://developer.mozilla.org/en/rich-text_editing_in_mozilla#' +
          'Internet_Explorer_Differences');
      return;
    }

    // See https://developer.mozilla.org/en/rich-text_editing_in_mozilla#Internet_Explorer_Differences
    Logger.dumpn("Window in design mode, falling back to sandbox: " + doc.designMode);
    var window = respond.session.getWindow();
    window = window.wrappedJSObject;
    var sandbox = new Components.utils.Sandbox(window);
    sandbox.window = window;
    sandbox.document = doc.wrappedJSObject ? doc.wrappedJSObject : doc;
    sandbox.navigator = window.navigator;
    sandbox.__webdriverParams = converted;

    try {
      var scriptSrc = "with(window) { var __webdriverFunc = function(){" + parameters.script +
          "};  __webdriverFunc.apply(null, __webdriverParams); }";
      var res = Components.utils.evalInSandbox(scriptSrc, sandbox);
      respond.value = Utils.wrapResult(res, doc);
      respond.send();
      return;
    } catch (e) {
      Logger.dumpn(JSON.stringify(e));
      throw new WebDriverError(ErrorCode.UNEXPECTED_JAVASCRIPT_ERROR, e);
    }
  }

  var docBodyLoadTimeOut = function() {
    respond.sendError(new WebDriverError(ErrorCode.UNEXPECTED_JAVASCRIPT_ERROR,
        "waiting for doc.body failed"));
  };

  var scriptLoadTimeOut = function() {
    respond.sendError(new WebDriverError(ErrorCode.UNEXPECTED_JAVASCRIPT_ERROR,
        "waiting for evaluate.js load failed"));
  };

  var checkScriptLoaded = function() {
    return !!doc.getUserData('webdriver-evaluate-attached');
  };

  var runScript = function() {
    doc.setUserData('webdriver-evaluate-args', converted, null);
    doc.setUserData('webdriver-evaluate-async', isAsync, null);
    doc.setUserData('webdriver-evaluate-script', script, null);
    doc.setUserData('webdriver-evaluate-timeout',
        respond.session.getScriptTimeout(), null);

    var handler = function(event) {
        doc.removeEventListener('webdriver-evaluate-response', handler, true);

        var unwrapped = webdriver.firefox.utils.unwrap(doc);
        var result = unwrapped.getUserData('webdriver-evaluate-result');
        respond.value = Utils.wrapResult(result, doc);
        respond.status = doc.getUserData('webdriver-evaluate-code');

        doc.setUserData('webdriver-evaluate-result', null, null);
        doc.setUserData('webdriver-evaluate-code', null, null);

        respond.send();
    };
    doc.addEventListener('webdriver-evaluate-response', handler, true);

    var event = doc.createEvent('Events');
    event.initEvent('webdriver-evaluate', true, false);
    doc.dispatchEvent(event);
  };

  // Attach the listener to the DOM
  var addListener = function() {
    if (!doc.getUserData('webdriver-evaluate-attached')) {
      var element = doc.createElement("script");
      element.setAttribute("type", "text/javascript");
      element.innerHTML = FirefoxDriver.listenerScript;
      doc.body.appendChild(element);
      element.parentNode.removeChild(element);
    }
    timer.runWhenTrue(checkScriptLoaded, runScript, 10000, scriptLoadTimeOut);
  };

  var checkDocBodyLoaded = function() {
    return !!doc.body;
  };

  timer.runWhenTrue(checkDocBodyLoaded, addListener, 10000, docBodyLoadTimeOut);
};


FirefoxDriver.prototype.executeScript = function(respond, parameters) {
  injectAndExecuteScript(respond, parameters, false, this.jsTimer);
};


FirefoxDriver.prototype.executeAsyncScript = function(respond, parameters) {
  injectAndExecuteScript(respond, parameters, true, this.jsTimer);
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
  var win = respond.session.getWindow();

  // Don't pollute the response with annotations we place on the DOM.
  var docElement = win.document.documentElement;
  docElement.removeAttribute('webdriver');
  docElement.removeAttribute('command');
  docElement.removeAttribute('response');

  var XMLSerializer = win.XMLSerializer;
  respond.value = new XMLSerializer().serializeToString(win.document);
  respond.send();

  // The command & response attributes we removed are on-shots, we only
  // need to add back the webdriver attribute.
  docElement.setAttribute('webdriver', 'true');
};


/**
 * Map of strategy keys used by the wire protocol to those used by the
 * automation atoms.
 *
 *  TODO: this really needs to be handled by bot.locators.
 *
 * @type {!Object.<string, string>}
 * @const
 * @private
 */
FirefoxDriver.WIRE_TO_ATOMS_STRATEGY_ = {
  'id': 'id',
  'name': 'name',
  'class name': 'className',
  'css selector': 'css',
  'tag name': 'tagName',
  'link text': 'linkText',
  'partial link text': 'partialLinkText',
  'xpath': 'xpath'
};


/**
 * Finds an element on the current page. The response value will be the UUID of
 * the located element, or an error message if an element could not be found.
 * @param {Response} respond Object to send the command response with.
 * @param {string} method The locator method to use.
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

  var target = {};
  target[FirefoxDriver.WIRE_TO_ATOMS_STRATEGY_[method] || method] = selector;

  var element;
  try {
    element = bot.locators.findElement(target, rootNode);
  }
  catch(ex) {
    if(ex.message == bot.ErrorCode.INVALID_SELECTOR_ERROR) {
      // We send the INVALID_SELECTOR_ERROR immediately because it will occur in
      // every retry.
      respond.sendError(new WebDriverError(bot.ErrorCode.INVALID_SELECTOR_ERROR,
        'The given selector "' + selector + ' is either invalid or does not result'
          + 'in a Webelement'));
      return;
    } else {
      // this is not the exception we are interested in, so we propagate it.
      throw e;
    }
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
      var callback = goog.bind(this.findElementInternal_, this, respond, method, selector,
              opt_parentElementId, startTime);

      this.jsTimer.setTimeout(callback, 100);
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
 * @param {string} method The locator method to use.
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

  var target = {};
  target[FirefoxDriver.WIRE_TO_ATOMS_STRATEGY_[method] || method] = selector;

  var elements;
  try {
    elements = bot.locators.findElements(target, rootNode);
  } catch (ex) {
    if(ex.message == bot.ErrorCode.INVALID_SELECTOR_ERROR) {
      // We send the INVALID_SELECTOR_ERROR immediately because it will occur in
      // every retry.
      respond.sendError(new WebDriverError(bot.ErrorCode.INVALID_SELECTOR_ERROR,
        'The given selector "' + selector + ' is either invalid or does not result'
           + 'in a Webelement'));
      return;
    } else {
      // this is not the exception we are interested in, so we propagate it.
      throw e;
    }
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
    var callback = function() {
        self.findElementsInternal_(respond, method, selector, opt_parentElementId, startTime);
    };
    this.jsTimer.setTimeout(callback, 10);
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


/**
 * Changes the command session's focus to a new frame.
 * @param {Response} respond Object to send the command response with.
 * @param {{id:?(string|number|{ELEMENT:string})}} parameters A JSON object
 *     specifying which frame to switch to.
 */
FirefoxDriver.prototype.switchToFrame = function(respond, parameters) {
  var currentWindow = webdriver.firefox.utils.unwrapXpcOnly(respond.session.getWindow());

  var switchingToDefault = !goog.isDef(parameters.id) || goog.isNull(parameters.id);
  if ((!currentWindow || currentWindow.closed) && !switchingToDefault) {
    // By definition there will be no child frames.
    respond.sendError(new WebDriverError(ErrorCode.NO_SUCH_FRAME, "Current window is closed"));
  }

  var newWindow = null;
  if (switchingToDefault) {
    Logger.dumpn("Switching to default content (topmost frame)");
    newWindow = respond.session.getBrowser().contentWindow;
  } else if (goog.isString(parameters.id)) {
    Logger.dumpn("Switching to frame with name or ID: " + parameters.id);
    var foundById;
    var numFrames = currentWindow.frames.length;
    for (var i = 0; i < numFrames; i++) {
      var frame = currentWindow.frames[i];
      var frameElement = frame.frameElement;
      if (frameElement.name == parameters.id) {
        newWindow = frame;
        break;
      } else if (!foundById && frameElement.id == parameters.id) {
        foundById = frame;
      }
    }

    if (!newWindow && foundById) {
      newWindow = foundById;
    }
  } else if (goog.isNumber(parameters.id)) {
    Logger.dumpn("Switching to frame by index: " + parameters.id);
    newWindow = currentWindow.frames[parameters.id];
  } else if (goog.isObject(parameters.id) && 'ELEMENT' in parameters.id) {
    Logger.dumpn("Switching to frame by element: " + parameters.id['ELEMENT']);
    var element = Utils.getElementAt(parameters.id['ELEMENT'],
        currentWindow.document);

    if (/^i?frame$/i.test(element.tagName)) {
      // Each session maintains a weak reference to the window it is currently
      // focused on. If we set this reference using the |contentWindow|
      // property, we may prematurely lose our window reference. This does not
      // appear to happen if we cross reference the frame's |contentWindow|
      // with the current window's |frames| nsIDOMWindowCollection.
      newWindow = goog.array.find(currentWindow.frames, function(frame) {
        return frame == element.contentWindow;
      });
    } else {
      throw new WebDriverError(ErrorCode.NO_SUCH_FRAME,
          'Element is not a frame element: ' + element.tagName);
    }
  }

  if (newWindow) {
    respond.session.setWindow(newWindow);
    respond.send();
  } else {
    throw new WebDriverError(ErrorCode.NO_SUCH_FRAME,
        'Unable to locate frame: ' + parameters.id);
  }
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

  if (!cookie.expiry) {
    var date = new Date();
    date.setYear(2030);
    cookie.expiry = date.getTime() / 1000;  // Stored in seconds.
  }

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
}

FirefoxDriver.prototype.getCookies = function(respond) {
  var toReturn = [];
  var cookies = getVisibleCookies(respond.session.getBrowser().
      contentWindow.location);
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var expires = cookie.expires;
    if (expires == 0) {  // Session cookie, don't return an expiry.
      expires = null;
    } else if (expires == 1) { // Date before epoch time, cap to epoch.
      expires = 0;
    }
    toReturn.push({
      'name': cookie.name,
      'value': cookie.value,
      'path': cookie.path,
      'domain': cookie.host,
      'secure': cookie.isSecure,
      'expiry': expires
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


FirefoxDriver.prototype.implicitlyWait = function(respond, parameters) {
  respond.session.setImplicitWait(parameters.ms);
  respond.send();
};


FirefoxDriver.prototype.setScriptTimeout = function(respond, parameters) {
  respond.session.setScriptTimeout(parameters.ms);
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


FirefoxDriver.prototype.dismissAlert = function(respond) {
  webdriver.modals.dismissAlert(this, this.alertTimeout,
      webdriver.modals.success(respond),
      webdriver.modals.errback(respond));
};

FirefoxDriver.prototype.acceptAlert = function(respond) {
  webdriver.modals.acceptAlert(this, this.alertTimeout,
      webdriver.modals.success(respond),
      webdriver.modals.errback(respond));
};

FirefoxDriver.prototype.getAlertText = function(respond) {
  var success = function(text) {
    respond.value = text;
    respond.send();
  };
  respond.value = webdriver.modals.getText(this, this.alertTimeout,
      success,
      webdriver.modals.errback(respond));
};

FirefoxDriver.prototype.setAlertValue = function(respond, parameters) {
  respond.value = webdriver.modals.setValue(this, this.alertTimeout,
      parameters['text'],
      webdriver.modals.success(respond),
      webdriver.modals.errback(respond));
};


// IME library mapping
FirefoxDriver.prototype.imeGetAvailableEngines = function(respond) {
  var obj = Utils.getNativeEvents();
  var engines = {};

  try {
    obj.imeGetAvailableEngines(engines);
    var returnArray = Utils.convertNSIArrayToNative(engines.value);

    respond.value = returnArray;
  } catch (e) {
    throw new WebDriverError(ErrorCode.IME_NOT_AVAILABLE,
        "IME not available on the host: " + e);
  }
  respond.send();
};

FirefoxDriver.prototype.imeGetActiveEngine = function(respond) {
  var obj = Utils.getNativeEvents();
  var activeEngine = {};
  try {
    obj.imeGetActiveEngine(activeEngine);
    respond.value = activeEngine.value;
  } catch (e) {
    throw new WebDriverError(ErrorCode.IME_NOT_AVAILABLE,
        "IME not available on the host: " + e);
  }    
  respond.send();
};

FirefoxDriver.prototype.imeIsActivated = function(respond) {
  var obj = Utils.getNativeEvents();
  var isActive = {};
  try {
    obj.imeIsActivated(isActive);
    respond.value = isActive.value;
  } catch (e) {
    throw new WebDriverError(ErrorCode.IME_NOT_AVAILABLE,
        "IME not available on the host: " + e);
  }
  respond.send();
};

FirefoxDriver.prototype.imeDeactivate = function(respond) {
  var obj = Utils.getNativeEvents();
  try {
    obj.imeDeactivate();
  } catch (e) {
    throw new WebDriverError(ErrorCode.IME_NOT_AVAILABLE,
        "IME not available on the host: " + e);
  }
  
  respond.send();
};

FirefoxDriver.prototype.imeActivateEngine = function(respond, parameters) {
  var obj = Utils.getNativeEvents();
  var successfulActivation = {};
  var engineToActivate = parameters['engine'];
  try {
    obj.imeActivateEngine(engineToActivate, successfulActivation);
  } catch (e) {
    throw new WebDriverError(ErrorCode.IME_NOT_AVAILABLE,
        "IME not available on the host: " + e);
  }

  if (! successfulActivation.value) {
    throw new WebDriverError(ErrorCode.IME_ENGINE_ACTIVATION_FAILED,
        "Activation of engine failed: " + engineToActivate);
  } 
  respond.send();
};

function getElementFromLocation(mouseLocation, doc) {
  var elementForNode = null;

  var locationX = Math.round(mouseLocation.x);
  var locationY = Math.round(mouseLocation.y);

  if (mouseLocation.initialized) {
    elementForNode = doc.elementFromPoint(locationX, locationY);
    Logger.dumpn("Element from (" + locationX + "," + locationY + ") :" + elementForNode);
  } else {
    Logger.dumpn("Mouse coordinates were not set - using body");
    elementForNode = doc.getElementsByTagName("body")[0];
  }

  return webdriver.firefox.utils.unwrap(elementForNode);
}

function generateErrorForNativeEvents(nativeEventsEnabled, nativeEventsObj, nodeForInteraction) {
  var nativeEventFailureCause = "Could not get node for element or native " +
      "events are not supported on the platform.";
  if (! nativeEventsEnabled) {
    nativeEventFailureCause = "native events are disabled on this platform.";
  } else if (! nativeEventsObj) {
    nativeEventFailureCause = "Could not load native events component.";
  } else {
    nativeEventFailureCause = "Could not get node for element - cannot interact.";
  }
 // TODO: use the correct error type here.
  return new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
      "Cannot perform native interaction: " + nativeEventFailureCause);
}

getBrowserSpecificOffset_ = function(inBrowser) {
    // In Firefox 4, there's a shared window handle. We need to calculate an offset
    // to add to the x and y locations.
    var browserSpecificXOffset = 0;
    var browserSpecificYOffset = 0;

    if (bot.userAgent.isFirefox4()) {
      var rect = inBrowser.getBoundingClientRect();
      browserSpecificYOffset += rect.top;
      browserSpecificXOffset += rect.left;
      Logger.dumpn("Browser-specific offset (X,Y): " + browserSpecificXOffset
          + ", " + browserSpecificYOffset);
    }

  return {x: browserSpecificXOffset, y: browserSpecificYOffset};
}

//TODO: figure out why this.getBrowserSpecificOffset_ cannot be used in mouseMove
FirefoxDriver.prototype.getBrowserSpecificOffset_ = function(inBrowser) {
  return getBrowserSpecificOffset_(inBrowser);
}

FirefoxDriver.prototype.mouseMove = function(respond, parameters) {
  var doc = respond.session.getDocument();
  
  // Fast path first
  if (!this.enableNativeEvents) {
    var raw = parameters['element'] ? Utils.getElementAt(parameters['element'], doc) : null;
    var target = raw ? new XPCNativeWrapper(raw) : null;
    Logger.dumpn("Calling move with: " + parameters['xoffset'] + ', ' + parameters['yoffset'] + ", " + target);
    var result = this.mouse.move(target, parameters['xoffset'], parameters['yoffset']);
    
    respond['status'] = result['status'];
    respond['result'] = result['message'];
    respond.send();
    return;
  }
  
  var mouseMoveTo = function(coordinates, nativeEventsEnabled, jsTimer) {
    var elementForNode = null;
    var browserOffset = getBrowserSpecificOffset_(respond.session.getBrowser());

    if (coordinates.auxiliary) {
      var element = webdriver.firefox.utils.unwrap(coordinates.auxiliary);

      var loc = Utils.getLocationOnceScrolledIntoView(element);
      var accessibleLocation = Utils.getLocationViaAccessibilityInterface(element);

      // Don't use accessibility information for Firefox 3.5 and below.
      if ((bot.userAgent.isVersion('3.6')) && accessibleLocation) {
        var browserToolbarAddedPixelsX = browserOffset.x;
        var browserToolbarAddedPixelsY = browserOffset.y;
        // For Firefox 3.6, use the mosInnerScreenX, as we cannot get the browser-specific offset
        // by calling getBoundingClientRect on the browser object.
        if (! bot.userAgent.isFirefox4()) {
          browserToolbarAddedPixelsX = element.ownerDocument.defaultView.mozInnerScreenX;
          browserToolbarAddedPixelsY = element.ownerDocument.defaultView.mozInnerScreenY;
          Logger.dumpn("Adjusted browser-specific offset: (" + browserToolbarAddedPixelsX + ", " +
            browserToolbarAddedPixelsY + ")");
        }

        // Adjust according to browser-specific offset.
        accessibleLocation.x = accessibleLocation.x - browserToolbarAddedPixelsX;
        accessibleLocation.y = accessibleLocation.y - browserToolbarAddedPixelsY;

        var useAccessibleLocation = !Utils.locationsEqual(loc, accessibleLocation) &&
            (!isNaN(accessibleLocation.x));

        Logger.dumpn("Location provided by Accessibility API: (" + accessibleLocation.x + ", " +
            accessibleLocation.y + ") h: " + accessibleLocation.height + " w: " +
            accessibleLocation.width + " was used? " + useAccessibleLocation);

        if (useAccessibleLocation) {
          // Location obtained via the Accessibility API differs from the location we got via
          // getBoundingClientRect. Prefer the one provided by the accessibility API.
          loc = accessibleLocation;
        }
      }

      toX = loc.x + coordinates.x;
      toY = loc.y + coordinates.y;

      elementForNode = element;
    } else {
      elementForNode = getElementFromLocation(respond.session.getMousePosition(), doc);
      var mousePosition = respond.session.getMousePosition();

      toX = mousePosition.x + coordinates.x;
      toY = mousePosition.y + coordinates.y;
    }

    var events = Utils.getNativeEvents();
    var node = Utils.getNodeForNativeEvents(elementForNode);

    // Make sure destination coordinates are positive - there's no sense in
    // generating mouse move events to negative offests and the native events
    // library will indeed refuse to do so.
    toX = Math.max(toX, 0);
    toY = Math.max(toY, 0);

    // TODO(eran): Figure out the size of the window - it's ok to drag past the body's
    // boundaries, but not the window's boundaries.
    toX = Math.min(toX, 4096);
    toY = Math.min(toY, 4096);

    if (nativeEventsEnabled && events && node) {
      var currentPosition = respond.session.getMousePosition();
      Logger.dumpn("Moving from (" + currentPosition.x + ", " + currentPosition.y + ") to (" +
        toX + ", " + toY + ")");
      events.mouseMove(node,
          currentPosition.x + browserOffset.x, currentPosition.y + browserOffset.y,
          toX + browserOffset.x, toY + browserOffset.y);

      var dummyIndicator = {
        wasUnloaded: false
      };

      Utils.waitForNativeEventsProcessing(elementForNode, events, dummyIndicator, jsTimer);

      respond.session.setMousePosition(toX, toY);
    } else {
      throw generateErrorForNativeEvents(nativeEventsEnabled, events, node);
    }

  };

  var coords = webdriver.firefox.events.buildCoordinates(parameters, doc);
  mouseMoveTo(coords, this.enableNativeEvents, this.jsTimer);

  respond.send();
};

FirefoxDriver.prototype.mouseDown = function(respond, parameters) {
  if (!this.enableNativeEvents) {
    var coords = webdriver.firefox.utils.newCoordinates(null, 0, 0);
    var result = this.mouse.down(coords);
    
    respond['status'] = result['status'];
    respond['value'] = result['message'];
    respond.send();
    return;
  }
  
  var doc = respond.session.getDocument();
  var elementForNode = getElementFromLocation(respond.session.getMousePosition(), doc);;  

  var events = Utils.getNativeEvents();
  var node = Utils.getNodeForNativeEvents(elementForNode);

  if (this.enableNativeEvents && events && node) {
    var currentPosition = respond.session.getMousePosition();
    var browserOffset = getBrowserSpecificOffset_(respond.session.getBrowser());

    events.mousePress(node, currentPosition.x + browserOffset.x,
        currentPosition.y + browserOffset.y, 1);

    var dummyIndicator = {
      wasUnloaded: false
    };

    Utils.waitForNativeEventsProcessing(elementForNode, events, dummyIndicator, this.jsTimer);

  } else {
    throw generateErrorForNativeEvents(this.enableNativeEvents, events, node);
  }

  respond.send();
};

FirefoxDriver.prototype.mouseUp = function(respond, parameters) {
  if (!this.enableNativeEvents) {
    var coords = webdriver.firefox.utils.newCoordinates(null, 0, 0);
    var result = this.mouse.up(coords);
    
    respond['status'] = result['status'];
    respond['value'] = result['message'];
    respond.send();
    return;
  }
  
  var doc = respond.session.getDocument();
  var elementForNode = getElementFromLocation(respond.session.getMousePosition(), doc);

  var events = Utils.getNativeEvents();
  var node = Utils.getNodeForNativeEvents(elementForNode);

  if (this.enableNativeEvents && events && node) {
    var currentPosition = respond.session.getMousePosition();
    var browserOffset = getBrowserSpecificOffset_(respond.session.getBrowser());

    events.mouseRelease(node, currentPosition.x + browserOffset.x,
        currentPosition.y + browserOffset.y, 1);

    var dummyIndicator = {
      wasUnloaded: false
    };

    Utils.waitForNativeEventsProcessing(elementForNode, events, dummyIndicator, this.jsTimer);
  } else {
    throw generateErrorForNativeEvents(this.enableNativeEvents, events, node);
  }

  respond.send();
};

FirefoxDriver.prototype.mouseClick = function(respond, parameters) {
  var doc = respond.session.getDocument();
  
  Utils.installWindowCloseListener(respond);
  Utils.installClickListener(respond, WebLoadingListener);
  
  if (!this.enableNativeEvents) {
    var result = this.mouse.click(null);
    
    respond['status'] = result['status'];
    respond['value'] = result['message'];
    return;
  }
  
  var elementForNode = getElementFromLocation(respond.session.getMousePosition(), doc);

  var events = Utils.getNativeEvents();
  var node = Utils.getNodeForNativeEvents(elementForNode);

  if (this.enableNativeEvents && events && node) {
    var currentPosition = respond.session.getMousePosition();
    var browserOffset = getBrowserSpecificOffset_(respond.session.getBrowser());

    events.click(node, currentPosition.x + browserOffset.x,
        currentPosition.y + browserOffset.y, 1);

    var dummyIndicator = {
      wasUnloaded: false
    };

    Utils.waitForNativeEventsProcessing(elementForNode, events, dummyIndicator, this.jsTimer);

  } else {
    throw generateErrorForNativeEvents(this.enableNativeEvents, events, node);
  }

  respond.send();
};


FirefoxDriver.prototype.mouseDoubleClick = function(respond, parameters) {
  Utils.installWindowCloseListener(respond);
  Utils.installClickListener(respond, WebLoadingListener);

  var response = this.mouse.doubleClick(null);
  respond.status = response.status;
  respond.value = response.message;
  respond.send();
};
