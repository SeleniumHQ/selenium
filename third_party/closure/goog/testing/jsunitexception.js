// Copyright 2017 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.testing.JsUnitException');
goog.setTestOnly();

goog.require('goog.testing.stacktrace');


/**
 * @param {string} comment A summary for the exception.
 * @param {?string=} opt_message A description of the exception.
 * @constructor
 * @extends {Error}
 * @final
 */
goog.testing.JsUnitException = function(comment, opt_message) {
  this.isJsUnitException = true;
  this.message = (comment ? comment : '') +
      (comment && opt_message ? '\n' : '') + (opt_message ? opt_message : '');
  this.stackTrace = goog.testing.stacktrace.get();
  // These fields are for compatibility with jsUnitTestManager.
  this.comment = comment || null;
  this.jsUnitMessage = opt_message || '';

  // Ensure there is a stack trace.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.testing.JsUnitException);
  } else {
    this.stack = new Error().stack || '';
  }
};
goog.inherits(goog.testing.JsUnitException, Error);


/** @override */
goog.testing.JsUnitException.prototype.toString = function() {
  return this.message;
};
