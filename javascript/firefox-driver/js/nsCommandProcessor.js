/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2011 Software Freedom Conservancy

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

/**
 * @fileoverview Contains a Javascript implementation for
 *     nsICommandProcessor.idl. The implemented XPCOM component is exposed to
 *     the content page as a global property so that it can be used from
 *     unpriviledged code.
 */

goog.require('FirefoxDriver');
goog.require('Utils');
goog.require('WebElement');
goog.require('bot.ErrorCode');
goog.require('bot.locators');
goog.require('bot.userAgent');
goog.require('fxdriver.Timer');
goog.require('fxdriver.error');
goog.require('fxdriver.logging');
goog.require('fxdriver.modals');
goog.require('fxdriver.moz');
goog.require('fxdriver.profiler');
goog.require('goog.array');
goog.require('wdSessionStoreService');


var loadStrategy_ = 'conservative';

/**
 * When this component is loaded, load the necessary subscripts.
 */
(function() {
})();


/**
 * Encapsulates the result of a command to the {@code nsCommandProcessor}.
 * @param {Object} command JSON object describing the command to execute.
 * @param {nsIResponseHandler} responseHandler The handler to send the response
 *     to.
 * @constructor
 */
var Response = function(command, responseHandler) {
  this.statusBarLabel_ = null;
  this.responseHandler_ = responseHandler;
  this.json_ = {
    name: command ? command.name : 'Unknown command',
    sessionId: command['sessionId'],
    status: bot.ErrorCode.SUCCESS,
    value: ''
  };
  if (this.json_['sessionId'] && this.json_['sessionId']['value']) {
    this.json_['sessionId'] = this.json_['sessionId']['value'];
  }
  this.session = null;
};

Response.prototype = {

  /**
   * Updates the extension status label to indicate we are about to execute a
   * command.
   * @param {window} win The content window that the command will be executed on.
   */
  startCommand: function(win) {
    this.statusBarLabel_ = win.document.getElementById('fxdriver-label');
    if (this.statusBarLabel_) {
      this.statusBarLabel_.style.color = 'red';
    }
  },

  /**
   * Sends the encapsulated response to the registered callback.
   */
  send: function() {
    if (this.responseSent_) {
      // We shouldn't ever send the same response twice.
      return;
    }
    // Indicate that we are no longer executing a command.
    if (this.statusBarLabel_) {
      this.statusBarLabel_.style.color = 'black';
    }

    this.responseHandler_.handleResponse(JSON.stringify(this.json_));

    // Neuter ourselves
    this.responseSent_ = true;
  },

  /**
   * Sends a WebDriver error response.
   * @param {WebDriverError} e The error to send.
   */
  sendError: function(e) {
    // if (e instanceof WebDriverError) won't work here since
    // WebDriverError is defined in the utils.js subscript which is
    // loaded independently in this component and in the main driver
    // component.
    this.status = e.isWebDriverError ? e.code : bot.ErrorCode.UNKNOWN_ERROR;
    this.value = fxdriver.error.toJSON(e);
    this.send();
  },

  set name(name) { this.json_.name = name; },
  get name() { return this.json_.name; },
  set status(newStatus) { this.json_.status = newStatus; },
  get status() { return this.json_.status; },
  set value(val) { this.json_.value = val; },
  get value() { return this.json_.value; }
};


/**
 * Handles executing a command from the {@code CommandProcessor} once the window
 * has fully loaded.
 * @param {FirefoxDriver} driver The FirefoxDriver instance to execute the
 *     command with.
 * @param {Object} command JSON object describing the command to execute.
 * @param {Response} response The response object to send the command response
 *     in.
 * @param {Number} opt_sleepDelay The amount of time to wait before attempting
 *     the command again if the window is not ready.
 * @constructor
 */
var DelayedCommand = function(driver, command, response, opt_sleepDelay) {
  this.driver_ = driver;
  this.command_ = command;
  this.response_ = response;
  this.onBlank_ = false;
  this.sleepDelay_ = opt_sleepDelay || DelayedCommand.DEFAULT_SLEEP_DELAY;

  var activeWindow = response.session.getWindow();

  try {
    if (!activeWindow || activeWindow.closed) {
      this.loadGroup_ = {
        isPending: function() { return false; }
      };
    } else {
      var webNav = activeWindow.
          QueryInterface(Components.interfaces.nsIInterfaceRequestor).
          getInterface(Components.interfaces.nsIWebNavigation);
      this.loadGroup_ = webNav.
          QueryInterface(Components.interfaces.nsIInterfaceRequestor).
          getInterface(Components.interfaces.nsILoadGroup);
    }
  } catch (ex) {
    // Well this sucks. This can happen if the DOM gets trashed or if the window
    // is unexpectedly closed. We need to report this error to the user so they
    // can let us (webdriver-eng) know that the FirefoxDriver is busted.
    response.sendError(ex);
    // Re-throw the error so the command will be aborted.
    throw ex;
  }
};


