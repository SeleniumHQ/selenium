/*
 Copyright 2007-2010 WebDriver committers
 Copyright 2007-2010 Google Inc.
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

goog.provide('wdSession');

goog.require('fxdriver.moz');
goog.require('fxdriver.logging');

/**
 * An active FirefoxDriver session.
 * @constructor
 */
wdSession = function() {
  /**
   * A wrapped self-reference for XPConnect.
   * @type {wdSession}
   */
  this.wrappedJSObject = this;
};


/**
 * This component's ID.
 * @type {nsIJSID}
 */
wdSession.CLASS_ID = Components.ID('{e193dc71-5b1d-4fea-b4c2-ec71f4557f0f}');


/**
 * This component's class name.
 * @type {string}
 */
wdSession.CLASS_NAME = 'wdSession';


/**
 * This component's contract ID.
 * @type {string}
 */
wdSession.CONTRACT_ID = '@googlecode.com/webdriver/wdsession;1';


/**
 * This session's ID.
 * @type {?string}
 * @private
 */
wdSession.prototype.id_ = null;


/**
 * The main chrome window that this is session is currently focused on. All
 * command's for this session will be directed at the current window, which
 * may be inside a [I]FRAME, within this window.
 * @type {?ChromeWindow}
 * @private
 */
wdSession.prototype.chromeWindow_ = null;


/**
 * The content window this session is currently focused on.
 * @type {?nsIDOMWindow}
 * @private
 */
wdSession.prototype.window_ = null;


/**
 * The current user input speed setting for this session.
 * @type {number}
 * @private
 */
wdSession.prototype.inputSpeed_ = 1;


/**
 * The amount of time, in milliseconds, this session should wait for an element
 * to be located when performing a search.
 * When searching for a single element, the driver will wait up to this amount
 * of time for the element to be located before returning an error.
 * When searching for multiple elements, the driver will wait up to this amount
 * of time for at least one element to be located before returning an empty
 * list.
 * @type {number}
 * @private
 */
wdSession.prototype.implicitWait_ = 0;

/**
 * The amount of time in milliseconds to wait for a page to load before timing
 * out. A value less than 0 means that waits will be indefinite.
 * @type {number}
 * @private
 */
wdSession.prototype.pageLoadTimeout_ = -1;

/**
 * Current position of the mouse cursor, in X,Y coordinates.
 */
wdSession.prototype.mousePosition_ = {
  x: 0,
  y: 0,
  // When the mouse button is pressed (pressed == true), use these
  // coordinates rather than x,y
  viewPortXOffset: 0,
  viewPortYOffset: 0,
  initialized: false,
  pressed: false
};


/**
 * The amount of time, in milliseconds, this session should wait for
 * asynchronous scripts to finish executing. If set to 0, then the timeout will
 * not fire until the next event loop after the script is executed. This will
 * give scripts that employ a 0-based setTimeout to finish.
 * @type {number}
 * @private
 */
wdSession.prototype.scriptTimeout_ = 0;


/** @see nsISupports.QueryInterface */
wdSession.prototype.QueryInterface = function(aIID) {
  if (aIID.equals(Components.interfaces.nsISupports)) {
    return this;
  }
  throw Components.results.NS_ERROR_NO_INTERFACE;
};


/** @return {?string} This session's ID. */
wdSession.prototype.getId = function() {
  return this.id_;
};


/**
 * Sets this session's ID.
 * @param {string} id The session ID.
 */
wdSession.prototype.setId = function(id) {
  this.id_ = id;
};


/**
 * @return {browser|tabbrowser} The browser object for this session's current
 *     window.
 */
wdSession.prototype.getBrowser = function() {
  return this.chromeWindow_.getBrowser();
};


/** @return {?ChromeWindow} The chrome window for this session. */
wdSession.prototype.getChromeWindow = function() {
  return this.chromeWindow_;
};


