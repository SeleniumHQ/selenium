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

/**
 * @fileoverview Defines an {@linkplain cmd.Executor command executor} that
 * communicates with a remote end using HTTP + JSON.
 */

'use strict';

const http = require('http');
const url = require('url');

const error = require('../error');
const cmd = require('../lib/command');
const logging = require('../lib/logging');
const promise = require('../lib/promise');



/**
 * Converts a headers map to a HTTP header block string.
 * @param {!Map<string, string>} headers The map to convert.
 * @return {string} The headers as a string.
 */
function headersToString(headers) {
  let ret = [];
  headers.forEach(function(value, name) {
    ret.push(`${name.toLowerCase()}: ${value}`);
  });
  return ret.join('\n');
}


/**
 * Represents a HTTP request message. This class is a "partial" request and only
 * defines the path on the server to send a request to. It is each client's
 * responsibility to build the full URL for the final request.
 * @final
 */
class HttpRequest {
  /**
   * @param {string} method The HTTP method to use for the request.
   * @param {string} path The path on the server to send the request to.
   * @param {Object=} opt_data This request's non-serialized JSON payload data.
   */
  constructor(method, path, opt_data) {
    this.method = /** string */method;
    this.path = /** string */path;
    this.data = /** Object */opt_data;
    this.headers = /** !Map<string, string> */new Map(
        [['Accept', 'application/json; charset=utf-8']]);
  }

  /** @override */
  toString() {
    let ret = `${this.method} ${this.path} HTTP/1.1\n`;
    ret += headersToString(this.headers) + '\n\n';
    if (this.data) {
      ret += JSON.stringify(this.data);
    }
    return ret;
  }
}


/**
 * Represents a HTTP response message.
 * @final
 */
class HttpResponse {
  /**
   * @param {number} status The response code.
   * @param {!Object<string>} headers The response headers. All header names
   *     will be converted to lowercase strings for consistent lookups.
   * @param {string} body The response body.
   */
  constructor(status, headers, body) {
    this.status = /** number */status;
    this.body = /** string */body;
    this.headers = /** !Map<string, string>*/new Map;
    for (let header in headers) {
      this.headers.set(header.toLowerCase(), headers[header]);
    }
  }

  /** @override */
  toString() {
    let ret = `HTTP/1.1 ${this.status}\n${headersToString(this.headers)}\n\n`;
    if (this.body) {
      ret += this.body;
    }
    return ret;
  }
}


function post(path) { return resource('POST', path); }
function del(path)  { return resource('DELETE', path); }
function get(path)  { return resource('GET', path); }
function resource(method, path) { return {method: method, path: path}; }