/**
 * Default amount of time, in milliseconds, to wait before (re)attempting a
 * {@code DelayedCommand}.
 * @type {Number}
 */
DelayedCommand.DEFAULT_SLEEP_DELAY = 100;

/**
 * Executes the command after the specified delay.
 * @param {Number} ms The delay in milliseconds.
 */
DelayedCommand.prototype.execute = function(ms) {
  if ('unstable' != loadStrategy_ && !this.yieldedForBackgroundExecution_) {
    this.yieldedForBackgroundExecution_ = true;
    fxdriver.profiler.log(
      {'event': 'YIELD_TO_PAGE_LOAD', 'startorend': 'start'});
  }
  var self = this;
  this.driver_.window.setTimeout(function() {
    self.executeInternal_();
  }, ms);
};


/**
 * @return {boolean} Whether this instance should delay execution of its
 *     command for a pending request in the current window's nsILoadGroup.
 */
DelayedCommand.prototype.shouldDelayExecutionForPendingRequest_ = function() {
  if ('unstable' == loadStrategy_) {
    return false;
  }

  if (this.loadGroup_.isPending()) {
    var hasOnLoadBlocker = false;
    var numPending = 0;
    var requests = this.loadGroup_.requests;
    while (requests.hasMoreElements()) {
      var request = null;
      var rawRequest = requests.getNext();

      try {
        request = rawRequest.QueryInterface(Components.interfaces.nsIRequest);
      } catch (e) {
        // This may happen for pages that use WebSockets.
        // See https://bugzilla.mozilla.org/show_bug.cgi?id=765618

        fxdriver.logging.info('Ignoring non-nsIRequest: ' + rawRequest);
        continue;
      }

      var isPending = false;
      try {
        isPending = request.isPending();
      } catch (e) {
          // Normal during page load, which means we should just return "true"
        return true;
      }
      if (isPending) {
        numPending += 1;
        hasOnLoadBlocker = hasOnLoadBlocker ||
                         (request.name == 'about:document-onload-blocker');

        if (numPending > 1) {
          // More than one pending request, need to wait.
          return true;
        }
      }
    }

    if (numPending && !hasOnLoadBlocker) {
      fxdriver.logging.info('Ignoring pending about:document-onload-blocker ' +
        'request');
      // If we only have one pending request and it is not a
      // document-onload-blocker, we need to wait.  We do not wait for
      // document-onload-blocker requests since these are created when
      // one of document.[open|write|writeln] is called. If document.close is
      // never called, the document-onload-blocker request will not be
      // completed.
      return true;
    }
  }
  fxdriver.profiler.log(
      {'event': 'YIELD_TO_PAGE_LOAD', 'startorend': 'end'});
  return false;
};


DelayedCommand.prototype.checkPreconditions_ = function(preconditions, respond, parameters) {
  if (!preconditions) {
    return;
  }

  var toThrow = null;
  var length = preconditions.length;

  for (var i = 0; i < length; i++) {
    toThrow = preconditions[i](respond.session.getDocument(), parameters);
    if (toThrow) {
      throw toThrow;
    }
  }
};


/**
 * Attempts to execute the command.  If the window is not ready for the command
 * to execute, will set a timeout to try again.
 * @private
 */
