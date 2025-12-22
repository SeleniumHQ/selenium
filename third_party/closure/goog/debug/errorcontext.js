/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides methods dealing with context on error objects.
 */

goog.provide('goog.debug.errorcontext');


/**
 * Adds key-value context to the error.
 * @param {!Error} err The error to add context to.
 * @param {string} contextKey Key for the context to be added.
 * @param {string} contextValue Value for the context to be added.
 */
goog.debug.errorcontext.addErrorContext = function(
    err, contextKey, contextValue) {
  'use strict';
  if (!err[goog.debug.errorcontext.CONTEXT_KEY_]) {
    err[goog.debug.errorcontext.CONTEXT_KEY_] = {};
  }
  err[goog.debug.errorcontext.CONTEXT_KEY_][contextKey] = contextValue;
};


/**
 * @param {!Error} err The error to get context from.
 * @return {!Object<string, string>} The context of the provided error.
 */
goog.debug.errorcontext.getErrorContext = function(err) {
  'use strict';
  return err[goog.debug.errorcontext.CONTEXT_KEY_] || {};
};


// TODO(user): convert this to a Symbol once goog.debug.ErrorReporter is
// able to use ES6.
/** @private @const {string} */
goog.debug.errorcontext.CONTEXT_KEY_ = '__closure__error__context__984382';
