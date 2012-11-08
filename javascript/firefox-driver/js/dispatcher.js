/*
 Copyright 2007-2010 WebDriver committers
 Copyright 2007-2010 Google Inc.

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


goog.provide('Dispatcher');
goog.provide('Resource');

goog.require('Request');
goog.require('Response');
goog.require('Utils');
goog.require('bot.ErrorCode');
goog.require('fxdriver.error');
goog.require('fxdriver.logging');


/**
 * Dispatches commands received by the WebDriver server.
 * @constructor
 */
Dispatcher = function() {
  this.resources_ = [];
  this.init_();
};


/**
 * Utility function used to respond to a command that is recognised, but not
 * implemented. Returns a 501.
 * @param {Request} request The request to respond to.
 * @param {Response} response Class used to send the response.
 */
Dispatcher.notImplemented = function(request, response) {
  response.sendError(Response.NOT_IMPLEMENTED, 'Unsupported command',
      'text/plain');
};


/**
 * Returns a function that translates a WebDriver HTTP request to a legacy
 * command.
 * @param {string} name The legacy command name.
 * @return {function(Request, Response)} The translation function.
 * @private
 */
Dispatcher.executeAs = function(name) {
  return function(request, response) {
    var json = {
      'name': name,
      'sessionId': {
        'value': request.getAttribute('sessionId')
      },
      'parameters': JSON.parse(request.getBody() || '{}')
    };

    // All request attributes, excluding sessionId and parameters also passed
    // the body payload, should be added to the parameters.
    var attributeNames = request.getAttributeNames();
    for (var attrName; attrName = attributeNames.shift();) {
      if (attrName != 'sessionId' && !json['parameters'][attrName]) {
        json['parameters'][attrName] = request.getAttribute(attrName);
      }
    }

    var jsonString = JSON.stringify(json);
    var callback = function(jsonResponseString) {
      var jsonResponse = JSON.parse(jsonResponseString);
      // Going to need more granularity here I think.
      if (jsonResponse.status != bot.ErrorCode.SUCCESS) {
        response.setStatus(Response.INTERNAL_ERROR);
      }

      response.setContentType('application/json');
      response.setBody(jsonResponseString);
      response.commit();
    };

    // Dispatch the command.
    Components.classes['@googlecode.com/webdriver/command-processor;1'].
        getService(Components.interfaces.nsICommandProcessor).
        execute(jsonString, callback);
  };
};


/**
 * Creates a special handler for translating a request for a new session to a
 * request understood by the legacy nsICommandProcessor.
 */
Dispatcher.translateNewSession = function() {
  if (!bot.userAgent.isProductVersion('3.5')) {
    // Smooth
    eval(Utils.loadUrl('resource://fxdriver/json2.js'));
  }

  return function(request, response) {
    var requestObject = {
      'name': 'newSession',
      'parameters': JSON.parse(request.getBody())
    };
    var callback = function(jsonResponseString) {
      var jsonResponse = JSON.parse(jsonResponseString);
      // Going to need more granularity here I think.
      if (jsonResponse.status != 0) {
        response.sendError(Response.INTERNAL_ERROR,
            jsonResponseString, 'application/json');
      } else {
        var url = request.getRequestUrl();
        response.setStatus(Response.SEE_OTHER);
        response.setHeader('Location',
            url.scheme + '://' + url.host + ':' + url.hostPort + url.path + '/' +
                jsonResponse.value);
        response.commit();
      }
    };

    // Dispatch the command.
    Components.classes['@googlecode.com/webdriver/command-processor;1'].
        getService(Components.interfaces.nsICommandProcessor).
        execute(JSON.stringify(requestObject), callback);
  };
};


/**
 * Initializes the command bindings for this dispatcher.
 * @private
 */
