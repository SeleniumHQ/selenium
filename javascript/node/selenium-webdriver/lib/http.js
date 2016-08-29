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
 * @fileoverview Defines an environment agnostic {@linkplain cmd.Executor
 * command executor} that communicates with a remote end using JSON over HTTP.
 *
 * Clients should implement the {@link Client} interface, which is used by
 * the {@link Executor} to send commands to the remote end.
 */

'use strict';

const cmd = require('./command');
const error = require('./error');
const logging = require('./logging');
const promise = require('./promise');
const Session = require('./session').Session;
const WebElement = require('./webdriver').WebElement;


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
class Request {
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
class Response {
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
    [cmd.Name.MAXIMIZE_WINDOW, post('/session/:sessionId/window/current/maximize')],
    [cmd.Name.GET_WINDOW_POSITION, get('/session/:sessionId/window/current/position')],
    [cmd.Name.SET_WINDOW_POSITION, post('/session/:sessionId/window/current/position')],
    [cmd.Name.GET_WINDOW_SIZE, get('/session/:sessionId/window/current/size')],
    [cmd.Name.SET_WINDOW_SIZE, post('/session/:sessionId/window/current/size')],
    [cmd.Name.SWITCH_TO_FRAME, post('/session/:sessionId/frame')],
    [cmd.Name.GET_PAGE_SOURCE, get('/session/:sessionId/source')],
    [cmd.Name.GET_TITLE, get('/session/:sessionId/title')],
    [cmd.Name.EXECUTE_SCRIPT, post('/session/:sessionId/execute')],
    [cmd.Name.EXECUTE_ASYNC_SCRIPT, post('/session/:sessionId/execute_async')],
    [cmd.Name.SCREENSHOT, get('/session/:sessionId/screenshot')],
    [cmd.Name.SET_TIMEOUT, post('/session/:sessionId/timeouts')],
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
    [cmd.Name.SET_ALERT_CREDENTIALS, post('/session/:sessionId/alert/credentials')],
    [cmd.Name.GET_LOG, post('/session/:sessionId/log')],
    [cmd.Name.GET_AVAILABLE_LOG_TYPES, get('/session/:sessionId/log/types')],
    [cmd.Name.GET_SESSION_LOGS, post('/logs')],
    [cmd.Name.UPLOAD_FILE, post('/session/:sessionId/file')],
]);


/** @const {!Map<string, {method: string, path: string}>} */
const W3C_COMMAND_MAP = new Map([
  [cmd.Name.MAXIMIZE_WINDOW, post('/session/:sessionId/window/maximize')],
  [cmd.Name.GET_WINDOW_POSITION, get('/session/:sessionId/window/position')],
  [cmd.Name.SET_WINDOW_POSITION, post('/session/:sessionId/window/position')],
  [cmd.Name.GET_WINDOW_SIZE, get('/session/:sessionId/window/size')],
  [cmd.Name.SET_WINDOW_SIZE, post('/session/:sessionId/window/size')],
]);


/**
 * Handles sending HTTP messages to a remote end.
 *
 * @interface
 */
class Client {

  /**
   * Sends a request to the server. The client will automatically follow any
   * redirects returned by the server, fulfilling the returned promise with the
   * final response.
   *
   * @param {!Request} httpRequest The request to send.
   * @return {!Promise<Response>} A promise that will be fulfilled with the
   *     server's response.
   */
  send(httpRequest) {}
}


const CLIENTS =
    /** !WeakMap<!Executor, !(Client|IThenable<!Client>)> */new WeakMap;


/**
 * Sends a request using the given executor.
 * @param {!Executor} executor
 * @param {!Request} request
 * @return {!Promise<Response>}
 */
function doSend(executor, request) {
  const client = CLIENTS.get(executor);
  if (promise.isPromise(client)) {
    return client.then(client => {
      CLIENTS.set(executor, client);
      return client.send(request);
    });
  } else {
    return client.send(request);
  }
}


