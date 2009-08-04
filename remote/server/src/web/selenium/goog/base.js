// Copyright 2006 Google Inc.
// All Rights Reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Bootstrap for the Google JS Library
 */

/**
 * @define {boolean} Overridden to true by the compiler when
 *     --mark_as_compiled is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Google JS library.  Checks to see goog is
 * already defined in the current scope before assigning to prevent
 * clobbering if base.js is loaded more than once.
 */
var goog = goog || {}; // Check to see if already defined in current scope


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {boolean?}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Creates object stubs for a namespace. When present in a file, goog.provide
 * also indicates that the file defines the indicated object.
 * @param {string} name name of the object that this file defines.
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.getObjectByName(name) && !goog.implicitNamespaces_[name]) {
      throw 'Namespace "' + name + '" already declared.';
    }

    var namespace = name;
    while ((namespace = namespace.substr(0, namespace.lastIndexOf('.')))) {
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


if (!COMPILED) {
  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares
   * that 'goog' and 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {Object} opt_object the object to expose at the end of the path.
 * @private
 */
goog.exportPath_ = function(name, opt_object) {
  var parts = name.split('.');
  var cur = goog.global;
  var part;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example. 
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Parentheses added to eliminate strict JS warning in Firefox.
  while ((part = parts.shift())) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Returns an object based on its fully qualified name
 * @param {string} name The fully qualified name.
 * @return {Object?} The object or, if not found, null.
 */
goog.getObjectByName = function(name) {
  var parts = name.split('.');
  var cur = goog.global;
  for (var part; part = parts.shift(); ) {
    if (cur[part]) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};


/**
 * Implements a system for the dynamic resolution of dependencies
 * that works in parallel with the BUILD system.
 * @param {string} rule Rule to include, in the form goog.package.part.
 */
goog.require = function(rule) {

  // if the object already exists we do not need do do anything
  if (!COMPILED) {
    if (goog.getObjectByName(rule)) {
      return;
    }
    var path = goog.getPathFromDeps_(rule);
    if (path) {
      goog.included_[path] = true;
      goog.writeScripts_();
    } else {
      // NOTE(nicksantos): We could throw an error, but this would break
      // legacy users that depended on this failing silently. Instead, the
      // compiler should warn us when there are invalid goog.require calls.
    }
  }
};


/**
 * Path for included scripts
 * @type {string}
 */
goog.basePath = '';


/**
 * Null function used for default values of callbacks, etc.
 * @type {Function}
 */
goog.nullFunction = function() {};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 *
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error
 * will be thrown when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as
 * an argument because that would make it more difficult to obfuscate
 * our JavaScript code.
 *
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


if (!COMPILED) {
  /**
   * Object used to keep track of urls that have already been added. This
   * record allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    visited: {}, // used when resolving dependencies to prevent us from
                 // visiting the file twice
    written: {} // used to keep track of script files we have written
  };


  /**
   * Tries to detect the base path of the base.js script that bootstraps
   * Google JS Library
   * @private
   */
  goog.findBasePath_ = function() {
    var doc = goog.global.document;
    if (typeof doc == 'undefined') {
      return;
    }
    if (goog.global.GOOG_BASE_PATH) {
      goog.basePath = goog.global.GOOG_BASE_PATH;
      return;
    } else {
      goog.global.GOOG_BASE_PATH = null;
    }
    var scripts = doc.getElementsByTagName('script');
    for (var script, i = 0; script = scripts[i]; i++) {
      var src = script.src;
      var l = src.length;
      if (src.substr(l - 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Writes a script tag if, and only if, that script hasn't already been added
   * to the document.  (Must be called at execution time)
   * @param {string} src Script source.
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    var doc = goog.global.document;
    if (typeof doc != 'undefined' &&
        !goog.dependencies_.written[src]) {
      goog.dependencies_.written[src] = true;
      doc.write('<script type="text/javascript" src="' +
                src + '"></' + 'script>');
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls writeScriptTag_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // the scripts we need to write this time
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // we have already visited this one. We can get here if we have cyclic
      // dependencies
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          visitNode(deps.nameToPath[requireName]);
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.writeScriptTag_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {string?} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();
  goog.writeScriptTag_(goog.basePath + 'deps.js');
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // We cannot use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype. Custom object cannot have non enumerable length and
      // NodeLists don't have a slice method.
      if (typeof value.length == 'number' &&
          typeof value.splice != 'undefined' &&
          !goog.propertyIsEnumerable_(value, 'length')) {
        return 'array';
      }

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if (typeof value.call != 'undefined') {
        return 'function';
      }
    } else {
      return 'null';
    }

  // In Safari typeof nodeList returns function.  We would like to return
  // object for those and we can detect an invalid function by making sure that
  // the function object has a call method
  } else if (s == 'function' && typeof value.call == 'undefined') {
    return 'object';
  }
  return s;
};

if (Object.prototype.propertyIsEnumerable) {
  /**
   * Safe way to test whether a property is enumarable.  It allows testing
   * for enumarable on objects where 'propertyIsEnumerable' is overridden or
   * does not exist (like DOM nodes in IE).
   * @param {Object} object The object to test if the property is enumerable.
   * @param {string} propName The property name to check for.
   * @return {boolean} True if the property is enumarable.
   * @private
   */
  goog.propertyIsEnumerable_ = function(object, propName) {
    return Object.prototype.propertyIsEnumerable.call(object, propName);
  };
} else {
  /**
   * Safe way to test whether a property is enumarable.  It allows testing
   * for enumarable on objects where 'propertyIsEnumerable' is overridden or
   * does not exist (like DOM nodes in IE).
   * @param {Object} object The object to test if the property is enumerable.
   * @param {string} propName The property name to check for.
   * @return {boolean} True if the property is enumarable.
   * @private
   */
  goog.propertyIsEnumerable_ = function(object, propName) {
    // KJS in Safari 2 is not ECMAScript compatible and lacks crucial methods
    // such as propertyIsEnumerable.  We therefore use a workaround.
    // Does anyone know a more efficient work around?
    if (propName in object) {
      for (var key in object) {
        if (key == propName) {
          return true;
        }
      }
    }
    return false;
  };
}

/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return typeof val != 'undefined';
};


/**
 * Returns true if the specified value is |null|
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  return goog.isDef(val) && !goog.isNull(val);
};


/**
 * Returns true if the specified value is an array
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays
 * and functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type == 'object' || type == 'array' || type == 'function';
};


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 */
goog.getHashCode = function(obj) {
  // In IE, DOM nodes do not extend Object so they do not have this method.
  // we need to check hasOwnProperty because the proto might have this set.

  if (obj.hasOwnProperty && obj.hasOwnProperty(goog.HASH_CODE_PROPERTY_)) {
    return obj[goog.HASH_CODE_PROPERTY_];
  }
  if (!obj[goog.HASH_CODE_PROPERTY_]) {
    obj[goog.HASH_CODE_PROPERTY_] = ++goog.hashCodeCounter_;
  }
  return obj[goog.HASH_CODE_PROPERTY_];
};


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 */
goog.removeHashCode = function(obj) {
  // DOM nodes in IE are not instance of Object and throws exception
  // for delete. Instead we try to use removeAttribute
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.HASH_CODE_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.HASH_CODE_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * {String} Name for hash code property
 * @private
 */
goog.HASH_CODE_PROPERTY_ = 'goog_hashCode_';


/**
 * @type {number} Counter for hash codes.
 * @private
 */
goog.hashCodeCounter_ = 0;


/**
 * Clone an object/array (recursively)
 * @param {Object} proto Object to clone.
 * @return {Object} Clone of x;.
 */
goog.cloneObject = function(proto) {
  var type = goog.typeOf(proto);
  if (type == 'object' || type == 'array') {
    if (proto.clone) {
      return proto.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in proto) {
      clone[key] = goog.cloneObject(proto[key]);
    }
    return clone;
  }

  return proto;
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Note that bind and partial are optimized such that repeated calls to it do
 * not create more than one function object, so there is no additional cost for
 * something like:<br>
 *
 * <pre>var g = bind(f, obj);
 * var h = partial(g, 1, 2, 3);
 * var k = partial(h, a, b, c);</pre>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object} self Specifies the object which |this| should point to
 *     when the function is run. If the value is null or undefined, it will
 *     default to the global object.
 * @param {Object} var_args Additional arguments that are partially
 *     applied to the function.
 *
 * @return {Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.bind = function(fn, self, var_args) {
  var boundArgs = fn.boundArgs_;

  if (arguments.length > 2) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (boundArgs) {
      args.unshift.apply(args, boundArgs);
    }
    boundArgs = args;
  }

  self = fn.boundSelf_ || self;
  fn = fn.boundFn_ || fn;

  var newfn;
  var context = self || goog.global;

  if (boundArgs) {
    newfn = function() {
      // Combine the static args and the new args into one big array
      var args = Array.prototype.slice.call(arguments);
      args.unshift.apply(args, boundArgs);
      return fn.apply(context, args);
    }
  } else {
    newfn = function() {
      return fn.apply(context, arguments);
    }
  }

  newfn.boundArgs_ = boundArgs;
  newfn.boundSelf_ = self;
  newfn.boundFn_ = fn;

  return newfn;
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  args.unshift(fn, null);
  return goog.bind.apply(null, args);
};


/**
 * Copies all the members of a source object to a target object.
 * This is deprecated. Use goog.object.extend instead.
 * @param {Object} target Target.
 * @param {Object} source Source.
 * @deprecated
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE the for-in-loop does not contain any properties that are not
  // enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * A simple wrapper for new Date().getTime().
 *
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = Date.now || (function() {
  return new Date().getTime();
});


/**
 * Evals javascript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(pupius): can't use .innerHTML since "t('<test>')" will fail and 
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Abstract implementation of goog.getMsg for use with localized messages
 * @param {string} str Translatable string, places holders in the form.{$foo}
 * @param {Object} opt_values Map of place holder name to value.
 */
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), values[key]);
  }
  return str;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated,
 * unless they are exported in turn via this function or
 * goog.exportProperty
 *
 * <p>Also handy for making public items that are defined in anonymous
 * closures.
 *
 * ex. goog.exportSymbol('Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction',
 *                       Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {Object} object Object the name should point to.
 */
goog.exportSymbol = function(publicPath, object) {
  goog.exportPath_(publicPath, object);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {Object} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};



//==============================================================================
// Extending Function
//==============================================================================


/**
 * Some old browsers don't have Function.apply. So sad. We emulate it for them.
 * @param {Object} oScope The Object within the scope of which the Function is
 *     applied. In other words, |this| will be bound to oScope within the body
 *     of the Function called with apply.
 * @param {Array} args Arguments for the function.
 * @return {Object} Value returned from the function.
 */
if (!Function.prototype.apply) {
  Function.prototype.apply = function(oScope, args) {
    var sarg = [];
    var rtrn, call;

    if (!oScope) oScope = goog.global;
    if (!args) args = [];

    for (var i = 0; i < args.length; i++) {
      sarg[i] = 'args[' + i + ']';
    }

    call = 'oScope.__applyTemp__.peek().(' + sarg.join(',') + ');';

    if (!oScope['__applyTemp__']) {
      oScope['__applyTemp__'] = [];
    }

    oScope['__applyTemp__'].push(this);
    rtrn = eval(call);
    oScope['__applyTemp__'].pop();

    return rtrn;
  };
}


/**
 * An alias to the {@link goog.bind()} global function.
 *
 * Usage:
 * var g = f.bind(obj, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Object} self Specifies the object to which |this| should point
 *     when the function is run. If the value is null or undefined, it will
 *     default to the global object.
 * @param {Object} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {Function} A partially-applied form of the Function on which bind()
 *     was invoked as a method.
 * @deprecated
 */
Function.prototype.bind = function(self, var_args) {
  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(this, self);
    return goog.bind.apply(null, args);
  } else {
    return goog.bind(this, self);
  }
};


/**
 * An alias to the {@link goog.partial()} global function.
 *
 * Usage:
 * var g = f.partial(arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Object} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {Function} A partially-applied form of the function partial() was
 *     invoked as a method of.
 * @deprecated
 */
Function.prototype.partial = function(var_args) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(this, null);
  return goog.bind.apply(null, args);
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   ParentClass.call(this, a, b);
 * }
 *
 * ChildClass.inherits(ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} parentCtor Parent class.
 */
Function.prototype.inherits = function(parentCtor) {
  goog.inherits(this, parentCtor);
};


/**
 * Static variant of Function.prototype.inherits.
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};


/**
 * Mixes in an object's properties and methods into the callee's prototype.
 * Basically mixin based inheritance, thus providing an alternative method for
 * adding properties and methods to a class' prototype.
 *
 * <pre>
 * function X() {}
 * X.mixin({
 *   one: 1,
 *   two: 2,
 *   three: 3,
 *   doit: function() { return this.one + this.two + this.three; }
 * });
 *
 * function Y() { }
 * Y.mixin(X.prototype);
 * Y.prototype.four = 15;
 * Y.prototype.doit2 = function() { return this.doit() + this.four; }
 * });
 *
 * // or
 *
 * function Y() { }
 * Y.inherits(X);
 * Y.mixin({
 *   one: 10,
 *   four: 15,
 *   doit2: function() { return this.doit() + this.four; }
 * });
 * </pre>
 *
 * @param {Object} source from which to copy properties.
 * @see goog.mixin
 * @deprecated
 */
Function.prototype.mixin = function(source) {
  goog.mixin(this.prototype, source);
};
