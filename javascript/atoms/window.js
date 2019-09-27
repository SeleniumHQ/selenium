// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Atoms for simulating user actions against the browser window.
 */

goog.provide('bot.window');

goog.require('bot');
goog.require('bot.Error');
goog.require('bot.ErrorCode');
goog.require('bot.events');
goog.require('bot.userAgent');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');


/**
 * Whether the value of history.length includes a newly loaded page. If not,
 * after a new page load history.length is the number of pages that have loaded,
 * minus 1, but becomes the total number of pages on a subsequent back() call.
 * @private {boolean}
 * @const
 */
bot.window.HISTORY_LENGTH_INCLUDES_NEW_PAGE_ = !goog.userAgent.IE;


/**
 * Whether value of history.length includes the pages ahead of the current one
 * in the history. If not, history.length equals the number of prior pages.
 * Here is the WebKit bug for this behavior that was fixed by version 533:
 * https://bugs.webkit.org/show_bug.cgi?id=24472
 * @private {boolean}
 * @const
 */
bot.window.HISTORY_LENGTH_INCLUDES_FORWARD_PAGES_ =
    !goog.userAgent.WEBKIT || bot.userAgent.isEngineVersion('533');


/**
 * Screen orientation values. From the draft W3C spec at:
 * http://www.w3.org/TR/2012/WD-screen-orientation-20120522
 *
 * @enum {string}
 */
bot.window.Orientation = {
  PORTRAIT: 'portrait-primary',
  PORTRAIT_SECONDARY: 'portrait-secondary',
  LANDSCAPE: 'landscape-primary',
  LANDSCAPE_SECONDARY: 'landscape-secondary'
};


/**
 * Returns the degrees corresponding to the orientation input.
 *
 * @param {!bot.window.Orientation} orientation The orientation.
 * @return {number} The orientation degrees.
 * @private
 */
bot.window.getOrientationDegrees_ = (function() {
  var orientationMap;
  return function(orientation) {
    if (!orientationMap) {
      orientationMap = {};
      if (goog.userAgent.MOBILE) {
        // The iPhone and Android phones do not change orientation event when
        // held upside down. Hence, PORTRAIT_SECONDARY is not set.
        orientationMap[bot.window.Orientation.PORTRAIT] = 0;
        orientationMap[bot.window.Orientation.LANDSCAPE] = 90;
        orientationMap[bot.window.Orientation.LANDSCAPE_SECONDARY] = -90;
        if (goog.userAgent.product.IPAD) {
          orientationMap[bot.window.Orientation.PORTRAIT_SECONDARY] = 180;
        }
      } else if (goog.userAgent.product.ANDROID) {
        // Unlike the iPad, Android tablets treat landscape orientation as the
        // default, i.e., having window.orientation = 0.
        orientationMap[bot.window.Orientation.PORTRAIT] = -90;
        orientationMap[bot.window.Orientation.LANDSCAPE] = 0;
        orientationMap[bot.window.Orientation.PORTRAIT_SECONDARY] = 90;
        orientationMap[bot.window.Orientation.LANDSCAPE_SECONDARY] = 180;
      }
    }
    return orientationMap[orientation];
  };
})();


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


/**
 * Determine the size of the window that a user could interact with. This will
 * be the greatest of document.body.(width|scrollWidth), the same for
 * document.documentElement or the size of the viewport.
 *
 * @param {!Window=} opt_win Window to determine the size of. Defaults to
 *   bot.getWindow().
 * @return {!goog.math.Size} The calculated size.
 */
bot.window.getInteractableSize = function(opt_win) {
  var win = opt_win || bot.getWindow();
  var doc = win.document;
  var elem = doc.documentElement;
  var body = doc.body;
  if (!body) {
    throw new bot.Error(bot.ErrorCode.UNKNOWN_ERROR,
        'No BODY element present');
  }

  var widths = [
    elem.clientWidth, elem.scrollWidth, elem.offsetWidth,
    body.scrollWidth, body.offsetWidth
  ];
  var heights = [
    elem.clientHeight, elem.scrollHeight, elem.offsetHeight,
    body.scrollHeight, body.offsetHeight
  ];

  var width = Math.max.apply(null, widths);
  var height = Math.max.apply(null, heights);

  return new goog.math.Size(width, height);
};


