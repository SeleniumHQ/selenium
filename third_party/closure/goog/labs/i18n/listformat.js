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
 * @fileoverview List format and gender decision library with locale support.
 *
 * ListFormat takes an array or a var_arg of objects and generates a user
 * friendly list in a locale-sensitive way (i.e. "red, green, and blue").
 *
 * GenderInfo can be used to determine the gender of a list of items,
 * depending on the gender of all items in the list.
 *
 * In English, lists of items don't really have gender, and in fact few things
 * have gender. But the idea is this:
 *  - for a list of "male items" (think "John, Steve") you use "they"
 *  - for "Marry, Ann" (all female) you might have a "feminine" form of "they"
 *  - and yet another form for mixed lists ("John, Marry") or undetermined
 *    (when you don't know the gender of the items, or when they are neuter)
 *
 * For example in Greek "they" will be translated as "αυτοί" for masculin,
 * "αυτές" for feminin, and "αυτά" for neutral/undetermined.
 * (it is in fact more complicated than that, as weak/strong forms and case
 * also matter, see http://en.wiktionary.org/wiki/Appendix:Greek_pronouns)
 *
 */

goog.provide('goog.labs.i18n.GenderInfo');
goog.provide('goog.labs.i18n.GenderInfo.Gender');
goog.provide('goog.labs.i18n.ListFormat');

goog.require('goog.asserts');
goog.require('goog.labs.i18n.ListFormatSymbols');



/**
 * ListFormat provides a method to format a list/array of objects to a string,
 * in a user friendly way and in a locale sensitive manner.
 * If the objects are not strings, toString is called to convert them.
 * The constructor initializes the object based on the locale data from
 * the current goog.labs.i18n.ListFormatSymbols.
 *
 * Similar to the ICU4J class com.ibm.icu.text.ListFormatter:
 *   http://icu-project.org/apiref/icu4j/com/ibm/icu/text/ListFormatter.html
 * @constructor
 * @final
 */
goog.labs.i18n.ListFormat = function() {
  /**
   * String for lists of exactly two items, containing {0} for the first,
   * and {1} for the second.
   * For instance '{0} and {1}' will give 'black and white'.
   * @private {string}
   *
   * Example: for "black and white" the pattern is "{0} and {1}"
   * While for a longer list we have "cyan, magenta, yellow, and black"
   * Think "{0} start {1} middle {2} middle {3} end {4}"
   * The last pattern is "{0}, and {1}." Note the comma before "and".
   * So the "Two" pattern can be different than Start/Middle/End ones.
   */
  this.listTwoPattern_ = goog.labs.i18n.ListFormatSymbols.LIST_TWO;

  /**
   * String for the start of a list items, containing {0} for the first,
   * and {1} for the rest.
   * @private {string}
   */
  this.listStartPattern_ = goog.labs.i18n.ListFormatSymbols.LIST_START;

  /**
   * String for the start of a list items, containing {0} for the first part
   * of the list, and {1} for the rest of the list.
   * @private {string}
   */
  this.listMiddlePattern_ = goog.labs.i18n.ListFormatSymbols.LIST_MIDDLE;

  /**
   * String for the end of a list items, containing {0} for the first part
   * of the list, and {1} for the last item.
   *
   * This is how start/middle/end come together:
   *   start = '{0}, {1}'  middle = '{0}, {1}',  end = '{0}, and {1}'
   * will result in the typical English list: 'one, two, three, and four'
   * There are languages where the patterns are more complex than
   * '{1} someText {1}' and the start pattern is different than the middle one.
   *
   * @private {string}
   */
  this.listEndPattern_ = goog.labs.i18n.ListFormatSymbols.LIST_END;
};


/**
 * Replaces the {0} and {1} placeholders in a pattern with the first and
 * the second parameter respectively, and returns the result.
 * It is a helper function for goog.labs.i18n.ListFormat.format.
 *
 * @param {string} pattern used for formatting.
 * @param {string} first object to add to list.
 * @param {string} second object to add to list.
 * @return {string} The formatted list string.
 * @private
 */
goog.labs.i18n.ListFormat.prototype.patternBasedJoinTwoStrings_ =
    function(pattern, first, second) {
  return pattern.replace('{0}', first).replace('{1}', second);
};


/**
 * Formats an array of strings into a string.
 * It is a user facing, locale-aware list (i.e. 'red, green, and blue').
 *
 * @param {!Array<string|number>} items Items to format.
 * @return {string} The items formatted into a string, as a list.
 */
goog.labs.i18n.ListFormat.prototype.format = function(items) {
  var count = items.length;
  switch (count) {
    case 0:
      return '';
    case 1:
      return String(items[0]);
    case 2:
      return this.patternBasedJoinTwoStrings_(this.listTwoPattern_,
          String(items[0]), String(items[1]));
  }

  var result = this.patternBasedJoinTwoStrings_(this.listStartPattern_,
      String(items[0]), String(items[1]));

  for (var i = 2; i < count - 1; ++i) {
    result = this.patternBasedJoinTwoStrings_(this.listMiddlePattern_,
        result, String(items[i]));
  }

  return this.patternBasedJoinTwoStrings_(this.listEndPattern_,
      result, String(items[count - 1]));
};



/**
 * GenderInfo provides a method to determine the gender of a list/array
 * of objects when one knows the gender of each item of the list.
 * It does this in a locale sensitive manner.
 * The constructor initializes the object based on the locale data from
 * the current goog.labs.i18n.ListFormatSymbols.
 *
 * Similar to the ICU4J class com.icu.util.GenderInfo:
 *   http://icu-project.org/apiref/icu4j/com/ibm/icu/util/GenderInfo.html
 * @constructor
 * @final
 */
goog.labs.i18n.GenderInfo = function() {
  /**
   * Stores the language-aware mode of determining the gender of a list.
   * @private {goog.labs.i18n.GenderInfo.ListGenderStyle_}
   */
  this.listGenderStyle_ = goog.labs.i18n.ListFormatSymbols.GENDER_STYLE;
};


/**
 * Enumeration for the possible ways to generate list genders.
 * Indicates the category for the locale.
 * This only affects gender for lists more than one. For lists of 1 item,
 * the gender of the list always equals the gender of that sole item.
 * This is for internal use, matching ICU.
 * @enum {number}
 * @private
 */
goog.labs.i18n.GenderInfo.ListGenderStyle_ = {
  NEUTRAL: 0,
  MIXED_NEUTRAL: 1,
  MALE_TAINTS: 2
};


/**
 * Enumeration for the possible gender values.
 * Gender: OTHER means either the information is unavailable,
 * or the person has declined to state MALE or FEMALE.
 * @enum {number}
 */
goog.labs.i18n.GenderInfo.Gender = {
  MALE: 0,
  FEMALE: 1,
  OTHER: 2
};


/**
 * Determines the overal gender of a list based on the gender of all the list
 * items, in a locale-aware way.
 * @param {!Array<!goog.labs.i18n.GenderInfo.Gender>} genders An array of
 *        genders, will give the gender of the list.
 * @return {goog.labs.i18n.GenderInfo.Gender} Get the gender of the list.
*/
goog.labs.i18n.GenderInfo.prototype.getListGender = function(genders) {
  var Gender = goog.labs.i18n.GenderInfo.Gender;

  var count = genders.length;
  if (count == 0) {
    return Gender.OTHER; // degenerate case
  }
  if (count == 1) {
    return genders[0]; // degenerate case
  }

  switch (this.listGenderStyle_) {
    case goog.labs.i18n.GenderInfo.ListGenderStyle_.NEUTRAL:
      return Gender.OTHER;
    case goog.labs.i18n.GenderInfo.ListGenderStyle_.MIXED_NEUTRAL:
      var hasFemale = false;
      var hasMale = false;
      for (var i = 0; i < count; ++i) {
        switch (genders[i]) {
          case Gender.FEMALE:
            if (hasMale) {
              return Gender.OTHER;
            }
            hasFemale = true;
            break;
          case Gender.MALE:
            if (hasFemale) {
              return Gender.OTHER;
            }
            hasMale = true;
            break;
          case Gender.OTHER:
            return Gender.OTHER;
          default: // Should never happen, but just in case
            goog.asserts.assert(false,
                'Invalid genders[' + i + '] = ' + genders[i]);
            return Gender.OTHER;
        }
      }
      return hasMale ? Gender.MALE : Gender.FEMALE;
    case goog.labs.i18n.GenderInfo.ListGenderStyle_.MALE_TAINTS:
      for (var i = 0; i < count; ++i) {
        if (genders[i] != Gender.FEMALE) {
          return Gender.MALE;
        }
      }
      return Gender.FEMALE;
    default:
      return Gender.OTHER;
  }
};
