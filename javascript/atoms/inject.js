// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Browser atom for injecting JavaScript into the page under
 * test. There is no point in using this atom directly from JavaScript.
 * Instead, it is intended to be used in its compiled form when injecting
 * script from another language (e.g. C++).
 *
 * TODO: Add an example
 */

goog.provide('bot.inject');
goog.provide('bot.inject.cache');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.json');
/**
 * @suppress {extraRequire} Used as a forward declaration which causes
 * compilation errors if missing.
 */
goog.require('bot.response.ResponseObject');
goog.require('goog.array');
goog.require('goog.dom.NodeType');
goog.require('goog.object');
goog.require('goog.userAgent');


/**
 * Type definition for the WebDriver's JSON wire protocol representation
 * of a DOM element.
 * @typedef {{ELEMENT: string}}
 * @see bot.inject.ELEMENT_KEY
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 */
bot.inject.JsonElement;


/**
 * Type definition for a cached Window object that can be referenced in
 * WebDriver's JSON wire protocol. Note, this is a non-standard
 * representation.
 * @typedef {{WINDOW: string}}
 * @see bot.inject.WINDOW_KEY
 */
bot.inject.JsonWindow;


/**
 * Key used to identify DOM elements in the WebDriver wire protocol.
 * @type {string}
 * @const
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 */
bot.inject.ELEMENT_KEY = 'ELEMENT';


/**
 * Key used to identify Window objects in the WebDriver wire protocol.
 * @type {string}
 * @const
 */
bot.inject.WINDOW_KEY = 'WINDOW';


/**
 * Converts an element to a JSON friendly value so that it can be
 * stringified for transmission to the injector. Values are modified as
 * follows:
 * <ul>
 * <li>booleans, numbers, strings, and null are returned as is</li>
 * <li>undefined values are returned as null</li>
 * <li>functions are returned as a string</li>
 * <li>each element in an array is recursively processed</li>
 * <li>DOM Elements are wrapped in object-literals as dictated by the
 *     WebDriver wire protocol</li>
 * <li>all other objects will be treated as hash-maps, and will be
 *     recursively processed for any string and number key types (all
 *     other key types are discarded as they cannot be converted to JSON).
 * </ul>
 *
 * @param {*} value The value to make JSON friendly.
 * @return {*} The JSON friendly value.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
 */
bot.inject.wrapValue = function (value) {
  var _wrap = function (value, seen) {
    switch (goog.typeOf(value)) {
      case 'string':
      case 'number':
      case 'boolean':
        return value;

      case 'function':
        return value.toString();

      case 'array':
        return goog.array.map(/**@type {IArrayLike}*/(value),
          function (v) { return _wrap(v, seen); });

      case 'object':
        // Since {*} expands to {Object|boolean|number|string|undefined}, the
        // JSCompiler complains that it is too broad a type for the remainder of
        // this block where {!Object} is expected. Downcast to prevent generating
        // a ton of compiler warnings.
        value = /**@type {!Object}*/ (value);
        if (seen.indexOf(value) >= 0) {
          throw new bot.Error(bot.ErrorCode.JAVASCRIPT_ERROR,
            'Recursive object cannot be transferred');
        }

        // Sniff out DOM elements. We're using duck-typing instead of an
        // instanceof check since the instanceof might not always work
        // (e.g. if the value originated from another Firefox component)
        if (goog.object.containsKey(value, 'nodeType') &&
          (value['nodeType'] == goog.dom.NodeType.ELEMENT ||
            value['nodeType'] == goog.dom.NodeType.DOCUMENT)) {
          var ret = {};
          ret[bot.inject.ELEMENT_KEY] =
            bot.inject.cache.addElement(/**@type {!Element}*/(value));
          return ret;
        }

        // Check if this is a Window
        if (goog.object.containsKey(value, 'document')) {
          var ret = {};
          ret[bot.inject.WINDOW_KEY] =
            bot.inject.cache.addElement(/**@type{!Window}*/(value));
          return ret;
        }

        seen.push(value);
        if (goog.isArrayLike(value)) {
          return goog.array.map(/**@type {IArrayLike}*/(value),
            function (v) { return _wrap(v, seen); });
        }

        var filtered = goog.object.filter(value, function (val, key) {
          return goog.isNumber(key) || goog.isString(key);
        });
        return goog.object.map(filtered, function (v) { return _wrap(v, seen); });

      default:  // goog.typeOf(value) == 'undefined' || 'null'
        return null;
    }
  };
  return _wrap(value, []);
};


