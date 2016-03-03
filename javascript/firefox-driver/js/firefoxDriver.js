// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('FirefoxDriver');

goog.require('Utils');
goog.require('WebLoadingListener');
goog.require('bot.ErrorCode');
goog.require('bot.appcache');
goog.require('bot.dom');
goog.require('bot.frame');
goog.require('bot.locators');
goog.require('bot.userAgent');
goog.require('bot.window');
goog.require('fxdriver.Timer');
goog.require('fxdriver.events');
goog.require('fxdriver.io');
goog.require('fxdriver.logging');
goog.require('fxdriver.modals');
goog.require('fxdriver.preconditions');
goog.require('fxdriver.screenshot');
goog.require('fxdriver.utils');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.selection');
goog.require('goog.log');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');


FirefoxDriver = function(server, win, opt_pageLoadStrategy) {
  this.server = server;
  this.window = win;
  this.pageLoadStrategy = opt_pageLoadStrategy || 'normal';

  // Default to a two second timeout.
  this.alertTimeout = 2000;

  this.currentX = 0;
  this.currentY = 0;

  // This really shouldn't be here, but the firefoxdriver isn't compiled with closure, so the atoms
  // aren't exported into global scope
  FirefoxDriver.prototype.dismissAlert.preconditions =
      [function() { fxdriver.preconditions.alertPresent(this) }];
  FirefoxDriver.prototype.acceptAlert.preconditions =
      [function() { fxdriver.preconditions.alertPresent(this) }];
  FirefoxDriver.prototype.getAlertText.preconditions =
      [function() { fxdriver.preconditions.alertPresent(this) }];
  FirefoxDriver.prototype.setAlertValue.preconditions =
      [function() { fxdriver.preconditions.alertPresent(this) }];


  FirefoxDriver.listenerScript = Utils.loadUrl('resource://fxdriver/evaluate.js');

  this.jsTimer = new fxdriver.Timer();
  this.mouse = Utils.newInstance('@googlecode.com/webdriver/syntheticmouse;1', 'wdIMouse');
  // Current state of modifier keys (for synthenized events).
  this.modifierKeysState = Utils.newInstance('@googlecode.com/webdriver/modifierkeys;1', 'wdIModifierKeys');
  this.mouse.initialize(this.modifierKeysState);
};

/**
 * @private {goog.log.Logger}
 * @const
 */
FirefoxDriver.LOG_ = fxdriver.logging.getLogger('fxdriver.FirefoxDriver');


FirefoxDriver.prototype.__defineGetter__('id', function() {
  if (!this.id_) {
    this.id_ = this.server.getNextId();
  }

  return this.id_;
});


FirefoxDriver.prototype.getCurrentWindowHandle = function(respond) {
  respond.value = this.id;
  respond.send();
};


FirefoxDriver.prototype.getCurrentUrl = function(respond) {
  respond.value = '' + respond.session.getBrowser().contentWindow.location;
  respond.send();
};


FirefoxDriver.prototype.get = function(respond, parameters) {
  var url = parameters.url;
  // Check to see if the given url is the same as the current one, but
  // with a different anchor tag.
  var current = respond.session.getWindow().location;
  var loadEventExpected;
  try {
    loadEventExpected = fxdriver.io.isLoadExpected(current, url);
  } catch (e) {
    goog.log.warning(FirefoxDriver.LOG_, e);
    var converted = e.QueryInterface ?
                    e.QueryInterface(Components.interfaces['nsIException']) : e;
    if ('NS_ERROR_MALFORMED_URI' == converted.name) {
      goog.log.warning(FirefoxDriver.LOG_, converted.name);
      respond.sendError(new WebDriverError(
          bot.ErrorCode.UNKNOWN_ERROR,
          'Target URL '+url+' is not well-formed.'));
      return;
    }
  }

  if (loadEventExpected) {
    Utils.initWebLoadingListener(respond, respond.session.getWindow());
  }

  respond.session.getBrowser().loadURI(url);

  if (!loadEventExpected) {
    goog.log.info(FirefoxDriver.LOG_, 'No load event expected');
    respond.send();
  }
};


