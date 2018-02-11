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
 * @fileoverview Utilities for window manipulation.
 */


goog.provide('goog.window');

goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.labs.userAgent.platform');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.userAgent');


/**
 * Default height for popup windows
 * @type {number}
 */
goog.window.DEFAULT_POPUP_HEIGHT = 500;


/**
 * Default width for popup windows
 * @type {number}
 */
goog.window.DEFAULT_POPUP_WIDTH = 690;


/**
 * Default target for popup windows
 * @type {string}
 */
goog.window.DEFAULT_POPUP_TARGET = 'google_popup';


/**
 * @return {!Window}
 * @suppress {checkTypes}
 * @private
 */
goog.window.createFakeWindow_ = function() {
  return /** @type {!Window} */ ({});
};

/**
 * Opens a new window.
 *
 * @param {?goog.html.SafeUrl|string|?Object} linkRef If an Object with an 'href'
 *     attribute (such as HTMLAnchorElement) is passed then the value of 'href'
 *     is used, otherwise its toString method is called. Note that if a
 *     string|Object is used, it will be sanitized with SafeUrl.sanitize().
 *
 * @param {?Object=} opt_options supports the following options:
 *  'target': (string) target (window name). If null, linkRef.target will
 *          be used.
 *  'width': (number) window width.
 *  'height': (number) window height.
 *  'top': (number) distance from top of screen
 *  'left': (number) distance from left of screen
 *  'toolbar': (boolean) show toolbar
 *  'scrollbars': (boolean) show scrollbars
 *  'location': (boolean) show location
 *  'statusbar': (boolean) show statusbar
 *  'menubar': (boolean) show menubar
 *  'resizable': (boolean) resizable
 *  'noreferrer': (boolean) whether to attempt to remove the referrer header
 *      from the request headers. Does this by opening a blank window that
 *      then redirects to the target url, so users may see some flickering.
 *
 * @param {?Window=} opt_parentWin Parent window that should be used to open the
 *                 new window.
 *
 * @return {?Window} Returns the window object that was opened. This returns
 *                  null if a popup blocker prevented the window from being
 *                  opened. In case when a new window is opened in a different
 *                  browser sandbox (such as iOS standalone mode), the returned
 *                  object is a emulated Window object that functions as if
 *                  a cross-origin window has been opened.
 */