/**
 * A command executor that communicates with the server using JSON over HTTP.
 *
 * By default, each instance of this class will use the legacy wire protocol
 * from [Selenium project][json]. The executor will automatically switch to the
 * [W3C wire protocol][w3c] if the remote end returns a compliant response to
 * a new session command.
 *
 * [json]: https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 * [w3c]: https://w3c.github.io/webdriver/webdriver-spec.html
 *
 * @implements {cmd.Executor}
 */
class Executor {
  /**
   * @param {!(Client|IThenable<!Client>)} client The client to use for sending
   *     requests to the server, or a promise-like object that will resolve to
   *     to the client.
   */
  constructor(client) {
    CLIENTS.set(this, client);

    /**
     * Whether this executor should use the W3C wire protocol. The executor
     * will automatically switch if the remote end sends a compliant response
     * to a new session command, however, this property may be directly set to
     * `true` to force the executor into W3C mode.
     * @type {boolean}
     */
    this.w3c = false;

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
        || (this.w3c && W3C_COMMAND_MAP.get(command.getName()))
        || COMMAND_MAP.get(command.getName());
    if (!resource) {
      throw new error.UnknownCommandError(
          'Unrecognized command: ' + command.getName());
    }

    let parameters = command.getParameters();
    let path = buildPath(resource.path, parameters);
    let request = new Request(resource.method, path, parameters);

    let log = this.log_;
    log.finer(() => '>>>\n' + request);
    return doSend(this, request).then(response => {
      log.finer(() => '<<<\n' + response);

      let parsed =
          parseHttpResponse(/** @type {!Response} */ (response), this.w3c);

      if (command.getName() === cmd.Name.NEW_SESSION
          || command.getName() === cmd.Name.DESCRIBE_SESSION) {
        if (!parsed || !parsed['sessionId']) {
          throw new error.WebDriverError(
              'Unable to parse new session response: ' + response.body);
        }

        // The remote end is a W3C compliant server if there is no `status`
        // field in the response. This is not appliable for the DESCRIBE_SESSION
        // command, which is not defined in the W3C spec.
        if (command.getName() === cmd.Name.NEW_SESSION) {
          this.w3c = this.w3c || !('status' in parsed);
        }

        return new Session(parsed['sessionId'], parsed['value']);
      }

      if (parsed
          && typeof parsed === 'object'
          && 'value' in parsed) {
        let value = parsed['value'];
        return typeof value === 'undefined' ? null : value;
      }
      return parsed;
    });
  }
}


/**
 * @param {string} str .
 * @return {?} .
 */
function tryParse(str) {
  try {
    return JSON.parse(str);
  } catch (ignored) {
    // Do nothing.
  }
}


/**
 * Callback used to parse {@link Response} objects from a
 * {@link HttpClient}.
 * @param {!Response} httpResponse The HTTP response to parse.
 * @param {boolean} w3c Whether the response should be processed using the
 *     W3C wire protocol.
 * @return {?} The parsed response.
 * @throws {WebDriverError} If the HTTP response is an error.
 */
function parseHttpResponse(httpResponse, w3c) {
  let parsed = tryParse(httpResponse.body);
  if (parsed !== undefined) {
    if (w3c) {
      if (httpResponse.status > 399) {
        error.throwDecodedError(parsed);
      }

      if (httpResponse.status < 200) {
        // This should never happen, but throw the raw response so
        // users report it.
        throw new error.WebDriverError(
            `Unexpected HTTP response:\n${httpResponse}`);
      }
    } else {
      error.checkLegacyResponse(parsed);
    }
    return parsed;
  }

  let value = httpResponse.body.replace(/\r\n/g, '\n');

  // 404 represents an unknown command; anything else > 399 is a generic unknown
  // error.
  if (httpResponse.status == 404) {
    throw new error.UnsupportedOperationError(value);
  } else if (httpResponse.status >= 400) {
    throw new error.WebDriverError(value);
  }

  return value || null;
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
        if (WebElement.isId(value)) {
          // When inserting a WebElement into the URL, only use its ID value,
          // not the full JSON.
          value = WebElement.extractId(value);
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
exports.Client = Client;
exports.Request = Request;
exports.Response = Response;
exports.buildPath = buildPath;  // Exported for testing.
