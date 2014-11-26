// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview An interface for module loading.
 *
 */

goog.provide('goog.module.AbstractModuleLoader');

/** @suppress {extraRequire} */
goog.require('goog.module');


/**
 * An interface that loads JavaScript modules.
 * @interface
 */
goog.module.AbstractModuleLoader = function() {};


/**
 * Loads a list of JavaScript modules.
 *
 * @param {Array<string>} ids The module ids in dependency order.
 * @param {Object} moduleInfoMap A mapping from module id to ModuleInfo object.
 * @param {function()?=} opt_successFn The callback if module loading is a
 *     success.
 * @param {function(?number)?=} opt_errorFn The callback if module loading is an
 *     error.
 * @param {function()?=} opt_timeoutFn The callback if module loading times out.
 * @param {boolean=} opt_forceReload Whether to bypass cache while loading the
 *     module.
 */
goog.module.AbstractModuleLoader.prototype.loadModules = function(
    ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn,
    opt_forceReload) {};


/**
 * Pre-fetches a JavaScript module.
 *
 * @param {string} id The module id.
 * @param {!goog.module.ModuleInfo} moduleInfo The module info.
 */
goog.module.AbstractModuleLoader.prototype.prefetchModule = function(
    id, moduleInfo) {};