DelayedCommand.prototype.executeInternal_ = function() {
  if (this.shouldDelayExecutionForPendingRequest_()) {
    return this.execute(this.sleepDelay_);
  }

  // Ugh! New windows open on "about:blank" before going to their
  // destination URL. This check attempts to tell the difference between a
  // newly opened window and someone actually wanting to do something on
  // about:blank.
  if (this.driver_.window.location == 'about:blank' && !this.onBlank_) {
    this.onBlank_ = true;
    return this.execute(this.sleepDelay_);
  } else {
    try {
      this.response_.name = this.command_.name;
      // TODO(simon): This is rampantly ugly, but allows an alert to kill the command
      // TODO(simon): This is never cleared, but _should_ be okay, because send wipes itself
      this.driver_.response_ = this.response_;

      var response = this.response_;
      DelayedCommand.execTimer = new fxdriver.Timer();
      var startTime = new Date().getTime();
      var endTime = startTime + this.response_.session.getImplicitWait();
      var name = this.command_.name;
      var driverFunction = this.driver_[name] || WebElement[name];
      var parameters = this.command_.parameters;

      var func = goog.bind(driverFunction, this.driver_,
          this.response_, parameters);
      var guards = goog.bind(this.checkPreconditions_, this,
          driverFunction.preconditions, this.response_, parameters);

      var toExecute = function() {
        try {
          guards();
          func();
        } catch (e) {
          if (new Date().getTime() < endTime) {
              DelayedCommand.execTimer.setTimeout(toExecute, 100);
          } else {
            if (!e.isWebDriverError) {
              fxdriver.logging.error('Exception caught by driver: ' + name +
                '(' + parameters + ')');
              fxdriver.logging.error(e);
            }
            response.sendError(e);
          }
        }
      };
      toExecute();
    } catch (e) {
      if (!e.isWebDriverError) {
        fxdriver.logging.error('Exception caught by driver: ' +
          this.command_.name + '(' + this.command_.parameters + ')');
        fxdriver.logging.error(e);
      }
      this.response_.sendError(e);
    }
  }
};


/**
 * Class for dispatching WebDriver requests.  Handles window locating commands
 * (e.g. switching, searching, etc.), all other commands are executed with the
 * {@code FirefoxDriver} through reflection.  Note this is a singleton class.
 * @constructor
 */
var nsCommandProcessor = function() {
  // Since we only support 3.0+, this check is enough to see if we're on 3.0
  if (!bot.userAgent.isProductVersion('3.5')) {
    eval(Utils.loadUrl('resource://fxdriver/json2.js'));
  }

  var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces['nsIPrefBranch']);

  if (prefs.prefHasUserValue('webdriver.load.strategy')) {
    loadStrategy_ = prefs.getCharPref('webdriver.load.strategy');
  }

  this.wrappedJSObject = this;
  this.wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].
      getService(Components.interfaces.nsIWindowMediator);
};

/**
 * Flags for the {@code nsIClassInfo} interface.
 * @type {Number}
 */
nsCommandProcessor.prototype.flags =
    Components.interfaces.nsIClassInfo.DOM_OBJECT;

/**
 * Implementaiton language detail for the {@code nsIClassInfo} interface.
 * @type {String}
 */
nsCommandProcessor.prototype.implementationLanguage =
    Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT;

/**
 * Processes a command request for the {@code FirefoxDriver}.
 * @param {string} jsonCommandString The command to execute, specified in a
 *     JSON string.
 * @param {nsIResponseHandler} responseHandler The callback to send the response
 *     to.
 */
