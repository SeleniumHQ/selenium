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
 * @fileoverview A utility to load JavaScript files via DOM script tags.
 * Refactored from goog.net.Jsonp. Works cross-domain.
 *
 */

goog.provide('goog.net.jsloader');
goog.provide('goog.net.jsloader.Error');
goog.provide('goog.net.jsloader.ErrorCode');
goog.provide('goog.net.jsloader.Options');

goog.require('goog.array');
goog.require('goog.async.Deferred');
goog.require('goog.debug.Error');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.object');


/**
 * The name of the property of goog.global under which the JavaScript
 * verification object is stored by the loaded script.
 * @private {string}
 */
goog.net.jsloader.GLOBAL_VERIFY_OBJS_ = 'closure_verification';


/**
 * The default length of time, in milliseconds, we are prepared to wait for a
 * load request to complete.
 * @type {number}
 */
goog.net.jsloader.DEFAULT_TIMEOUT = 5000;


/**
 * Optional parameters for goog.net.jsloader.send.
 * timeout: The length of time, in milliseconds, we are prepared to wait
 *     for a load request to complete, or 0 or negative for no timeout. Default
 *     is 5 seconds.
 * document: The HTML document under which to load the JavaScript. Default is
 *     the current document.
 * cleanupWhenDone: If true clean up the script tag after script completes to
 *     load. This is important if you just want to read data from the JavaScript
 *     and then throw it away. Default is false.
 * attributes: Additional attributes to set on the script tag.
 *
 * @typedef {{
 *   timeout: (number|undefined),
 *   document: (HTMLDocument|undefined),
 *   cleanupWhenDone: (boolean|undefined),
 *   attributes: (!Object<string, string>|undefined)
 * }}
 */
goog.net.jsloader.Options;


/**
 * Scripts (URIs) waiting to be loaded.
 * @private {!Array<string>}
 */
goog.net.jsloader.scriptsToLoad_ = [];


/**
 * The deferred result of loading the URIs in scriptsToLoad_.
 * We need to return this to a caller that wants to load URIs while
 * a deferred is already working on them.
 * @private {!goog.async.Deferred<null>}
 */
goog.net.jsloader.scriptLoadingDeferred_;


/**
 * Loads and evaluates the JavaScript files at the specified URIs, guaranteeing
 * the order of script loads.
 *
 * Because we have to load the scripts in serial (load script 1, exec script 1,
 * load script 2, exec script 2, and so on), this will be slower than doing
 * the network fetches in parallel.
 *
 * If you need to load a large number of scripts but dependency order doesn't
 * matter, you should just call goog.net.jsloader.load N times.
 *
 * If you need to load a large number of scripts on the same domain,
 * you may want to use goog.module.ModuleLoader.
 *
 * @param {Array<string>} uris The URIs to load.
 * @param {goog.net.jsloader.Options=} opt_options Optional parameters. See
 *     goog.net.jsloader.options documentation for details.
 * @return {!goog.async.Deferred} The deferred result, that may be used to add
 *     callbacks
 */
goog.net.jsloader.loadMany = function(uris, opt_options) {
  // Loading the scripts in serial introduces asynchronosity into the flow.
  // Therefore, there are race conditions where client A can kick off the load
  // sequence for client B, even though client A's scripts haven't all been
  // loaded yet.
  //
  // To work around this issue, all module loads share a queue.
  if (!uris.length) {
    return goog.async.Deferred.succeed(null);
  }

  var isAnotherModuleLoading = goog.net.jsloader.scriptsToLoad_.length;
  goog.array.extend(goog.net.jsloader.scriptsToLoad_, uris);
  if (isAnotherModuleLoading) {
    // jsloader is still loading some other scripts.
    // In order to prevent the race condition noted above, we just add
    // these URIs to the end of the scripts' queue and return the deferred
    // result of the ongoing script load, so the caller knows when they
    // finish loading.
    return goog.net.jsloader.scriptLoadingDeferred_;
  }

  uris = goog.net.jsloader.scriptsToLoad_;
  var popAndLoadNextScript = function() {
    var uri = uris.shift();
    var deferred = goog.net.jsloader.load(uri, opt_options);
    if (uris.length) {
      deferred.addBoth(popAndLoadNextScript);
    }
    return deferred;
  };
  goog.net.jsloader.scriptLoadingDeferred_ = popAndLoadNextScript();
  return goog.net.jsloader.scriptLoadingDeferred_;
};