Dispatcher.prototype.init_ = function() {
  this.bind_('/config/drivers').  // Recognised, but not supported.
      on(Request.Method.POST, Dispatcher.notImplemented);

  this.bind_('/status').
      on(Request.Method.GET, Dispatcher.executeAs('getStatus'));

  this.bind_('/session').
      on(Request.Method.POST, Dispatcher.translateNewSession());

  this.bind_('/session/:sessionId').
      on(Request.Method.GET, Dispatcher.executeAs('getSessionCapabilities')).
      on(Request.Method.DELETE, Dispatcher.executeAs('quit'));

  this.bind_('/session/:sessionId/window_handle').
      on(Request.Method.GET, Dispatcher.executeAs('getCurrentWindowHandle'));
  this.bind_('/session/:sessionId/window_handles').
      on(Request.Method.GET, Dispatcher.executeAs('getWindowHandles'));

  this.bind_('/session/:sessionId/speed').
      on(Request.Method.GET, Dispatcher.executeAs('getSpeed')).
      on(Request.Method.POST, Dispatcher.executeAs('setSpeed'));

  this.bind_('/session/:sessionId/timeouts').
    on(Request.Method.POST, Dispatcher.executeAs('setTimeout'));

  this.bind_('/session/:sessionId/timeouts/implicit_wait').
      on(Request.Method.POST, Dispatcher.executeAs('implicitlyWait'));
  this.bind_('/session/:sessionId/timeouts/async_script').
      on(Request.Method.POST, Dispatcher.executeAs('setScriptTimeout'));

  this.bind_('/session/:sessionId/url').
      on(Request.Method.GET, Dispatcher.executeAs('getCurrentUrl')).
      on(Request.Method.POST, Dispatcher.executeAs('get'));

  this.bind_('/session/:sessionId/alert').
    on(Request.Method.GET, Dispatcher.executeAs('getAlert'));
  this.bind_('/session/:sessionId/accept_alert').
    on(Request.Method.POST, Dispatcher.executeAs('acceptAlert'));
  this.bind_('/session/:sessionId/dismiss_alert').
    on(Request.Method.POST, Dispatcher.executeAs('dismissAlert'));
  this.bind_('/session/:sessionId/alert_text').
    on(Request.Method.GET, Dispatcher.executeAs('getAlertText')).
    on(Request.Method.POST, Dispatcher.executeAs('setAlertValue'));

  this.bind_('/session/:sessionId/alert_text').
    on(Request.Method.GET, Dispatcher.executeAs('getAlertText'));

  this.bind_('/session/:sessionId/forward').
      on(Request.Method.POST, Dispatcher.executeAs('goForward'));
  this.bind_('/session/:sessionId/back').
      on(Request.Method.POST, Dispatcher.executeAs('goBack'));
  this.bind_('/session/:sessionId/refresh').
      on(Request.Method.POST, Dispatcher.executeAs('refresh'));

  this.bind_('/session/:sessionId/execute').
      on(Request.Method.POST, Dispatcher.executeAs('executeScript'));
  this.bind_('/session/:sessionId/execute_async').
      on(Request.Method.POST, Dispatcher.executeAs('executeAsyncScript'));

  this.bind_('/session/:sessionId/source').
      on(Request.Method.GET, Dispatcher.executeAs('getPageSource'));
  this.bind_('/session/:sessionId/title').
      on(Request.Method.GET, Dispatcher.executeAs('getTitle'));

  this.bind_('/session/:sessionId/element').
      on(Request.Method.POST, Dispatcher.executeAs('findElement'));
  this.bind_('/session/:sessionId/elements').
      on(Request.Method.POST, Dispatcher.executeAs('findElements'));
  this.bind_('/session/:sessionId/element/active').
      on(Request.Method.POST, Dispatcher.executeAs('getActiveElement'));

  this.bind_('/session/:sessionId/element/:id').
      // TODO: implement
      on(Request.Method.GET, Dispatcher.notImplemented);

  this.bind_('/session/:sessionId/element/:id/element').
      on(Request.Method.POST, Dispatcher.executeAs('findChildElement'));
  this.bind_('/session/:sessionId/element/:id/elements').
      on(Request.Method.POST, Dispatcher.executeAs('findChildElements'));

  this.bind_('/session/:sessionId/element/:id/text').
      on(Request.Method.GET, Dispatcher.executeAs('getElementText'));
  this.bind_('/session/:sessionId/element/:id/submit').
      on(Request.Method.POST, Dispatcher.executeAs('submitElement'));

  this.bind_('/session/:sessionId/element/:id/value').
      on(Request.Method.POST, Dispatcher.executeAs('sendKeysToElement'));

  this.bind_('/session/:sessionId/element/:id/name').
      on(Request.Method.GET, Dispatcher.executeAs('getElementTagName'));

  this.bind_('/session/:sessionId/element/:id/clear').
      on(Request.Method.POST, Dispatcher.executeAs('clearElement'));

  this.bind_('/session/:sessionId/element/:id/selected').
      on(Request.Method.GET, Dispatcher.executeAs('isElementSelected'));

  this.bind_('/session/:sessionId/element/:id/enabled').
      on(Request.Method.GET, Dispatcher.executeAs('isElementEnabled'));
  this.bind_('/session/:sessionId/element/:id/displayed').
      on(Request.Method.GET, Dispatcher.executeAs('isElementDisplayed'));

  this.bind_('/session/:sessionId/element/:id/location').
      on(Request.Method.GET, Dispatcher.executeAs('getElementLocation'));
  this.bind_('/session/:sessionId/element/:id/location_in_view').
      on(Request.Method.GET, Dispatcher.executeAs(
          'getElementLocationOnceScrolledIntoView'));

  this.bind_('/session/:sessionId/element/:id/size').
      on(Request.Method.GET, Dispatcher.executeAs('getElementSize'));

  this.bind_('/session/:sessionId/element/:id/css/:propertyName').
      on(Request.Method.GET,
         Dispatcher.executeAs('getElementValueOfCssProperty'));
  this.bind_('/session/:sessionId/element/:id/attribute/:name').
      on(Request.Method.GET, Dispatcher.executeAs('getElementAttribute'));
  this.bind_('/session/:sessionId/element/:id/equals/:other').
      on(Request.Method.GET, Dispatcher.executeAs('elementEquals'));

  this.bind_('/session/:sessionId/cookie').
      on(Request.Method.GET, Dispatcher.executeAs('getCookies')).
      on(Request.Method.POST, Dispatcher.executeAs('addCookie')).
      on(Request.Method.DELETE, Dispatcher.executeAs('deleteAllCookies'));

  this.bind_('/session/:sessionId/cookie/:name').
      on(Request.Method.DELETE, Dispatcher.executeAs('deleteCookie'));

  this.bind_('/session/:sessionId/frame').
      on(Request.Method.POST, Dispatcher.executeAs('switchToFrame'));
  this.bind_('/session/:sessionId/window').
      on(Request.Method.POST, Dispatcher.executeAs('switchToWindow')).
      on(Request.Method.DELETE, Dispatcher.executeAs('close'));

  this.bind_('/session/:sessionId/window/:windowHandle/size').
      on(Request.Method.POST, Dispatcher.executeAs('setWindowSize')).
      on(Request.Method.GET, Dispatcher.executeAs('getWindowSize'));

  this.bind_('/session/:sessionId/window/:windowHandle/position').
      on(Request.Method.POST, Dispatcher.executeAs('setWindowPosition')).
      on(Request.Method.GET, Dispatcher.executeAs('getWindowPosition'));

  this.bind_('/session/:sessionId/window/:windowHandle/maximize').
      on(Request.Method.POST, Dispatcher.executeAs('maximizeWindow'));

  this.bind_('/session/:sessionId/window/:windowHandle/restore').
      on(Request.Method.POST, Dispatcher.executeAs('restoreWindow'));

  this.bind_('/session/:sessionId/screenshot').
      on(Request.Method.GET, Dispatcher.executeAs('screenshot'));

  this.bind_('/session/:sessionId/ime/available_engines').
      on(Request.Method.GET, Dispatcher.executeAs('imeGetAvailableEngines'));
  this.bind_('/session/:sessionId/ime/active_engine').
      on(Request.Method.GET, Dispatcher.executeAs('imeGetActiveEngine'));
  this.bind_('/session/:sessionId/ime/activated').
      on(Request.Method.GET, Dispatcher.executeAs('imeIsActivated'));
  this.bind_('/session/:sessionId/ime/deactivate').
      on(Request.Method.POST, Dispatcher.executeAs('imeDeactivate'));
  this.bind_('/session/:sessionId/ime/activate').
      on(Request.Method.POST, Dispatcher.executeAs('imeActivateEngine'));

  // Mouse emulation
  this.bind_('/session/:sessionId/element/:id/click').
      on(Request.Method.POST, Dispatcher.executeAs('clickElement'));
  this.bind_('/session/:sessionId/moveto').
      on(Request.Method.POST, Dispatcher.executeAs('mouseMove'));
  this.bind_('/session/:sessionId/buttondown').
      on(Request.Method.POST, Dispatcher.executeAs('mouseDown'));
  this.bind_('/session/:sessionId/buttonup').
      on(Request.Method.POST, Dispatcher.executeAs('mouseUp'));
  this.bind_('/session/:sessionId/click').
      on(Request.Method.POST, Dispatcher.executeAs('mouseClick'));
  this.bind_('/session/:sessionId/doubleclick').
      on(Request.Method.POST, Dispatcher.executeAs('mouseDoubleClick'));
  // Keyboard emulation
  this.bind_('/session/:sessionId/keys').
      on(Request.Method.POST, Dispatcher.executeAs('sendKeysToActiveElement'));

  // Logging
  this.bind_('/session/:sessionId/log').
      on(Request.Method.POST, Dispatcher.executeAs('getLog'));
  this.bind_('/session/:sessionId/log/types').
      on(Request.Method.GET, Dispatcher.executeAs('getAvailableLogTypes'));

  // HTML 5
  this.bind_('/session/:sessionId/browser_connection').
      on(Request.Method.GET, Dispatcher.executeAs('isOnline'));

  this.bind_('/session/:sessionId/application_cache/status').
      on(Request.Method.GET, Dispatcher.executeAs('getAppCacheStatus'));

  // --------------------------------------------------------------------------
  // Firefox extensions to the wire protocol.
  // --------------------------------------------------------------------------

  this.bind_('/extensions/firefox/quit').
      on(Request.Method.POST, Dispatcher.executeAs('quit'));
};


