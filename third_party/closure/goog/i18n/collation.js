// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Contains helper functions for performing locale-sensitive
 *     collation.
 */


goog.provide('goog.i18n.collation');


/**
 * Returns the comparator for a locale. If a locale is not explicitly specified,
 * a comparator for the user's locale will be returned. Note that if the browser
 * does not support locale-sensitive string comparisons, the comparator returned
 * will be a simple codepoint comparator.
 *
 * @param {string=} opt_locale the locale that the comparator is used for.
 * @return {function(string, string): number} The locale-specific comparator.
 */
goog.i18n.collation.createComparator = function(opt_locale) {
  // See http://code.google.com/p/v8-i18n.
  if (goog.i18n.collation.hasNativeComparator()) {
    var intl = goog.global.Intl;
    return new intl.Collator([opt_locale || goog.LOCALE]).compare;
  } else {
    return function(arg1, arg2) {
      return arg1.localeCompare(arg2);
    };
  }
};


/**
 * Returns true if a locale-sensitive comparator is available for a locale. If
 * a locale is not explicitly specified, the user's locale is used instead.
 *
 * @param {string=} opt_locale The locale to be checked.
 * @return {boolean} Whether there is a locale-sensitive comparator available
 *     for the locale.
 */
goog.i18n.collation.hasNativeComparator = function(opt_locale) {
  var intl = goog.global.Intl;
  return !!(intl && intl.Collator);
};
