// Copyright 2011 Software Freedom Conservatory. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a {@code webdriver.CommandExecutor} that communicates
 * with a server over HTTP.
 */

goog.provide('webdriver.http.Client');
goog.provide('webdriver.http.Executor');
goog.provide('webdriver.http.Request');
goog.provide('webdriver.http.Response');

goog.require('bot.ErrorCode');
goog.require('webdriver.CommandName');
goog.require('webdriver.promise.Deferred');


/**
 * Interface used for sending individual HTTP requests to the server.
 * @interface
 */
webdriver.http.Client = function() {
};


/**
 * Sends a request to the server. If an error occurs while sending the request,
 * such as a failure to connect to the server, the provided callback will be
 * invoked with a non-null {@code Error} describing the error. Otherwise, when
 * the server's response has been received, the callback will be invoked with a
 * null Error and non-null {@code webdriver.http.Response} object.
 *
 * @param {!webdriver.http.Request} request The request to send.
 * @param {function(Error, !webdriver.http.Response=)} callback the function to
 *     invoke when the server's response is ready.
 */
webdriver.http.Client.prototype.send = function(request, callback) {
};


/**
 * A command executor that communicates with a server using the WebDriver
 * command protocol.
 * @param {!webdriver.http.Client} client The client to use when sending
 *     requests to the server.
 * @constructor
 * @implements {webdriver.CommandExecutor}
 */
webdriver.http.Executor = function(client) {

  /**
   * Client used to communicate with the server.
   * @type {!webdriver.http.Client}
   * @private
   */
  this.client_ = client;
};


/** @override */
webdriver.http.Executor.prototype.execute = function(command, callback) {
  var resource = webdriver.http.Executor.COMMAND_MAP_[command.getName()];
  if (!resource) {
    throw new Error('Unrecognized command: ' + command.getName())
  }

  var parameters = command.getParameters();
  var path = webdriver.http.Executor.buildPath_(resource.path, parameters);
  var request = new webdriver.http.Request(resource.method, path, parameters);

  this.client_.send(request, function(e, response) {
    var responseObj;
    if (!e) {
      try {
        responseObj = webdriver.http.Executor.parseHttpResponse_(
            /** @type {!webdriver.http.Response} */response);
      } catch (ex) {
        e = ex;
      }
    }
    callback(e, responseObj);
  });
};


/**
 * Builds a fully qualified path using the given set of command parameters. Each
 * path segment prefixed with ':' will be replaced by the value of the
 * corresponding parameter. All parameters spliced into the path will be
 * removed from the parameter map.
 * @param {string} path The original resource path.
 * @param {!Object.<*>} parameters The parameters object to splice into
 *     the path.
 * @return {string} The modified path.
 * @private
 */
webdriver.http.Executor.buildPath_ = function(path, parameters) {
  var pathParameters = path.match(/:(\w+)\b/g);
  if (pathParameters) {
    for (var i = 0; i < pathParameters.length; ++i) {
      var key = pathParameters[i].substring(1);  // Trim the :
      if (key in parameters) {
        var value = parameters[key];
        // TODO(jleyba): move webdriver.WebElement.ELEMENT definition to a
        // common file so we can reference it here without pulling in all of
        // webdriver.WebElement's dependencies.
        if (value && value['ELEMENT']) {
          // When inserting a WebElement into the URL, only use it's ID value,
          // not the full JSON.
          value = value['ELEMENT'];
        }
        path = path.replace(pathParameters[i], value);
        delete parameters[key];
      } else {
        throw new Error('Missing required parameter: ' + key);
      }
    }
  }
  return path;
};


/**
 * Callback used to parse {@link webdriver.http.Response} objects from a
 * {@link webdriver.http.Client}.
 * @param {!webdriver.http.Response} httpResponse The HTTP response to parse.
 * @private
 */
webdriver.http.Executor.parseHttpResponse_ = function(httpResponse) {
  try {
    return JSON.parse(httpResponse.body);
  } catch (ex) {
    // Whoops, looks like the server sent us a malformed response. We'll need
    // to manually build a response object based on the response code.
  }

  var response = {
    'status': bot.ErrorCode.SUCCESS,
    'value': httpResponse.body.replace(/\r\n/g, '\n')
  };

  if (!(httpResponse.status > 199 && httpResponse.status < 300)) {
    // 404 represents an unknown command; anything else is a generic unknown
    // error.
    response['status'] = httpResponse.status == 404 ?
        bot.ErrorCode.UNKNOWN_COMMAND :
        bot.ErrorCode.UNKNOWN_ERROR;
  }

  return response;
};


