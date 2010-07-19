// Copyright 2005 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Functions to create special cursor styles, like "draggable"
 * (open hand) or "dragging" (closed hand).
 *
*
*
 */

goog.provide('goog.style.cursor');

goog.require('goog.userAgent');

/**
 * The file name for the open-hand (draggable) cursor.
 * @type {string}
 */
goog.style.cursor.OPENHAND_FILE = 'openhand.cur';


/**
 * The file name for the close-hand (dragging) cursor.
 * @type {string}
 */
goog.style.cursor.CLOSEDHAND_FILE = 'closedhand.cur';


/**
 * Create the style for the draggable cursor based on browser and OS.
 * The value can be extended to be '!important' if needed.
 *
 * @param {string} absoluteDotCurFilePath The absolute base path of
 *     'openhand.cur' file to be used if the browser supports it.
 * @param {boolean=} opt_important Whether to use the '!important' CSS
 *     modifier.
 * @return {string} The "draggable" mouse cursor style value.
 */
goog.style.cursor.getDraggableCursorStyle = function(
    absoluteDotCurFilePath, opt_important) {
  return goog.style.cursor.getCursorStyle_(
      '-moz-grab',
      absoluteDotCurFilePath + goog.style.cursor.OPENHAND_FILE,
      'default',
      opt_important);
};


/**
 * Create the style for the dragging cursor based on browser and OS.
 * The value can be extended to be '!important' if needed.
 *
 * @param {string} absoluteDotCurFilePath The absolute base path of
 *     'closedhand.cur' file to be used if the browser supports it.
 * @param {boolean=} opt_important Whether to use the '!important' CSS
 *     modifier.
 * @return {string} The "dragging" mouse cursor style value.
 */
goog.style.cursor.getDraggingCursorStyle = function(
    absoluteDotCurFilePath, opt_important) {
  return goog.style.cursor.getCursorStyle_(
      '-moz-grabbing',
      absoluteDotCurFilePath + goog.style.cursor.CLOSEDHAND_FILE,
      'move',
      opt_important);
};


/**
 * Create the style for the cursor based on browser and OS.
 *
 * @param {string} geckoNonWinBuiltInStyleValue The Gecko on non-Windows OS,
 *     built in cursor style.
 * @param {string} absoluteDotCurFilePath The .cur file absolute file to be
 *     used if the browser supports it.
 * @param {string} defaultStyle The default fallback cursor style.
 * @param {boolean=} opt_important Whether to use the '!important' CSS
 *     modifier (not included for FF).
 * @return {string} The computed mouse cursor style value.
 * @private
 */
goog.style.cursor.getCursorStyle_ = function(geckoNonWinBuiltInStyleValue,
    absoluteDotCurFilePath, defaultStyle, opt_important) {
  // Use built in cursors for Gecko on non Windows OS.
  // We prefer our custom cursor, but Firefox Mac and Firefox Linux
  // cannot do custom cursors. They do have a built-in hand, so use it:
  if (goog.userAgent.GECKO && !goog.userAgent.WINDOWS) {
    return geckoNonWinBuiltInStyleValue;
  }

  // Use the custom cursor file.
  var cursorStyleValue = 'url("' + absoluteDotCurFilePath + '")';
  // Change hot-spot for Safari.
  if (goog.userAgent.WEBKIT) {
    // Safari seems to ignore the hotspot specified in the .cur file (it uses
    // 0,0 instead).  This causes the cursor to jump as it transitions between
    // openhand and pointer which is especially annoying when trying to hover
    // over the route for draggable routes.  We specify the hotspot here as 7,5
    // in the css - unfortunately ie6 can't understand this and falls back to
    // the builtin cursors so we just do this for safari (but ie DOES correctly
    // use the hotspot specified in the file so this is ok).  The appropriate
    // coordinates were determined by looking at a hex dump and the format
    // description from wikipedia.
    cursorStyleValue += ' 7 5';
  }
  // Add default cursor fallback.
  cursorStyleValue += ', ' + defaultStyle;
  // Force the style. Do not do it for FF on Windows as it breaks the style.
  if (!goog.userAgent.GECKO && opt_important) {
    cursorStyleValue += ' !important';
  }
  return cursorStyleValue;
};

