// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Defines the base class for a module. This is used to allow the
 * code to be modularized, giving the benefits of lazy loading and loading on
 * demand.
 *
 */

goog.provide('goog.module.BaseModule');

goog.require('goog.Disposable');



/**
 * A basic module object that represents a module of Javascript code that can
 * be dynamically loaded.
 *
 * @constructor
 * @extends {goog.Disposable}
 */
goog.module.BaseModule = function() {
  goog.Disposable.call(this);
};
goog.inherits(goog.module.BaseModule, goog.Disposable);


/**
 * Performs any load-time initialization that the module requires.
 * @param {Object} context The module context.
 */
goog.module.BaseModule.prototype.initialize = function(context) {};