nsCommandProcessor.prototype.execute = function(jsonCommandString,
                                                responseHandler) {
  var command, response;
  try {
    command = JSON.parse(jsonCommandString);
  } catch (ex) {
    response = JSON.stringify({
      'status': bot.ErrorCode.UNKNOWN_ERROR,
      'value': 'Error parsing command: "' + jsonCommandString + '"'
    });
    responseHandler.handleResponse(response);
    return;
  }

  response = new Response(command, responseHandler);

  // These commands do not require a session.
  if (command.name == 'newSession' ||
      command.name == 'quit' ||
      command.name == 'getStatus' ||
      command.name == 'getWindowHandles') {

    fxdriver.logging.info('Received command: ' + command.name);

    try {
      this[command.name](response, command.parameters);
    } catch (ex) {
      response.sendError(ex);
    }
    return;
  }

  var sessionId = command.sessionId;
  if (!sessionId) {
    response.sendError(new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
        'No session ID specified'));
    return;
  }

  sessionId = sessionId.value;
  try {
    response.session = Components.
      classes['@googlecode.com/webdriver/wdsessionstoreservice;1'].
      getService(Components.interfaces.nsISupports).
      wrappedJSObject.
      getSession(sessionId).
      wrappedJSObject;
  } catch (ex) {
    response.sendError(new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
        'Session not found: ' + sessionId));
    return;
  }

  fxdriver.logging.info('Received command: ' + command.name);

  if (command.name == 'deleteSession' ||
      command.name == 'getSessionCapabilities' ||
      command.name == 'switchToWindow' ||
      command.name == 'getLog' ||
      command.name == 'getAvailableLogTypes') {
    return this[command.name](response, command.parameters);
  }

  var sessionWindow = response.session.getChromeWindow();

  var driver = sessionWindow.fxdriver;  // TODO(jmleyba): We only need to store an ID on the window!
  if (!driver) {
    response.sendError(new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
        'Session [' + response.session.getId() + '] has no driver.' +
        ' The browser window may have been closed.'));
    return;
  }

  var contentWindow = sessionWindow.getBrowser().contentWindow;
  if (!contentWindow) {
    response.sendError(new WebDriverError(bot.ErrorCode.NO_SUCH_WINDOW,
        'Window not found. The browser window may have been closed.'));
    return;
  }

  if (driver.modalOpen) {
    if (command.name != 'getAlertText' &&
        command.name != 'setAlertValue' &&
        command.name != 'acceptAlert' &&
        command.name != 'dismissAlert') {
      var modalText = driver.modalOpen;
      var unexpectedAlertBehaviour = fxdriver.modals.getUnexpectedAlertBehaviour();
      switch (unexpectedAlertBehaviour) {
          case 'accept':
            fxdriver.modals.acceptAlert(driver);
            break;

          case 'ignore':
            // do nothing, ignore the alert
            break;

          // Dismiss is the default
          case 'dismiss':
          default:
            fxdriver.modals.dismissAlert(driver);
            break;
      }
      fxdriver.logging.error('Sending error from command ' +
        command.name + ' with alertText: ' + modalText);
      response.sendError(new WebDriverError(bot.ErrorCode.MODAL_DIALOG_OPENED,
          'Modal dialog present', {alert: {text: modalText}}));
      return;
    }
  }

  if (typeof driver[command.name] != 'function' && typeof WebElement[command.name] != 'function') {
    response.sendError(new WebDriverError(bot.ErrorCode.UNKNOWN_COMMAND,
        'Unrecognised command: ' + command.name));
    fxdriver.logging.error('Unknown command: ' + command.name);
    return;
  }

  response.startCommand(sessionWindow);
  new DelayedCommand(driver, command, response).execute(0);
};


/**
 * Changes the context of the caller to the specified window.
 * @param {Response} response The response object to send the command response
 *     in.
 * @param {{name: string}} parameters The command parameters.
 * @param {number} opt_searchAttempt Which attempt this is at finding the
 *     window to switch to.
 */
nsCommandProcessor.prototype.switchToWindow = function(response, parameters,
                                                       opt_searchAttempt) {
  var lookFor = parameters.name;
  var matches = function(win, lookFor) {
    return !win.closed &&
           (win.top && win.top.fxdriver) &&
           (win.content && win.content.name == lookFor) ||
           (win.top && win.top.fxdriver && win.top.fxdriver.id == lookFor);
  };

  var windowFound = this.searchWindows_('navigator:browser', function(win) {
    if (matches(win, lookFor)) {
      // Create a switch indicator file so the native events library
      // will know a window switch is in progress and will indeed
      // switch focus.
      notifyOfSwitchToWindow(win.top.fxdriver.id);
      win.focus();
      if (win.top.fxdriver) {
        response.session.setChromeWindow(win.top);
        response.value = response.session.getId();
        response.send();
      } else {
        response.sendError(new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
            'No driver found attached to top window!'));
      }
      // Found the desired window, stop the search.
      return true;
    }
  });

  // It is possible that the window won't be found on the first attempt. This is
  // typically true for anchors with a target attribute set. This search could
  // execute before the target window has finished loaded, meaning the content
  // window won't have a name or FirefoxDriver instance yet (see matches above).
  // If we don't find the window, set a timeout and try again.
  if (!windowFound) {
    // TODO(jmleyba): We should be sniffing the current windows to detect if
    // one is still loading vs. a brute force "try again"
    var searchAttempt = opt_searchAttempt || 0;
    if (searchAttempt > 3) {
      response.sendError(new WebDriverError(bot.ErrorCode.NO_SUCH_WINDOW,
          'Unable to locate window "' + lookFor + '"'));
    } else {
      var self = this;
      this.wm.getMostRecentWindow('navigator:browser').
          setTimeout(function() {
            self.switchToWindow(response, parameters, (searchAttempt + 1));
          }, 500);
    }
  }
};


/**
 * Retrieves a list of all known FirefoxDriver windows.
 * @param {Response} response The response object to send the command response
 *     in.
 */