goog.window.open = function(linkRef, opt_options, opt_parentWin) {
  if (!opt_options) {
    opt_options = {};
  }
  var parentWin = opt_parentWin || window;

  /** @type {!goog.html.SafeUrl} */
  var safeLinkRef;

  if (linkRef instanceof goog.html.SafeUrl) {
    safeLinkRef = linkRef;
  } else {
    // HTMLAnchorElement has a toString() method with the same behavior as
    // goog.Uri in all browsers except for Safari, which returns
    // '[object HTMLAnchorElement]'.  We check for the href first, then
    // assume that it's a goog.Uri or String otherwise.
    var url =
        typeof linkRef.href != 'undefined' ? linkRef.href : String(linkRef);
    safeLinkRef = goog.html.SafeUrl.sanitize(url);
  }


  var target = opt_options.target || linkRef.target;

  var sb = [];
  for (var option in opt_options) {
    switch (option) {
      case 'width':
      case 'height':
      case 'top':
      case 'left':
        sb.push(option + '=' + opt_options[option]);
        break;
      case 'target':
      case 'noreferrer':
        break;
      default:
        sb.push(option + '=' + (opt_options[option] ? 1 : 0));
    }
  }
  var optionString = sb.join(',');

  var newWin;
  if (goog.labs.userAgent.platform.isIos() && parentWin.navigator &&
      parentWin.navigator['standalone'] && target && target != '_self') {
    // iOS in standalone mode disregards "target" in window.open and always
    // opens new URL in the same window. The workout around is to create an "A"
    // element and send a click event to it.
    // Notice that the "A" tag does NOT have to be added to the DOM.

    var a = /** @type {!HTMLAnchorElement} */
        (parentWin.document.createElement(String(goog.dom.TagName.A)));
    goog.dom.safe.setAnchorHref(a, safeLinkRef);

    a.setAttribute('target', target);
    if (opt_options['noreferrer']) {
      a.setAttribute('rel', 'noreferrer');
    }
    var click = document.createEvent('MouseEvent');
    click.initMouseEvent(
        'click',
        true,  // canBubble
        true,  // cancelable
        parentWin,
        1);  // detail = mousebutton
    a.dispatchEvent(click);
    // New window is not available in this case. Instead, a fake Window object
    // is returned. In particular, it will have window.document undefined. In
    // general, it will appear to most of clients as a Window for a different
    // origin. Since iOS standalone web apps are run in their own sandbox, this
    // is the most appropriate return value.
    newWin = goog.window.createFakeWindow_();
  } else if (opt_options['noreferrer']) {
    // Use a meta-refresh to stop the referrer from being included in the
    // request headers. This seems to be the only cross-browser way to
    // remove the referrer. It also allows for the opener to be set to null
    // in the new window, thus disallowing the opened window from navigating
    // its opener.
    //
    // Detecting user agent and then using a different strategy per browser
    // would allow the referrer to leak in case of an incorrect/missing user
    // agent.
    //
    // Also note that we can't use goog.dom.safe.openInWindow here, as it
    // requires a goog.string.Const 'name' parameter, while we're using plain
    // strings here for target.
    newWin = parentWin.open('', target, optionString);

    var sanitizedLinkRef = goog.html.SafeUrl.unwrap(safeLinkRef);
    if (newWin) {
      if (goog.userAgent.EDGE_OR_IE) {
        // IE/EDGE can't parse the content attribute if the url contains
        // a semicolon. We can fix this by adding quotes around the url, but
        // then we can't parse quotes in the URL correctly. We take a
        // best-effort approach.
        //
        // If the URL has semicolons, wrap it in single quotes to protect
        // the semicolons.
        // If the URL has semicolons and single quotes, url-encode the single
        // quotes as well.
        //
        // This is imperfect. Notice that both ' and ; are reserved characters
        // in URIs, so this could do the wrong thing, but at least it will
        // do the wrong thing in only rare cases.
        // ugh.
        if (goog.string.contains(sanitizedLinkRef, ';')) {
          sanitizedLinkRef = "'" + sanitizedLinkRef.replace(/'/g, '%27') + "'";
        }
      }
      newWin.opener = null;

      // TODO(rjamet): Building proper SafeHtml with SafeHtml.createMetaRefresh
      // pulls in a lot of compiled code, which is composed of various unneeded
      // goog.html parts such as SafeStyle.create among others. So, for now,
      // keep the unchecked conversion until we figure out how to make the
      // dependencies of createSafeHtmlTagSecurityPrivateDoNotAccessOrElse less
      // heavy.
      var safeHtml =
          goog.html.uncheckedconversions
              .safeHtmlFromStringKnownToSatisfyTypeContract(
                  goog.string.Const.from(
                      'b/12014412, meta tag with sanitized URL'),
                  '<META HTTP-EQUIV="refresh" content="0; url=' +
                      goog.string.htmlEscape(sanitizedLinkRef) + '">');
      goog.dom.safe.documentWrite(newWin.document, safeHtml);
      newWin.document.close();
    }
  } else {
    newWin = parentWin.open(
        goog.html.SafeUrl.unwrap(safeLinkRef), target, optionString);
  }
  // newWin is null if a popup blocker prevented the window open.
  return newWin;
};


/**
 * Opens a new window without any real content in it.
 *
 * This can be used to get around popup blockers if you need to open a window
 * in response to a user event, but need to do asynchronous work to determine
 * the URL to open, and then set the URL later.
 *
 * Example usage:
 *
 * var newWin = goog.window.openBlank('Loading...');
 * setTimeout(
 *     function() {
 *       newWin.location.href = 'http://www.google.com';
 *     }, 100);
 *
 * @param {string=} opt_message String to show in the new window. This string
 *     will be HTML-escaped to avoid XSS issues.
 * @param {?Object=} opt_options Options to open window with.
 *     {@see goog.window.open for exact option semantics}.
 * @param {?Window=} opt_parentWin Parent window that should be used to open the
 *                 new window.
 * @return {?Window} Returns the window object that was opened. This returns
 *                  null if a popup blocker prevented the window from being
 *                  opened.
 */
goog.window.openBlank = function(opt_message, opt_options, opt_parentWin) {
  // Open up a window with the loading message and nothing else.
  // This will be interpreted as HTML content type with a missing doctype
  // and html/body tags, but is otherwise acceptable.
  //
  // IMPORTANT: The order of escaping is crucial here in order to avoid XSS.
  // First, HTML-escaping is needed because the result of the JS expression
  // is evaluated as HTML. Second, JS-string escaping is needed; this avoids
  // \u escaping from inserting HTML tags and \ from escaping the final ".
  // Finally, URL percent-encoding is done with encodeURI(); this
  // avoids percent-encoding from bypassing HTML and JS escaping.
  //
  // Note: There are other ways the same result could be achieved but the
  // current behavior was preserved when this code was refactored to use
  // SafeUrl, in order to avoid breakage.
  var loadingMessage;
  if (!opt_message) {
    loadingMessage = '';
  } else {
    loadingMessage =
        goog.string.escapeString(goog.string.htmlEscape(opt_message));
  }
  var url = goog.html.uncheckedconversions
                .safeUrlFromStringKnownToSatisfyTypeContract(
                    goog.string.Const.from(
                        'b/12014412, encoded string in javascript: URL'),
                    'javascript:"' + encodeURI(loadingMessage) + '"');
  return /** @type {?Window} */ (
      goog.window.open(url, opt_options, opt_parentWin));
};


/**
 * Raise a help popup window, defaulting to "Google standard" size and name.
 *
 * (If your project is using GXPs, consider using {@link PopUpLink.gxp}.)
 *
* @param {?goog.html.SafeUrl|string|?Object} linkRef If an Object with an 'href'
 *     attribute (such as HTMLAnchorElement) is passed then the value of 'href'
 *     is used, otherwise  otherwise its toString method is called. Note that
 *     if a string|Object is used, it will be sanitized with SafeUrl.sanitize().
 *
 * @param {?Object=} opt_options Options to open window with.
 *     {@see goog.window.open for exact option semantics}
 *     Additional wrinkles to the options:
 *     - if 'target' field is null, linkRef.target will be used. If *that's*
 *     null, the default is "google_popup".
 *     - if 'width' field is not specified, the default is 690.
 *     - if 'height' field is not specified, the default is 500.
 *
 * @return {boolean} true if the window was not popped up, false if it was.
 */
goog.window.popup = function(linkRef, opt_options) {
  if (!opt_options) {
    opt_options = {};
  }

  // set default properties
  opt_options['target'] = opt_options['target'] || linkRef['target'] ||
      goog.window.DEFAULT_POPUP_TARGET;
  opt_options['width'] =
      opt_options['width'] || goog.window.DEFAULT_POPUP_WIDTH;
  opt_options['height'] =
      opt_options['height'] || goog.window.DEFAULT_POPUP_HEIGHT;

  var newWin = goog.window.open(linkRef, opt_options);
  if (!newWin) {
    return true;
  }
  newWin.focus();

  return false;
};