FirefoxDriver.prototype.close = function(respond) {
  // Grab all the references we'll need. Once we call close all this might go away
  var wm = fxdriver.moz.getService(
      '@mozilla.org/appshell/window-mediator;1', 'nsIWindowMediator');
  var appService = fxdriver.moz.getService(
      '@mozilla.org/toolkit/app-startup;1', 'nsIAppStartup');
  var forceQuit = Components.interfaces.nsIAppStartup.eForceQuit;

  var numOpenWindows = 0;
  var allWindows = wm.getEnumerator('navigator:browser');
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
        appService.quit(forceQuit);
    };

    FirefoxDriver.nstimer = new fxdriver.Timer();
    FirefoxDriver.nstimer.setTimeout(event, 500);
    return;  // The client should catch the fact that the socket suddenly closes
  }

  // Here we go!
  try {
    var browser = respond.session.getBrowser();
    browser.contentWindow.close();
  } catch (e) {
    goog.log.warning(FirefoxDriver.LOG_, 'Error closing window', e);
  }

  // Send the response so the client doesn't get a connection refused socket
  // error.
  respond.send();
};


/**
 * Clones objects from this privileged scope into a less-privileged scope.
 * Returns the original object for Gecko < 29, which does not support cloning.
 * Note, this is required for Gecko 35+.
 *
 * @param {!Object} origianlObject The object to clone.
 * @param {!Object} targetScope The object to attach to.
 * @return {!Object} The cloned object.
 * @see https://developer.mozilla.org/en-US/docs/Components.utils.cloneInto
 * @see https://code.google.com/p/selenium/issues/detail?id=8390
 */
function cloneInto(originalObject, targetScope) {
  // While cloneInto was introduced with Gecko 29 and only became required in
  // Gecko 35, we only use it for 33+ as cloneInto fails up to Gecko 32 when
  // DOM elements are included in the cloned object.
  // TODO: this check may be removed when we drop support for Gecko 32 (when
  // Firefox 45 ESR is released). Hopefully Mozilla's Marionette will replace
  // this entire thing by then.
  if (bot.userAgent.isProductVersion(33)) {
    return Components.utils.cloneInto(originalObject, targetScope, {
      wrapReflectors:true
    });
  }
  return originalObject;
}


function injectAndExecuteScript(respond, parameters, isAsync, timer) {
  var doc = respond.session.getDocument();
  var unwrappedDoc = fxdriver.moz.unwrap(doc);
  var script = parameters['script'];
  var converted = Utils.unwrapParameters(parameters['args'], doc);

  if (doc.designMode && 'on' == doc.designMode.toLowerCase()) {
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
    goog.log.info(FirefoxDriver.LOG_,
        'Window in design mode, falling back to sandbox: ' + doc.designMode);
    var window = respond.session.getWindow();
    window = window.wrappedJSObject;
    var sandbox = new Components.utils.Sandbox(window);
    sandbox.window = window;
    sandbox.document = doc.wrappedJSObject ? doc.wrappedJSObject : doc;
    sandbox.navigator = window.navigator;

    try {
      sandbox.__webdriverParams = cloneInto(converted, sandbox);
      var scriptSrc = 'with(window) { var __webdriverFunc = function(){' + parameters.script +
          '};  __webdriverFunc.apply(null, __webdriverParams); }';
      var res = Components.utils.evalInSandbox(scriptSrc, sandbox);
      respond.value = Utils.wrapResult(res, doc);
      respond.send();
      return;
    } catch (e) {
      throw new WebDriverError(bot.ErrorCode.JAVASCRIPT_ERROR, e);
    }
  }

  var self = this;

  var docBodyLoadTimeOut = function() {
    if (!self.modalOpen) {
      // The modal detection code in modals.js deals with throwing an
      // exception, in the other case.
      respond.sendError(new WebDriverError(bot.ErrorCode.JAVASCRIPT_ERROR,
          'waiting for doc.body failed'));
    }
  };

  var scriptLoadTimeOut = function() {
    if (!self.modalOpen) {
      // The modal detection code in modals.js deals with throwing an
      // exception, in the other case.
      respond.sendError(new WebDriverError(bot.ErrorCode.JAVASCRIPT_ERROR,
          'waiting for evaluate.js load failed'));
    }
  };

  var checkScriptLoaded = function() {
    return unwrappedDoc['__webdriver_evaluate'] && !!unwrappedDoc['__webdriver_evaluate']['attached'];
  };

  var runScript = function() {
    converted.forEach(function(value) {
      if (goog.typeOf(value) === 'object') {
        var props = {};
        Object.keys(value).forEach(function(key) {
          props[key] = 'rw';
        });

        Object.defineProperty(value, '__exposedProps__', {
          enumerable: false,
          configurable: false,
          writable: true,
          value: props
        });
      }
    });

    unwrappedDoc['__webdriver_evaluate']['args'] =
        cloneInto(converted, unwrappedDoc['__webdriver_evaluate']);
    unwrappedDoc['__webdriver_evaluate']['async'] = isAsync;
    unwrappedDoc['__webdriver_evaluate']['script'] = script;
    unwrappedDoc['__webdriver_evaluate']['timeout'] = respond.session.getScriptTimeout();

    var handler = function(event) {
        doc.removeEventListener('webdriver-evaluate-response', handler, true);

        if (self.modalOpen) {
          // The modal detection code in modals.js deals with throwing an
          // exception, in this case.
          return;
        }

        var result = unwrappedDoc['__webdriver_evaluate']['result'];
        respond.value = Utils.wrapResult(result, doc);
        respond.status = unwrappedDoc['__webdriver_evaluate']['code'];

        // I have no idea why this started happening. Roll on m-day
        if (!bot.userAgent.isProductVersion(23)) {
          delete unwrappedDoc['__webdriver_evaluate'];
        }

        respond.send();
    };
    doc.addEventListener('webdriver-evaluate-response', handler, true);

    var event = doc.createEvent('Events');
    var bubbles = false;
    var cancelable = true;
    event.initEvent('webdriver-evaluate', bubbles, cancelable);
    doc.dispatchEvent(event);
  };

  // Attach the listener to the DOM
  var addListener = function() {
    if (!doc['__webdriver_evaluate'] || !doc['__webdriver_evaluate']['attached']) {
      var parentNode = Utils.getMainDocumentElement(doc);
      var element = Utils.isSVG(doc) ? doc.createElementNS("http://www.w3.org/2000/svg", "script") : doc.createElement('script');
      element.setAttribute('type', 'text/javascript');
      element.textContent = FirefoxDriver.listenerScript;
      parentNode.appendChild(element);
      parentNode.removeChild(element);
    }
    timer.runWhenTrue(checkScriptLoaded, runScript, 10000, scriptLoadTimeOut);
  };

  var checkDocBodyLoaded = function() {
    return !!Utils.getMainDocumentElement(doc);
  };

  timer.runWhenTrue(checkDocBodyLoaded, addListener, 10000, docBodyLoadTimeOut);
}