/**
 * Binds a resource to the given path.
 * @param {string} path The resource path.
 * @return {Resource} The bound resource.
 */
Dispatcher.prototype.bind_ = function(path) {
  var resource = new Resource(path);
  this.resources_.push(resource);
  return resource;
};



/**
 * Dispatches a request to the appropriately registered handler.
 * @param {Request} request The request to dispatch.
 * @param {Response} response The request response.
 */
Dispatcher.prototype.dispatch = function(request, response) {
  // We only support one servlet, mapped to /hub/*
  // TODO: be more flexible.
  var path = request.getPathInfo();
  if (path.indexOf('/hub') != 0) {
    response.sendError(Response.NOT_FOUND);
    return;
  }
  request.setServletPath('/hub');
  path = request.getPathInfo();

  var bestMatchResource;
  for (var i = 0; i < this.resources_.length; i++) {
    if (this.resources_[i].isResourceFor(path)) {
      if (!bestMatchResource ||
          bestMatchResource.getNumVariablePathSegments() <
          this.resources_[i].getNumVariablePathSegments()) {
        bestMatchResource = this.resources_[i];
      }
    }
  }

  if (bestMatchResource) {
    try {
      bestMatchResource.setRequestAttributes(request);
      bestMatchResource.handle(request, response);
    } catch (ex) {
      fxdriver.logging.error(ex);
      response.sendError(Response.INTERNAL_ERROR, JSON.stringify({
        status: bot.ErrorCode.UNKNOWN_ERROR,
        value: fxdriver.error.toJSON(ex)
      }), 'application/json');
    }
  } else {
    response.sendError(Response.NOT_FOUND,
        'Unrecognized command: ' + request.getMethod() + ' ' +
            request.getPathInfo(),
        'text/plain');
  }
};


