// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Object which fetches Unicode codepoint names that are locally
 * stored in a bundled database. Currently, only invisible characters are
 * covered by this database. See the goog.i18n.uChar.RemoteNameFetcher class for
 * a remote database option.
 */

goog.provide('goog.i18n.uChar.LocalNameFetcher');

goog.require('goog.i18n.uChar.NameFetcher');
goog.require('goog.i18n.uCharNames');
goog.require('goog.log');



/**
 * Builds the NameFetcherLocal object. This is a simple object which retrieves
 * character names from a local bundled database. This database only covers
 * invisible characters. See the goog.i18n.uChar class for more details.
 *
 * @constructor
 * @implements {goog.i18n.uChar.NameFetcher}
 * @final
 */
goog.i18n.uChar.LocalNameFetcher = function() {};


/**
 * A reference to the LocalNameFetcher logger.
 *
 * @type {goog.log.Logger}
 * @private
 */
goog.i18n.uChar.LocalNameFetcher.logger_ =
    goog.log.getLogger('goog.i18n.uChar.LocalNameFetcher');


/** @override */
goog.i18n.uChar.LocalNameFetcher.prototype.prefetch = function(character) {};


/** @override */
goog.i18n.uChar.LocalNameFetcher.prototype.getName = function(
    character, callback) {
  var localName = goog.i18n.uCharNames.toName(character);
  if (!localName) {
    goog.i18n.uChar.LocalNameFetcher.logger_.warning(
        'No local name defined for character ' + character);
  }
  callback(localName);
};


/** @override */
goog.i18n.uChar.LocalNameFetcher.prototype.isNameAvailable = function(
    character) {
  return !!goog.i18n.uCharNames.toName(character);
};