FirefoxDriver.prototype.executeScript = function(respond, parameters) {
  injectAndExecuteScript(respond, parameters, false, this.jsTimer);
};


FirefoxDriver.prototype.executeAsyncScript = function(respond, parameters) {
  injectAndExecuteScript(respond, parameters, true, this.jsTimer);
};


FirefoxDriver.prototype.getTitle = function(respond) {
  respond.value = respond.session.getBrowser().contentTitle;
  respond.send();
};


FirefoxDriver.prototype.getPageSource = function(respond) {
  var win = respond.session.getWindow();

  var docElement = win.document.documentElement;
  if (!docElement) {
    // empty string means no DOM element available (the page is probably rebuilding at the moment)
    respond.value = '';
    respond.send();
    return;
  }

  if (win.document.contentType == "text/plain") {
    respond.value = win.document.documentElement.textContent;
    respond.send();
    return;
  }

  // Don't pollute the response with annotations we place on the DOM.
  docElement.removeAttribute('webdriver');
  docElement.removeAttribute('command');
  docElement.removeAttribute('response');

  var XMLSerializer = win.XMLSerializer;
  respond.value = new XMLSerializer().serializeToString(win.document);
  respond.send();

  // The command & response attributes we removed are one-shots, we only
  // need to add back the webdriver attribute.
  docElement.setAttribute('webdriver', 'true');
};


/**
 * If the given error is a {@link bot.ErrorCode.INVALID_SELECTOR_ERROR}, will
 * annotate that error with additional info for the user.
 * @param {string} selector The selector used which generated the error.
 * @param {!Error} ex The error to check.
 * @return {!Error} The new error.
 * @private
 */