/**
 * Unwraps any DOM element's encoded in the given `value`.
 * @param {*} value The value to unwrap.
 * @param {Document=} opt_doc The document whose cache to retrieve wrapped
 *     elements from. Defaults to the current document.
 * @return {*} The unwrapped value.
 */
bot.inject.unwrapValue = function (value, opt_doc) {
  if (goog.isArray(value)) {
    return goog.array.map(/**@type {IArrayLike}*/(value),
      function (v) { return bot.inject.unwrapValue(v, opt_doc); });
  } else if (goog.isObject(value)) {
    if (typeof value == 'function') {
      return value;
    }

    if (goog.object.containsKey(value, bot.inject.ELEMENT_KEY)) {
      return bot.inject.cache.getElement(value[bot.inject.ELEMENT_KEY],
        opt_doc);
    }

    if (goog.object.containsKey(value, bot.inject.WINDOW_KEY)) {
      return bot.inject.cache.getElement(value[bot.inject.WINDOW_KEY],
        opt_doc);
    }

    return goog.object.map(value, function (val) {
      return bot.inject.unwrapValue(val, opt_doc);
    });
  }
  return value;
};


/**
 * Recompiles `fn` in the context of another window so that the
 * correct symbol table is used when the function is executed. This
 * function assumes the `fn` can be decompiled to its source using
 * `Function.prototype.toString` and that it only refers to symbols
 * defined in the target window's context.
 *
 * @param {!(Function|string)} fn Either the function that should be
 *     recompiled, or a string defining the body of an anonymous function
 *     that should be compiled in the target window's context.
 * @param {!Window} theWindow The window to recompile the function in.
 * @return {!Function} The recompiled function.
 * @private
 */
bot.inject.recompileFunction_ = function (fn, theWindow) {
  if (goog.isString(fn)) {
    try {
      return new theWindow['Function'](fn);
    } catch (ex) {
      // Try to recover if in IE5-quirks mode
      // Need to initialize the script engine on the passed-in window
      if (goog.userAgent.IE && theWindow.execScript) {
        theWindow.execScript(';');
        return new theWindow['Function'](fn);
      }
      throw ex;
    }
  }
  return theWindow == window ? fn : new theWindow['Function'](
    'return (' + fn + ').apply(null,arguments);');
};


/**
 * Executes an injected script. This function should never be called from
 * within JavaScript itself. Instead, it is used from an external source that
 * is injecting a script for execution.
 *
 * <p/>For example, in a WebDriver Java test, one might have:
 * <pre><code>
 * Object result = ((JavascriptExecutor) driver).executeScript(
 *     "return arguments[0] + arguments[1];", 1, 2);
 * </code></pre>
 *
 * <p/>Once transmitted to the driver, this command would be injected into the
 * page for evaluation as:
 * <pre><code>
 * bot.inject.executeScript(
 *     function() {return arguments[0] + arguments[1];},
 *     [1, 2]);
 * </code></pre>
 *
 * <p/>The details of how this actually gets injected for evaluation is left
 * as an implementation detail for clients of this library.
 *
 * @param {!(Function|string)} fn Either the function to execute, or a string
 *     defining the body of an anonymous function that should be executed. This
 *     function should only contain references to symbols defined in the context
 *     of the target window (`opt_window`). Any references to symbols
 *     defined in this context will likely generate a ReferenceError.
 * @param {Array.<*>} args An array of wrapped script arguments, as defined by
 *     the WebDriver wire protocol.
 * @param {boolean=} opt_stringify Whether the result should be returned as a
 *     serialized JSON string.
 * @param {!Window=} opt_window The window in whose context the function should
 *     be invoked; defaults to the current window.
 * @return {!(string|bot.response.ResponseObject)} The response object. If
 *     opt_stringify is true, the result will be serialized and returned in
 *     string format.
 */
bot.inject.executeScript = function (fn, args, opt_stringify, opt_window) {
  var win = opt_window || bot.getWindow();
  var ret;
  try {
    fn = bot.inject.recompileFunction_(fn, win);
    var unwrappedArgs = /**@type {Object}*/ (bot.inject.unwrapValue(args,
      win.document));
    ret = bot.inject.wrapResponse(fn.apply(null, unwrappedArgs));
  } catch (ex) {
    ret = bot.inject.wrapError(ex);
  }
  return opt_stringify ? bot.json.stringify(ret) : ret;
};