/** @const {!Map<string, {method: string, path: string}>} */
const COMMAND_MAP = new Map([
    [cmd.Name.GET_SERVER_STATUS, get('/status')],
    [cmd.Name.NEW_SESSION, post('/session')],
    [cmd.Name.GET_SESSIONS, get('/sessions')],
    [cmd.Name.DESCRIBE_SESSION, get('/session/:sessionId')],
    [cmd.Name.QUIT, del('/session/:sessionId')],
    [cmd.Name.CLOSE, del('/session/:sessionId/window')],
    [cmd.Name.GET_CURRENT_WINDOW_HANDLE, get('/session/:sessionId/window_handle')],
    [cmd.Name.GET_WINDOW_HANDLES, get('/session/:sessionId/window_handles')],
    [cmd.Name.GET_CURRENT_URL, get('/session/:sessionId/url')],
    [cmd.Name.GET, post('/session/:sessionId/url')],
    [cmd.Name.GO_BACK, post('/session/:sessionId/back')],
    [cmd.Name.GO_FORWARD, post('/session/:sessionId/forward')],
    [cmd.Name.REFRESH, post('/session/:sessionId/refresh')],
    [cmd.Name.ADD_COOKIE, post('/session/:sessionId/cookie')],
    [cmd.Name.GET_ALL_COOKIES, get('/session/:sessionId/cookie')],
    [cmd.Name.DELETE_ALL_COOKIES, del('/session/:sessionId/cookie')],
    [cmd.Name.DELETE_COOKIE, del('/session/:sessionId/cookie/:name')],
    [cmd.Name.FIND_ELEMENT, post('/session/:sessionId/element')],
    [cmd.Name.FIND_ELEMENTS, post('/session/:sessionId/elements')],
    [cmd.Name.GET_ACTIVE_ELEMENT, post('/session/:sessionId/element/active')],
    [cmd.Name.FIND_CHILD_ELEMENT, post('/session/:sessionId/element/:id/element')],
    [cmd.Name.FIND_CHILD_ELEMENTS, post('/session/:sessionId/element/:id/elements')],
    [cmd.Name.CLEAR_ELEMENT, post('/session/:sessionId/element/:id/clear')],
    [cmd.Name.CLICK_ELEMENT, post('/session/:sessionId/element/:id/click')],
    [cmd.Name.SEND_KEYS_TO_ELEMENT, post('/session/:sessionId/element/:id/value')],
    [cmd.Name.SUBMIT_ELEMENT, post('/session/:sessionId/element/:id/submit')],
    [cmd.Name.GET_ELEMENT_TEXT, get('/session/:sessionId/element/:id/text')],
    [cmd.Name.GET_ELEMENT_TAG_NAME, get('/session/:sessionId/element/:id/name')],
    [cmd.Name.IS_ELEMENT_SELECTED, get('/session/:sessionId/element/:id/selected')],
    [cmd.Name.IS_ELEMENT_ENABLED, get('/session/:sessionId/element/:id/enabled')],
    [cmd.Name.IS_ELEMENT_DISPLAYED, get('/session/:sessionId/element/:id/displayed')],
    [cmd.Name.GET_ELEMENT_LOCATION, get('/session/:sessionId/element/:id/location')],
    [cmd.Name.GET_ELEMENT_SIZE, get('/session/:sessionId/element/:id/size')],
    [cmd.Name.GET_ELEMENT_ATTRIBUTE, get('/session/:sessionId/element/:id/attribute/:name')],
    [cmd.Name.GET_ELEMENT_VALUE_OF_CSS_PROPERTY, get('/session/:sessionId/element/:id/css/:propertyName')],
    [cmd.Name.ELEMENT_EQUALS, get('/session/:sessionId/element/:id/equals/:other')],
    [cmd.Name.TAKE_ELEMENT_SCREENSHOT, get('/session/:sessionId/element/:id/screenshot')],
    [cmd.Name.SWITCH_TO_WINDOW, post('/session/:sessionId/window')],
    [cmd.Name.MAXIMIZE_WINDOW, post('/session/:sessionId/window/:windowHandle/maximize')],
    [cmd.Name.GET_WINDOW_POSITION, get('/session/:sessionId/window/:windowHandle/position')],
    [cmd.Name.SET_WINDOW_POSITION, post('/session/:sessionId/window/:windowHandle/position')],
    [cmd.Name.GET_WINDOW_SIZE, get('/session/:sessionId/window/:windowHandle/size')],
    [cmd.Name.SET_WINDOW_SIZE, post('/session/:sessionId/window/:windowHandle/size')],
    [cmd.Name.SWITCH_TO_FRAME, post('/session/:sessionId/frame')],
    [cmd.Name.GET_PAGE_SOURCE, get('/session/:sessionId/source')],
    [cmd.Name.GET_TITLE, get('/session/:sessionId/title')],
    [cmd.Name.EXECUTE_SCRIPT, post('/session/:sessionId/execute')],
    [cmd.Name.EXECUTE_ASYNC_SCRIPT, post('/session/:sessionId/execute_async')],
    [cmd.Name.SCREENSHOT, get('/session/:sessionId/screenshot')],
    [cmd.Name.SET_TIMEOUT, post('/session/:sessionId/timeouts')],
    [cmd.Name.SET_SCRIPT_TIMEOUT, post('/session/:sessionId/timeouts/async_script')],
    [cmd.Name.IMPLICITLY_WAIT, post('/session/:sessionId/timeouts/implicit_wait')],
    [cmd.Name.MOVE_TO, post('/session/:sessionId/moveto')],
    [cmd.Name.CLICK, post('/session/:sessionId/click')],
    [cmd.Name.DOUBLE_CLICK, post('/session/:sessionId/doubleclick')],
    [cmd.Name.MOUSE_DOWN, post('/session/:sessionId/buttondown')],
    [cmd.Name.MOUSE_UP, post('/session/:sessionId/buttonup')],
    [cmd.Name.MOVE_TO, post('/session/:sessionId/moveto')],
    [cmd.Name.SEND_KEYS_TO_ACTIVE_ELEMENT, post('/session/:sessionId/keys')],
    [cmd.Name.TOUCH_SINGLE_TAP, post('/session/:sessionId/touch/click')],
    [cmd.Name.TOUCH_DOUBLE_TAP, post('/session/:sessionId/touch/doubleclick')],
    [cmd.Name.TOUCH_DOWN, post('/session/:sessionId/touch/down')],
    [cmd.Name.TOUCH_UP, post('/session/:sessionId/touch/up')],
    [cmd.Name.TOUCH_MOVE, post('/session/:sessionId/touch/move')],
    [cmd.Name.TOUCH_SCROLL, post('/session/:sessionId/touch/scroll')],
    [cmd.Name.TOUCH_LONG_PRESS, post('/session/:sessionId/touch/longclick')],
    [cmd.Name.TOUCH_FLICK, post('/session/:sessionId/touch/flick')],
    [cmd.Name.ACCEPT_ALERT, post('/session/:sessionId/accept_alert')],
    [cmd.Name.DISMISS_ALERT, post('/session/:sessionId/dismiss_alert')],
    [cmd.Name.GET_ALERT_TEXT, get('/session/:sessionId/alert_text')],
    [cmd.Name.SET_ALERT_TEXT, post('/session/:sessionId/alert_text')],
    [cmd.Name.GET_LOG, post('/session/:sessionId/log')],
    [cmd.Name.GET_AVAILABLE_LOG_TYPES, get('/session/:sessionId/log/types')],
    [cmd.Name.GET_SESSION_LOGS, post('/logs')],
    [cmd.Name.UPLOAD_FILE, post('/session/:sessionId/file')],
]);