FirefoxDriver.annotateInvalidSelectorError_ = function(selector, ex) {
  if (ex.code == bot.ErrorCode.INVALID_SELECTOR_ERROR) {
    return new WebDriverError(bot.ErrorCode.INVALID_SELECTOR_ERROR,
        'The given selector ' + selector +
            ' is either invalid or does not result' +
            ' in a WebElement. The following error occurred:\n' + ex);
  }

  try {
    var converted = ex.QueryInterface(Components.interfaces['nsIException']);
    goog.log.info(FirefoxDriver.LOG_,
        'Converted the exception: ' + converted.name);
    if ('NS_ERROR_DOM_SYNTAX_ERR' == converted.name) {
      return new WebDriverError(bot.ErrorCode.INVALID_SELECTOR_ERROR,
          'The given selector ' + selector +
              ' is either invalid or does not result' +
              ' in a WebElement. The following error occurred:\n' + ex);
    }
  } catch (ignored) {
  }

  return ex;
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
  var startTime = goog.isNumber(opt_startTime) ? opt_startTime : goog.now();
  var theDocument = respond.session.getDocument();

  try {
    var rootNode = goog.isString(opt_parentElementId) ?
        Utils.getElementAt(opt_parentElementId, theDocument) : theDocument;

    var target = {};
    target[method] = selector;

    var element = bot.locators.findElement(target, rootNode);

    if (element) {
      var id = Utils.addToKnownElements(element);
      respond.value = {'ELEMENT': id, 'element-6066-11e4-a52e-4f735466cecf': id};
      return respond.send();
    }

    var wait = respond.session.getImplicitWait();
    if (wait == 0 || goog.now() - startTime > wait) {
      return respond.sendError(new WebDriverError(bot.ErrorCode.NO_SUCH_ELEMENT,
          'Unable to locate element: ' + JSON.stringify({
              method: method,
              selector: selector
          })));
    }

    var callback = goog.bind(this.findElementInternal_, this, respond, method,
        selector, opt_parentElementId, startTime);
    this.jsTimer.setTimeout(callback, 100);
  } catch (ex) {
    ex = FirefoxDriver.annotateInvalidSelectorError_(selector, ex);
    respond.sendError(ex);
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
  var startTime = goog.isNumber(opt_startTime) ? opt_startTime : goog.now();
  var theDocument = respond.session.getDocument();

  try {
    var rootNode = goog.isString(opt_parentElementId) ?
        Utils.getElementAt(opt_parentElementId, theDocument) : theDocument;

    var target = {};
    target[method] = selector;

    var elements = bot.locators.findElements(target, rootNode);

    var elementIds = [];
    for (var j = 0; j < elements.length; j++) {
      var element = elements[j];
      var elementId = Utils.addToKnownElements(element);
      elementIds.push({'ELEMENT': elementId, 'element-6066-11e4-a52e-4f735466cecf': elementId});
    }

    var wait = respond.session.getImplicitWait();
    if (wait && !elements.length && goog.now() - startTime <= wait) {
      var callback = goog.bind(this.findElementsInternal_, this, respond,
          method, selector, opt_parentElementId, startTime);
      this.jsTimer.setTimeout(callback, 10);
    } else {
      respond.value = elementIds;
      respond.send();
    }
  } catch (ex) {
    ex = FirefoxDriver.annotateInvalidSelectorError_(selector, ex);
    respond.sendError(ex);
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
  var currentWindow = fxdriver.moz.unwrapXpcOnly(respond.session.getWindow());

  var switchingToDefault = !goog.isDef(parameters.id) || goog.isNull(parameters.id);
  if ((!currentWindow || currentWindow.closed) && !switchingToDefault) {
    // By definition there will be no child frames.
    respond.sendError(new WebDriverError(bot.ErrorCode.NO_SUCH_FRAME, 'Current window is closed'));
  }

  var newWindow = null;
  if (switchingToDefault) {
    goog.log.info(FirefoxDriver.LOG_,
        'Switching to default content (topmost frame)');
    newWindow = respond.session.getBrowser().contentWindow;
  } else if (goog.isString(parameters.id)) {
    goog.log.info(FirefoxDriver.LOG_,
        'Switching to frame with name or ID: ' + parameters.id);
    newWindow = bot.frame.findFrameByNameOrId(parameters.id, currentWindow);
  } else if (goog.isNumber(parameters.id)) {
    goog.log.info(FirefoxDriver.LOG_,
        'Switching to frame by index: ' + parameters.id);
    newWindow = bot.frame.findFrameByIndex(parameters.id, currentWindow);
  } else if (goog.isObject(parameters.id) &&
              ('ELEMENT' in parameters.id) || 'element-6066-11e4-a52e-4f735466cecf' in parameters.id) {
    var elId = parameters.id['element-6066-11e4-a52e-4f735466cecf'] ? parameters.id['element-6066-11e4-a52e-4f735466cecf'] : parameters.id['ELEMENT']
    goog.log.info(FirefoxDriver.LOG_,
        'Switching to frame by element: ' + elId);

    var element = Utils.getElementAt(elId, currentWindow.document);

    element = fxdriver.moz.unwrapFor4(element);

    if (!/^i?frame$/i.test(element.tagName)) {
      throw new WebDriverError(bot.ErrorCode.NO_SUCH_FRAME,
          'Element is not a frame element: ' + element.tagName);
    }

    newWindow = element.contentWindow;
  }

  if (newWindow) {
    if (newWindow.frameElement) {
      // Each session maintains a weak link to the window it is currently
      // focused on. Setting the window through the contentWindow may cause the
      // window to be prematurely de-referenced. In order to solve that, we set
      // frame element and not the window (if there is one).
      respond.session.setWindow(newWindow);
      respond.session.setFrame(newWindow.frameElement);
    } else {
      respond.session.setWindow(newWindow);
    }
    respond.send();
  } else {
    throw new WebDriverError(bot.ErrorCode.NO_SUCH_FRAME,
        'Unable to locate frame: ' + parameters.id);
  }
};


/**
 * Changes the command session's focus to the parent frame.
 * @param {Response} respond Object to send the command response with.
 */
FirefoxDriver.prototype.switchToParentFrame = function(respond) {
  var p = respond.session.getWindow().parent;
  respond.session.setWindow(p);
  respond.session.setFrame(p.frameElement);
  respond.send();
};


FirefoxDriver.prototype.getActiveElement = function(respond) {
  var element = Utils.getActiveElement(respond.session.getDocument());
  var id = Utils.addToKnownElements(element);

  respond.value = {'ELEMENT': id, 'element-6066-11e4-a52e-4f735466cecf': id};
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
  Utils.initWebLoadingListener(respond, browser.contentWindow);
  browser.contentWindow.location.reload(true);
};


FirefoxDriver.prototype.addCookie = function(respond, parameters) {
  var cookie = parameters.cookie;
  var inSession = false;

  if (!cookie.expiry) {
    inSession = true;
    var date = new Date();
    date.setYear(2030);
    cookie.expiry = date.getTime() / 1000;  // Stored in seconds.
  }

  if (!cookie.domain) {
    var location = respond.session.getWindow().location;
    cookie.domain = location.hostname;
  } else {
    var currLocation = respond.session.getWindow().location;
    var currDomain = currLocation.host;
    if (currDomain.indexOf(cookie.domain) == -1) {  // Not quite right, but close enough
      throw new WebDriverError(bot.ErrorCode.INVALID_COOKIE_DOMAIN,
          'You may only set cookies for the current domain');
    }
  }

  // The cookie's domain may include a port. Which is bad. Remove it
  // We'll catch ip6 addresses by mistake. Since no-one uses those
  // this will be okay for now.
  if (cookie.domain.match(/:\d+$/)) {
    cookie.domain = cookie.domain.replace(/:\d+$/, '');
  }

  var document = respond.session.getDocument();
  if (!document || !document.contentType.match(/html/i)) {
    throw new WebDriverError(bot.ErrorCode.UNABLE_TO_SET_COOKIE,
        'You may only set cookies on html documents');
  }

  var cookieManager =
      fxdriver.moz.getService('@mozilla.org/cookiemanager;1', 'nsICookieManager2');

  cookieManager.add(cookie.domain, cookie.path, cookie.name, cookie.value,
      cookie.secure, cookie.httpOnly, inSession, cookie.expiry);

  respond.send();
};

function getVisibleCookies(location) {
  var results = [];

  var currentPath = location.pathname;
  if (!currentPath) currentPath = '/';
  var isForCurrentPath = function(aPath) {
    return currentPath.indexOf(aPath) != -1;
  };
  var cm = fxdriver.moz.getService('@mozilla.org/cookiemanager;1', 'nsICookieManager2');
  var e = cm.getCookiesFromHost(location.hostname);
  while (e.hasMoreElements()) {
    var cookie = e.getNext().QueryInterface(Components.interfaces['nsICookie2']);

    // Take the hostname and progressively shorten it
    var hostname = location.hostname;
    do {
      if ((cookie.host == '.' + hostname || cookie.host == hostname)
          && isForCurrentPath(cookie.path)) {
        results.push(cookie);
        break;
      }
      hostname = hostname.replace(/^.*?\./, '');
    } while (hostname.indexOf('.') != -1);
  }

  return results;
}

FirefoxDriver.prototype.getCookies = function(respond) {
  var toReturn = [];
  var cookies = getVisibleCookies(respond.session.getWindow().location);
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
      'httpOnly': cookie.isHttpOnly,
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
  var cm = fxdriver.moz.getService('@mozilla.org/cookiemanager;1', 'nsICookieManager');

  var cookies = getVisibleCookies(respond.session.getWindow().location);
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    if (cookie.name == toDelete) {
      cm.remove(cookie.host, cookie.name, cookie.path, false);
    }
  }

  respond.send();
};


FirefoxDriver.prototype.deleteAllCookies = function(respond) {
  var cm = fxdriver.moz.getService('@mozilla.org/cookiemanager;1', 'nsICookieManager');
  var cookies = getVisibleCookies(respond.session.getWindow().location);

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    cm.remove(cookie.host, cookie.name, cookie.path, false);
  }

  respond.send();
};