/**
 * Executes an injected script, which is expected to finish asynchronously
 * before the given `timeout`. When the script finishes or an error
 * occurs, the given `onDone` callback will be invoked. This callback
 * will have a single argument, a {@link bot.response.ResponseObject} object.
 *
 * The script signals its completion by invoking a supplied callback given
 * as its last argument. The callback may be invoked with a single value.
 *
 * The script timeout event will be scheduled with the provided window,
 * ensuring the timeout is synchronized with that window's event queue.
 * Furthermore, asynchronous scripts do not work across new page loads; if an
 * "unload" event is fired on the window while an asynchronous script is
 * pending, the script will be aborted and an error will be returned.
 *
 * Like `bot.inject.executeScript`, this function should only be called
 * from an external source. It handles wrapping and unwrapping of input/output
 * values.
 *
 * @param {(!Function|string)} fn Either the function to execute, or a string
 *     defining the body of an anonymous function that should be executed. This
 *     function should only contain references to symbols defined in the context
 *     of the target window (`opt_window`). Any references to symbols
 *     defined in this context will likely generate a ReferenceError.
 * @param {Array.<*>} args An array of wrapped script arguments, as defined by
 *     the WebDriver wire protocol.
 * @param {number} timeout The amount of time, in milliseconds, the script
 *     should be permitted to run; must be non-negative.
 * @param {function(string)|function(!bot.response.ResponseObject)} onDone
 *     The function to call when the given `fn` invokes its callback,
 *     or when an exception or timeout occurs. This will always be called.
 * @param {boolean=} opt_stringify Whether the result should be returned as a
 *     serialized JSON string.
 * @param {!Window=} opt_window The window to synchronize the script with;
 *     defaults to the current window.
 */
bot.inject.executeAsyncScript = function (fn, args, timeout, onDone,
  opt_stringify, opt_window) {
  var win = opt_window || window;
  var timeoutId;
  var responseSent = false;

  function sendResponse(status, value) {
    if (!responseSent) {
      if (win.removeEventListener) {
        win.removeEventListener('unload', onunload, true);
      } else {
        win.detachEvent('onunload', onunload);
      }

      win.clearTimeout(timeoutId);
      if (status != bot.ErrorCode.SUCCESS) {
        var err = new bot.Error(status, value.message || value + '');
        err.stack = value.stack;
        value = bot.inject.wrapError(err);
      } else {
        value = bot.inject.wrapResponse(value);
      }
      onDone(opt_stringify ? bot.json.stringify(value) : value);
      responseSent = true;
    }
  }
  var sendError = goog.partial(sendResponse, bot.ErrorCode.UNKNOWN_ERROR);

  if (win.closed) {
    sendError('Unable to execute script; the target window is closed.');
    return;
  }

  fn = bot.inject.recompileFunction_(fn, win);

  args = /** @type {Array.<*>} */ (bot.inject.unwrapValue(args, win.document));
  args.push(goog.partial(sendResponse, bot.ErrorCode.SUCCESS));

  if (win.addEventListener) {
    win.addEventListener('unload', onunload, true);
  } else {
    win.attachEvent('onunload', onunload);
  }

  var startTime = goog.now();
  try {
    fn.apply(win, args);

    // Register our timeout *after* the function has been invoked. This will
    // ensure we don't timeout on a function that invokes its callback after
    // a 0-based timeout.
    timeoutId = win.setTimeout(function () {
      sendResponse(bot.ErrorCode.SCRIPT_TIMEOUT,
        Error('Timed out waiting for asynchronous script result ' +
          'after ' + (goog.now() - startTime) + ' ms'));
    }, Math.max(0, timeout));
  } catch (ex) {
    sendResponse(ex.code || bot.ErrorCode.UNKNOWN_ERROR, ex);
  }

  function onunload() {
    sendResponse(bot.ErrorCode.UNKNOWN_ERROR,
      Error('Detected a page unload event; asynchronous script ' +
        'execution does not work across page loads.'));
  }
};


/**
 * Wraps the response to an injected script that executed successfully so it
 * can be JSON-ified for transmission to the process that injected this
 * script.
 * @param {*} value The script result.
 * @return {{status:bot.ErrorCode,value:*}} The wrapped value.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#responses
 */