/**
 * Loads and evaluates a JavaScript file.
 * When the script loads, a user callback is called.
 * It is the client's responsibility to verify that the script ran successfully.
 *
 * @param {string} uri The URI of the JavaScript.
 * @param {goog.net.jsloader.Options=} opt_options Optional parameters. See
 *     goog.net.jsloader.Options documentation for details.
 * @return {!goog.async.Deferred} The deferred result, that may be used to add
 *     callbacks and/or cancel the transmission.
 *     The error callback will be called with a single goog.net.jsloader.Error
 *     parameter.
 */
goog.net.jsloader.load = function(uri, opt_options) {
  var options = opt_options || {};
  var doc = options.document || document;

  var script = goog.dom.createElement(goog.dom.TagName.SCRIPT);
  var request = {script_: script, timeout_: undefined};
  var deferred = new goog.async.Deferred(goog.net.jsloader.cancel_, request);

  // Set a timeout.
  var timeout = null;
  var timeoutDuration = goog.isDefAndNotNull(options.timeout) ?
      options.timeout :
      goog.net.jsloader.DEFAULT_TIMEOUT;
  if (timeoutDuration > 0) {
    timeout = window.setTimeout(function() {
      goog.net.jsloader.cleanup_(script, true);
      deferred.errback(
          new goog.net.jsloader.Error(
              goog.net.jsloader.ErrorCode.TIMEOUT,
              'Timeout reached for loading script ' + uri));
    }, timeoutDuration);
    request.timeout_ = timeout;
  }

  // Hang the user callback to be called when the script completes to load.
  // NOTE(user): This callback will be called in IE even upon error. In any
  // case it is the client's responsibility to verify that the script ran
  // successfully.
  script.onload = script.onreadystatechange = function() {
    if (!script.readyState || script.readyState == 'loaded' ||
        script.readyState == 'complete') {
      var removeScriptNode = options.cleanupWhenDone || false;
      goog.net.jsloader.cleanup_(script, removeScriptNode, timeout);
      deferred.callback(null);
    }
  };

  // Add an error callback.
  // NOTE(user): Not supported in IE.
  script.onerror = function() {
    goog.net.jsloader.cleanup_(script, true, timeout);
    deferred.errback(
        new goog.net.jsloader.Error(
            goog.net.jsloader.ErrorCode.LOAD_ERROR,
            'Error while loading script ' + uri));
  };

  var properties = options.attributes || {};
  goog.object.extend(properties, {
    'type': 'text/javascript',
    'charset': 'UTF-8',
    // NOTE(user): Safari never loads the script if we don't set
    // the src attribute before appending.
    'src': uri
  });
  goog.dom.setProperties(script, properties);
  var scriptParent = goog.net.jsloader.getScriptParentElement_(doc);
  scriptParent.appendChild(script);

  return deferred;
};


/**
 * Loads a JavaScript file and verifies it was evaluated successfully, using a
 * verification object.
 * The verification object is set by the loaded JavaScript at the end of the
 * script.
 * We verify this object was set and return its value in the success callback.
 * If the object is not defined we trigger an error callback.
 *
 * @param {string} uri The URI of the JavaScript.
 * @param {string} verificationObjName The name of the verification object that
 *     the loaded script should set.
 * @param {goog.net.jsloader.Options} options Optional parameters. See
 *     goog.net.jsloader.Options documentation for details.
 * @return {!goog.async.Deferred} The deferred result, that may be used to add
 *     callbacks and/or cancel the transmission.
 *     The success callback will be called with a single parameter containing
 *     the value of the verification object.
 *     The error callback will be called with a single goog.net.jsloader.Error
 *     parameter.
 */