/**
 * Maps command names to resource locator.
 * @type {!Object.<{method:string, path:string}>}
 * @const
 * @private
 */
webdriver.http.Executor.COMMAND_MAP_ = (function() {
  return new Builder().
      put(webdriver.CommandName.GET_SERVER_STATUS, get('/status')).
      put(webdriver.CommandName.NEW_SESSION, post('/session')).
      put(webdriver.CommandName.GET_SESSIONS, get('/sessions')).
      put(webdriver.CommandName.DESCRIBE_SESSION, get('/session/:sessionId')).
      put(webdriver.CommandName.QUIT, del('/session/:sessionId')).
      put(webdriver.CommandName.CLOSE, del('/session/:sessionId/window')).
      put(webdriver.CommandName.GET_CURRENT_WINDOW_HANDLE,
          get('/session/:sessionId/window_handle')).
      put(webdriver.CommandName.GET_WINDOW_HANDLES,
          get('/session/:sessionId/window_handles')).
      put(webdriver.CommandName.GET_CURRENT_URL,
          get('/session/:sessionId/url')).
      put(webdriver.CommandName.GET, post('/session/:sessionId/url')).
      put(webdriver.CommandName.GO_BACK, post('/session/:sessionId/back')).
      put(webdriver.CommandName.GO_FORWARD,
          post('/session/:sessionId/forward')).
      put(webdriver.CommandName.REFRESH,
          post('/session/:sessionId/refresh')).
      put(webdriver.CommandName.ADD_COOKIE,
          post('/session/:sessionId/cookie')).
      put(webdriver.CommandName.GET_ALL_COOKIES,
          get('/session/:sessionId/cookie')).
      put(webdriver.CommandName.DELETE_ALL_COOKIES,
          del('/session/:sessionId/cookie')).
      put(webdriver.CommandName.DELETE_COOKIE,
          del('/session/:sessionId/cookie/:name')).
      put(webdriver.CommandName.FIND_ELEMENT,
          post('/session/:sessionId/element')).
      put(webdriver.CommandName.FIND_ELEMENTS,
          post('/session/:sessionId/elements')).
      put(webdriver.CommandName.GET_ACTIVE_ELEMENT,
          post('/session/:sessionId/element/active')).
      put(webdriver.CommandName.FIND_CHILD_ELEMENT,
          post('/session/:sessionId/element/:id/element')).
      put(webdriver.CommandName.FIND_CHILD_ELEMENTS,
          post('/session/:sessionId/element/:id/elements')).
      put(webdriver.CommandName.CLEAR_ELEMENT,
          post('/session/:sessionId/element/:id/clear')).
      put(webdriver.CommandName.CLICK_ELEMENT,
          post('/session/:sessionId/element/:id/click')).
      put(webdriver.CommandName.SEND_KEYS_TO_ELEMENT,
          post('/session/:sessionId/element/:id/value')).
      put(webdriver.CommandName.SUBMIT_ELEMENT,
          post('/session/:sessionId/element/:id/submit')).
      put(webdriver.CommandName.GET_ELEMENT_TEXT,
          get('/session/:sessionId/element/:id/text')).
      put(webdriver.CommandName.GET_ELEMENT_TAG_NAME,
          get('/session/:sessionId/element/:id/name')).
      put(webdriver.CommandName.IS_ELEMENT_SELECTED,
          get('/session/:sessionId/element/:id/selected')).
      put(webdriver.CommandName.IS_ELEMENT_ENABLED,
          get('/session/:sessionId/element/:id/enabled')).
      put(webdriver.CommandName.IS_ELEMENT_DISPLAYED,
          get('/session/:sessionId/element/:id/displayed')).
      put(webdriver.CommandName.GET_ELEMENT_LOCATION,
          get('/session/:sessionId/element/:id/location')).
      put(webdriver.CommandName.GET_ELEMENT_SIZE,
          get('/session/:sessionId/element/:id/size')).
      put(webdriver.CommandName.GET_ELEMENT_ATTRIBUTE,
          get('/session/:sessionId/element/:id/attribute/:name')).
      put(webdriver.CommandName.GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
          get('/session/:sessionId/element/:id/css/:name')).
      put(webdriver.CommandName.ELEMENT_EQUALS,
          get('/session/:sessionId/element/:id/equals/:other')).
      put(webdriver.CommandName.SWITCH_TO_WINDOW,
          post('/session/:sessionId/window')).
      put(webdriver.CommandName.SWITCH_TO_FRAME,
          post('/session/:sessionId/frame')).
      put(webdriver.CommandName.GET_PAGE_SOURCE,
          get('/session/:sessionId/source')).
      put(webdriver.CommandName.GET_TITLE,
          get('/session/:sessionId/title')).
      put(webdriver.CommandName.EXECUTE_SCRIPT,
          post('/session/:sessionId/execute')).
      put(webdriver.CommandName.EXECUTE_ASYNC_SCRIPT,
          post('/session/:sessionId/execute_async')).
      put(webdriver.CommandName.SCREENSHOT,
          get('/session/:sessionId/screenshot')).
      put(webdriver.CommandName.SET_SCRIPT_TIMEOUT,
          post('/session/:sessionId/timeouts/async_script')).
      put(webdriver.CommandName.IMPLICITLY_WAIT,
          post('/session/:sessionId/timeouts/implicit_wait')).
      build();

  function Builder() {
    var map = {};

    this.put = function(name, resource) {
      map[name] = resource;
      return this;
    };

    this.build = function() {
      return map;
    };
  }

  function post(path) { return resource('POST', path); }
  function del(path)  { return resource('DELETE', path); }
  function get(path)  { return resource('GET', path); }
  function resource(method, path) { return {method:method, path:path}; }
})();


