/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The dispose method is used to clean up references and
 * resources.
 */

goog.module('goog.dispose');
goog.module.declareLegacyNamespace();

/**
 * Calls `dispose` on the argument if it supports it. If obj is not an
 *     object with a dispose() method, this is a no-op.
 * @param {*} obj The object to dispose of.
 */
function dispose(obj) {
  if (obj && typeof obj.dispose == 'function') {
    obj.dispose();
  }
}
exports = dispose;