FirefoxDriver.prototype.setTimeout = function(respond, parameters) {
  switch (parameters.type) {
    case 'implicit':
      respond.session.setImplicitWait(parameters.ms);
      break;

    case 'page load':
      respond.session.setPageLoadTimeout(parameters.ms);
      break;

    case 'script':
      respond.session.setScriptTimeout(parameters.ms);
      break;

    default:
      break;
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
    var canvas = fxdriver.screenshot.grab(window);
    try {
      fxdriver.screenshot.save(canvas, pngFile);
    } catch (e) {
      throw new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
          'Could not save screenshot to ' + pngFile + ' - ' + e);
    }
  } catch (e) {
    throw new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
        'Could not take screenshot of current page - ' + e);
  }
  respond.send();
};


FirefoxDriver.prototype.screenshot = function(respond) {
  var window = respond.session.getBrowser().contentWindow;
  try {
    var canvas = fxdriver.screenshot.grab(window);
  } catch (e) {
    throw new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
      'Could not take screenshot of current page - ' + e );
  }
  try {
    respond.value = fxdriver.screenshot.toBase64(canvas);
  } catch (e) {
    throw new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
      'Could not convert screenshot to base64 - ' + e ) ;
  }
  respond.send();
};


FirefoxDriver.prototype.dismissAlert = function(respond) {
  var self = this;
  fxdriver.modals.isModalPresent(
      function(present) {
        if (!present) {
          respond.status = bot.ErrorCode.NO_SUCH_ALERT;
          respond.value = { message: 'No alert is present' };
        } else {
          fxdriver.modals.dismissAlert(self);
        }
        respond.send();
      }, this.alertTimeout);
};