/**
 * Defines a resource in the WebDriver REST service locatable at the given path.
 * Any path segments prefixed with a ":" indicate that segment is a variable
 * unique to a resource. For example, in the path "/session/:sessionId",
 * ":sessionId" is a variable that can be changed to specify different sessions.
 * @param {!string} path The path that this resource is accessible from.
 * @constructor
 */
Resource = function(path) {

  /**
   * The request pattern that this resource is located at.
   * @type {!string}
   * @const
   * @private
   */
  this.path_ = path;

  /**
   * The individual path segments for this resource.
   * @type {Array.<string>}
   * @const
   * @private
   */
  this.pathSegments_ = path.split('/');

  /**
   * A map of handler functions, by HTTP method, that can service requests to
   * this resource.
   * @type {!Object}
   * @const
   * @private
   */
  this.handlers_ = {};

  for (var i = 0; i < this.pathSegments_.length; i++) {
    if (this.pathSegments_[i].indexOf(Resource.VARIABLE_PATH_SEGMENT_PREFIX_)) {
      this.numVariablePathSegments_ += 1;
    }
  }
};


/**
 * The number of path segments for this resource that are variables.
 * @type {number}
 * @private
 */
Resource.prototype.numVariablePathSegments_ = 0;


/** @return {string} The path mapped to this resource. */
Resource.prototype.getPath = function() {
  return this.path_;
};