bot.inject.wrapResponse = function (value) {
  return {
    'status': bot.ErrorCode.SUCCESS,
    'value': bot.inject.wrapValue(value)
  };
};


/**
 * Wraps a JavaScript error in an object-literal so that it can be JSON-ified
 * for transmission to the process that injected this script.
 * @param {Error} err The error to wrap.
 * @return {{status:bot.ErrorCode,value:*}} The wrapped error object.
 * @see https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#failed-commands
 */
bot.inject.wrapError = function (err) {
  // TODO: Parse stackTrace
  return {
    'status': goog.object.containsKey(err, 'code') ?
      err['code'] : bot.ErrorCode.UNKNOWN_ERROR,
    // TODO: Parse stackTrace
    'value': {
      'message': err.message
    }
  };
};


/**
 * The property key used to store the element cache on the DOCUMENT node
 * when it is injected into the page. Since compiling each browser atom results
 * in a different symbol table, we must use this known key to access the cache.
 * This ensures the same object is used between injections of different atoms.
 * @private {string}
 * @const
 */
bot.inject.cache.CACHE_KEY_ = '$wdc_';


/**
 * The prefix for each key stored in an cache.
 * @type {string}
 * @const
 */
bot.inject.cache.ELEMENT_KEY_PREFIX = ':wdc:';


/**
 * Retrieves the cache object for the given window. Will initialize the cache
 * if it does not yet exist.
 * @param {Document=} opt_doc The document whose cache to retrieve. Defaults to
 *     the current document.
 * @return {Object.<string, (Element|Window)>} The cache object.
 * @private
 */
bot.inject.cache.getCache_ = function (opt_doc) {
  var doc = opt_doc || document;
  var cache = doc[bot.inject.cache.CACHE_KEY_];
  if (!cache) {
    cache = doc[bot.inject.cache.CACHE_KEY_] = {};
    // Store the counter used for generated IDs in the cache so that it gets
    // reset whenever the cache does.
    cache.nextId = goog.now();
  }
  // Sometimes the nextId does not get initialized and returns NaN
  // TODO: Generate UID on the fly instead.
  if (!cache.nextId) {
    cache.nextId = goog.now();
  }
  return cache;
};


/**
 * Adds an element to its ownerDocument's cache.
 * @param {(Element|Window)} el The element or Window object to add.
 * @return {string} The key generated for the cached element.
 */
bot.inject.cache.addElement = function (el) {
  // Check if the element already exists in the cache.
  var cache = bot.inject.cache.getCache_(el.ownerDocument);
  var id = goog.object.findKey(cache, function (value) {
    return value == el;
  });
  if (!id) {
    id = bot.inject.cache.ELEMENT_KEY_PREFIX + cache.nextId++;
    cache[id] = el;
  }
  return id;
};


/**
 * Retrieves an element from the cache. Will verify that the element is
 * still attached to the DOM before returning.
 * @param {string} key The element's key in the cache.
 * @param {Document=} opt_doc The document whose cache to retrieve the element
 *     from. Defaults to the current document.
 * @return {Element|Window} The cached element.
 */
bot.inject.cache.getElement = function (key, opt_doc) {
  key = decodeURIComponent(key);
  var doc = opt_doc || document;
  var cache = bot.inject.cache.getCache_(doc);
  if (!goog.object.containsKey(cache, key)) {
    // Throw STALE_ELEMENT_REFERENCE instead of NO_SUCH_ELEMENT since the
    // key may have been defined by a prior document's cache.
    throw new bot.Error(bot.ErrorCode.STALE_ELEMENT_REFERENCE,
      'Element does not exist in cache');
  }

  var el = cache[key];

  // If this is a Window check if it's closed
  if (goog.object.containsKey(el, 'setInterval')) {
    if (el.closed) {
      delete cache[key];
      throw new bot.Error(bot.ErrorCode.NO_SUCH_WINDOW,
        'Window has been closed.');
    }
    return el;
  }

  // Make sure the element is still attached to the DOM before returning.
  var node = el;
  while (node) {
    if (node == doc.documentElement) {
      return el;
    }
    if (node.host && node.nodeType === 11) {
      node = node.host;
    }
    node = node.parentNode;
  }
  delete cache[key];
  throw new bot.Error(bot.ErrorCode.STALE_ELEMENT_REFERENCE,
    'Element is no longer attached to the DOM');
};