FirefoxDriver.prototype.acceptAlert = function(respond) {
  var self = this;
  fxdriver.modals.isModalPresent(
      function(present) {
        if (!present) {
          respond.status = bot.ErrorCode.NO_SUCH_ALERT;
          respond.value = { message: 'No alert is present' };
        } else {
          fxdriver.modals.acceptAlert(self);
        }
        respond.send();
      }, this.alertTimeout);
};


FirefoxDriver.prototype.getAlertText = function(respond) {
  var driver = this;
  fxdriver.modals.isModalPresent(
    function(present) {
      if (present) {
        respond.value = fxdriver.modals.getText(driver);
      } else {
        respond.status = bot.ErrorCode.NO_SUCH_ALERT;
        respond.value = { message: 'No alert is present' };
      }
      respond.send();
    }, this.alertTimeout);
};


FirefoxDriver.prototype.setAlertValue = function(respond, parameters) {
  fxdriver.modals.isModalPresent(
      function(present) {
        if (!present) {
          respond.status = bot.ErrorCode.NO_SUCH_ALERT;
          respond.value = { message: 'No alert is present' };
        } else {
          fxdriver.modals.setValue(parameters['text']);
        }
        respond.send();
      }, this.alertTimeout);
};


// IME library mapping
FirefoxDriver.prototype.imeGetAvailableEngines = function(respond) {
  var obj = Utils.getNativeIME();
  var engines = {};

  try {
    obj.imeGetAvailableEngines(engines);
    var returnArray = Utils.convertNSIArrayToNative(engines.value);

    respond.value = returnArray;
  } catch (e) {
    throw new WebDriverError(bot.ErrorCode.IME_NOT_AVAILABLE,
        'IME not available on the host: ' + e);
  }
  respond.send();
};

FirefoxDriver.prototype.imeGetActiveEngine = function(respond) {
  var obj = Utils.getNativeIME();
  var activeEngine = {};
  try {
    obj.imeGetActiveEngine(activeEngine);
    respond.value = activeEngine.value;
  } catch (e) {
    throw new WebDriverError(bot.ErrorCode.IME_NOT_AVAILABLE,
        'IME not available on the host: ' + e);
  }
  respond.send();
};

FirefoxDriver.prototype.imeIsActivated = function(respond) {
  var obj = Utils.getNativeIME();
  var isActive = {};
  try {
    obj.imeIsActivated(isActive);
    respond.value = isActive.value;
  } catch (e) {
    throw new WebDriverError(bot.ErrorCode.IME_NOT_AVAILABLE,
        'IME not available on the host: ' + e);
  }
  respond.send();
};

