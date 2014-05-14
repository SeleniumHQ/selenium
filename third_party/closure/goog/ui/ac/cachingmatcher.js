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
 * @fileoverview Matcher which maintains a client-side cache on top of some
 * other matcher.
 * @author reinerp@google.com (Reiner Pope)
 */


goog.provide('goog.ui.ac.CachingMatcher');

goog.require('goog.array');
goog.require('goog.async.Throttle');
goog.require('goog.ui.ac.ArrayMatcher');
goog.require('goog.ui.ac.RenderOptions');



/**
 * A matcher which wraps another (typically slow) matcher and
 * keeps a client-side cache of the results. For instance, you can use this to
 * wrap a RemoteArrayMatcher to hide the latency of the underlying matcher
 * having to make ajax request.
 *
 * Objects in the cache are deduped on their stringified forms.
 *
 * Note - when the user types a character, they will instantly get a set of
 * local results, and then some time later, the results from the server will
 * show up.
 *
 * @constructor
 * @param {!Object} baseMatcher The underlying matcher to use. Must implement
 *     requestMatchingRows.
 * @final
 */
goog.ui.ac.CachingMatcher = function(baseMatcher) {
  /** @private {!Array.<!Object>}} The cache. */
  this.rows_ = [];

  /**
   * Set of stringified rows, for fast deduping. Each element of this.rows_
   * is stored in rowStrings_ as (' ' + row) to ensure we avoid builtin
   * properties like 'toString'.
   * @private {Object.<string, boolean>}
   */
  this.rowStrings_ = {};

  /**
   * Maximum number of rows in the cache. If the cache grows larger than this,
   * the entire cache will be emptied.
   * @private {number}
   */
  this.maxCacheSize_ = 1000;

  /** @private {!Object} The underlying matcher to use. */
  this.baseMatcher_ = baseMatcher;

  /**
   * Local matching function.
   * @private {function(string, number, !Array.<!Object>): !Array.<!Object>}
   */
  this.getMatchesForRows_ = goog.ui.ac.ArrayMatcher.getMatchesForRows;

  /** @private {number} Number of matches to request from the base matcher. */
  this.baseMatcherMaxMatches_ = 100;

  /** @private {goog.async.Throttle} */
  this.throttledTriggerBaseMatch_ =
      new goog.async.Throttle(this.triggerBaseMatch_, 150, this);

  /** @private {string} */
  this.mostRecentToken_ = '';

  /** @private {Function} */
  this.mostRecentMatchHandler_ = null;

  /** @private {number} */
  this.mostRecentMaxMatches_ = 10;

  /**
   * The set of rows which we last displayed.
   *
   * NOTE(reinerp): The need for this is subtle. When a server result comes
   * back, we don't want to suddenly change the list of results without the user
   * doing anything. So we make sure to add the new server results to the end of
   * the currently displayed list.
   *
   * We need to keep track of the last rows we displayed, because the "similar
   * matcher" we use locally might otherwise reorder results.
   *
   * @private {Array.<!Object>}
   */
  this.mostRecentMatches_ = [];
};


/**
 * Sets the number of milliseconds with which to throttle the match requests
 * on the underlying matcher.
 *
 * Default value: 150.
 *
 * @param {number} throttleTime .
 */
goog.ui.ac.CachingMatcher.prototype.setThrottleTime = function(throttleTime) {
  this.throttledTriggerBaseMatch_ =
      new goog.async.Throttle(this.triggerBaseMatch_, throttleTime, this);
};


/**
 * Sets the maxMatches to use for the base matcher. If the base matcher makes
 * AJAX requests, it may help to make this a large number so that the local
 * cache gets populated quickly.
 *
 * Default value: 100.
 *
 * @param {number} maxMatches The value to set.
 */
goog.ui.ac.CachingMatcher.prototype.setBaseMatcherMaxMatches =
    function(maxMatches) {
  this.baseMatcherMaxMatches_ = maxMatches;
};


/**
 * Sets the maximum size of the local cache. If the local cache grows larger
 * than this size, it will be emptied.
 *
 * Default value: 1000.
 *
 * @param {number} maxCacheSize .
 */
goog.ui.ac.CachingMatcher.prototype.setMaxCacheSize = function(maxCacheSize) {
  this.maxCacheSize_ = maxCacheSize;
};


