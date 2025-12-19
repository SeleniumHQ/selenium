/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides a function to throw an error without interrupting
 * the current execution context.
 */

goog.module('goog.async.throwException');
goog.module.declareLegacyNamespace();

/**
 * Throw an item without interrupting the current execution context.  For
 * example, if processing a group of items in a loop, sometimes it is useful
 * to report an error while still allowing the rest of the batch to be
 * processed.
 * @param {*} exception
 */
function throwException(exception) {
  // Each throw needs to be in its own context.
  goog.global.setTimeout(() => {
    throw exception;
  }, 0);
}
exports = throwException;