FirefoxDriver.prototype.imeDeactivate = function(respond) {
  var obj = Utils.getNativeIME();
  try {
    obj.imeDeactivate();
  } catch (e) {
    throw new WebDriverError(bot.ErrorCode.IME_NOT_AVAILABLE,
        'IME not available on the host: ' + e);
  }

  respond.send();
};

FirefoxDriver.prototype.imeActivateEngine = function(respond, parameters) {
  var obj = Utils.getNativeIME();
  var successfulActivation = {};
  var engineToActivate = parameters['engine'];
  try {
    obj.imeActivateEngine(engineToActivate, successfulActivation);
  } catch (e) {
    throw new WebDriverError(bot.ErrorCode.IME_NOT_AVAILABLE,
        'IME not available on the host: ' + e);
  }

  if (! successfulActivation.value) {
    throw new WebDriverError(bot.ErrorCode.IME_ENGINE_ACTIVATION_FAILED,
        'Activation of engine failed: ' + engineToActivate);
  }
  respond.send();
};

// HTML 5
FirefoxDriver.prototype.getAppCacheStatus = function(respond, parameters) {
  respond.value = bot.appcache.getStatus(respond.session.getBrowser().contentWindow);
  respond.send();
};

function getElementFromLocation(mouseLocation, doc) {
  var elementForNode = null;

  var locationX = Math.round(mouseLocation.x);
  var locationY = Math.round(mouseLocation.y);

  if (mouseLocation.initialized) {
    elementForNode = doc.elementFromPoint(locationX, locationY);
    goog.log.info(FirefoxDriver.LOG_,
        'Element from (' + locationX + ',' + locationY + ') :' + elementForNode);
  } else {
    goog.log.info(FirefoxDriver.LOG_,
        'Mouse coordinates were not set - using body');
    elementForNode = doc.getElementsByTagName('body')[0];
  }

  return fxdriver.moz.unwrap(elementForNode);
}

FirefoxDriver.prototype.sendResponseFromSyntheticMouse_ = function(mouseReturnValue, respond) {
  if (mouseReturnValue.code != bot.ErrorCode.OK) {
    respond.sendError(new WebDriverError(mouseReturnValue.code, mouseReturnValue.message));
  }
  else {
    respond['status'] = mouseReturnValue['status'];
    respond['value'] = { message: mouseReturnValue['message'] };
    respond.send();
  }
};

FirefoxDriver.prototype.mouseMoveTo = function(respond, parameters) {
  // Coordinate spaces in use:
  //   * Owner document space: Coordinates are relative to the top-left of the
  //     top-level document contained by the window handle containing the
  //     element. In FF <3.6 this is the containing frame. In FF >=3.6 this is
  //     the top-level document.
  //   * Window handle space: Coordinates are relative to the top-left of the
  //     window handle (HWND/x-window) containing the element.
  //   * Pre-scroll space: If the page scrolls while a mouse button is
  //     pressed, firefox acts in the coordinate space before the scroll until
  //     the mouse is released.

  var doc = respond.session.getDocument();
  var coords = fxdriver.events.buildCoordinates(parameters, doc);

  // Prepare to move the mouse.  If the move is relative to an element, make
  // sure the specified region is in the current viewport so we can actually
  // move the mouse.
  if (coords.auxiliary) {
    var offset = new goog.math.Coordinate(coords.x, coords.y);
    var inViewAfterScroll = bot.action.scrollIntoView(coords.auxiliary, offset);
    if (!inViewAfterScroll &&
        !Utils.isSVG(coords.auxiliary.ownerDocument) &&
        !bot.dom.isElement(coords.auxiliary, goog.dom.TagName.OPTION)) {
      respond.sendError(new WebDriverError(
          bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
          'Offset within element cannot be scrolled into view: ' +
              offset + ': ' + coords.auxiliary));
      return;
    }
  }

  var target = coords.auxiliary || doc;
  goog.log.info(FirefoxDriver.LOG_,
      'Calling move with: ' + coords.x + ', ' + coords.y + ', ' + target);
  var result = this.mouse.move(target, coords.x, coords.y);
  this.sendResponseFromSyntheticMouse_(result, respond);
};

FirefoxDriver.prototype.mouseButtonDown = function(respond, parameters) {
  var doc = respond.session.getDocument();

  var coords = fxdriver.events.buildCoordinates(parameters, doc);
  goog.log.info(FirefoxDriver.LOG_,
      'Calling down with: ' + coords.x + ', ' + coords.y + ', ' + coords.auxiliary);
  var result = this.mouse.down(coords);

  this.sendResponseFromSyntheticMouse_(result, respond);
  return;
};

