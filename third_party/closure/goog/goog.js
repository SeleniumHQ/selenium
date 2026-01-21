// Copyright 2018 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview ES6 module that exports symbols from base.js so that ES6
 * modules do not need to use globals and so that is clear if a project is using
 * Closure's base.js file. It is also a subset of properties in base.js, meaning
 * it should be clearer what should not be used in ES6 modules
 * (goog.module/provide are not exported here, for example). Though that is not
 * to say that everything in this file should be used in an ES6 module; some
 * depreciated functions are exported to make migration easier (e.g.
 * goog.scope).
 *
 * Note that this does not load Closure's base.js file, it is still up to the
 * programmer to include it. Nor does the fact that this is an ES6 module mean
 * that projects no longer require deps.js files for debug loading - they do.
 * Closure will need to load your ES6 modules for you if you have any Closure
 * file (goog.provide/goog.module) dependencies, as they need to be available
 * before the ES6 module evaluates.
 *
 * Also note that this file has special compiler handling! It is okay to export
 * anything from this file, but the name also needs to exist on the global goog.
 * This special compiler pass enforces that you always import this file as
 * `import * as goog`, as many tools use regex based parsing to find
 * goog.require calls.
 */

export const global = goog.global;
export const require = goog.require;
export const define = goog.define;
export const DEBUG = goog.DEBUG;
export const LOCALE = goog.LOCALE;
export const TRUSTED_SITE = goog.TRUSTED_SITE;
export const DISALLOW_TEST_ONLY_CODE = goog.DISALLOW_TEST_ONLY_CODE;
export const getGoogModule = goog.module.get;
export const setTestOnly = goog.setTestOnly;
export const forwardDeclare = goog.forwardDeclare;
export const getObjectByName = goog.getObjectByName;
export const basePath = goog.basePath;
export const addSingletonGetter = goog.addSingletonGetter;
export const typeOf = goog.typeOf;
export const isArrayLike = goog.isArrayLike;
export const isDateLike = goog.isDateLike;
export const isObject = goog.isObject;
export const getUid = goog.getUid;
export const hasUid = goog.hasUid;
export const removeUid = goog.removeUid;
export const now = Date.now;
export const globalEval = goog.globalEval;
export const getCssName = goog.getCssName;
export const setCssNameMapping = goog.setCssNameMapping;
export const getMsg = goog.getMsg;
export const getMsgWithFallback = goog.getMsgWithFallback;
export const exportSymbol = goog.exportSymbol;
export const exportProperty = goog.exportProperty;
export const abstractMethod = goog.abstractMethod;
export const cloneObject = goog.cloneObject;
export const bind = goog.bind;
export const partial = goog.partial;
export const inherits = goog.inherits;
export const scope = goog.scope;
export const defineClass = goog.defineClass;
export const declareModuleId = goog.declareModuleId;

// Export select properties of module. Do not export the function itself or
// goog.module.declareLegacyNamespace.
export const module = {
  get: goog.module.get,
};

// Omissions include:
// goog.ENABLE_DEBUG_LOADER - define only used in base.
// goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING - define only used in base.
// goog.provide - ES6 modules do not provide anything.
// goog.module - ES6 modules cannot be goog.modules.
// goog.module.declareLegacyNamespace - ES6 modules cannot declare namespaces.
// goog.addDependency - meant to only be used by dependency files.
// goog.DEPENDENCIES_ENABLED - constant only used in base.
// goog.loadModule - should not be called by any ES6 module; exists for
//   generated bundles.
// goog.LOAD_MODULE_USING_EVAL - define only used in base.
// goog.SEAL_MODULE_EXPORTS - define only used in base.
// goog.DebugLoader - used rarely, only outside of compiled code.