/**
 * A basic HTTP client used to send messages to a remote end.
 */
class HttpClient {
  /**
   * @param {string} serverUrl URL for the WebDriver server to send commands to.
   * @param {http.Agent=} opt_agent The agent to use for each request.
   *     Defaults to `http.globalAgent`.
   * @param {?string=} opt_proxy The proxy to use for the connection to the
   *     server. Default is to use no proxy.
   */
  constructor(serverUrl, opt_agent, opt_proxy) {
    let parsedUrl = url.parse(serverUrl);
    if (!parsedUrl.hostname) {
      throw new Error('Invalid server URL: ' + serverUrl);
    }

    /** @private {http.Agent} */
    this.agent_ = opt_agent || null;

    /** @private {?string} */
    this.proxy_ = opt_proxy || null;

    /**
     * Base options for each request.
     * @private {{auth: (?string|undefined),
     *            host: string,
     *            path: (?string|undefined),
     *            port: (?string|undefined)}}
     */
    this.options_ = {
      auth: parsedUrl.auth,
      host: parsedUrl.hostname,
      path: parsedUrl.pathname,
      port: parsedUrl.port
    };
  }

  /**
   * Sends a request to the server. The client will automatically follow any
   * redirects returned by the server, fulfilling the returned promise with the
   * final response.
   *
   * @param {!HttpRequest} httpRequest The request to send.
   * @return {!promise.Promise<HttpResponse>} A promise that will be fulfilled
   *     with the server's response.
   */
  send(httpRequest) {
    var data;

    let headers = {};
    httpRequest.headers.forEach(function(value, name) {
      headers[name] = value;
    });

    headers['Content-Length'] = 0;
    if (httpRequest.method == 'POST' || httpRequest.method == 'PUT') {
      data = JSON.stringify(httpRequest.data);
      headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
      headers['Content-Type'] = 'application/json;charset=UTF-8';
    }

    var path = this.options_.path;
    if (path[path.length - 1] === '/' && httpRequest.path[0] === '/') {
      path += httpRequest.path.substring(1);
    } else {
      path += httpRequest.path;
    }

    var options = {
      method: httpRequest.method,
      auth: this.options_.auth,
      host: this.options_.host,
      port: this.options_.port,
      path: path,
      headers: headers
    };

    if (this.agent_) {
      options.agent = this.agent_;
    }

    var proxy = this.proxy_;
    return new promise.Promise(function(fulfill, reject) {
      sendRequest(options, fulfill, reject, data, proxy);
    });
  }
}