/** @return {number} The number of variable path segments for this resource. */
Resource.prototype.getNumVariablePathSegments = function() {
  return this.numVariablePathSegments_;
};


/**
 * Sets the handler function for this resource when a request is received using
 * the given HTTP method. This function will override any previously set
 * handlers.
 * @param {!Request.Method} httpMethod The request method the function can
 *     handle.
 * @param {function(Request, Response)} handlerFn The function that will handle
 *     all requests for this resource using the given HTTP method.
 * @return {!Resource} A self reference for chained calls.
 */
Resource.prototype.on = function(httpMethod, handlerFn) {
  this.handlers_[httpMethod] = handlerFn;
  return this;
};


/**
 * Determines if this is the resource for the given path.
 * @param {!string} path The resource path to test.
 * @return {boolean} Whether this resource is mapped to the given path.
 */
Resource.prototype.isResourceFor = function(path) {
  var allParts = path.split('/');
  if (this.pathSegments_.length != allParts.length) {
    return false;
  }
  for (var i = 0; i < this.pathSegments_.length; i++) {
    if (this.pathSegments_[i] != allParts[i] &&
        !/^:/.test(this.pathSegments_[i])) {
      return false;
    }
  }
  return true;
};


/**
 * Sets request attributes by the named path variables for this resource. For
 * each named path segment variable for this resource, the value of the
 * corresponding path segment in the request will be stored as the request
 * attribute's value.
 * @param {Request} request The request to update.
 */
Resource.prototype.setRequestAttributes = function(request) {
  var allParts = request.getPathInfo().split('/');
  for (var i = 0; i < this.pathSegments_.length; i++) {
    if (/^:/.test(this.pathSegments_[i])) {
      var decodedValue = decodeURIComponent(allParts[i]);
      request.setAttribute(
          this.pathSegments_[i].replace(/^:/, ''), decodedValue);
    }
  }
};


/**
 * Handles a request to this resource. Will return a 405 if this resource does
 * not permit the HTTP method used for the request.
 * @param {Request} request The request to handle.
 * @param {Response} response For sending the response.
 * @throws If this resource cannot handle the request.
 */
Resource.prototype.handle = function(request, response) {
  if (!this.isResourceFor(request.getPathInfo())) {
    throw Error('Request does not map to this resource:' +
        '\n  requestPath:  ' + request.getPathInfo() +
        '\n  resourcePath: ' + this.path_);
  }

  var requestMethod = request.getMethod();

  if (requestMethod == Request.Method.OPTIONS) {
    response.setHeader('Allow', this.getAllowedMethods_());
    response.setStatus(Response.OK);
    response.setBody('');
    response.commit();
    return;
  }

  if (requestMethod == Request.Method.HEAD) {
    requestMethod = Request.Method.GET;
  }

  var handlerFn = this.handlers_[requestMethod];

  if (handlerFn) {
    handlerFn(request, response);
  } else {
    response.setHeader('Allow', this.getAllowedMethods_());
    response.setContentType('text/plain');
    response.sendError(Response.METHOD_NOT_ALLOWED,
        'Method "' + request.getMethod() + '" not allowed for command ' +
            '"' + this.path_ + '"');
  }
};


/**
 * @return {string} A comma-delimitted list of HTTP methods allowed by this
 *     resource.
 * @private
 */
Resource.prototype.getAllowedMethods_ = function() {
  var allowed = [];
  for (var method in this.handlers_) {
    allowed.push(method);
  }

  // We always respond to OPTIONS
  allowed.push(Request.Method.OPTIONS);

  // If we respond to GET, then we respond to HEAD.
  if (Request.Method.GET in this.handlers_) {
    allowed.push(Request.Method.HEAD);
  }

  return allowed.join(',');
};