/**
 * Sets the local matcher to use.
 *
 * The local matcher should be a function with the same signature as
 * {@link goog.ui.ac.ArrayMatcher.getMatchesForRows}, i.e. its arguments are
 * searchToken, maxMatches, rowsToSearch; and it returns a list of matching
 * rows.
 *
 * Default value: {@link goog.ui.ac.ArrayMatcher.getMatchesForRows}.
 *
 * @param {function(string, number, !Array.<!Object>): !Array.<!Object>}
 *     localMatcher
 */
goog.ui.ac.CachingMatcher.prototype.setLocalMatcher = function(localMatcher) {
  this.getMatchesForRows_ = localMatcher;
};


/**
 * Function used to pass matches to the autocomplete.
 * @param {string} token Token to match.
 * @param {number} maxMatches Max number of matches to return.
 * @param {Function} matchHandler callback to execute after matching.
 */
goog.ui.ac.CachingMatcher.prototype.requestMatchingRows =
    function(token, maxMatches, matchHandler) {
  this.mostRecentMaxMatches_ = maxMatches;
  this.mostRecentToken_ = token;
  this.mostRecentMatchHandler_ = matchHandler;
  this.throttledTriggerBaseMatch_.fire();

  var matches = this.getMatchesForRows_(token, maxMatches, this.rows_);
  matchHandler(token, matches);
  this.mostRecentMatches_ = matches;
};


/**
 * Adds the specified rows to the cache.
 * @param {!Array.<!Object>} rows .
 * @private
 */
goog.ui.ac.CachingMatcher.prototype.addRows_ = function(rows) {
  goog.array.forEach(rows, function(row) {
    // The ' ' prefix is to avoid colliding with builtins like toString.
    if (!this.rowStrings_[' ' + row]) {
      this.rows_.push(row);
      this.rowStrings_[' ' + row] = true;
    }
  }, this);
};


/**
 * Checks if the cache is larger than the maximum cache size. If so clears it.
 * @private
 */
goog.ui.ac.CachingMatcher.prototype.clearCacheIfTooLarge_ = function() {
  if (this.rows_.length > this.maxCacheSize_) {
    this.rows_ = [];
    this.rowStrings_ = {};
  }
};


/**
 * Triggers a match request against the base matcher. This function is
 * unthrottled, so don't call it directly; instead use
 * this.throttledTriggerBaseMatch_.
 * @private
 */
goog.ui.ac.CachingMatcher.prototype.triggerBaseMatch_ = function() {
  this.baseMatcher_.requestMatchingRows(this.mostRecentToken_,
      this.baseMatcherMaxMatches_, goog.bind(this.onBaseMatch_, this));
};


/**
 * Handles a match response from the base matcher.
 * @param {string} token The token against which the base match was called.
 * @param {!Array.<!Object>} matches The matches returned by the base matcher.
 * @private
 */
goog.ui.ac.CachingMatcher.prototype.onBaseMatch_ = function(token, matches) {
  // NOTE(reinerp): The user might have typed some more characters since the
  // base matcher request was sent out, which manifests in that token might be
  // older than this.mostRecentToken_. We make sure to do our local matches
  // using this.mostRecentToken_ rather than token so that we display results
  // relevant to what the user is seeing right now.

  // NOTE(reinerp): We compute a diff between the currently displayed results
  // and the new results we would get now that the server results have come
  // back. Using this diff, we make sure the new results are only added to the
  // end of the list of results. See the documentation on
  // this.mostRecentMatches_ for details

  this.addRows_(matches);

  var oldMatchesSet = {};
  goog.array.forEach(this.mostRecentMatches_, function(match) {
    // The ' ' prefix is to avoid colliding with builtins like toString.
    oldMatchesSet[' ' + match] = true;
  });
  var newMatches = this.getMatchesForRows_(this.mostRecentToken_,
      this.mostRecentMaxMatches_, this.rows_);
  newMatches = goog.array.filter(newMatches, function(match) {
    return !(oldMatchesSet[' ' + match]);
  });
  newMatches = this.mostRecentMatches_.concat(newMatches)
      .slice(0, this.mostRecentMaxMatches_);

  this.mostRecentMatches_ = newMatches;

  // We've gone to the effort of keeping the existing rows as before, so let's
  // make sure to keep them highlighted.
  var options = new goog.ui.ac.RenderOptions();
  options.setPreserveHilited(true);
  this.mostRecentMatchHandler_(this.mostRecentToken_, newMatches, options);

  // We clear the cache *after* running the local match, so we don't
  // suddenly remove results just because the remote match came back.
  this.clearCacheIfTooLarge_();
};
