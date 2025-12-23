/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw DebugError(msg) directly, Error(msg) is
 * sufficient.
 */

goog.module('goog.debug.Error');
goog.module.declareLegacyNamespace();

const utils = goog.require('goog.utils');



/**
 * Base class for custom error objects.
 * @param {*=} msg The message associated with the error.
 * @param {{
 *    message: (?|undefined),
 *    name: (?|undefined),
 *    lineNumber: (?|undefined),
 *    fileName: (?|undefined),
 *    stack: (?|undefined),
 *    cause: (?|undefined),
 * }=} cause The original error object to chain with.
 * @constructor
 * @extends {Error}
 */
function DebugError(msg = undefined, cause = undefined) {
  // Attempt to ensure there is a stack trace.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, DebugError);
  } else {
    const stack = new Error().stack;
    if (stack) {
      /** @override @type {string} */
      this.stack = stack;
    }
  }

  if (msg) {
    /** @override @type {string} */
    this.message = String(msg);
  }

  if (cause !== undefined) {
    /** @type {?} */
    this.cause = cause;
  }

  /**
   * Whether to report this error to the server. Setting this to false will
   * cause the error reporter to not report the error back to the server,
   * which can be useful if the client knows that the error has already been
   * logged on the server.
   * @type {boolean}
   */
  this.reportErrorToServer = true;
}
utils.inherits(DebugError, Error);


/** @override @type {string} */
DebugError.prototype.name = 'CustomError';


exports = DebugError;