/**
 * Sends a single HTTP request.
 * @param {!Object} options The request options.
 * @param {function(!HttpResponse)} onOk The function to call if the
 *     request succeeds.
 * @param {function(!Error)} onError The function to call if the request fails.
 * @param {?string=} opt_data The data to send with the request.
 * @param {?string=} opt_proxy The proxy server to use for the request.
 */
function sendRequest(options, onOk, onError, opt_data, opt_proxy) {
  var host = options.host;
  var port = options.port;

  if (opt_proxy) {
    var proxy = url.parse(opt_proxy);

    options.headers['Host'] = options.host;
    options.host = proxy.hostname;
    options.port = proxy.port;

    if (proxy.auth) {
      options.headers['Proxy-Authorization'] =
          'Basic ' + new Buffer(proxy.auth).toString('base64');
    }
  }

  var request = http.request(options, function(response) {
    if (response.statusCode == 302 || response.statusCode == 303) {
      try {
        var location = url.parse(response.headers['location']);
      } catch (ex) {
        onError(Error(
            'Failed to parse "Location" header for server redirect: ' +
            ex.message + '\nResponse was: \n' +
            new HttpResponse(response.statusCode, response.headers, '')));
        return;
      }

      if (!location.hostname) {
        location.hostname = host;
        location.port = port;
      }

      request.abort();
      sendRequest({
        method: 'GET',
        host: location.hostname,
        path: location.pathname + (location.search || ''),
        port: location.port,
        headers: {
          'Accept': 'application/json; charset=utf-8'
        }
      }, onOk, onError, undefined, opt_proxy);
      return;
    }

    var body = [];
    response.on('data', body.push.bind(body));
    response.on('end', function() {
      var resp = new HttpResponse(
          /** @type {number} */(response.statusCode),
          /** @type {!Object<string>} */(response.headers),
          body.join('').replace(/\0/g, ''));
      onOk(resp);
    });
  });

  request.on('error', function(e) {
    if (e.code === 'ECONNRESET') {
      setTimeout(function() {
        sendRequest(options, onOk, onError, opt_data, opt_proxy);
      }, 15);
    } else {
      var message = e.message;
      if (e.code) {
        message = e.code + ' ' + message;
      }
      onError(new Error(message));
    }
  });

  if (opt_data) {
    request.write(opt_data);
  }

  request.end();
}


/**
 * A command executor that communicates with the server using HTTP + JSON.
 * @implements {cmd.Executor}
 */
class Executor {
  /**
   * @param {!HttpClient} client The client to use for sending requests to the
   *     server.
   */
  constructor(client) {
    /** @private {!HttpClient} */
    this.client_ = client;

    /** @private {Map<string, {method: string, path: string}>} */
    this.customCommands_ = null;

    /** @private {!logging.Logger} */
    this.log_ = logging.getLogger('webdriver.http.Executor');
  }

