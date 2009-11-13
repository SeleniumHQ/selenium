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

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Low level handling of XMLHttpRequest.
 */


goog.provide('goog.net.XmlHttp');


/**
 * Factory class for creating XMLHttpRequest objects.
 * @return {XMLHttpRequest|GearsHttpRequest} A new XMLHttpRequest object.
 */
goog.net.XmlHttp = function() {
  return goog.net.XmlHttp.factory_();
};


/**
 * Gets the options to use with the XMLHttpRequest object from the factory.
 * @return {Object} The options.
 */
goog.net.XmlHttp.getOptions = function() {
  return goog.net.XmlHttp.cachedOptions_ ||
         (goog.net.XmlHttp.cachedOptions_ = goog.net.XmlHttp.optionsFactory_());
};


/**
 * The factory for creating XMLHttpRequest objets.
 * @type {Function?}
 * @private
 */
goog.net.XmlHttp.factory_ = null;


/**
 * The factory for creating the Options for the XMLHttpRequest objets given
 * from the factory.
 * @type {Function?}
 * @private
 */
goog.net.XmlHttp.optionsFactory_ = null;


/**
 * The cached options object used to minimize object allocations.
 * @type {Object?}
 * @private
 */
goog.net.XmlHttp.cachedOptions_ = null;


/**
 * Sets the factories for creating XMLHttpRequest objects and their options.
 * @param {Function} factory The factory for XMLHttpRequest objects.
 * @param {Function} optionsFactory The factory for options.
 */
goog.net.XmlHttp.setFactory = function(factory, optionsFactory) {
  goog.net.XmlHttp.factory_ = factory;
  goog.net.XmlHttp.optionsFactory_ = optionsFactory;

  // Clear the cached options.
  goog.net.XmlHttp.cachedOptions_ = null;
};


/**
 * Default factory class for creating XMLHttpRequest objects.
 * @return {XMLHttpRequest} A new XMLHttpRequest object.
 * @private
 */
goog.net.XmlHttp.defaultFactory_ = function() {
  var progId = goog.net.XmlHttp.getProgId_();
  if (progId) {
    return new ActiveXObject(progId);
  } else {
    return new XMLHttpRequest();
  }
};


/**
 * Default factory class for creating the options.
 * @return {Object} The options.
 * @private
 */
goog.net.XmlHttp.defaultOptionsFactory_ = function() {
  var progId = goog.net.XmlHttp.getProgId_();
  var options = {};
  if (progId) {
    options[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] = true;
    options[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] = true;
  }
  return options;
};


// Set the default factories.
goog.net.XmlHttp.setFactory(
    goog.net.XmlHttp.defaultFactory_, goog.net.XmlHttp.defaultOptionsFactory_);


/**
 * Type of options that an XmlHttp object can have.
 * @enum {number}
 */
goog.net.XmlHttp.OptionType = {
  /**
   * Whether a goog.nullFunction should be used to clear the onreadystatechange
   * handler instead of null.
   */
  USE_NULL_FUNCTION: 0,

  /**
   * NOTE: In IE if send() errors on a *local* request the readystate
   * is still changed to COMPLETE.  We need to ignore it and allow the
   * try/catch around send() to pick up the error.
   */
  LOCAL_REQUEST_ERROR: 1
};


/**
 * Status constants for XMLHTTP, matches:
 * http://msdn.microsoft.com/library/default.asp?url=/library/
 *   en-us/xmlsdk/html/0e6a34e4-f90c-489d-acff-cb44242fafc6.asp
 * @enum {number}
 */
goog.net.XmlHttp.ReadyState = {
  /**
   * Constant for when xmlhttprequest.readyState is uninitialized
   */
  UNINITIALIZED: 0,

  /**
   * Constant for when xmlhttprequest.readyState is loading.
   */
  LOADING: 1,

  /**
   * Constant for when xmlhttprequest.readyState is loaded.
   */
  LOADED: 2,

  /**
   * Constant for when xmlhttprequest.readyState is in an interactive state.
   */
  INTERACTIVE: 3,

  /**
   * Constant for when xmlhttprequest.readyState is completed
   */
  COMPLETE: 4
};


/**
 * The ActiveX PROG ID string to use to create xhr's in IE. Lazily initialized.
 * @type {string?}
 * @private
 */
goog.net.XmlHttp.ieProgId_ = null;


/**
 * Initialize the private state used by other functions.
 * @return {string} The ActiveX PROG ID string to use to create xhr's in IE.
 * @private
 */
goog.net.XmlHttp.getProgId_ = function() {
  // The following blog post describes what PROG IDs to use to create the
  // XMLHTTP object in Internet Explorer:
  // http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
  // However we do not (yet) fully trust that this will be OK for old versions
  // of IE on Win9x so we therefore keep the last 2.
  if (!goog.net.XmlHttp.ieProgId_ && typeof XMLHttpRequest == 'undefined' &&
      typeof ActiveXObject != 'undefined') {
    // Candidate Active X types.
    var ACTIVE_X_IDENTS = ['MSXML2.XMLHTTP.6.0', 'MSXML2.XMLHTTP.3.0',
                           'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
    for (var i = 0; i < ACTIVE_X_IDENTS.length; i++) {
      var candidate = ACTIVE_X_IDENTS[i];
      /** @preserveTry */
      try {
        new ActiveXObject(candidate);
        // NOTE: cannot assign progid and return candidate in one line
        // because JSCompiler complaings: BUG 658126
        goog.net.XmlHttp.ieProgId_ = candidate;
        return candidate;
      } catch (e) {
        // do nothing; try next choice
      }
    }

    // couldn't find any matches
    throw Error('Could not create ActiveXObject. ActiveX might be disabled,' +
                ' or MSXML might not be installed');
  }

  return /** @type {string} */ (goog.net.XmlHttp.ieProgId_);
};