/**
 * Describes a partial HTTP request. This class is a "partial" request and only
 * defines the path on the server to send a request to. It is each
 * {@code webdriver.http.Client}'s responsibility to build the full URL for the
 * final request.
 * @param {string} method The HTTP method to use for the request.
 * @param {string} path Path on the server to send the request to.
 * @param {string=} opt_data This request's body; if specified, must be a JSON
 *     string.
 * @constructor
 */
webdriver.http.Request = function(method, path, opt_data) {

  /**
   * The HTTP method to use for the request.
   * @type {string}
   */
  this.method = method;

  /**
   * The path on the server to send the request to.
   * @type {string}
   */
  this.path = path;

  /**
   * This request's body.
   * @type {string}
   */
  this.data = opt_data || '';

  /**
   * The headers to send with the request.
   * @type {!Object.<string>}
   */
  this.headers = {'Accept': 'application/json; charset=utf-8'};
};


/** @override */
webdriver.http.Request.prototype.toString = function() {
  var ret = [this.method + ' ' + this.path];
  for (var key in this.headers) {
    ret.push(key + ': ' + this.headers[key]);
  }
  ret.push('');
  ret.push(this.data);
  return ret.join('\n');
};


/**
 * Represents a HTTP response.
 * @param {number} status The response code.
 * @param {!Object.<string>} headers The response headers. All header
 *     names will be converted to lowercase strings for consistent lookup.s
 * @param {string} body The response body.
 * @constructor
 */
webdriver.http.Response = function(status, headers, body) {

  /**
   * The HTTP response code.
   * @type {number}
   */
  this.status = status;

  /**
   * The response body.
   * @type {string}
   */
  this.body = body;

  /**
   * The response body.
   * @type {!Object.<string>}
   */
  this.headers = {};
  for (var header in headers) {
    this.headers[header.toLowerCase()] = headers[header];
  }
};


/**
 * Builds a {@code webdriver.http.Response} from a {@code XMLHttpRequest}'s
 * response.
 * @param {!XMLHttpRequest} xhr The request to parse.
 * @return {!webdriver.http.Response} The parsed response.
 */
webdriver.http.Response.fromXmlHttpRequest = function(xhr) {
  var headers = {};

  var tmp = xhr.getAllResponseHeaders();
  if (tmp) {
    tmp = tmp.replace(/\r\n/g, '\n').split('\n');
    goog.array.forEach(tmp, function(header) {
      var parts = header.split(/\s*:\s*/, 2);
      if (parts[0]) {
        headers[parts[0]] = parts[1] || '';
      }
    });
  }

  return new webdriver.http.Response(xhr.status, headers,
      xhr.responseText.replace(/\0/g, ''));
};


/** @override */
webdriver.http.Response.prototype.toString = function() {
  var ret = ['HTTP/1.1 ' + this.status];
  for (var key in this.headers) {
    ret.push(key + ': ' + this.headers[key]);
  }
  ret.push('');
  ret.push(this.body);
  return ret.join('\n');
};



