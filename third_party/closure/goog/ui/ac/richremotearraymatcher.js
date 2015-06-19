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
 * @fileoverview Class that retrieves rich autocomplete matches, represented as
 * a structured list of lists, via an ajax call.  The first element of each
 * sublist is the name of a client-side javascript function that converts the
 * remaining sublist elements into rich rows.
 *
 */

goog.provide('goog.ui.ac.RichRemoteArrayMatcher');

goog.require('goog.dom.safe');
goog.require('goog.html.legacyconversions');
goog.require('goog.json');
goog.require('goog.ui.ac.RemoteArrayMatcher');



/**
 * An array matcher that requests rich matches via ajax and converts them into
 * rich rows.
 *
 * This class makes use of goog.html.legacyconversions and provides no
 * HTML-type-safe alternative. As such, it is not compatible with
 * code that sets goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS to
 * false.
 *
 * @param {string} url The Uri which generates the auto complete matches.  The
 *     search term is passed to the server as the 'token' query param.
 * @param {boolean=} opt_noSimilar If true, request that the server does not do
 *     similarity matches for the input token against the dictionary.
 *     The value is sent to the server as the 'use_similar' query param which is
 *     either "1" (opt_noSimilar==false) or "0" (opt_noSimilar==true).
 * @constructor
 * @extends {goog.ui.ac.RemoteArrayMatcher}
 */
goog.ui.ac.RichRemoteArrayMatcher = function(url, opt_noSimilar) {
  // requestMatchingRows() sets innerHTML directly from unsanitized/unescaped
  // server-data, with no form of type-safety. Because requestMatchingRows is
  // used polymorphically (for example, from
  // goog.ui.ac.AutoComplete.prototype.setToken) it is undesirable to have
  // Conformance legacyconversions rule for it. Doing so would cause the
  // respective check rule fire from all such places which polymorphically
  // call requestMatchingRows(); such calls are safe as long as they're not to
  // RichRemoteArrayMatcher.
  goog.html.legacyconversions.throwIfConversionsDisallowed();
  goog.ui.ac.RemoteArrayMatcher.call(this, url, opt_noSimilar);

  /**
   * A function(rows) that is called before the array matches are returned.
   * It runs client-side and filters the results given by the server before
   * being rendered by the client.
   * @type {Function}
   * @private
   */
  this.rowFilter_ = null;

};
goog.inherits(goog.ui.ac.RichRemoteArrayMatcher, goog.ui.ac.RemoteArrayMatcher);


/**
 * Set the filter that is called before the array matches are returned.
 * @param {Function} rowFilter A function(rows) that returns an array of rows as
 *     a subset of the rows input array.
 */
goog.ui.ac.RichRemoteArrayMatcher.prototype.setRowFilter = function(rowFilter) {
  this.rowFilter_ = rowFilter;
};


/**
 * Retrieve a set of matching rows from the server via ajax and convert them
 * into rich rows.
 * @param {string} token The text that should be matched; passed to the server
 *     as the 'token' query param.
 * @param {number} maxMatches The maximum number of matches requested from the
 *     server; passed as the 'max_matches' query param. The server is
 *     responsible for limiting the number of matches that are returned.
 * @param {Function} matchHandler Callback to execute on the result after
 *     matching.
 * @override
 */
goog.ui.ac.RichRemoteArrayMatcher.prototype.requestMatchingRows =
    function(token, maxMatches, matchHandler) {
  // The RichRemoteArrayMatcher must map over the results and filter them
  // before calling the request matchHandler.  This is done by passing
  // myMatchHandler to RemoteArrayMatcher.requestMatchingRows which maps,
  // filters, and then calls matchHandler.
  var myMatchHandler = goog.bind(function(token, matches) {
    /** @preserveTry */
    try {
      var rows = [];
      for (var i = 0; i < matches.length; i++) {
        var func =  /** @type {!Function} */
            (goog.json.unsafeParse(matches[i][0]));
        for (var j = 1; j < matches[i].length; j++) {
          var richRow = func(matches[i][j]);
          rows.push(richRow);

          // If no render function was provided, set the node's innerHTML.
          if (typeof richRow.render == 'undefined') {
            richRow.render = function(node, token) {
              goog.dom.safe.setInnerHtml(node,
                  goog.html.legacyconversions.safeHtmlFromString(
                      richRow.toString()));
            };
          }

          // If no select function was provided, set the text of the input.
          if (typeof richRow.select == 'undefined') {
            richRow.select = function(target) {
              target.value = richRow.toString();
            };
          }
        }
      }
      if (this.rowFilter_) {
        rows = this.rowFilter_(rows);
      }
      matchHandler(token, rows);
    } catch (exception) {
      // TODO(user): Is this what we want?
      matchHandler(token, []);
    }
  }, this);

  // Call the super's requestMatchingRows with myMatchHandler
  goog.ui.ac.RichRemoteArrayMatcher.superClass_
      .requestMatchingRows.call(this, token, maxMatches, myMatchHandler);
};