/**
 * Gets the frame element.
 *
 * @param {!Window} win Window of the frame. Defaults to bot.getWindow().
 * @return {Element} The frame element if it exists, null otherwise.
 * @private
 */
bot.window.getFrame_ = function(win) {
  try {
    // On IE, accessing the frameElement of a popup window results in a "No
    // Such interface" exception.
    return win.frameElement;
  } catch (e) {
    return null;
  }
};


/**
 * Determine the outer size of the window.
 *
 * @param {!Window=} opt_win Window to determine the size of. Defaults to
 *   bot.getWindow().
 * @return {!goog.math.Size} The calculated size.
 */
bot.window.getSize = function(opt_win) {
  var win = opt_win || bot.getWindow();
  var frame = bot.window.getFrame_(win);
  if (bot.userAgent.ANDROID_PRE_ICECREAMSANDWICH) {
    if (frame) {
      // Early Android browsers do not account for border width.
      var box = goog.style.getBorderBox(frame);
      return new goog.math.Size(frame.clientWidth - box.left - box.right,
                                frame.clientHeight);
    } else {
      // A fixed popup size.
      return new goog.math.Size(320, 240);
    }
  } else if (frame) {
    return new goog.math.Size(frame.clientWidth, frame.clientHeight);
  } else {
    var docElem = win.document.documentElement;
    var body = win.document.body;
    var width = win.outerWidth || (docElem && docElem.clientWidth) ||
        (body && body.clientWidth) || 0;
    var height = win.outerHeight || (docElem && docElem.clientHeight) ||
        (body && body.clientHeight) || 0;
    return new goog.math.Size(width, height);
  }
};


/**
 * Set the outer size of the window.
 *
 * @param {!goog.math.Size} size The new window size.
 * @param {!Window=} opt_win Window to determine the size of. Defaults to
 *   bot.getWindow().
 */
bot.window.setSize = function(size, opt_win) {
  var win = opt_win || bot.getWindow();
  var frame = bot.window.getFrame_(win);
  if (frame) {
    // minHeight and minWidth are altered because many browsers will not change
    // height or width if it is less than a specified minHeight or minWidth.
    frame.style.minHeight = '0px';
    frame.style.minWidth = '0px';
    frame.width = size.width + 'px';
    frame.style.width = size.width + 'px';
    frame.height = size.height + 'px';
    frame.style.height = size.height + 'px';
  } else {
    win.resizeTo(size.width, size.height);
  }
};


/**
 * Determine the scroll position of the window.
 *
 * @param {!Window=} opt_win Window to determine the scroll position of.
 *   Defaults to bot.getWindow().
 * @return {!goog.math.Coordinate} The scroll position.
 */
bot.window.getScroll = function(opt_win) {
  var win = opt_win || bot.getWindow();
  return new goog.dom.DomHelper(win.document).getDocumentScroll();
};


/**
 * Set the scroll position of the window.
 *
 * @param {!goog.math.Coordinate} position The new scroll position.
 * @param {!Window=} opt_win Window to apply position to. Defaults to
 *   bot.getWindow().
 */
bot.window.setScroll = function(position, opt_win) {
  var win = opt_win || bot.getWindow();
  win.scrollTo(position.x, position.y);
};


/**
 * Get the position of the window.
 *
 * @param {!Window=} opt_win Window to determine the position of. Defaults to
 *   bot.getWindow().
 * @return {!goog.math.Coordinate} The position of the window.
 */
bot.window.getPosition = function(opt_win) {
  var win = opt_win || bot.getWindow();
  var x, y;

  if (goog.userAgent.IE) {
    x = win.screenLeft;
    y = win.screenTop;
  } else {
    x = win.screenX;
    y = win.screenY;
  }

  return new goog.math.Coordinate(x, y);
};


