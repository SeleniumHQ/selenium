// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview This file contains functions for using Gears.
 */

// TODO(user): The Gears team is planning to inject the Gears factory as
// google.gears.factory in the main thread as well. Currently it is only
// injected in the worker threads.


goog.provide('goog.gears');

goog.require('goog.string');


/**
 * Returns a new Gears factory object.
 * @return {Object} the Gears factory object if available or null otherwise.
 */
goog.gears.getFactory = function() {
  if (goog.gears.factory_ != undefined) {
    return goog.gears.factory_;
  }

  // In the worker threads Gears injects google.gears.factory. They also plan
  // to do this in the main thread.
  var factory = goog.getObjectByName('google.gears.factory');
  if (factory) {
    return goog.gears.factory_ = factory;
  }

  // Mozilla
  /** @preserveTry */
  try {
    var gearsFactory = /** @type {Function} */
        (goog.getObjectByName('GearsFactory'));
    return goog.gears.factory_ = new gearsFactory;
  } catch (ex) {
    // fall through
  }

  // MSIE
  /** @preserveTry */
  try {
    factory = new ActiveXObject('Gears.Factory');
    var buildInfo = factory.getBuildInfo();
    if (buildInfo.indexOf('ie_mobile') != -1) {
      factory.privateSetGlobalObject(goog.global);
    }
    return goog.gears.factory_ = factory;
  } catch (ex) {
    // fall through
  }

  return goog.gears.factory_ = goog.gears.tryGearsObject_();
};


/**
 * Attempt to create a factory by adding an object element to the DOM.
 * This covers the case for safari.
 * @return {Function} The factory, or null.
 * @private
 */
goog.gears.tryGearsObject_ = function() {
  // HACK(user): Use square bracket notation so this can compile in an
  // environment without a DOM.
  var win = goog.getObjectByName('window');
  // Safari
  if (win && win['navigator']['mimeTypes']['application/x-googlegears']) {
    /** @preserveTry */
    try {
      var doc = win['document'];
      var factory = doc['getElementById']('gears-factory');

      // If missing, create a place for it
      if (!factory) {
        factory = doc['createElement']('object');
        factory['style']['display'] = 'none';
        factory['width'] = '0';
        factory['height'] = '0';
        factory['type'] = 'application/x-googlegears';
        factory['id'] = 'gears-factory';
        doc['documentElement']['appendChild'](factory);
      }

      // Even if Gears failed to get created we get an object element. Make
      // sure that it has a create method before assuming it is a Gears factory.
      if (typeof factory.create != 'undefined') {
        return factory;
      }
    } catch (ex) {
      // fall through
    }
  }
  return null;
};


/**
 * Cached result of getFactory
 * @type {Object|undefined}
 * @private
 */
goog.gears.factory_ = undefined;


/**
 * Whether we can create a Gears factory object. This does not cache the
 * result.
 * @return {boolean} true if we can create a Gears factory object.
 */
goog.gears.hasFactory = function() {
  if (goog.gears.hasFactory_ != undefined) return goog.gears.hasFactory_;

  // Use [] notation so we don't have to put this in externs
  var factory = goog.getObjectByName('google.gears.factory');
  if (factory || goog.getObjectByName('GearsFactory')) {
    return goog.gears.hasFactory_ = true;
  }

  // Try ActiveXObject for IE
  if (typeof ActiveXObject != 'undefined') {
    /** @preserveTry */
    try {
      new ActiveXObject('Gears.Factory');
      return goog.gears.hasFactory_ = true;
    } catch (ex) {
      return goog.gears.hasFactory_ = false;
    }
  }

  // NOTE(user): For safari we have to actually create an object element
  // in the DOM. We have to do it in hasFactory so we can reliably know whether
  // there actually is a factory, else we can get into a situation, e.g. in
  // FF 3.5.3 where the Gears add-on is disabled because it's incompatible
  // with FF but application/x-googlegears is still in the mimeTypes object.
  //
  // HACK(user): Use object by name so this can compile in an environment without
  // a DOM.
  var mimeTypes = goog.getObjectByName('navigator.mimeTypes');
  if (mimeTypes && mimeTypes['application/x-googlegears']) {
    factory = goog.gears.tryGearsObject_();

    if (factory) {
      // Might as well cache it while we have it.
      goog.gears.factory_ = factory;
      return goog.gears.hasFactory_ = true;
    }
  }

  return goog.gears.hasFactory_ = false;
};


/**
 * Cached result of hasFactory.
 * @type {boolean|undefined}
 * @private
 */
goog.gears.hasFactory_ = undefined;


/**
 * Maximum file name length.
 * @type {number}
 * @private
 */
goog.gears.MAX_FILE_NAME_LENGTH_ = 64;


/**
 * Allow 10 characters for hash (#goog.string.hashCode).
 * @type {number}
 * @private
 */
goog.gears.MAX_FILE_NAME_PREFIX_LENGTH_ = goog.gears.MAX_FILE_NAME_LENGTH_ - 10;


/**
  * Gears only allows file names up to 64 characters, so this function shortens
  * file names to fit in this limit. #goog.string.hashCode is used to compress
  * the name. This also removes invalid characters.
  * @param {string} originalFileName Original (potentially unsafe) file name.
  * @return {string} Safe file name. If originalFileName null or empty,
  *     return originalFileName.
  * @throws {Error} If originalFileName is null, empty or contains only
  *     invalid characters.
  */
goog.gears.makeSafeFileName = function(originalFileName) {
  if (!originalFileName) {
    throw Error('file name empty');
  }

  // Safety measure since Gears behaves very badly if it gets an unexpected
  // data type.
  originalFileName = String(originalFileName);

  // TODO(user): This should be removed when the Gears code
  // gets fixed to allow for any id to be passed in. Right now
  // it fails to create a user specific database if the characters
  // sent in are non alphanumeric.
  var sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9\.\-@_]/g, '');
  if (!sanitizedFileName) {
    throw Error('file name invalid: ' + originalFileName);
  }
  if (sanitizedFileName.length <= goog.gears.MAX_FILE_NAME_LENGTH_) {
    return sanitizedFileName;
  }

  // Keep as many characters in original as we can, then hash the rest.
  var prefix = sanitizedFileName.substring(
      0, goog.gears.MAX_FILE_NAME_PREFIX_LENGTH_);
  return prefix + String(goog.string.hashCode(originalFileName));
};