/** @return {?nsIDOMWindow} This session's current window. */
wdSession.prototype.getWindow = function() {
  var win;
  try {
    if (this.window_) {
      win = this.window_.get();
    }
  } catch (ex) {
    fxdriver.logging.error(ex);
    // ignore exception and try other way
  }

  if (!win || !win.document) {
    // Uh-oh, we lost our DOM! Try to recover by changing focus to the
    // main content window.
    win = this.chromeWindow_.getBrowser().contentWindow;
    this.setWindow(win);
  }

  return win;
};


/** @return {nsIDOMDocument} This session's current document. */
wdSession.prototype.getDocument = function() {
  return this.getWindow().document;
};


/**
 * Set the chrome window for this session; will also set the current window to
 * the main content window inside the chrome window.
 * @param {ChromeWindow} win The new chrome window.
 */
wdSession.prototype.setChromeWindow = function(win) {
  this.chromeWindow_ = win;
  this.setWindow(win.getBrowser().contentWindow);
};


/**
 * Set this session's current window.
 * @param {nsIDOMWindow} win The new window.
 */
wdSession.prototype.setWindow = function(win) {
  this.window_ = Components.utils.getWeakReference(win);

  // Our other means of testing for window unloads rely on window.closed, which
  // can sometimes not be set for frames/iframes (because in most javascript
  // contexts, it's not possible to access window after a window has closed
  // except for top-level windows (e.g. popups).
  // Fall back to an unload event if we need to.

  var self = this;
  var handler = function(e) {
    if (win == win.top) {
      self.window_ = null;
    }
  };

  // Listen in capture mode to force us to be called (can't stop event
  // propagation in capture mode)
  // unload can only be called when the window is actually closing;
  // window closing can only be cancelled in the beforeload event phase.
  win.addEventListener('unload',
                        handler,
                        /*useCapture=*/true);
};


/**
 * @return {number} The user input speed for this session.
 */
wdSession.prototype.getInputSpeed = function() {
  return this.inputSpeed_;
};


/**
 * Sets the user input speed for this session.
 * @param {number} speed The new input speed.
 */
wdSession.prototype.setInputSpeed = function(speed) {
  this.inputSpeed_ = speed;
};


/**
 * @return {number} The amount of time, in milliseconds, this session should
 *     wait for an element to be located on the page.
 */
wdSession.prototype.getImplicitWait = function() {
  return this.implicitWait_;
};


/**
 * Sets the amount of time, in milliseconds, this session should wait for an
 * element to be located on the page.
 * @param {number} wait The amount of time to wait.
 */
wdSession.prototype.setImplicitWait = function(wait) {
  this.implicitWait_ = Math.max(wait, 0);
};


/**
 * @return {number} The current timeout for page loads.
 */
wdSession.prototype.getPageLoadTimeout = function() {
  return this.pageLoadTimeout_;
};


/**
 * Set the timeout allowed before a page load throws an exception. Setting to a
 * negative number makes the timeout indefinite.
 *
 * @param {number} timeout The new timeout.
 */
wdSession.prototype.setPageLoadTimeout = function(timeout) {
  this.pageLoadTimeout_ = timeout;
};

/**
 * @return {number} the amount of time, in milliseconds, that asynchronous
 *     scripts are allowed to run before timing out.
 */
wdSession.prototype.getScriptTimeout = function() {
  return this.scriptTimeout_;
};


/**
 * Sets the amount of time, in milliseconds, that asynchronous scripts are
 *     allowed to run before timing out.
 * @param {number} timeout The new timeout.
 */
wdSession.prototype.setScriptTimeout = function(timeout) {
  this.scriptTimeout_ = Math.max(timeout, 0);
};

/**
 * @return {object} The current position of the mouse cursor.
 */
wdSession.prototype.getMousePosition = function() {
  // Make a defensive copy here, because changing this actual object can have
  // really bad and confusing side-effects.
  var toReturn = {};
  for (var key in this.mousePosition_) {
    toReturn[key] = this.mousePosition_[key];
  }
  return toReturn;
};

