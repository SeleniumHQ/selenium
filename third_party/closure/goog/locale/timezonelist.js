// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Functions for listing timezone names.
 */

goog.provide('goog.locale.TimeZoneList');

goog.require('goog.locale');


/**
 * Returns the displayable list of short timezone names paired with its id for
 * the current locale, selected based on the region or language provided.
 *
 * This method depends on goog.locale.TimeZone*__<locale> available
 * from http://go/js_locale_data. User of this method
 * has to add dependacy to this.
 *
 * @param {string=} opt_regionOrLang If region tag is provided, timezone ids
 *    specific this region are considered. If language is provided, all regions
 *    for which this language is defacto official is considered. If
 *    this parameter is not speficied, current locale is used to
 *    extract this information.
 *
 * @return {Array.<Object>} Localized and relevant list of timezone names
 *    and ids.
 */
goog.locale.getTimeZoneSelectedShortNames = function(opt_regionOrLang) {
  return goog.locale.getTimeZoneNameList_('TimeZoneSelectedShortNames',
      opt_regionOrLang);
};


/**
 * Returns the displayable list of long timezone names paired with its id for
 * the current locale, selected based on the region or language provided.
 *
 * This method depends on goog.locale.TimeZone*__<locale> available
 * from http://go/js_locale_data. User of this method
 * has to add dependacy to this.
 *
 * @param {string=} opt_regionOrLang If region tag is provided, timezone ids
 *    specific this region are considered. If language is provided, all regions
 *    for which this language is defacto official is considered. If
 *    this parameter is not speficied, current locale is used to
 *    extract this information.
 *
 * @return {Array.<Object>} Localized and relevant list of timezone names
 *    and ids.
 */
goog.locale.getTimeZoneSelectedLongNames = function(opt_regionOrLang) {
  return goog.locale.getTimeZoneNameList_('TimeZoneSelectedLongNames',
      opt_regionOrLang);
};


/**
 * Returns the displayable list of long timezone names paired with its id for
 * the current locale.
 *
 * This method depends on goog.locale.TimeZoneAllLongNames__<locale> available
 * from http://go/js_locale_data. User of this method
 * has to add dependacy to this.
 *
 * @return {Array.<Object>} localized and relevant list of timezone names
 *    and ids.
 */
goog.locale.getTimeZoneAllLongNames = function() {
  var locale = goog.locale.getLocale();
  return /** @type {Array} */ (
      goog.locale.getResource('TimeZoneAllLongNames', locale));
};


/**
 * Returns the displayable list of timezone names paired with its id for
 * the current locale, selected based on the region or language provided.
 *
 * This method depends on goog.locale.TimeZone*__<locale> available
 * from http://go/js_locale_data. User of this method
 * has to add dependacy to this.
 *
 * @param {string} nameType Resource name to be loaded to get the names.
 *
 * @param {string=} opt_resource If resource is region tag, timezone ids
 *    specific this region are considered. If it is language, all regions
 *    for which this language is defacto official is considered. If it is
 *    undefined, current locale is used to extract this information.
 *
 * @return {Array.<Object>} Localized and relevant list of timezone names
 *    and ids.
 * @private
 */
goog.locale.getTimeZoneNameList_ = function(nameType, opt_resource) {
  var locale = goog.locale.getLocale();

  if (!opt_resource) {
    opt_resource = goog.locale.getRegionSubTag(locale);
  }
    // if there is no region subtag, use the language itself as the resource
  if (!opt_resource) {
    opt_resource = locale;
  }

  var names = goog.locale.getResource(nameType, locale);
  var ids = goog.locale.getResource('TimeZoneSelectedIds', opt_resource);
  var len = ids.length;
  var result = [];

  for (var i = 0; i < len; i++) {
    var id = ids[i];
    result.push({'id': id, 'name': names[id]});
  }
  return result;
};

