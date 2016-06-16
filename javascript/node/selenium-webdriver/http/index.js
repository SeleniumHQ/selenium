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
const https = require('https');
const url = require('url');

const httpLib = require('../lib/http');


/**
 * A basic HTTP client used to send messages to a remote end.
 *
 * @implements {httpLib.Client}
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
     *            port: (?string|undefined),
     *            protocol: (?string|undefined)}}
     */
    this.options_ = {
      auth: parsedUrl.auth,
      host: parsedUrl.hostname,
      path: parsedUrl.pathname,
      port: parsedUrl.port,
      protocol: parsedUrl.protocol
    };
  }

  /** @override */
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
      protocol: this.options_.protocol,
      path: path,
      headers: headers
    };

    if (this.agent_) {
      options.agent = this.agent_;
    }

    var proxy = this.proxy_;
    return new Promise(function(fulfill, reject) {
      sendRequest(options, fulfill, reject, data, proxy);
    });
  }
}


/**
 * Sends a single HTTP request.
 * @param {!Object} options The request options.
 * @param {function(!httpLib.Response)} onOk The function to call if the
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
    options.path = 'http://' + options.host + options.path;
    options.host = proxy.hostname;
    options.port = proxy.port;

    if (proxy.auth) {
      options.headers['Proxy-Authorization'] =
          'Basic ' + new Buffer(proxy.auth).toString('base64');
    }
  }

  let requestFn = options.protocol === 'https:' ? https.request : http.request;
  var request = requestFn(options, function onResponse(response) {
    if (response.statusCode == 302 || response.statusCode == 303) {
      try {
        var location = url.parse(response.headers['location']);
      } catch (ex) {
        onError(Error(
            'Failed to parse "Location" header for server redirect: ' +
            ex.message + '\nResponse was: \n' +
            new httpLib.Response(response.statusCode, response.headers, '')));
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
        protocol: location.protocol,
        headers: {
          'Accept': 'application/json; charset=utf-8'
        }
      }, onOk, onError, undefined, opt_proxy);
      return;
    }

    var body = [];
    response.on('data', body.push.bind(body));
    response.on('end', function() {
      var resp = new httpLib.Response(
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


// PUBLIC API

exports.Executor = httpLib.Executor;
exports.HttpClient = HttpClient;
exports.Request = httpLib.Request;
exports.Response = httpLib.Response;