FirefoxDriver.prototype.mouseButtonUp = function(respond, parameters) {
  var doc = respond.session.getDocument();

  var coords = fxdriver.events.buildCoordinates(parameters, doc);
  goog.log.info(FirefoxDriver.LOG_,
      'Calling up with: ' + coords.x + ', ' + coords.y + ', ' + coords.auxiliary);
  var result = this.mouse.up(coords);

  this.sendResponseFromSyntheticMouse_(result, respond);
};

FirefoxDriver.prototype.mouseClick = function(respond, parameters) {

  Utils.installWindowCloseListener(respond);
  Utils.installClickListener(respond, WebLoadingListener);

  var button = parameters['button'];

  // The right mouse button is defined as '2' in the wire protocol
  var RIGHT_MOUSE_BUTTON = 2;
  var result;
  if (RIGHT_MOUSE_BUTTON == button) {
    result = this.mouse.contextClick(null);
  } else {
    result = this.mouse.click(null);
  }

  this.sendResponseFromSyntheticMouse_(result, respond);
};


FirefoxDriver.prototype.mouseDoubleClick = function(respond, parameters) {

  Utils.installWindowCloseListener(respond);
  Utils.installClickListener(respond, WebLoadingListener);

  var result = this.mouse.doubleClick(null);
  this.sendResponseFromSyntheticMouse_(result, respond);
};

FirefoxDriver.prototype.sendKeysToActiveElement = function(respond, parameters) {
  Utils.installWindowCloseListener(respond);

  var useElement = Utils.getActiveElement(respond.session.getDocument());
  if (useElement && useElement.tagName.toLowerCase() == 'body'
      && useElement.ownerDocument.defaultView.frameElement) {
    useElement.ownerDocument.defaultView.focus();

    // Turns out, this is what we should be using as the target
    // to send events to
    useElement = useElement.ownerDocument.getElementsByTagName('html')[0];
  }

  Utils.type(respond.session, useElement, parameters.value.join(''),
    this.jsTimer, false /*release modifiers*/, this.modifierKeysState);

  respond.send();
};

FirefoxDriver.prototype.getWindowSize = function(respond, parameters) {
  this.assertTargetsCurrentWindow_(parameters);

  var size = bot.window.getSize(respond.session.getWindow().top);
  respond.value = { width: size.width, height: size.height };
  respond.send();
};

FirefoxDriver.prototype.setWindowSize = function(respond, parameters) {
  this.assertTargetsCurrentWindow_(parameters);

  var size = new goog.math.Size(parameters.width, parameters.height);
  var win = respond.session.getWindow().top;

  bot.window.setSize(size, win);
  respond.send();
};

FirefoxDriver.prototype.getWindowPosition = function(respond, parameters) {
  this.assertTargetsCurrentWindow_(parameters);

  var position = bot.window.getPosition(respond.session.getWindow().top);

  respond.value = { x: position.x, y: position.y };
  respond.send();
};

FirefoxDriver.prototype.setWindowPosition = function(respond, parameters) {
  this.assertTargetsCurrentWindow_(parameters);

  var position = new goog.math.Coordinate(parameters.x, parameters.y);
  var win = respond.session.getWindow().top;

  bot.window.setPosition(position, win);

  respond.send();
};

FirefoxDriver.prototype.maximizeWindow = function(respond, parameters) {
  this.assertTargetsCurrentWindow_(parameters);

  var documentWindow = respond.session.getWindow();
  var chromeWindow = this.getChromeWindowFromDocumentWindow(documentWindow);

  chromeWindow.maximize();

  respond.send();
};


FirefoxDriver.prototype.getChromeWindowFromDocumentWindow = function(documentWindow) {
  // Find the chrome window for the requested document window.
  // This will ignore unfocused tabs
  var wm = fxdriver.moz.getService(
    '@mozilla.org/appshell/window-mediator;1', 'nsIWindowMediator');
  var allWindows = wm.getEnumerator('navigator:browser');

  while (allWindows.hasMoreElements()) {
    var chromeWindow = allWindows.getNext();

    if (chromeWindow.gBrowser.contentWindow == documentWindow.top) {
      return chromeWindow;
    }
  }
};

//TODO(jari): could this be made into a precondition?
FirefoxDriver.prototype.assertTargetsCurrentWindow_ = function(parameters) {
  if (parameters.windowHandle != 'current') {
    throw new WebDriverError(bot.ErrorCode.UNSUPPORTED_OPERATION,
      'Window operations are only supported for the currently focused window.');
  }
};