nsCommandProcessor.prototype.getWindowHandles = function(response) {
  var res = [];
  this.searchWindows_('navigator:browser', function(win) {
    if (win.top && win.top.fxdriver) {
      res.push(win.top.fxdriver.id);
    } else if (win.content) {
      res.push(win.content.name);
    }
  });
  response.value = res;
  response.send();
};


/**
 * Retrieves the log for the given type.
 *
 * @param {!Response} response The response object to send the response in.
 * @param {!Object.<string, *>} parameters The parameters for the call.
 */
nsCommandProcessor.prototype.getLog = function(response, parameters) {
  var res = fxdriver.logging.getLog(parameters.type);

  // Convert log level object to string
  goog.array.forEach(res, function(entry) {
    entry.level = entry.level.name;
  });

  response.value = res;
  response.send();
};


/**
 * Retrieves available log types.
 *
 * @param {!Response} response The response object to send the response in.
 * @param {Object.<string, *>} parameters The parameters for the call.
 */
nsCommandProcessor.prototype.getAvailableLogTypes = function(response, 
    parameters) {
  response.value = fxdriver.logging.getAvailableLogTypes();
  response.send();
};


/**
 * Searches over a selection of windows, calling a visitor function on each
 * window found in the search.
 * @param {?string} search_criteria The category of windows to search or
 *     {@code null} to search all windows.
 * @param {function(!Window)} visitor_fn A visitor function to call with each
 *     window. The function may return true to indicate that the window search
 *     should abort early.
 * @return {boolean} Whether the visitor function short circuited the search.
 */
nsCommandProcessor.prototype.searchWindows_ = function(search_criteria,
                                                       visitor_fn) {
  var allWindows = this.wm.getEnumerator(search_criteria);
  while (allWindows.hasMoreElements()) {
    var win = allWindows.getNext();
    if (visitor_fn(win)) {
      return true;
    }
  }
  return false;
};


/**
 * Responds with general status information about this process.
 * @param {Response} response The object to send the command response in.
 */
nsCommandProcessor.prototype.getStatus = function(response) {
  var xulRuntime = Components.classes['@mozilla.org/xre/app-info;1'].
      getService(Components.interfaces.nsIXULRuntime);

  response.value = {
    'os': {
      'arch': (function() {
        try {
          // See https://developer.mozilla.org/en/XPCOM_ABI
          return (xulRuntime.XPCOMABI || 'unknown').split('-')[0];
        } catch (ignored) {
          return 'unknown';
        }
      })(),
      // See https://developer.mozilla.org/en/OS_TARGET
      'name': xulRuntime.OS,
      'version': 'unknown'
    },
    // TODO: load these values from build.properties
    'build': {
      'revision': 'unknown',
      'time': 'unknown',
      'version': 'unknown'
    }
  };
  response.send();
};


/**
 * Locates the most recently used FirefoxDriver window.
 * @param {Response} response The object to send the command response in.
 */
nsCommandProcessor.prototype.newSession = function(response, parameters) {
  var win = this.wm.getMostRecentWindow('navigator:browser');
  var driver = win.fxdriver;
  if (!driver) {
    response.sendError(new WebDriverError(bot.ErrorCode.UNKNOWN_ERROR,
        'No drivers associated with the window'));
  } else {
    var sessionStore = Components.
        classes['@googlecode.com/webdriver/wdsessionstoreservice;1'].
        getService(Components.interfaces.nsISupports);

    var desiredCapabilities = parameters['desiredCapabilities'];
    var requiredCapabilities = parameters['requiredCapabilities'];
    var session = sessionStore.wrappedJSObject.createSession(response,
        desiredCapabilities, requiredCapabilities, driver);

    session = session.wrappedJSObject;  // XPConnect...
    session.setChromeWindow(win);

    response.session = session;
    response.value = session.getId();

    fxdriver.logging.info('Created a new session with id: ' + session.getId());
  }

  response.send();
};


/**
 * Describes a session.
 * @param {Response} response The object to send the command response in.
 */
