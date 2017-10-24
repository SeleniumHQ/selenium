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

'use strict';

var os = require('os');


function getLoInterface() {
  var name;
  if (process.platform === 'darwin') {
    name = 'lo0';
  } else if (process.platform === 'linux') {
    name = 'lo';
  }
  return name ? os.networkInterfaces()[name] : null;
}


/**
 * Queries the system network interfaces for an IP address.
 * @param {boolean} loopback Whether to find a loopback address.
 * @param {string=} opt_family The IP family (IPv4 or IPv6). Defaults to IPv4.
 * @return {string} The located IP address or undefined.
 */
function getAddress(loopback, opt_family) {
  var family = opt_family || 'IPv4';
  var addresses = [];

  var interfaces;
  if (loopback) {
    var lo = getLoInterface();
    interfaces = lo ? [lo] : null;
  }
  interfaces = interfaces || os.networkInterfaces();
  for (var key in interfaces) {
    if (!interfaces.hasOwnProperty(key)) {
      continue;
    }

    interfaces[key].forEach(function(ipAddress) {
      if (ipAddress.family === family &&
          ipAddress.internal === loopback) {
        addresses.push(ipAddress.address);
      }
    });
  }
  return addresses[0];
}


// PUBLIC API


/**
 * Retrieves the external IP address for this host.
 * @param {string=} opt_family The IP family to retrieve. Defaults to "IPv4".
 * @return {string} The IP address or undefined if not available.
 */
exports.getAddress = function(opt_family) {
  return getAddress(false, opt_family);
};


/**
 * Retrieves a loopback address for this machine.
 * @param {string=} opt_family The IP family to retrieve. Defaults to "IPv4".
 * @return {string} The IP address or undefined if not available.
 */
exports.getLoopbackAddress = function(opt_family) {
  return getAddress(true, opt_family);
};


/**
 * Splits a hostport string, e.g. "www.example.com:80", into its component
 * parts.
 *
 * @param {string} hostport The string to split.
 * @return {{host: string, port: ?number}} A host and port. If no port is
 *     present in the argument `hostport`, port is null.
 */
exports.splitHostAndPort = function(hostport) {
  let lastIndex = hostport.lastIndexOf(':');
  if (lastIndex < 0) {
    return {host: hostport, port: null};
  }

  let firstIndex = hostport.indexOf(':');
  if (firstIndex != lastIndex && !hostport.includes('[')) {
    // Multiple colons but no brackets, so assume the string is an IPv6 address
    // with no port (e.g. "1234:5678:9:0:1234:5678:9:0").
    return {host: hostport, port: null};
  }

  let host = hostport.slice(0, lastIndex);
  if (host.startsWith('[') && host.endsWith(']')) {
    host = host.slice(1, -1);
  }

  let port = parseInt(hostport.slice(lastIndex + 1), 10);
  return {host, port};
};
