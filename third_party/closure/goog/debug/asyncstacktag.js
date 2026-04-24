/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilites for creating and running console tasks which improve
 * stack traces of asynchronous code using the Async Stack Tagging API
 * (https://developer.chrome.com/docs/devtools/console/api/#createtask).
 */

goog.module('goog.debug.asyncStackTag');
goog.module.declareLegacyNamespace();

const {assertExists} = goog.require('goog.asserts');

/**
 * Store a local variable with the createTask function. This prevents tests that
 * overwrite console from failing.
 * @const {(function(string): ?)|undefined}
 */
const createTask =
    goog.DEBUG && goog.global.console && goog.global.console.createTask ?
    goog.global.console.createTask.bind(goog.global.console) :
    undefined;

/** @const {symbol|undefined} */
const CONSOLE_TASK_SYMBOL = createTask ? Symbol('consoleTask') : undefined;

/**
 * Utility to wrap the function to tag its stack at this point. If the function
 * has already been tagged, this does nothing.
 * @param {!T} fn
 * @param {string=} name
 * @return {!T}
 * @template T
 */
function wrap(fn, name = 'anonymous') {
  if (!goog.DEBUG || !createTask) return fn;

  if (fn[assertExists(CONSOLE_TASK_SYMBOL)]) {
    return fn;
  }
  const consoleTask = createTask(fn.name || name);
  function wrappedFn(...args) {
    return consoleTask['run'](() => fn.call(/** @type {?} */ (this), ...args));
  }
  wrappedFn[assertExists(CONSOLE_TASK_SYMBOL)] = consoleTask;
  return wrappedFn;
}

exports = {
  wrap,
};