  /**
   * Defines a new command for use with this executor. When a command is sent,
   * the {@code path} will be preprocessed using the command's parameters; any
   * path segments prefixed with ":" will be replaced by the parameter of the
   * same name. For example, given "/person/:name" and the parameters
   * "{name: 'Bob'}", the final command path will be "/person/Bob".
   *
   * @param {string} name The command name.
   * @param {string} method The HTTP method to use when sending this command.
   * @param {string} path The path to send the command to, relative to
   *     the WebDriver server's command root and of the form
   *     "/path/:variable/segment".
   */
  defineCommand(name, method, path) {
    if (!this.customCommands_) {
      this.customCommands_ = new Map;
    }
    this.customCommands_.set(name, {method, path});
  }

  /** @override */
  execute(command) {
    let resource =
        (this.customCommands_ && this.customCommands_.get(command.getName()))
        || COMMAND_MAP.get(command.getName());
    if (!resource) {
      throw new error.UnknownCommandError(
          'Unrecognized command: ' + command.getName());
    }

    let parameters = command.getParameters();
    let path = buildPath(resource.path, parameters);
    let request = new HttpRequest(resource.method, path, parameters);

    let log = this.log_;
    log.finer(() => '>>>\n' + request);
    return this.client_.send(request).then(function(response) {
      log.finer(() => '<<<\n' + response);
      return parseHttpResponse(/** @type {!HttpResponse} */ (response));
    });
  }
}


/**
 * Callback used to parse {@link HttpResponse} objects from a
 * {@link HttpClient}.
 * @param {!HttpResponse} httpResponse The HTTP response to parse.
 * @return {!Object} The parsed response.
 */
function parseHttpResponse(httpResponse) {
  try {
    return /** @type {!Object} */ (JSON.parse(httpResponse.body));
  } catch (ignored) {
    // Whoops, looks like the server sent us a malformed response. We'll need
    // to manually build a response object based on the response code.
  }

  let response = {
    'status': error.ErrorCode.SUCCESS,
    'value': httpResponse.body.replace(/\r\n/g, '\n')
  };

  if (httpResponse.status >= 400) {
    // 404 represents an unknown command; anything else is a generic unknown
    // error.
    response['status'] = httpResponse.status == 404 ?
        error.ErrorCode.UNKNOWN_COMMAND :
        error.ErrorCode.UNKNOWN_ERROR;
  }

  return response;
}


/**
 * Builds a fully qualified path using the given set of command parameters. Each
 * path segment prefixed with ':' will be replaced by the value of the
 * corresponding parameter. All parameters spliced into the path will be
 * removed from the parameter map.
 * @param {string} path The original resource path.
 * @param {!Object<*>} parameters The parameters object to splice into the path.
 * @return {string} The modified path.
 */
function buildPath(path, parameters) {
  let pathParameters = path.match(/\/:(\w+)\b/g);
  if (pathParameters) {
    for (let i = 0; i < pathParameters.length; ++i) {
      let key = pathParameters[i].substring(2);  // Trim the /:
      if (key in parameters) {
        let value = parameters[key];
        // TODO: move webdriver.WebElement.ELEMENT definition to a
        // common file so we can reference it here without pulling in all of
        // webdriver.WebElement's dependencies.
        if (value && value['ELEMENT']) {
          // When inserting a WebElement into the URL, only use its ID value,
          // not the full JSON.
          value = value['ELEMENT'];
        }
        path = path.replace(pathParameters[i], '/' + value);
        delete parameters[key];
      } else {
        throw new error.InvalidArgumentError(
            'Missing required parameter: ' + key);
      }
    }
  }
  return path;
}


// PUBLIC API

exports.Executor = Executor;
exports.HttpClient = HttpClient;
exports.Request = HttpRequest;
exports.Response = HttpResponse;
exports.buildPath = buildPath;  // Exported for testing.