/**
 * Set the position of the window.
 *
 * @param {!goog.math.Coordinate} position The target position.
 * @param {!Window=} opt_win Window to set the position of. Defaults to
 *   bot.getWindow().
 */
bot.window.setPosition = function(position, opt_win) {
  var win = opt_win || bot.getWindow();
  win.moveTo(position.x, position.y);
};


/**
 * Scrolls the given position into the viewport, using the minimal amount of
 * scrolling necessary to being the coordinate into view.
 *
 * @param {!goog.math.Coordinate} position The position to scroll into view.
 * @param {!Window=} opt_win Window to apply position to. Defaults to
 *   bot.getWindow().
 */
bot.window.scrollIntoView = function(position, opt_win) {
  var win = opt_win || bot.getWindow();
  var viewport = goog.dom.getViewportSize(win);
  var scroll = bot.window.getScroll(win);

  // Scroll the minimal amount to bring the position into view.
  var targetScroll = new goog.math.Coordinate(
      newScrollDim(position.x, scroll.x, viewport.width),
      newScrollDim(position.y, scroll.y, viewport.height));
  if (!goog.math.Coordinate.equals(targetScroll, scroll)) {
    bot.window.setScroll(targetScroll, win);
  }

  // It is difficult to determine the size of the web page in some browsers.
  // We check if the scrolling we intended to do really happened. If not we
  // assume that the target location is not on the web page.
  if (!goog.math.Coordinate.equals(targetScroll, bot.window.getScroll(win))) {
    throw new bot.Error(bot.ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
        'The target scroll location ' + targetScroll + ' is not on the page.');
  }

  function newScrollDim(positionDim, scrollDim, viewportDim) {
    if (positionDim < scrollDim) {
      return positionDim;
    } else if (positionDim >= scrollDim + viewportDim) {
      return positionDim - viewportDim + 1;
    } else {
      return scrollDim;
    }
  }
};


/**
 * @return {number} The current window orientation degrees.
 *     window.
 * @private
 */
bot.window.getCurrentOrientationDegrees_ = function() {
  var win = bot.getWindow();
  if (!goog.isDef(win.orientation)) {
    // If window.orientation is not defined, assume a default orientation of 0.
    // A value of 0 indicates a portrait orientation except for android tablets
    // where 0 indicates a landscape orientation.
    win.orientation = 0;
  }
  return win.orientation;
};


/**
 * Changes window orientation.
 *
 * @param {!bot.window.Orientation} orientation The new orientation of the
 *     window.
 */
bot.window.changeOrientation = function(orientation) {
  var win = bot.getWindow();
  var currentOrientationDegrees = bot.window.getCurrentOrientationDegrees_();
  var newOrientationDegrees = bot.window.getOrientationDegrees_(orientation);
  if (currentOrientationDegrees == newOrientationDegrees ||
      !goog.isDef(newOrientationDegrees)) {
    return;
  }

  // If possible, try to override the window's orientation value.
  // On some older version of Android, it's not possible to change
  // the window's orientation value.
  if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
    var descriptor = Object.getOwnPropertyDescriptor(win, 'orientation');
    if (descriptor && descriptor.configurable) {
      Object.defineProperty(win, 'orientation', {
        configurable: true,
        get: function() {
          return newOrientationDegrees;
        }
      });
    }
  }
  bot.events.fire(win, bot.events.EventType.ORIENTATIONCHANGE);

  // Change the window size to reflect the new orientation.
  if (Math.abs(currentOrientationDegrees - newOrientationDegrees) % 180 != 0) {
    var size = bot.window.getSize();
    var shorter = size.getShortest();
    var longer = size.getLongest();
    if (orientation == bot.window.Orientation.PORTRAIT ||
        orientation == bot.window.Orientation.PORTRAIT_SECONDARY) {
      bot.window.setSize(new goog.math.Size(shorter, longer));
    } else {
      bot.window.setSize(new goog.math.Size(longer, shorter));
    }
  }
};