/**
 * Sets the current mouse position.
 * @param {number} x coordinates.
 * @param {number} y coordinates.
 */
wdSession.prototype.setMousePosition = function(x, y) {
  this.mousePosition_.x = x;
  this.mousePosition_.y = y;
  this.mousePosition_.initialized = true;
};


wdSession.prototype.isMousePressed = function() {
  return this.mousePosition_.pressed;
};


wdSession.prototype.setMousePressed = function(isPressed) {
  this.mousePosition_.pressed = isPressed;
};

wdSession.prototype.setMouseViewportOffset = function(x, y) {
  this.mousePosition_.viewPortXOffset = x;
  this.mousePosition_.viewPortYOffset = y;
};

/**
 * Close the browser after a given time delay.
 * @param {number} timeDelay The time delay to use.
 * @return {!fxdriver.Timer} The timer for the close operation.
 */
wdSession.quitBrowser = function(timeDelay) {
  // Use an nsITimer to give the response time to go out.
  var event = function(timer) {
      // Create a switch file so the native events library will
      // let all events through in case of a close.
      notifyOfCloseWindow();
      Components.classes['@mozilla.org/toolkit/app-startup;1'].
          getService(Components.interfaces.nsIAppStartup).
          quit(Components.interfaces.nsIAppStartup.eForceQuit);
  };
  wdSession.quitTimer = new fxdriver.Timer();
  wdSession.quitTimer.setTimeout(event, timeDelay);
  return wdSession.quitTimer;
};


///////////////////////////////////////////////////////////////////
//
// nsIFactory functions
//
///////////////////////////////////////////////////////////////////

/** @constructor */
function wdSessionFactory() {
}


/** @see nsIFactory.createInstance */
wdSessionFactory.prototype.createInstance = function(aOuter, aIID) {
  if (aOuter != null) {
    throw Components.results.NS_ERROR_NO_AGGREGATION;
  }
  return new wdSession().QueryInterface(aIID);
};

///////////////////////////////////////////////////////////////////
//
// nsIModule functions
//
///////////////////////////////////////////////////////////////////

/** @constructor */
function wdSessionModule() {
}


/**
 * Whether this module has already been registered.
 * @type {!boolean}
 * @private
 */
wdSessionModule.prototype.hasRegistered_ = false;


/** @see nsIModule.registerSelf */
wdSessionModule.prototype.registerSelf = function(aCompMgr, aFileSpec, aLocation, aType) {
  if (this.hasRegistered_) {
    throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
  }
  aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar).
      registerFactoryLocation(
          wdSession.CLASS_ID,
          wdSession.CLASS_NAME,
          wdSession.CONTRACT_ID,
          aFileSpec, aLocation, aType);
  this.hasRegistered_ = true;
};


/** @see nsIModule.unregisterSelf */
wdSessionModule.prototype.unregisterSelf = function(aCompMgr, aLocation) {
  aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar).
      unregisterFactoryLocation(wdSession.CLASS_ID, aLocation);
};


/** @see nsIModule.getClassObject */
wdSessionModule.prototype.getClassObject = function(aCompMgr, aCID, aIID) {
  if (!aIID.equals(Components.interfaces.nsIFactory)) {
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
  } else if (!aCID.equals(wdSession.CLASS_ID)) {
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
  return new wdSessionFactory();
};


/** @see nsIModule.canUnload */
wdSessionModule.prototype.canUnload = function() {
  return true;
};



/**
 * Module initialization.
 */
NSGetModule = function() {
  return new wdSessionModule();
};

wdSession.prototype.classID = wdSession.CLASS_ID;
fxdriver.moz.load('resource://gre/modules/XPCOMUtils.jsm');
if (XPCOMUtils.generateNSGetFactory) {
  /** @const */ NSGetFactory = XPCOMUtils.generateNSGetFactory([wdSession]);
}

