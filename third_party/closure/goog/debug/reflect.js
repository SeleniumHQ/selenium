// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview JavaScript reflection tools. They should only be used for
 * debugging non-compiled code or tests, because there is no guarantee that
 * they work consistently in all browsers.
 *
 */

goog.provide('goog.debug.reflect');


/**
 * Maps the unique id of the known constructors to their full names.
 * Initialized lazily.
 * @type {Object.<number, string>}
 * @private
 */
goog.debug.reflect.typeMap_ = null;


/**
 * List of all known constructors. Initialized lazily.
 * @type {Array.<!Function>}
 * @private
 */
goog.debug.reflect.constructors_ = null;


/**
 * Copy of {@code Object.prototype.toString} to use if it is overridden later.
 * Although saving the original {@code toString} somewhat protects against
 * third-party libraries which touch {@code Object.prototype}, the actual goal
 * of this assignment is to allow overriding that method, thus more debug
 * information can be exposed about objects.
 * See {@link goog.debug.reflect.typeOf}.
 * @private
 */
goog.debug.reflect.toString_ = Object.prototype.toString;


/**
 * Registers a type which will be recognized by goog.debug.reflect.typeOf.
 * @param {string} name Full name of the type.
 * @param {!Function} ctor The constructor.
 * @private
 */
goog.debug.reflect.registerType_ = function(name, ctor) {
  goog.debug.reflect.constructors_.push(ctor);
  goog.debug.reflect.typeMap_[goog.getUid(ctor)] = name;
};


/**
 * Adds all known constructors to the type registry.
 * @private
 */
goog.debug.reflect.init_ = function() {
  if (goog.debug.reflect.typeMap_) {
    return;
  }

  goog.debug.reflect.typeMap_ = {};
  goog.debug.reflect.constructors_ = [];
  var implicitNs = goog.getObjectByName('goog.implicitNamespaces_') || {};

  for (var ns in implicitNs) {
    if (implicitNs.hasOwnProperty(ns)) {
      var nsObj = goog.getObjectByName(ns);
      for (var name in nsObj) {
        if (nsObj.hasOwnProperty(name) && goog.isFunction(nsObj[name])) {
          goog.debug.reflect.registerType_(ns + '.' + name, nsObj[name]);
        }
      }
    }
  }

  goog.debug.reflect.registerType_('Array', Array);
  goog.debug.reflect.registerType_('Boolean', Boolean);
  goog.debug.reflect.registerType_('Date', Date);
  goog.debug.reflect.registerType_('Error', Error);
  goog.debug.reflect.registerType_('Function', Function);
  goog.debug.reflect.registerType_('Number', Number);
  goog.debug.reflect.registerType_('Object', Object);
  goog.debug.reflect.registerType_('String', String);

  // The compiler gets upset if we alias regexp directly, because
  // then it can't optimize regexps as well. Just be sneaky about it,
  // because this is only for debugging.
  goog.debug.reflect.registerType_('RegExp', goog.global['RegExp']);
};


/**
 * Guesses the real type of the object, even if its {@code toString} method is
 * overridden. Gives exact result for all goog.provided classes in non-compiled
 * code, and some often used native classes in compiled code too. Not tested in
 * multi-frame environment.
 *
 * Example use case to get better type information in the Watch tab of FireBug:
 * <pre>
 * Object.prototype.toString = function() {
 *   return goog.debug.reflect.typeOf(this);
 * };
 * </pre>
 *
 * @param {*} obj An arbitrary variable to get the type of.
 * @return {string} The namespaced type of the argument or 'Object' if didn't
 *     manage to determine it. Warning: in IE7 ActiveX (including DOM) objects
 *     don't expose their type to JavaScript. Their {@code constructor}
 *     property is undefined and they are not even the instances of the
 *     {@code Object} type. This method will recognize them as 'ActiveXObject'.
 */
goog.debug.reflect.typeOf = function(obj) {
  // Check primitive types.
  if (!obj || goog.isNumber(obj) || goog.isString(obj) || goog.isBoolean(obj)) {
    return goog.typeOf(obj);
  }

  // Check if the type is present in the registry.
  goog.debug.reflect.init_();
  if (obj.constructor) {
    // Some DOM objects such as document don't have constructor in IE7.
    var type = goog.debug.reflect.typeMap_[goog.getUid(obj.constructor)];
    if (type) {
      return type;
    }
  }

  // In IE8 the internal 'class' property of ActiveXObjects is Object, but
  // String(obj) tells their real type.
  var isActiveXObject = goog.global.ActiveXObject &&
      obj instanceof ActiveXObject;
  var typeString = isActiveXObject ? String(obj) :
      goog.debug.reflect.toString_.call(/** @type {Object} */ (obj));
  var match = typeString.match(/^\[object (\w+)\]$/);
  if (match) {
    var name = match[1];
    var ctor = goog.global[name];
    try {
      if (obj instanceof ctor) {
        return name;
      }
    } catch (e) {
      // instanceof may fail if the guessed name is not a real type.
    }
  }

  // Fall back to Object or ActiveXObject.
  return isActiveXObject ? 'ActiveXObject' : 'Object';
};
