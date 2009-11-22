// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is corectly maintained.
 *
 */

goog.provide('goog.debug.Error');


/**
 * Base class for custom error objects.
 * @param {*} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {
  this.stack = new Error().stack || '';
  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);


/** @inheritDoc */
goog.debug.Error.prototype.name = 'CustomError';
