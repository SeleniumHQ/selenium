/*
 Copyright 2011 WebDriver committers
 Copyright 2011 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

goog.provide('fxdriver.moz');

goog.require('bot.userAgent');
goog.require('fxdriver.logging');
goog.require('goog.array');


/** @const */ var CC = Components.classes;
/** @const */ var CI = Components.interfaces;
/** @const */ var CR = Components.results;
/** @const */ var CU = Components.utils;


/**
 * Import an existing jsm. We need this function because otherwise the closure
 * compiler will choke on the 'import' method. *sigh*
 *
 * @param {string} module The full path to the module to import.
 */
fxdriver.moz.load = function(module) {
  Components.utils['import']('resource://gre/modules/XPCOMUtils.jsm');
};


/**
 * Obtain a new instance of an XPCOM service.
 *
 * @param {string} className The class name to look up.
 * @param {string} serviceName The service name to obtain.
 * @return {!object} The service.
 */
fxdriver.moz.getService = function(className, serviceName) {
  var clazz = CC[className];
  if (clazz == undefined) {
    // TODO(simon): Replace this with a proper error
    throw new Error('Cannot create component ' + className);
  }

  return clazz.getService(CI[serviceName]);
};


/**
 * Create a default implementation of QueryInterface for an XPCOM class.
 *
 * @param {!object} self The instance which the method is being added to.
 * @param {Array.<object>} iids The IIDs to use.
 * @return {function(!object):!object} A QueryInterface implementation.
 */
fxdriver.moz.queryInterface = function(self, iids) {
  return function(iid) {
    if (!iid) {
      return CR.NS_ERROR_NO_INTERFACE;
    }

    if (iid.equals(CI.nsISupports)) {
      return self;
    }

    var match = goog.array.reduce(iids, function(result, curr) {
      if (!curr) {
        return result;
      }

      return result || curr.equals(iid);
    }, false);

    if (match) {
      return self;
    }
    throw CR.NS_ERROR_NO_INTERFACE;
  };
};

// This method closely follows unwrapNode() from mozmill-tests
/**
 * Unwraps a something which is wrapped into a XPCNativeWrapper or XrayWrapper.
 *
 * @param {!Object} thing The "something" to unwrap.
 * @return {!Object} The object, unwrapped if possible.
 */
fxdriver.moz.unwrap = function(thing) {
  // TODO(simon): This is identical to the same function in firefox-chrome
  if (!goog.isDefAndNotNull(thing)) {
    return thing;
  }

  // If we've already unwrapped the object, don't unwrap it again.
  // TODO(simon): see whether XPCWrapper->IsSecurityWrapper is available in JS
  if (thing.__fxdriver_unwrapped) {
    return thing;
  }

  if (thing['wrappedJSObject']) {
    thing.wrappedJSObject.__fxdriver_unwrapped = true;
    return thing.wrappedJSObject;
  }

  // unwrap is not available on older branches (3.5 and 3.6) - Bug 533596
  try {
    var isWrapper = thing == XPCNativeWrapper(thing);
    if (isWrapper) {
      var unwrapped = XPCNativeWrapper.unwrap(thing);
      var toReturn = !!unwrapped ? unwrapped : thing;
      toReturn.__fxdriver_unwrapped = true;
      return toReturn;
    }
  } catch (e) {
    // Unwrapping will fail for JS literals - numbers, for example. Catch
    // the exception and proceed, it will eventually be returned as-is.
  }

  return thing;
};

/**
 * For Firefox 4, some objects (like the Window) are wrapped to make them safe
 * to access from privileged code but this hides fields we need, like the
 * frames array. Remove this wrapping.
 * See: https://developer.mozilla.org/en/XPCNativeWrapper
 */
fxdriver.moz.unwrapXpcOnly = function(thing) {
  if (XPCNativeWrapper && 'unwrap' in XPCNativeWrapper) {
    try {
      return XPCNativeWrapper.unwrap(thing);
    } catch (e) {
      //Unwrapping will fail for JS literals - numbers, for example. Catch
      // the exception and proceed, it will eventually be returend as-is.
      fxdriver.logging.warning('Unwrap From XPC only failed: ' + e);
    }

  }

  return thing;
};


fxdriver.moz.unwrapFor4 = function(doc) {
  if (bot.userAgent.isProductVersion(4)) {
    return fxdriver.moz.unwrap(doc);
  }
  return doc;
};
