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
 * @fileoverview Basic class for matching words in an array.
 *
 */


goog.provide('goog.ui.ac.ArrayMatcher');

goog.require('goog.string');



/**
 * Basic class for matching words in an array
 * @constructor
 * @param {Array<?>} rows Dictionary of items to match.  Can be objects if they
 *     have a toString method that returns the value to match against.
 * @param {boolean=} opt_noSimilar if true, do not do similarity matches for the
 *     input token against the dictionary.
 */
goog.ui.ac.ArrayMatcher = function(rows, opt_noSimilar) {
  this.rows_ = rows || [];
  this.useSimilar_ = !opt_noSimilar;
};


/**
 * Replaces the rows that this object searches over.
 * @param {Array<?>} rows Dictionary of items to match.
 */
goog.ui.ac.ArrayMatcher.prototype.setRows = function(rows) {
  this.rows_ = rows || [];
};


/**
 * Function used to pass matches to the autocomplete
 * @param {string} token Token to match.
 * @param {number} maxMatches Max number of matches to return.
 * @param {Function} matchHandler callback to execute after matching.
 * @param {string=} opt_fullString The full string from the input box.
 */
goog.ui.ac.ArrayMatcher.prototype.requestMatchingRows =
    function(token, maxMatches, matchHandler, opt_fullString) {

  var matches = this.useSimilar_ ?
      goog.ui.ac.ArrayMatcher.getMatchesForRows(token, maxMatches, this.rows_) :
      this.getPrefixMatches(token, maxMatches);

  matchHandler(token, matches);
};


/**
 * Matches the token against the specified rows, first looking for prefix
 * matches and if that fails, then looking for similar matches.
 *
 * @param {string} token Token to match.
 * @param {number} maxMatches Max number of matches to return.
 * @param {!Array<?>} rows Rows to search for matches. Can be objects if they
 *     have a toString method that returns the value to match against.
 * @return {!Array<?>} Rows that match.
 */
goog.ui.ac.ArrayMatcher.getMatchesForRows =
    function(token, maxMatches, rows) {
  var matches =
      goog.ui.ac.ArrayMatcher.getPrefixMatchesForRows(token, maxMatches, rows);

  if (matches.length == 0) {
    matches = goog.ui.ac.ArrayMatcher.getSimilarMatchesForRows(token,
        maxMatches, rows);
  }
  return matches;
};


/**
 * Matches the token against the start of words in the row.
 * @param {string} token Token to match.
 * @param {number} maxMatches Max number of matches to return.
 * @return {!Array<?>} Rows that match.
 */
goog.ui.ac.ArrayMatcher.prototype.getPrefixMatches =
    function(token, maxMatches) {
  return goog.ui.ac.ArrayMatcher.getPrefixMatchesForRows(token, maxMatches,
      this.rows_);
};


/**
 * Matches the token against the start of words in the row.
 * @param {string} token Token to match.
 * @param {number} maxMatches Max number of matches to return.
 * @param {!Array<?>} rows Rows to search for matches. Can be objects if they have
 *     a toString method that returns the value to match against.
 * @return {!Array<?>} Rows that match.
 */
goog.ui.ac.ArrayMatcher.getPrefixMatchesForRows =
    function(token, maxMatches, rows) {
  var matches = [];

  if (token != '') {
    var escapedToken = goog.string.regExpEscape(token);
    var matcher = new RegExp('(^|\\W+)' + escapedToken, 'i');

    for (var i = 0; i < rows.length && matches.length < maxMatches; i++) {
      var row = rows[i];
      if (String(row).match(matcher)) {
        matches.push(row);
      }
    }
  }
  return matches;
};


/**
 * Matches the token against similar rows, by calculating "distance" between the
 * terms.
 * @param {string} token Token to match.
 * @param {number} maxMatches Max number of matches to return.
 * @return {!Array<?>} The best maxMatches rows.
 */
goog.ui.ac.ArrayMatcher.prototype.getSimilarRows = function(token, maxMatches) {
  return goog.ui.ac.ArrayMatcher.getSimilarMatchesForRows(token, maxMatches,
      this.rows_);
};


/**
 * Matches the token against similar rows, by calculating "distance" between the
 * terms.
 * @param {string} token Token to match.
 * @param {number} maxMatches Max number of matches to return.
 * @param {!Array<?>} rows Rows to search for matches. Can be objects
 *     if they have a toString method that returns the value to
 *     match against.
 * @return {!Array<?>} The best maxMatches rows.
 */
goog.ui.ac.ArrayMatcher.getSimilarMatchesForRows =
    function(token, maxMatches, rows) {
  var results = [];

  for (var index = 0; index < rows.length; index++) {
    var row = rows[index];
    var str = token.toLowerCase();
    var txt = String(row).toLowerCase();
    var score = 0;

    if (txt.indexOf(str) != -1) {
      score = parseInt((txt.indexOf(str) / 4).toString(), 10);

    } else {
      var arr = str.split('');

      var lastPos = -1;
      var penalty = 10;

      for (var i = 0, c; c = arr[i]; i++) {
        var pos = txt.indexOf(c);

        if (pos > lastPos) {
          var diff = pos - lastPos - 1;

          if (diff > penalty - 5) {
            diff = penalty - 5;
          }

          score += diff;

          lastPos = pos;
        } else {
          score += penalty;
          penalty += 5;
        }
      }
    }

    if (score < str.length * 6) {
      results.push({
        str: row,
        score: score,
        index: index
      });
    }
  }

  results.sort(function(a, b) {
    var diff = a.score - b.score;
    if (diff != 0) {
      return diff;
    }
    return a.index - b.index;
  });

  var matches = [];
  for (var i = 0; i < maxMatches && i < results.length; i++) {
    matches.push(results[i].str);
  }

  return matches;
};
