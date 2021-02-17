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

'use strict'

const assert = require('assert'),
  http = require('http'),
  url = require('url')

const net = require('../../net'),
  portprober = require('../../net/portprober'),
  promise = require('../..').promise

/**
 * Encapsulates a simple HTTP server for testing. The {@code onrequest}
 * function should be overridden to define request handling behavior.
 * @param {function(!http.ServerRequest, !http.ServerResponse)} requestHandler
 *     The request handler for the server.
 * @constructor
 */
let Server = function (requestHandler) {
  let server = http.createServer(function (req, res) {
    requestHandler(req, res)
  })

  server.on('connection', function (stream) {
    stream.setTimeout(4000)
  })

  /** @typedef {{port: number, address: string, family: string}} */
  let Host // eslint-disable-line

  /**
   * Starts the server on the given port. If no port, or 0, is provided,
   * the server will be started on a random port.
   * @param {number=} opt_port The port to start on.
   * @return {!Promise<Host>} A promise that will resolve
   *     with the server host when it has fully started.
   */
  this.start = function (opt_port) {
    assert(
      typeof opt_port !== 'function',
      'start invoked with function, not port (mocha callback)?'
    )
    const port = opt_port || portprober.findFreePort('localhost')
    return Promise.resolve(port)
      .then((port) => {
        return promise.checkedNodeCall(
          server.listen.bind(server, port, 'localhost')
        )
      })
      .then(function () {
        return server.address()
      })
  }

  /**
   * Stops the server.
   * @return {!Promise} A promise that will resolve when the
   *     server has closed all connections.
   */
  this.stop = function () {
    return new Promise((resolve) => server.close(resolve))
  }

  /**
   * @return {Host} This server's host info.
   * @throws {Error} If the server is not running.
   */
  this.address = function () {
    const addr = server.address()
    if (!addr) {
      throw Error('There server is not running!')
    }
    return addr
  }

  /**
   * return {string} The host:port of this server.
   * @throws {Error} If the server is not running.
   */
  this.host = function () {
    return net.getLoopbackAddress() + ':' + this.address().port
  }

  /**
   * Formats a URL for this server.
   * @param {string=} opt_pathname The desired pathname on the server.
   * @return {string} The formatted URL.
   * @throws {Error} If the server is not running.
   */
  this.url = function (opt_pathname) {
    const addr = this.address()
    const pathname = opt_pathname || ''
    return url.format({
      protocol: 'http',
      hostname: net.getLoopbackAddress(),
      port: addr.port,
      pathname: pathname,
    })
  }
}

// PUBLIC API

exports.Server = Server
