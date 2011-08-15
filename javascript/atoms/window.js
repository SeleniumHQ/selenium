
// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Atoms for simulating user actions against the browser window.
 *
 *
 */

goog.provide('bot.window');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('goog.userAgent');


/**
 * Whether the value of history.length includes a newly loaded page. If not,
 * after a new page load history.length is the number of pages that have loaded,
 * minus 1, but becomes the total number of pages on a subsequent back() call.
 *
 * @const
 * @type {boolean}
 * @private
 */
bot.window.HISTORY_LENGTH_INCLUDES_NEW_PAGE_ = !goog.userAgent.IE &&
    !goog.userAgent.OPERA;


/**
 * Whether value of history.length includes the pages ahead of the current one
 * in the history. If not, history.length equals the number of prior pages.
 * Here is the WebKit bug for this behavior that was fixed by version 533:
 * https://bugs.webkit.org/show_bug.cgi?id=24472
 *
 * @const
 * @type {boolean}
 * @private
 */
bot.window.HISTORY_LENGTH_INCLUDES_FORWARD_PAGES_ = !goog.userAgent.OPERA &&
    (!goog.userAgent.WEBKIT || goog.userAgent.isVersion('533'));


/**
 * Go back in the browser history. The number of pages to go back can
 * optionally be specified and defaults to 1.
 *
 * @param {number=} opt_numPages Number of pages to go back.
 */
bot.window.back = function(opt_numPages) {
  // Relax the upper bound by one for browsers that do not count
  // newly loaded pages towards the value of window.history.length.
  var maxPages = bot.window.HISTORY_LENGTH_INCLUDES_NEW_PAGE_ ?
      bot.getWindow().history.length - 1 : bot.getWindow().history.length;
  var numPages = bot.window.checkNumPages_(maxPages, opt_numPages);
  bot.getWindow().history.go(-numPages);
};


/**
 * Go forward in the browser history. The number of pages to go forward can
 * optionally be specified and defaults to 1.
 *
 * @param {number=} opt_numPages Number of pages to go forward.
 */
bot.window.forward = function(opt_numPages) {
  // Do not check the upper bound (use null for infinity) for browsers that
  // do not count forward pages towards the value of window.history.length.
  var maxPages = bot.window.HISTORY_LENGTH_INCLUDES_FORWARD_PAGES_ ?
      bot.getWindow().history.length - 1 : null;
  var numPages = bot.window.checkNumPages_(maxPages, opt_numPages);
  bot.getWindow().history.go(numPages);
};


/**
 * @param {?number} maxPages Upper bound on number of pages; null for infinity.
 * @param {number=} opt_numPages Number of pages to move in history.
 * @return {number} Correct number of pages to move in history.
 * @private
 */
bot.window.checkNumPages_ = function(maxPages, opt_numPages) {
  var numPages = goog.isDef(opt_numPages) ? opt_numPages : 1;
  if (numPages <= 0) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'number of pages must be positive');
  }
  if (maxPages !== null && numPages > maxPages) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'number of pages must be less than the length of the browser history');
  }
  return numPages;
};
