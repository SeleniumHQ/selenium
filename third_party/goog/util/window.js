// Copyright 2006 Google Inc.
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

/**
 * @fileoverview Utilities for window manipulation
 */


goog.provide('goog.window');


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
 * Opens a new window.
 *
 * @param {string|Object} linkRef A string or an object that supports toString,
 *     for example goog.Uri.  If this is an object with a 'href' attribute, such
 *     as HTMLAnchorElement, it will be used instead.
 *
 * @param {Object} opt_options supports the following options:
 *  target: (string) target (window name). If null, linkRef.target will
 *          be used.
 *  width: (number) window width. If null, the default is 690.
 *  height: (number) window height. If null, the default is 500.
 *  top: (number) distance from top of screen
 *  left: (number) distance from left of screen
 *  toolbar: (boolean) show toolbar
 *  scrollbars: (boolean) show scrollbars
 *  location: (boolean) show location
 *  statusbar: (boolean) show statusbar
 *  menubar: (boolean) show menubar
 *  resizable: (boolean) resizable.
 *
 * @param {Window} opt_parentWin Parent window that should be used to open the
 *                 new window.
 *
 * @return {Window} Returns the window object that was opened. This returns
 *                  null if a popup blocker prevented the window from being
 *                  opened.
 */
goog.window.open = function(linkRef, opt_options, opt_parentWin) {
  if (!opt_options) {
    opt_options = {};
  }
  var parentWin = opt_parentWin || window;

  // HTMLAnchorElement has a toString() method with the same behavior as
  // goog.Uri in all browsers except for Safari, which returns
  // '[object HTMLAnchorElement]'.  We check for the href first, then
  // assume that it's a goog.Uri or String otherwise.
  var href = typeof linkRef.href != 'undefined' ? linkRef.href :
      String(linkRef);
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
        break;
      default:
        sb.push(option + '=' + (opt_options[option] ? 1 : 0));
    }
  }
  var optionString = sb.join(',');

  var newWin = parentWin.open(href, target, optionString);
  // newWin is null if a popup blocker prevented the window open.
  return newWin;
};


/**
 * Raise a help popup window, defaulting to "Google standard" size and name.
 *
 * (If your project is using GXPs, consider using {@link PopUpLink.gxp}.)
 *
 * @param {string|Object} linkRef if this is a string, it will be used as the
 * URL of the popped window; otherwise it's assumed to be an HTMLAnchorElement
 * (or some other object with "target" and "href" properties).
 *
 * @param {Object} opt_options supports the following options:
 *  target: (Object) target (window name). If null, linkRef.target will
 *          be used. If *that's* null, the default is "google_popup".
 *  width: (number) window width. If null, the default is 690.
 *  height: (number) window height. If null, the default is 500.
 *  top: (number) distance from top of screen
 *  left: (number) distance from left of screen
 *  toolbar: (boolean) show toolbar
 *  scrollbars: (boolean) show scrollbars
 *  location: (boolean) show location
 *  statusbar: (boolean) show statusbar
 *  menubar: (boolean) show menubar
 *  resizable: (boolean) resizable.
 *
 * @return {boolean} true if the window was not popped up, false if it was.
 */
goog.window.popup = function(linkRef, opt_options) {
  if (!opt_options) {
    opt_options = {};
  }

  // set default properties
  opt_options.target =
      opt_options.target || linkRef.target || goog.window.DEFAULT_POPUP_TARGET;
  opt_options.width = opt_options.width || goog.window.DEFAULT_POPUP_WIDTH;
  opt_options.height = opt_options.height || goog.window.DEFAULT_POPUP_HEIGHT;

  var newWin = goog.window.open(linkRef, opt_options);
  if (!newWin) {
    return true;
  }
  newWin.focus();

  return false;
};
