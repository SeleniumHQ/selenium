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

const childProcess = require('child_process');


/**
 * A hash with configuration options for an executed command.
 *
 * - `args` - Command line arguments.
 * - `env` - Command environment; will inherit from the current process if
 *     missing.
 * - `stdio` - IO configuration for the spawned server process. For more
 *     information, refer to the documentation of `child_process.spawn`.
 *
 * @typedef {{
 *   args: (!Array<string>|undefined),
 *   env: (!Object<string, string>|undefined),
 *   stdio: (string|!Array<string|number|!stream.Stream|null|undefined>|
 *           undefined)
 * }}
 */
var Options;


/**
 * Describes a command's termination conditions.
 */
class Result {
  /**
   * @param {?number} code The exit code, or {@code null} if the command did not
   *     exit normally.
   * @param {?string} signal The signal used to kill the command, or
   *     {@code null}.
   */
  constructor(code, signal) {
    /** @type {?number} */
    this.code = code;

    /** @type {?string} */
    this.signal = signal;
  }

  /** @override */
  toString() {
    return `Result(code=${this.code}, signal=${this.signal})`;
  }
}


const COMMAND_RESULT = /** !WeakMap<!Command, !Promise<!Result>> */new WeakMap;
const KILL_HOOK = /** !WeakMap<!Command, function(string)> */new WeakMap;

/**
 * Represents a command running in a sub-process.
 */
class Command {
  /**
   * @param {!Promise<!Result>} result The command result.
   * @param {function(string)} onKill The function to call when {@link #kill()}
   *     is called.
   */
  constructor(result, onKill) {
    COMMAND_RESULT.set(this, result);
    KILL_HOOK.set(this, onKill);
  }

  /**
   * @return {!Promise<!Result>} A promise for the result of this
   *     command.
   */
  result() {
    return /** @type {!Promise<!Result>} */(COMMAND_RESULT.get(this));
  }

  /**
   * Sends a signal to the underlying process.
   * @param {string=} opt_signal The signal to send; defaults to `SIGTERM`.
   */
  kill(opt_signal) {
    KILL_HOOK.get(this)(opt_signal || 'SIGTERM');
  }
}


// PUBLIC API


/**
 * Spawns a child process. The returned {@link Command} may be used to wait
 * for the process result or to send signals to the process.
 *
 * @param {string} command The executable to spawn.
 * @param {Options=} opt_options The command options.
 * @return {!Command} The launched command.
 */
module.exports = function exec(command, opt_options) {
  var options = opt_options || {};

  var proc = childProcess.spawn(command, options.args || [], {
    env: options.env || process.env,
    stdio: options.stdio || 'ignore'
  });

  // This process should not wait on the spawned child, however, we do
  // want to ensure the child is killed when this process exits.
  proc.unref();
  process.once('exit', onProcessExit);

  let result = new Promise(resolve => {
    proc.once('exit', (code, signal) => {
      proc = null;
      process.removeListener('exit', onProcessExit);
      resolve(new Result(code, signal));
    });
  });
  return new Command(result, killCommand);

  function onProcessExit() {
    killCommand('SIGTERM');
  }

  function killCommand(signal) {
    process.removeListener('exit', onProcessExit);
    if (proc) {
      proc.kill(signal);
      proc = null;
    }
  }
};

// Exported to improve generated API documentation.

module.exports.Command = Command;
/** @typedef {!Options} */
module.exports.Options = Options;
module.exports.Result = Result;
