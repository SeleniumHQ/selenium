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
 * @typedef {{protocol: (?string|undefined),
 *            auth: (?string|undefined),
 *            hostname: (?string|undefined),
 *            host: (?string|undefined),
 *            port: (?string|undefined),
 *            path: (?string|undefined),
 *            pathname: (?string|undefined)}}
 */
var RequestOptions;


/**
 * @param {string} aUrl The request URL to parse.
 * @return {RequestOptions} The request options.
 * @throws {Error} if the URL does not include a hostname.
 */
function getRequestOptions(aUrl) {
  let options = url.parse(aUrl);
  if (!options.hostname) {
    throw new Error('Invalid URL: ' + aUrl);
  }
  // Delete the search and has portions as they are not used.
  options.search = null;
  options.hash = null;
  options.path = options.pathname;
  return options;
}


/** @const {string} */
const USER_AGENT = (function() {
  const version = require('../package.json').version;
  const platform =
      ({'darwin': 'mac', 'win32': 'windows'}[process.platform]) || 'linux';
  return `selenium/${version} (js ${platform})`;
})();


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
    /** @private {http.Agent} */
    this.agent_ = opt_agent || null;

    /**
     * Base options for each request.
     * @private {RequestOptions}
     */
    this.options_ = getRequestOptions(serverUrl);

    /**
     * @private {?RequestOptions}
     */
    this.proxyOptions_ = opt_proxy ? getRequestOptions(opt_proxy) : null;
  }

  /** @override */
  send(httpRequest) {
    let data;

    let headers = {};

    if (httpRequest.headers) {
      httpRequest.headers.forEach(function(value, name) {
        headers[name] = value;
      });
    }

    headers['User-Agent'] = USER_AGENT;
    headers['Content-Length'] = 0;
    if (httpRequest.method == 'POST' || httpRequest.method == 'PUT') {
      data = JSON.stringify(httpRequest.data);
      headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
      headers['Content-Type'] = 'application/json;charset=UTF-8';
    }

    let path = this.options_.path;
    if (path.endsWith('/') && httpRequest.path.startsWith('/')) {
      path += httpRequest.path.substring(1);
    } else {
      path += httpRequest.path;
    }
    let parsedPath = url.parse(path);

    let options = {
      agent: this.agent_ || null,
      method: httpRequest.method,

      auth: this.options_.auth,
      hostname: this.options_.hostname,
      port: this.options_.port,
      protocol: this.options_.protocol,

      path: parsedPath.path,
      pathname: parsedPath.pathname,
      search: parsedPath.search,
      hash: parsedPath.hash,

      headers,
    };

    return new Promise((fulfill, reject) => {
      sendRequest(options, fulfill, reject, data, this.proxyOptions_);
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
 * @param {?RequestOptions=} opt_proxy The proxy server to use for the request.
 * @param {number=} opt_retries The current number of retries.
 */
function sendRequest(options, onOk, onError, opt_data, opt_proxy, opt_retries) {
  var hostname = options.hostname;
  var port = options.port;

  if (opt_proxy) {
    let proxy = /** @type {RequestOptions} */(opt_proxy);

    // RFC 2616, section 5.1.2:
    // The absoluteURI form is REQUIRED when the request is being made to a
    // proxy.
    let absoluteUri = url.format(options);

    // RFC 2616, section 14.23:
    // An HTTP/1.1 proxy MUST ensure that any request message it forwards does
    // contain an appropriate Host header field that identifies the service
    // being requested by the proxy.
    let targetHost = options.hostname;
    if (options.port) {
      targetHost += ':' + options.port;
    }

    // Update the request options with our proxy info.
    options.headers['Host'] = targetHost;
    options.path = absoluteUri;
    options.host = proxy.host;
    options.hostname = proxy.hostname;
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
        location.hostname = hostname;
        location.port = port;
      }

      request.abort();
      sendRequest({
        method: 'GET',
        protocol: location.protocol || options.protocol,
        hostname: location.hostname,
        port: location.port,
        path: location.path,
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'User-Agent': USER_AGENT,
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
          Buffer.concat(body).toString('utf8').replace(/\0/g, ''));
      onOk(resp);
    });
  });

  request.on('error', function(e) {
    if (typeof opt_retries === 'undefined') {
      opt_retries = 0;
    }

    if (shouldRetryRequest(opt_retries, e)) {
      opt_retries += 1;
      setTimeout(function() {
        sendRequest(options, onOk, onError, opt_data, opt_proxy, opt_retries);
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


const MAX_RETRIES = 3;

/**
 * A retry is sometimes needed on Windows where we may quickly run out of
 * ephemeral ports. A more robust solution is bumping the MaxUserPort setting
 * as described here: http://msdn.microsoft.com/en-us/library/aa560610%28v=bts.20%29.aspx
 *
 * @param {!number} retries
 * @param {!Error} err
 * @return {boolean}
 */
function shouldRetryRequest(retries, err) {
  return retries < MAX_RETRIES && isRetryableNetworkError(err);
}

/**
 * @param {!Error} err
 * @return {boolean}
 */
function isRetryableNetworkError(err) {
  if (err && err.code) {
    return err.code === 'ECONNABORTED' ||
          err.code === 'ECONNRESET' ||
          err.code === 'ECONNREFUSED' ||
          err.code === 'EADDRINUSE' ||
          err.code === 'EPIPE';
  }

  return false;
}


// PUBLIC API

exports.Agent = http.Agent;
exports.Executor = httpLib.Executor;
exports.HttpClient = HttpClient;
exports.Request = httpLib.Request;
exports.Response = httpLib.Response;
