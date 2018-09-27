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

const fs = require('fs');
const net = require('net');
const {exec} = require('child_process');


/**
 * The IANA suggested ephemeral port range.
 * @type {{min: number, max: number}}
 * @const
 * @see http://en.wikipedia.org/wiki/Ephemeral_ports
 */
const DEFAULT_IANA_RANGE = {min: 49152, max: 65535};


/**
 * The epheremal port range for the current system. Lazily computed on first
 * access.
 * @type {Promise<{min: number, max: number}>}
 */
let systemRange = null;


/**
 * Computes the ephemeral port range for the current system. This is based on
 * http://stackoverflow.com/a/924337.
 * @return {!Promise<{min: number, max: number}>} A promise that will resolve to
 *     the ephemeral port range of the current system.
 */
function findSystemPortRange() {
  if (systemRange) {
    return systemRange;
  }
  let range =
      process.platform === 'win32'
          ? findWindowsPortRange() : findUnixPortRange();
  return systemRange = range.catch(() => DEFAULT_IANA_RANGE);
}


/**
 * Executes a command and returns its output if it succeeds.
 * @param {string} cmd The command to execute.
 * @return {!Promise<string>} A promise that will resolve with the command's
 *     stdout data.
 */
function execute(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, function(err, stdout) {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}


/**
 * Computes the ephemeral port range for a Unix-like system.
 * @return {!Promise<{min: number, max: number}>} A promise that will resolve
 *     with the ephemeral port range on the current system.
 */
async function findUnixPortRange() {
  var cmd;
  if (process.platform === 'sunos') {
    cmd =
        '/usr/sbin/ndd /dev/tcp tcp_smallest_anon_port tcp_largest_anon_port';
  } else if (fs.existsSync('/proc/sys/net/ipv4/ip_local_port_range')) {
    // Linux
    cmd = 'cat /proc/sys/net/ipv4/ip_local_port_range';
  } else {
    cmd = 'sysctl net.inet.ip.portrange.first net.inet.ip.portrange.last' +
        ' | sed -e "s/.*:\\s*//"';
  }

  let stdout = await execute(cmd);
  if (!stdout || !stdout.length) {
    return DEFAULT_IANA_RANGE;
  };

  let range = stdout.trim().split(/\s+/).map(Number);
  if (range.some(isNaN)) {
    return DEFAULT_IANA_RANGE;
  };

  return {min: range[0], max: range[1]};
}


/**
 * Computes the ephemeral port range for a Windows system.
 * @return {!Promise<{min: number, max: number}>} A promise that will resolve
 *     with the ephemeral port range on the current system.
 */
async function findWindowsPortRange() {
  // First, check if we're running on XP.  If this initial command fails,
  // we just fallback on the default IANA range.
  let stdout = await execute('cmd.exe /c ver');
  if (/Windows XP/.test(stdout)) {
    // TODO: Try to read these values from the registry.
    return {min: 1025, max: 5000};
  } else {
    stdout = await execute('netsh int ipv4 show dynamicport tcp');
    /* > netsh int ipv4 show dynamicport tcp
      Protocol tcp Dynamic Port Range
      ---------------------------------
      Start Port : 49152
      Number of Ports : 16384
     */
    let range = stdout.split(/\n/)
        .filter((line) => /.*:\s*\d+/.test(line))
        .map((line) => Number(line.split(/:\s*/)[1]));
    return {
      min: range[0],
      max: range[0] + range[1]
    };
  }
}


/**
 * Tests if a port is free.
 * @param {number} port The port to test.
 * @param {string=} opt_host The bound host to test the {@code port} against.
 *     Defaults to {@code INADDR_ANY}.
 * @return {!Promise<boolean>} A promise that will resolve with whether the port
 *     is free.
 */
function isFree(port, opt_host) {
  return new Promise((resolve, reject) => {
    let server = net.createServer().on('error', function(e) {
      if (e.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        reject(e);
      }
    });

    server.listen(port, opt_host, function() {
      server.close(() => resolve(true));
    });
  });
}


/**
 * @param {string=} opt_host The bound host to test the {@code port} against.
 *     Defaults to {@code INADDR_ANY}.
 * @return {!Promise<number>} A promise that will resolve to a free port. If a
 *     port cannot be found, the promise will be rejected.
 */
async function findFreePort(opt_host) {
  let range = await findSystemPortRange();
  for (let i = 0; i < 100; i++) {
    let port = Math.floor(Math.random() * (range.max - range.min) + range.min);
    if (await isFree(port, opt_host)) {
      return port;
    }
  }
  throw Error('Unable to find a free port');
}


// PUBLIC API


exports.findFreePort = findFreePort;
exports.isFree = isFree;