nsCommandProcessor.prototype.getSessionCapabilities = function(response) {
  var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
      getService(Components.interfaces.nsIXULAppInfo);
  var xulRuntime = Components.classes['@mozilla.org/xre/app-info;1'].
      getService(Components.interfaces.nsIXULRuntime);
  response.value = {
    'cssSelectorsEnabled': true,
    'browserName': 'firefox',
    'handlesAlerts': true,
    'javascriptEnabled': true,
    'nativeEvents': Utils.useNativeEvents(),
    // See https://developer.mozilla.org/en/OS_TARGET
    'platform': xulRuntime.OS,
    'rotatable': false,
    'takesScreenshot': true,
    'version': appInfo.version
  };

  var prefStore = fxdriver.moz.getService('@mozilla.org/preferences-service;1',
      'nsIPrefService');
  for (var cap in wdSessionStoreService.CAPABILITY_PREFERENCE_MAPPING) {
    var pref = wdSessionStoreService.CAPABILITY_PREFERENCE_MAPPING[cap];
    try {
      response.value[cap] = prefStore.getBoolPref(pref);
    } catch (e) {
      // An exception is thrown if the saught preference is not available.
      // For instance, a Firefox version not supporting HTML5 will not have
      // a preference for webStorageEnabled.
    }
  }

  response.send();
};


/**
 * Deletes the session associated with the current request.
 * @param {Response} response The object to send the command response in.
 */
nsCommandProcessor.prototype.deleteSession = function(response) {
  var sessionStore = Components.
      classes['@googlecode.com/webdriver/wdsessionstoreservice;1'].
      getService(Components.interfaces.nsISupports);
  sessionStore.wrappedJSObject.deleteSession(response.session.getId());
  response.send();
};


/**
 * Forcefully shuts down the Firefox application.
 * @param {Response} response The object to send the command response in.
 */
nsCommandProcessor.prototype.quit = function(response) {
  // Go ahead and respond to the command request to acknowledge that we are
  // shutting down. We do this because once we force a quit, there's no way
  // to respond.  Clients will just have to trust that this shutdown didn't
  // fail.  Or they could monitor the PID. Either way, not much we can do about
  // it in here.
  response.send();

  wdSession.quitBrowser(500);
};


nsCommandProcessor.prototype.getInterfaces = function(count) {
  var ifaces = [
    Components.interfaces.nsICommandProcessor,
    Components.interfaces.nsISupports
  ];
  count.value = ifaces.length;
  return ifaces;
};


nsCommandProcessor.prototype.QueryInterface = function(aIID) {
  if (!aIID.equals(Components.interfaces.nsICommandProcessor) &&
      !aIID.equals(Components.interfaces.nsISupports)) {
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
  return this;
};


nsCommandProcessor.CLASS_ID =
    Components.ID('{692e5117-a4a2-4b00-99f7-0685285b4db5}');
nsCommandProcessor.CLASS_NAME = 'Firefox WebDriver CommandProcessor';
nsCommandProcessor.CONTRACT_ID =
    '@googlecode.com/webdriver/command-processor;1';


/**
 * Factory object for obtaining a reference to the singleton instance of
 * {@code CommandProcessor}.
 */
nsCommandProcessor.Factory = {
  instance_: null,

  createInstance: function(aOuter, aIID) {
    if (aOuter != null) {
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    }
    if (!this.instance_) {
      this.instance_ = new nsCommandProcessor();
    }
    return this.instance_.QueryInterface(aIID);
  }
};


/**
 * Module definition for registering this XPCOM component.
 */
nsCommandProcessor.Module = {
  firstTime_: true,

  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) {
    if (this.firstTime_) {
      this.firstTime_ = false;
      throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
    }
    aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar).
        registerFactoryLocation(
            nsCommandProcessor.CLASS_ID,
            nsCommandProcessor.CLASS_NAME,
            nsCommandProcessor.CONTRACT_ID,
            aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation) {
    aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar).
        unregisterFactoryLocation(nsCommandProcessor.CLASS_ID, aLocation);
  },

  getClassObject: function(aCompMgr, aCID, aIID) {
    if (!aIID.equals(Components.interfaces.nsIFactory)) {
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    } else if (!aCID.equals(nsCommandProcessor.CLASS_ID)) {
      throw Components.results.NS_ERROR_NO_INTERFACE;
    }
    return nsCommandProcessor.Factory;
  },

  canUnload: function() {
    return true;
  }
};


/**
 * Module initialization.
 */
NSGetModule = function() {
  return nsCommandProcessor.Module;
};

nsCommandProcessor.prototype.classID = nsCommandProcessor.CLASS_ID;
fxdriver.moz.load('resource://gre/modules/XPCOMUtils.jsm');
if (XPCOMUtils.generateNSGetFactory) {
  /** @const */ NSGetFactory = XPCOMUtils.generateNSGetFactory([nsCommandProcessor]);
}