goog.net.jsloader.loadAndVerify = function(uri, verificationObjName, options) {
  // Define the global objects variable.
  if (!goog.global[goog.net.jsloader.GLOBAL_VERIFY_OBJS_]) {
    goog.global[goog.net.jsloader.GLOBAL_VERIFY_OBJS_] = {};
  }
  var verifyObjs = goog.global[goog.net.jsloader.GLOBAL_VERIFY_OBJS_];

  // Verify that the expected object does not exist yet.
  if (goog.isDef(verifyObjs[verificationObjName])) {
    // TODO(user): Error or reset variable?
    return goog.async.Deferred.fail(
        new goog.net.jsloader.Error(
            goog.net.jsloader.ErrorCode.VERIFY_OBJECT_ALREADY_EXISTS,
            'Verification object ' + verificationObjName +
                ' already defined.'));
  }

  // Send request to load the JavaScript.
  var sendDeferred = goog.net.jsloader.load(uri, options);

  // Create a deferred object wrapping the send result.
  var deferred =
      new goog.async.Deferred(goog.bind(sendDeferred.cancel, sendDeferred));

  // Call user back with object that was set by the script.
  sendDeferred.addCallback(function() {
    var result = verifyObjs[verificationObjName];
    if (goog.isDef(result)) {
      deferred.callback(result);
      delete verifyObjs[verificationObjName];
    } else {
      // Error: script was not loaded properly.
      deferred.errback(
          new goog.net.jsloader.Error(
              goog.net.jsloader.ErrorCode.VERIFY_ERROR, 'Script ' + uri +
                  ' loaded, but verification object ' + verificationObjName +
                  ' was not defined.'));
    }
  });

  // Pass error to new deferred object.
  sendDeferred.addErrback(function(error) {
    if (goog.isDef(verifyObjs[verificationObjName])) {
      delete verifyObjs[verificationObjName];
    }
    deferred.errback(error);
  });

  return deferred;
};


/**
 * Gets the DOM element under which we should add new script elements.
 * How? Take the first head element, and if not found take doc.documentElement,
 * which always exists.
 *
 * @param {!HTMLDocument} doc The relevant document.
 * @return {!Element} The script parent element.
 * @private
 */
goog.net.jsloader.getScriptParentElement_ = function(doc) {
  var headElements = doc.getElementsByTagName(goog.dom.TagName.HEAD);
  if (!headElements || goog.array.isEmpty(headElements)) {
    return doc.documentElement;
  } else {
    return headElements[0];
  }
};


/**
 * Cancels a given request.
 * @this {{script_: Element, timeout_: number}} The request context.
 * @private
 */
goog.net.jsloader.cancel_ = function() {
  var request = this;
  if (request && request.script_) {
    var scriptNode = request.script_;
    if (scriptNode && scriptNode.tagName == goog.dom.TagName.SCRIPT) {
      goog.net.jsloader.cleanup_(scriptNode, true, request.timeout_);
    }
  }
};


/**
 * Removes the script node and the timeout.
 *
 * @param {Node} scriptNode The node to be cleaned up.
 * @param {boolean} removeScriptNode If true completely remove the script node.
 * @param {?number=} opt_timeout The timeout handler to cleanup.
 * @private
 */
goog.net.jsloader.cleanup_ = function(
    scriptNode, removeScriptNode, opt_timeout) {
  if (goog.isDefAndNotNull(opt_timeout)) {
    goog.global.clearTimeout(opt_timeout);
  }

  scriptNode.onload = goog.nullFunction;
  scriptNode.onerror = goog.nullFunction;
  scriptNode.onreadystatechange = goog.nullFunction;

  // Do this after a delay (removing the script node of a running script can
  // confuse older IEs).
  if (removeScriptNode) {
    window.setTimeout(function() { goog.dom.removeNode(scriptNode); }, 0);
  }
};


/**
 * Possible error codes for jsloader.
 * @enum {number}
 */
goog.net.jsloader.ErrorCode = {
  LOAD_ERROR: 0,
  TIMEOUT: 1,
  VERIFY_ERROR: 2,
  VERIFY_OBJECT_ALREADY_EXISTS: 3
};



/**
 * A jsloader error.
 *
 * @param {goog.net.jsloader.ErrorCode} code The error code.
 * @param {string=} opt_message Additional message.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.net.jsloader.Error = function(code, opt_message) {
  var msg = 'Jsloader error (code #' + code + ')';
  if (opt_message) {
    msg += ': ' + opt_message;
  }
  goog.net.jsloader.Error.base(this, 'constructor', msg);

  /**
   * The code for this error.
   *
   * @type {goog.net.jsloader.ErrorCode}
   */
  this.code = code;
};
goog.inherits(goog.net.jsloader.Error, goog.debug.Error);
